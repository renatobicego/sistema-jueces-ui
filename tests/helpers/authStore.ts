import { useAuthStore } from "@/store/authStore";

/** Reset auth store to initial state between tests */
export function resetAuthStore() {
  useAuthStore.setState({
    amaUser: null,
    amaToken: null,
    juezSession: null,
  });
}

export function seedJuezSession(overrides = {}) {
  useAuthStore.setState({
    juezSession: {
      token: "fake-juez-token",
      juezId: "juez-1",
      nombre: "Juez Test",
      torneoId: "torneo-1",
      esSuperJuez: false,
      pruebasAsignadas: ["prueba-1"],
      ...overrides,
    },
  });
}

export function seedSuperJuezSession(overrides = {}) {
  seedJuezSession({ esSuperJuez: true, ...overrides });
}
