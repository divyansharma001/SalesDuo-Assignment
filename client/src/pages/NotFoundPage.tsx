import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h2 className="text-6xl font-bold text-slate-300">404</h2>
      <p className="mt-4 text-lg text-slate-600">Page not found</p>
      <Link
        to="/"
        className="mt-6 inline-block px-6 py-2 btn-mint font-medium rounded-lg transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
