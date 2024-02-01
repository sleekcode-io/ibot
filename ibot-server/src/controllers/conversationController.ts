// Conversation controller
//
import { Request, Response } from "express";
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

//let chain = 0;
//let conversations = new Array().fill(null);
let curConversationId = 0; // TODO: starting conversation id should be random, i.e. timestamp.

let conversations: {
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

const startConversation = async (req: Request, res: Response) => {
  console.log("startConversation: ", req.body);

  if ("conversations[curConversationId]" in conversations) {
    console.log(
      "startConversation: id: ",
      curConversationId,
      ": ",
      conversations[curConversationId]
    );
    res
      .status(500)
      .json({ error: "startConversation: Internal server error!" });
    return;
  }
  // console.log(req.body);
  // Setup new session and return session id
  // TODO: Validate user id, job id, job data

  conversations[curConversationId] = {
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

  // if (conversations[curConversationId].conversation !== undefined) {
  //   // Dump conversation object ...
  //   console.log(conversations[curConversationId]);
  // }

  console.log(
    "startConversation: conversation (%d) started!",
    curConversationId
  );
  res.status(200).json({ conversationId: curConversationId++ });
};

const endConversation = async (req: Request, res: Response) => {
  console.log("endConversation: ", req.body.id);
  // Validate session id
  const conversationId = req.body.id;
  if (conversations[conversationId] === undefined) {
    console.log("endConversation: session %d does not exist", conversationId);
    res.status(404).json({ error: "endConversation: conversation not found." });
    return;
  }

  conversations[conversationId].endTime = new Date();
  conversations[conversationId].rating = req.body?.rating;
  conversations[conversationId].comments = req.body?.comments;
  // TODO: save session to db, free resources here ...

  delete conversations[conversationId];

  res.status(200);
  console.log("endConversation: conversation (%d) ended!", conversationId);
};

// TODO: log conversation to db
const message = async (req: Request, res: Response) => {
  console.log("message: " + req.body.id + " : " + req.body.content);

  // Validate session id
  const conversationId = req.body.id;
  if (conversations[conversationId].conversation === undefined) {
    console.log("message: conversation %d does not exist", req.body.id);
    res.status(400).json({ error: "Invalid conversation id." });
    return;
  }

  // Validate user message
  if (req.body.content === "") {
    console.log("message: empty message detected?");
    res.status(400).json({ error: "Empty message detected." });
    return;
  }

  // Send to server for processing and return response
  try {
    const response = await conversations[conversationId].conversation.call({
      input: req.body.content,
    });
    console.log("iBot: " + response);
    res.status(200).json(response);
  } catch (error) {
    console.error("message: error communicating with bot:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const language = async (req: Request, res: Response) => {
  console.log("language: " + req.body.id + " : " + req.body.jobData);
  //console.log(req.body.jobData);
  const conversationId = req.body.id;
  if (conversations[conversationId].conversation === undefined) {
    console.log("language: conversation %d does not exist", req.body.id);
    res.status(400).json({ error: "voice-data: Invalid session id." });
    return;
  }
  if (req.body.language === "") {
    console.log("language: no language specified?");
    res.status(400).json({ error: "language: missing language data." });
    return;
  }
  conversations[conversationId].language = req.body.language;
  res.status(200);
};

const jobData = async (req: Request, res: Response) => {
  console.log(
    "jobData: " +
      req.body.id +
      ", mode: " +
      req.body.mode +
      ", jobData: " +
      req.body.jobData
  );

  const conversationId = req.body.id;
  if (conversations[conversationId].conversation === undefined) {
    console.log("jobData: session %d does not exist", req.body.id);
    res.status(400).json({ error: "jobData: Invalid session id." });
    return;
  }
  if (req.body.jobData === "") {
    console.log("jobData: empty job data detected?");
    res.status(400).json({ error: "jobData: Missing job data." });
    return;
  }

  conversations[conversationId].jobData = req.body.jobData;
  if (req.body.mode == "interactive") {
    // Send to server for processing and return response
    console.log("jobData: send job description to bot for processing");
    try {
      const response = await conversations[conversationId].conversation.call({
        input: req.body.jobData,
      });
      console.log("iBot: " + response);
      res.status(200).json(response);
    } catch (error) {
      console.error("jobData: error communicating with bot:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  } else {
    // Update conversation prompt
    console.log("jobData: update conversation prompt");
    conversations[conversationId].conversation = startConversationSession(
      defaultPromptTemplateWithJD + req.body.jobData
    );
  }
  res.status(200);
};

const cc = { startConversation, endConversation, message, jobData, language };

export default cc;
