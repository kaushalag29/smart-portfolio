/**
 * Gemini API Rate Limiter with Sliding Window and Exponential Backoff
 * 
 * This module provides a robust rate limiting solution for Google Gemini API calls
 * that prevents hitting rate limits proactively while handling errors gracefully.
 * 
 * Based on official rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
 */

interface RateLimitConfig {
  rpm: number; // Requests per minute
  rpd?: number; // Requests per day (optional)
}

export class GeminiRateLimiter {
  /**
   * Rate limits for different models (Free Tier)
   * Source: https://ai.google.dev/gemini-api/docs/rate-limits#current-rate-limits
   */
  private static readonly MODEL_RATE_LIMITS: Record<string, RateLimitConfig> = {
    // Chat models
    'gemini-2.5-flash-lite': { rpm: 15 },
    'gemini-2.5-flash': { rpm: 10 },
    'gemini-2.5-pro': { rpm: 5 },
    'gemini-2.0-flash': { rpm: 15 },
    'gemini-2.0-flash-lite': { rpm: 30 },
    'gemini-1.5-flash': { rpm: 15 },
    'gemini-1.5-pro': { rpm: 2 },
    
    // Embedding models
    'gemini-embedding-001': { rpm: 100 }, // Higher limit for embeddings
    'text-embedding-004': { rpm: 100 },
  };

  private static readonly DEFAULT_RATE_LIMIT: RateLimitConfig = { rpm: 5 };
  private static readonly MAX_RETRIES = 5;
  private static readonly BASE_DELAY = 1.0; // seconds
  private static readonly MAX_DELAY = 60.0; // seconds

  // Request history for each model (sliding window)
  private requestHistory: Map<string, number[]> = new Map();
  private lastRequestTime: Map<string, number> = new Map();

  constructor() {
    console.log('[GeminiRateLimiter] Initialized with model-specific rate limits');
  }

  /**
   * Get the rate limit (RPM) for a specific model
   */
  private getRateLimit(modelName: string): number {
    const normalized = modelName.toLowerCase();
    
    // Exact match
    if (GeminiRateLimiter.MODEL_RATE_LIMITS[normalized]) {
      return GeminiRateLimiter.MODEL_RATE_LIMITS[normalized].rpm;
    }

    // Partial match (e.g., "gemini-2.5-flash" in "gemini-2.5-flash-preview")
    for (const [key, config] of Object.entries(GeminiRateLimiter.MODEL_RATE_LIMITS)) {
      if (normalized.includes(key)) {
        return config.rpm;
      }
    }

    console.warn(`[GeminiRateLimiter] Model '${modelName}' not found. Using conservative default: ${GeminiRateLimiter.DEFAULT_RATE_LIMIT.rpm} RPM`);
    return GeminiRateLimiter.DEFAULT_RATE_LIMIT.rpm;
  }

  /**
   * Remove request timestamps older than 60 seconds (sliding window)
   */
  private cleanOldRequests(modelName: string): void {
    const history = this.requestHistory.get(modelName) || [];
    const currentTime = Date.now();
    const cutoffTime = currentTime - 60000; // 60 seconds in milliseconds

    const filteredHistory = history.filter(timestamp => timestamp >= cutoffTime);
    this.requestHistory.set(modelName, filteredHistory);
  }

  /**
   * Wait if necessary to stay within rate limits (proactive rate limiting)
   */
  private async waitIfNeeded(modelName: string): Promise<void> {
    const rateLimit = this.getRateLimit(modelName);
    
    // Clean old requests first
    this.cleanOldRequests(modelName);

    const history = this.requestHistory.get(modelName) || [];
    const currentTime = Date.now();

    // Check if we're at the rate limit
    if (history.length >= rateLimit) {
      const oldestRequest = history[0];
      const timeSinceOldest = currentTime - oldestRequest;
      const waitTime = 60000 - timeSinceOldest; // milliseconds

      if (waitTime > 0) {
        console.log(`[GeminiRateLimiter] Rate limit reached for ${modelName} (${rateLimit} RPM). Waiting ${(waitTime / 1000).toFixed(2)}s...`);
        await this.sleep(waitTime);
        this.cleanOldRequests(modelName);
      }
    }

    // Add minimum spacing between requests to avoid bursts
    const minSpacing = 60000 / rateLimit; // milliseconds
    const lastRequest = this.lastRequestTime.get(modelName);

    if (lastRequest) {
      const timeSinceLast = currentTime - lastRequest;
      if (timeSinceLast < minSpacing) {
        const spacingWait = minSpacing - timeSinceLast;
        console.log(`[GeminiRateLimiter] Applying minimum spacing: waiting ${(spacingWait / 1000).toFixed(2)}s`);
        await this.sleep(spacingWait);
      }
    }
  }

