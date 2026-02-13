import { useState } from 'react';
import BulletPointList from './BulletPointList';
import KeywordBadges from './KeywordBadges';
import { renderInlineMarkdown } from '../../utils/format-text';
import type { OriginalListing, OptimizedListing } from '../../types';

interface Props {
  data: OriginalListing | OptimizedListing;
  type?: 'original' | 'optimized';
}

const DESC_CLAMP = 300; // characters before truncating

export default function ProductDetails({ data, type = 'original' }: Props) {
  const [expanded, setExpanded] = useState(false);
  const desc = data.description || '';
  const isLong = desc.length > DESC_CLAMP;

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
          {!desc ? 'No description available' : renderInlineMarkdown(isLong && !expanded ? desc.slice(0, DESC_CLAMP).trimEnd() + '…' : desc)}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
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
