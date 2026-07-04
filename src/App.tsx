/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Terminal, Shield, Sparkles, Database, ArrowRight, Download, Clipboard, Check, RefreshCw, Layers, Cpu, Code, Info, Play, Trash2, HelpCircle, Share2, ExternalLink, Eye, ArrowLeftRight, X, User, Coins, Lock } from "lucide-react";
import { CodeBlueprint, FileNode, TerminalLine, ModelTier, AIInvocation } from "./types";
import { INITIAL_BLUEPRINTS } from "./data";
import BlueprintExplorer from "./components/BlueprintExplorer";
import CodeEditor from "./components/CodeEditor";
import TerminalGitBash from "./components/TerminalGitBash";
import TokenTierConfig from "./components/TokenTierConfig";
import Workbench from "./components/Workbench";
import EarningsTracker from "./components/EarningsTracker";
import PricingPage from "./components/PricingPage";
import ProfilePage from "./components/ProfilePage";
import AdminPage from "./components/AdminPage";

// High-performance UTF-8 safe Base64 encoder for complete portable URL state-sharing
function encodeCodeState(state: any): string {
  try {
    const json = JSON.stringify(state);
    const utf8Bytes = new TextEncoder().encode(json);
    let binary = "";
    const len = utf8Bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary);
  } catch (e) {
    console.error("Failed to encode code state", e);
    return "";
  }
}

// UTF-8 safe Base64 decoder for reconstructing portable shared code snapshots
function decodeCodeState(base64: string): any {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to decode code state", e);
    return null;
  }
}

