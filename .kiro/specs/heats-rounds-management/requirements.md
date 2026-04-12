# Requirements Document

## Introduction

This document specifies requirements for a Heats/Rounds Management System within an athletics competition judging application. The system enables organizing competitions into multiple rounds (preliminary heats, semifinals, and finals) with automatic or manual athlete distribution, progression rules, and result tracking across rounds.

## Glossary

- **Heat_Management_System**: The software component responsible for organizing athletes into rounds and managing progression between rounds
- **Heat**: A single round of competition (Series, Semifinal, or Final)
- **Series**: Preliminary round heats named Serie_1, Serie_2, Serie_3, etc.
- **Semifinal**: Intermediate round heats named Semi_1, Semi_2, Semi_3, etc.
- **Final**: Championship round heats limited to Final_A and Final_B
- **ResultadoAtleta**: A data record representing one athlete's performance in one specific heat
- **Resultado**: A data record containing the collection of all ResultadoAtleta for a specific heat
- **Seeding**: The process of distributing athletes based on their marcaPersonal (personal best performance)
- **Snake_Pattern**: A distribution algorithm where athletes are assigned in alternating order across heats
- **Puesto**: The position/rank achieved by an athlete in a heat
- **MarcaPersonal**: An athlete's personal best performance used for seeding
- **Time_Based_Event**: Events where lower time values indicate better performance (SPRINT, MEDIO_FONDO, FONDO, MARCHA)
- **Distance_Based_Event**: Events where higher values indicate better performance (DISTANCIA, LARGO, ALTURA, PUNTOS)
- **Heat_Selector**: UI component allowing users to choose which heat to view or manage
- **Heat_Management_Modal**: UI component for creating and managing heats

## Requirements

### Requirement 1: Default Heat Assignment

**User Story:** As a competition organizer, I want all athletes to be assigned to Final_A by default, so that competitions can function without requiring heat configuration.

#### Acceptance Criteria

1. WHEN a new competition is created, THE Heat_Management_System SHALL assign all athletes to Final_A
2. WHILE no Series have been created, THE Heat_Management_System SHALL maintain all athletes in Final_A
3. THE Heat_Management_System SHALL allow competitions to proceed with only Final_A

### Requirement 2: Series Creation with Automatic Seeding

**User Story:** As a competition organizer, I want to automatically distribute athletes into series based on their personal bests, so that heats are fairly balanced.

#### Acceptance Criteria

1. WHEN the user specifies the number of athletes per series, THE Heat_Management_System SHALL calculate the required number of Series
2. WHEN distributing athletes for Time_Based_Event, THE Heat_Management_System SHALL treat lower marcaPersonal values as better performance
3. WHEN distributing athletes for Distance_Based_Event, THE Heat_Management_System SHALL treat higher marcaPersonal values as better performance
4. THE Heat_Management_System SHALL assign the best-performing athletes as heads of each Series
5. WHEN assigning remaining athletes, THE Heat_Management_System SHALL use Snake_Pattern distribution
6. THE Heat_Management_System SHALL name Series sequentially as Serie_1, Serie_2, Serie_3, etc.
7. WHEN creating Series, THE Heat_Management_System SHALL move athletes from Final_A to the assigned Series

### Requirement 3: Manual Series Creation

**User Story:** As a competition organizer, I want to manually assign athletes to series, so that I can accommodate special circumstances or preferences.

#### Acceptance Criteria

1. THE Heat_Management_System SHALL accept a complete list of athletes for assignment to a specific Series
2. THE Heat_Management_System SHALL allow moving an individual athlete from one Heat to another Heat
3. WHEN moving an athlete, THE Heat_Management_System SHALL transfer the ResultadoAtleta ID from the source Resultado.resultadosAtleta array to the target Resultado.resultadosAtleta array
4. THE Heat_Management_System SHALL validate that the athlete exists before performing the move operation

### Requirement 4: Semifinal and Final Creation Prerequisites

**User Story:** As a competition organizer, I want the system to prevent creating semifinals or finals prematurely, so that progression is based on actual competition results.

#### Acceptance Criteria

1. WHEN the user attempts to create Semifinal or Final heats, THE Heat_Management_System SHALL verify that Series exist
2. WHEN the user attempts to create Semifinal or Final heats, THE Heat_Management_System SHALL verify that all Series have puesto values recorded
3. IF Series do not exist, THEN THE Heat_Management_System SHALL reject the creation request with a descriptive error message
4. IF any Series lacks puesto values, THEN THE Heat_Management_System SHALL reject the creation request with a descriptive error message

### Requirement 5: Athlete Selection for Progression

**User Story:** As a competition organizer, I want to select which athletes advance to semifinals or finals based on their series performance, so that only qualified athletes progress.

#### Acceptance Criteria

