import React, { useState, useEffect } from "react";
import { FolderGit2, Cpu, UserCheck, RefreshCw, Send, AlertCircle, ShieldAlert, BadgeHelp, CheckCircle, ChevronRight } from "lucide-react";
import { Incident, Alert } from "../types";

interface IncidentManagerProps {
  incidents: Incident[];
  onUpdateIncident: (id: string, updates: Partial<Incident>) => void;
  onAddIncidentNote: (id: string, text: string) => void;
}

export default function IncidentManager({ incidents, onUpdateIncident, onAddIncidentNote }: IncidentManagerProps) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [incidentDetail, setIncidentDetail] = useState<{ incident: Incident; alerts: Alert[] } | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const activeIncident = incidents.find(i => i.id === selectedIncidentId);

  // Fetch fully resolved details when incident selection shifts
  useEffect(() => {
    if (!selectedIncidentId) {
      setIncidentDetail(null);
      return;
    }

    const fetchIncidentDetail = async () => {
      try {
        const res = await fetch(`/api/incidents/${selectedIncidentId}`);
        if (res.ok) {
          const data = await res.json();
          setIncidentDetail(data);
        }
      } catch (err) {
        console.error("Failed to load incident detailed profile:", err);
      }
    };

    fetchIncidentDetail();
  }, [selectedIncidentId, incidents]);

  const handleStatusChange = async (newStatus: Incident["status"]) => {
    if (!selectedIncidentId) return;
    onUpdateIncident(selectedIncidentId, { status: newStatus });
  };

  const handleAssigneeChange = async (analyst: string) => {
    if (!selectedIncidentId) return;
    onUpdateIncident(selectedIncidentId, { assignedAnalyst: analyst });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentId || !newNoteText.trim()) return;
    onAddIncidentNote(selectedIncidentId, newNoteText.trim());
    setNewNoteText("");
  };

  // Run server-side Gemini threat analysis
  const handleTriggerAiAnalysis = async () => {
    if (!selectedIncidentId) return;
    setIsAiLoading(true);
    setAiError("");

    try {
      const res = await fetch(`/api/incidents/${selectedIncidentId}/ai-explain`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        // Force refresh incident details from local store
        const refreshRes = await fetch(`/api/incidents/${selectedIncidentId}`);
        if (refreshRes.ok) {
          const refreshedData = await refreshRes.json();
          setIncidentDetail(refreshedData);
        }
      } else {
        setAiError("Threat analysis failed at cloud router container egress.");
      }
    } catch (e) {
      setAiError("Handshake failure trying to communicate with Security model.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const getSeverityStyle = (sev: Incident["severity"]) => {
    switch (sev) {
      case "CRITICAL": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "HIGH": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "MEDIUM": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "LOW": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  const getStatusBadge = (status: Incident["status"]) => {
    switch (status) {
      case "OPEN": return "text-red-400 bg-red-950/20 border-red-500/30";
      case "INVESTIGATING": return "text-amber-400 bg-amber-950/20 border-amber-500/30";
      case "REMEDIATED": return "text-emerald-400 bg-emerald-950/20 border-emerald-500/30";
      case "CLOSED": return "text-slate-400 bg-slate-950/20 border-slate-500/30";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
      {/* Cases List Dashboard (5 cols) */}
      <div className="xl:col-span-5 flex flex-col gap-4">
        <div className="glass-card rounded-3xl p-6 border-white/5 shadow-2xl flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <FolderGit2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-tight">SOC Case Management</h3>
              <p className="text-xs text-slate-400">Aggregated alerts grouped as actionable security incidents.</p>
            </div>
          </div>

          {/* Incidents Scroller */}
          <div className="flex flex-col gap-3.5 max-h-[500px] overflow-y-auto pr-1">
            {incidents.map(inc => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncidentId(inc.id)}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition flex flex-col gap-3.5 relative ${
                  selectedIncidentId === inc.id
                    ? "border-purple-500 bg-purple-950/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    : "border-white/5 bg-slate-950/20 hover:border-white/10 hover:bg-slate-950/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-mono text-slate-500">ID: {inc.id}</span>
                    <h4 className="font-display font-bold text-white text-sm line-clamp-1">{inc.title}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-bold shrink-0 ${getSeverityStyle(inc.severity)}`}>
                    {inc.severity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-3">
                  <span>ALERTS LINKED: <strong className="text-white">{inc.alertsCount}</strong></span>
                  <span>ASSIGNEE: <strong className="text-slate-200">{inc.assignedAnalyst || "Unassigned"}</strong></span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    UPDATED: {new Date(inc.updatedTime).toLocaleTimeString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold font-mono ${getStatusBadge(inc.status)}`}>
                    {inc.status}
                  </span>
                </div>
              </div>
            ))}

            {incidents.length === 0 && (
              <div className="py-12 text-center text-slate-500 font-mono text-xs">
                No active security incidents triggered in database yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Case Detailed Investigation (7 cols) */}
      <div className="xl:col-span-7 flex flex-col gap-4">
        {incidentDetail ? (
          <div className="glass-card rounded-3xl p-6 border-white/5 shadow-2xl flex flex-col gap-6 animate-fadeIn">
            
            {/* Header case profile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400">
                    {incidentDetail.incident.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold ${getStatusBadge(incidentDetail.incident.status)}`}>
                    {incidentDetail.incident.status}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-white tracking-tight leading-snug">
                  {incidentDetail.incident.title}
                </h3>
              </div>

              {/* Status Adjusters */}
              <div className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">STAGE:</label>
                  <select
                    value={incidentDetail.incident.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-purple-500"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="REMEDIATED">REMEDIATED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">ANALYST:</label>
                  <select
                    value={incidentDetail.incident.assignedAnalyst || "Unassigned"}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Unassigned">Unassigned</option>
                    <option value="Bhoomika Kotresh">Bhoomika Kotresh</option>
                    <option value="Threat Hunter Beta">Threat Hunter Beta</option>
                    <option value="AI Autopilot">AI Autopilot</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Forensic Inferences & Playbook */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/15 to-indigo-950/15 border border-purple-500/20 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between gap-4 border-b border-purple-500/10 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
                  <span className="font-display font-bold text-sm text-purple-200">Gemini 3.5 Threat Forensic Agent</span>
                </div>

                <button
                  onClick={handleTriggerAiAnalysis}
                  disabled={isAiLoading}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-[10px] font-mono tracking-wider transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      COGNITIVE RUNNING...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3.5 h-3.5" />
                      RUN AI FORENSICS
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <p className="text-xs text-red-400 font-mono bg-red-950/20 p-2.5 rounded-lg border border-red-500/10">
                  {aiError}
                </p>
              )}

              {/* Render dynamic Analysis Markdown nicely */}
              <div className="text-slate-300 text-xs font-sans leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto bg-slate-950/30 p-4 rounded-xl border border-white/5">
                {incidentDetail.incident.description || "No analysis generated yet. Click 'Run AI Forensics' to trigger complete intelligence report via Gemini."}
              </div>
            </div>

            {/* Ingress Alerts linked summary */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">AGGREGATED SEC-LOG EVENT INDICATORS</label>
              <div className="flex flex-col gap-2 bg-slate-950/30 p-3.5 rounded-2xl border border-white/5 max-h-36 overflow-y-auto">
                {incidentDetail.alerts.map(a => (
                  <div key={a.id} className="flex items-center justify-between text-xs py-2 border-b border-white/5 last:border-0 font-mono">
                    <span className="text-red-400 font-semibold">{a.message}</span>
                    <span className="text-slate-500 text-[10px]">{a.srcIp} &rarr; {a.dstIp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Notes Log */}
            <div className="flex flex-col gap-3.5 border-t border-white/5 pt-5">
              <h4 className="font-display font-semibold text-sm text-white">Investigative Logs & Command Notes</h4>
              
              <div className="flex flex-col gap-3 max-h-40 overflow-y-auto">
                {incidentDetail.incident.notes?.map(note => (
                  <div key={note.id} className="p-3 bg-slate-950/50 rounded-xl border border-white/5 text-xs flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span className="text-cyan-400 font-bold">{note.author}</span>
                      <span>{new Date(note.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 leading-normal">{note.text}</p>
                  </div>
                ))}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2.5 mt-1">
                <input
                  type="text"
                  required
                  placeholder="Document new indicator, IP block progress or remediation step..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  className="p-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 transition flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        ) : (
          <div className="glass-card rounded-3xl p-12 border-white/5 shadow-2xl flex flex-col items-center justify-center text-center gap-4 h-full min-h-[480px]">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 text-slate-400">
              <FolderGit2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-md">Case Detailed Terminal</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Select an active threat incident from the operations log list to perform deep forensics and trigger AI playbooks.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
