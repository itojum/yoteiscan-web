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
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          解析中...
        </span>
      ) : (
        "解析する"
      )}
    </button>
  );
}
