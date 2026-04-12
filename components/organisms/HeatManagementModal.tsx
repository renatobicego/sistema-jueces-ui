"use client";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  Button,
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
  useOverlayState,
  toast,
} from "@heroui/react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import CustomInput from "@/components/atoms/CustomInput";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { createHeats, fetchHeats } from "@/lib/api/heats";
import { useAuthStore } from "@/store/authStore";
import type {
  ConfigPrueba,
  AthleteForProgression,
  EventoAtletas,
} from "@/types";

ModuleRegistry.registerModules([AllCommunityModule]);

interface HeatManagementModalProps {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: "M" | "F";
  currentHeat: string;
  athletes: EventoAtletas | null;
  config: ConfigPrueba | null;
  onClose: () => void;
  onSuccess: () => void;
}

type HeatMode =
  | "create-series"
  | "create-semifinal"
  | "create-final-a"
  | "create-final-b";

export default function HeatManagementModal({
  torneoId,
  pruebaId,
  categoriaId,
  sexo,
  currentHeat,
  athletes: data,
  // config is passed but not used in this component
  onClose,
  onSuccess,
}: HeatManagementModalProps) {
  const state = useOverlayState({ defaultOpen: true });
  const token = useAuthStore((s) => s.juezSession?.token ?? "");
  const gridRef = useRef<AgGridReact<AthleteForProgression>>(null);

  const [mode, setMode] = useState<HeatMode>("create-series");
  const [athletesPerSeries, setAthletesPerSeries] = useState<string>("8");
  const [loading, setLoading] = useState(false);
  const [availableHeats, setAvailableHeats] = useState<string[]>([]);
  const [sourceHeats, setSourceHeats] = useState<string[]>([]);
  const [athletes, setAthletes] = useState<AthleteForProgression[]>([]);

  // Determine available modes based on current state
  useEffect(() => {
    const loadHeats = async () => {
      try {
        const { heats } = await fetchHeats({
          torneoId,
          pruebaId,
          categoriaId,
        });
        setAvailableHeats(heats);

        const hasSeries = heats.some((h) => h.startsWith("Serie_"));
        const hasSemifinals = heats.some((h) => h.startsWith("Semi_"));

        // Determine default mode
        if (!hasSeries && currentHeat === "Final_A") {
          setMode("create-series");
        } else if (hasSeries && !hasSemifinals) {
          setMode("create-semifinal");
          setSourceHeats(heats.filter((h) => h.startsWith("Serie_")));
        } else if (hasSeries || hasSemifinals) {
          setMode("create-final-a");
          setSourceHeats(
            heats.filter((h) =>
              h.startsWith(hasSemifinals ? "Semi_" : "Serie_"),
            ),
          );
        }
      } catch {
        toast.danger("Error al cargar heats");
      }
    };

    loadHeats();
  }, [torneoId, pruebaId, categoriaId, currentHeat, token]);

  // Load athletes when source heats change (for progression modes)
  useEffect(() => {
    if (mode === "create-series") return;

    const loadAthletes = async () => {
      try {
        const allAthletes: AthleteForProgression[] = [];

        for (const heat of sourceHeats) {
          const heatAthletes =
            sexo === "M" ? data?.masculino.atletas : data?.femenino.atletas;

          heatAthletes?.forEach((a) => {
            if (a.resultadoAtleta) {
              allAthletes.push({
                pruebaAtletaId: a.pruebaAtletaId,
                atletaId: a.atleta._id,
                nombre: a.atleta.nombre_apellido,
                numero: a.numero,
                sourceHeat: heat,
                puesto: a.resultadoAtleta.puesto,
                marca: a.resultadoAtleta.marca,
              });
            }
          });
        }

        setAthletes(allAthletes);
      } catch {
        toast.danger("Error al cargar atletas");
      }
    };

    if (sourceHeats.length > 0) {
      loadAthletes();
    }
  }, [
    mode,
    sourceHeats,
    torneoId,
    pruebaId,
    categoriaId,
    sexo,
    token,
    data?.masculino.atletas,
    data?.femenino.atletas,
  ]);

  const columnDefs = useMemo<ColDef<AthleteForProgression>[]>(
    () => [
      {
        headerName: "",
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 50,
        pinned: "left",
      },
      {
        field: "nombre",
        headerName: "Atleta",
        flex: 2,
        filter: true,
        sortable: true,
      },
      {
        field: "numero",
        headerName: "#",
        width: 80,
        sortable: true,
      },
      {
        field: "sourceHeat",
        headerName: "Serie Origen",
        width: 120,
        filter: true,
        sortable: true,
      },
      {
        field: "puesto",
        headerName: "Puesto",
        width: 100,
        sortable: true,
      },
      {
        field: "marca",
        headerName: "Marca",
        width: 120,
        sortable: true,
        cellStyle: { fontFamily: "monospace" },
      },
    ],
    [],
  );

  const handleClose = useCallback(() => {
    state.close();
    onClose();
  }, [state, onClose]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === "create-series") {
        // Automatic series creation
        const athletesPerSeriesNum = parseInt(athletesPerSeries, 10);
        if (isNaN(athletesPerSeriesNum) || athletesPerSeriesNum <= 0) {
          toast.danger("Ingrese un número válido de atletas por serie");
          setLoading(false);
          return;
        }

        await createHeats({
          torneoId,
          pruebaId,
          categoriaId,
          sexo,
          heatType: "series",
          athletesPerSeries: athletesPerSeriesNum,
        });

        toast.success("Series creadas exitosamente");
      } else {
        // Manual heat creation (semifinal or final)
        const selectedRows = gridRef.current?.api.getSelectedRows() ?? [];
        if (selectedRows.length === 0) {
          toast.danger("Seleccione al menos un atleta");
          setLoading(false);
          return;
        }

        const athleteIds = selectedRows.map((r) => r.pruebaAtletaId);

        await createHeats({
          torneoId,
          pruebaId,
          categoriaId,
          sexo,
          heatType: mode === "create-semifinal" ? "semifinal" : "final",
          heats: [
            {
              name:
                mode === "create-semifinal"
                  ? `Semi_${availableHeats.filter((h) => h.startsWith("Semi_")).length + 1}`
                  : mode === "create-final-b"
                    ? "Final_B"
                    : "Final_A",
              athleteIds,
            },
          ],
          sourceHeats,
        });

        toast.success(
          `${mode === "create-semifinal" ? "Semifinal" : "Final"} creada exitosamente`,
        );
      }

      onSuccess();
      handleClose();
    } catch (error) {
      const err = error as Error;
      toast.danger(err.message || "Error al crear heats");
    } finally {
      setLoading(false);
    }
  }, [
    mode,
    athletesPerSeries,
    torneoId,
    pruebaId,
    categoriaId,
    sexo,
    sourceHeats,
    availableHeats,
    onSuccess,
    handleClose,
  ]);

  const modalTitle = useMemo(() => {
    switch (mode) {
      case "create-series":
        return "Crear Series";
      case "create-semifinal":
        return "Crear Semifinal";
      case "create-final-a":
        return "Crear Final A";
      case "create-final-b":
        return "Crear Final B";
    }
  }, [mode]);

  const hasSeries = availableHeats.some((h) => h.startsWith("Serie_"));
  const hasSemifinals = availableHeats.some((h) => h.startsWith("Semi_"));

  return (
    <Modal state={state} onOpenChange={(open) => !open && handleClose()}>
      <ModalBackdrop isDismissable>
        <ModalContainer size="cover">
          <ModalDialog>
            <ModalHeader>
              <ModalHeading>{modalTitle}</ModalHeading>
            </ModalHeader>
            <ModalBody className="space-y-4">
              {/* Mode Selection */}
              {(hasSeries || hasSemifinals) && (
                <CustomSelect
                  label="Tipo de Serie"
                  value={mode}
                  onChange={(v) => setMode(v as HeatMode)}
                  items={[
                    ...(hasSeries
                      ? [
                          {
                            key: "create-semifinal",
                            label: "Crear Semifinal",
                            value: "create-semifinal",
                          },
                        ]
                      : []),
                    ...(hasSeries || hasSemifinals
                      ? [
                          {
                            key: "create-final-a",
                            label: "Crear Final A",
                            value: "create-final-a",
                          },
                          {
                            key: "create-final-b",
                            label: "Crear Final B",
                            value: "create-final-b",
                          },
                        ]
                      : []),
                  ]}
                />
              )}

              {/* Automatic Series Creation */}
              {mode === "create-series" && (
                <div className="space-y-3">
                  <p className="text-default-600 text-sm">
                    Las series se crearán automáticamente distribuyendo los
                    atletas según su marca personal.
                  </p>
                  <CustomInput
                    label="Atletas por serie"
                    type="number"
                    value={athletesPerSeries}
                    onValueChange={setAthletesPerSeries}
                    placeholder="8"
                    min={1}
                  />
                </div>
              )}

              {/* Manual Heat Creation with Athlete Grid */}
              {(mode === "create-semifinal" ||
                mode === "create-final-a" ||
                mode === "create-final-b") && (
                <div className="space-y-3">
                  <p className="text-default-600 text-sm">
                    Seleccione los atletas que avanzarán a{" "}
                    {mode === "create-semifinal" ? "semifinal" : "final"}.
                  </p>
                  <div className="ag-theme-quartz" style={{ height: 400 }}>
                    <AgGridReact
                      ref={gridRef}
                      rowData={athletes}
                      columnDefs={columnDefs}
                      rowSelection="multiple"
                      defaultColDef={{ resizable: true }}
                    />
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onPress={handleClose}>
                Cancelar
              </Button>
              <SubmitButton
                type="button"
                variant="primary"
                submitting={loading}
                fullWidth={false}
                onPress={handleSubmit}
              >
                Crear{" "}
                {mode.includes("final")
                  ? "Final"
                  : mode === "create-semifinal"
                    ? "Semifinales"
                    : "Series"}
              </SubmitButton>
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal>
  );
}
