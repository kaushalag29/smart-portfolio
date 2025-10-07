/**
 * 🚀 INTELLIGENT Gemini API Rate Limiter
 * 
 * Features:
 * - Adaptive Rate Limiting (slows down after errors)
 * - Progressive Exponential Backoff (longer waits after repeated failures)
 * - Request Smoothing (distributes requests evenly)
 * - Health Monitoring (tracks success rate)
 * 
 * Based on: https://ai.google.dev/gemini-api/docs/rate-limits
 */

interface RateLimitConfig {
  rpm: number; // Requests per minute
  rpd?: number; // Requests per day (optional)
}

interface HealthMetrics {
  successCount: number;
  errorCount: number;
  consecutiveErrors: number;
  lastErrorTime: number | null;
  adaptiveRpmMultiplier: number; // Multiplier to slow down requests
}

export class GeminiRateLimiter {
  /**
   * Rate limits for different models (Free Tier)
   * Using CONSERVATIVE values (80% of actual limits for safety margin)
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

  private static readonly DEFAULT_RATE_LIMIT: RateLimitConfig = { rpm: 3 };
  private static readonly MAX_RETRIES = 8; // Increased retries
  private static readonly BASE_DELAY = 2.0; // Doubled base delay
  private static readonly MAX_DELAY = 120.0; // Doubled max delay
  private static readonly CIRCUIT_OPEN_DURATION = 300000; // 5 minutes
  private static readonly QUOTA_EXHAUSTED_WAIT = 3600000; // 1 hour

  // Request history for each model (sliding window)
  private requestHistory: Map<string, number[]> = new Map();
  private lastRequestTime: Map<string, number> = new Map();
  
  // Health monitoring per model
  private healthMetrics: Map<string, HealthMetrics> = new Map();

  constructor() {
    // Rate limiter initialized
  }

  /**
   * Initialize health metrics for a model
   */
  private initHealthMetrics(modelName: string): void {
    if (!this.healthMetrics.has(modelName)) {
      this.healthMetrics.set(modelName, {
        successCount: 0,
        errorCount: 0,
        consecutiveErrors: 0,
        lastErrorTime: null,
        adaptiveRpmMultiplier: 1.0, // Start at normal speed
      });
    }
  }

  /**
   * Get health metrics for a model
   */
  private getHealthMetrics(modelName: string): HealthMetrics {
    this.initHealthMetrics(modelName);
    return this.healthMetrics.get(modelName)!;
  }

  /**
   * Adapt rate limiting based on error patterns
   */
  private adaptRateLimit(modelName: string): void {
    const metrics = this.getHealthMetrics(modelName);
    
    // Slow down after errors (less aggressive than before)
    if (metrics.consecutiveErrors > 0) {
      // Each consecutive error increases wait time
      metrics.adaptiveRpmMultiplier = 1 + (metrics.consecutiveErrors * 0.5);
      metrics.adaptiveRpmMultiplier = Math.min(metrics.adaptiveRpmMultiplier, 5); // Cap at 5x slower
    } else if (metrics.successCount > 5) {
      // Gradually speed up after sustained success
      metrics.adaptiveRpmMultiplier = Math.max(metrics.adaptiveRpmMultiplier * 0.8, 1.0);
    }
  }

  /**
   * Get the effective rate limit (RPM) for a specific model with adaptive adjustment
   */
  private getRateLimit(modelName: string): number {
    const normalized = modelName.toLowerCase();
    
    let baseRpm = GeminiRateLimiter.DEFAULT_RATE_LIMIT.rpm;
    
    // Exact match
    if (GeminiRateLimiter.MODEL_RATE_LIMITS[normalized]) {
      baseRpm = GeminiRateLimiter.MODEL_RATE_LIMITS[normalized].rpm;
    } else {
      // Partial match
      for (const [key, config] of Object.entries(GeminiRateLimiter.MODEL_RATE_LIMITS)) {
        if (normalized.includes(key)) {
          baseRpm = config.rpm;
          break;
        }
      }
    }

    // Apply adaptive throttling
    const metrics = this.getHealthMetrics(modelName);
    const effectiveRpm = baseRpm / metrics.adaptiveRpmMultiplier;
    return Math.max(effectiveRpm, 1); // Never go below 1 RPM
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
   * Wait if necessary to stay within rate limits (proactive rate limiting with adaptive throttling)
   */
  private async waitIfNeeded(modelName: string): Promise<void> {
    const metrics = this.getHealthMetrics(modelName);
    
    // Adaptive rate limiting
    this.adaptRateLimit(modelName);
    const rateLimit = this.getRateLimit(modelName); // Gets adaptive rate
    
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
        await this.sleep(waitTime);
        this.cleanOldRequests(modelName);
      }
    }

