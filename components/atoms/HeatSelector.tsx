"use client";

import { CustomSelect } from "./CustomSelect";
import { useHeats } from "@/hooks/useHeats";
import type { SelectItem } from "@/types";

interface HeatSelectorProps {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  selectedHeat: string;
  onHeatChange: (heat: string) => void;
}

export function HeatSelector({
  torneoId,
  pruebaId,
  categoriaId,
  selectedHeat,
  onHeatChange,
}: HeatSelectorProps) {
  const { heats, loading } = useHeats({ torneoId, pruebaId, categoriaId });

  const heatItems: SelectItem<string>[] = heats.map((heat) => ({
    key: heat,
    label: heat,
    value: heat,
  }));

  if (loading) {
    return <div className="text-gray-500 text-sm">Cargando series...</div>;
  }

  return (
    <CustomSelect
      label="Serie"
      placeholder="Seleccionar serie"
      items={heatItems}
      value={selectedHeat}
      onChange={onHeatChange}
      className="w-64"
    />
  );
}
