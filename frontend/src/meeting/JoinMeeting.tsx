import { useState, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

function JoinMeeting() {
  const [meetingInput, setMeetingInput] = useState<string>("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error("Please login to join a meeting");
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedInput = meetingInput.trim();
    if (!trimmedInput) return;

    let meetingId = trimmedInput;

    // Support copying full invite URLs
    try {
      if (trimmedInput.startsWith("http://") || trimmedInput.startsWith("https://")) {
        const url = new URL(trimmedInput);
        const pathParts = url.pathname.split("/");
        const joinIndex = pathParts.indexOf("join");
        if (joinIndex !== -1 && pathParts[joinIndex + 1]) {
          meetingId = pathParts[joinIndex + 1];
        }
      }
    } catch (err) {
      console.error("Failed to parse input as URL:", err);
    }

    if (!meetingId) {
      toast.error("Invalid meeting ID or link");
      return;
    }

    navigate(`/join/${meetingId}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-white rounded shadow border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-center">Join a Meeting</h2>
        
        <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            id="meeting-id"
            name="meetingId"
            label="Meeting ID or Invite Link"
            variant="outlined"
            required
            fullWidth
            value={meetingInput}
            onChange={(e) => setMeetingInput(e.target.value)}
            placeholder="e.g. abcdefgh or http://..."
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            color="primary"
          >
            Join Meeting
          </Button>
        </Box>
      </div>
    </div>
  );
}

export default JoinMeeting;