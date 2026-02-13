import { useParams, Link } from 'react-router-dom';
import HistoryTable from '../components/history/HistoryTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorAlert from '../components/ui/ErrorAlert';
import { useHistory } from '../hooks/useHistory';

export default function HistoryPage() {
  const { asin } = useParams<{ asin: string }>();
  const { data, loading, error, refetch } = useHistory(asin);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1 mb-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Optimization History</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-3 py-1 bg-slate-800 text-white rounded-md font-mono text-sm">{asin}</span>
            {data && (
              <span className="text-sm text-slate-500">
                {data.total} optimization{data.total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {loading && <LoadingSpinner message="Loading optimization history..." />}
      {error && <ErrorAlert message={error} />}
      {data && !loading && <HistoryTable optimizations={data.optimizations} />}
    </div>
  );
}
