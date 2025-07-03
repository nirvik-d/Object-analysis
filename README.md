# Object Analysis

A 3D visualization and analysis tool built with ArcGIS Maps SDK for JavaScript and Calcite Web Components, providing interactive tools for various spatial measurements and analyses in a 3D environment.

## Features

* **3D Visualization:** Interactive 3D scene using WebMercator spatial reference
* **Analysis Tools:** Multiple tools for spatial measurements and analysis:
  - Area Measurement: Calculate surface areas using polygons
  - Direct Line Measurement: Measure distances between two points
  - Line of Sight: Analyze visibility between observer and target points
  - Viewshed: Calculate visible areas from observer positions
  - Dimension: Measure lengths and distances in 3D space
  - Slice: Create cross-sections through 3D data
* **Interactive UI:** Intuitive interface with Calcite Components
* **Real-time Updates:** Dynamic analysis updates as you interact with the map

## Screenshots

*1. Main application with analysis tools*

<img width="959" alt="image" src="https://github.com/user-attachments/assets/analysis-main.png"/>

*2. Area measurement analysis*

<img width="959" alt="image" src="https://github.com/user-attachments/assets/analysis-area.png"/>

## Prerequisites

* Node.js
* Vite

## Project Setup

1.  **Initialize Project**

    ```bash
    # Create a new Vite project
    npm create vite@latest
    ```

    Follow the instructions on screen to initialize the project.

2.  **Install Dependencies**

    ```bash
    npm install
    ```

## Code Structure

### HTML Structure

The HTML file sets up the basic structure for the ArcGIS web application:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="initial-scale=1,maximum-scale=1,user-scalable=no"
    />
    <title>Object Analysis</title>
    <link rel="stylesheet" href="./src/style.css" />
    <script type="module" src="https://js.arcgis.com/calcite-components/3.2.1/calcite.esm.js"></script>
    <link rel="stylesheet" href="https://js.arcgis.com/4.33/esri/themes/light/main.css" />
    <script src="https://js.arcgis.com/4.33/"></script>
    <script type="module" src="https://js.arcgis.com/4.33/map-components/"></script>
  </head>
  <body>
    <arcgis-scene item-id="d6eefc2b1e984e1eaf1c290588a52c55">
      <arcgis-zoom position="top-left"></arcgis-zoom>
      <arcgis-navigation-toggle position="top-left"></arcgis-navigation-toggle>
      <arcgis-compass position="top-left"></arcgis-compass>
      <arcgis-placement position="top-right">
        <div id="menu" class="esri-widget">
          <h3>Object Analysis</h3>
          <calcite-action-bar id="action-bar" layout="horizontal" expand-disabled>
          </calcite-action-bar>
          <calcite-label id="promptText">Choose an analysis type.</calcite-label>
          <calcite-label id="selectionPromptText">
            <em>To edit an existing analysis, select it by hovering over and clicking on its manipulator.</em>
          </calcite-label>
          <div id="buttons">
            <calcite-button id="clearButton" appearance="outline-fill" kind="neutral">Clear</calcite-button>
            <calcite-button id="doneButton">Done</calcite-button>
          </div>
        </div>
      </arcgis-placement>
    </arcgis-scene>
    <script type="module" src="./src/main.js"></script>
  </body>
</html>
```

### CSS Styling

The CSS file provides styling for the map view and UI elements:

```css
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

h3 {
  margin: 5px 0 7px 0;
}

#menu {
  display: none;
  padding: 0.8em;
  width: 310px;
  background: var(--calcite-color-foreground-1);
}

#menu calcite-action {
  --calcite-action-background-color: var(--calcite-color-foreground-2);
  --calcite-action-background-color-hover: var(--calcite-color-foreground-1);
  --calcite-action-background-color-press: var(--calcite-color-foreground-3);
}

#menu calcite-label {
  margin-top: 10px;
  --calcite-label-margin-bottom: 0;
}

#buttons calcite-button {
  width: 100%;
  margin-top: 10px;
}
```

### JavaScript Implementation

1. **Module Imports**

```javascript
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
```

2. **Global Variables and DOM Setup**

```javascript
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
```

3. **Analysis Tools**

```javascript
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
```

4. **Tool Creation Functions**

```javascript
// Create a direct line measurement analysis
function createDirectLineMeasurementAnalysis() {
  return new DirectLineMeasurementAnalysis({
    startPoint: newPoint(-8238827, 4971466, 3),
    endPoint: newPoint(-8238819, 4971537, 3),
  });
}

// Create an area measurement analysis
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

// Create a slice analysis
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

// Create a line of sight analysis
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

// Create a viewshed analysis
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

// Create a dimension analysis
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
```

5. **UI Setup and Event Handlers**

```javascript
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
```

6. **Helper Functions and UI Setup**

```javascript
// Setup the action element for each analysis tool
function setupActionElement(tool) {
  const actionElement = document.createElement("calcite-action");
  actionElement.icon = tool.icon;
  actionElement.addEventListener("click", () => onActionElementClick(tool, actionElement));
  const actionTooltip = setupActionTooltip(tool, actionElement);
  actionElement.appendChild(actionTooltip);
  return actionElement;
}

// Setup the action tooltip for each analysis tool
function setupActionTooltip(tool, referenceActionElement) {
  const tooltip = document.createElement("calcite-tooltip");
  tooltip.placement = "top";
  tooltip.referenceElement = referenceActionElement;
  tooltip.innerHTML = tool.name;
  tooltip.closeOnClick = true;
  return tooltip;
}

// Handle the click event on an action element
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

// Stop the active tool
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

// Update the UI based on the active tool
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

// Check if there is any analysis present
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

// Place the analysis continuously
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

// Clear the analysis
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

// Helper function to create points
function newPoint(x, y, z) {
  return new Point({
    x,
    y,
    z,
    spatialReference: SpatialReference.WebMercator,
  });
}

// Helper function to throw if the error is not an abort error
function throwIfNotAbortError(error) {
  if (!promiseUtils.isAbortError(error)) {
    throw error;
  }
}

// Helper function to convert analysis type to name
function analysisTypeToName(text) {
  return text.replace(/-/g, " ");
}

## Running the Application

1. **Development Server**

   ```bash
   npm run dev
   ```

   This will start the development server at `http://localhost:5173`

2. **Build for Production**
   ```bash
   npm run build
   ```

## Usage

1. **Basic Navigation**
   - Use mouse wheel to zoom in/out
   - Click and drag to rotate the view
   - Right-click and drag to pan the map

2. **Analysis Tools**
   - Click on any analysis tool icon in the top-right menu
   - Follow the on-screen prompts to place measurements
   - Use the "Clear" button to remove existing analyses
   - Use the "Done" button to stop current analysis

3. **Interactive Features**
   - Hover over existing analyses to see manipulators
   - Click on manipulators to edit existing measurements
   - Use keyboard shortcuts:
     - ESC: Cancel current operation
     - Click: Place analysis points
