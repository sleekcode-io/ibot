// src/index.ts
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes/conversationRoutes";
//import isoLangs from "./isoLanguages.json";

// Langchain
import { config } from "dotenv";

config();
const HOST = process.env.IBOT_HOST || "localhost";
const PORT = process.env.IBOT_PORT || 5000;

const app = express();
app.use(cors());

//app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/conversation/v1", router);

app.listen(PORT, () => {
  console.log(`IBOT Server is running on http://${HOST}:${PORT}`);
});
