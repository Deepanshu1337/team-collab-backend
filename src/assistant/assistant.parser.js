// import { geminiModel } from "../config/gemini.js";
// import { ASSISTANT_SYSTEM_PROMPT } from "./assistant.prompts.js";

// // ---------- Regex fallback (SAFE & FREE) ----------
// const fallbackParse = (command) => {
//   const lower = command.toLowerCase();

//   const moveMatch = lower.match(
//     /move task (.+) to (todo|in-progress|done)/
//   );
//   if (moveMatch) {
//     return {
//       type: "MOVE_TASK",
//       taskTitle: moveMatch[1],
//       status: moveMatch[2],
//       assigneeName: null,
//       projectName: null,
//     };
//   }

//   const assignMatch = lower.match(/assign (.+) to (.+)/);
//   if (assignMatch) {
//     return {
//       type: "ASSIGN_TASK",
//       taskTitle: assignMatch[1],
//       assigneeName: assignMatch[2],
//       status: null,
//       projectName: null,
//     };
//   }

//   return { type: "UNKNOWN" };
// };

// // ---------- Gemini-powered parser ----------
// export const parseCommand = async (command) => {
//   try {
//     const result = await geminiModel.generateContent([
//       ASSISTANT_SYSTEM_PROMPT,
//       command,
//     ]);

//     const raw = result.response.text();
//     const parsed = JSON.parse(raw);

//     return {
//       type: parsed.type || "UNKNOWN",
//       taskTitle: parsed.taskTitle || null,
//       status: parsed.status || null,
//       assigneeName: parsed.assigneeName || null,
//       projectName: parsed.projectName || null,
//     };
//   } catch (error) {
//     // 🔁 Gemini failed → fallback
//     return fallbackParse(command);
//   }
// };
