# Implementation — add-retry-logic

Added exponential backoff with jitter to src/api/client.js.
3 retries max, 5xx only, base 250ms.
