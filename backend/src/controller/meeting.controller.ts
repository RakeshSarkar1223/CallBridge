import {allMeetings} from "../service/meeting.service.ts";

export const getAllMeetingsC = async (req: any, res: any) => {
  try {
    const meetings = await allMeetings(req.user.email);
    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching meetings" });
  }
};