interface Props {
  children: React.ReactNode;
}

export default function Badge({ children }: Props) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
      {children}
    </span>
  );
}
