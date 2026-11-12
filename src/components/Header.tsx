/**
 * ZeroLabz Post-Quantum Zero-Trust Header
 * High-contrast architectural layout with silver shield and blue flame branding.
 */

import React from 'react';
import { Shield, Sparkles, Terminal, Cpu, Flame, CheckCircle2, Lock, Activity, BarChart3, Database, Layers } from 'lucide-react';

interface HeaderProps {
  activeTab: 'topology' | 'threats' | 'predictive' | 'audit' | 'integrations';
  setActiveTab: (tab: 'topology' | 'threats' | 'predictive' | 'audit' | 'integrations') => void;
  activeThreatCount: number;
  onOpenSimulator: () => void;
  onOpenAiInvestigator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeThreatCount,
  onOpenSimulator,
  onOpenAiInvestigator,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner: Enterprise Zero-Trust Status & Post-Quantum Indicators */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>POST-QUANTUM CRYPTOGRAPHIC PROTOCOL: ENFORCED</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400 text-[11px] font-mono">
            NIST FIPS 203 (ML-KEM-1024) • FIPS 204 (ML-DSA-87) • NIST SP 800-207 ZTA
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>NIST 2030 Readiness: 99.4%</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Latency:</span>
            <span className="text-white font-bold">1.4ms</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Inference:</span>
            <span className="text-white font-bold">480k evt/s</span>
          </div>
        </div>
      </div>

      {/* Main Brand & Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Icon: Signature Silver Shield Frame Wrapping Central Multi-Layered Blue Gas Flame */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-11 h-11 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-400 rounded-xl shadow-inner group">
            {/* Silver Shield Frame */}
            <div className="absolute inset-0 rounded-xl border border-slate-300 bg-gradient-to-br from-slate-200 via-white to-slate-300 opacity-90 shadow-sm" />
            {/* Multi-layered Blue Flame */}
            <div className="relative z-10 flex items-center justify-center">
              <Flame className="w-6 h-6 text-blue-600 fill-blue-500 drop-shadow-[0_2px_4px_rgba(37,99,235,0.3)]" />
              <Sparkles className="w-3 h-3 text-cyan-300 absolute -top-1 -right-1" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 uppercase font-sans">
                Zero<span className="text-blue-600">Labz</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded">
                Quantum Zero-Trust
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Neural Threat Detection & Automated Incident Response
            </p>
          </div>
        </div>

        {/* Action Buttons: AI Forensics & Threat Simulator */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAiInvestigator}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>AI Threat Forensic Lab</span>
          </button>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate Attack</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-slate-200 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1">
          {[
            { id: 'topology', label: '3D Neural Topology', icon: Activity },
            { id: 'threats', label: 'Threat Matrix & SOAR', icon: Shield, badge: activeThreatCount },
            { id: 'predictive', label: 'Predictive Analytics', icon: BarChart3 },
            { id: 'audit', label: 'NIST 2030 Audit Ledger', icon: Database },
            { id: 'integrations', label: 'Enterprise Stack Connectors', icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
