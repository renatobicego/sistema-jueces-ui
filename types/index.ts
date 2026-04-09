// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AmaUser {
  uid: string;
  nombre_apellido: string;
  dni: string;
  role: string;
  isEditor: boolean;
}

export interface JuezSession {
  token: string;
  juezId: string;
  nombre: string;
  torneoId: string;
  esSuperJuez: boolean;
  pruebasAsignadas: string[];
}

// ── Torneo ────────────────────────────────────────────────────────────────────

export interface Torneo {
  _id: string;
  nombre: string;
  lugar: string;
  fecha: string;
  cantidadDias: number;
  inscripcionesAbiertas: boolean;
  pruebasDisponibles: string[];
  categoriasDisponibles: string[];
}

// ── Categoria ─────────────────────────────────────────────────────────────────

export interface Categoria {
  _id: string;
  nombre: string;
  esMaster: boolean;
}

// ── Prueba ────────────────────────────────────────────────────────────────────

export interface Prueba {
  _id: string;
  nombre: string;
  tipo: string;
  categorias: Categoria[];
}

// ── Config ────────────────────────────────────────────────────────────────────

export type TipoMarca =
  | "SPRINT"
  | "MEDIO_FONDO"
  | "FONDO"
  | "MARCHA"
  | "DISTANCIA"
  | "LARGO"
  | "ALTURA"
  | "PUNTOS";

export type TipoIntentos = "ninguno" | "serie" | "altura";

export interface PesoPorEdad {
  edadMin: number;
  edadMax: number;
  sexo: "M" | "F";
  peso: string;
}

export interface ConfigPrueba {
  tipoMarca: TipoMarca;
  tieneViento: boolean;
  tipoIntentos: TipoIntentos;
  maxIntentos: number;
  pesosPorEdad: PesoPorEdad[];
}

// ── Atleta / Results ──────────────────────────────────────────────────────────

export interface Atleta {
  _id: string;
  nombre_apellido: string;
  dni: string;
  sexo: "M" | "F";
  fecha_nacimiento: string;
  pais: string;
}

export interface IntentoSerie {
  marca: string | null;
  viento?: string | null;
}

export interface IntentoAltura {
  altura: string;
  intentos: ("O" | "X" | "-")[];
}

export interface ResultadoAtleta {
  _id: string;
  marca: string | null;
  viento: string | null;
  observacion: "DNS" | "DNF" | "NM" | "DQ" | null;
  intentosSerie: IntentoSerie[];
  intentosAltura: IntentoAltura[];
}

export interface AtletaEntry {
  inscripcionId: string;
  numero: number;
  esFederado: boolean;
  atleta: Atleta;
  pruebaAtletaId: string;
  marcaPersonal: string;
  resultadoAtleta: ResultadoAtleta | null;
}

export interface EventoAtletas {
  prueba: { _id: string };
  config: ConfigPrueba | null;
  masculino: {
    resultadoId: string | null;
    viento: string | null;
    atletas: AtletaEntry[];
  };
  femenino: {
    resultadoId: string | null;
    viento: string | null;
    atletas: AtletaEntry[];
  };
}

// ── Juez ──────────────────────────────────────────────────────────────────────

export interface AccesoJuez {
  _id: string;
  torneo: string;
  nombre: string;
  aprobado: boolean;
  esSuperJuez: boolean;
  pruebasAsignadas: string[];
}
