import { useEffect, useState } from "react";
import { fetchHeats } from "@/lib/api/heats";
import { useAuthStore } from "@/store/authStore";

interface UseHeatsParams {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
}

export function useHeats({ torneoId, pruebaId, categoriaId }: UseHeatsParams) {
  const [heats, setHeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.juezSession?.token ?? "");

  useEffect(() => {
    async function loadHeats() {
      if (!token) {
        setLoading(false);
        setHeats(["Final_A"]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetchHeats({
          torneoId,
          pruebaId,
          categoriaId,
        });
        setHeats(response.heats);
      } catch (err) {
        console.error("Error loading heats:", err);
        setError(err instanceof Error ? err.message : "Error loading heats");
        // Default to Final_A on error
        setHeats(["Final_A"]);
      } finally {
        setLoading(false);
      }
    }

    loadHeats();
  }, [torneoId, pruebaId, categoriaId, token]);

  return { heats, loading, error };
}
