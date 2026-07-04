import {Router} from "express";
import { getMessagesC } from "../controller/message.controller.ts";
import validate from "../middleware/validate.ts";   


const router = Router();
router.get("/:roomId", validate, getMessagesC);

export default router;