
import React, { useRef, useState, useEffect } from 'react';
import { InvoiceDetails, AggregatedItem } from '../types';
import { 
  User, MapPin, Hash, Calendar, Save, ImagePlus, X, PieChart, Check, 
  Trash2, Edit2, ListChecks, CloudUpload, Info, RefreshCcw 
} from 'lucide-react';

interface Props {
  details: InvoiceDetails;
  items: AggregatedItem[];
  isSaving: boolean;
  isGeneratingSummary: boolean;
  onChange: (details: InvoiceDetails) => void;
  onUpdateItem: (id: string, updates: Partial<AggregatedItem>) => void;
  onDeleteItem: (id: string) => void;
  onApplyGlobalRate: () => void;
  onGenerateSummary: () => void;
}

const CURRENCIES = [
  { label: 'USD ($)', value: '$' },
  { label: 'EUR (€)', value: '€' },
  { label: 'GBP (£)', value: '£' },
  { label: 'JPY (¥)', value: '¥' },
  { label: 'AUD ($)', value: 'A$' },
  { label: 'CAD ($)', value: 'C$' },
  { label: 'CHF (Fr)', value: 'Fr' },
  { label: 'CNY (¥)', value: '元' },
  { label: 'INR (₹)', value: '₹' },
  { label: 'BRL (R$)', value: 'R$' },
  { label: 'ZAR (R)', value: 'R' },
  { label: 'SGD ($)', value: 'S$' },
];

