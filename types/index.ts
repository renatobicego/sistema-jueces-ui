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
  marcaParcial: string | null;
  puesto: number | null;
  viento: string | null;
  observacion: "DNS" | "DNF" | "NM" | "DQ" | null;
  intentosSerie: IntentoSerie[];
  intentosAltura: IntentoAltura[];
  andarivel: number | null;
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

// ── UI / Component types ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SelectItem<K = any> = {
  key: string;
  label: string;
  value: K;
};

export interface FilaFallida {
  fila: number;
  dni: string;
  nombre: string;
  prueba: string;
  categoria: string;
  motivo: string;
}

// Row shape used inside ResultadosGrid
export interface GridRow extends AtletaEntry {
  _marca: string;
  _viento: string;
  _observacion: string;
  _dirty: boolean;
  _manualFinalMark?: boolean;
  _puesto?: number;
  _andarivel?: number | null;
}

// ── Component prop types ──────────────────────────────────────────────────────

export interface VientoInputProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  className?: string;
}

export interface TorneoSelectorProps {
  torneos: Torneo[];
  loading: boolean;
  selected: Torneo | null;
  onSelect: (t: Torneo) => void;
  soloActivos: boolean;
  onToggleActivos: (v: boolean) => void;
}

export interface JuecesGridProps {
  jueces: AccesoJuez[];
  pruebas: Prueba[];
  onAprobar: (
    juezId: string,
    aprobado: boolean,
    pruebasAsignadas: string[],
  ) => Promise<void>;
  onEliminar: (juezId: string) => Promise<void>;
}

export interface RegistrarAtletaModalProps {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  onSuccess: () => void;
  heat?: string;
}

export interface ResultadosGridProps {
  atletas: AtletaEntry[];
  config: ConfigPrueba | null;
  resultadoId: string | null;
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: "M" | "F";
  onSaved: () => Promise<void>;
  serie: string;
  pruebaName: string;
}

export interface SuperJuezGuardProps {
  torneoId: string;
  children: React.ReactNode;
}

// ── Heats/Rounds Management ───────────────────────────────────────────────────

export interface HeatInfo {
  name: string;
  athleteCount: number;
}

export interface AthleteForProgression {
  pruebaAtletaId: string;
  atletaId: string;
  nombre: string;
  numero: number;
  sourceHeat: string;
  puesto: number | null;
  marca: string | null;
}

export interface CreateHeatsRequest {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: "M" | "F";
  heatType: "series" | "semifinal" | "final";
  athletesPerSeries?: number;
  heats?: Array<{
    name: string;
    athleteIds: string[];
  }>;
  sourceHeats?: string[];
}

export interface CreateHeatsResponse {
  success: boolean;
  heatsCreated: string[];
  athletesMoved: number;
  errors?: string[];
}

export type HeatMode =
  | "create-series"
  | "create-semifinal"
  | "create-final-a"
  | "create-final-b";
