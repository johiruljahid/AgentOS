import React, { useState } from 'react';
import { TaskReport } from '../types';
import { useAuth } from '../context/AuthContext';
import { googleWorkspace } from '../lib/google-services';
import {
  X,
  FileCheck,
  CheckCircle2,
  Calendar,
  Mail,
  Table,
  Paperclip,
  Share2,
  Download,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface ReportViewerModalProps {
  report: TaskReport | null;
  onClose: () => void;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({ report, onClose }) => {
  const { accessToken } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [docExportUrl, setDocExportUrl] = useState<string | null>(null);

  if (!report) return null;

  const handleExportToGoogleDocs = async () => {
    if (!accessToken) return;
    setIsExporting(true);
    try {
      const docId = await googleWorkspace.createDocReport(
        accessToken,
        report.title,
        `${report.summary}\n\nActions Taken:\n${report.details.actionsTaken?.map((a) => `- ${a}`).join('\n')}\n\nNext Actions:\n${report.nextActions?.map((n) => `- ${n}`).join('\n')}`
      );
      if (docId) {
        setDocExportUrl(`https://docs.google.com/document/d/${docId}/edit`);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>TASK COMPLETED</span>
              </span>
              <span className="text-xs text-slate-400">
                {new Date(report.completedAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">{report.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Executive Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Result & Executive Summary
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">{report.summary}</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Steps Executed</span>
              <span className="text-lg font-bold text-slate-200">{report.details.stepsExecuted || 5}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Emails Sent</span>
              <span className="text-lg font-bold text-cyan-400">{report.details.emailsSent || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Sheets Updated</span>
              <span className="text-lg font-bold text-indigo-400">{report.details.sheetsUpdated || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Calendar Events</span>
              <span className="text-lg font-bold text-emerald-400">{report.details.calendarEventsCreated || 0}</span>
            </div>
          </div>

          {/* Attachments Used */}
          {report.attachments && report.attachments.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Documents & Attachments Synchronized</span>
              </h4>
              <div className="space-y-2">
                {report.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-slate-200">{att.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{att.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Services Impact */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Google Workspace Impact
            </h4>
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Gmail: Communication dispatched according to user preferences.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Table className="w-4 h-4 text-indigo-400" />
                <span>Google Sheets: Records added and timestamped in your workspace.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Google Calendar: Follow-up checkpoints scheduled.</span>
              </div>
            </div>
          </div>

          {/* Recommended Next Actions */}
          {report.nextActions && report.nextActions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Autonomous Next Actions
              </h4>
              <ul className="space-y-2">
                {report.nextActions.map((action, i) => (
                  <li
                    key={i}
                    className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2"
                  >
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Google Doc Export Success Feedback */}
          {docExportUrl && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-300">Google Doc Created in your Drive!</span>
              <a
                href={docExportUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-white underline flex items-center gap-1 hover:text-emerald-200"
              >
                <span>Open Google Doc</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={handleExportToGoogleDocs}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Save to Google Docs</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
