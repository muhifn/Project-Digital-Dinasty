package handler

import (
	"fmt"
	"net/http"
	"time"

	"github.com/muhifn/rdp-api/internal/pkg"
	"github.com/muhifn/rdp-api/internal/service"
)

type StockHandler struct {
	stockSvc   *service.StockService
	productSvc *service.ProductService
}

func NewStockHandler(stockSvc *service.StockService, productSvc *service.ProductService) *StockHandler {
	return &StockHandler{
		stockSvc:   stockSvc,
		productSvc: productSvc,
	}
}

// Stream handles GET /api/stock/stream (SSE)
func (h *StockHandler) Stream(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		pkg.Error(w, http.StatusInternalServerError, "Streaming not supported")
		return
	}

	// Subscribe to stock updates
	ch := h.stockSvc.Subscribe()
	if ch == nil {
		w.Header().Set("Retry-After", "30")
		pkg.Error(w, http.StatusTooManyRequests, "Too many SSE connections")
		return
	}
	defer h.stockSvc.Unsubscribe(ch)

	// Set SSE headers
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no") // Nginx: disable buffering
	w.WriteHeader(http.StatusOK)
	flusher.Flush()

	heartbeat := time.NewTicker(h.stockSvc.HeartbeatInterval())
	defer heartbeat.Stop()

	timeout := time.NewTimer(h.stockSvc.ConnectionTimeout())
	defer timeout.Stop()

	for {
		select {
		case <-r.Context().Done():
			// Client disconnected
			return

		case <-h.stockSvc.Done():
			// Server shutting down
			return

		case <-timeout.C:
			// Connection timeout
			return

		case <-heartbeat.C:
			// Send heartbeat
			fmt.Fprintf(w, ":heartbeat\n\n")
			flusher.Flush()

		case data, ok := <-ch:
			if !ok {
				return
			}
			fmt.Fprintf(w, "event: stock-update\ndata: %s\n\n", data)
			flusher.Flush()
		}
	}
}

// Snapshot handles GET /api/stock/snapshot
func (h *StockHandler) Snapshot(w http.ResponseWriter, r *http.Request) {
	updates, err := h.productSvc.GetStockSnapshot(r.Context())
	if err != nil {
		pkg.Error(w, http.StatusInternalServerError, "Failed to fetch stock snapshot")
		return
	}

	pkg.Success(w, http.StatusOK, "", map[string]interface{}{
		"updates": updates,
	})
}
