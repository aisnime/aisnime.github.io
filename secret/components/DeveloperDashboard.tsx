import React, { useState, useMemo } from 'react';
import { 
  Shield, Plus, Activity, Lock, Cpu, Wifi, WifiOff, AlertTriangle, FileSearch, CheckCircle2, Globe, Clock, Database, CreditCard, Download, Send, BarChart3, Network, ArrowLeftRight, Zap, Server
} from 'lucide-react';
import NetworkVisualizer from './NetworkVisualizer';
import NodeList from './NodeList';
import JoinNetworkModal from './JoinNetworkModal';
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

interface Props {
  onOpenMinerDashboard: () => void;
}

const DeveloperDashboard: React.FC<Props> = ({ onOpenMinerDashboard }) => {
  const [nodes, setNodes] = useState<NetworkNode[]>(INITIAL_NODES);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  
  const [isOnline, setIsOnline] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // State to control layout swapping (MAP_MAIN vs STATS_MAIN)
  const [viewMode, setViewMode] = useState<'MAP_MAIN' | 'STATS_MAIN'>('MAP_MAIN');

  const activeNodesCount = nodes.filter(n => n.status === NodeStatus.ACTIVE).length;
  const compromisedCount = nodes.filter(n => n.status === NodeStatus.COMPROMISED).length;
  
  // Mock Client Data
  const clientData = {
    ip: '192.168.1.105',
    location: 'Jakarta, Indonesia',
    durationLeft: '14 Jam 30 Menit',
    dataSent: '45.2 GB',
    dataEncrypted: '45.2 GB',
    escrowBalance: 'Rp 2.500.000',
    transactionId: 'TX-8921-BF'
  };

  const totalHashRate = useMemo(() => {
    return nodes.reduce((acc, curr) => {
      if (curr.status === NodeStatus.COMPROMISED) return acc;
      if (curr.status === NodeStatus.RECOVERING) return acc + (curr.contribution * 0.5);
      return acc + curr.contribution;
    }, 0);
  }, [nodes]);
  
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

  const handlePublicConnect = () => {
    setIsOnline(true);
    setTimeout(() => {
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
      
      const randomNodes = Array.from({length: 47}).map(() => {
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

  // -- Sub-Components for Layout Swapping --

  const MapComponent = ({ isSmall = false }: { isSmall?: boolean }) => (
    <div className={`relative h-full bg-cyber-800 border rounded-lg p-1 transition-all duration-500 overflow-hidden
      ${compromisedCount > 0 ? 'border-red-500/30' : 'border-cyber-700'}
      ${isSmall ? 'cursor-pointer group hover:border-cyber-primary' : ''}
    `}
    onClick={() => isSmall && setViewMode('MAP_MAIN')}
    >
        <NetworkVisualizer nodes={nodes} />
        {isSmall && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <div className="flex items-center gap-2 text-white font-bold bg-black/50 px-4 py-2 rounded border border-white/20">
               <ArrowLeftRight size={16} /> Switch to Map View
            </div>
          </div>
        )}
    </div>
  );

  const StatsComponent = ({ isSmall = false }: { isSmall?: boolean }) => (
    <div 
      className={`bg-cyber-800 border rounded-lg relative overflow-hidden transition-all duration-500 flex flex-col
        ${compromisedCount > 0 ? 'border-red-500/50 bg-red-900/10' : 'border-cyber-700'}
        ${isSmall ? 'p-4 cursor-pointer group hover:border-cyber-primary justify-center' : 'p-6 h-full'}
      `}
      onClick={() => isSmall && setViewMode('STATS_MAIN')}
    >
       {/* Content based on size */}
       {isSmall ? (
         // SMALL VIEW
         <>
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <BarChart3 size={40} />
            </div>
            <p className="text-cyber-500 text-xs font-mono uppercase mb-2 flex items-center gap-2">
               <Network size={14} /> Statistik Jaringan
            </p>
            <div className="space-y-2">
               <div className="flex justify-between items-end">
                  <span className="text-xs text-gray-400">Total Traffic</span>
                  <span className="text-sm font-bold text-white font-mono">45.2 TB</span>
               </div>
               <div className="flex justify-between items-end">
                  <span className="text-xs text-gray-400">Latency</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">24ms</span>
               </div>
            </div>
            <div className="mt-3 text-[10px] text-cyber-500 text-center border-t border-white/5 pt-2 flex items-center justify-center gap-1 group-hover:text-cyber-primary transition-colors">
               <ArrowLeftRight size={10} /> Click to Expand Details
            </div>
         </>
       ) : (
         // EXPANDED VIEW
         <div className="h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     <Activity className="text-cyber-primary" />
                     Statistik Jaringan & Data
                  </h2>
                  <p className="text-xs text-gray-400 font-mono mt-1">Real-time Deep Packet Inspection</p>
               </div>
               <div className="flex gap-2">
                  <span className="px-2 py-1 rounded bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-xs font-mono">TLS 1.3 ENCRYPTED</span>
                  <span className="px-2 py-1 rounded bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-mono">P2P MESH</span>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
               <div className="bg-black/30 p-4 rounded border border-cyber-700">
                  <div className="text-xs text-gray-500 uppercase mb-1">Total Bandwidth</div>
                  <div className="text-2xl font-bold text-white font-mono">45.2 <span className="text-sm text-gray-500">TB</span></div>
                  <div className="h-1 w-full bg-gray-800 mt-2 rounded-full overflow-hidden">
                     <div className="h-full bg-purple-500 w-[75%] animate-pulse"></div>
                  </div>
               </div>
               <div className="bg-black/30 p-4 rounded border border-cyber-700">
                  <div className="text-xs text-gray-500 uppercase mb-1">Avg. Latency</div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">24 <span className="text-sm text-emerald-600">ms</span></div>
                  <div className="h-1 w-full bg-gray-800 mt-2 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[90%]"></div>
                  </div>
               </div>
               <div className="bg-black/30 p-4 rounded border border-cyber-700">
                  <div className="text-xs text-gray-500 uppercase mb-1">Packet Loss</div>
                  <div className="text-2xl font-bold text-white font-mono">0.01 <span className="text-sm text-gray-500">%</span></div>
                  <div className="h-1 w-full bg-gray-800 mt-2 rounded-full overflow-hidden">
                     <div className="h-full bg-cyber-primary w-[2%]"></div>
                  </div>
               </div>
            </div>

            <div className="flex-1 bg-black/20 border border-cyber-700 rounded p-4 overflow-hidden relative flex flex-col">
               <h3 className="text-xs font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <Server size={14} /> Traffic Distribution
               </h3>
               {/* Fake Chart Visualization */}
               <div className="flex-1 flex items-end justify-between gap-2 px-2">
                  {[40, 65, 30, 80, 55, 90, 45, 70, 35, 60, 25, 50, 85, 40, 60].map((h, i) => (
                     <div key={i} className="w-full bg-cyber-800 rounded-t relative group">
                        <div 
                           className="absolute bottom-0 left-0 right-0 bg-cyber-primary/50 group-hover:bg-cyber-primary transition-colors rounded-t"
                           style={{ height: `${h}%` }}
                        ></div>
                     </div>
                  ))}
               </div>
               <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-2 border-t border-white/5 pt-1">
                  <span>00:00</span>
                  <span>12:00</span>
                  <span>24:00</span>
               </div>
            </div>
         </div>
       )}
    </div>
  );

  return (
    <div className="min-h-screen bg-cyber-900 text-gray-300 font-sans selection:bg-cyber-primary selection:text-black pb-12">
      {/* JoinNetworkModal Removed in favor of new Dashboard page */}
      {/* <JoinNetworkModal 
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onRegister={handleRegisterNode}
      /> */}

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
              onClick={() => isOnline ? handleDisconnect() : handlePublicConnect()}
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

            <button 
              onClick={onOpenMinerDashboard}
              className="flex items-center gap-2 bg-cyber-primary hover:bg-cyan-400 text-cyber-900 px-4 py-2 rounded font-bold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Join as Node</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8 pb-12 space-y-6">
        
        {/* Dynamic Layout Grid: Map & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[500px]">
          
          {/* MAIN AREA (Left - 75%) */}
          <div className="lg:col-span-9 h-[400px] lg:h-full">
             {viewMode === 'MAP_MAIN' ? (
                <MapComponent isSmall={false} />
             ) : (
                <StatsComponent isSmall={false} />
             )}
          </div>

          {/* SIDEBAR (Right - 25%) */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full">
            
            {/* Stat 1: Strength (Static) */}
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

            {/* Slot 2: Swappable Component (Map or Stats) */}
            <div className="flex-1">
              {viewMode === 'MAP_MAIN' ? (
                <StatsComponent isSmall={true} />
              ) : (
                <MapComponent isSmall={true} />
              )}
            </div>

            {/* Stat 3: Audit Button (Static) */}
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

        {/* Middle Section: Client Details & Node List */}
        <div className="w-full space-y-6">
          
          {/* Client Details */}
          <div className="bg-cyber-800 border border-cyber-700 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-purple-400" />
              <h3 className="text-sm font-bold text-white">Detail Client (Requester)</h3>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-black/30 p-3 rounded border border-cyber-700">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1"><Globe size={10}/> Network Origin</div>
                    <div className="text-xs font-mono text-white">{clientData.ip}</div>
                    <div className="text-[10px] text-gray-400">{clientData.location}</div>
                </div>
                <div className="bg-black/30 p-3 rounded border border-cyber-700">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1"><Clock size={10}/> Sisa Durasi</div>
                    <div className="text-xs font-mono text-yellow-400">{clientData.durationLeft}</div>
                    <div className="text-[10px] text-gray-400">Layanan Premium</div>
                </div>
                <div className="bg-black/30 p-3 rounded border border-cyber-700">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1"><Database size={10}/> Data Traffic</div>
                    <div className="flex justify-between items-end">
                        <div className="text-xs font-mono text-blue-300">In: {clientData.dataSent}</div>
                        <div className="text-[10px] text-gray-400">Enc: {clientData.dataEncrypted}</div>
                    </div>
                </div>
                <div className="bg-black/30 p-3 rounded border border-cyber-700">
                    <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1"><CreditCard size={10}/> Escrow Bank</div>
                    <div className="text-xs font-mono text-emerald-400 font-bold">{clientData.escrowBalance}</div>
                    <div className="text-[10px] text-gray-400 flex justify-between items-center mt-1">
                        <span>Locked</span>
                        <span className="font-mono text-[9px] text-gray-500 bg-black/50 px-1 rounded border border-gray-800">{clientData.transactionId}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button className="flex-1 bg-cyber-700 hover:bg-cyber-600 text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                    <Download size={14} /> Download Laporan
                </button>
                <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
                    <Send size={14} /> Kirim ke Client
                </button>
            </div>
          </div>

          {/* Node List */}
          <div className="h-[400px]">
            <NodeList 
              nodes={nodes} 
              onRecoverNode={handleRecoverNode} 
              onTriggerAttack={handleTriggerAttack}
            />
          </div>
        </div>

        {/* Bottom Section: Reports Only */}
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