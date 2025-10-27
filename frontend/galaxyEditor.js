/**
 * Galaxy Editor Module for LoomDev
 * Enables editing capabilities in Galaxy View when Developer Mode is active
 * 
 * Features:
 * - Click to add new nodes
 * - Drag to create edges
 * - Right-click to delete
 * - Edit node properties
 */

import { bus, getDeveloperMode } from './eventBus.js';

let editorActive = false;
let linkingMode = false;
let linkSource = null;
let tempLine = null;

// Store references for adding edges
let svgRef = null;
let gRef = null;
let simulationRef = null;

/**
 * Initialize Galaxy Editor
 * @param {Object} svg - D3 SVG selection
 * @param {Object} g - D3 group selection
 * @param {Object} simulation - D3 force simulation
 */
export function initGalaxyEditor(svg, g, simulation) {
  console.log('Initializing Galaxy Editor...');
  
  // Store references
  svgRef = svg;
  gRef = g;
  simulationRef = simulation;
  
  // Listen for mode changes
  bus.on('modeChanged', (event) => {
    const { mode } = event.detail;
    editorActive = (mode === 'developer');
    console.log(`Galaxy Editor: ${editorActive ? 'ENABLED' : 'DISABLED'}`);
    
    if (editorActive) {
      enableEditing(svg, g, simulation);
    } else {
      disableEditing(svg);
    }
  });
  
  console.log('Galaxy Editor initialized');
}

/**
 * Enable editing mode
 */
function enableEditing(svg, g, simulation) {
  // Add right-click handler on empty canvas
  svg.on('contextmenu.editor', function(event) {
    // Check if click is on empty space (not on a node)
    const target = event.target;
    const isEmptySpace = target.tagName === 'svg' || 
                         target.tagName === 'rect' || 
                         target.classList?.contains('star') ||
                         (target.tagName === 'circle' && target.getAttribute('class') === 'star');
    
    if (isEmptySpace) {
      event.preventDefault();
      const [x, y] = d3.pointer(event, g.node());
      showCanvasContextMenu(event, x, y, g, simulation);
    }
  });
  
  console.log('Editing enabled: Right-click empty space to add objects');
}

/**
 * Disable editing mode
 */
function disableEditing(svg) {
  // Remove context menu handler
  svg.on('contextmenu.editor', null);
  
  // Reset linking state
  linkingMode = false;
  linkSource = null;
  if (tempLine) {
    tempLine.remove();
    tempLine = null;
  }
}

/**
 * Show context menu for empty canvas
 */
function showCanvasContextMenu(event, x, y, g, simulation) {
  // Remove existing context menu
  d3.selectAll(".context-menu").remove();
  
  const menu = d3.select("body")
    .append("div")
    .attr("class", "context-menu")
    .style("position", "fixed")
    .style("left", `${event.clientX}px`)
    .style("top", `${event.clientY}px`)
    .style("background", "#181818")
    .style("border", "1px solid rgba(250, 214, 67, 0.3)")
    .style("border-radius", "6px")
    .style("padding", "6px")
    .style("z-index", "10000")
    .style("min-width", "180px")
    .style("box-shadow", "0 4px 16px rgba(0, 0, 0, 0.6)");
  
  // Add Object option
  menu.append("div")
    .style("padding", "10px 14px")
    .style("color", "#fad643")
    .style("font-size", "13px")
    .style("font-weight", "500")
    .style("cursor", "pointer")
    .style("border-radius", "4px")
    .style("display", "flex")
    .style("align-items", "center")
    .style("gap", "10px")
    .html("+ Add Object")
    .on("mouseover", function() {
      d3.select(this).style("background", "rgba(250, 214, 67, 0.15)");
    })
    .on("mouseout", function() {
      d3.select(this).style("background", "transparent");
    })
    .on("click", () => {
      console.log("[Canvas Menu] Add Object at:", x, y);
      menu.remove();
      showAddNodeDialog(x, y, g, simulation);
    });
  
  // Close menu on click outside
  setTimeout(() => {
    d3.select("body").on("click.canvasmenu", () => {
      menu.remove();
      d3.select("body").on("click.canvasmenu", null);
    });
  }, 100);
}


/**
 * Show dialog to add new node
 */
