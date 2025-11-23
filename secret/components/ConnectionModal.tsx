import React, { useState, useEffect } from 'react';
import { Globe, Server, Shield, Wifi, X, Terminal, Check, Settings, Network, Key, Hash, Zap, Home, HardDrive } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

const ConnectionModal: React.FC<Props> = ({ isOpen, onClose, onConnect }) => {
  const [mode, setMode] = useState<'SIMPLE' | 'ADVANCED'>('SIMPLE');
  
  // Advanced State
  const [rpcUrl, setRpcUrl] = useState('https://mainnet.infura.io/v3/YOUR-API-KEY');
  const [chainId, setChainId] = useState('1');
  const [wsUrl, setWsUrl] = useState('wss://mainnet.infura.io/ws/v3/YOUR-API-KEY');
  
  // Connection Simulation State
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'SUCCESS'>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStatus('IDLE');
      setLogs([]);
    }
  }, [isOpen]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const fillLocalHost = () => {
    setRpcUrl('http://127.0.0.1:8545');
    setChainId('1337'); // Standard Local Devnet ID
    setWsUrl('ws://127.0.0.1:8545');
  };

  const handleConnect = () => {
    setStatus('CONNECTING');
    setLogs([]);
    
    // Check if connecting to localhost to change simulation logs
    const isLocal = rpcUrl.includes('127.0.0.1') || rpcUrl.includes('localhost');

    // Simulation sequence based on selected mode
    const steps = mode === 'SIMPLE' ? [
      { msg: `Resolving host auto-configuration...`, delay: 500 },
      { msg: "Connecting to DesentralShield Gateway...", delay: 1200 },
      { msg: "Handshaking with nearest peer...", delay: 2000 },
      { msg: "Connection Established.", delay: 3000 }
    ] : [
      { msg: `Initializing JSON-RPC Provider at ${rpcUrl.substring(0, 25)}...`, delay: 500 },
      { msg: isLocal ? "Detecting Local Geth/Erigon instance..." : "Resolving DNS for Remote Endpoint...", delay: 1000 },
      { msg: `Validating Chain ID: ${chainId} ${isLocal ? '(Local Devnet)' : '(Mainnet)'}...`, delay: 1500 },
      { msg: isLocal ? "Direct IPC/HTTP connection successful (0ms latency)" : "Opening WebSocket Secure (WSS) channel...", delay: 2200 },
      { msg: "Verifying Block Header...", delay: 2800 },
      { msg: "RPC Connection State: ACTIVE", delay: 3500 }
    ];

    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex >= steps.length) {
        clearInterval(interval);
        setStatus('SUCCESS');
        setTimeout(() => {
          onConnect();
          onClose();
        }, 1000);
        return;
      }

      const currentStep = steps[stepIndex];
      addLog(`> ${currentStep.msg}`);
      stepIndex++;
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cyber-900 border border-cyber-600 rounded-lg w-full max-w-lg shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-cyber-800 p-4 border-b border-cyber-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-white font-bold">
            <Globe size={18} className="text-cyber-primary" />
            <h3>Network Uplink</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        {status === 'IDLE' && (
          <div className="flex border-b border-cyber-700 bg-cyber-900/50">
            <button 
              onClick={() => setMode('SIMPLE')}
              className={`flex-1 py-3 text-xs font-bold font-mono transition-colors border-b-2 ${mode === 'SIMPLE' ? 'border-cyber-primary text-cyber-primary bg-cyber-800' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              MODE AUTOMATIC
            </button>
            <button 
              onClick={() => setMode('ADVANCED')}
              className={`flex-1 py-3 text-xs font-bold font-mono transition-colors border-b-2 ${mode === 'ADVANCED' ? 'border-emerald-500 text-emerald-400 bg-cyber-800' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              MODE DEVELOPER (RPC)
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {status === 'IDLE' ? (
            <>
              {mode === 'SIMPLE' ? (
                /* SIMPLE MODE UI */
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-cyber-800 rounded border border-cyber-700 flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-cyber-900 border border-cyber-600 flex items-center justify-center">
                       <Wifi size={32} className="text-cyber-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Quick Connect</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Terhubung otomatis ke node publik terdekat. Cocok untuk pengguna umum.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-900/10 border border-emerald-500/20 p-3 rounded flex gap-3">
                    <Shield className="text-emerald-500 shrink-0" size={20} />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400">Secure Protocol</h4>
                      <p className="text-[10px] text-emerald-200/70 mt-1">
                        Koneksi dienkripsi menggunakan TLS 1.3. IP Anda disamarkan melalui jaringan mesh.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ADVANCED MODE UI - ANSWERING THE USER'S QUESTION */
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-start gap-4 mb-4">
                     <div className="bg-blue-900/10 border border-blue-500/20 p-3 rounded flex-1">
                        <p className="text-[10px] text-blue-200">
                          <strong>Custom RPC:</strong> Gunakan URL node Anda sendiri untuk privasi total. Anda bisa menjalankan node di server pribadi atau komputer lokal.
                        </p>
                     </div>
                     <button 
                       onClick={fillLocalHost}
                       className="bg-cyber-800 border border-cyber-600 hover:border-emerald-500 text-emerald-400 p-2 rounded flex flex-col items-center justify-center text-[9px] font-bold w-24 h-full transition-all active:scale-95"
                       title="Gunakan pengaturan untuk Node yang berjalan di komputer ini"
                     >
                        <HardDrive size={16} className="mb-1" />
                        USE LOCALHOST
                     </button>
                  </div>

                  {/* RPC INPUT */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-emerald-400 uppercase flex items-center gap-1">
                      <Network size={12} /> RPC Endpoint (HTTP/HTTPS)
                    </label>
                    <input 
                      type="text" 
                      value={rpcUrl}
                      onChange={(e) => setRpcUrl(e.target.value)}
                      className="w-full bg-black/30 border border-cyber-600 rounded py-2 px-3 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                    <p className="text-[9px] text-gray-500">URL Node Server (cth: http://127.0.0.1:8545 atau https://mynode.com)</p>
                  </div>

                  {/* CHAIN ID INPUT */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-purple-400 uppercase flex items-center gap-1">
                        <Hash size={12} /> Chain ID
                      </label>
                      <input 
                        type="number" 
                        value={chainId}
                        onChange={(e) => setChainId(e.target.value)}
                        className="w-full bg-black/30 border border-cyber-600 rounded py-2 px-3 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                     <div className="space-y-1">
                      <label className="text-[10px] font-mono text-yellow-400 uppercase flex items-center gap-1">
                        <Key size={12} /> API Key (Optional)
                      </label>
                      <input 
                        type="password" 
                        value="****************"
                        disabled
                        className="w-full bg-black/30 border border-cyber-700 rounded py-2 px-3 text-xs text-gray-500 font-mono cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* WSS INPUT */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
                      <Zap size={12} /> WebSocket (Real-time Events)
                    </label>
                    <input 
                      type="text" 
                      value={wsUrl}
                      onChange={(e) => setWsUrl(e.target.value)}
                      className="w-full bg-black/30 border border-cyber-700 rounded py-2 px-3 text-xs text-gray-400 font-mono focus:border-gray-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button 
                onClick={handleConnect}
                className={`w-full font-bold py-3 rounded flex items-center justify-center gap-2 transition-all mt-4
                  ${mode === 'SIMPLE' 
                    ? 'bg-cyber-primary hover:bg-cyan-400 text-cyber-900 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'}
                `}
              >
                {mode === 'SIMPLE' ? <Wifi size={18} /> : <Settings size={18} />}
                {mode === 'SIMPLE' ? 'CONNECT AUTO' : 'INITIATE RPC CONNECTION'}
              </button>
            </>
          ) : (
            /* CONNECTION LOGS */
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                {status === 'SUCCESS' ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500 animate-pulse">
                    <Check size={32} className="text-emerald-500" />
                  </div>
                ) : (
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-cyber-700 rounded-full"></div>
                    <div className={`absolute inset-0 border-4 rounded-full border-t-transparent animate-spin ${mode === 'SIMPLE' ? 'border-cyber-primary' : 'border-emerald-500'}`}></div>
                    <Server className={`absolute inset-0 m-auto ${mode === 'SIMPLE' ? 'text-cyber-primary' : 'text-emerald-500'}`} size={20} />
                  </div>
                )}
              </div>
              
              <div className="bg-black rounded border border-cyber-700 p-3 font-mono text-xs h-48 overflow-y-auto custom-scrollbar">
                {logs.map((log, i) => (
                  <div key={i} className="mb-1 flex gap-2 animate-slide-in">
                    <span className="text-gray-600">$</span>
                    <span className={log.includes('ACTIVE') || log.includes('Established') || log.includes('successful') ? 'text-emerald-400 font-bold' : 'text-gray-300'}>{log}</span>
                  </div>
                ))}
                {status === 'CONNECTING' && (
                  <div className="animate-pulse text-cyber-primary">_</div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ConnectionModal;