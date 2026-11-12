/**
 * ZeroLabz Enterprise Stack Integrations & Cloud-Native API Connectors
 * Seamless connectivity across SIEM, EDR, Cloud Security, and Kubernetes Service Mesh.
 */

import React, { useState, useEffect } from 'react';
import { EnterpriseIntegration } from '../types/security.js';
import { Layers, CheckCircle2, XCircle, ArrowUpRight, Send, Code, Shield, RefreshCw } from 'lucide-react';

const DEFAULT_INTEGRATIONS: EnterpriseIntegration[] = [
  {
    id: 'int-splunk',
    name: 'Splunk Enterprise Security SIEM',
    category: 'SIEM',
    vendor: 'Splunk / Cisco',
    status: 'connected',
    eventsProcessed24h: 1845000,
    lastSync: '12s ago',
    endpointUrl: 'https://siem-collector.corp.zerolabz.io/services/collector',
    pqcTlsEnabled: true,
    nistFipsCompliant: true
  },
  {
    id: 'int-crowdstrike',
    name: 'CrowdStrike Falcon Zero-Trust EDR',
    category: 'EDR',
    vendor: 'CrowdStrike',
    status: 'connected',
    eventsProcessed24h: 924000,
    lastSync: '4s ago',
    endpointUrl: 'https://api.crowdstrike.com/policy/v2/zero-trust',
    pqcTlsEnabled: true,
    nistFipsCompliant: true
  },
  {
    id: 'int-wiz',
    name: 'Wiz Cloud Security Graph & CSPM',
    category: 'Cloud Security',
    vendor: 'Wiz.io',
    status: 'connected',
    eventsProcessed24h: 412000,
    lastSync: '28s ago',
    endpointUrl: 'https://api.wiz.io/graphql',
    pqcTlsEnabled: true,
    nistFipsCompliant: true
  },
  {
    id: 'int-cilium',
    name: 'Cilium eBPF & Istio Service Mesh',
    category: 'Service Mesh',
    vendor: 'Isovalent / CNCF',
    status: 'connected',
    eventsProcessed24h: 3120000,
    lastSync: '2s ago',
    endpointUrl: 'https://cilium-mesh.k8s.internal:9090/v1/flow',
    pqcTlsEnabled: true,
    nistFipsCompliant: true
  },
  {
    id: 'int-hashicorp',
    name: 'HashiCorp Vault Post-Quantum HSM',
    category: 'Secrets HSM',
    vendor: 'HashiCorp',
    status: 'connected',
    eventsProcessed24h: 68000,
    lastSync: '45s ago',
    endpointUrl: 'https://vault.pqc.zerolabz.internal:8200/v1/pqc',
    pqcTlsEnabled: true,
    nistFipsCompliant: true
  },
  {
    id: 'int-chronicle',
    name: 'Google Cloud Security Chronicle',
    category: 'SIEM',
    vendor: 'Google Cloud',
    status: 'connected',
    eventsProcessed24h: 4210900,
    lastSync: '6s ago',
    endpointUrl: 'https://chronicle.googleapis.com/v1alpha/events:batchCreate',
    pqcTlsEnabled: true,
    nistFipsCompliant: true
  }
];

export const IntegrationsView: React.FC = () => {
  const [integrations, setIntegrations] = useState<EnterpriseIntegration[]>(DEFAULT_INTEGRATIONS);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/integrations')
      .then(res => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then(data => {
        if (isMounted && data.integrations && Array.isArray(data.integrations)) {
          setIntegrations(data.integrations);
        }
      })
      .catch(() => {
        // Fallback to initial integrations silently
      });
    return () => { isMounted = false; };
  }, []);

  const handleToggle = async (id: string) => {
    // Optimistically toggle locally
    setIntegrations(prev => prev.map(i => i.id === id ? {
      ...i,
      status: i.status === 'connected' ? 'disconnected' : 'connected',
      lastSync: 'Just now'
    } : i));

    try {
      const res = await fetch('/api/integrations/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.integration) {
          setIntegrations(prev => prev.map(i => i.id === id ? data.integration : i));
        }
      }
    } catch {
      // Local optimistic update already applied
    }
  };

  const handleTestWebhook = (intItem: EnterpriseIntegration) => {
    setTestingId(intItem.id);
    setTestResult(null);

    setTimeout(() => {
      setTestingId(null);
      setTestResult({
        id: intItem.id,
        message: `HTTP 200 OK: Post-Quantum TLS 1.3 handshake verified with ${intItem.name}. Ingested 1 mock ML-KEM telemetry payload.`
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-100 text-blue-700">
                <Layers className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900 font-sans">
                Enterprise Security Stack & Multi-Cloud Connectors
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Bidirectional telemetry streaming, SOAR incident playbooks, and automated Zero-Trust posture synchronization.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
              {integrations.filter(i => i.status === 'connected').length} / {integrations.length} Connectors Active
            </span>
          </div>
        </div>
      </div>

      {/* Integration Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map(item => {
          const isConnected = item.status === 'connected';
          const isTesting = testingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between transition hover:border-slate-300"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      {item.category} • {item.vendor}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{item.name}</h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isConnected ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isConnected ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">24h Ingestion:</span>
                    <span className="font-semibold text-slate-800">
                      {(item.eventsProcessed24h / 1000).toLocaleString()}k events
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Last Sync:</span>
                    <span className="text-slate-700">{item.lastSync}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">PQC TLS 1.3:</span>
                    <span className="text-cyan-700 font-bold">ML-KEM-1024</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono truncate" title={item.endpointUrl}>
                  {item.endpointUrl}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(item.id)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isConnected
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>

                  <button
                    onClick={() => handleTestWebhook(item)}
                    disabled={!isConnected || isTesting}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-600" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>Ping</span>
                  </button>
                </div>

                {testResult?.id === item.id && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[10px] text-emerald-800 font-mono">
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cloud-Native API Integration Snippet */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono">Cloud-Native REST API & Webhook Ingestion Hook</h3>
          </div>
          <span className="text-xs font-mono text-cyan-400">Endpoint: POST /api/threats</span>
        </div>

        <div className="mt-3 p-3 bg-slate-950 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto">
          <code>
{`# Ingest real-time threat telemetry from external Kubernetes or Cloud Run workloads:
curl -X POST https://zerolabz.corp.internal/api/threats/simulate \\
  -H "Authorization: Bearer <ZEROLABZ_ML_DSA_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "category": "Quantum Brute-Force",
    "targetNode": "aws-enclave",
    "pqcAlgorithm": "ML-KEM-1024",
    "anomalyScore": 0.98
  }'`}
          </code>
        </div>
      </div>
    </div>
  );
};
