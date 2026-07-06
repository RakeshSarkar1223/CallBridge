import {Router} from "express";
import { getAllMeetingsC } from "../controller/meeting.controller.ts";
import validate from "../middleware/validate.ts";

const router = Router();

router.get("/all-meetings", validate, getAllMeetingsC);

export default router;