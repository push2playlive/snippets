import React, { useState } from "react";
import { Check, Sparkles, Zap, Shield, HelpCircle, AlertCircle, Coins, Award, Flame, Cpu } from "lucide-react";
import { ModelTier } from "../types";

interface PricingPageProps {
  currentTier: ModelTier;
  onChangeTier: (tier: ModelTier) => void;
  userCredits: number;
  onAddCredits: (amount: number) => void;
  onShowNotification: (message: string, type: "success" | "info" | "warning") => void;
}

export default function PricingPage({
  currentTier,
  onChangeTier,
  userCredits,
  onAddCredits,
  onShowNotification,
}: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      name: "Sandbox Starter",
      tagline: "For learning & simple AST experiments",
      priceMonthly: 0,
      priceAnnual: 0,
      badge: "Free Tier",
      icon: Cpu,
      iconColor: "text-gray-400",
      description: "Explore standard AST blueprints with single-session compiler emulators.",
      features: [
        "20 static checks / day",
        "Standard Gemini 2.5 Flash-Lite speed",
        "Local playground state",
        "A-Z Category Registry filters",
        "Public Read-Only State sharing",
        "Basic Markdown Documentation",
      ],
      notIncluded: [
        "Gemini 3 Pro Logic Engine access",
        "AI AST Auto-repair Fix-it loop",
        "Offline compilation ZIP packages",
        "Custom UI premium theme overlays",
        "Unlimited sandbox run runtimes",
      ],
      ctaText: "Current Plan",
      tier: "free" as const,
      isPopular: false,
    },
    {
      name: "Developer Pro",
      tagline: "Unlock full power of AST and AI intelligence",
      priceMonthly: 19,
      priceAnnual: 15,
      badge: "Highly Popular",
      icon: Sparkles,
      iconColor: "text-brand-active",
      description: "Advanced AI assistance, high-speed compiled runtimes, and premium sandbox customizers.",
      features: [
        "Unlimited compiles & runs",
        "Gemini 3 Pro Frontier Logic routing",
        "Interactive AI Safe AST Fix-it repairs",
        "Unlimited ZIP & offline package exports",
        "Access to premium theme overlays",
        "65% royalty share on public sales",
        "Bonus $10.00 sandbox credits",
      ],
      ctaText: "Upgrade to Pro",
      tier: "pro" as const,
      isPopular: true,
    },
    {
      name: "Enterprise Core",
      tagline: "Secure workspace & dedicated container logic",
      priceMonthly: 99,
      priceAnnual: 79,
      badge: "Team Scale",
      icon: Flame,
      iconColor: "text-[#00b2ff]",
      description: "Dedicated resources, enhanced licensing, and priority support channels for teams.",
      features: [
        "Dedicated container CPU allocations",
        "SLA guaranteed compiler runtimes",
        "Custom AST rule engines & lint filters",
        "Bulk offline packages builder",
        "Priority premium ticket support",
        "Dedicated account representative",
        "Bonus $50.00 sandbox credits",
      ],
      ctaText: "Provision Enterprise",
      tier: "pro" as const, // Uses Pro tier features on frontend too
      isPopular: false,
    }
  ];

  const handleSelectPlan = (plan: typeof plans[0]) => {
    if (plan.tier === "free" && currentTier === "free") {
      onShowNotification("You are already on the Sandbox Starter free tier.", "info");
      return;
    }

    setLoadingPlan(plan.name);

    setTimeout(() => {
      setLoadingPlan(null);
      onChangeTier(plan.tier);
      
      let creditBonus = 0;
      if (plan.name === "Developer Pro") {
        creditBonus = 10.00;
      } else if (plan.name === "Enterprise Core") {
        creditBonus = 50.00;
      }

      if (creditBonus > 0) {
        onAddCredits(creditBonus);
        onShowNotification(`Successfully upgraded to ${plan.name}! Added a bonus of $${creditBonus.toFixed(2)} to your developer wallet!`, "success");
      } else {
        onShowNotification(`Plan adjusted to ${plan.name} successfully.`, "success");
      }
    }, 1200);
  };

  const handleBuyCredits = (amount: number) => {
    onAddCredits(amount);
    onShowNotification(`Added $${amount.toFixed(2)} developer credits to your profile.`, "success");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-canvas-bg text-gray-300 p-6 md:p-8 animate-fade-in space-y-12 select-text">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3.5">
        <span className="text-[10px] font-mono font-black text-brand-active uppercase tracking-widest px-2.5 py-1 bg-brand-inactive/40 border border-brand-border/30 rounded-full">
          Fair and Transparent Pricing
        </span>
        <h2 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight">
          CHOOSE YOUR AST PLAYGROUND LEVEL
        </h2>
        <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
          Upgrade your routing engines, unlock AI AST repair bots, and compile unlimited offline sandbox bundles. No hidden fees or lock-ins.
        </p>

        {/* Toggle billingCycle */}
        <div className="flex items-center justify-center pt-3">
          <div className="bg-black/40 p-1 rounded-xl border border-white/5 flex items-center gap-1 font-mono text-[10px] font-bold">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-brand-inactive text-brand-active border border-brand-border/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              MONTHLY BILLING
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                billingCycle === "annual"
                  ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>ANNUAL BILLING</span>
              <span className="text-[8px] bg-[#10b981]/20 text-[#10b981] px-1 py-0.2 rounded font-bold uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {plans.map((plan) => {
          const PlanIcon = plan.icon;
          const isCurrent = plan.tier === currentTier && (plan.name !== "Enterprise Core");
          const displayPrice = billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnual;
          const savingsText = billingCycle === "annual" && plan.priceMonthly > 0 
            ? `Billed annually ($${displayPrice * 12}/yr)`
            : "Billed monthly";

          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-[#0d0f14] p-5 flex flex-col gap-5 transition-all duration-300 relative overflow-hidden group ${
                plan.isPopular
                  ? "border-[#ff7a00]/40 shadow-xl shadow-[#ff7a00]/5 scale-[1.01] md:scale-[1.03]"
                  : "border-white/5 hover:border-white/15"
              }`}
            >
              {/* Highlight ribbon for popular tier */}
              {plan.isPopular && (
                <div className="absolute top-0 right-0">
                  <span className="bg-[#ff7a00] text-black font-mono font-bold text-[8px] px-3 py-1 uppercase rounded-bl-xl tracking-wider block">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Standard badge for other plans */}
              {!plan.isPopular && (
                <div className="absolute top-4 right-4">
                  <span className="text-[9px] font-mono font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Header card info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl bg-white/5 ${plan.iconColor}`}>
                    <PlanIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-sans font-extrabold text-white">{plan.name}</h3>
                </div>
                <p className="text-[11px] text-gray-400 font-sans tracking-tight min-h-[32px]">
                  {plan.tagline}
                </p>
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-white/5 pt-4 space-y-1 font-mono">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl md:text-3xl font-black text-white">${displayPrice}</span>
                  <span className="text-[10px] text-gray-500">/ month</span>
                </div>
                <div className="text-[9px] text-gray-400">
                  {savingsText}
                </div>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed font-sans min-h-[48px]">
                {plan.description}
              </p>

              {/* Action trigger button */}
              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={loadingPlan !== null}
                className={`w-full py-2.5 rounded-xl font-sans text-xs font-bold transition duration-200 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${
                  isCurrent
                    ? "bg-[#0c4a6e]/40 text-[#00b2ff] border border-[#0ea5e9]/20 pointer-events-none cursor-default"
                    : plan.isPopular
                    ? "bg-[#ff7a00] hover:bg-orange-600 text-black shadow-lg shadow-orange-500/10"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                {loadingPlan === plan.name ? (
                  <span className="animate-pulse">Configuring Plan...</span>
                ) : isCurrent ? (
                  "Active Current Plan"
                ) : (
                  plan.ctaText
                )}
              </button>

              {/* Feature Bullet points */}
              <div className="flex-1 space-y-3.5 border-t border-white/5 pt-4 font-sans text-xs">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-mono">
                  Features Included
                </span>
                
                <ul className="space-y-2.5">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-gray-300 leading-normal">
                      <Check className="w-3.5 h-3.5 text-success-active mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  
                  {plan.notIncluded?.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-gray-600 leading-normal line-through decoration-gray-800">
                      <span className="text-gray-800 mt-1 font-bold select-none text-[8px] flex-shrink-0">✕</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Credit Pool Refills Section (Requirement check: "members can add profile imge and see there credits") */}
      <div className="max-w-4xl mx-auto bg-[#0d0f14] rounded-2xl border border-white/5 p-5 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#1c241d] border border-[#2e5d36]/20 rounded-xl text-success-active">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans font-extrabold text-sm text-white">DEVELOPER CREDIT REFILL POOL</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Refill your transaction pool for API invocations and model logic runtimes on the workbench.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-xl border border-white/5 font-mono">
            <span className="text-[10px] text-gray-500 font-bold">CREDITS BALANCE:</span>
            <span className="text-sm font-black text-success-active">${userCredits.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { amount: 5, bonus: 0, label: "Starter Refill", popular: false },
            { amount: 20, bonus: 3, label: "Standard Pack", popular: true },
            { amount: 50, bonus: 10, label: "Power Bundle", popular: false },
          ].map((pack) => (
            <div
              key={pack.amount}
              className={`p-4 rounded-xl bg-black/20 border flex flex-col justify-between gap-4 hover:bg-black/35 transition duration-200 ${
                pack.popular ? "border-[#ff7a00]/30" : "border-white/5"
              }`}
            >
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-gray-500 uppercase font-bold">{pack.label}</span>
                  {pack.bonus > 0 && (
                    <span className="text-[8px] bg-success-inactive text-success-active font-mono font-bold px-1.5 py-0.5 rounded">
                      +${pack.bonus} Free Bonus
                    </span>
                  )}
                </div>
                <h4 className="text-xl font-mono font-black text-white">${pack.amount}</h4>
                <p className="text-[10px] text-gray-400 leading-normal">
                  Adds ${pack.amount + pack.bonus} total credits to your snippets.live account balance.
                </p>
              </div>

              <button
                onClick={() => handleBuyCredits(pack.amount + pack.bonus)}
                className={`w-full py-1.5 rounded-lg font-mono font-bold text-[10px] tracking-wider uppercase transition cursor-pointer active:scale-95 ${
                  pack.popular
                    ? "bg-[#ff7a00] hover:bg-orange-600 text-black"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/5"
                }`}
              >
                Buy ${pack.amount} Refill
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-4xl mx-auto space-y-4">
        <h3 className="text-center font-display font-extrabold text-sm text-white tracking-widest uppercase">
          FREQUENTLY ASKED QUESTIONS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-1">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-brand-active" />
              <span>What are transaction credits?</span>
            </h4>
            <p className="text-[10px] text-gray-400 leading-normal">
              Credits are used to run advanced AI checks, request AST compiler auto-repair options, or load Gemini 3 Pro routing models. Free tier users get a daily allowance that resets at midnight.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-1">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-brand-active" />
              <span>What is the 65% royalty split?</span>
            </h4>
            <p className="text-[10px] text-gray-400 leading-normal">
              When you publish custom blueprints or AST logic nodes onto our shared database, external developers can pay micro-costs to download or include them in their containers. Pro accounts keep 65% of all transaction volume!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
