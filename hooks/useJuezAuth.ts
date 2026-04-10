"use client";
import { useState } from "react";
import { toast } from "@heroui/react";
import { juecesApi } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

export function useJuezAuth() {
  const [loading, setLoading] = useState(false);
  const setJuezSession = useAuthStore((s) => s.setJuezSession);

  const registrar = async (torneoId: string, nombre: string) => {
    setLoading(true);
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
    } catch (e: any) {
      toast.danger(e.response?.data?.error ?? "Error al registrarse.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (torneoId: string, juezId: string, pin: string) => {
    setLoading(true);
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
    } catch (e: any) {
      toast.danger(e.response?.data?.error ?? "Error al autenticar.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loginPorDni = async (torneoId: string, dni: string, pin: string) => {
    setLoading(true);
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
    } catch (e: any) {
      toast.danger(e.response?.data?.error ?? "Error al autenticar.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSavedJuezId = (torneoId: string): string =>
    typeof window !== "undefined"
      ? (localStorage.getItem(`juezId_${torneoId}`) ?? "")
      : "";

  return { registrar, login, loginPorDni, getSavedJuezId, loading };
}
