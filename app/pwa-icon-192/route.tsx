import { ImageResponse } from "next/og";
import { IconArtwork } from "@/lib/icon-image";

export function GET() {
  return new ImageResponse(<IconArtwork size={192} />, {
    width: 192,
    height: 192,
  });
}
