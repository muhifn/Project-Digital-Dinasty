/**
 * Remove HTML tags from untrusted text input.
 *
 * This is a defensive plain-text sanitizer for values that are expected
 * to be stored/rendered as text (not HTML).
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, " ");
}

/**
 * Convert untrusted input to safe plain text by stripping tags,
 * collapsing extra whitespace, and trimming.
 */
export function sanitizePlainText(input: string): string {
  return stripHtmlTags(input).replace(/\s+/g, " ").trim();
}
