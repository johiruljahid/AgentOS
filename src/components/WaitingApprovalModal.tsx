import React, { useState } from 'react';
import { ApprovalRequest } from '../types';
import {
  AlertTriangle,
  CreditCard,
  KeyRound,
  ShieldAlert,
  CheckCircle,
  XCircle,
  HelpCircle,
  X,
  ExternalLink,
  Globe,
  ArrowRight,
} from 'lucide-react';

interface WaitingApprovalModalProps {
  approval: ApprovalRequest | null;
  onClose: () => void;
  onResolve: (approvalId: string, approved: boolean, payload?: any) => Promise<void>;
}

export const WaitingApprovalModal: React.FC<WaitingApprovalModalProps> = ({
  approval,
  onClose,
  onResolve,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  if (!approval) return null;

  const isPayment = approval.type === 'PAYMENT';

  const handleAction = async (approved: boolean) => {
    setIsProcessing(true);
    try {
      await onResolve(approval.id, approved, isPayment ? undefined : { otpCode });
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/50 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 shrink-0">
            {isPayment ? (
              <CreditCard className="w-6 h-6" />
            ) : approval.type === 'OTP' ? (
              <KeyRound className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                {isPayment ? 'Payment Safety Gate' : 'Human-in-the-Loop'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {isPayment ? 'Payment Approval Required' : 'আপনার intervention প্রয়োজন'}
            </h3>
          </div>
        </div>

        {/* Content Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 mb-6 space-y-3.5">
          {isPayment ? (
            <>
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Target Merchant / Website</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  {approval.merchant || 'Online Service Portal'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Requested Amount</span>
                <span className="text-xl font-bold text-cyan-300">
                  {approval.currency === 'EUR' ? '€' : '$'}
                  {approval.amount?.toFixed(2) || '25.00'} {approval.currency || 'EUR'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">What is being purchased</span>
                <span className="text-slate-200 text-right font-medium max-w-[240px] truncate">
                  {approval.purpose || 'Service Subscription or Application Fee'}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Reason: </span>
                {approval.reason || 'AgentOS policy forbids autonomous financial transactions. Explicit user approval is mandatory.'}
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-400">Intervention Type</span>
                <span className="font-semibold text-amber-300">{approval.type || 'HUMAN_VERIFICATION'}</span>
              </div>

              {approval.type === 'OTP' ? (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-medium text-slate-300">
                    ওয়েবসাইট OTP / Verification Code চেয়েছে। আপনার phone বা Gmail-এ আসা কোডটি লিখুন:
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 849201"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-center text-xl tracking-widest font-mono text-white outline-none"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400">
                    টিপস: এজেন্ট গুগল লগইন ট্রাই করে যাতে OTP না লাগে। কিন্তু ম্যানুয়াল OTP লাগলে এখানে এন্টার করুন।
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-indigo-200">
                    <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>CAPTCHA / Security Check Detected</span>
                  </div>
                  <p>
                    ওয়েবসাইটে অ্যান্টি-বট চ্যালেঞ্জ বা CAPTCHA উপস্থিত হয়েছে। Cloud Browser উইন্ডোতে ভেরিফিকেশন সম্পন্ন করে নিচের বাটনে ক্লিক করুন।
                  </p>
                </div>
              )}

              <div className="pt-2 text-xs text-slate-400 border-t border-slate-800">
                <span className="font-semibold text-slate-300">Notice: </span>
                {approval.reason || 'Security controls are never bypassed. Agent safely pauses for human assistance.'}
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAction(false)}
            disabled={isProcessing}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>{isPayment ? 'Reject Payment' : 'Cancel Task'}</span>
          </button>

          <button
            onClick={() => handleAction(true)}
            disabled={isProcessing || (approval.type === 'OTP' && !otpCode.trim())}
            className={`py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2 text-white disabled:opacity-40 ${
              isPayment
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
            }`}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isPayment ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Approve Payment</span>
              </>
            ) : (
              <>
                <span>Continue Task</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