export default function App() {
  // Core Workspace state
  const [blueprints, setBlueprints] = useState<{ [key: string]: CodeBlueprint }>(
    JSON.parse(JSON.stringify(INITIAL_BLUEPRINTS))
  );
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("react_ts_debounce");
  const [activeFilePath, setActiveFilePath] = useState<string>("src/interceptor.ts");

  // Terminal & Compilation State
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  // Model & Token Tier state
  const [modelTier, setModelTier] = useState<ModelTier>("free");
  const [activeTheme, setActiveTheme] = useState<"sync" | "cyberpunk" | "nord" | "emerald" | "sunset">("sync");
  const [activePanel, setActivePanel] = useState<"explorer" | "editor" | "terminal" | "config">("editor");
  const [invocationsCount, setInvocationsCount] = useState<number>(0);
  const maxInvocations = 10;
  const [aiInvocations, setAiInvocations] = useState<AIInvocation[]>([]);

  // Export & Alert Feedbacks
  const [copied, setCopied] = useState(false);
  const [zipDownloaded, setZipDownloaded] = useState(false);

  // User credits & notification toast state
  const [userCredits, setUserCredits] = useState<number>(() => {
    return parseFloat(localStorage.getItem("snippets_live_user_credits") || "25.50");
  });
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  const handleAddCredits = (amount: number) => {
    setUserCredits((prev) => {
      const next = prev + amount;
      localStorage.setItem("snippets_live_user_credits", next.toFixed(2));
      return next;
    });
  };

  const showNotification = (message: string, type: "success" | "info" | "warning" = "success") => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Router navigation tab state
  const [activeNav, setActiveNav] = useState<"blueprints" | "workbench" | "documentation" | "export-history" | "pricing" | "profile" | "admin">("blueprints");

  // Export & Compilation logs history table state with pre-populated shareable code states
  const [exportLogs, setExportLogs] = useState<any[]>(() => {
    const tsBlueprint = INITIAL_BLUEPRINTS["react_ts_debounce"];
    const rustBlueprint = INITIAL_BLUEPRINTS["rust_redis_cache"];
    return [
      {
        id: "log-sys-init",
        action: "System Init",
        blueprint: "TypeScript API Interceptor",
        files: "src/interceptor.ts",
        type: "Info",
        timestamp: "16:21:05",
        details: "Virtual container initialized with TypeScript 5.8 AST engines",
        status: "SUCCESS",
        codeState: {
          blueprintName: "TypeScript API Interceptor",
          language: "typescript",
          files: tsBlueprint ? JSON.parse(JSON.stringify(tsBlueprint.files)) : {},
          activePath: "src/interceptor.ts"
        }
      },
      {
        id: "log-sys-check",
        action: "Static Compiler Check",
        blueprint: "Rust Redis Cache Key Engine",
        files: "src/main.rs",
        type: "Compile",
        timestamp: "16:22:12",
        details: "Trapped cargo compile exception (missing semicolon on line 17)",
        status: "FAILED",
        codeState: {
          blueprintName: "Rust Redis Cache Key Engine",
          language: "rust",
          files: rustBlueprint ? JSON.parse(JSON.stringify(rustBlueprint.files)) : {},
          activePath: "src/main.rs"
        }
      }
    ];
  });

  const selectedBlueprint = blueprints[selectedBlueprintId];
  const activeFile = selectedBlueprint.files[activeFilePath];

  // Public Read-Only Sharing state variables
  const [sharingLogId, setSharingLogId] = useState<string | null>(null);
  const [sharedLogState, setSharedLogState] = useState<any | null>(null);
  const [sharedActivePath, setSharedActivePath] = useState<string>("");
  const [sharedCopied, setSharedCopied] = useState(false);

  // Parse share links and parameters on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("share");
    const codeParam = params.get("code");

    if (shareId) {
      let foundState = null;

      // 1. Try local storage first (for same domain speed and reliability)
      const saved = localStorage.getItem(`snippets_live_shared_state_${shareId}`);
      if (saved) {
        try {
          foundState = JSON.parse(saved);
        } catch (e) {
          console.error("Local storage share parsing error", e);
        }
      }

      // 2. Fallback to URL code parameter if present (fully portable across browsers/tabs)
      if (!foundState && codeParam) {
        foundState = decodeCodeState(codeParam);
      }

      // 3. Fallback to search in exportLogs (pre-populated memory)
      if (!foundState) {
        const matchingLog = exportLogs.find((l) => l.id === shareId);
        if (matchingLog && matchingLog.codeState) {
          foundState = matchingLog.codeState;
        }
      }

      if (foundState) {
        setSharedLogState(foundState);
        setSharedActivePath(foundState.activePath || Object.keys(foundState.files)[0] || "");
      } else {
        alert("Shared code state has expired or link is invalid.");
        // Clear query strings safely
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Update sharedActivePath whenever a new state load happens
  useEffect(() => {
    if (sharedLogState) {
      setSharedActivePath(sharedLogState.activePath || Object.keys(sharedLogState.files)[0] || "");
    }
  }, [sharedLogState]);

  // Handle sharing of specific log state
  const handleShareLogState = (log: any) => {
    if (!log.codeState) {
      alert("This system log has no code state available for sharing.");
      return;
    }

    setSharingLogId(log.id);

    // Save to local storage
    localStorage.setItem(`snippets_live_shared_state_${log.id}`, JSON.stringify(log.codeState));

    // Encode to base64
    const base64Code = encodeCodeState(log.codeState);
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${log.id}&code=${encodeURIComponent(base64Code)}`;

    // Copy URL to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      // Temporary UX status change
      setTimeout(() => setSharingLogId(null), 2000);
    }).catch((err) => {
      console.error("Could not write sharing link to clipboard", err);
      // Fallback
      alert(`Portable Share URL generated:\n${shareUrl}`);
      setSharingLogId(null);
    });
  };

  // Import shared blueprint files into active workspace
  const handleImportSharedState = () => {
    if (!sharedLogState) return;

    const confirmMsg = `Do you want to import the shared blueprint "${sharedLogState.blueprintName}" into your current playground session?\n\nThis will inject the captured code snapshot as a custom editable blueprint!`;
    if (confirm(confirmMsg)) {
      const importedId = `imported_${Date.now()}`;
      const newBlueprint = {
        id: importedId,
        name: `${sharedLogState.blueprintName} (Shared Snapshot)`,
        description: `Imported via public read-only sharing link.`,
        language: sharedLogState.language || "typescript",
        entryPoint: sharedLogState.activePath || Object.keys(sharedLogState.files)[0] || "index.ts",
        files: sharedLogState.files,
        category: "Imported"
      };

      setBlueprints((prev) => ({
        ...prev,
        [importedId]: newBlueprint,
      }));

      setSelectedBlueprintId(importedId);
      setActiveFilePath(newBlueprint.entryPoint);
      setSharedLogState(null);

      // Clean browser URL query strings cleanly
      window.history.replaceState({}, document.title, window.location.pathname);

      const time = new Date().toLocaleTimeString();
      setTerminalLines((prev) => [
        ...prev,
        { text: `📥 Successfully imported shared blueprint "${newBlueprint.name}" into virtual container memory.`, type: "system", timestamp: time },
        { text: `Loaded files: [${Object.keys(newBlueprint.files).join(", ")}]`, type: "info", timestamp: time },
        { text: `Ready to run compiler tests or edit code!`, type: "success", timestamp: time }
      ]);

      setActiveNav("blueprints");
    }
  };

  // Close the shared preview modal and clear query strings
  const handleCloseSharedPreview = () => {
    setSharedLogState(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  // Language colors configuration
  const getLanguageTheme = () => {
    if (activeTheme === "cyberpunk") {
      return {
        activeClass: "bg-[#ff007f] text-white",
        borderColor: "#ff007f",
        glowColor: "rgba(255, 0, 127, 0.15)",
      };
    }
    if (activeTheme === "nord") {
      return {
        activeClass: "bg-[#38bdf8] text-black",
        borderColor: "#38bdf8",
        glowColor: "rgba(56, 189, 248, 0.15)",
      };
    }
    if (activeTheme === "emerald") {
      return {
        activeClass: "bg-[#10b981] text-black",
        borderColor: "#10b981",
        glowColor: "rgba(16, 185, 129, 0.15)",
      };
    }
    if (activeTheme === "sunset") {
      return {
        activeClass: "bg-[#f59e0b] text-black",
        borderColor: "#f59e0b",
        glowColor: "rgba(245, 158, 11, 0.15)",
      };
    }

    switch (selectedBlueprint.language) {
      case "typescript":
        return {
          activeClass: "bg-lang-blue-active text-black",
          borderColor: "#38bdf8",
          glowColor: "rgba(56, 189, 248, 0.1)",
        };
      case "rust":
        return {
          activeClass: "bg-lang-orange-active text-black",
          borderColor: "#fb923c",
          glowColor: "rgba(251, 146, 60, 0.1)",
        };
      case "javascript":
        return {
          activeClass: "bg-lang-green-active text-black",
          borderColor: "#4ade80",
          glowColor: "rgba(74, 222, 128, 0.1)",
        };
      case "ruby":
        return {
          activeClass: "bg-lang-red-active text-black",
          borderColor: "#f87171",
          glowColor: "rgba(248, 113, 113, 0.1)",
        };
      default:
        return {
          activeClass: "bg-gray-400 text-black",
          borderColor: "rgba(255, 255, 255, 0.08)",
          glowColor: "transparent",
        };
    }
  };

  const themeColors = getLanguageTheme();

  // Initialize terminal welcome lines for selected blueprint
  const initTerminal = (bpId: string) => {
    const bp = blueprints[bpId];
    const time = new Date().toLocaleTimeString();
    setTerminalLines([
      {
        text: `snippets.live [Version 1.4.2]`,
        type: "info",
        timestamp: time,
      },
      {
        text: `Initializing virtual sandboxed runtime environment for blueprint: "${bp.name}"`,
        type: "info",
        timestamp: time,
      },
      {
        text: `Container status: stateless, hot-module simulated cache hit.`,
        type: "info",
        timestamp: time,
      },
      {
        text: `Ready to compile. Run "${bp.buildCmd}" or edit files in the Explorer tree.`,
        type: "success",
        timestamp: time,
      },
    ]);
  };

  useEffect(() => {
    initTerminal(selectedBlueprintId);
    // Set first file as active file automatically
    const firstFilePath = Object.keys(blueprints[selectedBlueprintId].files)[0];
    const entry = blueprints[selectedBlueprintId].entryPoint || firstFilePath;
    setActiveFilePath(entry);
    
    // Check initial code to see if there is an error
    checkInitialError(selectedBlueprintId, entry);
  }, [selectedBlueprintId]);

  // Determine if the current file content contains known typo bugs
  const checkInitialError = (bpId: string, filePath: string) => {
    const bp = blueprints[bpId];
    const file = bp.files[filePath];
    if (!file) return;

    if (filePath.endsWith("interceptor.ts") && file.content.includes("functon")) {
      setCompilationError(
        `TypeScript Compiler Error: Syntax Error: Unexpected keyword or identifier.
  At /project_root/src/interceptor.ts [Line 12, Col 1]:
  
  11 | // Typo 'functon' introduced for testing the Safe Fix-It loop!
  12 | functon requestInterceptor(config: RequestConfig): RequestConfig {
       ^^^^^^^ 'functon' is not a valid keyword. Did you mean 'function'?
  13 |   const token = localStorage.getItem("auth_token");`
      );
    } else if (filePath.endsWith("main.rs") && file.content.includes('insert("health", "OK")\n')) {
      setCompilationError(
        `Rust Cargo Build Error: expected \`;\`, found \`println\`
  At /project_root/src/main.rs [Line 17, Col 31]:
  
  16 |     // Unbalanced parenthesis / missing semicolon typo here for testing:
  17 |     cache_engine.insert("health", "OK")
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ help: add \`;\` here
  18 |     
  19 |     println!("[Rust Sandbox] Server compiled and routing successfully.");`
      );
    } else if (filePath.endsWith("middleware.js") && file.content.includes("constt")) {
      setCompilationError(
        `NodeJS Runtime Error: ReferenceError: constt is not defined
  At /project_root/server/middleware.js [Line 8, Col 3]:
  
  7 | function authorizeToken(req, res, next) {
  8 |   constt authHeader = req.headers["authorization"];
        ^^^^^^ ReferenceError: constt is not defined. Did you mean 'const'?
  9 |   const token = authHeader && authHeader.split(" ")[1];`
      );
    } else if (filePath.endsWith("webhook_controller.rb") && file.content.includes("defx")) {
      setCompilationError(
        `Ruby Rails Compiler Error: SyntaxError (unexpected defx, expecting end)
  At /project_root/app/controllers/webhook_controller.rb [Line 8, Col 3]:
  
  7 |   # Typo: using "defx" instead of "def" to cause terminal build check errors
  8 |   defx create
        ^^^^ SyntaxError: unexpected defx, expecting end`
      );
    } else {
      setCompilationError(null);
    }
  };

  // When changing blueprints
  const handleSelectBlueprint = (id: string) => {
    setSelectedBlueprintId(id);
  };

  // When forking a blueprint to a local copy
  const handleForkBlueprint = (id: string) => {
    const original = blueprints[id];
    if (!original) return;

    // Deep clone the original blueprint
    const clone: CodeBlueprint = JSON.parse(JSON.stringify(original));
    
    // Create unique ID & Name
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const forkId = `${id}_fork_${uniqueSuffix}`;
    clone.id = forkId;
    clone.name = `${original.name} (Fork)`;
    
    // Ensure "Local Fork" tag exists
    if (!clone.tags) {
      clone.tags = [];
    }
    if (!clone.tags.includes("Local Fork")) {
      clone.tags.push("Local Fork");
    }

    setBlueprints((prev) => ({
      ...prev,
      [forkId]: clone
    }));

    // Select the newly created fork
    setSelectedBlueprintId(forkId);
    
    showNotification(`Forked "${original.name}" successfully! Now in local sandbox copy.`, "success");
    
    setTerminalLines((prev) => [
      ...prev,
      {
        text: `⚡ Created workspace fork: "${clone.name}" [ID: ${forkId}]`,
        type: "system",
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        text: `⚡ You can now safely experiment with and compile files inside this fork.`,
        type: "info",
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);
  };

  // When changing active file inside blueprint
  const handleSelectFile = (path: string) => {
    setActiveFilePath(path);
    // Determine if we should trigger compilation errors based on code
    checkInitialError(selectedBlueprintId, path);
  };

  // When user edits the active file content
  const handleCodeChange = (newContent: string) => {
    setBlueprints((prev) => {
      const copy = { ...prev };
      copy[selectedBlueprintId].files[activeFilePath].content = newContent;
      copy[selectedBlueprintId].files[activeFilePath].isDirty = true;
      return copy;
    });
  };

  // Inject intentional bug to test AI repair
  const handleRestoreTypo = () => {
    const baseId = selectedBlueprintId.split("_fork_")[0];
    const defaultBlueprint = INITIAL_BLUEPRINTS[baseId] || INITIAL_BLUEPRINTS[selectedBlueprintId];
    const defaultFile = defaultBlueprint ? defaultBlueprint.files[activeFilePath] : null;
    if (!defaultFile) return;

    setBlueprints((prev) => {
      const copy = { ...prev };
      copy[selectedBlueprintId].files[activeFilePath].content = defaultFile.content;
      copy[selectedBlueprintId].files[activeFilePath].isDirty = true;
      return copy;
    });

    // Check errors
    checkInitialError(selectedBlueprintId, activeFilePath);

    const time = new Date().toLocaleTimeString();
    setTerminalLines((prev) => [
      ...prev,
      {
        text: `⚡ Injected intentional code typo into ${activeFilePath} for compiler error diagnostic test.`,
        type: "system",
        timestamp: time,
      },
    ]);
  };

  // Increments AI invocations log (Free Tier Capped at 10)
  const incrementInvocations = (): boolean => {
    if (modelTier === "free" && invocationsCount >= maxInvocations) {
      return false;
    }

    setInvocationsCount((c) => c + 1);

    const time = new Date().toLocaleTimeString();
    const newLog: AIInvocation = {
      timestamp: time,
      model: modelTier === "pro" ? "Gemini 3 Pro (Reasoning)" : "Gemini 2.5 Flash-Lite",
      promptTokens: modelTier === "pro" ? 4200 : 1500,
      responseTokens: modelTier === "pro" ? 1100 : 350,
      costSavedPercent: 85, // prompt caching metrics
    };

    setAiInvocations((logs) => [newLog, ...logs]);
    return true;
  };

  // Handle Command Executions inside In-App Terminal
  const handleSendCommand = (commandText: string) => {
    const time = new Date().toLocaleTimeString();
    const cleanCommand = commandText.trim();

    // Print command input to terminal
    setTerminalLines((prev) => [
      ...prev,
      { text: cleanCommand, type: "input", timestamp: time },
    ]);

    // Command parser
    if (cleanCommand === "clear") {
      setTerminalLines([]);
      return;
    }

    // Git commands
    if (cleanCommand.startsWith("git")) {
      handleGitCommands(cleanCommand, time);
      return;
    }

    // Build/Compile command
    if (cleanCommand === selectedBlueprint.buildCmd || cleanCommand === "npm run build" || cleanCommand === "cargo build") {
      triggerCompilation();
      return;
    }

    // Run/Start command
    if (cleanCommand === selectedBlueprint.runCmd || cleanCommand === "npm run dev" || cleanCommand === "cargo run" || cleanCommand === "rails server") {
      triggerSandboxRun(time);
      return;
    }

    // Help or Unknown
    setTerminalLines((prev) => [
      ...prev,
      {
        text: `Bash: command not found: "${cleanCommand}". Did you mean "${selectedBlueprint.buildCmd}" or a light Git utility?`,
        type: "error",
        timestamp: time,
      },
    ]);
  };

  // Simulate Git client events
  const handleGitCommands = (cmd: string, time: string) => {
    if (cmd === "git status") {
      const editedFiles = (Object.entries(selectedBlueprint.files) as [string, FileNode][])
        .filter(([_, f]) => f.isDirty)
        .map(([path]) => `\tmodified:   ${path}`);

      setTerminalLines((prev) => [
        ...prev,
        { text: `On branch main\nYour branch is up to date with 'origin/main'.`, type: "info", timestamp: time },
        {
          text: editedFiles.length > 0
            ? `Changes not staged for commit:\n  (use "git add <file>..." to stage)\n\n${editedFiles.join("\n")}`
            : `nothing to commit, working tree clean`,
          type: "info",
          timestamp: time,
        },
      ]);
    } else if (cmd.startsWith("git clone ")) {
      const repo = cmd.substring(10);
      setTerminalLines((prev) => [
        ...prev,
        { text: `Cloning repository into '${repo}'...`, type: "info", timestamp: time },
        { text: `remote: Enumerating objects: 42, done.`, type: "info", timestamp: time },
        { text: `remote: Counting objects: 100% (42/42), done.`, type: "info", timestamp: time },
        { text: `Unpacking objects: 100% (42/42), 12.18 KiB | 1.22 MiB/s, done.`, type: "info", timestamp: time },
        { text: `Repository synchronized. File structure parsed in browser sandbox.`, type: "success", timestamp: time },
      ]);
    } else if (cmd.startsWith("git checkout -b ")) {
      const branch = cmd.substring(16);
      setTerminalLines((prev) => [
        ...prev,
        { text: `Switched to a new branch '${branch}'`, type: "success", timestamp: time },
      ]);
    } else if (cmd.startsWith("git commit")) {
      const editedFilesCount = (Object.values(selectedBlueprint.files) as FileNode[]).filter((f) => f.isDirty).length;
      if (editedFilesCount === 0) {
        setTerminalLines((prev) => [
          ...prev,
          { text: `On branch main\nnothing to commit, working tree clean`, type: "info", timestamp: time },
        ]);
        return;
      }

      setTerminalLines((prev) => [
        ...prev,
        { text: `[main 4f1a293] local changes committed in tab-sandbox`, type: "success", timestamp: time },
        { text: ` ${editedFilesCount} file(s) changed, local staging buffer flushed.`, type: "info", timestamp: time },
      ]);
    } else if (cmd === "git push") {
      if (compilationError) {
        setTerminalLines((prev) => [
          ...prev,
          { text: `Git Push Blocked: Cannot sync unstable code on snippets.live.`, type: "error", timestamp: time },
          { text: `✖ Abort: Resolution failed. Please run Safe Auto-Repair first.`, type: "error", timestamp: time },
        ]);
      } else {
        setTerminalLines((prev) => [
          ...prev,
          { text: `Pushing branch 'main' to secure registry...`, type: "info", timestamp: time },
          { text: `Connection established: https://github.com/push2playlive/snippets-live-export`, type: "info", timestamp: time },
          { text: `✔ Repository synchronized successfully (Green). Pit-stop complete!`, type: "success", timestamp: time },
        ]);
      }
    } else {
      setTerminalLines((prev) => [
        ...prev,
        { text: `Git client simulated action successfully.`, type: "success", timestamp: time },
      ]);
    }
  };

  // Compile Code flow
  const triggerCompilation = () => {
    setIsCompiling(true);
    const time = new Date().toLocaleTimeString();

    setTerminalLines((prev) => [
      ...prev,
      { text: `Compiler: Launching static code check against ${selectedBlueprint.entryPoint}...`, type: "info", timestamp: time },
    ]);

    // Simulated short compile delay
    setTimeout(() => {
      setIsCompiling(false);
      const postTime = new Date().toLocaleTimeString();

      // Check current content of active file for compilation breaks
      if (activeFilePath.endsWith("interceptor.ts") && activeFile.content.includes("functon")) {
        setCompilationError(
          `TypeScript Compiler Error: Syntax Error: Unexpected keyword or identifier.
  At /project_root/src/interceptor.ts [Line 12, Col 1]:
  
  11 | // Typo 'functon' introduced for testing the Safe Fix-It loop!
  12 | functon requestInterceptor(config: RequestConfig): RequestConfig {
       ^^^^^^^ 'functon' is not a valid keyword. Did you mean 'function'?
  13 |   const token = localStorage.getItem("auth_token");`
        );
        setTerminalLines((prev) => [
          ...prev,
          { text: `✖ Compilation breaks detected. State resolved to RED.`, type: "error", timestamp: postTime },
        ]);
        setExportLogs((prev) => [
          {
            action: "Compilation",
            blueprint: selectedBlueprint.name,
            files: activeFilePath,
            type: "Compile Error",
            timestamp: postTime,
            details: "TypeScript syntax check failed: 'functon' is not a valid keyword.",
            status: "FAILED"
          },
          ...prev
        ]);
      } else if (activeFilePath.endsWith("main.rs") && activeFile.content.includes('insert("health", "OK")\n')) {
        setCompilationError(
          `Rust Cargo Build Error: expected \`;\`, found \`println\`
  At /project_root/src/main.rs [Line 17, Col 31]:
  
  16 |     // Unbalanced parenthesis / missing semicolon typo here for testing:
  17 |     cache_engine.insert("health", "OK")
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ help: add \`;\` here
  18 |     
  19 |     println!("[Rust Sandbox] Server compiled and routing successfully.");`
        );
        setTerminalLines((prev) => [
          ...prev,
          { text: `✖ Cargo: process exited with code 101. State resolved to RED.`, type: "error", timestamp: postTime },
        ]);
        setExportLogs((prev) => [
          {
            action: "Compilation",
            blueprint: selectedBlueprint.name,
            files: activeFilePath,
            type: "Compile Error",
            timestamp: postTime,
            details: "Rust cargo check failed: missing semicolon on line 17.",
            status: "FAILED"
          },
          ...prev
        ]);
      } else if (activeFilePath.endsWith("middleware.js") && activeFile.content.includes("constt")) {
        setCompilationError(
          `NodeJS Runtime Error: ReferenceError: constt is not defined
  At /project_root/server/middleware.js [Line 8, Col 3]:
  
  7 | function authorizeToken(req, res, next) {
  8 |   constt authHeader = req.headers["authorization"];
        ^^^^^^ ReferenceError: constt is not defined. Did you mean 'const'?
  9 |   const token = authHeader && authHeader.split(" ")[1];`
        );
        setTerminalLines((prev) => [
          ...prev,
          { text: `✖ NodeJS: script process failed. State resolved to RED.`, type: "error", timestamp: postTime },
        ]);
        setExportLogs((prev) => [
          {
            action: "Compilation",
            blueprint: selectedBlueprint.name,
            files: activeFilePath,
            type: "Compile Error",
            timestamp: postTime,
            details: "NodeJS syntax check failed: 'constt' reference error.",
            status: "FAILED"
          },
          ...prev
        ]);
      } else if (activeFilePath.endsWith("webhook_controller.rb") && activeFile.content.includes("defx")) {
        setCompilationError(
          `Ruby Rails Compiler Error: SyntaxError (unexpected defx, expecting end)
  At /project_root/app/controllers/webhook_controller.rb [Line 8, Col 3]:
  
  7 |   # Typo: using "defx" instead of "def" to cause terminal build check errors
  8 |   defx create
        ^^^^ SyntaxError: unexpected defx, expecting end`
        );
        setTerminalLines((prev) => [
          ...prev,
          { text: `✖ Rails: tests failed with exit code 1. State resolved to RED.`, type: "error", timestamp: postTime },
        ]);
        setExportLogs((prev) => [
          {
            id: `log-compile-${Date.now()}-err`,
            action: "Compilation",
            blueprint: selectedBlueprint.name,
            files: activeFilePath,
            type: "Compile Error",
            timestamp: postTime,
            details: "Ruby syntax check failed: unexpected 'defx'.",
            status: "FAILED",
            codeState: {
              blueprintName: selectedBlueprint.name,
              language: selectedBlueprint.language,
              files: JSON.parse(JSON.stringify(selectedBlueprint.files)),
              activePath: activeFilePath
            }
          },
          ...prev
        ]);
      } else {
        // Successful Compilation!
        setCompilationError(null);
        // Clear dirty tags
        setBlueprints((prev) => {
          const copy = { ...prev };
          (Object.values(copy[selectedBlueprintId].files) as FileNode[]).forEach((f) => {
            f.isDirty = false;
          });
          return copy;
        });

        setTerminalLines((prev) => [
          ...prev,
          { text: `✔ Compiler static checks passed successfully. Code satisfies AST verification.`, type: "success", timestamp: postTime },
          { text: `✔ Sandboxed Virtual execution state: GREEN.`, type: "success", timestamp: postTime },
        ]);
        setExportLogs((prev) => [
          {
            id: `log-compile-${Date.now()}-ok`,
            action: "Compilation",
            blueprint: selectedBlueprint.name,
            files: activeFilePath,
            type: "Compile Success",
            timestamp: postTime,
            details: "All AST validations and checks satisfied.",
            status: "SUCCESS",
            codeState: {
              blueprintName: selectedBlueprint.name,
              language: selectedBlueprint.language,
              files: JSON.parse(JSON.stringify(selectedBlueprint.files)),
              activePath: activeFilePath
            }
          },
          ...prev
        ]);
      }
    }, 1000);
  };

  // Run the sandbox simulation
  const triggerSandboxRun = (time: string) => {
    if (compilationError) {
      setTerminalLines((prev) => [
        ...prev,
        { text: `Error: Build failed. Please resolve compilation errors first!`, type: "error", timestamp: time },
      ]);
      return;
    }

    setTerminalLines((prev) => [
      ...prev,
      { text: `Starting sandbox server emulator...`, type: "info", timestamp: time },
      { text: `Virtual service listening on port 8080 (Stateless Sandbox)`, type: "info", timestamp: time },
      { text: `Executing sandbox run tests against ${selectedBlueprint.entryPoint}...`, type: "info", timestamp: time },
      { text: `✔ Service run finalized with 0 errors. Diagnostic report generated!`, type: "success", timestamp: time },
    ]);
  };

  // Safe AI Fix-It Loop integration callback
  const handleApplyAiFix = (fixedCode: string, explanation: string) => {
    setBlueprints((prev) => {
      const copy = { ...prev };
      copy[selectedBlueprintId].files[activeFilePath].content = fixedCode;
      copy[selectedBlueprintId].files[activeFilePath].isDirty = false; // Resolved
      return copy;
    });

    setCompilationError(null);

    const time = new Date().toLocaleTimeString();
    setTerminalLines((prev) => [
      ...prev,
      { text: `⚡ AI code repair merged into ${activeFilePath}.`, type: "system", timestamp: time },
      { text: `Explanation: ${explanation}`, type: "info", timestamp: time },
      { text: `Resolving code context. Re-executing static compiler verify...`, type: "info", timestamp: time },
      { text: `✔ Static check passed. AST verified. Sandbox compiled successfully (GREEN).`, type: "success", timestamp: time },
    ]);

    setExportLogs((prev) => [
      {
        id: `log-repair-${Date.now()}`,
        action: "AI Safe Repair",
        blueprint: selectedBlueprint.name,
        files: activeFilePath,
        type: "Repair",
        timestamp: time,
        details: `Successfully merged AI-suggested AST repair: "${explanation}"`,
        status: "SUCCESS",
        codeState: {
          blueprintName: selectedBlueprint.name,
          language: selectedBlueprint.language,
          files: JSON.parse(JSON.stringify(selectedBlueprint.files)),
          activePath: activeFilePath
        }
      },
      ...prev
    ]);
  };

  // Wipe volatile memory (stateless sandbox)
  const handleWipeSandbox = () => {
    setBlueprints(JSON.parse(JSON.stringify(INITIAL_BLUEPRINTS)));
    
    // If selected blueprint is a fork, revert back to default blueprint
    if (selectedBlueprintId.includes("_fork_") || !INITIAL_BLUEPRINTS[selectedBlueprintId]) {
      setSelectedBlueprintId("react_ts_debounce");
    }
    
    setCompilationError(null);
    setInvocationsCount(0);
    setAiInvocations([]);
    initTerminal(selectedBlueprintId.includes("_fork_") ? "react_ts_debounce" : selectedBlueprintId);

    const time = new Date().toLocaleTimeString();
    setTerminalLines((prev) => [
      ...prev,
      { text: `⚡ Volatile sandbox memory destroyed. Registry values restored to default.`, type: "system", timestamp: time },
    ]);
  };

  // Copy code to Clipboard
  const handleCopyToClipboard = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      setExportLogs((prev) => [
        {
          id: `log-copy-${Date.now()}`,
          action: "Clipboard Copy",
          blueprint: selectedBlueprint.name,
          files: activeFilePath,
          type: "Copy",
          timestamp: new Date().toLocaleTimeString(),
          details: `Copied raw contents of active file "${activeFilePath}"`,
          status: "SUCCESS",
          codeState: {
            blueprintName: selectedBlueprint.name,
            language: selectedBlueprint.language,
            files: JSON.parse(JSON.stringify(selectedBlueprint.files)),
            activePath: activeFilePath
          }
        },
        ...prev
      ]);
    }
  };

  // Capture code Snapshot to session history
  const handleSaveSnapshot = () => {
    if (!selectedBlueprint) return;

    const time = new Date().toLocaleTimeString();
    const filesCount = Object.keys(selectedBlueprint.files).length;

    setExportLogs((prev) => [
      {
        id: `log-snapshot-${Date.now()}`,
        action: "Manual Snapshot",
        blueprint: selectedBlueprint.name,
        files: activeFilePath || "All Workspace Files",
        type: "Snapshot",
        timestamp: time,
        details: `Saved snapshot of active files (${filesCount} files) in "${selectedBlueprint.name}"`,
        status: "SUCCESS",
        codeState: {
          blueprintName: selectedBlueprint.name,
          language: selectedBlueprint.language,
          files: JSON.parse(JSON.stringify(selectedBlueprint.files)),
          activePath: activeFilePath
        }
      },
      ...prev
    ]);

    showNotification(`Snapshot for "${selectedBlueprint.name}" successfully bookmarked!`, "success");

    setTerminalLines((prev) => [
      ...prev,
      {
        text: `📷 [Snapshot] Bookmarked workspace state. ${filesCount} files logged to session history.`,
        type: "system",
        timestamp: time,
      }
    ]);
  };

  // Simulated ZIP Download helper
  const handleDownloadZip = () => {
    setZipDownloaded(true);
    setTimeout(() => setZipDownloaded(false), 3000);

    // Create a text file block representing all workspace codes packed
    const zipData: Record<string, string> = {};
    (Object.entries(selectedBlueprint.files) as [string, FileNode][]).forEach(([path, file]) => {
      zipData[path] = file.content;
    });

    const blob = new Blob([JSON.stringify(zipData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snippets_live_${selectedBlueprintId}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportLogs((prev) => [
      {
        id: `log-export-${Date.now()}`,
        action: "ZIP Export",
        blueprint: selectedBlueprint.name,
        files: Object.keys(selectedBlueprint.files).join(", "),
        type: "Export",
        timestamp: new Date().toLocaleTimeString(),
        details: `Downloaded fully compiled offline package containing ${Object.keys(selectedBlueprint.files).length} sandbox modules`,
        status: "SUCCESS",
        codeState: {
          blueprintName: selectedBlueprint.name,
          language: selectedBlueprint.language,
          files: JSON.parse(JSON.stringify(selectedBlueprint.files)),
          activePath: Object.keys(selectedBlueprint.files)[0] || ""
        }
      },
      ...prev
    ]);
  };

  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col selection:bg-lang-blue-inactive select-none">
      {/* Visual Top Navigation Header */}
      <header className="px-6 py-4 bg-[#0d1117] border-b border-canvas-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-lang-orange-inactive border border-lang-orange-border/30">
            <Layers className="w-5 h-5 text-lang-orange-active animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-lg tracking-tight text-white uppercase">snippets.live</h1>
              <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded font-mono border border-white/5 font-semibold">
                v2.0 PRODUCTION
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Stateless Drive-Thru Testing Lab • Find ➔ Compile ➔ Verify ➔ Export & Exit
            </p>
          </div>
        </div>

        {/* Primary Navigation Routers */}
        <nav className="flex flex-wrap items-center bg-black/40 p-1 rounded-xl border border-white/5 font-mono text-[11px] font-bold gap-1 sm:gap-0">
          <button
            onClick={() => setActiveNav("blueprints")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeNav === "blueprints"
                ? "bg-info-inactive text-[#00b2ff] border border-info-border/30 shadow-md shadow-[#00b2ff]/5"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            BLUEPRINTS
          </button>
          <button
            onClick={() => setActiveNav("workbench")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeNav === "workbench"
                ? "bg-brand-inactive text-brand-active border border-brand-border/30 shadow-md shadow-brand-active/5"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            AGENTS WORKBENCH
          </button>
          <button
            onClick={() => setActiveNav("documentation")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeNav === "documentation"
                ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 shadow-md shadow-[#10b981]/5"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            DOCUMENTATION
          </button>
          <button
            onClick={() => setActiveNav("export-history")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeNav === "export-history"
                ? "bg-success-inactive text-success-active border border-success-border/20 shadow-md shadow-success-active/5"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            EXPORT HISTORY
          </button>
          <button
            onClick={() => setActiveNav("pricing")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeNav === "pricing"
                ? "bg-[#ff7a00]/10 text-brand-active border border-[#ff7a00]/20 shadow-md"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            PRICING
          </button>
          <button
            onClick={() => setActiveNav("profile")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeNav === "profile"
                ? "bg-purple-950/20 text-[#c084fc] border border-purple-500/20 shadow-md"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            PROFILE
          </button>
          <button
            onClick={() => setActiveNav("admin")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeNav === "admin"
                ? "bg-red-950/20 text-danger-active border border-red-500/20 shadow-md"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            ADMIN
          </button>
        </nav>

        {/* Right-Aligned Main Triggers */}
        <div className="flex items-center gap-3">
          <EarningsTracker />

          {/* Dynamic Cap/Pro Indicator button */}
          <button
            onClick={() => setModelTier(modelTier === "free" ? "pro" : "free")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer font-mono border ${
              modelTier === "pro"
                ? "bg-brand-inactive hover:bg-orange-950/20 text-brand-active border-brand-border/40"
                : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${modelTier === "pro" ? "text-brand-active animate-pulse" : "text-gray-400"}`} />
            <span>PRO TIER: {modelTier === "pro" ? "ENABLED" : "OFFLINE"}</span>
          </button>

          {/* Export & Exit Button */}
          <button
            onClick={() => {
              handleDownloadZip();
              alert("Export initiated! Your volatile container changes have been packed. Terminating secure local connection pool safely (simulated).");
            }}
            className="px-4 py-1.5 rounded-lg bg-danger-active hover:bg-red-600 text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-red-500/10 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT & EXIT</span>
          </button>
        </div>
      </header>

      {/* Main Multi-Screen Sandbox routing */}
      {activeNav === "blueprints" && (
        <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch overflow-hidden">
          {/* Left column: Directory list explorer (3 columns) */}
          <section className="xl:col-span-3 flex flex-col h-full min-h-[400px]">
            <BlueprintExplorer
              blueprints={blueprints}
              selectedBlueprintId={selectedBlueprintId}
              onSelectBlueprint={handleSelectBlueprint}
              onForkBlueprint={handleForkBlueprint}
              activeFilePath={activeFilePath}
              onSelectFile={handleSelectFile}
              activeColorClass={themeColors.activeClass}
              activeBorderColor={themeColors.borderColor}
              isActive={activePanel === "explorer"}
              onFocus={() => setActivePanel("explorer")}
            />
          </section>

          {/* Center column: Editor & Terminal Workspace (6 columns) */}
          <section className="xl:col-span-6 flex flex-col gap-6">
            {/* Active File Editor */}
            {activeFile ? (
              <div className="flex-1 flex flex-col min-h-[350px]">
                <CodeEditor
                  filePath={activeFilePath}
                  fileContent={activeFile.content}
                  onCodeChange={handleCodeChange}
                  language={activeFile.language}
                  onCompile={triggerCompilation}
                  onRestoreTypo={handleRestoreTypo}
                  onSnapshot={handleSaveSnapshot}
                  compilationError={compilationError}
                  activeColorClass={themeColors.activeClass}
                  activeBorderColor={themeColors.borderColor}
                  isCompiling={isCompiling}
                  isDirty={activeFile.isDirty}
                  isActive={activePanel === "editor"}
                  onFocus={() => setActivePanel("editor")}
                />
              </div>
            ) : (
              <div className="flex-1 bg-canvas-card border border-canvas-border rounded-xl flex items-center justify-center p-6 text-gray-500 text-sm italic font-sans min-h-[350px]">
                No active workspace file loaded. Select a file from the explorer list on the left to begin compiling.
              </div>
            )}

            {/* Terminal / Git Bash console */}
            <div className="h-[280px] lg:h-[350px]">
              <TerminalGitBash
                lines={terminalLines}
                onSendCommand={handleSendCommand}
                compilationError={compilationError}
                activeFilePath={activeFilePath}
                activeFileContent={activeFile ? activeFile.content : null}
                modelTier={modelTier}
                onApplyFix={handleApplyAiFix}
                incrementInvocations={incrementInvocations}
                onClearError={() => setCompilationError(null)}
                activeColorClass={themeColors.activeClass}
                activeBorderColor={themeColors.borderColor}
                isActive={activePanel === "terminal"}
                onFocus={() => setActivePanel("terminal")}
              />
            </div>
          </section>

          {/* Right column: Config, Tier controls, and Optimization Telemetry (3 columns) */}
          <section className="xl:col-span-3 flex flex-col h-full min-h-[400px]">
            <TokenTierConfig
              modelTier={modelTier}
              onChangeTier={setModelTier}
              invocationsCount={invocationsCount}
              maxInvocations={maxInvocations}
              aiInvocations={aiInvocations}
              onWipeSandbox={handleWipeSandbox}
              activeColorClass={themeColors.activeClass}
              compilationError={compilationError}
              activeTheme={activeTheme}
              onChangeTheme={setActiveTheme}
              isActive={activePanel === "config"}
              onFocus={() => setActivePanel("config")}
            />
          </section>
        </main>
      )}

      {activeNav === "workbench" && (
        <Workbench />
      )}

      {activeNav === "documentation" && (
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-8 animate-fade-in overflow-y-auto">
          <div className="p-6 rounded-2xl bg-[#13151a] border border-canvas-border space-y-4">
            <h2 className="text-xl font-display font-black text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-active" />
              <span>Snippets.live Developer Playground Documentation</span>
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-4xl">
              snippets.live is an ultra-fast, zero-config sandboxed playground designed to explore, build, verify, and export utility scripts. Powered by simulated sandboxed AST containers and Gemini reasoning layers, snippets.live traps compile-time exceptions and offers automated repairs instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sandbox Architecture */}
            <div className="p-5 rounded-xl bg-[#13151a] border border-canvas-border space-y-3">
              <h3 className="font-sans font-bold text-gray-200 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-info-active" />
                <span>Stateless WebAssembly Runtime Specifications</span>
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Our in-browser sandboxed runtime emulates local disk files, dependencies, and shell commands. When you edit any file, changes reside in high-speed volatile memory buffers. Invoking <code className="bg-black/50 px-1 py-0.5 text-[#00b2ff] font-mono rounded">npm run build</code> or <code className="bg-black/50 px-1 py-0.5 text-[#00b2ff] font-mono rounded">cargo build</code> triggers immediate syntax validation checks against corresponding language compilers.
              </p>
              <div className="bg-[#0c0d10] p-3 rounded-lg border border-white/5 font-mono text-[10px] text-gray-400 space-y-1">
                <div className="flex justify-between"><span>TypeScript Version:</span> <span className="text-gray-200">v5.8.2</span></div>
                <div className="flex justify-between"><span>Rust Cargo Toolchain:</span> <span className="text-gray-200">v1.78 Stable</span></div>
                <div className="flex justify-between"><span>Node VM:</span> <span className="text-gray-200">v22.14 LTS</span></div>
              </div>
            </div>

            {/* Caching Optimizer */}
            <div className="p-5 rounded-xl bg-[#13151a] border border-canvas-border space-y-3">
              <h3 className="font-sans font-bold text-gray-200 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-success-active" />
                <span>AI Code Resolution Pipeline & Prompt Caching</span>
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                By bundling multi-file blueprints and target syntax errors into pre-compiled prompts, repeat correction requests trigger high-speed prompt cache hits. This mechanism bypasses model processing delays, resulting in latency reduction under 400ms and cutting transaction token costs by up to 90%.
              </p>
              <div className="p-3 bg-black/40 border border-success-border/10 rounded-lg text-xs flex justify-between items-center text-success-active font-mono">
                <span>Prompt Caching State:</span>
                <span className="font-bold bg-success-inactive px-2 py-0.5 rounded">ACTIVE (89.2% HITS)</span>
              </div>
            </div>
          </div>

          {/* Directional state system details */}
          <div className="p-6 rounded-xl bg-[#13151a] border border-canvas-border space-y-4">
            <h3 className="font-sans font-bold text-gray-200 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-active" />
              <span>Visual System States Matrix</span>
            </h3>
            <p className="text-xs text-gray-400">
              snippets.live utilizes a clear, high-contrast visual token palette to communicate sandbox health statuses dynamically:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <div className="p-3 rounded-xl bg-brand-inactive border border-brand-border/30">
                <div className="text-[10px] font-bold text-brand-active uppercase font-mono">Brand Highlights</div>
                <div className="text-xs text-gray-200 font-bold mt-1">#ff7a00</div>
                <p className="text-[10px] text-gray-400 mt-1">Main interactive headers, controls, and pro configurations.</p>
              </div>
              <div className="p-3 rounded-xl bg-info-inactive border border-info-border/30">
                <div className="text-[10px] font-bold text-[#00b2ff] uppercase font-mono">Context & Info</div>
                <div className="text-xs text-gray-200 font-bold mt-1">#00b2ff</div>
                <p className="text-[10px] text-gray-400 mt-1">Infrastructure status logs, system info messages, and files.</p>
              </div>
              <div className="p-3 rounded-xl bg-success-inactive border border-success-border/30">
                <div className="text-[10px] font-bold text-success-active uppercase font-mono">Compilation Success</div>
                <div className="text-xs text-gray-200 font-bold mt-1">#00e575</div>
                <p className="text-[10px] text-gray-400 mt-1">Passing AST compilation states, clean runs, and exports.</p>
              </div>
              <div className="p-3 rounded-xl bg-danger-inactive border border-danger-border/30">
                <div className="text-[10px] font-bold text-[#ff3333] uppercase font-mono">Syntax Breaks</div>
                <div className="text-xs text-gray-200 font-bold mt-1">#ff3333</div>
                <p className="text-[10px] text-gray-400 mt-1">Active compiler errors, exceptions, and red validation checks.</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {activeNav === "export-history" && (
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6 animate-fade-in overflow-y-auto">
          <div className="p-5 rounded-2xl bg-[#13151a] border border-canvas-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-success-active" />
                <span>Export & Resolution History Archive</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Review and track transaction activities, copy operations, compilations, and AI resolutions generated inside this sandbox workspace.
              </p>
            </div>
            <button
              onClick={() => {
                setExportLogs([]);
                alert("Sandbox history registry cleared.");
              }}
              className="px-3.5 py-1.5 rounded-lg border border-danger-border/30 hover:bg-danger-inactive/20 text-danger-active font-mono text-[10px] font-bold cursor-pointer transition-all active:scale-95"
            >
              Clear Registry History
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-[#13151a] rounded-xl border border-canvas-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0d0e12] border-b border-canvas-border text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider">
                    <th className="p-4">Action</th>
                    <th className="p-4">Target Blueprint</th>
                    <th className="p-4">Files</th>
                    <th className="p-4">Event Type</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px] text-gray-300">
                  {exportLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500 italic">
                        No transaction logs registered in this session. Go run compile checks, copy code, or export blueprints to generate histories.
                      </td>
                    </tr>
                  ) : (
                    exportLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-white/[0.01] transition-all">
                        <td className="p-4 font-bold text-white">{log.action}</td>
                        <td className="p-4 text-gray-400">{log.blueprint}</td>
                        <td className="p-4"><code className="bg-black/40 px-1.5 py-0.5 rounded text-gray-300 text-[10px]">{log.files}</code></td>
                        <td className="p-4 text-info-active">{log.type}</td>
                        <td className="p-4 text-gray-500">{log.timestamp}</td>
                        <td className="p-4 max-w-xs truncate text-gray-400" title={log.details}>{log.details}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            log.status === "SUCCESS"
                              ? "bg-success-inactive text-success-active border border-success-border/20"
                              : "bg-danger-inactive text-[#ff3333] border border-danger-border/20"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleShareLogState(log)}
                            disabled={!log.codeState}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition duration-200 cursor-pointer hover:scale-[1.03] active:scale-95 ${
                              !log.codeState
                                ? "bg-white/5 text-gray-600 border border-white/5 pointer-events-none"
                                : sharingLogId === log.id
                                ? "bg-success-inactive text-success-active border border-success-active/20"
                                : "bg-[#ff7a00]/10 hover:bg-[#ff7a00]/20 text-[#ff7a00] border border-[#ff7a00]/20"
                            }`}
                          >
                            {sharingLogId === log.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3 h-3" />
                                <span>Share</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {activeNav === "pricing" && (
        <PricingPage
          currentTier={modelTier}
          onChangeTier={setModelTier}
          userCredits={userCredits}
          onAddCredits={handleAddCredits}
          onShowNotification={showNotification}
        />
      )}

      {activeNav === "profile" && (
        <ProfilePage
          userCredits={userCredits}
          modelTier={modelTier}
          onChangeTier={setModelTier}
          onShowNotification={showNotification}
        />
      )}

      {activeNav === "admin" && (
        <AdminPage
          onShowNotification={showNotification}
        />
      )}

      {/* Dynamic Toast Notification Alerts */}
      {notification && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-2.5 z-[300] transition duration-300 font-sans text-xs font-bold leading-normal ${
          notification.type === "success" 
            ? "bg-[#1c241d] border-[#2e5d36]/30 text-[#00e575]"
            : notification.type === "warning"
            ? "bg-[#241a12] border-[#5c3e21]/30 text-[#ff7a00]"
            : "bg-black/90 border-white/5 text-gray-300"
        }`}>
          {notification.type === "success" ? (
            <div className="p-1 rounded-full bg-[#00e575]/15 text-[#00e575]">
              <Check className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="p-1 rounded-full bg-[#ff7a00]/15 text-[#ff7a00]">
              <Info className="w-3.5 h-3.5" />
            </div>
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Visual Sub Footer with real-time variables tracking */}
      <footer className="px-6 py-3 bg-[#090b0f] border-t border-canvas-border flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-500 font-mono gap-2">
        <div className="flex items-center gap-1.5">
          <span>Active Session ID:</span>
          <span className="text-[#00b2ff] font-bold bg-[#00b2ff]/5 px-1.5 py-0.5 rounded border border-[#00b2ff]/10">f081ea78-5c27</span>
          <span className="text-gray-700">|</span>
          <span>Target Workspace:</span>
          <span className="text-gray-400 select-text font-bold">push2playlive@gmail.com</span>
        </div>
        <div className="flex items-center gap-4">
          <span>UTC Reference: <span className="text-gray-400 font-bold">2026-07-02 16:17:56</span></span>
          <span className="text-gray-700">|</span>
          <div className="flex items-center gap-1.5 text-orange-400 font-bold bg-orange-500/5 px-2 py-0.5 rounded border border-orange-500/10">
            <Shield className="w-3.5 h-3.5" />
            <span>Stateless Browser Isolated</span>
          </div>
        </div>
      </footer>

      {/* Public Read-Only Preview Modal */}
      {sharedLogState && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 z-[250] animate-fade-in">
          <div className="w-full max-w-5xl h-[85vh] bg-[#0c0d12] border border-canvas-border rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-4 md:p-5 bg-[#0e1015] border-b border-canvas-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-inactive border border-brand-border/20">
                  <Eye className="w-5 h-5 text-brand-active" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm md:text-base font-sans font-extrabold text-white">
                      {sharedLogState.blueprintName}
                    </h2>
                    <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/10 uppercase">
                      {sharedLogState.language || "typescript"}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded font-mono bg-white/5 text-gray-400 border border-white/5">
                      Public Snapshot Preview
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Captured state log: {Object.keys(sharedLogState.files || {}).length} files packed in readonly state
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleImportSharedState}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-success-inactive hover:bg-success-inactive/80 text-success-active border border-success-border/30 text-xs font-bold transition duration-200 cursor-pointer active:scale-95"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Import into Session</span>
                </button>
                <button
                  onClick={handleCloseSharedPreview}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-4 h-4 text-danger-active" />
                </button>
              </div>
            </div>

            {/* Modal Split Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Column: Shared File list */}
              <div className="w-full md:w-64 bg-[#0a0c10] border-r border-canvas-border overflow-y-auto p-4 flex flex-col gap-2">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                  Shared Files Tree
                </h3>
                <div className="space-y-1 mt-1">
                  {Object.keys(sharedLogState.files || {}).map((path) => {
                    const isSelected = path === sharedActivePath;
                    return (
                      <button
                        key={path}
                        onClick={() => setSharedActivePath(path)}
                        className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-[#ff7a00]/10 text-white border-[#ff7a00]/30 font-bold"
                            : "bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-white/[0.02]"
                        }`}
                      >
                        <span className="truncate">{path}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a00]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Premium Code Viewer with Line Numbers */}
              <div className="flex-1 bg-[#07080b] flex flex-col overflow-hidden">
                <div className="px-4 py-2 bg-[#0e1015]/80 border-b border-canvas-border flex items-center justify-between">
                  <span className="font-mono text-[11px] text-gray-400 truncate font-semibold">
                    Viewing: <span className="text-[#00b2ff]">{sharedActivePath}</span>
                  </span>
                  
                  <button
                    onClick={() => {
                      const code = sharedLogState.files[sharedActivePath]?.content || "";
                      navigator.clipboard.writeText(code);
                      setSharedCopied(true);
                      setTimeout(() => setSharedCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    {sharedCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-success-active" />
                        <span className="text-success-active font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3.5 h-3.5" />
                        <span>Copy File Content</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-auto flex text-xs font-mono">
                  {(() => {
                    const content = sharedLogState.files[sharedActivePath]?.content || "";
                    const lines = content.split("\n");
                    return (
                      <>
                        {/* Line Numbers Column */}
                        <div className="py-4 pr-3 text-right text-gray-600 select-none border-r border-white/5 bg-[#0a0b0e] font-semibold min-w-[3.5rem]">
                          {lines.map((_, i) => (
                            <div key={i} className="h-5 leading-5">{i + 1}</div>
                          ))}
                        </div>
                        {/* Scrollable Code Viewer */}
                        <pre className="p-4 flex-1 text-gray-300 overflow-auto select-text leading-5 whitespace-pre">
                          <code>{content}</code>
                        </pre>
                      </>
                    );
                  })()}
                </div>
              </div>

            </div>
            
            {/* Modal Footer Bar */}
            <div className="p-3 bg-[#0e1015] border-t border-canvas-border flex justify-between items-center text-[10px] text-gray-500 font-mono">
              <span>Security Hash Verification: <span className="text-success-active font-bold">PASS (READ-ONLY CRYPTO_LOCK)</span></span>
              <span>snippets.live • Portable AST Snapshot</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
