import { ImageResponse } from "next/og";
import { IconArtwork } from "@/lib/icon-image";

export function GET() {
  return new ImageResponse(<IconArtwork size={512} />, {
    width: 512,
    height: 512,
  });
}
