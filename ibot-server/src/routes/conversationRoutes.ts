// Conversation router
//
import express from "express";
import cc from "../controllers/conversationController";

const router = express.Router();

router.route("/start").post(cc.startConversation);
router.route("/end").post(cc.endConversation);
router.route("/message").post(cc.message);
router.route("/job-data").post(cc.jobData);
router.route("/language").post(cc.language);

export default router;
