import type { CreateHeatsRequest, CreateHeatsResponse } from "@/types";
import { juecesApi } from "../axios";

/**
 * Fetch available heats for a specific event
 */
export async function fetchHeats(params: {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: "M" | "F";
}): Promise<{ heats: string[] }> {
  const { torneoId, pruebaId, categoriaId, sexo } = params;

  try {
    const { data } = await juecesApi.get(
      `/jueces/torneo/${torneoId}/categoria/${categoriaId}/prueba/${pruebaId}/heats/${sexo}`,
    );

    return data.heats.length ? data : { heats: ["Final_A"] };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Error al traer las opciones de series: ${error.message}`,
      );
    }
    throw new Error("Error al traer las opciones de series");
  }
}

/**
 * Create heats with automatic or manual distribution
 */
export async function createHeats(
  body: CreateHeatsRequest,
): Promise<CreateHeatsResponse> {
  try {
    const { data } = await juecesApi.post("/jueces/heats/create", {
      ...body,
    });

    return await data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error al crear series: ${error.message}`);
    }
    throw new Error("Error al crear series");
  }
}
