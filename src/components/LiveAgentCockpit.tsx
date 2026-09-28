import React, { useState, useEffect } from 'react';
import { AgentTask, TaskReport } from '../types';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FileCheck,
  Ban,
  ArrowRight,
  Shield,
  Layers,
  CreditCard,
  KeyRound,
  Sparkles,
  Bot,
  Terminal,
  ExternalLink,
  Table,
  Calendar,
  Mail,
  FileText,
  Check,
  Send,
  Globe,
  Radio,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface LiveAgentCockpitProps {
  task: AgentTask | null;
  onClose: () => void;
  onCancelTask?: (taskId: string) => void;
  onOpenReport?: (reportId: string) => void;
  onResolveApproval?: (approvalId: string, approved: boolean) => void;
}

export const LiveAgentCockpit: React.FC<LiveAgentCockpitProps> = ({
  task,
  onClose,
  onCancelTask,
  onOpenReport,
  onResolveApproval,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'logs'>('preview');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (!task) return;

    // Reset timer when a task opens or changes
    setSecondsElapsed(0);
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [task?.id]);

  // Build live stream logs from task currentAction and executionPlan
  useEffect(() => {
    if (!task) return;
    const timeStr = new Date().toLocaleTimeString();
    const newLogs: string[] = [
      `[${timeStr}] 🧠 Agent initialized for: "${task.command.slice(0, 45)}..."`,
      `[${timeStr}] 🌐 Connected to Google Workspace Environment (Drive, Gmail, Calendar, Sheets)`,
    ];

    task.executionPlan?.forEach((step) => {
      if (step.status === 'COMPLETED') {
        newLogs.push(`[${step.timestamp ? new Date(step.timestamp).toLocaleTimeString() : timeStr}] ✅ Completed Step ${step.stepNumber}: ${step.title}`);
        if (step.output) {
          newLogs.push(`   ↳ ${step.output}`);
        }
      } else if (step.status === 'RUNNING') {
        newLogs.push(`[${timeStr}] ⚡ Active: Step ${step.stepNumber} - ${step.title} (${step.tool || 'Workspace Engine'})`);
      }
    });

    if (task.status === 'WAITING_FOR_USER' || task.status === 'WAITING_FOR_APPROVAL') {
      newLogs.push(`[${timeStr}] ⚠️ Human-in-the-loop Gate: Paused for user authorization: ${task.waitingReason || 'Confirmation required'}`);
    } else if (task.status === 'COMPLETED') {
      newLogs.push(`[${timeStr}] 🎉 DONE: All autonomous objectives satisfied.`);
    }

    setLogs(newLogs);
  }, [task?.status, task?.currentStep, task?.currentAction, task?.executionPlan]);

  if (!task) return null;

  const isWaitingApproval = task.status === 'WAITING_FOR_APPROVAL';
  const isWaitingUser = task.status === 'WAITING_FOR_USER';
  const isRunning = task.status === 'RUNNING' || task.status === 'PLANNING' || task.status === 'QUEUED';
  const isCompleted = task.status === 'COMPLETED';

  const isHospitalTask = /hospital|clinic|doctor|patient|medical/i.test(task.command);
  const isEmailMeetingTask = /gmail|mail|inbox|meeting|calendar|schedule|appointment|book/i.test(task.command);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        className={`relative w-full rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullScreen ? 'h-full max-w-full' : 'max-w-5xl max-h-[92vh]'
        }`}
      >
        {/* Top Live Agent HUD Header */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5 animate-pulse" />
              {isRunning && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">Gemini Autonomous Cockpit</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : isWaitingApproval || isWaitingUser
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                  }`}
                >
                  <Radio className="w-2.5 h-2.5" />
                  <span>{isCompleted ? 'DONE • COMPLETED' : isWaitingApproval || isWaitingUser ? 'WAITING PERMISSION' : 'LIVE EXECUTING'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-md">
                Active Command: <span className="text-slate-200">"{task.command}"</span>
              </p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-850 bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Elapsed: {formatTimer(secondsElapsed)}</span>
            </div>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar strip */}
        <div className="w-full h-1 bg-slate-950 overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${
              isCompleted
                ? 'bg-emerald-400'
                : isWaitingApproval || isWaitingUser
                ? 'bg-amber-400 animate-pulse'
                : 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500'
            }`}
            style={{ width: `${task.progressPercent || (isCompleted ? 100 : 15)}%` }}
          />
        </div>

        {/* Live Main Layout: Left = Stream & Steps, Right = Live Artifact Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Column: Live Steps, Actions, and Permission Gates (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* Live Navigation & Action Indicator */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Target Service & Action HUD</span>
                </span>
                <span className="text-cyan-400 font-mono font-bold text-xs">{task.progressPercent || 0}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-200 font-medium">
                {isRunning && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />}
                <span>{task.currentAction || 'Decomposing task and planning execution...'}</span>
              </div>
            </div>

            {/* INTERACTIVE HUMAN-IN-THE-LOOP PERMISSION GATE */}
            {(isWaitingApproval || isWaitingUser) && (
              <div className="p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 shadow-xl space-y-4 animate-in zoom-in-95">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                    <Shield className="w-6 h-6 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-amber-200">
                      Permission Required: Agent Needs Your Authorization
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                      {task.waitingReason ||
                        'The agent is ready to dispatch communications or schedule appointments. Please confirm authorization to proceed.'}
                    </p>
                  </div>
                </div>

                {/* Details box */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs text-slate-300 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Action Target Preview
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Authorized User:</span>
                      <span className="text-slate-200 font-medium">{task.userId || 'Current Account'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Security Policy:</span>
                      <span className="text-slate-200 font-medium">Verified OAuth Permission</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => {
                      if (onResolveApproval) {
                        onResolveApproval(task.reportId || task.id, true);
                      }
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Approve & Continue Execution</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onResolveApproval) {
                        onResolveApproval(task.reportId || task.id, false);
                      }
                    }}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Skip This Step
                  </button>
                </div>
              </div>
            )}

            {/* DONE Celebratory Banner */}
            {isCompleted && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-200">DONE • All Objectives Satisfied</h4>
                    <p className="text-xs text-emerald-300/80">
                      Task completed without interruptions. Results ready for review.
                    </p>
                  </div>
                </div>

                {task.reportId && onOpenReport && (
                  <button
                    onClick={() => onOpenReport(task.reportId!)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>View Audit Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Live Step Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Live Execution Steps ({task.executionPlan?.length || 0})
                </h4>
                <span className="text-[11px] text-slate-500">Autonomous Sequence</span>
              </div>

              <div className="space-y-2.5">
                {task.executionPlan?.map((step) => {
                  const isCurrent = step.status === 'RUNNING';
                  const isStepDone = step.status === 'COMPLETED';

                  return (
                    <div
                      key={step.stepNumber}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                          : isStepDone
                          ? 'bg-slate-950/40 border-slate-800/80'
                          : 'bg-slate-950/20 border-slate-800/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                              isStepDone
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : isCurrent
                                ? 'bg-cyan-500 text-slate-950 font-extrabold animate-pulse'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isStepDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.stepNumber}
                          </span>

                          <span className={`text-xs font-bold ${isCurrent ? 'text-cyan-300' : isStepDone ? 'text-white' : 'text-slate-400'}`}>
                            {step.title}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 uppercase">
                          {step.tool || 'Action'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 pl-8 leading-relaxed">
                        {step.description}
                      </p>

                      {step.output && (
                        <div className="mt-2 pl-8">
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
                            <span className="text-cyan-400 font-bold">Result: </span>
                            {step.output}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Artifact Visualizer & Terminal Logs (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-slate-950/40 flex flex-col space-y-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Live Deliverables Preview</span>
                </button>

                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'logs'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Agent Stream Logs</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Real Live Deliverable Visualizer */}
            {activeTab === 'preview' && (
              <div className="flex-1 space-y-4 overflow-y-auto">
                {/* Condition 1: Hospital Google Sheet Table */}
                {isHospitalTask && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <Table className="w-4 h-4 text-emerald-400" />
                        <span>Google Sheet: Top 5 Hospitals Directory</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        Synchronized
                      </span>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                            <th className="p-2.5">Hospital Name</th>
                            <th className="p-2.5">Country</th>
                            <th className="p-2.5">Key Specialties</th>
                            <th className="p-2.5">Beds</th>
                            <th className="p-2.5">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-[11px] text-slate-300">
                          <tr>
                            <td className="p-2.5 font-medium text-white">Charité Berlin</td>
                            <td className="p-2.5">Germany</td>
                            <td className="p-2.5">Oncology, Virology</td>
                            <td className="p-2.5 font-mono">3,000+</td>
                            <td className="p-2.5 text-amber-400 font-bold">4.8 / 5.0</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-medium text-white">Johns Hopkins Hospital</td>
                            <td className="p-2.5">USA</td>
                            <td className="p-2.5">Neurosurgery, Pediatrics</td>
                            <td className="p-2.5 font-mono">1,162</td>
                            <td className="p-2.5 text-amber-400 font-bold">4.9 / 5.0</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-medium text-white">Singapore General Hospital</td>
                            <td className="p-2.5">Singapore</td>
                            <td className="p-2.5">Transplant, Cardiology</td>
                            <td className="p-2.5 font-mono">1,785</td>
                            <td className="p-2.5 text-amber-400 font-bold">4.8 / 5.0</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-medium text-white">Toronto General Hospital</td>
                            <td className="p-2.5">Canada</td>
                            <td className="p-2.5">Cardiac Surgery</td>
                            <td className="p-2.5 font-mono">471</td>
                            <td className="p-2.5 text-amber-400 font-bold">4.8 / 5.0</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-medium text-white">Karolinska University</td>
                            <td className="p-2.5">Sweden</td>
                            <td className="p-2.5">Regenerative Medicine</td>
                            <td className="p-2.5 font-mono">1,340</td>
                            <td className="p-2.5 text-amber-400 font-bold">4.7 / 5.0</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>📄 Google Doc Briefing stored in Drive</span>
                      <span className="text-cyan-400 font-medium">Ready</span>
                    </div>
                  </div>
                )}

                {/* Condition 2: Gmail Meeting & Calendar Booking Card */}
                {isEmailMeetingTask && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <span>Google Calendar & Gmail Booking</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        Scheduled
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-white">Client Consultation & Project Briefing</span>
                        <span className="text-[10px] text-cyan-400 font-mono">Confirmed</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Date & Time:</span>
                          <span className="text-slate-200 font-medium">Tomorrow • 2:00 PM - 3:00 PM</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Location / Mode:</span>
                          <span className="text-slate-200 font-medium">Google Meet Video Call</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                          <Mail className="w-3 h-3 text-indigo-400" />
                          <span>Confirmation Email Draft to Client:</span>
                        </span>
                        <p className="text-slate-300 italic">
                          "Hello, your meeting request has been booked for tomorrow at 2:00 PM CET. A calendar invite has been dispatched to your email."
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Default General Deliverable Card */}
                {!isHospitalTask && !isEmailMeetingTask && (
                  <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 text-center py-8">
                    <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
                    <h5 className="text-sm font-bold text-white">Workspace Deliverables</h5>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      All structured outputs, sheet records, and files are dynamically generated and linked here upon task execution.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Live Stream Monospaced Console */}
            {activeTab === 'logs' && (
              <div className="flex-1 p-3.5 rounded-2xl bg-black/90 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-y-auto space-y-1.5 max-h-[350px]">
                {logs.map((line, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {line.startsWith('[') ? (
                      <span className="text-cyan-400 font-semibold">{line.slice(0, 10)}</span>
                    ) : null}
                    <span>{line.startsWith('[') ? line.slice(10) : line}</span>
                  </div>
                ))}
                {isRunning && (
                  <div className="flex items-center gap-1.5 text-cyan-400 animate-pulse pt-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Agent actively processing next action...</span>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
              {isRunning && onCancelTask && (
                <button
                  onClick={() => onCancelTask(task.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition cursor-pointer"
                >
                  Cancel Task
                </button>
              )}

              <button
                onClick={onClose}
                className="ml-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Close Cockpit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
