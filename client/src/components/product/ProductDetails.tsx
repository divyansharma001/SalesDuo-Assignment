import BulletPointList from './BulletPointList';
import KeywordBadges from './KeywordBadges';
import type { OriginalListing, OptimizedListing } from '../../types';

interface Props {
  data: OriginalListing | OptimizedListing;
  type?: 'original' | 'optimized';
}

export default function ProductDetails({ data, type = 'original' }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Title</h4>
        <p className="text-sm text-slate-900 font-medium leading-snug">{data.title || 'N/A'}</p>
      </div>

      <div>
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Bullet Points</h4>
        <BulletPointList bullets={data.bulletPoints} />
      </div>

      <div>
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
          {data.description || 'No description available'}
        </p>
      </div>

      {type === 'optimized' && 'keywords' in data && (
        <KeywordBadges keywords={(data as OptimizedListing).keywords} />
      )}

      {type === 'original' && 'price' in data && (data as OriginalListing).price && (
        <div>
          <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Price</h4>
          <p className="text-base font-bold text-emerald-700">{(data as OriginalListing).price}</p>
        </div>
      )}
    </div>
  );
}
