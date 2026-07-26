import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Search, RefreshCw, Globe, Server, Info, Shield } from "lucide-react";

interface MockReport {
  ip: string;
  reputationScore: number; // 0 to 100
  virusTotalRatio: string; // e.g. "42 / 72"
  shodanOpenPorts: number[];
  geoIp: {
    country: string;
    city: string;
    isp: string;
    lat: number;
    lon: number;
  };
  threatTags: string[];
}

export default function ThreatIntel() {
  const [query, setQuery] = useState("185.220.101.5");
  const [isLoading, setIsLoading] = useState(false);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [report, setReport] = useState<MockReport | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setReport(null);
    setProgressLog([]);

    const steps = [
      "Quering AbuseIPDB repository for active reporting reports...",
      "Submitting payload fingerprint to VirusTotal global malware databases...",
      "Scraping Shodan engine for listening protocols and active service versions...",
      "Harvesting FIPS geographic coordinates and regional telecom networks...",
      "Telemetry aggregation complete. Synthesizing threat actor profile report."
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setProgressLog((prev) => [...prev, `[STATUS] ${step}`]);
        if (idx === steps.length - 1) {
          generateThreatReport();
        }
      }, (idx + 1) * 750);
    });
  };

  const generateThreatReport = () => {
    setIsLoading(false);
    
    // Check if query is one of our default malicious IPs for custom telemetry matching
    const testIp = query.trim();
    if (testIp === "185.220.101.5") {
      setReport({
        ip: "185.220.101.5",
        reputationScore: 94,
        virusTotalRatio: "56 / 72",
        shodanOpenPorts: [80, 443, 9001],
        geoIp: { country: "Germany", city: "Frankfurt", isp: "Tor Exit Node Cluster Lease", lat: 50.1109, lon: 8.6821 },
        threatTags: ["TorExit", "SSH-BruteForce", "Anonymizer", "ActiveProbing"]
      });
    } else if (testIp === "198.51.100.42") {
      setReport({
        ip: "198.51.100.42",
        reputationScore: 82,
        virusTotalRatio: "41 / 70",
        shodanOpenPorts: [22, 80, 8080],
        geoIp: { country: "China", city: "Beijing", isp: "Chinanet Backbone System", lat: 39.9042, lon: 116.4074 },
        threatTags: ["BotnetHerd", "SQL-Injection", "CommandAndControl"]
      });
    } else {
      // General dynamic fallback report
      const repScore = Math.floor(Math.random() * 95) + 5;
      const isDangerous = repScore > 40;
      setReport({
        ip: testIp,
        reputationScore: repScore,
        virusTotalRatio: isDangerous ? `${Math.floor(repScore * 0.7)} / 72` : "0 / 72",
        shodanOpenPorts: isDangerous ? [22, 80, 443, 8080] : [80, 443],
        geoIp: {
          country: isDangerous ? "Russian Federation" : "United States",
          city: isDangerous ? "Saint Petersburg" : "Seattle",
          isp: isDangerous ? "Rostelecom Core ISP" : "Amazon Corporate Data Services",
          lat: isDangerous ? 59.9343 : 47.6062,
          lon: isDangerous ? 30.3351 : -122.3321
        },
        threatTags: isDangerous ? ["SuspiciousScan", "HeuristicAnomaly", "AbuseReported"] : ["White-Listed", "CloudProvider"]
      });
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
      {/* Query Bar Left Col (5 cols) */}
      <div className="xl:col-span-5 flex flex-col gap-4">
        <div className="glass-card rounded-3xl p-6 border-white/5 shadow-2xl flex flex-col gap-5 text-left">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-tight">Threat Intelligence Ingestion</h3>
              <p className="text-xs text-slate-400">Query Indicators of Compromise (IOC) on active cyber intelligence nodes.</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">INDICATOR OF COMPROMISE (IP, DNS, HASH)</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. 185.220.101.5 or malware-sha256"
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "HARVESTING..." : "INITIATE THREAT REPORT QUERY"}
            </button>
          </form>

          {/* Automated query progress step logging */}
          {progressLog.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
              <label className="text-[9px] font-mono text-slate-500">INGRESS QUERIES RESOLVING</label>
              <div className="bg-black/80 p-3 rounded-xl border border-white/5 font-mono text-[9px] text-cyan-400/90 leading-relaxed max-h-36 overflow-y-auto flex flex-col gap-1.5">
                {progressLog.map((log, idx) => (
                  <span key={idx} className="line-clamp-1">{log}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Intelligence Report Display Right Col (7 cols) */}
      <div className="xl:col-span-7 flex flex-col gap-4">
        {report ? (
          <div className="glass-card rounded-3xl p-6 border-cyan-500/10 shadow-2xl flex flex-col gap-6 text-left animate-fadeIn">
            
            {/* Header Reputation bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono text-cyan-400">THREAT REPUTATION ANALYSIS</span>
                <h3 className="font-display text-xl font-bold text-white tracking-tight leading-none font-mono">IOC: {report.ip}</h3>
              </div>

              {/* Severe metric status */}
              <div className={`px-4 py-2.5 rounded-2xl border text-center flex items-center gap-2 ${
                report.reputationScore > 75 
                  ? "bg-red-500/15 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                  : report.reputationScore > 30 
                    ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
                    : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              }`}>
                {report.reputationScore > 50 ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-mono leading-none">RISK ASSESSMENT</span>
                  <span className="text-sm font-bold font-mono">{report.reputationScore}% MALICIOUS</span>
                </div>
              </div>
            </div>

            {/* Core telemetry details metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* AbuseIPDB + VirusTotal */}
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Shield className="w-4.5 h-4.5 text-cyan-400" />
                  <span className="font-display font-semibold text-xs text-white">Security Vendor Scanning</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono">VIRUSTOTAL FLAGS:</span>
                  <span className={`font-bold font-mono ${report.reputationScore > 50 ? "text-red-400" : "text-emerald-400"}`}>
                    {report.virusTotalRatio}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono">SHODAN OPEN PORTS:</span>
                  <span className="text-white font-bold font-mono">[{report.shodanOpenPorts.join(", ")}]</span>
                </div>
              </div>

              {/* Geographic IP coordinates */}
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Server className="w-4.5 h-4.5 text-purple-400" />
                  <span className="font-display font-semibold text-xs text-white">Physical Location Coordinates</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono">REGION:</span>
                  <span className="text-slate-200 font-bold">{report.geoIp.city}, {report.geoIp.country}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono">ISP BACKBONE:</span>
                  <span className="text-slate-300 font-semibold line-clamp-1 max-w-[120px] text-right">{report.geoIp.isp}</span>
                </div>
              </div>
            </div>

            {/* Ingress classification tags */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">IOC SEGMENT TAGS</label>
              <div className="flex items-center gap-2 flex-wrap">
                {report.threatTags.map(tag => (
                  <span 
                    key={tag}
                    className={`px-3 py-1 rounded-lg border text-[10px] font-mono font-bold ${
                      report.reputationScore > 50 
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Advisory advisory notes */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-400 flex items-start gap-2.5 leading-relaxed">
              <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                {report.reputationScore > 50 
                  ? "Advisory: This IOC is actively blacklisted on global security trackers. Consider initiating immediate quarantine routines and block range ingress."
                  : "Advisory: This endpoint is cataloged within corporate CDN and cloud networks. No immediate action required unless heuristic flow parameters exhibit anomalies."
                }
              </span>
            </div>

          </div>
        ) : (
          <div className="glass-card rounded-3xl p-12 border-white/5 shadow-2xl flex flex-col items-center justify-center text-center gap-4 h-full min-h-[420px]">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 text-slate-400">
              <Globe className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-md">IOC Reputation Profile</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Trigger global intelligence checkups against IP routers, file payloads, and threat domain names to profile threat postures.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
