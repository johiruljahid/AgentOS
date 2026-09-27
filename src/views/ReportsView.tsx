import React, { useState } from 'react';
import { TaskReport } from '../types';
import {
  FileCheck,
  Calendar,
  CheckCircle2,
  Mail,
  Table,
  ChevronRight,
  Search,
  ExternalLink,
} from 'lucide-react';

interface ReportsViewProps {
  reports: TaskReport[];
  onOpenReport: (reportId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ reports, onOpenReport }) => {
  const [search, setSearch] = useState('');

  const filtered = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Task Reports & Results</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Audit logs and comprehensive results from finished autonomous workflows.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 text-slate-400 text-xs">
          No reports generated yet. When your agent finishes a task, an executive report will be filed here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((report) => (
            <div
              key={report.id}
              onClick={() => onOpenReport(report.id)}
              className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Completed</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(report.completedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors line-clamp-1 mb-2">
                  {report.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {report.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {report.details.stepsExecuted || 5} steps executed
                </span>
                <span className="text-cyan-400 font-semibold group-hover:underline flex items-center gap-1">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
