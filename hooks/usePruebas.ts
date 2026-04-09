"use client";
import { useState, useEffect } from "react";
import { juecesApi } from "@/lib/axios";
import type { Prueba } from "@/types";

export function usePruebas(torneoId: string) {
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!torneoId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await juecesApi.get(
          `/jueces/torneo/${torneoId}/pruebas`,
        );
        setPruebas(data.pruebas);
      } catch {
        setError("No se pudieron cargar las pruebas.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [torneoId]);

  return { pruebas, loading, error };
}
