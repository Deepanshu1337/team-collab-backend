import env from "./env.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.geminiKey);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});
