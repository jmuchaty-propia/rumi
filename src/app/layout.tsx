import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Rumi — Encuentra tu cuarto ideal en Venezuela",
  description:
    "Busca habitaciones, publica tu cuarto o crea tu perfil de búsqueda. Contacto directo por WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          crossOrigin=""
          defer
        ></script>
      </head>
      <body className="antialiased min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
