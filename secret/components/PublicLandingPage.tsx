import React from 'react';
import { Shield, Globe, Smartphone, Lock, ArrowRight, CheckCircle, Menu, X, Activity, Play } from 'lucide-react';

interface Props {
  onEnterConsole: () => void;
}

const PublicLandingPage: React.FC<Props> = ({ onEnterConsole }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Shield className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">DesentralShield</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Solutions</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Network</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Docs</a>
              <button 
                onClick={onEnterConsole}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-bold transition-all hover:shadow-lg hover:shadow-indigo-500/20"
              >
                <Activity size={16} />
                Developer Console
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Mainnet Live Now
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                Security for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Decentralized Web</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                DesentralShield replaces centralized servers with a global mesh of encrypted nodes. 
                Unstoppable, private, and powered by the people.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                  Start for Free <ArrowRight size={18} />
                </button>
                <button 
                  onClick={onEnterConsole}
                  className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 rounded-lg font-bold transition-all flex items-center justify-center gap-2 hover:bg-slate-50"
                >
                   View Network Status
                </button>
              </div>
            </div>
            
            {/* Visual Illustration */}
            <div className="lg:col-span-6 mt-12 lg:mt-0 relative">
               <div className="relative rounded-2xl bg-slate-900 shadow-2xl border border-slate-800 p-2 aspect-[4/3] overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/30 blur-[100px] rounded-full"></div>
                  
                  {/* Mock Dashboard Preview */}
                  <div className="h-full w-full bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col">
                      <div className="border-b border-slate-800 p-3 flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                         <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                         <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                          <Shield size={64} className="text-indigo-500 animate-pulse" />
                          <div>
                             <div className="text-slate-400 font-mono text-sm">Encryption Status</div>
                             <div className="text-white font-bold text-2xl mt-1">MILITARY GRADE</div>
                          </div>
                          <div className="w-full max-w-[200px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500 w-[85%]"></div>
                          </div>
                      </div>
                  </div>

                  {/* Floating Cards */}
                  <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce-slow hidden md:block">
                     <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={20}/></div>
                        <div>
                           <div className="text-sm font-bold text-slate-900">Attack Blocked</div>
                           <div className="text-xs text-slate-500">2ms ago • IP 192.168.x.x</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Designed for the Future</h2>
            <p className="text-slate-600">Our protocol handles the complexity of blockchain security so you can focus on building your application.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             {[
               {
                 icon: <Globe className="text-indigo-600" size={24} />,
                 title: "Global Mesh Network",
                 desc: "Data is sharded and distributed across thousands of nodes. No single point of failure."
               },
               {
                 icon: <Lock className="text-purple-600" size={24} />,
                 title: "End-to-End Encryption",
                 desc: "Your private keys never leave your device. We facilitate the handshake, you hold the secrets."
               },
               {
                 icon: <Smartphone className="text-pink-600" size={24} />,
                 title: "Mobile-First Nodes",
                 desc: "Turn any smartphone into a validator node. Earn rewards for securing the network."
               }
             ].map((feature, i) => (
               <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                 <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                   {feature.icon}
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                 <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <p className="text-slate-500 text-sm">© 2024 DesentralShield Protocol. Open Source License.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLandingPage;