import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Activity, 
  Terminal, 
  ShieldAlert, 
  FolderGit2, 
  Cpu, 
  ListChecks, 
  Globe, 
  Settings, 
  FileText, 
  LogOut, 
  ArrowUpRight, 
  TrendingUp, 
  AlertTriangle,
  User,
  Zap,
  CheckCircle,
  Volume2,
  VolumeX,
  Bell,
  RefreshCw
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

// Shared Types import
import { Packet, Rule, Alert, Incident, MLModelStats, SecurityMetrics } from "./types";

// Modular Sub-components import
import NetworkSummaryDashboard from "./components/NetworkSummaryDashboard";
import PacketMonitor from "./components/PacketMonitor";
import AlertsPanel from "./components/AlertsPanel";
import IncidentManager from "./components/IncidentManager";
import MLDashboard from "./components/MLDashboard";
import RulesEditor from "./components/RulesEditor";
import ThreatIntel from "./components/ThreatIntel";

export default function App() {
  // Authentication & View States
  const [activeUser, setActiveUser] = useState<string | null>("admin@aegis.one");
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "PACKETS" | "ALERTS" | "INCIDENTS" | "ML" | "RULES" | "INTEL" | "REPORTS" | "SETTINGS">("DASHBOARD");

  // Telemetry Lists States
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [mlStats, setMlStats] = useState<MLModelStats | null>(null);
  const [operatingMode, setOperatingMode] = useState<"LIVE" | "DEMO">("LIVE");

  // App Utilities States
  const [alertSound, setAlertSound] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [aiReportGenerating, setAiReportGenerating] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // Poll server state every 2 seconds for high-fidelity updates
  useEffect(() => {
    if (!activeUser) return;

    const fetchCoreState = async () => {
      try {
        const [metricsRes, packetsRes, alertsRes, incidentsRes, rulesRes, mlRes] = await Promise.all([
          fetch("/api/metrics"),
          fetch("/api/packets"),
          fetch("/api/alerts"),
          fetch("/api/incidents"),
          fetch("/api/rules"),
          fetch("/api/ml")
        ]);

        if (metricsRes.ok) {
          const mData = await metricsRes.json();
          setMetrics(mData);
          if (mData.operatingMode) {
            setOperatingMode(mData.operatingMode);
          }
        }
        if (packetsRes.ok) setPackets(await packetsRes.json());
        if (alertsRes.ok) {
          const freshAlerts = await alertsRes.json();
          // Sound trigger check on newly added high severity alerts
          if (alertSound && freshAlerts.length > alerts.length) {
            const hasNewCritical = freshAlerts.slice(0, freshAlerts.length - alerts.length).some((a: Alert) => a.severity === "CRITICAL" || a.severity === "HIGH");
            if (hasNewCritical) {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = "sine";
              osc.frequency.setValueAtTime(680, audioCtx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.4);
              gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.4);

              // Inject in-app banner
              setNotifications(prev => [`[ALERT] Critical Ingress Intrusion Sig Detected! ${new Date().toLocaleTimeString()}`, ...prev.slice(0, 4)]);
            }
          }
          setAlerts(freshAlerts);
        }
        if (incidentsRes.ok) setIncidents(await incidentsRes.json());
        if (rulesRes.ok) setRules(await rulesRes.json());
        if (mlRes.ok) {
          const mlData = await mlRes.json();
          setMlStats(mlData.stats);
        }
      } catch (err) {
        console.error("SentinelX background synchronization cycle failed:", err);
      }
    };

    fetchCoreState();
    const interval = setInterval(fetchCoreState, 2000);
    return () => clearInterval(interval);
  }, [activeUser, alerts.length, alertSound]);

  const handleToggleOperatingMode = async () => {
    const targetMode = operatingMode === "LIVE" ? "DEMO" : "LIVE";
    try {
      const res = await fetch("/api/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: targetMode })
      });
      if (res.ok) {
        const data = await res.json();
        setOperatingMode(data.mode);
        setNotifications(prev => [`[SYSTEM MODE] Transferred console telemetry state to ${data.mode} MONITORING.`, ...prev.slice(0, 4)]);
        
        const [packetsRes, alertsRes, incidentsRes, metricsRes] = await Promise.all([
          fetch("/api/packets"),
          fetch("/api/alerts"),
          fetch("/api/incidents"),
          fetch("/api/metrics")
        ]);
        if (packetsRes.ok) setPackets(await packetsRes.json());
        if (alertsRes.ok) setAlerts(await alertsRes.json());
        if (incidentsRes.ok) setIncidents(await incidentsRes.json());
        if (metricsRes.ok) setMetrics(await metricsRes.json());
      }
    } catch (e) {
      console.error("Failed to transition global operating mode:", e);
    }
  };

  // Auth bypass handler
  const handleLoginSuccess = (email: string) => {
    setActiveUser(email);
  };

  // Interactive controllers triggering backend endpoints
  const handleUpdateAlertStatus = async (alertId: string, newStatus: Alert["status"]) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setAlerts(curr => curr.map(a => a.id === alertId ? { ...a, status: newStatus } : a));
      }
    } catch (e) {
      console.error("Failed to update Alert status state:", e);
    }
  };

  const handleUpdateIncident = async (incId: string, updates: Partial<Incident>) => {
    try {
      const res = await fetch(`/api/incidents/${incId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setIncidents(curr => curr.map(i => i.id === incId ? { ...i, ...updates } : i));
      }
    } catch (e) {
      console.error("Failed to transition Incident case parameters:", e);
    }
  };

  const handleAddIncidentNote = async (incId: string, noteText: string) => {
    try {
      const res = await fetch(`/api/incidents/${incId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: activeUser || "Analyst Central", text: noteText })
      });
      if (res.ok) {
        const freshDetailsRes = await fetch(`/api/incidents/${incId}`);
        if (freshDetailsRes.ok) {
          const detail = await freshDetailsRes.json();
          // Trigger immediate incidents list updates
          setIncidents(curr => curr.map(i => i.id === incId ? detail.incident : i));
        }
      }
    } catch (e) {
      console.error("Failed to append forensic note to ticket:", e);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/rules/${ruleId}/toggle`, { method: "PUT" });
      if (res.ok) {
        setRules(curr => curr.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
      }
    } catch (e) {
      console.error("Failed to toggle signature rule status:", e);
    }
  };

  const handleCreateRule = async (newRule: Omit<Rule, "id" | "enabled">) => {
    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule)
      });
      if (res.ok) {
        const data = await res.json();
        setRules(curr => [data.rule, ...curr]);
      }
    } catch (e) {
      console.error("Failed to deploy custom signature rule:", e);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/rules/${ruleId}`, { method: "DELETE" });
      if (res.ok) {
        setRules(curr => curr.filter(r => r.id !== ruleId));
      }
    } catch (e) {
      console.error("Failed to delete signature rule from cluster:", e);
    }
  };

  const handleUpdateMlThreshold = async (val: number) => {
    try {
      const res = await fetch("/api/ml/threshold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold: val })
      });
      if (res.ok) {
        setMetrics(curr => curr ? { ...curr, mlModelThreshold: val } : null);
      }
    } catch (e) {
      console.error("Failed to update Isolation Forest threshold:", e);
    }
  };

  const handleTrainModel = async (hyperparameters?: MLModelStats["hyperparameters"]) => {
    try {
      const res = await fetch("/api/ml/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hyperparameters })
      });
      if (res.ok) {
        const data = await res.json();
        setMlStats(data.stats);
      }
    } catch (e) {
      console.error("Model optimization script request failed:", e);
    }
  };

  // Automated PDF and CSV Security Report Compilation
  const handleCompileSecReport = (format: "CSV" | "JSON" | "TXT") => {
    let outputText = `================================================================================
SENTINELX AI OPERATIONS REPORT - INCIDENT COMPILATION DECK
Generated on: ${new Date().toLocaleString()} | Security Admin: ${activeUser}
================================================================================\n\n`;

    if (format === "CSV") {
      outputText += "INCIDENT_ID,TITLE,SEVERITY,STATUS,ALERTS_COUNT,THREAT_ACTOR_IP,CREATED_TIME\n";
      incidents.forEach(i => {
        outputText += `"${i.id}","${i.title.replace(/"/g, '""')}","${i.severity}","${i.status}",${i.alertsCount},"${i.threatActor}","${new Date(i.createdTime).toISOString()}"\n`;
      });
    } else {
      outputText += JSON.stringify({ metrics, rules, incidentsCount: incidents.length, activeAlerts: alerts.slice(0, 50) }, null, 2);
    }

    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sentinelx_threat_report_${Date.now()}.${format.toLowerCase()}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // AI explanations of a single package payload via Gemini API (for PacketMonitor.tsx integration)
  const handleExplainPayload = async (payloadText: string, protocol: string) => {
    setAiReportGenerating(true);
    setAiAnalysisResult(null);

    try {
      // Create a post requests mapping payload analysis using the server-side Gemini gateway
      const res = await fetch("/api/incidents/pkt-temp/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "pkt-temp",
          title: `Packet payload trace analysis for protocol ${protocol}`,
          severity: "HIGH",
          threatActor: "Ingest-Flow-Trace",
          alertIds: []
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysisResult(data.analysis);
      }
    } catch (e) {
      setAiAnalysisResult("Handshake boundary error occurred. Ensure server config has GEMINI_API_KEY correctly declared.");
    } finally {
      setAiReportGenerating(false);
    }
  };

  // Render Gate
  if (!activeUser) {
    setTimeout(() => setActiveUser("admin@aegis.one"), 0);
    return null;
  }

  // Pre-formatted Recharts data mappings
  const protocolData = metrics ? Object.entries(metrics.protocolDistribution).map(([name, value]) => ({ name, value })) : [];
  const severityData = metrics ? [
    { name: "CRITICAL", count: metrics.severityDistribution.critical, fill: "#ef4444" },
    { name: "HIGH", count: metrics.severityDistribution.high, fill: "#f97316" },
    { name: "MEDIUM", count: metrics.severityDistribution.medium, fill: "#eab308" },
    { name: "LOW", count: metrics.severityDistribution.low, fill: "#3b82f6" }
  ] : [];

  const PIE_COLORS = ["#3b82f6", "#a855f7", "#06b6d4", "#ec4899", "#f59e0b", "#64748b"];

  return (
    <div className="relative min-h-screen bg-cyber-bg bg-cyber-grid text-slate-100 font-sans flex flex-col justify-between">
      {/* Visual neon ambient background spheres */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-emerald-500/10 to-transparent blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-teal-500/10 to-transparent blur-[160px] pointer-events-none" />

      {/* Primary HUD Navigation bar */}
      <nav className="relative z-20 w-full border-b border-white/5 bg-slate-950/45 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("DASHBOARD")}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-600 p-[1px] flex items-center justify-center">
                <div className="w-full h-full rounded-[10px] bg-cyber-bg flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-emerald-400" />
                </div>
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Aegis<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400"> One</span>
              </span>
            </div>

            {/* Menu Links */}
            <div className="hidden lg:flex items-center gap-1">
              {[
                { tab: "DASHBOARD", label: "Operations HUD", icon: Activity },
                { tab: "PACKETS", label: "Packet Feed", icon: Terminal },
                { tab: "ALERTS", label: "Threat Alerts", icon: ShieldAlert },
                { tab: "INCIDENTS", label: "Security Cases", icon: FolderGit2 },
                { tab: "ML", label: "Heuristic ML", icon: Cpu },
                { tab: "RULES", label: "Signature Rules", icon: ListChecks },
                { tab: "INTEL", label: "Threat Intel", icon: Globe }
              ].map(item => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold font-sans transition flex items-center gap-2 border cursor-pointer ${
                      activeTab === item.tab
                        ? "bg-white/10 border-white/10 text-white"
                        : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User profile actions & mute toggle */}
          <div className="flex items-center gap-3">
            {/* Operating Mode Selector Toggle */}
            <button
              onClick={handleToggleOperatingMode}
              className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                operatingMode === "LIVE"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
              title="Click to toggle between Live Monitoring and Security Demonstration Mode"
            >
              <span className={`w-2 h-2 rounded-full ${
                operatingMode === "LIVE" ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"
              }`} />
              {operatingMode === "LIVE" ? "LIVE MONITORING" : "DEMO SIMULATION"}
            </button>

            <button
              onClick={() => setAlertSound(!alertSound)}
              className="p-2.5 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-950/60 text-slate-400 hover:text-white transition cursor-pointer"
              title={alertSound ? "Mute Sonic Alert" : "Unmute Sonic Alert"}
            >
              {alertSound ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-slate-950/40 border border-white/5 px-3.5 py-1.5 rounded-xl text-xs font-mono">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300 max-w-[150px] truncate">{activeUser}</span>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="p-2.5 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-950/60 text-slate-400 hover:text-white transition cursor-pointer"
              title="Reload Management Console"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* SubHUD Notification banner ticker */}
      {notifications.length > 0 && (
        <div className="relative z-10 w-full bg-red-950/30 border-b border-red-500/10 py-2.5 px-6 animate-fadeIn">
          <div className="max-w-7xl mx-auto flex items-center gap-2.5 text-xs text-red-300 font-mono">
            <Bell className="w-4 h-4 animate-bounce text-red-400 shrink-0" />
            <span className="truncate">{notifications[0]}</span>
          </div>
        </div>
      )}

      {/* Main Console view stage */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 py-8 flex-grow">
        {activeTab === "DASHBOARD" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            
            {/* Top widgets layout rows */}
            {metrics ? (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* 1. Packet rate */}
                <div className="glass-card p-5 rounded-2xl border-white/5 text-left flex flex-col justify-between gap-1 relative overflow-hidden">
                  <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" /> INSPECTION VELOCITY
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="font-display text-2xl font-bold text-white font-mono">{metrics.pps}</span>
                    <span className="text-[10px] text-slate-400 font-mono">pps</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                    <Zap className="w-3 h-3 text-emerald-400" /> INGRESS CORES: SATURATED
                  </div>
                </div>

                {/* 2. Bandwidth */}
                <div className="glass-card p-5 rounded-2xl border-white/5 text-left flex flex-col justify-between gap-1 relative overflow-hidden">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">INTERCEPT METRIC</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="font-display text-2xl font-bold text-white font-mono">{metrics.bandwidthMbps.toFixed(3)}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Mbps</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">PACKET BUFFER: STABLE</span>
                </div>

                {/* 3. Threat level */}
                <div className="glass-card p-5 rounded-2xl border-white/5 text-left flex flex-col justify-between gap-1 relative overflow-hidden">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">RISK ASSESSMENT</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      metrics.riskLevel === "CRITICAL" || metrics.riskLevel === "HIGH" ? "bg-red-500 status-pulse-cyan" : "bg-cyan-400"
                    }`} />
                    <span className="font-display text-xl font-bold text-white font-mono">{metrics.riskLevel}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">FIREWALL FILTERS DEPLOYED</span>
                </div>

                {/* 4. Threatened score */}
                <div className="glass-card p-5 rounded-2xl border-white/5 text-left flex flex-col justify-between gap-1 relative overflow-hidden">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">THREAT SCORE HUD</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className={`font-display text-2xl font-bold font-mono ${
                      metrics.threatScore > 50 ? "text-red-400" : "text-cyan-400"
                    }`}>{metrics.threatScore}</span>
                    <span className="text-[10px] text-slate-500">/ 100</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">CONFIDENCE: HEURISTIC PLUS</span>
                </div>

                {/* 5. Total counts */}
                <div className="glass-card p-5 rounded-2xl border-white/5 text-left flex flex-col justify-between gap-1 relative overflow-hidden col-span-2 lg:col-span-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">ACTIVE CASE INDICES</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="font-display text-2xl font-bold text-white font-mono">{metrics.activeAlertsCount}</span>
                    <span className="text-[10px] text-slate-500">OPEN</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">TOTAL LOGS: {metrics.totalPacketsInspected}</span>
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(idx => (
                  <div key={idx} className="glass-card p-6 rounded-2xl h-24 border-white/5 animate-pulse" />
                ))}
              </div>
            )}

            {/* Middle Section: Active Network Summary Dashboard */}
            <div className="grid grid-cols-1 gap-6">
              <NetworkSummaryDashboard />
            </div>

            {/* Bottom charts & attacker feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Protocol distribution pie chart (4 cols) */}
              <div className="lg:col-span-4 glass-card rounded-3xl p-6 border-white/5 flex flex-col justify-between gap-4 text-left">
                <div>
                  <h4 className="font-display font-bold text-white text-md">Protocol Distribution</h4>
                  <p className="text-[10px] font-mono text-slate-400">Inspected packets classified by network transport headers.</p>
                </div>

                <div className="w-full h-48 flex items-center justify-center relative">
                  {protocolData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={protocolData}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {protocolData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-xs text-slate-500 font-mono">Compiling distributions...</div>
                  )}
                </div>

                {/* Legends */}
                <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-[10px] font-mono text-slate-400">
                  {protocolData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span>{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Severity distribution bar chart (4 cols) */}
              <div className="lg:col-span-4 glass-card rounded-3xl p-6 border-white/5 flex flex-col justify-between gap-4 text-left">
                <div>
                  <h4 className="font-display font-bold text-white text-md">Threat Severity distribution</h4>
                  <p className="text-[10px] font-mono text-slate-400">Total matched signature alerts classified by security risk profiles.</p>
                </div>

                <div className="w-full h-48 bg-slate-950/25 rounded-2xl p-4 border border-white/5">
                  {severityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={severityData}>
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={9} fontStyle="italic" />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-xs text-slate-500 font-mono">Resolving counters...</div>
                  )}
                </div>

                <span className="text-[9px] font-mono text-slate-500 text-center">CORRELATED ENGINE MATCHES</span>
              </div>

              {/* Top threat IP vectors list (4 cols) */}
              <div className="lg:col-span-4 glass-card rounded-3xl p-6 border-white/5 flex flex-col gap-4 text-left">
                <div>
                  <h4 className="font-display font-bold text-white text-md">Flagged IP Reputation Profiles</h4>
                  <p className="text-[10px] font-mono text-slate-400">Origin IP addresses triggering multiple signature alarms.</p>
                </div>

                <div className="flex flex-col gap-3 max-h-56 overflow-y-auto">
                  {metrics?.topAttackers.map(attacker => (
                    <div key={attacker.ip} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-white font-mono">{attacker.ip}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{attacker.country}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] font-mono font-bold text-red-400">
                        {attacker.count} ALERTS
                      </span>
                    </div>
                  ))}

                  {(!metrics || metrics.topAttackers.length === 0) && (
                    <div className="py-12 text-center text-slate-500 text-xs font-mono">
                      No external malicious IPs blacklisted in this sequence.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Modular Panels renders based on Active Tab */}
        {activeTab === "PACKETS" && (
          <PacketMonitor packets={packets} onExplainPayload={handleExplainPayload} />
        )}

        {activeTab === "ALERTS" && (
          <AlertsPanel alerts={alerts} onUpdateAlertStatus={handleUpdateAlertStatus} />
        )}

        {activeTab === "INCIDENTS" && (
          <IncidentManager 
            incidents={incidents} 
            onUpdateIncident={handleUpdateIncident}
            onAddIncidentNote={handleAddIncidentNote}
          />
        )}

        {activeTab === "ML" && mlStats && (
          <MLDashboard 
            mlStats={mlStats} 
            threshold={metrics ? metrics.mlModelThreshold : 0.75}
            onUpdateThreshold={handleUpdateMlThreshold}
            onTrainModel={handleTrainModel}
          />
        )}

        {activeTab === "RULES" && (
          <RulesEditor 
            rules={rules} 
            onToggleRule={handleToggleRule}
            onCreateRule={handleCreateRule}
            onDeleteRule={handleDeleteRule}
          />
        )}

        {activeTab === "INTEL" && (
          <ThreatIntel />
        )}

        {activeTab === "REPORTS" && (
          <div className="glass-card rounded-3xl p-8 border-white/5 max-w-2xl mx-auto flex flex-col gap-6 text-left animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">Security Analytics Reporting</h3>
                <p className="text-xs text-slate-400">Export audited case indices and raw threat signatures for FIPS and SOC compliance.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleCompileSecReport("CSV")}
                className="p-5 bg-slate-950/40 hover:bg-slate-950/80 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition cursor-pointer"
              >
                <span className="text-xs font-mono font-bold text-cyan-400">CSV FILE SHEET</span>
                <span className="text-[10px] text-slate-400 text-center">Best for Microsoft Excel / analytics importing.</span>
              </button>

              <button
                onClick={() => handleCompileSecReport("JSON")}
                className="p-5 bg-slate-950/40 hover:bg-slate-950/80 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition cursor-pointer"
              >
                <span className="text-xs font-mono font-bold text-purple-400">JSON DATALOG</span>
                <span className="text-[10px] text-slate-400 text-center">Best for SIEM / Splunk / Elastic importing logs.</span>
              </button>

              <button
                onClick={() => handleCompileSecReport("TXT")}
                className="p-5 bg-slate-950/40 hover:bg-slate-950/80 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition cursor-pointer"
              >
                <span className="text-xs font-mono font-bold text-emerald-400">TXT EXECUTIVE</span>
                <span className="text-[10px] text-slate-400 text-center">Human-readable forensic case summary.</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "SETTINGS" && (
          <div className="glass-card rounded-3xl p-8 border-white/5 max-w-xl mx-auto flex flex-col gap-6 text-left animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 rounded-xl bg-slate-500/10 border border-slate-500/20">
                <Settings className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">SOC Settings Panel</h3>
                <p className="text-xs text-slate-400">Configure administrative parameters and global integrations.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Notification integrations */}
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 flex flex-col gap-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">In-App Sound Indicators</span>
                <div className="flex items-center justify-between text-xs">
                  <span>Enable alarms for critical intrusions:</span>
                  <button
                    onClick={() => setAlertSound(!alertSound)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition ${
                      alertSound 
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" 
                        : "bg-white/5 border-white/5 text-slate-500"
                    }`}
                  >
                    {alertSound ? "ACTIVE SOUND" : "SOUND DISABLED"}
                  </button>
                </div>
              </div>

              {/* Webhook alerts */}
              <div className="p-4 bg-slate-950/40 rounded-xl border border-white/5 flex flex-col gap-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Third-party SOC Integrations</span>
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-slate-400 text-[10px]">Slack / Discord Webhook URL:</span>
                  <input
                    type="text"
                    disabled
                   const webhook = import.meta.env.VITE_SLACK_WEBHOOK_URL;
                    className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-slate-500 mt-1 cursor-not-allowed select-none"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-1">Automatic alert forwarding. Configure secrets in Env configs.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Explanation Dialog Overlay */}
      {aiReportGenerating || aiAnalysisResult ? (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="glass-card rounded-3xl p-6 border-purple-500/30 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative flex flex-col gap-4">
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={() => {
                  setAiReportGenerating(false);
                  setAiAnalysisResult(null);
                }}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                [CLOSE PANEL]
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mt-2">
              <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
              <h3 className="font-display font-bold text-white text-md">Gemini Forensic Engine</h3>
            </div>

            {aiReportGenerating && (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs font-mono">
                <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
                <span>Decompressing payload headers... Querying AI security parameters...</span>
              </div>
            )}

            {aiAnalysisResult && (
              <div className="text-slate-300 text-xs font-sans leading-relaxed text-left whitespace-pre-wrap bg-slate-950/40 p-4 rounded-xl border border-white/5 max-h-[50vh] overflow-y-auto">
                {aiAnalysisResult}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Interactive Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 mt-12">
        <span>SentinelX AI Platform &copy; 2026. Secure Corporate Subnets Protected.</span>
        <div className="flex gap-4">
          <a href="#compliance" className="hover:text-slate-400">SOC-II Certified</a>
          <a href="#architecture" className="hover:text-slate-400 text-cyan-400">FIPS Active</a>
        </div>
      </footer>
    </div>
  );
}
