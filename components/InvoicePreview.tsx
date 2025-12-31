
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

  const isModern = details.template === 'modern';
  const isClassic = details.template === 'classic';
  const isBold = details.template === 'bold';

  const containerClasses = `
    ${isClassic ? 'font-serif' : 'font-sans'}
    text-slate-900
  `;

  return (
    <div className={containerClasses}>
      {/* Header Section */}
      {isBold && (
        <div className="bg-slate-900 text-white -mx-8 -mt-8 md:-mx-16 md:-mt-16 p-8 md:p-16 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 opacity-20 -mr-32 -mt-32 rounded-full"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Invoice</h1>
              <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm">Ref: {details.invoiceNumber}</p>
            </div>
            <div className="text-left md:text-right flex-shrink-0">
               {details.logoUrl ? (
                <div className="max-h-24 max-w-[280px] flex items-center md:justify-end overflow-hidden">
                  {/* Removed filters that forced monochromatic white silhouette to show actual logo colors */}
                  <img src={details.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <div className="flex items-center gap-3 justify-end">
                   <Clock2DocLogo className="w-10 h-10 ring-2 ring-white/20" />
                   <span className="text-2xl font-black uppercase tracking-tighter">Clock2Doc</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isBold && (
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-8">
              {details.logoUrl ? (
                <div className="max-w-[240px] max-h-[100px] flex items-center overflow-hidden flex-shrink-0">
                  <img src={details.logoUrl} alt="Business Logo" className="max-w-full max-h-full object-contain object-left" />
                </div>
              ) : (
                <div className="flex items-center gap-4 flex-shrink-0">
                  <Clock2DocLogo className="w-12 h-12" />
                  <div>
                    <h1 className={`${isClassic ? 'text-5xl font-normal' : 'text-4xl font-black'} text-slate-900 uppercase tracking-tighter leading-none`}>Invoice</h1>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Professional Billing</p>
                  </div>
                </div>
              )}
              
              <div className="text-sm">
                <p className={`${isClassic ? 'font-serif italic text-xl' : 'font-bold text-lg'} text-slate-900 mb-2`}>{details.senderName || "Your Name / Business"}</p>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">{details.senderAddress || "Your Address\nYour Phone\nYour Email"}</p>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="mb-10">
              {!isBold && !details.logoUrl && (
                <>
                   <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Invoice Number</p>
                   <p className={`${isClassic ? 'text-3xl font-serif' : 'text-2xl font-black'} tracking-tight`}>{details.invoiceNumber}</p>
                </>
              )}
              {details.logoUrl && (
                 <div className="mb-2">
                    <h1 className={`${isClassic ? 'text-5xl font-normal' : 'text-4xl font-black'} text-slate-900 uppercase tracking-tighter leading-none`}>Invoice</h1>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">ID: {details.invoiceNumber}</p>
                 </div>
              )}
            </div>
            <div className={`grid grid-cols-2 gap-8 text-left md:text-right ${isClassic ? 'font-serif italic' : ''}`}>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Issued</p>
                <p className="text-sm font-bold whitespace-nowrap">{details.date}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Due</p>
                <p className="text-sm font-bold whitespace-nowrap">{details.dueDate}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`w-full mb-12 ${isBold ? 'h-0' : isClassic ? 'h-px bg-slate-200' : 'h-0.5 bg-slate-900'}`}></div>

      {/* Bill To & Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className={isBold ? 'bg-slate-50 p-8 rounded-2xl border-l-8 border-indigo-600' : ''}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</p>
          <p className={`${isClassic ? 'text-3xl font-serif italic mb-2' : isBold ? 'text-3xl font-black mb-2' : 'text-2xl font-black'} text-slate-900 leading-tight`}>{details.clientName || "Client Name"}</p>
          <p className="text-slate-600 whitespace-pre-line text-sm leading-relaxed max-w-sm">{details.clientAddress || "Client Address\nClient Contact Details"}</p>
        </div>
        
        {details.showProjectSummary && (
          <div className={`${isBold ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'} border p-6 rounded-2xl`}>
             <p className={`text-xs font-bold ${isBold ? 'text-indigo-900' : 'text-indigo-600'} uppercase tracking-widest mb-4 flex items-center gap-2`}>
               <PieChart className="w-3.5 h-3.5" /> 
               Time Breakdown
             </p>
             <div className="space-y-3">
               {Object.entries(projectSummary).map(([proj, hours]) => (
                 <div key={proj} className="flex justify-between items-center text-sm">
                   <span className={`${isClassic ? 'font-serif italic' : 'font-bold'} text-slate-700 truncate mr-4`}>{proj}</span>
                   <span className={`font-black whitespace-nowrap bg-white px-2 py-0.5 rounded-lg border ${isBold ? 'border-indigo-200 text-indigo-900' : 'border-slate-100 text-slate-900'}`}>{(hours as number).toFixed(2)}h</span>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="mb-16">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`${isBold ? 'bg-slate-900 text-white' : 'bg-slate-50 border-y border-slate-200'} rounded-lg overflow-hidden`}>
              <th className={`py-4 px-4 text-xs font-bold uppercase tracking-widest ${isBold ? 'text-indigo-400' : 'text-slate-500'}`}>Work Item</th>
              <th className={`py-4 px-4 text-xs font-bold uppercase tracking-widest text-right w-24 ${isBold ? 'text-indigo-400' : 'text-slate-500'}`}>Hours</th>
              <th className={`py-4 px-4 text-xs font-bold uppercase tracking-widest text-right w-32 ${isBold ? 'text-indigo-400' : 'text-slate-500'}`}>Rate</th>
              <th className={`py-4 px-4 text-xs font-bold uppercase tracking-widest text-right w-32 ${isBold ? 'text-indigo-400' : 'text-slate-500'}`}>Total</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isClassic ? 'divide-slate-200' : 'divide-slate-100'}`}>
            {items.map((item) => (
              <tr key={item.id} className="group">
                <td className="py-6 px-4">
                  <p className={`${isClassic ? 'font-serif text-xl italic' : isBold ? 'font-black text-lg' : 'font-bold text-base'} text-slate-900`}>{item.description}</p>
                  <p className={`text-xs font-bold uppercase mt-1 flex items-center gap-2 ${isBold ? 'text-indigo-900 opacity-60' : 'text-indigo-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isBold ? 'bg-indigo-900' : 'bg-indigo-500'}`}></span>
                    {item.project}
                  </p>
                </td>
                <td className={`py-6 px-4 text-right font-medium ${isClassic ? 'font-serif italic' : 'text-slate-600'}`}>{item.quantity.toFixed(2)}h</td>
                <td className={`py-6 px-4 text-right font-medium ${isClassic ? 'font-serif italic' : 'text-slate-600'}`}>{details.currency}{item.rate.toFixed(2)}</td>
                <td className={`py-6 px-4 text-right ${isBold ? 'font-black text-lg' : 'font-black text-slate-900'}`}>{details.currency}{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Notes */}
      <div className={`flex flex-col md:flex-row justify-between gap-16 pt-10 ${isBold ? 'bg-slate-50 -mx-8 -mb-8 md:-mx-16 md:-mb-16 p-8 md:p-16 border-t-4 border-slate-900' : 'border-t border-slate-100'}`}>
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Service Summary & Notes</p>
          <div className={`${isBold ? 'bg-white' : 'bg-slate-50'} text-sm text-slate-600 leading-relaxed italic p-5 rounded-xl border border-slate-100`}>
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
          <div className={`pt-6 ${isClassic ? 'border-t border-slate-900' : isBold ? 'border-t-2 border-indigo-600' : 'border-t-2 border-slate-900'}`}>
            <div className="flex justify-between items-baseline">
              <span className={`${isBold ? 'text-2xl font-black' : isClassic ? 'text-xl font-serif italic' : 'text-lg font-black'} uppercase tracking-tighter`}>Total Due</span>
              <span className={`${isBold ? 'text-4xl font-black' : isClassic ? 'text-3xl font-serif' : 'text-3xl font-black'} text-indigo-600 tracking-tight`}>{details.currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {!isBold && (
        <div className="mt-32 pt-12 border-t border-slate-100 flex justify-between items-center opacity-40 grayscale no-print-grayscale">
          <div className="flex items-center gap-2">
            <Clock2DocLogo className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Clock2Doc</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fast & Private Invoicing</p>
        </div>
      )}
    </div>
  );
};

export default InvoicePreview;
