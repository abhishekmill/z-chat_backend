import express from "express";
import { test } from "../controllers/test.controller.js";
import isAunthicated from "../middleware/isAunthicated.js";
import {
  reciveMessage,
  sendmessage,
} from "../controllers/message.controllers.js";

const router = express.Router();

router.get("/test", test);
router.post("/send/:id", isAunthicated, sendmessage);
router.get("/recive/:id", isAunthicated, reciveMessage);
// router("/send/",isAunthicated).post( sendmessage);

export default router;
