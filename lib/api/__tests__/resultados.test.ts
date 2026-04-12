import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/msw/server";
import { fetchAtletasPorPrueba } from "../resultados";
import type { EventoAtletas } from "@/types";

const JUECES_URL = "http://localhost:3002/api";

describe("resultados API", () => {
  describe("fetchAtletasPorPrueba", () => {
    const mockEventoAtletas: EventoAtletas = {
      config: {
        _id: "config1",
        prueba: "prueba1",
        tipoMarca: "SPRINT",
        tieneViento: true,
        tipoIntentos: "ninguno",
        maxIntentos: 0,
      },
      masculino: {
        resultadoId: "resultado1",
        atletas: [
          {
            _id: "atleta1",
            nombre_apellido: "John Doe",
            numero: 1,
            marcaPersonal: "10.50",
            resultadoAtleta: null,
          },
        ],
      },
      femenino: {
        resultadoId: "resultado2",
        atletas: [],
      },
    };

    it("should fetch athletes without serie parameter (defaults to Final_A)", async () => {
      server.use(
        http.get(
          `${JUECES_URL}/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId`,
          ({ request }) => {
            const url = new URL(request.url);
            // Verify no serie parameter is sent
            expect(url.searchParams.has("serie")).toBe(false);
            return HttpResponse.json(mockEventoAtletas);
          },
        ),
      );

      const result = await fetchAtletasPorPrueba({
        torneoId: "torneo1",
        pruebaId: "prueba1",
        categoriaId: "cat1",
        token: "test-token",
      });

      expect(result).toEqual(mockEventoAtletas);
    });

    it("should fetch athletes with serie parameter", async () => {
      server.use(
        http.get(
          `${JUECES_URL}/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId`,
          ({ request }) => {
            const url = new URL(request.url);
            // Verify serie parameter is sent correctly
            expect(url.searchParams.get("serie")).toBe("Serie_1");
            return HttpResponse.json(mockEventoAtletas);
          },
        ),
      );

      const result = await fetchAtletasPorPrueba({
        torneoId: "torneo1",
        pruebaId: "prueba1",
        categoriaId: "cat1",
        serie: "Serie_1",
        token: "test-token",
      });

      expect(result).toEqual(mockEventoAtletas);
    });

    it("should properly encode serie parameter with special characters", async () => {
      server.use(
        http.get(
          `${JUECES_URL}/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId`,
          ({ request }) => {
            const url = new URL(request.url);
            // Verify serie parameter is properly encoded
            expect(url.searchParams.get("serie")).toBe("Final_A");
            return HttpResponse.json(mockEventoAtletas);
          },
        ),
      );

      const result = await fetchAtletasPorPrueba({
        torneoId: "torneo1",
        pruebaId: "prueba1",
        categoriaId: "cat1",
        serie: "Final_A",
        token: "test-token",
      });

      expect(result).toEqual(mockEventoAtletas);
    });

    it("should handle fetch errors", async () => {
      server.use(
        http.get(
          `${JUECES_URL}/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId`,
          () => {
            return HttpResponse.json(
              { error: "Event not found" },
              { status: 404 },
            );
          },
        ),
      );

      await expect(
        fetchAtletasPorPrueba({
          torneoId: "torneo1",
          pruebaId: "prueba1",
          categoriaId: "cat1",
          token: "test-token",
        }),
      ).rejects.toThrow("Error fetching athletes: Event not found");
    });

    it("should handle network errors", async () => {
      server.use(
        http.get(
          `${JUECES_URL}/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId`,
          () => {
            return HttpResponse.error();
          },
        ),
      );

      await expect(
        fetchAtletasPorPrueba({
          torneoId: "torneo1",
          pruebaId: "prueba1",
          categoriaId: "cat1",
          serie: "Serie_2",
          token: "test-token",
        }),
      ).rejects.toThrow("Error fetching athletes");
    });
  });
});
