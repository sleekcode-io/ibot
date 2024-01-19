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

function startConversationSession() {
  const chat = new ChatOpenAI({ temperature: 0 });
  const chatPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      "You are a job interviewer, assisting someone to prepare for an upcoming job interview. \
      Your task is to simulate a realistic interview experience. Provide constructive feedback \
      on candidate's answers, offer suggestion for improvements and discuss techniques for effective \
      communication. You personality is friendly and warm. Ask technical, behavioral, cultture fit \
      situation questions. Limit your response to maximum of 3 sentences. Do not respond with a list of \
      multiple questions at once. End every respond with a question to keep the conversation going. \
      Start the conversion by greeting the user and ask for detail job description. Answer any out of \
      scope questions with a wonder emoji."
    ),
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
let sessions = new Array().fill(null);
let curSessionId = 0; // TODO: starting session id should be random, i.e. timestamp.

app.post("/start-session", async (req: Request, res: Response) => {
  //console.log(req.body);
  //console.log(req.body.content);
  // Do nothing ...
  const newSession = startConversationSession();
  sessions[curSessionId] = newSession;

  console.log("start-session: session (%d) started!", curSessionId);
  res.status(200).json({ sessionId: curSessionId++ });
});

app.post("/end-session", async (req: Request, res: Response) => {
  //console.log(req.body);
  // Validate session id
  const sessionId = req.body.id;
  if (sessionId < 0 || sessionId >= curSessionId) {
    res.status(400).json({ error: "end-session: invalid session id." });
    return;
  }
  // TODO: cleanup session, free resources here ...
  sessions[sessionId] = null;

  res.status(200);
  console.log("end-session: session (%d) ended!", sessionId);
});

app.post("/user-message", async (req: Request, res: Response) => {
  console.log("user-message: " + req.body.id + " : " + req.body.content);
  //console.log(req.body.content);
  if (req.body.id < 0 && req.body.id > curSessionId) {
    // Invalid session id
    console.log("user-message: invalid session id:", req.body.id);
    res.status(400).json({ error: "Invalid session id." });
    return;
  }
  if (req.body.content == "") {
    console.log("user-message: empty response detected?");
    res.status(400).json({ error: "Empty response detected." });
    return;
  }

  const session = sessions[req.body.id];
  if (session == null) {
    console.log("user-message: session %d does not exist", req.body.id);
    res.status(400).json({ error: "Session does not exist." });
    return;
  }
  try {
    const response = await session.call({
      input: req.body.content,
    });
    console.log("iBot: " + response);
    res.status(200).json(response);
  } catch (error) {
    console.error("user-message: error communicating with bot:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`IBOT Server is running on http://${HOST}:${PORT}`);
});
