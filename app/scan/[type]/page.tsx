"use client";

import { use, useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ScanType = "text" | "image" | "audio" | "link" | "file";

const VALID_TYPES: ScanType[] = ["text", "image", "audio", "link", "file"];

const TYPE_META: Record<ScanType, { label: string; description: string; hint: string; icon: React.ReactNode }> = {
  text: {
    label: "テキスト入力",
    description: "メール・チャット・メモなどのテキストを貼り付けて解析します。複数の予定が含まれていても一括抽出できます。",
    hint: "コピペしたメール本文や、スケジュール情報を含むテキストをそのまま貼り付けてください。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
      </svg>
    ),
  },
  image: {
    label: "画像入力",
    description: "スクリーンショット・チラシ・ポスターなどの画像から予定を自動認識します。",
    hint: "予定情報が写っている画像（PNG・JPG・WEBP等）をアップロードしてください。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  audio: {
    label: "音声入力",
    description: "マイクで音声を録音してリアルタイムに文字起こし。テキストを確認してから解析します。",
    hint: "録音ボタンをクリックして話しかけてください。文字起こし結果は解析前に編集できます。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
  },
  link: {
    label: "リンク入力",
    description: "WebページのURLを入力するとページ内のテキストを取得し、予定情報を抽出します。",
    hint: "イベントページ・告知ページ・スケジュールが掲載されているURLを入力してください。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  file: {
    label: "ファイル入力",
    description: "PDF・TXT・MDファイルをアップロード。ドキュメント内から予定情報を抽出します。",
    hint: "対応形式：PDF・TXT・MD。ファイルはサーバーに保存されません。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
};

// ─── Shared components ────────────────────────────────────────────────────────

function SubmitButton({ loading, disabled }: { loading: boolean; disabled: boolean }) {
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

function ErrorMessage({ message }: { message: string }) {
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

// ─── Text input ───────────────────────────────────────────────────────────────

function TextInput() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType: "text", content: text }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "解析に失敗しました。"); return; }
      sessionStorage.setItem("yoteiscan_result", JSON.stringify(data));
      router.push("/result");
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="予定情報を含むテキストをここに貼り付けてください..."
        className="flex-1 w-full rounded-xl border p-4 text-sm resize-none focus:outline-none focus:ring-2 min-h-48"
        style={{ borderColor: "var(--border)", background: "#fff", lineHeight: 1.7 }}
      />
      {error && <ErrorMessage message={error} />}
      <div className="flex justify-end">
        <SubmitButton loading={loading} disabled={!text.trim()} />
      </div>
    </form>
  );
}

// ─── Image input ──────────────────────────────────────────────────────────────

function ImageInput() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.type.startsWith("image/")) { setError("画像ファイルを選択してください。"); return; }
    setError("");
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("sourceType", "image");
      formData.append("image", file);
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "解析に失敗しました。"); return; }
      sessionStorage.setItem("yoteiscan_result", JSON.stringify(data));
      router.push("/result");
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div
        className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors"
        style={{
          borderColor: dragging ? "var(--primary)" : "var(--border)",
          background: dragging ? "var(--primary-light)" : "#fff",
          minHeight: 220,
          padding: "2rem",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="プレビュー" className="max-h-56 rounded-lg object-contain" />
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12" style={{ color: "var(--muted)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>クリックまたはドラッグ&ドロップ</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>PNG・JPG・WEBP・GIF など</p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {file && (
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" style={{ color: "var(--primary)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {file.name}
          <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="ml-auto text-xs hover:underline">
            削除
          </button>
        </div>
      )}
      {error && <ErrorMessage message={error} />}
      <div className="flex justify-end">
        <SubmitButton loading={loading} disabled={!file} />
      </div>
    </form>
  );
}

// ─── Audio input ──────────────────────────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

