"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@heroui/react";
import { juecesApi } from "@/lib/axios";
import { amaApi } from "@/lib/axios";
import JuecesGrid from "@/components/organisms/JuecesGrid";
import { StatusChip } from "@/components/atoms/StatusChip";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import CustomInput from "@/components/atoms/CustomInput";
import type { AccesoJuez, Prueba } from "@/types";
import { LoadingCenter } from "@/components/atoms/LoadingCenter";

export default function JuecesPage() {
  const { torneoId } = useParams<{ torneoId: string }>();
  const [jueces, setJueces] = useState<AccesoJuez[]>([]);
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [pinMsg, setPinMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [juecesRes, torneoRes] = await Promise.all([
        juecesApi.get(`/admin/torneo/${torneoId}/jueces`),
        amaApi.get(`/torneo/${torneoId}`),
      ]);
      setJueces(juecesRes.data);
      const torneoData = torneoRes.data.torneo ?? torneoRes.data;
      setPruebas(torneoData.pruebasDisponibles ?? []);
    } finally {
      setLoading(false);
    }
  }, [torneoId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAprobar = async (
    juezId: string,
    aprobado: boolean,
    pruebasAsignadas: string[],
  ) => {
    await juecesApi.patch(`/admin/juez/${juezId}/aprobar`, {
      aprobado,
      pruebasAsignadas,
    });
    load();
  };

  const handleEliminar = async (juezId: string) => {
    await juecesApi.delete(`/admin/juez/${juezId}`);
    load();
  };

  const handleSetPin = async () => {
    setPinLoading(true);
    try {
      await juecesApi.post(`/admin/torneo/${torneoId}/pin`, { pin });
      setPinMsg("PIN actualizado correctamente.");
      setPin("");
    } catch (e: unknown) {
      console.log(e);
      const err = e as { response?: { data?: { error?: string } } };
      setPinMsg(err.response?.data?.error ?? "Error al actualizar el PIN.");
    } finally {
      setPinLoading(false);
    }
  };

  if (loading) return <LoadingCenter />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-slate-700 text-xl">
          Jueces ({jueces.length})
        </h2>
        <div className="flex gap-2">
          <StatusChip color="warning" variant="soft" size="sm">
            {jueces.filter((j) => !j.aprobado).length} pendientes
          </StatusChip>
          <Button
            size="sm"
            variant="ghost"
            onPress={() => setPinModalOpen(true)}
          >
            Configurar PIN
          </Button>
        </div>
      </div>

      <JuecesGrid
        jueces={jueces}
        pruebas={pruebas}
        onAprobar={handleAprobar}
        onEliminar={handleEliminar}
      />

      {/* PIN Modal */}
      {pinModalOpen && (
        <div className="z-50 fixed inset-0 flex justify-center items-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPinModalOpen(false)}
          />
          <div className="relative space-y-4 bg-white shadow-lg p-6 rounded-2xl w-full max-w-sm">
            <h3 className="font-semibold text-slate-800 text-lg">
              PIN del torneo
            </h3>
            <p className="text-slate-600 text-sm">
              Todos los jueces usan el mismo PIN para autenticarse.
            </p>
            <div className="space-y-1">
              <label className="font-medium text-slate-600 text-sm">
                Nuevo PIN
              </label>
              <CustomInput
                label="Nuevo PIN"
                type="password"
                value={pin}
                onValueChange={setPin}
                placeholder="Mínimo 4 caracteres"
              />
            </div>
            {pinMsg && <p className="text-slate-600 text-sm">{pinMsg}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onPress={() => setPinModalOpen(false)}>
                Cancelar
              </Button>
              <SubmitButton
                type="button"
                variant="primary"
                submitting={pinLoading}
                fullWidth={false}
                onPress={handleSetPin}
              >
                Guardar PIN
              </SubmitButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
