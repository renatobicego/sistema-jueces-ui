"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import AdminNav from "@/components/organisms/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const amaUser = useAuthStore((s) => s.amaUser);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for zustand persist to rehydrate from localStorage
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // If already hydrated (e.g. store was created before this component mounted)
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && !amaUser) router.replace("/login");
  }, [hydrated, amaUser, router]);

  if (!hydrated || !amaUser) return null;

  return (
    <div className="bg-slate-50 min-h-screen">
      <AdminNav user={amaUser} />
      <main className="mx-auto px-4 py-6 max-w-7xl">{children}</main>
    </div>
  );
}
