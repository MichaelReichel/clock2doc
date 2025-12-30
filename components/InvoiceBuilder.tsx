
import React, { useRef } from 'react';
import { InvoiceDetails } from '../types';
import { User, MapPin, Hash, Calendar, Save, ImagePlus, X, PieChart } from 'lucide-react';

interface Props {
  details: InvoiceDetails;
  onChange: (details: InvoiceDetails) => void;
  onApplyGlobalRate: () => void;
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

const InvoiceBuilder: React.FC<Props> = ({ details, onChange, onApplyGlobalRate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as any).checked : value;
    
    onChange({ 
      ...details, 
      [name]: (name === 'taxRate' || name === 'hourlyRate') ? parseFloat(val) || 0 : val 
    });
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

  const removeLogo = () => {
    onChange({ ...details, logoUrl: undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-100 px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Document Header</h3>
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
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Hourly Rate</span>
             <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">{details.currency}</span>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={details.hourlyRate}
                    onChange={handleChange}
                    className="bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold w-24 focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm"
                  />
                </div>
                <button
                  onClick={onApplyGlobalRate}
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-indigo-700 active:bg-indigo-800 transition-all flex items-center gap-2 uppercase tracking-wider shadow-sm"
                >
                  <Save className="w-3 h-3" />
                  Apply Changes
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
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
                  onClick={removeLogo}
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
                  <input
                    type="checkbox"
                    name="showProjectSummary"
                    checked={details.showProjectSummary}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-8 h-4 bg-slate-200 rounded-full transition-colors ${details.showProjectSummary ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                  <div className={`absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${details.showProjectSummary ? 'translate-x-4' : ''}`}></div>
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                     <PieChart className="w-3 h-3" /> Project Breakdown
                   </span>
                </div>
              </label>
              <p className="text-[9px] text-slate-400 mt-1 font-medium italic">Summarize total hours by project at the top of the invoice.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBuilder;
