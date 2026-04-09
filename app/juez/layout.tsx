"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import JuezNav from "@/components/organisms/JuezNav";

export default function JuezLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const juezSession = useAuthStore((s) => s.juezSession);

  useEffect(() => {
    // Allow unauthenticated access to /juez/login
    if (!juezSession && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (!path.includes("/juez/login")) router.replace("/juez/login");
    }
  }, [juezSession, router]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {juezSession && <JuezNav />}
      <main className="mx-auto px-4 py-6 max-w-7xl">{children}</main>
    </div>
  );
}
