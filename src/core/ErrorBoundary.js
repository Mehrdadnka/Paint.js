// src/core/ErrorBoundary.js
export class ErrorBoundary {
    constructor() {
        this.errorHandlers = new Map();
        this.fallbackUI = null;
        this.init();
    }
    
    init() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'global');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'promise');
        });
    }
    
    wrap(fn, context = 'unknown') {
        return (...args) => {
            try {
                return fn.apply(this, args);
            } catch (error) {
                this.handleError(error, context);
                return null;
            }
        };
    }
    
    async wrapAsync(fn, context = 'unknown') {
        try {
            return await fn();
        } catch (error) {
            this.handleError(error, context);
            return null;
        }
    }
    
    handleError(error, context) {
        console.error(`[ErrorBoundary] ${context}:`, error);
        
        // Log to analytics (if available)
        this.logError(error, context);
        
        // Show fallback UI for critical errors
        if (this.isCriticalError(error)) {
            this.showFallbackUI(error);
        }
        
        // Notify registered handlers
        const handlers = this.errorHandlers.get(context) || [];
        handlers.forEach(handler => handler(error));
        
        // Attempt recovery
        this.attemptRecovery(context);
    }
    
    onError(context, handler) {
        if (!this.errorHandlers.has(context)) {
            this.errorHandlers.set(context, []);
        }
        this.errorHandlers.get(context).push(handler);
    }
    
    isCriticalError(error) {
        const criticalPatterns = [
            'canvas',
            'context',
            'layer',
            'engine',
            'initialization'
        ];
        
        return criticalPatterns.some(pattern => 
            error.message?.toLowerCase().includes(pattern)
        );
    }
    
    showFallbackUI(error) {
        // Remove existing fallback if any
        if (this.fallbackUI) {
            this.fallbackUI.remove();
        }
        
        this.fallbackUI = document.createElement('div');
        this.fallbackUI.className = 'error-fallback';
        this.fallbackUI.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #1e1e1e;
                border: 2px solid #e02020;
                border-radius: 12px;
                padding: 30px;
                color: white;
                text-align: center;
                z-index: 10000;
                max-width: 500px;
                width: 90%;
            ">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e02020; margin-bottom: 16px;"></i>
                <h2 style="margin: 0 0 12px 0;">Something went wrong</h2>
                <p style="color: #999; margin: 0 0 20px 0;">
                    ${error.message || 'An unexpected error occurred'}
                </p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button onclick="location.reload()" style="
                        padding: 10px 24px;
                        background: #0078d4;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Reload Application</button>
                    <button onclick="this.closest('.error-fallback').remove()" style="
                        padding: 10px 24px;
                        background: transparent;
                        color: white;
                        border: 1px solid #666;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Dismiss</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.fallbackUI);
    }
    
    logError(error, context) {
        const errorLog = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        // Store in localStorage for debugging
        const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
        errors.push(errorLog);
        localStorage.setItem('error_logs', JSON.stringify(errors.slice(-50))); // Keep last 50
    }
    
    attemptRecovery(context) {
        switch(context) {
            case 'canvas':
                this.reinitializeCanvas();
                break;
            case 'engine':
                this.reinitializeEngine();
                break;
            case 'layer':
                this.recoverLayers();
                break;
        }
    }
    
    reinitializeCanvas() {
        const canvas = document.getElementById('canvas1');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    reinitializeEngine() {
        // Dispatch custom event for engine reinitialization
        window.dispatchEvent(new CustomEvent('engine:reinitialize'));
    }
    
    recoverLayers() {
        window.dispatchEvent(new CustomEvent('layers:recover'));
    }
}
