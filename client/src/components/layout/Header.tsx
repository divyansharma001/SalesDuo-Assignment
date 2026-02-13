import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-orange-300 via-orange-400 to-orange-500 shadow-sm shadow-orange-200/50" />
            <div className="absolute top-0.5 left-1 w-2.5 h-2.5 rounded-full bg-linear-to-br from-white/50 to-transparent" />
          </div>
          <span className="text-sm font-semibold text-slate-800 tracking-tight">
            ListingAI
          </span>
        </Link>
      </div>
    </header>
  );
}
