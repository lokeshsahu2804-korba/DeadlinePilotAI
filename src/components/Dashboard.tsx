import React, { useState } from "react";
import { TaskInput, TaskPlan } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, Calendar, Clock, AlertTriangle, ArrowRight, Target, Sparkles, 
  Flame, ListTodo, Lightbulb, Compass, RotateCw, AlertCircle, HelpCircle,
  ShieldCheck, Gauge, Hourglass, TrendingUp, Brain, Download
} from "lucide-react";

interface DashboardProps {
  taskInput: TaskInput;
  setTaskInput: React.Dispatch<React.SetStateAction<TaskInput>>;
  plan: TaskPlan | null;
  onGeneratePlan: (customInput?: TaskInput) => Promise<void>;
  isLoading: boolean;
  onGoToFocus: () => void;
}

export default function Dashboard({
  taskInput,
  setTaskInput,
  plan,
  onGeneratePlan,
  isLoading,
  onGoToFocus,
}: DashboardProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [hoursInput, setHoursInput] = useState<string>(
    taskInput.availableHours ? taskInput.availableHours.toString() : ""
  );

  React.useEffect(() => {
    if (parseFloat(hoursInput) !== taskInput.availableHours) {
      setHoursInput(taskInput.availableHours ? taskInput.availableHours.toString() : "");
    }
  }, [taskInput.availableHours]);

  // Progressive loading messages to make the AI feel alive and responsive
  React.useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }

    const messages = [
      "Securing connection to Gemini API...",
      "Parsing deadline window and difficulty factor...",
      "Analyzing notes and drafting strategic checkpoints...",
      "Assembling optimal tactical timetable...",
      "Polishing productivity tips and custom motivation notes...",
    ];

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 1400);

    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingMessages = [
    "Securing connection to Gemini API...",
    "Parsing deadline window and difficulty factor...",
    "Analyzing notes and drafting strategic checkpoints...",
    "Assembling optimal tactical timetable...",
    "Polishing productivity tips and custom motivation notes...",
  ];

  const handleExportPlan = () => {
    if (!plan) return;
    // Export the exact parsed Gemini JSON structure
    const planToExport = {
      priority: plan.priority,
      urgencyRationale: plan.urgencyRationale,
      steps: plan.steps.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        durationMinutes: s.durationMinutes,
        scheduledTime: s.scheduledTime,
      })),
      productivityTips: plan.productivityTips,
      motivation: plan.motivation,
      successProbability: plan.successProbability,
      riskLevel: plan.riskLevel,
      timePressure: plan.timePressure,
      completionPrediction: plan.completionPrediction,
      reasoning: plan.reasoning,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(planToExport, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "deadline-plan.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!taskInput.name.trim()) {
      setErrorMsg("Please enter a valid mission/task name.");
      return;
    }

    if (!taskInput.deadline) {
      setErrorMsg("Please specify a target deadline date and time.");
      return;
    }

    const deadlineDate = new Date(taskInput.deadline);
    if (isNaN(deadlineDate.getTime())) {
      setErrorMsg("The deadline format is invalid.");
      return;
    }

    if (deadlineDate.getTime() <= Date.now()) {
      setErrorMsg("Warning: The selected deadline is in the past! Please set a future time.");
      return;
    }

    const parsedHours = parseFloat(hoursInput);
    if (isNaN(parsedHours) || parsedHours <= 0) {
      setErrorMsg("Please allocate a valid positive number of available hours (e.g. 2 or 3.5).");
      return;
    }

    if (parsedHours > 48) {
      setErrorMsg("Maximum focus block limit is 48 hours for short-term pilot safety.");
      return;
    }

    const finalInput = { ...taskInput, availableHours: parsedHours };
    setTaskInput(finalInput);

    try {
      await onGeneratePlan(finalInput);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while contacting the Gemini co-pilot.");
    }
  };

  const priorityStyles = {
    high: {
      bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 text-rose-700 dark:text-rose-300",
      badge: "bg-rose-100 dark:bg-rose-950/65 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
      iconColor: "text-rose-500",
      text: "HIGH PRIORITY EMERGENCY",
    },
    medium: {
      bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 text-amber-700 dark:text-amber-300",
      badge: "bg-amber-100 dark:bg-amber-950/65 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
      iconColor: "text-amber-500",
      text: "MEDIUM PRIORITY FOCUS",
    },
    low: {
      bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300",
      badge: "bg-emerald-100 dark:bg-emerald-950/65 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
      iconColor: "text-emerald-500",
      text: "LOW PRIORITY REGULAR",
    },
  };

  const selectedPriority = plan?.priority === "high" || plan?.priority === "medium" || plan?.priority === "low"
    ? plan.priority
    : "medium";

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-10 transition-colors duration-200" id="dashboard-wrapper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="mb-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                <Compass className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <span>DeadlinePilot Control Panel</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xl text-sm sm:text-base">
                Configure your time budget and parameters. Let Gemini orchestrate a bulletproof flight path.
              </p>
            </div>
            
            {plan && (
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={handleExportPlan}
                  className="w-full sm:w-auto px-5 py-3 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-800 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                  id="dashboard-export-plan-btn"
                >
                  <Download className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span>Export AI Plan</span>
                </button>
                <button
                  onClick={onGoToFocus}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-200 flex items-center justify-center space-x-2.5 cursor-pointer transform hover:-translate-y-0.5"
                  id="header-goto-focus"
                >
                  <span>Enter Focus Room</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form and Output Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Configuration Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs" id="config-form-container">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Mission Details</span>
            </h2>

            {errorMsg && (
              <div className="mb-5 p-4 bg-rose-50 dark:bg-rose-950/30 border-l-4 border-rose-500 text-rose-800 dark:text-rose-200 rounded-r-xl flex items-start gap-3 text-sm animate-fade-in" id="validation-error">
                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Configuration Issue</p>
                  <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-300">{errorMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Task Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="task-name-input">
                  Task / Assignment Name
                </label>
                <input
                  id="task-name-input"
                  type="text"
                  required
                  placeholder="e.g. History Presentation, Q2 Tax Returns..."
                  value={taskInput.name}
                  onChange={(e) => setTaskInput({ ...taskInput, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-all text-sm text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Deadline & Difficulty row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="deadline-input">
                    Target Deadline
                  </label>
                  <div className="relative">
                    <input
                      id="deadline-input"
                      type="datetime-local"
                      required
                      value={taskInput.deadline}
                      onChange={(e) => setTaskInput({ ...taskInput, deadline: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-all text-sm text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="difficulty-input">
                    Task Complexity
                  </label>
                  <select
                    id="difficulty-input"
                    value={taskInput.difficulty}
                    onChange={(e) => setTaskInput({ ...taskInput, difficulty: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-all text-sm text-slate-900 dark:text-white font-medium bg-white dark:bg-slate-900"
                  >
                    <option value="easy">Easy (Surface Level Review)</option>
                    <option value="medium">Medium (Requires Structuring)</option>
                    <option value="hard">Hard (Deep Logic / Coding)</option>
                  </select>
                </div>
              </div>

              {/* Available Hours */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5" htmlFor="hours-input">
                  <span>Remaining Focus Budget (Hours)</span>
                  <div className="group relative text-slate-400 hover:text-indigo-500 cursor-help">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-md hidden group-hover:block z-20 font-normal leading-normal">
                      The total hours you can dedicate to actively working on this task right now before the deadline.
                    </span>
                  </div>
                </label>
                <div className="relative flex items-center">
                  <input
                    id="hours-input"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 2.5 or 4"
                    value={hoursInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHoursInput(val);
                      const parsed = parseFloat(val);
                      if (!isNaN(parsed) && parsed > 0) {
                        setTaskInput({ ...taskInput, availableHours: parsed });
                      }
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-all text-sm text-slate-900 dark:text-white font-medium"
                  />
                  <span className="absolute right-4 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none uppercase font-mono">HOURS</span>
                </div>
              </div>

              {/* Additional Context/Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="notes-input">
                  Task Context / Core Sub-goals
                </label>
                <textarea
                  id="notes-input"
                  rows={4}
                  placeholder="Mention what resources you have, what parts are already completed, or any specific constraints (e.g. 'Need to read Chapter 5 first, presentation is 10 slides total')"
                  value={taskInput.notes}
                  onChange={(e) => setTaskInput({ ...taskInput, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-all text-sm text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-indigo-200 transition-all duration-200 flex items-center justify-center space-x-2.5 cursor-pointer disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:shadow-none disabled:cursor-not-allowed transform active:scale-[0.99]"
                id="submit-generate-plan"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="h-5 w-5 animate-spin" />
                    <span>Pilot Computing Plan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 fill-indigo-100" />
                    <span>Calculate Flight Schedule</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Output Panel */}
          <div className="lg:col-span-7 space-y-6" id="output-panel-container">
            <AnimatePresence mode="wait">
              {isLoading ? (
                /* LOADING PANEL */
                <motion.div
                  key="loading-state"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-white dark:bg-slate-950 p-8 sm:p-12 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs text-center flex flex-col items-center justify-center min-h-[500px]"
                >
                  <div className="relative mb-8">
                    {/* Ring animation */}
                    <div className="w-20 h-20 border-4 border-indigo-100 dark:border-indigo-950 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-indigo-500 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Co-Pilot Calculating</h3>
                  <div className="max-w-md">
                    <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-4 animate-pulse">
                      {loadingMessages[loadingStep]}
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-normal">
                      Gemini is generating a custom timeline to maximize productivity under pressure. Please do not close this browser window.
                    </p>
                  </div>
                </motion.div>
              ) : plan ? (
                /* PLAN RENDER PANEL */
                <motion.div
                  key="plan-state"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Urgency rationale header card */}
                  <div className={`p-6 rounded-2xl border border-dashed flex flex-col sm:flex-row gap-4 items-start ${priorityStyles[selectedPriority].bg}`}>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-xs shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                      <AlertTriangle className={`h-6 w-6 ${priorityStyles[selectedPriority].iconColor}`} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${priorityStyles[selectedPriority].badge}`}>
                          {priorityStyles[selectedPriority].text}
                        </span>
                        <span className="text-slate-400 dark:text-slate-600 text-xs">•</span>
                        <span className="text-slate-700 dark:text-slate-300 text-xs font-mono font-bold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {taskInput.availableHours} Hours Allocated
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Co-Pilot Briefing</h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{plan.urgencyRationale}</p>
                    </div>
                  </div>

                  {/* AI CONFIDENCE DASHBOARD */}
                  <div className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs space-y-6" id="ai-confidence-dashboard">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <span>AI Confidence Dashboard</span>
                      </h3>
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-1 rounded">
                        Co-Pilot Assessment
                      </span>
                    </div>

                    {/* Bento Grid Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Success Probability */}
                      <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                          <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                          <span className="font-medium">Success Rate</span>
                        </div>
                        <div className="mt-3">
                          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {plan.successProbability ?? 85}%
                          </span>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${plan.successProbability ?? 85}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Risk Level */}
                      <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                          <Gauge className="h-3.5 w-3.5 text-rose-500" />
                          <span className="font-medium">Risk Factor</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className={`text-base font-extrabold uppercase px-2 py-1 rounded text-xs ${
                            (plan.riskLevel || plan.priority || "medium") === "high"
                              ? "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40"
                              : (plan.riskLevel || plan.priority || "medium") === "medium"
                              ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40"
                              : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40"
                          }`}>
                            {plan.riskLevel ?? plan.priority ?? "medium"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono uppercase tracking-widest">
                          Safety Grade
                        </p>
                      </div>

                      {/* Time Pressure */}
                      <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                          <Hourglass className="h-3.5 w-3.5 text-amber-500" />
                          <span className="font-medium">Time Pressure</span>
                        </div>
                        <div className="mt-3">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight block truncate">
                            {plan.timePressure ?? (selectedPriority === "high" ? "Extreme" : "High")}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono uppercase tracking-widest">
                          Chronos Dial
                        </p>
                      </div>

                      {/* Completion Prediction */}
                      <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="font-medium">Prediction</span>
                        </div>
                        <div className="mt-3">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-snug block line-clamp-2">
                            {plan.completionPrediction ?? "Tight but highly feasible"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning Accordion / Content Box */}
                    <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/40 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                        <Brain className="h-4 w-4 text-indigo-500" />
                        <span>Cognitive Risk Reasoning</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {plan.reasoning ?? plan.urgencyRationale}
                      </p>
                    </div>
                  </div>

                  {/* Steps Checklist Card */}
                  <div className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                      <ListTodo className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span>Action Timeline Block</span>
                    </h3>
                    
                    <div className="space-y-4">
                      {plan.steps.map((step, idx) => (
                        <div key={step.id || idx} className="flex gap-4 items-start relative pb-4 last:pb-0">
                          {/* Timeline connector line */}
                          {idx !== plan.steps.length - 1 && (
                            <div className="absolute left-[15px] top-[30px] bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800" />
                          )}
                          {/* Circle step index indicator */}
                          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-grow pt-0.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">
                                {step.title}
                              </h4>
                              <span className="inline-flex text-[11px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md self-start sm:self-center">
                                {step.scheduledTime} ({step.durationMinutes}m)
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips and Motivation Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Productivity tips */}
                    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs flex flex-col">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-sm sm:text-base">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        <span>Tactical Tips</span>
                      </h4>
                      <ul className="space-y-3 flex-grow text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        {plan.productivityTips?.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="text-indigo-500 dark:text-indigo-400 font-bold shrink-0 mt-0.5">▪</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Motivation Quote */}
                    {plan.motivation && (
                      <div className="bg-indigo-900 dark:bg-indigo-950 text-white p-6 rounded-2xl border border-indigo-800 dark:border-indigo-900/60 shadow-xs flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 opacity-10">
                          <Flame className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                          <div className="inline-flex bg-indigo-800 dark:bg-indigo-900 text-indigo-300 dark:text-indigo-400 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mb-4">
                            Co-Pilot Encouragement
                          </div>
                          <p className="text-sm sm:text-base font-serif italic text-indigo-100 dark:text-indigo-200 leading-relaxed">
                            "{plan.motivation}"
                          </p>
                        </div>
                        <p className="text-[10px] text-indigo-400 dark:text-indigo-500 font-mono mt-6 uppercase tracking-wider relative z-10">
                          Pilot status: Ready for engine ignition.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Proceed CTA */}
                  <div className="p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Satisfied with the timeline?</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Lock it in and transition to the immersive focus mode environment.</p>
                    </div>
                    <button
                      onClick={onGoToFocus}
                      className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <span>Launch Focus Room</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                </motion.div>
              ) : (
                /* EMPTY AWAITING STATE */
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-slate-950 p-8 sm:p-12 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs text-center flex flex-col items-center justify-center min-h-[500px]"
                >
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit mb-6 animate-pulse">
                    <Compass className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Co-Pilot Standing By</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed mb-6">
                    Configure your task parameters on the left, then click <strong>"Calculate Flight Schedule"</strong>. Gemini will analyze the emergency and construct your custom timeline.
                  </p>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl max-w-md text-left text-xs text-slate-500 dark:text-slate-400 space-y-2.5">
                    <p className="font-bold text-slate-700 dark:text-slate-300">How Gemini calculates your schedule:</p>
                    <div className="flex items-start gap-2">
                      <span className="text-indigo-500 font-bold shrink-0">1.</span>
                      <span>Judges complexity against your total allocated hours.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-indigo-500 font-bold shrink-0">2.</span>
                      <span>Slices the budget into manageable, chronological work chunks.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-indigo-500 font-bold shrink-0">3.</span>
                      <span>Creates custom tips and encouragement to maintain top pacing.</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
