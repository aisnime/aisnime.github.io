import React, { useState } from 'react';
import { Shield, Globe, Zap, Database, Lock, CheckCircle2, XCircle, Terminal, ExternalLink } from 'lucide-react';

const SecurityIntel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'APPS' | 'EFFECTIVENESS'>('APPS');

  const apps = [
    {
      name: "Session",
      tech: "Oxen Service Node",
      desc: "Messenger tanpa nomor telepon. Menggunakan 'Onion Routing' berbasis blockchain untuk menyembunyikan metadata (siapa mengirim ke siapa).",
      icon: <Globe size={20} className="text-emerald-400" />,
      status: "Production"
    },
    {
      name: "Status.im",
      tech: "Ethereum + Waku",
      desc: "Super-app (Chat + Wallet + Browser). Menggunakan jaringan peer-to-peer Waku untuk pengiriman pesan yang tahan sensor.",
      icon: <Database size={20} className="text-blue-400" />,
      status: "Production"
    },
    {
      name: "Audius",
      tech: "Solana + IPFS",
      desc: "Platform streaming musik terdesentralisasi. Konten disimpan di IPFS, hak cipta & royalti dikelola oleh smart contract.",
      icon: <Zap size={20} className="text-purple-400" />,
      status: "Production"
    }
  ];

  const metrics = [
    { 
      label: "Integritas Data (Anti-Tamper)", 
      web2: 60, 
      web3: 99, 
      desc: "Blockchain unggul mutlak karena sifat immutability (tidak bisa diedit). Di Web2, admin database bisa memanipulasi data diam-diam." 
    },
    { 
      label: "Privasi Metadata", 
      web2: 40, 
      web3: 85, 
      desc: "Web2 mengenkripsi isi pesan, tapi tahu 'siapa bicara dengan siapa'. Web3 (seperti Session) menyembunyikan metadata ini lewat routing acak." 
    },
    { 
      label: "Kecepatan & Latensi", 
      web2: 95, 
      web3: 45, 
      desc: "Kelemahan utama Web3. Konsensus node membutuhkan waktu, membuat pengiriman pesan lebih lambat dibanding server terpusat (WhatsApp)." 
    },
    { 
      label: "Resistensi Sensor", 
      web2: 30, 
      web3: 95, 
      desc: "Web2 mudah diblokir pemerintah (block IP server). Web3 sulit diblokir karena berjalan di ribuan node acak di seluruh dunia." 
    }
  ];

  return (
    <div className="bg-cyber-800 border border-cyber-700 rounded-lg p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Terminal className="text-cyber-primary" />
          <h2 className="text-lg font-bold text-white">Security Intelligence</h2>
        </div>
        <div className="flex gap-1 bg-cyber-900 p-1 rounded border border-cyber-700">
          <button 
            onClick={() => setActiveTab('APPS')}
            className={`px-3 py-1 text-[10px] font-mono font-bold rounded transition-all ${activeTab === 'APPS' ? 'bg-cyber-700 text-white' : 'text-gray-500'}`}
          >
            REAL-WORLD APPS
          </button>
          <button 
            onClick={() => setActiveTab('EFFECTIVENESS')}
            className={`px-3 py-1 text-[10px] font-mono font-bold rounded transition-all ${activeTab === 'EFFECTIVENESS' ? 'bg-cyber-700 text-white' : 'text-gray-500'}`}
          >
            ANALISIS EFEKTIVITAS
          </button>
        </div>
      </div>

      {activeTab === 'APPS' ? (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Berikut adalah aplikasi yang telah mengimplementasikan teknologi enkripsi berbasis desentralisasi/blockchain di dunia nyata:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {apps.map((app, idx) => (
              <div key={idx} className="bg-cyber-900/50 border border-cyber-700 p-3 rounded hover:border-cyber-primary transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyber-800 rounded border border-cyber-700 group-hover:border-cyber-500 transition-colors">
                      {app.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-200">{app.name}</h4>
                      <span className="text-[10px] font-mono text-cyber-primary">{app.tech}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    {app.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 pl-1">{app.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-xs text-blue-200 flex gap-2 items-start">
            <ExternalLink size={14} className="mt-0.5 shrink-0" />
            <p>Catatan: Sebagian besar aplikasi ini menggunakan Blockchain untuk <strong>Identitas & Routing</strong>, bukan untuk menyimpan isi pesan secara langsung (karena mahal & lambat).</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="grid grid-cols-2 gap-4 mb-2 text-[10px] font-mono text-center">
              <div className="text-blue-400">WEB 2.0 (WhatsApp/Telegram)</div>
              <div className="text-emerald-400">WEB 3.0 (Blockchain)</div>
           </div>
           
           {metrics.map((m, i) => (
             <div key={i} className="space-y-1">
               <div className="flex justify-between text-xs font-bold text-gray-300">
                 <span>{m.label}</span>
               </div>
               <div className="h-2 bg-cyber-900 rounded-full overflow-hidden flex">
                 <div className="h-full bg-blue-600/50 transition-all duration-1000" style={{ width: `${m.web2}%` }}></div>
                 <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${m.web3}%` }}></div>
               </div>
               <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-1">
                 <span>{m.web2}%</span>
                 <span>{m.web3}%</span>
               </div>
               <p className="text-[10px] text-gray-400 italic border-l-2 border-cyber-600 pl-2 mt-1">
                 "{m.desc}"
               </p>
             </div>
           ))}

           <div className="flex gap-4 pt-2">
             <div className="flex-1 bg-red-900/20 border border-red-500/30 p-2 rounded">
               <h5 className="text-xs font-bold text-red-400 mb-1 flex items-center gap-1"><XCircle size={12}/> KELEMAHAN UTAMA</h5>
               <p className="text-[10px] text-gray-400">Skalabilitas rendah & User Experience (UX) yang rumit (kunci privat hilang = akun hilang).</p>
             </div>
             <div className="flex-1 bg-emerald-900/20 border border-emerald-500/30 p-2 rounded">
               <h5 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1"><CheckCircle2 size={12}/> KEUNGGULAN UTAMA</h5>
               <p className="text-[10px] text-gray-400">Tidak ada "Single Point of Failure". Data tidak bisa dimatikan oleh satu entitas/negara.</p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SecurityIntel;