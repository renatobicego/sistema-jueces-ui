"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@heroui/react";
import { juecesApi, amaApi } from "@/lib/axios";
import type {
  Prueba,
  ConfigPrueba,
  PesoPorEdad,
  TipoMarca,
  TipoIntentos,
} from "@/types";
import { AxiosError } from "axios";
import { PressableCard } from "@/components/atoms/PressableCard";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { createOptions } from "@/lib/utils/shared";
import CustomInput from "@/components/atoms/CustomInput";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { CustomSwitch } from "@/components/atoms/CustomSwitch";
import { LoadingCenter } from "@/components/atoms/LoadingCenter";

const TIPO_MARCA_OPTIONS: TipoMarca[] = [
  "SPRINT",
  "MEDIO_FONDO",
  "FONDO",
  "MARCHA",
  "DISTANCIA",
  "LARGO",
  "ALTURA",
  "PUNTOS",
];
const TIPO_INTENTOS_OPTIONS: TipoIntentos[] = ["ninguno", "serie", "altura"];

const SEXO_OPTIONS = [
  { key: "M", label: "Masculino", value: "M" as const },
  { key: "F", label: "Femenino", value: "F" as const },
];

const emptyPeso = (): PesoPorEdad => ({
  edadMin: 0,
  edadMax: 0,
  sexo: "M",
  peso: "",
});

export default function ConfigPage() {
  const { torneoId } = useParams<{ torneoId: string }>();
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  const [selected, setSelected] = useState<Prueba | null>(null);
  const [config, setConfig] = useState<Partial<ConfigPrueba>>({
    tipoMarca: "SPRINT",
    tieneViento: false,
    tipoIntentos: "ninguno",
    maxIntentos: 0,
    pesosPorEdad: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    amaApi.get(`/torneo/${torneoId}`).then((res) => {
      const t = res.data.torneo ?? res.data;
      setPruebas(t.pruebasDisponibles ?? []);
      setLoading(false);
    });
  }, [torneoId]);

  const loadConfig = useCallback(async (prueba: Prueba) => {
    setSelected(prueba);
    setMsg("");
    try {
      const { data } = await juecesApi.get(
        `/admin/config-prueba/${prueba._id}`,
      );
      setConfig(data);
    } catch {
      setConfig({
        tipoMarca: "SPRINT",
        tieneViento: false,
        tipoIntentos: "ninguno",
        maxIntentos: 0,
        pesosPorEdad: [],
      });
    }
  }, []);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await juecesApi.put(`/admin/config-prueba/${selected._id}`, config);
      setMsg("Configuración guardada.");
    } catch (e: unknown) {
      setMsg(
        ((e as AxiosError).response?.data as { error?: string })?.error ??
          "Error al guardar.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingCenter />;

  return (
    <div className="gap-4 grid md:grid-cols-[280px_1fr]">
      <div className="space-y-2">
        <p className="font-medium text-slate-600 text-sm">
          Seleccioná una prueba
        </p>
        {pruebas.map((p) => (
          <PressableCard
            key={p._id}
            isPressable
            onPress={() => loadConfig(p)}
            className={selected?._id === p._id ? "border-2 border-primary" : ""}
          >
            <CardContent className="px-3 py-2">
              <p className="font-medium text-sm">{p.nombre}</p>
              <p className="text-slate-400 text-xs">{p.tipo}</p>
            </CardContent>
          </PressableCard>
        ))}
      </div>

      {selected && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="font-semibold text-slate-700">{selected.nombre}</h3>

            <CustomSelect
              label="Tipo de marca"
              value={config.tipoMarca ?? "SPRINT"}
              onChange={(k) =>
                setConfig((c) => ({
                  ...c,
                  tipoMarca: k,
                }))
              }
              items={createOptions(TIPO_MARCA_OPTIONS)}
            />

            <CustomSelect
              label="Tipo de intentos"
              value={config.tipoIntentos ?? "ninguno"}
              onChange={(k) =>
                setConfig((c) => ({
                  ...c,
                  tipoIntentos: k,
                }))
              }
              items={createOptions(TIPO_INTENTOS_OPTIONS)}
            />

            {config.tipoIntentos === "serie" && (
              <CustomInput
                label="Máx. intentos"
                id="intentos"
                type="number"
                value={String(config.maxIntentos ?? 0)}
                onValueChange={(v) =>
                  setConfig((c) => ({ ...c, maxIntentos: Number(v) }))
                }
              />
            )}

            <CustomSwitch
              isSelected={config.tieneViento ?? false}
              onChange={(v) => setConfig((c) => ({ ...c, tieneViento: v }))}
            >
              Tiene viento
            </CustomSwitch>

            {config.tipoMarca === "DISTANCIA" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-slate-600 text-sm">
                    Pesos por edad
                  </p>
                  <button
                    type="button"
                    className="text-primary text-sm hover:underline"
                    onClick={() =>
                      setConfig((c) => ({
                        ...c,
                        pesosPorEdad: [...(c.pesosPorEdad ?? []), emptyPeso()],
                      }))
                    }
                  >
                    + Agregar
                  </button>
                </div>
                {(config.pesosPorEdad ?? []).map((p, i) => (
                  <div
                    key={i}
                    className="items-end gap-2 grid grid-cols-[1fr_1fr_1fr_1fr_auto]"
                  >
                    <CustomInput
                      label="Edad mín"
                      id={`edad-min-${i}`}
                      type="number"
                      value={String(p.edadMin)}
                      onValueChange={(v) =>
                        setConfig((c) => {
                          const arr = [...(c.pesosPorEdad ?? [])];
                          arr[i] = { ...arr[i], edadMin: Number(v) };
                          return { ...c, pesosPorEdad: arr };
                        })
                      }
                    />
                    <CustomInput
                      label="Edad máx"
                      id={`edad-max-${i}`}
                      type="number"
                      value={String(p.edadMax)}
                      onValueChange={(v) =>
                        setConfig((c) => {
                          const arr = [...(c.pesosPorEdad ?? [])];
                          arr[i] = { ...arr[i], edadMax: Number(v) };
                          return { ...c, pesosPorEdad: arr };
                        })
                      }
                    />
                    <CustomSelect
                      label="Sexo"
                      value={p.sexo}
                      onChange={(v) =>
                        setConfig((c) => {
                          const arr = [...(c.pesosPorEdad ?? [])];
                          arr[i] = { ...arr[i], sexo: v as "M" | "F" };
                          return { ...c, pesosPorEdad: arr };
                        })
                      }
                      items={SEXO_OPTIONS}
                    />
                    <CustomInput
                      label="Peso (kg)"
                      id={`peso-${i}`}
                      value={p.peso}
                      onValueChange={(v) =>
                        setConfig((c) => {
                          const arr = [...(c.pesosPorEdad ?? [])];
                          arr[i] = { ...arr[i], peso: v };
                          return { ...c, pesosPorEdad: arr };
                        })
                      }
                    />
                    <button
                      type="button"
                      className="mb-1 text-red-400 hover:text-red-600 text-sm"
                      onClick={() =>
                        setConfig((c) => ({
                          ...c,
                          pesosPorEdad: (c.pesosPorEdad ?? []).filter(
                            (_, j) => j !== i,
                          ),
                        }))
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {msg && <p className="text-slate-600 text-sm">{msg}</p>}

            <SubmitButton
              variant="primary"
              submitting={saving}
              onPress={handleSave}
            >
              Guardar configuración
            </SubmitButton>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
