"use client";
import { useParams } from "next/navigation";
import { Tabs, TabList, Tab, TabPanel } from "@heroui/react";
import { useEventoAtletas } from "@/hooks/useEventoAtletas";
import ResultadosGrid from "@/components/organisms/ResultadosGrid";
import RegistrarAtletaModal from "@/components/organisms/RegistrarAtletaModal";
import { LoadingCenter } from "@/components/atoms/LoadingCenter";
import { ErrorText } from "@/components/atoms/ErrorText";

export default function ResultadoPage() {
  const { torneoId, pruebaId, categoriaId } = useParams<{
    torneoId: string;
    pruebaId: string;
    categoriaId: string;
  }>();

  const { data, loading, error, reload } = useEventoAtletas(
    torneoId,
    categoriaId,
    pruebaId,
  );

  if (loading) return <LoadingCenter />;
  if (error || !data)
    return <ErrorText message={error ?? "Error al cargar datos."} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-slate-800 text-xl">
          Carga de resultados
        </h1>
        <RegistrarAtletaModal
          torneoId={torneoId}
          pruebaId={pruebaId}
          categoriaId={categoriaId}
          onSuccess={reload}
        />
      </div>

      <Tabs>
        <TabList aria-label="Sexo">
          <Tab id="M">Masculino ({data.masculino.atletas.length})</Tab>
          <Tab id="F">Femenino ({data.femenino.atletas.length})</Tab>
        </TabList>
        <TabPanel id="M">
          <ResultadosGrid
            atletas={data.masculino.atletas}
            config={data.config}
            resultadoId={data.masculino.resultadoId}
            torneoId={torneoId}
            pruebaId={pruebaId}
            categoriaId={categoriaId}
            sexo="M"
            onSaved={reload}
          />
        </TabPanel>
        <TabPanel id="F">
          <ResultadosGrid
            atletas={data.femenino.atletas}
            config={data.config}
            resultadoId={data.femenino.resultadoId}
            torneoId={torneoId}
            pruebaId={pruebaId}
            categoriaId={categoriaId}
            sexo="F"
            onSaved={reload}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
}
