import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../lib/firestore-service';
import { UserNotification } from '../types';
import {
  Bot,
  Bell,
  Sparkles,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Menu,
  ChevronDown,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenApprovalModal?: () => void;
  pendingApprovalsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  activeView,
  setActiveView,
  onOpenApprovalModal,
  pendingApprovalsCount = 0,
}) => {
  const { user, profile, agentConfig, signOutUser } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = firestoreService.subscribeNotifications(user.uid, (list) => {
      setNotifications(list);
    });
    return () => unsub();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    if (!user) return;
    for (const n of notifications.filter((x) => !x.isRead)) {
      await firestoreService.markNotificationRead(user.uid, n.id);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Brand + Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                AgentOS
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block -mt-0.5">
              Your Autonomous Personal AI Agent
            </p>
          </div>
        </div>
      </div>

      {/* Center: Agent Engine Status */}
      <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 shadow-inner">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-medium text-slate-200">
          Agent Instance: <span className="text-cyan-400 font-semibold">{agentConfig?.agentName || 'Agent Prime'}</span>
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          {agentConfig?.activeModel || 'gemini-3.5-flash'}
        </span>
      </div>

      {/* Right Controls: Approvals Alert + Notifications + User Profile */}
      <div className="flex items-center gap-3">
        {/* Pending Approval Badge if any */}
        {pendingApprovalsCount > 0 && (
          <button
            onClick={onOpenApprovalModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/25 transition animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Action Required ({pendingApprovalsCount})</span>
          </button>
        )}

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-slate-900" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-slate-100">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/20 text-cyan-300">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-slate-400 hover:text-cyan-400 transition"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 mt-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No notifications yet. When tasks finish, alerts will arrive here.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (user) firestoreService.markNotificationRead(user.uid, n.id);
                        if (n.taskId) setActiveView('tasks');
                        setShowNotifDropdown(false);
                      }}
                      className={`py-3 px-2 rounded-xl cursor-pointer hover:bg-slate-800/50 transition flex items-start gap-3 ${
                        !n.isRead ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          n.type === 'TASK_COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : n.type === 'PAYMENT_REQUIRED'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-indigo-500/20 text-indigo-400'
                        }`}
                      >
                        {n.type === 'TASK_COMPLETED' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{n.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
              {profile?.preferredName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-medium text-slate-300 hidden md:block max-w-[120px] truncate">
              {profile?.preferredName || profile?.fullName || 'User'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-slate-100 truncate">
                  {profile?.fullName || user?.displayName || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-medium">Tenant Isolated</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveView('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  Profile & Agent Persona
                </button>
                <button
                  onClick={() => {
                    setActiveView('instructions');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  Agent Instructions
                </button>
                <button
                  onClick={() => {
                    setActiveView('connections');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  Google Connections
                </button>
                <button
                  onClick={() => {
                    setActiveView('docs');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  Cloud Setup Architecture
                </button>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={signOutUser}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
