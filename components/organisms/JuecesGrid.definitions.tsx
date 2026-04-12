import type {
  CellClickedEvent,
  ColDef,
  ICellRendererParams,
} from "ag-grid-community";
import { Button, Chip } from "@heroui/react";
import type { AccesoJuez, JuecesGridProps, Prueba } from "@/types";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { getAssignedPruebas } from "@/lib/utils/grid";

type OnAprobar = JuecesGridProps["onAprobar"];
type OnEliminar = JuecesGridProps["onEliminar"];

export function buildJuecesColDefs(
  pruebas: Prueba[],
  pendingAssignments: Record<string, string[]>,
  setPendingAssignments: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >,
  onAprobar: OnAprobar,
  onEliminar: OnEliminar,
): ColDef<AccesoJuez>[] {
  const getAssign = (juezId: string, current: string[]) =>
    getAssignedPruebas(pendingAssignments, juezId, current);

  return [
    {
      field: "nombre",
      headerName: "Nombre",
      flex: 2,
      sortable: true,
      filter: true,
    },
    {
      field: "_id",
      headerName: "Id",
      flex: 2,
      sortable: true,
      filter: true,
      onCellClicked: (params: CellClickedEvent<AccesoJuez>) =>
        navigator.clipboard.writeText(params.value),
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
}
