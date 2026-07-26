import { useState } from "react";
import { Terminal, ShieldAlert, Cpu, Play, Pause, RefreshCw, Layers, ShieldCheck, ChevronRight } from "lucide-react";
import { Packet } from "../types";

interface PacketMonitorProps {
  packets: Packet[];
  onExplainPayload?: (payload: string, protocol: string) => void;
}

export default function PacketMonitor({ packets, onExplainPayload }: PacketMonitorProps) {
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [protocolFilter, setProtocolFilter] = useState<string>("ALL");
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPackets = packets.filter(p => {
    const protoMatches = protocolFilter === "ALL" || p.protocol === protocolFilter;
    const searchMatches = searchQuery === "" || 
      p.srcIp.includes(searchQuery) || 
      p.dstIp.includes(searchQuery) || 
      p.payload.toLowerCase().includes(searchQuery.toLowerCase());
    return protoMatches && searchMatches;
  });

  const getProtocolBadgeColor = (proto: Packet["protocol"]) => {
    switch (proto) {
      case "TCP": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "UDP": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "DNS": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "HTTP": return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      case "SSH": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const stringToHex = (str: string) => {
    let hex = "";
    for (let i = 0; i < Math.min(str.length, 64); i++) {
      hex += str.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0") + " ";
      if ((i + 1) % 8 === 0) hex += " ";
    }
    return hex.trim() || "00 4F 12 A9 8C F2 BC D0 02 AA";
  };

  const getAnomalyGlow = (score: number) => {
    if (score > 0.8) return "border-red-500/30 bg-red-950/10 text-red-200";
    if (score > 0.5) return "border-amber-500/30 bg-amber-950/10 text-amber-200";
    return "border-white/5 hover:bg-white/5";
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
      {/* Packets Scrolling Log (Left Col) */}
      <div className={`${selectedPacket ? "xl:col-span-8" : "xl:col-span-12"} transition-all duration-300 flex flex-col gap-4`}>
        <div className="glass-card rounded-3xl p-6 border-white/5 shadow-2xl flex flex-col gap-4">
          
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Terminal className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">Real-Time Packet Inspector</h3>
                <p className="text-xs text-slate-400">Inspecting decrypted ingress/egress network flows at interface eth0.</p>
              </div>
            </div>

            {/* Filter Pill Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {["ALL", "TCP", "UDP", "DNS", "HTTP", "SSH"].map(proto => (
                <button
                  key={proto}
                  onClick={() => setProtocolFilter(proto)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition ${
                    protocolFilter === proto
                      ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-md shadow-cyan-500/15"
                      : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {proto}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar & Pause/Resume */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="Search by IP address, payload query or flag pattern..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold font-sans transition ${
                  isPaused 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                {isPaused ? "RESUME" : "PAUSE"}
              </button>
            </div>
          </div>

          {/* Scrolling packet tables (Viewport) */}
          <div className="w-full overflow-x-auto max-h-[420px] overflow-y-auto rounded-2xl border border-white/5 bg-slate-950/30">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/5 bg-slate-950/50 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">TIMESTAMP</th>
                  <th className="py-3.5 px-4">PROTOCOL</th>
                  <th className="py-3.5 px-4">SOURCE IP</th>
                  <th className="py-3.5 px-4">PORT</th>
                  <th className="py-3.5 px-4">DESTINATION IP</th>
                  <th className="py-3.5 px-4">PORT</th>
                  <th className="py-3.5 px-4 text-center">ANOMALY SCORE</th>
                  <th className="py-3.5 px-4 text-right">LENGTH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-mono text-slate-300">
                {filteredPackets.map(pkt => (
                  <tr
                    key={pkt.id}
                    onClick={() => setSelectedPacket(pkt)}
                    className={`cursor-pointer transition border-l-2 border-l-transparent ${
                      selectedPacket?.id === pkt.id ? "bg-white/5 border-l-cyan-400" : ""
                    } ${getAnomalyGlow(pkt.anomalyScore)}`}
                  >
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(pkt.timestamp).toLocaleTimeString([], { hour12: false })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getProtocolBadgeColor(pkt.protocol)}`}>
                        {pkt.protocol}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{pkt.srcIp}</td>
                    <td className="py-3 px-4 text-slate-400">{pkt.srcPort}</td>
                    <td className="py-3 px-4 text-slate-200">{pkt.dstIp}</td>
                    <td className="py-3 px-4 text-slate-400">{pkt.dstPort}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              pkt.anomalyScore > 0.8 ? "bg-red-500" : pkt.anomalyScore > 0.5 ? "bg-amber-500" : "bg-cyan-500"
                            }`}
                            style={{ width: `${pkt.anomalyScore * 100}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${
                          pkt.anomalyScore > 0.8 ? "text-red-400" : pkt.anomalyScore > 0.5 ? "text-amber-400" : "text-cyan-400"
                        }`}>
                          {pkt.anomalyScore.toFixed(3)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-semibold">{pkt.length} B</td>
                  </tr>
                ))}

                {filteredPackets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                      No active packet headers matching the filters found in this buffer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Packet Inspection Panel (Right Col) */}
      {selectedPacket && (
        <div className="xl:col-span-4 glass-card rounded-3xl p-6 border-cyan-500/20 shadow-2xl flex flex-col gap-4 animate-fadeIn relative">
          <div className="absolute top-0 right-0 p-4">
            <button 
              onClick={() => setSelectedPacket(null)}
              className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              [ESC CLOSE]
            </button>
          </div>

          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mt-2">
            {selectedPacket.anomalyScore > 0.65 ? (
              <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            )}
            <div>
              <h3 className="font-display font-bold text-white text-md">Telemetry Deep Dive</h3>
              <p className="text-[10px] font-mono text-slate-400">ID: {selectedPacket.id}</p>
            </div>
          </div>

          {/* Core metadata table */}
          <div className="flex flex-col gap-2.5 bg-slate-950/40 p-4 rounded-xl border border-white/5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-mono">FLOW INDEX:</span>
              <span className="text-white font-semibold font-mono">1542A-BF4</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-mono">SOURCE IP:</span>
              <span className="text-cyan-400 font-bold font-mono">{selectedPacket.srcIp}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-mono">DESTINATION IP:</span>
              <span className="text-purple-400 font-bold font-mono">{selectedPacket.dstIp}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-mono">FLAGS SET:</span>
              <span className="text-slate-300 font-bold font-mono">[{selectedPacket.flags.join(", ") || "NONE"}]</span>
            </div>
          </div>

          {/* Hex Payload Dump */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">HEXADECIMAL HEADER DUMP</label>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5 font-mono text-[9px] text-cyan-400/90 leading-relaxed max-h-24 overflow-y-auto">
              {stringToHex(selectedPacket.payload)}
            </div>
          </div>

          {/* ASCII / UTF-8 payload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">UTF-8 PAYLOAD CONTENTS</label>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300 leading-relaxed max-h-32 overflow-y-auto break-all">
              {selectedPacket.payload || "« EMPTY OR NON-STRING HEURISTIC BUFFER »"}
            </div>
          </div>

          {/* Security Rule matching alert */}
          {selectedPacket.signatureMatched && (
            <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl flex flex-col gap-1">
              <span className="text-[9px] font-mono text-red-400 font-bold">CRITICAL SIGNATURE DETECTED</span>
              <span className="text-xs text-white leading-snug">{selectedPacket.signatureMatched}</span>
              <span className="text-[9px] font-mono text-slate-400">Rule ID: {selectedPacket.ruleId}</span>
            </div>
          )}

          {/* AI explaining button */}
          {onExplainPayload && (
            <button
              onClick={() => onExplainPayload(selectedPacket.payload, selectedPacket.protocol)}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-purple-500/15"
            >
              <Cpu className="w-3.5 h-3.5" />
              AI Cognitive Analysis
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
