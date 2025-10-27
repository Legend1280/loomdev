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

/**
 * Initialize Galaxy Editor
 * @param {Object} svg - D3 SVG selection
 * @param {Object} g - D3 group selection
 * @param {Object} simulation - D3 force simulation
 */
export function initGalaxyEditor(svg, g, simulation) {
  console.log('Initializing Galaxy Editor...');
  
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
  // Add click handler for creating nodes
  svg.on('click', function(event) {
    // Only handle clicks on empty space (not on nodes)
    if (event.target.tagName === 'svg' || event.target.tagName === 'rect') {
      const [x, y] = d3.pointer(event, g.node());
      showAddNodeDialog(x, y, g, simulation);
    }
  });
  
  console.log('Editing enabled: Click empty space to add nodes');
}

/**
 * Disable editing mode
 */
function disableEditing(svg) {
  svg.on('click', null);
  linkingMode = false;
  linkSource = null;
  if (tempLine) {
    tempLine.remove();
    tempLine = null;
  }
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
  
  // Get existing node groups
  const nodeGroup = g.select('g:last-of-type');
  
  // Create new node group
  const newNode = nodeGroup.append('g')
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
      if (getDeveloperMode()) {
        handleNodeClick(d, event);
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
  
  // Restart simulation
  simulation.alpha(0.3).restart();
}

/**
 * Handle node click in developer mode
 */
function handleNodeClick(node, event) {
  if (linkingMode) {
    // Complete link creation
    if (linkSource && linkSource.id !== node.id) {
      createLink(linkSource, node);
      linkingMode = false;
      linkSource = null;
      if (tempLine) {
        tempLine.remove();
        tempLine = null;
      }
    }
  } else {
    // Start link creation
    linkingMode = true;
    linkSource = node;
    console.log(`Link mode: Click another node to create connection from ${node.label}`);
    
    // Show visual feedback
    event.target.setAttribute('stroke', '#fad643');
    event.target.setAttribute('stroke-width', '3');
  }
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
    .style('border-radius', '4px')
    .style('padding', '4px')
    .style('z-index', '10000')
    .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.5)');
  
  // Edit option
  menu.append('div')
    .style('padding', '8px 16px')
    .style('color', '#e6e6e6')
    .style('font-size', '12px')
    .style('cursor', 'pointer')
    .style('border-radius', '2px')
    .text('✏️ Edit')
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
    .style('padding', '8px 16px')
    .style('color', '#ef4444')
    .style('font-size', '12px')
    .style('cursor', 'pointer')
    .style('border-radius', '2px')
    .text('🗑️ Delete')
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

