import { useState, FormEvent } from 'react';
import { validateAsin } from '../../utils/validate-asin';

interface Props {
  onSubmit: (asin: string) => void;
  loading: boolean;
}

export default function AsinSearchForm({ onSubmit, loading }: Props) {
  const [asin, setAsin] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const error = validateAsin(asin);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    onSubmit(asin.trim().toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="asin-input" className="sr-only">Amazon ASIN</label>
          <input
            id="asin-input"
            type="text"
            value={asin}
            onChange={(e) => {
              setAsin(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Enter Amazon ASIN (e.g., B08N5WRWNW)"
            maxLength={10}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-slate-900 placeholder-slate-400 text-lg font-mono tracking-wider"
            disabled={loading}
          />
          {validationError && (
            <p className="mt-1.5 text-sm text-red-600">{validationError}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md disabled:cursor-not-allowed text-lg"
        >
          {loading ? 'Optimizing...' : 'Optimize'}
        </button>
      </div>
    </form>
  );
}
