
import React, { useState, useEffect, useRef } from 'react';
import { TimeEntry, InvoiceDetails, AggregatedItem, InvoiceTemplate, ContactMessage } from './types';
import { parseClockifyCSV, aggregateEntries } from './utils/csvParser';
import { generateInvoiceSummary } from './services/geminiService';
import InvoiceBuilder from './components/InvoiceBuilder';
import InvoicePreview from './components/InvoicePreview';
import ContactModal from './components/ContactModal';
import AdminInbox from './components/AdminInbox';
import AdminAuthModal from './components/AdminAuthModal';
import { FileUp, FileText, Clock, Printer, ArrowRight, MousePointer2, Settings, Layout, Type, ShieldCheck, Zap, UserPlus, HelpCircle, ShieldAlert, Download } from 'lucide-react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-indigo-600 rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform"></div>
    <div className="absolute inset-0 bg-indigo-500 rounded-lg -rotate-3 group-hover:-rotate-6 transition-transform"></div>
    <div className="relative bg-white p-1.5 rounded shadow-sm">
      <div className="relative">
        <FileText className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />
        <Clock className="w-2.5 h-2.5 text-indigo-900 absolute -bottom-0.5 -right-0.5 bg-white rounded-full border border-white" strokeWidth={3} />
      </div>
    </div>
  </div>
);

const TEMPLATES: { id: InvoiceTemplate; label: string; icon: React.ReactNode }[] = [
  { id: 'modern', label: 'Modern', icon: <Layout className="w-4 h-4" /> },
  { id: 'classic', label: 'Classic', icon: <Type className="w-4 h-4" /> },
  { id: 'bold', label: 'Bold', icon: <FileText className="w-4 h-4" /> },
];

