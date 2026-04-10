import { http, HttpResponse } from "msw";

const AMA_URL = "http://localhost:3001";
const JUECES_URL = "http://localhost:3002";

// ── AMA API handlers ──────────────────────────────────────────────────────────

export const amaHandlers = [
  http.post(`${AMA_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { dni: string; password: string };

    if (body.dni === "99999999") {
      return HttpResponse.json(
        { msg: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      token: "fake-ama-token",
      usuario: {
        uid: "user-1",
        nombre_apellido: "Admin Test",
        dni: body.dni,
        role: "ADMIN_ROLE",
        isEditor: false,
      },
    });
  }),

  http.get(`${AMA_URL}/torneo`, () => {
    return HttpResponse.json({
      torneos: [
        {
          _id: "torneo-1",
          nombre: "Torneo Test",
          lugar: "Mendoza",
          fecha: new Date().toISOString(),
          cantidadDias: 1,
          inscripcionesAbiertas: true,
          pruebasDisponibles: [],
          categoriasDisponibles: [],
        },
      ],
    });
  }),
];

// ── Jueces API handlers ───────────────────────────────────────────────────────

export const juecesHandlers = [
  http.post(`${JUECES_URL}/jueces/auth-dni/:torneoId`, async ({ request }) => {
    const body = (await request.json()) as { dni: string; pin: string };

    if (body.pin === "wrong-pin") {
      return HttpResponse.json({ error: "PIN incorrecto" }, { status: 401 });
    }

    return HttpResponse.json({
      token: "fake-juez-token",
      juezId: "juez-1",
      nombre: "Juez Test",
      torneoId: "torneo-1",
      esSuperJuez: true,
      pruebasAsignadas: ["prueba-1"],
    });
  }),

  http.post(`${JUECES_URL}/jueces/registrar/:torneoId`, async ({ request }) => {
    const body = (await request.json()) as { nombre: string };
    return HttpResponse.json({
      uid: "juez-new",
      nombre: body.nombre,
      aprobado: false,
      message: "Registrado. Esperá aprobación.",
    });
  }),

  http.get(`${JUECES_URL}/jueces/torneo/:torneoId/pruebas`, () => {
    return HttpResponse.json({
      pruebas: [
        {
          _id: "prueba-1",
          nombre: "100m Llanos",
          tipo: "velocidad",
          categorias: [{ _id: "cat-1", nombre: "Sub-18", esMaster: false }],
        },
      ],
    });
  }),

  http.get(
    `${JUECES_URL}/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId`,
    () => {
      return HttpResponse.json({
        prueba: { _id: "prueba-1" },
        config: {
          tipoMarca: "SPRINT",
          tieneViento: false,
          tipoIntentos: "ninguno",
          maxIntentos: 0,
          pesosPorEdad: [],
        },
        masculino: {
          resultadoId: null,
          viento: null,
          atletas: [
            {
              inscripcionId: "ins-1",
              numero: 1,
              esFederado: true,
              atleta: {
                _id: "atl-1",
                nombre_apellido: "Juan Pérez",
                dni: "12345678",
                sexo: "M",
                fecha_nacimiento: "2000-01-01",
                pais: "ARG",
              },
              pruebaAtletaId: "pa-1",
              marcaPersonal: "10.50",
              resultadoAtleta: null,
            },
          ],
        },
        femenino: { resultadoId: null, viento: null, atletas: [] },
      });
    },
  ),

  http.get(
    `${JUECES_URL}/jueces/torneo/:torneoId/atleta/dni/:dni`,
    ({ params }) => {
      if (params.dni === "00000000") {
        return HttpResponse.json(
          { error: "Atleta no encontrado" },
          { status: 404 },
        );
      }
      return HttpResponse.json({
        atleta: {
          nombre_apellido: "María García",
          pais: "ARG",
          sexo: "F",
        },
      });
    },
  ),

  http.post(`${JUECES_URL}/jueces/resultados/batch`, () => {
    return HttpResponse.json({ saved: ["pa-1"], errors: [] });
  }),
];

export const handlers = [...amaHandlers, ...juecesHandlers];
