import {
  GoogleGenerativeAI,
  type Part,
  type Schema,
} from "@google/generative-ai";
import { ExtractResponseSchema, type ExtractResponse } from "./schemas";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const responseSchema: Schema = {
  type: "object",
  properties: {
    events: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          startDateTime: { type: "string" },
          endDateTime: { type: "string" },
          allDay: { type: "boolean", nullable: true },
          location: { type: "string", nullable: true },
          memo: { type: "string", nullable: true },
        },
        required: ["title", "startDateTime", "endDateTime", "allDay"],
      },
    },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["events", "warnings"],
} as Schema;

function buildSystemPrompt(now: Date): string {
  const jstOffset = 9 * 60;
  const jstMs = now.getTime() + (now.getTimezoneOffset() + jstOffset) * 60000;
  const jst = new Date(jstMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  const nowStr = `${jst.getFullYear()}-${pad(jst.getMonth() + 1)}-${pad(jst.getDate())}T${pad(jst.getHours())}:${pad(jst.getMinutes())}:00+09:00`;

  return `あなたは予定抽出の専門家です。与えられたコンテンツから予定・イベントを抽出してください。

現在日時（Asia/Tokyo）: ${nowStr}

ルール:
1. 「明日」「来週」「明後日」「今週末」などの相対的な表現は、上記の現在日時を基準に解決してください。時刻が不明な場合のみstartDateTime/endDateTimeを空文字列にしてください。
2. タイムゾーンはAsia/Tokyo（+09:00）を使用してください。例: "2026-04-01T10:00:00+09:00"
3. 年が省略されている場合は現在年（${jst.getFullYear()}年）として解釈してください。
4. allDayが不明な場合はnullにしてください。
5. 終日イベントの場合、startDateTime/endDateTimeは "YYYY-MM-DDT00:00:00+09:00" 形式にしてください。
6. warningsはユーザーへの確認・補足メッセージとして書いてください（日本語・丁寧語）。システムの内部動作（「〇〇をnullにしました」等）は書かず、「〇〇が不明なため、カレンダーに登録する前にご確認ください」のようなユーザー向けの表現にしてください。
7. 予定が見つからない場合はeventsを空配列にしてください。
8. memoフィールドには備考・URL・追加情報などを入れてください。`;
}

export async function extractEvents(
  textContent: string,
  imageParts?: Part[]
): Promise<ExtractResponse> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
    },
    systemInstruction: buildSystemPrompt(new Date()),
  });

  const parts: Part[] = [];

  if (imageParts && imageParts.length > 0) {
    parts.push(...imageParts);
    parts.push({ text: "上記の画像から予定・イベントを抽出してください。" });
  } else {
    parts.push({ text: `以下のコンテンツから予定・イベントを抽出してください:\n\n${textContent}` });
  }

  const result = await model.generateContent({ contents: [{ role: "user", parts }] });
  const responseText = result.response.text();

  const parsed = JSON.parse(responseText);
  return ExtractResponseSchema.parse(parsed);
}
