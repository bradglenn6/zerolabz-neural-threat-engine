/**
 * ZeroLabz Real-Time Neural Threat Detection & Automated Incident Response (SOAR)
 * High-contrast layout with crisp borders, deep slate typography, and automated mitigation playbooks.
 */

import React, { useState } from 'react';
import { ThreatEvent } from '../types/security.js';
import { ShieldAlert, ShieldCheck, Zap, Lock, Filter, Search, CheckCircle2, AlertTriangle, Key, Terminal, ArrowRight, RefreshCw } from 'lucide-react';

interface ThreatEngineViewProps {
  threats: ThreatEvent[];
  onMitigate: (threatId: string, playbook?: string) => void;
  onSelectThreatForAi: (threat: ThreatEvent) => void;
}

export const ThreatEngineView: React.FC<ThreatEngineViewProps> = ({
  threats,
  onMitigate,
  onSelectThreatForAi,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedThreat, setSelectedThreat] = useState<ThreatEvent | null>(threats[0] || null);

  const filteredThreats = threats.filter(t => {
    const matchesSeverity = filterSeverity === 'all' || t.severity === filterSeverity;
    const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sourceIp.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Threat Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Threat Vectors</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-sans">
            {threats.filter(t => t.status !== 'mitigated').length}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-rose-600">High-entropy quantum probes</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Automated Mitigation Rate</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-sans">99.8%</div>
          <div className="mt-1 text-xs text-slate-500">Autonomous SOAR execution &lt; 2.2ms</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Neural Anomaly Confidence</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-700 font-sans">98.9%</div>
          <div className="mt-1 text-xs text-slate-500">Bayesian-LSTM deep autoencoder</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Post-Quantum Ciphersuites</span>
            <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Lock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-cyan-800 font-sans">ML-KEM-1024</div>
          <div className="mt-1 text-xs text-slate-500">Lattice-based encryption enforced</div>
        </div>
      </div>

      {/* Main Two-Column View: Threat Table & Detailed Forensic Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Threat List with Search & Filter */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          {/* Header Controls */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-sans">Real-Time Threat Telemetry</h2>
              <p className="text-xs text-slate-500">Streamed via kernel eBPF probes & Zero-Trust PDP</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search vector, IP, ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                value={filterSeverity}
                onChange={e => setFilterSeverity(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical Only</option>
                <option value="high">High Only</option>
                <option value="medium">Medium Only</option>
              </select>
            </div>
          </div>

          {/* Threat List Table */}
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[520px]">
            {filteredThreats.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No threat vectors found matching criteria.
              </div>
            ) : (
              filteredThreats.map(threat => {
                const isSelected = selectedThreat?.id === threat.id;
                const isMitigated = threat.status === 'mitigated';

                return (
                  <div
                    key={threat.id}
                    onClick={() => setSelectedThreat(threat)}
                    className={`p-4 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          threat.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : threat.severity === 'high'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {threat.severity}
                        </span>

                        <span className="font-mono text-xs font-semibold text-slate-800">{threat.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 font-mono">{threat.category}</span>
                      </div>

                      <div className="text-xs font-bold text-slate-900">{threat.title}</div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span>Src: {threat.sourceIp}</span>
                        <span>→</span>
                        <span className="text-slate-700 font-semibold">{threat.targetNode}</span>
                        <span>|</span>
                        <span>Anomaly: {(threat.anomalyScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                        isMitigated
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-700 border border-rose-300'
                      }`}>
                        {isMitigated ? 'Mitigated (SOAR)' : 'Active Vector'}
                      </span>

                      {!isMitigated && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMitigate(threat.id);
                          }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold transition cursor-pointer shadow-xs"
                        >
                          Auto-Mitigate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Forensic Inspector & Mitigation Playbooks */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col justify-between">
          {selectedThreat ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600">{selectedThreat.id}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                      selectedThreat.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedThreat.severity}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedThreat.title}</h3>
                </div>

                <button
                  onClick={() => onSelectThreatForAi(selectedThreat)}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
                >
                  AI Deep Forensic
                </button>
              </div>

              {/* Technical Attributes Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400 font-medium text-[10px] uppercase">MITRE ATT&CK</div>
                  <div className="font-mono text-slate-800 font-semibold mt-0.5">{selectedThreat.mitreTechnique}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400 font-medium text-[10px] uppercase">Shannon Entropy</div>
                  <div className="font-mono text-slate-800 font-semibold mt-0.5">{selectedThreat.entropyBits} bits / byte</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400 font-medium text-[10px] uppercase">Post-Quantum Standard</div>
                  <div className="font-mono text-cyan-700 font-semibold mt-0.5">{selectedThreat.pqcAlgorithm}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400 font-medium text-[10px] uppercase">NIST 2030 Status</div>
                  <div className="font-mono text-emerald-700 font-semibold mt-0.5">{selectedThreat.nistComplianceFlag}</div>
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Payload Analysis & Vector Pathology:</span>
                <p className="text-slate-600 leading-relaxed">{selectedThreat.description}</p>
                <div className="mt-2 text-[11px] font-mono text-slate-500 break-all">
                  Payload SHA-3 Hash: {selectedThreat.payloadHash}
                </div>
              </div>

              {/* Automated Mitigation Status or Playbook Selection */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    Automated SOAR Playbooks
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">ZeroLabz Autonomous PDP</span>
                </div>

                {selectedThreat.status === 'mitigated' ? (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-600/60 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Threat Successfully Neutralized</span>
                    </div>
                    <p className="text-emerald-200 text-[11px]">
                      {selectedThreat.automatedActionTaken}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => onMitigate(selectedThreat.id, 'Force ML-KEM-1024 Ephemeral Rotation & Invalidate Mesh JWT')}
                      className="w-full text-left p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center justify-between transition cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-cyan-400">1. Instant Quantum Lattice Key Rotation</div>
                        <div className="text-[10px] text-slate-400">Re-capsulates all session tokens with ML-KEM-1024</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                    </button>

                    <button
                      onClick={() => onMitigate(selectedThreat.id, 'Cilium eBPF Micro-Isolation & Source Autonomous System Ban')}
                      className="w-full text-left p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center justify-between transition cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-rose-400">2. Kernel Microsegmentation Isolation</div>
                        <div className="text-[10px] text-slate-400">Drops all non-PQC ingress at host eBPF filter layer</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-rose-400" />
                    </button>

                    <button
                      onClick={() => onMitigate(selectedThreat.id, 'Zero-Trust Continuous Posture Revocation & Decoy Routing')}
                      className="w-full text-left p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center justify-between transition cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-amber-400">3. Revoke ZTA Session & Reroute to Decoy</div>
                        <div className="text-[10px] text-slate-400">Traps reconnaissance into high-interaction honey-lattice</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Select a threat vector to view detailed forensics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
