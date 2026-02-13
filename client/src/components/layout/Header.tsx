import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function Header() {
  return (
    <header className="relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Package className="w-5.5 h-5.5 text-emerald-600" />
          <span className="text-base font-bold text-slate-800 tracking-tight">
            ListingAI
          </span>
        </Link>
      </div>
    </header>
  );
}
