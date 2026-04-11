"use client";
import type { CustomCellRendererProps } from "ag-grid-react";
import type { GridRow, IntentoAltura } from "@/types";

export type IntentoVal = "O" | "X" | "-" | "";

export interface IntentosAlturaValue {
  altura: string;
  intentos: [IntentoVal, IntentoVal, IntentoVal];
}

export function toEditorValue(
  ia: IntentoAltura | undefined,
  altura: string,
): IntentosAlturaValue {
  return {
    altura,
    intentos: [
      (ia?.intentos?.[0] as IntentoVal) ?? "",
      (ia?.intentos?.[1] as IntentoVal) ?? "",
      (ia?.intentos?.[2] as IntentoVal) ?? "",
    ],
  };
}

/**
 * Computes which selects are disabled based on current attempt values.
 *
 * Rules:
 *  - 2nd disabled if: 1st is empty, "O" (cleared on 1st), or "-" (passed)
 *  - 3rd disabled if: 2nd is disabled, 2nd is "O" (cleared on 2nd), or 2nd is "-" (X- = only 2 attempts)
 *  - "XXX" → all 3 filled, nothing disabled (row is done but selects stay active)
 */
export function computeDisabled(
  intentos: [IntentoVal, IntentoVal, IntentoVal],
): [boolean, boolean, boolean] {
  const [a, b] = intentos;

  const secondDisabled = a === "" || a === "O" || a === "-";
  const thirdDisabled = secondDisabled || b === "O" || b === "-";

  return [false, secondDisabled, thirdDisabled];
}

const OPTION_LABELS: Record<IntentoVal, string> = {
  "": "·",
  O: "O",
  X: "X",
  "-": "—",
};

const BOX_COLORS: Record<IntentoVal, string> = {
  "": "bg-slate-100 text-slate-400",
  O: "bg-green-100 text-green-700 font-bold",
  X: "bg-red-100 text-red-700 font-bold",
  "-": "bg-slate-200 text-slate-500",
};

type Props = CustomCellRendererProps<GridRow, IntentosAlturaValue> & {
  altura: string;
  alturas?: string[];
  alturaIndex?: number;
};

const IntentosAlturaCellRenderer = ({
  value,
  setValue,
  node,
  api,
  altura,
  alturas = [],
  alturaIndex = 0,
}: Props) => {
  const intentos: [IntentoVal, IntentoVal, IntentoVal] = value?.intentos ?? [
    "",
    "",
    "",
  ];

  // Check if athlete is eliminated (XXX) at any previous altura
  const isEliminatedBefore = (() => {
    if (!node.data || alturaIndex === 0) return false;
    const prevAlturas = alturas.slice(0, alturaIndex);
    for (const prevAltura of prevAlturas) {
      const ia = node.data.resultadoAtleta?.intentosAltura?.find(
        (x) => x.altura === prevAltura,
      );
      if (
        ia &&
        ia.intentos.length === 3 &&
        ia.intentos.every((x) => x === "X")
      ) {
        return true;
      }
    }
    return false;
  })();

  // Check if athlete can access this altura:
  // - First altura is always accessible
  // - For subsequent alturas, they must have cleared (O) or passed (-) the previous one
  const canAccessThisAltura = (() => {
    if (alturaIndex === 0) return true;
    if (!node.data) return false;

    const prevAltura = alturas[alturaIndex - 1];
    const prevIA = node.data.resultadoAtleta?.intentosAltura?.find(
      (x) => x.altura === prevAltura,
    );

    // No attempts at previous altura = can't access this one yet
    if (!prevIA || prevIA.intentos.length === 0) return false;

    // Has "O" (cleared) or "-" (passed) = can access
    return prevIA.intentos.some((x) => x === "O" || x === "-");
  })();

  const [d0, d1, d2] = computeDisabled(intentos);
  const disabled = [
    d0 || isEliminatedBefore || !canAccessThisAltura,
    d1 || isEliminatedBefore || !canAccessThisAltura,
    d2 || isEliminatedBefore || !canAccessThisAltura,
  ];

  const handleChange = (idx: number, val: IntentoVal) => {
    const next: [IntentoVal, IntentoVal, IntentoVal] = [...intentos] as [
      IntentoVal,
      IntentoVal,
      IntentoVal,
    ];
    next[idx] = val;

    // Clear downstream slots when a slot changes
    if (idx === 0) {
      next[1] = "";
      next[2] = "";
    }
    if (idx === 1) {
      next[2] = "";
    }

    const newValue: IntentosAlturaValue = { altura, intentos: next };
    setValue?.(newValue);

    // Mark row dirty
    if (node.data) {
      node.data._dirty = true;
      node.data._observacion = "";

      const arr = [...(node.data.resultadoAtleta?.intentosAltura ?? [])];
      const existingIdx = arr.findIndex((x) => x.altura === altura);
      const cleanIntentos = next.filter((v) => v !== "") as ("O" | "X" | "-")[];

      if (existingIdx >= 0) {
        arr[existingIdx] = { altura, intentos: cleanIntentos };
      } else {
        arr.push({ altura, intentos: cleanIntentos });
        arr.sort((a, b) => parseFloat(a.altura) - parseFloat(b.altura));
      }

      if (!node.data.resultadoAtleta) {
        node.data.resultadoAtleta = {
          _id: "",
          marca: null,
          viento: null,
          observacion: null,
          intentosSerie: [],
          intentosAltura: arr,
          puesto: null,
          marcaParcial: null,
        };
      } else {
        node.data.resultadoAtleta.intentosAltura = arr;
      }

      api.refreshCells({ rowNodes: [node], force: true });
    }
  };

  return (
    <div className="flex justify-center items-center gap-1 px-1 w-full h-full">
      {([0, 1, 2] as const).map((i) => {
        const val = intentos[i];
        const isDisabled = disabled[i];
        return (
          <select
            key={i}
            value={val}
            disabled={isDisabled}
            onChange={(e) => handleChange(i, e.target.value as IntentoVal)}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className={`
              w-8 h-7 text-center text-xs rounded border cursor-pointer outline-none
              ${isDisabled ? "opacity-40 cursor-not-allowed border-slate-200" : "border-slate-300 hover:border-primary"}
              ${BOX_COLORS[val]}
            `}
          >
            {(["", "O", "X", "-"] as IntentoVal[]).map((o) => (
              <option key={o} value={o}>
                {OPTION_LABELS[o]}
              </option>
            ))}
          </select>
        );
      })}
    </div>
  );
};

export default IntentosAlturaCellRenderer;
