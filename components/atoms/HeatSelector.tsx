"use client";

import { useEffect, useState } from "react";
import { CustomSelect } from "./CustomSelect";
import { fetchHeats } from "@/lib/api/heats";
import { useAuthStore } from "@/store/authStore";
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
  const [heats, setHeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.juezSession?.token ?? "");

  useEffect(() => {
    async function loadHeats() {
      if (!token) {
        setLoading(false);
        setHeats(["Final_A"]);
        return;
      }

      try {
        setLoading(true);
        const response = await fetchHeats({
          torneoId,
          pruebaId,
          categoriaId,
        });
        setHeats(response.heats);
      } catch (error) {
        console.error("Error loading heats:", error);
        // Default to Final_A on error
        setHeats(["Final_A"]);
      } finally {
        setLoading(false);
      }
    }

    loadHeats();
  }, [torneoId, pruebaId, categoriaId, token]);

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