const App: React.FC = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'builder' | 'preview' | 'admin'>('upload');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('dockyourclock');
  const [isSaving, setIsSaving] = useState(false);
  
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    senderName: '',
    senderAddress: '',
    clientName: '',
    clientAddress: '',
    notes: 'Thank you for your business!',
    taxRate: 0,
    currency: '$',
    hourlyRate: 50,
    logoUrl: undefined,
    showProjectSummary: false,
    template: 'modern'
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const savedDetails = localStorage.getItem('clock2doc_draft_details');
    if (savedDetails) {
      try {
        setInvoiceDetails(JSON.parse(savedDetails));
      } catch (e) { console.error("Failed to parse saved details", e); }
    }

    const savedAggregated = localStorage.getItem('clock2doc_draft_items');
    if (savedAggregated) {
      try {
        setAggregatedData(JSON.parse(savedAggregated));
      } catch (e) { console.error("Failed to parse saved items", e); }
    }

    const savedMessages = localStorage.getItem('clock2doc_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) { console.error(e); }
    }

    const savedPassword = localStorage.getItem('clock2doc_admin_pwd');
    if (savedPassword) {
      setAdminPassword(savedPassword);
    }
  }, []);

  // Save draft state to localStorage whenever it changes
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (aggregatedData.length > 0 || invoiceDetails.senderName !== '') {
      setIsSaving(true);
      localStorage.setItem('clock2doc_draft_details', JSON.stringify(invoiceDetails));
      localStorage.setItem('clock2doc_draft_items', JSON.stringify(aggregatedData));
      
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setIsSaving(false), 1000);
    }
    
    localStorage.setItem('clock2doc_messages', JSON.stringify(messages));
    localStorage.setItem('clock2doc_admin_pwd', adminPassword);
  }, [invoiceDetails, aggregatedData, messages, adminPassword]);

  // Scroll to top whenever tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const changeTab = (tab: 'upload' | 'builder' | 'preview' | 'admin') => {
    if (activeTab === tab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab(tab);
    }
  };

  const handleAdminClick = () => {
    if (isAuthenticated) {
      changeTab('admin');
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  const onAdminAuthenticated = () => {
    setIsAuthenticated(true);
    changeTab('admin');
  };

  const handleUpdatePassword = (newPwd: string) => {
    setAdminPassword(newPwd);
  };

  const navigateToSection = (sectionId: string) => {
    const doScroll = () => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (activeTab !== 'upload') {
      setActiveTab('upload');
      setTimeout(doScroll, 150);
    } else {
      doScroll();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseClockifyCSV(text);
      setEntries(parsed);
      const aggregated = aggregateEntries(parsed);
      
      const processedAggregated = aggregated.map(item => ({
        ...item,
        rate: item.rate || invoiceDetails.hourlyRate,
        total: item.total || (item.quantity * invoiceDetails.hourlyRate)
      }));

      setAggregatedData(processedAggregated);
      setLoading(false);
      setActiveTab('builder');
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    window.print();
  };

  const handleSendMessage = (data: Omit<ContactMessage, 'id' | 'timestamp' | 'status'>) => {
    const newMessage: ContactMessage = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      status: 'new'
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const clearMessages = () => {
    if (window.confirm("Are you sure you want to clear all messages?")) {
      setMessages([]);
    }
  };

  const applyGlobalRate = () => {
    const updated = aggregatedData.map(item => ({
      ...item,
      rate: invoiceDetails.hourlyRate,
      total: item.quantity * invoiceDetails.hourlyRate
    }));
    setAggregatedData(updated);
  };

  const handleUpdateItem = (id: string, updates: Partial<AggregatedItem>) => {
    setAggregatedData(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        updated.total = updated.quantity * updated.rate;
        return updated;
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Remove this line item?")) {
      setAggregatedData(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleGenerateAISummary = async () => {
    if (entries.length === 0 && aggregatedData.length === 0) return;
    setIsGeneratingSummary(true);
    try {
      const summary = await generateInvoiceSummary(entries);
      setInvoiceDetails(prev => ({ ...prev, notes: summary }));
    } catch (error) {
      console.error("Summary generation failed", error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const calculateSubtotal = () => aggregatedData.reduce((sum, item) => sum + item.total, 0);
  const calculateTax = () => calculateSubtotal() * (invoiceDetails.taxRate / 100);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const handleTemplateChange = (template: InvoiceTemplate) => {
    setInvoiceDetails(prev => ({ ...prev, template }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => changeTab('upload')}>
            <Logo className="w-10 h-10" />
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">Clock2Doc</h1>
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => changeTab('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              1. Import
            </button>
            <button
              onClick={() => changeTab('builder')}
              disabled={aggregatedData.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${aggregatedData.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'builder' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              2. Draft
            </button>
            <button
              onClick={() => changeTab('preview')}
              disabled={aggregatedData.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${aggregatedData.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              3. Review
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleExport} 
              disabled={aggregatedData.length === 0}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm font-bold shadow-lg shadow-slate-200"
            >
              <Printer className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <section className="max-w-4xl mx-auto py-12">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight text-balance pt-12">The Best Clockify Invoice Generator for Freelancers</h2>
              <p className="text-slate-600 text-xl font-medium max-w-2xl mx-auto">
                Transform your Clockify CSV time reports into professional, client-ready PDF invoices in seconds. Completely free.
              </p>
            </div>
            
            <div className="relative mb-12">
              <label className="group relative block w-full rounded-3xl border-2 border-dashed border-slate-300 p-16 text-center hover:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer bg-white shadow-xl hover:shadow-2xl hover:shadow-indigo-100/50">
                <input type="file" className="sr-only" accept=".csv" onChange={handleFileUpload} />
                <FileUp className="mx-auto h-16 w-16 text-slate-400 group-hover:text-indigo-500 transition-all group-hover:-translate-y-2" />
                <span className="mt-6 block text-2xl font-black text-slate-900">
                  Upload your detailed Clockify CSV Report
                </span>
                <span className="mt-3 block text-base text-slate-500 font-medium">
                  Instant billing from your time logs. No data leaves your browser.
                </span>
              </label>
              
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  No Privacy Risks
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                  <UserPlus className="w-4 h-4 text-indigo-500" />
                  No Account Required
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                  <Zap className="w-4 h-4 text-orange-500" />
                  100% Free
                </div>
              </div>
            </div>

            {aggregatedData.length > 0 && (
              <div className="mb-20 bg-white border border-slate-200 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Logo className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Restore Session?</h3>
                    <p className="text-slate-500 text-sm font-medium">We found an existing draft with {aggregatedData.length} items from your last visit.</p>
                  </div>
                </div>
                <button 
                  onClick={() => changeTab('builder')}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3 whitespace-nowrap"
                >
                  Continue Editing <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <div id="privacy-policy" className="prose prose-slate max-w-none mb-20 bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-3xl font-black text-slate-900 mb-6">What is Clock2Doc?</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                <strong>Clock2Doc</strong> is a free online Clockify invoice generator designed specifically for freelancers, consultants, and agencies who need a fast way to bill clients.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                Our tool simplifies your workflow: export your <em>Detailed Report</em> from Clockify as a CSV, upload it here, and instantly generate a beautiful PDF invoice.
              </p>
            </div>

            <div id="how-it-works" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <article className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <span className="text-8xl font-black text-indigo-900 leading-none">1</span>
                </div>
                <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <MousePointer2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 font-black">Export from Clockify</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Go to <span className="font-bold text-slate-700">Detailed Reports</span> in Clockify and click <span className="font-bold text-slate-700">Export &gt; CSV</span>.
                </p>
              </article>

              <article className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <span className="text-8xl font-black text-indigo-900 leading-none">2</span>
                </div>
                <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 font-black">Configure Billing</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Upload the file. Enter your info and set your <span className="font-bold text-slate-700">hourly billable rate</span>.
                </p>
              </article>

              <article className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <span className="text-8xl font-black text-indigo-900 leading-none">3</span>
                </div>
                <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 font-black">Download PDF</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Select a premium theme and download your <span className="font-bold text-slate-700">professional PDF invoice</span>.
                </p>
              </article>
            </div>

            <div id="faq" className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <HelpCircle className="w-8 h-8 text-indigo-600" />
                <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-900 mb-2">Is Clock2Doc free?</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Absolutely. No subscriptions, no hidden costs.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-900 mb-2">Privacy?</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">All file processing happens locally in your browser. We never see your billing data.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <InvoiceBuilder 
                details={invoiceDetails} 
                items={aggregatedData}
                isSaving={isSaving}
                isGeneratingSummary={isGeneratingSummary}
                onChange={setInvoiceDetails} 
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onApplyGlobalRate={applyGlobalRate} 
                onGenerateSummary={handleGenerateAISummary}
              />
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sticky top-24">
                <h3 className="text-lg font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Estimated Totals</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-slate-600 font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">{invoiceDetails.currency}{calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 font-medium">
                    <span>Tax ({invoiceDetails.taxRate}%)</span>
                    <span className="font-bold text-slate-900">{invoiceDetails.currency}{calculateTax().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-6 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Due</span>
                    <span className="text-3xl font-black text-indigo-600 tracking-tight">{invoiceDetails.currency}{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => changeTab('preview')}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
                  >
                    Generate Preview
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tight">Everything looks good? Proceed to review.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="max-w-4xl mx-auto mb-12 animate-in zoom-in duration-300">
            <div className="mb-8 no-print flex justify-center">
              <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm inline-flex items-center gap-2">
                <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 mr-2">Theme</span>
                <div className="flex items-center gap-1.5">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => handleTemplateChange(tmpl.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${invoiceDetails.template === tmpl.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 md:p-16 print-shadow-none overflow-hidden relative">
              <InvoicePreview details={invoiceDetails} items={aggregatedData} subtotal={calculateSubtotal()} tax={calculateTax()} total={calculateTotal()} />
            </div>
            <div className="mt-12 flex justify-center gap-4 no-print">
              <button onClick={() => changeTab('builder')} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 shadow-sm">Back to Editor</button>
              <button onClick={handleExport} className="px-10 py-4 bg-indigo-600 rounded-2xl font-black text-white shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3">
                <Printer className="w-6 h-6" />
                Download PDF
              </button>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <AdminInbox 
            messages={messages} 
            onDeleteMessage={deleteMessage} 
            onClearAll={clearMessages} 
            currentPassword={adminPassword}
            onUpdatePassword={handleUpdatePassword}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-3 opacity-80 group cursor-pointer" onClick={() => changeTab('upload')}>
            <Logo className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-black tracking-tighter uppercase text-slate-900">Clock2Doc</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <button onClick={() => navigateToSection('privacy-policy')} className="hover:text-indigo-600 transition-colors uppercase">Privacy Policy</button>
            <button onClick={() => navigateToSection('how-it-works')} className="hover:text-indigo-600 transition-colors uppercase">How it Works</button>
            <button onClick={() => setIsContactModalOpen(true)} className="hover:text-indigo-600 transition-colors uppercase">Contact</button>
            <div className="w-px h-3 bg-slate-200 mx-2 hidden md:block"></div>
            <button 
              onClick={handleAdminClick}
              className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all border ${activeTab === 'admin' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'hover:text-slate-600 border-transparent hover:border-slate-100'}`}
            >
              <ShieldAlert className="w-3 h-3" />
              Admin Access
            </button>
          </div>
          <p className="text-slate-400 text-sm font-medium">&copy; {new Date().getFullYear()} Clock2Doc &bull; Local Draft Storage Active.</p>
        </div>
      </footer>

      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} onSendMessage={handleSendMessage} />
      <AdminAuthModal isOpen={isAdminAuthModalOpen} onClose={() => setIsAdminAuthModalOpen(false)} onAuthenticated={onAdminAuthenticated} currentPassword={adminPassword} />
    </div>
  );
};

export default App;
