import React, { useState } from "react";
import { ListChecks, ShieldCheck, ShieldAlert, Plus, Trash2, Power, Terminal, Settings } from "lucide-react";
import { Rule } from "../types";

interface RulesEditorProps {
  rules: Rule[];
  onToggleRule: (id: string) => void;
  onCreateRule: (newRule: Omit<Rule, "id" | "enabled">) => void;
  onDeleteRule: (id: string) => void;
}

export default function RulesEditor({ rules, onToggleRule, onCreateRule, onDeleteRule }: RulesEditorProps) {
  const [showForm, setShowForm] = useState(false);
  
  // Rule form states
  const [name, setName] = useState("");
  const [protocol, setProtocol] = useState("TCP");
  const [srcIp, setSrcIp] = useState("any");
  const [srcPort, setSrcPort] = useState("any");
  const [dstIp, setDstIp] = useState("any");
  const [dstPort, setDstPort] = useState("any");
  const [pattern, setPattern] = useState("");
  const [severity, setSeverity] = useState<Rule["severity"]>("MEDIUM");
  const [category, setCategory] = useState("Malicious Pattern Probe");
  const [mitreAttackId, setMitreAttackId] = useState("T1059");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pattern) return;

    onCreateRule({
      name,
      protocol,
      srcIp,
      srcPort,
      dstIp,
      dstPort,
      pattern,
      severity,
      category,
      mitreAttackId
    });

    // Reset Form
    setName("");
    setPattern("");
    setMitreAttackId("T1059");
    setShowForm(false);
  };

  const getSeverityStyle = (sev: Rule["severity"]) => {
    switch (sev) {
      case "CRITICAL": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "HIGH": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "MEDIUM": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "LOW": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
      {/* Existing Rules Scroller Deck (8 cols) */}
      <div className={`${showForm ? "xl:col-span-7" : "xl:col-span-12"} transition-all duration-300 flex flex-col gap-4`}>
        <div className="glass-card rounded-3xl p-6 border-white/5 shadow-2xl flex flex-col gap-5">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <ListChecks className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">IPS Signature Rulebook</h3>
                <p className="text-xs text-slate-400">Manage pattern matching rules processed against real-time payload binaries.</p>
              </div>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/15 shrink-0"
            >
              <Plus className="w-4 h-4" />
              COMPILE SIGNATURE
            </button>
          </div>

          {/* Cards collection of active rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
            {rules.map(rule => (
              <div
                key={rule.id}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 relative transition ${
                  rule.enabled
                    ? "border-white/5 bg-slate-950/20"
                    : "border-white/5 bg-slate-950/5 opacity-60"
                }`}
              >
                {/* Rule title / classification */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-mono text-slate-500">ID: {rule.id} | MITRE: {rule.mitreAttackId || "T1059"}</span>
                    <h4 className="font-display font-bold text-white text-xs leading-normal line-clamp-1">{rule.name}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[8px] font-bold shrink-0 ${getSeverityStyle(rule.severity)}`}>
                    {rule.severity}
                  </span>
                </div>

                {/* Mathematical rule logic parameters */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 font-mono text-[9.5px] leading-relaxed text-cyan-400">
                  <span className="text-slate-500">alert</span> {rule.protocol.toLowerCase()} {rule.srcIp} {rule.srcPort} <span className="text-slate-500">&rarr;</span> {rule.dstIp} {rule.dstPort}{" "}
                  <span className="text-slate-400">(msg: &quot;{rule.category}&quot;; pattern: &quot;<strong className="text-white break-all">{rule.pattern}</strong>&quot;;)</span>
                </div>

                {/* Core triggers list status and controls */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    CATEGORY: <strong className="text-slate-200 font-bold">{rule.category}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleRule(rule.id)}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        rule.enabled
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-white/5 border-white/5 text-slate-500"
                      }`}
                      title={rule.enabled ? "Disable Rule Trigger" : "Enable Rule Trigger"}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="p-2 rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-red-400 hover:border-red-500/20 transition cursor-pointer"
                      title="Delete Signature Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Signature Rule Composer form (4 cols) */}
      {showForm && (
        <div className="xl:col-span-5 glass-card rounded-3xl p-6 border-cyan-500/20 shadow-2xl flex flex-col gap-4 animate-fadeIn text-left relative">
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              [CLOSE]
            </button>
          </div>

          <div className="flex items-center gap-2 border-b border-white/5 pb-3 mt-2">
            <Settings className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
            <h3 className="font-display font-bold text-white text-md">Compile Custom Signature</h3>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400">SIGNATURE ALERT NAME</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cobalt Strike Beacon activity probe"
                className="bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400">PROTOCOL</label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="DNS">DNS</option>
                  <option value="HTTP">HTTP</option>
                  <option value="SSH">SSH</option>
                  <option value="any">any</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400">SEVERITY RANKING</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400">SOURCE IP</label>
                <input
                  type="text"
                  required
                  value={srcIp}
                  onChange={(e) => setSrcIp(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400">DESTINATION PORT</label>
                <input
                  type="text"
                  required
                  value={dstPort}
                  onChange={(e) => setDstPort(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400">PAYLOAD REGEX PATTERN MATCH</label>
              <input
                type="text"
                required
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="(?i)(CobaltStrike|MaliciousPayloadHex)"
                className="bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono text-cyan-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400">MITRE ATT&CK ID</label>
                <input
                  type="text"
                  required
                  value={mitreAttackId}
                  onChange={(e) => setMitreAttackId(e.target.value)}
                  placeholder="T1059"
                  className="bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400">ALERT CATEGORY</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Power className="w-3.5 h-3.5" />
              COMPILE SIGNATURE INTO IPS
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
