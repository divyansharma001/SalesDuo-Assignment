export default function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} ListingAI &mdash; AI-powered Amazon listing optimization
        </p>
      </div>
    </footer>
  );
}
