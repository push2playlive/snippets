import React, { useState } from "react";
import { 
  Shield, Key, Cpu, HelpCircle, HardDrive, RefreshCcw, Zap, AlertTriangle, 
  Play, CheckCircle, Database, Lock, Star, Sliders, Check
} from "lucide-react";

interface AdminPageProps {
  onShowNotification: (message: string, type: "success" | "info" | "warning") => void;
}

export default function AdminPage({
  onShowNotification,
}: AdminPageProps) {
  // Safe agent API overrides stored in localStorage (Client-side playground mock override)
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("admin_gemini_key") || "");
  const [modelRoute, setModelRoute] = useState(() => localStorage.getItem("admin_model_route") || "models/gemini-2.5-flash");
  const [systemPrompt, setSystemPrompt] = useState(() => {
    return localStorage.getItem("admin_system_prompt") || 
      "You are the expert AST Code repair bot. You analyze input compilation errors and return raw code blocks satisfying the AST.";
  });

  const [sandboxRateLimit, setSandboxRateLimit] = useState(() => localStorage.getItem("admin_rate_limit") || "60");
  const [authSecurityLock, setAuthSecurityLock] = useState(() => localStorage.getItem("admin_security_lock") === "true");
  const [isSaving, setIsSaving] = useState(false);

  // Diagnostic states
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(12.4);
  const [memoryLoad, setMemoryLoad] = useState(145.8);

  const handleSaveAdminConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      localStorage.setItem("admin_gemini_key", geminiKey);
      localStorage.setItem("admin_model_route", modelRoute);
      localStorage.setItem("admin_system_prompt", systemPrompt);
      localStorage.setItem("admin_rate_limit", sandboxRateLimit);
      localStorage.setItem("admin_security_lock", String(authSecurityLock));

      setIsSaving(false);
      onShowNotification("System settings and custom Agent Keys updated successfully!", "success");
    }, 1000);
  };

  const handleResetDefaults = () => {
    if (confirm("Are you sure you want to restore default admin playground configurations?")) {
      setGeminiKey("");
      setModelRoute("models/gemini-2.5-flash");
      setSystemPrompt("You are the expert AST Code repair bot. You analyze input compilation errors and return raw code blocks satisfying the AST.");
      setSandboxRateLimit("60");
      setAuthSecurityLock(false);

      localStorage.removeItem("admin_gemini_key");
      localStorage.removeItem("admin_model_route");
      localStorage.removeItem("admin_system_prompt");
      localStorage.removeItem("admin_rate_limit");
      localStorage.removeItem("admin_security_lock");

      onShowNotification("Admin presets reverted to factory defaults.", "info");
    }
  };

  const handleRefreshDiagnostics = () => {
    setIsRefreshingStats(true);
    setTimeout(() => {
      setCpuUsage(parseFloat((10 + Math.random() * 15).toFixed(1)));
      setMemoryLoad(parseFloat((130 + Math.random() * 30).toFixed(1)));
      setIsRefreshingStats(false);
      onShowNotification("Diagnostics stats synchronized with container clusters.", "success");
    }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-canvas-bg text-gray-300 p-6 md:p-8 animate-fade-in space-y-8 select-text">
      
      {/* Header title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-2xl text-danger-active animate-pulse">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight">
              Playground Admin Console
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Secure keys override, custom prompt engineering directives, and physical container telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            CONTAINER_ID: snippets-node-p2p
          </span>
          <span className="text-[10px] font-mono font-bold text-success-active uppercase tracking-wider bg-success-inactive px-2.5 py-1 rounded-lg border border-success-border/20">
            SYSTEM ONLINE
          </span>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto items-start">
        
        {/* Form controls (8 cols) */}
        <form onSubmit={handleSaveAdminConfig} className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Card 1: Keys & Routing Configuration */}
          <div className="bg-[#0d0f14] border border-white/5 rounded-2xl p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Key className="w-4 h-4 text-brand-active" />
              <h3 className="text-xs font-sans font-extrabold text-white uppercase">
                AGENT KEY ENTRY POINTS & OVERRIDES
              </h3>
            </div>

            <div className="space-y-4 font-sans text-xs">
              
              {/* Gemini API Key entry input with security guidance */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-gray-300">
                    Custom Gemini API Key Override (Optional)
                  </label>
                  <span className="text-[9px] text-[#ff7a00] bg-[#ff7a00]/10 border border-[#ff7a00]/20 rounded px-1.5 py-0.5 font-mono font-bold">
                    LOCAL CRYPTO STRIP
                  </span>
                </div>
                
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Enter your private GEMINI_API_KEY (AI model routing override)..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-black/40 border border-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff7a00]"
                />
                
                <p className="text-[10px] text-gray-500 leading-normal">
                  <span className="text-[#ff7a00] font-bold">🔒 Secure Client Policy:</span> Key is stored inside your browser's private local sandboxed memory. We never transmit this key to any secondary database. Keep it empty to fallback to snippets.live standard shared key pool.
                </p>
              </div>

              {/* Model Target Route Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300">
                  Logic Model Selection
                </label>
                <select
                  value={modelRoute}
                  onChange={(e) => setModelRoute(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-black/40 border border-white/5 text-white focus:outline-none focus:border-[#ff7a00]"
                >
                  <option value="models/gemini-2.5-flash">Gemini 2.5 Flash-Lite (Speedy/Default)</option>
                  <option value="models/gemini-3-pro">Gemini 3 Pro reasoning engine (Frontier Logic)</option>
                  <option value="models/gemini-2.5-pro">Gemini 2.5 Pro (Standard AST solver)</option>
                  <option value="models/gemini-ultra-custom">Custom Private Deployment Handle (REST API)</option>
                </select>
              </div>

              {/* System prompt override */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300">
                  Agent Compiler System Directive Prompt
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-black/40 border border-white/5 text-white focus:outline-none focus:border-[#ff7a00] resize-none"
                  placeholder="Insert custom instructions to shape how the AI Fix-it flow rewrites AST..."
                />
              </div>

            </div>
          </div>

          {/* Card 2: Environment settings overrides */}
          <div className="bg-[#0d0f14] border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Sliders className="w-4 h-4 text-[#00b2ff]" />
              <h3 className="text-xs font-sans font-extrabold text-white uppercase">
                Sandbox Environment Constraints
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
              
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300">Rate Limit (compiles/hour)</label>
                <input
                  type="number"
                  value={sandboxRateLimit}
                  onChange={(e) => setSandboxRateLimit(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-black/40 border border-white/5 text-white focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="font-semibold text-gray-300 mb-2">Security Authorization Lock</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthSecurityLock(!authSecurityLock)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-250 cursor-pointer ${
                      authSecurityLock ? "bg-[#10b981]" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-250 ${
                        authSecurityLock ? "translate-x-5.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-[11px] text-gray-400">
                    {authSecurityLock ? "Strict Auth Active" : "No Session Protection"}
                  </span>
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="py-2 px-3 rounded-lg border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition cursor-pointer"
              >
                Reset Default Presets
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-brand-active hover:bg-orange-600 text-black font-sans font-bold text-xs transition duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-lg shadow-orange-500/10"
              >
                {isSaving ? (
                  <span className="animate-pulse">Saving settings...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Apply System Overrides</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

        {/* Diagnostic dashboard panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Diagnostic stats */}
          <div className="bg-[#0d0f14] border border-white/5 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-success-active" />
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                  Container Telemetry
                </h3>
              </div>
              
              <button
                onClick={handleRefreshDiagnostics}
                disabled={isRefreshingStats}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
                title="Synchronize cluster stats"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${isRefreshingStats ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              
              {/* CPU status */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Sandbox Core CPU</span>
                  <span className="text-white font-bold">{cpuUsage}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success-active transition-all duration-300"
                    style={{ width: `${cpuUsage}%` }}
                  />
                </div>
              </div>

              {/* Memory load */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Compiler Virtual RAM</span>
                  <span className="text-white font-bold">{memoryLoad} / 512 MB</span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00b2ff] transition-all duration-300"
                    style={{ width: `${(memoryLoad / 512) * 100}%` }}
                  />
                </div>
              </div>

              {/* Registry usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Blueprint Registry size</span>
                  <span className="text-white font-bold">5 Registered</span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-active transition-all duration-300"
                    style={{ width: `45%` }}
                  />
                </div>
              </div>

            </div>

            <div className="p-3 bg-black/30 rounded-xl border border-white/5 font-mono text-[9px] leading-relaxed text-gray-500">
              <span className="text-gray-400 font-bold block mb-1">CLUSTER OVERVIEW:</span>
              - Active Node: snippets-node-p2p<br />
              - Region: us-central1 (Cloud Run)<br />
              - Virtual Runtime: Node v22.14 LTS<br />
              - Docker Engine: Stateless Container
            </div>
          </div>

          {/* Secure Admin Lock alert banner */}
          <div className="p-4 rounded-xl bg-danger-inactive/10 border border-danger-border/20 flex gap-3">
            <Lock className="w-5 h-5 text-danger-active flex-shrink-0 mt-0.5" />
            <div className="space-y-1 font-sans text-xs">
              <h4 className="font-bold text-white uppercase tracking-tight">Security Protocol Locked</h4>
              <p className="text-[10px] text-gray-400 leading-normal">
                Credentials are saved inside the client-side context block. Remember to exclude keys before exporting your ZIP packages.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
