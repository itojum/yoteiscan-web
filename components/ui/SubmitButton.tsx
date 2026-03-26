import { Loader2 } from "lucide-react";

interface Props {
  loading: boolean;
  disabled: boolean;
}

export function SubmitButton({ loading, disabled }: Props) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="px-8 py-2.5 rounded-xl font-medium text-white transition-opacity disabled:opacity-40 text-sm"
      style={{ background: "var(--primary)" }}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="animate-spin w-4 h-4" />
          解析中...
        </span>
      ) : (
        "解析する"
      )}
    </button>
  );
}
