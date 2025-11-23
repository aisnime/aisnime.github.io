import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Shield, ArrowLeft, Play, Power, Activity, Server, Wifi, HardDrive, Zap, CheckCircle2 } from 'lucide-react';
import { NodeType } from '../types';

interface Props {
  onBack: () => void;
}

const MinerDashboard: React.FC<Props> = ({ onBack }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [hashrate, setHashrate] = useState(0);
  const [nodeType, setNodeType] = useState<NodeType>(NodeType.DESKTOP);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const activeLogs = [
    "Initializing cryptographic handshake...",
    "Verifying ledger integrity (Block #89210)...",
    "Loading consensus engine (PoS + PoH)...",
    "Allocating local resources...",
    "Connecting to bootstrap nodes [104.21.55.2]...",
    "Peer discovery started...",
    "Swarm connection established.",
    "Syncing headers... 100%",
    "NODE ONLINE: Ready to validate."
  ];

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setHashrate(prev => {
            const fluctuation = Math.random() * 2 - 1;
            return Math.max(10, Math.min(prev + fluctuation, 95));
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const toggleConnection = () => {
    if (isConnected) {
      setIsConnected(false);
      setHashrate(0);
      setLogs(prev => [...prev, "Stopping node services...", "Disconnected."]);
      return;
    }

    setIsConnecting(true);
    setLogs([]);
    let step = 0;

    const interval = setInterval(() => {
      if (step >= activeLogs.length) {
        clearInterval(interval);
        setIsConnecting(false);
        setIsConnected(true);
        setHashrate(45.5);
      } else {
        setLogs(prev => [...prev, `> ${activeLogs[step]}`]);
        step++;
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col md:flex-row gap-4">
      
      {/* Sidebar / Configuration */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="bg-gray-900 border border-green-900/50 p-6 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Server size={100} />
          </div>
          
          <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors text-xs uppercase tracking-widest">
            <ArrowLeft size={14} /> Kembali ke Dev Console
          </button>

          <h1 className="text-2xl font-bold text-white mb-1 tracking-tighter">NODE UPLINK</h1>
          <p className="text-xs text-green-600 mb-8">v2.4.0-stable build</p>

          <div className="space-y-6">
            <div>
              <label className="text-xs text-gray-400 block mb-2 uppercase">Device Configuration</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setNodeType(NodeType.DESKTOP)}
                  className={`p-3 border rounded flex flex-col items-center justify-center gap-2 transition-all ${nodeType === NodeType.DESKTOP ? 'border-green-500 bg-green-900/20 text-white' : 'border-gray-800 text-gray-600'}`}
                >
                  <Cpu size={20} />
                  <span className="text-[10px]">GPU WORKER</span>
                </button>
                <button 
                  onClick={() => setNodeType(NodeType.SERVER)}
                  className={`p-3 border rounded flex flex-col items-center justify-center gap-2 transition-all ${nodeType === NodeType.SERVER ? 'border-green-500 bg-green-900/20 text-white' : 'border-gray-800 text-gray-600'}`}
                >
                  <HardDrive size={20} />
                  <span className="text-[10px]">STORAGE NODE</span>
                </button>
              </div>
            </div>

            <div className="bg-black/40 p-4 rounded border border-gray-800">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs text-gray-400">Wallet Address</span>
                 <span className="text-[10px] text-green-600 bg-green-900/20 px-2 rounded">CONNECTED</span>
               </div>
               <div className="font-mono text-xs text-white truncate">0x71C...92F</div>
            </div>

            <button 
              onClick={toggleConnection}
              disabled={isConnecting}
              className={`w-full py-4 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]
                ${isConnected 
                  ? 'bg-red-900/20 border border-red-600 text-red-500 hover:bg-red-900/40' 
                  : 'bg-green-600 text-black hover:bg-green-500'}
              `}
            >
              {isConnecting ? (
                <span className="animate-pulse">INITIALIZING...</span>
              ) : isConnected ? (
                <><Power size={18} /> DISCONNECT NODE</>
              ) : (
                <><Play size={18} /> START NODE UPLINK</>
              )}
            </button>
          </div>
        </div>

        {/* Mini Stats (Only visible when connected) */}
        <div className={`grid grid-cols-2 gap-4 transition-opacity duration-500 ${isConnected ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
           <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
              <div className="text-[10px] text-gray-500 uppercase mb-1">Hashrate</div>
              <div className="text-xl text-white font-bold">{hashrate.toFixed(1)} <span className="text-xs font-normal text-gray-400">MH/s</span></div>
           </div>
           <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
              <div className="text-[10px] text-gray-500 uppercase mb-1">Uptime</div>
              <div className="text-xl text-white font-bold">00:04:12</div>
           </div>
        </div>
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-4 flex flex-col font-mono relative overflow-hidden">
         {/* CRT Scanline Effect */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
         
         {/* Terminal Header */}
         <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
            <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-red-900"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-900"></div>
               <div className="w-3 h-3 rounded-full bg-green-900"></div>
            </div>
            <div className="text-xs text-gray-600 flex items-center gap-2">
               <Wifi size={12} className={isConnected ? "text-green-600" : "text-gray-600"} />
               {isConnected ? "CONNECTED - PORT 30303" : "OFFLINE"}
            </div>
         </div>

         {/* Logs Output */}
         <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 pb-4 relative z-0">
            <div className="text-gray-500 mb-4">
               DesentralShield Node Core [Version 2.4.1]<br/>
               (c) 2024 DesentralShield Foundation. All rights reserved.<br/>
               Type 'help' for a list of commands.<br/>
            </div>
            
            {logs.map((log, i) => (
              <div key={i} className={`break-all ${log.includes('ERROR') ? 'text-red-500' : 'text-green-500/80'}`}>
                {log}
              </div>
            ))}
            
            {isConnected && (
               <div className="animate-pulse text-green-500">_</div>
            )}
            <div ref={logsEndRef} />
         </div>

         {/* Active Visualizer (Fake Graph) */}
         {isConnected && (
            <div className="h-32 border-t border-gray-800 mt-2 pt-2 flex items-end justify-between gap-1 opacity-50">
               {Array.from({length: 40}).map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-green-500/50 transition-all duration-300" 
                    style={{ height: `${Math.random() * 100}%` }}
                  ></div>
               ))}
            </div>
         )}
      </div>

    </div>
  );
};

export default MinerDashboard;