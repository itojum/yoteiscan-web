import Link from "next/link";

const INPUT_TYPES = [
  {
    type: "text",
    label: "テキスト",
    description: "メール・チャット・メモなどのテキストをそのまま貼り付けて解析",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
      </svg>
    ),
  },
  {
    type: "image",
    label: "画像",
    description: "スクリーンショットやチラシの画像をアップロード。画像内の予定を自動認識",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    type: "audio",
    label: "音声",
    description: "マイクで音声入力してテキストに変換。会話録音や音声メモに対応",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
  },
  {
    type: "link",
    label: "リンク",
    description: "WebページのURLを入力。ページ内の予定情報を自動取得・解析",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    type: "file",
    label: "ファイル",
    description: "PDF・TXT・MDファイルをアップロード。ドキュメント内の予定を抽出",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="border-b py-16" style={{ background: "var(--primary-light)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--primary)" }}>
            あらゆる媒体から予定を登録
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
            テキスト・画像・音声・リンク・ファイルから予定を自動抽出し、Googleカレンダーへ追加できます
          </p>

          {/* Flow steps */}
          <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            {["媒体を選択", "予定を入力", "解析", "カレンダーへ追加"].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <span className="flex items-center gap-2 bg-white rounded-full px-4 py-1.5 text-sm font-medium shadow-sm" style={{ color: "var(--foreground)" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--primary)" }}>
                    {i + 1}
                  </span>
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Input type grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-6" style={{ color: "var(--muted)" }}>
          入力方法を選択
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INPUT_TYPES.map(({ type, label, description, icon }) => (
            <Link
              key={type}
              href={`/scan/${type}`}
              className="group bg-white rounded-2xl border p-6 flex flex-col gap-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                >
                  {icon}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                  style={{ color: "var(--primary)" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-base mb-1" style={{ color: "var(--foreground)" }}>
                  {label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
