import React, { useState, useRef, useEffect } from 'react';
import { FileText, Lock, ArrowRight, CheckCircle, Server, ShieldCheck, Smartphone, Laptop, Scan, Bug, ShieldAlert, Skull, Ban, Eraser, Sparkles } from 'lucide-react';

interface Props {
  activeNodeCount: number;
}

interface TransferFile {
  name: string;
  size: string;
  type: string;
  isMalware: boolean;
}

const SAFE_FILES: TransferFile[] = [
  { name: 'rahasia_negara.pdf', size: '2.4 MB', type: 'PDF', isMalware: false },
  { name: 'database_pengguna.enc', size: '150 MB', type: 'DB', isMalware: false },
  { name: 'blueprint_prototipe.cad', size: '45 MB', type: 'CAD', isMalware: false }
];

const MALWARE_FILES: TransferFile[] = [
  { name: 'WannaCry_Payload.exe', size: '4.1 MB', type: 'EXE', isMalware: true },
  { name: 'Trojan.Win32.Generic', size: '12 KB', type: 'BAT', isMalware: true },
  { name: 'Spyware_Keylogger.js', size: '85 KB', type: 'JS', isMalware: true }
];

type SimulationStatus = 'IDLE' | 'SCANNING' | 'CLEANING' | 'ENCRYPTING' | 'SENDING' | 'DECRYPTING' | 'COMPLETED' | 'BLOCKED';

