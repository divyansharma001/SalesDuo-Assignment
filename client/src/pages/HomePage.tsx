import { Link } from 'react-router-dom';
import AsinSearchForm from '../components/product/AsinSearchForm';
import ComparisonView from '../components/product/ComparisonView';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorAlert from '../components/ui/ErrorAlert';
import { useOptimize } from '../hooks/useOptimize';
import { useRecent } from '../hooks/useRecent';
import RecentOptimizations from '../components/history/RecentOptimizations';

export default function HomePage() {
  const { data, loading, error, optimize, reset } = useOptimize();
  const { data: recentItems, loading: recentLoading } = useRecent();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center pt-8 sm:pt-12">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
          Optimize Your Amazon<br className="hidden sm:block" /> Listings
        </h2>
      </div>

      {/* Search */}
      <div className="max-w-3xl mx-auto">
        <AsinSearchForm onSubmit={optimize} loading={loading} />
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-3xl mx-auto">
          <ErrorAlert message={error} onDismiss={reset} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="max-w-3xl mx-auto">
          <LoadingSpinner message="Fetching product data and generating AI optimization..." />
        </div>
      )}

      {/* Recent optimizations */}
      {!data && !loading && !recentLoading && recentItems && recentItems.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <RecentOptimizations items={recentItems} />
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 bg-slate-800 text-white rounded font-mono text-xs">
                {data.asin}
              </span>
              {data.original.imageUrl && (
                <img
                  src={data.original.imageUrl}
                  alt={data.original.title}
                  className="w-10 h-10 object-contain rounded border border-slate-200"
                />
              )}
            </div>
            <Link
              to={`/history/${data.asin}`}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              View optimization history
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          <ComparisonView original={data.original} optimized={data.optimized} />

          <p className="text-center text-xs text-slate-400">
            Optimized using {data.modelUsed} &middot; {new Date(data.createdAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
