import React, { useState } from "react";
import { Folder, File, Code, Database, HelpCircle, Server, Terminal, Shield, Sparkles, ChevronDown, ChevronRight, Check, Cpu, Search, X, ArrowDownAZ, Filter, SlidersHorizontal, Eye } from "lucide-react";
import { CodeBlueprint, CODE_BLUEPRINT_JSON_SCHEMA } from "../types";
import LivePreviewModal from "./LivePreviewModal";

interface BlueprintExplorerProps {
  blueprints: { [key: string]: CodeBlueprint };
  selectedBlueprintId: string;
  onSelectBlueprint: (id: string) => void;
  activeFilePath: string | null;
  onSelectFile: (filePath: string) => void;
  activeColorClass: string;
  activeBorderColor: string;
  isActive: boolean;
  onFocus: () => void;
}

export default function BlueprintExplorer({
  blueprints,
  selectedBlueprintId,
  onSelectBlueprint,
  activeFilePath,
  onSelectFile,
  activeColorClass,
  activeBorderColor,
  isActive,
  onFocus,
}: BlueprintExplorerProps) {
  const [showSchema, setShowSchema] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredBlueprintId, setHoveredBlueprintId] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    src: true,
    server: true,
    app: true,
    "app/controllers": true,
  });

  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"name" | "category" | "size">("name");
  const [previewModalBlueprint, setPreviewModalBlueprint] = useState<CodeBlueprint | null>(null);

  // Community engagement stats internal mock state
  interface UsageStats {
    imports: number;
    compilations: number;
    successRate: number;
  }

  const [usageStats, setUsageStats] = useState<{ [key: string]: UsageStats }>({
    react_ts_debounce: { imports: 1245, compilations: 3840, successRate: 98.4 },
    rust_cache_server: { imports: 890, compilations: 2450, successRate: 94.2 },
    node_jwt_auth: { imports: 1560, compilations: 4910, successRate: 99.1 },
    ruby_webhook_api: { imports: 670, compilations: 1890, successRate: 91.5 },
  });

  const getUsageStats = (id: string): UsageStats => {
    return usageStats[id] || { imports: 120, compilations: 350, successRate: 95.0 };
  };

  const handleSelectBlueprintWithStats = (id: string) => {
    onSelectBlueprint(id);
    setUsageStats((prev) => {
      const current = prev[id] || { imports: 120, compilations: 350, successRate: 95.0 };
      return {
        ...prev,
        [id]: {
          ...current,
          imports: current.imports + 1,
          compilations: current.compilations + (Math.random() > 0.4 ? 1 : 0),
        },
      };
    });
  };

  const selectedBlueprint = blueprints[selectedBlueprintId];

  // Map category to color highlights
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "React/TS":
        return <span className="text-[10px] bg-info-inactive text-info-active px-2 py-0.5 rounded border border-info-border/30">TypeScript</span>;
      case "Rust API":
        return <span className="text-[10px] bg-brand-inactive text-brand-active px-2 py-0.5 rounded border border-brand-border/30">Rust Cargo</span>;
      case "Node.js":
        return <span className="text-[10px] bg-success-inactive text-success-active px-2 py-0.5 rounded border border-success-border/30">Node Eco</span>;
      case "Ruby Rails":
        return <span className="text-[10px] bg-danger-inactive text-danger-active px-2 py-0.5 rounded border border-danger-border/30">Ruby Rails</span>;
      default:
        return null;
    }
  };

  const toggleFolder = (folderName: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  // Group files into directories dynamically
  const parseDirectoryTree = () => {
    const folders: Record<string, string[]> = {};
    const rootFiles: string[] = [];

    Object.keys(selectedBlueprint.files).forEach((filePath) => {
      if (filePath.includes("/")) {
        const parts = filePath.split("/");
        // Folder path is everything except the last part
        const folderPath = parts.slice(0, parts.length - 1).join("/");
        if (!folders[folderPath]) {
          folders[folderPath] = [];
        }
        folders[folderPath].push(filePath);
      } else {
        rootFiles.push(filePath);
      }
    });

    return { folders, rootFiles };
  };

  const { folders, rootFiles } = parseDirectoryTree();

  // Search filtering logic
  const query = searchQuery.trim().toLowerCase();
  
  interface SearchResult {
    blueprint: CodeBlueprint;
    blueprintMatches: boolean;
    fileMatches: {
      filePath: string;
      nameMatched: boolean;
      contentMatches: {
        lineNum: number;
        text: string;
      }[];
    }[];
  }

  const getSearchResults = (): SearchResult[] => {
    if (!query) return [];
    
    const results: SearchResult[] = [];
    
    Object.values(blueprints).forEach((bp) => {
      const blueprintMatches = 
        bp.name.toLowerCase().includes(query) || 
        bp.description.toLowerCase().includes(query);
        
      const fileMatches: SearchResult["fileMatches"] = [];
      
      Object.entries(bp.files).forEach(([filePath, fileNode]) => {
        const nameMatched = filePath.toLowerCase().includes(query);
        const contentMatches: { lineNum: number; text: string }[] = [];
        
        if (fileNode.content) {
          const lines = fileNode.content.split("\n");
          lines.forEach((line, index) => {
            if (line.toLowerCase().includes(query)) {
              contentMatches.push({
                lineNum: index + 1,
                text: line.trim()
              });
            }
          });
        }
        
        if (nameMatched || contentMatches.length > 0) {
          fileMatches.push({
            filePath,
            nameMatched,
            contentMatches
          });
        }
      });
      
      if (blueprintMatches || fileMatches.length > 0) {
        results.push({
          blueprint: bp,
          blueprintMatches,
          fileMatches
        });
      }
    });
    
    return results;
  };

  const searchResults = getSearchResults();

  const highlightText = (text: string, search: string) => {
    if (!search) return <span>{text}</span>;
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedSearch})`, "gi"));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark 
              key={i} 
              style={{
                backgroundColor: `${activeBorderColor}2D`,
                color: activeBorderColor,
                borderColor: `${activeBorderColor}4D`
              }}
              className="rounded-[3px] px-1 py-[1px] border text-[11px] font-bold"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const handleResultClick = (bpId: string, filePath: string) => {
    if (bpId === selectedBlueprintId) {
      onSelectFile(filePath);
    } else {
      onSelectBlueprint(bpId);
      setTimeout(() => {
        onSelectFile(filePath);
      }, 50);
    }
  };

  const previewBlueprint = hoveredBlueprintId ? blueprints[hoveredBlueprintId] : null;

  const getLanguageThemeInfo = (lang: string) => {
    switch (lang) {
      case "typescript":
        return {
          title: "TypeScript AST Eco",
          badgeColor: "bg-info-inactive text-info-active border-info-border/30",
          iconColor: "text-info-active",
          desc: "Statically typed JavaScript runtime with custom compilation safety diagnostics."
        };
      case "rust":
        return {
          title: "Rust Cargo Core",
          badgeColor: "bg-brand-inactive text-brand-active border-brand-border/30",
          iconColor: "text-brand-active",
          desc: "High-performance memory-safe systems programming container block."
        };
      case "javascript":
        return {
          title: "ECMAScript Sandbox",
          badgeColor: "bg-success-inactive text-success-active border-success-border/30",
          iconColor: "text-success-active",
          desc: "Vanilla Node.js execution sandbox environment for pure asynchronous pipelines."
        };
      case "ruby":
        return {
          title: "Ruby Rails Env",
          badgeColor: "bg-danger-inactive text-danger-active border-danger-border/30",
          iconColor: "text-danger-active",
          desc: "Dynamic MVC-backed object oriented script interpreter block with strict routing hooks."
        };
      default:
        return {
          title: "Runtime Snippet",
          badgeColor: "bg-white/5 text-gray-400 border-white/10",
          iconColor: "text-gray-400",
          desc: "General purpose evaluation context structure."
        };
    }
  };

  const getBlueprintStats = (bp: CodeBlueprint) => {
    const filePaths = Object.keys(bp.files);
    const fileCount = filePaths.length;
    let totalLines = 0;
    let totalBytes = 0;
    
    Object.values(bp.files).forEach((f) => {
      totalLines += f.content.split("\n").length;
      totalBytes += f.content.length;
    });
    
    return {
      fileCount,
      totalLines,
      totalBytes
    };
  };

  return (
    <div className="relative h-full">
      <div 
        onClick={onFocus}
        style={{
          borderColor: isActive ? activeBorderColor : "rgba(12, 74, 110, 0.2)",
          boxShadow: isActive ? `0 0 20px ${activeBorderColor}1A` : "none"
        }}
        className={`flex flex-col h-full rounded-xl border shadow-lg overflow-hidden transition-all duration-300 cursor-pointer ${
          isActive 
            ? "bg-[#13151a] opacity-100" 
            : "bg-[#0b101d]/90 opacity-60 hover:opacity-85 saturate-[0.7] hover:bg-[#0e1526]/90"
        }`}
      >
      {/* Catalog Selector Header */}
      <div className="px-4 py-3 bg-[#0d0e12] border-b border-canvas-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-active" />
          <span className="font-sans font-bold text-sm text-gray-200">Blueprint Registry</span>
        </div>
        <button
          onClick={() => setShowSchema(!showSchema)}
          className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 hover:underline cursor-pointer bg-white/5 px-2 py-1 rounded transition"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Show DB Schema</span>
        </button>
      </div>

      {/* Real-time Global Search Bar */}
      <div className="px-4 py-2.5 bg-[#0c0d10] border-b border-canvas-border flex items-center gap-2">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onFocus={onFocus}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files & code across blueprints..."
            className="w-full bg-[#13151a] hover:bg-[#16181e] focus:bg-[#13151a] text-xs text-white pl-9 pr-8 py-1.5 rounded-lg border border-white/5 focus:outline-none transition-all placeholder:text-gray-500 font-sans"
            style={{
              borderColor: searchQuery ? activeBorderColor : "rgba(255, 255, 255, 0.05)"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* JSON Schema Display overlay */}
      {showSchema && (
        <div className="p-4 bg-black/95 border-b border-canvas-border font-mono text-[10px] text-gray-300 max-h-[250px] overflow-y-auto space-y-2">
          <div className="flex justify-between items-center text-xs text-white pb-2 border-b border-white/10">
            <span className="font-sans font-bold text-brand-active flex items-center gap-1">
              <Database className="w-3.5 h-3.5" /> Blueprint Record Schema
            </span>
            <button
              onClick={() => setShowSchema(false)}
              className="text-gray-400 hover:text-white font-sans text-[10px] bg-white/5 px-2 py-0.5 rounded cursor-pointer"
            >
              Hide
            </button>
          </div>
          <pre className="bg-[#0d0e12] p-2.5 rounded border border-white/5 overflow-x-auto text-[9px] leading-relaxed select-text text-[#00b2ff]">
            {JSON.stringify(CODE_BLUEPRINT_JSON_SCHEMA, null, 2)}
          </pre>
        </div>
      )}

      {/* Conditionally render Search Results or standard file tree layout */}
      {searchQuery ? (
        <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[180px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-mono">
              Search Results
            </span>
            <span className="text-[10px] text-info-active font-bold px-1.5 py-0.5 rounded bg-info-inactive font-mono">
              {searchResults.reduce((acc, curr) => acc + curr.fileMatches.length, 0)} hits
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-gray-500 space-y-2">
              <Search className="w-8 h-8 text-gray-600 opacity-60 animate-pulse" />
              <span className="text-xs font-semibold text-gray-400">No matches found</span>
              <p className="text-[10px] text-gray-500 max-w-[180px] leading-normal font-sans">
                No files or code contents matched your query "{searchQuery}". Try "interceptor", "cache", or "main".
              </p>
            </div>
          ) : (
            <div className="space-y-3 font-sans">
              {searchResults.map((result) => (
                <div 
                  key={result.blueprint.id} 
                  className="border border-canvas-border rounded-lg bg-black/30 overflow-hidden"
                >
                  {/* Blueprint header within search results */}
                  <div 
                    onClick={() => handleSelectBlueprintWithStats(result.blueprint.id)}
                    onMouseEnter={() => setHoveredBlueprintId(result.blueprint.id)}
                    onMouseLeave={() => setHoveredBlueprintId(null)}
                    onFocus={() => {
                      onFocus();
                      setHoveredBlueprintId(result.blueprint.id);
                    }}
                    onBlur={() => setHoveredBlueprintId(null)}
                    className={`flex items-center justify-between p-2.5 border-b border-canvas-border hover:bg-white/[0.02] cursor-pointer transition ${
                      result.blueprint.id === selectedBlueprintId ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 max-w-[75%]">
                      <span className="font-sans font-bold text-xs text-white flex items-center gap-1.5 flex-wrap">
                        <Database className="w-3.5 h-3.5 text-brand-active flex-shrink-0" />
                        <span className="truncate">{highlightText(result.blueprint.name, searchQuery)}</span>
                        {getUsageStats(result.blueprint.id).imports >= 1000 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[7px] font-bold font-mono text-[#ff7a00] bg-[#ff7a00]/10 border border-[#ff7a00]/20 rounded uppercase tracking-wider flex-shrink-0">
                            🔥 High Usage
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] text-gray-500 line-clamp-1 leading-normal">
                        {highlightText(result.blueprint.description, searchQuery)}
                      </span>
                      {result.blueprint.tags && result.blueprint.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {result.blueprint.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 text-[8px] font-semibold bg-white/5 border border-white/5 text-gray-400 rounded hover:bg-white/10 hover:text-white transition-colors cursor-default uppercase font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[8px] font-mono text-gray-500">
                        <span className="text-[#ff7a00] font-bold">Community:</span>
                        <span>{getUsageStats(result.blueprint.id).imports.toLocaleString()} imports</span>
                        <span className="opacity-50">•</span>
                        <span className="text-success-active font-semibold">{getUsageStats(result.blueprint.id).compilations.toLocaleString()} runs</span>
                        <span className="opacity-50">•</span>
                        <span className="text-warning-active">{getUsageStats(result.blueprint.id).successRate}% pass</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {getCategoryBadge(result.blueprint.category)}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewModalBlueprint(result.blueprint);
                        }}
                        className="p-1 rounded bg-white/5 hover:bg-[#ff7a00] text-gray-400 hover:text-black transition-all flex items-center gap-1 cursor-pointer font-sans text-[9px] font-extrabold uppercase border border-white/5 hover:border-transparent active:scale-95"
                        title="Open Interactive Live Preview"
                      >
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                      {result.blueprint.id === selectedBlueprintId && (
                        <span className="text-[8px] bg-success-inactive text-success-active border border-success-border/30 px-1 py-0.5 rounded font-mono uppercase font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* File and code matches for this blueprint */}
                  <div className="p-2 space-y-2 bg-[#0c0d10]/30 font-mono">
                    {result.fileMatches.length === 0 && (
                      <div className="text-[10px] text-gray-500 italic px-2 py-1 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-warning-active" />
                        <span>Blueprint metadata matched your query</span>
                      </div>
                    )}
                    
                    {result.fileMatches.map((fm) => {
                      const isFileActive = result.blueprint.id === selectedBlueprintId && activeFilePath === fm.filePath;
                      return (
                        <div 
                          key={fm.filePath}
                          className="border border-white/5 rounded bg-black/25 overflow-hidden"
                        >
                          {/* File row */}
                          <div 
                            onClick={() => handleResultClick(result.blueprint.id, fm.filePath)}
                            className={`flex items-center justify-between p-2 hover:bg-white/5 cursor-pointer transition text-[11px] ${
                              isFileActive ? "bg-white/5 text-white" : "text-gray-400 hover:text-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <File className={`w-3.5 h-3.5 flex-shrink-0 ${isFileActive ? "opacity-100" : "opacity-60"}`} />
                              <span className="truncate">{highlightText(fm.filePath, searchQuery)}</span>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              {fm.nameMatched && (
                                <span className="text-[8px] bg-info-inactive text-info-active border border-info-border/30 px-1 py-0.2 rounded font-sans uppercase">
                                  Name Match
                                </span>
                              )}
                              {fm.contentMatches.length > 0 && (
                                <span className="text-[8px] bg-brand-inactive text-brand-active border border-brand-border/30 px-1 py-0.2 rounded font-sans uppercase">
                                  {fm.contentMatches.length} Hits
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Code line matches snippet */}
                          {fm.contentMatches.length > 0 && (
                            <div className="border-t border-white/5 bg-[#090a0d] p-1.5 max-h-[120px] overflow-y-auto space-y-1 font-mono text-[10px]">
                              {fm.contentMatches.slice(0, 3).map((match) => (
                                <div 
                                  key={match.lineNum}
                                  onClick={() => handleResultClick(result.blueprint.id, fm.filePath)}
                                  className="flex items-start gap-2 hover:bg-white/5 p-1 rounded transition cursor-pointer select-none text-gray-400 hover:text-gray-200"
                                >
                                  <span className="text-gray-600 text-[9px] w-6 text-right select-none flex-shrink-0">{match.lineNum} |</span>
                                  <span className="truncate whitespace-pre leading-normal">{highlightText(match.text, searchQuery)}</span>
                                </div>
                              ))}
                              {fm.contentMatches.length > 3 && (
                                <div className="text-[9px] text-gray-600 pl-8 pt-0.5 italic select-none font-sans">
                                  + {fm.contentMatches.length - 3} more code hits in this file
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* A-Z Category and sorting filter UI */}
          <div className="p-4 border-b border-canvas-border bg-[#0d0e12]/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-mono flex items-center gap-1">
                <Filter className="w-3 h-3 text-brand-active" />
                <span>A-Z Category Registry</span>
              </label>
              
              {selectedLetter !== "ALL" && (
                <button
                  onClick={() => setSelectedLetter("ALL")}
                  className="text-[9px] font-mono text-brand-active hover:underline transition cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Alphabet list */}
            <div className="flex flex-wrap gap-1 max-h-[85px] overflow-y-auto py-1 pr-1 bg-black/20 p-2 rounded-lg border border-white/5">
              <button
                onClick={() => setSelectedLetter("ALL")}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition cursor-pointer flex items-center gap-0.5 ${
                  selectedLetter === "ALL"
                    ? "bg-[#ff7a00] text-black font-black"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                ALL
                <span className="text-[8px] opacity-75">({Object.keys(blueprints).length})</span>
              </button>
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
                const count = Object.values(blueprints).filter((bp) => {
                  const catFirst = bp.category.charAt(0).toUpperCase();
                  const nameFirst = bp.name.charAt(0).toUpperCase();
                  return catFirst === letter || nameFirst === letter;
                }).length;

                return (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(letter)}
                    disabled={count === 0}
                    className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-mono font-bold transition cursor-pointer relative ${
                      selectedLetter === letter
                        ? "bg-[#ff7a00] text-black font-black"
                        : count > 0
                        ? "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
                        : "opacity-25 text-gray-600 pointer-events-none"
                    }`}
                  >
                    <span>{letter}</span>
                    {count > 0 && selectedLetter !== letter && (
                      <span className="absolute bottom-0 right-0 w-1 h-1 bg-[#10b981] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sorting controls */}
            <div className="flex items-center justify-between text-[10px] font-mono bg-black/10 px-2 py-1.5 rounded border border-white/[0.03]">
              <span className="text-gray-500 flex items-center gap-1 font-semibold uppercase text-[9px]">
                <ArrowDownAZ className="w-3.5 h-3.5 text-brand-active" />
                <span>Sort by</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("name")}
                  className={`px-1 rounded transition cursor-pointer font-bold ${
                    sortBy === "name" 
                      ? "text-[#ff7a00] underline underline-offset-2 decoration-1" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => setSortBy("category")}
                  className={`px-1 rounded transition cursor-pointer font-bold ${
                    sortBy === "category" 
                      ? "text-[#ff7a00] underline underline-offset-2 decoration-1" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Category
                </button>
                <button
                  onClick={() => setSortBy("size")}
                  className={`px-1 rounded transition cursor-pointer font-bold ${
                    sortBy === "size" 
                      ? "text-[#ff7a00] underline underline-offset-2 decoration-1" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Size
                </button>
              </div>
            </div>

            {/* Filtered cards grid */}
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {(() => {
                const list = Object.values(blueprints).filter((bp) => {
                  if (selectedLetter === "ALL") return true;
                  const catFirst = bp.category.charAt(0).toUpperCase();
                  const nameFirst = bp.name.charAt(0).toUpperCase();
                  return catFirst === selectedLetter || nameFirst === selectedLetter;
                });

                list.sort((a, b) => {
                  if (sortBy === "name") {
                    return a.name.localeCompare(b.name);
                  }
                  if (sortBy === "category") {
                    return a.category.localeCompare(b.category);
                  }
                  if (sortBy === "size") {
                    const statsA = getBlueprintStats(a);
                    const statsB = getBlueprintStats(b);
                    return statsB.totalLines - statsA.totalLines;
                  }
                  return 0;
                });

                if (list.length === 0) {
                  return (
                    <div className="py-6 text-center text-gray-500 font-sans text-xs">
                      No blueprints starting with "{selectedLetter}"
                    </div>
                  );
                }

                return list.map((bp) => {
                  const isActive = bp.id === selectedBlueprintId;
                  const stats = getBlueprintStats(bp);
                  
                  let borderStyle = "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]";
                  if (isActive) {
                    if (bp.language === "typescript") borderStyle = "border-info-active/70 bg-info-inactive/50 shadow-md shadow-info-active/5";
                    if (bp.language === "rust") borderStyle = "border-brand-active/70 bg-brand-inactive/50 shadow-md shadow-brand-active/5";
                    if (bp.language === "javascript") borderStyle = "border-success-active/70 bg-success-inactive/50 shadow-md shadow-success-active/5";
                    if (bp.language === "ruby") borderStyle = "border-danger-active/70 bg-danger-inactive/50 shadow-md shadow-danger-active/5";
                  }

                  return (
                    <div
                      key={bp.id}
                      onClick={() => handleSelectBlueprintWithStats(bp.id)}
                      onMouseEnter={() => setHoveredBlueprintId(bp.id)}
                      onMouseLeave={() => setHoveredBlueprintId(null)}
                      onFocus={() => {
                        onFocus();
                        setHoveredBlueprintId(bp.id);
                      }}
                      onBlur={() => setHoveredBlueprintId(null)}
                      tabIndex={0}
                      className={`w-full text-left p-3 rounded-xl border flex flex-col gap-1.5 transition-all cursor-pointer relative overflow-hidden group ${borderStyle}`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-sans font-bold text-xs text-white group-hover:text-[#ff7a00] transition-colors leading-tight flex items-center gap-1.5 flex-wrap">
                          <span>{bp.name}</span>
                          {getUsageStats(bp.id).imports >= 1000 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-bold font-mono text-[#ff7a00] bg-[#ff7a00]/10 border border-[#ff7a00]/20 rounded uppercase tracking-wider flex-shrink-0">
                              🔥 High Usage
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {getCategoryBadge(bp.category)}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewModalBlueprint(bp);
                            }}
                            className="p-1 rounded bg-white/5 hover:bg-[#ff7a00] text-gray-400 hover:text-black transition-all flex items-center gap-1 cursor-pointer font-sans text-[9px] font-extrabold uppercase border border-white/5 hover:border-transparent active:scale-95"
                            title="Open Interactive Live Preview"
                          >
                            <Eye className="w-3 h-3" />
                            <span className="hidden sm:inline">Preview</span>
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-normal">
                        {bp.description}
                      </p>

                      {bp.tags && bp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {bp.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 text-[8px] font-semibold bg-white/5 border border-white/5 hover:border-white/10 text-gray-400 rounded-md hover:bg-white/10 hover:text-white transition-colors cursor-default uppercase font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Community Usage Statistics section */}
                      <div className="bg-black/35 rounded-lg p-2 border border-white/[0.03] text-[10px] space-y-1.5">
                        <div className="flex items-center justify-between text-[8px] text-gray-500 uppercase tracking-wider font-mono">
                          <span>Community Usage</span>
                          <span className="text-[#00b2ff] font-bold">Verified Stats</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[9px]">
                          <div className="bg-white/[0.01] p-1 rounded border border-white/[0.02]">
                            <span className="text-gray-500 block text-[7px] uppercase">Imports</span>
                            <span className="text-white font-bold">{getUsageStats(bp.id).imports.toLocaleString()}</span>
                          </div>
                          <div className="bg-white/[0.01] p-1 rounded border border-white/[0.02]">
                            <span className="text-gray-500 block text-[7px] uppercase">Compiled</span>
                            <span className="text-success-active font-bold">{getUsageStats(bp.id).compilations.toLocaleString()}</span>
                          </div>
                          <div className="bg-white/[0.01] p-1 rounded border border-white/[0.02]">
                            <span className="text-gray-500 block text-[7px] uppercase">Pass Rate</span>
                            <span className="text-warning-active font-bold">{getUsageStats(bp.id).successRate}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Display category stats and environment badges on each card */}
                      <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono mt-1 pt-1.5 border-t border-white/[0.03]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 font-bold">{stats.fileCount} {stats.fileCount === 1 ? 'file' : 'files'}</span>
                          <span className="text-gray-600">•</span>
                          <span>{stats.totalLines} lines</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {bp.language === "typescript" && <span className="text-[8px] text-info-active font-bold bg-[#38bdf8]/10 px-1 py-0.2 rounded border border-info-active/10">TS</span>}
                          {bp.language === "rust" && <span className="text-[8px] text-brand-active font-bold bg-[#ff7a00]/10 px-1 py-0.2 rounded border border-[#ff7a00]/10">Rust</span>}
                          {bp.language === "javascript" && <span className="text-[8px] text-success-active font-bold bg-[#10b981]/10 px-1 py-0.2 rounded border border-[#10b981]/10">Node</span>}
                          {bp.language === "ruby" && <span className="text-[8px] text-danger-active font-bold bg-[#ef4444]/10 px-1 py-0.2 rounded border border-[#ef4444]/10">Ruby</span>}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* File Explorer Tree of selected blueprint */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[180px]">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-mono">
              Virtual Workspace Code Tree
            </span>

            <div className="space-y-1 font-mono text-xs">
              {/* Main folder icon representing the workspace */}
              <div className="flex items-center gap-2 text-gray-300 py-1 font-semibold">
                <Folder className="w-4 h-4 text-warning-active fill-warning-inactive" />
                <span className="text-gray-200">project_root /</span>
              </div>

              <div className="pl-3 border-l border-white/5 ml-1.5 space-y-1">
                {/* Dynamic Folder Groups */}
                {Object.entries(folders).map(([folderPath, filePaths]) => {
                  const isOpen = openFolders[folderPath] !== false;
                  return (
                    <div key={folderPath} className="space-y-1">
                      <button
                        onClick={() => toggleFolder(folderPath)}
                        className="w-full text-left py-1 px-1.5 rounded hover:bg-white/5 flex items-center justify-between transition group text-success-active"
                      >
                        <div className="flex items-center gap-1.5">
                          {isOpen ? (
                            <ChevronDown className="w-3 h-3 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-gray-500" />
                          )}
                          <Folder className="w-3.5 h-3.5 text-success-active fill-success-inactive" />
                          <span className="font-semibold text-[11px]">{folderPath}/</span>
                        </div>
                        <span className="text-[9px] text-gray-600 font-normal px-1 rounded bg-white/5">
                          {filePaths.length} items
                        </span>
                      </button>

                      {isOpen && (
                        <div className="pl-4 border-l border-white/5 ml-2.5 space-y-1">
                          {filePaths.map((filePath) => {
                            const isActive = activeFilePath === filePath;
                            const fileName = filePath.split("/").pop() || filePath;
                            let highlightColor = "text-gray-400 hover:text-white hover:bg-white/5";

                            if (isActive) {
                              if (selectedBlueprint.language === "typescript") highlightColor = "text-info-active bg-info-inactive font-bold";
                              if (selectedBlueprint.language === "rust") highlightColor = "text-brand-active bg-brand-inactive font-bold";
                              if (selectedBlueprint.language === "javascript") highlightColor = "text-success-active bg-success-inactive font-bold";
                              if (selectedBlueprint.language === "ruby") highlightColor = "text-danger-active bg-danger-inactive font-bold";
                            }

                            return (
                              <button
                                key={filePath}
                                onClick={() => onSelectFile(filePath)}
                                className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition cursor-pointer ${highlightColor}`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <File className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "opacity-100" : "opacity-60"}`} />
                                  <span className="truncate">{fileName}</span>
                                </div>
                                {selectedBlueprint.files[filePath].isDirty && (
                                  <span className="text-[8px] text-warning-active font-sans font-medium uppercase bg-warning-inactive px-1 rounded flex-shrink-0">
                                    edited
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Root Level Files */}
                {rootFiles.map((filePath) => {
                  const isActive = activeFilePath === filePath;
                  let highlightColor = "text-gray-400 hover:text-white hover:bg-white/5";

                  if (isActive) {
                    if (selectedBlueprint.language === "typescript") highlightColor = "text-info-active bg-info-inactive font-bold";
                    if (selectedBlueprint.language === "rust") highlightColor = "text-brand-active bg-brand-inactive font-bold";
                    if (selectedBlueprint.language === "javascript") highlightColor = "text-success-active bg-success-inactive font-bold";
                    if (selectedBlueprint.language === "ruby") highlightColor = "text-danger-active bg-danger-inactive font-bold";
                  }

                  return (
                    <button
                      key={filePath}
                      onClick={() => onSelectFile(filePath)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition cursor-pointer ${highlightColor}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <File className={`w-3.5 h-3.5 ${isActive ? "opacity-100" : "opacity-60"}`} />
                        <span>{filePath}</span>
                      </div>
                      {selectedBlueprint.files[filePath].isDirty && (
                        <span className="text-[8px] text-warning-active font-sans font-medium uppercase bg-warning-inactive px-1 rounded">
                          edited
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Anchor Container: BROWSER SANDBOX */}
      <div className="p-4 bg-[#0d0e12] border-t border-canvas-border font-mono text-[10px] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-info-active" />
            <span className="font-bold text-gray-300 tracking-wide">BROWSER SANDBOX</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success-active animate-pulse"></span>
            <span className="text-success-active text-[9px] font-bold">ONLINE</span>
          </div>
        </div>

        {/* Simulating operational telemetry metrics with clean micro-bars */}
        <div className="space-y-1.5 bg-white/[0.02] p-2 rounded border border-white/5 text-gray-400">
          <div className="flex justify-between items-center">
            <span>Core Threads (WASM):</span>
            <span className="text-gray-200">2 / 2 Virtualized</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Cache Alloc (RAM):</span>
            <span className="text-info-active">14.8 MB / 128 MB</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-info-active rounded-full" style={{ width: "12%" }}></div>
          </div>
          <div className="flex justify-between items-center pt-0.5">
            <span>Simulated CPU Latency:</span>
            <span className="text-success-active font-bold">12ms</span>
          </div>
        </div>
      </div>
    </div>

      {/* Preview Card Component (Only displays on hover/focus before selecting) */}
      {previewBlueprint && (
        <div 
          style={{
            borderColor: activeBorderColor,
            boxShadow: `0 15px 40px rgba(0, 0, 0, 0.6), 0 0 25px ${activeBorderColor}2A`
          }}
          className="absolute left-full top-0 ml-4 w-[330px] bg-[#0D1117] border rounded-xl p-4 flex flex-col gap-4 transition-all duration-300 pointer-events-none z-50 animate-in fade-in slide-in-from-left-2"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-canvas-border pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-warning-active animate-pulse" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                Blueprint Info Card
              </span>
            </div>
            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border font-mono ${getLanguageThemeInfo(previewBlueprint.language).badgeColor}`}>
              {previewBlueprint.language}
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight">
              <Database className="w-4 h-4 text-brand-active" />
              {previewBlueprint.name}
            </h4>
            <p className="text-[11px] text-gray-400 leading-normal font-sans">
              {previewBlueprint.description}
            </p>
          </div>

          {/* Codebase Metrics */}
          <div className="space-y-2 bg-black/40 p-3 rounded-lg border border-white/5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block font-mono">
              Workspace Profile & Metrics
            </span>
            
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-white/[0.02] p-2 rounded border border-white/5 flex flex-col gap-0.5">
                <span className="text-gray-500 text-[8px] uppercase font-semibold">Total Files</span>
                <span className="text-gray-200 font-bold">{getBlueprintStats(previewBlueprint).fileCount} Items</span>
              </div>
              <div className="bg-white/[0.02] p-2 rounded border border-white/5 flex flex-col gap-0.5">
                <span className="text-gray-500 text-[8px] uppercase font-semibold">Line Count</span>
                <span className="text-gray-200 font-bold">{getBlueprintStats(previewBlueprint).totalLines} LOC</span>
              </div>
              <div className="bg-white/[0.02] p-2 rounded border border-white/5 flex flex-col gap-0.5">
                <span className="text-gray-500 text-[8px] uppercase font-semibold">Workspace Size</span>
                <span className="text-info-active font-bold">{(getBlueprintStats(previewBlueprint).totalBytes / 1024).toFixed(2)} KB</span>
              </div>
              <div className="bg-white/[0.02] p-2 rounded border border-white/5 flex flex-col gap-0.5">
                <span className="text-gray-500 text-[8px] uppercase font-semibold">Group Env</span>
                <span className="text-brand-active font-bold truncate">{previewBlueprint.category}</span>
              </div>
            </div>

            {/* Entry point */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
              <span className="text-gray-500 text-[8px] uppercase font-semibold">Entry Point</span>
              <span className="text-warning-active font-semibold truncate max-w-[170px] bg-warning-inactive/20 px-1.5 py-0.5 rounded border border-warning-border/10">
                {previewBlueprint.entryPoint}
              </span>
            </div>
          </div>

          {/* Sandbox Tasks */}
          <div className="space-y-2 font-mono text-[10px]">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">
              Sandbox Build Scripting
            </span>
            <div className="bg-black/60 p-2.5 rounded border border-white/5 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-semibold text-[8px] w-12 uppercase">Build:</span>
                <span className="text-gray-300 font-bold">{previewBlueprint.buildCmd}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-semibold text-[8px] w-12 uppercase">Run:</span>
                <span className="text-success-active font-bold">{previewBlueprint.runCmd}</span>
              </div>
            </div>
          </div>

          {/* Summary highlight */}
          <div className="text-[10px] leading-relaxed text-gray-400 font-sans italic p-2.5 bg-white/[0.01] border border-dashed border-white/5 rounded-lg">
            {getLanguageThemeInfo(previewBlueprint.language).desc}
          </div>

          {/* Help hint */}
          <div className="text-[9px] font-semibold text-center text-gray-500 font-mono border-t border-white/5 pt-2 flex items-center justify-center gap-1 select-none">
            <Check className="w-3 h-3 text-success-active" />
            <span>CLICK Blueprint TO MOUNT FILE TREE</span>
          </div>
        </div>
      )}

      {previewModalBlueprint && (
        <LivePreviewModal
          blueprint={previewModalBlueprint}
          onClose={() => setPreviewModalBlueprint(null)}
          onImport={() => onSelectBlueprint(previewModalBlueprint.id)}
        />
      )}
    </div>
  );
}
