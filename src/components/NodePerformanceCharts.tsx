/**
 * ZeroLabz Real-Time Node Performance Charts (CPU, RAM, PQC Load)
 * Modular SVG area charts with live rolling telemetry for the 3D topology inspector panel.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { TopologyNode } from '../types/security.js';
import { Cpu, HardDrive, ShieldCheck, Zap, Activity, Flame, ArrowUpRight } from 'lucide-react';

export interface PerformanceTelemetryPoint {
  timestamp: string;
  timeLabel: string;
  cpu: number;        // Percentage 0-100
  ram: number;        // Percentage 0-100
  pqcLoad: number;    // Percentage 0-100
  ramGigabytes: number; // e.g. 10.4 GB
  pqcOpsPerSec: number; // e.g. 48,200 ops/s
}

interface NodePerformanceChartsProps {
  node: TopologyNode;
  hasActiveThreats: boolean;
  activeThreatCount: number;
}

// Generate realistic baseline metrics tailored to node architecture
function getBaselineForNode(node: TopologyNode, hasThreats: boolean) {
  let baseCpu = 45;
  let baseRam = 50;
  let basePqc = 60;
  let totalRamGb = 16;
  let baseOps = 32000;

  switch (node.type) {
    case 'core': // Quantum Cryo-Core HSM
      baseCpu = 48;
      baseRam = 68;
      basePqc = 82; // Heavy cryptographic processing
      totalRamGb = 64;
      baseOps = 94000;
      break;
    case 'api-gateway': // Zero-Trust Ingress Edge
      baseCpu = 68;
      baseRam = 62;
      basePqc = 74; // TLS 1.3 encapsulation
      totalRamGb = 32;
      baseOps = 68000;
      break;
    case 'k8s-mesh': // Cilium / Envoy Mesh
      baseCpu = 62;
      baseRam = 74;
      basePqc = 54;
      totalRamGb = 32;
      baseOps = 48000;
      break;
    case 'pqc-vault': // Secrets Vault
      baseCpu = 38;
      baseRam = 78;
      basePqc = 78;
      totalRamGb = 32;
      baseOps = 56000;
      break;
    case 'aws-enclave': // AWS Nitro Enclave
      baseCpu = 42;
      baseRam = 46;
      basePqc = 38;
      totalRamGb = 16;
      baseOps = 28000;
      break;
    case 'edge-sentinel': // Edge PoP
      baseCpu = 52;
      baseRam = 38;
      basePqc = 42;
      totalRamGb = 8;
      baseOps = 22000;
      break;
  }

  // Active threat increases load significantly
  if (hasThreats) {
    baseCpu = Math.min(96, baseCpu + 24);
    basePqc = Math.min(98, basePqc + 26);
    baseRam = Math.min(94, baseRam + 12);
    baseOps = Math.round(baseOps * 1.6);
  }

  return { baseCpu, baseRam, basePqc, totalRamGb, baseOps };
}

// Generate initial buffer of 20 historical points so charts are immediately populated
function generateInitialHistory(node: TopologyNode, hasThreats: boolean): PerformanceTelemetryPoint[] {
  const { baseCpu, baseRam, basePqc, totalRamGb, baseOps } = getBaselineForNode(node, hasThreats);
  const points: PerformanceTelemetryPoint[] = [];
  const now = Date.now();

  for (let i = 19; i >= 0; i--) {
    const t = new Date(now - i * 1500);
    const noiseCpu = (Math.sin(i * 0.7) * 7) + (Math.cos(i * 1.3) * 4);
    const noiseRam = (Math.sin(i * 0.4) * 3) + (Math.cos(i * 0.9) * 2);
    const noisePqc = (Math.cos(i * 0.8) * 8) + (Math.sin(i * 1.5) * 5);

    const cpu = Math.min(99, Math.max(10, Math.round(baseCpu + noiseCpu)));
    const ram = Math.min(98, Math.max(15, Math.round(baseRam + noiseRam)));
    const pqc = Math.min(100, Math.max(10, Math.round(basePqc + noisePqc)));

    points.push({
      timestamp: t.toISOString(),
      timeLabel: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cpu,
      ram,
      pqcLoad: pqc,
      ramGigabytes: parseFloat(((ram / 100) * totalRamGb).toFixed(1)),
      pqcOpsPerSec: Math.round(baseOps * (pqc / 100))
    });
  }

  return points;
}

export const NodePerformanceCharts: React.FC<NodePerformanceChartsProps> = ({
  node,
  hasActiveThreats,
  activeThreatCount
}) => {
  const [history, setHistory] = useState<PerformanceTelemetryPoint[]>(() =>
    generateInitialHistory(node, hasActiveThreats)
  );
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'cpu' | 'ram' | 'pqc'>('all');

  // Re-seed history when node changes
  useEffect(() => {
    setHistory(generateInitialHistory(node, hasActiveThreats));
  }, [node.id, hasActiveThreats]);

  // Real-time telemetry tick every 1500ms
  useEffect(() => {
    const interval = setInterval(() => {
      const { baseCpu, baseRam, basePqc, totalRamGb, baseOps } = getBaselineForNode(node, hasActiveThreats);
      const t = new Date();
      const jitterCpu = (Math.random() * 12 - 6);
      const jitterRam = (Math.random() * 4 - 2);
      const jitterPqc = (Math.random() * 14 - 7);

      const cpu = Math.min(99, Math.max(12, Math.round(baseCpu + jitterCpu)));
      const ram = Math.min(98, Math.max(15, Math.round(baseRam + jitterRam)));
      const pqc = Math.min(100, Math.max(10, Math.round(basePqc + jitterPqc)));

      const newPoint: PerformanceTelemetryPoint = {
        timestamp: t.toISOString(),
        timeLabel: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu,
        ram,
        pqcLoad: pqc,
        ramGigabytes: parseFloat(((ram / 100) * totalRamGb).toFixed(1)),
        pqcOpsPerSec: Math.round(baseOps * (pqc / 100))
      };

      setHistory(prev => {
        const next = [...prev.slice(1), newPoint];
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [node, hasActiveThreats]);

  const latest = history[history.length - 1] || {
    cpu: 50,
    ram: 50,
    pqcLoad: 50,
    ramGigabytes: 8.0,
    pqcOpsPerSec: 40000
  };

  // Helper to build SVG polyline and area paths
  const buildSvgPath = (values: number[], width = 280, height = 48) => {
    if (values.length < 2) return { linePath: '', areaPath: '', latestPoint: { x: 0, y: 0 } };

    const min = 0;
    const max = 100;
    const stepX = width / (values.length - 1);

    const points = values.map((val, idx) => {
      const x = idx * stepX;
      const normalized = Math.min(1, Math.max(0, (val - min) / (max - min)));
      // Leave 4px padding top and bottom
      const y = height - 4 - normalized * (height - 8);
      return { x, y, val };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L ${width},${height} L 0comma0 L 0,${height} Z`.replace('0comma0', '0');

    const last = points[points.length - 1];

    return {
      linePath,
      areaPath: `${linePath} L ${width},${height} L 0,${height} Z`,
      latestPoint: last
    };
  };

  const cpuData = history.map(h => h.cpu);
  const ramData = history.map(h => h.ram);
  const pqcData = history.map(h => h.pqcLoad);

  const getMetricBadgeClass = (val: number) => {
    if (val >= 85) return 'text-rose-400 bg-rose-950/80 border-rose-600/60';
    if (val >= 70) return 'text-amber-400 bg-amber-950/80 border-amber-600/60';
    return 'text-emerald-400 bg-emerald-950/80 border-emerald-600/60';
  };

  return (
    <div className="mt-3 p-3 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3 font-mono">
      {/* Header with Live Ticker Badge & Metric Switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white font-sans">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-Time Node Telemetry</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-semibold">1.5s LIVE</span>
        </div>
      </div>

      {/* Metric Mode Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[10px]">
        <button
          onClick={() => setSelectedMetric('all')}
          className={`flex-1 py-1 rounded transition cursor-pointer font-semibold ${
            selectedMetric === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setSelectedMetric('cpu')}
          className={`flex-1 py-1 rounded transition cursor-pointer font-semibold ${
            selectedMetric === 'cpu'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          CPU
        </button>
        <button
          onClick={() => setSelectedMetric('ram')}
          className={`flex-1 py-1 rounded transition cursor-pointer font-semibold ${
            selectedMetric === 'ram'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          RAM
        </button>
        <button
          onClick={() => setSelectedMetric('pqc')}
          className={`flex-1 py-1 rounded transition cursor-pointer font-semibold ${
            selectedMetric === 'pqc'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          PQC Load
        </button>
      </div>

      {/* Metric Overview Gauges */}
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        {/* CPU Box */}
        <div
          onClick={() => setSelectedMetric('cpu')}
          className={`p-2 rounded-lg border transition cursor-pointer ${
            selectedMetric === 'cpu'
              ? 'bg-cyan-950/40 border-cyan-500/80 shadow-xs'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[9px] mb-0.5">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" /> CPU
            </span>
            <span className={`px-1 py-0.2 rounded font-bold border text-[9px] ${getMetricBadgeClass(latest.cpu)}`}>
              {latest.cpu}%
            </span>
          </div>
          <div className="text-[10px] text-slate-300 font-bold truncate">
            {hasActiveThreats ? 'eBPF Filter Spike' : 'Nominal Core'}
          </div>
        </div>

        {/* RAM Box */}
        <div
          onClick={() => setSelectedMetric('ram')}
          className={`p-2 rounded-lg border transition cursor-pointer ${
            selectedMetric === 'ram'
              ? 'bg-indigo-950/40 border-indigo-500/80 shadow-xs'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[9px] mb-0.5">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-indigo-400" /> RAM
            </span>
            <span className={`px-1 py-0.2 rounded font-bold border text-[9px] ${getMetricBadgeClass(latest.ram)}`}>
              {latest.ram}%
            </span>
          </div>
          <div className="text-[10px] text-slate-300 font-bold truncate">
            {latest.ramGigabytes} GB Alloc
          </div>
        </div>

        {/* PQC Coprocessor Load Box */}
        <div
          onClick={() => setSelectedMetric('pqc')}
          className={`p-2 rounded-lg border transition cursor-pointer ${
            selectedMetric === 'pqc'
              ? 'bg-amber-950/40 border-amber-500/80 shadow-xs'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[9px] mb-0.5">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> PQC Load
            </span>
            <span className={`px-1 py-0.2 rounded font-bold border text-[9px] ${getMetricBadgeClass(latest.pqcLoad)}`}>
              {latest.pqcLoad}%
            </span>
          </div>
          <div className="text-[10px] text-slate-300 font-bold truncate">
            {(latest.pqcOpsPerSec / 1000).toFixed(0)}k ops/s
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Chart Display Mode 1: Summary (All 3 Stacked Mini Sparklines) */}
      {/* ---------------------------------------------------- */}
      {selectedMetric === 'all' && (
        <div className="space-y-2.5 pt-1">
          {/* CPU Sparkline */}
          <div className="p-2 bg-slate-900/70 border border-slate-800/80 rounded-lg">
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-slate-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> CPU Core Utilization
              </span>
              <span className="text-cyan-400 font-bold">{latest.cpu}%</span>
            </div>
            {(() => {
              const svg = buildSvgPath(cpuData, 300, 32);
              return (
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 300 32" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cpuGradMini" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={svg.areaPath} fill="url(#cpuGradMini)" />
                  <path d={svg.linePath} fill="none" stroke="#06b6d4" strokeWidth="1.75" strokeLinecap="round" />
                  <circle cx={svg.latestPoint.x} cy={svg.latestPoint.y} r="2.5" fill="#22d3ee" className="animate-pulse" />
                </svg>
              );
            })()}
          </div>

          {/* RAM Sparkline */}
          <div className="p-2 bg-slate-900/70 border border-slate-800/80 rounded-lg">
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-slate-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Memory Buffer Pool
              </span>
              <span className="text-indigo-300 font-bold">{latest.ram}% ({latest.ramGigabytes} GB)</span>
            </div>
            {(() => {
              const svg = buildSvgPath(ramData, 300, 32);
              return (
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 300 32" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="ramGradMini" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={svg.areaPath} fill="url(#ramGradMini)" />
                  <path d={svg.linePath} fill="none" stroke="#818cf8" strokeWidth="1.75" strokeLinecap="round" />
                  <circle cx={svg.latestPoint.x} cy={svg.latestPoint.y} r="2.5" fill="#a5b4fc" className="animate-pulse" />
                </svg>
              );
            })()}
          </div>

          {/* PQC Coprocessor Sparkline */}
          <div className="p-2 bg-slate-900/70 border border-slate-800/80 rounded-lg">
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-slate-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> PQC Lattice Engine Load
              </span>
              <span className="text-amber-400 font-bold">{latest.pqcLoad}% ({(latest.pqcOpsPerSec / 1000).toFixed(0)}k ops/s)</span>
            </div>
            {(() => {
              const svg = buildSvgPath(pqcData, 300, 32);
              return (
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 300 32" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="pqcGradMini" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={svg.areaPath} fill="url(#pqcGradMini)" />
                  <path d={svg.linePath} fill="none" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" />
                  <circle cx={svg.latestPoint.x} cy={svg.latestPoint.y} r="2.5" fill="#fbbf24" className="animate-pulse" />
                </svg>
              );
            })()}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Chart Display Mode 2: Detailed Single Metric View     */}
      {/* ---------------------------------------------------- */}
      {selectedMetric !== 'all' && (() => {
        const isCpu = selectedMetric === 'cpu';
        const isRam = selectedMetric === 'ram';
        const isPqc = selectedMetric === 'pqc';

        const dataArray = isCpu ? cpuData : (isRam ? ramData : pqcData);
        const title = isCpu
          ? 'CPU Core Utilization (eBPF & Kernel)'
          : isRam
          ? 'Memory Allocation & TLS Session Cache'
          : 'PQC Lattice Coprocessor Load (ML-KEM-1024)';

        const strokeColor = isCpu ? '#06b6d4' : (isRam ? '#818cf8' : '#f59e0b');
        const glowColor = isCpu ? '#22d3ee' : (isRam ? '#a5b4fc' : '#fbbf24');
        const gradId = isCpu ? 'cpuGradFull' : (isRam ? 'ramGradFull' : 'pqcGradFull');

        const currentVal = isCpu ? latest.cpu : (isRam ? latest.ram : latest.pqcLoad);
        const maxVal = Math.max(...dataArray);
        const minVal = Math.min(...dataArray);
        const avgVal = Math.round(dataArray.reduce((a, b) => a + b, 0) / dataArray.length);

        const svg = buildSvgPath(dataArray, 300, 80);

        return (
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-bold font-sans">{title}</span>
              <span className="text-[11px] font-bold" style={{ color: strokeColor }}>
                {currentVal}%
              </span>
            </div>

            {/* Expanded SVG Area Chart */}
            <div className="relative pt-1 pb-1">
              <svg className="w-full h-20 overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity="0.45" />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle horizontal grid lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.75" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.75" />

                <path d={svg.areaPath} fill={`url(#${gradId})`} />
                <path d={svg.linePath} fill="none" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={svg.latestPoint.x} cy={svg.latestPoint.y} r="3.5" fill={glowColor} className="animate-pulse" />
              </svg>

              <div className="flex justify-between text-[9px] text-slate-500 pt-1">
                <span>30s ago</span>
                <span>15s ago</span>
                <span className="text-slate-400 font-semibold">Now</span>
              </div>
            </div>

            {/* Min / Avg / Max Statistics */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[10px]">
              <div className="text-center p-1 bg-slate-950/60 rounded border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">MIN</span>
                <span className="font-bold text-slate-300">{minVal}%</span>
              </div>
              <div className="text-center p-1 bg-slate-950/60 rounded border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">AVG</span>
                <span className="font-bold text-white">{avgVal}%</span>
              </div>
              <div className="text-center p-1 bg-slate-950/60 rounded border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">PEAK</span>
                <span className="font-bold text-rose-400">{maxVal}%</span>
              </div>
            </div>

            {/* Metric-specific context callout */}
            <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/40 p-2 rounded border border-slate-800/60">
              {isCpu && (
                <span>
                  eBPF flow monitoring & microsegment inspection running on ring-0 kernel threads.
                </span>
              )}
              {isRam && (
                <span>
                  Isolated memory sandbox allocating {latest.ramGigabytes} GB for post-quantum ephemeral session keys.
                </span>
              )}
              {isPqc && (
                <span>
                  Hardware lattice coprocessor throughput: <strong>{latest.pqcOpsPerSec.toLocaleString()}</strong> ML-KEM/ML-DSA ops/sec.
                </span>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
