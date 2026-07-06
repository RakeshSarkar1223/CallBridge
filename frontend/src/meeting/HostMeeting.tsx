import { useState, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket/socket";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

function HostMeeting() {
  const [meetingName, setMeetingName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error("Please login to host a meeting");
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedMeetingName = meetingName.trim();
    if (!trimmedMeetingName) return;

    if (!user || !user.email) {
      toast.error("Authentication required");
      return;
    }

    setLoading(true);

    socket.emit(
      "meeting:create",
      { meetingName: trimmedMeetingName, hostEmail: user.email },
      (response: { success: boolean; meetingId?: string; meetingName?: string; error?: string }) => {
        setLoading(false);
        if (response.success && response.meetingId) {
          toast.success("Meeting created!");
          navigate(`/join/${response.meetingId}`);
        } else {
          toast.error(response.error || "Failed to create meeting");
        }
      }
    );
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-white rounded shadow border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-center">Host a Meeting</h2>
        
        <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            id="meeting-name"
            name="meetingName"
            label="Meeting Name"
            variant="outlined"
            required
            fullWidth
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            color="primary"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Start Meeting"}
          </Button>
        </Box>
      </div>
    </div>
  );
}

export default HostMeeting;