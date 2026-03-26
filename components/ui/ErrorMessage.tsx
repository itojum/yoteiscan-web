interface Props {
  message: string;
}

export function ErrorMessage({ message }: Props) {
  return (
    <div className="rounded-xl p-3 text-sm flex items-start gap-2" style={{ background: "#fef2f2", color: "var(--error)", border: "1px solid #fecaca" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
        <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
      </svg>
      {message}
    </div>
  );
}
