import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FolderOpen,
  Mail,
  Calendar,
  Table,
  FileText,
  Presentation,
  CheckSquare,
  Users,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Globe,
  AlertCircle,
} from 'lucide-react';

export const ConnectionsView: React.FC = () => {
  const { user, accessToken, loginWithGoogle } = useAuth();
  const [browserbaseInfo, setBrowserbaseInfo] = useState<{ configured: boolean; projectId: string | null } | null>(null);

  useEffect(() => {
    fetch('/api/browserbase/status')
      .then((r) => r.json())
      .then(setBrowserbaseInfo)
      .catch(() => setBrowserbaseInfo({ configured: false, projectId: null }));
  }, []);

  const services = [
    {
      id: 'drive',
      name: 'Google Drive',
      description: 'Search, index, and retrieve user documents, CVs, and templates.',
      icon: FolderOpen,
      scopes: 'drive.file, drive.readonly',
      connected: !!accessToken,
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Read relevant emails, compose application drafts, and dispatch notifications.',
      icon: Mail,
      scopes: 'gmail.send, gmail.readonly, gmail.compose',
      connected: !!accessToken,
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Check schedule availability, block focus hours, and set up appointments.',
      icon: Calendar,
      scopes: 'calendar, calendar.events',
      connected: !!accessToken,
    },
    {
      id: 'sheets',
      name: 'Google Sheets',
      description: 'Organize job listings, records, and extracted company data into spreadsheets.',
      icon: Table,
      scopes: 'spreadsheets',
      connected: !!accessToken,
    },
    {
      id: 'docs',
      name: 'Google Docs',
      description: 'Generate comprehensive task executive briefings and reports.',
      icon: FileText,
      scopes: 'documents',
      connected: !!accessToken,
    },
    {
      id: 'slides',
      name: 'Google Slides',
      description: 'Format generated presentations and summary slide decks.',
      icon: Presentation,
      scopes: 'presentations',
      connected: !!accessToken,
    },
    {
      id: 'tasks',
      name: 'Google Tasks',
      description: 'Create follow-up checkpoints, reminders, and action checklists.',
      icon: CheckSquare,
      scopes: 'tasks',
      connected: !!accessToken,
    },
    {
      id: 'contacts',
      name: 'Google Contacts',
      description: 'Search verified email addresses and organization information.',
      icon: Users,
      scopes: 'contacts',
      connected: !!accessToken,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Ecosystem Connections</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Automatic unified authorization established via Google Account OAuth & Browserbase cloud automation.
          </p>
        </div>

        <button
          onClick={loginWithGoogle}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh OAuth Consent</span>
        </button>
      </div>

      {/* Account Info Pill */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Authenticated Account</span>
            <span className="text-xs text-slate-400">{user?.email}</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Connected</span>
        </span>
      </div>

      {/* Browserbase Cloud Browser Automation Section */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-500/30 shadow-lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm sm:text-base text-white">Browserbase Cloud Automation</h3>
                {browserbaseInfo?.configured ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span>Setup Required</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Performs cloud browser automation, site navigation, and form submissions with per-task tenant session isolation.
                {browserbaseInfo?.configured
                  ? ` Connected to Project: ${browserbaseInfo.projectId}`
                  : ' Provide BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID in .env to activate live headless browser sessions.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-4 shadow-md"
            >
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-slate-100">{svc.name}</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">{svc.description}</p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Scope: {svc.scopes}</span>
                  <span className="text-slate-400">Client-Side Bearer</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
