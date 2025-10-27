# LoomDev v0.1 - Developer Quick Start

This guide will help you get started with LoomDev development.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+** - Backend runtime
- **Node.js 18+** (optional) - For development tools
- **Git** - Version control
- **Modern Browser** - Chrome, Firefox, or Safari

---

## Clone the Repository

```bash
git clone https://github.com/Legend1280/loomdev.git
cd loomdev
```

---

## Backend Setup

The backend is a FastAPI application that handles document processing, ontology extraction, and data persistence.

### Install Python Dependencies

```bash
pip3 install -r requirements.txt
```

### Initialize the Database

```bash
cd backend
python3 sample_data.py
cd ..
```

This will create a SQLite database with sample ontology data.

### Start the Backend Server

```bash
cd backend
python3 main.py
```

The backend will be available at **http://localhost:8000**

**API Documentation**: http://localhost:8000/docs

---

## Frontend Setup

The frontend is a vanilla JavaScript application with D3.js visualizations. No build step is required.

### Serve the Frontend

You can use any static file server. Here are a few options:

**Option 1: Python HTTP Server**
```bash
cd frontend
python3 -m http.server 8080
```

**Option 2: Node.js http-server**
```bash
npm install -g http-server
cd frontend
http-server -p 8080
```

The frontend will be available at **http://localhost:8080**

---

## Integrated Development

For the best development experience, run both frontend and backend together:

### Option 1: FastAPI Serving Frontend

```bash
python3 -c "
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import uvicorn
import sys
sys.path.insert(0, 'backend')
from main import app

app.mount('/frontend', StaticFiles(directory='frontend'), name='frontend')

@app.get('/', include_in_schema=False)
def redirect_to_frontend():
    return RedirectResponse(url='/frontend/index.html')

uvicorn.run(app, host='0.0.0.0', port=8000)
"
```

Access the application at **http://localhost:8000**

### Option 2: Separate Servers with CORS

1. Start the backend on port 8000
2. Start the frontend on port 8080
3. Update frontend API calls to use `http://localhost:8000`

---

## Project Structure

Understanding the codebase structure will help you navigate and contribute effectively.

```
loomdev/
├── backend/                    # Python FastAPI backend
│   ├── main.py                # Application entry point
│   ├── api.py                 # API route definitions
│   ├── models.py              # SQLAlchemy data models
│   ├── extractor.py           # Ontology extraction logic
│   ├── semantic_cluster.py    # Clustering algorithms
│   ├── file_system.py         # File management
│   ├── analytics.py           # Analytics and metrics
│   └── loom_lite.db           # SQLite database
│
├── frontend/                   # Vanilla JavaScript frontend
│   ├── index.html             # Main application HTML
│   ├── eventBus.js            # Central event system
│   ├── galaxyView.js          # Galaxy visualization (multi-doc)
│   ├── dualVisualizer.js      # Solar system view (single doc)
│   ├── mindMapView.js         # Mind map hierarchical view
│   ├── surfaceViewer.js       # Right panel (metadata/artifacts)
│   ├── sidebar.js             # Left panel (file tree/search)
│   ├── quadrantFocus.js       # Panel expansion logic
│   ├── searchBar.js           # Search functionality
│   └── systemStatus.js        # Status monitoring
│
├── docs/                       # Documentation and screenshots
├── n8n_workflows/             # N8N integration examples
├── README.md                   # Project overview
├── CHANGELOG.md                # Version history
├── SETUP_SUMMARY.md            # Setup details
├── LOOMDEV_CONCEPT.md          # Conceptual design
├── ONTOLOGY_STANDARD_v1.4.md   # Ontology standards
├── vercel.json                 # Vercel deployment config
├── railway.json                # Railway deployment config
└── requirements.txt            # Python dependencies
```

---

## Key Concepts

### Event Bus Architecture

All frontend modules communicate through a central event bus (`eventBus.js`). This enables loose coupling and easy extensibility.

**Example: Publishing an Event**
```javascript
import { eventBus } from './eventBus.js';

eventBus.publish('documentSelected', { docId: 'doc_123' });
```

**Example: Subscribing to an Event**
```javascript
import { eventBus } from './eventBus.js';

eventBus.subscribe('documentSelected', (data) => {
  console.log('Document selected:', data.docId);
  // Update visualization
});
```

