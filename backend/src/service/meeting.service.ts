import Meeting from "../model/meeting.model.ts";

export const allMeetings = async (email: string) => {
  const meetings = await Meeting.find({ participants: email });
  console.log(meetings);
  return meetings;
}