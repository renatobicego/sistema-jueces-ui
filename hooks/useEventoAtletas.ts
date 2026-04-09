"use client";
import { useState, useEffect, useCallback } from "react";
import { juecesApi } from "@/lib/axios";
import type { EventoAtletas } from "@/types";

export function useEventoAtletas(
  torneoId: string,
  categoriaId: string,
  pruebaId: string,
) {
  const [data, setData] = useState<EventoAtletas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!torneoId || !categoriaId || !pruebaId) return;
    setLoading(true);
    try {
      const res = await juecesApi.get(
        `/jueces/torneo/${torneoId}/categoria/${categoriaId}/prueba/${pruebaId}`,
      );
      setData(res.data);
    } catch {
      setError("No se pudieron cargar los atletas.");
    } finally {
      setLoading(false);
    }
  }, [torneoId, categoriaId, pruebaId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
