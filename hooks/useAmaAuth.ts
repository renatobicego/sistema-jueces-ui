"use client";
import { useState } from "react";
import { toast } from "@heroui/react";
import { amaApi } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import type { AmaUser } from "@/types";

export function useAmaAuth() {
  const [loading, setLoading] = useState(false);
  const setAmaAuth = useAuthStore((s) => s.setAmaAuth);

  const login = async (
    dni: string,
    password?: string,
  ): Promise<AmaUser | null> => {
    setLoading(true);
    try {
      const { data } = await amaApi.post("/auth/login", {
        dni,
        password,
        sistemaJueces: true,
      });
      const user: AmaUser = {
        uid: data.usuario.uid,
        nombre_apellido: data.usuario.nombre_apellido,
        dni: data.usuario.dni,
        role: data.usuario.role,
        isEditor: data.usuario.isEditor ?? false,
      };

      if (user.role !== "ADMIN_ROLE" && !user.isEditor) {
        toast.danger("No tenés permisos para acceder al sistema de jueces.");
        return null;
      }

      setAmaAuth(user, data.token);
      return user;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      toast.danger(err.response?.data?.msg ?? "Error al iniciar sesión.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