function AudioInput() {
  const router = useRouter();
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  const startRecording = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "ja-JP";
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalTranscript = transcript;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = () => {
      setRecording(false);
      setError("音声認識に失敗しました。マイクの許可を確認してください。");
    };

    recognition.onend = () => {
      setTranscript(finalTranscript);
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    setError("");
  }, [transcript]);

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!transcript.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType: "audio", content: transcript }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "解析に失敗しました。"); return; }
      sessionStorage.setItem("yoteiscan_result", JSON.stringify(data));
      router.push("/result");
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <div className="rounded-xl p-4 text-sm" style={{ background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }}>
        お使いのブラウザは音声認識に対応していません。Chrome / Edge をご利用ください。
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Record control */}
      <div className="flex items-center gap-5 p-5 rounded-xl border" style={{ borderColor: "var(--border)", background: "#fff" }}>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
          style={{ background: recording ? "#ef4444" : "var(--primary)" }}
        >
          {recording ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          )}
        </button>
        <div>
          <p className="font-medium text-sm" style={{ color: recording ? "#ef4444" : "var(--foreground)" }}>
            {recording ? "録音中..." : "クリックして録音開始"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {recording ? "もう一度クリックで停止" : "日本語で話しかけてください"}
          </p>
        </div>
        {recording && (
          <span className="ml-auto flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className="w-1 rounded-full animate-pulse" style={{ height: 16 + i * 4, background: "#ef4444", animationDelay: `${i * 0.1}s` }} />
            ))}
          </span>
        )}
      </div>

      {/* Transcript */}
      <div>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted)" }}>
          文字起こし結果（解析前に編集できます）
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="録音すると、ここに文字起こし結果が表示されます..."
          rows={6}
          className="w-full rounded-xl border p-4 text-sm resize-none focus:outline-none focus:ring-2"
          style={{ borderColor: "var(--border)", background: "#fff", lineHeight: 1.7 }}
        />
      </div>

      {error && <ErrorMessage message={error} />}
      <div className="flex justify-end">
        <SubmitButton loading={loading} disabled={!transcript.trim()} />
      </div>
    </form>
  );
}

// ─── Link input ───────────────────────────────────────────────────────────────

function LinkInput() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType: "link", url }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "解析に失敗しました。"); return; }
      sessionStorage.setItem("yoteiscan_result", JSON.stringify(data));
      router.push("/result");
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted)" }}>
          URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/event"
          className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "var(--border)", background: "#fff" }}
          required
        />
      </div>
      {error && <ErrorMessage message={error} />}
      <div className="flex justify-end">
        <SubmitButton loading={loading} disabled={!url.trim()} />
      </div>
    </form>
  );
}

// ─── File input ───────────────────────────────────────────────────────────────

function FileInput() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    const name = f.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".txt") && !name.endsWith(".md")) {
      setError("PDF・TXT・MDファイルのみ対応しています。");
      return;
    }
    setError("");
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("sourceType", "file");
      formData.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "解析に失敗しました。"); return; }
      sessionStorage.setItem("yoteiscan_result", JSON.stringify(data));
      router.push("/result");
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div
        className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors"
        style={{
          borderColor: dragging ? "var(--primary)" : "var(--border)",
          background: dragging ? "var(--primary-light)" : "#fff",
          minHeight: 200,
          padding: "2rem",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12" style={{ color: "var(--muted)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>クリックまたはドラッグ&ドロップ</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>PDF・TXT・MD 対応</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {file && (
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" style={{ color: "var(--primary)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {file.name}
          <button type="button" onClick={() => setFile(null)} className="ml-auto text-xs hover:underline">
            削除
          </button>
        </div>
      )}
      {error && <ErrorMessage message={error} />}
      <div className="flex justify-end">
        <SubmitButton loading={loading} disabled={!file} />
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScanPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);

  if (!VALID_TYPES.includes(type as ScanType)) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-lg font-medium mb-3" style={{ color: "var(--error)" }}>無効な入力タイプです。</p>
        <Link href="/" className="text-sm" style={{ color: "var(--primary)" }}>← ホームに戻る</Link>
      </main>
    );
  }

  const scanType = type as ScanType;
  const meta = TYPE_META[scanType];

  const inputComponents: Record<ScanType, React.ReactNode> = {
    text: <TextInput />,
    image: <ImageInput />,
    audio: <AudioInput />,
    link: <LinkInput />,
    file: <FileInput />,
  };

  return (
    <main className="flex-1">
      {/* Breadcrumb */}
      <div className="border-b" style={{ borderColor: "var(--border)", background: "#fff" }}>
        <div className="max-w-6xl mx-auto px-6 h-10 flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--primary)" }}>ホーム</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
          <span>{meta.label}</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left: description panel */}
          <aside className="lg:col-span-2">
            <div
              className="rounded-2xl p-6 flex flex-col gap-4 sticky top-24"
              style={{ background: "var(--primary-light)" }}
            >
              <span style={{ color: "var(--primary)" }}>{meta.icon}</span>
              <div>
                <h1 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
                  {meta.label}
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {meta.description}
                </p>
              </div>
              <div className="rounded-xl p-3 text-xs leading-relaxed" style={{ background: "rgba(255,255,255,0.7)", color: "var(--muted)" }}>
                <p className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>ヒント</p>
                {meta.hint}
              </div>
            </div>
          </aside>

          {/* Right: form panel */}
          <section className="lg:col-span-3">
            <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: "var(--border)" }}>
              {inputComponents[scanType]}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
