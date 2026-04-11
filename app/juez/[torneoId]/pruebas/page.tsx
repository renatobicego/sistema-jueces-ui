"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { usePruebas } from "@/hooks/usePruebas";
import { useEventoAtletas } from "@/hooks/useEventoAtletas";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import ResultadosGrid from "@/components/organisms/ResultadosGrid";
import RegistrarAtletaModal from "@/components/organisms/RegistrarAtletaModal";
import { LoadingCenter } from "@/components/atoms/LoadingCenter";
import { ErrorText } from "@/components/atoms/ErrorText";
import type { Prueba, Categoria } from "@/types";

const SEXO_OPTIONS = [
  { key: "M", label: "Masculino", value: "M" as const },
  { key: "F", label: "Femenino", value: "F" as const },
];

export default function PruebasPage() {
  const { torneoId } = useParams<{ torneoId: string }>();
  const { pruebas, loading, error } = usePruebas(torneoId);

  const [selectedPrueba, setSelectedPrueba] = useState<Prueba | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(
    null,
  );
  const [selectedSexo, setSelectedSexo] = useState<"M" | "F" | null>(null);

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

  const handlePruebaChange = (p: Prueba) => {
    setSelectedPrueba(p);
    setSelectedCategoria(null);
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
          onChange={setSelectedCategoria}
        />
        <CustomSelect
          label="Sexo"
          placeholder="Seleccioná sexo"
          items={SEXO_OPTIONS}
          value={selectedSexo ?? undefined}
          onChange={setSelectedSexo}
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
                <RegistrarAtletaModal
                  torneoId={torneoId}
                  pruebaId={selectedPrueba._id}
                  categoriaId={selectedCategoria!._id}
                  onSuccess={reload}
                />
              </div>
              <ResultadosGrid
                atletas={sexoData?.atletas ?? []}
                config={data.config}
                resultadoId={sexoData?.resultadoId ?? null}
                torneoId={torneoId}
                pruebaId={selectedPrueba._id}
                categoriaId={selectedCategoria!._id}
                sexo={selectedSexo}
                onSaved={reload}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
