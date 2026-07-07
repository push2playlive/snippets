import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  Terminal as TerminalIcon, 
  Percent, 
  Clock, 
  Wrench, 
  Layers, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FileCode,
  Sparkles,
  RefreshCcw
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie
} from "recharts";

// Mock historic runs data
const INITIAL_RUNS_DATA = [
  { run: "Run 1", duration: 1420, passRate: 85, failed: 2, passed: 11 },
  { run: "Run 2", duration: 1310, passRate: 92, failed: 1, passed: 12 },
  { run: "Run 3", duration: 1180, passRate: 92, failed: 1, passed: 12 },
  { run: "Run 4", duration: 1250, passRate: 100, failed: 0, passed: 13 },
  { run: "Run 5", duration: 1150, passRate: 100, failed: 0, passed: 13 },
  { run: "Run 6", duration: 1520, passRate: 76, failed: 3, passed: 10 },
  { run: "Run 7", duration: 1380, passRate: 92, failed: 1, passed: 12 },
  { run: "Run 8", duration: 1090, passRate: 100, failed: 0, passed: 13 },
];

// File Coverage Data
const INITIAL_COVERAGE_DATA = [
  { name: "interceptor.ts", lines: 96, functions: 90, branches: 85, statements: 94 },
  { name: "main.rs", lines: 88, functions: 84, branches: 78, statements: 86 },
  { name: "config.ts", lines: 100, functions: 100, branches: 92, statements: 100 },
  { name: "validator.ts", lines: 92, functions: 88, branches: 80, statements: 90 },
  { name: "cache_engine.rs", lines: 82, functions: 75, branches: 70, statements: 80 },
  { name: "auth.ts", lines: 95, functions: 100, branches: 90, statements: 96 },
];

interface TestLog {
  text: string;
  type: "info" | "success" | "error" | "warn";
  time: string;
}

interface TestSuite {
  name: string;
  status: "idle" | "running" | "passed" | "failed";
  tests: { name: string; passed: boolean; duration: number; error?: string }[];
}

