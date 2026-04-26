export class HistoryManager {
    constructor(engine) {
        this.engine = engine;
        this.undoStack = [];
        this.redoStack = [];
        this.maxSteps = 50;
        this.listeners = new Set(); // For UI updates
    }
    
    // Observer pattern for UI updates
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    
    // Notify all listeners about history state changes
    notify() {
        this.listeners.forEach(listener => listener({
            canUndo: this.undoStack.length > 1,
            canRedo: this.redoStack.length > 0
        }));
    }
    
    // Save current canvas state to undo stack
    saveState(imageData) {
        this.undoStack.push(imageData);
        
        // Limit stack size by removing oldest states
        if (this.undoStack.length > this.maxSteps) {
            this.undoStack.shift();
        }
        
        // Clear redo stack when new action is performed
        this.redoStack = [];
        this.notify();
    }
    
    // Undo the last action
    undo() {
        if (this.undoStack.length > 1) {
            const current = this.undoStack.pop();
            this.redoStack.push(current);
            const previous = this.undoStack[this.undoStack.length - 1];
            this.engine.restoreCanvasData(previous);
            this.notify();
            return true;
        }
        return false;
    }
    
    // Redo the last undone action
    redo() {
        if (this.redoStack.length > 0) {
            const state = this.redoStack.pop();
            this.undoStack.push(state);
            this.engine.restoreCanvasData(state);
            this.notify();
            return true;
        }
        return false;
    }
}
