import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { extractEvents } from "@/lib/gemini";
import type { Part } from "@google/generative-ai";

export const runtime = "nodejs";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(ip);

  if (!rateCheck.allowed) {
    return Response.json(
      { error: "リクエスト制限に達しました。1時間に5回まで利用できます。" },
      { status: 429 }
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const sourceType = formData.get("sourceType") as string;

      if (sourceType === "image") {
        const imageFile = formData.get("image") as File | null;
        if (!imageFile) {
          return Response.json({ error: "画像ファイルが必要です。" }, { status: 400 });
        }
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const imagePart: Part = {
          inlineData: { data: base64, mimeType: imageFile.type },
        };
        const result = await extractEvents("", [imagePart]);
        return Response.json(result);
      }

      if (sourceType === "file") {
        const file = formData.get("file") as File | null;
        if (!file) {
          return Response.json({ error: "ファイルが必要です。" }, { status: 400 });
        }

        const fileName = file.name.toLowerCase();
        let text: string;

        if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
          text = await file.text();
        } else if (fileName.endsWith(".pdf")) {
          const { PDFParse } = await import("pdf-parse");
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const parser = new PDFParse({ data: buffer });
          const result = await parser.getText();
          text = result.text;
        } else {
          return Response.json(
            { error: "対応していないファイル形式です。PDF・TXT・MDのみ対応しています。" },
            { status: 400 }
          );
        }

        if (!text.trim()) {
          return Response.json({ error: "ファイルからテキストを抽出できませんでした。" }, { status: 400 });
        }

        const result = await extractEvents(text);
        return Response.json(result);
      }

      return Response.json({ error: "不明なsourceTypeです。" }, { status: 400 });
    }

    // JSON body
    const body = await request.json();
    const { sourceType, content, url } = body;

    if (sourceType === "text" || sourceType === "audio") {
      if (!content || typeof content !== "string" || !content.trim()) {
        return Response.json({ error: "テキストが必要です。" }, { status: 400 });
      }
      const result = await extractEvents(content);
      return Response.json(result);
    }

    if (sourceType === "link") {
      if (!url || typeof url !== "string") {
        return Response.json({ error: "URLが必要です。" }, { status: 400 });
      }

      let fetchedText: string;
      try {
        const response = await fetch(`https://r.jina.ai/${url}`, {
          headers: { "User-Agent": "YoteiScan/1.0" },
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) {
          if (response.status === 429) {
            console.error("[extract] Jina.ai rate limit exceeded:", url);
          }
          return Response.json(
            { error: `URLの取得に失敗しました（HTTP ${response.status}）。` },
            { status: 400 }
          );
        }
        fetchedText = (await response.text()).substring(0, 10000);
      } catch {
        return Response.json(
          { error: "URLの取得に失敗しました。URLが正しいか確認してください。" },
          { status: 400 }
        );
      }

      if (!fetchedText.trim()) {
        return Response.json({ error: "URLからコンテンツを取得できませんでした。" }, { status: 400 });
      }

      const result = await extractEvents(fetchedText);
      return Response.json(result);
    }

    return Response.json({ error: "不明なsourceTypeです。" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "不明なエラー";
    console.error("[extract] error:", message);
    return Response.json(
      { error: "解析に失敗しました。しばらくしてから再度お試しください。" },
      { status: 500 }
    );
  }
}
