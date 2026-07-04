import React, { useState, useRef } from "react";
import { 
  User, Check, Upload, Award, Coins, Settings, Star, Mail, Github, 
  MapPin, ShieldAlert, Cpu, Sparkles, Image as ImageIcon, Camera
} from "lucide-react";

interface ProfilePageProps {
  userCredits: number;
  modelTier: "free" | "pro";
  onChangeTier: (tier: "free" | "pro") => void;
  onShowNotification: (message: string, type: "success" | "info" | "warning") => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
];

export default function ProfilePage({
  userCredits,
  modelTier,
  onChangeTier,
  onShowNotification,
}: ProfilePageProps) {
  // Saved stats or customizable user profile fields
  const [displayName, setDisplayName] = useState(() => localStorage.getItem("profile_display_name") || "Developer Push2Play");
  const [email, setEmail] = useState(() => localStorage.getItem("profile_email") || "push2playlive@gmail.com");
  const [github, setGithub] = useState(() => localStorage.getItem("profile_github") || "github.com/push2play");
  const [role, setRole] = useState(() => localStorage.getItem("profile_role") || "Senior AST Engineer");
  const [bio, setBio] = useState(() => localStorage.getItem("profile_bio") || "Fascinated by AST compilers, container virtualization, and high-speed stateless playgrounds.");
  const [location, setLocation] = useState(() => localStorage.getItem("profile_location") || "San Francisco, CA");
  
  // Custom uploaded or preset selected image URL
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem("profile_avatar_url") || PRESET_AVATARS[0];
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("profile_display_name", displayName);
    localStorage.setItem("profile_email", email);
    localStorage.setItem("profile_github", github);
    localStorage.setItem("profile_role", role);
    localStorage.setItem("profile_bio", bio);
    localStorage.setItem("profile_location", location);
    localStorage.setItem("profile_avatar_url", profileImage);

    onShowNotification("Profile saved successfully!", "success");
  };

  // Convert uploaded image file to base64 helper
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      onShowNotification("Please upload an image file (PNG/JPG).", "warning");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setProfileImage(e.target.result);
        localStorage.setItem("profile_avatar_url", e.target.result);
        onShowNotification("Profile image updated!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-canvas-bg text-gray-300 p-6 md:p-8 animate-fade-in space-y-8 select-text">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight">
            Developer Registry Profile
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure your compiler handle, review credit audits, and adjust virtual settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {modelTier === "pro" ? (
            <span className="text-[10px] font-mono font-bold text-brand-active uppercase tracking-wider bg-brand-inactive px-2.5 py-1 rounded-lg border border-brand-border/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-active" />
              <span>PRO ACTIVE MEMBER</span>
            </span>
          ) : (
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              FREE TIER GUEST
            </span>
          )}
        </div>
      </div>

      {/* Grid Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-6xl mx-auto">
        
        {/* Left Column: Avatar upload, Presets, Credits overview (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Card 1: Avatar Showcase & Upload (Supports Drag-and-drop & Manual select) */}
          <div className="bg-[#0d0f14] border border-white/5 rounded-2xl p-5 space-y-5 text-center">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono text-left">
              Avatar & Handle Image
            </h3>

            {/* Profile Avatar Frame with Edit Badge */}
            <div className="relative w-28 h-28 mx-auto group">
              <img
                src={profileImage}
                alt="Profile Avatar"
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-2xl object-cover border-2 border-brand-active/40 bg-black/40 shadow-lg group-hover:opacity-85 transition duration-250"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-[#ff7a00] text-black hover:bg-orange-600 transition shadow-lg cursor-pointer"
                title="Upload custom image"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed transition cursor-pointer text-center space-y-1 ${
                isDragging 
                  ? "border-[#ff7a00] bg-[#ff7a00]/10 text-[#ff7a00]" 
                  : "border-white/5 hover:border-white/10 bg-black/20"
              }`}
            >
              <Upload className="w-5 h-5 text-gray-500 mx-auto group-hover:text-white" />
              <div className="text-[10px] text-gray-300 font-sans font-bold">
                Drag image here or click to select
              </div>
              <p className="text-[8px] text-gray-500">
                Supports PNG, JPG (base64 local persistence)
              </p>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Preset Avatars */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block font-mono text-left">
                Or select high-contrast preset
              </label>
              <div className="flex justify-center gap-2.5">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setProfileImage(url);
                      localStorage.setItem("profile_avatar_url", url);
                      onShowNotification("Avatar changed to preset selection.", "success");
                    }}
                    className={`w-9 h-9 rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer ${
                      profileImage === url ? "border-[#ff7a00] scale-110" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Credits Overview & Quick Audit */}
          <div className="bg-[#0d0f14] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                My Credits Wallet
              </h3>
              <Coins className="w-4 h-4 text-success-active" />
            </div>

            <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between font-mono">
              <div>
                <span className="text-[9px] text-gray-500 block font-bold uppercase">AVAILABLE BALANCE</span>
                <span className="text-xl font-black text-success-active">${userCredits.toFixed(2)}</span>
              </div>
              
              <div className="text-right">
                <span className="text-[9px] text-gray-500 block font-bold uppercase">TIER ACCESS</span>
                <span className="text-[10px] font-extrabold text-white uppercase">{modelTier}</span>
              </div>
            </div>

            <div className="space-y-2 text-[10px] font-mono">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">
                Sandbox Resource Allowance
              </span>
              <div className="space-y-1.5 bg-black/20 p-2.5 rounded border border-white/5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Memory Limits</span>
                  <span className="text-gray-300">512 MB Volatile</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sandbox Runs</span>
                  <span className="text-gray-300">Unlimited (Stateless)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">API Access Rate</span>
                  <span className="text-gray-300">30 requests / min</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Profile Form + Stats (8 cols) */}
        <form onSubmit={handleSaveProfile} className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Card 3: Form settings */}
          <div className="bg-[#0d0f14] border border-white/5 rounded-2xl p-5 md:p-6 space-y-6">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono border-b border-white/5 pb-2">
              Identity & Profile Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Display Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 block font-sans">
                  Handle / Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-black/40 border border-white/5 text-white focus:outline-none focus:border-[#ff7a00]"
                  required
                />
              </div>

              {/* Developer Role Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 block font-sans">
                  Developer Role / Specialty
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-black/40 border border-white/5 text-white focus:outline-none focus:border-[#ff7a00]"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 block font-sans">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-black/40 border border-white/5 text-white focus:outline-none focus:border-[#ff7a00]"
                  required
                />
              </div>

              {/* Location Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 block font-sans">
                  Physical Region / Country
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-black/40 border border-white/5 text-white focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              {/* Github profile url */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-400 block font-sans">
                  Github Profile Handle
                </label>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-black/40 border border-white/5 text-white focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              {/* Personal Bio */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-400 block font-sans">
                  Short Developer Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs font-sans rounded-lg bg-black/40 border border-white/5 text-white focus:outline-none focus:border-[#ff7a00] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-brand-active hover:bg-orange-600 text-black font-sans font-bold text-xs transition duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-lg shadow-orange-500/10"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile Credentials</span>
              </button>
            </div>
          </div>

          {/* Developer Metrics (Aesthetic additions) */}
          <div className="bg-[#0d0f14] border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
              Sandbox Activity & Audited Milestones
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
              <div className="p-3.5 bg-black/30 rounded-xl border border-white/5">
                <span className="text-[9px] text-gray-500 block font-bold">TOTAL EXPORTS</span>
                <span className="text-lg font-black text-white mt-1 block">14 ZIPs</span>
              </div>
              <div className="p-3.5 bg-black/30 rounded-xl border border-white/5">
                <span className="text-[9px] text-gray-500 block font-bold">COMPILER CHECKS</span>
                <span className="text-lg font-black text-[#00b2ff] mt-1 block">118 Runs</span>
              </div>
              <div className="p-3.5 bg-black/30 rounded-xl border border-white/5">
                <span className="text-[9px] text-gray-500 block font-bold">AI REPAIR ASSIST</span>
                <span className="text-lg font-black text-brand-active mt-1 block">18 Fixes</span>
              </div>
              <div className="p-3.5 bg-black/30 rounded-xl border border-white/5">
                <span className="text-[9px] text-gray-500 block font-bold">REGISTRY CODES</span>
                <span className="text-lg font-black text-success-active mt-1 block">5 Blueprints</span>
              </div>
            </div>
          </div>

        </form>

      </div>

    </div>
  );
}
