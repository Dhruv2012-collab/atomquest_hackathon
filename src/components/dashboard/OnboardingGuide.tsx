"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles, CheckCircle2, Circle, ArrowRight, X, HelpCircle,
  ChevronDown, ChevronUp, CheckSquare, Shield, Users, Layers
} from "lucide-react";
import Link from "next/link";

interface Step {
  id: string;
  title: string;
  desc: string;
  link: string;
  isExternal?: boolean;
}

interface RoleConfig {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accent: string;
  steps: Step[];
}

const CONFIGS: Record<"employee" | "manager" | "admin", RoleConfig> = {
  employee: {
    title: "Employee Onboarding Guide",
    subtitle: "Learn how to define your Q1 goals, complete check-ins, and track progress.",
    icon: Sparkles,
    accent: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    steps: [
      {
        id: "emp-1",
        title: "Define & Submit Goals",
        desc: "Build your goal sheet with thrust areas and weights summing up to exactly 100%.",
        link: "#goals",
      },
      {
        id: "emp-2",
        title: "Track Manager Approval Status",
        desc: "Await manager review. If status is 'Rework Required', adjust weightings/UoM and resubmit.",
        link: "#dashboard",
      },
      {
        id: "emp-3",
        title: "Log Active Check-ins",
        desc: "Once approved, perform active check-ins to update progress metrics and log comments.",
        link: "#goals",
      },
      {
        id: "emp-4",
        title: "Export Q1 Performance CSV",
        desc: "Download full reports of your submitted objectives and scores for offline review.",
        link: "#dashboard",
      },
    ],
  },
  manager: {
    title: "Manager Alignment Guide",
    subtitle: "Conduct goal sheet reviews, approve cycles, and drive team performance.",
    icon: Users,
    accent: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    steps: [
      {
        id: "mgr-1",
        title: "Review Team Dashboard",
        desc: "Check active team objectives, avg performance metrics, and velocity curves.",
        link: "/manager/dashboard",
      },
      {
        id: "mgr-2",
        title: "Approve Awaiting Plans",
        desc: "Open goal sheets submitted by Dave Dev and others to approve or request rework.",
        link: "/manager/approvals",
      },
      {
        id: "mgr-3",
        title: "Perform Weekly Check-ins",
        desc: "Conduct structured progress reviews and leave guidance comments on active goals.",
        link: "/manager/check-ins",
      },
      {
        id: "mgr-4",
        title: "Browse Direct Reports Directory",
        desc: "Access hierarchy status cards, email channels, and cycle timeline markers.",
        link: "/manager/team",
      },
    ],
  },
  admin: {
    title: "Admin Command Center Guide",
    subtitle: "Manage security roles, cycle unlocking, Active Directory syncs, and governance.",
    icon: Shield,
    accent: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    steps: [
      {
        id: "adm-1",
        title: "Synchronize Entra ID Directory",
        desc: "Map corporate security roles and pull manager-reporting structures from Azure AD.",
        link: "/admin/entra-sync",
      },
      {
        id: "adm-2",
        title: "Unlock Cycle Goal Sheets",
        desc: "Perform administrative override to unlock completed cycles or locked quarters.",
        link: "/admin/cycles",
      },
      {
        id: "adm-3",
        title: "Monitor Cycle Escalations",
        desc: "Review overdue check-ins, returned goal sheets, or system blockages.",
        link: "/admin/escalations",
      },
      {
        id: "adm-4",
        title: "Inspect Governance Audit Trail",
        desc: "Download and track plan overrides, synchronization histories, and lock changes.",
        link: "/admin/audit",
      },
    ],
  },
};

export function OnboardingGuide({ role, defaultPlanStatus }: { role: "employee" | "manager" | "admin"; defaultPlanStatus?: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);

  const config = CONFIGS[role];
  const Icon = config.icon;

  // Sync completion states with local storage
  useEffect(() => {
    const saved = localStorage.getItem(`onboarding-${role}`);
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
    const dismissed = localStorage.getItem(`onboarding-dismissed-${role}`);
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, [role]);

  // Handle plan status auto-completion for employee dashboard
  useEffect(() => {
    if (role === "employee" && defaultPlanStatus) {
      const updated = [...completedSteps];
      let changed = false;

      if (defaultPlanStatus !== "Draft" && !updated.includes("emp-1")) {
        updated.push("emp-1");
        changed = true;
      }
      if (defaultPlanStatus === "Approved" && !updated.includes("emp-2")) {
        updated.push("emp-2");
        changed = true;
      }

      if (changed) {
        setCompletedSteps(updated);
        localStorage.setItem(`onboarding-${role}`, JSON.stringify(updated));
      }
    }
  }, [role, defaultPlanStatus, completedSteps]);

  const toggleStep = (stepId: string) => {
    let next: string[];
    if (completedSteps.includes(stepId)) {
      next = completedSteps.filter((id) => id !== stepId);
    } else {
      next = [...completedSteps, stepId];
    }
    setCompletedSteps(next);
    localStorage.setItem(`onboarding-${role}`, JSON.stringify(next));
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`onboarding-dismissed-${role}`, "true");
  };

  const handleRestore = () => {
    setIsDismissed(false);
    setIsOpen(true);
    localStorage.removeItem(`onboarding-dismissed-${role}`);
  };

  if (isDismissed) {
    return (
      <button
        onClick={handleRestore}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#151515] border border-slate-700/50 shadow-xl rounded-full text-xs font-semibold hover:scale-105 transition-all group"
      >
        <HelpCircle className="w-4 h-4 text-blue-400 group-hover:animate-pulse" />
        <span>Onboarding Guide</span>
      </button>
    );
  }

  const completionPercent = Math.round((completedSteps.length / config.steps.length) * 100);

  return (
    <div className="bg-[#121212] border border-[#222] rounded-xl overflow-hidden shadow-md transition-all duration-300">
      
      {/* Compact Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${config.accent}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">{config.title}</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                {completionPercent}% Done
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{config.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleDismiss}
            title="Dismiss Guide"
            className="p-1 hover:bg-[#222] rounded-md text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-[#222] rounded-md text-slate-500 hover:text-slate-300 transition-colors"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Checklist Zone */}
      {isOpen && (
        <div className="border-t border-[#222] p-4 bg-[#0c0c0c] space-y-3">
          
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>
            <span className="text-[11px] font-bold text-slate-500">{completedSteps.length} of {config.steps.length} completed</span>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {config.steps.map((step, idx) => {
              const isDone = completedSteps.includes(step.id);
              return (
                <div 
                  key={step.id} 
                  className={`flex gap-3 p-3 rounded-lg border transition-all ${
                    isDone 
                      ? "bg-[#141d17] border-emerald-900/30" 
                      : "bg-[#151515] border-[#222] hover:border-slate-700/50"
                  }`}
                >
                  <button 
                    onClick={() => toggleStep(step.id)}
                    className="mt-0.5 focus:outline-none flex-shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 hover:text-blue-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-bold truncate ${
                        isDone ? "text-slate-400 line-through font-medium" : "text-slate-200"
                      }`}>
                        {idx + 1}. {step.title}
                      </p>
                      
                      {!isDone && (
                        <Link 
                          href={step.link}
                          className="text-[10px] font-bold text-blue-400 hover:underline inline-flex items-center gap-0.5 flex-shrink-0"
                        >
                          Go <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
