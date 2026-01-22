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

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        
        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
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
            Kvanttilaskentaan perustuva forex-kaupankäyntijärjestelmä, joka yhdistää 
            Qiskit-kvanttisimulaation ja MetaTrader 4:n reaaliaikaiseen kaupankäyntiin.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-16">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-slate-900/50 border border-slate-800 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Yleiskatsaus</TabsTrigger>
            <TabsTrigger value="quantum" className="data-[state=active]:bg-purple-600">Kvanttimalli</TabsTrigger>
            <TabsTrigger value="architecture" className="data-[state=active]:bg-purple-600">Arkkitehtuuri</TabsTrigger>
            <TabsTrigger value="setup" className="data-[state=active]:bg-purple-600">Asennus</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2">
                    <Cpu className="h-5 w-5 text-purple-400" />
                  </div>
                  <CardTitle className="text-white">Kvanttilaskenta</CardTitle>
                  <CardDescription>
                    4-qubit kvanttisimulaatio Qiskitillä
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-slate-400 text-sm">
                  ZZFeatureMap-enkoodaus ja RealAmplitudes-ansatz mahdollistavat 
                  monimutkaisten markkinakuvioiden tunnistamisen.
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                  </div>
                  <CardTitle className="text-white">Live Trading</CardTitle>
                  <CardDescription>
                    MetaTrader 4 -integraatio
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-slate-400 text-sm">
                  Automaattinen kaupankäynti reaaliaikaisilla signaaleilla, 
                  dynaamisella lot-koolla ja riskinhallinnalla.
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800 hover:border-green-500/50 transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-2">
                    <Shield className="h-5 w-5 text-green-400" />
                  </div>
                  <CardTitle className="text-white">Luotettavuus</CardTitle>
                  <CardDescription>
                    Heartbeat & logging
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-slate-400 text-sm">
                  30 sekunnin heartbeat-tarkistus, rotating file logging ja 
                  automaattinen mallin uudelleenlataus.
                </CardContent>
              </Card>
            </div>

            {/* System Flow Diagram */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Järjestelmän Toimintakaavio</CardTitle>
                <CardDescription>Signaalin kulku datasta kaupankäyntiin</CardDescription>
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
                  <CardTitle className="text-white text-lg">📊 Syötteet (Features)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FeatureItem label="Close Price" description="Sulkemishinta normalisoituna" />
                  <FeatureItem label="Returns" description="Logaritmiset tuotot" />
                  <FeatureItem label="RSI (14)" description="Relative Strength Index" />
                  <FeatureItem label="MACD" description="Moving Average Convergence Divergence" />
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">🎯 Signaalit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SignalItem type="BUY" description="P(UP) > P(DOWN) ja confidence ≥ 55%" color="green" />
                  <SignalItem type="SELL" description="P(DOWN) > P(UP) ja confidence ≥ 55%" color="red" />
                  <SignalItem type="NEUTRAL" description="Confidence < 55% tai tasapeli" color="yellow" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quantum Tab */}
          <TabsContent value="quantum" className="space-y-8">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Kvanttineuroverkko (QNN)</CardTitle>
                <CardDescription>
                  Qiskit-pohjainen kvanttikoneoppimismalli markkinaennustuksiin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quantum Circuit Visualization */}
                <div className="bg-black/50 rounded-xl p-6 border border-slate-700">
                  <h4 className="text-purple-400 font-mono text-sm mb-4">Kvanttipiirin rakenne:</h4>
                  <pre className="text-xs md:text-sm text-slate-300 font-mono overflow-x-auto">
{`     ┌──────────────────┐ ┌────────────────────────┐ ┌───┐
q_0: ┤ ZZFeatureMap(x₀) ├─┤ RealAmplitudes(θ₀-θ₂) ├─┤ Z ├─── Mittaus
     ├──────────────────┤ ├────────────────────────┤ └───┘
q_1: ┤ ZZFeatureMap(x₁) ├─┤ RealAmplitudes(θ₃-θ₅) ├───────
     ├──────────────────┤ ├────────────────────────┤
q_2: ┤ ZZFeatureMap(x₂) ├─┤ RealAmplitudes(θ₆-θ₈) ├───────
     ├──────────────────┤ ├────────────────────────┤
q_3: ┤ ZZFeatureMap(x₃) ├─┤ RealAmplitudes(θ₉-θ₁₁)├───────
     └──────────────────┘ └────────────────────────┘

     ↑ Feature Encoding    ↑ Trainable Ansatz       ↑ Observable`}
                  </pre>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">ZZFeatureMap</h4>
                    <p className="text-slate-400 text-sm">
                      Koodaa 4 klassista piirrettä (Close, Returns, RSI, MACD) 
                      kvanttitilaan käyttäen ZZ-kietoutumisportteja. Tämä mahdollistaa 
                      piirteiden välisten korrelaatioiden oppimisen.
                    </p>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <code className="text-purple-300 text-xs">
                        |ψ⟩ = ZZFeatureMap(x) |0000⟩
                      </code>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">RealAmplitudes</h4>
                    <p className="text-slate-400 text-sm">
                      12 optimoitavaa parametria (θ), jotka opitaan COBYLA-optimoijalla. 
                      Ansatz tuottaa kietoutuneita tiloja, jotka mahdollistavat 
                      monimutkaisten päätösrajojen oppimisen.
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
                  <h4 className="text-white font-semibold">Ennustusprosessi</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">🔄</div>
                      <h5 className="text-white font-medium mb-1">1. Enkoodaus</h5>
                      <p className="text-slate-400 text-xs">Piirteet → Kvanttitila</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">⚡</div>
                      <h5 className="text-white font-medium mb-1">2. Evoluutio</h5>
                      <p className="text-slate-400 text-xs">Parametrisoitu ansatz</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">📏</div>
                      <h5 className="text-white font-medium mb-1">3. Mittaus</h5>
                      <p className="text-slate-400 text-xs">Z-observable → P(UP/DOWN)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Details */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Koulutusprosessi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4 text-center">
                    <StatCard label="Data" value="~12,000" unit="näytettä" />
                    <StatCard label="Epochit" value="20" unit="per kierros" />
                    <StatCard label="Validointi" value="20%" unit="split" />
                    <StatCard label="Päivitysväli" value="1h" unit="automaattinen" />
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl p-6 border border-slate-700">
                    <h4 className="text-white font-semibold mb-3">📈 Live Training Loop</h4>
                    <ol className="space-y-2 text-slate-300 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-0.5">1</span>
                        <span>Hae tuorein markkinadata yfinancesta (2 vuotta, H1)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-0.5">2</span>
                        <span>Laske tekniset indikaattorit (RSI, MACD)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-0.5">3</span>
                        <span>Kouluta QNN 20 iteraatiota COBYLA-optimoijalla</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-0.5">4</span>
                        <span>Validoi malli ja tallenna metriikat (accuracy, F1)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-0.5">5</span>
                        <span>Tallenna model.pkl → Bridge lataa automaattisesti</span>
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
                description="Jatkuva mallin koulutus"
                features={[
                  "Hakee dataa yfinancesta tunnin välein",
                  "Laskee RSI & MACD indikaattorit",
                  "Kouluttaa QNN:n ja validoi tulokset",
                  "Tallentaa model.pkl ja metriikat"
                ]}
              />

              <ComponentCard
                title="file_bridge.py"
                icon={<FileText className="h-5 w-5" />}
                color="cyan"
                description="MT4 ↔ Python kommunikaatio"
                features={[
                  "Monitoroi quantum_request.txt tiedostoa",
                  "Lataa mallin ja laskee ennustuksen",
                  "Kirjoittaa signaalin quantum_response.txt",
                  "30s heartbeat MT4:lle"
                ]}
              />

              <ComponentCard
                title="quantum_model.py"
                icon={<Zap className="h-5 w-5" />}
                color="yellow"
                description="Kvanttimalli-luokka"
                features={[
                  "4-qubit ZZFeatureMap enkoodaus",
                  "RealAmplitudes ansatz (12 parametria)",
                  "COBYLA optimoija",
                  "Scikit-learn yhteensopiva API"
                ]}
              />

              <ComponentCard
                title="QuantumFileClient3.mq4"
                icon={<TrendingUp className="h-5 w-5" />}
                color="green"
                description="MetaTrader 4 Expert Advisor"
                features={[
                  "Lähettää hintadatan Pythonille",
                  "Lukee signaalit ja confidence-arvot",
                  "Dynaaminen lot-koko (0.01-0.09)",
                  "Stop-loss ja heartbeat-tarkistus"
                ]}
              />
            </div>

            {/* File Communication */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Tiedostopohjainen Kommunikaatio</CardTitle>
                <CardDescription>MT4 Files -kansion kautta</CardDescription>
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
                <CardTitle className="text-white">Vaatimukset</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-semibold mb-3">Software</h4>
                    <ul className="space-y-2">
                      <RequirementItem text="Python 3.10+" />
                      <RequirementItem text="MetaTrader 4" />
                      <RequirementItem text="Windows (MT4-yhteensopivuus)" />
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-3">Python-kirjastot</h4>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400">
                      pip install numpy pandas scikit-learn yfinance qiskit qiskit-machine-learning qiskit-algorithms
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Käynnistysjärjestys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <SetupStep 
                    number={1} 
                    title="Kopioi EA MetaTraderiin" 
                    command="Kopioi QuantumFileClient3.mq4 → MQL4\Experts\"
                    note="Käännä EA MetaEditorissa ja liitä EURUSD H1 -charttiin"
                  />
                  <SetupStep 
                    number={2} 
                    title="Käynnistä Trainer (terminaali 1)" 
                    command="cd quantum-forex-fixed && python live_trainer.py"
                    note="Odota kunnes näet 'Model saved to model.pkl'"
                  />
                  <SetupStep 
                    number={3} 
                    title="Käynnistä Bridge (terminaali 2)" 
                    command="cd quantum-forex-fixed && python file_bridge.py"
                    note="Anna MT4 Files -polku kun kysytään"
                  />
                  <SetupStep 
                    number={4} 
                    title="Aktivoi EA MetaTraderissa" 
                    command="Expert Advisors → Allow live trading"
                    note="Varmista että AutoTrading-nappi on päällä"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            <Card className="bg-red-950/30 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Varoitukset
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-red-200/80">
                <p>⚠️ <strong>DEMOTILI ENSIN</strong> - Testaa aina demotilillä ennen oikeaa rahaa</p>
                <p>⚠️ <strong>RISKINHALLINTA</strong> - Älä riskeeraa enempää kuin olet valmis häviämään</p>
                <p>⚠️ <strong>VALVO JÄRJESTELMÄÄ</strong> - Tarkista lokit ja heartbeat säännöllisesti</p>
                <p>⚠️ <strong>EI TAKUITA</strong> - Kvanttialgoritmi ei takaa voittoja</p>
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
    <div className={`rounded-xl border p-4 text-center ${colors[color as keyof typeof colors]}`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs opacity-70">{subtitle}</div>
    </div>
  );
};

const FeatureItem = ({ label, description }: { label: string; description: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
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
  <div className="bg-slate-800/50 rounded-lg p-4">
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
    <Card className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} border`}>
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
  <div className="bg-black/50 rounded-lg border border-slate-700 overflow-hidden">
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
  <div className="flex gap-4">
    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
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
