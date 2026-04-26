// src/core/engine/SafeDrawingEngine.js
import DrawingEngine from "./DrawingEngine.js";
import { ErrorBoundary } from "../ErrorBoundary.js";

export default class SafeDrawingEngine {
    constructor(canvas) {
        this.errorBoundary = new ErrorBoundary();
        this.engine = null;
        this.canvas = canvas;
        
        // Initialize engine with error handling
        this.init();
    }
    
    init() {
        try {
            this.engine = new DrawingEngine(this.canvas);
            
            // Wrap critical methods with error boundary
            this.wrapEngineMethods();
            
            console.log('✅ SafeDrawingEngine initialized successfully');
        } catch (error) {
            this.errorBoundary.handleError(error, 'engine');
            throw error; // Re-throw for application-level handling
        }
    }
    
    wrapEngineMethods() {
        // Wrap mouse event handlers
        this.engine.onMouseDown = this.errorBoundary.wrap(
            this.engine.onMouseDown.bind(this.engine),
            'canvas'
        );
        
        this.engine.onMouseMove = this.errorBoundary.wrap(
            this.engine.onMouseMove.bind(this.engine),
            'canvas'
        );
        
        this.engine.onMouseUp = this.errorBoundary.wrap(
            this.engine.onMouseUp.bind(this.engine),
            'canvas'
        );
        
        // Wrap drawing tools
        this.wrapDrawingTools();
        
        // Wrap critical methods
        this.wrapCriticalMethods();
    }
    
    wrapDrawingTools() {
        // Wrap each tool's draw method
        this.engine.tools.forEach((tool, toolName) => {
            tool.draw = this.errorBoundary.wrap(
                tool.draw.bind(tool),
                `tool-${toolName}`
            );
        });
    }
    
    wrapCriticalMethods() {
        const criticalMethods = [
            'clearCanvas',
            'saveAsImage',
            'getCanvasData',
            'restoreCanvasData',
            'setTool',
            'setColor',
            'setLineWidth'
        ];
        
        criticalMethods.forEach(methodName => {
            if (typeof this.engine[methodName] === 'function') {
                const originalMethod = this.engine[methodName].bind(this.engine);
                this.engine[methodName] = this.errorBoundary.wrap(
                    originalMethod,
                    `engine-${methodName}`
                );
            }
        });
        
        // Wrap history methods
        if (this.engine.history) {
            this.engine.history.undo = this.errorBoundary.wrap(
                this.engine.history.undo.bind(this.engine.history),
                'history-undo'
            );
            
            this.engine.history.redo = this.errorBoundary.wrap(
                this.engine.history.redo.bind(this.engine.history),
                'history-redo'
            );
            
            this.engine.history.saveState = this.errorBoundary.wrap(
                this.engine.history.saveState.bind(this.engine.history),
                'history-save'
            );
        }
        
        // Wrap layer manager methods
        if (this.engine.layerManager) {
            const layerMethods = ['render', 'getActiveLayer', 'getActiveContext', 'addLayer'];
            layerMethods.forEach(methodName => {
                if (typeof this.engine.layerManager[methodName] === 'function') {
                    const originalMethod = this.engine.layerManager[methodName].bind(this.engine.layerManager);
                    this.engine.layerManager[methodName] = this.errorBoundary.wrap(
                        originalMethod,
                        'layer'
                    );
                }
            });
        }
    }
    
    // Getter methods to access underlying engine
    getCanvas() {
        return this.engine?.canvas;
    }
    
    getContext() {
        return this.engine?.ctx;
    }
    
    getHistory() {
        return this.engine?.history;
    }
    
    getLayerManager() {
        return this.engine?.layerManager;
    }
    
    // Error boundary access
    getErrorBoundary() {
        return this.errorBoundary;
    }
    
    // Add custom error handler
    onError(context, handler) {
        this.errorBoundary.onError(context, handler);
    }
    
    // Get error logs
    getErrorLogs() {
        const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
        return errors;
    }
    
    // Clear error logs
    clearErrorLogs() {
        localStorage.removeItem('error_logs');
    }
}