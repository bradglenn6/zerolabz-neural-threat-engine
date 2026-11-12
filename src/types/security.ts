/**
 * ZeroLabz Post-Quantum Zero-Trust Neural Threat Engine Types
 * Aligned with NIST 2030 Post-Quantum Standards & Zero Trust Architecture (NIST SP 800-207)
 */

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export type ThreatStatus = 'detected' | 'mitigating' | 'mitigated' | 'quarantined' | 'investigating';

export interface ThreatEvent {
  id: string;
  timestamp: string;
  title: string;
  category: 'Quantum Brute-Force' | 'Zero-Day Exploit' | 'API Exfiltration' | 'Lattice Forgery' | 'Lateral Movement' | 'Credential Poisoning';
  severity: SeverityLevel;
  status: ThreatStatus;
  sourceIp: string;
  sourceNode: string;
  targetNode: string;
  anomalyScore: number; // 0.0 - 1.0
  entropyBits: number; // e.g. 7.98 bits
  confidence: number; // e.g. 98.4%
  mitreTechnique: string;
  pqcAlgorithm: 'ML-KEM-1024' | 'ML-DSA-87' | 'SLH-DSA-SHAKE-256' | 'Classic-RSA-Compromised';
  description: string;
  automatedActionTaken?: string;
  payloadHash: string;
  nistComplianceFlag: 'NIST-2030-Compliant' | 'Legacy-Vulnerable' | 'Remediated-PQ';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: 'THREAT_DETECTION' | 'AUTONOMOUS_MITIGATION' | 'KEY_ROTATION' | 'POLICY_ENFORCEMENT' | 'ZERO_TRUST_VERIFY' | 'API_INTEGRATION_SYNC';
  actor: string;
  resource: string;
  action: string;
  outcome: 'SUCCESS' | 'BLOCKED' | 'QUARANTINED' | 'ALERTED';
  merkleRoot: string;
  quantumSignature: string; // Dilithium-5 / ML-DSA-87 signature hash
  nistStandard: 'NIST SP 800-207 (ZTA)' | 'NIST FIPS 203 (ML-KEM)' | 'NIST FIPS 204 (ML-DSA)' | 'NIST FIPS 205 (SLH-DSA)';
  details: Record<string, unknown>;
}

export interface TopologyNode {
  id: string;
  name: string;
  type: 'core' | 'aws-enclave' | 'k8s-mesh' | 'pqc-vault' | 'api-gateway' | 'edge-sentinel';
  status: 'healthy' | 'investigating' | 'mitigating' | 'quarantined';
  position: [number, number, number];
  ipAddress: string;
  cloudRegion: string;
  pqcReady: boolean;
  activeKeyType: string;
  currentTrafficMbps: number;
  threatCount: number;
  zkProofStatus: 'verified' | 're-evaluating' | 'revoked';
}

export interface LatencyPoint {
  timestamp: string;
  minuteOffset: number; // e.g. -60 to 0
  latencyMs: number;
  p99Ms: number;
  status: 'nominal' | 'elevated' | 'spike';
}

export interface PredictivePoint {
  hour: string;
  observedThreats: number;
  projectedThreats: number;
  upperConfidence: number;
  lowerConfidence: number;
  quantumVulnerabilityIndex: number; // 0 - 100
}

export interface EnterpriseIntegration {
  id: string;
  name: string;
  vendor: string;
  category: 'SIEM' | 'EDR' | 'Cloud Security' | 'Service Mesh' | 'Secrets HSM';
  status: 'connected' | 'syncing' | 'degraded' | 'disconnected';
  lastSync: string;
  eventsProcessed24h: number;
  endpointUrl: string;
  pqcTlsEnabled: boolean;
  nistFipsCompliant: boolean;
}

export interface NistStandardMetric {
  standard: string;
  title: string;
  deadline: string;
  readinessPercentage: number;
  status: 'Compliant' | 'In-Migration' | 'Under-Audit';
  algorithms: string[];
  description: string;
}

export interface GroundedCitation {
  title: string;
  url: string;
}

export interface ThreatIntelligenceHeadline {
  id: string;
  category: 'PQC Transition' | 'Zero-Trust CVE' | 'Quantum Threat' | 'Cryptanalysis' | 'NIST 2030 Mandate' | 'Identity Bypass' | 'Hardware Security';
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'ADVISORY';
  headline: string;
  summary: string;
  source: string;
  url?: string;
  timestamp: string;
  grounded: boolean;
}

export interface ThreatIntelTickerResponse {
  headlines: ThreatIntelligenceHeadline[];
  citations: GroundedCitation[];
  searchQueries?: string[];
  lastUpdated: string;
  groundingActive: boolean;
  queryTopic: string;
}

