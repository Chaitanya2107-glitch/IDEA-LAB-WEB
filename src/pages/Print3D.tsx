// src/pages/Print3D.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Upload,
  Printer,
  Settings,
  Palette,
  Layers,
  CheckCircle,
  Loader2,
  ChevronRight,
  Info,
  Trash2,
  Weight,
  Box,
  Clock
} from "lucide-react";
import { User } from "../../types";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { supabase } from "../services/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { StlViewer } from "../components/StlViewer";
import { STLLoader } from "three-stdlib";
import * as THREE from "three";

interface Print3DProps {
  user?: User;
}

const PRINTERS = [
  { id: "0.2-std", label: "0.2 mm Standard Quality", priceMult: 1 },
  { id: "0.15-med", label: "0.15 mm Medium Quality", priceMult: 1.2 },
  { id: "0.1-high", label: "0.1 mm High Quality", priceMult: 1.5 },
];

const Print3D: React.FC<Print3DProps> = ({ user }) => {
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [stlId, setStlId] = useState<string | null>(null);
  
  // Dynamic Materials
  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Simulated Analysis
  const [analysis, setAnalysis] = useState<{ volume: number, dimensions: string, rawSize?: { x:number, y:number, z:number } } | null>(null);
  
  // Config state
  const [printer, setPrinter] = useState(PRINTERS[0]);
  const [material, setMaterial] = useState<any | null>(null);
  const [color, setColor] = useState<any | null>(null);
  const [infill, setInfill] = useState(20);
  const [scale, setScale] = useState(100); // Percentage

  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Fetch Materials on Mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('print_materials_config')
          .select('*')
          .order('name');
        
        if (fetchError) throw fetchError;
        setMaterials(data || []);
        if (data && data.length > 0) {
          setMaterial(data[0]);
          if (data[0].colors && data[0].colors.length > 0) {
            setColor(data[0].colors[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch material config:", err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  // Cleanup Object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  // Handle material switch tracking
  useEffect(() => {
    if (material) {
      setColor(material.colors[0]);
    }
  }, [material]);

  const clearModel = () => {
     setFile(null);
     if (fileUrl) URL.revokeObjectURL(fileUrl);
     setFileUrl(null);
     setStlId(null);
     setAnalysis(null);
     setError(null);
     setScale(100);
     // Reset file input so the user can re-upload same or different file
     if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.name.toLowerCase().endsWith(".stl")) {
      setError("Only .STL files allowed");
      return;
    }

    setFile(f);
    const url = URL.createObjectURL(f);
    setFileUrl(url);
    setAnalysis(null); // clear stale values before new analysis
    setUploading(true);
    try {
      const arrayBuffer = await f.arrayBuffer();
      const loader = new STLLoader();
      const geometry = loader.parse(arrayBuffer);

      // Flatten indexed geometry so triangle iteration works correctly
      const flat = geometry.index ? geometry.toNonIndexed() : geometry.clone();
      flat.computeBoundingBox();
      const size = new THREE.Vector3();
      flat.boundingBox!.getSize(size);

      // Auto-detect units: < 1 means meters (some Fusion360/Blender exports)
      // Convert everything to mm before display
      const maxRaw = Math.max(size.x, size.y, size.z);
      const toMm = maxRaw < 1 ? 1000 : (maxRaw > 10000 ? 0.001 : 1);
      const widthMm = size.x * toMm;
      const heightMm = size.y * toMm;
      const depthMm = size.z * toMm;

      // Signed-volume divergence theorem — works on any closed manifold STL
      const pos = flat.attributes.position;
      let vol = 0;
      for (let i = 0; i < pos.count; i += 3) {
        const ax = pos.getX(i),   ay = pos.getY(i),   az = pos.getZ(i);
        const bx = pos.getX(i+1), by = pos.getY(i+1), bz = pos.getZ(i+1);
        const cx = pos.getX(i+2), cy = pos.getY(i+2), cz = pos.getZ(i+2);
        vol += (ax*(by*cz - bz*cy) + bx*(cy*az - cz*ay) + cx*(ay*bz - az*by)) / 6;
      }
      const volMm3 = Math.abs(vol) * (toMm * toMm * toMm); // convert to mm³

      setAnalysis({
        volume: +(volMm3 / 1000).toFixed(2),       // mm³ → cm³
        dimensions: `${(widthMm/10).toFixed(1)} × ${(heightMm/10).toFixed(1)} × ${(depthMm/10).toFixed(1)} cm`,
        rawSize: { x: widthMm, y: heightMm, z: depthMm } // always in mm
      });
      setStlId("stl-" + Date.now());
    } catch (err: any) {
      setError("Failed to analyze model. Please upload a valid STL file.");
    } finally {
      setUploading(false);
    }
  };

  const metrics = useMemo(() => {
    if (!analysis || !material) return { weight: 0, cost: 0, time: "-" };
    
    const scaleFactor = scale / 100;
    const scaledVolume = analysis.volume * Math.pow(scaleFactor, 3);
    
    // Calculate effective volume based on infill (approximation: 30% shells + 70% infill dependent)
    const effectiveVolume = scaledVolume * (0.3 + 0.7 * (infill / 100));
    const actualWeight = effectiveVolume * (material.density || 1.2);
    
    let baseCost = actualWeight * (material.price_per_gram || 4);
    baseCost *= printer.priceMult;

    // Time estimation (Bambu Lab reference: high speed but with overhead)
    // Faster print: ~25g per hour for high speed machines
    const baseHours = Math.max(0.2, (actualWeight / 25) * printer.priceMult);
    const overhead = 0.25; // 15 mins for heating, calibration, bed leveling
    const hours = baseHours + overhead;
    
    const h = Math.floor(hours);
    const m = Math.round((hours % 1) * 60);

    const widthMm = (analysis.rawSize?.x || 0) * scaleFactor;
    const heightMm = (analysis.rawSize?.y || 0) * scaleFactor;
    const depthMm = (analysis.rawSize?.z || 0) * scaleFactor;

    return {
      weight: Math.max(1, Math.round(actualWeight)),
      cost: Math.max(5, Math.round(baseCost)),
      time: `${h}h ${m}m`,
      dimensions: `${(widthMm/10).toFixed(1)} × ${(heightMm/10).toFixed(1)} × ${(depthMm/10).toFixed(1)} cm`
    };
  }, [analysis, material, printer, infill, scale]);

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
  };

  const submitOrder = async () => {
    if (!analysis || !fileUrl || !file || !material) return;
    setProcessing(true);
    try {
      // 1. Upload STL file to Supabase Storage
      const fileName = `${user?.id || 'anon'}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('stl-files')
        .upload(fileName, file, { contentType: 'model/stl', upsert: false });

      if (uploadError) throw uploadError;
      const storagePath = uploadData?.path;

      // 2. Insert into stl_files first
      const { data: stlData, error: stlError } = await supabase.from('stl_files').insert({
         tenant_id: user?.tenant_id || "university",
         user_id: user?.id,
         filename: file.name,
         storage_path: storagePath,
         volume: analysis.volume * Math.pow(scale / 100, 3),
         weight: metrics.weight,
         price: metrics.cost
      }).select('*').single();

      if (stlError) throw stlError;

      // 3. Insert into print_orders with stl_file_id
      const { data: orderData, error: dbError } = await supabase.from('print_orders').insert({
         tenant_id: user?.tenant_id || "university",
         user_id: user?.id,
         stl_file_id: stlData.id,
         material: material.name,
         color: color?.name || "Standard",
         infill: infill,
         cost: metrics.cost,
         status: 'pending_payment'
      }).select('*').single();

      if (dbError) throw dbError;
      
      const orderRefId = "PRT-" + (orderData?.id?.slice(0, 8)?.toUpperCase() || "XXXXXXXX");

      // 4. Initialize Razorpay Checkout
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
          throw new Error("Razorpay SDK failed to load. Are you online?");
      }

      const options = {
          key: "rzp_test_SUKNLBkS6OwndO", // User's Test Key ID
          amount: metrics.cost * 100, // Amount is in currency subunits (paise)
          currency: "INR",
          name: "REVA IDEA Lab",
          description: `3D Print: ${file.name}`,
          image: "/img/logo_orange_new.png", // Assuming path exists or fallback works
          handler: async function (response: any) {
              try {
                  // CRITICAL: Save to localStorage FIRST before any async work.
                  // Razorpay test mode may redirect/reload the page, killing this callback.
                  localStorage.setItem('pending_payment_confirmation', JSON.stringify({
                    orderId: orderData.id,
                    paymentId: response.razorpay_payment_id,
                    timestamp: Date.now()
                  }));

                  // Attempt DB update (may not complete if page redirects)
                  const { error: updateError } = await supabase
                      .from('print_orders')
                      .update({ 
                        status: 'Paid', 
                        payment_status: 'paid', 
                        payment_method: `Online: ${response.razorpay_payment_id}` 
                      })
                      .eq('id', orderData.id);
                  
                  if (updateError) console.error("Failed to update order status", updateError);
                  
                  // Clear localStorage since DB update succeeded
                  localStorage.removeItem('pending_payment_confirmation');
                  
                  setOrderId(orderRefId);
                  setProcessing(false);
              } catch (e) {
                  console.error(e);
                  setError("Payment recorded locally but failed to update status on server.");
                  setProcessing(false);
              }
          },
          prefill: {
              name: user?.name || "Student",
              email: user?.email || "",
          },
          theme: {
              color: "#ea580c" // Tailwind brand-600
          },
          modal: {
              ondismiss: function() {
                  // Modal is closed by user
                  setError("Payment was cancelled. You can try again or check your pending orders.");
                  setProcessing(false);
              }
          }
      };

      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any){
          setError("Payment Failed: " + response.error.description);
          setProcessing(false);
      });
      
      paymentObject.open();

    } catch (err: any) {
      console.error("Submission error:", err);
      setError("Order submission failed: " + err.message);
      setProcessing(false);
    }
  };

  if (orderId) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 px-4 flex items-center justify-center">
         <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-2xl border border-green-100"
         >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-3xl font-display font-black text-slate-900 mb-2">Order Confirmed!</h2>
            <p className="text-slate-500 mb-6 font-medium">Your 3D print request has been sent to the lab.</p>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
               <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Order Tracking ID</p>
               <p className="font-mono text-xl font-bold text-brand-600">{orderId}</p>
            </div>

            <button
               onClick={() => navigate("/dashboard")}
               className="w-full bg-slate-900 hover:bg-brand-600 text-white py-4 rounded-xl font-bold transition-colors shadow-lg"
            >
               Go to Dashboard
            </button>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 flex items-center gap-3">
             <Printer className="w-8 h-8 text-brand-600" />
             Online 3D Printing Service
          </h1>
          <p className="text-slate-500 font-medium mt-2">Upload your STL model, configure print settings, and get an instant quote.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Viewer & Principal Display (7/12) */}
          <div className="lg:col-span-7 space-y-6">
             
             {/* 3D Viewer Box */}
             <div className="bg-white rounded-[2.5rem] p-4 md:p-6 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50 transition-opacity group-hover:opacity-100" />
                
                {error && (
                   <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      {error}
                   </div>
                )}
                <div className="relative h-[480px] bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner group transition-all duration-500">
                   
                   {fileUrl && !uploading ? (
                      <>
                        <StlViewer fileUrl={fileUrl} color={color?.hex || "#CCCCCC"} rawSizeMm={analysis?.rawSize} scale={scale/100} />
                        <button 
                           onClick={clearModel}
                           className="absolute top-6 right-6 z-20 bg-white/10 hover:bg-red-500 hover:text-white backdrop-blur-xl p-3 rounded-2xl text-white/60 shadow-2xl border border-white/10 transition-all hover:scale-110 active:scale-95"
                           title="Remove Model"
                        >
                           <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                   ) : uploading ? (
                      <div className="flex flex-col items-center justify-center h-full text-brand-600 bg-slate-900">
                         <Loader2 className="w-16 h-16 animate-spin mb-6 opacity-80" />
                         <span className="font-black text-xs uppercase tracking-[0.3em] animate-pulse">Synchronizing Pixels</span>
                      </div>
                   ) : (
                      <div className="text-center p-8 relative z-10 w-full h-full flex flex-col items-center justify-center bg-slate-900 group-hover:bg-slate-800 transition-colors duration-700">
                         <div className="w-24 h-24 bg-brand-500/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                             <Upload className="w-10 h-10 text-brand-500 group-hover:animate-bounce" />
                         </div>
                         <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Prime the Printer</h3>
                         <p className="text-white/40 font-bold text-xs uppercase tracking-widest mb-10">Upload your STL blueprint to begin.</p>
                         
                         <label className="relative group/btn cursor-pointer">
                           <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover/btn:opacity-60 transition duration-1000 group-hover/btn:duration-200"></div>
                           <div className="relative px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest ring-1 ring-white/10 group-hover/btn:scale-105 transition-all active:scale-95">
                              Select STL File
                           </div>
                           <input 
                             ref={fileInputRef}
                             type="file" 
                             accept=".stl" 
                             onChange={handleFileUpload}
                             className="hidden"
                           />
                         </label>
                      </div>
                   )}
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                   {[
                     { label: "Net Weight", val: analysis ? `${metrics.weight}g` : "-", icon: Weight, color: "text-brand-600 bg-brand-50" },
                     { label: "Boundaries", val: analysis ? metrics.dimensions : "-", icon: Box, color: "text-blue-600 bg-blue-50" },
                     { label: "Execution Time", val: analysis ? metrics.time : "-", icon: Clock, color: "text-purple-600 bg-purple-50" }
                   ].map(i => (
                     <div key={i.label} className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100/50 flex flex-col gap-3 group/stat hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                        <div className={`w-10 h-10 rounded-2xl ${i.color} flex items-center justify-center transition-transform group-hover/stat:rotate-12`}>
                           <i.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{i.label}</p>
                          <p className="text-lg font-black text-slate-900 tracking-tight">{i.val}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* RIGHT COLUMN: Configuration Menu (5/12) - Sticky */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
             <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-300/30 border border-slate-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                
                <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight relative z-10">Forge Parameter Setup</h2>
                
                <div className="space-y-8 relative z-10">
                  {/* Step 2: Scaling & Infill */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Master Scale</label>
                      <div className="relative group">
                        <input 
                          type="number"
                          value={scale}
                          onChange={(e) => setScale(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg text-brand-600 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300 pointer-events-none">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Inner Bone (Infill)</label>
                      <div className="relative group">
                        <select 
                          value={infill}
                          onChange={(e) => setInfill(parseInt(e.target.value))}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg text-slate-900 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all appearance-none"
                        >
                          {[10, 20, 30, 50, 80, 100].map(v => (
                            <option key={v} value={v}>{v}%</option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                           <Settings className="w-4 h-4 text-slate-300" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Material Select */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Alchemy Selection</label>
                    <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                      {materials.map(mat => (
                         <button
                            key={mat.id}
                            onClick={() => setMaterial(mat)}
                            className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${material?.id === mat.id ? 'bg-white text-brand-600 shadow-xl shadow-black/5 ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                         >
                            {mat.name.split('-')[0]}
                         </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 4: Color Palette */}
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Visual Essence</label>
                      <div className="flex flex-wrap gap-2.5">
                         {material?.colors?.map((c: any) => (
                            <button 
                              key={c.name}
                              onClick={() => setColor(c)}
                              className={`w-12 h-12 rounded-2xl border-4 transition-all ${color?.name === c.name ? 'scale-110 border-brand-500 shadow-xl shadow-brand-500/20' : 'border-slate-50 hover:border-slate-200'}`}
                              style={{ background: c.hex }}
                              title={c.name}
                            />
                         ))}
                      </div>
                  </div>
                </div>

                {/* Pricing & Proceed - Sticky at bottom of card */}
                <div className="mt-12 pt-8 border-t border-slate-50">
                    <div className="flex items-center justify-between mb-8">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Final Transaction</p>
                          <div className="flex items-baseline gap-2">
                             <span className="text-5xl font-black text-slate-900 tracking-tighter">₹{metrics.cost}</span>
                             <span className="text-xs font-black text-slate-300">INR</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                          <p className="text-emerald-500 font-black text-xs uppercase tracking-tighter inline-flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ready to Print
                          </p>
                       </div>
                    </div>
                    
                    <button 
                      onClick={submitOrder}
                      disabled={!fileUrl || processing || uploading || !material}
                      className="group relative w-full overflow-hidden"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                      <div className="relative w-full py-6 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.5rem] flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-2xl">
                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>
                            Generate Order <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </div>
                    </button>
                </div>

             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Print3D;
