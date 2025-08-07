import "./style.css";

import "@arcgis/map-components/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-navigation-toggle";
import "@arcgis/map-components/components/arcgis-compass";
import "@arcgis/map-components/components/arcgis-placement";
import "@esri/calcite-components/components/calcite-action-bar";
import "@esri/calcite-components/components/calcite-label";
import "@esri/calcite-components/components/calcite-button";

import DirectLineMeasurementAnalysis from "@arcgis/core/analysis/DirectLineMeasurementAnalysis";
import AreaMeasurementAnalysis from "@arcgis/core/analysis/AreaMeasurementAnalysis";
import LineOfSightAnalysis from "@arcgis/core/analysis/LineOfSightAnalysis";
import ViewshedAnalysis from "@arcgis/core/analysis/ViewshedAnalysis";
import Viewshed from "@arcgis/core/analysis/Viewshed";
import DimensionAnalysis from "@arcgis/core/analysis/DimensionAnalysis";
import SliceAnalysis from "@arcgis/core/analysis/SliceAnalysis";
import SlicePlane from "@arcgis/core/analysis/SlicePlane";
import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import LengthDimension from "@arcgis/core/analysis/LengthDimension";
import * as promiseUtils from "@arcgis/core/core/promiseUtils";
import AreaMeasurementAnalysisView3D from "@arcgis/core/views/3d/analysis/AreaMeasurementAnalysisView3D";
import DirectLineMeasurementAnalysisView3D from "@arcgis/core/views/3d/analysis/DirectLineMeasurementAnalysisView3D";
import LineOfSightAnalysisView3D from "@arcgis/core/views/3d/analysis/LineOfSightAnalysisView3D";
import ViewshedAnalysisView3D from "@arcgis/core/views/3d/analysis/ViewshedAnalysisView3D";
import DimensionAnalysisView3D from "@arcgis/core/views/3d/analysis/DimensionAnalysisView3D";
import SliceAnalysisView3D from "@arcgis/core/views/3d/analysis/SliceAnalysisView3D";

let activeTool:
    | {
        name: string;
        icon: string;
        analysis: AreaMeasurementAnalysis | null;
        analysisView: AreaMeasurementAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: DirectLineMeasurementAnalysis | null;
        analysisView: DirectLineMeasurementAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: LineOfSightAnalysis | null;
        analysisView: LineOfSightAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: ViewshedAnalysis | null;
        analysisView: ViewshedAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: DimensionAnalysis | null;
        analysisView: DimensionAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: SliceAnalysis | null;
        analysisView: SliceAnalysisView3D | null;
      }
    | null,
  activeActionElement: HTMLCalciteActionElement | null,
  abortController: AbortController | null;

// Get DOM elements
const scene: HTMLArcgisSceneElement | null =
  document.querySelector("arcgis-scene");
if (!scene) {
  throw new Error("Scene element not found");
}
const menu: HTMLDivElement | null = document.querySelector("#divMenu");
if (!menu) {
  throw new Error("Menu element not found");
}
const actionBar: HTMLCalciteActionBarElement | null =
  document.querySelector("#calciteActionBar");
if (!actionBar) {
  throw new Error("Action bar element not found");
}
const promptText: HTMLCalciteLabelElement | null =
  document.querySelector("#calcitePromptText");
if (!promptText) {
  throw new Error("Prompt text element not found");
}
const selectionPromptText: HTMLCalciteLabelElement | null =
  document.querySelector("#calciteSelectionPromptText");
if (!selectionPromptText) {
  throw new Error("Selection prompt text element not found");
}
const buttons: HTMLDivElement | null =
  document.querySelector("#calciteButtons");
if (!buttons) {
  throw new Error("Buttons element not found");
}
const clearButton: HTMLCalciteButtonElement | null = document.querySelector(
  "#calciteClearButton"
);
if (!clearButton) {
  throw new Error("Clear button element not found");
}
const doneButton: HTMLCalciteButtonElement | null =
  document.querySelector("#calciteDoneButton");