function showAddNodeDialog(x, y, g, simulation) {
  // Create dialog overlay
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #181818;
    border: 1px solid rgba(250, 214, 67, 0.3);
    border-radius: 8px;
    padding: 24px;
    z-index: 10000;
    min-width: 400px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
  `;
  
  dialog.innerHTML = `
    <h3 style="color: #fad643; margin-bottom: 16px; font-size: 16px; font-weight: 600;">
      Add Ontology Object
    </h3>
    <form id="addNodeForm">
      <div style="margin-bottom: 12px;">
        <label style="display: block; color: #9a9a9a; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
          ID
        </label>
        <input 
          type="text" 
          id="nodeId" 
          placeholder="ont.component"
          required
          style="width: 100%; padding: 8px 12px; background: #0a0a0a; border: 1px solid #2a2a2a; border-radius: 4px; color: #e6e6e6; font-size: 13px; font-family: 'Inter', monospace;"
        />
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; color: #9a9a9a; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
          Label
        </label>
        <input 
          type="text" 
          id="nodeLabel" 
          placeholder="Component Name"
          required
          style="width: 100%; padding: 8px 12px; background: #0a0a0a; border: 1px solid #2a2a2a; border-radius: 4px; color: #e6e6e6; font-size: 13px; font-family: 'Inter', sans-serif;"
        />
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; color: #9a9a9a; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
          Type
        </label>
        <select 
          id="nodeType"
          style="width: 100%; padding: 8px 12px; background: #0a0a0a; border: 1px solid #2a2a2a; border-radius: 4px; color: #e6e6e6; font-size: 13px; font-family: 'Inter', sans-serif; cursor: pointer;"
        >
          <option value="Component">Component</option>
          <option value="System">System</option>
          <option value="Service">Service</option>
          <option value="Module">Module</option>
          <option value="Interface">Interface</option>
          <option value="Data">Data</option>
          <option value="Process">Process</option>
        </select>
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button 
          type="button" 
          id="cancelBtn"
          style="padding: 8px 16px; background: transparent; border: 1px solid #2a2a2a; border-radius: 4px; color: #9a9a9a; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s;"
        >
          Cancel
        </button>
        <button 
          type="submit"
          style="padding: 8px 16px; background: #fad643; border: none; border-radius: 4px; color: #0c0c0c; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;"
        >
          Create
        </button>
      </div>
    </form>
  `;
  
  document.body.appendChild(dialog);
  
  // Focus first input
  document.getElementById('nodeId').focus();
  
  // Handle cancel
  document.getElementById('cancelBtn').addEventListener('click', () => {
    dialog.remove();
  });
  
  // Handle form submission
  document.getElementById('addNodeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('nodeId').value.trim();
    const label = document.getElementById('nodeLabel').value.trim();
    const type = document.getElementById('nodeType').value;
    
    // Create node data
    const nodeData = {
      id,
      label,
      type,
      x,
      y,
      conceptCount: 0,
      isManual: true  // Flag to indicate manually created node
    };
    
    // Add node to visualization
    addNodeToVisualization(nodeData, g, simulation);
    
    // Emit event
    bus.emit('objectCreated', { id, data: nodeData });
    
    console.log(`Created node: ${id} (${label})`);
    
    dialog.remove();
  });
  
  // Close on Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      dialog.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

/**
 * Add node to visualization
 */
function addNodeToVisualization(nodeData, g, simulation) {
  // Add node to simulation
  simulation.nodes().push(nodeData);
  
  // Find or create the nodes container group
  let nodesGroup = g.select('.nodes-group');
  if (nodesGroup.empty()) {
    // If it doesn't exist, select the last g element (which should be the nodes group)
    nodesGroup = g.selectAll('g').filter(function() {
      return this.querySelectorAll('circle').length > 0;
    }).filter(':last-child');
    
    // If still not found, just use the main g
    if (nodesGroup.empty()) {
      nodesGroup = g;
    }
  }
  
  // Create new node group
  const newNode = nodesGroup.append('g')
    .datum(nodeData)
    .attr('cursor', 'pointer')
    .attr('transform', `translate(${nodeData.x},${nodeData.y})`)
    .call(d3.drag()
      .on('start', (event) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on('drag', (event) => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on('end', (event) => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      })
    )
    .on('click', (event, d) => {
      event.stopPropagation();
      console.log(`[Node Click] Clicked node ${d.id}, linkingMode: ${linkingMode}`);
      if (getDeveloperMode() && linkingMode) {
        completeLinking(d, event);
      }
    })
    .on('contextmenu', (event, d) => {
      event.preventDefault();
      if (getDeveloperMode()) {
        showNodeContextMenu(d, event, g, simulation);
      }
    });
  
  // Add glow
  newNode.append('circle')
    .attr('r', 30)
    .attr('fill', '#fad643')
    .attr('opacity', 0.2);
  
  // Add main circle
  newNode.append('circle')
    .attr('r', 20)
    .attr('fill', '#fad643')
    .attr('stroke', '#f59e0b')
    .attr('stroke-width', 2);
  
  // Add label
  newNode.append('text')
    .attr('dy', 35)
    .attr('text-anchor', 'middle')
    .attr('fill', '#e2e8f0')
    .attr('font-size', '12px')
    .attr('font-weight', '600')
    .text(nodeData.label);
  
  // Add type
  newNode.append('text')
    .attr('dy', 50)
    .attr('text-anchor', 'middle')
    .attr('fill', '#94a3b8')
    .attr('font-size', '10px')
    .text(nodeData.type);
  
  // Add "+ Connect" button (appears on hover in dev mode)
  const connectBtn = newNode.append('g')
    .attr('class', 'connect-btn')
    .attr('transform', 'translate(25, -25)')
    .style('opacity', 0)
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      event.stopPropagation();
      console.log(`[+ Button] Clicked + button on ${d.id}`);
      if (getDeveloperMode()) {
        startLinking(d, event);
      }
    });
  
  // Button background circle
  connectBtn.append('circle')
    .attr('r', 12)
    .attr('fill', '#fad643')
    .attr('stroke', '#f59e0b')
    .attr('stroke-width', 2);
  
  // Plus icon
  connectBtn.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', 4)
    .attr('fill', '#0c0c0c')
    .attr('font-size', '16px')
    .attr('font-weight', 'bold')
    .text('+');
  
  // Show/hide button on hover (only in dev mode)
  newNode.on('mouseenter', function() {
    if (getDeveloperMode()) {
      d3.select(this).select('.connect-btn')
        .transition()
        .duration(150)
        .style('opacity', 1);
    }
  });
  
  newNode.on('mouseleave', function() {
    d3.select(this).select('.connect-btn')
      .transition()
      .duration(150)
      .style('opacity', 0);
  });
  
  // Restart simulation
  simulation.alpha(0.3).restart();
}

/**
 * Start linking mode from a node (triggered by + button)
 */
function startLinking(node, event) {
  console.log(`[startLinking] Starting link from ${node.id}`);
  // Set linking mode
  linkingMode = true;
  linkSource = node;
    
    // Get actual rendered position from transform
    const nodeEl = gRef.selectAll('g').filter(d => d && d.id === node.id);
    const transform = nodeEl.attr('transform');
    let x, y;
    
    if (transform) {
      const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
      if (match) {
        x = parseFloat(match[1]);
        y = parseFloat(match[2]);
      }
    }
    
    // Fallback to node.x/y if transform not available
    if (x === undefined || y === undefined) {
      x = node.x || 0;
      y = node.y || 0;
    }
    
    console.log(`🔗 Linking from node ${node.id} at (x=${x}, y=${y})`);
    
    // Highlight source node
    gRef.selectAll('circle')
      .filter(d => d && d.id === node.id)
      .attr('stroke', '#fad643')
      .attr('stroke-width', 3);
    
    // Create temporary line that follows mouse
    tempLine = gRef.append('line')
      .attr('stroke', '#fad643')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.6)
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', x)
      .attr('y2', y);
    
    // Update line on mouse move
    svgRef.on('mousemove.linking', function(e) {
      if (tempLine && linkSource) {
        const [mx, my] = d3.pointer(e, gRef.node());
        
        // Get latest position from transform
        const nodeEl = gRef.selectAll('g').filter(d => d && d.id === linkSource.id);
        const transform = nodeEl.attr('transform');
        let sx = linkSource.x || 0;
        let sy = linkSource.y || 0;
        
        if (transform) {
          const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
          if (match) {
            sx = parseFloat(match[1]);
            sy = parseFloat(match[2]);
          }
        }
        
        tempLine
          .attr('x1', sx)
          .attr('y1', sy)
          .attr('x2', mx)
          .attr('y2', my);
      }
    });
    
    // Also update line on simulation tick to follow node movement
    const tickHandler = () => {
      if (tempLine && linkSource && linkingMode) {
        // Get position from transform
        const nodeEl = gRef.selectAll('g').filter(d => d && d.id === linkSource.id);
        const transform = nodeEl.attr('transform');
        let sx = linkSource.x || 0;
        let sy = linkSource.y || 0;
        
        if (transform) {
          const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
          if (match) {
            sx = parseFloat(match[1]);
            sy = parseFloat(match[2]);
          }
        }
        
        tempLine
          .attr('x1', sx)
          .attr('y1', sy);
      }
    };
    
  // Add to simulation tick
  const existingTick = simulationRef.on('tick');
  simulationRef.on('tick', function() {
    if (existingTick) existingTick.call(this);
    tickHandler();
  });
}

/**
 * Complete linking mode (triggered by clicking target node)
 */
function completeLinking(node, event) {
  console.log(`[completeLinking] Completing link to ${node.id}`);
  
  if (!linkSource || linkSource.id === node.id) {
    console.log('[completeLinking] Same node or no source, ignoring');
    return;
  }
  
  // Remove temporary line
  if (tempLine) {
    tempLine.remove();
    tempLine = null;
  }
  
  // Remove highlight from source node
  gRef.selectAll('circle')
    .filter(d => d && d.id === linkSource.id)
    .attr('stroke', '#f59e0b')
    .attr('stroke-width', 2);
  
  // Create the actual link
  createLink(linkSource, node);
  
  // Reset linking mode
  linkingMode = false;
  linkSource = null;
  
  // Remove mouse move listener
  svgRef.on('mousemove.linking', null);
  
  console.log('[completeLinking] Link completed and cleaned up');
}

/**
 * Create link between two nodes
 */
function createLink(source, target) {
  // Show dialog for link properties
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #181818;
    border: 1px solid rgba(250, 214, 67, 0.3);
    border-radius: 8px;
    padding: 24px;
    z-index: 10000;
    min-width: 400px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
  `;
  
  dialog.innerHTML = `
    <h3 style="color: #fad643; margin-bottom: 16px; font-size: 16px; font-weight: 600;">
      Create Relation
    </h3>
    <form id="addLinkForm">
      <div style="margin-bottom: 12px;">
        <label style="display: block; color: #9a9a9a; font-size: 11px; margin-bottom: 4px;">
          FROM
        </label>
        <div style="padding: 8px 12px; background: #0a0a0a; border: 1px solid #2a2a2a; border-radius: 4px; color: #e6e6e6;">
          ${source.label}
        </div>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; color: #9a9a9a; font-size: 11px; margin-bottom: 4px;">
          TO
        </label>
        <div style="padding: 8px 12px; background: #0a0a0a; border: 1px solid #2a2a2a; border-radius: 4px; color: #e6e6e6;">
          ${target.label}
        </div>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; color: #9a9a9a; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
          Verb / Relation
        </label>
        <input 
          type="text" 
          id="linkVerb" 
          placeholder="authenticates, processes, contains..."
          required
          style="width: 100%; padding: 8px 12px; background: #0a0a0a; border: 1px solid #2a2a2a; border-radius: 4px; color: #e6e6e6; font-size: 13px;"
        />
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; color: #9a9a9a; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
          Type
        </label>
        <select 
          id="linkType"
          style="width: 100%; padding: 8px 12px; background: #0a0a0a; border: 1px solid #2a2a2a; border-radius: 4px; color: #e6e6e6; font-size: 13px; cursor: pointer;"
        >
          <option value="dataflow">Data Flow</option>
          <option value="dependency">Dependency</option>
          <option value="composition">Composition</option>
          <option value="inheritance">Inheritance</option>
          <option value="association">Association</option>
        </select>
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button 
          type="button" 
          id="cancelLinkBtn"
          style="padding: 8px 16px; background: transparent; border: 1px solid #2a2a2a; border-radius: 4px; color: #9a9a9a; font-size: 12px; font-weight: 500; cursor: pointer;"
        >
          Cancel
        </button>
        <button 
          type="submit"
          style="padding: 8px 16px; background: #fad643; border: none; border-radius: 4px; color: #0c0c0c; font-size: 12px; font-weight: 600; cursor: pointer;"
        >
          Create
        </button>
      </div>
    </form>
  `;
  
  document.body.appendChild(dialog);
  document.getElementById('linkVerb').focus();
  
  // Handle cancel
  document.getElementById('cancelLinkBtn').addEventListener('click', () => {
    dialog.remove();
  });
  
  // Handle form submission
  document.getElementById('addLinkForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const verb = document.getElementById('linkVerb').value.trim();
    const type = document.getElementById('linkType').value;
    
    const linkData = {
      source: source.id,
      target: target.id,
      verb,
      type
    };
    
    // Add edge to visualization
    addEdgeToVisualization(source, target, verb, type);
    
    // Emit event
    bus.emit('relationCreated', linkData);
    
    console.log(`Created relation: ${source.label} --[${verb}]--> ${target.label}`);
    
    dialog.remove();
  });
  
  // Close on Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      dialog.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

