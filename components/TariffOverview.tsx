import React from 'react';
import { Tariff, CarrierId } from '../types';
import { CARRIERS } from '../constants';
import { X, Shield, ShieldOff, CalendarClock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tariffs: Tariff[];
  lastUpdated: string;
}

export const TariffOverview: React.FC<Props> = ({ isOpen, onClose, tariffs, lastUpdated }) => {
  if (!isOpen) return null;

  // Group tariffs by carrier
  const groupedTariffs = tariffs.reduce((acc, tariff) => {
    if (!acc[tariff.carrier]) {
      acc[tariff.carrier] = [];
    }
    acc[tariff.carrier].push(tariff);
    return acc;
  }, {} as Record<string, Tariff[]>);

  // Helper to check for liability
  const hasLiability = (t: Tariff) => t.features.some(f =>
    f.includes('Haftung') && !f.toLowerCase().includes('keine')
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-stone-200 dark:bg-slate-900 w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-300 dark:border-slate-800 bg-stone-200 dark:bg-slate-900 sticky top-0 z-20 gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-slate-100">Portopreise</h2>
            <div className="flex items-center gap-2 mt-1">
                <CalendarClock size={14} className="text-stone-500 dark:text-slate-400"/>
                <p className="text-sm font-medium text-stone-600 dark:text-slate-400">
                    Stand: <span className="text-stone-800 dark:text-slate-200 font-semibold">{lastUpdated}</span>
                </p>
            </div>
          </div>

          <button
              onClick={onClose}
              className="p-2 hover:bg-stone-300 dark:hover:bg-slate-800 rounded-full transition-colors text-stone-600 dark:text-slate-400"
              title="Schließen"
          >
              <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6 bg-stone-300 dark:bg-black/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.keys(CARRIERS).map((carrierKey) => {
              const carrierId = carrierKey as CarrierId;
              const config = CARRIERS[carrierId];
              const carrierTariffs = groupedTariffs[carrierKey] || [];

              // Sort by price
              const sortedTariffs = [...carrierTariffs].sort((a,b) => a.price - b.price);

              return (
                <div key={carrierKey} className="bg-stone-200 dark:bg-slate-850 rounded-xl border border-stone-400 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
                  {/* Carrier Header */}
                  <div className={`${config.color} p-4 text-center border-b border-white/10`}>
                     <span className={`${config.textColor} font-black text-xl italic tracking-tight`}>{config.logoText}</span>
                  </div>

                  {/* List */}
                  <div className="divide-y divide-stone-300 dark:divide-slate-800 flex-1">
                    {sortedTariffs.map((tariff) => (
                      <div key={tariff.id} className="p-4 hover:bg-stone-300 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-stone-800 dark:text-slate-200 text-sm leading-tight pr-2">{tariff.name}</span>
                          <span className="font-bold text-stone-900 dark:text-slate-100 bg-stone-300 dark:bg-slate-800 px-2 py-0.5 rounded text-sm whitespace-nowrap">
                              {tariff.price.toFixed(2)} €
                          </span>
                        </div>

                        <div className="text-xs text-stone-600 dark:text-slate-400 space-y-1.5">
                          {/* Dimensions */}
                          <div className="flex flex-wrap gap-x-2 gap-y-1 opacity-90">
                              {tariff.maxDimensions && (
                                  <span className="bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 px-1 rounded">Max: {tariff.maxDimensions.length}x{tariff.maxDimensions.width}x{tariff.maxDimensions.height}</span>
                              )}
                              {tariff.maxCombined && (
                                  <span className="bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 px-1 rounded">L+K ≤ {tariff.maxCombined} cm</span>
                              )}
                              <span className="font-medium text-stone-700 dark:text-slate-300">{tariff.maxWeight} kg</span>
                          </div>

                          {/* Features */}
                          <div className="flex items-center gap-1.5 pt-1">
                              {hasLiability(tariff) ? (
                                  <span className="text-stone-600 dark:text-emerald-400 flex items-center gap-1 bg-stone-300 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-sm" title="Versichert">
                                      <Shield size={10} /> <span className="text-[10px] font-semibold">Versichert</span>
                                  </span>
                              ) : (
                                  <span className="text-stone-400 dark:text-slate-500 flex items-center gap-1 bg-stone-300 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm" title="Unversichert">
                                      <ShieldOff size={10} /> <span className="text-[10px]">Unversichert</span>
                                  </span>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty State for Carrier */}
                    {sortedTariffs.length === 0 && (
                        <div className="p-8 text-center text-stone-500 text-xs italic">
                            Keine Tarife.
                        </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
