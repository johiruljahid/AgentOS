import React from 'react';
import {
  BookOpen,
  Cloud,
  Shield,
  Key,
  Database,
  Layers,
  Cpu,
  Terminal,
  Server,
  Lock,
} from 'lucide-react';

export const SetupDocsView: React.FC = () => {
  const steps = [
    {
      num: 1,
      title: 'Google Cloud Project Creation',
      desc: 'Create or select a dedicated Google Cloud project (e.g. gen-lang-client-0940395063) to host APIs and Cloud Run.',
    },
    {
      num: 2,
      title: 'Enable Required Google APIs',
      desc: 'Enable Google Drive API, Gmail API, Google Calendar API, Google Sheets API, Google Docs API, Google Slides API, Google Tasks API, People API, and Cloud Tasks API.',
    },
    {
      num: 3,
      title: 'Configure OAuth Consent Screen',
      desc: 'Set up OAuth consent with application name AgentOS, support email, and authorize the requested Workspace scopes.',
    },
    {
      num: 4,
      title: 'Configure Google OAuth Credentials',
      desc: 'Generate Web Application Client ID and secret for Firebase Authentication with popup support.',
    },
    {
      num: 5,
      title: 'Configure Firebase Project',
      desc: 'Link Firebase to your Google Cloud project and enable Google Sign-In under Authentication Providers.',
    },
    {
      num: 6,
      title: 'Configure Cloud Firestore',
      desc: 'Provision Cloud Firestore in production mode with database ID ai-studio-398e62da-c125-4781-9f9e-53a1145e861d.',
    },
    {
      num: 7,
      title: 'Configure Google Cloud Run',
      desc: 'Deploy the full-stack container running server.ts with Node 22 on port 3000.',
    },
    {
      num: 8,
      title: 'Configure Cloud Tasks Queue',
      desc: 'Set up asynchronous task queue for backend daemon execution and retries.',
    },
    {
      num: 9,
      title: 'Configure Gemini API',
      desc: 'Set GEMINI_API_KEY from Google AI Studio Secrets with access to gemini-3.5-flash and gemini-3.1-pro-preview.',
    },
    {
      num: 10,
      title: 'Configure Secret Manager',
      desc: 'Safeguard server credentials and never expose refresh tokens or private keys to the client.',
    },
    {
      num: 11,
      title: 'Configure Required Google Workspace Scopes',
      desc: 'Ensure drive.file, gmail.send, calendar, spreadsheets, and documents scopes are registered.',
    },
    {
      num: 12,
      title: 'Configure Authorized Redirect & Origins',
      desc: 'Add the Cloud Run URL and development domains to Firebase Auth authorized domains.',
    },
    {
      num: 13,
      title: 'Deploy Frontend',
      desc: 'Build frontend with npm run build for high-performance static asset delivery.',
    },
    {
      num: 14,
      title: 'Deploy Backend Daemon',
      desc: 'Run server.ts Express daemon to handle background execution even after browser disconnects.',
    },
    {
      num: 15,
      title: 'Configure Production Environment Variables',
      desc: 'Inject GEMINI_API_KEY and APP_URL via Cloud Run environment secrets.',
    },
    {
      num: 16,
      title: 'Enforce Firestore Security Rules',
      desc: 'Deploy firestore.rules ensuring strict multi-tenant isolation under /users/{userId}/... paths.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Cloud Infrastructure & Architecture Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Step-by-step engineering documentation for production multi-tenant Google Cloud deployment.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex items-start gap-4">
        <Server className="w-6 h-6 text-cyan-400 shrink-0 mt-1" />
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-white">Full Autonomous Backend Engine Active</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The frontend acts strictly as a control center. Tasks are committed to Cloud Firestore and processed by
            the backend execution daemon. Users can safely shut down their devices while tasks continue to completion.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((s) => (
          <div
            key={s.num}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md flex items-start gap-3.5"
          >
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/20">
              {s.num}
            </div>
            <div>
              <h4 className="font-semibold text-xs sm:text-sm text-slate-100 mb-1">{s.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
