import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AdminHeader from "../AdminNav";
import { resetAuthStore } from "@/tests/helpers/authStore";
import { useAuthStore } from "@/store/authStore";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const user = {
  uid: "u1",
  nombre_apellido: "Carlos Juez",
  dni: "12345678",
  role: "ADMIN_ROLE",
  isEditor: false,
};

beforeEach(() => {
  resetAuthStore();
  mockPush.mockClear();
});

describe("AdminNav", () => {
  it("renders the user name", () => {
    render(<AdminHeader user={user} />);
    expect(screen.getByText("Carlos Juez")).toBeInTheDocument();
  });

  it("renders the brand link pointing to /admin/torneos", () => {
    render(<AdminHeader user={user} />);
    expect(
      screen.getByRole("link", { name: /sistema jueces/i }),
    ).toHaveAttribute("href", "/admin/torneos");
  });

  it("renders the logout button", () => {
    render(<AdminHeader user={user} />);
    expect(screen.getByRole("button", { name: /salir/i })).toBeInTheDocument();
  });

  it("clears amaUser from store on logout", async () => {
    useAuthStore.getState().setAmaAuth(user, "token");
    render(<AdminHeader user={user} />);
    await userEvent.click(screen.getByRole("button", { name: /salir/i }));
    expect(useAuthStore.getState().amaUser).toBeNull();
  });

  it("clears amaToken from store on logout", async () => {
    useAuthStore.getState().setAmaAuth(user, "token");
    render(<AdminHeader user={user} />);
    await userEvent.click(screen.getByRole("button", { name: /salir/i }));
    expect(useAuthStore.getState().amaToken).toBeNull();
  });

  it("redirects to / on logout", async () => {
    render(<AdminHeader user={user} />);
    await userEvent.click(screen.getByRole("button", { name: /salir/i }));
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("renders different user names correctly", () => {
    render(
      <AdminHeader user={{ ...user, nombre_apellido: "María González" }} />,
    );
    expect(screen.getByText("María González")).toBeInTheDocument();
  });
});
