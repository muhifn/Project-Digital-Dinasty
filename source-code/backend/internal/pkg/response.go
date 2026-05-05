package pkg

import (
	"encoding/json"
	"net/http"
)

// SuccessResponse is the standard success envelope.
type SuccessResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// ErrorResponse is the standard error envelope.
type ErrorResponse struct {
	Success bool              `json:"success"`
	Error   string            `json:"error"`
	Message string            `json:"message,omitempty"`
	Details []ValidationError `json:"details,omitempty"`
}

// ValidationError represents a single field validation error.
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// JSON writes a JSON response with the given status code.
func JSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

// Success writes a success JSON response.
func Success(w http.ResponseWriter, status int, message string, data interface{}) {
	JSON(w, status, SuccessResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// Error writes an error JSON response.
func Error(w http.ResponseWriter, status int, errMsg string) {
	JSON(w, status, ErrorResponse{
		Success: false,
		Error:   errMsg,
	})
}

// ErrorWithMessage writes an error JSON response with additional message.
func ErrorWithMessage(w http.ResponseWriter, status int, errMsg, message string) {
	JSON(w, status, ErrorResponse{
		Success: false,
		Error:   errMsg,
		Message: message,
	})
}

// ValidationFailed writes a 400 response with field-level errors.
func ValidationFailed(w http.ResponseWriter, errors []ValidationError) {
	JSON(w, http.StatusBadRequest, ErrorResponse{
		Success: false,
		Error:   "Validation failed",
		Details: errors,
	})
}
