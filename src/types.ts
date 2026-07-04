/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 1. Database / JSON Schema definition for a multi-file "Code Blueprint"
export interface FileNode {
  name: string;
  content: string;
  language: "typescript" | "rust" | "ruby" | "javascript" | "json" | "markdown";
  isDirty?: boolean;
}

export interface CodeBlueprint {
  id: string;
  name: string;
  description: string;
  category: "React/TS" | "Rust API" | "Node.js" | "Ruby Rails";
  language: "typescript" | "rust" | "ruby" | "javascript";
  files: {
    [filePath: string]: FileNode;
  };
  entryPoint: string;
  // Commands that are standard for compilation in this environment
  buildCmd: string;
  runCmd: string;
  tags?: string[];
}

// Complete JSON Schema representing a CodeBlueprint database record
export const CODE_BLUEPRINT_JSON_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "CodeBlueprint",
  description: "A multi-file project blueprint for sandboxed testing and discovery on snippets.live.",
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "A unique identifier for the blueprint."
    },
    name: {
      type: "string",
      description: "Human-readable name of the snippet blueprint."
    },
    description: {
      type: "string",
      description: "A brief summary of what this code blueprint accomplishes."
    },
    category: {
      type: "string",
      enum: ["React/TS", "Rust API", "Node.js", "Ruby Rails"],
      description: "Primary environment and framework group."
    },
    language: {
      type: "string",
      enum: ["typescript", "rust", "ruby", "javascript"],
      description: "Primary programming language of the codebase."
    },
    files: {
      type: "object",
      description: "A dictionary of file paths mapped to their name, content, and metadata.",
      additionalProperties: {
        type: "object",
        properties: {
          name: { type: "string" },
          content: { type: "string" },
          language: {
            type: "string",
            enum: ["typescript", "rust", "ruby", "javascript", "json", "markdown"]
          },
          isDirty: { type: "boolean" }
        },
        required: ["name", "content", "language"]
      }
    },
    entryPoint: {
      type: "string",
      description: "The primary path executed during evaluation or compilation (e.g., 'src/main.rs')."
    },
    buildCmd: {
      type: "string",
      description: "The terminal script used to trigger compiler checks (e.g., 'cargo build')."
    },
    runCmd: {
      type: "string",
      description: "The sandbox execution start script (e.g., 'cargo run')."
    }
  },
  required: ["id", "name", "description", "category", "language", "files", "entryPoint", "buildCmd", "runCmd"]
};

// Application state models
export interface TerminalLine {
  text: string;
  type: "info" | "success" | "error" | "input" | "system";
  timestamp: string;
}

export type ModelTier = "free" | "pro";

export interface AIInvocation {
  timestamp: string;
  model: string;
  promptTokens: number;
  responseTokens: number;
  costSavedPercent: number; // For prompt caching metrics
}

export interface SafeFixResponse {
  explanation: string;
  fixedCode: string;
  diffSummary: string;
  isDemoFallback: boolean;
}
