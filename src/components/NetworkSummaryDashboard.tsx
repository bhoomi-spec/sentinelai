import React, { useState, useEffect } from "react";
import { 
  Network, 
  Globe, 
  Fingerprint, 
  Activity, 
  ArrowUp, 
  ArrowDown, 
  Boxes, 
  Share2, 
  Laptop, 
  RefreshCw, 
  Cpu,
  Wifi,
  WifiOff,
  Radio
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis } from "recharts";

export interface NetworkSummaryData {
  activeInterface: string;
  localIp: string;
  gatewayAddress: string;
  macAddress: string;
  connectionStatus: string;
  uploadSpeedMbps: number;
  downloadSpeedMbps: number;
  packetsCaptured: number;
  activeConnections: number;
  protocolDistribution: Record<string, number>;
  connectedDevices: {
    ip: string;
    mac: string;
    device: string;
    type: string;
  }[];
}

const PIE_COLORS = ["#1fa97a", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"];

export default function NetworkSummaryDashboard() {
  const [data, setData] = useState<NetworkSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [speedHistory, setSpeedHistory] = useState<{ time: string; download: number; upload: number }[]>([]);

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/network-summary");
      if (!res.ok) throw new Error("HTTP Handshake Failure");
      const summary: NetworkSummaryData = await res.json();
      setData(summary);
      setError(null);
      
      // Keep a running speed history for the chart (max 15 items)
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSpeedHistory(prev => {
        const next = [...prev, { time: nowStr, download: summary.downloadSpeedMbps, upload: summary.uploadSpeedMbps }];
        if (next.length > 15) return next.slice(1);
        return next;
      });
    } catch (err: any) {
      console.error("Failed to compile network summary diagnostics:", err);
      setError("Unable to map Linux /proc virtual layers or network interface devices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    const timer = setInterval(() => {
      fetchSummary();
      setRefreshCount(c => c + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  if (loading && !data) {
    return (
      <div className="glass-card rounded-3xl p-12 border-white/5 flex flex-col items-center justify-center gap-4 text-center animate-fadeIn min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <Network className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <div>
          <h4 className="font-display text-lg font-bold text-white">Querying Host Network Interfaces</h4>
          <p className="text-xs text-slate-400 max-w-md mt-1 font-mono">Scanning `/proc/net/dev`, `/proc/net/arp`, and socket telemetry bindings in real time...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="glass-card rounded-3xl p-12 border-red-500/10 bg-red-950/10 flex flex-col items-center justify-center gap-4 text-center animate-fadeIn min-h-[350px]">
        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
          <WifiOff className="w-8 h-8" />
        </div>
        <div>
          <h4 className="font-display text-lg font-bold text-red-400">System Telemetry Link Lost</h4>
          <p className="text-xs text-slate-400 max-w-md mt-1">{error}</p>
        </div>
        <button 
          onClick={fetchSummary}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-white/5 text-xs text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reconnect Telemetry
        </button>
      </div>
    );
  }

  const current = data!;
  const protocolChartData = Object.entries(current.protocolDistribution).map(([name, value]) => ({ name, value }));

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      
      {/* Title & Real-time Pulsar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <h3 className="font-display text-lg font-bold text-white tracking-tight">Active Network Summary</h3>
          </div>
          <p className="text-xs text-slate-400">100% real-time interface metadata and traffic logs from host environment.</p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-950/40 border border-white/5 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse-emerald shrink-0" />
          <span className="uppercase">SOCKET DIAGNOSTICS: ACTIVE</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">REFRESH #{refreshCount}</span>
        </div>
      </div>

      {/* Main Grid: Info row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        
        {/* 1. Interface */}
        <div className="glass-card p-5 rounded-2xl border-white/5 text-left flex flex-col justify-between gap-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
            <Network className="w-3 h-3 text-emerald-400" /> ACTIVE INTERFACE
          </span>
          <div className="mt-2.5">
            <span className="font-display text-xl font-bold text-white font-mono">{current.activeInterface}</span>
          </div>
          <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 self-start mt-1.5">
            DEVICE BIND OK
          </span>
        </div>

        {/* 2. Local IP */}
        <div className="glass-card p-5 rounded-2xl border-white/5 text-left flex flex-col justify-between gap-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyan-400" /> LOCAL IP ADDRESS
          </span>
          <div className="mt-2.5">
            <span className="font-display text-xl font-bold text-white font-mono">{current.localIp}</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-1.5">CLASS CIDR SUBNET</span>
        </div>

        {/* 3. Gateway */}
        <div className="glass-card p-5 rounded-2xl border-white/5 text-left flex flex-col justify-between gap-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-400" /> GATEWAY ADDRESS
          </span>
          <div className="mt-2.5">
            <span className="font-display text-xl font-bold text-white font-mono">{current.gatewayAddress}</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-1.5">DEFAULT UPSTREAM HOPS</span>
        </div>

        {/* 4. MAC Address */}
        <div className="glass-card p-5 rounded-2xl border-white/5 text-left flex flex-col justify-between gap-1 col-span-1 md:col-span-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
            <Fingerprint className="w-3 h-3 text-amber-400" /> MAC ADDRESS
          </span>
          <div className="mt-2.5">
            <span className="font-display text-[13px] md:text-sm font-semibold text-white font-mono block truncate" title={current.macAddress}>
              {current.macAddress}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-1.5">HARDWARE SIGNATURE</span>
        </div>

        {/* 5. Connection Status */}
        <div className="glass-card p-5 rounded-2xl border-white/5 text-left flex flex-col justify-between gap-1 col-span-2 md:col-span-4 lg:col-span-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" /> LINK STATE
          </span>
          <div className="flex items-center gap-1.5 mt-2.5">
            {current.connectionStatus === "CONNECTED" ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-display text-lg font-bold text-emerald-400 font-mono">CONNECTED</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="font-display text-lg font-bold text-red-400 font-mono">OFFLINE</span>
              </>
            )}
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-1.5">CARRIER SIGNAL LOCK</span>
        </div>

      </div>

      {/* Speedometer & Bandwidth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Speed display meters (Left side) */}
        <div className="glass-card rounded-3xl p-6 border-white/5 flex flex-col justify-between gap-5 text-left">
          <div>
            <h4 className="font-display font-bold text-white text-sm">Real-time Interface Velocity</h4>
            <p className="text-[10px] font-mono text-slate-400">Actual instantaneous bandwidth processed by physical NIC hardware.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 my-2">
            
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-2 right-2 p-1 bg-emerald-500/10 rounded-lg">
                <ArrowDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase">DOWNLINK SPEED</span>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white font-mono">{current.downloadSpeedMbps.toFixed(2)}</span>
                <span className="text-xs text-slate-400 font-mono ml-1">Mbps</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-2 right-2 p-1 bg-cyan-500/10 rounded-lg">
                <ArrowUp className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase">UPLINK SPEED</span>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white font-mono">{current.uploadSpeedMbps.toFixed(2)}</span>
                <span className="text-xs text-slate-400 font-mono ml-1">Mbps</span>
              </div>
            </div>

          </div>

          <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-emerald-400" />
              <span>Captured: <strong className="text-white font-bold">{current.packetsCaptured}</strong> pkts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sockets: <strong className="text-white font-bold">{current.activeConnections}</strong> open</span>
            </div>
          </div>
        </div>

        {/* Speed history area chart (Middle/Right, takes 2 cols) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border-white/5 flex flex-col justify-between gap-4 text-left">
          <div>
            <h4 className="font-display font-bold text-white text-sm">Bandwidth Saturation Waveform</h4>
            <p className="text-[10px] font-mono text-slate-400">Temporal plotting of real-time ingress and egress telemetry (2-second poll intervals).</p>
          </div>

          <div className="w-full h-44 mt-2">
            {speedHistory.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={speedHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1fa97a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1fa97a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.15)" fontSize={8} dy={5} />
                  <YAxis stroke="rgba(255,255,255,0.15)" fontSize={8} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}
                    labelStyle={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace" }}
                    itemStyle={{ fontSize: "11px", fontFamily: "monospace" }}
                  />
                  <Area type="monotone" dataKey="download" stroke="#1fa97a" strokeWidth={1.5} fillOpacity={1} fill="url(#downloadGrad)" name="Download (Mbps)" />
                  <Area type="monotone" dataKey="upload" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#uploadGrad)" name="Upload (Mbps)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                Saturating bandwidth wave index buffer...
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Connected devices & Protocol distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Connected devices list (8 cols) */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 border-white/5 flex flex-col gap-4 text-left">
          <div>
            <h4 className="font-display font-bold text-white text-sm">Discoverable LAN Devices</h4>
            <p className="text-[10px] font-mono text-slate-400">Local clients resolved through system ARP mapping cache on corporate subnet.</p>
          </div>

          <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
            {current.connectedDevices.map((dev, idx) => (
              <div 
                key={`${dev.ip}-${idx}`} 
                className="flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-slate-950/70 border border-white/5 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white font-mono">{dev.ip}</span>
                    <span className="text-[10px] text-slate-400 font-mono">MAC: {dev.mac}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 font-mono">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-300">
                    {dev.type}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase">IFACE: {dev.device}</span>
                </div>
              </div>
            ))}

            {current.connectedDevices.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                No external LAN clients currently resolved.
              </div>
            )}
          </div>
        </div>

        {/* Dynamic protocol distribution (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 border-white/5 flex flex-col justify-between gap-4 text-left">
          <div>
            <h4 className="font-display font-bold text-white text-sm">Dynamic Protocol Distribution</h4>
            <p className="text-[10px] font-mono text-slate-400">Distribution of protocols computed directly from packet stream logs.</p>
          </div>

          <div className="w-full h-40 flex items-center justify-center relative">
            {protocolChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={protocolChartData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {protocolChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 font-mono">Compiling packet ratios...</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3.5 text-[10px] font-mono text-slate-400">
            {protocolChartData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-slate-300 font-bold">{d.name}:</span>
                <span className="text-white font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
