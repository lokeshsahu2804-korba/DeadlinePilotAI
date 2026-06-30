import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is missing.");
}
const ai = new GoogleGenAI({ apiKey });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API: Generate Plan
  app.post("/api/generate-plan", async (req, res) => {
    try {
      const { name, deadline, difficulty, availableHours, notes, clientTime } = req.body;

      if (!name || !deadline || !availableHours) {
        return res.status(400).json({ error: "Missing required fields (name, deadline, availableHours)." });
      }

      const prompt = `
You are an expert deadline pilot and elite tutor helping a student or professional complete a critical task before their imminent deadline.
They are in a high-stress situation, possibly procrastinating or facing a tight crunch.

TASK DETAILS:
- Task Name: "${name}"
- Absolute Deadline: ${deadline}
- Difficulty Level: ${difficulty}
- Target Available Hours for Focus: ${availableHours} hours (${availableHours * 60} minutes)
- Additional Notes/Context: "${notes || "None provided."}"
- Current Local Time of user: ${clientTime}

INSTRUCTIONS:
1. Assess the overall urgency and set the priority level ("low", "medium", or "high") based on the remaining time vs difficulty.
2. Formulate a brief, highly reassuring, and empowering "urgencyRationale" that validates their situation but drives immediate, calm action.
3. Construct a high-precision, sequential list of steps (minimum 3, maximum 6) to fit exactly within the requested ${availableHours * 60} minutes of focus time.
4. For each step, calculate the start and end clock times using the user's current local time (${clientTime}) as the initial anchor, adding up step durations. Ensure each step's "scheduledTime" is clearly formatted like "10:15 PM - 10:45 PM".
5. Provide 3 specific, highly tactical productivity tips tailored directly to their task type or general high-speed focus (no generic generic advice, make it action-oriented).
6. Provide a short, powerful "motivation" quote or sentence to spark instant motivation.
7. Assess five key confidence metrics: "successProbability" (integer percentage from 0 to 100 based on their timeline), "riskLevel" ("low", "medium", or "high" depending on deadline tightness), "timePressure" (brief label of urgency like "High" or "Intense"), "completionPrediction" (brief estimation of timeline outcome like "On schedule"), and "reasoning" (supporting analysis).

Provide your response in raw JSON adhering exactly to the schema.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              priority: { type: "STRING" },
              urgencyRationale: { type: "STRING" },
              steps: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    id: { type: "STRING" },
                    title: { type: "STRING" },
                    description: { type: "STRING" },
                    durationMinutes: { type: "INTEGER" },
                    scheduledTime: { type: "STRING" },
                  },
                  required: ["id", "title", "description", "durationMinutes", "scheduledTime"]
                }
              },
              productivityTips: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              motivation: { type: "STRING" },
              successProbability: { type: "INTEGER" },
              riskLevel: { type: "STRING" },
              timePressure: { type: "STRING" },
              completionPrediction: { type: "STRING" },
              reasoning: { type: "STRING" }
            },
            required: [
              "priority", "urgencyRationale", "steps", "productivityTips", "motivation",
              "successProbability", "riskLevel", "timePressure", "completionPrediction", "reasoning"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text received from Gemini.");
      }

      const parsedPlan = JSON.parse(responseText);
      res.json(parsedPlan);
    } catch (error: any) {
      console.error("Error in /api/generate-plan:", error);
      res.status(500).json({ error: error.message || "Failed to generate plan. Please try again." });
    }
  });

  // API: Revise Plan
  app.post("/api/revise-plan", async (req, res) => {
    try {
      const { taskInput, originalPlan, completedStepIds, skippedStepIds = [], remainingMinutes, currentStepId, clientTime, notes } = req.body;

      if (!taskInput || !originalPlan || remainingMinutes === undefined) {
        return res.status(400).json({ error: "Missing required fields for revision." });
      }

      const completedSteps = originalPlan.steps.filter((s: any) => completedStepIds.includes(s.id));
      const skippedSteps = originalPlan.steps.filter((s: any) => skippedStepIds.includes(s.id));
      const currentStep = originalPlan.steps.find((s: any) => s.id === currentStepId);
      const currentStepTitle = currentStep ? currentStep.title : "";
      
      const unfinishedSteps = originalPlan.steps.filter((s: any) => !completedStepIds.includes(s.id) && !skippedStepIds.includes(s.id));

      const prompt = `
You are an expert deadline pilot. The user is currently executing a plan but has fallen behind or gotten stuck! They need an immediate tactical adjustment.

ORIGINAL TASK DETAILS:
- Task Name: "${taskInput.name}"
- Absolute Deadline: ${taskInput.deadline}
- Original Target Hours: ${taskInput.availableHours} hours

CURRENT STATUS:
- Total focus time left for revised plan: ${remainingMinutes} minutes
- Completed steps so far: ${completedSteps.map((s: any) => `"${s.title}"`).join(", ") || "None"}
- Skipped steps so far: ${skippedSteps.map((s: any) => `"${s.title}"`).join(", ") || "None"}
- Remaining unfinished steps in plan: ${unfinishedSteps.map((s: any) => `"${s.title}" (${s.durationMinutes} mins)`).join(", ") || "None"}
- Step they are currently stuck on or was in progress: "${currentStepTitle || "None"}"
- Current Local Time of user: ${clientTime}
- Additional user notes/issues regarding why they failed: "${notes || "Fell behind schedule."}"

INSTRUCTIONS:
1. Restructure the REMAINING steps (and potentially compress their durations or merge/optimize them) so that they fit exactly within the new remaining focus duration of ${remainingMinutes} minutes.
2. The total sum of the durations of the new steps MUST be equal to or less than ${remainingMinutes} minutes.
3. For each new step, recalculate the "scheduledTime" starting from the user's current local time (${clientTime}).
4. Keep the priority level appropriately high/medium/low.
5. Provide a reassuring "urgencyRationale" explaining how this revised plan is optimized to save them despite the setback.
6. Provide 3 highly tactical panic-reduction productivity tips.
7. Provide an encouraging "motivation" message to keep them moving forward without feeling guilty.
8. Assess five key confidence metrics: "successProbability" (integer percentage from 0 to 100 based on their timeline), "riskLevel" ("low", "medium", or "high" depending on deadline tightness), "timePressure" (brief label of urgency like "High" or "Intense"), "completionPrediction" (brief estimation of timeline outcome like "On schedule"), and "reasoning" (supporting analysis).

Provide your response in raw JSON adhering exactly to the schema.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              priority: { type: "STRING" },
              urgencyRationale: { type: "STRING" },
              steps: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    id: { type: "STRING" },
                    title: { type: "STRING" },
                    description: { type: "STRING" },
                    durationMinutes: { type: "INTEGER" },
                    scheduledTime: { type: "STRING" },
                  },
                  required: ["id", "title", "description", "durationMinutes", "scheduledTime"]
                }
              },
              productivityTips: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              motivation: { type: "STRING" },
              successProbability: { type: "INTEGER" },
              riskLevel: { type: "STRING" },
              timePressure: { type: "STRING" },
              completionPrediction: { type: "STRING" },
              reasoning: { type: "STRING" }
            },
            required: [
              "priority", "urgencyRationale", "steps", "productivityTips", "motivation",
              "successProbability", "riskLevel", "timePressure", "completionPrediction", "reasoning"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text received from Gemini.");
      }

      const parsedPlan = JSON.parse(responseText);
      res.json(parsedPlan);
    } catch (error: any) {
      console.error("Error in /api/revise-plan:", error);
      res.status(500).json({ error: error.message || "Failed to revise plan. Please try again." });
    }
  });

  // Vite middleware for development, static assets for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
