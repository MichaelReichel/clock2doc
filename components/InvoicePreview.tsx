
import React from 'react';
import { InvoiceDetails, AggregatedItem } from '../types';
import { FileText, Clock, PieChart } from 'lucide-react';

interface Props {
  details: InvoiceDetails;
  items: AggregatedItem[];
  subtotal: number;
  tax: number;
  total: number;
}

const Clock2DocLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-indigo-600 rounded-lg"></div>
    <div className="relative bg-white p-1.5 rounded shadow-sm">
      <div className="relative">
        <FileText className="w-6 h-6 text-indigo-600" strokeWidth={2.5} />
        <Clock className="w-3 h-3 text-indigo-900 absolute -bottom-1 -right-1 bg-white rounded-full border border-white" strokeWidth={3} />
      </div>
    </div>
  </div>
);

const InvoicePreview: React.FC<Props> = ({ details, items, subtotal, tax, total }) => {
  // Calculate project breakdown
  const projectSummary = items.reduce((acc, item) => {
    if (!acc[item.project]) {
      acc[item.project] = 0;
    }
    acc[item.project] += item.quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
        <div className="flex-1">
          <div className="flex flex-col gap-6 mb-8">
            {details.logoUrl ? (
              <div className="max-w-[200px] max-h-[80px] mb-4">
                <img src={details.logoUrl} alt="Business Logo" className="max-w-full max-h-full object-contain object-left" />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Clock2DocLogo className="w-12 h-12" />
                <div>
                  <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Invoice</h1>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Generated via Clock2Doc</p>
                </div>
              </div>
            )}
            
            <div className="text-sm">
              <p className="font-bold text-slate-900 text-lg mb-1">{details.senderName}</p>
              <p className="text-slate-600 whitespace-pre-line leading-relaxed">{details.senderAddress}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          {details.logoUrl && (
             <div className="mb-8">
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Invoice</h1>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Invoice ID: {details.invoiceNumber}</p>
            </div>
          )}
          {!details.logoUrl && (
            <div className="mb-8">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Invoice Number</p>
              <p className="text-2xl font-black tracking-tight">{details.invoiceNumber}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-6 text-left md:text-right">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date Issued</p>
              <p className="text-sm font-bold">{details.date}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
              <p className="text-sm font-bold">{details.dueDate}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-0.5 bg-slate-900 w-full mb-12"></div>

      {/* Bill To & Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bill To</p>
          <p className="text-2xl font-black text-slate-900">{details.clientName}</p>
          <p className="text-slate-600 whitespace-pre-line text-sm leading-relaxed max-w-sm">{details.clientAddress}</p>
        </div>
        
        {details.showProjectSummary && (
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
             <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
               <PieChart className="w-3.5 h-3.5" /> 
               Time Breakdown by Project
             </p>
             <div className="space-y-3">
               {Object.entries(projectSummary).map(([proj, hours]) => (
                 <div key={proj} className="flex justify-between items-center text-sm">
                   <span className="font-bold text-slate-700 truncate mr-4">{proj}</span>
                   {/* Fix: cast hours to number as Object.entries might return unknown values in strict environments */}
                   <span className="font-black text-slate-900 whitespace-nowrap bg-white px-2 py-0.5 rounded-lg border border-slate-100">{(hours as number).toFixed(2)}h</span>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200">
              <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Description</th>
              <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right w-24">Hours</th>
              <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right w-32">Rate</th>
              <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="group">
                <td className="py-6 px-4">
                  <p className="font-bold text-slate-900 text-base">{item.description}</p>
                  <p className="text-xs text-indigo-600 font-bold uppercase mt-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    {item.project}
                  </p>
                </td>
                <td className="py-6 px-4 text-right text-slate-600 font-medium">{item.quantity.toFixed(2)}h</td>
                <td className="py-6 px-4 text-right text-slate-600 font-medium">{details.currency}{item.rate.toFixed(2)}</td>
                <td className="py-6 px-4 text-right font-black text-slate-900">{details.currency}{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Notes */}
      <div className="flex flex-col md:flex-row justify-between gap-16 pt-8 border-t border-slate-100">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Project Summary & Notes</p>
          <div className="text-sm text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100">
            {details.notes || "Professional services rendered for the specified period."}
          </div>
        </div>
        <div className="w-full md:w-80 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Subtotal</span>
            <span className="font-bold text-slate-900">{details.currency}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Tax ({details.taxRate}%)</span>
            <span className="font-bold text-slate-900">{details.currency}{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="pt-6 border-t-2 border-slate-900">
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-black uppercase tracking-tighter">Total Due</span>
              <span className="text-3xl font-black text-indigo-600 tracking-tight">{details.currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-32 pt-12 border-t border-slate-100 flex justify-between items-center opacity-40 grayscale no-print-grayscale">
        <div className="flex items-center gap-2">
          <Clock2DocLogo className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">Clock2Doc</span>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thank you for your business!</p>
      </div>
    </div>
  );
};

export default InvoicePreview;