export default function TestResults({ onShowNotification }: { onShowNotification: (msg: string, type?: "success" | "info" | "warning") => void }) {
  const [runsData, setRunsData] = useState(INITIAL_RUNS_DATA);
  const [coverageData, setCoverageData] = useState(INITIAL_COVERAGE_DATA);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testLogs, setTestLogs] = useState<TestLog[]>([]);
  const [failMode, setFailMode] = useState(false);
  const [isRepaired, setIsRepaired] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>("interceptor.ts");

  // Summary Metrics
  const [metrics, setMetrics] = useState({
    total: 13,
    passed: 13,
    failed: 0,
    skipped: 0,
    duration: 1090, // ms
    coverage: 91.5 // %
  });

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [testLogs]);

  // Simulated test execution scripts
  const runTestSuite = (forceFail: boolean = false) => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(0);
    setTestLogs([]);

    const timestamp = () => new Date().toLocaleTimeString();

    const addLog = (text: string, type: "info" | "success" | "error" | "warn") => {
      setTestLogs((prev) => [...prev, { text, type, time: timestamp() }]);
    };

    // Staggered execution sequences
    addLog("⚡ Initializing Snippets Test Runner v2.1.0...", "info");
    addLog("🔍 Searching for workspace unit test files (*.test.ts, *.test.js, *.test.rs)...", "info");
    addLog("📦 Found 4 test suites: interceptor.test.ts, config.test.ts, validator.test.ts, cache.test.rs", "success");

    let currentStep = 0;
    const totalSteps = 10;

    const interval = setInterval(() => {
      currentStep++;
      const currentProgress = Math.round((currentStep / totalSteps) * 100);
      setProgress(currentProgress);

      switch (currentStep) {
        case 1:
          addLog("🚀 [1/4] Running: config.test.ts", "info");
          addLog("✔ Assertion passed: Schema validation constraints hold clean", "success");
          addLog("✔ Assertion passed: Default variables parse successfully", "success");
          break;
        case 3:
          addLog("🚀 [2/4] Running: validator.test.ts", "info");
          addLog("✔ Assertion passed: Strict sanitization regex cleans payload blocks", "success");
          addLog("✔ Assertion passed: XSS attack strings caught and defused", "success");
          break;
        case 5:
          addLog("🚀 [3/4] Running: interceptor.test.ts", "info");
          addLog("✔ Assertion passed: Dynamic request appending adds auth payload", "success");
          if (forceFail && !isRepaired) {
            addLog("✖ Assertion failed: Strict signature mismatch! Expected: 'sha256-abc', Got: 'sha256-xyz'", "error");
            addLog("⚠ Failures detected in request tamper checks", "warn");
          } else {
            addLog("✔ Assertion passed: Tamper-prevention signatures match properly", "success");
          }
          break;
        case 7:
          addLog("🚀 [4/4] Running: cache_engine.test.rs", "info");
          addLog("✔ Assertion passed: Redis TTL cache expiration staves off stale records", "success");
          addLog("✔ Assertion passed: Atomic concurrent read/writes avoid memory race", "success");
          break;
        case 9:
          addLog("📊 Amassing coverage and compiling coverage tables...", "info");
          break;
        case 10:
          clearInterval(interval);
          setIsRunning(false);
          setProgress(100);

          const hasFailed = forceFail && !isRepaired;
          if (hasFailed) {
            addLog("❌ Test Suite Finished: 12/13 passed, 1 FAILED.", "error");
            onShowNotification("Unit test suite finished with failures!", "warning");
            setMetrics({
              total: 13,
              passed: 12,
              failed: 1,
              skipped: 0,
              duration: 1480,
              coverage: 88.4
            });
            // Append fail run to Recharts
            setRunsData((prev) => [
              ...prev,
              { run: `Run ${prev.length + 1}`, duration: 1480, passRate: 92, failed: 1, passed: 12 }
            ]);
          } else {
            addLog("✨ All 13 assertions passed beautifully! Clean Sandbox State.", "success");
            onShowNotification("All unit tests passed successfully!", "success");
            setMetrics({
              total: 13,
              passed: 13,
              failed: 0,
              skipped: 0,
              duration: 1040,
              coverage: 94.2
            });
            // Update coverage data as a result of fixed code paths
            setCoverageData((prev) => 
              prev.map(f => f.name === "interceptor.ts" ? { ...f, lines: 98, branches: 96 } : f)
            );
            // Append success run to Recharts
            setRunsData((prev) => [
              ...prev,
              { run: `Run ${prev.length + 1}`, duration: 1040, passRate: 100, failed: 0, passed: 13 }
            ]);
          }
          break;
      }
    }, 600);
  };

  const handleApplyFix = () => {
    setIsRepaired(true);
    onShowNotification("Applied AI Hotfix to signature validation key! Re-running suite...", "success");
    runTestSuite(false);
  };

  const resetAllSimulations = () => {
    setRunsData(INITIAL_RUNS_DATA);
    setCoverageData(INITIAL_COVERAGE_DATA);
    setTestLogs([]);
    setProgress(0);
    setFailMode(false);
    setIsRepaired(false);
    setMetrics({
      total: 13,
      passed: 13,
      failed: 0,
      skipped: 0,
      duration: 1090,
      coverage: 91.5
    });
    onShowNotification("Test and coverage states reset successfully.", "info");
  };

  // Find data for currently selected file
  const selectedFileCoverage = coverageData.find(f => f.name === selectedFile) || coverageData[0];

  // Convert files list for single-file radar representation
  const radarData = [
    { subject: "Lines", value: selectedFileCoverage.lines },
    { subject: "Functions", value: selectedFileCoverage.functions },
    { subject: "Branches", value: selectedFileCoverage.branches },
    { subject: "Statements", value: selectedFileCoverage.statements },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#07080b] text-gray-300 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#00b2ff]/10 rounded-lg text-[#00b2ff]">
                <Activity className="w-5 h-5" />
              </span>
              <h2 className="font-display font-black text-2xl text-white tracking-tight uppercase">Test Results Hub</h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Stateless Unit Testing Suite • Multi-Language AST Code Coverage Analytics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFailMode(true);
                setIsRepaired(false);
                runTestSuite(true);
              }}
              disabled={isRunning}
              className="px-3.5 py-1.5 rounded-lg border border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Fail</span>
            </button>

            {/* Concentric Tactile Push Button (Concentric Circle 2 and Circle 1 surrounding the actual play key) */}
            <div className="flex items-center gap-2.5 bg-black/40 p-1.5 pr-3 rounded-2xl border border-white/5 shadow-2xl relative group shrink-0">
              {/* Outer Circle 2 (The metal mounting rim bezel) */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-gray-700 to-[#121318] p-0.5 flex items-center justify-center border border-white/10 shadow-lg relative shrink-0">
                {/* Outer Circle 1 (The inner glowing status ring) */}
                <div className={`w-full h-full rounded-full bg-[#07080b] flex items-center justify-center p-1 transition-all duration-300 ${
                  isRunning 
                    ? "shadow-[0_0_12px_rgba(16,185,129,0.5)] ring-2 ring-emerald-500/40 animate-pulse" 
                    : metrics.failed > 0
                    ? "shadow-[0_0_8px_rgba(239,68,68,0.2)] ring-1 ring-red-500/20"
                    : "shadow-[0_0_8px_rgba(0,178,255,0.3)] ring-1 ring-[#00b2ff]/30 hover:ring-[#00b2ff]/50"
                }`}>
                  {/* The actual physical 3D push button */}
                  <button
                    onClick={() => {
                      setFailMode(false);
                      runTestSuite(false);
                      if ("vibrate" in navigator) {
                        navigator.vibrate([80]);
                      }
                    }}
                    disabled={isRunning}
                    title="Push to Run Clean Test Suite"
                    className={`w-full h-full rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-90 active:translate-y-0.5 select-none ${
                      isRunning
                        ? "bg-gradient-to-b from-emerald-500 to-emerald-700 shadow-inner"
                        : metrics.failed > 0
                        ? "bg-gradient-to-b from-red-500 to-red-600 shadow-[0_2px_5px_rgba(239,68,68,0.4)] hover:from-red-400 hover:to-red-500"
                        : "bg-gradient-to-b from-[#00b2ff] to-[#0088cc] shadow-[0_2px_5px_rgba(0,178,255,0.4)] hover:from-[#33c1ff] hover:to-[#0099e6]"
                    }`}
                  >
                    {isRunning ? (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-white fill-white/10 drop-shadow" />
                    )}
                  </button>
                </div>
              </div>
              <div className="text-left font-mono">
                <div className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Tactile Initiator</div>
                <div className={`text-[10px] font-extrabold uppercase transition-colors ${
                  isRunning 
                    ? "text-emerald-400" 
                    : metrics.failed > 0
                    ? "text-red-400 animate-pulse"
                    : "text-[#00b2ff]"
                }`}>
                  {isRunning ? "RUNNING..." : "PUSH TO RUN"}
                </div>
              </div>
            </div>

            <button
              onClick={resetAllSimulations}
              title="Reset metrics & logs"
              className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Grid Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* Card 1: Passed Rate */}
          <div className="p-4 bg-[#0d0e12]/60 border border-white/5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#00b2ff]/20 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-12 h-12 text-[#10b981]" />
            </div>
            <div className="text-gray-400 text-[10px] font-mono tracking-wider uppercase">Pass Rate</div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">
                {Math.round((metrics.passed / metrics.total) * 100)}%
              </span>
              <span className="text-[10px] text-gray-500 font-mono">({metrics.passed}/{metrics.total})</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${metrics.failed > 0 ? "bg-red-500 animate-pulse" : "bg-[#10b981]"}`} />
              <span>{metrics.failed > 0 ? `${metrics.failed} broken test` : "Fully green suite"}</span>
            </div>
          </div>

          {/* Card 2: Total Tests */}
          <div className="p-4 bg-[#0d0e12]/60 border border-white/5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#00b2ff]/20 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <Layers className="w-12 h-12 text-brand-active" />
            </div>
            <div className="text-gray-400 text-[10px] font-mono tracking-wider uppercase">Total Assertions</div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">{metrics.total}</span>
              <span className="text-[10px] text-gray-500 font-mono">cases</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1 font-mono">4 complete suites logged</div>
          </div>

          {/* Card 3: Failed */}
          <div className="p-4 bg-[#0d0e12]/60 border border-white/5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-red-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <div className="text-gray-400 text-[10px] font-mono tracking-wider uppercase">Failed Tests</div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-2xl font-black font-mono ${metrics.failed > 0 ? "text-red-500" : "text-gray-400"}`}>
                {metrics.failed}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">errors</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 font-mono">
              {metrics.failed > 0 ? (
                <span className="text-red-400 flex items-center gap-0.5 animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Red build detected
                </span>
              ) : (
                <span className="text-gray-500">Zero active exceptions</span>
              )}
            </div>
          </div>

          {/* Card 4: Run Duration */}
          <div className="p-4 bg-[#0d0e12]/60 border border-white/5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#00b2ff]/20 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
            <div className="text-gray-400 text-[10px] font-mono tracking-wider uppercase">Execution Speed</div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">{metrics.duration}</span>
              <span className="text-[10px] text-gray-500 font-mono">ms</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1 font-mono">Est: ~80ms / assertion</div>
          </div>

          {/* Card 5: Total Coverage */}
          <div className="p-4 bg-[#0d0e12]/60 border border-white/5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#00b2ff]/20 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <Percent className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="text-gray-400 text-[10px] font-mono tracking-wider uppercase">Code Coverage</div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">{metrics.coverage}%</span>
              <span className="text-[10px] text-gray-500 font-mono">weighted</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Above 85% requirement</span>
            </div>
          </div>

          {/* Card 6: Health Grade */}
          <div className="p-4 bg-[#0d0e12]/60 border border-white/5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#00b2ff]/20 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-12 h-12 text-blue-500" />
            </div>
            <div className="text-gray-400 text-[10px] font-mono tracking-wider uppercase">Health Grade</div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-2xl font-black font-mono ${metrics.failed > 0 ? "text-yellow-500" : "text-[#00b2ff]"}`}>
                {metrics.failed > 0 ? "B+" : "A+"}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">grade</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1 font-mono">Verified sandbox safe</div>
          </div>

        </div>

        {/* Live execution progress bar */}
        {isRunning && (
          <div className="p-4 bg-[#0d0e12]/80 border border-[#00b2ff]/20 rounded-xl space-y-2 animate-pulse">
            <div className="flex justify-between items-center text-xs font-mono text-[#00b2ff]">
              <span className="flex items-center gap-1.5">
                <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                Executing Suite Assertions...
              </span>
              <span>{progress}% Complete</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#00b2ff] to-[#10b981] h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Block: Interactive Test LogsConsole (Span 7) */}
          <div className="lg:col-span-7 bg-[#0d0e12]/90 border border-white/5 rounded-xl overflow-hidden flex flex-col h-[480px]">
            <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TerminalIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-mono font-bold text-gray-200">Terminal Log Output</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]/20 border border-[#10b981]/40" />
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] space-y-2 select-text custom-scrollbar bg-black/40">
              {testLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-2">
                  <Activity className="w-8 h-8 text-gray-600 animate-pulse" />
                  <p>Console is silent. Run the Unit Test suite to capture stdout.</p>
                </div>
              ) : (
                testLogs.map((log, idx) => {
                  let colorClass = "text-gray-400";
                  if (log.type === "success") colorClass = "text-emerald-400";
                  if (log.type === "error") colorClass = "text-red-400 font-bold bg-red-500/5 px-1 rounded";
                  if (log.type === "warn") colorClass = "text-yellow-400";
                  return (
                    <div key={idx} className="flex items-start gap-2 py-0.5 border-b border-white/[0.01]">
                      <span className="text-gray-600 shrink-0 select-none">[{log.time}]</span>
                      <span className={`${colorClass} flex-1 whitespace-pre-wrap`}>{log.text}</span>
                    </div>
                  );
                })
              )}
              <div ref={logsEndRef} />
            </div>

            {/* AI Auto-Repair Assist bottom bar */}
            {metrics.failed > 0 && !isRunning && (
              <div className="p-3.5 bg-yellow-500/5 border-t border-yellow-500/10 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white font-mono">Test failure detected in interceptor.test.ts</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Signature integrity mismatch. Would you like our AI agent to patch it?</p>
                  </div>
                </div>
                <button
                  onClick={handleApplyFix}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-lg shadow-yellow-500/10 shrink-0"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Apply AI Hotfix</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Block: Interactive Line Chart (Span 5) */}
          <div className="lg:col-span-5 bg-[#0d0e12]/90 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-mono font-bold text-gray-200">Temporal Build Performance</div>
                <span className="text-[10px] text-gray-500 font-mono">Last {runsData.length} Runs</span>
              </div>
              <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                Visualizes execution speed (duration in ms) and success rates over successive compilation checkpoints.
              </p>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={runsData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00b2ff" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00b2ff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPassRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="run" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0d0e12", 
                      borderColor: "rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#fff"
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                  <Area 
                    type="monotone" 
                    name="Run Duration (ms)" 
                    dataKey="duration" 
                    stroke="#00b2ff" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorDuration)" 
                  />
                  <Area 
                    type="monotone" 
                    name="Pass Rate (%)" 
                    dataKey="passRate" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPassRate)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Unit Test Execution Suites & Cases List with Visual Summary Gauges ABOVE it */}
        <div className="space-y-6">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-gray-200">Test Execution & Verification List</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Detailed audit of target assertions, expected outcomes, and live suite validation status.
              </p>
            </div>
            
            <div className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Auto-refreshing sandbox verified</span>
            </div>
          </div>

          {/* New Recharts-powered Summary Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Total Assertions Bar Gauge Card */}
            <div className="bg-[#0d0e12]/70 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4 group hover:border-[#00b2ff]/20 transition duration-300">
              <div className="space-y-1.5 flex-1">
                <div className="text-gray-400 text-[10px] font-mono tracking-wider uppercase flex items-center gap-1 flex-row">
                  <Layers className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Assertions Load</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-white font-mono">{metrics.total}</span>
                  <span className="text-xs text-gray-500 font-mono ml-1">total specs</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  Passed: <span className="text-emerald-400">{metrics.passed}</span> • Failed: <span className={metrics.failed > 0 ? "text-red-400 font-bold" : "text-gray-500"}>{metrics.failed}</span>
                </div>
              </div>
              
              {/* Recharts Bar Visualization */}
              <div className="w-[140px] h-[60px] flex flex-col justify-center items-center bg-black/20 rounded-lg p-1.5 shrink-0 border border-white/[0.02]">
                <span className="text-[9px] text-gray-500 font-mono mb-1">Status Split</span>
                <ResponsiveContainer width="100%" height="70%">
                  <BarChart layout="vertical" data={[{ name: "Spec Split", Passed: metrics.passed, Failed: metrics.failed }]} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide domain={[0, metrics.total]} />
                    <YAxis type="category" dataKey="name" hide />
                    <Bar dataKey="Passed" stackId="a" fill="#10b981" radius={metrics.failed === 0 ? [4, 4, 4, 4] : [4, 0, 0, 4]} />
                    <Bar dataKey="Failed" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Pass Rate Gauge Card */}
            <div className="bg-[#0d0e12]/70 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4 group hover:border-[#10b981]/20 transition duration-300">
              <div className="space-y-1.5 flex-1">
                <div className="text-gray-400 text-[10px] font-mono tracking-wider uppercase flex items-center gap-1 flex-row">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                  <span>Suite Pass Rate</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-white font-mono">
                    {Math.round((metrics.passed / metrics.total) * 100)}%
                  </span>
                  <span className="text-xs text-gray-500 font-mono ml-1">efficiency</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {metrics.failed > 0 ? "⚠️ Broken assertions found" : "✨ All checks clean"}
                </div>
              </div>

              {/* Recharts Gauge Visualization */}
              <div className="w-[120px] h-[75px] flex flex-col items-center justify-end bg-black/20 rounded-lg pb-1 relative shrink-0 border border-white/[0.02] overflow-hidden">
                <div className="absolute inset-x-0 bottom-2 text-center flex flex-col items-center justify-end">
                  <span className="text-[11px] font-bold text-white font-mono">{Math.round((metrics.passed / metrics.total) * 100)}%</span>
                  <span className="text-[8px] text-gray-500 font-mono">pass</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, left: 0, bottom: -10 }}>
                    <Pie
                      data={[
                        { name: "Pass", value: Math.round((metrics.passed / metrics.total) * 100) },
                        { name: "Empty", value: 100 - Math.round((metrics.passed / metrics.total) * 100) }
                      ]}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={32}
                      outerRadius={45}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={metrics.failed > 0 ? "#ef4444" : "#10b981"} />
                      <Cell fill="rgba(255, 255, 255, 0.04)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Coverage Percentage Gauge Card */}
            <div className="bg-[#0d0e12]/70 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4 group hover:border-[#00b2ff]/20 transition duration-300">
              <div className="space-y-1.5 flex-1">
                <div className="text-gray-400 text-[10px] font-mono tracking-wider uppercase flex items-center gap-1 flex-row">
                  <Percent className="w-3.5 h-3.5 text-[#00b2ff] shrink-0" />
                  <span>Weighted Coverage</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-white font-mono">{metrics.coverage}%</span>
                  <span className="text-xs text-gray-500 font-mono ml-1">weighted</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  Target threshold: <span className="text-emerald-400 font-bold">&gt;85%</span>
                </div>
              </div>

              {/* Recharts Gauge Visualization */}
              <div className="w-[120px] h-[75px] flex flex-col items-center justify-end bg-black/20 rounded-lg pb-1 relative shrink-0 border border-white/[0.02] overflow-hidden">
                <div className="absolute inset-x-0 bottom-2 text-center flex flex-col items-center justify-end">
                  <span className="text-[11px] font-bold text-white font-mono">{metrics.coverage}%</span>
                  <span className="text-[8px] text-gray-500 font-mono">cov</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, left: 0, bottom: -10 }}>
                    <Pie
                      data={[
                        { name: "Coverage", value: metrics.coverage },
                        { name: "Empty", value: 100 - metrics.coverage }
                      ]}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={32}
                      outerRadius={45}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#00b2ff" />
                      <Cell fill="rgba(255, 255, 255, 0.04)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Test Results List */}
          <div className="bg-[#0d0e12]/50 border border-white/5 rounded-xl overflow-hidden p-4">
            <div className="space-y-3">
              
              {/* Test Suite Row 1: config.test.ts */}
              <div className="p-3.5 bg-black/20 border border-white/5 hover:border-white/10 rounded-lg transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">TS-CONFIG</span>
                    <span className="text-xs font-bold text-white font-mono">config.test.ts</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Validates schema blueprint structures and defaults matching metadata rules.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="text-[11px] text-gray-500 font-mono">2 assertions</span>
                  <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded">120ms</span>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" /> PASSED
                  </span>
                </div>
              </div>

              {/* Test Suite Row 2: validator.test.ts */}
              <div className="p-3.5 bg-black/20 border border-white/5 hover:border-white/10 rounded-lg transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">TS-VALIDATOR</span>
                    <span className="text-xs font-bold text-white font-mono">validator.test.ts</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Secures payloads against script injection attacks and strict field validations.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="text-[11px] text-gray-500 font-mono">2 assertions</span>
                  <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded">180ms</span>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" /> PASSED
                  </span>
                </div>
              </div>

              {/* Test Suite Row 3: interceptor.test.ts */}
              <div className={`p-3.5 bg-black/20 border rounded-lg transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                metrics.failed > 0 
                  ? "border-red-500/20 bg-red-950/5 hover:border-red-500/30" 
                  : "border-white/5 hover:border-white/10"
              }`}>
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                      metrics.failed > 0 
                        ? "bg-red-500/10 text-red-400 border-red-500/20" 
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>TS-INTERCEPTOR</span>
                    <span className="text-xs font-bold text-white font-mono">interceptor.test.ts</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Verifies header signing keys, signature validations, and request tampering protections.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="text-[11px] text-gray-500 font-mono">2 assertions</span>
                  <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded">410ms</span>
                  {metrics.failed > 0 ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20 animate-pulse">
                      <XCircle className="w-3 h-3" /> 1 FAILED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" /> PASSED
                    </span>
                  )}
                </div>
              </div>

              {/* Test Suite Row 4: cache_engine.test.rs */}
              <div className="p-3.5 bg-black/20 border border-white/5 hover:border-white/10 rounded-lg transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono border border-amber-500/20">RUST-UNIT</span>
                    <span className="text-xs font-bold text-white font-mono">cache_engine.test.rs</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Validates strict rust concurrency models, memory locking strategies, and key TTL evictions.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="text-[11px] text-gray-500 font-mono">2 assertions</span>
                  <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded">330ms</span>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" /> PASSED
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Coverage Section */}
        <div className="bg-[#0d0e12]/90 border border-white/5 rounded-xl p-5 space-y-6">
          
          {/* Coverage Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="text-xs font-mono font-bold text-gray-200">File-by-File Coverage Index</div>
              <p className="text-[11px] text-gray-400 mt-1">
                A breakdown of code path coverage mapping lines, functions, and branches checked by our test matrix.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-mono">Current Target:</span>
              <select
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                className="bg-[#14161d] text-xs font-mono text-gray-300 border border-white/5 rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#00b2ff] cursor-pointer"
              >
                {coverageData.map((f) => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* File List breakdown table (Span 7) */}
            <div className="lg:col-span-7 space-y-3.5">
              {coverageData.map((file) => {
                const isCurrent = file.name === selectedFile;
                const avgPercent = Math.round((file.lines + file.functions + file.branches + file.statements) / 4);
                
                let progressColor = "bg-[#00b2ff]";
                if (avgPercent >= 90) progressColor = "bg-[#10b981]";
                else if (avgPercent < 80) progressColor = "bg-yellow-500";

                return (
                  <div 
                    key={file.name}
                    onClick={() => setSelectedFile(file.name)}
                    className={`p-3 rounded-lg border transition cursor-pointer flex flex-col gap-2 ${
                      isCurrent 
                        ? "bg-[#00b2ff]/5 border-[#00b2ff]/20 shadow-md" 
                        : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className={`w-4 h-4 ${isCurrent ? "text-[#00b2ff]" : "text-gray-500"}`} />
                        <span className={`text-xs font-mono font-semibold ${isCurrent ? "text-white" : "text-gray-400"}`}>
                          {file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-mono">Avg Coverage:</span>
                        <span className={`text-xs font-mono font-bold ${avgPercent >= 90 ? "text-[#10b981]" : "text-[#00b2ff]"}`}>
                          {avgPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${progressColor}`}
                        style={{ width: `${avgPercent}%` }}
                      />
                    </div>

                    {/* Detail pills */}
                    <div className="grid grid-cols-4 gap-2 text-[9px] font-mono text-gray-500 mt-0.5">
                      <div>Lines: <span className="text-gray-300">{file.lines}%</span></div>
                      <div>Funcs: <span className="text-gray-300">{file.functions}%</span></div>
                      <div>Branches: <span className="text-gray-300">{file.branches}%</span></div>
                      <div>Stats: <span className="text-gray-300">{file.statements}%</span></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coverage Graph visualizer (Span 5) */}
            <div className="lg:col-span-5 bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center h-[320px]">
              <div className="text-xs font-mono font-bold text-gray-200 self-start mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00b2ff]" />
                <span>Path Graph: {selectedFile}</span>
              </div>
              
              <div className="h-[240px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      stroke="rgba(255,255,255,0.4)" 
                      fontSize={10} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={8} 
                    />
                    <Radar
                      name="Coverage"
                      dataKey="value"
                      stroke="#00b2ff"
                      fill="#00b2ff"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
