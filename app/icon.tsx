import { ImageResponse } from "next/og";
import { IconArtwork } from "@/lib/icon-image";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<IconArtwork size={32} />, size);
}
