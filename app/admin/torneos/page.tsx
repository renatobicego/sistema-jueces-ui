"use client";
import { useRouter } from "next/navigation";
import { Alert, CardContent, Chip } from "@heroui/react";
import { useTorneos } from "@/hooks/useTorneos";
import type { Torneo } from "@/types";
import { PressableCard } from "@/components/atoms/PressableCard";
import { LoadingCenter } from "@/components/atoms/LoadingCenter";

export default function AdminTorneosPage() {
  const router = useRouter();
  const { torneos, loading, soloActivos, setSoloActivos } = useTorneos();

  const handleSelect = (t: Torneo) => {
    router.push(`/admin/${t._id}/jueces`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-slate-800 text-2xl">Torneos</h1>
        <label className="flex items-center gap-2 text-slate-600 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={soloActivos}
            onChange={(e) => setSoloActivos(e.target.checked)}
            className="rounded"
          />
          Solo activos (±2 semanas)
        </label>
      </div>

      {loading && <LoadingCenter />}
      {!loading && !torneos.length && (
        <Alert>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              No se encontraron torneos cercanos a dos semanas.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-3">
        {torneos.map((t) => (
          <PressableCard
            key={t._id}
            isPressable
            onPress={() => handleSelect(t)}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="space-y-1 p-4">
              <div className="flex justify-between items-start gap-2">
                <p className="font-semibold text-slate-800">{t.nombre}</p>
                <Chip
                  size="sm"
                  color={t.inscripcionesAbiertas ? "success" : "default"}
                  variant="soft"
                >
                  {t.inscripcionesAbiertas ? "Abierto" : "Cerrado"}
                </Chip>
              </div>
              <p className="text-slate-500 text-sm">{t.lugar}</p>
              <p className="text-slate-400 text-xs">
                {new Date(t.fecha).toLocaleDateString("es-AR")}
              </p>
            </CardContent>
          </PressableCard>
        ))}
      </div>
    </div>
  );
}
