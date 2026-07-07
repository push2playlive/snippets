import React, { useState, useRef, useEffect } from "react";
import { Terminal, Shield, Sparkles, ChevronRight, Check, X, ArrowRight, RefreshCw, Copy, GitBranch, Terminal as TerminalIcon } from "lucide-react";
import { TerminalLine, ModelTier, SafeFixResponse } from "../types";

interface TerminalGitBashProps {
  lines: TerminalLine[];
  onSendCommand: (cmd: string) => void;
  compilationError: string | null;
  activeFilePath: string | null;
  activeFileContent: string | null;
  modelTier: ModelTier;
  onApplyFix: (fixedCode: string, explanation: string) => void;
  incrementInvocations: () => boolean; // returns false if capped
  onClearError: () => void;
  activeColorClass: string;
  activeBorderColor: string;
  isActive: boolean;
  onFocus: () => void;
  currentBranch?: string;
}

export default function TerminalGitBash({
  lines,
  onSendCommand,
  compilationError,
  activeFilePath,
  activeFileContent,
  modelTier,
  onApplyFix,
  incrementInvocations,
  onClearError,
  activeColorClass,
  activeBorderColor,
  isActive,
  onFocus,
  currentBranch = "main",
}: TerminalGitBashProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<SafeFixResponse | null>(null);
  const [fixError, setFixError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"idle" | "analyzing" | "proposing" | "done">("idle");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, isFixing, currentStep]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmed = inputValue.trim();
      if (trimmed) {
        onSendCommand(trimmed);
        setCommandHistory((prev) => [...prev, trimmed]);
        setHistoryIndex(-1);
        setInputValue("");
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setInputValue(commandHistory[nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInputValue("");
        } else {
          setHistoryIndex(nextIndex);
          setInputValue(commandHistory[nextIndex]);
        }
      }
    }
  };

  const handleTriggerFix = async () => {
    if (!activeFilePath || !activeFileContent || !compilationError) return;

    // Check rate limit/invocations
    const allowed = incrementInvocations();
    if (!allowed) {
      setFixError("Daily free invocation limit (10) reached! Toggle to Pro Tier to get infinite reasoning resolution.");
      return;
    }

    setIsFixing(true);
    setFixError(null);
    setCurrentStep("analyzing");
    setFixResult(null);

    try {
      const response = await fetch("/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: activeFilePath,
          fileContent: activeFileContent,
          error: compilationError,
          modelTier,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to trigger AI fix.");
      }

      const data = await response.json();
      setFixResult(data);
      setCurrentStep("proposing");
    } catch (err: any) {
      console.error(err);
      setFixError(err.message || "Network error while reaching AI model.");
      setCurrentStep("idle");
    } finally {
      setIsFixing(false);
    }
  };

  const handleAcceptFix = () => {
    if (fixResult) {
      onApplyFix(fixResult.fixedCode, fixResult.explanation);
      onClearError();
      setFixResult(null);
      setCurrentStep("idle");
    }
  };

  const handleRejectFix = () => {
    setFixResult(null);
    setCurrentStep("idle");
  };

  // Basic diff helper for the proposed fix
  const renderSimpleDiff = () => {
    if (!activeFileContent || !fixResult) return null;
    const originalLines = activeFileContent.split("\n");
    const fixedLines = fixResult.fixedCode.split("\n");

    // Unified diff-like layout
    return (
      <div className="border border-canvas-border rounded-lg bg-black/40 overflow-hidden font-mono text-[11px] leading-relaxed max-h-[300px] overflow-y-auto">
        <div className="bg-[#161b22] px-4 py-2 border-b border-canvas-border flex justify-between items-center text-[10px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
            <span>Original</span>
            <span className="text-gray-600">vs</span>
            <span className="w-2 h-2 rounded-full bg-green-500/80"></span>
            <span>AI Fixed Code</span>
          </div>
          <span className="text-gray-500 font-sans">Unified Diff View</span>
        </div>
        <div className="p-3 space-y-0.5">
          {fixedLines.map((line, idx) => {
            const originalLine = originalLines[idx];
            const isDifferent = originalLine !== line;

            if (isDifferent) {
              return (
                <div key={idx} className="space-y-0.5">
                  {originalLine !== undefined && (
                    <div className="bg-red-900/20 text-red-300 px-2 py-0.5 border-l-2 border-red-500 flex gap-4">
                      <span className="text-red-500/60 select-none w-6 text-right">- {idx + 1}</span>
                      <span className="whitespace-pre-wrap">{originalLine || " "}</span>
                    </div>
                  )}
                  <div className="bg-green-900/20 text-green-300 px-2 py-0.5 border-l-2 border-green-500 flex gap-4">
                    <span className="text-green-500/60 select-none w-6 text-right">+ {idx + 1}</span>
                    <span className="whitespace-pre-wrap">{line || " "}</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className="text-gray-400 px-2 py-0.5 flex gap-4 hover:bg-white/[0.02]">
                <span className="text-gray-600 select-none w-6 text-right">{idx + 1}</span>
                <span className="whitespace-pre-wrap">{line || " "}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      id="terminal-git-bash" 
      onClick={onFocus}
      style={{
        borderColor: isActive ? activeBorderColor : "rgba(12, 74, 110, 0.2)",
        boxShadow: isActive ? `0 0 20px ${activeBorderColor}1F` : "none"
      }}
      className={`flex flex-col h-full rounded-xl border shadow-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
        isActive 
          ? "bg-[#0a0c10]/95 opacity-100" 
          : "bg-[#060a13]/90 opacity-60 hover:opacity-85 saturate-[0.6] hover:bg-[#090f1d]/90"
      }`}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d1117] border-b border-canvas-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/30"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/30"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/30"></span>
          </div>
          <div className="h-4 w-px bg-white/10 mx-1"></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
            <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>terminal_git_bash</span>
            <span className="text-gray-600">|</span>
            <GitBranch className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400 font-semibold text-[11px]">{currentBranch}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-wider font-semibold font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            Bash Sandbox Mode
          </span>
        </div>
      </div>

      {/* Terminal Lines Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2.5 font-mono text-xs leading-relaxed max-h-[400px] lg:max-h-[550px]">
        {/* Help Banner */}
        <div className="p-3 rounded-lg border border-white/5 bg-white/[0.01] text-[11px] text-gray-400 space-y-1 mb-2">
          <div className="text-blue-400 font-semibold flex items-center gap-1">
            <Terminal className="w-3 h-3" />
            <span>Available Sandbox Commands:</span>
          </div>
          <p className="text-[10px]">
            • <code className="text-orange-400">npm run build</code> / <code className="text-orange-400">cargo build</code>: Run compilers & trigger diagnostics
          </p>
          <p className="text-[10px]">
            • <code className="text-green-400">git clone &lt;repo&gt;</code>, <code className="text-green-400">git checkout -b &lt;branch&gt;</code>, <code className="text-green-400">git commit</code>, <code className="text-green-400">git push</code>
          </p>
          <p className="text-[10px]">
            • <code className="text-blue-400">clear</code>: Empty the screen buffer
          </p>
        </div>

        {lines.map((line, idx) => {
          let typeColor = "text-gray-300";
          let prefix = "";

          if (line.type === "info") {
            typeColor = "text-lang-blue-active"; // Blue for infrastructure status
            prefix = "ℹ ";
          } else if (line.type === "success") {
            typeColor = "text-lang-green-active font-semibold"; // Green for compilation success
            prefix = "✔ ";
          } else if (line.type === "error") {
            typeColor = "text-lang-red-active font-medium bg-red-950/15 p-1 rounded-sm block border-l-2 border-red-500"; // Red for syntax/layout breaks
            prefix = "✖ ";
          } else if (line.type === "input") {
            typeColor = "text-white";
            prefix = "$ ";
          } else if (line.type === "system") {
            typeColor = "text-lang-orange-active font-semibold";
            prefix = "⚡ ";
          }

          return (
            <div key={idx} className="whitespace-pre-wrap">
              <span className="text-gray-600 mr-2 text-[10px] select-none">[{line.timestamp}]</span>
              <span className={typeColor}>{prefix}{line.text}</span>
            </div>
          );
        })}

        {/* AI Auto Fix-It Banner inside Terminal when error is present */}
        {compilationError && currentStep === "idle" && (
          <div className="mt-4 p-4 rounded-xl border border-lang-red-border bg-lang-red-inactive/40 backdrop-blur-md space-y-3 animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex gap-2.5">
                <div className="p-1.5 rounded bg-red-500/20 text-lang-red-active">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-gray-200 text-sm">Compilation Error Trapped!</h4>
                  <p className="font-sans text-[11px] text-gray-400 mt-0.5">
                    snippets.live has intercepted a syntax or type check fail in your workspace.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-sans font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                RED STATE
              </span>
            </div>

            <div className="p-2.5 rounded bg-black/60 border border-white/5 font-mono text-[11px] text-red-300 whitespace-pre-wrap select-text">
              {compilationError}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <Sparkles className="w-3 h-3 text-lang-blue-active animate-pulse" />
                <span>Fix-It Loop using <strong>{modelTier === "pro" ? "Gemini 3 Pro" : "Gemini 2.5 Flash-Lite"}</strong></span>
              </div>
              <button
                id="btn-trigger-ai-fix"
                onClick={handleTriggerFix}
                className="px-3.5 py-1.5 rounded-lg bg-lang-orange-active hover:bg-orange-500 text-black font-semibold font-sans text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>Safe Auto-Repair Code</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading / Repairing state */}
        {currentStep === "analyzing" && (
          <div className="p-4 rounded-xl border border-lang-blue-border bg-lang-blue-inactive/30 space-y-3 animate-pulse-slow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-lang-blue-active animate-spin" />
                <span className="font-sans font-semibold text-gray-200">AI Fix-It Loop Active</span>
              </div>
              <span className="text-[10px] text-lang-blue-active bg-sky-500/10 px-2 py-0.5 rounded font-mono font-bold">
                Prompt Cached (85-90% Discount)
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] text-gray-400 font-sans">
              <p className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span>Trapped error context: <code className="bg-black/40 px-1 py-0.5 rounded text-red-400">{activeFilePath}</code></span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span>Constructing system payload prompts...</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                <span>Generating repair resolution in container via Gemini...</span>
              </p>
            </div>
          </div>
        )}

        {/* Propose AI Fix UI */}
        {currentStep === "proposing" && fixResult && (
          <div className="p-4 rounded-xl border border-lang-green-border bg-[#121c17] space-y-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex gap-2">
                <div className="p-1.5 rounded bg-green-500/20 text-lang-green-active">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-gray-200 text-sm">AI Resolution Ready!</h4>
                  <p className="font-sans text-[11px] text-gray-400 mt-0.5">
                    A secure repair path was formulated. Review the unified diff below:
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-green-500/20 text-lang-green-active px-2 py-0.5 rounded">
                STABLE FIX MATCH
              </span>
            </div>

            {/* Explanation card */}
            <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-gray-300 font-sans text-xs space-y-1">
              <div className="text-[10px] text-lang-blue-active font-semibold uppercase tracking-wider font-mono">
                AI Explanation:
              </div>
              <p className="leading-relaxed">{fixResult.explanation}</p>
              {fixResult.isDemoFallback && (
                <p className="text-[10px] text-orange-400 font-mono mt-1">
                  ⚠️ Note: Running in API Key Demo Safe Fallback mode. Configure your API key to use real Gemini model repairs!
                </p>
              )}
            </div>

            {/* Diff View */}
            {renderSimpleDiff()}

            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-sans">
                <span>Atomic Repair Target:</span>
                <code className="bg-black/50 px-1.5 py-0.5 rounded text-white">{activeFilePath}</code>
              </div>
              <div className="flex gap-2">
                <button
                  id="btn-reject-fix"
                  onClick={handleRejectFix}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-sans text-xs font-medium cursor-pointer"
                >
                  Reject & Close
                </button>
                <button
                  id="btn-apply-fix"
                  onClick={handleAcceptFix}
                  className="px-3.5 py-1.5 rounded-lg bg-lang-green-active hover:bg-green-500 text-black font-semibold font-sans text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept & Apply Repair</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Local Error feedback */}
        {fixError && (
          <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-950/20 text-xs text-red-300 font-sans flex items-start gap-2">
            <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-semibold text-white">Repair Engine Stalled</span>
              <p className="text-[11px] leading-relaxed text-gray-400">{fixError}</p>
            </div>
          </div>
        )}

        <div ref={consoleEndRef} />
      </div>

      {/* Terminal Command Input */}
      <div className="p-3 bg-[#0d1117] border-t border-canvas-border flex items-center gap-2 font-mono text-xs">
        <span className="text-gray-500 font-semibold select-none">$</span>
        <input
          id="terminal-command-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type git commit, cargo build, clear... and press Enter"
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600 caret-blue-400 font-mono text-xs h-7"
          autoComplete="off"
        />
        <div className="flex items-center gap-1 text-[9px] text-gray-600 bg-black/40 px-1.5 py-1 rounded">
          <kbd className="font-sans">Enter</kbd>
          <span>to run</span>
        </div>
      </div>
    </div>
  );
}
