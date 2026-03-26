import { ImageResponse } from "next/og";
import { IconArtwork } from "@/lib/icon-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<IconArtwork size={180} />, size);
}
