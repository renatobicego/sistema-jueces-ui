"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@heroui/react";
import { juecesApi } from "@/lib/axios";
import CustomInput from "@/components/atoms/CustomInput";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { ErrorText } from "@/components/atoms/ErrorText";
import { CustomSwitch } from "@/components/atoms/CustomSwitch";

export default function ExportarPage() {
  const { torneoId } = useParams<{ torneoId: string }>();
  const [customId, setCustomId] = useState("");
  const [alcance, setAlcance] = useState("Provincial");
  const [nivel, setNivel] = useState("Club");
  const [pais, setPais] = useState("ARG");
  const [soloCada, setSoloCada] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = soloCada
        ? `/admin/torneo/${torneoId}/export/cada`
        : `/admin/torneo/${torneoId}/export`;

      const res = await juecesApi.get(endpoint, {
        params: { customId, alcanceGeografico: alcance, nivel, pais },
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_${torneoId}${soloCada ? "_cada" : ""}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Error al exportar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6 max-w-md">
        <h2 className="font-semibold text-slate-700">
          Exportar resultados (MDB)
        </h2>

        <CustomInput
          label="ID personalizado (ej: VEN26-MZA)"
          value={customId}
          onValueChange={setCustomId}
        />
        <CustomInput
          label="Alcance geográfico"
          value={alcance}
          onValueChange={setAlcance}
        />
        <CustomInput label="Nivel" value={nivel} onValueChange={setNivel} />
        <CustomInput label="País" value={pais} onValueChange={setPais} />

        <CustomSwitch isSelected={soloCada} onChange={(v) => setSoloCada(v)}>
          Solo federados (CADA)
        </CustomSwitch>

        {error && <ErrorText message={error} />}

        <SubmitButton
          type="button"
          variant="primary"
          submitting={loading}
          onPress={handleExport}
        >
          Descargar ZIP
        </SubmitButton>
      </CardContent>
    </Card>
  );
}
