export class Layer {
    constructor(id, name, width, height) {
        this.id = id;
        this.name = name;
        this.visible = true;
        this.locked = false;
        this.opacity = 1;
        this.blendMode = 'normal';
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        
        this.thumbnail = null;
        
        // Metadata
        this.createdAt = Date.now();
        this.modifiedAt = Date.now();
    }
    
    resize(width, height) {
        if (this.canvas.width === width && this.canvas.height === height) {
            return;
        }
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this.canvas, 0, 0);
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.ctx.drawImage(tempCanvas, 0, 0);
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.modifiedAt = Date.now();
    }
    
    fillWithWhite() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.modifiedAt = Date.now();
    }
    
    copyFrom(sourceLayer) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(sourceLayer.canvas, 0, 0);
        this.modifiedAt = Date.now();
    }
    
    mergeFrom(sourceLayer) {
        this.ctx.globalAlpha = sourceLayer.opacity;
        this.ctx.globalCompositeOperation = sourceLayer.blendMode;
        this.ctx.drawImage(sourceLayer.canvas, 0, 0);
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'normal';
        this.modifiedAt = Date.now();
    }
    
    generateThumbnail(size = 50) {
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = size;
        thumbCanvas.height = size;
        const thumbCtx = thumbCanvas.getContext('2d');
        
        thumbCtx.drawImage(this.canvas, 0, 0, size, size);
        this.thumbnail = thumbCanvas.toDataURL();
        return this.thumbnail;
    }
    
    serialize() {
        return {
            id: this.id,
            name: this.name,
            visible: this.visible,
            locked: this.locked,
            opacity: this.opacity,
            blendMode: this.blendMode,
            dataURL: this.canvas.toDataURL(),
            createdAt: this.createdAt,
            modifiedAt: this.modifiedAt
        };
    }
    
    static deserialize(data) {
        const layer = new Layer(data.id, data.name, 1, 1);
        layer.visible = data.visible;
        layer.locked = data.locked;
        layer.opacity = data.opacity;
        layer.blendMode = data.blendMode;
        layer.createdAt = data.createdAt;
        layer.modifiedAt = data.modifiedAt;
        
        const img = new Image();
        img.src = data.dataURL;
        img.onload = () => {
            layer.canvas.width = img.width;
            layer.canvas.height = img.height;
            layer.ctx.drawImage(img, 0, 0);
        };
        
        return layer;
    }
}

export class LayerManager {
    constructor(mainCanvas, mainCtx) {
        this.mainCanvas = mainCanvas;
        this.mainCtx = mainCtx;
        this.layers = [];
        this.activeLayerId = null;
        this.listeners = new Set();
        this.layerCounter = 0;
        this.backgroundColor = 'transparent';
        
        this.init();
    }
    
