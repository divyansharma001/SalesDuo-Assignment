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
      <div className="text-center py-12 text-slate-500">
        <p className="text-lg font-medium">No optimization history yet</p>
        <p className="text-sm mt-1">Go to the home page and optimize this ASIN to see history here.</p>
      </div>
    );
  }

  const parseSafe = (val: string[] | string | undefined): string[] => {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    try { return JSON.parse(val); } catch { return []; }
  };

  return (
    <div className="space-y-4">
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
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                  #{optimizations.length - index}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {date && formatDate(date)} &middot; {model}
                  </p>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20" fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Optimized Title</h4>
                  <p className="text-sm text-slate-800">{title}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Optimized Bullet Points</h4>
                  <ul className="space-y-1.5">
                    {bullets.map((b, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-amber-500 mt-1">&#8226;</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Optimized Description</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{description}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
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
