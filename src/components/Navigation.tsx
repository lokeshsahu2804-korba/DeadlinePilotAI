import React, { useState, useEffect } from "react";
import { Compass, LayoutDashboard, Target, Menu, X, Zap, Sun, Moon } from "lucide-react";

interface NavigationProps {
  currentView: "landing" | "dashboard" | "focus";
  onViewChange: (view: "landing" | "dashboard" | "focus") => void;
  hasPlan: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Navigation({ currentView, onViewChange, hasPlan, isDarkMode, toggleDarkMode }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: "landing", label: "Home", icon: Compass },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "focus", label: "Focus Room", icon: Target, disabled: !hasPlan },
  ] as const;

  return (
    <nav className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 sticky top-0 z-50 shadow-xs" id="nav-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => onViewChange("landing")}
              className="flex items-center space-x-2 text-slate-900 dark:text-white font-sans font-bold text-xl tracking-tight cursor-pointer"
              id="logo-button"
            >
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none">
                <Zap className="h-5 w-5 fill-indigo-100" />
              </div>
              <span>
                Deadline<span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Pilot</span>
                <span className="text-xs ml-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono">AI</span>
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isLockedFocus = item.id === "focus" && !hasPlan;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold"
                      : isLockedFocus
                      ? "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-600 dark:hover:text-slate-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white"
                  }`}
                  title={isLockedFocus ? "Click to learn how to unlock Focus Room" : ""}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{item.label}</span>
                  {isLockedFocus && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1 py-0.2 rounded font-mono font-normal">Locked</span>
                  )}
                </button>
              );
            })}

            {/* Dark Mode Toggle Desktop */}
            <div className="border-l border-slate-100 dark:border-slate-800 h-6 mx-2" />
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              id="desktop-theme-toggle"
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>

          {/* Mobile Menu & Theme Toggle Button Container */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Dark Mode Toggle Mobile header */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
              id="mobile-theme-toggle-header"
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-hidden"
              aria-expanded="false"
              id="mobile-menu-btn"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isLockedFocus = item.id === "focus" && !hasPlan;

              return (
                <button
                  key={item.id}
                  id={`mobile-nav-item-${item.id}`}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                      : isLockedFocus
                      ? "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-600 dark:hover:text-slate-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{item.label}</span>
                  {isLockedFocus && (
                    <span className="ml-auto text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono font-normal">Locked</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