const FileTransferSimulation: React.FC<Props> = ({ activeNodeCount }) => {
  const [fileCategory, setFileCategory] = useState<'SAFE' | 'MALWARE'>('SAFE');
  const [selectedFile, setSelectedFile] = useState<TransferFile>(SAFE_FILES[0]);
  const [status, setStatus] = useState<SimulationStatus>('IDLE');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [wasCleaned, setWasCleaned] = useState(false);

  // Use refs to access latest state inside interval closure
  const statusRef = useRef(status);
  const progressRef = useRef(progress);
  const selectedFileRef = useRef(selectedFile);
  
  // Sync refs with state
  useEffect(() => {
    statusRef.current = status;
    progressRef.current = progress;
    selectedFileRef.current = selectedFile;
  }, [status, progress, selectedFile]);

  const addLog = (msg: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${type.toUpperCase()}: ${msg}`, ...prev].slice(0, 6));
  };

  const startTransfer = () => {
    if (status !== 'IDLE' && status !== 'COMPLETED' && status !== 'BLOCKED') return;
    
    setStatus('SCANNING');
    setProgress(0);
    setLogs([]);
    setWasCleaned(false);
    addLog(`Memulai protokol keamanan untuk ${selectedFile.name}`);
    addLog("Running Anti-Malware Heuristics...", 'info');

    const interval = setInterval(() => {
      const currentStatus = statusRef.current;
      const currentFile = selectedFileRef.current;
      
      // Increment progress
      let increment = 1.5;
      // Slow down slightly during cleaning for visual effect
      if (currentStatus === 'CLEANING') increment = 0.8;
      
      const nextProgress = Math.min(progressRef.current + increment, 100);
      setProgress(nextProgress);

      // --- PHASE LOGIC ---

      // 1. SCANNING ENDS (at 25%)
      if (currentStatus === 'SCANNING' && nextProgress >= 25) {
        if (currentFile.isMalware) {
           // INSTEAD OF BLOCKING, WE START CLEANING
           setStatus('CLEANING');
           addLog(`THREAT DETECTED: ${currentFile.name}`, 'error');
           addLog("Initiating Active Defense Protocol...", 'warning');
           addLog("Isolating malicious payload...", 'warning');
        } else {
           setStatus('ENCRYPTING');
           addLog("SCAN RESULT: 0 Threats Found. File Clean.", 'success');
           addLog(`Memecah file menjadi ${activeNodeCount * 3} shard terenkripsi...`);
        }
      }

      // 2. CLEANING PHASE (25% -> 45%)
      if (currentStatus === 'CLEANING') {
          // Random cleaning logs
          if (Math.floor(nextProgress) % 5 === 0 && Math.random() > 0.5) {
             const cleanLogs = ["Patching binary header...", "Removing script injection...", "Sanitizing executable code..."];
             addLog(cleanLogs[Math.floor(Math.random() * cleanLogs.length)], 'warning');
          }

          // Done Cleaning
          if (nextProgress >= 45) {
              setStatus('ENCRYPTING');
              setWasCleaned(true); // Mark as cleaned
              addLog("CLEANING COMPLETE: Malware neutralized.", 'success');
              addLog("File aman. Melanjutkan enkripsi...", 'info');
          }
      }

      // 3. ENCRYPTION (Ends at 60%)
      if (currentStatus === 'ENCRYPTING' && nextProgress >= 60) {
        setStatus('SENDING');
        addLog("Mendistribusikan shard ke jaringan node...");
      }

      // 4. SENDING (60% -> 80%)
      if (currentStatus === 'SENDING' && nextProgress > 70 && nextProgress < 72) {
         addLog(`Verifikasi konsensus oleh ${activeNodeCount} node aktif...`);
      }

      if (currentStatus === 'SENDING' && nextProgress >= 80) {
        setStatus('DECRYPTING');
        addLog("Penerima mengunduh dan memverifikasi hash...");
      }

      // 5. DECRYPTING (80% -> 100%)
      if (currentStatus === 'DECRYPTING' && nextProgress > 90 && nextProgress < 92) {
          addLog("Menyatukan kembali shard & dekripsi lokal...");
      }

      // COMPLETION
      if (nextProgress >= 100) {
        clearInterval(interval);
        setStatus('COMPLETED');
        addLog("Transfer Selesai. Integritas data terverifikasi.", 'success');
      }

    }, 50);
  };

  // Helper to determine color based on status
  const getStatusColor = () => {
      if (status === 'SCANNING') return 'text-amber-400';
      if (status === 'CLEANING') return 'text-purple-400';
      if (status === 'COMPLETED') return 'text-emerald-500';
      if (status === 'BLOCKED') return 'text-red-500';
      return 'text-cyber-primary';
  };

  const getBarColor = () => {
      if (status === 'BLOCKED') return 'bg-red-600 shadow-[0_0_10px_#ef4444]';
      if (status === 'SCANNING') return 'bg-amber-500 shadow-[0_0_10px_#f59e0b]';
      if (status === 'CLEANING') return 'bg-purple-500 shadow-[0_0_10px_#a855f7]';
      return 'bg-emerald-500 shadow-[0_0_10px_#10b981]';
  };

  const currentFileList = fileCategory === 'SAFE' ? SAFE_FILES : MALWARE_FILES;

  return (
    <div className="bg-cyber-800 border border-cyber-700 rounded-lg p-6 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="text-emerald-400" />
        <h2 className="text-lg font-bold text-white">Simulasi Transfer File P2P Terenkripsi</h2>
      </div>

      {/* Main Visualization Area */}
      <div className="grid grid-cols-7 gap-4 items-center mb-6">
        
        {/* SENDER */}
        <div className="col-span-2 flex flex-col items-center p-4 bg-cyber-900/50 rounded border border-cyber-700">
            <Laptop size={32} className="text-cyber-primary mb-2" />
            <span className="text-xs font-mono text-cyber-500 mb-3">CLIENT A (PENGIRIM)</span>
            
            {/* Category Toggle */}
            <div className="flex w-full mb-3 bg-cyber-900 rounded p-1">
               <button 
                 onClick={() => { setFileCategory('SAFE'); setSelectedFile(SAFE_FILES[0]); }}
                 disabled={status !== 'IDLE' && status !== 'COMPLETED' && status !== 'BLOCKED'}
                 className={`flex-1 text-[10px] py-1 rounded font-bold transition-all ${fileCategory === 'SAFE' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 AMAN
               </button>
               <button 
                 onClick={() => { setFileCategory('MALWARE'); setSelectedFile(MALWARE_FILES[0]); }}
                 disabled={status !== 'IDLE' && status !== 'COMPLETED' && status !== 'BLOCKED'}
                 className={`flex-1 text-[10px] py-1 rounded font-bold transition-all ${fileCategory === 'MALWARE' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 MALWARE
               </button>
            </div>

            <div className="w-full space-y-2">
                {currentFileList.map((f, i) => (
                    <button 
                        key={i}
                        onClick={() => (status === 'IDLE' || status === 'COMPLETED' || status === 'BLOCKED') ? setSelectedFile(f) : null}
                        className={`w-full text-left text-xs p-2 rounded flex items-center gap-2 transition-all
                            ${selectedFile.name === f.name 
                                ? (f.isMalware ? 'bg-red-900/40 border border-red-500 text-red-200' : 'bg-cyber-primary/20 border border-cyber-primary text-white')
                                : 'bg-cyber-900 border border-transparent hover:bg-cyber-700 text-gray-400'}
                            ${(status !== 'IDLE' && status !== 'COMPLETED' && status !== 'BLOCKED') ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {f.isMalware ? <Skull size={12} /> : <FileText size={12} />}
                        <div className="truncate flex-1">{f.name}</div>
                    </button>
                ))}
            </div>
        </div>

        {/* NETWORK / ANIMATION */}
        <div className="col-span-3 flex flex-col items-center justify-center relative h-full min-h-[120px]">
            {/* Progress Line */}
            <div className="w-full h-1 bg-cyber-700 absolute top-1/2 -translate-y-1/2 z-0"></div>
            
            {/* Animated Progress Bar */}
            <div 
                className={`h-1 absolute top-1/2 -translate-y-1/2 z-0 transition-all duration-75 ${getBarColor()}`}
                style={{ width: `${progress}%`, left: 0 }}
            ></div>

            {/* Status Badge in Middle */}
            <div className={`z-10 bg-cyber-900 border px-3 py-1 rounded-full flex items-center gap-2 shadow-xl transition-colors
               ${status === 'BLOCKED' ? 'border-red-500 shadow-red-500/20' : 'border-cyber-600'}
               ${status === 'SCANNING' ? 'border-amber-500/50' : ''}
               ${status === 'CLEANING' ? 'border-purple-500/50' : ''}
            `}>
                {status === 'IDLE' && <span className="text-xs text-gray-500">Siap Transfer</span>}
                
                {status === 'SCANNING' && <Scan size={14} className="text-amber-400 animate-spin-slow" />}
                {status === 'CLEANING' && <Eraser size={14} className="text-purple-400 animate-bounce" />}
                {status === 'ENCRYPTING' && <Lock size={14} className="text-cyan-400 animate-pulse" />}
                {status === 'SENDING' && <Server size={14} className="text-blue-400 animate-pulse" />}
                {status === 'DECRYPTING' && <ShieldCheck size={14} className="text-emerald-400 animate-pulse" />}
                {status === 'COMPLETED' && <CheckCircle size={14} className="text-emerald-500" />}
                {status === 'BLOCKED' && <Ban size={14} className="text-red-500" />}
                
                <span className={`text-xs font-bold font-mono ${getStatusColor()}`}>
                    {status === 'IDLE' ? 'IDLE' : status}
                </span>
            </div>

            {/* Shards / Scan Visualization */}
            {(status !== 'IDLE' && status !== 'COMPLETED' && status !== 'BLOCKED') && (
                <div className="absolute bottom-2 text-[10px] text-cyber-500 font-mono animate-bounce flex items-center gap-1">
                    {status === 'SCANNING' && <><Bug size={10} /> Scanning for malware...</>}
                    {status === 'CLEANING' && <><Sparkles size={10} className="text-purple-400" /> Removing Threats...</>}
                    {(status === 'ENCRYPTING' || status === 'SENDING') && <>{activeNodeCount} Nodes Verifying</>}
                </div>
            )}

            {status === 'BLOCKED' && (
               <div className="absolute bottom-2 text-[10px] text-red-500 font-mono font-bold flex items-center gap-1 animate-pulse">
                  <ShieldAlert size={10} /> THREAT NEUTRALIZED
               </div>
            )}
        </div>

        {/* RECEIVER */}
        <div className="col-span-2 flex flex-col items-center p-4 bg-cyber-900/50 rounded border border-cyber-700 relative">
            <Smartphone size={32} className="text-emerald-400 mb-2" />
            <span className="text-xs font-mono text-cyber-500 mb-2">CLIENT B (PENERIMA)</span>
            
            <div className={`w-full h-24 border-2 border-dashed rounded flex items-center justify-center bg-black/20 transition-colors
                ${status === 'BLOCKED' ? 'border-red-900 bg-red-900/10' : 'border-cyber-700'}
            `}>
                {status === 'COMPLETED' ? (
                    <div className="text-center animate-fade-in">
                        {wasCleaned ? (
                           <Sparkles size={24} className="text-purple-400 mx-auto mb-1" />
                        ) : (
                           <FileText size={24} className="text-emerald-500 mx-auto mb-1" />
                        )}
                        <div className={`text-xs font-bold ${wasCleaned ? 'text-purple-400' : 'text-emerald-400'}`}>
                          {wasCleaned ? 'DITERIMA (BERSIH)' : 'DITERIMA'}
                        </div>
                        <div className="text-[10px] text-gray-500">{selectedFile.name}</div>
                        {wasCleaned && <div className="text-[9px] text-purple-500/70 mt-1">Malware Removed</div>}
                    </div>
                ) : status === 'BLOCKED' ? (
                    <div className="text-center animate-pulse">
                        <ShieldAlert size={24} className="text-red-500 mx-auto mb-1" />
                        <div className="text-xs text-red-500 font-bold">DIBLOKIR</div>
                        <div className="text-[10px] text-red-400/70">Malware Detected</div>
                    </div>
                ) : (
                    <div className="text-xs text-cyber-600">Menunggu data...</div>
                )}
            </div>
        </div>
      </div>

      {/* Action & Logs */}
      <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={startTransfer}
            disabled={status !== 'IDLE' && status !== 'COMPLETED' && status !== 'BLOCKED'}
            className={`px-6 py-3 rounded font-bold text-sm font-mono flex items-center justify-center gap-2
                ${status === 'IDLE' || status === 'COMPLETED' || status === 'BLOCKED'
                    ? 'bg-cyber-primary hover:bg-cyan-400 text-cyber-900 shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
                    : 'bg-cyber-700 text-gray-500 cursor-not-allowed'}
            `}
          >
            {(status === 'IDLE' || status === 'COMPLETED' || status === 'BLOCKED') ? <Scan size={16} /> : <ArrowRight size={16} />}
            {(status === 'IDLE' || status === 'COMPLETED' || status === 'BLOCKED') ? 'SCAN & KIRIM' : 'MEMPROSES...'}
          </button>

          <div className="flex-1 bg-black/40 rounded border border-cyber-700 p-2 font-mono text-xs h-24 overflow-hidden flex flex-col-reverse">
            {logs.length === 0 && <span className="text-cyber-600 italic">System log ready...</span>}
            {logs.map((log, i) => {
                let color = 'text-emerald-500/80';
                if (log.includes('ERROR')) color = 'text-red-400 font-bold';
                if (log.includes('WARNING')) color = 'text-amber-400 font-bold';
                if (log.includes('SUCCESS')) color = 'text-emerald-400 font-bold';
                return (
                    <div key={i} className={`${color} truncate`}>
                        <span className="text-cyber-500 mr-2">{'>'}</span>{log}
                    </div>
                );
            })}
          </div>
      </div>

    </div>
  );
};

export default FileTransferSimulation;