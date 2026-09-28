import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskRunner } from '../lib/task-runner';
import { firestoreService } from '../lib/firestore-service';
import { AgentInstruction, DriveKnowledge } from '../types';
import {
  Send,
  Sparkles,
  Zap,
  BrainCircuit,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  FileText,
  Mail,
  Table,
  Calendar,
  Search,
} from 'lucide-react';

interface CommandBoxProps {
  onTaskStarted?: (taskId: string) => void;
  instructions: AgentInstruction[];
  knowledge: DriveKnowledge[];
}

export const CommandBox: React.FC<CommandBoxProps> = ({
  onTaskStarted,
  instructions,
  knowledge,
}) => {
  const { user, profile, accessToken } = useAuth();
  const [command, setCommand] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [modelName, setModelName] = useState('gemini-3.5-flash');
  const [highThinking, setHighThinking] = useState(true);

  const samplePrompts = [
    {
      label: 'Top 5 Hospitals Google Sheet & Doc',
      prompt:
        'Collect verified information on the top 5 international hospitals (specialties, bed capacity, global rating) and input into a newly created Google Sheet and Drive briefing document.',
      icon: Table,
    },
    {
      label: 'Gmail Meeting Check & Calendar Booking',
      prompt:
        'Check today\'s Gmail inbox for meeting requests, inspect my Google Calendar for available free slots, book the consultation, and send a confirmation email with calendar invite to the client.',
      icon: Calendar,
    },
    {
      label: 'Executive Briefing & Doc Report',
      prompt:
        'Search Google for latest breakthrough news in AI agent architectures, summarize findings into an executive briefing Google Doc in my Drive, and email a summary to me.',
      icon: FileText,
    },
  ];

  const handleSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const taskText = (customPrompt || command).trim();
    if (!taskText || isSubmitting) return;

    const effectiveUserId = user?.uid || localStorage.getItem('agentos_guest_uid') || 'operator_default';

    setIsSubmitting(true);
    try {
      const taskId = await taskRunner.startTask(
        effectiveUserId,
        taskText,
        accessToken,
        profile,
        instructions,
        knowledge,
        {
          modelName,
          highThinking,
        }
      );
      setCommand('');
      if (onTaskStarted) {
        onTaskStarted(taskId);
      }
    } catch (err) {
      console.error('Failed to dispatch agent task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl p-5 sm:p-7 backdrop-blur-xl">
      {/* Glow accent */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 blur-3xl pointer-events-none" />

      {/* Title & Autonomous Badge */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>What do you want your agent to do?</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Describe any task in natural language. Your agent plans, executes across Google Workspace, and reports back.
          </p>
        </div>

        {/* Model Selector Pill */}
        <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
          <button
            type="button"
            onClick={() => setModelName('gemini-3.1-flash-lite')}
            className={`px-2.5 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
              modelName === 'gemini-3.1-flash-lite'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Fast</span>
          </button>
          <button
            type="button"
            onClick={() => setModelName('gemini-3.5-flash')}
            className={`px-2.5 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
              modelName === 'gemini-3.5-flash'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Balanced</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setModelName('gemini-3.1-pro-preview');
              setHighThinking(true);
            }}
            className={`px-2.5 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
              modelName === 'gemini-3.1-pro-preview'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="w-3 h-3" />
            <span>Deep Think Pro</span>
          </button>
        </div>
      </div>

      {/* Main Command Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative rounded-2xl bg-slate-950/70 border border-slate-800 focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all p-3 sm:p-4">
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={3}
            placeholder="e.g. Find 20 laboratory job opportunities in Germany, collect company details, save them in my Job Search Google Sheet, prepare application emails using my latest CV, and send only the applications that meet my criteria..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 resize-none outline-none font-normal leading-relaxed"
          />

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-800/60 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Execution Settings</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
              </button>

              {highThinking && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <BrainCircuit className="w-3 h-3 text-indigo-400" />
                  Thinking: HIGH
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!command.trim() || isSubmitting}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:via-indigo-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Planning Task...</span>
                </>
              ) : (
                <>
                  <span>Start Agent</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Options */}
        {showOptions && (
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-in fade-in">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Model Engine</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (Balanced & Multimodal)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks & High Thinking)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Low-Latency Rapid Tasks)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Reasoning Level</label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={highThinking}
                    onChange={(e) => setHighThinking(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Enable Thinking Level: HIGH</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div>
          <span className="text-[11px] font-medium text-slate-400 block mb-2">Try quick autonomous recipes:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {samplePrompts.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between group"
                >
                  <div
                    onClick={() => setCommand(s.prompt)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 group-hover:text-cyan-400 mb-1">
                      <Icon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{s.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{s.prompt}</p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => setCommand(s.prompt)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      Fill Input
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmit(undefined, s.prompt)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      <span>Run Now</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
};