/**
 * Show context menu for node
 */
function showNodeContextMenu(node, event, g, simulation) {
  // Remove existing context menu
  d3.selectAll('.context-menu').remove();
  
  const menu = d3.select('body')
    .append('div')
    .attr('class', 'context-menu')
    .style('position', 'fixed')
    .style('left', `${event.clientX}px`)
    .style('top', `${event.clientY}px`)
    .style('background', '#181818')
    .style('border', '1px solid rgba(250, 214, 67, 0.3)')
    .style('border-radius', '6px')
    .style('padding', '6px')
    .style('z-index', '10000')
    .style('min-width', '180px')
    .style('box-shadow', '0 4px 16px rgba(0, 0, 0, 0.6)');
  
  // Add Connection option
  menu.append('div')
    .style('padding', '10px 14px')
    .style('color', '#fad643')
    .style('font-size', '13px')
    .style('font-weight', '500')
    .style('cursor', 'pointer')
    .style('border-radius', '4px')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('gap', '10px')
    .html('⟶ Add Connection')
    .on('mouseover', function() {
      d3.select(this).style('background', 'rgba(250, 214, 67, 0.15)');
    })
    .on('mouseout', function() {
      d3.select(this).style('background', 'transparent');
    })
    .on('click', () => {
      console.log('[Context Menu] Starting connection from:', node.label);
      menu.remove();
      startLinking(node, event);
    });
  
  // Divider
  menu.append('div')
    .style('height', '1px')
    .style('background', 'rgba(250, 214, 67, 0.2)')
    .style('margin', '4px 0');
  
  // Edit option
  menu.append('div')
    .style('padding', '10px 14px')
    .style('color', '#e6e6e6')
    .style('font-size', '13px')
    .style('cursor', 'pointer')
    .style('border-radius', '4px')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('gap', '10px')
    .html('✎ Edit Node')
    .on('mouseover', function() {
      d3.select(this).style('background', 'rgba(250, 214, 67, 0.1)');
    })
    .on('mouseout', function() {
      d3.select(this).style('background', 'transparent');
    })
    .on('click', () => {
      console.log('Edit node:', node.label);
      menu.remove();
      // TODO: Show edit dialog
    });
  
  // Delete option
  menu.append('div')
    .style('padding', '10px 14px')
    .style('color', '#ef4444')
    .style('font-size', '13px')
    .style('cursor', 'pointer')
    .style('border-radius', '4px')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('gap', '10px')
    .html('✕ Delete Node')
    .on('mouseover', function() {
      d3.select(this).style('background', 'rgba(239, 68, 68, 0.1)');
    })
    .on('mouseout', function() {
      d3.select(this).style('background', 'transparent');
    })
    .on('click', () => {
      if (confirm(`Delete "${node.label}"?`)) {
        deleteNode(node, g, simulation);
        bus.emit('objectDeleted', { id: node.id });
      }
      menu.remove();
    });
  
  // Close menu on click outside
  setTimeout(() => {
    d3.select('body').on('click', () => {
      menu.remove();
      d3.select('body').on('click', null);
    });
  }, 100);
}

