
import React, { useState, useEffect } from 'react';
import { Upload, CircuitBoard, CreditCard, Banknote, CheckCircle, ArrowRight, Loader2, AlertTriangle, Box, ChevronRight, X, Smartphone, Globe, Lock } from 'lucide-react';
import { User, PcbOrder } from '../../types';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

interface PcbOrderProps {
  user?: User;
}

const PcbOrderPage: React.FC<PcbOrderProps> = ({ user }) => {
  const navigate = useNavigate();
  const [fileUrl, setFileUrl] = useState<string | null>(null); // For local viewer if needed, not used in this component
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Specs State
  const [specs, setSpecs] = useState({
      material: 'FR-4',
      layers: 2,
      dimensionL: 100,
      dimensionW: 100,
      quantity: 5,
      thickness: '1.6mm',
      copperWeight: '1oz',
      solderMaskColor: 'Green',
      silkscreenColor: 'White',
      surfaceFinish: 'HASL with lead',
      minTrace: '10/10mil',
      minDrill: '0.3mm'
  });

  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  const calculatePrice = () => {
      // Mock pricing logic
      const area = specs.dimensionL * specs.dimensionW; // mm^2
      const basePrice = 500; // Base setup cost
      const areaCost = (area / 100) * 0.5; // per 100mm^2
      const layerMultiplier = specs.layers * 0.5;
      const quantityMultiplier = specs.quantity * 0.8;
      const finishMultiplier = specs.surfaceFinish.includes('ENIG') ? 1.5 : 1;
      
      const total = (basePrice + areaCost * layerMultiplier) * quantityMultiplier * finishMultiplier;
      return Math.round(total);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      if (uploadedFile.size > 50 * 1024 * 1024) {
        setErrorMsg("File is too large (Max 50MB).");
        return;
      }
      
      const ext = uploadedFile.name.split('.').pop()?.toLowerCase();
      if (!['zip', 'rar', 'pcb', 'kicad_pcb', 'gerber'].includes(ext || '')) {
         setErrorMsg("Invalid format. Please upload .zip, .rar, or PCB files.");
         return;
      }

      if (fileUrl) URL.revokeObjectURL(fileUrl); // Clean up previous URL
      // For a real app, this file would be uploaded to storage and a path obtained here.
      setFile(uploadedFile);
      setAnalyzing(true);
      
      // Simulate file analysis
      setTimeout(() => {
        setAnalyzing(false);
        setStep(2);
      }, 1500);
    }
  };

  const handleSubmitOrder = async () => {
    if (!file) return;

    setIsProcessingPayment(true);
    if (paymentMethod === 'online') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setShowPaymentModal(false);
    }
    
    const newOrder: PcbOrder = { // Corrected: PcbOrder type has user_id, tenant_id, user_name
        id: `PCB-${Math.floor(1000 + Math.random() * 9000)}`,
        fileName: file.name,
        status: 'queued',
        specs: {
            // Corrected: These fields are part of the specs object (PcbOrderSpecs)
            material: specs.material,
            layers: specs.layers,
            dimensions: `${specs.dimensionL}x${specs.dimensionW}mm`,
            quantity: specs.quantity,
            // The following specs are not directly in the PCBOrder type, but are in specs_json
            thickness: specs.thickness,
            copperWeight: specs.copperWeight,
            solderMaskColor: specs.solderMaskColor,
            silkscreenColor: specs.silkscreenColor,
            surfaceFinish: specs.surfaceFinish
        },
        cost: calculatePrice(),
        submitDate: new Date().toLocaleDateString(),
        paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
        user_id: user?.id || '',
        tenant_id: user?.tenant_id || '',
        user_name: user?.name || 'Unknown User',
    };

    // In a real app, you'd upload the file to storage and get a storagePath first. (This is a placeholder)
    // For now, we'll use a placeholder storagePath. A dedicated PCB file upload API would be needed.
    newOrder.storagePath = `tenant_id/pcb_files/${newOrder.id}_${file.name}`; // Placeholder

    await authService.createPcbOrder(newOrder); // Now uses real API

    setIsProcessingPayment(false);
    setSuccessOrder(newOrder.id);
    setStep(4);
  };

  const SOLDER_COLORS = [
      { name: 'Green', hex: '#16a34a' },
      { name: 'Red', hex: '#dc2626' },
      { name: 'Yellow', hex: '#ca8a04' },
      { name: 'Blue', hex: '#2563eb' },
      { name: 'White', hex: '#f8fafc' },
      { name: 'Black', hex: '#1e293b' },
      { name: 'Purple', hex: '#7e22ce' },
  ];

  return (
    <div className="h-screen bg-[#0f172a] text-white flex flex-col overflow-hidden font-sans pt-16 md:pt-20">
        {/* Header */}
        <div className="h-14 md:h-16 bg-[#020617] border-b border-slate-800 flex items-center justify-between px-4 md:px-6 z-20 shadow-lg shrink-0">
            <div className="flex items-center gap-3">
                 <div className="bg-emerald-600 p-1.5 md:p-2 rounded-xl shadow-lg shadow-emerald-900/20">
                    <CircuitBoard className="w-4 h-4 md:w-5 md:h-5 text-white" />
                 </div>
                 <div>
                    <span className="font-display font-bold text-base md:text-lg leading-tight block">PCB Studio</span>
                    <span className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-wider font-bold">Fabrication Engine v1.0</span>
                 </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
                 <div className="hidden md:flex flex-col items-end text-xs">
                    <span className="text-slate-500 font-medium">Est. Turnaround</span>
                    <span className="text-emerald-400 font-bold text-sm">3-5 Days</span>
                 </div>
                 <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
                 <button onClick={() => navigate('/dashboard')} className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] md:text-xs font-bold transition-all border border-slate-700 hover:border-slate-500">
                    Back to Dashboard
                 </button>
            </div>
        </div>

        <div className="flex-grow flex flex-col md:flex-row relative overflow-hidden">
            {/* Visualizer / Placeholder Area */}
            <div className="hidden md:flex md:w-1/3 bg-[#0f172a] relative border-r border-slate-800 flex-col items-center justify-center p-8 text-center">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0f172a] to-[#020617] opacity-50"></div>
                 <div className="relative z-10">
                     <div className={`w-64 h-64 rounded-xl border-4 transition-all duration-500 flex items-center justify-center shadow-2xl relative overflow-hidden group ${step >= 2 ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-700 bg-slate-800/30'}`}>
                         <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20 pointer-events-none">
                             {[...Array(36)].map((_,i) => <div key={i} className="border border-emerald-500/20"></div>)}
                         </div>
                         <CircuitBoard className={`w-32 h-32 transition-all duration-500 ${step >= 2 ? 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-slate-600'}`} />
                         
                         {/* Animated Scan Line */}
                         {step >= 2 && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-[scan_3s_ease-in-out_infinite]"></div>}
                     </div>
                     <h3 className="mt-8 text-2xl font-display font-bold text-white">{step === 1 ? 'Upload Design' : 'Configure Board'}</h3>
                     <p className="mt-2 text-slate-400 text-sm max-w-xs mx-auto">
                        {step === 1 ? 'Upload your Gerber files (zip/rar) to begin analysis.' : 'Customize layer stackup, materials, and finish for your PCB.'}
                     </p>
                 </div>
            </div>

            {/* Form / Content Area */}
            <div className="flex-grow bg-slate-900/95 backdrop-blur-xl flex flex-col z-10 shadow-2xl overflow-hidden h-full">
                <div className="p-4 md:p-8 border-b border-slate-800 shrink-0">
                    <div className="flex justify-between items-center mb-3 md:mb-6">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Step {step} of 4
                        </span>
                        {step > 1 && step < 4 && <button onClick={() => setStep(step-1)} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Go Back</button>}
                    </div>
                    <div className="flex gap-2 h-1.5">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                        ))}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    
                    {/* STEP 1: UPLOAD */}
                    {step === 1 && (
                        <div className="space-y-6 animate-slide-up max-w-2xl mx-auto h-full flex flex-col justify-center">
                            <div className="w-full h-64 border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-slate-800/50 transition-all cursor-pointer group relative overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-500/5 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-3xl"></div>
                                {analyzing ? (
                                    <div className="text-center z-10">
                                        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
                                        <p className="font-bold">Analyzing Gerber Files...</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 md:w-12 md:h-12 mb-4 group-hover:text-emerald-500 transition-colors z-10" />
                                        <p className="font-bold text-base md:text-lg z-10 text-center">Upload Gerber / Zip</p>
                                        <p className="text-xs mt-2 text-slate-400 z-10 text-center">Supports .zip, .rar, .pcb (Max 50MB)</p>
                                        <input type="file" accept=".zip,.rar,.pcb,.kicad_pcb" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFileUpload} />
                                    </>
                                )}
                            </div>
                            {errorMsg && (
                                <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-3 rounded-xl border border-red-900/50 text-sm font-bold justify-center">
                                    <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMsg}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: CONFIGURATION */}
                    {step === 2 && (
                        <div className="space-y-8 animate-slide-up max-w-3xl mx-auto">
                            
                            {/* Board Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider border-b border-emerald-500/20 pb-2">Board Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-bold">Base Material</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['FR-4', 'Aluminum', 'Rogers', 'FR-1'].map(m => (
                                                <button key={m} onClick={() => setSpecs({...specs, material: m})} className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${specs.material === m ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-bold">Layer Count</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[1, 2, 4, 6, 8].map(l => (
                                                <button key={l} onClick={() => setSpecs({...specs, layers: l})} className={`w-10 h-10 flex items-center justify-center text-xs font-bold rounded-lg border transition-all ${specs.layers === l ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-bold">Dimensions (mm)</label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={specs.dimensionL} onChange={e => setSpecs({...specs, dimensionL: parseInt(e.target.value)})} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 w-full text-sm font-bold focus:border-emerald-500 outline-none" />
                                            <span className="text-slate-500">x</span>
                                            <input type="number" value={specs.dimensionW} onChange={e => setSpecs({...specs, dimensionW: parseInt(e.target.value)})} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 w-full text-sm font-bold focus:border-emerald-500 outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-bold">Quantity</label>
                                        <input type="number" value={specs.quantity} onChange={e => setSpecs({...specs, quantity: parseInt(e.target.value)})} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 w-full text-sm font-bold focus:border-emerald-500 outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Process Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider border-b border-emerald-500/20 pb-2">Process Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-bold">PCB Thickness</label>
                                        <select value={specs.thickness} onChange={e => setSpecs({...specs, thickness: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold focus:border-emerald-500 outline-none appearance-none">
                                            <option>0.6mm</option>
                                            <option>0.8mm</option>
                                            <option>1.0mm</option>
                                            <option>1.2mm</option>
                                            <option>1.6mm</option>
                                            <option>2.0mm</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-bold">Copper Weight</label>
                                        <div className="flex gap-2">
                                            {['1oz', '2oz'].map(w => (
                                                <button key={w} onClick={() => setSpecs({...specs, copperWeight: w})} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${specs.copperWeight === w ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                                    {w}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs text-slate-400 font-bold">Solder Mask Color</label>
                                        <div className="flex flex-wrap gap-3">
                                            {SOLDER_COLORS.map(c => (
                                                <button 
                                                    key={c.name} 
                                                    onClick={() => setSpecs({...specs, solderMaskColor: c.name})} 
                                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${specs.solderMaskColor === c.name ? 'border-white ring-2 ring-emerald-500 scale-110' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                                                    style={{ backgroundColor: c.hex }}
                                                    title={c.name}
                                                >
                                                    {specs.solderMaskColor === c.name && <CheckCircle className={`w-5 h-5 ${c.name === 'White' ? 'text-black' : 'text-white'}`} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-bold">Silkscreen</label>
                                        <div className="flex gap-2">
                                            {['White', 'Black', 'None'].map(s => (
                                                <button key={s} onClick={() => setSpecs({...specs, silkscreenColor: s})} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${specs.silkscreenColor === s ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-bold">Surface Finish</label>
                                        <select value={specs.surfaceFinish} onChange={e => setSpecs({...specs, surfaceFinish: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold focus:border-emerald-500 outline-none appearance-none">
                                            <option>HASL with lead</option>
                                            <option>HASL lead free</option>
                                            <option>ENIG (Gold)</option>
                                            <option>OSP</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <p className="text-slate-400 text-xs">Total Estimated Cost</p>
                                    <p className="text-3xl font-display font-bold text-white">₹{calculatePrice()}</p>
                                </div>
                                <button onClick={() => setStep(3)} className="w-full md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all">
                                    Proceed to Review <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: REVIEW */}
                    {step === 3 && (
                        <div className="space-y-6 animate-slide-up max-w-xl mx-auto">
                            <div><h2 className="text-2xl font-display font-bold mb-2">Review Order</h2><p className="text-slate-400 text-sm">Verify specifications before payment.</p></div>
                            
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                                    <span className="text-slate-400 text-sm">File</span>
                                    <span className="font-bold text-white">{file?.name}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-slate-500 block text-xs">Dimensions</span> <span className="font-bold">{specs.dimensionL}x{specs.dimensionW} mm</span></div>
                                    <div><span className="text-slate-500 block text-xs">Layers</span> <span className="font-bold">{specs.layers}</span></div>
                                    <div><span className="text-slate-500 block text-xs">Material</span> <span className="font-bold">{specs.material}</span></div>
                                    <div><span className="text-slate-500 block text-xs">Quantity</span> <span className="font-bold">{specs.quantity}</span></div>
                                    <div><span className="text-slate-500 block text-xs">Solder Mask</span> <span className="font-bold">{specs.solderMaskColor}</span></div>
                                    <div><span className="text-slate-500 block text-xs">Silkscreen</span> <span className="font-bold">{specs.silkscreenColor}</span></div>
                                </div>
                                <div className="pt-4 border-t border-slate-700/50 flex justify-between items-end">
                                    <span className="text-slate-400 font-bold">Total Cost</span>
                                    <span className="text-2xl font-bold text-emerald-400">₹{calculatePrice()}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button onClick={() => setPaymentMethod('online')} className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all group ${paymentMethod === 'online' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'}`}><span className="flex items-center gap-3"><div className={`p-2 rounded-lg ${paymentMethod === 'online' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}><CreditCard className="w-5 h-5" /></div><span className="font-bold text-sm">Pay Online</span></span>{paymentMethod === 'online' && <CheckCircle className="w-5 h-5 text-emerald-500" />}</button>
                                <button onClick={() => setPaymentMethod('cash')} className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all group ${paymentMethod === 'cash' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'}`}><span className="flex items-center gap-3"><div className={`p-2 rounded-lg ${paymentMethod === 'cash' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}><Banknote className="w-5 h-5" /></div><span className="font-bold text-sm">Pay at Lab</span></span>{paymentMethod === 'cash' && <CheckCircle className="w-5 h-5 text-emerald-500" />}</button>
                            </div>

                            <button onClick={handleSubmitOrder} disabled={isProcessingPayment} className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-lg">{isProcessingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}</button>
                        </div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {step === 4 && (
                        <div className="text-center py-12 animate-slide-up h-full flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse"><CheckCircle className="w-12 h-12 text-emerald-500" /></div>
                            <h2 className="text-3xl font-display font-bold mb-3 text-white">Order Placed Successfully!</h2>
                            <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">Your PCB order has been sent to the fabrication unit. You can track progress in your dashboard.</p>
                            <div className="bg-slate-800 rounded-xl p-4 mb-8 w-full max-w-xs mx-auto border border-slate-700"><p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Order ID</p><p className="font-mono text-lg text-emerald-400 tracking-wider">{successOrder}</p></div>
                            <button onClick={() => navigate('/dashboard')} className="w-full max-w-xs py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20">Go to Dashboard</button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {showPaymentModal && (
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowPaymentModal(false)}></div>
                <div className="relative bg-white text-slate-900 rounded-2xl w-full max-w-md overflow-hidden animate-slide-up shadow-2xl">
                    <div className="p-12 text-center flex flex-col items-center justify-center"><div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mb-6"></div><h3 className="text-xl font-bold">Processing Payment</h3><p className="text-slate-500 mt-2">Please wait...</p></div>
                </div>
            </div>
        )}
    </div>
  );
};

export default PcbOrderPage;
