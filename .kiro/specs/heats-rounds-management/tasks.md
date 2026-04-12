# Implementation Plan: Heats/Rounds Management System

## Overview

This implementation plan creates a multi-round competition management system for athletics events. The system enables organizing competitions into preliminary rounds (Series), semifinals, and finals with automatic seeding algorithms and manual athlete distribution. Implementation follows a backend-first approach, building data utilities and API endpoints before frontend components.

## Tasks

- [x] 1. Set up backend utilities and data layer
  - [x] 1.1 Create seedingUtils.ts with sorting and distribution functions
    - Implement `getSortOrder(tipoMarca)` to determine asc/desc based on event type
    - Implement `sortAthletesByPerformance(athletes, tipoMarca)` for seeding order
    - Implement `distributeSnakePattern(athletes, numHeats)` for balanced distribution
    - Implement `createSeriesAutomatic(params)` for automatic series creation
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 15.1-15.4, 16.1-16.4, 17.1-17.4_

  - [x]\* 1.2 Write property tests for seeding algorithms
    - **Property 2: Time-Based Event Seeding Order** - Validates: Requirements 2.2, 15.1-15.4
    - **Property 3: Distance-Based Event Seeding Order** - Validates: Requirements 2.3, 16.1-16.4
    - **Property 4: Head Athletes Distribution** - Validates: Requirements 2.4
    - **Property 5: Snake Pattern Distribution** - Validates: Requirements 2.5, 17.1-17.3
    - **Property 6: Snake Pattern Performance Balance** - Validates: Requirements 17.4

  - [x] 1.3 Create heatUtils.ts with heat management functions
    - Implement `moveAthleteBetweenHeats(params)` for athlete transfers
    - Implement `createResultadoAtletaForHeat(params)` for progression
    - Implement `validateHeatCreationPrerequisites(params)` for workflow validation
    - Implement `getAthletesFromHeats(params)` for sourcing athletes from previous rounds
    - _Requirements: 3.2, 3.4, 4.1, 4.2, 5.3, 18.1-18.4, 20.1-20.4_

  - [ ]\* 1.4 Write property tests for heat management
    - **Property 9: Athlete Movement Between Heats** - Validates: Requirements 3.2
    - **Property 10: Invalid Athlete Move Rejection** - Validates: Requirements 3.4, 18.1, 18.2
    - **Property 11: Semifinal/Final Creation Requires Series** - Validates: Requirements 4.1, 4.3, 20.1
    - **Property 12: Semifinal/Final Creation Requires Complete Results** - Validates: Requirements 4.2, 4.4
    - **Property 26: Invalid Target Heat Move Rejection** - Validates: Requirements 18.3, 18.4
    - **Property 27: Series Creation After Advanced Rounds Rejected** - Validates: Requirements 20.4

  - [x] 1.4 Modify resultado.utils.ts to accept serie parameter
    - Update `findOrCreateResultado` function signature to include `serie: string`
    - Remove hardcoded "Final_A" default
    - Update all callers to pass serie parameter explicitly
    - _Requirements: 13.1, 13.2, 13.3_

  - [ ]\* 1.5 Write unit tests for modified resultado.utils
    - Test `findOrCreateResultado` with various serie values
    - Test backward compatibility with Final_A
    - Test creation of new Resultado documents with custom serie
    - _Requirements: 13.1, 13.2, 13.3_

- [ ] 2. Checkpoint - Ensure all backend utility tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement backend API endpoints
  - [x] 3.1 Modify GET /api/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId
    - Add optional `serie` query parameter extraction
    - Modify Resultado query to filter by serie field
    - Default to "Final_A" when serie not provided
    - Return empty arrays for non-existent heats
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]\* 3.2 Write property tests for GET endpoint
    - **Property 19: Query Default Heat** - Validates: Requirements 8.2
    - **Property 20: Query Specified Heat** - Validates: Requirements 8.3
    - **Property 21: Query Non-Existent Heat Returns Empty** - Validates: Requirements 8.4

  - [x] 3.3 Create GET /api/jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId/heats
    - Query Resultado collection for distinct serie values
    - Sort heats logically (Series → Semifinals → Finals)
    - Return array of heat names
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]\* 3.4 Write property tests for GET /heats endpoint
    - **Property 22: Heat List Completeness** - Validates: Requirements 9.2, 9.3
    - **Property 23: Heat List Logical Order** - Validates: Requirements 9.4

  - [x] 3.5 Create POST /api/jueces/heats/create endpoint
    - Parse request body (torneoId, pruebaId, categoriaId, sexo, heatType, etc.)
    - Validate prerequisites using `validateHeatCreationPrerequisites`
    - Handle automatic series creation with `createSeriesAutomatic`
    - Handle manual heat creation with athlete lists
    - Handle progression from source heats
    - Create/update Resultado documents with appropriate serie values
    - Create new ResultadoAtleta records for progressing athletes
    - Return success response with heatsCreated and athletesMoved counts
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]\* 3.6 Write property tests for POST /heats/create endpoint
    - **Property 1: Series Count Calculation** - Validates: Requirements 2.1
    - **Property 7: Series Sequential Naming** - Validates: Requirements 2.6
    - **Property 8: Final_A Emptied After Series Creation** - Validates: Requirements 2.7, 19.1, 19.2
    - **Property 13: Athlete Progression Creates New ResultadoAtleta** - Validates: Requirements 5.3
    - **Property 14: Athlete Progression Preserves Source ResultadoAtleta** - Validates: Requirements 5.4, 14.3
    - **Property 15: New ResultadoAtleta Has Empty Performance Data** - Validates: Requirements 14.2
    - **Property 16: Final Heat Naming** - Validates: Requirements 6.1
    - **Property 17: Final Heat Count Limit** - Validates: Requirements 6.2, 6.3
    - **Property 18: Semifinal Sequential Naming** - Validates: Requirements 7.1
    - **Property 24: Serie Field Naming Pattern** - Validates: Requirements 13.2
    - **Property 25: Resultado-ResultadoAtleta Referential Integrity** - Validates: Requirements 14.4

  - [x] 3.7 Add routes to juez.ts router
    - Register GET /heats endpoint
    - Register POST /heats/create endpoint
    - Apply authentication middleware
    - _Requirements: 9.1, 10.1_

