"use client";

import { useState } from "react";
import { useExtract } from "@/hooks/useExtract";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export function TextInput() {
  const [text, setText] = useState("");
  const { loading, error, submit } = useExtract();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceType: "text", content: text }),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="予定情報を含むテキストをここに貼り付けてください..."
        disabled={loading}
        className="flex-1 w-full rounded-xl border p-4 text-sm resize-none focus:outline-none focus:ring-2 min-h-48 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ borderColor: "var(--border)", background: "#fff", lineHeight: 1.7 }}
      />
      {error && <ErrorMessage message={error} />}
      <div className="flex justify-end">
        <SubmitButton loading={loading} disabled={!text.trim()} />
      </div>
    </form>
  );
}