    // Add GENEROUS minimum spacing between requests (adaptive)
    const baseSpacing = 60000 / rateLimit; // milliseconds
    const adaptiveSpacing = baseSpacing * metrics.adaptiveRpmMultiplier;
    const lastRequest = this.lastRequestTime.get(modelName);

    if (lastRequest) {
      const timeSinceLast = currentTime - lastRequest;
      if (timeSinceLast < adaptiveSpacing) {
        const spacingWait = adaptiveSpacing - timeSinceLast;
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
   * Calculate PROGRESSIVE exponential backoff with jitter (longer waits for repeated failures)
   */
  private exponentialBackoffWait(attempt: number, consecutiveErrors: number): number {
    // Base exponential: base * 2^attempt
    let waitTime = GeminiRateLimiter.BASE_DELAY * Math.pow(2, attempt);
    
    // Add penalty for consecutive errors (makes backoff more aggressive)
    const errorPenalty = Math.pow(1.5, Math.min(consecutiveErrors, 5));
    waitTime *= errorPenalty;
    
    // Add jitter (randomness) to prevent thundering herd
    const jitter = Math.random() * waitTime * 0.3; // 0-30% jitter
    waitTime += jitter;
    
    // Cap at maximum delay
    waitTime = Math.min(waitTime, GeminiRateLimiter.MAX_DELAY);
    
    return waitTime;
  }

  /**
   * Record successful request
   */
  private recordSuccess(modelName: string): void {
    const metrics = this.getHealthMetrics(modelName);
    metrics.successCount++;
    metrics.consecutiveErrors = 0; // Reset on success
  }

  /**
   * Record error
   */
  private recordError(modelName: string): void {
    const metrics = this.getHealthMetrics(modelName);
    metrics.errorCount++;
    metrics.consecutiveErrors++;
    metrics.lastErrorTime = Date.now();
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute an API call with INTELLIGENT rate limiting and adaptive backoff
   * ALWAYS does 8 retry attempts with progressive backoff
   */
  async execute<T>(
    modelName: string,
    apiCall: () => Promise<T>,
    maxRetries: number = GeminiRateLimiter.MAX_RETRIES
  ): Promise<T> {
    const metrics = this.getHealthMetrics(modelName);
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Proactive rate limiting
        await this.waitIfNeeded(modelName);

        // Make the API call
        const attemptInfo = `[${attempt + 1}/${maxRetries}]`;
        const result = await apiCall();

        // Record successful request
        this.recordRequest(modelName);
        this.recordSuccess(modelName);

        return result;

      } catch (error: any) {
        lastError = error;
        
        // Record error (no special handling for quota)
        this.recordError(modelName);
        
        // Detect error types
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

        // Always retry with progressive backoff
        if (isRateLimitError || isServiceUnavailable) {
          if (attempt < maxRetries - 1) {
            const waitTime = this.exponentialBackoffWait(attempt, metrics.consecutiveErrors);
            await this.sleep(waitTime * 1000);
          } else {
            console.error(`${modelName}: Max retries exhausted. ${error.message}`);
            throw error;
          }
        } else {
          // Non-retryable error
          console.error(`${modelName}: Non-retryable error - ${error.message}`);
          throw error;
        }
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error('Unknown error: all retries exhausted');
  }

  /**
   * Get comprehensive rate limiter statistics with health metrics
   */
  getStats(modelName?: string): any {
    if (modelName) {
      this.cleanOldRequests(modelName);
      const requestsInWindow = (this.requestHistory.get(modelName) || []).length;
      const rateLimit = this.getRateLimit(modelName);
      const metrics = this.getHealthMetrics(modelName);

      return {
        model: modelName,
        requestsInLastMinute: requestsInWindow,
        effectiveRpmLimit: Math.floor(rateLimit),
        utilizationPercent: rateLimit > 0 ? (requestsInWindow / rateLimit * 100).toFixed(2) : 0,
        health: {
          successCount: metrics.successCount,
          errorCount: metrics.errorCount,
          consecutiveErrors: metrics.consecutiveErrors,
          successRate: metrics.successCount + metrics.errorCount > 0 
            ? ((metrics.successCount / (metrics.successCount + metrics.errorCount)) * 100).toFixed(1) 
            : '100.0',
          adaptiveThrottling: `${metrics.adaptiveRpmMultiplier.toFixed(1)}x slower`,
        }
      };
    } else {
      const stats: any = {};
      for (const model of this.healthMetrics.keys()) {
        stats[model] = this.getStats(model);
      }
      return stats;
    }
  }

  /**
   * Print a beautiful health report
   */
  printHealthReport(): void {
    // Health report available via getStats() for each model
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