1. WHEN creating Semifinal or Final heats, THE Heat_Management_System SHALL display athletes with their Series name, puesto, and performance mark
2. THE Heat_Management_System SHALL allow the user to select multiple athletes for progression
3. WHEN an athlete is selected for progression, THE Heat_Management_System SHALL create a new ResultadoAtleta for that athlete in the target Heat
4. THE Heat_Management_System SHALL preserve the original ResultadoAtleta in the source Heat
5. THE Heat_Management_System SHALL allow each athlete to have multiple ResultadoAtleta records across different heats

### Requirement 6: Final Heat Naming and Limits

**User Story:** As a competition organizer, I want finals limited to two heats (Final_A and Final_B), so that the system matches standard athletics competition structure.

#### Acceptance Criteria

1. THE Heat_Management_System SHALL name final heats as Final_A and Final_B
2. THE Heat_Management_System SHALL limit the total number of Final heats to two
3. IF the user attempts to create more than two Final heats, THEN THE Heat_Management_System SHALL reject the request with a descriptive error message

### Requirement 7: Semifinal Naming

**User Story:** As a competition organizer, I want unlimited semifinals with sequential naming, so that large competitions can be accommodated.

#### Acceptance Criteria

1. THE Heat_Management_System SHALL name Semifinal heats sequentially as Semi_1, Semi_2, Semi_3, etc.
2. THE Heat_Management_System SHALL allow creating any number of Semifinal heats

### Requirement 8: Heat Query API

**User Story:** As a judge using the application, I want to retrieve athletes for a specific heat, so that I can record results for that round.

#### Acceptance Criteria

1. THE Heat_Management_System SHALL accept an optional serie query parameter in the GET /jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId endpoint
2. WHEN the serie parameter is not provided, THE Heat_Management_System SHALL default to Final_A
3. WHEN the serie parameter is provided, THE Heat_Management_System SHALL return athletes assigned to the specified Heat
4. THE Heat_Management_System SHALL return an empty result set for non-existent heats

### Requirement 9: Heat List API

**User Story:** As a judge using the application, I want to see all available heats for an event, so that I can navigate between different rounds.

#### Acceptance Criteria

1. THE Heat_Management_System SHALL provide a GET /jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId/heats endpoint
2. THE Heat_Management_System SHALL return an array of all Heat names for the specified event
3. THE Heat_Management_System SHALL include Series, Semifinal, and Final heats in the response
4. THE Heat_Management_System SHALL return heats in logical order (Series first, then Semifinals, then Finals)

### Requirement 10: Heat Creation API

**User Story:** As a competition organizer, I want a unified API for creating heats, so that I can manage rounds programmatically.

#### Acceptance Criteria

1. THE Heat_Management_System SHALL provide a POST /jueces/heats/create endpoint
2. THE Heat_Management_System SHALL accept parameters for automatic Series creation with athlete count per series
3. THE Heat_Management_System SHALL accept parameters for manual Series creation with athlete lists
4. THE Heat_Management_System SHALL accept parameters for Semifinal and Final creation with selected athletes
5. THE Heat_Management_System SHALL validate prerequisites before creating Semifinal or Final heats
6. IF validation fails, THEN THE Heat_Management_System SHALL return an error response with specific failure reasons

### Requirement 11: Heat Selector UI Component

**User Story:** As a judge using the application, I want to select which heat I'm viewing, so that I can work with the correct group of athletes.

#### Acceptance Criteria

1. THE Heat_Selector SHALL display a dropdown list of available heats
2. WHEN no heats have been loaded, THE Heat_Selector SHALL fetch available heats from the GET /jueces/torneo/:torneoId/categoria/:categoriaId/prueba/:pruebaId/heats endpoint
3. THE Heat_Selector SHALL default to Final_A
4. WHEN the user selects a different heat, THE Heat_Selector SHALL trigger a data refresh for the selected heat
5. THE Heat_Selector SHALL display on the pruebas page

### Requirement 12: Heat Management Modal UI Component

**User Story:** As a competition organizer, I want a modal interface for managing heats, so that I can create and organize rounds efficiently.

#### Acceptance Criteria

1. THE Heat_Management_Modal SHALL open from the pruebas page
2. WHILE viewing Final_A with no Series created, THE Heat_Management_Modal SHALL display options to create Series
3. WHILE Series exist, THE Heat_Management_Modal SHALL display options to create Semifinal or Final heats
4. WHEN creating Semifinal or Final heats, THE Heat_Management_Modal SHALL display a grid with athlete name, source heat, puesto, and performance mark
5. THE Heat_Management_Modal SHALL allow filtering and sorting the athlete grid
6. THE Heat_Management_Modal SHALL allow selecting multiple athletes via checkboxes
7. WHEN the user confirms selections, THE Heat_Management_Modal SHALL submit the creation request to the POST /jueces/heats/create endpoint

### Requirement 13: Data Model Heat Field

**User Story:** As a developer, I want each Resultado to store its heat name, so that results can be associated with specific rounds.

