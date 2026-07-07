import React, { useState } from "react";
import { Shield, Sparkles, Database, Trash2, Cpu, HelpCircle, HardDrive, RefreshCcw, Zap, AlertTriangle, Play, CheckCircle, GitBranch, Key, Eye, EyeOff } from "lucide-react";
import { ModelTier, AIInvocation } from "../types";

interface TokenTierConfigProps {
  modelTier: ModelTier;
  onChangeTier: (tier: ModelTier) => void;
  invocationsCount: number;
  maxInvocations: number;
  aiInvocations: AIInvocation[];
  onWipeSandbox: () => void;
  activeColorClass: string;
  compilationError: string | null;
  activeTheme: "sync" | "cyberpunk" | "nord" | "emerald" | "sunset";
  onChangeTheme: (theme: "sync" | "cyberpunk" | "nord" | "emerald" | "sunset") => void;
  isActive: boolean;
  onFocus: () => void;
  currentBranch?: string;
  githubToken?: string;
  onChangeGithubToken?: (token: string) => void;
  githubRepo?: string;
  onChangeGithubRepo?: (repo: string) => void;
  branchesList?: string[];
  onCheckoutBranch?: (branch: string) => void;
  onSyncRepository?: () => void;
  isSyncing?: boolean;
}

export default function TokenTierConfig({
  modelTier,
  onChangeTier,
  invocationsCount,
  maxInvocations,
  aiInvocations,
  onWipeSandbox,
  activeColorClass,
  compilationError,
  activeTheme,
  onChangeTheme,
  isActive,
  onFocus,
  currentBranch = "main",
  githubToken = "",
  onChangeGithubToken,
  githubRepo = "push2playlive/snippets-live-export",
  onChangeGithubRepo,
  branchesList = ["main", "dev", "feature/auth", "experimental"],
  onCheckoutBranch,
  onSyncRepository,
  isSyncing = false,
}: TokenTierConfigProps) {
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Compute simulated token savings
  const totalCostSaved = aiInvocations.reduce((acc, current) => {
    const baseCost = current.model.includes("Pro") ? 0.015 : 0.002;
    const saved = baseCost * (current.costSavedPercent / 100);
    return acc + saved;
  }, 0);

  // Handle programmatical click dispatch to trigger the Terminal fix-it loop
  const handleTriggerAiFix = () => {
    const btn = document.getElementById("btn-trigger-ai-fix");
    if (btn) {
      btn.click();
    } else {
      // Fallback alert or message if terminal is in a different step
      const termInput = document.querySelector("input[placeholder*='Type a command']");
      if (termInput) {
        alert("The AI Fix-it flow is already processing or proposed in the terminal. Please inspect the Terminal Console at the bottom!");
      }
    }
  };

  return (
    <div 
      onClick={onFocus}
      style={{
        borderColor: isActive ? "rgba(255, 122, 0, 0.4)" : "rgba(12, 74, 110, 0.2)",
        boxShadow: isActive ? "0 0 20px rgba(255, 122, 0, 0.05)" : "none"
      }}
      className={`flex flex-col h-full rounded-xl border shadow-2xl overflow-hidden font-sans transition-all duration-300 cursor-pointer ${
        isActive 
          ? "bg-[#13151a] opacity-100" 
          : "bg-[#0b101d]/90 opacity-60 hover:opacity-85 saturate-[0.7] hover:bg-[#0e1526]/90"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3.5 bg-[#0d0e12] border-b border-canvas-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-info-active" />
          <span className="font-sans font-bold text-sm text-gray-200">Intelligence & Cost Panel</span>
        </div>
        <span className="text-[9px] font-mono font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
          v2.0
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* BUILD ERROR PANEL (Active Error Resolution Card) */}
        {compilationError ? (
          <div className="p-4 rounded-xl bg-danger-inactive border border-danger-border/30 space-y-3.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-active opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-danger-active"></span>
                </span>
                <span className="font-mono text-[10px] font-bold text-danger-active uppercase tracking-wider">
                  BUILD ERROR FOUND
                </span>
              </div>
              <span className="text-[9px] text-gray-400 font-mono">RED STATE</span>
            </div>

            <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-[10px] text-red-300 leading-normal max-h-[110px] overflow-y-auto">
              {compilationError.split("\n")[0] || "Property 'status' does not exist on type 'Connection'."}
            </div>

            <button
              onClick={handleTriggerAiFix}
              className="w-full py-2.5 px-4 bg-danger-active hover:bg-red-600 text-white font-bold font-sans text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-red-500/15 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
              <span>APPLY AI FIX-IT</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-success-inactive border border-success-border/20 flex flex-col items-center justify-center text-center py-6 space-y-2">
            <div className="p-2.5 rounded-full bg-success-active/15 text-success-active">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-200">Sandbox Stable</h4>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[200px]">
                No code compilation errors. Environment status is healthy and fully optimized.
              </p>
            </div>
          </div>
        )}

        {/* INTELLIGENCE INSIGHTS DASHBOARD */}
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-mono">
            INTELLIGENCE INSIGHTS
          </span>

          {/* Model Used Selector with active cyan indicator bar */}
          <div className="space-y-2">
            <label className="text-[10px] font-medium text-gray-400 block font-sans">
              Routing Engine Strategy
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5 relative">
              <button
                onClick={() => onChangeTier("free")}
                className={`py-2 px-1 rounded-lg font-medium text-xs flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative z-10 ${
                  modelTier === "free"
                    ? "text-[#00b2ff]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <span className="font-semibold text-[10px]">Gemini 2.5 Flash-Lite</span>
                <span className="text-[8px] opacity-75 font-mono">Light/Speed</span>
                {modelTier === "free" && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-info-active rounded"></span>
                )}
              </button>
              <button
                onClick={() => onChangeTier("pro")}
                className={`py-2 px-1 rounded-lg font-medium text-xs flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative z-10 ${
                  modelTier === "pro"
                    ? "text-[#ff7a00]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <span className="font-bold text-[10px] flex items-center gap-1 justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-brand-active" />
                  <span>Gemini 3 Pro</span>
                </span>
                <span className="text-[8px] opacity-75 font-mono">Frontier / Logic</span>
                {modelTier === "pro" && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-brand-active rounded"></span>
                )}
              </button>
            </div>
          </div>

          {/* THEME SELECTOR - EXPLICIT REQUEST RESOLVER */}
          <div className="space-y-2 p-3 bg-black/20 border border-white/5 rounded-xl">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                UI Theme & Color Scheme
              </label>
              <span className="text-[8px] font-bold text-brand-active uppercase font-mono px-1.5 py-0.5 bg-brand-inactive rounded">
                PRO OVERRIDE
              </span>
            </div>
            
            <p className="text-[10px] text-gray-500 leading-normal mb-1">
              Select a custom visual style for the workspace theme highlights:
            </p>

            <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
              <button
                onClick={() => onChangeTheme("sync")}
                className={`py-1.5 px-2 rounded border flex items-center justify-between transition-all cursor-pointer ${
                  activeTheme === "sync"
                    ? "bg-brand-inactive text-brand-active border-brand-border/50"
                    : "bg-black/30 text-gray-400 border-white/5 hover:text-gray-200"
                }`}
              >
                <span>🔄 LANG SYNC</span>
              </button>
              <button
                onClick={() => onChangeTheme("cyberpunk")}
                className={`py-1.5 px-2 rounded border flex items-center justify-between transition-all cursor-pointer ${
                  activeTheme === "cyberpunk"
                    ? "bg-purple-950/40 text-[#ff007f] border-[#ff007f]/40 font-bold"
                    : "bg-black/30 text-gray-400 border-white/5 hover:text-gray-200"
                }`}
              >
                <span>👾 CYBERPUNK</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff007f]"></span>
              </button>
              <button
                onClick={() => onChangeTheme("nord")}
                className={`py-1.5 px-2 rounded border flex items-center justify-between transition-all cursor-pointer ${
                  activeTheme === "nord"
                    ? "bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/40 font-bold"
                    : "bg-black/30 text-gray-400 border-white/5 hover:text-gray-200"
                }`}
              >
                <span>❄️ NORDIC</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span>
              </button>
              <button
                onClick={() => onChangeTheme("emerald")}
                className={`py-1.5 px-2 rounded border flex items-center justify-between transition-all cursor-pointer ${
                  activeTheme === "emerald"
                    ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/40 font-bold"
                    : "bg-black/30 text-gray-400 border-white/5 hover:text-gray-200"
                }`}
              >
                <span>🌿 EMERALD</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              </button>
              <button
                onClick={() => onChangeTheme("sunset")}
                className={`py-1.5 px-2 rounded border flex items-center justify-between transition-all cursor-pointer ${
                  activeTheme === "sunset"
                    ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/40 font-bold"
                    : "bg-black/30 text-gray-400 border-white/5 hover:text-gray-200"
                }`}
              >
                <span>🌅 SUNSET</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
              </button>
            </div>
          </div>

          {/* Tokens Saved Counter with Active Green Status Bar */}
          <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400">Tokens Saved Counter</span>
              <span className="text-[9px] font-mono text-success-active font-bold bg-success-inactive px-1.5 py-0.5 rounded">
                89.2% (Cached)
              </span>
            </div>

            {/* Active Green Status Indicator Bar */}
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-success-active transition-all duration-500 rounded-full"
                  style={{ width: "89.2%" }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                <span>0% Saved</span>
                <span>89.2% Cache Hit</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[10px]">
              <span className="text-gray-500">Total API Savings (Simulated):</span>
              <span className="text-success-active font-mono font-bold">${totalCostSaved.toFixed(5)}</span>
            </div>
          </div>

          {/* Transaction Telemetry Logs */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-mono">
              Transaction Telemetry
            </span>
            <div className="bg-[#0d0e12] p-3 rounded-xl border border-white/5 font-mono text-[9px] space-y-2 max-h-[150px] overflow-y-auto">
              {aiInvocations.length === 0 ? (
                <div className="text-gray-600 italic leading-relaxed">
                  No AI invocations generated in this session. Trigger compilation errors & resolve them to stream cache log telemetry.
                </div>
              ) : (
                aiInvocations.map((inv, idx) => (
                  <div key={idx} className="border-b border-white/5 pb-2 last:border-0 last:pb-0 space-y-0.5 text-gray-400">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-info-active font-bold">CACHE_HIT #{aiInvocations.length - idx}</span>
                      <span className="text-gray-500">{inv.timestamp}</span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span>Model: {inv.model}</span>
                      <span className="text-success-active font-bold">-{inv.costSavedPercent}% cost</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Git Repository Sync panel */}
      <div className="p-4 bg-[#0d0e12] border-t border-canvas-border space-y-3">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
          <GitBranch className="w-3.5 h-3.5 text-success-active animate-pulse" />
          <span>GitHub Repository Sync</span>
        </div>

        <div className="space-y-2.5">
          {/* Target Repository */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 block font-mono">Target Repository</label>
            <input
              type="text"
              value={githubRepo}
              onChange={(e) => onChangeGithubRepo?.(e.target.value)}
              placeholder="username/repository-name"
              className="w-full bg-[#14161d] text-xs text-gray-200 border border-white/5 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-success-active transition font-mono"
            />
          </div>

          {/* Personal Access Token */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 block font-mono flex justify-between items-center">
              <span>Personal Access Token (PAT)</span>
              <span className="text-[9px] text-gray-500">Local Session Only</span>
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={githubToken}
                onChange={(e) => onChangeGithubToken?.(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#14161d] text-xs text-gray-200 border border-white/5 rounded-lg pl-8 pr-8 py-1.5 focus:outline-none focus:border-success-active transition font-mono"
              />
              <Key className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
              >
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Checkout Active Branch */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 block font-mono">Checkout Active Branch</label>
            <div className="relative">
              <select
                value={currentBranch}
                onChange={(e) => onCheckoutBranch?.(e.target.value)}
                className="w-full bg-[#14161d] text-xs text-gray-200 border border-white/5 rounded-lg pl-2.5 pr-8 py-1.5 appearance-none focus:outline-none focus:border-success-active transition font-mono cursor-pointer"
              >
                {branchesList.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch === currentBranch ? `* ${branch} (Active)` : branch}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Sync Trigger Action Button */}
          <button
            onClick={onSyncRepository}
            disabled={isSyncing}
            className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              isSyncing
                ? "bg-success-inactive/10 border-success-inactive/30 text-success-active cursor-not-allowed"
                : "bg-success-active/10 border-success-active/30 hover:border-success-active/60 text-success-active hover:bg-success-active/20"
            }`}
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-success-active" : ""}`} />
            <span>{isSyncing ? "Synchronizing Repo..." : "Sync with Repository"}</span>
          </button>
        </div>
      </div>

      {/* Stateless Session Reset Container */}
      <div className="p-4 bg-[#0d0e12] border-t border-canvas-border space-y-3">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
          <HardDrive className="w-3.5 h-3.5 text-danger-active" />
          <span>Stateless Sandbox Memory</span>
        </div>

        {!showWipeConfirm ? (
          <button
            onClick={() => setShowWipeConfirm(true)}
            className="w-full py-2 px-3 rounded-lg border border-danger-border/30 hover:border-danger-border/60 bg-danger-inactive/20 hover:bg-danger-inactive/40 text-danger-active text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Volatile Memory</span>
          </button>
        ) : (
          <div className="space-y-2 animate-fade-in text-[10px]">
            <p className="text-gray-400 leading-normal font-sans">
              Discard all local code edits, reset blueprints, and clear terminal memory?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="py-1.5 px-2 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onWipeSandbox();
                  setShowWipeConfirm(false);
                }}
                className="py-1.5 px-2 rounded-md bg-danger-active hover:bg-red-600 text-white font-semibold cursor-pointer"
              >
                Yes, Wipe All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
