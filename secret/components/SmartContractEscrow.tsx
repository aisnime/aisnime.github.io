
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Wallet, FileText, CheckCircle2, FileCode, UploadCloud, Clock, AlertCircle, RefreshCw, Briefcase, Zap, Eye } from 'lucide-react';

const SmartContractEscrow: React.FC = () => {
  // State Steps: DRAFT -> WORKING -> REVIEW (3 Days Window) -> COMPLETED
  const [step, setStep] = useState<'DRAFT' | 'WORKING' | 'REVIEW' | 'COMPLETED'>('DRAFT');
  
  const [contractBalance, setContractBalance] = useState(0);
  const [sellerBalance, setSellerBalance] = useState(0);
  const [buyerBalance, setBuyerBalance] = useState(1000);
  
  // Timer Simulation
  const [reviewHours, setReviewHours] = useState(0); 
  const REVIEW_DURATION_HOURS = 72; // 3 Days = 72 Hours

  const PRICE = 500;

  // Timer Effect for Review Phase (Auto-Release Logic)
  useEffect(() => {
    let interval: any;
    
    if (step === 'REVIEW') {
      interval = setInterval(() => {
        setReviewHours(prev => {
          // Speed simulation: 1 tick = 1 hour (fast forward)
          const newTime = prev + 1;
          
          if (newTime >= REVIEW_DURATION_HOURS) {
            clearInterval(interval);
            handleReleaseFunds("AUTO_TIMEOUT"); // Auto release triggered by 3-day timeout
            return REVIEW_DURATION_HOURS;
          }
          return newTime;
        });
      }, 100); // Speed control
    }

    return () => clearInterval(interval);
  }, [step]);

  const handleDeposit = () => {
    if (buyerBalance >= PRICE) {
      setBuyerBalance(prev => prev - PRICE);
      setContractBalance(PRICE);
      setStep('WORKING');
    }
  };

  const handleSubmitReport = () => {
    // Provider submits proof of work
    setStep('REVIEW');
    setReviewHours(0);
  };

  const handleReleaseFunds = (reason: "MANUAL" | "AUTO_TIMEOUT") => {
    setContractBalance(0);
    setSellerBalance(prev => prev + PRICE);
    setStep('COMPLETED');
  };

  const reset = () => {
    setStep('DRAFT');
    setContractBalance(0);
    setSellerBalance(0);
    setBuyerBalance(1000);
    setReviewHours(0);
  };

  return (
    <div className="bg-cyber-800 border border-cyber-700 rounded-lg p-6 relative overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Smart Contract Escrow</h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono bg-cyber-900 border border-cyber-600 px-3 py-1 rounded text-gray-400">
          <FileCode size={12} />
          <span>CONTRACT: 0x8f...2a9</span>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="grid grid-cols-3 gap-4 mb-8 relative flex-1 items-center">
        {/* Connection Line Background */}
        <div className="absolute top-12 left-0 w-full h-1 bg-cyber-700 -z-0"></div>
        
        {/* Dynamic Progress Line */}
        <div className={`absolute top-12 left-0 h-1 bg-emerald-500 transition-all duration-1000 -z-0 
          ${step === 'DRAFT' ? 'w-0' : 
            step === 'WORKING' ? 'w-1/3' : 
            step === 'REVIEW' ? 'w-2/3' : 'w-full'
          }
        `}></div>

        {/* --- CLIENT (BUYER) --- */}
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center bg-cyber-900 transition-all
            ${step === 'DRAFT' ? 'border-emerald-500 shadow-[0_0_15px_#10b981]' : 'border-cyber-600 text-gray-500'}
          `}>
            <Wallet size={28} />
            <div className="text-xs font-mono mt-1">${buyerBalance}</div>
          </div>
          <p className="mt-2 text-sm font-bold text-gray-300">CLIENT</p>
          
          {/* Client Actions */}
          <div className="mt-4 h-12 flex items-start justify-center">
            {step === 'DRAFT' && (
              <button 
                onClick={handleDeposit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
              >
                <Lock size={14} /> DEPOSIT
              </button>
            )}
            
            {step === 'REVIEW' && (
              <button 
                onClick={() => handleReleaseFunds("MANUAL")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded text-[10px] font-bold flex items-center gap-1 shadow-lg animate-bounce"
              >
                <CheckCircle2 size={12} /> SETUJUI & BAYAR
              </button>
            )}

            {step === 'WORKING' && (
               <div className="text-[10px] text-cyber-500 italic bg-black/30 px-2 py-1 rounded">
                 Menunggu laporan...
               </div>
            )}
          </div>
        </div>

        {/* --- SMART CONTRACT (MIDDLEWARE) --- */}
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-28 h-28 rounded-lg border-2 flex flex-col items-center justify-center bg-cyber-900 transition-all relative
             ${contractBalance > 0 ? 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]' : 'border-cyber-600 border-dashed'}
          `}>
            {contractBalance > 0 ? (
              <>
                {step === 'WORKING' && <Lock size={32} className="text-emerald-400 mb-1" />}
                {step === 'REVIEW' && <FileText size={32} className="text-yellow-400 mb-1 animate-pulse" />}
                {step === 'COMPLETED' && <CheckCircle2 size={32} className="text-emerald-500 mb-1" />}
                
                <div className="text-lg font-bold text-white">${contractBalance}</div>
                <div className="text-[9px] text-cyber-400 uppercase font-mono mt-1">
                  {step === 'WORKING' ? 'FUNDS LOCKED' : step === 'REVIEW' ? 'REPORT SUBMITTED' : 'RELEASED'}
                </div>
              </>
            ) : (
              <>
                <FileCode size={32} className="text-gray-600 mb-1" />
                <div className="text-xs text-gray-500">Empty Vault</div>
              </>
            )}
          </div>
          <p className={`mt-2 text-sm font-bold ${contractBalance > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
            ESCROW
          </p>

          {/* Dispute Timer Visual */}
          {step === 'REVIEW' && (
             <div className="absolute -bottom-14 w-32 bg-cyber-900 border border-yellow-500/30 rounded p-2 text-center">
                <div className="text-[9px] text-yellow-500 font-bold mb-1 flex justify-center items-center gap-1">
                   <Clock size={10} /> AUTO-RELEASE
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mb-1">
                    <div 
                      className="h-full bg-yellow-500 transition-all duration-300" 
                      style={{ width: `${(reviewHours / REVIEW_DURATION_HOURS) * 100}%` }}
                    ></div>
                </div>
                <div className="text-[9px] text-gray-400">
                   {REVIEW_DURATION_HOURS - reviewHours} Jam Tersisa
                </div>
             </div>
          )}
        </div>

        {/* --- PROVIDER (SELLER) --- */}
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center bg-cyber-900 transition-all
             ${step === 'COMPLETED' ? 'border-emerald-500 shadow-[0_0_15px_#10b981]' : 'border-cyber-600 text-gray-500'}
          `}>
            <Briefcase size={28} />
            <div className="text-xs font-mono mt-1 text-emerald-400">+${sellerBalance}</div>
          </div>
          <p className="mt-2 text-sm font-bold text-gray-300">PROVIDER</p>

          {/* Provider Actions */}
          <div className="mt-4 h-12 flex items-start justify-center">
             {step === 'WORKING' && (
                <button 
                  onClick={handleSubmitReport}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-[10px] font-bold flex items-center gap-2 shadow-lg"
                >
                  <UploadCloud size={14} /> KIRIM LAPORAN
                </button>
             )}
             
             {step === 'REVIEW' && (
               <div className="flex flex-col items-center">
                  <span className="text-[10px] text-yellow-500 flex items-center gap-1 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-500/20">
                    <Clock size={10} /> Menunggu Client...
                  </span>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* STATUS & EXPLANATION FOOTER */}
      <div className="mt-auto bg-black/20 rounded border border-cyber-700 p-4">
        {step === 'DRAFT' && (
           <div className="flex gap-3 text-xs text-gray-400">
              <AlertCircle size={16} className="text-emerald-500 shrink-0" />
              <p>Dana akan disimpan di Smart Contract. Provider tidak bisa mengambil dana sebelum menyerahkan bukti kerja.</p>
           </div>
        )}

        {step === 'WORKING' && (
           <div className="flex gap-3 text-xs text-gray-400">
              <Briefcase size={16} className="text-blue-400 shrink-0" />
              <p><strong className="text-blue-400">Fase Pengerjaan:</strong> Provider sedang bekerja. Client tidak bisa membatalkan sepihak. Provider wajib mengunggah laporan untuk membuka kunci dana.</p>
           </div>
        )}

        {step === 'REVIEW' && (
           <div className="flex gap-3 text-xs text-gray-400">
              <Zap size={16} className="text-yellow-400 shrink-0" />
              <div>
                 <p className="mb-1"><strong className="text-yellow-400">Fase Review (3 Hari):</strong> Laporan transparansi telah diserahkan.</p>
                 <ul className="list-disc pl-4 space-y-1 text-[10px]">
                    <li>Jika Client puas, tekan <strong>SETUJUI</strong>.</li>
                    <li>Jika Client diam selama 3 hari, dana <strong>CAIR OTOMATIS</strong> ke Provider (Proteksi anti-ghosting).</li>
                 </ul>
              </div>
           </div>
        )}

        {step === 'COMPLETED' && (
           <div className="flex justify-between items-center">
              <div className="flex gap-3 text-xs text-gray-400">
                 <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                 <p className="text-emerald-400 font-bold">Transaksi Selesai. Pembayaran telah didistribusikan.</p>
              </div>
              <button onClick={reset} className="text-xs text-cyber-500 hover:text-white flex items-center gap-1">
                 <RefreshCw size={12} /> Reset Simulasi
              </button>
           </div>
        )}
      </div>

    </div>
  );
};

export default SmartContractEscrow;
