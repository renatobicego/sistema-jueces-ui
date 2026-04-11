"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import JuezNav from "@/components/organisms/JuezNav";
import Providers from "../providers";

export default function JuezLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const juezSession = useAuthStore((s) => s.juezSession);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!juezSession) {
      const path = window.location.pathname;
      if (!path.includes("/juez/login")) router.replace("/juez/login");
    }
  }, [hydrated, juezSession, router]);

  if (!hydrated) return null;

  return (
    <div className="bg-slate-50 min-h-screen">
      <Providers />
      {juezSession && <JuezNav />}
      <main className="mx-auto px-4 py-6 max-w-7xl">{children}</main>
    </div>
  );
}
