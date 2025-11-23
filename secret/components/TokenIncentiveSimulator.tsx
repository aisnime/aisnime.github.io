import React, { useState, useEffect, useRef } from 'react';
import { Coins, Zap, Activity, Box, ArrowRight, TrendingUp, Wallet, AlertTriangle, Cpu, ChevronDown } from 'lucide-react';
import { NetworkNode, NodeStatus } from '../types';

interface Props {
  nodes: NetworkNode[];
}

interface MinedBlock {
  height: number;
  hash: string;
  reward: number;
  minerId: string;
  timestamp: Date;
  currency: string;
}

type CurrencyType = 'DST' | 'ETH' | 'IDR';

const CURRENCY_CONFIG = {
  DST: { label: 'DesentralShield (DST)', reward: 50, icon: '🛡️' },
  ETH: { label: 'Ethereum (ETH)', reward: 0.0025, icon: 'Ξ' },
  IDR: { label: 'Rupiah (IDR)', reward: 25000, icon: 'Rp' }
};

// Simple spinner helper defined at the top to avoid hoisting issues
const Loader2Icon = () => (
  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const TokenIncentiveSimulator: React.FC<Props> = ({ nodes }) => {
  const [blocks, setBlocks] = useState<MinedBlock[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [currentHashRate, setCurrentHashRate] = useState(0);
  const [isMining, setIsMining] = useState(true);
  const [currency, setCurrency] = useState<CurrencyType>('DST');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter only valid nodes for reward calculation
  const activeNodes = nodes.filter(n => n.status === NodeStatus.ACTIVE);
  const compromisedNodes = nodes.filter(n => n.status === NodeStatus.COMPROMISED);

  // Reset balance when currency changes
  useEffect(() => {
    setUserBalance(0);
    setBlocks([]);
  }, [currency]);

  // Calculate total network hashrate
  useEffect(() => {
    const total = activeNodes.reduce((acc, curr) => acc + curr.contribution, 0);
    setCurrentHashRate(total);
  }, [nodes]);

  // Mining Loop Simulation
  useEffect(() => {
    if (!isMining || activeNodes.length === 0) return;

    const interval = setInterval(() => {
      // Find a "Winner" based on contribution probability
      const totalPower = activeNodes.reduce((acc, n) => acc + n.contribution, 0);
      // Fallback if totalPower is 0
      if (totalPower <= 0) return;

      let randomPoint = Math.random() * totalPower;
      let winner = activeNodes[0];

      for (const node of activeNodes) {
        if (randomPoint < node.contribution) {
          winner = node;
          break;
        }
        randomPoint -= node.contribution;
      }

      if (!winner) return;

      const currentReward = CURRENCY_CONFIG[currency].reward;

      const newBlock: MinedBlock = {
        height: blocks.length + 10420, // Mock block height
        hash: "0x" + Math.random().toString(36).substring(2, 15) + "...",
        reward: currentReward,
        minerId: winner.id,
        timestamp: new Date(),
        currency: currency
      };

      setBlocks(prev => [newBlock, ...prev].slice(0, 8)); // Keep last 8 blocks

      // If the winner is one of our nodes, add to balance
      // (In this simulation, all nodes are "ours" for visual purposes)
      setUserBalance(prev => {
         const newVal = prev + currentReward;
         // Handle float precision for ETH
         return currency === 'ETH' ? parseFloat(newVal.toFixed(4)) : newVal;
      });

    }, 3000); // New block every 3 seconds

    return () => clearInterval(interval);
  }, [isMining, activeNodes, blocks.length, currency]);

  return (
    <div className="bg-cyber-800 border border-cyber-700 rounded-lg p-6 h-full flex flex-col relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
        <Coins size={120} />
      </div>

      {/* Header Section (Fixed Height) */}
      <div className="flex items-center justify-between mb-6 z-10 shrink-0 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-lg border border-yellow-500/50">
            <Coins className="text-yellow-400" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Incentive Layer</h2>
            <p className="text-xs text-cyber-500 font-mono">Automated Reward Distribution</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           {/* Currency Selector */}
           <div className="relative">
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                className="appearance-none bg-cyber-900 border border-cyber-600 text-white text-xs font-bold py-2 pl-3 pr-8 rounded focus:outline-none focus:border-cyber-primary cursor-pointer hover:border-gray-500 transition-colors"
              >
                <option value="DST">DST (Native)</option>
                <option value="ETH">ETH (Crypto)</option>
                <option value="IDR">IDR (Fiat)</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
           </div>

           {/* Wallet Display */}
           <div className="bg-cyber-900 border border-cyber-600 rounded-lg px-4 py-2 flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase font-mono">Total Pendapatan</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  {currency === 'IDR' ? 'Rp ' : ''}{userBalance.toLocaleString()}{currency !== 'IDR' ? ` ${currency}` : ''}
                </div>
              </div>
              <Wallet className="text-cyber-primary" />
           </div>
        </div>
      </div>

      {/* Main Content Area (Flex Grow to fill remaining height) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 z-10">
        
        {/* LEFT: Stats & Explanation (Scrollable) */}
        <div className="col-span-1 flex flex-col h-full overflow-hidden">
           <div className="overflow-y-auto pr-2 space-y-4 h-full">
               <div className="bg-black/30 border border-cyber-700 rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-xs text-gray-400">Network Hashrate</span>
                     <Activity size={14} className="text-cyber-primary" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono flex items-baseline gap-2">
                     {currentHashRate} <span className="text-sm text-cyber-500">MH/s</span>
                  </div>
                  <div className="w-full bg-cyber-900 h-1 mt-2 rounded-full overflow-hidden">
                     <div className="bg-cyber-primary h-full animate-pulse" style={{ width: '100%' }}></div>
                  </div>
               </div>

               <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded text-xs text-gray-300 space-y-2">
                  <h4 className="font-bold text-blue-400 flex items-center gap-2"><TrendingUp size={14}/> Mengapa {currency}?</h4>
                  <p>
                    {currency === 'DST' && "Token Native (DST) digunakan untuk membayar gas fee dan mengamankan jaringan internal DesentralShield."}
                    {currency === 'ETH' && "Dalam jaringan Ethereum, penambang dibayar menggunakan ETH sebagai kompensasi memproses blok."}
                    {currency === 'IDR' && "Simulasi ini menunjukkan nilai fiat jika reward dikonversi langsung ke Rupiah."}
                  </p>
                  <div className="mt-2 pt-2 border-t border-blue-500/20">
                     <span className="text-gray-500">Block Reward saat ini: </span>
                     <strong className="text-emerald-400">
                        {currency === 'IDR' ? 'Rp ' : ''}{CURRENCY_CONFIG[currency].reward.toLocaleString()} {currency}
                     </strong>
                  </div>
               </div>

               {compromisedNodes.length > 0 && (
                  <div className="bg-red-900/20 border border-red-500/30 p-3 rounded flex items-start gap-2 animate-pulse">
                     <AlertTriangle size={16} className="text-red-500 mt-0.5" />
                     <div>
                        <div className="text-xs font-bold text-red-400">SLASHING PENALTY AKTIF</div>
                        <p className="text-[10px] text-red-300">
                           {compromisedNodes.length} Node terinfeksi tidak akan menerima reward apapun. Sistem otomatis memutus insentif bagi node jahat.
                        </p>
                     </div>
                  </div>
               )}
           </div>
        </div>

        {/* RIGHT: Block Explorer Visualization (Scrollable List) */}
        <div className="col-span-2 bg-cyber-900/50 border border-cyber-700 rounded-lg p-4 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-4 border-b border-cyber-700 pb-2 shrink-0">
               <h3 className="text-sm font-bold text-white flex items-center gap-2">
                 <Box size={16} className="text-purple-400" />
                 Live Blockchain Feed
               </h3>
               <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  CONSENSUS: SYNCED
               </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2" ref={scrollRef}>
               {blocks.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-cyber-600 opacity-50 min-h-[150px]">
                     <Loader2Icon />
                     <span className="text-xs mt-2">Menambang blok baru...</span>
                  </div>
               )}
               
               {blocks.map((block) => (
                  <div key={block.hash} className="bg-cyber-800 hover:bg-cyber-700 border border-cyber-700 p-3 rounded flex items-center justify-between transition-all animate-slide-in">
                     <div className="flex items-center gap-3">
                        <div className="bg-purple-900/30 p-2 rounded text-purple-400">
                           <Box size={18} />
                        </div>
                        <div>
                           <div className="text-xs font-bold text-emerald-400">Block #{block.height}</div>
                           <div className="text-[10px] font-mono text-gray-500">{block.hash}</div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                           <div className="text-[10px] text-gray-500">Miner</div>
                           <div className="text-xs font-mono text-cyber-primary flex items-center gap-1">
                              <Cpu size={10} />
                              {block.minerId.substring(0, 12)}...
                           </div>
                        </div>
                        <div className="bg-emerald-900/20 px-3 py-1 rounded border border-emerald-500/30 flex items-center gap-1 text-emerald-400 font-bold font-mono text-xs min-w-[80px] justify-end">
                           +{block.currency === 'IDR' ? 'Rp' : ''} {block.reward.toLocaleString()} {block.currency !== 'IDR' ? block.currency : ''}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TokenIncentiveSimulator;