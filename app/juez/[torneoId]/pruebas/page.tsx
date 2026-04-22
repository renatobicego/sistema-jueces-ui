"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@heroui/react";
import { usePruebas } from "@/hooks/usePruebas";
import { useEventoAtletas } from "@/hooks/useEventoAtletas";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { HeatSelector } from "@/components/atoms/HeatSelector";
import ResultadosGrid from "@/components/organisms/ResultadosGrid";
import RegistrarAtletaModal from "@/components/organisms/RegistrarAtletaModal";
import HeatManagementModal from "@/components/organisms/HeatManagementModal";
import { LoadingCenter } from "@/components/atoms/LoadingCenter";
import { ErrorText } from "@/components/atoms/ErrorText";
import { useAuthStore } from "@/store/authStore";
import type { Prueba, Categoria } from "@/types";
import type { ResultadosGridRef } from "@/components/organisms/ResultadosGrid";

const SEXO_OPTIONS = [
  { key: "M", label: "Masculino", value: "M" as const },
  { key: "F", label: "Femenino", value: "F" as const },
];

const STORAGE_KEYS = {
  PRUEBA: "juez_pruebas_selectedPrueba",
  CATEGORIA: "juez_pruebas_selectedCategoria",
  SEXO: "juez_pruebas_selectedSexo",
  HEAT: "juez_pruebas_selectedHeat",
};

