/**
 * ZeroLabz Post-Quantum Zero-Trust Neural Threat Engine
 * Complete unified application combining 3D Three.js neural cyber topology,
 * real-time SOAR incident mitigation, predictive analytics, and NIST 2030 audit ledger.
 */

import React, { useState, useEffect } from 'react';
import { TopologyNode, ThreatEvent } from './types/security.js';
import { Header } from './components/Header.js';
import { ZeroTrust3DScene } from './components/ZeroTrust3DScene.js';
import { ThreatEngineView } from './components/ThreatEngineView.js';
import { PredictiveAnalyticsView } from './components/PredictiveAnalyticsView.js';
import { AuditLedgerView } from './components/AuditLedgerView.js';
import { IntegrationsView } from './components/IntegrationsView.js';
import { ThreatSimulatorModal } from './components/ThreatSimulatorModal.js';
import { AiForensicsModal } from './components/AiForensicsModal.js';
import { LatencySparkline } from './components/LatencySparkline.js';
import { GlobalThreatTicker } from './components/GlobalThreatTicker.js';
import { ShieldAlert, CheckCircle2, Flame, Sparkles, Activity, Lock, Cpu, Server, Database } from 'lucide-react';

const INITIAL_NODES: TopologyNode[] = [
  {
    id: 'core',
    name: 'Quantum Cryo-Core HSM',
    type: 'core',
    status: 'healthy',
    position: [0, 0, 0],
    ipAddress: '10.0.0.1 (Loopback Cryo-Bus)',
    cloudRegion: 'ZeroLabz Vault (US-East)',
    pqcReady: true,
    activeKeyType: 'ML-KEM-1024 / ML-DSA-87',
    currentTrafficMbps: 9420,
    threatCount: 0,
    zkProofStatus: 'verified'
  },
  {
    id: 'aws-enclave',
    name: 'AWS Nitro Cryptographic Enclave',
    type: 'aws-enclave',
    status: 'healthy',
    position: [-10, 0, -8],
    ipAddress: '172.31.14.88',
    cloudRegion: 'AWS us-east-1',
    pqcReady: true,
    activeKeyType: 'ML-KEM-1024',
    currentTrafficMbps: 3840,
    threatCount: 1,
    zkProofStatus: 'verified'
  },
  {
    id: 'k8s-mesh',
    name: 'Kubernetes Istio/Cilium Pod Mesh',
    type: 'k8s-mesh',
    status: 'healthy',
    position: [10, 0, -8],
    ipAddress: '10.244.0.1/16',
    cloudRegion: 'GCP us-central1',
    pqcReady: true,
    activeKeyType: 'ML-DSA-87 Token Mesh',
    currentTrafficMbps: 6210,
    threatCount: 1,
    zkProofStatus: 'verified'
  },
  {
    id: 'pqc-vault',
    name: 'Post-Quantum Key & Secrets Vault',
    type: 'pqc-vault',
    status: 'healthy',
    position: [-12, 0, 8],
    ipAddress: '10.88.2.14',
    cloudRegion: 'Azure East US 2',
    pqcReady: true,
    activeKeyType: 'SLH-DSA-SHAKE-256',
    currentTrafficMbps: 1820,
    threatCount: 0,
    zkProofStatus: 'verified'
  },
  {
    id: 'api-gateway',
    name: 'Zero-Trust Perimeter API Gateway',
    type: 'api-gateway',
    status: 'investigating',
    position: [12, 0, 8],
    ipAddress: '198.51.100.1',
    cloudRegion: 'Cloudflare / Edge CDN',
    pqcReady: false,
    activeKeyType: 'Hybrid TLS 1.3 (Transition)',
    currentTrafficMbps: 12400,
    threatCount: 1,
    zkProofStatus: 're-evaluating'
  },
  {
    id: 'edge-sentinel',
    name: 'Edge Telemetry Sentinel',
    type: 'edge-sentinel',
    status: 'healthy',
    position: [0, 0, 13],
    ipAddress: '192.168.100.5',
    cloudRegion: 'Global Edge PoP 4',
    pqcReady: true,
    activeKeyType: 'ML-KEM-768',
    currentTrafficMbps: 4500,
    threatCount: 0,
    zkProofStatus: 'verified'
  }
];