#### Acceptance Criteria

1. THE Resultado data model SHALL include a serie field of type string
2. THE serie field SHALL store values matching Heat naming patterns (Serie_1, Semi_1, Final_A, etc.)
3. THE Heat_Management_System SHALL set the serie field when creating or moving ResultadoAtleta records

### Requirement 14: Multiple ResultadoAtleta Per Athlete

**User Story:** As a competition organizer, I want athletes to have separate result records for each round they compete in, so that performance can be tracked across the competition.

#### Acceptance Criteria

1. THE Heat_Management_System SHALL allow creating multiple ResultadoAtleta records for the same athlete
2. WHEN an athlete progresses to a new Heat, THE Heat_Management_System SHALL create a new ResultadoAtleta with empty performance data
3. THE Heat_Management_System SHALL maintain the athlete's previous ResultadoAtleta records in their original heats
4. THE Resultado.resultadosAtleta array SHALL contain references to ResultadoAtleta IDs for that specific Heat

### Requirement 15: Seeding Algorithm for Time-Based Events

**User Story:** As a competition organizer, I want athletes in time-based events seeded by fastest times, so that the best performers are distributed fairly.

#### Acceptance Criteria

1. WHEN seeding athletes for SPRINT events, THE Heat_Management_System SHALL sort by marcaPersonal in ascending order
2. WHEN seeding athletes for MEDIO_FONDO events, THE Heat_Management_System SHALL sort by marcaPersonal in ascending order
3. WHEN seeding athletes for FONDO events, THE Heat_Management_System SHALL sort by marcaPersonal in ascending order
4. WHEN seeding athletes for MARCHA events, THE Heat_Management_System SHALL sort by marcaPersonal in ascending order

### Requirement 16: Seeding Algorithm for Distance-Based Events

**User Story:** As a competition organizer, I want athletes in distance-based events seeded by best marks, so that the best performers are distributed fairly.

#### Acceptance Criteria

1. WHEN seeding athletes for DISTANCIA events, THE Heat_Management_System SHALL sort by marcaPersonal in descending order
2. WHEN seeding athletes for LARGO events, THE Heat_Management_System SHALL sort by marcaPersonal in descending order
3. WHEN seeding athletes for ALTURA events, THE Heat_Management_System SHALL sort by marcaPersonal in descending order
4. WHEN seeding athletes for PUNTOS events, THE Heat_Management_System SHALL sort by marcaPersonal in descending order

### Requirement 17: Snake Pattern Distribution

**User Story:** As a competition organizer, I want remaining athletes distributed in a snake pattern after heads are assigned, so that heat strength is balanced.

#### Acceptance Criteria

1. WHEN distributing athletes after heads are assigned, THE Heat_Management_System SHALL assign athletes to Series in sequential order (Serie_1, Serie_2, ..., Serie_N)
2. WHEN reaching the last Series, THE Heat_Management_System SHALL reverse direction and assign athletes in reverse order (Serie_N, Serie_N-1, ..., Serie_1)
3. THE Heat_Management_System SHALL continue alternating direction until all athletes are assigned
4. FOR ALL athletes in the same position across Series, the performance difference SHALL be minimized by the Snake_Pattern

### Requirement 18: Athlete Movement Validation

**User Story:** As a competition organizer, I want the system to validate athlete movements, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN moving an athlete between heats, THE Heat_Management_System SHALL verify the athlete exists in the source Heat
2. IF the athlete does not exist in the source Heat, THEN THE Heat_Management_System SHALL reject the move with a descriptive error message
3. WHEN moving an athlete, THE Heat_Management_System SHALL verify the target Heat exists
4. IF the target Heat does not exist, THEN THE Heat_Management_System SHALL reject the move with a descriptive error message

### Requirement 19: Empty Final_A After Series Creation

**User Story:** As a competition organizer, I want Final_A to be empty after creating series, so that the default heat doesn't interfere with the multi-round structure.

#### Acceptance Criteria

1. WHEN Series are created from Final_A, THE Heat_Management_System SHALL move all athletes from Final_A to the assigned Series
2. AFTER Series creation completes, THE Resultado for Final_A SHALL have an empty resultadosAtleta array
3. WHEN creating Semifinal or Final heats, THE Heat_Management_System SHALL source athletes from Series or Semifinals, not from Final_A

### Requirement 20: Heat Progression Workflow

**User Story:** As a competition organizer, I want a clear progression path from series to semifinals to finals, so that the competition structure is logical and enforceable.

#### Acceptance Criteria

1. THE Heat_Management_System SHALL require Series to exist before creating Semifinals
2. THE Heat_Management_System SHALL allow creating Finals directly from Series when no Semifinals exist
3. WHEN Semifinals exist, THE Heat_Management_System SHALL allow creating Finals from Semifinal results
4. THE Heat_Management_System SHALL prevent creating Series after Semifinals or Finals have been created
