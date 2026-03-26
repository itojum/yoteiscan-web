"use client";

import { useState } from "react";
import { useExtract } from "@/hooks/useExtract";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export function LinkInput() {
  const [url, setUrl] = useState("");
  const { loading, error, submit } = useExtract();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceType: "link", url }),
    });
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
          disabled={loading}
          className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
