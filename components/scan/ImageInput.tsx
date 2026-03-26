"use client";

import { useState, useRef } from "react";
import { UploadCloud, Check } from "lucide-react";
import { useExtract } from "@/hooks/useExtract";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export function ImageInput() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const { loading, error, submit } = useExtract();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.type.startsWith("image/")) { return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
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
    formData.append("sourceType", "image");
    formData.append("image", file);
    await submit({ method: "POST", body: formData });
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
            <UploadCloud className="w-12 h-12" style={{ color: "var(--muted)" }} />
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
          <Check className="w-4 h-4" style={{ color: "var(--primary)" }} />
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
