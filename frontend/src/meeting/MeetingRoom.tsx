import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket/socket";
import { toast } from "react-toastify";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

interface PeerState {
  stream: MediaStream;
  email: string;
  name: string;
  micActive: boolean;
  cameraActive: boolean;
}

interface VideoTileProps {
  stream: MediaStream | null;
  label: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isLocal?: boolean;
}

const VideoTile: React.FC<VideoTileProps> = ({ stream, label, isMuted, isVideoOff, isLocal }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVideoOff]);

  return (
    <div className="relative aspect-video bg-black rounded border border-gray-700 flex items-center justify-center">
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? "scale-x-[-1]" : ""}`}
        />
      ) : (
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold font-mono">
            {label.substring(0, 1).toUpperCase()}
          </div>
          <span className="text-gray-400 text-xs">Camera Off</span>
        </div>
      )}

      {/* Info Overlay */}
      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white max-w-[80%] truncate">
        {label} {isLocal && "(You)"}
      </div>

      {/* Mic Status Indicator */}
      <div className="absolute top-2 right-2 bg-black/60 p-1 rounded text-white text-xs">
        <i className={`fa-solid ${isMuted ? "fa-microphone-slash text-red-500" : "fa-microphone text-green-500"}`}></i>
      </div>
    </div>
  );
};

function MeetingRoom() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meetingName, setMeetingName] = useState<string>("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [joined, setJoined] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showParticipantsList, setShowParticipantsList] = useState<boolean>(false);

  // Local media state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micActive, setMicActive] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(true);

  // Peer connections state
  const [peers, setPeers] = useState<{ [socketId: string]: PeerState }>({});

  // Refs to prevent stale state issues in callbacks
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannelsRef = useRef<Map<string, RTCDataChannel>>(new Map());
  const peerEmailsRef = useRef<{ [socketId: string]: string }>({});
  const peerNamesRef = useRef<{ [socketId: string]: string }>({});
  const micActiveRef = useRef<boolean>(true);
  const cameraActiveRef = useRef<boolean>(true);

  // Update refs when state changes
  useEffect(() => {
    micActiveRef.current = micActive;
  }, [micActive]);

  useEffect(() => {
    cameraActiveRef.current = cameraActive;
  }, [cameraActive]);

  // Clean up a specific peer
  const removePeer = (peerSocketId: string) => {
    console.log("Removing peer:", peerSocketId);
    
    // Close data channel
    const dc = dataChannelsRef.current.get(peerSocketId);
    if (dc) {
      dc.close();
      dataChannelsRef.current.delete(peerSocketId);
    }

    // Close peer connection
    const pc = peersRef.current.get(peerSocketId);
    if (pc) {
      pc.close();
      peersRef.current.delete(peerSocketId);
    }

    // Clean up cache
    delete peerEmailsRef.current[peerSocketId];
    delete peerNamesRef.current[peerSocketId];

    // Update state
    setPeers((prev) => {
      const copy = { ...prev };
      delete copy[peerSocketId];
      return copy;
    });
  };

  // Helper to setup WebRTC data channel events
  const setupDataChannel = (peerSocketId: string, channel: RTCDataChannel) => {
    channel.onopen = () => {
      channel.send(
        JSON.stringify({
          type: "user-info",
          email: user?.email,
          name: user?.name,
          micActive: micActiveRef.current,
          cameraActive: cameraActiveRef.current,
        })
      );
    };

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "user-info") {
          peerEmailsRef.current[peerSocketId] = data.email || "Participant";
          peerNamesRef.current[peerSocketId] = data.name || "Participant";
          
          setPeers((prev) => {
            if (!prev[peerSocketId]) return prev;
            return {
              ...prev,
              [peerSocketId]: {
                ...prev[peerSocketId],
                email: data.email || "Participant",
                name: data.name || "Participant",
                micActive: data.micActive,
                cameraActive: data.cameraActive,
              },
            };
          });
        } else if (data.type === "toggle-media") {
          setPeers((prev) => {
            if (!prev[peerSocketId]) return prev;
            return {
              ...prev,
              [peerSocketId]: {
                ...prev[peerSocketId],
                micActive: data.mediaType === "audio" ? data.active : prev[peerSocketId].micActive,
                cameraActive: data.mediaType === "video" ? data.active : prev[peerSocketId].cameraActive,
              },
            };
          });
        }
      } catch (err) {
        console.error("Error parsing data channel message:", err);
      }
    };

    channel.onclose = () => {
      dataChannelsRef.current.delete(peerSocketId);
    };

    dataChannelsRef.current.set(peerSocketId, channel);
  };

  // Helper to create RTCPeerConnection
  const createPeerConnection = (peerSocketId: string) => {
    if (peersRef.current.has(peerSocketId)) {
      removePeer(peerSocketId);
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19002" },
        { urls: "stun:stun1.l.google.com:19002" },
        { urls: "stun:stun2.l.google.com:19002" },
      ],
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && meetingId) {
        socket.emit("webrtc:ice-candidate", {
          meetingId,
          candidate: event.candidate,
          targetId: peerSocketId,
        });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0] || new MediaStream([event.track]);
      
      setPeers((prev) => ({
        ...prev,
        [peerSocketId]: {
          stream: remoteStream,
          email: peerEmailsRef.current[peerSocketId] || "Participant",
          name: peerNamesRef.current[peerSocketId] || "Participant",
          micActive: prev[peerSocketId]?.micActive ?? true,
          cameraActive: prev[peerSocketId]?.cameraActive ?? true,
        },
      }));
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        removePeer(peerSocketId);
      }
    };

    peersRef.current.set(peerSocketId, pc);
    return pc;
  };

  useEffect(() => {
    if (!user) {
      toast.error("Please login to join a meeting");
      navigate("/");
      return;
    }

    let localStreamInstance: MediaStream | null = null;

    const initMediaAndJoin = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamInstance = stream;
        localStreamRef.current = stream;
        setLocalStream(stream);
        setMediaError("");

        if (!socket.connected) {
          socket.connect();
        }

        socket.emit("meeting:join", {
          meetingId,
          memberEmail: user.email,
        });

      } catch (err: any) {
        console.error("Camera/Microphone access failed:", err);
        setMediaError(
          "Camera and microphone permissions are required to join the call."
        );
        toast.error("Failed to access camera or microphone");
      }
    };

    // Event handlers
    const handleJoined = async (data: {
      meetingId: string;
      meetingName: string;
      participants: string[];
      existingUsers: { socketId: string }[];
    }) => {
      setMeetingName(data.meetingName);
      setParticipants(data.participants);
      setJoined(true);

      for (const peerUser of data.existingUsers) {
        const peerSocketId = peerUser.socketId;
        const pc = createPeerConnection(peerSocketId);
        
        const dc = pc.createDataChannel("userData");
        setupDataChannel(peerSocketId, dc);

        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc:offer", {
            meetingId,
            offer,
            targetId: peerSocketId,
          });
        } catch (e) {
          console.error("Error creating WebRTC offer:", e);
        }
      }
    };

    const handleUserJoined = (data: { userEmail: string; socketId: string }) => {
      toast.info(`${data.userEmail} joined`);
      peerEmailsRef.current[data.socketId] = data.userEmail;
      
      setParticipants((prev) => {
        if (prev.includes(data.userEmail)) return prev;
        return [...prev, data.userEmail];
      });
    };

    const handleJoinError = (data: { message: string }) => {
      toast.error(data.message || "Failed to join meeting");
      navigate("/dashboard");
    };

    const handleOffer = async (data: {
      meetingId: string;
      offer: RTCSessionDescriptionInit;
      senderId: string;
    }) => {
      const pc = createPeerConnection(data.senderId);

      pc.ondatachannel = (event) => {
        setupDataChannel(data.senderId, event.channel);
      };

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit("webrtc:answer", {
          meetingId,
          answer,
          targetId: data.senderId,
        });
      } catch (e) {
        console.error("Error handling offer:", e);
      }
    };

    const handleAnswer = async (data: {
      meetingId: string;
      answer: RTCSessionDescriptionInit;
      senderId: string;
    }) => {
      const pc = peersRef.current.get(data.senderId);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (e) {
          console.error("Error setting remote description:", e);
        }
      }
    };

    const handleIceCandidate = async (data: {
      meetingId: string;
      candidate: RTCIceCandidateInit;
      senderId: string;
    }) => {
      const pc = peersRef.current.get(data.senderId);
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error("Error adding remote ICE candidate:", e);
        }
      }
    };

    // Subscriptions
    socket.on("meeting:joined", handleJoined);
    socket.on("meeting:user-joined", handleUserJoined);
    socket.on("meeting:join-error", handleJoinError);
    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice-candidate", handleIceCandidate);

    initMediaAndJoin();

    // Cleanup
    return () => {
      socket.off("meeting:joined", handleJoined);
      socket.off("meeting:user-joined", handleUserJoined);
      socket.off("meeting:join-error", handleJoinError);
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:answer", handleAnswer);
      socket.off("webrtc:ice-candidate", handleIceCandidate);

      if (localStreamInstance) {
        localStreamInstance.getTracks().forEach((track) => track.stop());
      }

      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();

      dataChannelsRef.current.forEach((dc) => dc.close());
      dataChannelsRef.current.clear();
    };
  }, [meetingId, user, navigate]);

  // Toggle audio locally
  const toggleMic = () => {
    const nextState = !micActive;
    setMicActive(nextState);
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }

    dataChannelsRef.current.forEach((dc) => {
      if (dc.readyState === "open") {
        dc.send(
          JSON.stringify({
            type: "toggle-media",
            mediaType: "audio",
            active: nextState,
          })
        );
      }
    });
  };

  // Toggle video locally
  const toggleCamera = () => {
    const nextState = !cameraActive;
    setCameraActive(nextState);
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }

    dataChannelsRef.current.forEach((dc) => {
      if (dc.readyState === "open") {
        dc.send(
          JSON.stringify({
            type: "toggle-media",
            mediaType: "video",
            active: nextState,
          })
        );
      }
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      toast.success("Meeting link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLeave = () => {
    navigate("/dashboard");
  };

  if (mediaError) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Paper className="p-6 text-center max-w-sm">
          <Typography variant="h6" className="text-red-500 mb-2">Device Access Error</Typography>
          <Typography variant="body2" className="mb-4">{mediaError}</Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>Retry</Button>
        </Paper>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-2">
        <CircularProgress size={40} />
        <span className="text-gray-500 text-xs">Connecting...</span>
      </div>
    );
  }

  const peerList = Object.entries(peers);
  const totalUsers = peerList.length + 1;

  let gridClass = "grid-cols-1";
  if (totalUsers === 2) {
    gridClass = "grid-cols-1 md:grid-cols-2";
  } else if (totalUsers >= 3) {
    gridClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }

  return (
    <div className="h-[calc(100vh-4.75rem)] flex flex-col bg-gray-900 text-white">
      {/* Top Header */}
      <div className="bg-gray-950 px-4 py-3 flex items-center justify-between border-b border-gray-800">
        <div>
          <h2 className="text-sm font-bold">{meetingName || "Meeting"}</h2>
          <span className="text-[10px] text-gray-400 font-mono">ID: {meetingId}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowParticipantsList(!showParticipantsList)}
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-xs rounded border border-gray-700"
          >
            Participants ({participants.length})
          </button>
          <button
            onClick={handleCopyLink}
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-xs rounded border border-gray-700"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>

      {/* Grid area */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
          <div className={`grid gap-4 w-full max-w-6xl ${gridClass}`}>
            <VideoTile
              stream={localStream}
              label={user?.name || user?.email || "You"}
              isMuted={!micActive}
              isVideoOff={!cameraActive}
              isLocal
            />

            {peerList.map(([socketId, peer]) => (
              <VideoTile
                key={socketId}
                stream={peer.stream}
                label={peer.name || peer.email}
                isMuted={!peer.micActive}
                isVideoOff={!peer.cameraActive}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        {showParticipantsList && (
          <div className="w-64 bg-gray-950 p-4 border-l border-gray-800 flex flex-col z-20 h-full">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Participants</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {participants.map((email, idx) => (
                <div key={idx} className="p-2 bg-gray-900 rounded text-xs truncate">
                  {email} {email === user?.email && "(You)"}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-gray-950 py-3 flex justify-center items-center gap-4 border-t border-gray-800">
        <button
          onClick={toggleMic}
          className={`w-10 h-10 rounded-full flex items-center justify-center border ${
            micActive ? "bg-gray-850 border-gray-750 text-white" : "bg-red-900 border-red-800 text-red-300"
          }`}
        >
          <i className={`fa-solid ${micActive ? "fa-microphone" : "fa-microphone-slash"}`}></i>
        </button>

        <button
          onClick={toggleCamera}
          className={`w-10 h-10 rounded-full flex items-center justify-center border ${
            cameraActive ? "bg-gray-850 border-gray-750 text-white" : "bg-red-900 border-red-800 text-red-300"
          }`}
        >
          <i className={`fa-solid ${cameraActive ? "fa-video" : "fa-video-slash"}`}></i>
        </button>

        <button
          onClick={handleLeave}
          className="w-10 h-10 bg-red-650 hover:bg-red-750 text-white rounded-full flex items-center justify-center border border-red-800"
        >
          <i className="fa-solid fa-phone-slash"></i>
        </button>
      </div>
    </div>
  );
}

export default MeetingRoom;
