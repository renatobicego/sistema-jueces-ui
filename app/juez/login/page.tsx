"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Label, TextField } from "@heroui/react";
import { useJuezAuth } from "@/hooks/useJuezAuth";
import { useTorneos } from "@/hooks/useTorneos";
import TorneoSelector from "@/components/molecules/TorneoSelector";
import type { Torneo } from "@/types";

export default function JuezLoginPage() {
  const router = useRouter();
  const {
    torneos,
    loading: loadingTorneos,
    soloActivos,
    setSoloActivos,
  } = useTorneos();
  const { registrar, login, getSavedJuezId, loading, error } = useJuezAuth();

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [nombre, setNombre] = useState("");
  const [juezId, setJuezId] = useState("");
  const [pin, setPin] = useState("");
  const [registered, setRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "registrar">("login");

  const handleTorneoSelect = (t: Torneo) => {
    setTorneo(t);
    const saved = getSavedJuezId(t._id);
    if (saved) setJuezId(saved);
  };

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!torneo) return;
    const res = await registrar(torneo._id, nombre.trim());
    if (res) {
      setJuezId(res.uid);
      setRegistered(true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!torneo) return;
    const res = await login(torneo._id, juezId.trim(), pin.trim());
    if (res) router.push(`/juez/${torneo._id}/pruebas`);
  };

  return (
    <main className="flex justify-center items-center bg-linear-to-br from-purple-50 to-slate-100 p-4 min-h-screen">
      <Card className="w-full max-w-md">
        <Card.Content className="space-y-6 p-8">
          <div className="text-center">
            <h1 className="font-bold text-slate-800 text-2xl">Acceso Juez</h1>
          </div>

          <TorneoSelector
            torneos={torneos}
            loading={loadingTorneos}
            selected={torneo}
            onSelect={handleTorneoSelect}
            soloActivos={soloActivos}
            onToggleActivos={setSoloActivos}
          />

          {torneo && (
            <div className="space-y-4">
              {/* Tab buttons */}
              <div className="flex border-slate-200 border-b">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "login"
                      ? "border-accent text-accent"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("registrar")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "registrar"
                      ? "border-accent text-accent"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Registrarme
                </button>
              </div>

              {activeTab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4 pt-2">
                  <TextField isRequired name="juezId">
                    <Label>ID de Juez</Label>
                    <Input
                      placeholder="Tu ID recibido al registrarte"
                      value={juezId}
                      onChange={(e) => setJuezId(e.target.value)}
                    />
                  </TextField>
                  <TextField isRequired name="pin">
                    <Label>PIN del torneo</Label>
                    <Input
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      type="password"
                    />
                  </TextField>
                  {error && <p className="text-danger text-sm">{error}</p>}
                  <Button
                    type="submit"
                    variant="secondary"
                    fullWidth
                    isPending={loading}
                  >
                    Ingresar
                  </Button>
                </form>
              )}

              {activeTab === "registrar" && (
                <>
                  {registered ? (
                    <div className="space-y-3 pt-2">
                      <p className="text-slate-600 text-sm">
                        Registro enviado. Tu ID de juez es:
                      </p>
                      <code className="block bg-slate-100 p-3 rounded font-mono text-sm break-all">
                        {juezId}
                      </code>
                      <p className="text-slate-500 text-xs">
                        Guardalo. Lo necesitarás para iniciar sesión una vez que
                        el admin te apruebe.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleRegistrar} className="space-y-4 pt-2">
                      <TextField isRequired name="nombre">
                        <Label>Tu nombre completo</Label>
                        <Input
                          placeholder="Juan García"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                        />
                      </TextField>
                      {error && <p className="text-danger text-sm">{error}</p>}
                      <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        isPending={loading}
                      >
                        Solicitar acceso
                      </Button>
                    </form>
                  )}
                </>
              )}
            </div>
          )}
        </Card.Content>
      </Card>
    </main>
  );
}
