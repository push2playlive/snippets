import React, { useState } from "react";
import { 
  Shield, Key, Mail, Lock, User, Sparkles, X, ArrowRight, Eye, EyeOff, AlertTriangle, Check 
} from "lucide-react";

interface LoginPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { email: string; name: string; role: "admin" | "member" }) => void;
  onShowNotification: (message: string, type: "success" | "info" | "warning") => void;
}

export default function LoginPortal({
  isOpen,
  onClose,
  onLoginSuccess,
  onShowNotification
}: LoginPortalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    
    // Admin credentials validation
    if (trimmedEmail === "nexusos@commandnexus.net") {
      if (password === "admin1234567") {
        const adminUser = {
          email: trimmedEmail,
          name: "System Director",
          role: "admin" as const
        };
        onLoginSuccess(adminUser);
        onShowNotification("Welcome Administrator! Full platform keys activated.", "success");
        onClose();
      } else {
        setError("Invalid security clearance key for admin.");
        onShowNotification("Incorrect administrative credentials.", "warning");
      }
      return;
    }

    // Member login validation
    if (!email.includes("@")) {
      setError("Please provide a valid developer email handle.");
      return;
    }

    if (password.length < 4) {
      setError("Developer passphrase must contain at least 4 characters.");
      return;
    }

    // Success for standard members
    const memberName = name.trim() || email.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");
    const memberUser = {
      email: trimmedEmail,
      name: memberName.charAt(0).toUpperCase() + memberName.slice(1),
      role: "member" as const
    };
    
    onLoginSuccess(memberUser);
    onShowNotification(`Signed in as member: ${memberUser.name}!`, "success");
    onClose();
  };

  // Preset quick triggers for review convenience
  const handleQuickFillAdmin = () => {
    setEmail("nexusos@commandnexus.net");
    setPassword("admin1234567");
    setIsRegistering(false);
    setError(null);
  };

  const handleQuickFillMember = () => {
    setEmail("developer@snippets.live");
    setPassword("member2026");
    setName("Senior AST Dev");
    setIsRegistering(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[999] animate-fade-in font-sans select-text">
      
      {/* Container Card */}
      <div className="relative w-full max-w-md bg-[#090b0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/5 p-6 md:p-8 space-y-6">
        
        {/* Absolute Background Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-36 h-36 bg-[#ff7a00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-36 h-36 bg-[#00b2ff]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[#ff7a00]">
                <Shield className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest">
                Developer Registry Gate
              </span>
            </div>
            <h3 className="text-xl font-display font-black text-white tracking-tight">
              {isRegistering ? "Register New Account" : "Access Authorization"}
            </h3>
            <p className="text-xs text-gray-400 leading-normal">
              Authorize connection to secure sandbox and compiler APIs.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Error Dialog */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 relative z-10 animate-shake">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="font-mono">{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10 text-left">
          {isRegistering && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 block flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#00b2ff]" />
                <span>Developer Handle / Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. AST Wizard"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-mono rounded-xl bg-black/40 border border-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff7a00] transition"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 block flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-orange-400" />
              <span>Registry Email</span>
            </label>
            <input
              type="email"
              placeholder="developer@snippets.live"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-mono rounded-xl bg-black/40 border border-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff7a00] transition"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-400 block flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Passphrase</span>
              </label>
              {email.toLowerCase().trim() === "nexusos@commandnexus.net" && (
                <span className="text-[8px] bg-red-500/15 border border-red-500/20 text-red-400 font-mono font-bold px-1 py-0.5 rounded uppercase">
                  Admin Required
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 text-xs font-mono rounded-xl bg-black/40 border border-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff7a00] transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#ff7a00] hover:bg-orange-600 text-black font-semibold text-xs transition duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10"
            >
              <span>{isRegistering ? "Activate Registry Profile" : "Authenticate Registry Connection"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Credentials Helpers Section */}
        <div className="space-y-2 border-t border-white/5 pt-4 text-left relative z-10">
          <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block">
            Quick Simulation Presets
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleQuickFillAdmin}
              className="flex-1 py-2 px-2.5 rounded-lg border border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-red-400 text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Key className="w-3 h-3" />
              <span>Fill Admin</span>
            </button>
            <button
              onClick={handleQuickFillMember}
              className="flex-1 py-2 px-2.5 rounded-lg border border-purple-500/20 bg-purple-950/10 hover:bg-purple-950/20 text-[#c084fc] text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <User className="w-3 h-3" />
              <span>Fill Member</span>
            </button>
          </div>
          <p className="text-[9px] text-gray-500 leading-normal font-mono text-center">
            Admin Creds: <code className="text-red-400 font-bold">nexusos@commandnexus.net</code> • Pass: <code className="text-red-400 font-bold">admin1234567</code>
          </p>
        </div>

        {/* Footer Toggle Register/Login */}
        <div className="flex justify-center text-[11px] relative z-10 pt-1">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="text-gray-400 hover:text-white transition font-semibold"
          >
            {isRegistering 
              ? "Already registered? Authenticate existing handle" 
              : "Register new sandbox developer identity"}
          </button>
        </div>

      </div>
    </div>
  );
}
