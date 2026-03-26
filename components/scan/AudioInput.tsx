"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square } from "lucide-react";
import { useExtract } from "@/hooks/useExtract";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

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

export function AudioInput() {
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [supported] = useState(() => {
    if (typeof window === "undefined") return true;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const { loading, error, submit } = useExtract();
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

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
    };

    recognition.onend = () => {
      setTranscript(finalTranscript);
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }, [transcript]);

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!transcript.trim()) return;
    await submit({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceType: "audio", content: transcript }),
    });
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
          disabled={loading}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: recording ? "#ef4444" : "var(--primary)" }}
        >
          {recording ? (
            <Square className="w-6 h-6" fill="currentColor" />
          ) : (
            <Mic className="w-6 h-6" />
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
          disabled={loading}
          className="w-full rounded-xl border p-4 text-sm resize-none focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
