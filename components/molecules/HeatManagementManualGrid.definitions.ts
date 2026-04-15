import { ColDef } from "ag-grid-community";

const buildColDefs = () => {
  const columnDefs: ColDef[] = [
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
  ];
  return columnDefs;
};

export default buildColDefs;
