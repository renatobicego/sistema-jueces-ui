import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeatManagementModal from "../HeatManagementModal";
import { useAuthStore } from "@/store/authStore";
import * as heatsApi from "@/lib/api/heats";
import * as resultadosApi from "@/lib/api/resultados";

vi.mock("@/store/authStore");
vi.mock("@/lib/api/heats");
vi.mock("@/lib/api/resultados");

describe("HeatManagementModal", () => {
  const mockProps = {
    torneoId: "torneo1",
    pruebaId: "prueba1",
    categoriaId: "cat1",
    sexo: "M" as const,
    currentHeat: "Final_A",
    config: {
      tipoMarca: "SPRINT" as const,
      tieneViento: false,
      tipoIntentos: "ninguno" as const,
      maxIntentos: 0,
      pesosPorEdad: [],
    },
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      juezSession: { token: "test-token" },
    } as never);
    vi.mocked(heatsApi.fetchHeats).mockResolvedValue({ heats: ["Final_A"] });
  });

  it("renders modal with title", async () => {
    render(<HeatManagementModal {...mockProps} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Crear Series" }),
      ).toBeInTheDocument();
    });
  });

  it("shows automatic series creation form when no series exist", async () => {
    render(<HeatManagementModal {...mockProps} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Las series se crearán automáticamente/i),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Atletas por serie")).toBeInTheDocument();
    });
  });

  it("shows mode selection when series exist", async () => {
    vi.mocked(heatsApi.fetchHeats).mockResolvedValue({
      heats: ["Serie_1", "Serie_2", "Final_A"],
    });

    render(<HeatManagementModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Tipo de Heat")).toBeInTheDocument();
    });
  });

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<HeatManagementModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Cancelar"));
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it("displays athlete grid for semifinal creation", async () => {
    vi.mocked(heatsApi.fetchHeats).mockResolvedValue({
      heats: ["Serie_1", "Serie_2"],
    });
    vi.mocked(resultadosApi.fetchAtletasPorPrueba).mockResolvedValue({
      prueba: { _id: "prueba1" },
      config: mockProps.config,
      masculino: {
        resultadoId: "res1",
        viento: null,
        atletas: [
          {
            inscripcionId: "insc1",
            numero: 1,
            esFederado: true,
            atleta: {
              _id: "atleta1",
              nombre_apellido: "Test Athlete",
              dni: "12345678",
              sexo: "M",
              fecha_nacimiento: "2000-01-01",
              pais: "ARG",
            },
            pruebaAtletaId: "pa1",
            marcaPersonal: "10.50",
            resultadoAtleta: {
              _id: "ra1",
              marca: "10.60",
              marcaParcial: null,
              puesto: 1,
              viento: null,
              observacion: null,
              intentosSerie: [],
              intentosAltura: [],
            },
          },
        ],
      },
      femenino: {
        resultadoId: null,
        viento: null,
        atletas: [],
      },
    });

    render(<HeatManagementModal {...mockProps} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Seleccione los atletas que avanzarán/i),
      ).toBeInTheDocument();
    });
  });
});
