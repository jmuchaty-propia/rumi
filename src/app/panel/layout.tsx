import type { Metadata } from "next";

// Páginas privadas: que Google no las indexe
export const metadata: Metadata = {
  title: "Mi panel — Rumi",
  robots: { index: false, follow: false },
};

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
