import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/format-date';
import type { RecentItem } from '../../types';

interface Props {
  items: RecentItem[];
}

export default function RecentOptimizations({ items }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-3">Recent Optimizations</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item.asin}
            to={`/history/${item.asin}`}
            className="bg-white rounded-lg border border-slate-200 p-4 hover:border-amber-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-3">
              {item.originalImageUrl && (
                <img
                  src={item.originalImageUrl}
                  alt={item.originalTitle}
                  className="w-12 h-12 object-contain rounded border border-slate-100 flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono text-xs mb-1">
                  {item.asin}
                </span>
                <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug">
                  {item.originalTitle}
                </p>
                <p className="text-xs text-slate-400 mt-1">
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
