import Badge from '../ui/Badge';

interface Props {
  keywords: string[] | undefined;
}

export default function KeywordBadges({ keywords }: Props) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div>
      <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
        Suggested Keywords
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {keywords.map((keyword, index) => (
          <Badge key={index}>{keyword}</Badge>
        ))}
      </div>
    </div>
  );
}
