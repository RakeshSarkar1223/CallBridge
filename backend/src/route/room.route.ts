import { allRoomsC, getRoomById } from "../controller/room.controller.ts";
import { Router } from "express";
import validate from "../middleware/validate.ts";

const router = Router();

router.get("/all-room",validate, allRoomsC);
router.get("/get-room/:roomId", validate, getRoomById);


export default router;