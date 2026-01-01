
import React, { useState } from 'react';
import { ContactMessage } from '../types';
import { Mail, Clock, Trash2, Inbox, ShieldCheck, ExternalLink, KeyRound, ShieldAlert, Check } from 'lucide-react';

interface AdminInboxProps {
  messages: ContactMessage[];
  onDeleteMessage: (id: string) => void;
  onClearAll: () => void;
  currentPassword: string;
  onUpdatePassword: (newPwd: string) => void;
}

const AdminInbox: React.FC<AdminInboxProps> = ({ messages, onDeleteMessage, onClearAll, currentPassword, onUpdatePassword }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [pwdForm, setPwdForm] = useState({ old: '', new: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.old !== currentPassword) {
      setPwdError("Current password is incorrect.");
      return;
    }
    if (pwdForm.new !== pwdForm.confirm) {
      setPwdError("Passwords do not match.");
      return;
    }
    if (pwdForm.new.length < 4) {
      setPwdError("Password must be at least 4 characters.");
      return;
    }

    onUpdatePassword(pwdForm.new);
    setPwdSuccess(true);
    setPwdForm({ old: '', new: '', confirm: '' });
    setPwdError('');
    setTimeout(() => setPwdSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Admin Workspace</h2>
          <p className="text-indigo-100 font-medium mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> 
            Welcome Back, Michael.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${showSettings ? 'bg-white text-indigo-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            <KeyRound className="w-4 h-4" /> Security
          </button>
          <div className="h-8 w-px bg-white/20 mx-1"></div>
          {messages.length > 0 && (
            <button 
              onClick={onClearAll}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-none">Password Management</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Update site access credentials</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Current Password</label>
              <input 
                type="password"
                required
                value={pwdForm.old}
                onChange={e => setPwdForm({...pwdForm, old: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white outline-none transition-all text-sm font-bold"
                placeholder="Old Password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">New Password</label>
              <input 
                type="password"
                required
                value={pwdForm.new}
                onChange={e => setPwdForm({...pwdForm, new: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white outline-none transition-all text-sm font-bold"
                placeholder="New Password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Confirm New Password</label>
              <div className="flex gap-3">
                <input 
                  type="password"
                  required
                  value={pwdForm.confirm}
                  onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white outline-none transition-all text-sm font-bold"
                  placeholder="Confirm New"
                />
                <button 
                  type="submit"
                  className={`px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${pwdSuccess ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  {pwdSuccess ? <Check className="w-5 h-5" /> : 'Update'}
                </button>
              </div>
            </div>
            {pwdError && (
              <div className="md:col-span-3 text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-3 h-3" /> {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div className="md:col-span-3 text-green-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Check className="w-3 h-3" /> Password updated successfully!
              </div>
            )}
          </form>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Your inbox is clear!</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2 font-medium">Captured customer messages will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4">Latest Inquiries ({messages.length})</h3>
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {msg.subject}
                    </span>
                    <span className="text-slate-300 text-xs flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3" /> {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-black">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {msg.email || "Anonymous User"}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-50">
                      {msg.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-start">
                   {msg.email && (
                     <a 
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                      className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Reply"
                     >
                        <ExternalLink className="w-5 h-5" />
                     </a>
                   )}
                   <button 
                    onClick={() => onDeleteMessage(msg.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                   >
                    <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminInbox;