if (!doneButton) {
  throw new Error("Done button element not found");
}

// Array of all the analysis tools used in the sample.
const tools = [
  {
    name: "Area measurement",
    icon: "measure-area",
    analysis: createAreaMeasurementAnalysis(),
    analysisView: null as AreaMeasurementAnalysisView3D | null,
  },
  {
    name: "Direct line measurement",
    icon: "measure-line",
    analysis: createDirectLineMeasurementAnalysis(),
    analysisView: null as DirectLineMeasurementAnalysisView3D | null,
  },
  {
    name: "Line of sight",
    icon: "line-of-sight",
    analysis: createLineOfSightAnalysis(),
    analysisView: null as LineOfSightAnalysisView3D | null,
  },
  {
    name: "Viewshed",
    icon: "viewshed",
    analysis: createViewshedAnalysis(),
    analysisView: null as ViewshedAnalysisView3D | null,
  },
  {
    name: "Dimension",
    icon: "dimensions",
    analysis: createDimensionAnalysis(),
    analysisView: null as DimensionAnalysisView3D | null,
  },
  {
    name: "Slice",
    icon: "slice",
    analysis: createSliceAnalysis(),
    analysisView: null as SliceAnalysisView3D | null,
  },
];

// Create a direct line measurement analysis.
function createDirectLineMeasurementAnalysis(): DirectLineMeasurementAnalysis | null {
  return new DirectLineMeasurementAnalysis({
    startPoint: newPoint(-8238827, 4971466, 3),
    endPoint: newPoint(-8238819, 4971537, 3),
  });
}

// Create an area measurement analysis.
function createAreaMeasurementAnalysis(): AreaMeasurementAnalysis | null {
  const roofPolygon = new Polygon({
    rings: [
      [
        [-8238931, 4971381, 50],
        [-8238926, 4971426, 50],
        [-8238835, 4971415, 50],
        [-8238841, 4971369, 50],
        [-8238931, 4971381, 50],
      ],
    ],
    spatialReference: SpatialReference.WebMercator,
  });
  return new AreaMeasurementAnalysis({
    geometry: roofPolygon,
  });
}

// Create a slice analysis.
function createSliceAnalysis(): SliceAnalysis | null {
  return new SliceAnalysis({
    shape: new SlicePlane({
      position: newPoint(-8238840, 4971700, 21),
      tilt: 0,
      width: 70,
      height: 100,
      heading: 278,
    }),
  });
}

// Create a line of sight analysis.
function createLineOfSightAnalysis(): LineOfSightAnalysis | null {
  return new LineOfSightAnalysis({
    observer: {
      position: newPoint(-8238825, 4971538, 48),
    },
    targets: [
      {
        position: newPoint(-8238903, 4971649, 2),
      },
      {
        position: newPoint(-8238866, 4971629, 19),
      },
      {
        position: newPoint(-8238825, 4971880, 2),
      },
      {
        position: newPoint(-8238791, 4971784, 2),
      },
    ],
  });
}

// Create a viewshed analysis.
function createViewshedAnalysis(): ViewshedAnalysis | null {
  return new ViewshedAnalysis({
    viewsheds: [
      new Viewshed({
        observer: newPoint(-8238868, 4971525, 48),
        heading: -80,
        tilt: 75,
        farDistance: 120,
        horizontalFieldOfView: 55,
        verticalFieldOfView: 55,
      }),
    ],
  });
}

// Create a dimension analysis.
function createDimensionAnalysis(): DimensionAnalysis | null {
  return new DimensionAnalysis({
    dimensions: [
      new LengthDimension({
        startPoint: newPoint(-8238805.863420386, 4971633.739526394, 3.8),
        endPoint: newPoint(-8238815.848786024, 4971563.1027141735, 3.8),
        offset: 17,
        orientation: 270,
        measureType: "direct",
      }),
      new LengthDimension({
        startPoint: newPoint(-8238805.863404014, 4971633.739529291, 3.8),
        endPoint: newPoint(-8238805.863404014, 4971633.739529291, 22.8),
        offset: 15,
        orientation: 8,
        measureType: "direct",
      }),
    ],
  });
}

