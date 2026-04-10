"use client";
import type { TorneoSelectorProps } from "@/types";
import { LoadingCenter } from "@/components/atoms/LoadingCenter";
import { CustomCheckbox } from "@/components/atoms/CustomCheckbox";
import { CustomSelect } from "@/components/atoms/CustomSelect";

export default function TorneoSelector({
  torneos,
  loading,
  selected,
  onSelect,
  soloActivos,
  onToggleActivos,
}: TorneoSelectorProps) {
  if (loading) return <LoadingCenter />;

  const items = torneos.map((t) => ({ key: t._id, label: t.nombre, value: t }));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium text-slate-700 text-sm">Torneo</span>
        <CustomCheckbox isSelected={soloActivos} onChange={onToggleActivos}>
          Solo activos
        </CustomCheckbox>
      </div>
      <CustomSelect
        placeholder="Seleccioná un torneo"
        items={items}
        value={selected ?? undefined}
        onChange={onSelect}
        renderItem={(item) => (
          <>
            <p className="font-medium">{item.value.nombre}</p>
            <p className="text-slate-500 text-xs">
              {item.value.lugar} —{" "}
              {new Date(item.value.fecha).toLocaleDateString("es-AR")}
            </p>
          </>
        )}
      />
    </div>
  );
}
