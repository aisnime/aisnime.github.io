import React, { useState, useMemo } from 'react';
import { 
  Shield, Plus, Activity, Lock, Cpu, Wifi, WifiOff, UserPlus, AlertTriangle, FileSearch, CheckCircle2
} from 'lucide-react';
import NetworkVisualizer from './NetworkVisualizer';
import NodeList from './NodeList';
import ConnectionModal from './ConnectionModal';
import JoinNetworkModal from './JoinNetworkModal';
import ClientRegistrationModal from './ClientRegistrationModal';
import { NetworkNode, NodeType, NodeStatus, AuditReport } from '../types';
import { generateSecurityAudit } from '../services/geminiService';

// Database of simulated locations
const GEO_LOCATIONS = [
  { name: "Jakarta, ID", lat: -6.2088, lng: 106.8456, ipPrefix: "103.21" },
  { name: "Singapore, SG", lat: 1.3521, lng: 103.8198, ipPrefix: "202.80" },
  { name: "London, UK", lat: 51.5074, lng: -0.1278, ipPrefix: "89.10" },
  { name: "New York, US", lat: 40.7128, lng: -74.0060, ipPrefix: "45.33" },
  { name: "Tokyo, JP", lat: 35.6762, lng: 139.6503, ipPrefix: "114.50" },
  { name: "Sydney, AU", lat: -33.8688, lng: 151.2093, ipPrefix: "1.120" },
  { name: "Berlin, DE", lat: 52.5200, lng: 13.4050, ipPrefix: "95.11" },
  { name: "Sao Paulo, BR", lat: -23.5505, lng: -46.6333, ipPrefix: "177.20" },
  { name: "Bangalore, IN", lat: 12.9716, lng: 77.5946, ipPrefix: "122.15" },
  { name: "Toronto, CA", lat: 43.6532, lng: -79.3832, ipPrefix: "24.112" }
];

const getRandomLocation = () => GEO_LOCATIONS[Math.floor(Math.random() * GEO_LOCATIONS.length)];

const INITIAL_NODES: NetworkNode[] = [
  { 
    id: 'local-node-01', 
    type: NodeType.DESKTOP, 
    ip: '127.0.0.1', 
    location: 'Localhost (Dev)',
    lat: -6.2088, // Default Jakarta for local
    lng: 106.8456,
    status: NodeStatus.ACTIVE, 
    contribution: 85,
    dataProcessed: '450 GB',
    totalEarnings: 1240,
    joinedAt: new Date() 
  },
];

