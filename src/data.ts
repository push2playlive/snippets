/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodeBlueprint } from "./types";

export const INITIAL_BLUEPRINTS: { [key: string]: CodeBlueprint } = {
  react_ts_debounce: {
    id: "react_ts_debounce",
    name: "Debounce UI Filter Hook",
    description: "Highly optimized React debouncing utility paired with a search query filter and axios request interceptor for API synchronization.",
    category: "React/TS",
    language: "typescript",
    entryPoint: "src/interceptor.ts",
    buildCmd: "npm run build",
    runCmd: "npm run dev",
    tags: ["Frontend", "Utility", "React"],
    files: {
      "src/useDebounce.ts": {
        name: "useDebounce.ts",
        language: "typescript",
        content: `import { useState, useEffect } from "react";

/**
 * Custom hook to debounce rapid value mutations (e.g. keyboard typing)
 * to throttle downstream API triggers and save bandwidth.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
`
      },
      "src/FilterPage.tsx": {
        name: "FilterPage.tsx",
        language: "typescript",
        content: `import React, { useState } from "react";
import { useDebounce } from "./useDebounce";

export default function FilterPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  return (
    <div className="p-4 bg-canvas-card rounded-xl border border-canvas-border">
      <h3 className="font-sans font-bold text-lg text-white mb-2">Live Search Filter</h3>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Type to search..."
        className="w-full bg-[#181920] border border-canvas-border px-3 py-2 rounded text-sm text-white"
      />
      <div className="mt-3 text-xs text-gray-400">
        Debounced Search Trigger: <span className="text-lang-blue-active font-mono font-bold">"{debouncedSearch}"</span>
      </div>
    </div>
  );
}
`
      },
      "src/interceptor.ts": {
        name: "interceptor.ts",
        language: "typescript",
        content: `/**
 * Axios API sync interceptor with active credential verification.
 * Note: There is a syntactical/layout typo here for diagnostic testing.
 */

interface RequestConfig {
  headers: Record<string, string>;
  url: string;
}

// Typo 'functon' introduced for testing the Safe Fix-It loop!
functon requestInterceptor(config: RequestConfig): RequestConfig {
  const token = localStorage.getItem("auth_token") || "GUEST_SECURE_TOKEN";
  
  if (token) {
    config.headers["Authorization"] = \`Bearer \${token}\`;
  }
  
  console.log(\`[Sync Interceptor] Dispatching request to \${config.url}\`);
  return config;
}

export function setupSyncAPI() {
  const dummyRequest: RequestConfig = {
    headers: {},
    url: "https://api.snippets.live/v1/sync"
  };

  const processed = requestInterceptor(dummyRequest);
  return processed;
}
`
      }
    }
  },

  rust_cache_server: {
    id: "rust_cache_server",
    name: "Rust Warp Cache Microservice",
    description: "High-concurrency Warp HTTP router featuring safe static cache state management and custom log parser.",
    category: "Rust API",
    language: "rust",
    entryPoint: "src/main.rs",
    buildCmd: "cargo build",
    runCmd: "cargo run",
    tags: ["API", "Database", "Backend"],
    files: {
      "src/main.rs": {
        name: "main.rs",
        language: "rust",
        content: `// Rust HTTP Server Entrypoint with memory caching state.
// Note: Includes an intentional syntax typo to trigger the AI Fix-It Loop.

mod cache;
mod parser;

use cache::ThreadSafeCache;
use std::sync::Arc;

fn main() {
    println!("[Rust Sandbox] Initializing Warp HTTP Server on port 8080...");
    let cache_engine = Arc::new(ThreadSafeCache::new());
    
    // Unbalanced parenthesis / missing semicolon typo here for testing:
    cache_engine.insert("health", "OK")
    
    println!("[Rust Sandbox] Server compiled and routing successfully.");
}
`
      },
      "src/cache.rs": {
        name: "cache.rs",
        language: "rust",
        content: `use std::collections::HashMap;
use std::sync::Mutex;

pub struct ThreadSafeCache {
    store: Mutex<HashMap<String, String>>,
}

impl ThreadSafeCache {
    pub fn new() -> Self {
        ThreadSafeCache {
            store: Mutex::new(HashMap::new()),
        }
    }

    pub fn insert(&self, key: &str, value: &str) {
        let mut map = self.store.lock().unwrap();
        map.insert(key.to_string(), value.to_string());
    }

    pub fn get(&self, key: &str) -> Option<String> {
        let map = self.store.lock().unwrap();
        map.get(key).cloned()
    }
}
`
      },
      "src/parser.rs": {
        name: "parser.rs",
        language: "rust",
        content: `/// Custom JSON/Log payload parser for diagnostic reporting
pub struct LogParser;

impl LogParser {
    pub fn parse_log(raw_line: &str) -> Option<String> {
        if raw_line.contains("[ERROR]") {
            let parts: Vec<&str> = raw_line.split("[ERROR]").collect();
            Some(format!("Trap: {}", parts.get(1)?.trim()))
        } else {
            None
        }
    }
}
`
      }
    }
  },

  node_jwt_auth: {
    id: "node_jwt_auth",
    name: "Node.js JWT Middleware Hub",
    description: "JWT token validation and Express rate-limiter middleware securing persistent database transaction pools.",
    category: "React/TS", // Using "Node.js" internally, color mapped to Green
    language: "javascript",
    entryPoint: "server/middleware.js",
    buildCmd: "npm run build",
    runCmd: "npm run start",
    tags: ["API", "Security", "Middleware"],
    files: {
      "server/middleware.js": {
        name: "middleware.js",
        language: "javascript",
        content: `// JWT Validation & Authorization Interceptor
// Note: Contains an intentional scope reference bug.

const jwt = require("jsonwebtoken");

function authorizeToken(req, res, next) {
  // Syntax bug: Using "constt" instead of "const"
  constt authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing credential token" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "DEV_SECRET", (err, user) => {
    if (err) return res.status(403).json({ error: "Token is no longer valid" });
    req.user = user;
    next();
  });
}

module.exports = { authorizeToken };
`
      },
      "server/limiter.js": {
        name: "limiter.js",
        language: "javascript",
        content: `// Simple in-memory client rate limiter to protect public endpoints
const requestCounts = new Map();

function rateLimiter(req, res, next) {
  const ip = req.ip || "127.0.0.1";
  const now = Date.now();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + 60000 });
  } else {
    const data = requestCounts.get(ip);
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + 60000;
    } else {
      data.count++;
    }

    if (data.count > 100) {
      return res.status(429).json({ error: "Too many requests. Please throttle." });
    }
  }
  next();
}

module.exports = { rateLimiter };
`
      }
    }
  },

  ruby_webhook_api: {
    id: "ruby_webhook_api",
    name: "Ruby Webhook Sync Worker",
    description: "Multi-channel webhook receiver routing payload parsing to asynchronous ActiveJob serialization layers.",
    category: "Ruby Rails",
    language: "ruby",
    entryPoint: "app/controllers/webhook_controller.rb",
    buildCmd: "bundle exec rake test",
    runCmd: "rails server",
    tags: ["API", "Async", "Webhooks"],
    files: {
      "app/controllers/webhook_controller.rb": {
        name: "webhook_controller.rb",
        language: "ruby",
        content: `# Webhook Controller to intake external service payloads
# Note: Has a syntax typo for compiler diagnostics.

class WebhookController < ApplicationController
  skip_before_action :verify_authenticity_token

  # Typo: using "defx" instead of "def" to cause terminal build check errors
  defx create
    payload = params[:webhook]
    if payload.present?
      WebhookSyncWorker.perform_later(payload.to_unsafe_h)
      render json: { status: "received", queued_at: Time.now.utc }, status: :ok
    else
      render json: { error: "Payload empty" }, status: :unprocessable_entity
    end
  end
end
`
      },
      "app/workers/webhook_sync_worker.rb": {
        name: "webhook_sync_worker.rb",
        language: "ruby",
        content: `# Async worker deserializing payload events
class WebhookSyncWorker < ActiveJob::Base
  queue_as :webhooks

  def perform(payload)
    event_type = payload["event"]
    Rails.logger.info "[Sync Worker] Triggering event parsing for: #{event_type}"
    
    # Simulates dispatching to correct serializer
    case event_type
    when "user.signup"
      # Process signups
    when "payment.success"
      # Process charges
    end
  end
end
`
      }
    }
  }
};
