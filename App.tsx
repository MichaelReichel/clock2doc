
import React, { useState } from 'react';
import { TimeEntry, InvoiceDetails, AggregatedItem, InvoiceTemplate } from './types';
import { parseClockifyCSV, aggregateEntries } from './utils/csvParser';
import { generateInvoiceSummary } from './services/geminiService';
import InvoiceBuilder from './components/InvoiceBuilder';
import InvoicePreview from './components/InvoicePreview';
import { FileUp, FileText, Clock, Printer, RefreshCcw, ArrowRight, MessageSquareText, Download, MousePointer2, Settings, Layout, Type, ShieldCheck, Zap, UserPlus, HelpCircle } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'upload' | 'builder' | 'preview'>('upload');
  
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

  const applyGlobalRate = () => {
    const updated = aggregatedData.map(item => ({
      ...item,
      rate: invoiceDetails.hourlyRate,
      total: item.quantity * invoiceDetails.hourlyRate
    }));
    setAggregatedData(updated);
  };

  const handleGenerateAISummary = async () => {
    if (entries.length === 0) return;
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
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('upload')}>
            <Logo className="w-10 h-10" />
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">Clock2Doc</h1>
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              1. Import
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              disabled={entries.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${entries.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'builder' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              2. Draft
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              disabled={entries.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${entries.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              3. Review
            </button>
          </nav>
          <div>
            <button 
              onClick={() => window.print()} 
              disabled={entries.length === 0}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm font-bold"
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
            
            <div className="relative mb-20">
              <label className="group relative block w-full rounded-3xl border-2 border-dashed border-slate-300 p-16 text-center hover:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer bg-white shadow-xl hover:shadow-2xl hover:shadow-indigo-100/50">
                <input type="file" className="sr-only" accept=".csv" onChange={handleFileUpload} />
                <FileUp className="mx-auto h-16 w-16 text-slate-400 group-hover:text-indigo-500 transition-all group-hover:-translate-y-2" />
                <span className="mt-6 block text-2xl font-black text-slate-900">
                  Upload your Clockify CSV Report
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

            {/* Content for SEO: What is Clock2Doc? */}
            <div className="prose prose-slate max-w-none mb-20 bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-3xl font-black text-slate-900 mb-6">What is Clock2Doc?</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                <strong>Clock2Doc</strong> is a free online Clockify invoice generator designed specifically for freelancers, consultants, and agencies who need a fast way to bill clients. Clockify is an amazing time tracker, but creating a professional invoice from your reports can sometimes feel like an extra hurdle. 
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                Our tool simplifies your workflow: export your <em>Detailed Report</em> from Clockify as a CSV, upload it here, and instantly generate a beautiful PDF invoice. With built-in AI summaries and customizable templates, you can send professional invoices in under a minute without manual data entry or expensive accounting software.
              </p>
            </div>

            {/* Instruction Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <article className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <span className="text-8xl font-black text-indigo-900 leading-none">1</span>
                </div>
                <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <MousePointer2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 font-black">Export from Clockify</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Go to <span className="font-bold text-slate-700">Detailed Reports</span> in Clockify, filter your dates, and click <span className="font-bold text-slate-700">Export > CSV</span>.
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
                  Upload the file above. Enter your business info and set your <span className="font-bold text-slate-700">hourly billable rate</span> to apply to all logged hours.
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
                  Select from our premium themes and download your <span className="font-bold text-slate-700">professional PDF invoice</span>. Ready to send immediately.
                </p>
              </article>
            </div>

            {/* FAQ Section for SEO */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <HelpCircle className="w-8 h-8 text-indigo-600" />
                <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-900 mb-2">Can I create an invoice directly from Clockify?</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Yes, but it usually requires a paid subscription. Clock2Doc offers a free alternative by using the CSV export feature available to all users.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-900 mb-2">Is Clock2Doc free to use?</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Absolutely. We built this as a utility for the community. No subscriptions, no signups, no hidden costs.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-900 mb-2">Does my data get uploaded to a server?</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">No. All file processing and invoice generation happens locally in your browser. We never see your data.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-900 mb-2">What file formats are supported?</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">We support the standard CSV 'Detailed Report' export from Clockify. This ensures maximum accuracy for your billed tasks.</p>
                </div>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm flex items-center justify-center gap-2 text-center">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Secure local processing &bull; Private by Design &bull; Optimized for Speed
            </p>
          </section>
        )}

        {activeTab === 'builder' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <InvoiceBuilder 
              details={invoiceDetails} 
              onChange={setInvoiceDetails} 
              onApplyGlobalRate={applyGlobalRate}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Invoice Line Items</h3>
                    <button 
                      onClick={() => setActiveTab('upload')}
                      className="text-slate-400 hover:text-indigo-600 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <RefreshCcw className="w-4 h-4" /> Import New CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="py-3 px-2 font-semibold text-slate-500 text-xs uppercase tracking-wider">Work Item / Task</th>
                          <th className="py-3 px-2 font-semibold text-slate-500 text-xs uppercase tracking-wider w-24">Hours</th>
                          <th className="py-3 px-2 font-semibold text-slate-500 text-xs uppercase tracking-wider w-24">Rate</th>
                          <th className="py-3 px-2 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right w-32">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {aggregatedData.map((item) => (
                          <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-2">
                              <div className="font-semibold text-slate-900">{item.description}</div>
                              <div className="text-xs text-indigo-600 font-medium uppercase mt-0.5">{item.project}</div>
                            </td>
                            <td className="py-4 px-2 text-slate-600 text-sm font-medium">{item.quantity.toFixed(2)}</td>
                            <td className="py-4 px-2 text-slate-600 text-sm font-medium">{invoiceDetails.currency}{item.rate.toFixed(2)}</td>
                            <td className="py-4 px-2 text-slate-900 text-sm font-bold text-right">{invoiceDetails.currency}{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <MessageSquareText className="w-5 h-5 text-indigo-600" />
                      Executive Service Summary
                    </h3>
                    <button
                      onClick={handleGenerateAISummary}
                      disabled={isGeneratingSummary || entries.length === 0}
                      className="flex items-center gap-2 text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      <RefreshCcw className={`w-3 h-3 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
                      {isGeneratingSummary ? 'Generating AI Summary...' : 'Auto-Generate with AI'}
                    </button>
                  </div>
                  <textarea
                    value={invoiceDetails.notes}
                    onChange={(e) => setInvoiceDetails(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 text-sm leading-relaxed outline-none"
                    placeholder="Provide a summary of the project work or additional notes..."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Invoice Totals</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold">{invoiceDetails.currency}{calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <span>Tax Rate</span>
                        <input
                          type="number"
                          value={invoiceDetails.taxRate}
                          onChange={(e) => setInvoiceDetails(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                          className="w-16 px-2 py-1 rounded border border-slate-200 text-xs text-right outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span>%</span>
                      </div>
                      <span className="font-semibold">{invoiceDetails.currency}{calculateTax().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                      <div className="flex justify-between text-2xl font-black text-slate-900">
                        <span>Total Due</span>
                        <span className="text-indigo-600">{invoiceDetails.currency}{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('preview')}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
                >
                  Review and Finalize
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="max-w-4xl mx-auto mb-12 animate-in zoom-in duration-300">
            {/* Theme Selector inside Preview Tab */}
            <div className="mb-8 no-print flex justify-center">
              <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm inline-flex items-center gap-2">
                <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 mr-2">Invoice Theme</span>
                <div className="flex items-center gap-1.5">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => handleTemplateChange(tmpl.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
                        invoiceDetails.template === tmpl.id 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-105' 
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {tmpl.icon}
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 md:p-16 print-shadow-none overflow-hidden relative">
              <InvoicePreview 
                details={invoiceDetails} 
                items={aggregatedData} 
                subtotal={calculateSubtotal()}
                tax={calculateTax()}
                total={calculateTotal()}
              />
            </div>
            
            <div className="mt-12 flex justify-center gap-4 no-print">
              <button
                onClick={() => setActiveTab('builder')}
                className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                Back to Editor
              </button>
              <button
                onClick={() => window.print()}
                className="px-10 py-4 bg-indigo-600 rounded-2xl font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3"
              >
                <Printer className="w-6 h-6" />
                Download PDF Invoice
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-3 opacity-80 group cursor-pointer" onClick={() => setActiveTab('upload')}>
            <Logo className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-black tracking-tighter uppercase text-slate-900">Clock2Doc</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">FAQ</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} Clock2Doc &bull; The world's fastest free Clockify to Invoice tool.
            <br />
            Built for privacy, speed, and professional excellence.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