/**
 * Add edge to visualization
 */
function addEdgeToVisualization(source, target, verb, type) {
  if (!gRef || !simulationRef) {
    console.error('Cannot add edge: missing references');
    return;
  }
  
  // Find the links group (first g element)
  let linksGroup = gRef.select('g:first-child');
  if (linksGroup.empty()) {
    // Create links group if it doesn't exist
    linksGroup = gRef.insert('g', ':first-child');
  }
  
  // Create link data
  const linkData = {
    source: source,
    target: target,
    verb: verb,
    type: type,
    strength: 1
  };
  
  // Determine color based on relation type
  const typeColors = {
    'dataflow': { color: '#ffffff', name: 'white' },      // Data Flow - white
    'dependency': { color: '#3b82f6', name: 'blue' },     // Dependency - blue
    'composition': { color: '#f59e0b', name: 'orange' },  // Composition - orange
    'inheritance': { color: '#a855f7', name: 'purple' },  // Inheritance - purple
    'association': { color: '#10b981', name: 'green' }    // Association - green
  };
  
  const typeColor = typeColors[type] || typeColors['dataflow'];
  const color = typeColor.color;
  const colorName = typeColor.name;
  
  // Add line element with animated glow
  const line = linksGroup.append('line')
    .datum(linkData)
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('stroke-linecap', 'round')
    .attr('stroke-dasharray', '6 6')
    .attr('marker-end', `url(#arrowhead-${colorName})`)
    .style('filter', `drop-shadow(0 0 6px ${color})`);
  
  // Phase 1: Exaggerated initial pulse
  line
    .transition()
    .duration(1000)
    .ease(d3.easeCubicOut)
    .attr('stroke-width', 4)
    .style('filter', `drop-shadow(0 0 14px ${color})`)
    .styleTween('stroke-dashoffset', () => d3.interpolateString('24', '-24'))
    .on('end', function() {
      // Phase 2: Continuous subtle pulse
      d3.select(this)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('stroke-width', 2)
        .style('filter', `drop-shadow(0 0 4px ${color})`)
        .styleTween('stroke-dashoffset', () => d3.interpolateString('12', '-12'))
        .on('end', function repeatPulse() {
          d3.select(this)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .styleTween('stroke-dashoffset', () => d3.interpolateString('12', '-12'))
            .on('end', repeatPulse);
        });
    });
  
  // Add label for the verb
  const labelGroup = linksGroup.append('g')
    .datum(linkData)
    .attr('class', 'edge-label');
  
  labelGroup.append('rect')
    .attr('fill', '#181818')
    .attr('stroke', color)
    .attr('stroke-width', 1)
    .attr('rx', 3)
    .attr('width', verb.length * 7 + 12)
    .attr('height', 18)
    .attr('x', -(verb.length * 7 + 12) / 2)
    .attr('y', -9);
  
  labelGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', 4)
    .attr('fill', color)
    .attr('font-size', '10px')
    .attr('font-weight', '500')
    .text(verb);
  
  // Add arrowhead marker for this color if it doesn't exist
  let defs = svgRef.select('defs');
  if (defs.empty()) {
    defs = svgRef.insert('defs', ':first-child');
  }
  
  const arrowheadId = `arrowhead-${colorName}`;
  if (defs.select(`#${arrowheadId}`).empty()) {
    defs.append('marker')
      .attr('id', arrowheadId)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', color)
      .style('filter', `drop-shadow(0 0 3px ${color})`);
  }
  
  // Update edge positions on simulation tick
  const updateEdges = () => {
    // Access node coordinates directly
    const sx = source.x || 0;
    const sy = source.y || 0;
    const tx = target.x || 0;
    const ty = target.y || 0;
    
    line
      .attr('x1', sx)
      .attr('y1', sy)
      .attr('x2', tx)
      .attr('y2', ty);
    
    const midX = (sx + tx) / 2;
    const midY = (sy + ty) / 2;
    
    labelGroup
      .attr('transform', `translate(${midX},${midY})`);
  };
  
  // Store update function for this edge
  linkData.updateFn = updateEdges;
  
  // Add to simulation tick handler
  const existingTick = simulationRef.on('tick');
  simulationRef.on('tick', function() {
    if (existingTick) existingTick.call(this);
    updateEdges();
  });
  
  // Initial update after a short delay to ensure nodes have positions
  setTimeout(updateEdges, 100);
  
  console.log(`Added edge: ${source.label} --[${verb}]--> ${target.label}`);
}

/**
 * Delete node from visualization
 */
function deleteNode(node, g, simulation) {
  // Remove from simulation
  const nodes = simulation.nodes();
  const index = nodes.findIndex(n => n.id === node.id);
  if (index > -1) {
    nodes.splice(index, 1);
  }
  
  // Remove from DOM
  g.selectAll('g')
    .filter(d => d && d.id === node.id)
    .remove();
  
  // Restart simulation
  simulation.nodes(nodes);
  simulation.alpha(0.3).restart();
  
  console.log(`Deleted node: ${node.label}`);
}

/**
 * Export current ontology
 */
export function exportOntology(format = 'json') {
  // TODO: Implement export functionality
  console.log(`Exporting ontology as ${format}`);
}

