import React, { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import FocusMode from "./components/FocusMode";
import { TaskInput, TaskPlan } from "./types";
import { Zap, Heart, Sparkles, AlertCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "dashboard" | "focus">("landing");
  const [plan, setPlan] = useState<TaskPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Initialize with some realistic high-urgency default values for easier testing
  const defaultDeadline = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const [taskInput, setTaskInput] = useState<TaskInput>({
    name: "Final Presentation - Q4 Product Launch Slides",
    deadline: defaultDeadline,
    difficulty: "hard",
    availableHours: 3.5,
    notes: "Must structure 15 slides, refine speaker notes, and conduct at least one practice run. Highly critical to my career review tomorrow morning.",
  });

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const localTimeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: taskInput.name,
          deadline: taskInput.deadline,
          difficulty: taskInput.difficulty,
          availableHours: taskInput.availableHours,
          notes: taskInput.notes,
          clientTime: localTimeStr,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const parsedPlan = await response.json();
      
      // Enforce step fields and isCompleted state
      const formattedSteps = parsedPlan.steps.map((step: any, index: number) => ({
        ...step,
        id: step.id || `step-${index + 1}`,
        isCompleted: false,
      }));

      setPlan({
        ...parsedPlan,
        steps: formattedSteps,
      });
    } catch (err: any) {
      console.error("Failed to generate plan:", err);
      throw new Error(err.message || "Failed to contact Gemini API. Please make sure your API key is correctly configured.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevisePlan = async (remainingMinutes: number, skippedStepIds: string[] = [], customNotes?: string) => {
    setIsRevising(true);
    try {
      const localTimeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      
      // We pass the currently active plan, and we can determine which steps are completed from FocusRoom.
      const completedStepIds = plan?.steps.filter(s => s.isCompleted).map(s => s.id) || [];
      const currentStepId = plan?.steps.find(s => !s.isCompleted && !skippedStepIds.includes(s.id))?.id || null;

      const response = await fetch("/api/revise-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskInput,
          originalPlan: plan,
          completedStepIds,
          skippedStepIds,
          remainingMinutes,
          currentStepId,
          clientTime: localTimeStr,
          notes: customNotes || "User fell behind on schedule and requested emergency plan compression."
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server revision error: ${response.status}`);
      }

      const parsedPlan = await response.json();
      
      // Setup the revised steps
      const formattedSteps = parsedPlan.steps.map((step: any, index: number) => ({
        ...step,
        id: step.id || `revised-step-${index + 1}`,
        isCompleted: false,
      }));

      setPlan({
        ...parsedPlan,
        steps: formattedSteps,
      });
    } catch (err: any) {
      console.error("Failed to revise plan:", err);
      throw new Error(err.message || "Failed to revise your flight schedule with Gemini.");
    } finally {
      setIsRevising(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200" id="app-root">
      {/* Navigation */}
      <Navigation
        currentView={currentView}
        onViewChange={(view) => {
          if (view === "focus" && plan === null) {
            setShowLockedModal(true);
          } else {
            setCurrentView(view);
          }
        }}
        hasPlan={plan !== null}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main View Router */}
      <main className="flex-grow">
        {currentView === "landing" && (
          <LandingPage onStart={() => setCurrentView("dashboard")} />
        )}

        {currentView === "dashboard" && (
          <Dashboard
            taskInput={taskInput}
            setTaskInput={setTaskInput}
            plan={plan}
            onGeneratePlan={handleGeneratePlan}
            isLoading={isLoading}
            onGoToFocus={() => setCurrentView("focus")}
          />
        )}

        {currentView === "focus" && plan && (
          <FocusMode
            taskInput={taskInput}
            plan={plan}
            setPlan={setPlan}
            onRevisePlan={handleRevisePlan}
            isRevising={isRevising}
          />
        )}
      </main>

      {/* Modern Locked Focus Mode Modal */}
      <AnimatePresence>
        {showLockedModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLockedModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md dark:bg-slate-950/60"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/95 shadow-2xl backdrop-blur-xl p-6 text-center z-10"
              id="focus-locked-modal"
            >
              {/* Close Button top-right */}
              <button
                onClick={() => setShowLockedModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Icon Container */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 mb-5 shadow-xs">
                <Info className="h-7 w-7" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                Focus Mode Locked
              </h3>

              {/* Description Message */}
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Focus Mode is available after you create your AI Action Plan. Please add your tasks on the Dashboard and click <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">'Generate AI Plan'</strong> to unlock Focus Mode.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowLockedModal(false)}
                  className="w-full order-2 sm:order-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowLockedModal(false);
                    setCurrentView("dashboard");
                  }}
                  className="w-full order-1 sm:order-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-100 dark:shadow-none hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5"
                >
                  <span>Go to Dashboard</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Beautiful Craft Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 py-10" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Left Info */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 text-slate-800 dark:text-slate-100 font-bold tracking-tight">
                <Zap className="h-4 w-4 text-indigo-600 fill-indigo-100" />
                <span>DeadlinePilot AI</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm">
                A modern productivity engine designed for Google's Vibe2Ship Hackathon, under the theme "The Last-Minute Life Saver".
              </p>
            </div>

            {/* Middle Badge */}
            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs px-3 py-1.5 rounded-full font-medium shadow-xs">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span>Built with React + Tailwind + Gemini AI</span>
            </div>

            {/* Right Copyright */}
            <div className="text-center md:text-right">
              <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center md:justify-end">
                <span>Made with</span>
                <Heart className="h-3 w-3 text-rose-500 mx-1 fill-rose-500 animate-pulse" />
                <span>for productivity pilots worldwide</span>
              </p>
              <p className="text-[10px] text-slate-300 dark:text-slate-600 font-mono mt-1">v1.0.0-beta • Cloud Run Sandbox</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