  /**
   * Record a request timestamp for rate tracking
   */
  private recordRequest(modelName: string): void {
    const currentTime = Date.now();
    const history = this.requestHistory.get(modelName) || [];
    history.push(currentTime);
    this.requestHistory.set(modelName, history);
    this.lastRequestTime.set(modelName, currentTime);
  }

  /**
   * Calculate exponential backoff wait time with jitter
   */
  private exponentialBackoffWait(attempt: number): number {
    // Exponential: base * 2^attempt
    let waitTime = GeminiRateLimiter.BASE_DELAY * Math.pow(2, attempt);
    
    // Add jitter (randomness) to prevent thundering herd
    const jitter = Math.random() * waitTime * 0.3; // 0-30% jitter
    waitTime += jitter;
    
    // Cap at maximum delay
    return Math.min(waitTime, GeminiRateLimiter.MAX_DELAY);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute an API call with rate limiting and exponential backoff
   */
  async execute<T>(
    modelName: string,
    apiCall: () => Promise<T>,
    maxRetries: number = GeminiRateLimiter.MAX_RETRIES
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Proactive rate limiting (wait if needed before making request)
        await this.waitIfNeeded(modelName);

        // Make the API call
        console.log(`[GeminiRateLimiter] Making API call (attempt ${attempt + 1}/${maxRetries}) for model: ${modelName}`);
        const result = await apiCall();

        // Record successful request
        this.recordRequest(modelName);

        return result;

      } catch (error: any) {
        lastError = error;
        const isRateLimitError = 
          error?.message?.includes('429') || 
          error?.message?.includes('RESOURCE_EXHAUSTED') ||
          error?.message?.includes('rate limit') ||
          error?.status === 429 ||
          error?.code === 429;

        const isServiceUnavailable = 
          error?.message?.includes('503') || 
          error?.message?.includes('SERVICE_UNAVAILABLE') ||
          error?.status === 503 ||
          error?.code === 503;

        if (isRateLimitError) {
          console.warn(`[GeminiRateLimiter] Rate limit error on attempt ${attempt + 1}/${maxRetries}: ${error.message}`);
          
          if (attempt < maxRetries - 1) {
            const waitTime = this.exponentialBackoffWait(attempt);
            console.log(`[GeminiRateLimiter] Backing off for ${waitTime.toFixed(2)}s before retry...`);
            await this.sleep(waitTime * 1000);
          } else {
            console.error(`[GeminiRateLimiter] Max retries (${maxRetries}) exhausted for rate limit errors`);
            throw error;
          }
        } else if (isServiceUnavailable) {
          console.warn(`[GeminiRateLimiter] Service unavailable on attempt ${attempt + 1}/${maxRetries}: ${error.message}`);
          
          if (attempt < maxRetries - 1) {
            const waitTime = this.exponentialBackoffWait(attempt);
            console.log(`[GeminiRateLimiter] Backing off for ${waitTime.toFixed(2)}s before retry...`);
            await this.sleep(waitTime * 1000);
          } else {
            console.error(`[GeminiRateLimiter] Max retries (${maxRetries}) exhausted for service unavailable errors`);
            throw error;
          }
        } else {
          // Non-retryable error
          console.error(`[GeminiRateLimiter] Non-retryable error: ${error.message}`);
          throw error;
        }
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error('Unknown error: all retries exhausted');
  }

  /**
   * Get rate limiter statistics
   */
  getStats(modelName?: string): any {
    if (modelName) {
      this.cleanOldRequests(modelName);
      const requestsInWindow = (this.requestHistory.get(modelName) || []).length;
      const rateLimit = this.getRateLimit(modelName);

      return {
        model: modelName,
        requestsInLastMinute: requestsInWindow,
        rateLimitRpm: rateLimit,
        utilizationPercent: rateLimit > 0 ? (requestsInWindow / rateLimit * 100).toFixed(2) : 0
      };
    } else {
      const stats: any = {};
      for (const model of this.requestHistory.keys()) {
        stats[model] = this.getStats(model);
      }
      return stats;
    }
  }
}

// Singleton instance for easy access
let globalLimiter: GeminiRateLimiter | null = null;

export function getGlobalRateLimiter(): GeminiRateLimiter {
  if (!globalLimiter) {
    globalLimiter = new GeminiRateLimiter();
  }
  return globalLimiter;
}

export function resetGlobalRateLimiter(): void {
  globalLimiter = null;
}
