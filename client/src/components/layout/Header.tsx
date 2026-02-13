import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function Header() {
  return (
    <header className="relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity">
          <Package className="w-4.5 h-4.5 text-emerald-500" />
          <span className="text-sm font-semibold text-slate-800 tracking-tight">
            ListingAI
          </span>
        </Link>
      </div>
    </header>
  );
}
