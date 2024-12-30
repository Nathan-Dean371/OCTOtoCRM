// This class extends the built-in Error class to add specific information about API errors
export class APIError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public originalError?: any
    ) {
        super(message);
        this.name = 'APIError';
        
        // This ensures proper stack traces in TypeScript
        Object.setPrototypeOf(this, APIError.prototype);
    }
}

// This class handles specific Ventrata API errors
export class VentrataAPIError extends APIError {
    constructor(
        statusCode: number,
        message: string,
        public errorCode?: string,
        originalError?: any
    ) {
        super(statusCode, message, originalError);
        this.name = 'VentrataAPIError';
    }
}