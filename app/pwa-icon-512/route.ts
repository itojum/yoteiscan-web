import { ImageResponse } from "next/og";
import React from "react";
import { IconArtwork } from "@/lib/icon-image";

export function GET() {
  return new ImageResponse(
    React.createElement(IconArtwork, { size: 512 }),
    { width: 512, height: 512 }
  );
}