export default function PruebasPage() {
  const { torneoId } = useParams<{ torneoId: string }>();
  const { pruebas, loading, error } = usePruebas(torneoId);
  const esSuperJuez = useAuthStore((s) => s.juezSession?.esSuperJuez ?? false);

  const [selectedPrueba, setSelectedPrueba] = useState<Prueba | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(
    null,
  );
  const [selectedSexo, setSelectedSexo] = useState<"M" | "F" | null>(null);
  const [selectedHeat, setSelectedHeat] = useState<string>("Final_A");
  const [showHeatManagementModal, setShowHeatManagementModal] = useState(false);
  const resultadosGridRef = useRef<ResultadosGridRef>(null);

  const canFetch = !!(selectedPrueba && selectedCategoria && selectedSexo);

  const {
    data,
    loading: loadingEvento,
    error: errorEvento,
    reload,
  } = useEventoAtletas(
    torneoId,
    selectedCategoria?._id ?? "",
    selectedPrueba?._id ?? "",
    selectedHeat,
  );

  const pruebaOptions = pruebas.map((p) => ({
    key: p._id,
    label: p.nombre,
    value: p,
  }));

  const categoriaOptions = (selectedPrueba?.categorias ?? []).map((c) => ({
    key: c._id,
    label: c.nombre,
    value: c,
  }));

  // Restore from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined" || !pruebas.length) return;

    const storedPruebaId = sessionStorage.getItem(STORAGE_KEYS.PRUEBA);
    const storedCategoriaId = sessionStorage.getItem(STORAGE_KEYS.CATEGORIA);
    const storedSexo = sessionStorage.getItem(STORAGE_KEYS.SEXO) as
      | "M"
      | "F"
      | null;
    const storedHeat = sessionStorage.getItem(STORAGE_KEYS.HEAT) ?? "Final_A";

    if (storedPruebaId) {
      const prueba = pruebas.find((p) => p._id === storedPruebaId);
      if (prueba) {
        setSelectedPrueba(prueba);

        if (storedCategoriaId) {
          const categoria = prueba.categorias.find(
            (c) => c._id === storedCategoriaId,
          );
          if (categoria) {
            setSelectedCategoria(categoria);
          }
        }
      }
    }

    if (storedSexo) {
      setSelectedSexo(storedSexo);
    }

    if (storedHeat) {
      setSelectedHeat(storedHeat);
    }
  }, [pruebas]);

  const handlePruebaChange = (p: Prueba) => {
    setSelectedPrueba(p);
    setSelectedCategoria(null);
    setSelectedHeat("Final_A"); // Reset heat when prueba changes
    sessionStorage.setItem(STORAGE_KEYS.PRUEBA, p._id);
    sessionStorage.removeItem(STORAGE_KEYS.CATEGORIA);
    sessionStorage.setItem(STORAGE_KEYS.HEAT, "Final_A");
  };

  const handleCategoriaChange = (c: Categoria) => {
    setSelectedCategoria(c);
    sessionStorage.setItem(STORAGE_KEYS.CATEGORIA, c._id);
  };

  const handleSexoChange = (sexo: "M" | "F") => {
    setSelectedSexo(sexo);
    sessionStorage.setItem(STORAGE_KEYS.SEXO, sexo);
  };

  const handleHeatChange = (heat: string) => {
    setSelectedHeat(heat);
    sessionStorage.setItem(STORAGE_KEYS.HEAT, heat);
  };

  const handleManageHeatsClick = () => {
    setShowHeatManagementModal(true);
  };

  const handleHeatManagementSuccess = () => {
    setShowHeatManagementModal(false);
    reload(); // Refresh data after successful heat creation
  };

  if (loading) return <LoadingCenter />;
  if (error) return <ErrorText message={error} />;

  const sexoData = selectedSexo === "M" ? data?.masculino : data?.femenino;

  return (
    <div className="space-y-6">
      <h1 className="font-bold text-slate-800 text-2xl">Mis pruebas</h1>

      <div className="gap-4 grid sm:grid-cols-3">
        <CustomSelect
          label="Prueba"
          placeholder="Seleccioná una prueba"
          items={pruebaOptions}
          value={selectedPrueba ?? undefined}
          onChange={handlePruebaChange}
        />
        <CustomSelect
          label="Categoría"
          placeholder="Seleccioná una categoría"
          items={categoriaOptions}
          value={selectedCategoria ?? undefined}
          onChange={handleCategoriaChange}
        />
        <CustomSelect
          label="Sexo"
          placeholder="Seleccioná sexo"
          items={SEXO_OPTIONS}
          value={selectedSexo ?? undefined}
          onChange={handleSexoChange}
        />
      </div>

      {canFetch && (
        <>
          {loadingEvento && <LoadingCenter />}
          {errorEvento && <ErrorText message={errorEvento} />}
          {!loadingEvento && data && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-slate-700">
                  {selectedPrueba.nombre} — {selectedCategoria!.nombre} —{" "}
                  {selectedSexo === "M" ? "Masculino" : "Femenino"}
                </p>
                <div className="flex items-center gap-3">
                  <RegistrarAtletaModal
                    torneoId={torneoId}
                    pruebaId={selectedPrueba._id}
                    categoriaId={selectedCategoria!._id}
                    onSuccess={async () => {
                      await resultadosGridRef.current?.handleSaveAll();
                    }}
                  />
                  {esSuperJuez && (
                    <Button
                      variant="secondary"
                      onPress={handleManageHeatsClick}
                    >
                      Gestionar Series
                    </Button>
                  )}
                </div>
              </div>

              {/* Heat Selector */}
              <HeatSelector
                torneoId={torneoId}
                pruebaId={selectedPrueba._id}
                categoriaId={selectedCategoria!._id}
                selectedHeat={selectedHeat}
                onHeatChange={handleHeatChange}
                sexo={selectedSexo}
              />

              <ResultadosGrid
                ref={resultadosGridRef}
                atletas={sexoData?.atletas ?? []}
                config={data.config}
                resultadoId={sexoData?.resultadoId ?? null}
                torneoId={torneoId}
                pruebaId={selectedPrueba._id}
                categoriaId={selectedCategoria!._id}
                sexo={selectedSexo}
                onSaved={reload}
                serie={selectedHeat}
                pruebaName={selectedPrueba.nombre}
              />
            </div>
          )}
        </>
      )}

      {/* Heat Management Modal */}
      {showHeatManagementModal &&
        selectedPrueba &&
        selectedCategoria &&
        selectedSexo && (
          <HeatManagementModal
            torneoId={torneoId}
            pruebaId={selectedPrueba._id}
            categoriaId={selectedCategoria._id}
            sexo={selectedSexo}
            currentHeat={selectedHeat}
            config={data?.config ?? null}
            athletes={data}
            saveAll={async () =>
              await resultadosGridRef.current?.handleSaveAll()
            }
            onClose={() => setShowHeatManagementModal(false)}
            onSuccess={handleHeatManagementSuccess}
          />
        )}
    </div>
  );
}
