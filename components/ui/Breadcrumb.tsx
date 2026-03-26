import Link from "next/link";

interface Props {
  items: {
    label: string;
    href?: string;
  }[];
}

export function Breadcrumb({ items }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          {i > 0 && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          )}
          {item.href ? (
            <Link href={item.href} className="hover:underline" style={{ color: "var(--primary)" }}>
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
