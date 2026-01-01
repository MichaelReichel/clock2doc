
import React, { useState } from 'react';
import { X, Send, Mail, MessageSquare, Tag, CheckCircle2 } from 'lucide-react';
import { ContactMessage } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: Omit<ContactMessage, 'id' | 'timestamp' | 'status'>) => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSendMessage }) => {
  const [formData, setFormData] = useState({
    subject: '',
    email: '',
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send data to parent component (App.tsx)
    onSendMessage({
      subject: formData.subject,
      email: formData.email,
      description: formData.description
    });
    
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setFormData({ subject: '', email: '', description: '' });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {submitted ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Message Received!</h2>
            <p className="text-slate-500 font-medium">Thank you. An admin will review your message shortly.</p>
          </div>
        ) : (
          <>
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Contact Support</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Direct message to admins</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    <Tag className="w-3 h-3 text-indigo-500" /> Subject
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Feature request, bug report, question..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    <Mail className="w-3 h-3 text-indigo-500" /> Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Where can we reach you?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    <MessageSquare className="w-3 h-3 text-indigo-500" /> Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Tell us more about what's on your mind..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm leading-relaxed"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Submit Message
              </button>
              
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tight">
                Your message is captured securely for our team.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
