// Show the plugin UI with an updated size.
figma.showUI(__html__, { width: 300, height: 550 });

// Global state for showing tag highlights and the current target persona.
let showTaggedHighlights = false;
let currentTargetPersona = ""; // Stores the persona that was last linked or unlinked

// Helper function to send the linked personas (as an array) from the selected frame.
function sendLinkedPersona() {
  const selection = figma.currentPage.selection;
  let linkedPersonas: string[] = [];
  if (selection.length > 0 && selection[0].type === "FRAME") {
    const node = selection[0] as FrameNode;
    const data = node.getPluginData("persona");
    if (data) {
      try {
        const arr = JSON.parse(data);
        if (Array.isArray(arr)) {
          linkedPersonas = arr;
        }
      } catch (err) {
        console.error("Error parsing linked personas", err);
      }
    }
  }
  // Send the linked personas array to the UI.
  figma.ui.postMessage({ type: "update-linked-persona", personas: linkedPersonas });
}

// Highlight frames that have been tagged with the current target persona.
function highlightTaggedFrames() {
  if (!currentTargetPersona) return;
  const frames = figma.currentPage.findAll(
    (node) => node.type === "FRAME"
  ) as FrameNode[];
  for (const frame of frames) {
    const data = frame.getPluginData("persona");
    let linkedList: string[] = [];
    if (data) {
      try {
        linkedList = JSON.parse(data);
      } catch (err) {
        linkedList = [];
      }
    }
    if (linkedList.indexOf(currentTargetPersona) !== -1) {
      frame.strokes = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
      frame.strokeWeight = 4;
    } else {
      frame.strokes = [];
      frame.strokeWeight = 0;
    }
  }
}

// Cleanup function that clears strokes from all frames.
function cleanupHighlights() {
  const frames = figma.currentPage.findAll(
    (node) => node.type === "FRAME"
  ) as FrameNode[];
  for (const frame of frames) {
    frame.strokes = [];
    frame.strokeWeight = 0;
  }
}

// Send an initial update of linked personas.
sendLinkedPersona();

// Listen for selection changes to update the linked persona display.
figma.on("selectionchange", () => {
  sendLinkedPersona();
});

// Load shared personas on launch.
let rawPersonas = figma.root.getSharedPluginData("persona_linker", "personas");
let personas;
try {
  personas = JSON.parse(rawPersonas || "[]");
} catch (e) {
  personas = [];
  console.error("Failed to parse shared personas:", e);
}
figma.ui.postMessage({ type: "load-personas", personas });

// Listen for messages from the UI.
figma.ui.onmessage = async (msg: {
  type: string;
  persona?: string;
  personaData?: { name: string; emoji?: string };
  personas?: any[];
}) => {
  if (msg.type === "link-persona") {
    // Allow linking multiple frames.
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify("Please select at least one frame first.");
      return;
    }
    // Update the current target persona.
    currentTargetPersona = msg.persona || "";
    let linkedCount = 0;
    for (const node of selection) {
      if (node.type === "FRAME") {
        const data = node.getPluginData("persona");
        let linkedList: string[] = [];
        if (data) {
          try {
            linkedList = JSON.parse(data);
          } catch (err) {
            linkedList = [];
          }
        }
        // Append the persona if not already present.
        if (linkedList.indexOf(msg.persona!) === -1) {
          linkedList.push(msg.persona!);
          node.setPluginData("persona", JSON.stringify(linkedList));
          linkedCount++;
        }
      }
    }
    if (linkedCount === 0) {
      figma.notify("No valid frames selected or persona already linked.");
      return;
    }
    const summaryMsg = `${linkedCount} frame${linkedCount > 1 ? "s" : ""} linked to ${msg.persona
      }`;
    figma.notify(summaryMsg);
    figma.ui.postMessage({ type: "link-summary", summary: summaryMsg });
    if (showTaggedHighlights) {
      highlightTaggedFrames();
    }
  } else if (msg.type === "unlink-persona") {
    // Unlink logic: remove only the persona specified in the message.
    if (figma.currentPage.selection.length === 0) {
      figma.notify("Please select a frame first.");
      return;
    }
    const node = figma.currentPage.selection[0];
    if (node.type !== "FRAME") {
      figma.notify("Selected object is not a frame.");
      return;
    }
    const data = node.getPluginData("persona");
    if (!data) {
      figma.notify("No persona is linked to the selected frame.");
      return;
    }
    let linkedList: string[] = [];
    try {
      linkedList = JSON.parse(data);
    } catch (err) {
      linkedList = [];
    }
    const targetPersona = msg.persona;
    const index = linkedList.indexOf(targetPersona!);
    if (index === -1) {
      figma.notify("The persona is not linked to the selected frame.");
      return;
    }
    linkedList.splice(index, 1);
    if (linkedList.length === 0) {
      node.setPluginData("persona", "");
    } else {
      node.setPluginData("persona", JSON.stringify(linkedList));
    }
    figma.notify(`Unlinked ${targetPersona} from the selected frame.`);
    sendLinkedPersona();
    if (showTaggedHighlights) {
      highlightTaggedFrames();
    }
  } else if (msg.type === "update-personas") {
    try {
      const newPersonas = msg.personas || [];
      figma.root.setSharedPluginData("persona_linker", "personas", JSON.stringify(newPersonas));
      figma.ui.postMessage({ type: "load-personas", personas: newPersonas });

      // Compute valid persona strings.
      const validPersonaStrings = newPersonas.map(
        (p) => (p.emoji ? p.emoji + " " : "") + p.name
      );
      const frames = figma.currentPage.findAll(
        (node) => node.type === "FRAME"
      ) as FrameNode[];
      for (const frame of frames) {
        const data = frame.getPluginData("persona");
        if (data) {
          let linkedList: string[] = [];
          try {
            linkedList = JSON.parse(data);
          } catch (err) {
            linkedList = [];
          }
          // Filter out any linked persona not in the valid list.
          const filtered = linkedList.filter((p) => validPersonaStrings.indexOf(p) !== -1);
          if (filtered.length === 0) {
            frame.setPluginData("persona", "");
          } else {
            frame.setPluginData("persona", JSON.stringify(filtered));
          }
        }
      }
      sendLinkedPersona();
      if (showTaggedHighlights) {
        highlightTaggedFrames();
      } else {
        cleanupHighlights();
      }
    } catch (e) {
      figma.notify("Failed to update personas");
      console.error(e);
    }
  } else if (msg.type === "toggle-tag-highlights") {
    showTaggedHighlights = !showTaggedHighlights;
    if (showTaggedHighlights) {
      highlightTaggedFrames();
    } else {
      cleanupHighlights();
    }
    figma.ui.postMessage({ type: "update-highlights", show: showTaggedHighlights });
  }
};