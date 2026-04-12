# Design Document: Heats/Rounds Management System

## Overview

The Heats/Rounds Management System extends the existing athletics competition judging application to support multi-round competitions. Currently, all athletes are assigned to a single "Final_A" heat by default. This design introduces the ability to organize competitions into preliminary rounds (Series), semifinals (Semi), and finals (Final_A, Final_B) with automatic seeding algorithms and manual athlete distribution capabilities.

The system maintains backward compatibility by preserving the default Final_A behavior when no heats are configured. When heats are created, athletes are distributed across rounds with their performance tracked separately in each round through distinct ResultadoAtleta records.

### Key Design Goals

- Maintain backward compatibility with existing Final_A-only competitions
- Support automatic seeding based on personal bests with event-type-aware sorting
- Enable manual athlete assignment and movement between heats
- Track athlete progression through multiple rounds with separate result records
- Provide intuitive UI components for heat selection and management
- Ensure data integrity through validation of prerequisites and athlete movements

### Research Context

**Seeding Algorithms in Athletics**: Standard athletics competition practice distributes top-seeded athletes as "heads" of heats to ensure balanced competition. The snake pattern (also called serpentine distribution) is widely used: after placing the top N athletes (where N = number of heats), remaining athletes are assigned in alternating order (1→N, then N→1, then 1→N, etc.). This minimizes performance variance across heats.

**Event Type Considerations**: Athletics events fall into two categories for seeding purposes:

- Time-based events (sprints, middle distance, long distance, race walking): Lower times indicate better performance
- Distance/height-based events (throws, jumps, combined events): Higher values indicate better performance

The TipoMarca enum in the existing codebase already categorizes events appropriately for this distinction.

## Architecture

### System Components

The system consists of three main layers:

1. **Backend API Layer** (Node.js/Express/MongoDB)
   - Heat query endpoints for retrieving athletes by heat
   - Heat list endpoint for available heats
   - Heat creation endpoint for automatic and manual heat management
   - Extended resultado utilities for multi-heat support

2. **Data Layer** (Mongoose Models)
   - Resultado model (already has `serie` field)
   - ResultadoAtleta model (unchanged, supports multiple records per athlete)
   - ConfigPrueba model (provides TipoMarca for seeding logic)

3. **Frontend UI Layer** (Next.js/TypeScript/React)
   - Heat Selector component for heat navigation
   - Heat Management Modal with AgGrid for athlete selection
   - Integration with existing ResultadosGrid component

### Data Flow

```
User Action (Create Heats)
    ↓
Heat Management Modal
    ↓
POST /api/jueces/heats/create
    ↓
Backend Validation (prerequisites, athlete existence)
    ↓
Seeding Algorithm (if automatic) OR Manual Assignment
    ↓
Create/Update Resultado documents with serie field
    ↓
Create new ResultadoAtleta records for progressing athletes
    ↓
Update Resultado.resultadosAtleta arrays
    ↓
Return success/error response
    ↓
UI refreshes heat list and athlete grid
```

### Integration Points

- **Existing GET endpoint**: Modified to accept optional `serie` query parameter, defaults to "Final_A"
- **Existing ResultadosGrid**: Receives athletes filtered by selected heat
- **Existing resultado.utils**: `findOrCreateResultado` function modified to accept serie parameter
- **Existing types**: Extended to include heat-related data structures

## Components and Interfaces

### Backend API Endpoints

#### 1. Modified GET /api/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId

**Purpose**: Retrieve athletes for a specific heat

**Query Parameters**:

- `serie` (optional, string): Heat name (Serie_1, Semi_1, Final_A, etc.). Defaults to "Final_A"

**Response**: Existing EventoAtletas structure, filtered by serie

**Changes**:

- Add query parameter extraction
- Modify Resultado query to filter by serie field
- Maintain backward compatibility when serie is not provided

#### 2. New GET /api/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId/heats

**Purpose**: List all available heats for an event

**Response**:

```typescript
{
  heats: string[]  // e.g., ["Serie_1", "Serie_2", "Semi_1", "Final_A"]
}
```

**Logic**:

- Query Resultado collection for distinct serie values matching torneo/prueba/categoria
- Sort heats logically: Series (Serie_1, Serie_2, ...), Semifinals (Semi_1, Semi_2, ...), Finals (Final_A, Final_B)
- Return empty array if no heats exist

#### 3. New POST /api/jueces/heats/create

