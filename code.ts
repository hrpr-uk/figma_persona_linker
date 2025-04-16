// Show the UI window
figma.showUI(__html__, { width: 400, height: 600 });

// Allowed node types for linking
const allowedTypes = new Set(["FRAME", "COMPONENT", "INSTANCE"]);

// Returns only nodes from the current selection that are frames, components, or instances.
function getAllowedNodesFromSelection() {
  return figma.currentPage.selection.filter(node => allowedTypes.has(node.type));
}

// Updates the linked persona IDs on a given node.
// If link is true then the personaId is added; otherwise, it is removed.
function updateLinkedPersonasForNode(node: SceneNode, personaId: string, link: boolean) {
  let personaIds: string[] = [];
  const existing = node.getPluginData("personaIds");
  if (existing) {
    try {
      personaIds = JSON.parse(existing);
    } catch (e) {
      personaIds = [];
    }
  }
  if (link) {
    // Add the persona id if not already linked
    if (personaIds.indexOf(personaId) === -1) {
      personaIds.push(personaId);
    }
  } else {
    // Remove the persona id if linked
    personaIds = personaIds.filter(id => id !== personaId);
  }
  node.setPluginData("personaIds", JSON.stringify(personaIds));
}

figma.ui.onmessage = (msg) => {
  if (msg.type === "link-persona") {
    // Link persona: for every allowed selected node, add the persona id.
    const nodes = getAllowedNodesFromSelection();
    nodes.forEach(node => {
      updateLinkedPersonasForNode(node, msg.personaId, true);
    });
    figma.notify(`Linked persona ${msg.personaName} to ${nodes.length} node(s).`);

  } else if (msg.type === "unlink-persona") {
    // Unlink persona: for every allowed selected node, remove the persona id.
    const nodes = getAllowedNodesFromSelection();
    nodes.forEach(node => {
      updateLinkedPersonasForNode(node, msg.personaId, false);
    });
    figma.notify(`Unlinked persona ${msg.personaName} from ${nodes.length} node(s).`);

  } else if (msg.type === "export-linked-personas") {
    // Export: include frames, components, and instances that have plugin data.
    const nodes = getAllowedNodesFromSelection();
    const exportData = nodes.map(node => {
      const pluginData = node.getPluginData("personaIds");
      if (pluginData) {
        let personaIds = [];
        try {
          personaIds = JSON.parse(pluginData);
        } catch (e) { }
        // For non-frame nodes, append the node type to the name.
        let label = node.name;
        if (node.type !== "FRAME") {
          // Convert type (e.g. COMPONENT, INSTANCE) to title case.
          label += ` (${node.type.charAt(0) + node.type.slice(1).toLowerCase()})`;
        }
        return { name: label, personaIds: personaIds };
      }
      return null;
    }).filter(item => item !== null);
    figma.ui.postMessage({
      type: "export-linked-personas-data",
      data: JSON.stringify(exportData, null, 2),
      exportFormat: msg.exportFormat,
    });

  } else if (msg.type === "toggle-tag-highlights") {
    // Apply highlight effects to all allowed nodes.
    const nodes = getAllowedNodesFromSelection();
    nodes.forEach(node => {
      // Custom logic for highlights can be added here.
    });

  } else if (msg.type === "update-personas") {
    // Optionally handle global persona updates.
    figma.ui.postMessage({ type: "personas-updated", personas: msg.personas });
  }
};

// Listen for selection changes.
// When the selection changes, update the UI with information on the linked personas.
figma.on("selectionchange", () => {
  const nodes = getAllowedNodesFromSelection();
  let linkedIds: string[] = [];
  nodes.forEach(node => {
    const pluginData = node.getPluginData("personaIds");
    if (pluginData) {
      try {
        const ids: string[] = JSON.parse(pluginData);
        linkedIds = linkedIds.concat(ids);
      } catch (e) {
        // Ignore parsing error
      }
    }
  });
  // Remove duplicate IDs
  linkedIds = linkedIds.filter((id, index) => linkedIds.indexOf(id) === index);
  // Send the union array of persona IDs to the UI.
  figma.ui.postMessage({ type: "update-linked-persona", personas: linkedIds });
});