### Four-Panel Layout

The application uses a four-panel layout:

1. **Sidebar (Left)** - File tree, search, schemas
2. **Center Panel** - Visualization canvas
3. **Surface Viewer (Right)** - Metadata and artifacts
4. **Event Bus (Hidden)** - Communication backbone

### Visualization Modes

The center panel supports three visualization modes:

1. **Galaxy View** - Multi-document cluster visualization
2. **Solar System View** - Single document concept graph
3. **Mind Map View** - Hierarchical concept tree

---

## Development Workflow

### Making Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Edit frontend JavaScript modules
   - Update backend Python code
   - Add tests if applicable

3. **Test Locally**
   - Start the backend
   - Open the frontend in a browser
   - Test your changes thoroughly

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

5. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to GitHub
   - Create a PR from your branch to `main`
   - Add a description of your changes

### Testing

**Manual Testing:**
- Test all three visualization modes
- Test search functionality
- Test file upload and ingestion
- Test panel expansion and navigation

**Backend Testing:**
```bash
cd backend
python3 -m pytest
```

---

## LoomDev v0.1 Development Priorities

The following features are planned for v0.1:

### 1. Developer Mode Toggle
- Add a toggle button in the toolbar
- Implement mode state management
- Wire up event bus events

### 2. Editable Galaxy View
- Click to create new nodes
- Drag to draw connections
- Edit node properties
- Delete nodes and edges

### 3. JSON Object Upload
- Add upload button
- Parse and validate JSON
- Store in backend
- Visualize immediately

### 4. Artifact Linking
- Attach files to nodes
- View in Surface Viewer
- Multiple artifacts per node

### 5. Ontology Export
- Export to JSON
- Export to GraphML
- Export to Mermaid
- Export to C4

---

## Useful Commands

### Backend

```bash
# Start backend server
cd backend && python3 main.py

# Initialize database
cd backend && python3 sample_data.py

# Run migrations
cd backend && python3 migrate_*.py

# Check API endpoints
curl http://localhost:8000/docs
```

### Frontend

```bash
# Serve frontend (Python)
cd frontend && python3 -m http.server 8080

# Serve frontend (Node.js)
cd frontend && npx http-server -p 8080
```

### Git

```bash
# Check status
git status

# Create feature branch
git checkout -b feature/name

# Commit changes
git add .
git commit -m "message"

# Push to GitHub
git push origin branch-name

# Pull latest changes
git pull origin main
```

---

## Debugging

### Frontend Debugging

1. Open browser DevTools (F12)
2. Check Console for errors
3. Use Network tab to inspect API calls
4. Use Sources tab to set breakpoints

**Common Issues:**
- **Blank visualization**: Check if API is returning data
- **Event not firing**: Check event bus subscriptions
- **CORS errors**: Ensure backend allows frontend origin

### Backend Debugging

1. Check server logs in terminal
2. Use FastAPI's `/docs` endpoint to test APIs
3. Query the SQLite database directly

```bash
# Open database
sqlite3 backend/loom_lite.db

# List tables
.tables

# Query concepts
SELECT * FROM concepts LIMIT 10;
```

---

## Resources

### Documentation
- [README](./README.md) - Project overview
- [Setup Summary](./SETUP_SUMMARY.md) - Detailed setup info
- [LoomDev Concept](./LOOMDEV_CONCEPT.md) - Conceptual design
- [Ontology Standard](./ONTOLOGY_STANDARD_v1.4.md) - Design standards
- [Changelog](./CHANGELOG.md) - Version history

### External Resources
- [D3.js Documentation](https://d3js.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

### Community
- **GitHub Issues**: https://github.com/Legend1280/loomdev/issues
- **Repository**: https://github.com/Legend1280/loomdev

---

## Next Steps

1. **Explore the Codebase** - Read through the frontend and backend modules
2. **Run the Application** - Start both servers and test the UI
3. **Pick a Feature** - Choose a v0.1 feature to implement
4. **Create a Branch** - Start development on a feature branch
5. **Submit a PR** - Share your work with the team

---

**Happy Coding! 🚀**

**Built on LoomLite v4.0 | Extended for Developer-Centric Ontology Authoring**

