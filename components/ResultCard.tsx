import React from 'react';
import { CalculationResult } from '../types';
import { CARRIERS } from '../constants';
import { Check, ShieldCheck, AlertTriangle, ArrowRight, ThumbsUp, Scale, Ruler, BoxSelect } from 'lucide-react';
import { CarrierLogo } from './CarrierLogo';

interface Props {
  result: CalculationResult;
  rank: number;
}

export const ResultCard: React.FC<Props> = ({ result, rank }) => {
  const { tariff } = result;
  const carrier = CARRIERS[tariff.carrier];
  const isSperrgut = tariff.name.toLowerCase().includes('sperrgut');
  const isBestPrice = rank === 0;

  return (
    <div className={`
      relative bg-stone-200 dark:bg-slate-850 rounded-xl border transition-all duration-300 group overflow-hidden
      ${isBestPrice ? 'border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500/20 z-10' : 'border-stone-400 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md'}
      ${isSperrgut ? 'border-amber-400 ring-1 ring-amber-400 border-dashed dark:border-amber-700 dark:border-solid dark:ring-0' : ''}
    `}>
      
      <div className="flex flex-col sm:flex-row items-stretch h-full">
        
        {/* Left: Logo Column */}
        <div className="flex items-center justify-center p-4 w-full sm:w-36 bg-stone-300 dark:bg-slate-800/30 border-b sm:border-b-0 sm:border-r border-stone-400 dark:border-slate-700 flex-shrink-0">
           {/* Logo WITHOUT grayscale filter */}
           <CarrierLogo carrier={tariff.carrier} className="h-auto w-24 sm:w-full shadow-sm transition-all duration-300" />
        </div>

        {/* Middle: Info Column */}
        <div className="flex-1 p-4 flex flex-col justify-center gap-2">
          
          <div className="flex flex-col gap-1">
             <div className="flex items-center justify-between">
                 <h4 className="font-bold text-lg text-stone-900 dark:text-white leading-tight flex items-center gap-2">
                    {tariff.name}
                    {isBestPrice && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                            <ThumbsUp size={10} /> Günstigste Option
                        </span>
                    )}
                 </h4>
             </div>

             {/* Technical Limits Badges */}
             <div className="flex flex-wrap gap-2 mt-0.5">
                 {/* Weight Limit */}
                 <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-300 dark:bg-slate-800 text-[10px] font-semibold text-stone-700 dark:text-slate-300 border border-stone-400 dark:border-slate-700" title="Maximales Gewicht">
                    <Scale size={10} className="text-stone-500 dark:text-slate-400"/> Max {tariff.maxWeight} kg
                 </span>

                 {/* Dimensions Limit (Fixed) */}
                 {tariff.maxDimensions && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-300 dark:bg-slate-800 text-[10px] font-semibold text-stone-700 dark:text-slate-300 border border-stone-400 dark:border-slate-700" title="Maximale Maße">
                    <BoxSelect size={10} className="text-stone-500 dark:text-slate-400"/> {tariff.maxDimensions.length}x{tariff.maxDimensions.width}x{tariff.maxDimensions.height} cm
                  </span>
                 )}

                 {/* Combined Limit (L+K) */}
                 {tariff.maxCombined && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-300 dark:bg-slate-800 text-[10px] font-semibold text-stone-700 dark:text-slate-300 border border-stone-400 dark:border-slate-700" title="Längste + Kürzeste Seite">
                    <Ruler size={10} className="text-stone-500 dark:text-slate-400"/> Max L+K: {tariff.maxCombined} cm
                  </span>
                 )}

                 {isSperrgut && (
                   <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-[10px] font-bold text-amber-800 dark:text-amber-500 border border-amber-200 dark:border-amber-800">
                     <AlertTriangle size={10} /> Sperrgut
                   </span>
                 )}
             </div>
          </div>

          {/* Features List */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {tariff.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-slate-400">
                {feature.includes('Haftung') ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                ) : (
                    <Check className="w-3.5 h-3.5 text-stone-400 dark:text-indigo-400 flex-shrink-0" />
                )}
                <span className="truncate">{feature}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Right: Price & CTA Column */}
        <div className="flex flex-col items-center justify-center w-full sm:w-48 p-4 bg-stone-300/50 dark:bg-slate-800/20 border-t sm:border-t-0 sm:border-l border-stone-400 dark:border-slate-700 flex-shrink-0">
            <div className="text-center mb-2">
                <span className={`block text-2xl font-black tracking-tight ${isSperrgut ? 'text-amber-700 dark:text-amber-500' : 'text-stone-900 dark:text-white'}`}>
                    {tariff.price.toFixed(2).replace('.', ',')} €
                </span>
            </div>
            
            <a 
                href={carrier.bookingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`
                    w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-0.5 active:translate-y-0
                    ${isBestPrice 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none' 
                        : 'bg-stone-100 dark:bg-slate-800 border border-stone-400 dark:border-slate-600 text-stone-800 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-600'}
                `}
            >
                Zum Angebot <ArrowRight size={14} />
            </a>
        </div>

      </div>
    </div>
  );
};