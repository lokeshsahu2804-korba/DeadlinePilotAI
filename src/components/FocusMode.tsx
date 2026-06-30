import React, { useState, useEffect } from "react";
import { TaskInput, TaskPlan, TaskPlanStep } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, SkipForward, CheckCircle2, Circle, AlertTriangle, 
  Clock, Download, Sparkles, Flame, Check, RotateCw, AlertCircle, 
  ArrowLeft, ChevronRight, Bookmark, ArrowRight, Activity, HelpCircle,
  ShieldCheck, Gauge, Hourglass, TrendingUp, Brain, Calendar, X, AlertOctagon
} from "lucide-react";

interface FocusModeProps {
  taskInput: TaskInput;
  plan: TaskPlan;
  setPlan: React.Dispatch<React.SetStateAction<TaskPlan | null>>;
  onRevisePlan: (remainingMinutes: number, skippedStepIds: string[], customNotes?: string) => Promise<void>;
  isRevising: boolean;
}

export default function FocusMode({
  taskInput,
  plan,
  setPlan,
  onRevisePlan,
  isRevising,
}: FocusModeProps) {
  // Active selected index in Focus Room
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  
  // Replanning Modals and States
  const [panicModeOpen, setPanicModeOpen] = useState<boolean>(false);
  const [panicNotes, setPanicNotes] = useState<string>("");
  const [panicHoursInput, setPanicHoursInput] = useState<string>(taskInput.availableHours ? taskInput.availableHours.toString() : "");
  const [panicError, setPanicError] = useState<string | null>(null);

  useEffect(() => {
    if (panicModeOpen) {
      setPanicHoursInput(taskInput.availableHours ? taskInput.availableHours.toString() : "");
    }
  }, [panicModeOpen, taskInput.availableHours]);

  // Skip Confirmation Modal
  const [skipModalOpen, setSkipModalOpen] = useState<boolean>(false);
  const [stepToSkip, setStepToSkip] = useState<TaskPlanStep | null>(null);

  const steps = plan.steps;

  // Whenever steps change, automatically set focus on the first incomplete task (neither completed nor skipped)
  useEffect(() => {
    const firstIncomplete = steps.findIndex((s) => !s.isCompleted && !s.isSkipped);
    if (firstIncomplete !== -1) {
      setFocusedIndex(firstIncomplete);
    } else {
      // Find the first task that is not completed at all
      const firstNotCompleted = steps.findIndex((s) => !s.isCompleted);
      if (firstNotCompleted !== -1) {
        setFocusedIndex(firstNotCompleted);
      } else {
        setFocusedIndex(0);
      }
    }
  }, [steps]);

  const activeStep = steps[focusedIndex] || null;

  // Reset timer whenever focused task changes
  useEffect(() => {
    if (activeStep) {
      setSecondsLeft(activeStep.durationMinutes * 60);
      setTimerRunning(false);
    }
  }, [focusedIndex, activeStep?.id]);

  // Countdown clock interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
      // Automatically trigger completion of task on time-out to help user pilot forward
      handleMarkComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, secondsLeft]);

  // Manual checkbox toggle (supports unchecking)
  const handleToggleStep = (stepId: string) => {
    setPlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        steps: prev.steps.map((s) =>
          s.id === stepId 
            ? { ...s, isCompleted: !s.isCompleted, isSkipped: false } // Reset skipped if they toggle manually
            : s
        ),
      };
    });
  };

  // Mark task complete and advance automatically
  const handleMarkComplete = () => {
    if (!activeStep) return;

    // 1. Mark current checklist item completed
    setPlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        steps: prev.steps.map((s) =>
          s.id === activeStep.id ? { ...s, isCompleted: true, isSkipped: false } : s
        ),
      };
    });

    // 2. Look for the next incomplete and unskipped step
    const nextIncompleteIndex = steps.findIndex(
      (s, idx) => idx > focusedIndex && !s.isCompleted && !s.isSkipped
    );

    if (nextIncompleteIndex !== -1) {
      setFocusedIndex(nextIncompleteIndex);
    } else if (focusedIndex < steps.length - 1) {
      setFocusedIndex((prev) => prev + 1);
    }
    setTimerRunning(false);
  };

  // Open custom Skip modal
  const handleTriggerSkip = () => {
    if (!activeStep) return;
    setStepToSkip(activeStep);
    setSkipModalOpen(true);
  };

  // Confirm and apply skip action
  const handleConfirmSkip = () => {
    if (!stepToSkip) return;

    // Mark current step as skipped
    setPlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        steps: prev.steps.map((s) =>
          s.id === stepToSkip.id ? { ...s, isSkipped: true, isCompleted: false } : s
        ),
      };
    });

    setSkipModalOpen(false);
    setStepToSkip(null);

    // Advance to next task if possible
    const nextIncompleteIndex = steps.findIndex(
      (s, idx) => idx > focusedIndex && !s.isCompleted && !s.isSkipped
    );

    if (nextIncompleteIndex !== -1) {
      setFocusedIndex(nextIncompleteIndex);
    } else if (focusedIndex < steps.length - 1) {
      setFocusedIndex((prev) => prev + 1);
    }
    setTimerRunning(false);
  };

  // Export parsed plan object to file exactly as deadline-plan.json
  const handleExportPlan = () => {
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

  // Handle emergency recalculate / I Couldn't Finish replanning API submission
  const handlePanicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPanicError(null);

    const parsedHours = parseFloat(panicHoursInput);
    if (isNaN(parsedHours) || parsedHours <= 0) {
      setPanicError("Please specify a valid count of remaining hours left.");
      return;
    }

    try {
      const remainingMinutes = Math.round(parsedHours * 60);
      const skippedIds = steps.filter((s) => s.isSkipped).map((s) => s.id);
      
      await onRevisePlan(remainingMinutes, skippedIds, panicNotes);
      setPanicModeOpen(false);
      setPanicNotes("");
    } catch (err: any) {
      setPanicError(err.message || "Failed to contact Gemini to recalculate your timeline.");
    }
  };

  // General statistics calculations
  const totalTasks = steps.length;
  const completedSteps = steps.filter((s) => s.isCompleted);
  const completedCount = completedSteps.length;
  const skippedCount = steps.filter((s) => s.isSkipped).length;
  
  // Mission finishes when all steps are processed (either completed or skipped)
  const allTasksProcessed = totalTasks > 0 && steps.every((s) => s.isCompleted || s.isSkipped);

  const totalMinutesAllocated = steps.reduce((acc, s) => acc + s.durationMinutes, 0);
  const completedMinutes = completedSteps.reduce((acc, s) => acc + s.durationMinutes, 0);
  const remainingMinutesTotal = Math.max(0, totalMinutesAllocated - completedMinutes);

  const completionPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Format countdown clock values
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Circular timer constants
  const circleRadius = 74;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const activeStepTotalSeconds = activeStep ? activeStep.durationMinutes * 60 : 1;
  const strokeDashoffset = circleCircumference - (secondsLeft / activeStepTotalSeconds) * circleCircumference;

  const priorityStyles = {
    high: "bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300",
    medium: "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300",
    low: "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300",
  };

  const currentPriority = plan.priority === "high" || plan.priority === "medium" || plan.priority === "low"
    ? plan.priority
    : "medium";

  // Parse Start & End times from scheduledTime (e.g., "10:15 PM - 10:45 PM")
  const parseTimeBlock = (timeStr: string) => {
    if (!timeStr) return { start: "Pending", end: "" };
    const parts = timeStr.split(/\s*-\s*|\s*to\s*/i);
    if (parts.length >= 2) {
      return { start: parts[0], end: parts[1] };
    }
    return { start: timeStr, end: "" };
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-10 transition-colors duration-200" id="focus-room-wrapper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Recalculating overlay loader screen */}
        <AnimatePresence>
          {isRevising && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center"
              id="revising-full-overlay"
            >
              <div className="relative flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 animate-spin" />
                <Brain className="h-8 w-8 text-indigo-400 absolute animate-pulse" />
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                AI is recalculating your schedule...
              </h2>
              <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                Emergency timeline recalibration in progress. Gemini is restructuring your unfinished checklist items to fit within your remaining window.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SUCCESS SCREEN */}
        <AnimatePresence mode="wait">
          {allTasksProcessed ? (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto bg-indigo-950 text-white rounded-3xl border border-indigo-900 shadow-2xl p-8 sm:p-14 text-center overflow-hidden relative"
              id="success-screen-panel"
            >
              {/* Background ambient accents */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-emerald-500 text-indigo-950 flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20">
                  <Check className="h-10 w-10 stroke-[3.5]" />
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 font-sans">
                  Mission Accomplished 🎉
                </h1>
                <p className="text-indigo-200 text-base sm:text-lg font-normal mb-8 max-w-lg leading-relaxed">
                  Congratulations! You piloted your emergency schedule successfully and crossed the finish line before your deadline.
                </p>

                {/* Statistics Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl bg-indigo-900/40 border border-indigo-800/80 rounded-2xl p-6 mb-10 text-left">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">Total Tasks</p>
                    <p className="text-2xl font-extrabold mt-1">{totalTasks}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">Completed</p>
                    <p className="text-2xl font-extrabold mt-1 text-emerald-400">{completedCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">Focus Duration</p>
                    <p className="text-2xl font-extrabold mt-1 text-indigo-200">{completedMinutes}m</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">Remaining Saved</p>
                    <p className="text-2xl font-extrabold mt-1 text-amber-300">{remainingMinutesTotal}m</p>
                  </div>
                </div>

                {/* Motivation Quote */}
                {plan.motivation && (
                  <div className="max-w-xl bg-indigo-900/20 border border-dashed border-indigo-700/60 p-6 rounded-xl mb-10 italic text-indigo-100 font-serif text-sm sm:text-base leading-relaxed">
                    "{plan.motivation}"
                  </div>
                )}

                {/* Success CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <button
                    onClick={handleExportPlan}
                    className="px-6 py-3.5 bg-indigo-800 hover:bg-indigo-700 text-indigo-100 hover:text-white font-semibold rounded-xl border border-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Flight Logs</span>
                  </button>
                  <button
                    onClick={() => {
                      setPlan(null);
                      window.location.reload();
                    }}
                    className="px-6 py-3.5 bg-white text-indigo-950 hover:bg-slate-50 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                    <span>Pilot Another Deadline</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ACTIVE FOCUS ROOM PANEL */
            <div key="active-focus-room" className="space-y-8 animate-fade-in">
              
              {/* Top Bar Navigation & Stats Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                    <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    <span>Active Focus Room</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Keep your head down and fly the timeline. Use the ticking clock as fuel.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExportPlan}
                    className="px-4 py-2 bg-white dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    id="export-plan-btn"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                    <span>Export AI Plan</span>
                  </button>
                  <button
                    onClick={() => setPanicModeOpen(true)}
                    className="px-4 py-2 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    id="panic-button"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500 animate-bounce" />
                    <span>I Couldn't Finish</span>
                  </button>
                </div>
              </div>

              {/* SMART DASHBOARD: CO-PILOT CONFIDENCE ASSESSMENTS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="focus-confidence-dashboard">
                
                {/* Success Probability */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Success Probability</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {plan.successProbability ?? 85}%
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${plan.successProbability ?? 85}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-2 font-mono uppercase tracking-widest">
                    AI confidence
                  </span>
                </div>

                {/* Risk Level */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                    <Gauge className="h-4 w-4 text-rose-500" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Risk Level</span>
                  </div>
                  <div className="mt-4">
                    <span className={`inline-block text-sm font-extrabold uppercase px-2.5 py-1 rounded-lg border ${
                      (plan.riskLevel || currentPriority) === "high"
                        ? "bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-400"
                        : (plan.riskLevel || currentPriority) === "medium"
                        ? "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-400"
                        : "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-400"
                    }`}>
                      {plan.riskLevel ?? currentPriority}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest mt-2">
                    Urgency Grade
                  </span>
                </div>

                {/* Time Pressure */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                    <Hourglass className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Time Pressure</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-200 tracking-tight leading-snug">
                      {plan.timePressure ?? (currentPriority === "high" ? "Intense" : "Moderate")}
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest mt-2">
                    Remaining Bandwidth
                  </span>
                </div>

                {/* Completion Prediction */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Completion Prediction</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
                      {plan.completionPrediction ?? "Tight but highly feasible with prompt focus."}
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest mt-2">
                    Piloting assessment
                  </span>
                </div>

              </div>

              {/* Grid Layout for Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT: Live Timer, Progress Statistics & Active Task */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Circular Timer & Active Status Card */}
                  <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8">
                    
                    {/* SVG Circular Countdown */}
                    <div className="relative shrink-0 flex items-center justify-center">
                      <svg className="w-44 h-44 transform -rotate-90">
                        {/* Background track circle */}
                        <circle
                          cx="88"
                          cy="88"
                          r={circleRadius}
                          className="stroke-slate-100 dark:stroke-slate-900"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        {/* Active ticking countdown circle */}
                        <circle
                          cx="88"
                          cy="88"
                          r={circleRadius}
                          className="stroke-indigo-600 dark:stroke-indigo-500 transition-all duration-300"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={circleCircumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Inside clock digits */}
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-mono font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                          {formatTime(secondsLeft)}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mt-1">
                          Remaining
                        </span>
                      </div>
                    </div>

                    {/* Active Step Details & Control Buttons */}
                    <div className="flex-grow text-center md:text-left">
                      {activeStep ? (
                        <>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${priorityStyles[currentPriority]}`}>
                              {currentPriority} Priority
                            </span>
                            <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-mono font-bold">
                              Step {focusedIndex + 1} of {totalTasks}
                            </span>
                          </div>

                          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1 leading-tight">
                            {activeStep.title}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mb-4">
                            Block: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{activeStep.scheduledTime}</span> ({activeStep.durationMinutes} minutes)
                          </p>

                          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                            {activeStep.description}
                          </p>

                          {/* Controls */}
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <button
                              onClick={() => setTimerRunning(!timerRunning)}
                              className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                                timerRunning
                                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200"
                                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                              }`}
                            >
                              {timerRunning ? (
                                <>
                                  <Pause className="h-4 w-4 fill-white" />
                                  <span>Pause Timer</span>
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 fill-white" />
                                  <span>Start Focus</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={handleMarkComplete}
                              className="px-5 py-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Mark Task Complete</span>
                            </button>

                            <button
                              onClick={handleTriggerSkip}
                              className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
                              title="Skip current task"
                            >
                              <SkipForward className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-slate-500 dark:text-slate-400 font-medium">All tasks focused. Click checkboxes to complete your pilot mission!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Next Step Preview Bar */}
                  {focusedIndex < totalTasks - 1 && steps[focusedIndex + 1] && (
                    <div className="bg-slate-100/80 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-xl p-4 flex justify-between items-center gap-4 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="font-mono uppercase font-bold text-[10px] bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                          UP NEXT
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-sm sm:max-w-md">
                          {steps[focusedIndex + 1].title}
                        </span>
                      </div>
                      <div className="font-mono text-slate-400 dark:text-slate-500 shrink-0 font-medium">
                        {steps[focusedIndex + 1].durationMinutes} mins
                      </div>
                    </div>
                  )}

                  {/* Progress & Stats Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Remaining Time */}
                    <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs flex flex-col justify-between">
                      <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                        Remaining Focus
                      </p>
                      <div className="mt-2.5">
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                          {remainingMinutesTotal} <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Mins</span>
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          Across {totalTasks - completedCount - skippedCount} pending
                        </p>
                      </div>
                    </div>

                    {/* Completion Percentage */}
                    <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs flex flex-col justify-between">
                      <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                        Tasks Logged
                      </p>
                      <div className="mt-2.5">
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                          {completedCount} <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">/ {totalTasks}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          {completionPercent}% performance rate
                        </p>
                      </div>
                    </div>

                    {/* Status Badge Indicator */}
                    <div className="bg-indigo-900 text-indigo-100 p-5 rounded-2xl border border-indigo-800 dark:border-slate-900 shadow-xs flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-10">
                        <Flame className="w-16 h-16" />
                      </div>
                      <p className="text-[10px] font-mono text-indigo-400 dark:text-indigo-300 uppercase tracking-wider font-bold relative z-10">
                        Co-Pilot Status
                      </p>
                      <div className="mt-2.5 relative z-10">
                        <p className="text-lg font-extrabold leading-none flex items-center gap-1">
                          <Sparkles className="h-4 w-4 text-orange-400 fill-orange-400 shrink-0 animate-pulse" />
                          <span>Active Flight</span>
                        </p>
                        <p className="text-[10px] text-indigo-300 dark:text-indigo-400 mt-1">
                          Follow calendar to pilot home
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Overarching Plan Progress Bar */}
                  <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Flight Path Completion Progress</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{completionPercent}%</span>
                    </div>
                    {/* Track */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      {/* Filler */}
                      <div
                        className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Cognitive Reasoning Assessment Card */}
                  <div className="bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/40 p-5 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                      <Brain className="h-4 w-4 text-indigo-500" />
                      <span>Co-Pilot Cognitive Risk Reasoning</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {plan.reasoning ?? plan.urgencyRationale}
                    </p>
                  </div>

                </div>

                {/* RIGHT: Checklist & Productivity tips */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Interactive Checklist Container */}
                  <div className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs" id="checklist-card">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <span>Tactical Checklist</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded">
                        {completedCount} / {totalTasks} Completed
                      </span>
                    </h2>

                    <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                      {steps.map((step, idx) => {
                        const isFocused = idx === focusedIndex;
                        const isDone = step.isCompleted;
                        const isSkipped = step.isSkipped;

                        return (
                          <div
                            key={step.id || idx}
                            onClick={() => setFocusedIndex(idx)}
                            className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-start gap-3.5 ${
                              isFocused
                                ? "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 shadow-xs"
                                : isDone
                                ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-900 opacity-60"
                                : isSkipped
                                ? "bg-rose-50/20 dark:bg-rose-950/10 border-rose-100/50 dark:border-rose-900/40 opacity-75"
                                : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800"
                            }`}
                          >
                            {/* Checkbox circle element */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStep(step.id);
                              }}
                              className="mt-0.5 focus:outline-hidden text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
                              id={`toggle-step-${step.id}`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950" />
                              ) : isSkipped ? (
                                <AlertCircle className="h-5 w-5 text-rose-500" />
                              ) : (
                                <Circle className="h-5 w-5" />
                              )}
                            </button>

                            <div className="flex-grow min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className={`font-bold text-xs sm:text-sm truncate leading-tight ${
                                  isDone ? "line-through text-slate-400 dark:text-slate-500" : isSkipped ? "text-rose-700 dark:text-rose-400" : "text-slate-900 dark:text-slate-150"
                                }`}>
                                  {step.title}
                                </h4>
                                <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                                  {step.durationMinutes}m
                                </span>
                              </div>
                              <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isDone ? "text-slate-400 dark:text-slate-500" : "text-slate-500 dark:text-slate-400"}`}>
                                {step.description}
                              </p>
                              {isSkipped && (
                                <span className="inline-block text-[8px] font-mono font-black uppercase text-rose-600 bg-rose-50 dark:bg-rose-950 dark:text-rose-400 px-1 py-0.2 rounded mt-1.5">
                                  Skipped task
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gemini briefing note excerpt */}
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/60 rounded-2xl p-5 text-xs sm:text-sm text-amber-900/95 dark:text-amber-300 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold mb-2">
                      <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                      <span>Co-Pilot Urgency Note</span>
                    </div>
                    <p className="font-medium text-slate-700 dark:text-slate-300 leading-normal">{plan.urgencyRationale}</p>
                  </div>

                </div>

              </div>

              {/* VERTICAL TIMELINE VISUALIZATION (Google Calendar Style) */}
              <div className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs space-y-6" id="calendar-timeline-vis">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Flight Plan Timeline</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Your scheduled day represented vertically like Google Calendar. Highlighting your active segment.
                  </p>
                </div>

                <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 sm:pl-10 space-y-8 py-2">
                  {steps.map((step, idx) => {
                    const { start, end } = parseTimeBlock(step.scheduledTime);
                    const isCompleted = step.isCompleted;
                    const isSkipped = step.isSkipped;
                    const isCurrent = idx === focusedIndex && !isCompleted && !isSkipped;

                    return (
                      <div key={step.id || idx} className="relative group">
                        
                        {/* Bullet Marker on vertical track line */}
                        <div className={`absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-950 flex items-center justify-center transition-all duration-300 z-10 ${
                          isCompleted
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-500 scale-110"
                            : isSkipped
                            ? "border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-500"
                            : isCurrent
                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900 scale-125 animate-pulse"
                            : "border-slate-300 dark:border-slate-700"
                        }`}>
                          {isCompleted ? (
                            <Check className="h-2.5 w-2.5 stroke-[4]" />
                          ) : isSkipped ? (
                            <X className="h-2.5 w-2.5 stroke-[3]" />
                          ) : (
                            <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? "bg-indigo-600" : "bg-transparent"}`} />
                          )}
                        </div>

                        {/* Flex timeline layout */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          
                          {/* Left Column: Clock Times */}
                          <div className="sm:w-32 shrink-0 flex flex-row sm:flex-col items-center sm:items-start gap-2 sm:gap-0.5">
                            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                              {start}
                            </span>
                            {end && (
                              <>
                                <span className="text-[10px] text-slate-400 dark:text-slate-600 sm:block">to</span>
                                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                                  {end}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Right Column: Google Calendar Block Card */}
                          <div className={`flex-grow p-4 rounded-xl border transition-all duration-300 ${
                            isCompleted
                              ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/60 shadow-xs"
                              : isSkipped
                              ? "bg-rose-50/20 dark:bg-rose-950/10 border-rose-100/50 dark:border-rose-900/40 opacity-75"
                              : isCurrent
                              ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-900"
                              : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-900/80"
                          }`}>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <h4 className={`font-bold text-sm ${
                                isCompleted ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"
                              }`}>
                                {step.title}
                              </h4>
                              
                              {/* Status Badge */}
                              <span className={`text-[9px] font-mono uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                                  : isSkipped
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400"
                                  : isCurrent
                                  ? "bg-indigo-600 text-white animate-pulse"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              }`}>
                                {isCompleted ? "Completed" : isSkipped ? "Skipped" : isCurrent ? "Active" : "Pending"}
                              </span>
                            </div>

                            <p className={`text-xs ${
                              isCompleted ? "text-slate-400 dark:text-slate-500" : "text-slate-500 dark:text-slate-400"
                            } mb-2 leading-relaxed`}>
                              {step.description}
                            </p>

                            <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              <Clock className="h-3 w-3" />
                              <span>{step.durationMinutes} mins allocated</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOM SKIP CONFIRMATION MODAL */}
              <AnimatePresence>
                {skipModalOpen && stepToSkip && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" id="skip-modal-backdrop">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-2xl max-w-sm w-full overflow-hidden"
                    >
                      <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900 flex items-center gap-2">
                        <AlertOctagon className="h-5 w-5 text-rose-500 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white text-sm">Skip Checklist Segment?</span>
                      </div>
                      <div className="p-5 space-y-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Are you sure you want to skip <span className="font-semibold text-slate-800 dark:text-slate-200">"{stepToSkip.title}"</span>? This task will be flagged as skipped in your pilot logs, and you will proceed immediately to the next task segment.
                        </p>
                        
                        <div className="flex gap-3 justify-end text-xs pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSkipModalOpen(false);
                              setStepToSkip(null);
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmSkip}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-md shadow-rose-200 dark:shadow-none transition-all cursor-pointer"
                          >
                            Confirm Skip
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* EMERGENCY PLAN RECALCULATE MODAL (I Couldn't Finish) */}
              {panicModeOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" id="panic-modal-backdrop">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-2xl max-w-md w-full overflow-hidden"
                  >
                    <div className="p-6 bg-rose-900 dark:bg-rose-950 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-400 animate-pulse" />
                        <span className="font-bold tracking-tight text-sm">Emergency Recalculate Timeline</span>
                      </div>
                      <button
                        onClick={() => {
                          setPanicModeOpen(false);
                          setPanicError(null);
                        }}
                        className="text-white/85 hover:text-white font-semibold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handlePanicSubmit} className="p-6 space-y-5" noValidate>
                      {panicError && (
                        <div className="p-3.5 bg-rose-50 dark:bg-rose-950 border-l-4 border-rose-500 text-rose-800 dark:text-rose-300 text-xs rounded-r-lg font-medium flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                          <span>{panicError}</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Fell behind schedule? Tasks took longer than expected? Submit your remaining workload to let Gemini restructure and compress your schedule dynamically.
                      </p>

                      {/* Current Workload Status Information */}
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span>Completed Tasks:</span>
                          <span className="font-bold text-slate-800 dark:text-white">{completedCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Skipped Tasks:</span>
                          <span className="font-bold text-slate-800 dark:text-white">{skippedCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining Unfinished:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalTasks - completedCount - skippedCount} segments</span>
                        </div>
                      </div>

                      {/* Remaining Hours */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5" htmlFor="panic-hours-input">
                          Remaining Available Hours Left
                        </label>
                        <div className="relative flex items-center">
                          <input
                            id="panic-hours-input"
                            type="number"
                            step="any"
                            required
                            placeholder="e.g. 1.5 or 2"
                            value={panicHoursInput}
                            onChange={(e) => setPanicHoursInput(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden text-sm font-semibold text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-4 text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">HOURS</span>
                        </div>
                      </div>

                      {/* Optional notes context */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5" htmlFor="panic-notes-input">
                          What went wrong / Context for AI
                        </label>
                        <textarea
                          id="panic-notes-input"
                          rows={3}
                          placeholder="e.g. Spent too much time on design drafts. Only 1.5 hours left until deadline. Need to speed up remaining tasks!"
                          value={panicNotes}
                          onChange={(e) => setPanicNotes(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden text-xs font-medium text-slate-900 dark:text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isRevising}
                        className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-100 dark:shadow-none transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:shadow-none"
                      >
                        {isRevising ? (
                          <>
                            <RotateCw className="h-4 w-4 animate-spin" />
                            <span>Re-routing Flight Plan...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 fill-rose-100 text-rose-100" />
                            <span>Recalculate Plan</span>
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}

            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
