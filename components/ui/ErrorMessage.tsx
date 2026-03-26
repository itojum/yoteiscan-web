import { AlertCircle } from "lucide-react";

interface Props {
  message: string;
}

export function ErrorMessage({ message }: Props) {
  return (
    <div className="rounded-xl p-3 text-sm flex items-start gap-2" style={{ background: "#fef2f2", color: "var(--error)", border: "1px solid #fecaca" }}>
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      {message}
    </div>
  );
}
