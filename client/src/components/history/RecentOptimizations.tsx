import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/format-date';
import { deleteOptimizationsByAsin } from '../../services/product.api';
import type { RecentItem } from '../../types';

interface Props {
  items: RecentItem[];
  onDelete?: (asin: string) => void;
}

export default function RecentOptimizations({ items, onDelete }: Props) {
  if (!items || items.length === 0) return null;

  const handleDelete = async (e: React.MouseEvent, asin: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteOptimizationsByAsin(asin);
      onDelete?.(asin);
    } catch {
      // silently fail
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Recent Optimizations</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <Link
            key={item.asin}
            to={`/history/${item.asin}`}
            className="group relative bg-white rounded-lg border border-slate-200 p-3 hover:border-emerald-300 hover:shadow-sm transition-all"
          >
            <button
              onClick={(e) => handleDelete(e, item.asin)}
              className="absolute top-2 right-2 p-1.5 rounded-md text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Delete optimization"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-start gap-2.5">
              {item.originalImageUrl && (
                <img
                  src={item.originalImageUrl}
                  alt={item.originalTitle}
                  className="w-10 h-10 object-contain rounded border border-slate-100 shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="inline-block px-1.5 py-px bg-slate-100 text-slate-600 rounded font-mono text-[11px] mb-0.5">
                  {item.asin}
                </span>
                <p className="text-xs font-medium text-slate-900 line-clamp-2 leading-snug">
                  {item.originalTitle}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
