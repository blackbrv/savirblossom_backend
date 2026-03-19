import { APIError, APIErrorResponse } from "./ApiTypes";

export const BASE_URL = "http://localhost:8000";

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
    const headers = new Headers(options?.headers);

    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    // Ensure the Accept header is set
    if (!headers.has("Accept")) {
        headers.set("Accept", "application/json");
    }

    //headers.set("Origin", window.location.origin);

    const res = await fetch(`${BASE_URL}${path}`, {
        headers,
        ...options,
        //redirect: "manual",
    });

    if (!res.ok) {
        let errorBody: APIErrorResponse | undefined;
        try {
            errorBody = await res.json();
        } catch {
            // Fallback to plain text if JSON parsing fails
        }

        throw new APIError(
            errorBody?.message || "API Error",
            res.status,
            errorBody,
        );
    }

    return res.json();
}
