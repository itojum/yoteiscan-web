"use client";

import { use, useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ExtractResponse } from "@/lib/schemas";

type ScanType = "text" | "image" | "audio" | "link" | "file";

const TYPE_LABELS: Record<ScanType, string> = {
  text: "テキスト入力",
  image: "画像入力",
  audio: "音声入力",
  link: "リンク入力",
  file: "ファイル入力",
};

const VALID_TYPES: ScanType[] = ["text", "image", "audio", "link", "file"];

// ─── Shared header ───────────────────────────────────────────────────────────

function PageHeader({ type }: { type: ScanType }) {
  const icons: Record<ScanType, React.ReactNode> = {
    text: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
      </svg>
    ),
    image: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
      </svg>
    ),
    audio: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
    link: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    file: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <Link href="/" className="text-sm flex items-center gap-1" style={{ color: "var(--primary)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
        YoteiScan
      </Link>
      <div className="flex items-center gap-2" style={{ color: "var(--primary)" }}>
        <span>{TYPE_LABELS[type]}</span>
        <span>{icons[type]}</span>
      </div>
    </div>
  );
}

// ─── Submit button ────────────────────────────────────────────────────────────

function SubmitButton({ loading, disabled }: { loading: boolean; disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full py-3 rounded-xl font-medium text-white transition-opacity disabled:opacity-50"
      style={{ background: loading || disabled ? "var(--muted)" : "var(--primary)" }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          解析中...
        </span>
      ) : (
        "▷ 解析"
      )}
    </button>
  );
}

// ─── Error display ────────────────────────────────────────────────────────────

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl p-4 text-sm" style={{ background: "#fef2f2", color: "var(--error)", border: "1px solid #fecaca" }}>
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="テキストを入力してください..."
        rows={8}
        className="w-full rounded-xl border p-3 text-sm resize-none focus:outline-none focus:ring-2"
        style={{ borderColor: "var(--border)", background: "#fff" }}
      />
      {error && <ErrorMessage message={error} />}
      <SubmitButton loading={loading} disabled={!text.trim()} />
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
        className="rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
        style={{
          borderColor: dragging ? "var(--primary)" : "var(--border)",
          background: dragging ? "var(--primary-light)" : "#fff",
          minHeight: 160,
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="プレビュー" className="max-h-48 rounded-lg object-contain" />
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10" style={{ color: "var(--muted)" }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
            </svg>
            <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
              画像を選択またはドラッグ&ドロップ
            </p>
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
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          選択中: {file.name}
        </p>
      )}
      {error && <ErrorMessage message={error} />}
      <SubmitButton loading={loading} disabled={!file} />
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
      setError("音声認識に失敗しました。");
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
        お使いのブラウザは音声認識に対応していません。Chrome等をご利用ください。
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Record button */}
      <div className="flex flex-col items-center gap-4 py-4">
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
          style={{ background: recording ? "#ef4444" : "var(--primary)" }}
        >
          {recording ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          )}
        </button>
        <p className="text-sm" style={{ color: recording ? "#ef4444" : "var(--muted)" }}>
          {recording ? "録音中... タップで停止" : "タップして録音開始"}
        </p>
      </div>

      {/* Transcript */}
      <div>
        <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>
          文字起こし結果（編集可能）
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="音声を録音すると、ここに文字が表示されます..."
          rows={5}
          className="w-full rounded-xl border p-3 text-sm resize-none focus:outline-none focus:ring-2"
          style={{ borderColor: "var(--border)", background: "#fff" }}
        />
      </div>

      {error && <ErrorMessage message={error} />}
      <SubmitButton loading={loading} disabled={!transcript.trim()} />
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
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/event"
        className="w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2"
        style={{ borderColor: "var(--border)", background: "#fff" }}
        required
      />
      {error && <ErrorMessage message={error} />}
      <SubmitButton loading={loading} disabled={!url.trim()} />
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
        className="rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
        style={{
          borderColor: dragging ? "var(--primary)" : "var(--border)",
          background: dragging ? "var(--primary-light)" : "#fff",
          minHeight: 160,
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10" style={{ color: "var(--muted)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        {file ? (
          <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>{file.name}</p>
        ) : (
          <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
            ファイルを選択またはドラッグ&ドロップ<br />
            <span className="text-xs">PDF・TXT・MD対応</span>
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {error && <ErrorMessage message={error} />}
      <SubmitButton loading={loading} disabled={!file} />
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
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-sm">
          <p style={{ color: "var(--error)" }}>無効な入力タイプです。</p>
          <Link href="/" style={{ color: "var(--primary)" }} className="text-sm mt-2 inline-block">
            ← ホームに戻る
          </Link>
        </div>
      </main>
    );
  }

  const scanType = type as ScanType;

  const inputComponents: Record<ScanType, React.ReactNode> = {
    text: <TextInput />,
    image: <ImageInput />,
    audio: <AudioInput />,
    link: <LinkInput />,
    file: <FileInput />,
  };

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-sm">
        <PageHeader type={scanType} />
        {inputComponents[scanType]}
      </div>
    </main>
  );
}
