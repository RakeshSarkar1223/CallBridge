import { Schema, model, Document } from "mongoose";

export interface IMeeting extends Document {
  meetingId: string;
  meetingName: string;
  createdBy: string; // PostgreSQL user email
  participants: string[]; // PostgreSQL user emails
}

const meetingSchema = new Schema<IMeeting>(
  {
    meetingId: {
      type: String,
      required: true,
      unique: true,
    },
    meetingName: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    participants: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);



meetingSchema.index({ createdBy: 1 });

const Meeting = model<IMeeting>("Meeting", meetingSchema);

export default Meeting;
