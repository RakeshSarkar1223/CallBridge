import { registerUser, loginUser, logoutUser, getUser } from "../controller/user.controller.ts";

import express from 'express'

const router = express.Router();

router.post("/register", registerUser);
router.get("/me",getUser);
router.post('/login', loginUser);

router.post('/logout', logoutUser);

export default router;