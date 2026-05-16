import { useMutation } from "@tanstack/react-query";
import { api } from "../api";

export type SubscribeData = {
    email: string;
    name?: string;
};

export type SubscriberType = {
    id: number;
    email: string;
    name: string | null;
    is_subscribed: boolean;
    subscribed_at: string | null;
    unsubscribed_at: string | null;
    unsubscribe_token: string | null;
    last_promo_sent_at: string | null;
    created_at: string;
    updated_at: string;
};

async function subscribe(data: SubscribeData) {
    const response = await api<{ message: string; data: SubscriberType }>(
        "/api/newsletter/subscribe",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(data),
        },
    );
    return response;
}

export function useSubscribe() {
    return useMutation({
        mutationFn: subscribe,
    });
}

async function unsubscribe(token: string) {
    const response = await api<{ message: string }>(
        "/api/newsletter/unsubscribe",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ token }),
        },
    );
    return response;
}

export function useUnsubscribe() {
    return useMutation({
        mutationFn: unsubscribe,
    });
}

async function unsubscribeByEmail(email: string) {
    const response = await api<{ message: string }>(
        "/api/newsletter/unsubscribe/email",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ email }),
        },
    );
    return response;
}

export function useUnsubscribeByEmail() {
    return useMutation({
        mutationFn: unsubscribeByEmail,
    });
}
