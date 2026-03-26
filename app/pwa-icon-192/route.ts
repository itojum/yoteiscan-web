import { ImageResponse } from "next/og";
import React from "react";
import { IconArtwork } from "@/lib/icon-image";

export function GET() {
  return new ImageResponse(
    React.createElement(IconArtwork, { size: 192 }),
    { width: 192, height: 192 }
  );
}
