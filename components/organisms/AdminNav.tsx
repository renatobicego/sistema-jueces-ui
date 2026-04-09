"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { useAuthStore } from "@/store/authStore";
import type { AmaUser } from "@/types";

export default function AdminHeader({ user }: { user: AmaUser }) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="bg-white border-b w-full">
      <div className="flex justify-between items-center mx-auto px-4 max-w-7xl h-14">
        {/* Left */}
        <Link href="/admin/torneos" className="font-bold text-slate-800">
          Sistema Jueces
        </Link>

        {/* Right */}
        <div className="flex items-center gap-4">
          <span className="text-slate-600 text-sm">{user.nombre_apellido}</span>

          <Button size="sm" variant="danger-soft" onPress={handleLogout}>
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
