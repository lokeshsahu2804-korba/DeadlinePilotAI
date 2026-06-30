export type TaskDifficulty = "easy" | "medium" | "hard";

export interface TaskInput {
  name: string;
  deadline: string; // ISO date/time or formatted string
  difficulty: TaskDifficulty;
  availableHours: number;
  notes: string;
}

export interface TaskPlanStep {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  scheduledTime: string; // e.g., "02:00 PM - 03:00 PM"
  isCompleted: boolean;
  isSkipped?: boolean;
}

export interface TaskPlan {
  priority: "low" | "medium" | "high";
  urgencyRationale: string;
  steps: TaskPlanStep[];
  productivityTips: string[];
  motivation?: string;
  revisedFromStepId?: string | null;
  successProbability?: number;
  riskLevel?: "low" | "medium" | "high";
  timePressure?: string;
  completionPrediction?: string;
  reasoning?: string;
}