    init() {
        this.layerCounter = 1;
        const backgroundLayer = new Layer(
            this.generateId(),
            'Layer 1',
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        
        backgroundLayer.locked = false;
        
        this.layers.push(backgroundLayer);
        this.activeLayerId = backgroundLayer.id;
        
        this.render();
    }
    
    generateId() {
        return `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Observer Pattern
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    
    notify() {
        const data = {
            layers: this.getLayersInfo(),
            activeLayerId: this.activeLayerId,
            layerCount: this.layers.length
        };
        this.listeners.forEach(listener => listener(data));
    }
    
    getUniqueLayerName(baseName = null) {
        if (baseName) {
            const exists = this.layers.some(l => l.name === baseName);
            if (!exists) return baseName;
            
            let counter = 2;
            let newName = `${baseName} ${counter}`;
            while (this.layers.some(l => l.name === newName)) {
                counter++;
                newName = `${baseName} ${counter}`;
            }
            return newName;
        }
        
        this.layerCounter++;
        let name = `Layer ${this.layerCounter}`;
        while (this.layers.some(l => l.name === name)) {
            this.layerCounter++;
            name = `Layer ${this.layerCounter}`;
        }
        return name;
    }
    
    setBackgroundColor(color) {
        this.backgroundColor = color;
        this.render();
    }
    
    addLayer(name = null) {
        const layerName = this.getUniqueLayerName(name);
        const newLayer = new Layer(
            this.generateId(),
            layerName,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        
        this.layers.push(newLayer);
        this.activeLayerId = newLayer.id;
        
        this.render();
        this.notify();
        
        return newLayer;
    }
    
    duplicateLayer(layerId = null) {
        const targetId = layerId || this.activeLayerId;
        const sourceLayer = this.getLayerById(targetId);
        
        if (!sourceLayer) return null;
        
        const duplicateName = this.getUniqueLayerName(`${sourceLayer.name} Copy`);
        const duplicate = new Layer(
            this.generateId(),
            duplicateName,
            this.mainCanvas.width,
            this.mainCanvas.height
        );
        
        duplicate.copyFrom(sourceLayer);
        duplicate.opacity = sourceLayer.opacity;
        duplicate.blendMode = sourceLayer.blendMode;
        
        const sourceIndex = this.layers.indexOf(sourceLayer);
        this.layers.splice(sourceIndex + 1, 0, duplicate);
        this.activeLayerId = duplicate.id;
        
        this.render();
        this.notify();
        
        return duplicate;
    }
    
    removeLayer(layerId) {
        if (this.layers.length <= 1) {
            console.warn('Cannot remove the last layer');
            return false;
        }
        
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index === -1) return false;
        
        this.layers.splice(index, 1);
        
        if (this.activeLayerId === layerId) {
            const newActiveIndex = Math.min(index, this.layers.length - 1);
            this.activeLayerId = this.layers[newActiveIndex].id;
        }
        
        this.render();
        this.notify();
        
        return true;
    }
    
    setActiveLayer(layerId) {
        if (this.activeLayerId === layerId) return;
        
        const layer = this.getLayerById(layerId);
        if (layer) {
            this.activeLayerId = layerId;
            this.notify();
        }
    }
    
    moveLayer(layerId, newIndex) {
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index === -1) return false;
        
        if (newIndex < 0 || newIndex >= this.layers.length) return false;
        
        const layer = this.layers.splice(index, 1)[0];
        this.layers.splice(newIndex, 0, layer);
        
        this.render();
        this.notify();
        
        return true;
    }
    
    mergeDown(layerId) {
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index <= 0) return false;
        
        const upperLayer = this.layers[index];
        const lowerLayer = this.layers[index - 1];
        
        lowerLayer.mergeFrom(upperLayer);
        this.layers.splice(index, 1);
        
        if (this.activeLayerId === upperLayer.id) {
            this.activeLayerId = lowerLayer.id;
        }
        
        this.render();
        this.notify();
        
        return true;
    }
    
    flattenLayers() {
        if (this.layers.length <= 1) return;
        
        const baseLayer = this.layers[0];
        
        for (let i = 1; i < this.layers.length; i++) {
            baseLayer.mergeFrom(this.layers[i]);
        }
        
        this.layers = [baseLayer];
        this.activeLayerId = baseLayer.id;
        
        this.render();
        this.notify();
    }
    
    getLayerById(layerId) {
        return this.layers.find(l => l.id === layerId);
    }
    
    getActiveLayer() {
        return this.getLayerById(this.activeLayerId);
    }
    
    getLayersInfo() {
        return this.layers.map(layer => ({
            id: layer.id,
            name: layer.name,
            visible: layer.visible,
            locked: layer.locked,
            opacity: layer.opacity,
            blendMode: layer.blendMode,
            isActive: layer.id === this.activeLayerId,
            thumbnail: layer.generateThumbnail()
        }));
    }
    
    setLayerVisibility(layerId, visible) {
        const layer = this.getLayerById(layerId);
        if (layer) {
            layer.visible = visible;
            this.render();
            this.notify();
        }
    }
    
    toggleLayerVisibility(layerId) {
        const layer = this.getLayerById(layerId);
        if (layer) {
            layer.visible = !layer.visible;
            this.render();
            this.notify();
        }
    }
    
    setLayerOpacity(layerId, opacity) {
        const layer = this.getLayerById(layerId);
        if (layer) {
            layer.opacity = Math.max(0, Math.min(1, opacity));
            this.render();
            this.notify();
        }
    }
    
    setLayerBlendMode(layerId, blendMode) {
        const layer = this.getLayerById(layerId);
        if (layer) {
            layer.blendMode = blendMode;
            this.render();
            this.notify();
        }
    }
    
    renameLayer(layerId, newName) {
        const layer = this.getLayerById(layerId);
        if (layer) {
            const uniqueName = this.getUniqueLayerName(newName);
            layer.name = uniqueName;
            this.notify();
        }
    }
    
    lockLayer(layerId, locked = true) {
        const layer = this.getLayerById(layerId);
        if (layer) {
            layer.locked = locked;
            if (locked && this.activeLayerId === layerId) {
                const unlockedLayer = this.layers.find(l => !l.locked && l.id !== layerId);
                if (unlockedLayer) {
                    this.activeLayerId = unlockedLayer.id;
                }
            }
            this.notify();
        }
    }
    
    render() {
        this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        
        if (this.backgroundColor === 'white') {
            this.mainCtx.fillStyle = '#FFFFFF';
            this.mainCtx.fillRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        } else {
            this.drawTransparencyCheckerboard();
        }
        
        this.layers.forEach(layer => {
            if (!layer.visible) return;
            
            this.mainCtx.globalAlpha = layer.opacity;
            this.mainCtx.globalCompositeOperation = layer.blendMode;
            this.mainCtx.drawImage(layer.canvas, 0, 0);
        });
        
        // Reset
        this.mainCtx.globalAlpha = 1;
        this.mainCtx.globalCompositeOperation = 'normal';
    }
    
    drawTransparencyCheckerboard() {
        const size = 20;
        for (let y = 0; y < this.mainCanvas.height; y += size) {
            for (let x = 0; x < this.mainCanvas.width; x += size) {
                const isEven = ((x / size) + (y / size)) % 2 === 0;
                this.mainCtx.fillStyle = isEven ? '#E8E8E8' : '#FFFFFF';
                this.mainCtx.fillRect(x, y, size, size);
            }
        }
    }
    
    getActiveContext() {
        const activeLayer = this.getActiveLayer();
        return activeLayer ? activeLayer.ctx : null;
    }
    
    saveProject() {
        const project = {
            version: '1.0',
            canvasWidth: this.mainCanvas.width,
            canvasHeight: this.mainCanvas.height,
            backgroundColor: this.backgroundColor,
            layers: this.layers.map(l => l.serialize()),
            activeLayerId: this.activeLayerId,
            layerCounter: this.layerCounter,
            createdAt: Date.now()
        };
        
        const blob = new Blob([JSON.stringify(project)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `project_${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    loadProject(jsonData) {
        try {
            const project = JSON.parse(jsonData);
            
            if (!project.layers || !Array.isArray(project.layers)) {
                throw new Error('Invalid project format');
            }
            
            this.layers = [];
            
            project.layers.forEach(layerData => {
                const layer = Layer.deserialize(layerData);
                this.layers.push(layer);
            });
            
            this.activeLayerId = project.activeLayerId || this.layers[0].id;
            this.layerCounter = project.layerCounter || this.layers.length;
            this.backgroundColor = project.backgroundColor || 'transparent';
            
            this.render();
            this.notify();
            
            return true;
        } catch (error) {
            console.error('Failed to load project:', error);
            return false;
        }
    }
}
