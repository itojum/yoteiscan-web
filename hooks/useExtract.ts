"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useExtract() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(init: RequestInit) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/extract", init);
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

  return { loading, error, submit };
}
