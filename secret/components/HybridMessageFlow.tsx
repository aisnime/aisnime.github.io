import React, { useState } from 'react';
import { Smartphone, Server, ArrowRight, CheckCircle2, Share2, Globe, Lock, Shield, EyeOff } from 'lucide-react';

interface Props {
  inputText: string;
  onInputChange: (text: string) => void;
  activeNodeCount: number;
  isSystemCompromised: boolean;
}

type FlowStep = 'IDLE' | 'ENCRYPTING' | 'TRANSMITTING' | 'RELAYING' | 'VERIFYING' | 'COMPLETE';

const HybridMessageFlow: React.FC<Props> = ({ inputText, onInputChange, activeNodeCount, isSystemCompromised }) => {
  const [step, setStep] = useState<FlowStep>('IDLE');
  const [serverStatus, setServerStatus] = useState<'IDLE' | 'BLIND_RELAY'>('IDLE');
  const [blockchainStatus, setBlockchainStatus] = useState<'IDLE' | 'VERIFYING_KEYS'>('IDLE');

  const startSimulation = () => {
    if (!inputText || isSystemCompromised) return;
    
    // Reset
    setStep('ENCRYPTING');
    setServerStatus('IDLE');
    setBlockchainStatus('IDLE');

    // 1. Local Encryption (Client A)
    setTimeout(() => {
      setStep('TRANSMITTING'); // A sends Encrypted to Server AND Hash to Blockchain

      // 2. Transmission & Blockchain Anchoring
      setTimeout(() => {
        setServerStatus('BLIND_RELAY'); // Server receives but cannot read
        setBlockchainStatus('VERIFYING_KEYS'); // Blockchain verifies Public Key Integrity

        // 3. Relay to B
        setTimeout(() => {
          setStep('RELAYING'); // Server pushes to B
          
          // 4. Client B Decryption & Verification
          setTimeout(() => {
            setStep('VERIFYING');
            setBlockchainStatus('IDLE');
            setServerStatus('IDLE');
            
            setTimeout(() => {
              setStep('COMPLETE');
            }, 1500);
          }, 1500);
        }, 2000);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="bg-cyber-800 border border-cyber-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="text-emerald-400" />
          <h2 className="text-lg font-bold text-white">E2EE + Key Transparency</h2>
        </div>
        <div className="text-[10px] bg-cyber-900 border border-cyber-600 px-2 py-1 rounded text-gray-400 font-mono">
          MODEL: Signal/WhatsApp + Web3
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* INPUT SECTION */}
        <div className="col-span-1 space-y-4">
          <div>
            <label className="block text-xs font-mono text-cyber-500 mb-2">PESAN (USER A)</label>
            <textarea 
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Ketik pesan rahasia..."
              disabled={step !== 'IDLE' && step !== 'COMPLETE'}
              className="w-full bg-cyber-900 border border-cyber-600 rounded p-3 text-sm text-white focus:border-cyber-primary outline-none h-24 resize-none font-mono"
            />
          </div>
          <button 
            onClick={startSimulation}
            disabled={step !== 'IDLE' && step !== 'COMPLETE' || !inputText || isSystemCompromised}
            className={`w-full py-3 rounded font-bold font-mono text-sm flex justify-center items-center gap-2 transition-all
              ${step === 'IDLE' || step === 'COMPLETE'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg' 
                : 'bg-cyber-700 text-gray-500 cursor-not-allowed'}`}
          >
            {step === 'IDLE' || step === 'COMPLETE' ? (
              <>
                <Lock size={16} /> ENKRIPSI & KIRIM
              </>
            ) : (
              <span className="animate-pulse">SECURING...</span>
            )}
          </button>
          
          <div className="text-[10px] text-gray-500 leading-relaxed bg-black/20 p-2 rounded border border-cyber-700/50">
            <strong className="text-emerald-400">Arsitektur E2EE Sebenarnya:</strong>
            <ul className="list-disc pl-3 mt-1 space-y-1">
              <li>Pesan dienkripsi <span className="text-white">di perangkat</span> (Local).</li>
              <li>Server WhatsApp hanya melihat <span className="text-yellow-500">kode acak</span> (Blind Relay).</li>
              <li>Blockchain digunakan untuk memvalidasi <span className="text-indigo-400">Public Key</span> agar Server tidak bisa memalsukan identitas penerima.</li>
            </ul>
          </div>
        </div>

        {/* VISUALIZATION AREA */}
        <div className="col-span-2 bg-cyber-900/50 rounded-lg border border-cyber-700 p-4 relative h-[300px] flex flex-col justify-between overflow-hidden">
            
            {/* Top Layer: Central Server (Blind Relay) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                <div className={`w-24 h-16 rounded-lg border-2 flex items-center justify-center transition-all duration-500 bg-cyber-900 relative
                    ${serverStatus === 'IDLE' ? 'border-cyber-600 text-cyber-600' : ''}
                    ${serverStatus === 'BLIND_RELAY' ? 'border-gray-500 text-gray-400 bg-gray-800/50' : ''}
                `}>
                    {serverStatus === 'BLIND_RELAY' ? <EyeOff size={32} /> : <Server size={32} />}
                    
                    {/* Status Badge */}
                    <div className="absolute -top-2 -right-2 bg-cyber-900 border border-cyber-600 rounded-full p-1">
                        <Lock size={10} className="text-gray-400" />
                    </div>
                </div>
                <span className={`text-[10px] font-mono mt-2 px-2 py-0.5 rounded transition-colors ${serverStatus === 'BLIND_RELAY' ? 'text-gray-400 bg-gray-800' : 'text-cyber-600'}`}>
                   {serverStatus === 'BLIND_RELAY' ? 'ENCRYPTED TUNNEL' : 'WHATSAPP SERVER'}
                </span>
            </div>

            {/* Bottom Layer: Blockchain (Key Transparency) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 w-full">
                <div className="flex justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300
                            ${blockchainStatus === 'IDLE' ? 'bg-cyber-700' : ''}
                            ${blockchainStatus === 'VERIFYING_KEYS' ? 'bg-indigo-500 animate-pulse' : ''}
                        `}></div>
                    ))}
                </div>
                <div className={`w-3/4 h-10 rounded border border-dashed flex items-center justify-center gap-2 transition-all bg-cyber-900
                     ${blockchainStatus === 'IDLE' ? 'border-cyber-600 text-gray-600' : ''}
                     ${blockchainStatus === 'VERIFYING_KEYS' ? 'border-indigo-500 text-indigo-400 bg-indigo-900/10 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : ''}
                `}>
                    <Globe size={14} />
                    <span className="text-[10px] font-mono">PUBLIC KEY LEDGER (Identity Proof)</span>
                </div>
            </div>

            {/* Client A (Left) */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 flex flex-col items-center z-20">
                <div className={`w-12 h-20 border-2 rounded-lg bg-cyber-800 flex items-center justify-center relative transition-all
                  ${step === 'ENCRYPTING' ? 'border-emerald-500 shadow-[0_0_15px_#10b981]' : 'border-cyber-600'}
                `}>
                    <Smartphone size={24} className="text-white" />
                    {step === 'ENCRYPTING' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded">
                            <Lock size={16} className="text-emerald-400 animate-ping" />
                        </div>
                    )}
                </div>
                <span className="text-xs font-bold mt-2 text-white">USER A</span>
            </div>

            {/* Client B (Right) */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col items-center z-20">
                 <div className={`w-12 h-20 border-2 rounded-lg bg-cyber-800 flex items-center justify-center relative transition-colors
                    ${step === 'COMPLETE' ? 'border-emerald-500 shadow-[0_0_20px_#10b981]' : 'border-cyber-600'}
                 `}>
                    <Smartphone size={24} className={step === 'COMPLETE' ? "text-emerald-400" : "text-gray-500"} />
                     {step === 'VERIFYING' && (
                        <div className="absolute -top-8 text-[10px] text-indigo-400 font-mono animate-bounce">
                           Checking Keys...
                        </div>
                    )}
                </div>
                <span className="text-xs font-bold mt-2 text-white">USER B</span>
            </div>

            {/* SVG ANIMATION LAYER */}
            <svg className="absolute inset-0 pointer-events-none w-full h-full z-10">
                
                {/* Path 1: A -> Server */}
                <path d="M 60 150 L 50% 60" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4,4" />
                
                {/* Path 2: Server -> B */}
                <path d="M 50% 60 L 95% 150" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4,4" />
                
                {/* Path 3: A -> Blockchain (Direct User Anchoring) */}
                <path d="M 60 150 L 50% 250" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4,4" />

                {/* Path 4: B -> Blockchain (Key Verification) */}
                <path d="M 95% 150 L 50% 250" fill="none" stroke="#334155" strokeWidth="1" strokeOpacity="0.5" />

                {/* 1. Encrypted Payload: A -> Server */}
                {(step === 'TRANSMITTING' || step === 'RELAYING') && (
                    <g>
                        <circle r="8" fill="#374151" stroke="#ef4444" strokeWidth="1">
                             <animateMotion 
                                dur="1.5s" 
                                repeatCount="1" 
                                path="M 60 150 L 50% 60"
                                fill="freeze"
                            />
                        </circle>
                        {/* Text 'E2EE' following the packet */}
                    </g>
                )}

                {/* 2. Hash/Proof: A -> Blockchain (Simultaneous with 1) */}
                {step === 'TRANSMITTING' && (
                    <circle r="4" fill="#6366f1">
                        <animateMotion 
                            dur="1.5s" 
                            repeatCount="1" 
                            path="M 60 150 L 50% 250"
                            fill="freeze"
                        />
                    </circle>
                )}

                {/* 3. Relay: Server -> B */}
                {step === 'RELAYING' && (
                     <circle r="8" fill="#374151" stroke="#ef4444" strokeWidth="1">
                        <animateMotion 
                            dur="1.5s" 
                            repeatCount="1" 
                            path="M 50% 60 L 95% 150"
                            fill="freeze"
                        />
                    </circle>
                )}

                {/* 4. Verification Beam: B -> Blockchain */}
                {step === 'VERIFYING' && (
                     <line x1="95%" y1="150" x2="50%" y2="250" stroke="#6366f1" strokeWidth="2" strokeDasharray="4">
                        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" repeatCount="indefinite" />
                     </line>
                )}

            </svg>

            {/* LABELS */}
            {step === 'ENCRYPTING' && (
                <div className="absolute top-1/2 left-20 text-[10px] text-emerald-400 font-mono bg-black/80 px-2 py-1 rounded border border-emerald-500/30 animate-fade-in z-30">
                    Local Encryption
                </div>
            )}
            
            {step === 'TRANSMITTING' && (
                <>
                  <div className="absolute top-1/4 left-1/4 text-[10px] text-red-400 font-mono animate-fade-in bg-black/50 px-1 rounded">Ciphertext (Locked)</div>
                  <div className="absolute bottom-1/3 left-1/4 text-[10px] text-indigo-400 font-mono animate-fade-in bg-black/50 px-1 rounded">Key Proof</div>
                </>
            )}

             {serverStatus === 'BLIND_RELAY' && step !== 'COMPLETE' && step !== 'IDLE' && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-mono bg-black/80 px-2 py-1 rounded border border-gray-600 animate-pulse z-30">
                    BLIND FORWARDING...
                </div>
            )}

            {step === 'COMPLETE' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyber-900 border border-emerald-500 px-4 py-2 rounded-lg shadow-xl flex flex-col items-center animate-bounce-in z-50">
                    <CheckCircle2 size={24} className="text-emerald-500 mb-1" />
                    <div className="text-sm font-bold text-white">DEKRIPSI SUKSES</div>
                    <div className="text-[10px] text-gray-400">Identitas Pengirim Terverifikasi</div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default HybridMessageFlow;