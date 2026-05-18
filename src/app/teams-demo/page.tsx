"use client";

import { Bell, MessageSquare, Users, Calendar, LayoutGrid, Search, MoreHorizontal, Smile, Paperclip, Send } from "lucide-react";

export default function FakeTeamsPage() {
  return (
    <div className="flex h-screen bg-[#f5f5f5] font-sans overflow-hidden text-[#242424]">
      {/* ── Left Rail (Activity, Chat, Teams, etc.) ── */}
      <div className="w-[68px] bg-[#ebebeb] flex flex-col items-center py-2 border-r border-[#e0e0e0] z-20">
        <div className="flex flex-col items-center gap-1 w-full">
          <button className="flex flex-col items-center p-2 rounded-md hover:bg-white text-[#5c5c5c] w-[90%]">
            <Bell className="w-6 h-6 mb-1" />
            <span className="text-[10px]">Activity</span>
          </button>
          <button className="flex flex-col items-center p-2 rounded-md hover:bg-white text-[#5c5c5c] w-[90%]">
            <MessageSquare className="w-6 h-6 mb-1" />
            <span className="text-[10px]">Chat</span>
          </button>
          <button className="flex flex-col items-center p-2 rounded-md bg-white text-[#5b5fc7] w-[90%] shadow-sm relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#5b5fc7] rounded-r-md" />
            <Users className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-semibold">Teams</span>
          </button>
          <button className="flex flex-col items-center p-2 rounded-md hover:bg-white text-[#5c5c5c] w-[90%]">
            <Calendar className="w-6 h-6 mb-1" />
            <span className="text-[10px]">Calendar</span>
          </button>
          <button className="flex flex-col items-center p-2 rounded-md hover:bg-white text-[#5c5c5c] w-[90%] mt-2">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ── Teams List Panel ── */}
      <div className="w-[280px] bg-white border-r border-[#e0e0e0] flex flex-col z-10">
        <div className="px-4 py-4 border-b border-[#e0e0e0] flex items-center justify-between">
          <h2 className="text-xl font-bold">Teams</h2>
          <LayoutGrid className="w-5 h-5 text-[#5c5c5c]" />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {/* Active Team */}
          <div className="mb-1">
            <button className="w-full flex items-center gap-2 p-2 hover:bg-[#f5f5f5] rounded-md text-left">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                AQ
              </div>
              <span className="font-semibold text-sm truncate">AtomQuest Portal HQ</span>
            </button>
            <div className="pl-10 mt-1">
              <button className="w-full text-left p-1.5 hover:bg-[#f5f5f5] rounded-md text-sm text-[#424242]">General</button>
              <button className="w-full text-left p-1.5 hover:bg-[#f5f5f5] rounded-md text-sm text-[#424242]">Engineering</button>
              <button className="w-full text-left p-1.5 bg-[#eef1f5] rounded-md text-sm font-semibold text-[#242424] flex items-center justify-between">
                Manager Alerts
                <div className="w-4 h-4 bg-[#c23934] text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col bg-[#f5f5f5]">
        {/* Top Header */}
        <div className="h-14 bg-white border-b border-[#e0e0e0] flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              AQ
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Manager Alerts</h1>
              <p className="text-xs text-[#5c5c5c]">AtomQuest Portal HQ</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[#5c5c5c]">
            <Search className="w-5 h-5" />
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center font-bold text-slate-500 text-xs">
              DM
            </div>
          </div>
        </div>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-end">
          
          {/* Timestamp line */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-[#e0e0e0]" />
            <span className="text-xs font-semibold text-[#5c5c5c]">Today</span>
            <div className="flex-1 border-t border-[#e0e0e0]" />
          </div>

          {/* Incoming Webhook Message (Adaptive Card) */}
          <div className="flex gap-4 max-w-2xl">
            <div className="w-10 h-10 rounded-full bg-[#242424] shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col w-full">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-bold text-[#242424]">AtomQuest Bot</span>
                <span className="text-[#5c5c5c] text-xs px-1.5 py-0.5 bg-[#e0e0e0] rounded uppercase tracking-wider font-semibold">Bot</span>
                <span className="text-xs text-[#5c5c5c]">Just now</span>
              </div>
              
              {/* Adaptive Card UI */}
              <div className="bg-white border border-[#e0e0e0] rounded-lg shadow-sm overflow-hidden flex flex-col">
                {/* Accent top border (Orange for submitted) */}
                <div className="h-1 bg-[#ffb900] w-full" />
                
                <div className="p-4 space-y-4">
                  {/* Card Title */}
                  <h3 className="font-bold text-xl text-[#242424] flex items-center gap-2">
                    <span>🎯</span> New Goal Plan Submitted
                  </h3>
                  
                  {/* Card Body */}
                  <p className="text-[#424242] text-sm">
                    <strong>Dave Dev</strong> has submitted their goals for review for Q1 2026.
                  </p>
                  
                  {/* FactSet */}
                  <div className="bg-[#f5f5f5] rounded p-3 space-y-2">
                    <div className="flex text-sm">
                      <span className="w-32 font-bold text-[#242424]">Employee:</span>
                      <span className="text-[#424242]">Dave Dev</span>
                    </div>
                    <div className="flex text-sm">
                      <span className="w-32 font-bold text-[#242424]">Action Needed:</span>
                      <span className="text-[#c23934] font-semibold">Manager Review</span>
                    </div>
                    <div className="flex text-sm">
                      <span className="w-32 font-bold text-[#242424]">Total Weight:</span>
                      <span className="text-[#424242]">100%</span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="pt-2">
                    <a 
                      href="/manager/approvals" 
                      target="_blank"
                      className="inline-block w-full text-center py-2 bg-[#f3f2f1] hover:bg-[#edebe9] text-[#242424] font-semibold border border-[#8a8886] rounded text-sm transition-colors"
                    >
                      Open in AtomQuest
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Message Input Box (Mock) */}
        <div className="p-4 bg-[#f5f5f5]">
          <div className="bg-white border border-[#e0e0e0] rounded-md p-2 flex flex-col shadow-sm">
            <input 
              type="text" 
              placeholder="Reply to AtomQuest Bot..." 
              className="outline-none text-sm p-2 w-full text-[#242424]"
              readOnly
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f0f0f0]">
              <div className="flex gap-2 text-[#5c5c5c]">
                <button className="p-1.5 hover:bg-[#f5f5f5] rounded"><Paperclip className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-[#f5f5f5] rounded"><Smile className="w-4 h-4" /></button>
              </div>
              <button className="p-1.5 hover:bg-[#f5f5f5] rounded text-[#5b5fc7]"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
