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
      <div className="glass-card px-6 py-5">
        {/* Input */}
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
          className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 text-base font-mono tracking-wider py-1"
          disabled={loading}
        />

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