const InvoiceBuilder: React.FC<Props> = ({ 
  details, 
  items, 
  isSaving,
  isGeneratingSummary,
  onChange, 
  onUpdateItem, 
  onDeleteItem, 
  onApplyGlobalRate,
  onGenerateSummary
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasUnappliedRate, setHasUnappliedRate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string, field: 'description' | 'project' | 'quantity' } | null>(null);
  const initialRateRef = useRef(details.hourlyRate);

  useEffect(() => {
    if (details.hourlyRate !== initialRateRef.current) {
      setHasUnappliedRate(true);
    } else {
      setHasUnappliedRate(false);
    }
  }, [details.hourlyRate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as any).checked : value;
    
    onChange({ 
      ...details, 
      [name]: (name === 'taxRate' || name === 'hourlyRate') ? parseFloat(val) || 0 : val 
    });
  };

  const handleApply = () => {
    onApplyGlobalRate();
    initialRateRef.current = details.hourlyRate;
    setHasUnappliedRate(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...details, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info & Saving State */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <ListChecks className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Invoice Draft</h2>
            <p className="text-slate-500 text-xs font-medium">Customize your invoice details and line items below.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 transition-opacity duration-500 ${isSaving ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {isSaving ? 'Saving Changes...' : 'Changes Saved'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-8 py-4 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">1. Billing Configuration</h3>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Currency</span>
               <select
                  name="currency"
                  value={details.currency}
                  onChange={handleChange}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.label} value={curr.value}>{curr.label}</option>
                  ))}
                </select>
             </div>
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Global Hourly Rate</span>
               <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">{details.currency}</span>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={details.hourlyRate}
                      onChange={handleChange}
                      className={`bg-white border rounded-lg pl-6 pr-2 py-2 text-xs font-bold w-24 focus:ring-2 outline-none shadow-sm transition-all ${
                          hasUnappliedRate ? 'border-indigo-300 ring-2 ring-indigo-50' : 'border-slate-200 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  <button
                    onClick={handleApply}
                    className={`relative px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg transition-all duration-300 flex items-center gap-2 overflow-hidden ${
                      showSuccess 
                        ? 'bg-green-500 text-white translate-y-0 opacity-100' 
                        : hasUnappliedRate 
                          ? 'bg-indigo-600 text-white scale-105 hover:bg-indigo-700 hover:scale-110 active:scale-95 opacity-100' 
                          : 'opacity-0 pointer-events-none translate-x-4'
                    }`}
                  >
                    <div className={`transition-all duration-300 flex items-center gap-2 ${showSuccess ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                      <Save className="w-3.5 h-3.5" />
                      <span>Apply</span>
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                      <Check className="w-4 h-4" />
                      <span className="ml-1">Success</span>
                    </div>
                  </button>
               </div>
             </div>
          </div>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1: From */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-indigo-600">
                <User className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">Sender (From)</span>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="relative group">
                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
                    details.logoUrl ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 bg-slate-50'
                  }`}
                >
                  {details.logoUrl ? (
                    <img src={details.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <ImagePlus className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter text-center px-1">Add Logo</span>
                    </div>
                  )}
                </button>
                {details.logoUrl && (
                  <button
                    onClick={() => onChange({ ...details, logoUrl: undefined })}
                    className="absolute -top-1 -right-1 bg-white border border-slate-200 rounded-full p-0.5 text-slate-400 hover:text-red-500 shadow-sm transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <input
                  name="senderName"
                  value={details.senderName}
                  onChange={handleChange}
                  placeholder="Your Business Name"
                  className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold"
                />
                <textarea
                  name="senderAddress"
                  value={details.senderAddress}
                  onChange={handleChange}
                  placeholder="Address, Phone, Email..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm h-20 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Column 2: Bill To */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Client (Bill To)</span>
            </div>
            <input
              name="clientName"
              value={details.clientName}
              onChange={handleChange}
              placeholder="Client Name"
              className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold"
            />
            <textarea
              name="clientAddress"
              value={details.clientAddress}
              onChange={handleChange}
              placeholder="Client Address & Contact..."
              className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm h-28 leading-relaxed"
            />
          </div>

          {/* Column 3: Metadata */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Hash className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Reference</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Invoice ID</label>
                <input
                  name="invoiceNumber"
                  value={details.invoiceNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-mono"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Issue Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={details.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={details.dueDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                 <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" name="showProjectSummary" checked={details.showProjectSummary} onChange={handleChange} className="sr-only" />
                    <div className={`w-8 h-4 bg-slate-200 rounded-full transition-colors ${details.showProjectSummary ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                    <div className={`absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${details.showProjectSummary ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                       <PieChart className="w-3 h-3" /> Project Breakdown
                     </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Integrated Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-8 py-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">2. Billable Line Items</h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-sm">
             <Info className="w-3.5 h-3.5 text-indigo-500" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Click values to edit inline</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CloudUpload className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No time entries found</h3>
            <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">
              Upload a Clockify CSV report to automatically populate this section with your tracked work.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="py-4 px-8 font-semibold text-slate-500 text-[10px] uppercase tracking-wider">Description & Project</th>
                  <th className="py-4 px-4 font-semibold text-slate-500 text-[10px] uppercase tracking-wider w-24 text-right">Hours</th>
                  <th className="py-4 px-8 font-semibold text-slate-500 text-[10px] uppercase tracking-wider text-right w-40">Total</th>
                  <th className="py-4 px-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-6 px-8">
                      <div className="flex flex-col gap-1 max-w-md">
                        {editingCell?.id === item.id && editingCell?.field === 'description' ? (
                          <input 
                            autoFocus
                            className="text-sm font-bold bg-white border border-indigo-200 rounded px-2 py-1 outline-none ring-4 ring-indigo-50"
                            value={item.description}
                            onChange={(e) => onUpdateItem(item.id, { description: e.target.value })}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                          />
                        ) : (
                          <div onClick={() => setEditingCell({ id: item.id, field: 'description' })} className="cursor-text font-bold text-slate-900 text-sm flex items-center gap-2 group/field">
                            {item.description}
                            <Edit2 className="w-3 h-3 text-slate-300 opacity-0 group-hover/field:opacity-100 transition-opacity" />
                          </div>
                        )}
                        
                        {editingCell?.id === item.id && editingCell?.field === 'project' ? (
                          <input 
                            autoFocus
                            className="text-[10px] font-black uppercase bg-white border border-indigo-100 rounded px-2 py-0.5 outline-none ring-2 ring-indigo-50"
                            value={item.project}
                            onChange={(e) => onUpdateItem(item.id, { project: e.target.value })}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                          />
                        ) : (
                          <div onClick={() => setEditingCell({ id: item.id, field: 'project' })} className="cursor-pointer text-[10px] text-indigo-600 font-black uppercase tracking-widest flex items-center gap-2 group/field">
                            {item.project}
                            <Edit2 className="w-2.5 h-2.5 text-indigo-300 opacity-0 group-hover/field:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-4 text-right">
                      {editingCell?.id === item.id && editingCell?.field === 'quantity' ? (
                        <input 
                          autoFocus
                          type="number"
                          className="w-16 text-right text-sm font-bold bg-white border border-indigo-200 rounded px-1 outline-none ring-4 ring-indigo-50"
                          value={item.quantity}
                          onChange={(e) => onUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                        />
                      ) : (
                        <div onClick={() => setEditingCell({ id: item.id, field: 'quantity' })} className="cursor-text font-medium text-slate-600 text-sm inline-flex items-center gap-2 justify-end w-full group/field">
                          {item.quantity.toFixed(2)}
                          <Edit2 className="w-2.5 h-2.5 text-slate-300 opacity-0 group-hover/field:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>
                    <td className="py-6 px-8 text-slate-900 text-sm font-black text-right">
                      {details.currency}{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-6 px-4 text-right">
                      <button 
                        onClick={() => onDeleteItem(item.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                        title="Delete Line Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-indigo-600" />
            Executive Summary
          </h3>
          <button
            onClick={onGenerateSummary}
            disabled={isGeneratingSummary || items.length === 0}
            className="flex items-center gap-2 text-xs font-bold bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
            {isGeneratingSummary ? 'Generating AI Content...' : 'Auto-Generate with AI'}
          </button>
        </div>
        <textarea
          value={details.notes}
          onChange={(e) => onChange({ ...details, notes: e.target.value })}
          className="w-full h-32 p-6 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none text-sm leading-relaxed transition-all"
          placeholder="Summarize the work performed for your client here..."
        />
        <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-50">
          <Info className="w-4 h-4 text-blue-500" />
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">This summary will be displayed in the notes section of the PDF.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBuilder;
