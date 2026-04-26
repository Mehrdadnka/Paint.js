export class ToolbarManager {
    constructor(drawingEngine) {
        this.engine = drawingEngine;
        this.components = new Map();
        this.init();
    }
    
    init() {
        this.setupToolButtons();
        this.setupHistoryControls();
        this.setupPropertyControls();
        this.setupColorPalette();
        this.setupPanelTabs();
        this.setupLayersPanel();
        this.setupClearAndSave();
    }
    
    registerComponent(name, component) {
        this.components.set(name, component);
    }
    
    setupToolButtons() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        
        toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const toolName = btn.dataset.tool;
                
                // Remove active class from all tools
                toolButtons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked tool
                btn.classList.add('active');
                
                // Set tool in engine
                this.engine.setTool(toolName);
            });
        });
        
        // Listen for tool changes from engine
        this.engine.onToolChange = (toolName) => {
            toolButtons.forEach(btn => {
                if (btn.dataset.tool === toolName) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            this.updateToolInfo();
        };
    }
    
    setupHistoryControls() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        const updateHistoryButtons = ({ canUndo, canRedo }) => {
            if (undoBtn) {
                undoBtn.disabled = !canUndo;
                undoBtn.style.opacity = canUndo ? '1' : '0.5';
            }
            if (redoBtn) {
                redoBtn.disabled = !canRedo;
                redoBtn.style.opacity = canRedo ? '1' : '0.5';
            }
        };
        
        // Subscribe to history changes
        this.engine.history.subscribe(updateHistoryButtons);
        
        // Event listeners
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.engine.history.undo();
            });
        }
        
        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                this.engine.history.redo();
            });
        }
        
        // Initial state
        updateHistoryButtons({
            canUndo: this.engine.history.undoStack.length > 1,
            canRedo: this.engine.history.redoStack.length > 0
        });
    }
    
    setupPropertyControls() {
        // Brush size slider
        const brushSlider = document.getElementById('brush__slider');
        const brushSizeInput = document.getElementById('brushSizeInput');
        
        if (brushSlider) {
            brushSlider.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                this.engine.setLineWidth(size);
                if (brushSizeInput) {
                    brushSizeInput.value = size;
                }
                this.updateToolInfo();
            });
        }
        
        if (brushSizeInput) {
            brushSizeInput.addEventListener('change', (e) => {
                const size = parseInt(e.target.value);
                this.engine.setLineWidth(size);
                if (brushSlider) {
                    brushSlider.value = size;
                }
                this.updateToolInfo();
            });
        }
        
        // Opacity slider
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                const opacity = parseInt(e.target.value);
                this.engine.setOpacity(opacity);
                if (opacityValue) {
                    opacityValue.textContent = `${opacity}%`;
                }
                this.updateToolInfo();
            });
        }
        
        // Fill checkbox
        const fillCheckbox = document.getElementById('fillColor');
        if (fillCheckbox) {
            fillCheckbox.addEventListener('change', (e) => {
                this.engine.setFillEnabled(e.target.checked);
            });
        }
        
        // Listen for property changes
        this.engine.onPropertyChange = (property, value) => {
            switch(property) {
                case 'lineWidth':
                    if (brushSlider) brushSlider.value = value;
                    if (brushSizeInput) brushSizeInput.value = value;
                    break;
                case 'opacity':
                    if (opacitySlider) opacitySlider.value = value;
                    if (opacityValue) opacityValue.textContent = `${value}%`;
                    break;
            }
            this.updateToolInfo();
        };
    }
    
    setupColorPalette() {
        // Primary and secondary colors
        const primaryColor = document.querySelector('.color-swatch.primary');
        const secondaryColor = document.querySelector('.color-swatch.secondary');
        
        if (primaryColor) {
            primaryColor.addEventListener('click', () => {
                const colorPicker = document.createElement('input');
                colorPicker.type = 'color';
                colorPicker.value = this.engine.selectedColor;
                colorPicker.addEventListener('change', (e) => {
                    this.engine.setColor(e.target.value);
                    primaryColor.style.background = e.target.value;
                });
                colorPicker.click();
            });
        }
        
        if (secondaryColor) {
            secondaryColor.addEventListener('click', () => {
                const colorPicker = document.createElement('input');
                colorPicker.type = 'color';
                colorPicker.value = '#FFFFFF';
                colorPicker.addEventListener('change', (e) => {
                    secondaryColor.style.background = e.target.value;
                });
                colorPicker.click();
            });
        }
        
        // Color grid
        const colorGrid = document.querySelector('.color-grid');
        if (colorGrid) {
            const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];
            colors.forEach(color => {
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.background = color;
                swatch.addEventListener('click', () => {
                    this.engine.setColor(color);
                    if (primaryColor) {
                        primaryColor.style.background = color;
                    }
                });
                colorGrid.appendChild(swatch);
            });
        }
    }
    
    setupPanelTabs() {
        const tabs = document.querySelectorAll('.panel-tab');
        const panels = document.querySelectorAll('.panel-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const panelName = tab.dataset.panel;
                
                // Remove active from all tabs and panels
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                // Add active to clicked tab and corresponding panel
                tab.classList.add('active');
                const panel = document.getElementById(`${panelName}Panel`);
                if (panel) {
                    panel.classList.add('active');
                }
            });
        });
    }
    
    setupLayersPanel() {
        const addLayerBtn = document.getElementById('addLayerBtn');
        const layersList = document.getElementById('layersList');

        if (!layersList) return;

        // Define render function before usage
        const renderLayersList = (layers) => {
            if (!layersList) return;
            
            layersList.innerHTML = '';
            
            layers.forEach((layer, index) => {
                const layerItem = document.createElement('div');
                layerItem.className = `layer-item ${layer.isActive ? 'active' : ''}`;
                layerItem.draggable = true;
                layerItem.dataset.layerId = layer.id;
                
                layerItem.innerHTML = `
                    <div class="layer-visibility" data-action="visibility">
                        <i class="fas fa-eye${layer.visible ? '' : '-slash'}"></i>
                    </div>
                    <div class="layer-thumbnail">
                        ${layer.thumbnail ? `<img src="${layer.thumbnail}" alt="${layer.name}">` : ''}
                    </div>
                    <div class="layer-info">
                        <div class="layer-name">${layer.name}</div>
                        <div class="layer-details">
                            ${layer.locked ? '<i class="fas fa-lock"></i> ' : ''}
                            ${Math.round(layer.opacity * 100)}%
                        </div>
                    </div>
                    <div class="layer-actions">
                        <button class="layer-action-btn" data-action="opacity" title="Opacity">
                            <i class="fas fa-adjust"></i>
                        </button>
                        <button class="layer-action-btn" data-action="duplicate" title="Duplicate Layer">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="layer-action-btn" data-action="lock" title="${layer.locked ? 'Unlock' : 'Lock'} Layer">
                            <i class="fas fa-${layer.locked ? 'lock' : 'lock-open'}"></i>
                        </button>
                        ${!layer.locked ? `<button class="layer-action-btn" data-action="delete" title="Delete Layer">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                `;
                
                // Event listeners
                layerItem.addEventListener('click', (e) => {
                    if (!e.target.closest('button')) {
                        this.engine.layerManager.setActiveLayer(layer.id);
                    }
                });
                
                // Visibility toggle
                const visBtn = layerItem.querySelector('[data-action="visibility"]');
                if (visBtn) {
                    visBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.engine.layerManager.toggleLayerVisibility(layer.id);
                    });
                }
                
                // Duplicate layer
                const dupBtn = layerItem.querySelector('[data-action="duplicate"]');
                if (dupBtn) {
                    dupBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.engine.layerManager.duplicateLayer(layer.id);
                    });
                }
                
                // Lock/unlock layer
                const lockBtn = layerItem.querySelector('[data-action="lock"]');
                if (lockBtn) {
                    lockBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.engine.layerManager.lockLayer(layer.id, !layer.locked);
                    });
                }
                
                // Delete layer
                const deleteBtn = layerItem.querySelector('[data-action="delete"]');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (this.engine.layerManager.layers.length > 1) {
                            this.engine.layerManager.removeLayer(layer.id);
                        }
                    });
                }
                
                // Drag and Drop for layer reordering
                layerItem.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', layer.id);
                    layerItem.classList.add('dragging');
                });
                
                layerItem.addEventListener('dragend', () => {
                    layerItem.classList.remove('dragging');
                });
                
                layerItem.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    layerItem.classList.add('drag-over');
                });
                
                layerItem.addEventListener('dragleave', () => {
                    layerItem.classList.remove('drag-over');
                });
                
                layerItem.addEventListener('drop', (e) => {
                    e.preventDefault();
                    layerItem.classList.remove('drag-over');
                    
                    const draggedId = e.dataTransfer.getData('text/plain');
                    const dropIndex = this.engine.layerManager.layers.findIndex(l => l.id === layer.id);
                    
                    if (draggedId !== layer.id) {
                        this.engine.layerManager.moveLayer(draggedId, dropIndex);
                    }
                });
                
                layersList.appendChild(layerItem);
            });
        };
        
        // Subscribe to layer changes
        this.engine.layerManager.subscribe((data) => {
            renderLayersList(data.layers);
        });
        
        // Add layer button
        if (addLayerBtn) {
            addLayerBtn.addEventListener('click', () => {
                this.engine.layerManager.addLayer();
            });
        }
        
        // Initial render
        renderLayersList(this.engine.layerManager.getLayersInfo());
    }
    
    setupClearAndSave() {
        // Clear canvas button
        const clearButton = document.querySelector('.clear-canvas-btn');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear the canvas?')) {
                    this.engine.clearCanvas();
                }
            });
        }
        
        // Save image button
        const saveButton = document.querySelector('.save-image-btn');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.engine.saveAsImage();
            });
        }
    }
    
    updateToolInfo() {
        const toolInfo = document.getElementById('toolInfo');
        if (toolInfo) {
            const tool = this.engine.currentTool;
            const size = this.engine.lineWidth;
            toolInfo.textContent = `${tool.charAt(0).toUpperCase() + tool.slice(1)} • ${size}px`;
        }
    }
}