// Setup the UI/UX and add the programamtically created analysis to the analyses collection.
for (const tool of tools) {
  const actionElement = setupActionElement(tool);
  actionBar.appendChild(actionElement);
}
doneButton.addEventListener("click", () => {
  stopActiveTool();
});
clearButton.addEventListener("click", () => {
  clearAnalysis(activeTool?.analysis);
  selectionPromptText.style.display = "none";
  clearButton.style.display = "none";
});
scene.addEventListener("arcgisViewKeyDown", (event) => {
  if (event.detail.key === "Escape") {
    stopActiveTool();
  }
});

// Wait for the view to be ready and add the analysis to the analyses collection.
await scene.viewOnReady();
await Promise.all([
  tools.map(async (tool) => {
    if (!tool.analysis) {
      throw new Error("Analysis not found");
    }
    scene.analyses.add(tool.analysis);
    tool.analysisView = await scene.whenAnalysisView(tool.analysis);
  }),
]);
menu.style.display = "block";

// Setup the action element for each analysis tool.
function setupActionElement(
  tool:
    | {
        name: string;
        icon: string;
        analysis: AreaMeasurementAnalysis | null;
        analysisView: AreaMeasurementAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: DirectLineMeasurementAnalysis | null;
        analysisView: DirectLineMeasurementAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: LineOfSightAnalysis | null;
        analysisView: LineOfSightAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: ViewshedAnalysis | null;
        analysisView: ViewshedAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: DimensionAnalysis | null;
        analysisView: DimensionAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: SliceAnalysis | null;
        analysisView: SliceAnalysisView3D | null;
      }
) {
  const actionElement = document.createElement("calcite-action");
  actionElement.icon = tool.icon;
  actionElement.addEventListener("click", () =>
    onActionElementClick(tool, actionElement)
  );
  const actionTooltip = setupActionTooltip(tool, actionElement);
  actionElement.appendChild(actionTooltip);
  return actionElement;
}

function setupActionTooltip(tool: { name: string }, referenceActionElement) {
  const tooltip = document.createElement("calcite-tooltip");
  tooltip.placement = "top";
  tooltip.referenceElement = referenceActionElement;
  tooltip.innerHTML = tool.name;
  tooltip.closeOnClick = true;
  return tooltip;
}

function onActionElementClick(
  tool:
    | {
        name: string;
        icon: string;
        analysis: AreaMeasurementAnalysis | null;
        analysisView: AreaMeasurementAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: DirectLineMeasurementAnalysis | null;
        analysisView: DirectLineMeasurementAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: LineOfSightAnalysis | null;
        analysisView: LineOfSightAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: ViewshedAnalysis | null;
        analysisView: ViewshedAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: DimensionAnalysis | null;
        analysisView: DimensionAnalysisView3D | null;
      }
    | {
        name: string;
        icon: string;
        analysis: SliceAnalysis | null;
        analysisView: SliceAnalysisView3D | null;
      }
    | null,
  actionElement: HTMLCalciteActionElement | null
) {
  if (actionElement && !actionElement.active) {
    // If a non-active tool was picked, stop the previous active tool (if any) and reset the UI.
    stopActiveTool();
    // Set the new active tool and start placing the analysis.
    activeTool = tool;
    placeContinuous();
    // Update menu and show the button controls.
    updateUI(actionElement);
  } else {
    // If the previously active tool is picked, stop it and reset the UI.
    stopActiveTool();
  }
}

// Stop the active tool.
function stopActiveTool() {
  if (!actionBar) {
    throw new Error("Action bar element not found");
  }
  if (activeTool && activeTool.analysisView) {
    abortController?.abort();
    activeTool.analysisView.interactive = false;
    activeTool = null;
  }
  for (const action of actionBar.children) {
    action.removeAttribute("active");
  }
  updateUI(activeActionElement);
}

