import { useState } from 'react';
import { formatDate } from '../../utils/format-date';
import Badge from '../ui/Badge';
import type { OptimizationRecord } from '../../types';

interface Props {
  optimizations: OptimizationRecord[];
}

export default function HistoryTable({ optimizations }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!optimizations || optimizations.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500">
        <p className="text-base font-medium">No optimization history yet</p>
        <p className="text-xs mt-1">Go to the home page and optimize this ASIN to see history here.</p>
      </div>
    );
  }

  const parseSafe = (val: string[] | string | undefined): string[] => {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    try { return JSON.parse(val); } catch { return []; }
  };

  return (
    <div className="space-y-3">
      {optimizations.map((opt, index) => {
        const isExpanded = expandedId === opt.id;
        const title = opt.optimizedTitle || opt.optimized_title;
        const bullets = parseSafe(opt.optimizedBullets || opt.optimized_bullets);
        const description = opt.optimizedDescription || opt.optimized_description;
        const keywords = parseSafe(opt.keywords);
        const model = opt.modelUsed || opt.model_used;
        const date = opt.createdAt || opt.created_at;

        return (
          <div key={opt.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedId(isExpanded ? null : opt.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
                  #{optimizations.length - index}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {date && formatDate(date)} &middot; {model}
                  </p>
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-3 ${isExpanded ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20" fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Optimized Title</h4>
                  <p className="text-sm text-slate-800">{title}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Bullet Points</h4>
                  <ul className="space-y-1">
                    {bullets.map((b, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">&#8226;</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{description}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Keywords</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.map((kw, i) => <Badge key={i}>{kw}</Badge>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
