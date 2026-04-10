import type { ColDef } from "ag-grid-community";
import type { FilaFallida } from "@/types";

export const importErrorsColDefs: ColDef<FilaFallida>[] = [
  { field: "fila", headerName: "Fila", width: 70 },
  { field: "dni", headerName: "DNI", width: 110 },
  { field: "nombre", headerName: "Nombre", flex: 2 },
  { field: "prueba", headerName: "Prueba", flex: 1 },
  { field: "categoria", headerName: "Categoría", flex: 1 },
  { field: "motivo", headerName: "Motivo", flex: 3 },
];
