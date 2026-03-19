export interface APIErrorResponse {
    message?: string;
    [key: string]: unknown;
}

export class APIError extends Error {
    status: number;
    data?: APIErrorResponse;

    constructor(message: string, status: number, data?: APIErrorResponse) {
        super(message);
        this.name = "APIError";
        this.status = status;
        this.data = data;
    }
}
