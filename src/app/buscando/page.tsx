"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BuscandoPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/?tab=buscando");
  }, [router]);
  return null;
}
