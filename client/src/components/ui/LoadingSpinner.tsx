interface Props {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      <p className="mt-4 text-slate-600 font-medium">{message}</p>
    </div>
  );
}
