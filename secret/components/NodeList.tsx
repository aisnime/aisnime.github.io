import React from 'react';
import { NetworkNode, NodeStatus } from '../types';
import { Server, Smartphone, Monitor, Cpu, Wifi, Skull, RefreshCw, Zap, ShieldAlert, MapPin, Globe } from 'lucide-react';

interface Props {
  nodes: NetworkNode[];
  onRecoverNode: (id: string) => void;
  onTriggerAttack: () => void;
}

const NodeList: React.FC<Props> = ({ nodes, onRecoverNode, onTriggerAttack }) => {
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'Smartphone': return <Smartphone size={14} />;
      case 'Server Node': return <Server size={14} />;
      case 'Workstation': return <Monitor size={14} />;
      default: return <Cpu size={14} />;
    }
  };

  const compromisedCount = nodes.filter(n => n.status === NodeStatus.COMPROMISED).length;

  return (
    <div className="bg-cyber-800 border border-cyber-700 rounded-lg h-full overflow-hidden flex flex-col relative">
      
      {/* Header Section */}
      <div className="p-4 pb-2 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-100 font-semibold font-mono flex items-center gap-2">
              <Wifi size={18} className="text-cyber-primary" />
              Perangkat Terhubung
            </h3>
            
            <button 
              onClick={onTriggerAttack}
              className="flex items-center gap-1 bg-red-900/30 hover:bg-red-900/60 text-red-400 border border-red-800/50 px-2 py-1 rounded text-[10px] font-bold transition-colors"
              title="Simulasikan Serangan Malware ke Node Acak"
            >
              <Zap size={12} />
              SIMULASI SERANGAN
            </button>
          </div>

          {compromisedCount > 0 && (
            <div className="mb-2 bg-red-500/10 border border-red-500/50 p-2 rounded flex items-start gap-2 animate-pulse">
              <ShieldAlert size={16} className="text-red-500 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-red-400">PERINGATAN KEAMANAN</div>
                <div className="text-[10px] text-red-300">{compromisedCount} Node terdeteksi malware! Segera lakukan pemulihan.</div>
              </div>
            </div>
          )}
      </div>

      {/* Scrollable Node List */}
      <div className="flex-1 overflow-y-auto space-y-2 px-4 py-4">
        {nodes.length === 0 && (
          <div className="text-center text-cyber-500 py-8 text-sm">
            Belum ada perangkat terhubung.
          </div>
        )}
        {nodes.slice().reverse().map((node) => (
          <div 
            key={node.id} 
            className={`px-3 py-2 rounded border transition-all group relative overflow-hidden flex items-center gap-3
              ${node.status === NodeStatus.COMPROMISED 
                ? 'bg-red-950/40 border-red-500' 
                : node.status === NodeStatus.RECOVERING
                  ? 'bg-purple-900/20 border-purple-500'
                  : 'bg-cyber-900/50 border-cyber-700 hover:border-cyber-primary'
              }
            `}
          >
            {/* Status Bar Indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 
              ${node.status === NodeStatus.ACTIVE ? 'bg-emerald-500' : ''}
              ${node.status === NodeStatus.SYNCING ? 'bg-amber-500' : ''}
              ${node.status === NodeStatus.COMPROMISED ? 'bg-red-600 animate-pulse' : ''}
              ${node.status === NodeStatus.RECOVERING ? 'bg-purple-500 animate-pulse' : ''}
            `}></div>

            {/* COL 1: Identity (Icon + ID) */}
            <div className="flex items-center gap-3 min-w-[100px]">
                <div className={`shrink-0 ${node.status === NodeStatus.COMPROMISED ? 'text-red-400' : 'text-cyber-500 group-hover:text-cyber-primary'}`}>
                    {node.status === NodeStatus.COMPROMISED ? <Skull size={16} /> : getIcon(node.type)}
                </div>
                <span className="font-mono font-bold text-xs text-gray-200 truncate" title={node.id}>{node.id}</span>
            </div>

            {/* COL 2: Network Info */}
            <div className="flex items-center gap-2 flex-1 border-l border-white/5 pl-3 overflow-hidden">
                {/* Device Type Badge */}
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0
                    ${node.status === NodeStatus.COMPROMISED 
                        ? 'bg-red-900/30 border-red-500/50 text-red-400' 
                        : 'bg-cyber-800 border-cyber-600 text-cyber-400'
                    }`}>
                    {node.type}
                </span>

                <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
                    <Globe size={10} className="text-emerald-500 opacity-70"/>
                    <span className="font-mono">{node.ip}</span>
                </div>
                <span className="text-cyber-600/50 text-[10px] shrink-0">|</span>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 truncate min-w-0">
                    <MapPin size={10} className="opacity-70 text-cyber-500"/>
                    <span className="truncate">{node.location || 'Unknown'}</span>
                </div>
            </div>

            {/* COL 3: Stats (Hash, Data, Earn) */}
            <div className="flex items-center gap-4 px-3 border-l border-white/5 hidden lg:flex">
                {/* Hashrate */}
                <div className="flex flex-col items-end min-w-[50px]">
                    <span className="text-[8px] text-cyber-600 font-bold uppercase">Hash</span>
                    <span className="font-mono text-[10px] text-gray-200">{node.contribution} <span className="text-[8px] text-gray-500">MH/s</span></span>
                </div>

                {/* Data */}
                <div className="flex flex-col items-end min-w-[50px]">
                    <span className="text-[8px] text-cyber-600 font-bold uppercase">Data</span>
                    <span className="font-mono text-[10px] text-blue-300">{node.dataProcessed || '0'}</span>
                </div>

                {/* Revenue */}
                <div className="flex flex-col items-end min-w-[60px]">
                    <span className="text-[8px] text-cyber-600 font-bold uppercase">Earn</span>
                    <span className="font-mono text-[10px] text-emerald-400">{node.totalEarnings} <span className="text-[8px] text-emerald-600">DST</span></span>
                </div>
            </div>

            {/* COL 4: Action/Status Badge */}
            <div className="pl-2 flex justify-end min-w-[90px]">
                {node.status === NodeStatus.COMPROMISED ? (
                  <button 
                    onClick={() => onRecoverNode(node.id)}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold animate-bounce shadow-lg shadow-red-600/20 whitespace-nowrap"
                  >
                    <RefreshCw size={10} /> PULIHKAN
                  </button>
                ) : node.status === NodeStatus.RECOVERING ? (
                  <span className="flex items-center gap-1 text-[10px] text-purple-400 font-mono bg-purple-900/30 px-2 py-1 rounded border border-purple-500/30">
                    <RefreshCw size={10} className="animate-spin" /> PATCHING
                  </span>
                ) : (
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 whitespace-nowrap
                     ${node.status === NodeStatus.ACTIVE ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'bg-amber-900/30 text-amber-400 border border-amber-500/30'}
                  `}>
                      <div className={`w-1.5 h-1.5 rounded-full ${node.status === NodeStatus.ACTIVE ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                      {node.status}
                  </div>
                )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default NodeList;