**Purpose**: Unified endpoint for creating heats with automatic or manual distribution

**Request Body**:

```typescript
{
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: "M" | "F";
  heatType: "series" | "semifinal" | "final";

  // For automatic series creation
  athletesPerSeries?: number;

  // For manual series/semifinal/final creation
  heats?: Array<{
    name: string;  // e.g., "Serie_1", "Semi_1", "Final_A"
    athleteIds: string[];  // pruebaAtletaIds
  }>;

  // For progression (semifinal/final from previous rounds)
  sourceHeats?: string[];  // e.g., ["Serie_1", "Serie_2"]
}
```

**Response**:

```typescript
{
  success: boolean;
  heatsCreated: string[];
  athletesMoved: number;
  errors?: string[];
}
```

**Validation**:

- For semifinal/final creation: verify Series exist and have puesto values
- For final creation: limit to 2 heats maximum
- Verify all athlete IDs exist
- Verify source heats exist when specified

### Backend Utility Functions

#### seedingUtils.ts (new file)

```typescript
// Determine sort order based on event type
function getSortOrder(tipoMarca: TipoMarca): "asc" | "desc";

// Sort athletes by marcaPersonal according to event type
function sortAthletesByPerformance(
  athletes: AtletaEntry[],
  tipoMarca: TipoMarca,
): AtletaEntry[];

// Distribute athletes using snake pattern
function distributeSnakePattern(
  athletes: AtletaEntry[],
  numHeats: number,
): Map<string, AtletaEntry[]>;

// Create series automatically
function createSeriesAutomatic(params: {
  athletes: AtletaEntry[];
  athletesPerSeries: number;
  tipoMarca: TipoMarca;
}): Map<string, AtletaEntry[]>;
```

#### heatUtils.ts (new file)

```typescript
// Move athlete from one heat to another
async function moveAthleteBetweenHeats(params: {
  pruebaAtletaId: string;
  sourceHeat: string;
  targetHeat: string;
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: string;
}): Promise<void>;

// Create new ResultadoAtleta for athlete in new heat
async function createResultadoAtletaForHeat(params: {
  pruebaAtletaId: string;
  atletaId: string;
  heat: string;
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: string;
}): Promise<IResultadoAtleta>;

// Validate prerequisites for heat creation
async function validateHeatCreationPrerequisites(params: {
  heatType: "series" | "semifinal" | "final";
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: string;
}): Promise<{ valid: boolean; error?: string }>;

// Get athletes from source heats with their performance data
async function getAthletesFromHeats(params: {
  heats: string[];
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: string;
}): Promise<
  Array<{
    pruebaAtletaId: string;
    atletaId: string;
    nombre: string;
    sourceHeat: string;
    puesto: number | null;
    marca: string | null;
  }>
>;
```

#### Modified resultado.utils.ts

```typescript
// Update findOrCreateResultado to accept serie parameter
export async function findOrCreateResultado(params: {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: string;
  serie: string; // NEW: no longer hardcoded to "Final_A"
  juezId: string;
  juezNombre: string;
}): Promise<IResultado>;
```

### Frontend Components

#### HeatSelector Component

**Location**: `ui-sistemaJueces/components/atoms/HeatSelector.tsx`

**Props**:

```typescript
interface HeatSelectorProps {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  selectedHeat: string;
  onHeatChange: (heat: string) => void;
}
```

**Behavior**:

- Fetches available heats on mount via GET /heats endpoint
- Displays dropdown with heat options
- Defaults to "Final_A"
- Triggers parent callback on selection change

**UI**: CustomSelect component styled consistently with existing selectors

#### HeatManagementModal Component

**Location**: `ui-sistemaJueces/components/organisms/HeatManagementModal.tsx`

**Props**:

```typescript
interface HeatManagementModalProps {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: "M" | "F";
  currentHeat: string;
  config: ConfigPrueba | null;
  onClose: () => void;
  onSuccess: () => void;
}
```

**State Management**:

- Mode: "create-series" | "create-semifinal" | "create-final"
- Selected athletes (for progression)
- Athletes per series (for automatic creation)
- Available athletes from source heats

**UI Structure**:

```
Modal
├── Header (title based on mode)
├── Mode Selection (if applicable)
├── Configuration Section
│   ├── Automatic: Input for athletes per series
│   └── Manual: Heat name + athlete selection
├── Athlete Grid (AgGrid)
│   ├── Columns: Checkbox, Name, Number, Source Heat, Puesto, Marca
│   ├── Filtering and sorting enabled
│   └── Multi-select via checkboxes
└── Actions
    ├── Cancel button
    └── Create/Confirm button
```

