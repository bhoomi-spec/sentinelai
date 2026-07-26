import { useState } from "react";
import { AlertCircle, Eye, ShieldAlert, ShieldX, MapPin, ExternalLink, Filter } from "lucide-react";
import { Alert } from "../types";

interface AlertsPanelProps {
  alerts: Alert[];
  onUpdateAlertStatus: (id: string, newStatus: Alert["status"]) => void;
}

export default function AlertsPanel({ alerts, onUpdateAlertStatus }: AlertsPanelProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [statusFilter, setStatusFilter] = useState<Alert["status"] | "ALL">("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  const filteredAlerts = alerts.filter(a => {
    const statusMatches = statusFilter === "ALL" || a.status === statusFilter;
    const severityMatches = severityFilter === "ALL" || a.severity === severityFilter;
    return statusMatches && severityMatches;
  });

  const getSeverityStyle = (sev: Alert["severity"]) => {
    switch (sev) {
      case "CRITICAL": return "bg-red-500/15 border-red-500/30 text-red-400";
      case "HIGH": return "bg-orange-500/15 border-orange-500/30 text-orange-400";
      case "MEDIUM": return "bg-yellow-500/15 border-yellow-500/30 text-yellow-400";
      case "LOW": return "bg-blue-500/15 border-blue-500/30 text-blue-400";
    }
  };

  const getStatusColor = (status: Alert["status"]) => {
    switch (status) {
      case "OPEN": return "text-red-400 border-red-500/30 bg-red-500/5";
      case "INVESTIGATING": return "text-amber-400 border-amber-500/30 bg-amber-500/5";
      case "REMEDIATED": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
      case "SUPPRESSED": return "text-slate-400 border-slate-500/30 bg-slate-500/5";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
      {/* Alert Lists Deck (8 cols) */}
      <div className={`${selectedAlert ? "xl:col-span-8" : "xl:col-span-12"} transition-all duration-300 flex flex-col gap-4`}>
        <div className="glass-card rounded-3xl p-6 border-white/5 shadow-2xl flex flex-col gap-5">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">Ingested Threat Alerts</h3>
                <p className="text-xs text-slate-400">Continuous network ingestion triggering signature and anomaly alarms.</p>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-950/40 p-1.5 rounded-xl border border-white/5">
                {["ALL", "OPEN", "INVESTIGATING", "REMEDIATED"].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st as any)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                      statusFilter === st
                        ? "bg-white/10 text-white border border-white/10"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
              >
                <option value="ALL">ALL SEVERITIES</option>
                <option value="CRITICAL">CRITICAL ONLY</option>
                <option value="HIGH">HIGH ONLY</option>
                <option value="MEDIUM">MEDIUM ONLY</option>
                <option value="LOW">LOW ONLY</option>
              </select>
            </div>
          </div>

          {/* Cards list layout - no ordinary tables! */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 cursor-pointer transition relative overflow-hidden ${
                  selectedAlert?.id === alert.id
                    ? "border-cyan-500 bg-cyan-950/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "border-white/5 bg-slate-950/20 hover:border-white/10 hover:bg-slate-950/40"
                }`}
              >
                {/* Glow bar for visual density */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                  alert.severity === "CRITICAL" ? "bg-red-500" : alert.severity === "HIGH" ? "bg-orange-500" : "bg-cyan-500"
                }`} />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    <h4 className="font-display font-bold text-white text-sm line-clamp-1 leading-snug">
                      {alert.message}
                    </h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-bold shrink-0 ${getSeverityStyle(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono border-t border-white/5 pt-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500">SOURCE ORIGIN</span>
                    <span className="text-cyan-400 font-bold">{alert.srcIp}:{alert.srcPort}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-right">
                    <span className="text-slate-500">CATEGORY</span>
                    <span className="text-slate-300 font-semibold">{alert.category}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                  <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {alert.geoIp ? `${alert.geoIp.city}, ${alert.geoIp.countryCode}` : "Corporate LAN"}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-mono font-bold ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}

            {filteredAlerts.length === 0 && (
              <div className="col-span-2 py-12 text-center text-slate-500 font-mono text-xs">
                No threat alerts recorded in this buffer segment matching search constraints.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Sidebar Details (4 cols) */}
      {selectedAlert && (
        <div className="xl:col-span-4 glass-card rounded-3xl p-6 border-cyan-500/20 shadow-2xl flex flex-col gap-5 animate-fadeIn relative">
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={() => setSelectedAlert(null)}
              className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              [CLOSE]
            </button>
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <span className="text-[10px] font-mono text-cyan-400">ALERT VECTOR HANDLER</span>
            <h3 className="font-display font-bold text-white text-lg leading-snug">{selectedAlert.message}</h3>
          </div>

          {/* Action State Adjuster */}
          <div className="flex flex-col gap-2 p-4 bg-slate-950/40 rounded-xl border border-white/5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Mitigation Workflow Stage</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => onUpdateAlertStatus(selectedAlert.id, "INVESTIGATING")}
                className={`py-2 rounded-lg border text-[10px] font-mono font-bold transition ${
                  selectedAlert.status === "INVESTIGATING"
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                INVESTIGATING
              </button>
              <button
                onClick={() => onUpdateAlertStatus(selectedAlert.id, "REMEDIATED")}
                className={`py-2 rounded-lg border text-[10px] font-mono font-bold transition ${
                  selectedAlert.status === "REMEDIATED"
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                REMEDIATE
              </button>
            </div>
          </div>

          {/* Geographic Threat Intel Segment */}
          {selectedAlert.geoIp && (
            <div className="flex flex-col gap-3 bg-slate-950/50 p-4 rounded-xl border border-white/5 text-xs">
              <span className="text-[10px] font-mono text-slate-500">GEOLOCATION REPUTATION</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-display text-lg font-bold text-white">
                  {selectedAlert.geoIp.countryCode}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-white font-semibold">{selectedAlert.geoIp.city}, {selectedAlert.geoIp.country}</span>
                  <span className="text-[10px] font-mono text-slate-400 leading-none">{selectedAlert.geoIp.asn}</span>
                </div>
              </div>
              <div className="border-t border-white/5 pt-2.5 flex justify-between text-[10px] font-mono text-slate-400">
                <span>COORDINATES:</span>
                <span>LAT: {selectedAlert.geoIp.lat.toFixed(4)} / LON: {selectedAlert.geoIp.lon.toFixed(4)}</span>
              </div>
            </div>
          )}

          {/* Core Telemetry parameters */}
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500">PACKET INTERFACE:</span>
              <span className="text-white">eth0.ingress</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500">PROTOCOL:</span>
              <span className="text-white font-bold">{selectedAlert.protocol}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500">MITRE ATT&CK CODE:</span>
              <span className="text-red-400 font-bold flex items-center gap-1">
                {selectedAlert.mitreAttackId || "T1091"}
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">ANOMALY WEIGHT:</span>
              <span className="text-amber-400 font-bold">{(selectedAlert.anomalyScore * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
