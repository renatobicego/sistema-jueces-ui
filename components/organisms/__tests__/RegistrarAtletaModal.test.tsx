import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import RegistrarAtletaModal from "../RegistrarAtletaModal";
import { server } from "@/tests/msw/server";
import { http, HttpResponse } from "msw";

vi.mock("@/lib/axios", () => import("@/__mocks__/lib/axios"));

const defaultProps = {
  torneoId: "torneo-1",
  pruebaId: "prueba-1",
  categoriaId: "cat-1",
  onSuccess: vi.fn(),
};

beforeEach(() => {
  defaultProps.onSuccess.mockClear();
});

async function openModal() {
  await userEvent.click(
    screen.getByRole("button", { name: /registrar atleta/i }),
  );
}

describe("RegistrarAtletaModal", () => {
  describe("trigger", () => {
    it("renders the trigger button", () => {
      render(<RegistrarAtletaModal {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /registrar atleta/i }),
      ).toBeInTheDocument();
    });

    it("does not show modal content before opening", () => {
      render(<RegistrarAtletaModal {...defaultProps} />);
      expect(
        screen.queryByText("Registrar atleta en esta prueba"),
      ).not.toBeInTheDocument();
    });

    it("opens the modal on button click", async () => {
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      expect(
        screen.getByText("Registrar atleta en esta prueba"),
      ).toBeInTheDocument();
    });

    it("shows DNI input and Buscar button after opening", async () => {
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      expect(screen.getByLabelText("DNI")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /buscar/i }),
      ).toBeInTheDocument();
    });

    it("shows Cancelar button after opening", async () => {
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      expect(
        screen.getByRole("button", { name: /cancelar/i }),
      ).toBeInTheDocument();
    });
  });

  describe("search — atleta found", () => {
    it("shows found atleta name", async () => {
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      await userEvent.type(screen.getByLabelText("DNI"), "12345678");
      await userEvent.click(screen.getByRole("button", { name: /buscar/i }));
      await waitFor(() =>
        expect(screen.getByText("María García")).toBeInTheDocument(),
      );
    });

    it("shows found atleta country and sex", async () => {
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      await userEvent.type(screen.getByLabelText("DNI"), "12345678");
      await userEvent.click(screen.getByRole("button", { name: /buscar/i }));
      await waitFor(() => screen.getByText("María García"));
      expect(screen.getByText(/ARG/)).toBeInTheDocument();
    });

    it("shows Inscribir button after finding atleta", async () => {
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      await userEvent.type(screen.getByLabelText("DNI"), "12345678");
      await userEvent.click(screen.getByRole("button", { name: /buscar/i }));
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /inscribir en esta prueba/i }),
        ).toBeInTheDocument(),
      );
    });

    it("does not show the new atleta form when atleta is found", async () => {
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      await userEvent.type(screen.getByLabelText("DNI"), "12345678");
      await userEvent.click(screen.getByRole("button", { name: /buscar/i }));
      await waitFor(() => screen.getByText("María García"));
      expect(
        screen.queryByText(/atleta no encontrado/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("search — atleta not found (404)", () => {
    it("shows not-found message", async () => {
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      await userEvent.type(screen.getByLabelText("DNI"), "00000000");
      await userEvent.click(screen.getByRole("button", { name: /buscar/i }));
      await waitFor(() =>
        expect(screen.getByText(/atleta no encontrado/i)).toBeInTheDocument(),
      );
    });

    it("shows the new atleta form fields", async () => {
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      await userEvent.type(screen.getByLabelText("DNI"), "00000000");
      await userEvent.click(screen.getByRole("button", { name: /buscar/i }));
      await waitFor(() => screen.getByText(/atleta no encontrado/i));
      expect(screen.getByLabelText("Nombre y apellido")).toBeInTheDocument();
      expect(screen.getByLabelText("País")).toBeInTheDocument();
      expect(screen.getByLabelText("Fecha de nacimiento")).toBeInTheDocument();
    });

    it("shows Inscribir button when atleta not found", async () => {
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      await userEvent.type(screen.getByLabelText("DNI"), "00000000");
      await userEvent.click(screen.getByRole("button", { name: /buscar/i }));
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /inscribir en esta prueba/i }),
        ).toBeInTheDocument(),
      );
    });
  });

  describe("search — server error", () => {
    it("shows error message on 500", async () => {
      server.use(
        http.get(
          "http://localhost:3002/jueces/torneo/:torneoId/atleta/dni/:dni",
          () =>
            HttpResponse.json({ error: "Error del servidor" }, { status: 500 }),
        ),
      );
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      await userEvent.type(screen.getByLabelText("DNI"), "99999999");
      await userEvent.click(screen.getByRole("button", { name: /buscar/i }));
      await waitFor(() =>
        expect(screen.getByText("Error del servidor")).toBeInTheDocument(),
      );
    });

    it("does not show Inscribir button on search error", async () => {
      server.use(
        http.get(
          "http://localhost:3002/jueces/torneo/:torneoId/atleta/dni/:dni",
          () => HttpResponse.json({ error: "Error" }, { status: 500 }),
        ),
      );
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      await userEvent.type(screen.getByLabelText("DNI"), "99999999");
      await userEvent.click(screen.getByRole("button", { name: /buscar/i }));
      await waitFor(() => screen.getByText("Error"));
      expect(
        screen.queryByRole("button", { name: /inscribir en esta prueba/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("registration", () => {
    it("calls onSuccess after successful registration of found atleta", async () => {
      server.use(
        http.post(
          "http://localhost:3002/jueces/torneo/:torneoId/atleta/registrar",
          () => HttpResponse.json({ ok: true }),
        ),
      );
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      await userEvent.type(screen.getByLabelText("DNI"), "12345678");
      await userEvent.click(screen.getByRole("button", { name: /buscar/i }));
      await waitFor(() => screen.getByText("María García"));
      await userEvent.click(
        screen.getByRole("button", { name: /inscribir en esta prueba/i }),
      );
      await waitFor(() =>
        expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1),
      );
    });

    it("closes modal after successful registration", async () => {
      server.use(
        http.post(
          "http://localhost:3002/jueces/torneo/:torneoId/atleta/registrar",
          () => HttpResponse.json({ ok: true }),
        ),
      );
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      await userEvent.type(screen.getByLabelText("DNI"), "12345678");
      await userEvent.click(screen.getByRole("button", { name: /buscar/i }));
      await waitFor(() => screen.getByText("María García"));
      await userEvent.click(
        screen.getByRole("button", { name: /inscribir en esta prueba/i }),
      );
      await waitFor(() =>
        expect(
          screen.queryByText("Registrar atleta en esta prueba"),
        ).not.toBeInTheDocument(),
      );
    });

    it("shows error when registration fails", async () => {
      server.use(
        http.post(
          "http://localhost:3002/jueces/torneo/:torneoId/atleta/registrar",
          () =>
            HttpResponse.json({ error: "Ya está inscripto" }, { status: 400 }),
        ),
      );
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      await userEvent.type(screen.getByLabelText("DNI"), "12345678");
      await userEvent.click(screen.getByRole("button", { name: /buscar/i }));
      await waitFor(() => screen.getByText("María García"));
      await userEvent.click(
        screen.getByRole("button", { name: /inscribir en esta prueba/i }),
      );
      await waitFor(() =>
        expect(screen.getByText("Ya está inscripto")).toBeInTheDocument(),
      );
    });

    it("does not call onSuccess when registration fails", async () => {
      server.use(
        http.post(
          "http://localhost:3002/jueces/torneo/:torneoId/atleta/registrar",
          () => HttpResponse.json({ error: "Error" }, { status: 400 }),
        ),
      );
      render(<RegistrarAtletaModal {...defaultProps} />);
      await openModal();
      await userEvent.type(screen.getByLabelText("DNI"), "12345678");
      await userEvent.click(screen.getByRole("button", { name: /buscar/i }));
      await waitFor(() => screen.getByText("María García"));
      await userEvent.click(
        screen.getByRole("button", { name: /inscribir en esta prueba/i }),
      );
      await waitFor(() => screen.getByText("Error"));
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    });
  });
});