**AgGrid Configuration**:

- Row selection: multiple
- Column definitions: athlete name, number, source heat, puesto, marca
- Filtering: enabled on all columns
- Sorting: enabled on all columns
- Checkbox selection column

#### Modified pruebas page

**Location**: `ui-sistemaJueces/app/juez/[torneoId]/pruebas/page.tsx`

**Changes**:

- Add HeatSelector component above ResultadosGrid
- Add "Manage Heats" button (visible to super judges only)
- Add state for selected heat
- Pass selected heat to data fetching logic
- Open HeatManagementModal on button click

### Frontend API Integration

**New API functions** (`ui-sistemaJueces/lib/api/heats.ts`):

```typescript
export async function fetchHeats(params: {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  token: string;
}): Promise<{ heats: string[] }>;

export async function createHeats(params: {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  sexo: "M" | "F";
  heatType: "series" | "semifinal" | "final";
  athletesPerSeries?: number;
  heats?: Array<{ name: string; athleteIds: string[] }>;
  sourceHeats?: string[];
  token: string;
}): Promise<{
  success: boolean;
  heatsCreated: string[];
  athletesMoved: number;
}>;
```

**Modified API function** (`ui-sistemaJueces/lib/api/resultados.ts`):

```typescript
// Add serie parameter to existing fetchAtletasPorPrueba
export async function fetchAtletasPorPrueba(params: {
  torneoId: string;
  pruebaId: string;
  categoriaId: string;
  serie?: string; // NEW: optional heat parameter
  token: string;
}): Promise<EventoAtletas>;
```

## Data Models

### Resultado Model (existing, no schema changes needed)

The Resultado model already contains the `serie` field:

```typescript
{
  torneo: ObjectId;
  prueba: ObjectId;
  categoria: ObjectId;
  sexo: "M" | "F";
  serie: string;  // Already exists, defaults to "Final_A"
  viento: string | null;
  observacion: string | null;
  juez: string | null;
  resultadosAtleta: ObjectId[];  // References to ResultadoAtleta
}
```

**Unique Index**: `{ torneo, prueba, categoria, sexo, serie }` - already exists

**Heat Naming Conventions**:

- Series: "Serie_1", "Serie_2", "Serie_3", ...
- Semifinals: "Semi_1", "Semi_2", "Semi_3", ...
- Finals: "Final_A", "Final_B"

### ResultadoAtleta Model (existing, no changes needed)

```typescript
{
  resultado: ObjectId;  // References parent Resultado (specific heat)
  pruebaAtleta: ObjectId;  // References athlete's event registration
  atleta: ObjectId;
  marca: string | null;
  marcaParcial: string | null;
  puesto: number | null;
  viento: string | null;
  observacion: string | null;
  intentosSerie: IntentoSerie[];
  intentosAltura: IntentoAltura[];
}
```

**Unique Index**: `{ resultado, pruebaAtleta }` - already exists

**Multi-Round Support**: The existing schema already supports multiple ResultadoAtleta records per athlete across different heats because the unique index is on `(resultado, pruebaAtleta)`, not just `pruebaAtleta`. Each Resultado document represents a different heat, so the same athlete can have multiple ResultadoAtleta records in different heats.

### Frontend Type Extensions

**New types** (`ui-sistemaJueces/types/index.ts`):

