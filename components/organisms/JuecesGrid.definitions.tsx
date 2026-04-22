import type {
  CellClickedEvent,
  ColDef,
  ICellRendererParams,
  ValueSetterParams,
  ValueGetterParams,
} from "ag-grid-community";
import { Button, Chip, toast } from "@heroui/react";
import type { AccesoJuez, JuecesGridProps, Prueba } from "@/types";
import { CustomSelect } from "@/components/atoms/CustomSelect";

type OnAprobar = JuecesGridProps["onAprobar"];
type OnEliminar = JuecesGridProps["onEliminar"];

// Extended type to include pending assignments in row data
type AccesoJuezWithPending = AccesoJuez & {
  pendingPruebasAsignadas: string[];
};

export function buildJuecesColDefs(
  pruebas: Prueba[],
  onAprobar: OnAprobar,
  onEliminar: OnEliminar,
): ColDef<AccesoJuezWithPending>[] {
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
      onCellClicked: (params: CellClickedEvent<AccesoJuezWithPending>) => {
        navigator.clipboard.writeText(params.value);
        toast("ID copiado en el portapales", { timeout: 3000 });
      },
    },
    {
      headerName: "Estado",
      width: 110,
      cellRenderer: (p: ICellRendererParams<AccesoJuezWithPending>) => (
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
      field: "pendingPruebasAsignadas",
      headerName: "Pruebas asignadas",
      flex: 2.5,
      valueGetter: (params: ValueGetterParams<AccesoJuezWithPending>) => {
        return params.data?.pendingPruebasAsignadas ?? [];
      },
      valueSetter: (params: ValueSetterParams<AccesoJuezWithPending>) => {
        if (params.data) {
          params.data.pendingPruebasAsignadas = params.newValue;

          return true;
        }
        return false;
      },
      cellRenderer: (p: ICellRendererParams<AccesoJuezWithPending>) => {
        if (!p.data) return null;
        return (
          <CustomSelect<string[]>
            value={p.data.pendingPruebasAsignadas}
            onChange={(key) => {
              p.node.setDataValue("pendingPruebasAsignadas", key);
            }}
            items={pruebas.map((pr) => ({
              key: pr._id,
              label: pr.nombre,
              value: pr._id,
            }))}
            className="mt-1 min-w-[200px]"
            placeholder="Seleccionar Pruebas Asignadas"
            selectionMode="multiple"
          />
        );
      },
    },
    {
      headerName: "Acciones",
      flex: 2,
      minWidth: 300,
      cellRenderer: (p: ICellRendererParams<AccesoJuezWithPending>) => {
        if (!p.data) return null;
        return (
          <div className="flex items-center gap-2 h-full">
            {!p.data.aprobado ? (
              <Button
                size="sm"
                variant="secondary"
                onPress={() =>
                  onAprobar(p.data!._id, true, p.data!.pendingPruebasAsignadas)
                }
              >
                Aprobar
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() =>
                    onAprobar(
                      p.data!._id,
                      true,
                      p.data!.pendingPruebasAsignadas,
                    )
                  }
                >
                  Actualizar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() =>
                    onAprobar(
                      p.data!._id,
                      false,
                      p.data!.pendingPruebasAsignadas,
                    )
                  }
                >
                  Revocar
                </Button>
              </>
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
