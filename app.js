import DrawingEngine from "./DrawingEngine.js";
import { ToolbarManager } from "./ToolbarManager.js";

class Application {
    constructor() {
        this.engine = null;
        this.toolbar = null;
        this.init();
    }
    
    init() {
        const canvas = document.getElementById('canvas1');
        if (!canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.engine = new DrawingEngine(canvas);
        this.toolbar = new ToolbarManager(this.engine);
        
        this.setupShortcuts();
        this.setupCanvasInfo();
        this.setupMenuActions();
        
        this.showBackgroundSelection();
    }
    
    showBackgroundSelection() {
        const modal = document.createElement('div');
        modal.className = 'modal-background-selection';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 500px;
                width: 90%;
            ">
                <h2 style="margin: 0 0 10px 0; color: #333; font-size: 24px;">Choose Background</h2>
                <p style="color: #666; margin: 0 0 20px 0;">Select background type for your new project:</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                    <div class="bg-option" data-bg="transparent" style="
                        border: 3px solid #4CAF50;
                        border-radius: 8px;
                        padding: 15px;
                        cursor: pointer;
                        text-align: center;
                        transition: all 0.2s;
                    ">
                        <div style="
                            width: 100%;
                            height: 100px;
                            background-image: linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
                                              linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
                                              linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
                                              linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
                            background-size: 20px 20px;
                            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                            border-radius: 4px;
                            margin-bottom: 10px;
                        "></div>
                        <span style="font-weight: 600; color: #333;">Transparent</span>
                        <br><span style="font-size: 12px; color: #666;">Checkerboard pattern</span>
                    </div>
                    
                    <div class="bg-option" data-bg="white" style="
                        border: 3px solid #e0e0e0;
                        border-radius: 8px;
                        padding: 15px;
                        cursor: pointer;
                        text-align: center;
                        transition: all 0.2s;
                    ">
                        <div style="
                            width: 100%;
                            height: 100px;
                            background: white;
                            border: 2px solid #e0e0e0;
                            border-radius: 4px;
                            margin-bottom: 10px;
                        "></div>
                        <span style="font-weight: 600; color: #333;">White</span>
                        <br><span style="font-size: 12px; color: #666;">Solid white background</span>
                    </div>
                </div>
                
                <button id="confirmBackground" style="
                    width: 100%;
                    padding: 12px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                ">Confirm Selection</button>
                <button id="laterBackground" style="
                    width: 100%;
                    padding: 10px;
                    background: none;
                    color: #666;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    margin-top: 8px;
                    transition: color 0.2s;
                ">Choose Later</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        let selectedBackground = 'transparent';
        const options = modal.querySelectorAll('.bg-option');
        const confirmBtn = modal.querySelector('#confirmBackground');
        const laterBtn = modal.querySelector('#laterBackground');
        
        // Handle background selection
        options.forEach(option => {
            option.addEventListener('click', () => {
                selectedBackground = option.dataset.bg;
                
                // Update visual selection
                options.forEach(opt => {
                    opt.style.borderColor = '#e0e0e0';
                });
                option.style.borderColor = '#4CAF50';
            });
            
            // Hover effect
            option.addEventListener('mouseenter', () => {
                if (option.dataset.bg !== selectedBackground) {
                    option.style.borderColor = '#90CAF9';
                }
            });
            
            option.addEventListener('mouseleave', () => {
                if (option.dataset.bg !== selectedBackground) {
                    option.style.borderColor = '#e0e0e0';
                }
            });
        });
        
        // Confirm button
        confirmBtn.addEventListener('click', () => {
            this.engine.layerManager.setBackgroundColor(selectedBackground);
            document.body.removeChild(modal);
        });
        
        confirmBtn.addEventListener('mouseenter', () => {
            confirmBtn.style.background = '#45a049';
        });
        
        confirmBtn.addEventListener('mouseleave', () => {
            confirmBtn.style.background = '#4CAF50';
        });
        
        // Choose later button
        laterBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        laterBtn.addEventListener('mouseenter', () => {
            laterBtn.style.color = '#333';
        });
        
        laterBtn.addEventListener('mouseleave', () => {
            laterBtn.style.color = '#666';
        });
    }
    
    setupShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (!e.ctrlKey && !e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.engine.setTool('brush');
                        break;
                    case 'e':
                        e.preventDefault();
                        this.engine.setTool('eraser');
                        break;
                    case 'r':
                        e.preventDefault();
                        this.engine.setTool('rectangle');
                        break;
                    case 'c':
                        e.preventDefault();
                        this.engine.setTool('circle');
                        break;
                    case 't':
                        e.preventDefault();
                        this.engine.setTool('triangle');
                        break;
                }
            }
            
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.engine.history.redo();
                        } else {
                            this.engine.history.undo();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        this.engine.layerManager.saveProject();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.newProject();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.loadProject();
                        break;
                }
            }
        });
    }
    
    setupCanvasInfo() {
        const updateCanvasInfo = () => {
            const canvasInfo = document.getElementById('canvasInfo');
            const zoomInfo = document.getElementById('zoomInfo');
            
            if (canvasInfo && this.engine.canvas) {
                const { width, height } = this.engine.canvas;
                canvasInfo.textContent = `${Math.round(width)} × ${Math.round(height)}`;
            }
            
            if (zoomInfo) {
                zoomInfo.textContent = '100%';
            }
        };
        
        window.addEventListener('resize', updateCanvasInfo);
        updateCanvasInfo();
    }
    
    setupMenuActions() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.target.textContent.toLowerCase();
                switch(action) {
                    case 'file':
                        this.showFileMenu(e.target);
                        break;
                    case 'edit':
                        this.showEditMenu(e.target);
                        break;
                    case 'view':
                        this.showViewMenu(e.target);
                        break;
                    case 'help':
                        alert('Pro Drawing Suite v1.0\nA professional drawing application');
                        break;
                }
            });
        });
    }
    
    showFileMenu(element) {
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';
        menu.innerHTML = `
            <div class="dropdown-item" data-action="new">New (Ctrl+N)</div>
            <div class="dropdown-item" data-action="background">Change Background</div>
            <div class="dropdown-separator"></div>
            <div class="dropdown-item" data-action="save-project">Save Project (Ctrl+S)</div>
            <div class="dropdown-item" data-action="load-project">Load Project (Ctrl+O)</div>
            <div class="dropdown-separator"></div>
            <div class="dropdown-item" data-action="export-png">Export as PNG</div>
            <div class="dropdown-separator"></div>
            <div class="dropdown-item" data-action="clear">Clear Canvas</div>
        `;
        
        this.showDropdown(element, menu, (action) => {
            switch(action) {
                case 'new':
                    this.newProject();
                    break;
                case 'background':
                    this.showBackgroundSelection();
                    break;
                case 'save-project':
                    this.engine.layerManager.saveProject();
                    break;
                case 'load-project':
                    this.loadProject();
                    break;
                case 'export-png':
                    this.engine.saveAsImage();
                    break;
                case 'clear':
                    if (confirm('Are you sure you want to clear the canvas?')) {
                        this.engine.clearCanvas();
                    }
                    break;
            }
        });
    }
    
    newProject() {
        if (confirm('Create new project? All unsaved changes will be lost.')) {
            this.engine.layerManager.layers.forEach(layer => layer.clear());
            
            this.engine.layerManager.layers = [this.engine.layerManager.layers[0]];
            this.engine.layerManager.layers[0].clear();
            this.engine.layerManager.layers[0].name = 'Layer 1';
            this.engine.layerManager.activeLayerId = this.engine.layerManager.layers[0].id;
            this.engine.layerManager.layerCounter = 1;
            
            this.engine.history.undoStack = [];
            this.engine.history.redoStack = [];
            
            // Show background selection for new project
            this.showBackgroundSelection();
            
            const emptyState = this.engine.ctx.getImageData(0, 0, this.engine.canvas.width, this.engine.canvas.height);
            this.engine.history.saveState(emptyState);
        }
    }
    
    loadProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const success = this.engine.layerManager.loadProject(event.target.result);
                if (success) {
                    this.engine.history.undoStack = [];
                    this.engine.history.redoStack = [];
                    const currentState = this.engine.ctx.getImageData(0, 0, this.engine.canvas.width, this.engine.canvas.height);
                    this.engine.history.saveState(currentState);
                } else {
                    alert('Failed to load project file. The file might be corrupted.');
                }
            };
            reader.readAsText(file);
        });
        
        input.click();
    }
    
    showEditMenu(element) {
        const canUndo = this.engine.history.undoStack.length > 1;
        const canRedo = this.engine.history.redoStack.length > 0;
        
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';
        menu.innerHTML = `
            <div class="dropdown-item ${canUndo ? '' : 'disabled'}" data-action="undo">Undo (Ctrl+Z)</div>
            <div class="dropdown-item ${canRedo ? '' : 'disabled'}" data-action="redo">Redo (Ctrl+Shift+Z)</div>
        `;
        
        this.showDropdown(element, menu, (action) => {
            switch(action) {
                case 'undo':
                    this.engine.history.undo();
                    break;
                case 'redo':
                    this.engine.history.redo();
                    break;
            }
        });
    }
    
    showViewMenu(element) {
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';
        menu.innerHTML = `
            <div class="dropdown-item" data-action="zoom-in">Zoom In (+)</div>
            <div class="dropdown-item" data-action="zoom-out">Zoom Out (-)</div>
            <div class="dropdown-item" data-action="fit">Fit to Screen (0)</div>
        `;
        
        this.showDropdown(element, menu, (action) => {
            console.log('View action:', action);
        });
    }
    
    showDropdown(element, menu, callback) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.remove());
        
        const rect = element.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.top = `${rect.bottom}px`;
        menu.style.left = `${rect.left}px`;
        
        document.body.appendChild(menu);
        
        const handleClick = (e) => {
            const item = e.target.closest('.dropdown-item');
            if (item && !item.classList.contains('disabled')) {
                const action = item.dataset.action;
                callback(action);
            }
            menu.remove();
            document.removeEventListener('click', handleClick);
        };
        
        setTimeout(() => {
            document.addEventListener('click', handleClick);
        }, 0);
    }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Application();
    });
} else {
    new Application();
}
