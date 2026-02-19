import { useState, FormEvent } from 'react';
import { validateAsin } from '../../utils/validate-asin';

const MARKETPLACES = [
  { value: 'amazon.in', label: 'amazon.in' },
  { value: 'amazon.com', label: 'amazon.com' },
  { value: 'amazon.co.uk', label: 'amazon.co.uk' },
  { value: 'amazon.de', label: 'amazon.de' },
  { value: 'amazon.ca', label: 'amazon.ca' },
];

interface Props {
  onSubmit: (asin: string, marketplace: string) => void;
  loading: boolean;
}

export default function AsinSearchForm({ onSubmit, loading }: Props) {
  const [asin, setAsin] = useState('');
  const [marketplace, setMarketplace] = useState(MARKETPLACES[0].value);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const error = validateAsin(asin);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    onSubmit(asin.trim().toUpperCase(), marketplace);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="glass-card px-6 py-5">
        {/* Input row */}
        <label htmlFor="asin-input" className="sr-only">Amazon ASIN</label>
        <div className="flex items-center gap-3">
          <select
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value)}
            disabled={loading}
            className="bg-transparent text-sm text-slate-600 font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-400 transition-colors cursor-pointer"
          >
            {MARKETPLACES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <input
            id="asin-input"
            type="text"
            value={asin}
            onChange={(e) => {
              setAsin(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Enter ASIN (e.g., B08N5WRWNW)"
            maxLength={10}
            className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-base font-mono tracking-wider py-1"
            disabled={loading}
          />
        </div>

        {/* Separator */}
        <div className="border-t border-slate-200/60 my-4" />

        {/* Button row */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-mint px-7 py-2.5 rounded-xl text-sm tracking-wide"
          >
            {loading ? 'Optimizing...' : 'Optimize'}
          </button>
        </div>
      </div>
      {validationError && (
        <p className="mt-2.5 text-sm text-red-600 pl-4">{validationError}</p>
      )}
    </form>
  );
}
