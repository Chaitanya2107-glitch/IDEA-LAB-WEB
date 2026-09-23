
import React, { useState, useEffect } from 'react';
import { Search, Package, ShoppingCart, Trash2, X, Plus, CheckCircle, Filter, FileText, AlertTriangle, Building2, UserCircle, Minus, Loader2, ArrowLeft } from 'lucide-react';
import { User, InventoryItem, IndentItem, Indent } from '../../types';
import { authService } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

interface ComponentsProps {
  user?: User;
}

const Components: React.FC<ComponentsProps> = ({ user }) => {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<IndentItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showIndentForm, setShowIndentForm] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const isGuest = user?.type === 'non-university';

  useEffect(() => {
    // Restrict access for guest users
    if (isGuest) {
        navigate('/dashboard');
        return;
    }

    const loadCatalog = async () => {
        const items = await authService.getInventory(); // Now uses real API
        setCatalog(items);
        setLoading(false);
    };
    loadCatalog();
  }, [isGuest, navigate]);
  
  // Get unique categories
  const categories = ['All', ...Array.from(new Set(catalog.map(item => item.category)))];

  // Indent Form State
  const [indentData, setIndentData] = useState({
    projectTitle: '',
    supervisor: '',
    purpose: 'academic_project'
  });

  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: InventoryItem) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
       if (existing.quantity < item.availableQuantity) {
          setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
       }
    } else {
       setCart([...cart, { 
         id: item.id, 
         name: item.name, 
         category: item.category, 
         type: item.type, 
         quantity: 1, 
         costPerUnit: item.costPerUnit 
       }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existing = cart.find(c => c.id === itemId);
    if (existing && existing.quantity > 1) {
       setCart(cart.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c));
    } else {
       setCart(cart.filter(c => c.id !== itemId));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.costPerUnit * item.quantity), 0);
  };

  const handleCheckoutClick = () => {
    setShowIndentForm(true);
  };

  const submitIndent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    const totalCost = getCartTotal();

    // Map frontend Indent to backend Indent (user_id, tenant_id, items_json)
    const newIndent: Indent = {
        id: `IND-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        user_name: user.name, // Backend expects user_name
        user_id: user.id, // Backend expects user_id
        tenant_id: user.tenant_id, // Backend expects tenant_id
        projectTitle: indentData.projectTitle,
        supervisor: indentData.supervisor,
        purpose: indentData.purpose, // Backend expects purpose
        items_json: cart, // Backend expects items_json (Corrected: cart is already IndentItem[])
        requestDate: new Date().toLocaleDateString(),
        status: 'pending', // CHANGED: Now pending so it shows in Staff Portal Requests
        paymentStatus: totalCost > 0 ? 'pending' : 'na',
        totalCost: totalCost
    };

    await authService.createIndent(newIndent);
    
    setIsSubmitting(false);
    setShowIndentForm(false);
    setCheckoutSuccess(true);
    
    setTimeout(() => {
        setCart([]);
        setShowCart(false);
        setCheckoutSuccess(false);
        setIndentData({ projectTitle: '', supervisor: '', purpose: 'academic_project' });
    }, 2000);
  };

  if (loading || isGuest) {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      
      {/* Interactive Framework Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5" style={{
         backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.4) 1px, transparent 1px)',
         backgroundSize: '40px 40px',
         maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
      }}></div>

      {/* Modern Dark Header with Slow Gradient and Neon Glow */}
      <div className="relative pt-32 pb-24 px-4 overflow-hidden bg-slate-950">
        {/* Animated Dark Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900 bg-[length:400%_400%] animate-gradient-flow z-0"></div>
        
        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-noise opacity-20 z-0 mix-blend-overlay"></div>
        
        {/* Neon Glow Peeking */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-600/30 rounded-full blur-[128px] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto text-center md:text-left">
           {/* Back to Dashboard */}
           <div className="mb-6">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
           </div>

           {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/50 backdrop-blur-md rounded-full border border-white/10 shadow-lg shadow-brand-900/10 hover:border-brand-500/50 transition-colors cursor-default group">
                <Package className="w-4 h-4 text-brand-400 group-hover:text-brand-300 transition-colors" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">Component Catalog</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 tracking-tight drop-shadow-2xl">
                Hardware <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-vivid-pink">Library</span>
            </h1>
            
            <p className="text-xl text-slate-400 font-light max-w-2xl leading-relaxed">
                Access our state-of-the-art component library. From microcontrollers to sensors, everything you need to build the future is right here.
            </p>
        </div>
        
        {/* Decorative Grid Lines */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-32">
        
        {/* Search Bar & Filter */}
        <div className="mb-8 flex flex-col gap-4">
            <div className="flex gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search components (e.g., 'Arduino', 'Sensor')..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-lg shadow-brand-900/10 focus:ring-2 focus:ring-brand-500 text-lg"
                    />
                </div>
                <button 
                    onClick={() => setShowFilter(!showFilter)}
                    className={`p-4 rounded-2xl shadow-lg transition-colors flex items-center gap-2 font-bold ${showFilter ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-white text-slate-500 hover:text-slate-900 shadow-brand-900/10'}`}
                >
                    <Filter className="w-6 h-6" />
                    <span className="hidden sm:inline">Filter</span>
                </button>
            </div>

            {/* Filter Dropdown */}
            {showFilter && (
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 animate-slide-up">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-3">Categories</p>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${selectedCategory === cat ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-gray-200 hover:border-brand-400'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalog.map((item) => {
                const cartItem = cart.find(c => c.id === item.id);
                const quantityInCart = cartItem ? cartItem.quantity : 0;
                const isDisabled = item.availableQuantity === 0;
                
                // Placeholder images for demo
                const imageUrl = `https://picsum.photos/seed/${item.name.replace(/\s/g,'')}/400/300`;

                return (
                <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group relative z-10">
                    <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                    <img src={imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                        {item.category}
                    </div>
                    </div>
                    <div className="px-2">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
                    <div className="flex justify-between items-center mb-4">
                         <div className="min-w-0"> {/* Added min-w-0 to prevent overflow */}
                            <span className={`text-sm font-medium ${item.availableQuantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {item.availableQuantity} in Stock
                            </span>
                            <div className="text-xs text-slate-400 font-medium capitalize">{item.type}</div>
                         </div>
                         {item.costPerUnit > 0 && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">₹{item.costPerUnit}</span>}
                    </div>

                    {!isDisabled ? (
                        <div className="flex items-center gap-3">
                            {quantityInCart > 0 ? (
                                <>
                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                >
                                    <Minus className="w-4 h-4 text-slate-700" />
                                </button>
                                <span className="font-bold text-lg w-8 text-center">{quantityInCart}</span>
                                <button 
                                    onClick={() => {
                                        const catalogItem = catalog.find(c => c.id === item.id);
                                        if (catalogItem && quantityInCart < catalogItem.availableQuantity) {
                                            addToCart(catalogItem);
                                        }
                                    }} 
                                    className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => addToCart(item)}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add to Cart
                                </button>
                            )}
                        </div>
                    ) : (
                        <button disabled className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-bold cursor-not-allowed">
                             Out of Stock
                        </button>
                    )}
                    
                    </div>
                </div>
                );
            })}
        </div>
      </div>
      
      {/* ... Rest of Cart Modal Logic remains the same ... */}
       {/* FLOATING CART BUTTON */}
      {cart.length > 0 && (
        <button 
          onClick={() => setShowCart(true)}
          className="fixed bottom-8 right-8 z-30 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 animate-slide-up"
        >
          <div className="relative">
             <ShoppingCart className="w-6 h-6" />
             <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold border-2 border-slate-900">
               {cart.reduce((acc, item) => acc + item.quantity, 0)}
             </span>
          </div>
          <span className="font-bold pr-2">View Cart</span>
        </button>
      )}

      {/* CART MODAL */}
      {showCart && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-fade-in">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h2 className="text-xl font-display font-bold flex items-center gap-2">
                 <ShoppingCart className="w-5 h-5" /> Your Cart
               </h2>
               <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-200 rounded-full">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             {checkoutSuccess ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                     <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                         <CheckCircle className="w-10 h-10 text-green-600" />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900">Indent Submitted!</h3>
                     <p className="text-slate-500 mt-2">Waiting for staff approval. Check dashboard.</p>
                </div>
             ) : showIndentForm ? (
                <div className="flex-grow flex flex-col p-6 overflow-y-auto">
                    <div className="mb-6 flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                       <FileText className="w-8 h-8 text-blue-600" />
                       <div>
                          <h3 className="font-bold text-blue-900">Digital Indent</h3>
                          <p className="text-xs text-blue-600">Required for University records.</p>
                       </div>
                    </div>
                    
                    <form onSubmit={submitIndent} className="space-y-4">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project Title</label>
                          <input 
                            required
                            type="text" 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="e.g. IoT Weather Station"
                            value={indentData.projectTitle}
                            onChange={(e) => setIndentData({...indentData, projectTitle: e.target.value})}
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Supervisor / Faculty</label>
                          <div className="relative">
                             <UserCircle className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                             <input 
                                required
                                type="text" 
                                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="Faculty Name"
                                value={indentData.supervisor}
                                onChange={(e) => setIndentData({...indentData, supervisor: e.target.value})}
                             />
                          </div>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Purpose</label>
                          <select 
                             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                             value={indentData.purpose}
                             onChange={(e) => setIndentData({...indentData, purpose: e.target.value})}
                          >
                             <option value="academic_project">Academic Project</option>
                             <option value="research">Research</option>
                             <option value="competition">Competition / Hackathon</option>
                             <option value="hobby">Personal Learning</option>
                          </select>
                       </div>

                       <div className="bg-gray-50 p-4 rounded-xl mt-4 border border-gray-200">
                          <p className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-gray-200 pb-2">Order Summary</p>
                          <ul className="text-sm space-y-2">
                             {cart.map(i => (
                                <li key={i.id} className="flex justify-between items-center">
                                   <span>{i.name} <span className="text-slate-400 text-xs">x{i.quantity}</span></span>
                                   <span className="font-bold">
                                      {i.costPerUnit > 0 ? `₹${i.costPerUnit * i.quantity}` : 'Free'}
                                   </span>
                                </li>
                             ))}
                          </ul>
                          <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                              <span className="font-bold text-slate-900">Total Estimated Cost</span>
                              <span className="font-black text-lg text-slate-900">₹{getCartTotal()}</span>
                          </div>
                       </div>

                       <div className="pt-4 flex gap-3">
                          <button 
                             type="button" 
                             disabled={isSubmitting}
                             onClick={() => setShowIndentForm(false)} 
                             className="flex-1 py-3 text-slate-600 font-bold hover:bg-gray-100 rounded-xl"
                          >
                             Back
                          </button>
                          <button 
                             type="submit" 
                             disabled={isSubmitting}
                             className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-brand-600 shadow-lg disabled:opacity-70"
                          >
                             {isSubmitting ? 'Processing...' : 'Submit Indent'}
                          </button>
                       </div>
                    </form>
                </div>
             ) : (
                <>
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-4 bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                            <div className="flex-grow">
                                <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-500 capitalize">{item.type}</span>
                                    {item.costPerUnit > 0 && <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">₹{item.costPerUnit}/unit</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded shadow-sm transition-all">-</button>
                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                <button 
                                    onClick={() => {
                                        const catalogItem = catalog.find(c => c.id === item.id);
                                        if (catalogItem && item.quantity < catalogItem.availableQuantity) {
                                            addToCart(catalogItem);
                                        }
                                    }} 
                                    className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded shadow-sm transition-all"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <div className="flex justify-between mb-4 text-sm font-medium">
                        <span className="text-slate-500">Total Items</span>
                        <span className="text-slate-900">{cart.reduce((a,b) => a + b.quantity, 0)}</span>
                    </div>
                    {getCartTotal() > 0 && (
                        <div className="flex justify-between mb-4 text-sm font-bold text-brand-600">
                            <span>Estimated Cost</span>
                            <span>₹{getCartTotal()}</span>
                        </div>
                    )}
                    <button 
                        onClick={handleCheckoutClick}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        Proceed to Indent <FileText className="w-4 h-4" />
                    </button>
                    </div>
                </>
             )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Components;
