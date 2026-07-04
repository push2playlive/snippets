import React, { useState, useEffect, useRef } from "react";
import { 
  X, Sparkles, Database, Search, Send, Key, Shield, Lock, 
  RefreshCw, Play, Check, AlertTriangle, Cpu, Layers, Eye, 
  Activity, Clock, Code, Terminal, Trash2, CheckCircle2
} from "lucide-react";
import { CodeBlueprint } from "../types";

interface LivePreviewModalProps {
  blueprint: CodeBlueprint;
  onClose: () => void;
  onImport: () => void;
}

export default function LivePreviewModal({
  blueprint,
  onClose,
  onImport,
}: LivePreviewModalProps) {
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Add line to terminal helper
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  // Scroll to bottom of console
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLogs]);

  // Initial logs
  useEffect(() => {
    setConsoleLogs([]);
    addLog(`System: Launching interactive live preview for '${blueprint.name}'...`);
    addLog(`Sandbox: Initializing simulated '${blueprint.language}' runtime container.`);
    addLog(`Success: Virtual sandbox compilation completed. Interactive UI loaded.`);
  }, [blueprint]);

  const clearLogs = () => {
    setConsoleLogs([]);
    addLog("Sandbox: Console logs cleared.");
  };

  // ==========================================
  // STATE & EFFECTS: Debounce UI Filter Hook
  // ==========================================
  const [debounceInput, setDebounceInput] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const ALL_ITEMS = [
    { name: "React Debouncer Utility", type: "React/TS", size: "1.2 KB" },
    { name: "Rust ThreadSafeCache Module", type: "Rust API", size: "4.5 KB" },
    { name: "Node JWT Middleware", type: "Node.js", size: "2.8 KB" },
    { name: "Ruby Async Webhook Worker", type: "Ruby Rails", size: "3.1 KB" },
    { name: "Docker Container Configurator", type: "DevOps", size: "1.5 KB" },
    { name: "Gemini AI Code Fixer API", type: "AI Integration", size: "8.6 KB" },
    { name: "Webpack Bundler Config", type: "React/TS", size: "5.1 KB" },
  ];

  const handleDebounceInputChange = (val: string) => {
    setDebounceInput(val);
    setIsTyping(true);
    addLog(`Keyboard: Character typed -> "${val}"`);

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      setDebouncedValue(val);
      setIsTyping(false);
      addLog(`useDebounce: Timer expired! Debounced state synced to: "${val}"`);
    }, 400); // 400ms debounce
  };

  const filteredItems = ALL_ITEMS.filter(item => 
    item.name.toLowerCase().includes(debouncedValue.toLowerCase()) ||
    item.type.toLowerCase().includes(debouncedValue.toLowerCase())
  );

  // ==========================================
  // STATE & LOGIC: Rust Warp Cache Server
  // ==========================================
  const [cacheKeyInput, setCacheKeyInput] = useState("");
  const [cacheValInput, setCacheValInput] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [cacheStore, setCacheStore] = useState<Record<string, string>>({
    "health": "OK",
    "version": "v1.4.2",
    "compiler": "Cargo rustc 1.78",
  });

  const handleInsertCache = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cacheKeyInput.trim() || !cacheValInput.trim()) return;

    const k = cacheKeyInput.trim();
    const v = cacheValInput.trim();

    addLog(`[Warp Router] POST /cache/insert { "${k}": "${v}" }`);
    addLog(`[ThreadSafeCache] Acquiring Mutex write lock...`);
    
    setTimeout(() => {
      setCacheStore(prev => ({ ...prev, [k]: v }));
      addLog(`[ThreadSafeCache] Mutual exclusion lock satisfied. Inserted key '${k}'.`);
      setCacheKeyInput("");
      setCacheValInput("");
    }, 200);
  };

  const handleLookupCache = () => {
    if (!searchKey.trim()) return;
    const k = searchKey.trim();

    addLog(`[Warp Router] GET /cache/lookup?key=${k}`);
    addLog(`[ThreadSafeCache] Acquiring Mutex read lock...`);

    setTimeout(() => {
      const val = cacheStore[k];
      if (val !== undefined) {
        addLog(`[ThreadSafeCache] Key hit: "${k}" -> "${val}"`);
      } else {
        addLog(`[ThreadSafeCache] Key miss: "${k}" (not found in Mutex map)`);
      }
    }, 150);
  };

  // ==========================================
  // STATE & LOGIC: Node.js JWT Middleware Hub
  // ==========================================
  const [jwtTokenState, setJwtTokenState] = useState<"valid" | "expired" | "none">("valid");
  const [rapidClicksCount, setRapidClicksCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const clickResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sendJwtRequest = () => {
    if (isRateLimited) {
      addLog(`[Rate Limiter] REJECTED. IP Blocked. System status: 429 Too Many Requests.`);
      return;
    }

    // Increment click counts for rate-limiting simulation
    setRapidClicksCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setIsRateLimited(true);
        addLog(`[Rate Limiter] TRIPPED! Rapid requests spike detected (5 clicks). Initiating 429 response.`);
        
        // Auto reset rate limit after 4 seconds
        setTimeout(() => {
          setIsRateLimited(false);
          setRapidClicksCount(0);
          addLog(`[Rate Limiter] IP cooled down. 429 block lifted.`);
        }, 4000);
      }
      return next;
    });

    // Reset rate limiter count if inactive
    if (clickResetTimerRef.current) clearTimeout(clickResetTimerRef.current);
    clickResetTimerRef.current = setTimeout(() => {
      setRapidClicksCount(0);
    }, 2000);

    const tokenHeader = jwtTokenState === "valid" 
      ? "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_dev_payload"
      : jwtTokenState === "expired"
      ? "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired_payload"
      : "";

    addLog(`[Express Engine] Dispatching request: GET /api/secure-data`);
    if (tokenHeader) {
      addLog(`[HTTP Header] Authorization: ${tokenHeader.substring(0, 30)}...`);
    } else {
      addLog(`[HTTP Header] Authorization: None / Missing`);
    }

    setTimeout(() => {
      if (jwtTokenState === "valid") {
        addLog(`[JWT Middleware] Token validated successfully. Claims: { role: "Senior AST Engineer" }`);
        addLog(`[Express Engine] Response: 200 OK -> { secret_data: "Safe AST playgrounds." }`);
      } else if (jwtTokenState === "expired") {
        addLog(`[JWT Middleware] Token parsing error: jwt expired.`);
        addLog(`[Express Engine] Response: 403 Forbidden -> { error: "Token is no longer valid" }`);
      } else {
        addLog(`[JWT Middleware] Authorization credentials missing.`);
        addLog(`[Express Engine] Response: 401 Unauthorized -> { error: "Missing credential token" }`);
      }
    }, 250);
  };

  // ==========================================
  // STATE & LOGIC: Ruby Webhook Sync Worker
  // ==========================================
  const [selectedWebhookEvent, setSelectedWebhookEvent] = useState<"user.signup" | "payment.success">("user.signup");
  const [webhookPayload, setWebhookPayload] = useState<string>(() => {
    return JSON.stringify({
      event: "user.signup",
      email: "push2playlive@gmail.com",
      plan: "pro_active",
      timestamp: new Date().toISOString()
    }, null, 2);
  });

  const handleWebhookTypeChange = (type: "user.signup" | "payment.success") => {
    setSelectedWebhookEvent(type);
    if (type === "user.signup") {
      setWebhookPayload(JSON.stringify({
        event: "user.signup",
        email: "push2playlive@gmail.com",
        plan: "pro_active",
        timestamp: new Date().toISOString()
      }, null, 2));
    } else {
      setWebhookPayload(JSON.stringify({
        event: "payment.success",
        customer: "push2playlive@gmail.com",
        amount: 25.50,
        invoice_id: "INV-992120",
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  };

  const dispatchWebhook = () => {
    let parsed;
    try {
      parsed = JSON.parse(webhookPayload);
    } catch (e) {
      addLog(`[Webhook Router] JSON syntax error in webhook dispatcher payload.`);
      return;
    }

    addLog(`[Rails Router] POST /webhooks/receive { event: "${parsed.event}" }`);
    addLog(`[Rails Controller] WebhookController#create triggered.`);

    setTimeout(() => {
      addLog(`[Rails Controller] ActiveJob: Enqueuing WebhookSyncWorker with payload.`);
      addLog(`[ActiveJob] [WebhookSyncWorker] Enqueued to Redis Queue ':webhooks'`);
      
      // Simulate async worker popping queue
      setTimeout(() => {
        addLog(`[ActiveJob] [WebhookSyncWorker] Job started. Thread ID: 0x7fa92`);
        addLog(`[Rails Logger] [Sync Worker] Triggering event parsing for event: "${parsed.event}"`);
        if (parsed.event === "user.signup") {
          addLog(`[Rails Logger] [Sync Worker] Provisioning new container context for ${parsed.email}...`);
        } else {
          addLog(`[Rails Logger] [Sync Worker] Updating ledger database: Balance Credit $25.50 credited.`);
        }
        addLog(`[ActiveJob] [WebhookSyncWorker] Job successfully completed in 32ms.`);
      }, 500);

    }, 200);
  };


  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-text">
      <div className="bg-[#0b0c10] border-2 border-white/10 w-full max-w-4xl rounded-2xl flex flex-col h-[90vh] md:h-[80vh] shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0e1014] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-inactive border border-brand-border/20 text-[#ff7a00]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm md:text-base font-display font-black text-white uppercase tracking-tight">
                  {blueprint.name}
                </h3>
                <span className="text-[10px] font-mono font-extrabold text-[#00b2ff] bg-info-inactive/30 px-2 py-0.5 rounded border border-info-border/10 uppercase">
                  Live Preview Sandbox
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                {blueprint.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
            title="Close Preview Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Split Screen */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-[#07080b]">
          
          {/* Left Panel: Active Simulation UI Controls (7 Columns) */}
          <div className="md:col-span-7 flex flex-col overflow-y-auto p-5 md:p-6 border-b md:border-b-0 md:border-r border-white/5 space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-brand-active" />
                <span>Interactive Output Controller</span>
              </span>

              <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                SIMULATION: RUNNING
              </span>
            </div>

            {/* Render Component Container based on active blueprint ID */}
            {blueprint.id === "react_ts_debounce" && (
              <div className="space-y-5">
                <div className="p-5 bg-black/40 rounded-xl border border-white/5 space-y-4 font-sans">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      ⚡ Live Search Bar
                    </h4>
                    {isTyping ? (
                      <span className="text-[9px] font-mono text-[#ff7a00] animate-pulse flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>typing debounce delay...</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-success-active flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>debounced synced</span>
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={debounceInput}
                      onChange={(e) => handleDebounceInputChange(e.target.value)}
                      placeholder="Type rapidly (e.g. 'rust', 'react', 'jwt')..."
                      className="w-full bg-[#0d0f14] hover:bg-[#12141c] focus:bg-[#0d0f14] border border-white/5 px-9 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-[#ff7a00] transition"
                    />
                  </div>

                  {/* Typing Comparison Gauge */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-black/30 p-3 rounded-lg border border-white/[0.03]">
                    <div>
                      <span className="text-[9px] text-gray-500 block uppercase font-bold">Instant String</span>
                      <span className="text-white font-semibold truncate block">
                        {debounceInput ? `"${debounceInput}"` : <span className="text-gray-700 font-normal">empty</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 block uppercase font-bold text-[#00b2ff]">Debounced output</span>
                      <span className="text-[#00b2ff] font-bold truncate block">
                        {debouncedValue ? `"${debouncedValue}"` : <span className="text-gray-700 font-normal">empty</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter Results Sandbox */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono font-bold text-gray-500 uppercase block">
                    Filtered Packages Sandbox (Matching debounced value)
                  </span>

                  <div className="bg-[#0c0e12] border border-white/5 rounded-xl divide-y divide-white/5 text-xs font-sans max-h-[160px] overflow-y-auto">
                    {filteredItems.length === 0 ? (
                      <div className="p-5 text-center text-gray-500 italic">
                        No packages matched "{debouncedValue}"
                      </div>
                    ) : (
                      filteredItems.map((item, i) => (
                        <div key={i} className="p-3 flex items-center justify-between hover:bg-white/[0.01] transition-all">
                          <div className="flex flex-col">
                            <span className="text-white font-semibold">{item.name}</span>
                            <span className="text-[10px] text-gray-500">{item.type}</span>
                          </div>
                          <span className="text-[10px] font-mono bg-white/5 text-gray-400 px-2 py-0.5 rounded">
                            {item.size}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {blueprint.id === "rust_cache_server" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Insert Cache block */}
                  <form onSubmit={handleInsertCache} className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3 font-sans">
                    <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-brand-active" />
                      <span>Insert Mutex Cache Key</span>
                    </h4>

                    <div className="space-y-2.5">
                      <input
                        type="text"
                        value={cacheKeyInput}
                        onChange={(e) => setCacheKeyInput(e.target.value)}
                        placeholder="Key (e.g. 'token')"
                        className="w-full bg-[#0d0f14] border border-white/5 px-2.5 py-1.5 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#ff7a00]"
                        required
                      />
                      <input
                        type="text"
                        value={cacheValInput}
                        onChange={(e) => setCacheValInput(e.target.value)}
                        placeholder="Value (e.g. 'GUEST_ACTIVE')"
                        className="w-full bg-[#0d0f14] border border-white/5 px-2.5 py-1.5 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#ff7a00]"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-1.5 rounded bg-brand-active hover:bg-orange-600 text-black font-extrabold text-xs transition cursor-pointer active:scale-[0.98]"
                      >
                        Insert Into Cache Store
                      </button>
                    </div>
                  </form>

                  {/* Lookup Cache Block */}
                  <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3 font-sans flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5 mb-2">
                        <Search className="w-3.5 h-3.5 text-[#00b2ff]" />
                        <span>ThreadSafe Cache Lookup</span>
                      </h4>

                      <input
                        type="text"
                        value={searchKey}
                        onChange={(e) => setSearchKey(e.target.value)}
                        placeholder="Lookup key (e.g. 'health')"
                        className="w-full bg-[#0d0f14] border border-white/5 px-2.5 py-1.5 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#ff7a00] mb-2"
                      />
                    </div>
                    <button
                      onClick={handleLookupCache}
                      className="w-full py-1.5 rounded bg-[#00b2ff] hover:bg-sky-600 text-black font-extrabold text-xs transition cursor-pointer active:scale-[0.98]"
                    >
                      Query ThreadSafe Cache
                    </button>
                  </div>
                </div>

                {/* RAM visual state database representation */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-gray-500 uppercase block">
                    ThreadSafe Cache HashMap Store (WASM RAM Visual)
                  </span>

                  <div className="bg-[#0c0e12] border border-white/5 rounded-xl p-3.5 grid grid-cols-2 gap-2 text-xs font-mono max-h-[140px] overflow-y-auto">
                    {Object.entries(cacheStore).map(([key, value]) => (
                      <div key={key} className="p-2 bg-black/30 rounded border border-white/[0.03] flex justify-between items-center">
                        <span className="text-gray-400 truncate w-1/2">{key}:</span>
                        <span className="text-[#00e575] font-bold truncate w-1/2 text-right">"{value}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {blueprint.id === "node_jwt_auth" && (
              <div className="space-y-5">
                <div className="p-5 bg-black/40 rounded-xl border border-white/5 space-y-4 font-sans">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                    🔒 JWT Middleware & Rate Limiter Simulator
                  </h4>

                  <div className="space-y-3 text-xs">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                      Select Request Token State:
                    </span>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setJwtTokenState("valid");
                          addLog("System: Request state set to 'Valid JWT Token'.");
                        }}
                        className={`py-2 px-2 rounded-lg border text-center transition font-bold cursor-pointer ${
                          jwtTokenState === "valid"
                            ? "bg-[#1c241d] border-[#00e575]/40 text-[#00e575]"
                            : "bg-[#0d0f14] border-white/5 text-gray-400 hover:bg-white/[0.02]"
                        }`}
                      >
                        Valid Token
                      </button>

                      <button
                        onClick={() => {
                          setJwtTokenState("expired");
                          addLog("System: Request state set to 'Expired JWT Token'.");
                        }}
                        className={`py-2 px-2 rounded-lg border text-center transition font-bold cursor-pointer ${
                          jwtTokenState === "expired"
                            ? "bg-[#241a12] border-[#ff7a00]/40 text-[#ff7a00]"
                            : "bg-[#0d0f14] border-white/5 text-gray-400 hover:bg-white/[0.02]"
                        }`}
                      >
                        Expired Token
                      </button>

                      <button
                        onClick={() => {
                          setJwtTokenState("none");
                          addLog("System: Request state set to 'No Credentials'.");
                        }}
                        className={`py-2 px-2 rounded-lg border text-center transition font-bold cursor-pointer ${
                          jwtTokenState === "none"
                            ? "bg-red-950/20 border-red-500/20 text-red-400"
                            : "bg-[#0d0f14] border-white/5 text-gray-400 hover:bg-white/[0.02]"
                        }`}
                      >
                        No Token
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={sendJwtRequest}
                      className="flex-1 py-2.5 rounded-xl bg-brand-active hover:bg-orange-600 text-black font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/10 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send GET /api/secure-data</span>
                    </button>
                  </div>
                </div>

                {/* Rate limit status bars */}
                <div className="bg-[#0c0e12] border border-white/5 rounded-xl p-4 font-mono text-xs flex justify-between items-center">
                  <div className="space-y-1.5 w-2/3">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Rate Limiter Window Loading (Rapid Clicks)</span>
                      <span className={rapidClicksCount >= 5 ? "text-red-400 font-bold" : "text-[#00e575] font-bold"}>
                        {rapidClicksCount} / 5 Requests
                      </span>
                    </div>
                    <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-350 ${rapidClicksCount >= 5 ? "bg-red-500 animate-pulse" : "bg-[#ff7a00]"}`}
                        style={{ width: `${(Math.min(rapidClicksCount, 5) / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-gray-500 block uppercase font-bold">MIDDLEWARE STATUS</span>
                    {isRateLimited ? (
                      <span className="text-[10px] text-red-400 font-bold bg-red-950/20 px-2 py-0.5 rounded border border-red-500/20">
                        429 LOCKED
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#00e575] font-bold bg-[#1c241d] px-2 py-0.5 rounded border border-[#2e5d36]/30">
                        ACTIVE GREEN
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {blueprint.id === "ruby_webhook_api" && (
              <div className="space-y-5">
                <div className="p-5 bg-black/40 rounded-xl border border-white/5 space-y-4 font-sans">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                      🔌 Webhook Payload Dispatcher
                    </h4>
                    <span className="text-[9px] font-mono text-danger-active bg-danger-inactive px-2 py-0.5 rounded border border-danger-border/20">
                      ActiveJob Queue: idle
                    </span>
                  </div>

                  {/* Webhook Event Chooser */}
                  <div className="space-y-1.5 text-xs">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">
                      Choose Webhook Service Type:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleWebhookTypeChange("user.signup")}
                        className={`py-1.5 px-3 rounded-lg border text-center transition font-bold cursor-pointer ${
                          selectedWebhookEvent === "user.signup"
                            ? "bg-danger-inactive text-danger-active border-danger-border/30"
                            : "bg-[#0d0f14] border-white/5 text-gray-400 hover:bg-white/[0.02]"
                        }`}
                      >
                        user.signup event
                      </button>
                      <button
                        onClick={() => handleWebhookTypeChange("payment.success")}
                        className={`py-1.5 px-3 rounded-lg border text-center transition font-bold cursor-pointer ${
                          selectedWebhookEvent === "payment.success"
                            ? "bg-danger-inactive text-danger-active border-danger-border/30"
                            : "bg-[#0d0f14] border-white/5 text-gray-400 hover:bg-white/[0.02]"
                        }`}
                      >
                        payment.success event
                      </button>
                    </div>
                  </div>

                  {/* Editable JSON Payload */}
                  <div className="space-y-1.5 font-mono text-xs">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block font-sans">
                      Raw JSON Request Payload:
                    </label>
                    <textarea
                      value={webhookPayload}
                      onChange={(e) => setWebhookPayload(e.target.value)}
                      rows={5}
                      className="w-full bg-[#0d0f14] text-xs font-mono text-[#00b2ff] border border-white/5 rounded-lg p-3 focus:outline-none focus:border-[#ff7a00] resize-none"
                    />
                  </div>

                  <button
                    onClick={dispatchWebhook}
                    className="w-full py-2.5 rounded-xl bg-brand-active hover:bg-orange-600 text-black font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/10 active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Post Event to WebhookController</span>
                  </button>
                </div>
              </div>
            )}

            {/* General guidance note */}
            <div className="p-3.5 bg-white/[0.01] border border-dashed border-white/5 rounded-xl text-xs text-gray-400 leading-relaxed font-sans">
              <span className="text-[#ff7a00] font-bold">💡 Codebase Ready:</span> This simulator is backed by the real functions defined in the files. Once imported, these parameters will sync into your workspace variables list.
            </div>

          </div>

          {/* Right Panel: Simulated Live Console Logs & Action Import (5 Columns) */}
          <div className="md:col-span-5 flex flex-col h-full overflow-hidden p-5 md:p-6 bg-black/60">
            
            {/* Console Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 flex-shrink-0">
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#00b2ff]" />
                <span>Simulated Sandbox CLI Log</span>
              </span>

              <button
                onClick={clearLogs}
                className="text-[9px] font-mono text-gray-500 hover:text-white hover:underline cursor-pointer bg-white/5 px-2 py-0.5 rounded border border-white/5 transition"
              >
                Clear
              </button>
            </div>

            {/* Console output display */}
            <div className="flex-1 overflow-y-auto bg-black border border-white/5 rounded-xl p-3 font-mono text-[10px] leading-relaxed text-[#00e575] space-y-2 select-text h-[160px] md:h-auto">
              {consoleLogs.map((log, i) => {
                let color = "text-[#00e575]";
                if (log.includes("System:") || log.includes("Keyboard:")) color = "text-gray-400";
                if (log.includes("[JWT Middleware]") || log.includes("[ThreadSafeCache]")) color = "text-purple-400";
                if (log.includes("TRIPPED!") || log.includes("REJECTED") || log.includes("miss:") || log.includes("error:")) color = "text-[#ff0055]";
                if (log.includes("timer") || log.includes("[HTTP Header]") || log.includes("Mutex")) color = "text-amber-400";
                if (log.includes("[Warp") || log.includes("[Express") || log.includes("[Rails") || log.includes("GET") || log.includes("POST")) color = "text-sky-400";

                return (
                  <div key={i} className={`whitespace-pre-wrap ${color}`}>
                    {log}
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>

            {/* Bottom Actions Frame */}
            <div className="pt-4 border-t border-white/5 mt-4 space-y-3 flex-shrink-0">
              <div className="text-[10px] text-gray-400 leading-normal font-sans bg-white/5 p-2 rounded border border-white/5">
                Like what you see? Click below to load these files directly into the active editor workspace container!
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-white/5 bg-[#12141c] hover:bg-[#181b26] text-gray-300 font-sans font-bold text-xs transition cursor-pointer text-center"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    onImport();
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-brand-active hover:bg-orange-600 text-black font-sans font-bold text-xs transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Import Logic</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
