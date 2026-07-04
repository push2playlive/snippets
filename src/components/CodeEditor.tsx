import React, { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, AlertTriangle, FileCode, CheckCircle, HelpCircle, Camera } from "lucide-react";

interface CodeEditorProps {
  filePath: string;
  fileContent: string;
  onCodeChange: (newContent: string) => void;
  language: string;
  onCompile: () => void;
  onRestoreTypo: () => void;
  onSnapshot?: () => void;
  compilationError: string | null;
  activeColorClass: string;
  activeBorderColor: string;
  isCompiling: boolean;
  isDirty?: boolean;
  isActive: boolean;
  onFocus: () => void;
}

export default function CodeEditor({
  filePath,
  fileContent,
  onCodeChange,
  language,
  onCompile,
  onRestoreTypo,
  onSnapshot,
  compilationError,
  activeColorClass,
  activeBorderColor,
  isCompiling,
  isDirty,
  isActive,
  onFocus,
}: CodeEditorProps) {
  const linesArray = fileContent.split("\n");
  const lineCount = linesArray.length;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [cursor, setCursor] = useState({ line: 1, col: 1 });

  // Sync scroll of line numbers, code highlighter, and textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const scrollLeft = e.currentTarget.scrollLeft;

    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
    if (highlighterRef.current) {
      highlighterRef.current.scrollTop = scrollTop;
      highlighterRef.current.scrollLeft = scrollLeft;
    }
  };

  const updateCursor = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const textBeforeCursor = target.value.substring(0, target.selectionStart);
    const lines = textBeforeCursor.split("\n");
    setCursor({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  // Get active framework/language version label
  const getLanguageVersionLabel = () => {
    const lang = language.toLowerCase();
    if (lang === "typescript") return "TYPESCRIPT 5.2";
    if (lang === "rust") return "RUSTC 1.72";
    if (lang === "javascript") return "NODE 20.4";
    if (lang === "ruby") return "RUBY 3.2";
    return "UNKNOWN ENGINE";
  };

  return (
    <div
      onClick={onFocus}
      style={{ 
        borderColor: isActive ? activeBorderColor : "rgba(12, 74, 110, 0.2)",
        boxShadow: isActive ? `0 0 25px ${activeBorderColor}22` : "none"
      }}
      className={`flex flex-col h-full rounded-xl border shadow-xl overflow-hidden transition-all duration-300 cursor-pointer ${
        isActive 
          ? "bg-[#0d0e12] opacity-100" 
          : "bg-[#080d19]/90 opacity-60 hover:opacity-85 saturate-[0.6] hover:bg-[#0b1223]/90"
      }`}
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#13151a] border-b border-canvas-border">
        <div className="flex items-center gap-2.5">
          <FileCode className="w-4 h-4 text-info-active" />
          <span className="font-mono text-xs text-gray-200 font-semibold">{filePath}</span>
          {isDirty && (
            <span className="w-1.5 h-1.5 rounded-full bg-warning-active" title="Modified but not compiled" />
          )}
          <span className="text-[10px] text-gray-400 px-1.5 py-0.5 rounded bg-white/5 font-mono capitalize">
            {getLanguageVersionLabel()}
          </span>
        </div>

        {/* Compile / Controls */}
        <div className="flex items-center gap-2">
          {compilationError && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-danger-inactive text-danger-active text-[10px] font-mono border border-danger-border/30 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Red State (Compiler Broken)</span>
            </div>
          )}
          {!compilationError && !isDirty && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-success-inactive text-success-active text-[10px] font-mono border border-success-border/30">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Green State (Stable)</span>
            </div>
          )}

          <button
            onClick={onRestoreTypo}
            title="Inject intentional bug to test AI repair"
            className="px-2 py-1.5 text-[11px] font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-warning-active" />
            <span className="hidden md:inline">Restore Typo Bug</span>
          </button>

          {onSnapshot && (
            <button
              type="button"
              onClick={onSnapshot}
              title="Snapshot all files in the active blueprint to history log"
              className="px-2 py-1.5 text-[11px] font-medium text-gray-400 hover:text-[#00b2ff] hover:bg-[#00b2ff]/5 hover:border-[#00b2ff]/20 rounded-lg border border-white/5 flex items-center gap-1 transition cursor-pointer active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-[#00b2ff]" />
              <span className="hidden md:inline">Snapshot to History</span>
              <span className="inline md:hidden">Snapshot</span>
            </button>
          )}

          <button
            onClick={onCompile}
            disabled={isCompiling}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer text-black ${activeColorClass} hover:brightness-110 disabled:opacity-50`}
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>{isCompiling ? "Compiling..." : "Compile & Run"}</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Code Textarea and Side Numbers */}
      <div className="flex-1 flex overflow-hidden min-h-[300px] relative">
        {/* Line Numbers Sidebar */}
        <div
          ref={lineNumbersRef}
          className="w-11 select-none py-4 text-right pr-3 border-r border-canvas-border font-mono text-xs text-gray-600 bg-[#0d0e12] overflow-hidden leading-6"
        >
          {Array.from({ length: lineCount }).map((_, index) => {
            const isErrorLine =
              compilationError &&
              ((filePath.endsWith("interceptor.ts") && linesArray[index]?.includes("functon")) ||
                (filePath.endsWith("main.rs") && linesArray[index]?.includes("insert(\"health\", \"OK\")")) ||
                (filePath.endsWith("middleware.js") && linesArray[index]?.includes("constt")) ||
                (filePath.endsWith("webhook_controller.rb") && linesArray[index]?.includes("defx")));
            return (
              <div
                key={index}
                className={`transition-colors duration-200 ${
                  isErrorLine ? "text-danger-active font-bold" : ""
                }`}
              >
                {index + 1}
              </div>
            );
          })}
        </div>

        {/* Code Input Container */}
        <div className="flex-1 relative bg-transparent overflow-hidden">
          {/* Synchronized Row Error Highlighter Background Layer */}
          <div
            ref={highlighterRef}
            className="absolute inset-0 py-4 pointer-events-none font-mono text-xs leading-6 overflow-hidden select-none whitespace-pre z-0"
          >
            {linesArray.map((lineText, idx) => {
              const isErrorLine =
                compilationError &&
                ((filePath.endsWith("interceptor.ts") && lineText.includes("functon")) ||
                  (filePath.endsWith("main.rs") && lineText.includes("insert(\"health\", \"OK\")")) ||
                  (filePath.endsWith("middleware.js") && lineText.includes("constt")) ||
                  (filePath.endsWith("webhook_controller.rb") && lineText.includes("defx")));

              return (
                <div
                  key={idx}
                  className={`w-full h-6 flex items-center transition-all duration-200 ${
                    isErrorLine
                      ? "bg-danger-inactive border-l-2 border-danger-active"
                      : ""
                  }`}
                >
                  <span className="opacity-0 select-none">{lineText || " "}</span>
                </div>
              );
            })}
          </div>

          {/* Interactive Textarea Layer */}
          <textarea
            ref={textareaRef}
            value={fileContent}
            onChange={(e) => onCodeChange(e.target.value)}
            onScroll={handleScroll}
            onKeyUp={updateCursor}
            onSelect={updateCursor}
            onClick={updateCursor}
            className="w-full h-full p-4 bg-transparent text-gray-200 outline-none resize-none font-mono text-xs leading-6 overflow-y-auto selection:bg-white/10 relative z-10 carets-info-active"
            spellCheck="false"
            placeholder="// Write code here..."
          />
        </div>
      </div>

      {/* Editor Footer Status */}
      <div className="px-4 py-2 bg-[#13151a] border-t border-canvas-border flex justify-between items-center text-[10px] text-gray-500 font-mono">
        <div>
          <span>Lines: {lineCount}</span>
          <span className="mx-2">|</span>
          <span>Tab Size: 2 Spaces</span>
        </div>
        <div className="flex items-center gap-3">
          <span>LINE {cursor.line}, COL {cursor.col}</span>
          <span className="text-gray-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success-active animate-pulse"></span>
            <span>Sandbox Virtual Host</span>
          </div>
        </div>
      </div>
    </div>
  );
}
