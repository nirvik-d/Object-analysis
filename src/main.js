const [
  SpatialReference,
  Polygon,
  Point,
  AreaMeasurementAnalysis,
  DirectLineMeasurementAnalysis,
  LineOfSightAnalysis,
  ViewshedAnalysis,
  Viewshed,
  DimensionAnalysis,
  LengthDimension,
  SliceAnalysis,
  SlicePlane,
  promiseUtils,
] = await $arcgis.import([
  "@arcgis/core/geometry/SpatialReference.js",
  "@arcgis/core/geometry/Polygon.js",
  "@arcgis/core/geometry/Point.js",
  "@arcgis/core/analysis/AreaMeasurementAnalysis.js",
  "@arcgis/core/analysis/DirectLineMeasurementAnalysis.js",
  "@arcgis/core/analysis/LineOfSightAnalysis.js",
  "@arcgis/core/analysis/ViewshedAnalysis.js",
  "@arcgis/core/analysis/Viewshed.js",
  "@arcgis/core/analysis/DimensionAnalysis.js",
  "@arcgis/core/analysis/LengthDimension.js",
  "@arcgis/core/analysis/SliceAnalysis.js",
  "@arcgis/core/analysis/SlicePlane.js",
  "@arcgis/core/core/promiseUtils.js",
]);
let activeTool, activeActionElement, abortController;

// Get DOM elements
const viewElement = document.querySelector("arcgis-scene");
const menu = document.getElementById("menu");
const actionBar = document.getElementById("action-bar");
const promptText = document.getElementById("promptText");
const selectionPromptText = document.getElementById("selectionPromptText");
const buttons = document.getElementById("buttons");
const clearButton = document.getElementById("clearButton");
const doneButton = document.getElementById("doneButton");

// Array of all the analysis tools used in the sample.
const tools = [
  {
    name: "Area measurement",
    icon: "measure-area",
    analysis: createAreaMeasurementAnalysis(),
    analysisView: null,
  },
  {
    name: "Direct line measurement",
    icon: "measure-line",
    analysis: createDirectLineMeasurementAnalysis(),
    analysisView: null,
  },
  {
    name: "Line of sight",
    icon: "line-of-sight",
    analysis: createLineOfSightAnalysis(),
    analysisView: null,
  },
  {
    name: "Viewshed",
    icon: "viewshed",
    analysis: createViewshedAnalysis(),
    analysisView: null,
  },
  {
    name: "Dimension",
    icon: "dimensions",
    analysis: createDimensionAnalysis(),
    analysisView: null,
  },
  {
    name: "Slice",
    icon: "slice",
    analysis: createSliceAnalysis(),
    analysisView: null,
  },
];

// Create a direct line measurement analysis.
function createDirectLineMeasurementAnalysis() {
  return new DirectLineMeasurementAnalysis({
    startPoint: newPoint(-8238827, 4971466, 3),
    endPoint: newPoint(-8238819, 4971537, 3),
  });
}

// Create an area measurement analysis.
function createAreaMeasurementAnalysis() {
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
function createSliceAnalysis() {
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
function createLineOfSightAnalysis() {
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
function createViewshedAnalysis() {
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
function createDimensionAnalysis() {
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
  clearAnalysis(activeTool.analysis);
  selectionPromptText.style.display = "none";
  clearButton.style.display = "none";
});
viewElement.addEventListener("arcgisViewKeyDown", (event) => {
  if (event.detail.key === "Escape") {
    stopActiveTool();
  }
});

// Wait for the view to be ready and add the analysis to the analyses collection.
await viewElement.viewOnReady();
await Promise.all([
  tools.map(async (tool) => {
    viewElement.analyses.add(tool.analysis);
    tool.analysisView = await viewElement.whenAnalysisView(tool.analysis);
  }),
]);
menu.style.display = "block";

// Setup the action element for each analysis tool.
function setupActionElement(tool) {
  const actionElement = document.createElement("calcite-action");
  actionElement.icon = tool.icon;
  actionElement.addEventListener("click", () => onActionElementClick(tool, actionElement));
  const actionTooltip = setupActionTooltip(tool, actionElement);
  actionElement.appendChild(actionTooltip);
  return actionElement;
}

// Setup the action tooltip for each analysis tool.
function setupActionTooltip(tool, referenceActionElement) {
  const tooltip = document.createElement("calcite-tooltip");
  tooltip.placement = "top";
  tooltip.referenceElement = referenceActionElement;
  tooltip.innerHTML = tool.name;
  tooltip.closeOnClick = true;
  return tooltip;
}

// Handle the click event on an action element.
function onActionElementClick(tool, actionElement) {
  if (!actionElement.active) {
    stopActiveTool();
    activeTool = tool;
    placeContinuous();
    updateUI(actionElement);
  } else {
    stopActiveTool();
  }
}

// Stop the active tool.
function stopActiveTool() {
  if (activeTool) {
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
function updateUI(actionElement) {
  if (actionElement) {
    const resetUI = actionElement === activeActionElement ? true : false;
    buttons.style.display = resetUI ? "none" : "flex";
    actionElement.active = resetUI ? false : true;
    promptText.innerHTML = resetUI
      ? "Choose an analysis type."
      : "Click in view to start placing " +
        analysisTypeToName(activeTool?.analysis.type) +
        " analysis.";
    activeActionElement = resetUI ? null : actionElement;
  }
  const activeAnalysisPresent = checkIfAnalysisPresent();
  if (activeAnalysisPresent) {
    clearButton.style.display = "flex";
    selectionPromptText.style.display =
      activeTool?.analysis.type === "viewshed" || activeTool?.analysis.type === "dimension"
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
      await activeTool.analysisView.place({
        signal,
      });
      updateUI();
    }
  } catch (error) {
    throwIfNotAbortError(error);
  } finally {
    if (abortController?.signal === signal) {
      abortController = null;
    }
  }
}

// Clear the analysis.
function clearAnalysis(analysis) {
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
function newPoint(x, y, z) {
  return new Point({
    x,
    y,
    z,
    spatialReference: SpatialReference.WebMercator,
  });
}

// Helper function to throw if the error is not an abort error.
function throwIfNotAbortError(error) {
  if (!promiseUtils.isAbortError(error)) {
    throw error;
  }
}

// Helper function to convert analysis type to name.
function analysisTypeToName(text) {
  return text.replace(/-/g, " ");
}