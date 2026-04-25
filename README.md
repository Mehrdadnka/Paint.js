<div align="center">

# 🎨 Pro Drawing Suite

**A Professional, Browser-Based Drawing Application Built with Vanilla JavaScript**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/Canvas-HTML5-E34F26?logo=html5)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Built With](#-built-with)
- [Architecture & Design Patterns](#️-architecture--design-patterns)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🖌️ About the Project

**Pro Drawing Suite** is a feature-rich, professional drawing application that runs entirely in your browser. Whether you need to sketch ideas, create diagrams, or design graphics, this application provides a powerful set of tools wrapped in an intuitive interface. The app is built with a focus on clean architecture, performance, and extensibility, utilizing the HTML5 Canvas API without any external rendering libraries.

---

## ✨ Features

### 🎯 Core Drawing Tools
- **Brush:** Freehand drawing with customizable size and opacity.
- **Eraser:** Correct mistakes with a dedicated eraser tool.
- **Shape Tools:** Draw perfect **Rectangles**, **Circles**, and **Triangles**.
- **Fill Mode:** Toggle between outlined and filled shapes.

### 🎨 Color & Styling
- **Primary & Secondary Color Swatches** for quick access.
- **8-Color Preset Grid** for one-click color changes.
- **Custom Color Picker** for unlimited color choices.
- **Adjustable Opacity** from 1% to 100%.
- **Dynamic Brush Size** from 1px to 80px.

### 🧩 Advanced Layer System
- **Multi-Layer Support:** Create, delete, and reorder layers.
- **Layer Properties:** Toggle visibility, lock layers, and adjust individual opacity.
- **Drag-and-Drop:** Reorder layers directly via drag-and-drop.
- **Layer Actions:** Duplicate, rename, and merge layers down.
- **Background Configuration:** Choose between a transparent checkerboard or a solid white background at project creation.

### ⏪ Comprehensive History Management
- **Undo/Redo:** Full undo and redo functionality with a configurable history stack (up to 50 steps).
- **UI Integration:** Toolbar buttons and info bar dynamically reflect history availability.

### 💾 Project Persistence
- **Save Project:** Export your entire project, including all layers and history, as a `.json` file.
- **Load Project:** Import a previously saved project to resume your work.
- **Export as PNG:** Flatten and save your artwork as a high-quality `.png` image.

### ⌨️ Productivity Boosters
- **Keyboard Shortcuts** for rapid tool switching and actions.
- **Modular Status Bar** displaying current tool, size, and canvas dimensions.
- **Contextual Dropdown Menus** for File, Edit, and View actions.

---

## 🧱 Built With

- **[HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)** - The rendering layer for all graphics.
- **[JavaScript ES6+](https://developer.mozilla.org/en-US/docs/Web/JavaScript)** - Utilizing classes, modules, and modern patterns.
- **[CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS)** - For responsive and aesthetic UI design.
- **[Font Awesome 6](https://fontawesome.com/)** - Clean, professional icons throughout the interface.

---

## 🏛️ Architecture & Design Patterns

The application is engineered with a robust, decoupled architecture that separates the drawing engine, layer management, history, and UI logic. This makes the codebase highly maintainable and extensible.

- **`Application` (app.js):** The main orchestrator that initializes the engine, toolbar, shortcuts, and menu actions.
- **`DrawingEngine` (DrawingEngine.js):** The core manager that owns the canvas context, tool registration, and mouse event handling. It bridges the interaction between user input and the active layer.
- **`ToolbarManager` (ToolbarManager.js):** Manages the entire UI, including tool selection, sliders, color palettes, and panel tabs. It subscribes to changes in the engine and layer manager to keep the UI in sync.
- **`LayerManager` & `Layer` (Layers.js):** A self-contained layer system where each layer has its own virtual canvas. It implements an **Observer pattern** to notify the UI of any layer changes without tight coupling.
- **`HistoryManager` (HistoryManager.js):** A standalone history system that uses a snapshot-based approach to enable undo/redo. It also uses an **Observer pattern** to update UI buttons reactively.
- **Registry Pattern:** Drawing tools are registered into a `Map` within the engine, making it trivial to add new tools in the future without modifying core logic.

---

## 🚀 Getting Started

Follow these simple steps to get a local copy up and running.

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge).
- No build tools or package managers are required.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/pro-drawing-suite.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd pro-drawing-suite
    ```
3.  **Open `index.html` in your browser.**
    > Because the application uses ES6 modules (`type="module"`), you must serve it through an HTTP server to avoid CORS errors. If you have Python installed, you can run:
    > ```bash
    > # Python 3
    > python -m http.server 8000
    > ```
    > Then visit `http://localhost:8000` in your browser.

---

## 🎮 Usage

1.  **Start a Project:** Upon loading, you'll be prompted to choose a background (Transparent or White).
2.  **Select a Tool:** Use the left toolbar to pick the Brush, Eraser, or any Shape tool.
3.  **Customize:** Adjust brush size, opacity, and colors using the **Properties** panel on the right.
4.  **Manage Layers:** Switch to the **Layers** panel to add, reorder, or modify layers destructively.
5.  **Save Your Work:** Go to `File -> Export as PNG` or use `Ctrl+S` to save the entire project.

---

## ⌨️ Keyboard Shortcuts

Boost your workflow with these handy shortcuts:

| Shortcut               | Action                     |
| ---------------------- | -------------------------- |
| `B`                    | Select **Brush** Tool      |
| `E`                    | Select **Eraser** Tool     |
| `R`                    | Select **Rectangle** Tool  |
| `C`                    | Select **Circle** Tool     |
| `T`                    | Select **Triangle** Tool   |
| `Ctrl + Z`             | **Undo** last action       |
| `Ctrl + Shift + Z`     | **Redo** last action       |
| `Ctrl + S`             | **Save** project as JSON   |
| `Ctrl + N`             | **New** project            |
| `Ctrl + O`             | **Load** project file      |

---

## 🗺️ Roadmap

Planned features and improvements for future releases:

- [ ] **Transform Tool:** Select, move, resize, and rotate objects.
- [ ] **Text Tool:** Add and format text directly on the canvas.
- [ ] **Blending Modes:** Implement blend modes for layers (multiply, screen, overlay, etc.).
- [ ] **Zoom & Pan:** Canvas zoom in/out and panning capabilities.
- [ ] **Gradient & Pattern Fills:** Beyond solid colors for fills.
- [ ] **Mobile & Tablet Support:** Enhanced touch events for a native drawing feel.
- [ ] **Custom Brushes:** Import and create custom brush shapes.

See the [open issues](#) for a full list of proposed features and known issues.

---

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Made with Vanilla JavaScript

</div>
