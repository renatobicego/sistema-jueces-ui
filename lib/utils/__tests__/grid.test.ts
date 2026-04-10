import { describe, it, expect } from "vitest";
import { toGridRow, getAssignedPruebas } from "../grid";
import type { AtletaEntry } from "@/types";

const baseAtleta: AtletaEntry = {
  inscripcionId: "ins-1",
  numero: 1,
  esFederado: true,
  atleta: {
    _id: "atl-1",
    nombre_apellido: "Juan Pérez",
    dni: "12345678",
    sexo: "M",
    fecha_nacimiento: "2000-01-01",
    pais: "ARG",
  },
  pruebaAtletaId: "pa-1",
  marcaPersonal: "10.50",
  resultadoAtleta: null,
};

describe("toGridRow", () => {
  it("maps null resultadoAtleta to empty strings", () => {
    const row = toGridRow(baseAtleta);
    expect(row._marca).toBe("");
    expect(row._viento).toBe("");
    expect(row._observacion).toBe("");
    expect(row._dirty).toBe(false);
  });

  it("maps existing resultadoAtleta fields", () => {
    const entry: AtletaEntry = {
      ...baseAtleta,
      resultadoAtleta: {
        _id: "res-1",
        marca: "10.45",
        viento: "+1.2",
        observacion: null,
        intentosSerie: [],
        intentosAltura: [],
      },
    };
    const row = toGridRow(entry);
    expect(row._marca).toBe("10.45");
    expect(row._viento).toBe("+1.2");
    expect(row._observacion).toBe("");
  });

  it("maps observacion correctly", () => {
    const entry: AtletaEntry = {
      ...baseAtleta,
      resultadoAtleta: {
        _id: "res-2",
        marca: null,
        viento: null,
        observacion: "DNS",
        intentosSerie: [],
        intentosAltura: [],
      },
    };
    const row = toGridRow(entry);
    expect(row._observacion).toBe("DNS");
    expect(row._marca).toBe("");
  });

  it("preserves all AtletaEntry fields", () => {
    const row = toGridRow(baseAtleta);
    expect(row.atleta.nombre_apellido).toBe("Juan Pérez");
    expect(row.numero).toBe(1);
    expect(row.esFederado).toBe(true);
  });
});

describe("getAssignedPruebas", () => {
  it("returns pending assignment when present", () => {
    const pending = { "juez-1": ["prueba-A", "prueba-B"] };
    expect(getAssignedPruebas(pending, "juez-1", ["prueba-X"])).toEqual([
      "prueba-A",
      "prueba-B",
    ]);
  });

  it("falls back to current when no pending entry", () => {
    const pending = {};
    expect(getAssignedPruebas(pending, "juez-1", ["prueba-X"])).toEqual([
      "prueba-X",
    ]);
  });

  it("returns empty array from pending if explicitly set", () => {
    const pending = { "juez-1": [] };
    expect(getAssignedPruebas(pending, "juez-1", ["prueba-X"])).toEqual([]);
  });
});