const INITIAL_THREATS: ThreatEvent[] = [
  {
    id: 'THR-8902',
    timestamp: new Date(Date.now() - 45000).toISOString(),
    title: "Shor's Algorithm Pre-Computation / Key Harvest",
    category: 'Quantum Brute-Force',
    severity: 'critical',
    status: 'detected',
    sourceIp: '198.51.100.74 (Autonomous AS9801)',
    sourceNode: 'External Ingress',
    targetNode: 'api-gateway',
    anomalyScore: 0.96,
    entropyBits: 7.994,
    confidence: 99.2,
    mitreTechnique: 'T1552 - Unsecured Credentials & Quantum Harvest',
    pqcAlgorithm: 'Classic-RSA-Compromised',
    description: 'High-entropy packet burst targeting TLS handshake with non-lattice ephemeral key negotiation. Detected Harvest-Now-Decrypt-Later (HNDL) signature pattern.',
    automatedActionTaken: 'Dynamic PQC TLS 1.3 enforced. Switched to ML-KEM-1024 (Kyber) encapsulation.',
    payloadHash: '0x8f2a93c1b8240ef14890d2e821e2501a4e21b7d83492',
    nistComplianceFlag: 'Legacy-Vulnerable'
  },
  {
    id: 'THR-8901',
    timestamp: new Date(Date.now() - 140000).toISOString(),
    title: 'Zero-Trust Token Signature Replay Attack',
    category: 'API Exfiltration',
    severity: 'high',
    status: 'mitigated',
    sourceIp: '10.244.3.112 (Ephemeral Mesh Pod)',
    sourceNode: 'k8s-mesh',
    targetNode: 'pqc-vault',
    anomalyScore: 0.88,
    entropyBits: 7.82,
    confidence: 96.5,
    mitreTechnique: 'T1550.001 - Application Access Token Hijacking',
    pqcAlgorithm: 'ML-DSA-87',
    description: 'Replay attempt of authorization bearer token across micro-segment boundary. Denied by Policy Decision Point (PDP) due to missing ML-DSA-87 quantum signature.',
    automatedActionTaken: 'Ephemeral service account token revoked. Pod isolated in sandbox namespace.',
    payloadHash: '0x3c71a9e8024fa821109dc0e21941ba980e12f45109b2',
    nistComplianceFlag: 'NIST-2030-Compliant'
  },
  {
    id: 'THR-8899',
    timestamp: new Date(Date.now() - 320000).toISOString(),
    title: 'Lateral Lattice Key Permutation Probing',
    category: 'Lattice Forgery',
    severity: 'medium',
    status: 'quarantined',
    sourceIp: '172.16.89.44 (Internal Subnet)',
    sourceNode: 'aws-enclave',
    targetNode: 'core',
    anomalyScore: 0.74,
    entropyBits: 7.41,
    confidence: 93.1,
    mitreTechnique: 'T1006 - Direct Volume Access & Parameter Injection',
    pqcAlgorithm: 'ML-KEM-1024',
    description: 'Repeated malformed Learning-With-Errors (LWE) ring coefficients transmitted to Kyber coprocessor interface. Potential fault injection test.',
    automatedActionTaken: 'Hardware Cryptographic Coprocessor shifted to side-channel shielded mode. IP blacklisted at Cilium eBPF firewall.',
    payloadHash: '0x55d04899c71a2e4b8890ff41d8e90a233b821456a001',
    nistComplianceFlag: 'Remediated-PQ'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'topology' | 'threats' | 'predictive' | 'audit' | 'integrations'>('topology');
  const [nodes, setNodes] = useState<TopologyNode[]>(INITIAL_NODES);
  const [threats, setThreats] = useState<ThreatEvent[]>(INITIAL_THREATS);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [selectedThreatForAi, setSelectedThreatForAi] = useState<ThreatEvent | null>(null);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  // Fetch real-time threats from API with resilient error handling
  const refreshThreats = async () => {
    try {
      const res = await fetch('/api/threats');
      if (res.ok) {
        const data = await res.json();
        if (data.threats && Array.isArray(data.threats)) {
          setThreats(data.threats);
        }
      }
    } catch {
      // Graceful offline fallback: maintain current state without unhandled console errors
    }
  };

  useEffect(() => {
    refreshThreats();
    const interval = setInterval(refreshThreats, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handle autonomous mitigation trigger
  const handleMitigateThreat = async (threatId: string, playbook?: string) => {
    const actionName = playbook || 'Autonomous Quantum Lattice Quarantine & Ephemeral Key Invalidation';

    // Optimistically update local UI state immediately
    setThreats(prev => prev.map(t => t.id === threatId ? {
      ...t,
      status: 'mitigated',
      automatedActionTaken: actionName
    } : t));

    setBannerAlert(`Automated Response Triggered: Neutralized threat [${threatId}] with post-quantum key rotation.`);
    setTimeout(() => setBannerAlert(null), 5000);

    try {
      await fetch('/api/incidents/mitigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threatId, playbook })
      });
      refreshThreats();
    } catch {
      // Optimistic update is already committed locally
    }
  };

  const handleOpenAiForThreat = (threat: ThreatEvent) => {
    setSelectedThreatForAi(threat);
    setIsAiModalOpen(true);
  };

  const activeThreatCount = threats.filter(t => t.status !== 'mitigated').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Real-time Global Threat Intelligence Ticker with Google Search Grounding */}
      <GlobalThreatTicker />

      {/* High-Contrast Header with Silver Shield & Blue Flame Branding */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeThreatCount={activeThreatCount}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenAiInvestigator={() => {
          setSelectedThreatForAi(threats[0] || null);
          setIsAiModalOpen(true);
        }}
      />

      {/* Ephemeral Alert Toast */}
      {bannerAlert && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-3 w-full">
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bannerAlert}</span>
            </div>
            <button
              onClick={() => setBannerAlert(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-mono"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full space-y-6">
        {/* VIEW 1: 3D Neural Cyber Topology & Zero-Trust Sentinel Mesh */}
        {activeTab === 'topology' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <ZeroTrust3DScene
                nodes={nodes}
                activeThreats={threats}
                onSelectNode={setSelectedNode}
                selectedNode={selectedNode}
                onMitigateThreat={handleMitigateThreat}
                onSimulateAttack={() => setIsSimulatorOpen(true)}
              />
            </div>

            {/* Quick Diagnostic Ribbon Beneath 3D Scene */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Module-Lattice Cryptography</div>
                  <div className="text-[11px] text-slate-500 font-mono">ML-KEM-1024 • 256-bit PQC</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Zero-Trust Continuous Attestation</div>
                  <div className="text-[11px] text-slate-500 font-mono">NIST SP 800-207 Active</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">3D Thermal Heatmap Layer</div>
                  <div className="text-[11px] text-slate-500 font-mono">Real-time Density & Ingress</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200 self-start mt-0.5 shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <LatencySparkline />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Threat Matrix & SOAR Automated Mitigation */}
        {activeTab === 'threats' && (
          <ThreatEngineView
            threats={threats}
            onMitigate={handleMitigateThreat}
            onSelectThreatForAi={handleOpenAiForThreat}
          />
        )}

        {/* VIEW 3: Predictive Analytics & Forecasting */}
        {activeTab === 'predictive' && (
          <PredictiveAnalyticsView />
        )}

        {/* VIEW 4: NIST 2030 Audit Ledger */}
        {activeTab === 'audit' && (
          <AuditLedgerView />
        )}

        {/* VIEW 5: Enterprise Stack Integrations */}
        {activeTab === 'integrations' && (
          <IntegrationsView />
        )}
      </main>

      {/* Modals */}
      <ThreatSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        nodes={nodes}
        onThreatInjected={refreshThreats}
      />

      <AiForensicsModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        threat={selectedThreatForAi}
      />

      {/* High-Contrast Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-slate-200 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            </div>
            <span className="font-bold text-slate-800">ZeroLabz Post-Quantum Zero-Trust Protocol</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">Compliant with 2030 NIST Cryptographic Mandates</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>FIPS 203 (ML-KEM)</span>
            <span>•</span>
            <span>FIPS 204 (ML-DSA)</span>
            <span>•</span>
            <span>FIPS 205 (SLH-DSA)</span>
            <span>•</span>
            <span>SP 800-207 (ZTA)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