```typescript
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
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties and eliminated redundancy:

**Redundancies Eliminated**:

- Requirements 15.1-15.4 (individual time-based events) are subsumed by 2.2 (all time-based events)
- Requirements 16.1-16.4 (individual distance-based events) are subsumed by 2.3 (all distance-based events)
- Requirements 17.1-17.3 (snake pattern steps) are subsumed by 2.5 (complete snake pattern)
- Requirements 4.3, 4.4, 6.3, 18.2, 18.4 are restatements of their parent requirements
- Requirements 1.2, 5.5, 14.1, 14.3, 19.1, 19.2, 20.1 are covered by other properties
- Multiple UI and API design requirements are not computationally testable

**Unique Properties Identified**: 24 distinct testable properties covering:

- Seeding algorithms (sorting, distribution, naming)
- Heat creation and validation
- Athlete movement and progression
- Data integrity and referential consistency
- Error conditions and edge cases
- Query behavior and defaults

### Property 1: Series Count Calculation

_For any_ set of athletes and specified athletes per series, the number of series created should equal the ceiling of (total athletes / athletes per series).

**Validates: Requirements 2.1**

### Property 2: Time-Based Event Seeding Order

_For any_ set of athletes in a time-based event (SPRINT, MEDIO_FONDO, FONDO, MARCHA), when sorted for seeding, athletes with lower marcaPersonal values should appear before athletes with higher marcaPersonal values.

**Validates: Requirements 2.2, 15.1, 15.2, 15.3, 15.4**

### Property 3: Distance-Based Event Seeding Order

_For any_ set of athletes in a distance-based event (DISTANCIA, LARGO, ALTURA, PUNTOS), when sorted for seeding, athletes with higher marcaPersonal values should appear before athletes with lower marcaPersonal values.

**Validates: Requirements 2.3, 16.1, 16.2, 16.3, 16.4**

### Property 4: Head Athletes Distribution

_For any_ automatic series creation with N series, the top N athletes (by performance) should each be assigned to a different series, with exactly one head athlete per series.

**Validates: Requirements 2.4**

### Property 5: Snake Pattern Distribution

_For any_ snake pattern distribution with N heats, after assigning head athletes, the remaining athletes should be assigned in alternating order: positions N+1 through 2N go to heats 1→N, positions 2N+1 through 3N go to heats N→1, and this pattern continues until all athletes are assigned.

**Validates: Requirements 2.5, 17.1, 17.2, 17.3**

### Property 6: Snake Pattern Performance Balance

_For any_ snake pattern distribution, athletes at the same position across different heats should have minimal performance variance compared to any other distribution method.

**Validates: Requirements 17.4**

### Property 7: Series Sequential Naming

_For any_ number of series created, the series names should be "Serie_1", "Serie_2", "Serie_3", ..., "Serie_N" in sequential order.

**Validates: Requirements 2.6**

### Property 8: Final_A Emptied After Series Creation

_For any_ series creation from Final_A, after the operation completes, the Resultado document for Final_A should have an empty resultadosAtleta array.

**Validates: Requirements 2.7, 19.1, 19.2**

### Property 9: Athlete Movement Between Heats

_For any_ valid athlete move from source heat to target heat, after the operation completes, the athlete should appear in the target heat's resultadosAtleta array and not appear in the source heat's resultadosAtleta array.

**Validates: Requirements 3.2**

### Property 10: Invalid Athlete Move Rejection

_For any_ move operation with a non-existent pruebaAtletaId, the system should reject the operation with an error.

**Validates: Requirements 3.4, 18.1, 18.2**

### Property 11: Semifinal/Final Creation Requires Series

_For any_ attempt to create semifinal or final heats when no series exist for the event, the system should reject the operation with an error.

**Validates: Requirements 4.1, 4.3, 20.1**

### Property 12: Semifinal/Final Creation Requires Complete Results

_For any_ attempt to create semifinal or final heats when any series lacks puesto values for all athletes, the system should reject the operation with an error.

**Validates: Requirements 4.2, 4.4**

### Property 13: Athlete Progression Creates New ResultadoAtleta

_For any_ athlete selected for progression to a new heat, a new ResultadoAtleta document should be created in the target heat with the same pruebaAtletaId and atletaId.

**Validates: Requirements 5.3**

### Property 14: Athlete Progression Preserves Source ResultadoAtleta

_For any_ athlete progression to a new heat, the original ResultadoAtleta document in the source heat should remain unchanged.

**Validates: Requirements 5.4, 14.3**

### Property 15: New ResultadoAtleta Has Empty Performance Data

_For any_ newly created ResultadoAtleta during progression, the performance fields (marca, marcaParcial, puesto, viento, observacion, intentosSerie, intentosAltura) should be null or empty.

**Validates: Requirements 14.2**

### Property 16: Final Heat Naming

_For any_ final heats created, the names should be exactly "Final_A" and "Final_B".

**Validates: Requirements 6.1**

### Property 17: Final Heat Count Limit

_For any_ attempt to create more than 2 final heats for an event, the system should reject the operation with an error.

**Validates: Requirements 6.2, 6.3**

### Property 18: Semifinal Sequential Naming

_For any_ number of semifinals created, the semifinal names should be "Semi_1", "Semi_2", "Semi_3", ..., "Semi_N" in sequential order.

**Validates: Requirements 7.1**

### Property 19: Query Default Heat

_For any_ query to the GET athletes endpoint without a serie parameter, the returned athletes should be from the "Final_A" heat.

**Validates: Requirements 8.2**

### Property 20: Query Specified Heat

_For any_ query to the GET athletes endpoint with a serie parameter, all returned athletes should belong to the specified heat.

**Validates: Requirements 8.3**

### Property 21: Query Non-Existent Heat Returns Empty

_For any_ query to the GET athletes endpoint with a serie parameter for a non-existent heat, the returned athlete arrays should be empty.

**Validates: Requirements 8.4**

### Property 22: Heat List Completeness

_For any_ event, the GET heats endpoint should return all distinct serie values from Resultado documents matching that event.

**Validates: Requirements 9.2, 9.3**

### Property 23: Heat List Logical Order

_For any_ heat list returned, series should appear before semifinals, and semifinals should appear before finals, with each group in sequential order.

**Validates: Requirements 9.4**

### Property 24: Serie Field Naming Pattern

_For any_ Resultado document, the serie field value should match one of the valid patterns: "Serie_N", "Semi_N", "Final_A", or "Final_B" where N is a positive integer.

**Validates: Requirements 13.2**

### Property 25: Resultado-ResultadoAtleta Referential Integrity

_For any_ Resultado document, all ObjectIds in the resultadosAtleta array should reference ResultadoAtleta documents where the resultado field points back to that Resultado's \_id.

**Validates: Requirements 14.4**

### Property 26: Invalid Target Heat Move Rejection

_For any_ move operation to a non-existent target heat, the system should reject the operation with an error.

**Validates: Requirements 18.3, 18.4**

### Property 27: Series Creation After Advanced Rounds Rejected

_For any_ attempt to create series when semifinals or finals already exist for the event, the system should reject the operation with an error.

**Validates: Requirements 20.4**

## Error Handling

### Validation Errors

The system implements comprehensive validation at multiple levels:

**API Request Validation**:

- Required parameters (torneoId, pruebaId, categoriaId, sexo)
- Heat type enum validation (series, semifinal, final)
- Numeric constraints (athletesPerSeries > 0, final count ≤ 2)
- Array validation (non-empty athlete lists for manual creation)

**Business Logic Validation**:

- Prerequisites for heat creation (series exist, results complete)
- Athlete existence verification before moves
- Heat existence verification for queries and moves
- Duplicate heat name prevention
- Progression workflow enforcement (no series after semifinals/finals)

**Data Integrity Validation**:

- Unique index on Resultado (torneo, prueba, categoria, sexo, serie)
- Unique index on ResultadoAtleta (resultado, pruebaAtleta)
- Foreign key references (ObjectId validation)
- Serie field pattern validation

### Error Response Format

All API endpoints return consistent error responses:

```typescript
{
  error: string;  // Human-readable error message
  code?: string;  // Optional error code for client handling
  details?: any;  // Optional additional context
}
```

### Error Categories

**400 Bad Request**:

- Missing required parameters
- Invalid parameter values
- Invalid heat names or patterns
- Validation failures (format, constraints)

**403 Forbidden**:

- Judge permission violations
- Workflow violations (creating series after finals)

**404 Not Found**:

- Non-existent torneo, prueba, categoria
- Non-existent heat in query
- Non-existent athlete in move operation

**409 Conflict**:

- Duplicate heat creation
- Unique constraint violations

**500 Internal Server Error**:

- Database errors
- Unexpected system failures

### Error Recovery

**Transactional Operations**: Heat creation operations that involve multiple database writes should be wrapped in transactions (or implement compensating actions) to ensure atomicity. If any step fails, all changes should be rolled back.

**Idempotency**: GET endpoints are naturally idempotent. POST endpoints should handle duplicate requests gracefully (e.g., attempting to create the same heat twice should return the existing heat or a clear error).

**Partial Failures**: Batch operations (creating multiple heats) should report which operations succeeded and which failed, allowing users to retry only the failed operations.

## Testing Strategy

### Dual Testing Approach

The system requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:

- Specific examples of seeding algorithms (e.g., 10 athletes into 3 series)
- Edge cases (empty athlete lists, single athlete, single series)
- Error conditions (missing prerequisites, invalid inputs)
- Integration points (API endpoint responses, database queries)
- UI component rendering and interactions

**Property-Based Tests** focus on:

- Universal properties across all inputs (seeding correctness for any athlete count)
- Algorithmic correctness (snake pattern for any number of heats)
- Data integrity invariants (referential consistency)
- Validation rules (rejection of invalid operations)

### Property-Based Testing Configuration

**Library Selection**:

- Backend (Node.js/TypeScript): **fast-check** - mature PBT library with excellent TypeScript support
- Frontend (React/TypeScript): **fast-check** - same library for consistency

**Test Configuration**:

- Minimum 100 iterations per property test
- Seed value logging for reproducibility
- Shrinking enabled to find minimal failing examples

**Property Test Tagging**:
Each property test must include a comment referencing the design property:

```typescript
// Feature: heats-rounds-management, Property 2: Time-Based Event Seeding Order
test("time-based events sort ascending by marcaPersonal", () => {
  fc.assert(
    fc.property(
      fc.array(athleteArbitrary, { minLength: 1 }),
      fc.constantFrom("SPRINT", "MEDIO_FONDO", "FONDO", "MARCHA"),
      (athletes, tipoMarca) => {
        const sorted = sortAthletesByPerformance(athletes, tipoMarca);
        // Assert ascending order
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].marcaPersonal >= sorted[i - 1].marcaPersonal).toBe(
            true,
          );
        }
      },
    ),
    { numRuns: 100 },
  );
});
```

### Unit Testing Strategy

**Backend Unit Tests**:

- `seedingUtils.test.ts`: Test seeding algorithms with specific examples
  - 10 athletes, 3 series, time-based event
  - 8 athletes, 2 series, distance-based event
  - Edge case: 5 athletes, 5 series (one per series)
  - Edge case: 3 athletes, 1 series (all in one)
- `heatUtils.test.ts`: Test heat management operations
  - Move athlete between heats
  - Create ResultadoAtleta for progression
  - Validate prerequisites (with and without series)
  - Error cases (non-existent athlete, non-existent heat)

- `heats.controller.test.ts`: Test API endpoints
  - GET /heats returns correct list
  - GET with serie parameter filters correctly
  - POST /heats/create with automatic seeding
  - POST /heats/create with manual assignment
  - Error responses for invalid requests

**Frontend Unit Tests**:

- `HeatSelector.test.tsx`: Test component behavior
  - Renders dropdown with heats
  - Defaults to Final_A
  - Calls onHeatChange when selection changes
  - Fetches heats on mount

- `HeatManagementModal.test.tsx`: Test modal interactions
  - Opens and closes correctly
  - Displays correct mode based on current state
  - Submits correct data on confirmation
  - Handles errors from API

### Integration Testing

**API Integration Tests**:

- Full workflow: create series → record results → create semifinals → record results → create finals
- Athlete progression: verify ResultadoAtleta records in multiple heats
- Query behavior: verify filtering by serie parameter
- Error scenarios: verify prerequisite validation

**UI Integration Tests**:

- Heat selector integration with ResultadosGrid
- Heat management modal integration with API
- Error handling and user feedback

### Test Data Generators

**Arbitraries for Property-Based Tests** (using fast-check):

```typescript
// Generate random athlete with marcaPersonal
const athleteArbitrary = fc.record({
  pruebaAtletaId: fc.uuid(),
  atletaId: fc.uuid(),
  nombre: fc.string({ minLength: 3, maxLength: 50 }),
  marcaPersonal: fc.oneof(
    fc.string({ pattern: /\d{2}\.\d{2}/ }), // SPRINT format
    fc.string({ pattern: /\d{1}\.\d{2}/ }), // LARGO format
  ),
});

// Generate random TipoMarca
const tipoMarcaArbitrary = fc.constantFrom(
  "SPRINT",
  "MEDIO_FONDO",
  "FONDO",
  "MARCHA",
  "DISTANCIA",
  "LARGO",
  "ALTURA",
  "PUNTOS",
);

// Generate random heat name
const heatNameArbitrary = fc.oneof(
  fc.nat().map((n) => `Serie_${n + 1}`),
  fc.nat().map((n) => `Semi_${n + 1}`),
  fc.constantFrom("Final_A", "Final_B"),
);
```

### Test Coverage Goals

- Unit test coverage: ≥ 80% for all utility functions and controllers
- Property test coverage: All 27 correctness properties implemented
- Integration test coverage: All critical user workflows
- UI component coverage: ≥ 70% for all new components

### Continuous Integration

- Run all tests on every commit
- Property tests run with fixed seed for reproducibility
- Failed property tests log the failing seed for debugging
- Performance benchmarks for seeding algorithms (should handle 1000+ athletes)
