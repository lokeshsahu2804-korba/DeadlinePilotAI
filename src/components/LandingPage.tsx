import React from "react";
import { motion } from "motion/react";
import { Zap, Clock, ShieldAlert, Sparkles, AlertTriangle, ArrowRight, Play, CheckCircle2 } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans transition-colors duration-200" id="landing-page-root">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 py-20 sm:py-28 transition-colors duration-200">
        <div className="absolute inset-0 bg-linear-to-b from-indigo-50/30 to-transparent dark:from-indigo-950/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto"
          >
            {/* Tagline Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-1.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-500" />
              <span>The Last-Minute Life Saver</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-6"
            >
              Crush Your Deadlines. <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                Zero Panic. Only Action.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-10 max-w-2xl mx-auto"
            >
              Struggling with an urgent task? Input your deadline and available hours. DeadlinePilot AI crafts a high-precision, minute-by-minute action plan to steer you safely to completion.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              <button
                onClick={onStart}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl dark:shadow-none transition-all duration-200 flex items-center justify-center space-x-2.5 cursor-pointer transform hover:-translate-y-0.5"
                id="cta-pilot-deadline"
              >
                <Zap className="h-5 w-5 fill-indigo-100" />
                <span>Pilot My Deadline Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={onStart}
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:text-slate-900 dark:hover:text-white transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                id="cta-how-it-works"
              >
                <Play className="h-4 w-4 text-slate-400 fill-slate-400" />
                <span>See Dashboard Demo</span>
              </button>
            </motion.div>

            {/* Live Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100 dark:border-slate-800 max-w-2xl mx-auto text-left"
            >
              <div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">94.2%</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Success Rate</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">&lt; 3 mins</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Setup Time</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">100%</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Stress Reduction</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="features-section">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            Built for High-Pressure Scenarios
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            When time is short, traditional calendar scheduling fails. DeadlinePilot AI is engineered purely to save your work before midnight hits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs hover:shadow-md dark:hover:shadow-none transition-all duration-300">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl w-fit mb-6">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Priority Calculation</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Gemini instantly judges urgency ratios based on notes, depth, and difficulty. No more guessing where to begin.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs hover:shadow-md dark:hover:shadow-none transition-all duration-300">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit mb-6">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Minute-by-Minute Plan</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Get an explicit breakdown of sub-tasks structured beautifully with concrete time allocations.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs hover:shadow-md dark:hover:shadow-none transition-all duration-300">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl w-fit mb-6">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Adaptive Focus Room</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              An immersive dashboard with countdown timers, clear objectives, and real-time stress adaptation features.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xs hover:shadow-md dark:hover:shadow-none transition-all duration-300">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit mb-6">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Dynamic Adaptor</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              If you fall behind or can't finish, press the panic button to let Gemini dynamically revise and save your timeline.
            </p>
          </div>
        </div>
      </div>

      {/* User Scenarios */}
      <div className="bg-indigo-950 text-white py-16 sm:py-24" id="scenarios-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-5 mb-10 lg:mb-0">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                "It's 8:00 PM and my assignment is due at midnight."
              </h2>
              <p className="mt-4 text-slate-300 text-lg leading-relaxed">
                We've all been there. Panic sets in, you stare at a blank screen, and waste another hour. DeadlinePilot stops the spiral. By acting as your high-speed senior tutor or advisor, Gemini gives you a flawless flight path to completion.
              </p>
              <div className="mt-8 space-y-3.5">
                {[
                  "No signup. No complex databases. Fast and instant.",
                  "Custom time estimates tailored to your work style.",
                  "Direct and practical productivity notes for the final stretch.",
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
                    <span className="text-slate-200 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-indigo-900/60 border border-indigo-800 p-6 sm:p-10 rounded-2xl backdrop-blur-xs">
              <h3 className="text-lg font-bold text-indigo-300 flex items-center space-x-2 mb-6">
                <AlertTriangle className="h-5 w-5 text-amber-400 animate-pulse" />
                <span>Last-Minute Flight Manual</span>
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-indigo-950/80 rounded-xl border border-indigo-800/80">
                  <p className="text-xs font-mono text-indigo-400 mb-1">STEP 1: SUBMIT BASIC DATA</p>
                  <p className="text-sm font-medium">Input task scope, total remaining hours, and notes.</p>
                </div>
                <div className="p-4 bg-indigo-950/80 rounded-xl border border-indigo-800/80">
                  <p className="text-xs font-mono text-indigo-400 mb-1">STEP 2: FLY THE CO-PILOT SCHEDULE</p>
                  <p className="text-sm font-medium">Follow the structured steps in the Focus Room. Toggle step checkboxes as you finish.</p>
                </div>
                <div className="p-4 bg-indigo-950/80 rounded-xl border border-indigo-800/80 animate-pulse">
                  <p className="text-xs font-mono text-red-400 mb-1">PANIC CONTROL: FALLING BEHIND?</p>
                  <p className="text-sm font-medium text-slate-200">Our adaptive algorithm recalculates remaining hours and customizes speed guides instantly.</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={onStart}
                  className="px-6 py-3 bg-white text-indigo-950 hover:bg-slate-100 font-bold rounded-xl transition-all duration-150 shadow-md cursor-pointer inline-flex items-center space-x-2"
                >
                  <span>Launch Co-Pilot App</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