- [ ] 4. Checkpoint - Ensure all backend API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 5. Implement frontend types and API integration
  - [x] 5.1 Add heat-related types to ui-sistemaJueces/types/index.ts
    - Add `HeatInfo` interface
    - Add `AthleteForProgression` interface
    - Add `CreateHeatsRequest` interface
    - Add `CreateHeatsResponse` interface
    - _Requirements: 9.2, 10.2, 10.3, 10.4, 12.4_

  - [x] 5.2 Create ui-sistemaJueces/lib/api/heats.ts
    - Implement `fetchHeats(params)` function for GET /heats
    - Implement `createHeats(params)` function for POST /heats/create
    - Include proper error handling and token authentication
    - _Requirements: 9.1, 10.1_

  - [x] 5.3 Modify ui-sistemaJueces/lib/api/resultados.ts
    - Add optional `serie` parameter to `fetchAtletasPorPrueba`
    - Pass serie as query parameter to backend
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]\* 5.4 Write unit tests for API functions
    - Test `fetchHeats` with mock responses
    - Test `createHeats` with various request types
    - Test modified `fetchAtletasPorPrueba` with serie parameter
    - Test error handling for all functions

- [ ] 6. Implement frontend UI components
  - [x] 6.1 Create HeatSelector component (ui-sistemaJueces/components/atoms/HeatSelector.tsx)
    - Fetch available heats on mount using `fetchHeats`
    - Render CustomSelect dropdown with heat options
    - Default to "Final_A"
    - Call `onHeatChange` callback when selection changes
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ]\* 6.2 Write unit tests for HeatSelector
    - Test component renders with heats
    - Test default selection is Final_A
    - Test onHeatChange callback is triggered
    - Test loading state while fetching heats

  - [x] 6.3 Create HeatManagementModal component (ui-sistemaJueces/components/organisms/HeatManagementModal.tsx)
    - Implement mode selection (create-series, create-semifinal, create-final)
    - Implement automatic series creation form (athletes per series input)
    - Implement manual heat creation with AgGrid athlete selection
    - Implement athlete grid with columns: checkbox, name, number, source heat, puesto, marca
    - Enable filtering and sorting on AgGrid
    - Handle form submission to `createHeats` API
    - Display success/error messages
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ]\* 6.4 Write unit tests for HeatManagementModal
    - Test modal opens and closes
    - Test mode selection displays correct form
    - Test automatic series form submission
    - Test manual athlete selection and submission
    - Test error handling and display

  - [x] 6.5 Modify pruebas page (ui-sistemaJueces/app/juez/[torneoId]/pruebas/page.tsx)
    - Add state for selected heat (default "Final_A")
    - Add HeatSelector component above ResultadosGrid
    - Add "Manage Heats" button (visible to super judges only)
    - Pass selected heat to `fetchAtletasPorPrueba` call
    - Open HeatManagementModal on button click
    - Refresh data after successful heat creation
    - _Requirements: 11.5, 12.1_

  - [ ]\* 6.6 Write integration tests for pruebas page
    - Test heat selector integration with data fetching
    - Test manage heats button visibility based on permissions
    - Test modal opening and closing
    - Test data refresh after heat creation

- [ ] 7. Checkpoint - Ensure all frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Integration and end-to-end testing
  - [ ]\* 8.1 Write integration tests for complete workflows
    - Test full series creation workflow (automatic and manual)
    - Test athlete progression from series to semifinals
    - Test athlete progression from semifinals to finals
    - Test direct progression from series to finals (no semifinals)
    - Test error scenarios (missing prerequisites, invalid data)
    - _Requirements: 1.1, 1.2, 1.3, 2.1-2.7, 3.1-3.4, 4.1-4.4, 5.1-5.5, 6.1-6.3, 7.1-7.2, 19.1-19.3, 20.1-20.4_

  - [ ]\* 8.2 Write E2E tests for UI workflows
    - Test creating series from UI and viewing results
    - Test selecting different heats and verifying athlete lists
    - Test managing heats through modal interface
    - Test error messages display correctly
    - _Requirements: 11.1-11.5, 12.1-12.7_

- [ ] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- All 27 correctness properties from the design document are covered
- Backend implementation precedes frontend to enable API testing
- Checkpoints ensure incremental validation at major milestones
