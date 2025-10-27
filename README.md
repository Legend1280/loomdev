# LoomDev v0.1

**Ontology-Driven Systems Architecting Environment**

LoomDev extends the LoomLite semantic visualization framework into a full-scale **ontology authoring and systems design environment**. It preserves the original **four-panel architecture** (Sidebar, Center Visualization, Surface Viewer, Event Bus backbone), but introduces a **Developer Mode toggle** that converts the visualization canvas from read-only document graphs into **editable system ontologies**.

---

## Project Overview

**Version**: 0.1 (Concept Phase)  
**Date**: October 2025  
**Status**: Conceptual / Pre-Implementation  
**URL**: *To be deployed: [https://loomdev.vercel.app](https://loomdev.vercel.app)*  
**Repository**: [https://github.com/Legend1280/loomdev](https://github.com/Legend1280/loomdev)

---

## Core Purpose

LoomDev allows architects to design complex architectures (like the Sovereignty Stack) from first principles — each component defined as an ontological object with inputs, outputs, relations, and attached artifacts (patents, schemas, specifications).

---

## Key Features (v0.1)

- ✅ Four-panel mirrored UI identical to LoomLite
- ✅ Developer Mode toggle (edit vs. view)
- ✅ Manual JSON Object & Schema upload
- ✅ Editable Galaxy View (create nodes, draw connections)
- ✅ Artifact linking (attach patent PDFs, docs, media)
- ✅ Ontology export (JSON, GraphML, Mermaid, C4)
- ✅ Inheritance from LoomLite's Event Bus and visualization stack

---

## Architecture

LoomDev mirrors LoomLite's architecture with developer-centric enhancements:

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        LoomDev Frontend                     │
│                   (Vercel Deployment)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Toolbar    │  │  Mode Toggle │  │    Upload    │     │
│  │   (Header)   │  │   Buttons    │  │   Button     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┬──────────────────────┬──────────────┐    │
│  │              │                      │              │    │
│  │   Sidebar    │   Center Panel       │   Surface    │    │
│  │              │                      │   Viewer     │    │
│  │  ┌────────┐  │  ┌────────────────┐ │  ┌────────┐  │    │
│  │  │ Search │  │  │ Galaxy View    │ │  │Ontology│  │    │
│  │  └────────┘  │  │ (Editable)     │ │  └────────┘  │    │
│  │  ┌────────┐  │  ┌────────────────┐ │  ┌────────┐  │    │
│  │  │ Folders│  │  │ Solar System   │ │  │Artifact│  │    │
│  │  │ /Schemas│ │  │ (Intra-System) │ │  └────────┘  │    │
│  │  └────────┘  │  └────────────────┘ │  ┌────────┐  │    │
│  │  ┌────────┐  │  ┌────────────────┐ │  │Analytics│ │    │
│  │  │ Status │  │  │ Mind Map       │ │  └────────┘  │    │
│  │  └────────┘  │  │ (Layer Hier.)  │ │              │    │
│  │              │  │ (Editable)     │ │              │    │
│  └──────────────┴──└────────────────┘─┴──────────────┘    │
│                                                             │
│                    ┌──────────────┐                         │
│                    │  Event Bus   │                         │
│                    │  (Pub/Sub)   │                         │
│                    └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    LoomDev Backend API                      │
│                  (Railway Deployment)                       │
├─────────────────────────────────────────────────────────────┤
│  FastAPI Server                                              │
│  ├─ /api/ontology/object     (POST) – Create/Update Object  │
│  ├─ /api/ontology/relation   (POST) – Create Relation       │
│  ├─ /api/schema/import       (POST) – Upload Schema         │
│  ├─ /api/artifact/upload     (POST) – Attach Artifact       │
│  ├─ /api/system/export       (GET)  – Export Ontology       │
│  └─ /system/status           (GET)  – Health Check          │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Technology        | Purpose                                  |
| ----------------- | ---------------------------------------- |
| JavaScript (ES6+) | Core logic (no framework)                |
| D3.js v7          | Interactive and editable graph rendering |
| HTML5 + CSS3      | Base UI structure                        |
| Vercel            | Frontend deployment                      |
| EventBus.js       | Core inter-module pub/sub                |

### Backend

| Technology             | Purpose                      |
| ---------------------- | ---------------------------- |
| FastAPI                | REST API endpoints           |
| Python 3.11+           | Backend logic, validation    |
| Railway                | Serverless backend hosting   |
| JSON Storage (Phase 1) | Ontology persistence         |
| Optional SQLite        | Prototype relational storage |

---

## Design System

### Visual Framework

Identical to LoomLite: dark minimalist palette, yellow accents, monochrome hierarchy.

| Color         | Hex     | Use                  |
| ------------- | ------- | -------------------- |
| Deep Black    | #0a0a0a | Body background      |
| Panel Grey    | #111111 | Visualization panels |
| Text          | #e6e6e6 | Primary font         |
| Accent Yellow | #fad643 | Active highlights    |
| Edge Input    | #38bdf8 | Data inflow          |
| Edge Output   | #facc15 | Data outflow         |

---

## Module Documentation

### 1. Event Bus (eventBus.js)

Central communication hub; identical in structure to LoomLite, extended with new events.

| Event            | Payload                  | Purpose                |
| ---------------- | ------------------------ | ---------------------- |
| `objectCreated`  | `{ id, data }`           | New component created  |
| `objectLinked`   | `{ src, dst, relation }` | Connection created     |
| `schemaImported` | `{ schemaId }`           | JSON schema uploaded   |
| `artifactLinked` | `{ objectId, file }`     | Patent or asset linked |
| `modeChanged`    | `{ mode: 'developer' \| 'viewer' }` | UI context toggle |

### 2. Galaxy View (galaxyView.js)

**Purpose**: Editable system topology visualization.  
**Technology**: D3.js + Force Simulation + Drag Behaviors

**Features**:
- Click to add new ontology object
- Drag nodes to reposition
- Draw directional edges with verbs and I/O metadata
- Double-click → focus/expand (Semantic Centering retained)
- Triple-click → recenter on system root

### 3. Solar System View (dualVisualizer.js)

**Purpose**: Visualize internal composition of a system (sub-components).

- Editable micrograph within a parent node
- Useful for depicting Logos → Authentication Engine → Trust Coefficients
- Reuses D3 force layout

### 4. Mind Map View (mindMapView.js)

**Purpose**: Display hierarchical roles, layers, or inheritance.

Example: Sovereignty Stack hierarchy (Mirror → Logos → Rita → SAGE → Hermes → Axon/Nabu → Kronos).

- Expand/collapse layers
- Editable labels, drag-drop reparenting

### 5. Surface Viewer (surfaceViewer.js)

**Purpose**: Metadata & Artifact Interface.

Tabs:
1. **Ontology** – JSON object schema, editable fields
2. **Artifact** – Linked PDFs, docs, or references
3. **Analytics** – Node/edge metrics, dependency graphs

### 6. Sidebar (sidebar.js)

**Purpose**: File, Schema, and Object Management.

- Upload manual JSON object
- Import schema definitions
- Organize components into projects (e.g., Sovereignty Stack, Pillars System)

---

## API Integration

| Endpoint                 | Method | Description                              |
| ------------------------ | ------ | ---------------------------------------- |
| `/api/ontology/object`   | POST   | Create or update an object               |
| `/api/ontology/relation` | POST   | Define relation with I/O                 |
| `/api/schema/import`     | POST   | Import JSON schema                       |
| `/api/artifact/upload`   | POST   | Attach artifact (PDF, DOCX, image)       |
| `/api/system/export`     | GET    | Export full ontology (json, graphml, c4) |
| `/system/status`         | GET    | Health endpoint                          |

---

## Feature Specifications

### Feature 1 – Developer Mode Toggle

- Toolbar switch
- Changes event context (edit vs. view)
- Locks out ingestion functions when active

### Feature 2 – Manual Object Upload

- Upload `.json` objects
- Stored locally and in backend
- Visualized immediately in Galaxy View

### Feature 3 – Editable Graph Canvas

- Drag-create connections between objects
- Label edges with verbs and vector fields
- Add metadata (input/output, trust coefficients)

### Feature 4 – Artifact Linking

- Attach PDFs, patents, specifications to nodes
- View artifacts in Surface Viewer
- Link multiple artifacts per object

---

## Development

### Project Structure

```
loomdev/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── api.py               # API endpoints
│   ├── models.py            # Data models
│   └── loom_lite.db         # SQLite database
├── frontend/
│   ├── index.html           # Main application
│   ├── eventBus.js          # Event system
│   ├── galaxyView.js        # Galaxy visualization
│   ├── dualVisualizer.js    # Solar system view
│   ├── mindMapView.js       # Mind map view
│   ├── surfaceViewer.js     # Surface viewer
│   └── sidebar.js           # Sidebar component
├── docs/
│   └── screenshots/
├── README.md
├── vercel.json              # Vercel config
└── railway.json             # Railway config
```

---

## Roadmap

### Phase 1 (v0.1 - Current)
- ✅ Duplicate LoomLite codebase
- ✅ Set up LoomDev repository
- 🔄 Add Developer Mode toggle
- 🔄 Implement editable Galaxy View
- 🔄 Add manual JSON object upload

### Phase 2 (v0.2)
- [ ] Artifact linking system
- [ ] Ontology export (JSON, GraphML)
- [ ] Backend API implementation
- [ ] Deploy to Vercel/Railway

### Phase 3 (v0.3+)
- [ ] Schema validation
- [ ] Multi-user collaboration
- [ ] Version control for ontologies
- [ ] Advanced export formats (C4, Mermaid)

---

## License

MIT License - See LICENSE file for details

---

## Contributors

- Brady Simmons - Founder & Architect
- Manus AI - Development Assistant

---

## Acknowledgments

- LoomLite for the foundational architecture
- D3.js for visualization library
- FastAPI for backend framework

---

## Support

For questions, issues, or feature requests:
- GitHub Issues: [loomdev/issues](https://github.com/Legend1280/loomdev/issues)
- Repository: https://github.com/Legend1280/loomdev

---

**Built on LoomLite v4.0 | Extended for Developer-Centric Ontology Authoring**

