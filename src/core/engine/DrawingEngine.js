import { HistoryManager } from "../history/HistoryManager.js";
import { LayerManager } from "../../layers/Layers.js";

export default class DrawingEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.history = new HistoryManager(this);
        this.layerManager = new LayerManager(canvas, this.ctx);
        this.tools = new Map();
        
        // Current state
        this._currentTool = 'brush';
        this.selectedColor = '#000000';
        this.lineWidth = 5;
        this.fillEnabled = false;
        this.opacity = 1;
        
        // Mouse state
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.snapshot = null;
        
        // Callbacks
        this.onToolChange = null;
        this.onPropertyChange = null;
        
        this.init();
    }
    
    // Getter for current tool
    get currentTool() {
        return this._currentTool;
    }
    
    // Initialize the drawing engine
    init() {
        this.setupCanvas();
        this.registerDefaultTools();
        this.bindEvents();
    }
    
    // Setup canvas dimensions and resize handling
    setupCanvas() {
        const resize = () => {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            const newWidth = rect.width;
            const newHeight = rect.height;
            
            // Update main canvas size
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;
            
            // Update all layer sizes
            if (this.layerManager && this.layerManager.layers) {
                this.layerManager.layers.forEach(layer => {
                    layer.resize(newWidth, newHeight);
                });
            }
            
            // Re-render all layers after resize
            if (this.layerManager) {
                this.layerManager.render();
            }
        };
        
        window.addEventListener('load', resize);
        window.addEventListener('resize', resize);
        resize();
    }
    
    // Register built-in drawing tools
    registerDefaultTools() {
        // Register tools with active layer context
        this.tools.set('brush', {
            draw: (e, ctx) => this.drawFreehand(e, false, ctx)
        });
        this.tools.set('eraser', {
            draw: (e, ctx) => this.drawFreehand(e, true, ctx)
        });
        this.tools.set('rectangle', {
            draw: (e, ctx) => this.drawRectangle(e, ctx)
        });
        this.tools.set('circle', {
            draw: (e, ctx) => this.drawCircle(e, ctx)
        });
        this.tools.set('triangle', {
            draw: (e, ctx) => this.drawTriangle(e, ctx)
        });
    }
    
    // Bind canvas mouse events
    bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
    }
    
    // Handle mouse down - start drawing
    onMouseDown(e) {
        const activeLayer = this.layerManager.getActiveLayer();
        if (!activeLayer || activeLayer.locked) return;
        
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        
        // Get active layer context
        const layerCtx = this.layerManager.getActiveContext();
        if (!layerCtx) return;
        
        // Configure drawing context
        layerCtx.beginPath();
        layerCtx.lineWidth = this.lineWidth;
        layerCtx.strokeStyle = this.currentTool === 'eraser' ? '#ffffff' : this.selectedColor;
        layerCtx.fillStyle = this.selectedColor;
        layerCtx.globalAlpha = this.opacity;
        
        // Save snapshot of active layer for restoration during drawing
        this.snapshot = layerCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Handle mouse move - draw while dragging
    onMouseMove(e) {
        if (!this.isDrawing) return;
        
        const layerCtx = this.layerManager.getActiveContext();
        if (!layerCtx) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        // Restore active layer snapshot to erase previous temporary drawing
        if (this.snapshot) {
            layerCtx.putImageData(this.snapshot, 0, 0);
        }
        
        // Execute current tool on active layer
        const tool = this.tools.get(this.currentTool);
        if (tool) {
            tool.draw({ offsetX: currentX, offsetY: currentY }, layerCtx);
        }
        
        // Render all layers on main canvas
        this.layerManager.render();
    }
    
    // Handle mouse up - finish drawing
    onMouseUp() {
        if (this.isDrawing) {
            this.isDrawing = false;
            
            const layerCtx = this.layerManager.getActiveContext();
            if (layerCtx) {
                // Reset alpha and close path
                layerCtx.beginPath();
                layerCtx.globalAlpha = 1;
            }
            
            // Save final canvas state in history for undo/redo
            this.history.saveState(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
        }
    }
    
    // Freehand drawing tool (brush or eraser)
    drawFreehand(e, isEraser, ctx) {
        ctx.strokeStyle = isEraser ? '#ffffff' : this.selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
    
    // Rectangle shape tool
    drawRectangle(e, ctx) {
        const width = e.offsetX - this.startX;
        const height = e.offsetY - this.startY;
        
        if (this.fillEnabled) {
            ctx.fillRect(this.startX, this.startY, width, height);
        }
        ctx.strokeRect(this.startX, this.startY, width, height);
    }
    
    // Circle shape tool
    drawCircle(e, ctx) {
        const radius = Math.sqrt(
            Math.pow(e.offsetX - this.startX, 2) + 
            Math.pow(e.offsetY - this.startY, 2)
        );
        
        ctx.beginPath();
        ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
        
        if (this.fillEnabled) {
            ctx.fill();
        }
        ctx.stroke();
    }
    
    // Triangle shape tool
    drawTriangle(e, ctx) {
        const endX = e.offsetX;
        const endY = e.offsetY;
        
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(endX, endY);
        ctx.lineTo(this.startX * 2 - endX, endY);
        ctx.closePath();
        
        if (this.fillEnabled) {
            ctx.fill();
        }
        ctx.stroke();
    }
    
    // Set active drawing tool
    setTool(toolName) {
        if (this.tools.has(toolName)) {
            this._currentTool = toolName;
            if (this.onToolChange) {
                this.onToolChange(toolName);
            }
        }
    }
    
    // Set drawing color
    setColor(color) {
        this.selectedColor = color;
        if (this.onPropertyChange) {
            this.onPropertyChange('color', color);
        }
    }
    
    // Set brush/line width
    setLineWidth(width) {
        this.lineWidth = width;
        if (this.onPropertyChange) {
            this.onPropertyChange('lineWidth', width);
        }
    }
    
    // Enable or disable shape filling
    setFillEnabled(enabled) {
        this.fillEnabled = enabled;
    }
    
    // Set drawing opacity (0-100)
    setOpacity(opacity) {
        this.opacity = opacity / 100;
        if (this.onPropertyChange) {
            this.onPropertyChange('opacity', opacity);
        }
    }
    
    // Clear entire canvas by clearing all layers
    clearCanvas() {
        this.layerManager.layers.forEach(layer => {
            layer.clear();
        });
        this.layerManager.render();
        this.history.saveState(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
    }
    
    // Save canvas as PNG image
    saveAsImage() {
        const link = document.createElement('a');
        link.download = `drawing_${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }
    
    // Get current canvas image data
    getCanvasData() {
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Restore canvas from saved image data
    restoreCanvasData(imageData) {
        this.ctx.putImageData(imageData, 0, 0);
    }
}
