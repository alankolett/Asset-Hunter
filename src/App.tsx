import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Shield, ShieldAlert, Cpu, CheckCircle, Crosshair, Loader2, AlertTriangle, FileImage, History, Terminal } from 'lucide-react';
import { analyzeAsset, ThreatAnalysisResponse } from './lib/gemini';
import { cn } from './lib/utils';

interface HistoryItem {
  id: string;
  timestamp: string;
  textMetadata: string;
  imagePreview: string | null;
  result: ThreatAnalysisResponse;
}

export default function App() {
  const [textMetadata, setTextMetadata] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<{ mimeType: string; data: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ThreatAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Terminal expects image buffers only.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result as string;
      setImagePreview(resultStr);
      
      const match = resultStr.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        setImageBase64({
          mimeType: match[1],
          data: match[2]
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!textMetadata.trim() && !imageBase64) {
      setError('SYS_ERR: Missing target parameters. Provide metadata or visual asset.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeAsset(textMetadata, imageBase64 || undefined);
      setResult(response);
      
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
        textMetadata,
        imagePreview,
        result: response
      };
      
      setHistory(prev => [newItem, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SYS_ERR: Subroutine failure.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setTextMetadata(item.textMetadata);
    setImagePreview(item.imagePreview);
    setResult(item.result);
    // Note: imageBase64 isn't fully restored here to save state, but preview is enough.
  };

  const getThreatColor = (level: string) => {
    switch(level) {
      case 'CRITICAL': return 'bg-brand-red text-white border-brand-red';
      case 'ELEVATED': return 'bg-brand-yellow text-brand-dark border-brand-yellow';
      case 'LOW': return 'bg-brand-green text-brand-dark border-brand-green';
      default: return 'bg-gray-500 text-white border-gray-500';
    }
  };

  const getThreatTextClass = (level: string) => {
    switch(level) {
      case 'CRITICAL': return 'text-brand-red glitch-text';
      case 'ELEVATED': return 'text-brand-yellow';
      case 'LOW': return 'text-brand-green';
      default: return 'text-brand-cyan';
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-gray-200 font-sans selection:bg-brand-green selection:text-brand-dark scanlines relative overflow-hidden">
      
      <header className="border-b border-brand-border bg-brand-card/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-green/10 rounded-none border-l-2 border-brand-green text-brand-green cyber-border">
              <Crosshair className="w-5 h-5 relative z-10" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-xl leading-tight tracking-tighter text-white glitch-text uppercase">ASSET-HUNTER</h1>
              <p className="font-mono text-[10px] text-brand-cyan tracking-widest uppercase">Threat_Intel_Engine // v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-[10px] text-gray-500 tracking-widest hidden sm:block">STATUS: <span className="text-brand-green">ACTIVE</span></div>
            <div className="flex gap-1">
              <div className="h-2 w-1 bg-brand-green opacity-50" />
              <div className="h-2 w-1 bg-brand-green animate-pulse" />
              <div className="h-2 w-1 bg-brand-green opacity-20" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: HISTORY */}
          <div className="lg:col-span-3 space-y-4 order-3 lg:order-1">
            <div className="flex items-center gap-2 mb-4 border-b border-brand-border pb-3">
              <History className="w-4 h-4 text-brand-cyan" />
              <h2 className="font-mono text-sm font-semibold text-brand-cyan uppercase tracking-widest">Memory_Bank</h2>
            </div>
            
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {history.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-brand-border bg-brand-card/30">
                  <Terminal className="w-6 h-6 text-gray-500 mx-auto mb-2 opacity-50" />
                  <p className="font-mono text-xs text-gray-500 uppercase tracking-wider">No logged records</p>
                </div>
              ) : (
                history.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => loadHistoryItem(item)}
                    className="p-3 bg-brand-card border border-brand-border hover:border-brand-cyan hover:bg-brand-cyan/5 cursor-pointer transition-colors group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-border group-hover:bg-brand-cyan transition-colors" />
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <span className="font-mono text-[10px] text-gray-500 tracking-wider">[{item.timestamp}]</span>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        item.result.threat_level === 'CRITICAL' ? 'bg-brand-red animate-pulse' : 
                        item.result.threat_level === 'ELEVATED' ? 'bg-brand-yellow' : 'bg-brand-green'
                      )} />
                    </div>
                    <div className="pl-2">
                       <p className="font-mono text-xs text-gray-300 truncate mb-1">
                         {item.textMetadata || "[Visual Input Only]"}
                       </p>
                       <p className="font-mono text-[10px] text-brand-cyan truncate uppercase">
                         {item.result.primary_indicator}
                       </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MIDDLE COLUMN: INPUT */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
            <div className="bg-brand-card border border-brand-border p-5 relative">
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-brand-green" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-brand-green" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-brand-green" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-brand-green" />
              
              <div className="flex items-center gap-2 mb-4 border-b border-brand-border/50 pb-3">
                <Cpu className="w-4 h-4 text-brand-green" />
                <h2 className="font-mono text-sm font-semibold text-brand-green uppercase tracking-widest">Target_Acquisition</h2>
              </div>

              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block font-mono text-[10px] text-brand-cyan mb-2 uppercase tracking-widest flex justify-between">
                    <span>Visual Asset Data</span>
                    <span className="text-gray-500">[OPTIONAL]</span>
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border border-dashed transition-all cursor-pointer relative overflow-hidden group bg-brand-dark/50",
                      imagePreview ? "border-brand-green/30" : "border-brand-border hover:border-brand-cyan/50"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    
                    {imagePreview ? (
                      <div className="relative aspect-video w-full flex items-center justify-center p-2">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuNSIvPgo8L3N2Zz4=')] opacity-50 z-10 pointer-events-none mix-blend-overlay" />
                        <img src={imagePreview} alt="Target Asset" className="max-h-full max-w-full object-contain relative z-0" />
                        <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center backdrop-blur-sm">
                          <p className="font-mono text-[11px] text-brand-cyan border border-brand-cyan px-4 py-2 uppercase tracking-widest bg-black/50">Replace Payload</p>
                        </div>
                        <div className="absolute bottom-2 right-2 text-[8px] font-mono text-brand-green z-20 bg-black/80 px-2 py-1">IMG_BUFFER_LOADED</div>
                      </div>
                    ) : (
                      <div className="h-32 flex flex-col items-center justify-center gap-3 text-gray-500 group-hover:text-brand-cyan transition-colors">
                        <Upload className="w-6 h-6" />
                        <span className="font-mono text-[10px] uppercase tracking-widest">Intercept Image Buffer</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Metadata */}
                <div>
                  <label className="block font-mono text-[10px] text-brand-cyan mb-2 uppercase tracking-widest">Textual Metadata Stream</label>
                  <div className="p-1 border border-brand-border bg-black cyber-border">
                    <textarea 
                      value={textMetadata}
                      onChange={(e) => setTextMetadata(e.target.value)}
                      placeholder="Input intercepted text payload here (tweets, OCR output, descriptions)..."
                      className="w-full bg-transparent p-3 text-xs font-mono focus:outline-none focus:ring-0 min-h-[120px] resize-y text-gray-300 placeholder:text-gray-600 focus:text-brand-green transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-brand-red/10 border-l-4 border-brand-red text-brand-red text-xs font-mono uppercase tracking-wider flex items-start gap-2 animate-pulse">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full relative overflow-hidden bg-brand-green text-brand-dark hover:bg-white disabled:bg-brand-border disabled:text-gray-500 disabled:cursor-not-allowed font-mono font-bold tracking-widest text-sm py-4 px-4 transition-all flex items-center justify-center gap-3 cyber-button group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                      <span className="relative z-10">PROCESSING...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">ENGAGE SCANNER</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ANALYSIS */}
          <div className="lg:col-span-5 order-2 lg:order-3">
            <div className="bg-brand-card/80 backdrop-blur-sm border border-brand-border p-6 h-full min-h-[400px] flex flex-col relative">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <div className="w-16 h-16 border-t-2 border-r-2 border-brand-cyan" />
              </div>
              
              <div className="flex items-center gap-2 mb-6 border-b border-brand-border/50 pb-3 relative z-10">
                <ShieldAlert className="w-4 h-4 text-brand-red" />
                <h2 className="font-mono text-sm font-semibold text-white uppercase tracking-widest">Threat_Analysis_Report</h2>
              </div>

              <div className="flex-1 relative z-10">
                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.div 
                      key="analyzing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-brand-cyan"
                    >
                      <Crosshair className="w-16 h-16 animate-[spin_4s_linear_infinite] mb-6 opacity-80" />
                      <div className="font-mono text-xs uppercase tracking-widest text-center space-y-3 w-full px-8">
                        <div className="flex justify-between w-full opacity-70">
                          <span>Heuristic Search</span>
                          <span className="animate-pulse">...</span>
                        </div>
                        <div className="h-px w-full bg-brand-cyan/20" />
                        <div className="flex justify-between w-full opacity-50">
                          <span>Metadata Parse</span>
                          <span className="animate-pulse delay-75">...</span>
                        </div>
                        <div className="h-px w-full bg-brand-cyan/20" />
                        <div className="flex justify-between w-full opacity-30">
                          <span>Anomaly Verify</span>
                          <span className="animate-pulse delay-150">...</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : result ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Top Level Verdict */}
                      <div className={cn(
                        "p-5 border relative overflow-hidden",
                        result.is_unauthorized ? "bg-brand-red/5 border-brand-red/30" : "bg-brand-green/5 border-brand-green/30"
                      )}>
                        {result.is_unauthorized && (
                          <div className="absolute top-0 left-0 w-full h-1 bg-brand-red animate-pulse" />
                        )}
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "p-3 cyber-border mt-1 shrink-0",
                            result.is_unauthorized ? "text-brand-red bg-brand-red/10" : "text-brand-green bg-brand-green/10"
                          )}>
                            {result.is_unauthorized ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1">SYSTEM VERDICT</h3>
                            <p className={cn("text-lg font-bold uppercase tracking-widest leading-tight", getThreatTextClass(result.threat_level))}>
                              {result.is_unauthorized ? "UNAUTHORIZED DISTRIBUTION" : "CLEARED / NO THREAT"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/50 p-4 border-l-2 border-brand-border">
                          <h4 className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">Threat Level</h4>
                          <span className={cn(
                            "inline-block font-mono text-[10px] font-bold px-3 py-1 border uppercase tracking-wider",
                            getThreatColor(result.threat_level)
                          )}>
                            {result.threat_level}
                          </span>
                        </div>
                        <div className="bg-black/50 p-4 border-l-2 border-brand-border">
                          <h4 className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2 flex justify-between">
                            <span>Confidence</span>
                            <span className={cn(
                              "font-bold",
                              result.confidence_score > 80 ? "text-brand-red glitch-text" : result.confidence_score > 50 ? "text-brand-yellow" : "text-brand-green"
                            )}>{result.confidence_score}%</span>
                          </h4>
                          <div className="w-full bg-brand-dark h-1 mt-3">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${result.confidence_score}%` }}
                              transition={{ duration: 1, ease: "circOut" }}
                              className={cn(
                                "h-full",
                                result.confidence_score > 80 ? "bg-brand-red shadow-[0_0_10px_rgba(255,0,60,0.8)]" : result.confidence_score > 50 ? "bg-brand-yellow" : "bg-brand-green"
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Primary Indicator & Reasoning */}
                      <div className="bg-black/50 p-5 border border-brand-border space-y-4">
                        <div>
                          <h4 className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan mb-2">Primary Indicator</h4>
                          <div className="inline-flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-brand-cyan rotate-45" />
                             <p className="font-mono text-sm text-gray-200 uppercase tracking-wide">{result.primary_indicator}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan mb-2">Diagnostic Output</h4>
                          <div className="pl-3 border-l text-gray-400 border-brand-border text-xs font-mono leading-relaxed bg-brand-card/50 p-3">
                            {/* Animated typing effect for reasoning could go here, for now static */}
                             {">"} {result.detailed_reasoning}
                          </div>
                        </div>
                      </div>
                      
                      {/* JSON View */}
                      <div className="pt-2">
                         <h4 className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mb-2 flex items-center gap-2">
                           <Terminal className="w-3 h-3" /> Raw Engine Log
                         </h4>
                         <pre className="bg-black p-4 font-mono text-[10px] text-brand-green border border-[#1a1a24] overflow-x-auto selection:bg-brand-green selection:text-black">
                           {JSON.stringify(result, null, 2)}
                         </pre>
                      </div>

                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-cyan opacity-20">
                      <div className="w-24 h-24 border border-brand-cyan/30 rounded-full flex items-center justify-center mb-4 relative">
                        <div className="w-20 h-20 border border-brand-cyan/20 rounded-full" />
                        <Crosshair className="w-8 h-8 absolute" />
                      </div>
                      <p className="font-mono text-xs uppercase tracking-widest">Awaiting target parameters...</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

