/** Shared icon artwork rendered at any square size via ImageResponse */
export function IconArtwork({ size }: { size: number }) {
  const r = Math.round(size * 0.18); // corner radius
  const pad = Math.round(size * 0.18);
  const inner = size - pad * 2;
  const lineH = Math.round(inner * 0.08);
  const pinW = Math.round(inner * 0.1);
  const pinH = Math.round(inner * 0.22);
  const pinTop = -(pinH / 2);
  const gridTop = Math.round(inner * 0.32);
  const gridH = inner - gridTop;
  const cellCols = 3;
  const cellRows = 2;
  const gap = Math.round(inner * 0.06);
  const cellW = Math.round((inner - gap * (cellCols - 1)) / cellCols);
  const cellH = Math.round((gridH - gap * (cellRows - 1)) / cellRows);

  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#5ab5ab",
        borderRadius: r,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Calendar body */}
      <div
        style={{
          width: inner,
          height: inner,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Top bar (header of calendar) */}
        <div
          style={{
            width: "100%",
            height: gridTop,
            background: "rgba(255,255,255,0.25)",
            borderRadius: `${r * 0.5}px ${r * 0.5}px 0 0`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />

        {/* Horizontal divider */}
        <div
          style={{
            width: "100%",
            height: lineH,
            background: "rgba(255,255,255,0.9)",
          }}
        />

        {/* Grid cells */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap,
            padding: gap,
            background: "rgba(255,255,255,0.15)",
            borderRadius: `0 0 ${r * 0.5}px ${r * 0.5}px`,
          }}
        >
          {Array.from({ length: cellRows }).map((_, row) => (
            <div key={row} style={{ display: "flex", gap, flex: 1 }}>
              {Array.from({ length: cellCols }).map((_, col) => (
                <div
                  key={col}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.85)",
                    borderRadius: Math.max(2, Math.round(gap * 0.5)),
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Pin left */}
        <div
          style={{
            position: "absolute",
            top: pinTop,
            left: Math.round(inner * 0.22),
            width: pinW,
            height: pinH,
            background: "rgba(255,255,255,0.95)",
            borderRadius: pinW,
          }}
        />
        {/* Pin right */}
        <div
          style={{
            position: "absolute",
            top: pinTop,
            right: Math.round(inner * 0.22),
            width: pinW,
            height: pinH,
            background: "rgba(255,255,255,0.95)",
            borderRadius: pinW,
          }}
        />
      </div>
    </div>
  );
}
