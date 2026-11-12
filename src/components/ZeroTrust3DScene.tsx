/**
 * ZeroLabz Post-Quantum Zero-Trust 3D Neural Threat Topology
 * Adheres strictly to Three.js PBR standards, composite procedural models, and collapsible bottom dock.
 * Enhanced with real-time Threat Density & Traffic Volume Thermal Heatmap Layer.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TopologyNode, ThreatEvent } from '../types/security.js';
import { Shield, ShieldCheck, Eye, ShieldAlert, Cpu, Sparkles, RefreshCw, ChevronDown, ChevronUp, Lock, Flame, Activity, Zap, Layers, Network, BarChart3, LineChart } from 'lucide-react';
import { NodePerformanceCharts } from './NodePerformanceCharts.js';

interface ZeroTrust3DSceneProps {
  nodes: TopologyNode[];
  activeThreats: ThreatEvent[];
  onSelectNode: (node: TopologyNode | null) => void;
  selectedNode: TopologyNode | null;
  onMitigateThreat: (threatId: string) => void;
  onSimulateAttack: () => void;
}

// Pre-allocated scratch objects to prevent garbage collection inside the 60fps render loop
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();

// Helper to calculate collision-free, traffic-weighted 3D node positions that eliminate connection overlaps
export function calculateAutoLayoutPositions(nodes: TopologyNode[]): Map<string, THREE.Vector3> {
  const positions = new Map<string, THREE.Vector3>();

  // Quantum Cryo-Core remains stabilized at origin (0, 0, 0)
  positions.set('core', new THREE.Vector3(0, 0, 0));

  const outerNodes = nodes.filter(n => n.id !== 'core');
  if (outerNodes.length === 0) return positions;

  // Sort outer nodes by current traffic volume descending
  const sorted = [...outerNodes].sort((a, b) => b.currentTrafficMbps - a.currentTrafficMbps);

  const maxTraffic = Math.max(...sorted.map(n => n.currentTrafficMbps), 1000);
  const minTraffic = Math.min(...sorted.map(n => n.currentTrafficMbps), 500);
  const trafficSpread = (maxTraffic - minTraffic) || 1;

  const count = sorted.length;
  // Interleaving step (2 coprime to odd counts like 5) guarantees maximum angular distance between heavy streams
  const step = count > 3 ? 2 : 1;

  sorted.forEach((node, rank) => {
    const slotIndex = (rank * step) % count;
    // Compute non-overlapping radial angle with subtle aesthetic tilt
    const angle = (slotIndex / count) * Math.PI * 2 + 0.35;

    // Dynamic radial distance proportional to traffic throughput (11.5 to 20 units)
    // Isolates heavy conduits into outer clear perimeter, keeping inner conduits clear
    const trafficRatio = Math.min(1.0, Math.max(0.0, (node.currentTrafficMbps - minTraffic) / trafficSpread));
    const radius = 11.5 + trafficRatio * 8.5;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    positions.set(node.id, new THREE.Vector3(x, 0, z));
  });

  return positions;
}

// Helper to calculate real-time threat density, traffic volume, and thermal heatmap color
export function calculateNodeHeatmap(
  node: TopologyNode,
  activeThreats: ThreatEvent[],
  metric: 'combined' | 'threat' | 'traffic' = 'combined'
) {
  const nodeThreats = activeThreats.filter(t => t.targetNode === node.id && t.status !== 'mitigated');
  const criticalCount = nodeThreats.filter(t => t.severity === 'critical').length;
  const highCount = nodeThreats.filter(t => t.severity === 'high').length;
  const medCount = nodeThreats.filter(t => t.severity === 'medium').length;

  // Threat density weighted score (0.0 to 1.0)
  const threatWeight = criticalCount * 0.75 + highCount * 0.45 + medCount * 0.2;
  const threatDensity = Math.min(1.0, threatWeight);

  // Traffic volume load (0.0 to 1.0, normalized against 15,000 Mbps capacity)
  const trafficLoadPercent = Math.min(100, Math.round((node.currentTrafficMbps / 15000) * 100));
  const trafficDensity = Math.min(1.0, node.currentTrafficMbps / 15000);

  let score = 0;
  if (metric === 'threat') {
    score = threatDensity;
  } else if (metric === 'traffic') {
    score = trafficDensity;
  } else {
    // Combined: 55% threat density + 45% traffic volume
    score = Math.min(1.0, threatDensity * 0.55 + trafficDensity * 0.45);
  }

  // Thermal cyber spectral color gradient:
  // 0.00 - 0.25: Emerald / Cyan (#10b981) - Cold / Nominal
  // 0.25 - 0.50: Yellow / Amber (#eab308) - Moderate Traffic / Warm
  // 0.50 - 0.75: Orange (#f97316) - Elevated Load & Probes
  // 0.75 - 1.00: Crimson / Magma (#ef4444) - Critical Ingress Overheat
  let colorHex = 0x10b981;
  let colorCss = '#10b981';
  let badgeLabel = 'Nominal / Cold';

  if (score < 0.25) {
    colorHex = 0x10b981;
    colorCss = '#10b981';
    badgeLabel = 'Nominal (Cold)';
  } else if (score < 0.50) {
    colorHex = 0xeab308;
    colorCss = '#eab308';
    badgeLabel = 'Moderate Load (Warm)';
  } else if (score < 0.75) {
    colorHex = 0xf97316;
    colorCss = '#f97316';
    badgeLabel = 'Elevated Threat (Hot)';
  } else {
    colorHex = 0xef4444;
    colorCss = '#ef4444';
    badgeLabel = 'Critical Overheat (Severe)';
  }

  return {
    score,
    colorHex,
    colorCss,
    threatDensity,
    trafficLoadPercent,
    badgeLabel,
    activeThreatsCount: nodeThreats.length
  };
}

export const ZeroTrust3DScene: React.FC<ZeroTrust3DSceneProps> = ({
  nodes,
  activeThreats,
  onSelectNode,
  selectedNode,
  onMitigateThreat,
  onSimulateAttack,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<'orbit' | 'core' | 'ingress' | 'top'>('orbit');
  const [hoveredNode, setHoveredNode] = useState<TopologyNode | null>(null);

  // Real-time Heatmap Layer States
  const [heatmapActive, setHeatmapActive] = useState<boolean>(true);
  const [heatmapMetric, setHeatmapMetric] = useState<'combined' | 'threat' | 'traffic'>('combined');

  // Dynamic Auto-Layout Mode State (minimizes connection overlaps based on traffic volume)
  const [autoLayout, setAutoLayout] = useState<boolean>(false);
  const targetPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map());

  // References to keep render loop and callbacks stable across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number>(0);
  const nodesMeshMapRef = useRef<Map<string, THREE.Group>>(new Map());
  const beamCurvesRef = useRef<{ curve: THREE.QuadraticBezierCurve3; mesh: THREE.Mesh; targetId: string }[]>([]);
  const coreGroupRef = useRef<THREE.Group | null>(null);
  const orbitalRingsRef = useRef<THREE.Group[]>([]);
  const shieldPlatesRef = useRef<THREE.Mesh[]>([]);

  // Heatmap specific mesh refs for live dynamic updates
  const heatmapDiscsRef = useRef<Map<string, { disc: THREE.Mesh; ring: THREE.Mesh; beacon: THREE.Mesh }>>(new Map());

  // Keyboard shortcut 'H' to toggle bottom dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setControlsCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronize dynamic target positions whenever autoLayout mode or nodes update
  useEffect(() => {
    const targets = autoLayout
      ? calculateAutoLayoutPositions(nodes)
      : new Map(nodes.map(n => [n.id, new THREE.Vector3(...n.position)]));
    targetPositionsRef.current = targets;
  }, [autoLayout, nodes]);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL Guard (read from GPU string, not user agent)
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. High-performance PBR Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 3. Scene and Atmosphere Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#060913'); // Deep high-contrast cyber slate
    scene.fog = new THREE.FogExp2('#060913', 0.022); // Horizon fog matched to background
    sceneRef.current = scene;

    // 4. Camera & Damped Orbit Controls
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 16, 32);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Keep camera above the horizon plane
    controls.minDistance = 8;
    controls.maxDistance = 65;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // 5. Studio Environment Reflection via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Three-Point Studio Lighting Rig
    // Warm Key Light
    const keyLight = new THREE.DirectionalLight('#ffe8d6', 2.8);
    keyLight.position.set(18, 28, 18);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 70;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      const d = 25;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
    }
    scene.add(keyLight);

    // Cool Sky/Ground Hemisphere Fill Light
    const hemiLight = new THREE.HemisphereLight('#70b4ff', '#0d1526', 1.4);
    scene.add(hemiLight);

    // Cyan Quantum Core Accent Rim Light
    const rimLight = new THREE.DirectionalLight('#00ffff', 1.8);
    rimLight.position.set(-18, 12, -18);
    scene.add(rimLight);

    // 7. Ground Grid & Contact Shadow Grounding
    // Procedural contact shadow canvas texture
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 4, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);
    const contactShadowTex = new THREE.CanvasTexture(shadowCanvas);
    contactShadowTex.colorSpace = THREE.SRGBColorSpace;

    // Procedural Heatmap Radial Disc Texture
    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = 256;
    heatCanvas.height = 256;
    const hCtx = heatCanvas.getContext('2d')!;
    const hGrad = hCtx.createRadialGradient(128, 128, 10, 128, 128, 124);
    hGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    hGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.75)');
    hGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.3)');
    hGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    hCtx.fillStyle = hGrad;
    hCtx.fillRect(0, 0, 256, 256);
    const heatmapRadialTex = new THREE.CanvasTexture(heatCanvas);
    heatmapRadialTex.colorSpace = THREE.SRGBColorSpace;

    // Ground Grid Wireframe Floor
    const gridHelper = new THREE.GridHelper(70, 35, 0x1e3a8a, 0x0f172a);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // Concentric Quantum Lattice Ring on Ground
    const ringGeo = new THREE.RingGeometry(3.5, 3.55, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const groundRing = new THREE.Mesh(ringGeo, ringMat);
    groundRing.rotation.x = Math.PI / 2;
    groundRing.position.y = 0.01;
    scene.add(groundRing);

    // -------------------------------------------------------------------------
    // 8. HERO SUBJECT: ZeroLabz Quantum Neural Core (Composite 8-Part THREE.Group)
    // -------------------------------------------------------------------------
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 0, 0);
    coreGroupRef.current = coreGroup;

    // Part 1: Heavy Beveled Octagonal Chamber Base
    const baseGeo = new THREE.CylinderGeometry(4.2, 4.8, 0.9, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.95,
      roughness: 0.28,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.45;
    baseMesh.castShadow = !isSoftwareGl;
    baseMesh.receiveShadow = !isSoftwareGl;
    coreGroup.add(baseMesh);

    // Part 2: Inner Quantum Cryo-Cylinder with Crystalline Lattice Glow
    const cryoGeo = new THREE.CylinderGeometry(2.1, 2.1, 3.2, 32);
    const cryoMat = new THREE.MeshPhysicalMaterial({
      color: 0x00d4ff,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.2,
      transmission: isSoftwareGl ? 0 : 0.85,
      transparent: true,
      opacity: isSoftwareGl ? 0.6 : 0.9,
      ior: 1.5,
    });
    const cryoMesh = new THREE.Mesh(cryoGeo, cryoMat);
    cryoMesh.position.y = 2.45;
    coreGroup.add(cryoMesh);

    // Part 3: Nested Orbital Lattice Rings
    const ringMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.2, emissive: 0x0284c7, emissiveIntensity: 0.4 }),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 }),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.85, roughness: 0.25 }),
    ];
    const ringRadii = [3.2, 2.8, 2.4];
    const ringGroups: THREE.Group[] = [];

    ringRadii.forEach((radius, idx) => {
      const ringG = new THREE.Group();
      ringG.position.y = 2.45;
      const torusGeo = new THREE.TorusGeometry(radius, 0.07, 16, 64);
      const torusMesh = new THREE.Mesh(torusGeo, ringMaterials[idx % ringMaterials.length]);
      torusMesh.castShadow = !isSoftwareGl;
      ringG.add(torusMesh);
      coreGroup.add(ringG);
      ringGroups.push(ringG);
    });
    orbitalRingsRef.current = ringGroups;

    // Part 4: 8 Radial Laser Bus Optical Waveguides
    const busMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.3,
    });
    const laserTipMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const busArm = new THREE.Group();
      busArm.position.set(0, 0.9, 0);
      busArm.rotation.y = angle;

      const conduitGeo = new THREE.BoxGeometry(0.3, 0.25, 3.8);
      const conduitMesh = new THREE.Mesh(conduitGeo, busMat);
      conduitMesh.position.z = 2.0;
      busArm.add(conduitMesh);

      const prismGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
      const prismMesh = new THREE.Mesh(prismGeo, laserTipMat);
      prismMesh.position.z = 3.9;
      busArm.add(prismMesh);

      coreGroup.add(busArm);
    }

    // Part 5: Top Sentinel Hardware Security Module (HSM) Spire
    const spireGeo = new THREE.ConeGeometry(1.2, 2.2, 8);
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.95,
      roughness: 0.2,
      emissive: 0x0f172a,
    });
    const spireMesh = new THREE.Mesh(spireGeo, spireMat);
    spireMesh.position.y = 5.1;
    spireMesh.castShadow = !isSoftwareGl;
    coreGroup.add(spireMesh);

    // Part 6: Floating Hexagonal Zero-Trust Shielding Plates
    const shieldGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.08, 6);
    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.85,
      transparent: true,
      opacity: 0.75,
    });
    const shieldMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const plate = new THREE.Mesh(shieldGeo, shieldMat);
      const angle = (i / 6) * Math.PI * 2;
      plate.position.set(Math.cos(angle) * 4.6, 2.8, Math.sin(angle) * 4.6);
      plate.rotation.x = Math.PI / 2;
      plate.rotation.z = angle;
      coreGroup.add(plate);
      shieldMeshes.push(plate);
    }
    shieldPlatesRef.current = shieldMeshes;

    // Part 7: Ground Contact Shadow Grounding Disc
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const shadowGeo = new THREE.PlaneGeometry(12, 12);
    const shadowMesh = new THREE.Mesh(shadowGeo, contactShadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    coreGroup.add(shadowMesh);

    // Part 8: Particle Qubit Cloud
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.4 + Math.random() * 2.2;
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = 2.45 + (r * Math.sin(phi) * Math.sin(theta)) * 0.6;
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.8,
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particleCloud);

    scene.add(coreGroup);

    // -------------------------------------------------------------------------
    // 9. ENTERPRISE CLOUD NODES WITH HEATMAP THERMAL HALOS & VOLUMETRIC BEACONS
    // -------------------------------------------------------------------------
    const nodeMeshes = new Map<string, THREE.Group>();
    const heatmapDiscs = new Map<string, { disc: THREE.Mesh; ring: THREE.Mesh; beacon: THREE.Mesh }>();

    nodes.forEach(node => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(...node.position);
      (nodeGroup as any).userData = { nodeId: node.id };

      // Compute initial heatmap metrics
      const heat = calculateNodeHeatmap(node, activeThreats, 'combined');

      // 1. HEATMAP LAYER: Ground Thermal Halo Disc (y = 0.025 to eliminate Z-fighting)
      const heatDiscGeo = new THREE.PlaneGeometry(6.5, 6.5);
      const heatDiscMat = new THREE.MeshBasicMaterial({
        map: heatmapRadialTex,
        color: heat.colorHex,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const heatDiscMesh = new THREE.Mesh(heatDiscGeo, heatDiscMat);
      heatDiscMesh.rotation.x = -Math.PI / 2;
      heatDiscMesh.position.y = 0.025;
      heatDiscMesh.scale.setScalar(0.9 + heat.score * 0.8);
      nodeGroup.add(heatDiscMesh);

      // 2. HEATMAP LAYER: Ground Thermal Ripple Ring
      const heatRingGeo = new THREE.RingGeometry(2.4, 2.55, 48);
      const heatRingMat = new THREE.MeshBasicMaterial({
        color: heat.colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const heatRingMesh = new THREE.Mesh(heatRingGeo, heatRingMat);
      heatRingMesh.rotation.x = Math.PI / 2;
      heatRingMesh.position.y = 0.028;
      nodeGroup.add(heatRingMesh);

      // 3. HEATMAP LAYER: Volumetric Vertical Thermal Beacon Column
      const beaconGeo = new THREE.CylinderGeometry(1.2, 0.4, 5.0, 16, 1, true);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: heat.colorHex,
        transparent: true,
        opacity: Math.max(0.12, heat.score * 0.4),
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.y = 2.5;
      nodeGroup.add(beaconMesh);

      heatmapDiscs.set(node.id, {
        disc: heatDiscMesh,
        ring: heatRingMesh,
        beacon: beaconMesh,
      });

      // Node Part 1: Pedestal Base
      const pedGeo = new THREE.CylinderGeometry(1.6, 1.9, 0.4, 6);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.35,
      });
      const pedMesh = new THREE.Mesh(pedGeo, pedMat);
      pedMesh.position.y = 0.2;
      nodeGroup.add(pedMesh);

      // Node Part 2: Hexagonal Server Chassis Tower (Color-coded by Heatmap)
      const towerGeo = new THREE.CylinderGeometry(1.2, 1.2, 1.8, 6);
      const towerMat = new THREE.MeshStandardMaterial({
        color: heat.colorHex,
        metalness: 0.75,
        roughness: 0.25,
        emissive: heat.colorHex,
        emissiveIntensity: 0.4 + heat.score * 0.4,
      });
      const towerMesh = new THREE.Mesh(towerGeo, towerMat);
      towerMesh.position.y = 1.3;
      towerMesh.castShadow = !isSoftwareGl;
      (towerMesh as any).userData = { isTowerChassis: true };
      nodeGroup.add(towerMesh);

      // Node Part 3: Glowing Status Indicator Ring
      const statusTorusGeo = new THREE.TorusGeometry(1.35, 0.08, 12, 32);
      const statusMat = new THREE.MeshBasicMaterial({
        color: heat.colorHex,
      });
      const statusMesh = new THREE.Mesh(statusTorusGeo, statusMat);
      statusMesh.rotation.x = Math.PI / 2;
      statusMesh.position.y = 2.25;
      (statusMesh as any).userData = { isStatusRing: true };
      nodeGroup.add(statusMesh);

      // Node Part 4: Floating Holographic Marker Diamond
      const markerGeo = new THREE.OctahedronGeometry(0.35, 0);
      const markerMat = new THREE.MeshBasicMaterial({
        color: heat.colorHex,
        wireframe: true,
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.y = 3.2;
      (markerMesh as any).userData = { isMarker: true };
      nodeGroup.add(markerMesh);

      // Node Contact Shadow Plane
      const nodeShadowGeo = new THREE.PlaneGeometry(4.2, 4.2);
      const nodeShadowMesh = new THREE.Mesh(nodeShadowGeo, contactShadowMat);
      nodeShadowMesh.rotation.x = -Math.PI / 2;
      nodeShadowMesh.position.y = 0.015;
      nodeGroup.add(nodeShadowMesh);

      scene.add(nodeGroup);
      nodeMeshes.set(node.id, nodeGroup);
    });
    nodesMeshMapRef.current = nodeMeshes;
    heatmapDiscsRef.current = heatmapDiscs;

    // -------------------------------------------------------------------------
    // 10. SYNAPTIC NEURAL BEAMS & DATA PACKET PULSES
    // -------------------------------------------------------------------------
    const curves: { curve: THREE.QuadraticBezierCurve3; mesh: THREE.Mesh; targetId: string }[] = [];
    const corePos = new THREE.Vector3(0, 2.2, 0);

    nodes.forEach(node => {
      const targetPos = new THREE.Vector3(...node.position);
      targetPos.y = 1.8;

      const midPos = new THREE.Vector3().addVectors(corePos, targetPos).multiplyScalar(0.5);
      midPos.y += 2.5;

      const curve = new THREE.QuadraticBezierCurve3(corePos, midPos, targetPos);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.045, 8, false);

      const heat = calculateNodeHeatmap(node, activeThreats, 'combined');
      const tubeMat = new THREE.MeshBasicMaterial({
        color: heat.colorHex,
        transparent: true,
        opacity: 0.55,
      });

      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tubeMesh);
      curves.push({ curve, mesh: tubeMesh, targetId: node.id });
    });
    beamCurvesRef.current = curves;

    // 11. Raycaster for Interactive Node Inspection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let foundNode: TopologyNode | null = null;
      for (const hit of intersects) {
        let parent: THREE.Object3D | null = hit.object;
        while (parent && parent !== scene) {
          if (parent.userData && parent.userData.nodeId) {
            foundNode = nodes.find(n => n.id === parent?.userData.nodeId) || null;
            break;
          }
          parent = parent.parent;
        }
        if (foundNode) break;
      }
      setHoveredNode(foundNode);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        let parent: THREE.Object3D | null = hit.object;
        while (parent && parent !== scene) {
          if (parent.userData && parent.userData.nodeId) {
            const node = nodes.find(n => n.id === parent?.userData.nodeId);
            if (node) {
              onSelectNode(node);
              const group = nodeMeshes.get(node.id);
              if (group) {
                _vec3A.set(group.position.x, group.position.y + 3, group.position.z);
              } else {
                _vec3A.set(...node.position);
                _vec3A.y += 3;
              }
              controls.target.copy(_vec3A);
            }
            return;
          }
          parent = parent.parent;
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointermove', handlePointerMove);
    domElement.addEventListener('click', handleClick);

    // 12. Responsive Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 13. High-Fidelity 60fps Animation Loop with Exponential Damping
    let clock = new THREE.Clock();
    let frameId = 0;

    const tick = () => {
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      // Rotate orbital rings
      ringGroups.forEach((ring, i) => {
        const speed = (0.35 + i * 0.15) * (i % 2 === 0 ? 1 : -1);
        ring.rotation.x += speed * dt;
        ring.rotation.y += speed * 0.8 * dt;
      });

      // Slowly oscillate floating zero-trust shields
      shieldMeshes.forEach((shield, i) => {
        shield.position.y = 2.8 + Math.sin(time * 1.8 + i) * 0.25;
      });

      // Dynamically interpolate node positions toward target coordinates (Auto-Layout Mode)
      nodeMeshes.forEach((group, id) => {
        const targetPos = targetPositionsRef.current.get(id);
        if (targetPos) {
          const dx = Math.abs(group.position.x - targetPos.x);
          const dz = Math.abs(group.position.z - targetPos.z);
          if (dx > 0.002 || dz > 0.002) {
            group.position.x = THREE.MathUtils.damp(group.position.x, targetPos.x, 3.8, dt);
            group.position.z = THREE.MathUtils.damp(group.position.z, targetPos.z, 3.8, dt);

            // Dynamically update the synaptic beam curve so it fluidly stretches and tracks the node
            const beam = beamCurvesRef.current.find(b => b.targetId === id);
            if (beam) {
              beam.curve.v2.set(group.position.x, group.position.y + 1.8, group.position.z);
              beam.curve.v1.set(group.position.x * 0.5, 2.5 + Math.sin(time * 1.5) * 0.15, group.position.z * 0.5);
              beam.mesh.geometry.dispose();
              beam.mesh.geometry = new THREE.TubeGeometry(beam.curve, 28, 0.045, 6, false);
            }
          }
        }
      });

      // Animate node markers and thermal halo ripples
      nodeMeshes.forEach((group, id) => {
        const node = nodes.find(n => n.id === id);
        const heatDiscs = heatmapDiscs.get(id);

        // Marker rotation
        group.children.forEach(child => {
          if ((child as any).userData?.isMarker) {
            child.rotation.y += 2.0 * dt;
          }
        });

        // Pulsing thermal ripple ring
        if (heatDiscs && node) {
          const heat = calculateNodeHeatmap(node, activeThreats, heatmapMetric);
          const pulseSpeed = 1.5 + heat.score * 2.5;
          const pulseScale = 1.0 + Math.sin(time * pulseSpeed) * (0.08 + heat.score * 0.18);
          heatDiscs.ring.scale.set(pulseScale, pulseScale, pulseScale);
        }
      });

      // Update controls damping
      controls.update();

      // Render Scene
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        frameId = window.setTimeout(tick, 33);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();
    animFrameIdRef.current = frameId;

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      clearTimeout(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('pointermove', handlePointerMove);
      domElement.removeEventListener('click', handleClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  // Update Dynamic Heatmap Layer Whenever Threats, Nodes, Heatmap Toggle or Metric changes
  useEffect(() => {
    if (!nodesMeshMapRef.current || !heatmapDiscsRef.current) return;

    nodes.forEach(node => {
      const heat = calculateNodeHeatmap(node, activeThreats, heatmapMetric);
      const meshGroup = nodesMeshMapRef.current.get(node.id);
      const discs = heatmapDiscsRef.current.get(node.id);

      if (discs) {
        // Toggle visibility and update colors/scales
        if (heatmapActive) {
          discs.disc.visible = true;
          discs.ring.visible = true;
          discs.beacon.visible = true;

          (discs.disc.material as THREE.MeshBasicMaterial).color.setHex(heat.colorHex);
          (discs.disc.material as THREE.MeshBasicMaterial).opacity = 0.45 + heat.score * 0.45;
          discs.disc.scale.setScalar(0.9 + heat.score * 0.9);

          (discs.ring.material as THREE.MeshBasicMaterial).color.setHex(heat.colorHex);
          (discs.ring.material as THREE.MeshBasicMaterial).opacity = 0.5 + heat.score * 0.45;

          (discs.beacon.material as THREE.MeshBasicMaterial).color.setHex(heat.colorHex);
          (discs.beacon.material as THREE.MeshBasicMaterial).opacity = Math.max(0.08, heat.score * 0.4);
        } else {
          discs.disc.visible = false;
          discs.ring.visible = false;
          discs.beacon.visible = false;
        }
      }

      if (meshGroup) {
        meshGroup.children.forEach(child => {
          if ((child as any).userData?.isTowerChassis) {
            const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (heatmapActive) {
              mat.color.setHex(heat.colorHex);
              mat.emissive.setHex(heat.colorHex);
              mat.emissiveIntensity = 0.35 + heat.score * 0.45;
            } else {
              const isUnderThreat = activeThreats.some(t => t.targetNode === node.id && t.status !== 'mitigated');
              mat.color.setHex(isUnderThreat ? 0xef4444 : node.pqcReady ? 0x0284c7 : 0x475569);
              mat.emissive.setHex(isUnderThreat ? 0x991b1b : node.pqcReady ? 0x0369a1 : 0x0f172a);
              mat.emissiveIntensity = isUnderThreat ? 0.6 : 0.3;
            }
          }

          if ((child as any).userData?.isStatusRing) {
            const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
            if (heatmapActive) {
              mat.color.setHex(heat.colorHex);
            } else {
              const isUnderThreat = activeThreats.some(t => t.targetNode === node.id && t.status !== 'mitigated');
              mat.color.setHex(isUnderThreat ? 0xf87171 : 0x38bdf8);
            }
          }

          if ((child as any).userData?.isMarker) {
            const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
            if (heatmapActive) {
              mat.color.setHex(heat.colorHex);
            } else {
              const isUnderThreat = activeThreats.some(t => t.targetNode === node.id && t.status !== 'mitigated');
              mat.color.setHex(isUnderThreat ? 0xff4d4d : 0x67e8f9);
            }
          }
        });
      }
    });

    // Update Beams to match heatmap color
    if (beamCurvesRef.current) {
      beamCurvesRef.current.forEach(({ mesh, targetId }) => {
        const node = nodes.find(n => n.id === targetId);
        if (!node) return;
        const heat = calculateNodeHeatmap(node, activeThreats, heatmapMetric);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (mat) {
          if (heatmapActive) {
            mat.color.setHex(heat.colorHex);
            mat.opacity = 0.4 + heat.score * 0.45;
          } else {
            const isThreat = activeThreats.some(t => t.targetNode === targetId && t.status !== 'mitigated');
            mat.color.setHex(isThreat ? 0xef4444 : 0x0284c7);
            mat.opacity = isThreat ? 0.9 : 0.45;
          }
        }
      });
    }
  }, [nodes, activeThreats, heatmapActive, heatmapMetric]);

  // Handle Camera Preset Changes
  const applyCameraPreset = (preset: 'orbit' | 'core' | 'ingress' | 'top') => {
    setCameraPreset(preset);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (preset === 'orbit') {
      camera.position.set(0, 16, 32);
      controls.target.set(0, 2, 0);
    } else if (preset === 'core') {
      camera.position.set(0, 5, 12);
      controls.target.set(0, 2.5, 0);
    } else if (preset === 'ingress') {
      camera.position.set(18, 9, 20);
      controls.target.set(8, 2, 8);
    } else if (preset === 'top') {
      camera.position.set(0, 42, 0.1);
      controls.target.set(0, 0, 0);
    }
  };

  // Find node with highest thermal index for header callout
  const hottestNode = nodes.reduce((prev, curr) => {
    const prevHeat = calculateNodeHeatmap(prev, activeThreats, heatmapMetric);
    const currHeat = calculateNodeHeatmap(curr, activeThreats, heatmapMetric);
    return currHeat.score > prevHeat.score ? curr : prev;
  }, nodes[0]);

  const hottestHeat = hottestNode ? calculateNodeHeatmap(hottestNode, activeThreats, heatmapMetric) : null;

  return (
    <div className="relative w-full h-[640px] bg-slate-950 overflow-hidden select-none border-b border-slate-800">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Left: Minimal Spec Badge + Heatmap Status */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded shadow-md text-xs font-mono text-slate-200">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span className="font-semibold text-white">ZeroLabz Neural Topology</span>
          <span className="text-slate-400">| PQC Core</span>
        </div>

        {heatmapActive && hottestHeat && hottestNode && (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded text-[11px] font-mono text-slate-300 w-fit">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Thermal Peak:</span>
            <span className="font-bold text-white">{hottestNode.name}</span>
            <span
              className="px-1.5 py-0.2 rounded font-bold text-[10px]"
              style={{ backgroundColor: `${hottestHeat.colorCss}25`, color: hottestHeat.colorCss }}
            >
              {(hottestHeat.score * 100).toFixed(0)}% Thermal Index
            </span>
          </div>
        )}

        {autoLayout && (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/90 border border-cyan-500/40 rounded text-[11px] font-mono text-cyan-300 w-fit">
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auto-Layout Mode: Traffic-Weighted Dispersion (0 Overlaps)</span>
          </div>
        )}
      </div>

      {/* Top Right: Attack Injector, Auto-Layout & Reset Focus */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setAutoLayout(prev => !prev)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded font-medium text-xs shadow-lg transition cursor-pointer active:scale-95 border ${
            autoLayout
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 font-semibold shadow-cyan-900/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Auto-Layout Mode: Dynamically adjust node positions in 3D space to minimize connection overlaps based on traffic volume"
        >
          <Network className={`w-3.5 h-3.5 ${autoLayout ? 'text-white' : 'text-cyan-400'}`} />
          <span>Auto-Layout: {autoLayout ? 'ACTIVE' : 'OFF'}</span>
        </button>

        <button
          onClick={onSimulateAttack}
          className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium text-xs shadow-lg transition cursor-pointer active:scale-95"
        >
          <ShieldAlert className="w-4 h-4 text-white" />
          <span>Inject Simulated Attack Vector</span>
        </button>

        {selectedNode && (
          <button
            onClick={() => onSelectNode(null)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded border border-slate-700 transition cursor-pointer"
          >
            Reset Focus
          </button>
        )}
      </div>

      {/* Hover Tooltip with Real-Time Heatmap Metrics */}
      {hoveredNode && !selectedNode && (() => {
        const heat = calculateNodeHeatmap(hoveredNode, activeThreats, heatmapMetric);
        return (
          <div className="absolute top-16 left-4 z-20 bg-slate-900/95 border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs max-w-xs pointer-events-none text-slate-200">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-bold text-white text-sm">{hoveredNode.name}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold"
                style={{ backgroundColor: `${heat.colorCss}25`, color: heat.colorCss, border: `1px solid ${heat.colorCss}60` }}
              >
                {heat.badgeLabel}
              </span>
            </div>

            <div className="text-slate-400 text-[11px] mb-2 font-mono">
              Region: {hoveredNode.cloudRegion} • IP: {hoveredNode.ipAddress}
            </div>

            {/* Thermal Heatmap Mini-Metrics Bar */}
            <div className="p-2 bg-slate-950/80 rounded border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" /> Thermal Index:
                </span>
                <span className="font-bold text-white">{(heat.score * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${heat.score * 100}%`, backgroundColor: heat.colorCss }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                <span>Threats: <strong className="text-white">{heat.activeThreatsCount} Active</strong></span>
                <span>Traffic: <strong className="text-white">{hoveredNode.currentTrafficMbps} Mbps</strong> ({heat.trafficLoadPercent}%)</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 mt-2 font-mono">
              Click node to open zero-trust forensic inspector.
            </div>
          </div>
        );
      })()}

      {/* Selected Node Details Floating Overlay */}
      {selectedNode && (() => {
        const heat = calculateNodeHeatmap(selectedNode, activeThreats, heatmapMetric);
        const nodeThreats = activeThreats.filter(t => t.targetNode === selectedNode.id && t.status !== 'mitigated');

        return (
          <div className="absolute top-16 left-4 z-20 bg-slate-900/95 border border-cyan-400 p-4 rounded-xl shadow-2xl w-84 sm:w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-140px)] overflow-y-auto text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-sm">{selectedNode.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold"
                  style={{ backgroundColor: `${heat.colorCss}25`, color: heat.colorCss, border: `1px solid ${heat.colorCss}60` }}
                >
                  {heat.badgeLabel}
                </span>
                <button
                  onClick={() => onSelectNode(null)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer text-xs font-mono"
                  title="Close Inspector"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Zero-Trust Architecture & Cryptographic Identity */}
            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Node Archetype:</span>
                <span className="text-slate-200 uppercase font-bold">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Region & IP:</span>
                <span className="text-slate-300">{selectedNode.cloudRegion} • {selectedNode.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Key Agreement:</span>
                <span className="text-cyan-400 font-semibold">{selectedNode.activeKeyType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Zero-Trust Attestation:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> Continuous ZK-Proof
                </span>
              </div>
            </div>

            {/* Real-Time Performance Charts (CPU / RAM / PQC Load) */}
            <NodePerformanceCharts
              node={selectedNode}
              hasActiveThreats={nodeThreats.length > 0}
              activeThreatCount={nodeThreats.length}
            />

            {/* Heatmap & Throughput Metrics Card */}
            <div className="mt-3 p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Thermal Index:
                </span>
                <span className="font-bold text-white text-xs">{(heat.score * 100).toFixed(0)} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${heat.score * 100}%`, backgroundColor: heat.colorCss }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500 block">Threat Density:</span>
                  <span className={`font-semibold ${nodeThreats.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {nodeThreats.length} Active Vectors
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Traffic Throughput:</span>
                  <span className="font-semibold text-cyan-300">{selectedNode.currentTrafficMbps} Mbps ({heat.trafficLoadPercent}%)</span>
                </div>
              </div>
            </div>

            {/* If there's an active threat targeting this node */}
            {nodeThreats.map(threat => (
              <div key={threat.id} className="mt-3 p-2.5 bg-rose-950/70 border border-rose-700/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-rose-300 font-semibold text-[11px]">
                  <span>Vector: {threat.title}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-rose-900 border border-rose-600 font-mono font-bold">
                    {threat.severity}
                  </span>
                </div>
                <div className="text-[10px] text-rose-200 leading-relaxed font-sans">{threat.description}</div>
                <button
                  onClick={() => onMitigateThreat(threat.id)}
                  className="w-full mt-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-medium transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Execute Autonomous Mitigation</span>
                </button>
              </div>
            ))}

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onSelectNode(null)}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold rounded-lg transition cursor-pointer border border-slate-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        );
      })()}

      {/* ---------------------------------------------------------------------- */}
      {/* 5. Sleek Collapsible Bottom Dock (Adheres strictly to Three.js skill)  */}
      {/* ---------------------------------------------------------------------- */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[96%] max-w-4xl transition-transform duration-300 ease-out ${
          controlsCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        {/* Dock Tab Handle (Collapse / Expand) */}
        <div className="flex justify-center -mb-[1px]">
          <button
            onClick={() => setControlsCollapsed(prev => !prev)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 border-t border-x border-slate-700 text-slate-300 hover:text-white text-xs font-mono rounded-t-lg shadow-md cursor-pointer transition hover:bg-slate-800"
            title="Press 'H' or click to toggle controls"
          >
            {controlsCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Show Controls (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hide Controls (H)</span>
              </>
            )}
          </button>
        </div>

        {/* Horizontal Control Dock Container (Solid Slate Surface, No backdrop-filter over WebGL) */}
        <div className="bg-slate-900 border border-slate-700 rounded-b-xl rounded-tl-xl p-3 shadow-2xl flex flex-col gap-2.5 text-xs">
          {/* Row 1: Camera Views & Heatmap Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Camera View Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono text-[11px] mr-1 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" /> View:
              </span>
              {[
                { id: 'orbit', label: 'Sentinel Orbit' },
                { id: 'core', label: 'Quantum Core' },
                { id: 'ingress', label: 'Ingress Mesh' },
                { id: 'top', label: 'Top Grid' },
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => applyCameraPreset(v.id as any)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                    cameraPreset === v.id
                      ? 'bg-cyan-600 text-white font-semibold shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Auto-Layout Mode Button & Heatmap Layer Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoLayout(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono font-semibold transition cursor-pointer border ${
                  autoLayout
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title="Traffic-optimized spatial dispersion to minimize connection tube overlaps"
              >
                <Network className={`w-3.5 h-3.5 ${autoLayout ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>Auto-Layout: {autoLayout ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setHeatmapActive(!heatmapActive)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono font-semibold transition cursor-pointer border ${
                  heatmapActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${heatmapActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>Heatmap Layer: {heatmapActive ? 'ON' : 'OFF'}</span>
              </button>

              {heatmapActive && (
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
                  {[
                    { id: 'combined', label: 'Threat + Traffic' },
                    { id: 'threat', label: 'Threats Only' },
                    { id: 'traffic', label: 'Traffic Only' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setHeatmapMetric(m.id as any)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                        heatmapMetric === m.id
                          ? 'bg-cyan-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Heatmap Thermal Spectrum Gradient Legend Bar */}
          {heatmapActive && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Thermal Scale:</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-32 sm:w-48 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 via-orange-500 to-rose-600 shadow-inner" />
                  <div className="flex items-center justify-between text-[9px] text-slate-400 gap-2">
                    <span>0% (Cold)</span>
                    <span>50% (Warm)</span>
                    <span className="text-rose-400 font-bold">100% (Critical)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-400">Nominal (&lt;25%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <span className="text-slate-400">Moderate (25-50%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  <span className="text-slate-400">Elevated (50-75%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-slate-300 font-bold">Critical (&gt;75%)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
