"use client";

import { useState, useRef } from "react";
import { useExtract } from "@/hooks/useExtract";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export function FileInput() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const { loading, error, submit } = useExtract();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    const name = f.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".txt") && !name.endsWith(".md")) return;
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
    const formData = new FormData();
    formData.append("sourceType", "file");
    formData.append("file", file);
    await submit({ method: "POST", body: formData });
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
