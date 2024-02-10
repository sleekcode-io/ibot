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

const botRoles = ["translator", "job interviewer", "language practitioner"];

const defaultPromptTemplate = [
  "You are a translator, helping users to translate text to a language of which code is given \
  by the user. Simply translate the requested text and return the translated text but nothing \
  else. If you dont know how to translate to a specific language, simply respond with a message \
  stating that you dont know the language.",

  "You are a job interviewer, assisting someone to prepare for an upcoming job interview. \
    Your task is to simulate a realistic interview experience. Provide constructive feedback \
    on candidate's answers, offer suggestion for improvements and discuss techniques for effective \
    communication. You personality is friendly and warm. Ask job-related, behavioral, cultture fit \
    situation questions. Do not ask candidate multiple questions at once. End every respond with the next \
    question to keep the conversation going. Limit your questions and responses to maximum of 3 sentences. \
    Stay focus on the interview and avoid any unrelated personal questions. If the candidate is not sure about how \
    to answer a question, provide hint, guidance and support. Start the conversation by greeting the user \
    and ask for detail job description. Do not repeat the job description to the candidate, just ask questions \
    relating to the job. Answer any out of scope questions or questions unrelated to the job in discussion \
    with a wonder emoji, nothing more.",

  "You are an expert in language, assisting student to learn and master student's selected language. Your task is to help \
    student using the selected language correctly in terms of grammar and vocabulary. You personality is friendly, warm \
    and helpful. Start by asking the student for a topic for discussion. You can discuss any topics raised by the \
    student. While doing so, if you spot an incorrect use of grammar or terms or unnatural expression in the \
    student's response, suggest a better way or term to communicate instead. Keep the conversation going by asking the \
    student questions relating to the topic in discussion or even pro-actively change the topic.",
];

const defaultPromptTemplateWithJD =
  defaultPromptTemplate +
  " Here is the job description for the job interview: ";

function startConversationSession(promptTemplate: string) {
  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
  });
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
  roleId: number;
  languageId: string;
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

  // Validate role id
  if (req.body.roleid == undefined) {
    console.log("startConversation: missing role id ");
    res.status(400).json({ error: "startConversation: missing role id" });
    return;
  }
  if (req.body.roleid < 0 || req.body.roleid >= defaultPromptTemplate.length) {
    console.log(
      "startConversation: missing or invalid role id: " + req.body.roleid
    );
    res.status(400).json({
      error: "startConversation: invalid role id: " + req.body.roleid,
    });
    return;
  }

  conversations[curConversationId] = {
    conversation: startConversationSession(
      defaultPromptTemplate[req.body.roleid]
    ),
    startTime: new Date(),
    endTime: new Date(),
    roleId: req.body.roleid,
    languageId: "English",
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
    "startConversation: conversation (%d) started (roleid)",
    curConversationId,
    req.body.roleid
  );

  let response: string = "I am a " + botRoles[req.body.roleid];

  res
    .status(200)
    .json({ conversationId: curConversationId++, message: response });
};

const endConversation = async (req: Request, res: Response) => {
  console.log("endConversation: ", req.body.id);
  // Validate session id
  const conversationId = req.body.id;
  if (
    conversations[conversationId] == null ||
    conversations[conversationId] === undefined
  ) {
    console.log("endConversation: session %d does not exist", conversationId);
    res.status(404).json({ error: "endConversation: conversation not found." });
    return;
  }

  conversations[conversationId].endTime = new Date();
  conversations[conversationId].rating = req.body?.rating;
  conversations[conversationId].comments = req.body?.comments;
  // TODO: save session to db, free resources here ...

  // Delete will set this entry to null. To remove this entry from array and delete object,
  // Use splice(conversationId, 1). Since we use rolling index, we want to keep this
  // entry in the array in place, but discarded (set to null).
  delete conversations[conversationId];

  res.status(200);
  console.log("endConversation: conversation (%d) ended!", conversationId);
};

// TODO: log conversation to db
const message = async (req: Request, res: Response) => {
  console.log("message: " + req.body.id + " : " + req.body.content);

  // Validate session id
  const conversationId = req.body.id;
  if (
    conversations[conversationId] == null ||
    conversations[conversationId].conversation === undefined
  ) {
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
  console.log("language: " + req.body.id + " : " + req.body.id);
  //console.log(req.body.jobData);
  const conversationId = req.body.id;
  if (
    conversations[conversationId] == null ||
    conversations[conversationId].conversation === undefined
  ) {
    console.log("language: conversation %d does not exist", req.body.id);
    res.status(400).json({ error: "voice-data: Invalid session id." });
    return;
  }

  if (req.body.voice === "") {
    console.log("language: no voice specified?");
    res.status(400).json({ error: "language: missing voice data." });
    return;
  }

  conversations[conversationId].languageId = req.body.language;
  conversations[conversationId].voiceId = req.body.voice;

  console.log(
    "Update conversation[%d]: language: %s voice: %s",
    req.body.id,
    req.body.language,
    req.body.voice
  );

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
  if (
    conversations[conversationId] == null ||
    conversations[conversationId].conversation === undefined
  ) {
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

    // Old conversation is auto-freed by garbage collector when no longer used
    conversations[conversationId].conversation = startConversationSession(
      defaultPromptTemplateWithJD + req.body.jobData
    );
  }
  res.status(200);
};

const cc = { startConversation, endConversation, message, jobData, language };

export default cc;
