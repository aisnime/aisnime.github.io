import React, { useState, useEffect } from 'react';
import { Server, Smartphone, Monitor, Cpu, X, Shield, Key, Hash, CheckCircle2, Terminal, Loader2, Wand2, ScanLine, Copy, Download } from 'lucide-react';
import { NodeType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (name: string, type: NodeType) => void;
}

const JoinNetworkModal: React.FC<Props> = ({ isOpen, onClose, onRegister }) => {
  const [step, setStep] = useState<'SELECT' | 'INSTRUCTION' | 'CONNECTING' | 'SUCCESS'>('SELECT');
  const [selectedType, setSelectedType] = useState<NodeType>(NodeType.DESKTOP);
  const [nodeName, setNodeName] = useState(`Node-${Math.floor(Math.random() * 1000)}`);
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      setStep('SELECT');
      setLogs([]);
    }
  }, [isOpen]);

  const handleSelectType = (type: NodeType) => {
    setSelectedType(type);
    setStep('INSTRUCTION');
  };

  // Function to simulate "Running the command" from the user
  const simulateConnection = () => {
    setStep('CONNECTING');
    const sequence = [
      "Initializing Handshake...",
      `Detecting ${selectedType === NodeType.MOBILE ? 'Android Runtime' : 'CLI Environment'}...`,
      "Verifying Cryptographic Proof...",
      "Syncing Ledger Headers...",
      "Node Active."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i >= sequence.length) {
        clearInterval(interval);
        setStep('SUCCESS');
        setTimeout(() => {
          onRegister(nodeName, selectedType);
          onClose();
        }, 1500);
        return;
      }
      setLogs(prev => [...prev, sequence[i]]);
      i++;
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cyber-900 border border-cyber-600 rounded-lg w-full max-w-md shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden">
        
        <div className="bg-cyber-800 p-4 border-b border-cyber-700 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold">
            <Server size={18} className="text-emerald-500" />
            <h3>Add New Node</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 'SELECT' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Pilih tipe perangkat yang ingin Anda hubungkan ke jaringan:</p>
              
              <button 
                onClick={() => handleSelectType(NodeType.MOBILE)}
                className="w-full flex items-center gap-4 p-4 bg-cyber-800 border border-cyber-700 hover:border-emerald-500 hover:bg-emerald-900/20 rounded-lg transition-all group text-left"
              >
                <div className="bg-cyber-900 p-3 rounded-full group-hover:text-emerald-400 transition-colors">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold">Android / iOS Device</h4>
                  <p className="text-xs text-gray-500">Jalankan node ringan melalui Aplikasi Mobile.</p>
                </div>
              </button>

              <button 
                onClick={() => handleSelectType(NodeType.DESKTOP)}
                className="w-full flex items-center gap-4 p-4 bg-cyber-800 border border-cyber-700 hover:border-cyan-500 hover:bg-cyan-900/20 rounded-lg transition-all group text-left"
              >
                <div className="bg-cyber-900 p-3 rounded-full group-hover:text-cyan-400 transition-colors">
                  <Terminal size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold">Desktop / Server (CLI)</h4>
                  <p className="text-xs text-gray-500">Jalankan node validator penuh melalui Command Line.</p>
                </div>
              </button>
            </div>
          )}

          {step === 'INSTRUCTION' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                 <button onClick={() => setStep('SELECT')} className="text-gray-500 hover:text-white">← Back</button>
                 <span>| Setup {selectedType}</span>
              </div>

              {selectedType === NodeType.MOBILE ? (
                // UI FOR MOBILE (ANDROID APP)
                <div className="text-center space-y-4">
                  <div className="bg-white p-2 inline-block rounded-lg border-4 border-white">
                     {/* Simulated QR Code */}
                     <div className="w-32 h-32 bg-slate-900 flex items-center justify-center text-xs text-gray-500 font-mono break-all p-1">
                        [QR: desentralshield.io/download/android]
                     </div>
                  </div>
                  <div>
                    <p className="text-sm text-white font-bold">Scan to Download App</p>
                    <p className="text-xs text-gray-500">Versi 2.4.1 (Stable) • 15 MB</p>
                  </div>
                  <button 
                    onClick={simulateConnection}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded flex items-center justify-center gap-2 font-bold text-sm"
                  >
                    <Download size={16} />
                    SIMULATE INSTALL & CONNECT
                  </button>
                </div>
              ) : (
                // UI FOR DESKTOP (CMD)
                <div className="space-y-4">
                   <div className="bg-black/60 rounded-lg border border-cyber-600 p-4 font-mono text-xs relative group">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="text-gray-400 hover:text-white"><Copy size={14}/></button>
                      </div>
                      <div className="text-gray-500 mb-2"># Run this in your terminal to start node:</div>
                      <div className="text-cyan-400">
                        curl -sL https://cli.desentralshield.io/init | bash
                      </div>
                   </div>
                   
                   <div className="text-xs text-gray-500">
                     <p className="mb-2">Supported OS: Ubuntu 20.04+, macOS, Windows (WSL2).</p>
                   </div>

                   <button 
                    onClick={simulateConnection}
                    className="w-full bg-cyber-700 hover:bg-cyber-600 text-white py-3 rounded flex items-center justify-center gap-2 font-bold text-sm"
                  >
                    <Terminal size={16} />
                    SIMULATE TERMINAL COMMAND
                  </button>
                </div>
              )}
            </div>
          )}

          {(step === 'CONNECTING' || step === 'SUCCESS') && (
            <div className="space-y-4">
              <div className="bg-black p-3 rounded border border-cyber-700 h-40 overflow-y-auto font-mono text-[10px]">
                {logs.map((log, i) => (
                  <div key={i} className="mb-1 text-gray-300 flex gap-2">
                    <span className="text-emerald-500">{'>'}</span>
                    {log}
                  </div>
                ))}
                {step === 'CONNECTING' && <span className="animate-pulse text-emerald-500">_</span>}
              </div>

              {step === 'SUCCESS' && (
                 <div className="text-center text-emerald-400 font-bold text-sm animate-bounce">
                    CONNECTION ESTABLISHED!
                 </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default JoinNetworkModal;