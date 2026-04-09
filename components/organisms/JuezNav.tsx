"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { StatusChip } from "@/components/atoms/StatusChip";
import { useAuthStore } from "@/store/authStore";

export default function JuezNav() {
  const router = useRouter();
  const { juezSession, clearJuezSession } = useAuthStore();

  const handleLogout = () => {
    clearJuezSession();
    router.push("/juez/login");
  };

  return (
    <nav className="flex justify-between items-center px-4 py-3 border-b">
      <Link
        href={
          juezSession ? `/juez/${juezSession.torneoId}/pruebas` : "/juez/login"
        }
        className="font-bold text-slate-800"
      >
        Sistema Jueces
      </Link>
      <div className="flex items-center gap-3">
        {juezSession && (
          <>
            <span className="text-slate-600 text-sm">{juezSession.nombre}</span>
            {juezSession.esSuperJuez && (
              <StatusChip color="accent" variant="soft" size="sm">
                Super Juez
              </StatusChip>
            )}
          </>
        )}
        <Button size="sm" variant="danger-soft" onPress={handleLogout}>
          Salir
        </Button>
      </div>
    </nav>
  );
}
