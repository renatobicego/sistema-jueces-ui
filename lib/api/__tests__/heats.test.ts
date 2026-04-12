import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/msw/server";
import { fetchHeats, createHeats } from "../heats";
import type { CreateHeatsRequest } from "@/types";

const JUECES_URL = "http://localhost:3002/api";

describe("heats API", () => {
  describe("fetchHeats", () => {
    it("should fetch heats successfully", async () => {
      const mockResponse = { heats: ["Serie_1", "Serie_2", "Final_A"] };

      server.use(
        http.get(
          `${JUECES_URL}/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId/heats`,
          () => {
            return HttpResponse.json(mockResponse);
          },
        ),
      );

      const result = await fetchHeats({
        torneoId: "torneo1",
        pruebaId: "prueba1",
        categoriaId: "cat1",
        token: "test-token",
      });

      expect(result).toEqual(mockResponse);
    });

    it("should handle fetch errors", async () => {
      server.use(
        http.get(
          `${JUECES_URL}/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId/heats`,
          () => {
            return HttpResponse.json(
              { error: "Event not found" },
              { status: 404 },
            );
          },
        ),
      );

      await expect(
        fetchHeats({
          torneoId: "torneo1",
          pruebaId: "prueba1",
          categoriaId: "cat1",
          token: "test-token",
        }),
      ).rejects.toThrow("Error fetching heats: Event not found");
    });
  });

  describe("createHeats", () => {
    it("should create heats with automatic distribution", async () => {
      const mockResponse = {
        success: true,
        heatsCreated: ["Serie_1", "Serie_2"],
        athletesMoved: 10,
      };

      server.use(
        http.post(`${JUECES_URL}/jueces/heats/create`, () => {
          return HttpResponse.json(mockResponse);
        }),
      );

      const request: CreateHeatsRequest & { token: string } = {
        torneoId: "torneo1",
        pruebaId: "prueba1",
        categoriaId: "cat1",
        sexo: "M",
        heatType: "series",
        athletesPerSeries: 5,
        token: "test-token",
      };

      const result = await createHeats(request);

      expect(result).toEqual(mockResponse);
    });

    it("should create heats with manual distribution", async () => {
      const mockResponse = {
        success: true,
        heatsCreated: ["Semi_1"],
        athletesMoved: 8,
      };

      server.use(
        http.post(`${JUECES_URL}/jueces/heats/create`, () => {
          return HttpResponse.json(mockResponse);
        }),
      );

      const request: CreateHeatsRequest & { token: string } = {
        torneoId: "torneo1",
        pruebaId: "prueba1",
        categoriaId: "cat1",
        sexo: "F",
        heatType: "semifinal",
        heats: [
          {
            name: "Semi_1",
            athleteIds: ["athlete1", "athlete2"],
          },
        ],
        sourceHeats: ["Serie_1", "Serie_2"],
        token: "test-token",
      };

      const result = await createHeats(request);

      expect(result).toEqual(mockResponse);
    });

    it("should handle creation errors", async () => {
      server.use(
        http.post(`${JUECES_URL}/jueces/heats/create`, () => {
          return HttpResponse.json(
            { error: "Series do not exist" },
            { status: 400 },
          );
        }),
      );

      await expect(
        createHeats({
          torneoId: "torneo1",
          pruebaId: "prueba1",
          categoriaId: "cat1",
          sexo: "M",
          heatType: "semifinal",
          token: "test-token",
        }),
      ).rejects.toThrow("Error creating heats: Series do not exist");
    });
  });
});
