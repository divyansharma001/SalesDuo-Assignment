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
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Optimize Your Amazon Listings
        </h2>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          Enter an ASIN and let AI analyze and optimize your product listing for better visibility and conversions.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <AsinSearchForm onSubmit={optimize} loading={loading} />
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto">
          <ErrorAlert message={error} onDismiss={reset} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <LoadingSpinner message="Fetching product data and generating AI optimization... This may take 15-30 seconds." />
      )}

      {/* Recent optimizations — shown when no result is displayed */}
      {!data && !loading && !recentLoading && recentItems && recentItems.length > 0 && (
        <RecentOptimizations items={recentItems} />
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-6">
          {/* ASIN badge + history link */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-slate-800 text-white rounded-md font-mono text-sm">
                {data.asin}
              </span>
              {data.original.imageUrl && (
                <img
                  src={data.original.imageUrl}
                  alt={data.original.title}
                  className="w-12 h-12 object-contain rounded border border-slate-200"
                />
              )}
            </div>
            <Link
              to={`/history/${data.asin}`}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1"
            >
              View optimization history
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {/* Side-by-side comparison */}
          <ComparisonView original={data.original} optimized={data.optimized} />

          {/* Meta */}
          <p className="text-center text-xs text-slate-400">
            Optimized using {data.modelUsed} &middot; {new Date(data.createdAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
