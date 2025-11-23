import React, { useState } from 'react';
import { User, Shield, Key, RefreshCw, Copy, CheckCircle2, AlertTriangle, Eye, EyeOff, X, Wallet, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (clientData: any) => void;
}

const ClientRegistrationModal: React.FC<Props> = ({ isOpen, onClose, onRegister }) => {
  const [step, setStep] = useState<'INTRO' | 'GENERATING' | 'RESULT'>('INTRO');
  const [clientName, setClientName] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  
  // Simulated Wallet Data
  const [walletData, setWalletData] = useState({
    mnemonic: [] as string[],
    address: '',
    privateKey: ''
  });

  if (!isOpen) return null;

  const generateWallet = () => {
    if (!clientName) return;
    setStep('GENERATING');

    // Simulate cryptographic delay
    setTimeout(() => {
      // Mock Mnemonic Words
      const words = ["alpha", "bravo", "cancel", "delta", "echo", "foxtrot", "golf", "hotel", "india", "juliet", "kilo", "lima"];
      const shuffled = words.sort(() => 0.5 - Math.random());
      
      const mockAddress = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const mockPrivKey = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');

      setWalletData({
        mnemonic: shuffled,
        address: mockAddress,
        privateKey: mockPrivKey
      });
      setStep('RESULT');
    }, 2000);
  };

  const handleFinish = () => {
    onRegister({ name: clientName, address: walletData.address });
    onClose();
    // Reset internal state after closing
    setTimeout(() => {
      setStep('INTRO');
      setClientName('');
      setShowPrivateKey(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cyber-900 border border-cyber-600 rounded-lg w-full max-w-2xl shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-cyber-800 p-4 border-b border-cyber-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-white font-bold">
            <div className="bg-purple-500/20 p-1.5 rounded text-purple-400">
              <Wallet size={18} />
            </div>
            <h3>Client Registration (Wallet Creation)</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          {step === 'INTRO' && (
            <div className="space-y-6">
              <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-lg flex gap-4">
                <Shield className="text-purple-400 shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="text-sm font-bold text-purple-300">Penting: Konsep Akun Blockchain</h4>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Dalam teknologi blockchain, "Mendaftar Client" tidak berarti membuat akun di database server kami. 
                    Anda akan membuat <strong>Pasangan Kunci Kriptografi (Public & Private Key)</strong> secara lokal di browser Anda.
                  </p>
                  <ul className="text-xs text-gray-500 mt-2 list-disc pl-4 space-y-1">
                    <li>Kami tidak menyimpan password Anda.</li>
                    <li>Jika Anda kehilangan Kunci Privat, akses ke aset Anda hilang selamanya.</li>
                    <li>Anda memiliki kendali penuh atas identitas digital Anda.</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-cyber-500 mb-1">CLIENT ALIAS / USERNAME</label>
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Satoshi_Nakamoto"
                  className="w-full bg-black/30 border border-cyber-700 rounded py-3 px-4 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              <button 
                onClick={generateWallet}
                disabled={!clientName}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-cyber-700 disabled:text-gray-500 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition-all mt-4"
              >
                <Key size={18} />
                GENERATE NEW WALLET
              </button>
            </div>
          )}

          {step === 'GENERATING' && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-cyber-700 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
                <RefreshCw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500 animate-pulse" size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold animate-pulse">Generating Cryptographic Identity...</h4>
                <div className="text-xs font-mono text-gray-500 mt-2 space-y-1">
                  <p>Mixing entropy sources...</p>
                  <p>Deriving Private Key (Elliptic Curve secp256k1)...</p>
                  <p>Hashing Public Address (Keccak-256)...</p>
                </div>
              </div>
            </div>
          )}

          {step === 'RESULT' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-4">
                 <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-500 mb-2">
                    <CheckCircle2 size={24} />
                 </div>
                 <h3 className="text-white font-bold">Client Identity Created!</h3>
                 <p className="text-xs text-gray-400">Simpan informasi rahasia di bawah ini.</p>
              </div>

              {/* Public Address */}
              <div className="bg-black/40 border border-cyber-700 rounded p-3">
                 <label className="text-[10px] font-mono text-gray-500 block mb-1">PUBLIC ADDRESS (ID Anda)</label>
                 <div className="flex items-center gap-2">
                    <code className="text-emerald-400 text-xs font-mono break-all flex-1">{walletData.address}</code>
                    <button className="text-gray-500 hover:text-white p-1"><Copy size={14}/></button>
                 </div>
              </div>

              {/* Mnemonic */}
              <div className="bg-black/40 border border-cyber-700 rounded p-3">
                 <label className="text-[10px] font-mono text-purple-400 block mb-2 flex items-center gap-2">
                    RECOVERY PHRASE (SEED) 
                    <span className="bg-red-900/40 text-red-400 text-[9px] px-1 rounded border border-red-500/20">DO NOT SHARE</span>
                 </label>
                 <div className="grid grid-cols-3 gap-2">
                    {walletData.mnemonic.map((word, i) => (
                       <div key={i} className="bg-cyber-800 border border-cyber-700 rounded px-2 py-1 text-xs text-gray-300 font-mono text-center">
                          <span className="text-gray-600 mr-1 select-none">{i+1}.</span>{word}
                       </div>
                    ))}
                 </div>
              </div>

              {/* Private Key */}
              <div className="bg-red-900/10 border border-red-500/20 rounded p-3">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-mono text-red-400 block flex items-center gap-1">
                       <Key size={10} /> PRIVATE KEY
                    </label>
                    <button 
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1"
                    >
                       {showPrivateKey ? <EyeOff size={12}/> : <Eye size={12}/>}
                       {showPrivateKey ? 'Hide' : 'Reveal'}
                    </button>
                 </div>
                 <div className="relative">
                    <code className={`text-xs font-mono break-all block p-2 bg-black/50 rounded border border-red-900/30 ${showPrivateKey ? 'text-red-300' : 'text-gray-600 blur-sm select-none'}`}>
                       {showPrivateKey ? walletData.privateKey : "0x..........................................................."}
                    </code>
                    {!showPrivateKey && (
                       <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] text-gray-400 font-bold bg-black/80 px-2 py-1 rounded">HIDDEN</span>
                       </div>
                    )}
                 </div>
              </div>

              <div className="flex gap-3 mt-4">
                 <button onClick={handleFinish} className="flex-1 bg-cyber-700 hover:bg-cyber-600 text-white py-2 rounded font-bold text-xs transition-colors">
                    SIMPAN & TUTUP
                 </button>
                 <button onClick={handleFinish} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded font-bold text-xs transition-colors flex items-center justify-center gap-2">
                    MASUK DASHBOARD <ArrowRight size={14}/>
                 </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default ClientRegistrationModal;