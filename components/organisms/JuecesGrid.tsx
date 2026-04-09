"use client";
import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { Button, Chip } from "@heroui/react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import type { AccesoJuez, Prueba } from "@/types";
import { CustomSelect } from "@/components/atoms/CustomSelect";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Props {
  jueces: AccesoJuez[];
  pruebas: Prueba[];
  onAprobar: (
    juezId: string,
    aprobado: boolean,
    pruebasAsignadas: string[],
  ) => Promise<void>;
  onEliminar: (juezId: string) => Promise<void>;
}

export default function JuecesGrid({
  jueces,
  pruebas,
  onAprobar,
  onEliminar,
}: Props) {
  const [pendingAssignments, setPendingAssignments] = useState<
    Record<string, string[]>
  >({});

  const colDefs = useMemo<ColDef<AccesoJuez>[]>(() => {
    const getAssign = (juezId: string, current: string[]) =>
      pendingAssignments[juezId] ?? current;
    return [
      {
        field: "nombre",
        headerName: "Nombre",
        flex: 2,
        sortable: true,
        filter: true,
      },
      {
        headerName: "Estado",
        flex: 1,
        cellRenderer: (p: ICellRendererParams<AccesoJuez>) => (
          <Chip
            size="sm"
            color={p.data?.aprobado ? "success" : "warning"}
            variant="soft"
          >
            {p.data?.aprobado ? "Aprobado" : "Pendiente"}
          </Chip>
        ),
      },
      {
        headerName: "Pruebas asignadas",
        flex: 3,
        cellRenderer: (p: ICellRendererParams<AccesoJuez>) => {
          if (!p.data) return null;
          const assigned = getAssign(p.data._id, p.data.pruebasAsignadas);
          return (
            <CustomSelect
              value={assigned.length === 1 ? assigned[0] : undefined}
              onChange={(key) =>
                setPendingAssignments((prev) => ({
                  ...prev,
                  [p.data!._id]: [key],
                }))
              }
              items={pruebas.map((pr) => ({
                key: pr._id,
                label: pr.nombre,
                value: pr._id,
              }))}
              className="min-w-[200px]"
            />
          );
        },
      },
      {
        headerName: "Acciones",
        flex: 2,
        cellRenderer: (p: ICellRendererParams<AccesoJuez>) => {
          if (!p.data) return null;
          const assigned = getAssign(p.data._id, p.data.pruebasAsignadas);
          return (
            <div className="flex items-center gap-2 h-full">
              {!p.data.aprobado ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => onAprobar(p.data!._id, true, assigned)}
                >
                  Aprobar
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => onAprobar(p.data!._id, false, assigned)}
                >
                  Revocar
                </Button>
              )}
              <Button
                size="sm"
                variant="danger-soft"
                onPress={() => onEliminar(p.data!._id)}
              >
                Eliminar
              </Button>
            </div>
          );
        },
      },
    ];
  }, [pruebas, pendingAssignments, onAprobar, onEliminar]);

  return (
    <div className="ag-theme-quartz" style={{ height: 400 }}>
      <AgGridReact
        rowData={jueces}
        columnDefs={colDefs}
        rowHeight={52}
        defaultColDef={{ resizable: true }}
      />
    </div>
  );
}
