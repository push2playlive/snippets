import React, { useState, useEffect, useRef } from "react";
import { 
  DollarSign, Award, ChevronDown, Calendar, ArrowUpRight, CheckCircle, 
  RefreshCw, TrendingUp, Sparkles, BookOpen, Clock, AlertCircle, Coins
} from "lucide-react";

interface EarnBackTx {
  id: string;
  source: string;
  amount: number;
  time: string;
  type: "royalty" | "compile_rebate" | "marketplace";
}

export default function EarningsTracker() {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState<number>(148.50);
  const [cumulativeEarned, setCumulativeEarned] = useState<number>(312.40);
  const [withdrawnTotal, setWithdrawnTotal] = useState<number>(163.90);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTheme, setActiveTheme] = useState<string>("default");

  const [transactions, setTransactions] = useState<EarnBackTx[]>([
    {
      id: "tx-1",
      source: "JWT Authorization Interceptor Access Payout",
      amount: 9.75, // 65% of 15.00
      time: "Just now",
      type: "royalty"
    },
    {
      id: "tx-2",
      source: "Sandbox Transpilation Rebate (auth.ts code verify)",
      amount: 2.10,
      time: "2 hours ago",
      type: "compile_rebate"
    },
    {
      id: "tx-3",
      source: "Cryptographic AES Session Vault Royalties",
      amount: 16.25, // 65% of 25.00
      time: "Today, 10:14 AM",
      type: "royalty"
    },
    {
      id: "tx-4",
      source: "ZIP Dynamic Packer Module Purchase Split",
      amount: 11.70, // 65% of 18.00
      time: "Yesterday, 4:45 PM",
      type: "marketplace"
    },
    {
      id: "tx-5",
      source: "Binary Tree Balance Sorter access fee",
      amount: 6.50, // 65% of 10.00
      time: "Jul 01, 2026",
      type: "royalty"
    }
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load state from localStorage on mount and register listeners for cross-component synchronization
  useEffect(() => {
    const savedBalance = localStorage.getItem("snippets_live_eb_balance");
    const savedCumulative = localStorage.getItem("snippets_live_eb_cumulative");
    const savedWithdrawn = localStorage.getItem("snippets_live_eb_withdrawn");
    const savedTxs = localStorage.getItem("snippets_live_eb_txs");

    if (savedBalance) setBalance(parseFloat(savedBalance));
    if (savedCumulative) setCumulativeEarned(parseFloat(savedCumulative));
    if (savedWithdrawn) setWithdrawnTotal(parseFloat(savedWithdrawn));
    if (savedTxs) {
      try {
        setTransactions(JSON.parse(savedTxs));
      } catch (e) {
        console.error("Failed to parse saved EarnBack transactions", e);
      }
    } else {
      // Seed storage
      localStorage.setItem("snippets_live_eb_balance", "148.50");
      localStorage.setItem("snippets_live_eb_cumulative", "312.40");
      localStorage.setItem("snippets_live_eb_withdrawn", "163.90");
      localStorage.setItem("snippets_live_eb_txs", JSON.stringify(transactions));
    }

    // Dynamic event listener for synchronizing EarnBack payouts across different screens (like when clicking 'Publish to A-Z' or compiling with agent)
    const handleEarnbackUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { balance: newBal, cumulative: newCum, tx: newTx } = customEvent.detail;
        if (newBal !== undefined) setBalance(newBal);
        if (newCum !== undefined) setCumulativeEarned(newCum);
        if (newTx) {
          setTransactions(prev => [newTx, ...prev]);
        }
      }
    };

    window.addEventListener("earnback-state-changed", handleEarnbackUpdate);

    // Detect click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("earnback-state-changed", handleEarnbackUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update states helper that commits to localStorage & triggers event
  const updateEarnBackStore = (newBal: number, newCum: number, newWithdrawn: number, updatedTxs: EarnBackTx[]) => {
    setBalance(newBal);
    setCumulativeEarned(newCum);
    setWithdrawnTotal(newWithdrawn);
    setTransactions(updatedTxs);

    localStorage.setItem("snippets_live_eb_balance", newBal.toFixed(2));
    localStorage.setItem("snippets_live_eb_cumulative", newCum.toFixed(2));
    localStorage.setItem("snippets_live_eb_withdrawn", newWithdrawn.toFixed(2));
    localStorage.setItem("snippets_live_eb_txs", JSON.stringify(updatedTxs));

    // Dispatch event so other components (like Workbench) are notified of balance changes in real-time
    const event = new CustomEvent("earnback-state-changed", {
      detail: { balance: newBal, cumulative: newCum, withdrawn: newWithdrawn }
    });
    window.dispatchEvent(event);
  };

  // Trigger simulated royalty payout access (simulates a visitor loading the user's published scripts)
  const handleSimulateVisitorAccess = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const accessAmounts = [9.75, 6.50, 11.70, 16.25, 4.55];
      const selectedAmount = accessAmounts[Math.floor(Math.random() * accessAmounts.length)];
      const modules = [
        "JWT Authorization Interceptor",
        "Binary Tree Balance Sorter",
        "Cryptographic AES Session Vault",
        "ZIP Dynamic Packer Module",
        "Reactive State Hook helper"
      ];
      const selectedModule = modules[Math.floor(Math.random() * modules.length)];
      
      const newTx: EarnBackTx = {
        id: "tx-sim-" + Date.now(),
        source: `External Developer access of "${selectedModule}" (65% share earned)`,
        amount: selectedAmount,
        time: "Just now",
        type: "royalty"
      };

      const nextBal = balance + selectedAmount;
      const nextCum = cumulativeEarned + selectedAmount;
      const nextTxs = [newTx, ...transactions.slice(0, 8)]; // Cap at 9 logs for beauty

      updateEarnBackStore(nextBal, nextCum, withdrawnTotal, nextTxs);
      setIsSimulating(false);
    }, 800);
  };

  // Withdraw simulated cash
  const handleClaimWithdrawal = () => {
    if (balance <= 0) {
      alert("Your EarnBack balance is currently empty! Share more snippets or run compiler checks to accumulate royalties.");
      return;
    }

    const claimAmt = balance;
    if (confirm(`Do you want to claim your pending EarnBack balance of $${claimAmt.toFixed(2)}?\n\nThis will transfer the amount to your snippets.live credit pool or payout handle (65% share successfully claimed).`)) {
      const newTx: EarnBackTx = {
        id: "tx-withdraw-" + Date.now(),
        source: `EarnBack Royalty Payout claimed to developer wallet`,
        amount: -claimAmt,
        time: "Just now",
        type: "compile_rebate"
      };

      const nextBal = 0;
      const nextWithdrawn = withdrawnTotal + claimAmt;
      const nextTxs = [newTx, ...transactions.slice(0, 8)];

      updateEarnBackStore(nextBal, cumulativeEarned, nextWithdrawn, nextTxs);
      alert(`Success! $${claimAmt.toFixed(2)} has been successfully claimed. Ongoing royalty stream remains active under 65%/35% split.`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Earnings Tracker Header Widget Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#1c241d] hover:bg-[#253227] border border-[#2e5d36]/40 transition duration-250 cursor-pointer shadow-md select-none group"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-active opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-active"></span>
        </span>
        
        <div className="flex flex-col items-start font-mono text-left">
          <span className="text-[9px] text-[#55b863] font-bold tracking-widest uppercase flex items-center gap-0.5">
            <Coins className="w-2.5 h-2.5" />
            <span>EARNBACK (EB)</span>
          </span>
          <span className="text-xs font-bold text-white flex items-center">
            ${balance.toFixed(2)}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 group-hover:text-white transition duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover detailed panel overlay */}
      {isOpen && (
        <div 
          style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 25px rgba(34, 197, 94, 0.08)" }}
          className="absolute right-0 mt-2.5 w-[330px] bg-[#0d1017] border border-[#2e5d36]/30 rounded-2xl p-4 flex flex-col gap-4 z-[99] animate-in slide-in-from-top-2 duration-200"
        >
          
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-success-active" />
              <span className="font-sans font-bold text-xs text-white uppercase tracking-tight">
                EarnBack (EB) Program
              </span>
            </div>
            <span className="text-[8px] font-mono font-bold text-[#55b863] bg-[#1c241d] px-2 py-0.5 rounded border border-[#2e5d36]/20">
              65% ACTIVE CREATOR SPLIT
            </span>
          </div>

          {/* Core Balance Metrics */}
          <div className="grid grid-cols-2 gap-2 font-mono">
            
            {/* Current claimable balance */}
            <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex flex-col justify-center">
              <span className="text-[8px] text-gray-500 uppercase font-semibold">Claimable Balance</span>
              <span className="text-sm font-black text-white mt-1 flex items-center">
                <DollarSign className="w-3.5 h-3.5 text-success-active" />
                <span>{balance.toFixed(2)}</span>
              </span>
            </div>

            {/* Total Cumulative Earnings */}
            <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex flex-col justify-center">
              <span className="text-[8px] text-gray-500 uppercase font-semibold">Cumulative Earned</span>
              <span className="text-sm font-black text-[#00b2ff] mt-1 flex items-center">
                <DollarSign className="w-3.5 h-3.5 text-[#00b2ff]" />
                <span>{cumulativeEarned.toFixed(2)}</span>
              </span>
            </div>

          </div>

          {/* Revenue split meter */}
          <div className="space-y-1.5 font-mono text-[10px]">
            <div className="flex justify-between text-gray-400">
              <span>Your Snippet Sales Split:</span>
              <span className="text-white font-bold">65% Creator / 35% Platform</span>
            </div>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden flex">
              <div className="h-full bg-success-active" style={{ width: "65%" }} title="Creator Share" />
              <div className="h-full bg-orange-500" style={{ width: "35%" }} title="snippets.live Share" />
            </div>
          </div>

          {/* claim payout trigger */}
          <button
            onClick={handleClaimWithdrawal}
            disabled={balance <= 0}
            className="w-full py-2 bg-[#1c241d] hover:bg-[#253227] disabled:opacity-50 text-success-active hover:text-white border border-[#2e5d36]/40 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Coins className="w-4 h-4 text-success-active" />
            <span>CLAIM EARNBACK PAYOUT</span>
          </button>

          {/* Simulator Box */}
          <div className="bg-[#18110b] border border-orange-500/10 rounded-xl p-3 space-y-2 font-mono text-[10px]">
            <div className="flex items-center gap-1.5 text-brand-active">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-bold">Sandbox Visitor Simulation</span>
            </div>
            <p className="text-gray-400 leading-normal text-[9px]">
              Simulate external developers accessing, executing, or compiling your sandbox snippets in the marketplace category.
            </p>
            <button
              onClick={handleSimulateVisitorAccess}
              disabled={isSimulating}
              className="w-full py-1.5 bg-[#ff7a00]/10 hover:bg-[#ff7a00]/20 text-brand-active border border-[#ff7a00]/20 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isSimulating ? "animate-spin" : ""}`} />
              <span>{isSimulating ? "SIMULATING TRAFFIC..." : "SIMULATE VISIT ACCESS (EB REVENUE)"}</span>
            </button>
          </div>

          {/* Transaction Logs */}
          <div className="space-y-2">
            <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest block border-b border-white/5 pb-1">
              Active Revenue Log
            </span>

            <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 font-mono text-[9px]">
              {transactions.map(tx => {
                const isPayout = tx.amount < 0;
                return (
                  <div key={tx.id} className="flex justify-between items-start gap-2 bg-black/20 p-2 rounded border border-white/5">
                    <div className="space-y-0.5 max-w-[78%]">
                      <span className="text-gray-300 block truncate leading-tight" title={tx.source}>
                        {tx.source}
                      </span>
                      <span className="text-gray-500 block text-[8px]">{tx.time}</span>
                    </div>
                    <span className={`font-bold ${isPayout ? "text-red-400" : "text-success-active"}`}>
                      {isPayout ? "" : "+"}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
