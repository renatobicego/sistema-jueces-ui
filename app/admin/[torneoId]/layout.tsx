"use client";
import Providers from "@/app/providers";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const TABS = [
  { key: "jueces", label: "Jueces" },
  { key: "config", label: "Disciplinas" },
  { key: "importar", label: "Importar" },
  { key: "exportar", label: "Exportar" },
];

export default function TorneoAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { torneoId } = useParams<{ torneoId: string }>();
  const pathname = usePathname();
  const active = TABS.find((t) => pathname.includes(t.key))?.key ?? "jueces";

  return (
    <div className="space-y-4">
      <Providers />
      <div className="flex justify-between items-center border-slate-200 border-b">
        <div className="flex">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/admin/${torneoId}/${t.key}`}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                active === t.key
                  ? "border-accent text-accent"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <Link
          href={`/juez/${torneoId}/pruebas`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-slate-400 hover:text-slate-600 text-sm transition-colors"
        >
          Vista juez ↗
        </Link>
      </div>
      {children}
    </div>
  );
}
