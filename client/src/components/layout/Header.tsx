import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-900 text-lg">
            AO
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Amazon Listing Optimizer</h1>
            <p className="text-xs text-slate-400">AI-Powered Product Optimization</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
