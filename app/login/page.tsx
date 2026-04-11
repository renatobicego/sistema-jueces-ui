"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@heroui/react";
import { useAmaAuth } from "@/hooks/useAmaAuth";
import CustomInput from "@/components/atoms/CustomInput";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import Providers from "../providers";

export default function LoginPage() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAmaAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await login(dni.trim(), password);
    if (user) router.push("/admin/torneos");
  };

  return (
    <main className="flex justify-center items-center bg-linear-to-br from-blue-50 to-slate-100 p-4 min-h-screen">
      <Providers />
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-6 p-8">
          <div className="text-center">
            <h1 className="font-bold text-slate-800 text-2xl">Acceso Admin</h1>
            <p className="mt-1 text-slate-500 text-sm">
              Ingresá tu DNI y contraseña para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <CustomInput
              label="DNI"
              placeholder="12345678"
              value={dni}
              onValueChange={setDni}
              type="text"
              inputMode="numeric"
              autoFocus
              required
              fullWidth
            />
            <CustomInput
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onValueChange={setPassword}
              type="password"
              required
              fullWidth
            />
            <SubmitButton variant="primary" submitting={loading}>
              Continuar
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
