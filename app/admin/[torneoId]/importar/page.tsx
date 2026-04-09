"use client";
import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Chip, Card, CardContent } from "@heroui/react";
import { juecesApi } from "@/lib/axios";
import ImportErrorsGrid from "@/components/organisms/ImportErrorsGrid";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { ErrorText } from "@/components/atoms/ErrorText";

interface FilaFallida {
  fila: number;
  dni: string;
  nombre: string;
  prueba: string;
  categoria: string;
  motivo: string;
}

interface ImportResult {
  totalFilas: number;
  exitosas: number;
  fallidas: number;
  filasFallidas: FilaFallida[];
}

export default function ImportarPage() {
  const { torneoId } = useParams<{ torneoId: string }>();
  const [tipo, setTipo] = useState<"cada" | "libre">("cada");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Seleccioná un archivo.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("archivo", file);
      const { data } = await juecesApi.post(
        `/admin/torneo/${torneoId}/import/${tipo}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setResult(data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error ?? "Error al importar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold text-slate-700">
            Importar atletas desde XLS
          </h2>

          <CustomSelect
            label="Tipo de importación"
            value={tipo}
            onChange={setTipo}
            items={[
              { key: "cada", label: "CADA (federados)", value: "cada" },
              { key: "libre", label: "Libre (no federados)", value: "libre" },
            ]}
          />

          <div className="space-y-1">
            <label className="font-medium text-slate-600 text-sm">
              Archivo XLS/XLSX
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".xls,.xlsx"
              className="block hover:file:bg-primary-100 file:bg-primary-50 file:mr-4 file:px-4 file:py-2 file:border-0 file:rounded w-full file:font-medium text-slate-500 file:text-primary-700 text-sm file:text-sm"
            />
          </div>

          {error && <ErrorText message={error} />}

          <SubmitButton
            variant="primary"
            submitting={loading}
            onPress={handleImport}
          >
            Importar
          </SubmitButton>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <Chip color="default" variant="soft">
              Total: {result.totalFilas}
            </Chip>
            <Chip color="success" variant="soft">
              Exitosas: {result.exitosas}
            </Chip>
            <Chip color="danger" variant="soft">
              Fallidas: {result.fallidas}
            </Chip>
          </div>
          {result.filasFallidas.length > 0 && (
            <ImportErrorsGrid rows={result.filasFallidas} />
          )}
        </div>
      )}
    </div>
  );
}
