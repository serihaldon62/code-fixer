import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Cpu, 
  Database, 
  FileText, 
  Zap, 
  TrendingUp, 
  Shield, 
  Clock, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { useEffect, useState } from "react";

// Animated Quantum Circuit Component
const QuantumCircuitAnimation = () => {
  const [activeQubit, setActiveQubit] = useState(0);
  const [phase, setPhase] = useState<'encoding' | 'ansatz' | 'measurement'>('encoding');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQubit((prev) => {
        if (prev >= 3) {
          setPhase((p) => {
            if (p === 'encoding') return 'ansatz';
            if (p === 'ansatz') return 'measurement';
            return 'encoding';
          });
          return 0;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-black/60 rounded-xl p-6 border border-slate-700 overflow-hidden">
      {/* Background glow effect */}
      <div 
        className="absolute inset-0 opacity-30 transition-all duration-500"
        style={{
          background: phase === 'encoding' 
            ? 'radial-gradient(ellipse at 30% 50%, rgba(168, 85, 247, 0.4), transparent 60%)'
            : phase === 'ansatz'
            ? 'radial-gradient(ellipse at 50% 50%, rgba(34, 211, 238, 0.4), transparent 60%)'
            : 'radial-gradient(ellipse at 70% 50%, rgba(34, 197, 94, 0.4), transparent 60%)'
        }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-purple-400 font-mono text-sm">Quantum Circuit Structure:</h4>
          <div className="flex gap-2">
            <Badge variant={phase === 'encoding' ? 'default' : 'outline'} className={phase === 'encoding' ? 'bg-purple-600 animate-pulse' : ''}>
              Encoding
            </Badge>
            <Badge variant={phase === 'ansatz' ? 'default' : 'outline'} className={phase === 'ansatz' ? 'bg-cyan-600 animate-pulse' : ''}>
              Ansatz
            </Badge>
            <Badge variant={phase === 'measurement' ? 'default' : 'outline'} className={phase === 'measurement' ? 'bg-green-600 animate-pulse' : ''}>
              Measurement
            </Badge>
          </div>
        </div>
        
        {/* Quantum Circuit Visualization */}
        <div className="space-y-3 font-mono text-sm">
          {[0, 1, 2, 3].map((qubit) => (
            <div 
              key={qubit}
              className={`flex items-center gap-2 p-2 rounded transition-all duration-300 ${
                activeQubit === qubit ? 'bg-white/10' : ''
              }`}
            >
              <span className={`w-8 transition-colors duration-300 ${
                activeQubit === qubit ? 'text-cyan-400' : 'text-slate-500'
              }`}>
                q_{qubit}:
              </span>
              
              {/* Initial state */}
              <div className={`px-2 py-1 rounded border transition-all duration-300 ${
                activeQubit === qubit && phase === 'encoding' 
                  ? 'border-purple-400 bg-purple-500/20 text-purple-300 scale-110' 
                  : 'border-slate-600 text-slate-400'
              }`}>
                |0⟩
              </div>
              
              <span className="text-slate-600">──</span>
              
              {/* Feature Map */}
              <div className={`px-3 py-1 rounded border transition-all duration-300 ${
                activeQubit === qubit && phase === 'encoding'
                  ? 'border-purple-400 bg-purple-500/30 text-purple-300 shadow-lg shadow-purple-500/20 scale-105'
                  : phase === 'encoding' && activeQubit > qubit
                  ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                  : 'border-slate-700 text-slate-500'
              }`}>
                ZZ(x_{qubit})
              </div>
              
              <span className="text-slate-600">──</span>
              
              {/* Ansatz */}
              <div className={`px-3 py-1 rounded border transition-all duration-300 ${
                activeQubit === qubit && phase === 'ansatz'
                  ? 'border-cyan-400 bg-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/20 scale-105'
                  : phase === 'ansatz' && activeQubit > qubit
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                  : phase === 'measurement' || (phase === 'ansatz' && activeQubit > qubit)
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                  : 'border-slate-700 text-slate-500'
              }`}>
                Ry(θ_{qubit * 3}..θ_{qubit * 3 + 2})
              </div>
              
              <span className="text-slate-600">──</span>
              
              {/* Measurement (only on q_0) */}
              {qubit === 0 ? (
                <div className={`px-3 py-1 rounded border transition-all duration-300 ${
                  phase === 'measurement'
                    ? 'border-green-400 bg-green-500/30 text-green-300 shadow-lg shadow-green-500/20 animate-pulse'
                    : 'border-slate-700 text-slate-500'
                }`}>
                  ⟨Z⟩ → P(↑/↓)
                </div>
              ) : (
                <span className="text-slate-600 px-3">────────</span>
              )}
            </div>
          ))}
        </div>
        
        {/* Phase description */}
        <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-sm text-slate-300">
            {phase === 'encoding' && (
              <>
                <span className="text-purple-400 font-semibold">Feature Encoding:</span> Market data (Close, Returns, RSI, MACD) is encoded into quantum states using ZZFeatureMap gates
              </>
            )}
            {phase === 'ansatz' && (
              <>
                <span className="text-cyan-400 font-semibold">Variational Ansatz:</span> RealAmplitudes layer applies trainable rotations (12 parameters) learned via COBYLA optimization
              </>
            )}
            {phase === 'measurement' && (
              <>
                <span className="text-green-400 font-semibold">Measurement:</span> Z-observable collapses quantum superposition into classical prediction P(UP) vs P(DOWN)
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

// Animated Qubit Bloch Sphere
const BlochSphereAnimation = () => {
  const [angle, setAngle] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Sphere outline */}
      <div className="absolute inset-0 rounded-full border-2 border-purple-500/30" />
      <div className="absolute inset-4 rounded-full border border-purple-500/20" />
      
      {/* Equator */}
      <div 
        className="absolute inset-0 border-2 border-cyan-400/40 rounded-full"
        style={{ transform: 'rotateX(70deg)' }}
      />
      
      {/* State vector */}
      <div 
        className="absolute top-1/2 left-1/2 w-1 h-16 bg-gradient-to-t from-transparent via-green-400 to-green-300 origin-bottom"
        style={{ 
          transform: `translate(-50%, -100%) rotateZ(${angle}deg) rotateX(${Math.sin(angle * Math.PI / 180) * 30}deg)`,
        }}
      >
        <div className="absolute -top-2 -left-1 w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
      </div>
      
      {/* Labels */}
      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-slate-400">|0⟩</span>
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400">|1⟩</span>
    </div>
  );
};

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        
        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center animate-pulse">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <Badge variant="outline" className="border-purple-500/50 text-purple-300">
              v2.0 Quantum
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Quantum Forex
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> Trading System</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl">
            A quantum computing-based forex trading system that combines 
            Qiskit quantum simulation with MetaTrader 4 for real-time trading.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-16">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-slate-900/50 border border-slate-800 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
            <TabsTrigger value="quantum" className="data-[state=active]:bg-purple-600">Quantum Model</TabsTrigger>
            <TabsTrigger value="architecture" className="data-[state=active]:bg-purple-600">Architecture</TabsTrigger>
            <TabsTrigger value="setup" className="data-[state=active]:bg-purple-600">Setup</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-colors group">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Cpu className="h-5 w-5 text-purple-400" />
                  </div>
                  <CardTitle className="text-white">Quantum Computing</CardTitle>
                  <CardDescription>
                    4-qubit quantum simulation with Qiskit
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-slate-400 text-sm">
                  ZZFeatureMap encoding and RealAmplitudes ansatz enable 
                  recognition of complex market patterns.
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-colors group">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                  </div>
                  <CardTitle className="text-white">Live Trading</CardTitle>
                  <CardDescription>
                    MetaTrader 4 integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-slate-400 text-sm">
                  Automatic trading with real-time signals, 
                  dynamic lot sizing, and risk management.
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800 hover:border-green-500/50 transition-colors group">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Shield className="h-5 w-5 text-green-400" />
                  </div>
                  <CardTitle className="text-white">Reliability</CardTitle>
                  <CardDescription>
                    Heartbeat & logging
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-slate-400 text-sm">
                  30-second heartbeat checks, rotating file logging, and 
                  automatic model reloading.
                </CardContent>
              </Card>
            </div>

            {/* System Flow Diagram */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">System Flow Diagram</CardTitle>
                <CardDescription>Signal flow from data to trade execution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-center gap-4 py-8">
                  <FlowStep icon={<Database className="h-5 w-5" />} title="Market Data" subtitle="yfinance" color="blue" />
                  <ArrowRight className="h-6 w-6 text-slate-600" />
                  <FlowStep icon={<Cpu className="h-5 w-5" />} title="Feature Engineering" subtitle="RSI, MACD, Returns" color="purple" />
                  <ArrowRight className="h-6 w-6 text-slate-600" />
                  <FlowStep icon={<Zap className="h-5 w-5" />} title="Quantum Circuit" subtitle="4-qubit QNN" color="cyan" />
                  <ArrowRight className="h-6 w-6 text-slate-600" />
                  <FlowStep icon={<FileText className="h-5 w-5" />} title="File Bridge" subtitle="JSON I/O" color="yellow" />
                  <ArrowRight className="h-6 w-6 text-slate-600" />
                  <FlowStep icon={<TrendingUp className="h-5 w-5" />} title="MT4 EA" subtitle="Trade Execution" color="green" />
                </div>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">📊 Input Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FeatureItem label="Close Price" description="Normalized closing price" />
                  <FeatureItem label="Returns" description="Logarithmic returns" />
                  <FeatureItem label="RSI (14)" description="Relative Strength Index" />
                  <FeatureItem label="MACD" description="Moving Average Convergence Divergence" />
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">🎯 Trade Signals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SignalItem type="BUY" description="P(UP) > P(DOWN) and confidence ≥ 55%" color="green" />
                  <SignalItem type="SELL" description="P(DOWN) > P(UP) and confidence ≥ 55%" color="red" />
                  <SignalItem type="NEUTRAL" description="Confidence < 55% or tie" color="yellow" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quantum Tab */}
          <TabsContent value="quantum" className="space-y-8">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Quantum Neural Network (QNN)</CardTitle>
                <CardDescription>
                  Qiskit-based quantum machine learning model for market predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Animated Quantum Circuit Visualization */}
                <QuantumCircuitAnimation />

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                      ZZFeatureMap
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Encodes 4 classical features (Close, Returns, RSI, MACD) 
                      into quantum states using ZZ entanglement gates. This enables 
                      learning correlations between features.
                    </p>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <code className="text-purple-300 text-xs">
                        |ψ⟩ = ZZFeatureMap(x) |0000⟩
                      </code>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                      RealAmplitudes
                    </h4>
                    <p className="text-slate-400 text-sm">
                      12 trainable parameters (θ) optimized using COBYLA optimizer. 
                      The ansatz produces entangled states that enable learning 
                      complex decision boundaries.
                    </p>
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                      <code className="text-cyan-300 text-xs">
                        U(θ) = RealAmplitudes(θ₀...θ₁₁)
                      </code>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Prediction Process</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center hover:scale-105 transition-transform">
                      <div className="text-3xl mb-2">🔄</div>
                      <h5 className="text-white font-medium mb-1">1. Encoding</h5>
                      <p className="text-slate-400 text-xs">Features → Quantum State</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center hover:scale-105 transition-transform">
                      <div className="text-3xl mb-2">⚡</div>
                      <h5 className="text-white font-medium mb-1">2. Evolution</h5>
                      <p className="text-slate-400 text-xs">Parameterized Ansatz</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center hover:scale-105 transition-transform">
                      <div className="text-3xl mb-2">📏</div>
                      <h5 className="text-white font-medium mb-1">3. Measurement</h5>
                      <p className="text-slate-400 text-xs">Z-observable → P(UP/DOWN)</p>
                    </div>
                  </div>
                </div>

                {/* Bloch Sphere Visualization */}
                <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
                  <h4 className="text-white font-semibold mb-4 text-center">Qubit State Visualization</h4>
                  <div className="flex items-center justify-center gap-8">
                    <BlochSphereAnimation />
                    <div className="text-slate-400 text-sm max-w-xs">
                      <p className="mb-2">
                        Each qubit exists in a <span className="text-cyan-400">superposition</span> of |0⟩ and |1⟩ states.
                      </p>
                      <p>
                        The <span className="text-green-400">state vector</span> rotates based on quantum gates, 
                        collapsing to a definite state upon measurement.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Details */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Training Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4 text-center">
                    <StatCard label="Data" value="~12,000" unit="samples" />
                    <StatCard label="Epochs" value="20" unit="per cycle" />
                    <StatCard label="Validation" value="20%" unit="split" />
                    <StatCard label="Update Interval" value="1h" unit="automatic" />
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl p-6 border border-slate-700">
                    <h4 className="text-white font-semibold mb-3">📈 Live Training Loop</h4>
                    <ol className="space-y-2 text-slate-300 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-0.5">1</span>
                        <span>Fetch latest market data from yfinance (2 years, H1 timeframe)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-0.5">2</span>
                        <span>Calculate technical indicators (RSI, MACD)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-0.5">3</span>
                        <span>Train QNN for 20 iterations with COBYLA optimizer</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-0.5">4</span>
                        <span>Validate model and log metrics (accuracy, F1 score)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-0.5">5</span>
                        <span>Save model.pkl → Bridge automatically reloads</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Component Cards */}
              <ComponentCard
                title="live_trainer.py"
                icon={<Cpu className="h-5 w-5" />}
                color="purple"
                description="Continuous model training"
                features={[
                  "Fetches data from yfinance hourly",
                  "Calculates RSI & MACD indicators",
                  "Trains QNN and validates results",
                  "Saves model.pkl and metrics"
                ]}
              />

              <ComponentCard
                title="file_bridge.py"
                icon={<FileText className="h-5 w-5" />}
                color="cyan"
                description="MT4 ↔ Python communication"
                features={[
                  "Monitors quantum_request.txt file",
                  "Loads model and computes prediction",
                  "Writes signal to quantum_response.txt",
                  "30s heartbeat to MT4"
                ]}
              />

              <ComponentCard
                title="quantum_model.py"
                icon={<Zap className="h-5 w-5" />}
                color="yellow"
                description="Quantum model class"
                features={[
                  "4-qubit ZZFeatureMap encoding",
                  "RealAmplitudes ansatz (12 parameters)",
                  "COBYLA optimizer",
                  "Scikit-learn compatible API"
                ]}
              />

              <ComponentCard
                title="QuantumFileClient3.mq4"
                icon={<TrendingUp className="h-5 w-5" />}
                color="green"
                description="MetaTrader 4 Expert Advisor"
                features={[
                  "Sends price data to Python",
                  "Reads signals and confidence values",
                  "Dynamic lot sizing (0.01-0.09)",
                  "Stop-loss and heartbeat checking"
                ]}
              />
            </div>

            {/* File Communication */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">File-Based Communication</CardTitle>
                <CardDescription>Via MT4 Files folder</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <FileCard 
                    name="quantum_request.txt" 
                    direction="MT4 → Python"
                    content={`{
  "symbol": "EURUSD",
  "timeframe": 60,
  "closes": [1.0845, 1.0847, ...]
}`}
                  />
                  <FileCard 
                    name="quantum_response.txt" 
                    direction="Python → MT4"
                    content={`{
  "signal": 1,
  "confidence": 0.72,
  "prob_up": 0.72,
  "prob_down": 0.28
}`}
                  />
                  <FileCard 
                    name="quantum_heartbeat.txt" 
                    direction="Python → MT4"
                    content={`{
  "timestamp": "2026-01-22T10:00:00",
  "status": "running",
  "model_loaded": true
}`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-8">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-semibold mb-3">Software</h4>
                    <ul className="space-y-2">
                      <RequirementItem text="Python 3.10+" />
                      <RequirementItem text="MetaTrader 4" />
                      <RequirementItem text="Windows (MT4 compatibility)" />
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-3">Python Libraries</h4>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400">
                      pip install numpy pandas scikit-learn yfinance qiskit qiskit-machine-learning qiskit-algorithms
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Startup Sequence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <SetupStep 
                    number={1} 
                    title="Copy EA to MetaTrader" 
                    command="Copy QuantumFileClient3.mq4 → MQL4\\Experts\\"
                    note="Compile EA in MetaEditor and attach to EURUSD H1 chart"
                  />
                  <SetupStep 
                    number={2} 
                    title="Start Trainer (terminal 1)" 
                    command="cd quantum-forex-fixed && python live_trainer.py"
                    note="Wait until you see 'Model saved to model.pkl'"
                  />
                  <SetupStep 
                    number={3} 
                    title="Start Bridge (terminal 2)" 
                    command="cd quantum-forex-fixed && python file_bridge.py"
                    note="Enter MT4 Files path when prompted"
                  />
                  <SetupStep 
                    number={4} 
                    title="Activate EA in MetaTrader" 
                    command="Expert Advisors → Allow live trading"
                    note="Make sure the AutoTrading button is enabled"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            <Card className="bg-red-950/30 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Warnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-red-200/80">
                <p>⚠️ <strong>DEMO ACCOUNT FIRST</strong> - Always test on a demo account before using real money</p>
                <p>⚠️ <strong>RISK MANAGEMENT</strong> - Never risk more than you can afford to lose</p>
                <p>⚠️ <strong>MONITOR THE SYSTEM</strong> - Check logs and heartbeat regularly</p>
                <p>⚠️ <strong>NO GUARANTEES</strong> - Quantum algorithm does not guarantee profits</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper Components
const FlowStep = ({ icon, title, subtitle, color }: { icon: React.ReactNode; title: string; subtitle: string; color: string }) => {
  const colors = {
    blue: "bg-blue-500/20 border-blue-500/50 text-blue-400",
    purple: "bg-purple-500/20 border-purple-500/50 text-purple-400",
    cyan: "bg-cyan-500/20 border-cyan-500/50 text-cyan-400",
    yellow: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
    green: "bg-green-500/20 border-green-500/50 text-green-400",
  };
  
  return (
    <div className={`rounded-xl border p-4 text-center hover:scale-105 transition-transform ${colors[color as keyof typeof colors]}`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs opacity-70">{subtitle}</div>
    </div>
  );
};

const FeatureItem = ({ label, description }: { label: string; description: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
    <div>
      <span className="text-white font-medium">{label}</span>
      <span className="text-slate-400 text-sm ml-2">— {description}</span>
    </div>
  </div>
);

const SignalItem = ({ type, description, color }: { type: string; description: string; color: string }) => {
  const colors = {
    green: "bg-green-500/20 text-green-400 border-green-500/50",
    red: "bg-red-500/20 text-red-400 border-red-500/50",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  };
  
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${colors[color as keyof typeof colors]}`}>
      <Badge variant="outline" className={colors[color as keyof typeof colors]}>{type}</Badge>
      <span className="text-slate-300 text-sm">{description}</span>
    </div>
  );
};

const StatCard = ({ label, value, unit }: { label: string; value: string; unit: string }) => (
  <div className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition-colors">
    <div className="text-slate-400 text-sm">{label}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-slate-500 text-xs">{unit}</div>
  </div>
);

const ComponentCard = ({ 
  title, 
  icon, 
  color, 
  description, 
  features 
}: { 
  title: string; 
  icon: React.ReactNode; 
  color: string; 
  description: string; 
  features: string[] 
}) => {
  const colors = {
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
    yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
    green: "from-green-500/20 to-green-500/5 border-green-500/30",
  };
  
  return (
    <Card className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} border hover:scale-[1.02] transition-transform`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <CardTitle className="text-white text-lg font-mono">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
              <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const FileCard = ({ name, direction, content }: { name: string; direction: string; content: string }) => (
  <div className="bg-black/50 rounded-lg border border-slate-700 overflow-hidden hover:border-slate-500 transition-colors">
    <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
      <span className="font-mono text-sm text-white">{name}</span>
      <Badge variant="outline" className="text-xs">{direction}</Badge>
    </div>
    <pre className="p-4 text-xs text-slate-400 font-mono overflow-x-auto">{content}</pre>
  </div>
);

const RequirementItem = ({ text }: { text: string }) => (
  <li className="flex items-center gap-2 text-slate-300">
    <CheckCircle className="h-4 w-4 text-green-400" />
    {text}
  </li>
);

const SetupStep = ({ number, title, command, note }: { number: number; title: string; command: string; note: string }) => (
  <div className="flex gap-4 group">
    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
      {number}
    </div>
    <div className="flex-1">
      <h4 className="text-white font-semibold">{title}</h4>
      <div className="bg-black/50 rounded-lg p-3 my-2 font-mono text-sm text-green-400">
        {command}
      </div>
      <p className="text-slate-400 text-sm flex items-center gap-2">
        <Info className="h-4 w-4" /> {note}
      </p>
    </div>
  </div>
);

export default Documentation;
