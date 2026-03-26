import Link from "next/link";
import { ChevronRight } from "lucide-react";

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
            <ChevronRight className="w-3.5 h-3.5" />
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
