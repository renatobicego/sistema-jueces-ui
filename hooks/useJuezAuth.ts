"use client";
import { useState } from "react";
import { toast } from "@heroui/react";
import { juecesApi } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { AxiosError } from "axios";

export function useJuezAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setJuezSession = useAuthStore((s) => s.setJuezSession);

  const registrar = async (torneoId: string, nombre: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await juecesApi.post(`/jueces/registrar/${torneoId}`, {
        nombre,
      });
      return data as {
        uid: string;
        nombre: string;
        aprobado: boolean;
        message: string;
      };
    } catch (e) {
      if (e instanceof AxiosError) {
        const errorMsg = e.response?.data?.error ?? "Error al registrarse.";
        setError(errorMsg);
        toast.danger(errorMsg);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (torneoId: string, juezId: string, pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await juecesApi.post(`/jueces/auth/${torneoId}`, {
        juezId,
        pin,
      });
      setJuezSession({
        token: data.token,
        juezId,
        nombre: data.nombre,
        torneoId: data.torneoId,
        esSuperJuez: data.esSuperJuez,
        pruebasAsignadas: data.pruebasAsignadas ?? [],
      });
      return data;
    } catch (e) {
      if (e instanceof AxiosError) {
        const errorMsg = e.response?.data?.error ?? "Error al autenticar.";
        setError(errorMsg);
        toast.danger(errorMsg);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loginPorDni = async (torneoId: string, dni: string, pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await juecesApi.post(`/jueces/auth-dni/${torneoId}`, {
        dni,
        pin,
      });
      setJuezSession({
        token: data.token,
        juezId: data.juezId,
        nombre: data.nombre,
        torneoId: data.torneoId,
        esSuperJuez: data.esSuperJuez,
        pruebasAsignadas: data.pruebasAsignadas ?? [],
      });
      return data;
    } catch (e) {
      if (e instanceof AxiosError) {
        const errorMsg = e.response?.data?.error ?? "Error al autenticar.";
        setError(errorMsg);
        toast.danger(errorMsg);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSavedJuezId = (torneoId: string): string =>
    typeof window !== "undefined"
      ? (localStorage.getItem(`juezId_${torneoId}`) ?? "")
      : "";

  return { registrar, login, loginPorDni, getSavedJuezId, loading, error };
}
