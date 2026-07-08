import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { socket } from "../socket/socket";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

interface SideBarProps {
  openedRoom: string;
}

interface Room {
  _id: string;
  roomId: string;
  roomName: string;
  createdBy: string;
  participants: string[];
}

interface ChatMessage {
  _id: string;
  roomId: string;
  sender: string;
  msg: string;
  createdAt: string;
  updatedAt: string;
}

function Message({ openedRoom }: SideBarProps) {
  const [room, setRoom] = useState<Room>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { user } = useAuth();
  const [msg, setMsg] = useState("");

  // ADDED
  const [openParticipants, setOpenParticipants] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!openedRoom) {
          setRoom(undefined);
          setMessages([]);
          return;
        }

        const resRoom = await api.get(`/api/room/get-room/${openedRoom}`);

        if (resRoom.data.success) {
          setRoom(resRoom.data.room);
        }

        const resMessage = await api.get(`/api/message/${openedRoom}`, {
          withCredentials: true,
        });

        if (resMessage.data.success) {
          setMessages(resMessage.data.messages);
        }
      } catch (error: any) {
        console.log(error);
        toast.error(`Error happend ${error.message}`);
      }
    };

    loadData();
  }, [openedRoom]);

  useEffect(() => {
    if (!openedRoom) return;

    const joinRoom = () => {
      socket.emit("join-chat-room", {
        roomId: openedRoom,
      });
    };

    // Join room initially
    joinRoom();

    // Re-join the chat room automatically if the socket connection drops and reconnects
    socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
      socket.emit("leave-chat-room", {
        roomId: openedRoom,
      });
    };
  }, [openedRoom]);

  useEffect(() => {
    const handleReceiveMessage = (newMessage: ChatMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleMessageError = (msg: string) => {
      toast.error(msg);
    };

    socket.on("receive-message", handleReceiveMessage);

    socket.on("message-error", handleMessageError);

    return () => {
      socket.off("receive-message", handleReceiveMessage);

      socket.off("message-error", handleMessageError);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!msg.trim() || !openedRoom || !user?.email) {
      return;
    }

    socket.emit("send-message", {
      roomId: openedRoom,
      msg: msg.trim(),
      sender: user.email,
    });

    setMsg("");
  };

  return (
    <>
      {!openedRoom ? (
        <div className="h-[80vh] bg-white rounded-xl shadow-lg border flex items-center justify-center">
          <div className="text-center px-6">
            <h2 className="text-2xl font-bold text-gray-700">
              No Room Selected
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Select a room from the sidebar to start chatting.
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[80vh] bg-white rounded-xl shadow-lg border flex flex-col overflow-hidden">
          {/* Chat Header */}

          <div className="h-16 px-6 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {room?.roomName}
              </h2>

              <p className="text-xs text-gray-500">Room ID: {room?.roomId}</p>
            </div>

            {/* ADDED */}

            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenParticipants(true)}
            >
              View Participants
            </Button>
          </div>

          {/* Messages */}

          <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-4">
            {messages?.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-400">
                  No messages yet. Start the conversation.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.sender === user?.email;

                return (
                  <div
                    key={message._id}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] flex flex-col ${
                        isCurrentUser ? "items-end" : "items-start"
                      }`}
                    >
                      {!isCurrentUser && (
                        <p className="mb-1 text-xs text-gray-500">
                          {message.sender}
                        </p>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2 shadow-sm ${
                          isCurrentUser
                            ? "rounded-tr-sm bg-blue-600"
                            : "rounded-tl-sm border bg-white"
                        }`}
                      >
                        <p
                          className={`text-sm wrap-break-word ${
                            isCurrentUser ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {message.msg}
                        </p>
                      </div>

                      <p className="mt-1 text-[10px] text-gray-400">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}

          <div className="border-t bg-white p-4">
            <form className="flex items-center gap-3" onSubmit={handleSubmit}>
              <input
                type="text"
                value={msg}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                onChange={(e) => setMsg(e.target.value)}
              />

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Participants Dialog - ADDED */}

      <Dialog
        open={openParticipants}
        onClose={() => setOpenParticipants(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Participants ({room?.participants.length ?? 0})
        </DialogTitle>

        <DialogContent dividers>
          <div className="space-y-3">
            {room?.participants.map((participant) => (
              <div
                key={participant}
                className="flex items-center gap-4 rounded-lg border p-3"
              >
                {/* Avatar */}

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white uppercase">
                  {participant.charAt(0)}
                </div>

                {/* Participant Details */}

                <div className="min-w-0">
                  <p className="font-medium text-gray-800 capitalize">
                    {participant.toString() === user?.email
                      ? `${participant.split("@")[0]} (You)`
                      : `${participant.split("@")[0]}`}
                  </p>

                  <p className="truncate text-sm text-gray-500">
                    {participant}
                  </p>
                </div>
              </div>
            ))}

            {room?.participants.length === 0 && (
              <p className="py-5 text-center text-sm text-gray-500">
                No participants found.
              </p>
            )}
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenParticipants(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Message;
