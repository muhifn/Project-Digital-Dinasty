package pkg

import (
	"regexp"
	"strings"
	"unicode/utf8"
)

var htmlTagRe = regexp.MustCompile(`<[^>]*>`)

// StripHTMLTags removes all HTML tags from a string.
func StripHTMLTags(s string) string {
	return htmlTagRe.ReplaceAllString(s, "")
}

// SanitizePlainText strips HTML, collapses whitespace, and trims.
func SanitizePlainText(s string) string {
	s = StripHTMLTags(s)
	// Collapse multiple whitespace into single space
	spaceRe := regexp.MustCompile(`\s+`)
	s = spaceRe.ReplaceAllString(s, " ")
	return strings.TrimSpace(s)
}

// ValidateStringLength checks if a string is within min/max rune length.
func ValidateStringLength(s string, min, max int) bool {
	n := utf8.RuneCountInString(s)
	return n >= min && n <= max
}

// IsValidUUID checks if a string looks like a UUID v4.
var uuidRe = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)

func IsValidUUID(s string) bool {
	return uuidRe.MatchString(s)
}

// IsValidPhone validates Indonesian phone numbers (08xx, +62xx, 62xx).
var phoneRe = regexp.MustCompile(`^(\+62|62|08)\d{8,13}$`)

func IsValidPhone(s string) bool {
	return phoneRe.MatchString(s)
}

// IsValidEmail performs a basic email format check.
var emailRe = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

func IsValidEmail(s string) bool {
	return emailRe.MatchString(s)
}
