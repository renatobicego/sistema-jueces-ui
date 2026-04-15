"use client";
import { useState, useRef, useCallback, useEffect } from "react";
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
import CustomInput from "@/components/atoms/CustomInput";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { createHeats } from "@/lib/api/heats";
import { useAuthStore } from "@/store/authStore";
import { useHeats } from "@/hooks/useHeats";
import type {
  ConfigPrueba,
  AthleteForProgression,
  EventoAtletas,
  HeatMode,
} from "@/types";
import { CustomCheckbox } from "../atoms/CustomCheckbox";
import HeatManagementManualGrid from "../molecules/HeatManagementManualGrid";
import { createSeriesOptions, seriesTypesOptions } from "@/lib/utils/shared";

ModuleRegistry.registerModules([AllCommunityModule]);

interface HeatManagementModalProps {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: "M" | "F";
  currentHeat: string;
  athletes: EventoAtletas | null;
  config: ConfigPrueba | null;
  saveAll: () => Promise<void>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HeatManagementModal({
  torneoId,
  pruebaId,
  categoriaId,
  sexo,
  currentHeat,
  athletes: data,
  saveAll,
  // config is passed but not used in this component
  onClose,
  onSuccess,
}: HeatManagementModalProps) {
  const state = useOverlayState({ defaultOpen: true });
  const token = useAuthStore((s) => s.juezSession?.token ?? "");
  const gridRef = useRef<AgGridReact<AthleteForProgression>>(null);

  const [mode, setMode] = useState<HeatMode>("create-series");
  const [athletesPerSeries, setAthletesPerSeries] = useState<string>("8");
  const [numberOfSeries, setNumberOfSeries] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [sourceHeats, setSourceHeats] = useState<string[]>([]);
  const [athletes, setAthletes] = useState<AthleteForProgression[]>([]);
  const [manualSeries, setManualSeries] = useState(false);
  const [serieToSend, setSerieToSend] = useState<string>("");
  const [customSeriesOptions, setCustomSeriesOptions] = useState<string[]>([]);

  // Use the heats hook
  const { heats: availableHeats } = useHeats({
    torneoId,
    pruebaId,
    categoriaId,
  });

  // Determine available modes based on current state
  useEffect(() => {
    if (availableHeats.length === 0) return;

    const hasSeries = availableHeats.some((h) => h.startsWith("Serie_"));
    const hasSemifinals = availableHeats.some((h) => h.startsWith("Semi_"));

    // Determine default mode
    if (!hasSeries && currentHeat === "Final_A") {
      setMode("create-series");
      setSourceHeats(availableHeats);
    } else if (hasSeries && !hasSemifinals) {
      setMode("create-semifinal");
      setSourceHeats(availableHeats.filter((h) => h.startsWith("Serie_")));
    } else if (hasSeries || hasSemifinals) {
      setMode("create-final-a");
      setSourceHeats(
        availableHeats.filter((h) =>
          h.startsWith(hasSemifinals ? "Semi_" : "Serie_"),
        ),
      );
    }
  }, [availableHeats, currentHeat]);

  // Load athletes when source heats change (for progression modes)
  useEffect(() => {
    const loadAthletes = async () => {
      try {
        const allAthletes: AthleteForProgression[] = [];

        for (const heat of sourceHeats) {
          const heatAthletes =
            sexo === "M" ? data?.masculino.atletas : data?.femenino.atletas;

          heatAthletes?.forEach((a) => {
            if (a.resultadoAtleta || manualSeries) {
              allAthletes.push({
                pruebaAtletaId: a.pruebaAtletaId,
                atletaId: a.atleta._id,
                nombre: a.atleta.nombre_apellido,
                numero: a.numero,
                sourceHeat: heat,
                puesto: a.resultadoAtleta?.puesto ?? null,
                marca: a.resultadoAtleta?.marca ?? a.marcaPersonal,
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
    manualSeries,
  ]);

  const handleClose = useCallback(() => {
    state.close();
    onClose();
  }, [state, onClose]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === "create-series") {
        if (manualSeries) {
          // Manual heat creation (semifinal or final)
          const selectedRows = gridRef.current?.api.getSelectedRows() ?? [];
          if (selectedRows.length === 0) {
            toast.danger("Seleccione al menos un atleta");
            setLoading(false);
            return;
          }

          // Save all results before creating heats
          await saveAll();

          const athleteIds = selectedRows.map((r) => r.pruebaAtletaId);

          await createHeats({
            torneoId,
            pruebaId,
            categoriaId,
            sexo,
            heatType: "series",
            heats: [
              {
                name: serieToSend,
                athleteIds,
              },
            ],
          });
        } else {
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
        }
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
    onSuccess,
    handleClose,
    manualSeries,
    torneoId,
    pruebaId,
    categoriaId,
    sexo,
    serieToSend,
    sourceHeats,
    athletesPerSeries,
    availableHeats,
    saveAll,
  ]);

  const hasSeries = availableHeats.some((h) => h.startsWith("Serie_"));
  const hasSemifinals = availableHeats.some((h) => h.startsWith("Semi_"));

  const isManualOnlyMode = [
    "create-semifinal",
    "create-final-a",
    "create-final-b",
  ].includes(mode);

  // Get existing series from availableHeats
  const existingSeries = availableHeats.filter((h) => h.startsWith("Serie_"));
  const hasExistingSeries = existingSeries.length > 0;

  // Create series options based on existing series + custom options
  const seriesOptions = hasExistingSeries
    ? [...existingSeries, ...customSeriesOptions].map((serie) => ({
        key: serie,
        label: serie,
        value: serie,
      }))
    : customSeriesOptions.map((serie) => ({
        key: serie,
        label: serie,
        value: serie,
      }));

  // Function to add a new series
  const handleAddSerie = useCallback(() => {
    const seriesOptions = existingSeries.filter((serie) =>
      serie.includes("Serie"),
    );
    const lastSerieNumber = parseInt(
      seriesOptions[seriesOptions.length - 1].replace("Serie_", ""),
    );

    const newSerie = `Serie_${lastSerieNumber + 1}`;
    setCustomSeriesOptions((prev) => [...prev, newSerie]);
    setSerieToSend(newSerie);
  }, [existingSeries]);

  const renderGrid = useCallback(
    () => (
      <HeatManagementManualGrid mode={mode} ref={gridRef} athletes={athletes} />
    ),
    [athletes, mode],
  );

  console.log(seriesOptions);
  return (
    <Modal state={state} onOpenChange={(open) => !open && handleClose()}>
      <ModalBackdrop isDismissable>
        <ModalContainer size="cover">
          <ModalDialog>
            <ModalHeader>
              <ModalHeading>Gestionar Series</ModalHeading>
            </ModalHeader>
            <ModalBody className="space-y-4">
              {/* Mode Selection - Only show if hasSeries */}
              {hasSeries && (
                <CustomSelect
                  label="Tipo de Serie"
                  value={mode}
                  onChange={(v) => setMode(v as HeatMode)}
                  items={seriesTypesOptions(hasSeries, hasSemifinals)}
                />
              )}

              {/* Create Series Section */}
              {mode === "create-series" && (
                <div className="space-y-3">
                  <p className="text-default-600 text-sm">
                    Las series se crearán automáticamente distribuyendo los
                    atletas según su marca personal.
                  </p>

                  <CustomCheckbox
                    isSelected={manualSeries}
                    onChange={setManualSeries}
                  >
                    Armar Series Manuales
                  </CustomCheckbox>

                  {manualSeries && (
                    <>
                      {/* Show input only if no existing series */}
                      {!hasExistingSeries && (
                        <CustomInput
                          label="Cantidad de series"
                          type="number"
                          value={numberOfSeries}
                          onValueChange={setNumberOfSeries}
                          min={1}
                        />
                      )}

                      <CustomSelect
                        label="Serie"
                        placeholder="Seleccione la serie que irán los atletas"
                        items={
                          hasExistingSeries
                            ? seriesOptions
                            : createSeriesOptions(Number(numberOfSeries))
                        }
                        value={serieToSend}
                        onChange={setSerieToSend}
                      />
                      {/* Show button to add series if existing series */}
                      {hasExistingSeries && (
                        <Button variant="primary" onPress={handleAddSerie}>
                          Agregar serie
                        </Button>
                      )}
                      {renderGrid()}
                    </>
                  )}

                  {!manualSeries && (
                    <CustomInput
                      label="Atletas por serie"
                      type="number"
                      value={athletesPerSeries}
                      onValueChange={setAthletesPerSeries}
                      placeholder="8"
                      min={1}
                    />
                  )}
                </div>
              )}

              {/* Other modes (semifinal, final-a, final-b) */}
              {isManualOnlyMode && (
                <div className="space-y-3">{renderGrid()}</div>
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
                isDisabled={manualSeries && !serieToSend}
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
