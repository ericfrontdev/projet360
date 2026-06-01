import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Ne pas initialiser Redis si les variables d'environnement sont absentes
const redis = url && token ? new Redis({ url, token }) : null;

function makeLimiter(options: { window: string; max: number; prefix: string }) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(options.max, options.window as Parameters<typeof Ratelimit.slidingWindow>[1]),
    prefix: options.prefix,
  });
}

// Auth endpoints (login, register, invitations) — 10 req / 1 min par IP
export const authLimiter = makeLimiter({ max: 10, window: "1 m", prefix: "rl:auth" });

// Write API endpoints (POST/PATCH/DELETE) — 60 req / 1 min par IP
export const apiWriteLimiter = makeLimiter({ max: 60, window: "1 m", prefix: "rl:api" });

// Avatar upload — 5 req / 5 min par IP
export const uploadLimiter = makeLimiter({ max: 5, window: "5 m", prefix: "rl:upload" });
