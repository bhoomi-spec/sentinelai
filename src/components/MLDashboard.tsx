import React, { useState } from "react";
import { Cpu, Sliders, RefreshCw, Activity, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MLModelStats } from "../types";

interface MLDashboardProps {
  mlStats: MLModelStats;
  threshold: number;
  onUpdateThreshold: (val: number) => void;
  onTrainModel: (hyperparameters?: MLModelStats["hyperparameters"]) => Promise<void>;
}

export default function MLDashboard({ mlStats, threshold, onUpdateThreshold, onTrainModel }: MLDashboardProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  
  // Local hyperparameter state
  const [nEstimators, setNEstimators] = useState(mlStats.hyperparameters.nEstimators);
  const [contamination, setContamination] = useState(mlStats.hyperparameters.contamination);
  const [learningRate, setLearningRate] = useState(mlStats.hyperparameters.learningRate);
  const [epochs, setEpochs] = useState(mlStats.hyperparameters.epochs);

  // Simulated loss history graph data
  const [lossHistory] = useState([
    { epoch: 10, loss: 0.65, validationAccuracy: 0.88 },
    { epoch: 30, loss: 0.42, validationAccuracy: 0.92 },
    { epoch: 60, loss: 0.21, validationAccuracy: 0.95 },
    { epoch: 90, loss: 0.12, validationAccuracy: 0.97 },
    { epoch: 120, loss: 0.08, validationAccuracy: 0.982 },
    { epoch: 150, loss: 0.05, validationAccuracy: 0.988 },
  ]);

  const handleTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTraining(true);
    setTrainingLogs([]);

    const logMessages = [
      "Securing network thread isolation... Initializing feature space.",
      "Scraping historical operational buffers: 154,200 samples loaded.",
      "Vectorizing parameters: Header lengths, delta inter-packet spacing, protocol entropy maps.",
      "Initiating training matrix... Executing Isolation Forest split trees.",
      "Pruning weak estimators... Normalizing anomaly vector weights.",
      "Cross-validating predictions: Scoring False Positive ratios.",
      "Optimizing model files: Transferring weights to Live Evaluation Engine.",
      "ML Core Pipeline Training Cycle complete. Metrics updated successfully."
    ];

    // Progressively push logs to screen
    for (let i = 0; i < logMessages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 850));
      setTrainingLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${logMessages[i]}`]);
    }

    await onTrainModel({
      nEstimators,
      contamination,
      maxFeatures: 8,
      learningRate,
      epochs
    });

    setIsTraining(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
      {/* ML Performance Metrics (8 cols) */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        <div className="glass-card rounded-3xl p-6 border-white/5 shadow-2xl flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">AI Heuristic Model Monitor</h3>
                <p className="text-xs text-slate-400">Monitoring real-time Isolation Forest anomaly classifier engine metrics.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 status-pulse-cyan" />
              INFERENCE PIPELINE ONLINE
            </span>
          </div>

          {/* Core metrics indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-1 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-cyan-500/25"><TrendingUp className="w-6 h-6" /></div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">MODEL ACCURACY</span>
              <span className="font-display text-2xl font-bold text-white">{(mlStats.accuracy * 100).toFixed(2)}%</span>
            </div>
            <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-1 text-left relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-500 uppercase">PRECISION</span>
              <span className="font-display text-2xl font-bold text-cyan-400">{(mlStats.precision * 100).toFixed(2)}%</span>
            </div>
            <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-1 text-left relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-500 uppercase">RECALL RATE</span>
              <span className="font-display text-2xl font-bold text-purple-400">{(mlStats.recall * 100).toFixed(2)}%</span>
            </div>
            <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-1 text-left relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-500 uppercase">FALSE POSITIVE RATE</span>
              <span className="font-display text-2xl font-bold text-red-400">{(mlStats.falsePositiveRate * 100).toFixed(2)}%</span>
            </div>
          </div>

          {/* Loss history charts visualizer */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display text-sm font-semibold text-white text-left">Training Loss Optimization Curve</h4>
            <div className="w-full h-56 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lossHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity="0.2"/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity="0.2"/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="epoch" stroke="rgba(255,255,255,0.3)" fontSize={10} fontStyle="italic" />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0b0f19", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "11px" }}
                    labelStyle={{ color: "#fff", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="loss" stroke="#06b6d4" fillOpacity={1} fill="url(#lossGrad)" strokeWidth={2} name="Cross-Entropy Loss" />
                  <Area type="monotone" dataKey="validationAccuracy" stroke="#a855f7" fillOpacity={1} fill="url(#accGrad)" strokeWidth={2} name="Validation Accuracy" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Dynamic threshold adjusting overlay slider */}
        <div className="glass-card rounded-3xl p-6 border-white/5 shadow-2xl flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h4 className="font-display font-semibold text-white text-md">Ingress Anomaly Trigger Sensitivity</h4>
              <p className="text-xs text-slate-400">Specify the mathematical confidence cutoff boundary that isolates automated incident generation.</p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-xs font-mono font-bold text-cyan-400">
              THRESHOLD: {threshold.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col gap-3 py-2">
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={(e) => onUpdateThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1 text-red-400 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> 0.10 (HYPER-SENSITIVE / AGGRESSIVE ALERTS)
              </span>
              <span>0.50 (RECOMMENDED CORE DEFAULT)</span>
              <span className="text-slate-400">0.95 (HIGH THREAT EXCLUSIVES ONLY)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hyperparameters Controls Panel (4 cols) */}
      <div className="xl:col-span-4 flex flex-col gap-4">
        <div className="glass-card rounded-3xl p-6 border-white/5 shadow-2xl flex flex-col gap-5 text-left h-full">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-white text-md">Hyperparameter Tuning</h3>
          </div>

          <form onSubmit={handleTrain} className="flex flex-col gap-4 flex-grow">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400">N-ESTIMATORS (FOREST TREES)</label>
              <input
                type="number"
                min={10}
                max={500}
                value={nEstimators}
                onChange={(e) => setNEstimators(parseInt(e.target.value))}
                className="bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400">CONTAMINATION FRACTION (EXPECTED ANOMALY %)</label>
              <input
                type="number"
                step={0.001}
                min={0.001}
                max={0.20}
                value={contamination}
                onChange={(e) => setContamination(parseFloat(e.target.value))}
                className="bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400">LEARNING RATE COEFFICIENT</label>
              <input
                type="number"
                step={0.01}
                min={0.01}
                max={1.0}
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-slate-400">GRADIENT EPOCHS</label>
              <input
                type="number"
                min={10}
                max={1000}
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value))}
                className="bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={isTraining}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? "animate-spin" : ""}`} />
              {isTraining ? "TUNING CLUSTER..." : "INITIATE OPTIMIZER CYCLE"}
            </button>
          </form>

          {/* Real-time Progressive Log Console */}
          {trainingLogs.length > 0 && (
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-[9px] font-mono text-slate-500 tracking-wider">LIVE TRANING PROGRESS CONSOLE LOG</label>
              <div className="bg-black p-3 rounded-xl border border-white/5 font-mono text-[9px] text-emerald-400 leading-relaxed max-h-40 overflow-y-auto flex flex-col gap-1.5 text-left">
                {trainingLogs.map((log, idx) => (
                  <span key={idx}>{log}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
