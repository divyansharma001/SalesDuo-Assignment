import Badge from '../ui/Badge';

interface Props {
  keywords: string[] | undefined;
}

export default function KeywordBadges({ keywords }: Props) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        Suggested Keywords
      </h4>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <Badge key={index}>{keyword}</Badge>
        ))}
      </div>
    </div>
  );
}
