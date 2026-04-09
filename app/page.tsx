import Link from "next/link";
import { Card, CardContent } from "@/lib/heroui";

export default function Home() {
  return (
    <main className="flex justify-center items-center bg-linear-to-br from-blue-50 to-slate-100 p-4 min-h-screen">
      <div className="space-y-6 w-full max-w-md text-center">
        <div>
          <h1 className="font-bold text-slate-800 text-3xl">Sistema Jueces</h1>
          <p className="mt-1 text-slate-500">
            Asociación Mendocina de Atletismo
          </p>
        </div>

        <div className="gap-4 grid">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <h2 className="mb-1 font-semibold text-slate-700 text-lg">
                Panel Admin
              </h2>
              <p className="mb-4 text-slate-500 text-sm">
                Gestión de torneos, jueces, importación y exportación
              </p>
              <Link
                href="/login"
                className="justify-center w-full button button--primary"
              >
                Ingresar como Admin
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <h2 className="mb-1 font-semibold text-slate-700 text-lg">
                Panel Juez
              </h2>
              <p className="mb-4 text-slate-500 text-sm">
                Carga de resultados y marcas para tu disciplina asignada
              </p>
              <Link
                href="/juez/login"
                className="justify-center w-full button button--secondary"
              >
                Ingresar como Juez
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
