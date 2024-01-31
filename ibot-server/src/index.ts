// src/index.ts
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";

// Langchain
import { config } from "dotenv";
config();

import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { BufferMemory } from "langchain/memory";

const defaultPromptTemplate =
  "You are a job interviewer, assisting someone to prepare for an upcoming job interview. \
    Your task is to simulate a realistic interview experience. Provide constructive feedback \
    on candidate's answers, offer suggestion for improvements and discuss techniques for effective \
    communication. You personality is friendly and warm. Ask job-related, behavioral, cultture fit \
    situation questions. Do not ask candidate multiple questions at once. End every respond with the next \
    question to keep the conversation going. Limit your questions and responses to maximum of 3 sentences. \
    Stay focus on the interview and avoid any unrelated personal questions. If the candidate is not sure about how \
    to answer a question, provide hint, guidance and support. Start the conversation by greeting the user \
    and ask for detail job description. Answer any out of scope questions or questions unrelated to \
    the job in discussion with a wonder emoji, no more.";

const defaultPromptTemplateWithJD =
  defaultPromptTemplate +
  " Here is the job description for the job interview: ";

function startConversationSession(promptTemplate: string) {
  const chat = new ChatOpenAI({ temperature: 0 });
  const chatPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(promptTemplate),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);
  const conversationChain = new ConversationChain({
    memory: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
    prompt: chatPrompt,
    llm: chat,
  });
  return conversationChain;
}

const HOST = process.env.IBOT_HOST || "localhost";
const PORT = process.env.IBOT_PORT || 5000;

const app = express();
app.use(cors());

//app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//let chain = 0;
//let sessions = new Array().fill(null);
let curSessionId = 0; // TODO: starting session id should be random, i.e. timestamp.

let sessions: {
  conversation: ConversationChain;
  startTime: Date;
  endTime: Date;
  language: string;
  voiceId: string;
  userId: string; // TODO: req.body.userId,
  jobId: string; // TODO: req.body.jobId,
  jobData: string;
  rating: number; // req.body.rating,
  comments: string;
}[] = [];

app.post("/start-session", async (req: Request, res: Response) => {
  console.log("start-session: ", req.body);

  if ("sessions[curSessionId]" in sessions) {
    console.log(
      "start-session: session: ",
      curSessionId,
      ": ",
      sessions[curSessionId]
    );
    res.status(500).json({ error: "start-session: Internal server error!" });
    return;
  }
  // console.log(req.body);
  // Setup new session and return session id
  // TODO: Validate user id, job id, job data

  sessions[curSessionId] = {
    conversation: startConversationSession(defaultPromptTemplate),
    startTime: new Date(),
    endTime: new Date(),
    language: "English",
    voiceId: "",
    userId: "", // TODO: req.body.userId,
    jobId: "", // TODO: req.body.jobId,
    jobData: "",
    rating: 0, // req.body.rating,
    comments: "",
  };

  // if (sessions[curSessionId].conversation !== undefined) {
  //   console.log(sessions[curSessionId].language);
  //   console.log(sessions[curSessionId]);
  // }

  console.log("start-session: session (%d) started!", curSessionId);
  res.status(200).json({ sessionId: curSessionId++ });
});

app.post("/end-session", async (req: Request, res: Response) => {
  console.log("end-session: ", req.body.id);
  // Validate session id
  const sessionId = req.body.id;
  if (sessions[sessionId] === undefined) {
    console.log("end-session: session %d does not exist", sessionId);
    res.status(400).json({ error: "end-session: session not found." });
    return;
  }

  sessions[sessionId].endTime = new Date();
  sessions[sessionId].rating = req.body?.rating;
  sessions[sessionId].comments = req.body?.comments;
  // TODO: save session to db, free resources here ...

  delete sessions[sessionId];

  res.status(200);
  console.log("end-session: session (%d) ended!", sessionId);
});

// TODO: log conversation to db
app.post("/user-message", async (req: Request, res: Response) => {
  console.log("user-message: " + req.body.id + " : " + req.body.content);

  // Validate session id
  const sessionId = req.body.id;
  if (sessions[sessionId].conversation === undefined) {
    console.log("user-message: session %d does not exist", req.body.id);
    res.status(400).json({ error: "Invalid session id." });
    return;
  }

  // Validate user message
  if (req.body.content === "") {
    console.log("user-message: empty response detected?");
    res.status(400).json({ error: "Empty response detected." });
    return;
  }

  // Send to server for processing and return response
  try {
    const response = await sessions[sessionId].conversation.call({
      input: req.body.content,
    });
    console.log("iBot: " + response);
    res.status(200).json(response);
  } catch (error) {
    console.error("user-message: error communicating with bot:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/voice-data", async (req: Request, res: Response) => {
  console.log("voice-data: " + req.body.id + " : " + req.body.jobData);
  //console.log(req.body.jobData);
  const sessionId = req.body.id;
  if (sessions[sessionId].conversation === undefined) {
    console.log("voice-data: session %d does not exist", req.body.id);
    res.status(400).json({ error: "voice-data: Invalid session id." });
    return;
  }
  if (req.body.voiceId === "") {
    console.log("voice-data: empty voice data detected?");
    res.status(400).json({ error: "voice-data: Missing voiceId data." });
    return;
  }
  if (req.body.language === "") {
    console.log("voice-data: empty language data detected?");
    res.status(400).json({ error: "voice-data: Missing language data." });
    return;
  }

  sessions[sessionId].voiceId = req.body.voiceId;

  res.status(200).json({ message: "Voice data received." });
});

app.post("/job-data", async (req: Request, res: Response) => {
  console.log(
    "job-data: " +
      req.body.id +
      ", mode: " +
      req.body.mode +
      ", jobData: " +
      req.body.jobData
  );

  const sessionId = req.body.id;
  if (sessions[sessionId].conversation === undefined) {
    console.log("job-data: session %d does not exist", req.body.id);
    res.status(400).json({ error: "job-data: Invalid session id." });
    return;
  }
  if (req.body.jobData === "") {
    console.log("job-data: empty job data detected?");
    res.status(400).json({ error: "job-data: Missing job data." });
    return;
  }

  sessions[sessionId].jobData = req.body.jobData;
  if (req.body.mode == "interactive") {
    // Send to server for processing and return response
    console.log("job-data: send job description to bot for processing");
    try {
      const response = await sessions[sessionId].conversation.call({
        input: req.body.jobData,
      });
      console.log("iBot: " + response);
      res.status(200).json(response);
    } catch (error) {
      console.error("user-message: error communicating with bot:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  } else {
    // Update conversation prompt
    console.log("job-data: update conversation prompt");
    sessions[sessionId].conversation = startConversationSession(
      defaultPromptTemplateWithJD + req.body.jobData
    );
  }
  res.status(200).json({ message: "Job data received." });
});

app.listen(PORT, () => {
  console.log(`IBOT Server is running on http://${HOST}:${PORT}`);
});
