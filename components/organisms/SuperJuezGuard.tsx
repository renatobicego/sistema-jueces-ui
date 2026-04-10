"use client";
import { useState } from "react";
import { Card, CardContent } from "@heroui/react";
import { useAuthStore } from "@/store/authStore";
import { useJuezAuth } from "@/hooks/useJuezAuth";
import CustomInput from "@/components/atoms/CustomInput";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { ErrorText } from "@/components/atoms/ErrorText";
import type { SuperJuezGuardProps } from "@/types";

export function SuperJuezGuard({ torneoId, children }: SuperJuezGuardProps) {
  const juezSession = useAuthStore((s) => s.juezSession);
  const { loginPorDni, loading, error } = useJuezAuth();

  const [dni, setDni] = useState("");
  const [pin, setPin] = useState("");

  const isAuthorized =
    juezSession?.torneoId === torneoId && juezSession?.esSuperJuez;

  if (isAuthorized) return <>{children}</>;

  const handleLogin = async () => {
    await loginPorDni(torneoId, dni.trim(), pin);
  };

  return (
    <Card className="max-w-sm">
      <CardContent className="space-y-4 p-6">
        <p className="font-semibold text-slate-700">
          Se requiere acceso de super juez
        </p>
        <p className="text-slate-500 text-sm">
          Ingresá tu DNI y el PIN del torneo para continuar.
        </p>
        <CustomInput
          label="DNI"
          inputMode="numeric"
          value={dni}
          onValueChange={setDni}
        />
        <CustomInput
          label="PIN del torneo"
          type="password"
          value={pin}
          onValueChange={setPin}
        />
        {error && <ErrorText message={error} />}
        <SubmitButton
          variant="primary"
          submitting={loading}
          onPress={handleLogin}
        >
          Autenticar
        </SubmitButton>
      </CardContent>
    </Card>
  );
}
