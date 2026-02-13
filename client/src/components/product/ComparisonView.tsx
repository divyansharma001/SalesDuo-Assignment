import ProductDetails from './ProductDetails';
import type { OriginalListing, OptimizedListing } from '../../types';

interface Props {
  original: OriginalListing;
  optimized: OptimizedListing;
}

export default function ComparisonView({ original, optimized }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Original Listing</h3>
        </div>
        <div className="p-4">
          <ProductDetails data={original} type="original" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden ring-1 ring-emerald-100">
        <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200">
          <h3 className="text-sm font-semibold text-emerald-800">AI-Optimized Listing</h3>
        </div>
        <div className="p-4">
          <ProductDetails data={optimized} type="optimized" />
        </div>
      </div>
    </div>
  );
}
