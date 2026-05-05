package service

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/muhifn/rdp-api/internal/model"
)

// StockService manages SSE subscriptions and broadcasts stock updates.
type StockService struct {
	mu          sync.RWMutex
	subscribers map[chan []byte]struct{}
	maxConns    int
	done        chan struct{}
}

func NewStockService() *StockService {
	return &StockService{
		subscribers: make(map[chan []byte]struct{}),
		maxConns:    120,
		done:        make(chan struct{}),
	}
}

// Subscribe creates a new SSE subscriber channel.
// Returns nil if max connections exceeded.
func (s *StockService) Subscribe() chan []byte {
	s.mu.Lock()
	defer s.mu.Unlock()

	if len(s.subscribers) >= s.maxConns {
		return nil
	}

	ch := make(chan []byte, 16)
	s.subscribers[ch] = struct{}{}
	return ch
}

// Unsubscribe removes a subscriber channel.
func (s *StockService) Unsubscribe(ch chan []byte) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.subscribers[ch]; ok {
		delete(s.subscribers, ch)
		close(ch)
	}
}

// ActiveConnections returns the current number of SSE subscribers.
func (s *StockService) ActiveConnections() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.subscribers)
}

// Broadcast sends stock updates to all subscribers.
func (s *StockService) Broadcast(updates []model.StockUpdate) {
	if len(updates) == 0 {
		return
	}

	data, err := json.Marshal(updates)
	if err != nil {
		log.Printf("Failed to marshal stock updates: %v", err)
		return
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	for ch := range s.subscribers {
		select {
		case ch <- data:
		default:
			// Subscriber is slow, drop update to avoid blocking
		}
	}
}

// BroadcastSingle broadcasts a single stock update.
func (s *StockService) BroadcastSingle(update model.StockUpdate) {
	s.Broadcast([]model.StockUpdate{update})
}

// Shutdown closes the done channel to signal all goroutines to stop.
func (s *StockService) Shutdown() {
	close(s.done)

	s.mu.Lock()
	defer s.mu.Unlock()

	for ch := range s.subscribers {
		delete(s.subscribers, ch)
		close(ch)
	}
}

// Done returns a channel that's closed when the service shuts down.
func (s *StockService) Done() <-chan struct{} {
	return s.done
}

// HeartbeatInterval returns the heartbeat interval for SSE connections.
func (s *StockService) HeartbeatInterval() time.Duration {
	return 30 * time.Second
}

// ConnectionTimeout returns the max duration for an SSE connection.
func (s *StockService) ConnectionTimeout() time.Duration {
	return 10 * time.Minute
}
