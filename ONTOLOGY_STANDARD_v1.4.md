# ONTOLOGY_STANDARD v1.4

**Version:** 1.4  
**Date:** 2025-10-26  
**Author:** Manus AI

## 1. Introduction

This document defines the data structures and schema for the LoomLite ontology, version 1.4. This version introduces new fields to support enhanced intelligence features, including weighted confidence scores, summary provenance, and context-aware heatmaps.

## 2. Core Data Structures

The LoomLite ontology is composed of the following core data structures:

- **Document:** Metadata about the source document.
- **Concept:** An abstract idea or entity extracted from the document.
- **Relation:** A connection between two concepts.
- **Span:** A specific text snippet from the original document.
- **Mention:** A link between a concept and a span.

## 3. Schema Definitions

### 3.1. `documents` Table

| Field         | Type    | Description                                                                 |
|---------------|---------|-----------------------------------------------------------------------------|
| `id`          | TEXT    | Unique identifier for the document (e.g., `doc_...`).                       |
| `title`       | TEXT    | The title of the document.                                                  |
| `source_uri`  | TEXT    | The original source URI of the document.                                    |
| `created_at`  | TEXT    | The timestamp when the document was added to the system.                    |
| `summary`     | TEXT    | A 2-3 sentence summary of the entire document.                              |

### 3.2. `concepts` Table

| Field                 | Type    | Description                                                                                                     |
|-----------------------|---------|-----------------------------------------------------------------------------------------------------------------|
| `id`                  | TEXT    | Unique identifier for the concept (e.g., `c_...`).                                                              |
| `doc_id`              | TEXT    | The ID of the document this concept belongs to.                                                                 |
| `label`               | TEXT    | The human-readable label for the concept.                                                                       |
| `type`                | TEXT    | The semantic type of the concept (e.g., "Metric", "Date", "Person").                                        |
| `hierarchy_level`     | INTEGER | The level in the semantic hierarchy (0=Document, 1=Cluster, 2=Refinement, 3=Concept).                           |
| `parent_cluster_id`   | TEXT    | The ID of the parent cluster concept.                                                                           |
| `parent_concept_id`   | TEXT    | The ID of the parent refinement concept.                                                                        |
| `summary`             | TEXT    | A 1-sentence summary of the concept (for clusters and refinements).                                             |
| `confidence`          | REAL    | The model's confidence score for the extraction of this concept (0.0 to 1.0).                                   |
| `confidence_weight`   | REAL    | **(New in v1.4)** A weighted confidence score, factoring in prominence and frequency.                           |
| `summary_source`      | TEXT    | **(New in v1.4)** The source of the summary ("document", "cluster", "refinement", "concept", "user").       |
| `context_scope`       | TEXT    | **(New in v1.4)** A JSON string of character offsets for heatmap highlighting (`[[start, end], ...]`).          |

### 3.3. `relations` Table

| Field    | Type | Description                                                      |
|----------|------|------------------------------------------------------------------|
| `id`     | TEXT | Unique identifier for the relation (e.g., `r_...`).              |
| `doc_id` | TEXT | The ID of the document this relation belongs to.                 |
| `src`    | TEXT | The ID of the source concept.                                    |
| `dst`    | TEXT | The ID of the destination concept.                               |
| `verb`   | TEXT | The verb describing the relationship (e.g., "contains", "defines"). |

### 3.4. `spans` and `mentions` Tables

These tables link concepts to their specific locations in the original text, and remain unchanged from v1.3.

## 4. v1.4 Field Descriptions

### 4.1. `confidence_weight`

- **Purpose:** To provide a more accurate measure of a concept's importance than the raw confidence score alone.
- **Calculation:** This field will be calculated by a backend process that considers not only the LLM's confidence but also factors like the concept's frequency, its position in the document, and its relationship to other high-weight concepts.

### 4.2. `summary_source`

- **Purpose:** To track the provenance of summaries, especially as the system incorporates user-edited and on-demand summaries.
- **Values:** `document`, `cluster`, `refinement`, `concept`, `user`.

### 4.3. `context_scope`

- **Purpose:** To define the precise text spans that should be highlighted for a given concept in the semantic heatmap view.
- **Format:** A JSON string representing an array of `[start, end]` character offsets. This allows for multiple, non-contiguous spans to be associated with a single concept.

