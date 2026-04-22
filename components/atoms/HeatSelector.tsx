"use client";

import { CustomSelect } from "./CustomSelect";
import { useHeats } from "@/hooks/useHeats";
import type { SelectItem } from "@/types";
import { Spinner } from "@heroui/react";

interface HeatSelectorProps {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  selectedHeat: string;
  onHeatChange: (heat: string) => void;
  sexo: "M" | "F";
}

export function HeatSelector({
  torneoId,
  pruebaId,
  categoriaId,
  selectedHeat,
  onHeatChange,
  sexo,
}: HeatSelectorProps) {
  const { heats, loading } = useHeats({
    torneoId,
    pruebaId,
    categoriaId,
    sexo,
  });

  const heatItems: SelectItem<string>[] = heats.map((heat) => ({
    key: heat,
    label: heat,
    value: heat,
  }));

  if (loading) {
    return (
      <div className="flex justify-center">
        <Spinner size="sm" />;
      </div>
    );
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
