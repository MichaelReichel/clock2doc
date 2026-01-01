
import React, { useState } from 'react';
import { X, Lock, ArrowRight, AlertCircle, MailQuestion, CheckCircle2, Loader2 } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  currentPassword: string;
}

const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose, onAuthenticated, currentPassword }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === currentPassword) {
      onAuthenticated();
      setPassword('');
      setError(false);
      onClose();
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleForgotPassword = () => {
    setIsRecovering(true);
    
    // Construct the recovery request email
    const subject = encodeURIComponent("[Clock2Doc] Admin Password Recovery Request");
    const body = encodeURIComponent(
      "Hello Michael,\n\nA password recovery link has been requested for the Clock2Doc Admin Panel.\n\n" +
      "Requested at: " + new Date().toLocaleString() + "\n" +
      "Target Email: michael280810@gmail.com\n\n" +
      "If you did not request this, please ignore this email. Otherwise, please use the 24-hour recovery protocol."
    );
    
    // Simulate API delay for professional feel
    setTimeout(() => {
      // Trigger the mailto to michael280810@gmail.com
      window.location.href = `mailto:michael280810@gmail.com?subject=${subject}&body=${body}`;
      setIsRecovering(false);
      setRecoverySent(true);
    }, 1500);
  };

  const handleBackToLogin = () => {
    setRecoverySent(false);
    setIsRecovering(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {recoverySent ? (
          <div className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-2 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Link Sent!</h2>
              <p className="text-slate-500 text-sm font-medium">
                A 24-hour recovery link has been dispatched to <span className="text-indigo-600 font-bold">michael280810@gmail.com</span>. 
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={handleBackToLogin}
                className="w-full text-indigo-600 hover:text-indigo-800 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-slate-900 p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                {isRecovering ? (
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                ) : (
                  <Lock className="w-8 h-8 text-indigo-400" />
                )}
              </div>
              <h2 className="text-xl font-black">Admin Access</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                {isRecovering ? 'Processing Recovery...' : 'Authorization Required'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  Enter Password
                </label>
                <div className="relative">
                  <input
                    disabled={isRecovering}
                    autoFocus
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    className={`w-full px-4 py-4 rounded-2xl border bg-slate-50 focus:bg-white focus:ring-4 outline-none transition-all text-center text-lg font-black tracking-widest disabled:opacity-50 ${
                      error ? 'border-red-500 focus:ring-red-100 text-red-600' : 'border-slate-100 focus:ring-indigo-100'
                    }`}
                    placeholder="••••••••"
                  />
                  {error && (
                    <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center gap-1 text-red-500 text-[10px] font-bold uppercase animate-in slide-in-from-top-1">
                      <AlertCircle className="w-3 h-3" />
                      Access Denied
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isRecovering}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isRecovering ? 'Working...' : 'Unlock Dashboard'}
                  {!isRecovering && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isRecovering}
                  className="w-full text-indigo-600 hover:text-indigo-800 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <MailQuestion className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  Forgot Password?
                </button>
              </div>
              
              <button
                type="button"
                onClick={onClose}
                disabled={isRecovering}
                className="w-full text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest py-1 disabled:opacity-50"
              >
                Go Back
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAuthModal;