// Update the UI based on the active tool.
function updateUI(actionElement: HTMLCalciteActionElement | null) {
  if (!buttons) {
    throw new Error("Button elements not found");
  }
  if (!promptText) {
    throw new Error("Prompt text element not found");
  }
  if (!selectionPromptText) {
    throw new Error("Selection prompt text element not found");
  }
  if (!clearButton) {
    throw new Error("Clear button element not found");
  }
  if (!doneButton) {
    throw new Error("Done button element not found");
  }
  if (!selectionPromptText) {
    throw new Error("Selection prompt text element not found");
  }
  if (actionElement) {
    const resetUI = actionElement === activeActionElement ? true : false;
    buttons.style.display = resetUI ? "none" : "flex";
    actionElement.active = resetUI ? false : true;
    promptText.innerHTML = resetUI
      ? "Choose an analysis type."
      : "Click in view to start placing " +
        analysisTypeToName(activeTool?.analysis?.type ?? "") +
        " analysis.";
    activeActionElement = resetUI ? null : actionElement;
  }
  const activeAnalysisPresent = checkIfAnalysisPresent();
  if (activeAnalysisPresent) {
    clearButton.style.display = "flex";
    selectionPromptText.style.display =
      activeTool?.analysis?.type === "viewshed" ||
      activeTool?.analysis?.type === "dimension"
        ? "block"
        : "none";
  } else {
    clearButton.style.display = "none";
    selectionPromptText.style.display = "none";
  }
}

// Check if there is any analysis present.
function checkIfAnalysisPresent() {
  const analysis = activeTool?.analysis;
  if (!analysis) {
    return false;
  }
  switch (analysis.type) {
    case "direct-line-measurement":
      return analysis.startPoint !== null && analysis.endPoint !== null;
    case "area-measurement":
      return analysis.geometry !== null;
    case "line-of-sight":
      return analysis.observer !== null;
    case "slice":
      return analysis.shape !== null;
    case "viewshed":
      return analysis.viewsheds?.length > 0;
    case "dimension":
      return analysis.dimensions?.length > 0;
    default:
      return false;
  }
}

// Place the analysis continuously.
async function placeContinuous() {
  abortController?.abort();
  abortController = new AbortController();
  const { signal } = abortController;
  try {
    while (!signal.aborted) {
      await activeTool?.analysisView?.place({
        signal,
      });
      updateUI(activeActionElement);
    }
  } catch (error) {
    throwIfNotAbortError(error);
  } finally {
    if (abortController && abortController.signal === signal) {
      abortController = null;
    }
  }
}

// Clear the analysis.
function clearAnalysis(
  analysis:
    | AreaMeasurementAnalysis
    | DirectLineMeasurementAnalysis
    | LineOfSightAnalysis
    | ViewshedAnalysis
    | DimensionAnalysis
    | SliceAnalysis
    | null
    | undefined
) {
  if (!analysis) {
    return;
  }
  switch (analysis.type) {
    case "direct-line-measurement":
      analysis.startPoint = null;
      analysis.endPoint = null;
      break;
    case "area-measurement":
      analysis.geometry = null;
      break;
    case "line-of-sight":
      analysis.observer = null;
      analysis.targets = [];
      break;
    case "slice":
      analysis.shape = null;
      break;
    case "viewshed":
      analysis.viewsheds = [];
      break;
    case "dimension":
      analysis.dimensions = [];
      break;
  }
}

// Helper functions for creating points and checking errors.
function newPoint(x: number, y: number, z: number) {
  return new Point({
    x,
    y,
    z,
    spatialReference: SpatialReference.WebMercator,
  });
}

// Helper function to throw if the error is not an abort error.
function throwIfNotAbortError(error: __esri.Error) {
  if (!promiseUtils.isAbortError(error)) {
    throw error;
  }
}

// Helper function to convert analysis type to name.
function analysisTypeToName(text: string) {
  return text.replace(/-/g, " ");
}
