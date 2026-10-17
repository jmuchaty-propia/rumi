"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HabitacionesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/?tab=habitaciones");
  }, [router]);
  return null;
}
