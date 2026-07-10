import React, { useState, useEffect } from "react";
import { 
  Layers, Key, Shield, Coins, Database, RefreshCw, Radio, Globe, Terminal, 
  ArrowRight, Check, AlertCircle, Copy, Wallet, ChevronRight, HelpCircle, 
  TrendingUp, Send, Smartphone, Layout, Star, Award, Gift, Eye, MessageSquare, 
  ExternalLink, Sparkles
} from "lucide-react";

interface CommandNexusGatewayProps {
  userCredits: number;
  onAddCredits: (amount: number) => void;
  onShowNotification: (message: string, type: "success" | "info" | "warning") => void;
  currentUser: { email: string; name: string; role: "admin" | "member" } | null;
}

export default function CommandNexusGateway({
  userCredits,
  onAddCredits,
  onShowNotification,
  currentUser
}: CommandNexusGatewayProps) {
  // Navigation internal tab
  const [activeTab, setActiveTab] = useState<"overview" | "database" | "api" | "auth" | "fintech">("overview");

  // Global Config Toggles (for Database Schema Live Generator)
  const [isPremium, setIsPremium] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<"member" | "moderator" | "admin" | "advertising">("admin");
  const [includeWallet, setIncludeWallet] = useState<boolean>(true);
  const [customQuota, setCustomQuota] = useState<number>(2048); // in GB
  const [selectedChain, setSelectedChain] = useState<"ethereum" | "solana" | "bitcoin">("ethereum");

  // API Route Playground State
  const [apiKeyInput, setApiKeyInput] = useState<string>("CN-KEY-99F9A9B9C9D9-PROD");
  const [selectedLanguage, setSelectedLanguage] = useState<"nodejs" | "python">("nodejs");
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("/api/v1/auth/validate");
  const [isTestingApi, setIsTestingApi] = useState<boolean>(false);
  const [apiConsoleLogs, setApiConsoleLogs] = useState<string[]>([]);
  const [apiResponseJson, setApiResponseJson] = useState<string>("");

  // SSO & Web3 Wallet Authentication Simulation state
  const [web3Connected, setWeb3Connected] = useState<boolean>(false);
  const [connectedAddress, setConnectedAddress] = useState<string>("");
  const [signingMessage, setSigningMessage] = useState<boolean>(false);
  const [signatureHex, setSignatureHex] = useState<string>("");
  const [authenticatedJwt, setAuthenticatedJwt] = useState<string>("");

  // Fintech / Crypto Wallet balances state
  const [walletBalances, setWalletBalances] = useState({
    token: 14500.50, // In-house system token
    btc: 0.1245,
    eth: 1.845,
    sol: 22.45,
    usdt: 500.00,
    usdc: 320.40
  });
  const [transferAmount, setTransferAmount] = useState<string>("100");
  const [transferTarget, setTransferTarget] = useState<string>("0x71C...3A90");
  const [transferAsset, setTransferAsset] = useState<"token" | "btc" | "eth" | "sol" | "usdt" | "usdc">("token");
  const [transactionHistory, setTransactionHistory] = useState<any[]>([
    { id: "tx-01", type: "STAKING", asset: "token", amount: 2500, status: "SUCCESS", timestamp: "12:15:30" },
    { id: "tx-02", type: "RECEIVE", asset: "sol", amount: 5.5, status: "SUCCESS", timestamp: "14:22:10" }
  ]);

  // Real-Time Ad system simulation state
  const [adImpressionCount, setAdImpressionCount] = useState<number>(142);
  const [currentAdCreative, setCurrentAdCreative] = useState<any>({
    title: "Launch High-Density Web3 Nodes on NexusOS",
    description: "Get 2TB of E2EE SSD space globally with zero downtime operations.",
    url: "https://nexusos.solutions",
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=640&auto=format&fit=crop",
    bidAmount: "0.15 CN-Token",
    merchant: "NexusOS Solutions Ltd."
  });
  const [isRotatingAd, setIsRotatingAd] = useState<boolean>(false);

  // Copy helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowNotification(`${label} copied to system clipboard!`, "success");
  };

  // Generate Database Schema JSON live
  const generatedSchema = {
    $schema: "https://commandnexus.net/schemas/v1/user-profile.json",
    meta: {
      origin: "snippets.live",
      apiVersion: "1.4.2-stable",
      timestamp: new Date().toISOString()
    },
    user: {
      id: "usr_99a8b7c6d5e4",
      username: currentUser?.name ? currentUser.name.toLowerCase().replace(/\s+/g, "_") : "senior_ast_dev",
      email: currentUser?.email || "developer@snippets.live",
      profile: {
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150",
        role: userRole.toUpperCase(),
        permissions: 
          userRole === "admin" 
            ? ["UNIVERSAL_OPERATIONAL_CONTROL", "OVERRIDE_PRIVILEGES", "METRICS_LOOKUP"]
            : userRole === "moderator"
            ? ["TEXT_FLAG_INDICATOR", "USER_MUTE", "REPORT_QUEUE_VIEW"]
            : userRole === "advertising"
            ? ["AD_METRICS_LOOKUP", "CAMPAIGN_MANAGE", "WALLET_SPEND"]
            : ["READ_ONLY_ACCESS", "PROFILE_EDIT", "THEME_TOGGLE"]
      },
      nexusAccountTier: {
        premiumUser: isPremium,
        adSupported: !isPremium,
        storage: {
          quotaBytes: customQuota * 1024 * 1024 * 1024,
          quotaFormatted: `${customQuota} GB`,
          type: isPremium ? "E2EE Elastic SSD" : "Standard Encrypted Disk"
        },
        encryptionLevel: isPremium ? "AES-256-GCM End-To-End (Client-Side Keypair)" : "AES-256 Server-Side At Rest",
        ecosystemMultiplier: isPremium ? 2.5 : 1.0,
        premiumPerks: isPremium ? [
          "Suppress all third-party advertisement banners",
          "Unlock advanced code compiling nodes & diagnostics",
          "Zero-gas peer-to-peer digital token transfers",
          "Matching email address at username@utubemail.com"
        ] : []
      },
      cryptographicWallets: includeWallet ? {
        primaryChain: selectedChain.toUpperCase(),
        wallets: [
          {
            chain: "ETHEREUM",
            address: web3Connected && selectedChain === "ethereum" ? connectedAddress : "0x71C2496E2c11d0cfc3d2f3d3257cd443273e3a90",
            verified: web3Connected && selectedChain === "ethereum"
          },
          {
            chain: "SOLANA",
            address: web3Connected && selectedChain === "solana" ? connectedAddress : "D6uX9VpTjQ8B1nB2yS4g7pW3z5qY7rL9vTjQwErT",
            verified: web3Connected && selectedChain === "solana"
          },
          {
            chain: "BITCOIN",
            address: "bc1qxy2kg3khyp743ahp9cd0q5808scgttvtg82g34",
            verified: false
          }
        ]
      } : null,
      authTokens: {
        commandnexusJwt: authenticatedJwt || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfOTlhOGIiLCJyb2xlIjoiYWRtaW4ifQ...",
        apiKeyBinding: "CN-KEY-99F9A9B9C9D9-PROD"
      }
    }
  };

  // Simulate rotating advertisement banner content
  const handleRotateAd = () => {
    setIsRotatingAd(true);
    setTimeout(() => {
      const ads = [
        {
          title: "WhisperTech Secure AI Speech Models",
          description: "Zero-log local audio synthesis with absolute state privacy.",
          url: "https://whispertech.net",
          imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=640&auto=format&fit=crop",
          bidAmount: "0.22 CN-Token",
          merchant: "WhisperTech Net"
        },
        {
          title: "MyCanvasLab Collaborative Vector Sandbox",
          description: "Collaborative multiplayer vector engine built on WebSockets.",
          url: "https://mycanvaslab.com",
          imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=640&auto=format&fit=crop",
          bidAmount: "0.18 CN-Token",
          merchant: "CanvasLab Group"
        },
        {
          title: "uTubeChat Real-Time Video Interfacing",
          description: "Interact instantly with live stream overlays and emoji reactions.",
          url: "https://utubechat.com",
          imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640&auto=format&fit=crop",
          bidAmount: "0.30 CN-Token",
          merchant: "uTubeChat Media"
        }
      ];
      const randomAd = ads[Math.floor(Math.random() * ads.length)];
      setCurrentAdCreative(randomAd);
      setAdImpressionCount(prev => prev + 1);
      setIsRotatingAd(false);
      onShowNotification("Ad Network Feed rotated successfully.", "info");
    }, 600);
  };

  // Run mock endpoint test
  const handleRunApiTest = () => {
    setIsTestingApi(true);
    setApiConsoleLogs([]);
    setApiResponseJson("");

    const logs: string[] = [];
    const timestamp = new Date().toLocaleTimeString();

    logs.push(`[${timestamp}] INFO: Initiating security handshake request to gateway routing...`);
    logs.push(`[${timestamp}] DEBUG: Request origin checked against verified CORS domains (snippets.live)`);
    logs.push(`[${timestamp}] DEBUG: Reading authorization header key: "Bearer ${apiKeyInput.substring(0, 12)}..."`);

    setTimeout(() => {
      if (!apiKeyInput.trim() || !apiKeyInput.startsWith("CN-KEY-")) {
        logs.push(`[${timestamp}] WARN: Validation failed. API key missing or invalid format token.`);
        logs.push(`[${timestamp}] ERROR: Access Denied. HTTP Code 401 Unauthorized.`);
        setApiConsoleLogs(logs);
        setApiResponseJson(JSON.stringify({
          error: "Invalid API Credentials",
          code: 401,
          help: "Ensure your key starts with 'CN-KEY-' and matches a provisioned application identifier.",
          suggestedAction: "Retrieve valid commandnexus.net dashboard token."
        }, null, 2));
        setIsTestingApi(false);
        onShowNotification("CORS Router: Validation rejected API credentials.", "warning");
        return;
      }

      logs.push(`[${timestamp}] SUCCESS: Credentials verified successfully. Rate limiting checker passed.`);
      
      if (selectedEndpoint === "/api/v1/auth/validate") {
        logs.push(`[${timestamp}] INFO: Handshake bound to app origin: snippets.live`);
        logs.push(`[${timestamp}] INFO: Decrypting security payload for user database syncing...`);
        setApiResponseJson(JSON.stringify({
          status: "authenticated",
          appId: "snippets_live",
          clearanceLevel: userRole.toUpperCase(),
          commandNexusSync: "active",
          serverTime: new Date().toISOString(),
          rateLimits: {
            quota: 10000,
            remaining: 9942,
            resetSeconds: 3200
          }
        }, null, 2));
      } else if (selectedEndpoint === "/api/v1/ads?app_id=snippets_live&slot=top_banner") {
        logs.push(`[${timestamp}] INFO: Bidding dispatcher invoked for banner slot top_banner.`);
        logs.push(`[${timestamp}] DEBUG: Smart bidding filter evaluated 4 active campaigns.`);
        setApiResponseJson(JSON.stringify({
          ad_id: "ad_nexus_99ff99",
          app_id: "snippets_live",
          slot: "top_banner",
          creative: {
            title: currentAdCreative.title,
            description: currentAdCreative.description,
            targetUrl: currentAdCreative.url,
            imageUrl: currentAdCreative.imageUrl,
            merchant: currentAdCreative.merchant
          },
          billing: {
            model: "CPC",
            costPerClickTokens: 0.15,
            advertiserWalletId: "wlt_adv_88b22a"
          }
        }, null, 2));
      } else {
        // ledger transfer endpoint
        logs.push(`[${timestamp}] INFO: Atomically calculating internal ledger exchange...`);
        logs.push(`[${timestamp}] INFO: Deduced 0.00 gas charges for zero-limits ecosystem transaction.`);
        setApiResponseJson(JSON.stringify({
          transactionId: `tx_nexus_${Math.floor(Math.random() * 900000 + 100000)}`,
          status: "committed",
          blockchainSync: "queued",
          ledgerState: {
            asset: transferAsset.toUpperCase(),
            exchangedAmount: parseFloat(transferAmount),
            originAddress: "wlt_usr_snippets_991b",
            destinationAddress: transferTarget,
            gasFeeInhouse: "0.00 CN-Token"
          }
        }, null, 2));
      }

      setApiConsoleLogs(logs);
      setIsTestingApi(false);
      onShowNotification("CommandNexus Gateway API validated successfully!", "success");
    }, 1200);
  };

  // Web3 MetaMask Message Signing Simulation
  const handleConnectWeb3 = () => {
    if (web3Connected) {
      setWeb3Connected(false);
      setConnectedAddress("");
      setSignatureHex("");
      setAuthenticatedJwt("");
      onShowNotification("Web3 cryptographic wallet disconnected.", "info");
      return;
    }

    setWeb3Connected(true);
    const mockAddr = selectedChain === "ethereum" 
      ? "0x71C2496E2C11D0cfC3d2f3D3257CD443273E3a90"
      : selectedChain === "solana"
      ? "D6uX9VpTjQ8B1nB2yS4g7pW3z5qY7rL9vTjQwErT"
      : "bc1qxy2kg3khyp743ahp9cd0q5808scgttvtg82g34";
    setConnectedAddress(mockAddr);
    onShowNotification(`Mock Connected to ${selectedChain.toUpperCase()} wallet!`, "success");
  };

  const handleSignCryptographicMessage = () => {
    if (!web3Connected) {
      onShowNotification("Please connect a Web3 Wallet first.", "warning");
      return;
    }

    setSigningMessage(true);
    setSignatureHex("");
    setAuthenticatedJwt("");

    setTimeout(() => {
      const mockSig = "0x89abf72049e6d8a0c2394c8e7a0225d315ce9204bc99f074d20934ce3c990a421b83d810a9c8f8e0d49a37e10cde42bb900f89d81cd20e0ffcd23a9d398ea01d1b";
      const mockJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfOTlhOGIiLCJ3ZWIzQWRkcmVzcyI6IjB4NzFDMjQ5NkUyQzExRDBjZmMzZDJmM2QzMjU3Y2Q0NDMyNzNlM2E5MCIsInJvbGUiOiJhZG1pbiIsImVjb3N5c3RlbSI6ImNvbW1hbmRuZXh1cyJ9.sig_validation_committed_2026_07";
      
      setSignatureHex(mockSig);
      setAuthenticatedJwt(mockJwt);
      setSigningMessage(false);
      onShowNotification("Cryptographic message signed and validated!", "success");
    }, 1500);
  };

  // Fintech digital transfer executor
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(transferAmount);
    if (isNaN(parsed) || parsed <= 0) {
      onShowNotification("Please enter a valid transfer amount.", "warning");
      return;
    }

    if (walletBalances[transferAsset] < parsed) {
      onShowNotification(`Insufficient funds in ${transferAsset.toUpperCase()} ledger.`, "warning");
      return;
    }

    // Atomic deduction and table record queuing
    setWalletBalances(prev => ({
      ...prev,
      [transferAsset]: parseFloat((prev[transferAsset] - parsed).toFixed(4))
    }));

    const newTx = {
      id: `tx-${Math.floor(Math.random() * 9000 + 1000)}`,
      type: "SEND",
      asset: transferAsset,
      amount: parsed,
      status: "SUCCESS",
      timestamp: new Date().toLocaleTimeString()
    };

    setTransactionHistory(prev => [newTx, ...prev]);
    onShowNotification(`Atomic transfer of ${parsed} ${transferAsset.toUpperCase()} recorded to ledger!`, "success");
  };

  return (
    <div className="w-full bg-[#050608] border border-white/5 rounded-3xl p-6 md:p-8 space-y-8 select-text text-left font-sans animate-fade-in relative overflow-hidden">
      
      {/* Dynamic Background Glow Layer */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#00b2ff]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner - CommandNexus Logo Intersecting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-[#ff7a00] shadow-lg shadow-orange-500/5">
              <Layers className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-orange-500 tracking-widest bg-orange-500/10 px-2 py-0.5 rounded">
                  ECOSYSTEM HUB
                </span>
                <span className="text-[10px] text-gray-500 font-mono">v1.4.2</span>
              </div>
              <h2 className="text-2xl font-display font-black text-white tracking-tight">
                CommandNexus Gateway Core
              </h2>
            </div>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Standardized API router, single-sign-on (SSO), and cryptographic ledger synchronizer connecting client platforms to <code className="text-[#ff7a00] font-mono font-semibold">commandnexus.net</code> servers.
          </p>
        </div>

        {/* Global Connection Quality Status Block */}
        <div className="flex items-center gap-4 bg-black/40 border border-white/5 px-4 py-3 rounded-2xl shrink-0">
          <div className="space-y-1">
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Gateway Link</span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SECURED SECURE_API_ROUTER</span>
            </div>
          </div>
          <span className="text-gray-700 font-mono text-lg font-light">|</span>
          <div className="space-y-1">
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Core IP Routing</span>
            <span className="text-xs text-gray-300 font-mono font-bold">104.24.8.12</span>
          </div>
        </div>
      </div>

      {/* Persistent Ad Banner Component (Prompt Requirement #4) */}
      {!isPremium ? (
        <div className="relative w-full border border-orange-500/15 bg-[#120d09] rounded-2xl p-4 overflow-hidden shadow-lg animate-fade-in group hover:border-orange-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 bg-[#ff7a00]/10 border-l border-b border-orange-500/20 text-[#ff7a00] text-[8px] font-mono font-black px-2 py-0.5 rounded-bl tracking-widest">
            SPONSOR DISPATCH FEED
          </div>
          <div className="flex flex-col md:flex-row items-center gap-5">
            <img 
              src={currentAdCreative.imageUrl} 
              alt="Sponsor Thumbnail" 
              className="w-full md:w-36 h-20 object-cover rounded-xl border border-white/10 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 text-left space-y-1">
              <span className="text-[10px] text-orange-400/90 font-mono font-black uppercase tracking-wider block">
                {currentAdCreative.merchant}
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                {currentAdCreative.title}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
                {currentAdCreative.description}
              </p>
            </div>
            <div className="flex flex-row md:flex-col items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-5">
              <div className="text-left md:text-right flex-1 md:flex-none">
                <span className="text-[8px] font-mono text-gray-500 uppercase block">Active Bid</span>
                <span className="text-xs text-emerald-400 font-mono font-bold">{currentAdCreative.bidAmount}</span>
              </div>
              <button 
                onClick={handleRotateAd}
                disabled={isRotatingAd}
                className="px-3.5 py-1.5 rounded-lg border border-white/5 hover:border-[#ff7a00]/30 hover:bg-[#ff7a00]/5 text-gray-300 hover:text-white font-mono text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRotatingAd ? 'animate-spin text-orange-500' : 'text-gray-400'}`} />
                <span>Rotate Sponsor</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full border border-emerald-500/10 bg-[#07120a] rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-inner">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-5 h-5" />
            </span>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Premium Ad-Free Active Perks</span>
                <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-black uppercase">
                  ACTIVE
                </span>
              </h4>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Sponsor advertisements completely suppressed. Enjoy 2.5x speed multipliers and E2EE elastic storage space.
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsPremium(false);
              onShowNotification("Ad-Supported free account simulation activated.", "info");
            }}
            className="px-3 py-1 text-[9px] font-mono font-black text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition active:scale-95 shrink-0"
          >
            MOCK FREE TIER
          </button>
        </div>
      )}

      {/* Inner Subtabs Navigation Panel */}
      <div className="flex flex-wrap border-b border-white/5 p-1 bg-black/30 rounded-xl max-w-3xl font-mono text-xs font-bold text-gray-400 gap-1 md:gap-0">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "overview" ? "bg-orange-500/10 text-[#ff7a00] border border-orange-500/20 shadow-md shadow-orange-500/5" : "hover:text-white"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Ecosystem Platforms</span>
        </button>
        <button
          onClick={() => setActiveTab("database")}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "database" ? "bg-orange-500/10 text-[#ff7a00] border border-orange-500/20 shadow-md shadow-orange-500/5" : "hover:text-white"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Schema Generator</span>
        </button>
        <button
          onClick={() => setActiveTab("api")}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "api" ? "bg-orange-500/10 text-[#ff7a00] border border-orange-500/20 shadow-md shadow-orange-500/5" : "hover:text-white"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Gateway Router</span>
        </button>
        <button
          onClick={() => setActiveTab("auth")}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "auth" ? "bg-orange-500/10 text-[#ff7a00] border border-orange-500/20 shadow-md shadow-orange-500/5" : "hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>SSO & Web3 Auth</span>
        </button>
        <button
          onClick={() => setActiveTab("fintech")}
          className={`flex-1 py-2.5 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "fintech" ? "bg-orange-500/10 text-[#ff7a00] border border-orange-500/20 shadow-md shadow-orange-500/5" : "hover:text-white"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Fintech Ledger</span>
        </button>
      </div>

      {/* View Switch Panels */}
      
      {/* 1. OVERVIEW OF ALL ECOSYSTEM SERVICES */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-left space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Universal Ecosystem Map</span>
              <span className="text-[9px] font-mono text-gray-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                8 DEPLOYED ENDPOINTS
              </span>
            </h3>
            <p className="text-xs text-gray-400 leading-normal max-w-xl">
              CommandNexus bridges all platform accounts, payments, and storage under a unified SSO profile token.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {[
              { name: "utubechat.com", desc: "Real-time stream interface, active live chats, and interactive emoji drops.", active: true, status: "Connected" },
              { name: "utubemail.com", desc: "Highly encrypted secure mailboxes with custom aliases and workspace sync.", active: true, status: "Connected" },
              { name: "utube.media", desc: "PWA-enabled ultra high definition digital video platform and playlists.", active: true, status: "Connected" },
              { name: "mycanvaslab.com", desc: "Multiplayer cooperative whiteboard and architectural canvas sandbox.", active: true, status: "Standby" },
              { name: "whispertech.net", desc: "Local-first AI synthesizer, voice triggers, and advanced transcriptions.", active: true, status: "Connected" },
              { name: "hygieneteam.nz", desc: "Ecosystem operational team platform and corporate clearance registry.", active: true, status: "Connected" },
              { name: "snippets.live", desc: "This active playground platform; compiling, linting, and syncing sandbox code.", active: true, status: "CURRENT APP" },
              { name: "nexusos.solutions", desc: "Distributed server-side secure nodes, E2EE drive volumes, and computing.", active: true, status: "Standby" }
            ].map((platform, idx) => (
              <div 
                key={platform.name}
                className="relative p-5 bg-[#0d0e12]/60 border border-white/5 rounded-2xl flex flex-col justify-between group hover:border-[#ff7a00]/30 transition-all duration-300"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-white group-hover:text-[#ff7a00] transition-colors">
                      {platform.name}
                    </span>
                    <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase ${
                      platform.status === "CURRENT APP"
                        ? "bg-orange-500/10 text-[#ff7a00] border border-orange-500/20"
                        : "bg-white/5 text-gray-400"
                    }`}>
                      {platform.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed text-left">
                    {platform.desc}
                  </p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-gray-500">API Handshake:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span>SECURED</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. DYNAMIC DATABASE SCHEMA GENERATOR */}
      {activeTab === "database" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Controls Panel (left) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Schema Configuration Editor</h3>
              <p className="text-xs text-gray-400">
                Tweak parameters below to view how CommandNexus compiles the JSON profile payload in real time.
              </p>
            </div>

            <div className="space-y-4 bg-black/30 border border-white/5 p-5 rounded-2xl">
              
              {/* Premium toggle */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-white block">Ecosystem Premium Status</span>
                  <span className="text-[10px] text-gray-400 leading-normal block">Suppresses standard visual ads globally</span>
                </div>
                <button
                  onClick={() => setIsPremium(!isPremium)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isPremium ? "bg-orange-500" : "bg-white/10"
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${
                    isPremium ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Role Tier Selector */}
              <div className="space-y-2 text-left border-b border-white/5 pb-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Security / Role clearance</span>
                  <span className="text-[10px] text-gray-400 block">Enforces hardcoded app clearance tiers</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                  {["member", "moderator", "admin", "advertising"].map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserRole(role as any)}
                      className={`py-1.5 rounded uppercase border transition text-center font-bold cursor-pointer ${
                        userRole === role
                          ? "bg-orange-500/10 border-orange-500 text-orange-400"
                          : "bg-black/20 border-white/5 text-gray-400 hover:border-white/10"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Include wallet info */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-white block">Cryptographic Web3 Wallets</span>
                  <span className="text-[10px] text-gray-400 leading-normal block">Embed multichain deposit address bindings</span>
                </div>
                <button
                  onClick={() => setIncludeWallet(!includeWallet)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    includeWallet ? "bg-orange-500" : "bg-white/10"
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${
                    includeWallet ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Custom Storage slider */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Dynamic Storage Quota</span>
                  <span className="font-mono text-orange-400 font-bold">{customQuota} GB</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="10240"
                  step="5"
                  value={customQuota}
                  onChange={(e) => setCustomQuota(parseInt(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <span className="text-[9px] text-gray-500 leading-relaxed block font-mono">
                  Standard free profiles cap at 5GB storage. Premium status enables Multi-Terabyte elastic SSD drives.
                </span>
              </div>
            </div>
          </div>

          {/* Code Viewer Panel (right) */}
          <div className="lg:col-span-7 flex flex-col space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold text-gray-400 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-orange-400" />
                <span>Ecosystem JSON Schema Output</span>
              </span>
              <button 
                onClick={() => handleCopyText(JSON.stringify(generatedSchema, null, 2), "JSON schema")}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#090b0f] shadow-2xl p-4 h-[350px] overflow-y-auto font-mono text-[10px] leading-relaxed select-text">
              <pre className="text-gray-300 text-left whitespace-pre-wrap">
                {JSON.stringify(generatedSchema, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 3. API GATEWAY ROUTER & COMMAND TESTING */}
      {activeTab === "api" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-left">
          
          {/* Controls and Endpoints list (left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Ecosystem Routing Dashboard</h3>
              <p className="text-xs text-gray-400">
                All data transactions route through the secure CommandNexus routing layer verified via system keys.
              </p>
            </div>

            <div className="space-y-4 bg-black/30 border border-white/5 p-5 rounded-2xl">
              
              {/* API Key credential */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block flex items-center justify-between">
                  <span>Ecosystem Credentials Token</span>
                  <button 
                    onClick={() => {
                      setApiKeyInput("CN-KEY-99F9A9B9C9D9-PROD");
                      onShowNotification("Standard integration token loaded.", "info");
                    }}
                    className="text-[9px] font-mono text-[#ff7a00] hover:underline"
                  >
                    Quick Load Preset
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="CN-KEY-xxxx-xxxx-xxxx"
                    className="w-full bg-black/40 border border-white/5 focus:border-[#ff7a00] px-3 py-2 text-xs font-mono rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#ff7a00]/30"
                  />
                  <Key className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                </div>
              </div>

              {/* Language selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">Server SDK Framework</label>
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                  <button
                    onClick={() => setSelectedLanguage("nodejs")}
                    className={`py-1.5 rounded border transition cursor-pointer font-bold ${
                      selectedLanguage === "nodejs" ? "bg-orange-500/10 border-orange-500 text-orange-400" : "bg-black/20 border-white/5 text-gray-400"
                    }`}
                  >
                    Node.js (Express)
                  </button>
                  <button
                    onClick={() => setSelectedLanguage("python")}
                    className={`py-1.5 rounded border transition cursor-pointer font-bold ${
                      selectedLanguage === "python" ? "bg-orange-500/10 border-orange-500 text-orange-400" : "bg-black/20 border-white/5 text-gray-400"
                    }`}
                  >
                    Python (FastAPI)
                  </button>
                </div>
              </div>

              {/* Endpoint Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">Target Endpoint Node</label>
                <div className="space-y-1.5 font-mono text-[10px]">
                  {[
                    { route: "/api/v1/auth/validate", label: "Credential Validator" },
                    { route: "/api/v1/ads?app_id=snippets_live&slot=top_banner", label: "Ad System Feed" },
                    { route: "/api/v1/ledger/transfer", label: "Ledger Transaction" }
                  ].map((ep) => (
                    <button
                      key={ep.route}
                      onClick={() => setSelectedEndpoint(ep.route)}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                        selectedEndpoint === ep.route
                          ? "bg-orange-500/10 border-orange-500 text-orange-400 font-black"
                          : "bg-black/20 border-white/5 text-gray-400 hover:bg-black/40"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="block text-gray-400 uppercase text-[8px] tracking-widest">{ep.label}</span>
                        <span>{ep.route}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Trigger */}
              <button
                onClick={handleRunApiTest}
                disabled={isTestingApi}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-800 text-black font-semibold text-xs transition duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 mt-2 shadow-lg shadow-orange-500/10"
              >
                <RefreshCw className={`w-4 h-4 ${isTestingApi ? 'animate-spin' : ''}`} />
                <span>{isTestingApi ? "Validating handshake security..." : "Test Endpoint Execution"}</span>
              </button>
            </div>
          </div>

          {/* Console / Response log outputs (right) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Header snippet option */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-gray-400 block">
                API Handshake Source Code Integration ({selectedLanguage === 'nodejs' ? 'Express' : 'FastAPI'})
              </span>
              <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#090b0f] shadow-2xl p-3.5 font-mono text-[9px] h-36 overflow-y-auto text-left select-text">
                {selectedLanguage === "nodejs" ? (
                  <pre className="text-blue-300">
{`import express from "express";
import axios from "axios";

const router = express.Router();

// CommandNexus Standard API Verification Middleware
async function validateCommandNexusKey(req, res, next) {
  const apiKey = process.env.COMMANDNEXUS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "COMMANDNEXUS_API_KEY environment binding missing" });
  }

  try {
    const response = await axios.post("https://commandnexus.net/api/v1/auth/validate", {}, {
      headers: { "Authorization": \`Bearer \${apiKey}\`, "X-App-Origin": "snippets.live" }
    });
    req.nexusClearance = response.data;
    next();
  } catch (err) {
    res.status(401).json({ error: "Ecosystem authorization rejected key", details: err.message });
  }
}`}
                  </pre>
                ) : (
                  <pre className="text-green-300">
{`from fastapi import APIRouter, Header, HTTPException, Depends
import httpx
import os

router = APIRouter()

# CommandNexus Standard API Verification dependency
async def validate_commandnexus_key(authorization: str = Header(None)):
    api_key = os.getenv("COMMANDNEXUS_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="COMMANDNEXUS_API_KEY missing")
        
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post("https://commandnexus.net/api/v1/auth/validate", 
                headers={"Authorization": f"Bearer {api_key}", "X-App-Origin": "snippets.live"}
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError:
            raise HTTPException(status_code=401, detail="Ecosystem authorization rejected key")`}
                  </pre>
                )}
              </div>
            </div>

            {/* Split view Console + JSON output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              
              {/* Left console */}
              <div className="flex flex-col space-y-1.5 text-left">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Core Gateway Log Trace</span>
                <div className="bg-[#050608] border border-white/5 rounded-2xl p-3.5 font-mono text-[9px] text-gray-400 h-44 overflow-y-auto space-y-1 flex-1">
                  {apiConsoleLogs.length === 0 ? (
                    <div className="text-gray-600 flex items-center justify-center h-full italic">
                      [Gateway telemetry ready. Execute a test handshake.]
                    </div>
                  ) : (
                    apiConsoleLogs.map((log, i) => (
                      <div key={i} className="whitespace-pre-wrap leading-relaxed break-all">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right JSON */}
              <div className="flex flex-col space-y-1.5 text-left">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Response JSON Payload</span>
                <div className="bg-[#090b0f] border border-white/5 rounded-2xl p-3.5 font-mono text-[9px] text-emerald-400 h-44 overflow-y-auto flex-1">
                  {apiResponseJson ? (
                    <pre className="whitespace-pre-wrap">{apiResponseJson}</pre>
                  ) : (
                    <div className="text-gray-600 flex items-center justify-center h-full italic">
                      [Response payload empty]
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SINGLE SIGN-ON (SSO) & WEB3 WALLET AUTH */}
      {activeTab === "auth" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-left">
          
          {/* Signin pathways card (left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Unified Pathway Authenticator</h3>
              <p className="text-xs text-gray-400">
                Securely sign into the sandbox with MetaMask, standard credentials, or an instantaneous CommandNexus Magic Link.
              </p>
            </div>

            <div className="space-y-4 bg-black/30 border border-white/5 p-5 rounded-2xl">
              
              {/* Web3 Chain config */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white block">Chain Provider Selection</span>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px]">
                  {["ethereum", "solana", "bitcoin"].map((chain) => (
                    <button
                      key={chain}
                      onClick={() => {
                        setSelectedChain(chain as any);
                        if (web3Connected) {
                          setWeb3Connected(false);
                          setConnectedAddress("");
                          setSignatureHex("");
                          setAuthenticatedJwt("");
                        }
                      }}
                      className={`py-1.5 rounded uppercase border transition font-bold cursor-pointer text-center ${
                        selectedChain === chain ? "bg-orange-500/10 border-orange-500 text-orange-400" : "bg-black/20 border-white/5 text-gray-400"
                      }`}
                    >
                      {chain}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pathway 1: Web3 signature */}
              <div className="border border-white/5 bg-black/20 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-purple-500/10 text-purple-400">
                    <Wallet className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-white uppercase font-mono">Pathway 1: Crypto Wallet</span>
                </div>
                
                {web3Connected ? (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded bg-[#090b0f] border border-white/5 font-mono text-[9px] text-gray-300 break-all">
                      Connected Address: <span className="text-purple-400 font-bold">{connectedAddress}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSignMessage}
                        className="flex-1 py-1.5 rounded bg-purple-500 hover:bg-purple-600 text-black font-bold text-[10px] uppercase cursor-pointer"
                      >
                        Sign Signature Msg
                      </button>
                      <button
                        onClick={handleConnectWeb3}
                        className="py-1.5 px-3 rounded border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white text-[10px] uppercase font-bold cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectWeb3}
                    className="w-full py-2 px-3 rounded-xl bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 text-purple-300 hover:text-purple-200 font-bold text-[10px] transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Connect MetaMask / Solana Ledger
                  </button>
                )}
              </div>

              {/* Pathway 2: Magic Link */}
              <div className="border border-white/5 bg-black/20 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-orange-500/10 text-orange-400">
                    <Star className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-white uppercase font-mono">Pathway 2: Direct Magic Link</span>
                </div>
                <button
                  onClick={() => onShowNotification("Ecosystem magic-link verification email dispatched!", "success")}
                  className="w-full py-2 px-3 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-orange-400 font-bold text-[10px] transition cursor-pointer"
                >
                  Send Auth Magic-Link to {currentUser?.email || "developer@snippets.live"}
                </button>
              </div>
            </div>
          </div>

          {/* Signature Verification Sandbox (right) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-gray-400 block">
                Cryptographic Signature verification terminal (Web3)
              </span>
              
              <div className="bg-[#090b0f] border border-white/5 rounded-2xl p-5 space-y-4 flex-1">
                
                {/* Simulated text message to sign */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Message string to sign</span>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px] text-gray-300 select-text leading-relaxed">
                    "Authorize Session snippets.live authentication handshake. Secure Token index: 2026-07-08T17:41:52. Client origin: snippets.live"
                  </div>
                </div>

                {/* Signing status */}
                {signingMessage && (
                  <div className="p-4 rounded-xl bg-[#120d09] border border-orange-500/15 text-[#ff7a00] text-[10px] flex items-center gap-3 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-orange-400 shrink-0" />
                    <span>Metamask popup active. Cryptographically generating ECDSA signature hash...</span>
                  </div>
                )}

                {/* Signature output */}
                {signatureHex && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Resulting Signature HEX</span>
                    <div className="p-3 rounded-xl bg-[#0d0e12]/60 border border-purple-500/15 font-mono text-[9px] text-[#c084fc] break-all leading-relaxed relative group">
                      {signatureHex}
                      <button
                        onClick={() => handleCopyText(signatureHex, "Signature Hex")}
                        className="absolute right-2.5 bottom-2 px-1.5 py-0.5 rounded bg-purple-500/10 text-[#c084fc] hover:bg-purple-500/20 text-[8px] border border-purple-500/20 font-bold transition cursor-pointer"
                      >
                        Copy Sig
                      </button>
                    </div>
                  </div>
                )}

                {/* Auth JWT output */}
                {authenticatedJwt && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">CommandNexus SSO Token (JWT)</span>
                    <div className="p-3 rounded-xl bg-[#090b0f] border border-emerald-500/15 font-mono text-[9px] text-[#00e575] break-all leading-relaxed relative">
                      {authenticatedJwt}
                      <button
                        onClick={() => handleCopyText(authenticatedJwt, "Ecosystem JWT")}
                        className="absolute right-2.5 bottom-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[8px] border border-emerald-500/20 font-bold transition cursor-pointer"
                      >
                        Copy JWT
                      </button>
                    </div>
                  </div>
                )}

                {!signatureHex && !signingMessage && (
                  <div className="flex items-center justify-center h-44 text-gray-600 font-mono text-xs italic border border-dashed border-white/5 rounded-xl">
                    [Connect wallet and dispatch "Sign Signature Msg"]
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FINTECH, DIGITAL WALLETS & LEDGER SYNC */}
      {activeTab === "fintech" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-left">
          
          {/* Wallets grid and transfer form (left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Dual-State Fintech Hub</h3>
              <p className="text-xs text-gray-400">
                Transact instantly with the custom internal ecosystem currency or public multi-chain crypto balances.
              </p>
            </div>

            <div className="space-y-4 bg-black/30 border border-white/5 p-5 rounded-2xl">
              
              {/* Asset list */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Tracked Wallet Balances</span>
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                  
                  <div className="p-3 rounded-xl bg-[#120d09] border border-orange-500/15 text-left">
                    <span className="text-gray-500 block">Ecosystem Token</span>
                    <span className="text-xs font-bold text-[#ff7a00]">{walletBalances.token.toLocaleString()} CN-Token</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#090b0f] border border-white/5 text-left">
                    <span className="text-gray-500 block">Bitcoin (BTC)</span>
                    <span className="text-xs font-bold text-white">{walletBalances.btc} BTC</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#090b0f] border border-white/5 text-left">
                    <span className="text-gray-500 block">Ethereum (ETH)</span>
                    <span className="text-xs font-bold text-white">{walletBalances.eth} ETH</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#090b0f] border border-white/5 text-left">
                    <span className="text-gray-500 block">Solana (SOL)</span>
                    <span className="text-xs font-bold text-white">{walletBalances.sol} SOL</span>
                  </div>
                </div>
              </div>

              {/* Send / Transfer form */}
              <form onSubmit={handleExecuteTransfer} className="border-t border-white/5 pt-4 space-y-3">
                <span className="text-xs font-bold text-white block uppercase font-mono tracking-wider">Execute Atomic Transfer</span>
                
                <div className="grid grid-cols-12 gap-2">
                  
                  {/* Select asset */}
                  <div className="col-span-4">
                    <select
                      value={transferAsset}
                      onChange={(e: any) => setTransferAsset(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 text-gray-300 px-2.5 py-2 text-xs font-mono rounded-xl focus:outline-none"
                    >
                      <option value="token">CN-Token</option>
                      <option value="btc">BTC</option>
                      <option value="eth">ETH</option>
                      <option value="sol">SOL</option>
                      <option value="usdt">USDT</option>
                      <option value="usdc">USDC</option>
                    </select>
                  </div>

                  {/* Input amount */}
                  <div className="col-span-8">
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full bg-black/40 border border-white/5 px-3 py-2 text-xs font-mono rounded-xl text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Input target address */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    placeholder="Recipient Ledger Address"
                    className="w-full bg-black/40 border border-white/5 px-3 py-2 text-xs font-mono rounded-xl text-white focus:outline-none"
                    required
                  />
                </div>

                {/* Send action */}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-semibold text-xs transition duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Commit Ledger Transfer</span>
                </button>
              </form>
            </div>
          </div>

          {/* Relational Table & atomic sync ledger trace (right) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-gray-400 block">
                Relational Database Transaction Logs (State A - zero-gas ledger)
              </span>
              
              <div className="bg-[#090b0f] border border-white/5 rounded-2xl p-5 space-y-4 flex-1 overflow-y-auto h-[350px]">
                <table className="w-full text-left font-mono text-[10px] leading-relaxed">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 uppercase tracking-widest text-[8px]">
                      <th className="pb-2">TX ID</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2 text-right">Asset/Value</th>
                      <th className="pb-2 text-center">Status</th>
                      <th className="pb-2 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionHistory.map((tx) => (
                      <tr key={tx.id} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                        <td className="py-2 text-gray-400">{tx.id}</td>
                        <td className="py-2 font-bold text-white">{tx.type}</td>
                        <td className={`py-2 text-right font-black ${
                          tx.type === "SEND" ? "text-red-400" : "text-emerald-400"
                        }`}>
                          {tx.type === "SEND" ? "-" : "+"}{tx.amount} {tx.asset.toUpperCase()}
                        </td>
                        <td className="py-2 text-center">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded text-[8px] font-black uppercase">
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2 text-right text-gray-500">{tx.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pt-3 border-t border-white/5 text-[9px] text-gray-500 leading-relaxed font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Atomic isolation lock:</span>
                    <span className="text-emerald-400 font-bold">MUTEX_EXCLUSIVE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Relational database lock:</span>
                    <span className="text-emerald-400 font-bold">ACID_COMPLIANT</span>
                  </div>
                  <p className="text-[8px] text-gray-600 mt-2">
                    Note: Any transfers made in State A (In-House Token) log instantaneous, zero-gas exchanges. Bridging to public chains is queued asynchronously via State B (Web3 Aggregator).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  // Web3 helper to handle mock signature triggering
  function handleSignMessage() {
    handleSignCryptographicMessage();
  }
}