const DeveloperDashboard: React.FC = () => {
  const [nodes, setNodes] = useState<NetworkNode[]>(INITIAL_NODES);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  
  const [isOnline, setIsOnline] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const activeNodesCount = nodes.filter(n => n.status === NodeStatus.ACTIVE).length;
  const compromisedCount = nodes.filter(n => n.status === NodeStatus.COMPROMISED).length;
  
  const totalHashRate = useMemo(() => {
    return nodes.reduce((acc, curr) => {
      if (curr.status === NodeStatus.COMPROMISED) return acc;
      if (curr.status === NodeStatus.RECOVERING) return acc + (curr.contribution * 0.5);
      return acc + curr.contribution;
    }, 0);
  }, [nodes]);
  
  const securityLevel = useMemo(() => {
    if (compromisedCount > 0) return { label: 'KRITIS (MALWARE)', color: 'text-red-500', bg: 'bg-red-500/20', width: '100%' };
    if (activeNodesCount < 3) return { label: 'LEMAH', color: 'text-red-500', bg: 'bg-red-500/20', width: '20%' };
    if (activeNodesCount < 6) return { label: 'SEDANG', color: 'text-yellow-500', bg: 'bg-yellow-500/20', width: '50%' };
    if (activeNodesCount < 10) return { label: 'KUAT', color: 'text-cyan-400', bg: 'bg-cyan-500/20', width: '80%' };
    return { label: 'KELAS MILITER', color: 'text-emerald-400', bg: 'bg-emerald-500/20', width: '100%' };
  }, [activeNodesCount, compromisedCount]);

  const handleRegisterNode = (name: string, type: NodeType) => {
    const contribution = Math.floor(Math.random() * 50) + 10;
    const idHash = Math.random().toString(36).substring(2, 10);
    const id = `${name}-${idHash}`;
    const loc = getRandomLocation();
    
    const newNode: NetworkNode = {
      id,
      type: type,
      ip: `${loc.ipPrefix}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
      location: loc.name,
      lat: loc.lat + (Math.random() * 2 - 1), // Slight jitter
      lng: loc.lng + (Math.random() * 2 - 1),
      status: NodeStatus.ACTIVE,
      contribution,
      dataProcessed: '0 GB',
      totalEarnings: 0,
      joinedAt: new Date()
    };

    setNodes(prev => [...prev, newNode]);
  };

  const handleClientRegistration = (clientData: any) => {
    console.log("Client Registered:", clientData);
    alert(`Wallet Identity Generated for ${clientData.name}\nAddress: ${clientData.address}`);
  };

  const handlePublicConnect = () => {
    setIsOnline(true);
    setTimeout(() => {
      // Manually construct to avoid type errors with spread
      const newRemoteNodes: NetworkNode[] = [
        { 
          id: 'validator-sg', 
          type: NodeType.SERVER, 
          ip: '202.80.12.5', 
          location: GEO_LOCATIONS[1].name,
          lat: GEO_LOCATIONS[1].lat,
          lng: GEO_LOCATIONS[1].lng,
          status: NodeStatus.ACTIVE, 
          contribution: 250, 
          dataProcessed: '12.5 TB',
          totalEarnings: 8450,
          joinedAt: new Date() 
        },
        { 
          id: 'node-us-east', 
          type: NodeType.DESKTOP, 
          ip: '45.33.90.11', 
          location: GEO_LOCATIONS[3].name,
          lat: GEO_LOCATIONS[3].lat,
          lng: GEO_LOCATIONS[3].lng,
          status: NodeStatus.ACTIVE, 
          contribution: 120, 
          dataProcessed: '4.2 TB',
          totalEarnings: 3200,
          joinedAt: new Date() 
        },
        { 
          id: 'peer-eu-de', 
          type: NodeType.MOBILE, 
          ip: '95.11.22.4', 
          location: GEO_LOCATIONS[6].name,
          lat: GEO_LOCATIONS[6].lat,
          lng: GEO_LOCATIONS[6].lng,
          status: NodeStatus.ACTIVE, 
          contribution: 45,
          dataProcessed: '850 GB',
          totalEarnings: 150, 
          joinedAt: new Date() 
        }
      ];
      
      // Add randomness to initial connection
      const randomNodes = Array.from({length: 3}).map(() => {
        const loc = getRandomLocation();
         return {
            id: `peer-${Math.random().toString(36).substring(7)}`,
            type: Math.random() > 0.5 ? NodeType.DESKTOP : NodeType.MOBILE,
            ip: `${loc.ipPrefix}.${Math.floor(Math.random()*255)}`,
            location: loc.name,
            lat: loc.lat + (Math.random() * 5 - 2.5),
            lng: loc.lng + (Math.random() * 5 - 2.5),
            status: NodeStatus.ACTIVE,
            contribution: Math.floor(Math.random() * 100),
            dataProcessed: `${(Math.random() * 2).toFixed(1)} TB`,
            totalEarnings: Math.floor(Math.random() * 1000),
            joinedAt: new Date()
         }
      });

      setNodes(prev => [...prev, ...newRemoteNodes, ...randomNodes]);
    }, 500);
  };

  const handleDisconnect = () => {
    setIsOnline(false);
  };

  const handleTriggerAttack = () => {
    const activeNodes = nodes.filter(n => n.status === NodeStatus.ACTIVE);
    if (activeNodes.length === 0) return;
    const targetIndex = Math.floor(Math.random() * activeNodes.length);
    const targetId = activeNodes[targetIndex].id;
    setNodes(prev => prev.map(n => n.id === targetId ? { ...n, status: NodeStatus.COMPROMISED } : n));
  };

  const handleRecoverNode = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, status: NodeStatus.RECOVERING } : n));
    setTimeout(() => {
      setNodes(prev => prev.map(n => n.id === id ? { ...n, status: NodeStatus.ACTIVE } : n));
    }, 3000);
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    const report = await generateSecurityAudit(nodes, totalHashRate);
    setAuditReport(report);
    setIsAuditing(false);
  };

  return (
    <div className="min-h-screen bg-cyber-900 text-gray-300 font-sans selection:bg-cyber-primary selection:text-black pb-12">
      <ConnectionModal 
        isOpen={isConnectionModalOpen} 
        onClose={() => setIsConnectionModalOpen(false)}
        onConnect={handlePublicConnect}
      />
      <JoinNetworkModal 
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onRegister={handleRegisterNode}
      />
      <ClientRegistrationModal 
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onRegister={handleClientRegistration}
      />

      {/* Header */}
      <header className="border-b border-cyber-700 bg-cyber-900/95 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border transition-colors ${compromisedCount > 0 ? 'bg-red-900/30 border-red-500 animate-pulse' : 'bg-cyber-primary/10 border-cyber-primary/30'}`}>
              {compromisedCount > 0 ? <AlertTriangle className="text-red-500 w-6 h-6" /> : <Shield className="text-cyber-primary w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">DesentralShield <span className="text-xs text-cyber-500 bg-cyber-800 px-1 rounded border border-cyber-700 ml-2">DEV CONSOLE</span></h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-gray-500'}`}></span>
                <p className={`text-xs font-mono ${compromisedCount > 0 ? 'text-red-500 font-bold' : 'text-cyber-500'}`}>
                  {isOnline ? 'MAINNET_CONNECTED' : 'LOCAL_SIMULATION'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => isOnline ? handleDisconnect() : setIsConnectionModalOpen(true)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-bold font-mono transition-all
                ${isOnline 
                  ? 'bg-emerald-900/30 border-emerald-600 text-emerald-400 hover:bg-emerald-900/50' 
                  : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white'
                }
              `}
            >
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-cyber-800 border border-cyber-700">
              <Activity size={16} className={compromisedCount > 0 ? "text-red-500" : "text-emerald-400"} />
              <span className={`text-xs font-mono ${compromisedCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
                {activeNodesCount} AKTIF
              </span>
            </div>

            <button onClick={() => setIsClientModalOpen(true)} className="p-2 rounded bg-purple-900/40 border border-purple-500/50 text-purple-300 hover:bg-purple-900/60 transition-all">
               <UserPlus size={18} />
            </button>

            <button 
              onClick={() => setIsJoinModalOpen(true)}
              className="flex items-center gap-2 bg-cyber-primary hover:bg-cyan-400 text-cyber-900 px-4 py-2 rounded font-bold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Node</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8 pb-12 space-y-6">
        
        {/* Top Section: Map (Left) + Stats (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[500px]">
          
          {/* Map Area (Left - 75%) */}
          <div className="lg:col-span-9 h-[400px] lg:h-full">
            <div className={`bg-cyber-800 border rounded-lg p-1 h-full transition-colors ${compromisedCount > 0 ? 'border-red-500/30' : 'border-cyber-700'}`}>
                <NetworkVisualizer nodes={nodes} />
            </div>
          </div>

          {/* Stats Column (Right - 25%) */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full">
            
            {/* Stat 1: Strength */}
            <div className={`bg-cyber-800 border p-4 rounded-lg relative overflow-hidden group transition-colors flex-1 flex flex-col justify-center ${compromisedCount > 0 ? 'border-red-500/50' : 'border-cyber-700'}`}>
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Cpu size={40} className={compromisedCount > 0 ? "text-red-500" : "text-white"} />
              </div>
              <p className="text-cyber-500 text-xs font-mono uppercase mb-1">Kekuatan Jaringan</p>
              <div className={`text-2xl font-bold font-mono ${compromisedCount > 0 ? 'text-red-400' : 'text-white'}`}>
                {totalHashRate} <span className="text-sm text-cyber-500">MH/s</span>
              </div>
              <div className="mt-2 h-1 bg-cyber-700 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${compromisedCount > 0 ? 'bg-red-500' : 'bg-cyber-primary'}`} style={{ width: `${Math.min(totalHashRate / 5, 100)}%` }}></div>
              </div>
            </div>

            {/* Stat 2: Encryption */}
            <div className={`bg-cyber-800 border p-4 rounded-lg relative overflow-hidden transition-colors flex-1 flex flex-col justify-center ${compromisedCount > 0 ? 'border-red-500/50 bg-red-900/10' : 'border-cyber-700'}`}>
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Lock size={40} />
              </div>
              <p className="text-cyber-500 text-xs font-mono uppercase mb-1">Tingkat Enkripsi</p>
              <div className={`text-xl font-bold font-mono ${securityLevel.color}`}>
                {securityLevel.label}
              </div>
              <div className="mt-2 h-1 bg-cyber-700 rounded-full overflow-hidden">
                <div className={`h-full ${securityLevel.bg.replace('/20', '')} transition-all duration-1000`} style={{ width: securityLevel.width }}></div>
              </div>
            </div>

            {/* Stat 3: Audit Button */}
            <div className="bg-cyber-800 border border-cyber-700 p-4 rounded-lg relative overflow-hidden cursor-pointer hover:border-cyber-primary transition-colors flex-1 flex flex-col justify-center" onClick={handleAudit}>
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <FileSearch size={40} />
              </div>
              <p className="text-cyber-500 text-xs font-mono uppercase mb-1">Audit Keamanan AI</p>
              <div className="text-lg font-bold text-white flex items-center gap-2 mt-1">
                 {isAuditing ? 'Menganalisis...' : 'Jalankan Audit'}
              </div>
              <p className="text-xs text-cyber-400 mt-1">Powered by Gemini</p>
            </div>

          </div>
        </div>

        {/* Middle Section: Node List (Bottom of Map) */}
        <div className="w-full h-[400px]">
          <NodeList 
            nodes={nodes} 
            onRecoverNode={handleRecoverNode} 
            onTriggerAttack={handleTriggerAttack}
          />
        </div>

        {/* Bottom Section: Reports Only (Removed Incentive Layer) */}
        {auditReport && (
           <div className="mt-6">
                <div className={`border rounded-lg p-6 animate-fade-in relative overflow-hidden ${auditReport.securityScore < 50 ? 'bg-red-950/20 border-red-500/30' : 'bg-cyber-900 border-cyber-600'}`}>
                   <div className={`absolute top-0 left-0 w-1 h-full ${auditReport.securityScore < 50 ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                   <div className="flex justify-between items-start mb-4">
                     <h3 className={`${auditReport.securityScore < 50 ? 'text-red-400' : 'text-indigo-400'} font-bold font-mono flex items-center gap-2`}>
                       <FileSearch size={20} />
                       LAPORAN AUDIT
                     </h3>
                     <div className={`text-2xl font-bold ${auditReport.securityScore < 50 ? 'text-red-500' : 'text-white'}`}>{auditReport.securityScore}/100</div>
                   </div>
                   <div className="space-y-4">
                     <div className={`${auditReport.securityScore < 50 ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'} p-4 rounded border`}>
                       <p className="text-sm leading-relaxed">"{auditReport.analysis}"</p>
                     </div>
                     <div>
                       <h4 className="text-xs font-mono text-cyber-500 uppercase mb-2">Rekomendasi Sistem:</h4>
                       <ul className="space-y-2">
                         {Array.isArray(auditReport.recommendations) && auditReport.recommendations.map((rec, idx) => (
                           <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                             <CheckCircle2 size={14} className={`${auditReport.securityScore < 50 ? 'text-red-500' : 'text-emerald-500'} mt-1 shrink-0`} />
                             <span>{rec}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   </div>
                </div>
           </div>
        )}

      </main>
    </div>
  );
};

export default DeveloperDashboard;