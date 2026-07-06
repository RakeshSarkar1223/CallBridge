import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { toast } from "react-toastify";
import { socket } from "../socket/socket";
import { useAuth } from "../context/AuthContext";

interface Room {
  _id: string;
  roomId: string;
  roomName: string;
  createdBy: string;
  participants: string[];
}

interface SideBarProps {
  openedRoom: string;
  setOpenedRoom: (id: string) => void;
}

function SideBar({ openedRoom, setOpenedRoom }: SideBarProps) {
  const { user } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);

  // ------------------------
  // Load Rooms
  // ------------------------

  useEffect(() => {
    if (!user) return;

    const loadRooms = async () => {
      try {
        const res = await api.get("/api/room/all-room");

        if (res.data.success) {
          setRooms(res.data.rooms);
        }
      } catch (err: any) {
        toast.error(err.message);
      }
    };

    loadRooms();
  }, [user]);

  // ------------------------
  // Socket Listeners
  // ------------------------

  useEffect(() => {
    const handleRoomCreated = (room: Room) => {
      setRooms((prev) => [...prev, room]);
      toast.success(`${room.roomName} created`);
      setOpenCreate(false);
      setRoomName("");
    };

    const handleRoomJoined = (room: Room) => {
      setRooms((prev) => {
        if (prev.some((r) => r.roomId === room.roomId)) return prev;
        return [...prev, room];
      });
      toast.success(`Joined ${room.roomName}`);
      setOpenJoin(false);
      setRoomId("");
    };

    const handleJoinError = (msg: string) => {
      toast.error(msg);
    };

    const handleCreateError = (msg: string) => {
      toast.error(msg);
    };

    socket.on("room-created", handleRoomCreated);
    socket.on("joined-room", handleRoomJoined);
    socket.on("join-room-error", handleJoinError);
    socket.on("create-room-error", handleCreateError);
    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("joined-room", handleRoomJoined);
      socket.off("join-room-error", handleJoinError);
      socket.off("create-room-error", handleCreateError);
    };
  }, []);

  // ------------------------
  // Create Room
  // ------------------------

  const createRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket.emit("create-room", {
      roomName,
      email: user?.email,
    });
  };

  // ------------------------
  // Join Room
  // ------------------------

  const joinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket.emit("join-room", {
      roomID: roomId,
      userName: user?.email,
    });
  };

  return (
    <div className="h-full bg-white rounded-xl shadow-lg border flex flex-col">
      <div className="p-5 border-b">
        <h2 className="text-2xl font-bold">Rooms</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {rooms.map((room) => (
          <div
            key={room._id}
            className={`p-4 rounded-lg border cursor-pointer ${room.roomId.toString() === openedRoom ? `bg-green-200` : `bg-white hover:bg-gray-200`}`}
            onClick={() => setOpenedRoom(room.roomId)}
          >
            <h3 className="font-semibold">{room.roomName}</h3>

            <p className="text-sm text-gray-500">{room.roomId}</p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex justify-center gap-5">
        <Button variant="contained" onClick={() => setOpenCreate(true)}>
          Create
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={() => setOpenJoin(true)}
        >
          Join
        </Button>
      </div>

      {/* Create Dialog */}

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create Room</DialogTitle>

        <DialogContent>
          <form id="create-room" onSubmit={createRoom}>
            <TextField
              autoFocus
              margin="dense"
              fullWidth
              label="Room Name"
              variant="standard"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </form>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>

          <Button type="submit" form="create-room">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Dialog */}

      <Dialog open={openJoin} onClose={() => setOpenJoin(false)}>
        <DialogTitle>Join Room</DialogTitle>

        <DialogContent>
          <form id="join-room" onSubmit={joinRoom}>
            <TextField
              autoFocus
              margin="dense"
              fullWidth
              label="Room ID"
              variant="standard"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </form>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenJoin(false)}>Cancel</Button>

          <Button type="submit" form="join-room">
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SideBar;
