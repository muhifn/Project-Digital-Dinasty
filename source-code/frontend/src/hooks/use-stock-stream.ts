"use client";

import { useEffect, useRef } from "react";
import { useStockStore } from "@/stores/stock-store";
import type { StockUpdateEvent } from "@/types";

const SSE_URL = "/api/stock/stream";
const POLL_URL = "/api/stock/snapshot";
const MAX_SSE_FAILURES = 3;
const POLL_INTERVAL_MS = 30_000;
const INITIAL_RECONNECT_MS = 1_000;
const MAX_RECONNECT_MS = 30_000;

/**
 * Custom hook that connects to the SSE stock stream and keeps
 * the stock store in sync with real-time stock changes.
 *
 * Falls back to polling if SSE fails repeatedly.
 */
export function useStockStream() {
  const applyUpdates = useStockStore((s) => s.applyUpdates);
  const failureCountRef = useRef(0);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_MS);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    function handleStockUpdates(updates: StockUpdateEvent[]) {
      if (!mountedRef.current || updates.length === 0) return;

      applyUpdates(updates);
    }

    function connectSSE() {
      if (!mountedRef.current) return;

      // Clean up any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const es = new EventSource(SSE_URL);
      eventSourceRef.current = es;

      es.addEventListener("stock-update", (event: MessageEvent) => {
        try {
          const updates: StockUpdateEvent[] = JSON.parse(event.data);
          handleStockUpdates(updates);
          // Reset failure tracking on successful message
          failureCountRef.current = 0;
          reconnectDelayRef.current = INITIAL_RECONNECT_MS;
        } catch (error) {
          console.error("[use-stock-stream] Failed to parse SSE event:", error);
        }
      });

      es.addEventListener("open", () => {
        // Connection established — stop polling fallback if active
        stopPolling();
        failureCountRef.current = 0;
        reconnectDelayRef.current = INITIAL_RECONNECT_MS;
      });

      es.addEventListener("error", () => {
        es.close();
        eventSourceRef.current = null;
        failureCountRef.current += 1;

        if (!mountedRef.current) return;

        if (failureCountRef.current >= MAX_SSE_FAILURES) {
          // Switch to polling fallback
          console.warn(
            `[use-stock-stream] SSE failed ${failureCountRef.current} times, switching to polling fallback`
          );
          startPolling();
        } else {
          // Exponential backoff reconnect
          const delay = Math.min(reconnectDelayRef.current, MAX_RECONNECT_MS);
          reconnectTimerRef.current = setTimeout(() => {
            connectSSE();
          }, delay);
          reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_MS);
        }
      });
    }

    async function pollStockSnapshot() {
      if (!mountedRef.current) return;

      try {
        const response = await fetch(POLL_URL);

        if (!response.ok) return;

        const json = await response.json();

        // Go API wraps in { success, data: { updates } }
        const payload = json.data ?? json;

        if (Array.isArray(payload.updates)) {
          handleStockUpdates(payload.updates as StockUpdateEvent[]);
        }

        // Try reconnecting SSE after a successful poll
        failureCountRef.current = 0;
        reconnectDelayRef.current = INITIAL_RECONNECT_MS;
        stopPolling();
        connectSSE();
      } catch {
        // Polling failed — continue polling
      }
    }

    function startPolling() {
      if (pollTimerRef.current) return;
      pollStockSnapshot(); // Immediate first poll
      pollTimerRef.current = setInterval(pollStockSnapshot, POLL_INTERVAL_MS);
    }

    function stopPolling() {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }

    // Start SSE connection
    connectSSE();

    return () => {
      mountedRef.current = false;

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      stopPolling();
    };
  }, [applyUpdates]);
}
