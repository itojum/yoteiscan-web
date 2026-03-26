import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#5ab5ab",
          gap: 24,
        }}
      >
        {/* Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 32,
            padding: "56px 80px",
          }}
        >
          {/* Calendar icon */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
            <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>

          {/* App name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-1px",
            }}
          >
            YoteiScan
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.85)",
              textAlign: "center",
            }}
          >
            AIでどんな媒体からでも予定を自動抽出
          </div>

          {/* Feature badges */}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {["テキスト", "画像", "音声", "リンク", "ファイル"].map((label) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.25)",
                  color: "white",
                  borderRadius: 100,
                  padding: "6px 18px",
                  fontSize: 20,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
