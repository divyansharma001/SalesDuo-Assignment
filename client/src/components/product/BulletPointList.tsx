import { renderInlineMarkdown } from '../../utils/format-text';

interface Props {
  bullets: string[] | undefined;
}

export default function BulletPointList({ bullets }: Props) {
  if (!bullets || bullets.length === 0) {
    return <p className="text-slate-400 italic text-sm">No bullet points available</p>;
  }

  return (
    <ul className="space-y-2">
      {bullets.map((bullet, index) => (
        <li key={index} className="flex items-start gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center mt-0.5 font-medium">
            {index + 1}
          </span>
          <span className="text-slate-700 text-sm leading-relaxed">{renderInlineMarkdown(bullet)}</span>
        </li>
      ))}
    </ul>
  );
}
