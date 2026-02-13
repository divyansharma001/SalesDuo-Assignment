import ProductDetails from './ProductDetails';
import type { OriginalListing, OptimizedListing } from '../../types';

interface Props {
  original: OriginalListing;
  optimized: OptimizedListing;
}

export default function ComparisonView({ original, optimized }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-700">Original Listing</h3>
        </div>
        <div className="p-5">
          <ProductDetails data={original} type="original" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden ring-1 ring-amber-100">
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-200">
          <h3 className="font-semibold text-amber-800">AI-Optimized Listing</h3>
        </div>
        <div className="p-5">
          <ProductDetails data={optimized} type="optimized" />
        </div>
      </div>
    </div>
  );
}
