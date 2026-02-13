interface Props {
  children: React.ReactNode;
}

export default function Badge({ children }: Props) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      {children}
    </span>
  );
}
