"use client";
import { useState, useEffect } from "react";
import { amaApi } from "@/lib/axios";
import type { Torneo } from "@/types";

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function useTorneos() {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soloActivos, setSoloActivos] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await amaApi.get("/torneo");
        setTorneos(data.torneos ?? data);
      } catch {
        setError("No se pudieron cargar los torneos.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = soloActivos
    ? torneos.filter((t) => {
        const fecha = new Date(t.fecha).getTime();
        const now = Date.now();
        return fecha >= now - ONE_WEEK_MS && fecha <= now + TWO_WEEKS_MS;
      })
    : torneos;

  return {
    torneos: filtered,
    allTorneos: torneos,
    loading,
    error,
    soloActivos,
    setSoloActivos,
  };
}
