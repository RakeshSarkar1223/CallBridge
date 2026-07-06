import { Server, Socket } from "socket.io";
import Meeting from "../model/meeting.model.ts";
import crypto from "crypto";

interface CreateMeetingPayload {
  meetingName: string;
  hostEmail: string;
}

interface JoinMeetingPayload {
  meetingId: string;
  memberEmail: string;
}

interface OfferPayload {
  meetingId: string;
  offer: RTCSessionDescriptionInit;
  targetId: string;
}

interface AnswerPayload {
  meetingId: string;
  answer: RTCSessionDescriptionInit;
  targetId: string;
}

interface IceCandidatePayload {
  meetingId: string;
  candidate: RTCIceCandidateInit;
  targetId: string;
}

export const registerMeetingHandlers = (
  io: Server,
  socket: Socket,
) => {
  /*
   * CREATE MEETING
   */
  socket.on(
    "meeting:create",

    async (
      { meetingName, hostEmail }: CreateMeetingPayload,

      callback: (response: {
        success: boolean;
        meetingId?: string;
        meetingName?: string;
        error?: string;
      }) => void,
    ) => {
      try {
        const meetingId = crypto.randomUUID().slice(0, 8);

        await Meeting.create({
          meetingId,
          meetingName,
          createdBy: hostEmail,
          participants: [hostEmail],
        });

        await socket.join(meetingId);

        callback({
          success: true,
          meetingId,
          meetingName,
        });
      } catch (error: unknown) {
        console.error("meeting:create error:", error);

        callback({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create meeting",
        });
      }
    },
  );

  /*
   * JOIN MEETING
   */
  socket.on(
    "meeting:join",

    async ({ meetingId, memberEmail }: JoinMeetingPayload) => {
      try {
        const meeting = await Meeting.findOne({
          meetingId,
        });

        if (!meeting) {
          socket.emit("meeting:join-error", {
            message: "Meeting not found",
          });

          return;
        }

        /*
         * Get currently connected users BEFORE
         * the new socket joins.
         */
        const sockets = await io
          .in(meetingId)
          .fetchSockets();

        const existingUsers = sockets.map(
          (existingSocket) => ({
            socketId: existingSocket.id,
          }),
        );

        /*
         * Add participant to database.
         */
        if (!meeting.participants.includes(memberEmail)) {
          meeting.participants.push(memberEmail);

          await meeting.save();
        }

        /*
         * Join Socket.IO room.
         */
        await socket.join(meetingId);

        /*
         * Send existing socket IDs to the new user.
         */
        socket.emit("meeting:joined", {
          meetingId: meeting.meetingId,
          meetingName: meeting.meetingName,
          participants: meeting.participants,
          existingUsers,
        });

        /*
         * Notify existing connected users.
         */
        socket.to(meetingId).emit("meeting:user-joined", {
          userEmail: memberEmail,
          socketId: socket.id,
        });
      } catch (error: unknown) {
        console.error("meeting:join error:", error);

        socket.emit("meeting:join-error", {
          message: "Failed to join meeting",
        });
      }
    },
  );

  /*
   * WEBRTC OFFER
   */
  socket.on(
    "webrtc:offer",

    ({ meetingId, offer, targetId }: OfferPayload) => {
      io.to(targetId).emit("webrtc:offer", {
        meetingId,
        offer,
        senderId: socket.id,
      });
    },
  );

  /*
   * WEBRTC ANSWER
   */
  socket.on(
    "webrtc:answer",

    ({ meetingId, answer, targetId }: AnswerPayload) => {
      io.to(targetId).emit("webrtc:answer", {
        meetingId,
        answer,
        senderId: socket.id,
      });
    },
  );

  /*
   * ICE CANDIDATE
   */
  socket.on(
    "webrtc:ice-candidate",

    ({
      meetingId,
      candidate,
      targetId,
    }: IceCandidatePayload) => {
      io.to(targetId).emit("webrtc:ice-candidate", {
        meetingId,
        candidate,
        senderId: socket.id,
      });
    },
  );
};