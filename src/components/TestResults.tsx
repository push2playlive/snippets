import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
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
  ChevronDown,
  TrendingUp,
  TrendingDown,
  FileCode,
  Sparkles,
  RefreshCcw,
  Download
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

interface D3RunData {
  run: string;
  passRate: number;
  failed?: number;
  passed?: number;
  duration?: number;
}

interface D3PassRateTrendChartProps {
  data: D3RunData[];
}

function D3PassRateTrendChart({ data }: D3PassRateTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  // Use the last 10 runs
  const last10 = data.slice(-10);
  
  const width = 280;
  const height = 65;
  const padding = { top: 8, right: 10, bottom: 8, left: 32 };

  const xScale = d3.scaleLinear()
    .domain([0, last10.length - 1])
    .range([padding.left, width - padding.right]);

  // Calculate dynamic min/max of the dataset
  const minRate = d3.min(last10, d => d.passRate) ?? 0;
  const maxRate = d3.max(last10, d => d.passRate) ?? 100;

  // Dynamic Y-axis domain that ALWAYS includes the 95% threshold and scales nicely with data
  const yDomainMin = Math.max(0, Math.min(minRate - 5, 90)); // Ensure we scale down to at least 90 so 95% is clearly inside the visible domain
  const yDomainMax = 100;

  const yScale = d3.scaleLinear()
    .domain([yDomainMin, yDomainMax])
    .range([height - padding.bottom, padding.top]);

  const lineGenerator = d3.line<D3RunData>()
    .x((_, idx) => xScale(idx))
    .y(d => yScale(d.passRate))
    .curve(d3.curveMonotoneX);

  const areaGenerator = d3.area<D3RunData>()
    .x((_, idx) => xScale(idx))
    .y0(height - padding.bottom)
    .y1(d => yScale(d.passRate))
    .curve(d3.curveMonotoneX);

  const linePath = lineGenerator(last10) || "";
  const areaPath = areaGenerator(last10) || "";

  // Color theme: Neon Green/Emerald if trend is up or stable, Orange/Red if trend is down
  const latestRate = last10[last10.length - 1]?.passRate ?? 100;
  const firstRate = last10[0]?.passRate ?? 100;
  const isUpOrStable = latestRate >= firstRate;
  
  const strokeColor = isUpOrStable ? "#10b981" : "#f43f5e";
  const glowId = "d3-glow-path";
  const gradId = "d3-area-grad";

  const yTicks = minRate === maxRate
    ? [ { value: maxRate, label: "MAX" }, { value: yDomainMin, label: "MIN" } ]
    : [ { value: maxRate, label: "MAX" }, { value: minRate, label: "MIN" } ];

  return (
    <div className="relative group/d3 w-full flex flex-col justify-center select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[65px] overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor={strokeColor} floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Dynamic min/max gridlines and labels on Y-axis */}
        {yTicks.map((tick, i) => (
          <g key={`y-axis-tick-${i}`}>
            <line 
              x1={padding.left} 
              y1={yScale(tick.value)} 
              x2={width - padding.right} 
              y2={yScale(tick.value)} 
              stroke="rgba(255,255,255,0.06)" 
              strokeDasharray="2,2" 
            />
            <text
              x={padding.left - 5}
              y={yScale(tick.value) + 2.5}
              textAnchor="end"
              fill={tick.label === "MAX" ? "rgba(16, 185, 129, 0.65)" : "rgba(244, 63, 94, 0.65)"}
              className="text-[6.5px] font-mono font-bold"
            >
              {tick.label} {tick.value}%
            </text>
          </g>
        ))}

        {/* Industry standard 95% reference line */}
        <line
          x1={padding.left}
          y1={yScale(95)}
          x2={width - padding.right}
          y2={yScale(95)}
          stroke="rgba(245, 158, 11, 0.35)"
          strokeWidth={1}
          strokeDasharray="3,2"
        />
        <text
          x={width - padding.right - 4}
          y={yScale(95) - 3}
          textAnchor="end"
          fill="rgba(245, 158, 11, 0.7)"
          className="text-[5.5px] font-mono font-black uppercase tracking-wider"
        >
          95% Std
        </text>

        {/* Gradient Area Fill */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Glowing Line Path */}
        <path 
          d={linePath} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth={2} 
          filter={`url(#${glowId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Dots */}
        {last10.map((d, idx) => {
          const cx = xScale(idx);
          const cy = yScale(d.passRate);
          const isHovered = hoveredIdx === idx;
          return (
            <g key={idx} className="cursor-pointer">
              {/* Larger invisible touch targets */}
              <circle
                cx={cx}
                cy={cy}
                r={8}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 4.5 : 2.5}
                fill={isHovered ? "#fff" : strokeColor}
                stroke={isHovered ? strokeColor : "transparent"}
                strokeWidth={1.5}
                className="transition-all duration-150"
              />
            </g>
          );
        })}
      </svg>

      {/* Floating details tooltip */}
      {hoveredIdx !== null && (
        <div 
          className="absolute z-50 pointer-events-none bg-[#090b0f]/95 border border-white/15 rounded-lg p-2 text-[9px] font-mono text-white shadow-2xl backdrop-blur-md transition-all duration-100 flex flex-col gap-0.5"
          style={{
            left: `${(xScale(hoveredIdx) / width) * 100}%`,
            top: `${(yScale(last10[hoveredIdx].passRate) / height) * 100 - 65}%`,
            transform: `translate(${xScale(hoveredIdx) > width / 2 ? '-100%' : '0%'}, -10px)`,
          }}
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-1 font-bold">
            <span className="text-gray-300">{last10[hoveredIdx].run}</span>
            <span className={last10[hoveredIdx].passRate === 100 ? "text-emerald-400" : "text-amber-400"}>
              {last10[hoveredIdx].passRate}% Pass
            </span>
          </div>
          {last10[hoveredIdx].passed !== undefined && (
            <div className="text-[8px] text-gray-400 flex items-center justify-between gap-3 mt-0.5">
              <span>Passed: <span className="text-emerald-400 font-bold">{last10[hoveredIdx].passed}</span></span>
              <span>Failed: <span className={last10[hoveredIdx].failed ? "text-red-400 font-bold" : "text-gray-500 font-bold"}>{last10[hoveredIdx].failed}</span></span>
            </div>
          )}
          {last10[hoveredIdx].duration !== undefined && (
            <div className="text-[7.5px] text-gray-500 text-right mt-0.5">
              Duration: {((last10[hoveredIdx].duration || 0) / 1000).toFixed(2)}s
            </div>
          )}
        </div>
      )}

      {/* Static header placeholder/legend */}
      <div className="absolute top-[-14px] right-0 pointer-events-none transition-all duration-200">
        {hoveredIdx === null && (
          <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mr-1">
            Last 10 Runs (D3)
          </div>
        )}
      </div>
    </div>
  );
}

export default function TestResults({ onShowNotification }: { onShowNotification: (msg: string, type?: "success" | "info" | "warning") => void }) {
  const [runsData, setRunsData] = useState(INITIAL_RUNS_DATA);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [reRunningRunId, setReRunningRunId] = useState<string | null>(null);

  // Trigger a re-compilation for a specific execution instance
  const handleReRunExecution = (runId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent row expansion toggle
    if (reRunningRunId) return;

    setReRunningRunId(runId);
    onShowNotification(`Triggering re-compilation/execution for ${runId}...`, "info");

    setTimeout(() => {
      setRunsData((prev) => 
        prev.map((r) => {
          if (r.run === runId) {
            // Update the failed run to passed cleanly with fast compile duration
            return {
              ...r,
              passRate: 100,
              passed: 13,
              failed: 0,
              duration: Math.round((r.duration || 1100) * 0.8)
            };
          }
          return r;
        })
      );
      setReRunningRunId(null);
      onShowNotification(`Re-compilation for ${runId} succeeded! All compilation assertions are clear.`, "success");
    }, 1500);
  };

  // Exporter to CSV for external analysis
  const exportToCSV = () => {
    try {
      const headers = ["Execution ID", "Pass Rate", "Duration (ms)", "Passed Assertions", "Failed Assertions", "Status"];
      const rows = runsData.map(runItem => {
        const isPassed = runItem.passRate === 100 && (runItem.failed === 0 || runItem.failed === undefined);
        const status = isPassed ? "PASSED" : "FAILED";
        return [
          `"${runItem.run.replace(/"/g, '""')}"`,
          `"${runItem.passRate}%"`,
          runItem.duration,
          runItem.passed ?? 12,
          runItem.failed ?? 0,
          `"${status}"`
        ];
      });
      const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `test_execution_history_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onShowNotification("Test execution history exported successfully as CSV!", "success");
    } catch (error) {
      console.error("CSV Export error: ", error);
      onShowNotification("Failed to export test execution history.", "warning");
    }
  };

  // Generates real-time, high-fidelity compiler diagnostic summaries
  const getCompilerDiagnostics = (runItem: D3RunData) => {
    const isPassed = runItem.passRate === 100 && (runItem.failed === 0 || runItem.failed === undefined);
    
    if (isPassed) {
      return {
        status: "SUCCESSFUL",
        exitCode: 0,
        compiler: "TypeScript Compiler v5.4.5 (esbuild-bundler)",
        environment: "Vite + React Core Sandbox (Node 20.11.0)",
        timestamp: "Live Sandbox compilation check",
        summary: `Compilation succeeded cleanly. Generated static artifacts inside './dist' without warnings.`,
        logs: [
          { time: "+0ms", type: "info", text: "Initializing compiler daemon..." },
          { time: `+${Math.round((runItem.duration || 1000) * 0.15)}ms`, type: "info", text: `Loaded workspace tsconfig.json configuration.` },
          { time: `+${Math.round((runItem.duration || 1000) * 0.40)}ms`, type: "success", text: "Successfully resolved 42 local import files and Node modules." },
          { time: `+${Math.round((runItem.duration || 1000) * 0.75)}ms`, type: "info", text: "Optimized chunks with esbuild: tree-shaking eliminated 8 unused symbols." },
          { time: `+${runItem.duration}ms`, type: "success", text: "Output dist/server.cjs (CJS format) compiled perfectly! Bundle integrity validated (45.2 KB)." }
        ]
      };
    } else {
      return {
        status: "FAILED",
        exitCode: 1,
        compiler: "TypeScript Compiler v5.4.5 (esbuild-bundler)",
        environment: "Vite + React Core Sandbox (Node 20.11.0)",
        timestamp: "Live Sandbox compilation check",
        summary: `Compilation failed with 1 syntax error: Unexpected keyword or identifier in 'src/interceptor.ts'.`,
        logs: [
          { time: "+0ms", type: "info", text: "Initializing compiler daemon..." },
          { time: `+${Math.round((runItem.duration || 1000) * 0.1)}ms`, type: "info", text: "Loaded workspace tsconfig.json configuration." },
          { time: `+${Math.round((runItem.duration || 1000) * 0.25)}ms`, type: "error", text: "TypeScript Syntax Error: Unexpected keyword or identifier at /project_root/src/interceptor.ts [Line 12, Col 1]:" },
          { time: `+${Math.round((runItem.duration || 1000) * 0.26)}ms`, type: "error", text: "  11 | // Typo 'functon' introduced for testing the Safe Fix-It loop!" },
          { time: `+${Math.round((runItem.duration || 1000) * 0.27)}ms`, type: "error", text: "  12 | functon requestInterceptor(config: RequestConfig): RequestConfig {" },
          { time: `+${Math.round((runItem.duration || 1000) * 0.28)}ms`, type: "error", text: "       ^^^^^^^ 'functon' is not a valid keyword. Did you mean 'function'?" },
          { time: `+${runItem.duration}ms`, type: "warn", text: `Process exited with code 1. ${runItem.failed || 1} test assertions failed, ${runItem.passed || 12} passed.` }
        ]
      };
    }
  };
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
  const avgPercent = Math.round((selectedFileCoverage.lines + selectedFileCoverage.functions + selectedFileCoverage.branches + selectedFileCoverage.statements) / 4);

  // Dynamic Pass Rate Trend Computation
  const getPassRateTrend = () => {
    if (runsData.length < 2) return { direction: "stable" as const, diff: 0 };
    const latest = runsData[runsData.length - 1].passRate;
    const previous = runsData[runsData.length - 2].passRate;
    if (latest > previous) {
      return { direction: "up" as const, diff: latest - previous };
    } else if (latest < previous) {
      return { direction: "down" as const, diff: previous - latest };
    }
    return { direction: "stable" as const, diff: 0 };
  };

  const trend = getPassRateTrend();

  // Convert files list for single-file radar representation
  const radarData = [
    { subject: "Lines", value: selectedFileCoverage.lines },
    { subject: "Functions", value: selectedFileCoverage.functions },
    { subject: "Branches", value: selectedFileCoverage.branches },
    { subject: "Statements", value: selectedFileCoverage.statements },
  ];

  // Calculations for all recent test executions (runsData)
  const totalExecutions = runsData.length;
  const passedExecutions = runsData.filter(r => r.passRate === 100).length;
  const failedExecutions = totalExecutions - passedExecutions;
  const executionPassPercentage = totalExecutions > 0 ? Math.round((passedExecutions / totalExecutions) * 100) : 0;

  // Average pass rate across all executions
  const averagePassRate = totalExecutions > 0 
    ? Math.round(runsData.reduce((sum, r) => sum + r.passRate, 0) / totalExecutions) 
    : 0;

  // Total assertions pass/fail
  const totalPassedAssertions = runsData.reduce((sum, r) => sum + (r.passed ?? 0), 0);
  const totalFailedAssertions = runsData.reduce((sum, r) => sum + (r.failed ?? 0), 0);
  const totalAssertionsCount = totalPassedAssertions + totalFailedAssertions;
  const assertionPassPercentage = totalAssertionsCount > 0 
    ? Math.round((totalPassedAssertions / totalAssertionsCount) * 100) 
    : 0;

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

        {/* Dynamic Aggregated Execution Summary Header Dashboard */}
        <div className="bg-[#0c0d11]/90 border border-white/5 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="absolute -top-16 -left-16 w-32 h-32 bg-[#00b2ff]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00b2ff]/10 text-[#00b2ff] font-mono text-[10px] uppercase tracking-wider font-extrabold border border-[#00b2ff]/20">
                <Percent className="w-3.5 h-3.5" />
                <span>Execution Metrics Pipeline</span>
              </div>
              <h3 className="text-base font-display font-black text-white uppercase tracking-tight">Recent Executions Dashboard</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Calculated performance statistics over the last <span className="text-[#00b2ff] font-extrabold">{totalExecutions} runs</span>. Real-time test status & sandbox code reliability index.
              </p>
              <button
                onClick={exportToCSV}
                title="Export test executions history to CSV"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 active:bg-white/20 text-gray-200 hover:text-white font-mono text-[10px] uppercase tracking-wider rounded border border-white/5 hover:border-white/10 active:scale-95 transition-all duration-150 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5 text-[#00b2ff]" />
                <span>Export to CSV</span>
              </button>
            </div>

            {/* Metrics cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 lg:max-w-3xl">
              {/* Stat Card 1: Executions Success Rate */}
              <div className="bg-black/40 border border-white/[0.03] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                  <span>Success Rate</span>
                  <span className="text-emerald-400 font-bold">{executionPassPercentage}%</span>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white font-mono">{passedExecutions}</span>
                  <span className="text-xs text-gray-500 font-mono">/ {totalExecutions} Runs Passed</span>
                </div>
                <div className="mt-3.5 w-full h-1 rounded-full bg-red-500/20 flex overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${executionPassPercentage}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[9px] font-mono text-gray-500">
                  <span className="text-emerald-400">{passedExecutions} clean builds</span>
                  <span className="text-red-400">{failedExecutions} failed</span>
                </div>
              </div>

              {/* Stat Card 2: Average Pass Rate */}
              <div className="bg-black/40 border border-white/[0.03] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                  <span>Mean Assertion Pass</span>
                  <span className="text-indigo-400 font-bold">Avg Pass Rate</span>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-indigo-400 font-mono">{averagePassRate}%</span>
                  <span className="text-xs text-gray-500 font-mono">Mean Integrity</span>
                </div>
                <div className="mt-3.5 w-full h-1 rounded-full bg-indigo-950/40 flex overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-[#00b2ff]" style={{ width: `${averagePassRate}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[9px] font-mono text-gray-500">
                  <span>Goal threshold: 95% std</span>
                  <span className={averagePassRate >= 95 ? "text-emerald-400 font-bold" : averagePassRate >= 90 ? "text-amber-400 font-bold" : "text-red-400 font-bold"}>
                    {averagePassRate >= 95 ? "STABLE" : "DEGRADED"}
                  </span>
                </div>
              </div>

              {/* Stat Card 3: Total Assertions Ratios */}
              <div className="bg-black/40 border border-white/[0.03] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                  <span>Combined Assertions</span>
                  <span className="text-cyan-400 font-bold">{assertionPassPercentage}% Ratio</span>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white font-mono">{totalPassedAssertions}</span>
                  <span className="text-xs text-gray-500 font-mono">/ {totalAssertionsCount} assertions</span>
                </div>
                <div className="mt-3.5 w-full h-1 rounded-full bg-red-500/20 overflow-hidden flex">
                  <div className="h-full bg-gradient-to-r from-[#00b2ff] to-cyan-400" style={{ width: `${assertionPassPercentage}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[9px] font-mono text-gray-500">
                  <span className="text-cyan-400">{totalPassedAssertions} verified</span>
                  <span className="text-red-400">{totalFailedAssertions} failed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* Card 1: Passed Rate */}
          <div className="p-4 bg-[#0d0e12]/60 border border-white/5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#00b2ff]/20 transition-all duration-300 min-h-[160px]">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-12 h-12 text-[#10b981]" />
            </div>
            <div className="text-gray-400 text-[10px] font-mono tracking-wider uppercase flex items-center justify-between w-full">
              <span>Pass Rate</span>
              {trend.direction !== "stable" && (
                <span className={`inline-flex items-center gap-1 px-1 py-0.5 rounded text-[9px] font-bold font-mono ${
                  trend.direction === "up" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                }`}>
                  {trend.direction === "up" ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  <span>{trend.direction === "up" ? "+" : "-"}{trend.diff}%</span>
                </span>
              )}
            </div>
            
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">
                {Math.round((metrics.passed / metrics.total) * 100)}%
              </span>
              <span className="text-[10px] text-gray-500 font-mono">({metrics.passed}/{metrics.total})</span>
            </div>

            {/* Detailed D3-powered line chart trend visualizer */}
            <div className="my-1.5 h-[65px] w-full flex items-center justify-center">
              <D3PassRateTrendChart data={runsData} />
            </div>

            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${metrics.failed > 0 ? "bg-red-500 animate-pulse" : "bg-[#10b981]"}`} />
              <span>{metrics.failed > 0 ? `${metrics.failed} errors` : "Green build"}</span>
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

        {/* Historical Run Trends & Detailed Execution Logs */}
        <div className="bg-[#0d0e12]/80 border border-white/5 rounded-xl p-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00b2ff]" />
                <span className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider">Historical D3 Pass-Rate Trend & Execution Logs</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                A real-time reactive tabular view mapping the pass rates, durations, and status of recent execution runs.
              </p>
            </div>
            
            <div className="text-[10px] text-gray-500 font-mono flex items-center gap-2 bg-black/30 px-2.5 py-1 rounded-lg border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Reactive D3 Engine Live</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left side: Large D3-powered line chart trend visualizer (Span 5) */}
            <div className="lg:col-span-5 bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div className="space-y-1 text-left mb-2">
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Visual Pass-Rate Curve</span>
                <h4 className="text-xs font-bold text-white font-mono">D3 Sparkline Regression</h4>
              </div>
              <div className="w-full flex items-center justify-center py-4 px-2 bg-[#07080b]/50 rounded-lg border border-white/[0.02]">
                <div className="w-full max-w-[320px]">
                  <D3PassRateTrendChart data={runsData} />
                </div>
              </div>
              <div className="text-[9px] text-gray-500 font-mono mt-2 flex items-center justify-between w-full">
                <span>Threshold Indicator: 95% std</span>
                <span className="text-[#10b981]">Green build goal</span>
              </div>
            </div>

            {/* Right side: Detailed tabular view of recent test execution logs (Span 7) */}
            <div className="lg:col-span-7 bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-white font-mono">Recent Execution Audit Table</span>
                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                  {runsData.length} total logged
                </span>
              </div>
              
              <div className="overflow-x-auto custom-scrollbar max-h-[380px]">
                <table className="w-full text-left font-mono text-[11px] select-none border-collapse">
                  <thead className="sticky top-0 bg-[#0d0e12] z-10 shadow-md">
                    <tr className="border-b border-white/10 text-gray-400 text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 font-semibold">Execution ID</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Pass Rate</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Duration</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runsData.slice().reverse().map((runItem, index) => {
                      const isPassed = runItem.passRate === 100 && (runItem.failed === 0 || runItem.failed === undefined);
                      const isExpanded = expandedRun === runItem.run;
                      const diag = getCompilerDiagnostics(runItem);

                      return (
                        <React.Fragment key={`${runItem.run}-${index}`}>
                          <tr 
                            onClick={() => setExpandedRun(isExpanded ? null : runItem.run)}
                            className={`border-b border-white/5 hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer ${isExpanded ? "bg-white/[0.03]" : ""}`}
                          >
                            <td className="py-3 px-3 text-white font-bold flex items-center gap-1.5">
                              <span className="text-gray-500 transition-transform duration-200">
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-[#00b2ff]" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 hover:text-white" />
                                )}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00b2ff]" />
                              {runItem.run}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="inline-flex items-center gap-1">
                                <span className={`font-black ${isPassed ? "text-emerald-400" : "text-amber-400"}`}>
                                  {runItem.passRate}%
                                </span>
                                <span className="text-[9px] text-gray-500">
                                  ({runItem.passed ?? 12}/{(runItem.passed ?? 12) + (runItem.failed ?? 0)})
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right text-gray-300">
                              {runItem.duration} ms
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                                isPassed 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                              }`}>
                                {isPassed ? (
                                  <>
                                    <CheckCircle className="w-2.5 h-2.5 shrink-0" />
                                    <span>PASSED</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-2.5 h-2.5 shrink-0" />
                                    <span>FAILED</span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              {reRunningRunId === runItem.run ? (
                                <span className="inline-flex items-center gap-1 text-[9px] text-[#00b2ff] font-bold">
                                  <RefreshCcw className="w-3 h-3 animate-spin" />
                                  <span>RE-RUNNING</span>
                                </span>
                              ) : !isPassed ? (
                                <button
                                  onClick={(e) => handleReRunExecution(runItem.run, e)}
                                  disabled={reRunningRunId !== null}
                                  title="Re-run compilation for this failed execution"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 hover:bg-yellow-500/20 active:scale-95 text-yellow-400 border border-yellow-500/20 rounded font-mono text-[9px] uppercase tracking-wider transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                                >
                                  <RefreshCcw className="w-2.5 h-2.5" />
                                  <span>Re-run</span>
                                </button>
                              ) : (
                                <span className="text-gray-600 select-none">—</span>
                              )}
                            </td>
                          </tr>
                          
                          {/* Expanded Compiler Diagnostics Summary Row */}
                          {isExpanded && (
                            <tr className="bg-black/40 border-b border-white/5">
                              <td colSpan={5} className="p-4">
                                <div className="space-y-3 font-mono text-[10px] leading-relaxed text-gray-300">
                                  {/* Diagnostic Header Meta */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2 text-gray-400">
                                    <div className="flex items-center gap-2">
                                      <TerminalIcon className="w-3.5 h-3.5 text-[#00b2ff]" />
                                      <span className="font-bold text-white uppercase tracking-wider text-[9px]">
                                        Diagnostics: <span className={isPassed ? "text-emerald-400" : "text-red-400"}>{diag.status}</span>
                                      </span>
                                      <span className="text-gray-600">|</span>
                                      <span>Exit Code: {diag.exitCode}</span>
                                    </div>
                                    <div className="text-gray-500 text-[9px]">
                                      {diag.timestamp}
                                    </div>
                                  </div>

                                  {/* Host and compiler build info */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-400 text-[9.5px]">
                                    <div><span className="text-gray-600">Compiler:</span> <span className="text-gray-300">{diag.compiler}</span></div>
                                    <div><span className="text-gray-600">Runtime:</span> <span className="text-gray-300">{diag.environment}</span></div>
                                  </div>

                                  {/* Summary Statement block */}
                                  <div className={`p-2.5 rounded border ${
                                    isPassed 
                                      ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-300" 
                                      : "bg-red-950/10 border-red-500/20 text-red-300"
                                  }`}>
                                    <span className="font-bold uppercase text-[9px] tracking-wide block mb-0.5">Summary Message:</span>
                                    {diag.summary}
                                  </div>

                                  {/* Real-time styled trace logs console */}
                                  <div className="bg-[#050608] rounded-lg border border-white/5 p-3 font-mono text-[9.5px] space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar">
                                    {diag.logs.map((log, lIdx) => {
                                      let colorClass = "text-gray-400";
                                      if (log.type === "success") colorClass = "text-emerald-400";
                                      if (log.type === "error") colorClass = "text-red-400 font-bold";
                                      if (log.type === "warn") colorClass = "text-amber-400";

                                      return (
                                        <div key={lIdx} className="flex gap-2 items-start py-0.5 border-b border-white/[0.01] hover:bg-white/[0.01]">
                                          <span className="text-gray-600 select-none w-10 shrink-0">{log.time}</span>
                                          <span className={`${colorClass} whitespace-pre-wrap flex-1`}>
                                            {log.text}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Interactive Action footer */}
                                  <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1">
                                    <span className="italic">Sandbox Diagnostic Stream</span>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard?.writeText?.(JSON.stringify(diag, null, 2))
                                          .then(() => onShowNotification(`Diagnostic logs for ${runItem.run} copied to system clipboard!`, "success"))
                                          .catch(() => onShowNotification(`Failed to copy diagnostic logs`, "warning"));
                                      }}
                                      className="text-gray-400 hover:text-white transition bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/5 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider"
                                    >
                                      <Sparkles className="w-2.5 h-2.5 text-[#00b2ff]" />
                                      <span>Copy Trace</span>
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
                <div className="text-gray-400 text-[10px] font-mono tracking-wider uppercase flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-row">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    <span>Suite Pass Rate</span>
                  </div>
                  {trend.direction !== "stable" && (
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                      trend.direction === "up" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {trend.direction === "up" ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                      <span>{trend.direction === "up" ? "Up" : "Down"} {trend.diff}%</span>
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-2xl font-black text-white font-mono">
                    {Math.round((metrics.passed / metrics.total) * 100)}%
                  </span>
                  <span className="text-xs text-gray-500 font-mono ml-1">efficiency</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {trend.direction === "stable" ? (
                    metrics.failed > 0 ? "⚠️ Broken assertions found" : "✨ All checks clean"
                  ) : (
                    <span className="flex items-center gap-1">
                      {trend.direction === "up" ? "📈 Performance increased" : "📉 Failures introduced"}
                    </span>
                  )}
                </div>
              </div>

              {/* Detailed D3-powered line chart trend visualizer */}
              <div className="w-[125px] h-[75px] flex items-center justify-center bg-black/20 rounded-lg shrink-0 border border-white/[0.02] p-1 overflow-hidden">
                <D3PassRateTrendChart data={runsData} />
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
            <div className="lg:col-span-5 bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-[340px]">
              <div className="text-xs font-mono font-bold text-gray-200 self-start mb-2 flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00b2ff]" />
                  <span>Metrics & Gauge: {selectedFile}</span>
                </div>
                <span className="text-[10px] text-[#00b2ff] bg-[#00b2ff]/10 px-2 py-0.5 rounded font-mono">
                  Avg: {avgPercent}%
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 flex-1 items-center">
                {/* 1. Radar Path Graph */}
                <div className="h-[230px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="62%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.06)" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        stroke="rgba(255,255,255,0.4)" 
                        fontSize={8} 
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        stroke="rgba(255,255,255,0.2)" 
                        fontSize={7} 
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

                {/* 2. Recharts Circular Progress Gauge */}
                <div className="h-[230px] w-full flex flex-col items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Coverage", value: avgPercent },
                          { name: "Remaining", value: 100 - avgPercent }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={65}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={avgPercent >= 90 ? "#10b981" : avgPercent >= 80 ? "#00b2ff" : "#ff7a00"} />
                        <Cell fill="rgba(255, 255, 255, 0.05)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pb-4">
                    <span className="text-xl font-black text-white font-mono">{avgPercent}%</span>
                    <span className="text-[8px] text-gray-500 font-mono tracking-wider uppercase">coverage</span>
                  </div>
                  <div className="text-[10px] text-center font-mono text-gray-400">
                    {avgPercent >= 90 ? "✨ Excellent" : avgPercent >= 80 ? "⚡ Good" : "⚠️ Warning"}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
