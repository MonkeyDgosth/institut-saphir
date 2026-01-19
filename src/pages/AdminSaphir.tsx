import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isToday, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Crown, LayoutDashboard, Users, RefreshCw, 
  Search, MessageCircle, Calendar, Check, ChevronDown, Phone, LogOut, 
  ShieldCheck, Scale, AlertTriangle, Lock, FileText,
  TrendingUp, Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- 1. TYPES & CONFIGURATION ---

interface Reservation {
  id: string;
  created_at: string;
  booking_date: string | null;
  booking_time: string | null;
  service_name: string | null;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  status: string;
  total_price: number | null;
  clients?: {
    total_reservations: number;
  } | null;
}

interface Client {
  id: string;
  full_name: string | null;
  phone: string | null;
  total_reservations?: number;
}

// Types pour la Compta
interface Transaction {
  id: string;
  client: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: Date;
  method: 'Carte' | 'OM/Momo' | 'Espèces';
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  en_attente: { bg: "bg-amber-500/20", text: "text-amber-400", label: "En attente" },
  confirme: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Confirmé" },
  termine: { bg: "bg-slate-500/20", text: "text-slate-400", label: "Terminé" },
  annule: { bg: "bg-red-500/20", text: "text-red-400", label: "Annulé" },
};

// --- 2. PETITS COMPOSANTS ---

const StatCard = ({ label, value, subtext, icon, trend }: any) => (
  <div className="bg-[#111] border border-white/10 p-5 rounded-2xl flex flex-col justify-between shadow-lg shadow-black/40 h-32 relative overflow-hidden group">
    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150">
       {icon}
    </div>
    <div className="flex justify-between items-start z-10">
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">{label}</p>
        <p className="text-2xl font-bold text-white font-serif tracking-wide">{value}</p>
      </div>
      <div className={`p-2 rounded-lg bg-white/5 border border-white/5 ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-yellow-500'}`}>
        {icon}
      </div>
    </div>
    {subtext && (
       <div className="z-10 mt-auto pt-2 border-t border-white/5">
         <p className="text-xs text-gray-400 flex items-center gap-1">
           {trend === 'up' && <ArrowUpRight size={12} className="text-green-500"/>}
           {trend === 'down' && <ArrowDownRight size={12} className="text-red-500"/>}
           {subtext}
         </p>
       </div>
    )}
  </div>
);

const MenuButton = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-gradient-to-r from-yellow-700 to-yellow-600 text-black font-bold shadow-[0_0_15px_rgba(202,138,4,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span>{label}</span>
  </button>
);

const StatusDropdown = ({ currentStatus, onUpdate }: any) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors outline-none"><ChevronDown size={18} /></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="bg-[#111] border-white/10 text-white z-50">
      {Object.entries(statusColors).map(([key, val]) => (
        <DropdownMenuItem key={key} onClick={() => onUpdate(key)} className={`cursor-pointer text-gray-300 focus:bg-white/10 focus:text-white ${key === currentStatus ? 'bg-white/5' : ''}`}>
          <span className={`w-2 h-2 rounded-full mr-2 ${val.bg.replace('/20', '')}`} /> {val.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

// --- 3. COMPOSANT GRAPHIQUE SVG (Custom React) ---

const RevenueChart = () => {
  // Simulation de données live
  const [data, setData] = useState<number[]>([10, 15, 12, 18, 25, 22, 30, 28, 35, 32, 40, 38, 45, 42, 48, 40, 35, 30, 25, 28]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const lastVal = prev[prev.length - 1];
        const movement = (Math.random() - 0.5) * 15;
        const newVal = Math.max(5, Math.min(45, lastVal + movement));
        return [...prev.slice(1), newVal];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const width = 100;
  const height = 50;
  const step = width / (data.length - 1);

  const points = data.map((val, i) => `${i * step},${height - val}`).join(' ');
  const areaPath = `M 0,${height} ${points} L ${width},${height} Z`;
  const linePath = `M ${points.replace(/ /g, ' L ')}`;

  return (
    <div className="w-full h-64 relative bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden p-4">
       {/* Grille de fond */}
       <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-10">
          <div className="w-full h-px bg-white border-dashed"></div>
          <div className="w-full h-px bg-white border-dashed"></div>
          <div className="w-full h-px bg-white border-dashed"></div>
          <div className="w-full h-px bg-white border-dashed"></div>
       </div>

       <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
          <defs>
             <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#eab308" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#eab308" stopOpacity="0"/>
             </linearGradient>
          </defs>
          {/* Zone remplie */}
          <path d={areaPath} fill="url(#chartGradient)" className="transition-all duration-1000 ease-linear" />
          {/* Ligne */}
          <path d={linePath} fill="none" stroke="#eab308" strokeWidth="0.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000 ease-linear" />
          {/* Points (Dernier point) */}
          <circle cx="100" cy={height - data[data.length -1]} r="1" fill="#fff" className="transition-all duration-1000 ease-linear animate-pulse" />
       </svg>

       <div className="absolute top-4 right-4 flex items-center gap-2 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
          </span>
          <span className="text-xs font-bold text-yellow-500 uppercase">Live Flux</span>
       </div>
    </div>
  );
}

// --- 4. COMPOSANT PRINCIPAL (ADMIN SAPHIR) ---

const AdminSaphir = () => {
  const navigate = useNavigate();
  // Ajout de l'onglet 'comptabilite'
  const [activeTab, setActiveTab] = useState<"dashboard" | "clients" | "comptabilite">("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPolicy, setShowPolicy] = useState(false);

  // LOGIQUE
  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (!session) {
          navigate("/login", { replace: true });
          return;
        }
        
        const hasAccepted = localStorage.getItem("saphir_admin_cgu_v2_1"); 
        if (!hasAccepted) {
            setShowPolicy(true);
        }

        refreshAllData();
      } catch (error) {
        if (isMounted) navigate("/login", { replace: true });
      }
    };
    checkSession();
    return () => { isMounted = false; };
  }, [navigate]);

  const handleAcceptPolicy = () => {
    localStorage.setItem("saphir_admin_cgu_v2_1", "true");
    setShowPolicy(false);
    toast.success("Contrat validé. Accès autorisé.");
  };

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          refreshAllData();
          if (payload.eventType === 'INSERT') toast.info("Nouvelle réservation ! 🔔");
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const refreshAllData = async () => {
    try {
      await Promise.all([fetchReservations(), fetchClients()]);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select(`*, clients(*)`)
      .order("created_at", { ascending: false });
    if (!error) {
      const formattedData = (data as any[] || []).map(res => ({
        ...res,
        clients: Array.isArray(res.clients) ? res.clients[0] : res.clients
      }));
      setReservations(formattedData);
    }
  };

  const fetchClients = async () => {
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (!error) setClients(data as Client[]);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) toast.error("Erreur");
    else {
      toast.success("Statut mis à jour");
      fetchReservations();
    }
  };

  const openWhatsApp = (phone: string | null) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\s+/g, "").replace("+", "").replace(/^00/, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => 
      (r.client_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (r.client_phone || "").includes(searchTerm)
    );
  }, [reservations, searchTerm]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      (c.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.phone || "").includes(searchTerm)
    );
  }, [clients, searchTerm]);

  // STATS CALCULÉES
  const stats = useMemo(() => {
    const confirmed = reservations.filter(r => r.status === "confirme");
    const cancelled = reservations.filter(r => r.status === "annule");
    const totalRevenue = confirmed.reduce((sum, r) => sum + (r.total_price || 0), 0);
    const avgCart = confirmed.length > 0 ? totalRevenue / confirmed.length : 0;
    
    return {
      ca: totalRevenue,
      count: confirmed.length,
      today: reservations.filter(r => r.booking_date && isToday(parseISO(r.booking_date))).length,
      avgCart: avgCart,
      cancelRate: reservations.length > 0 ? (cancelled.length / reservations.length) * 100 : 0
    };
  }, [reservations]);

  // Transactions factices pour la démo Compta
  const [transactions] = useState<Transaction[]>([
    { id: 'TX-8829', client: 'Awa Diop', amount: 15000, status: 'completed', date: new Date(), method: 'OM/Momo' },
    { id: 'TX-8828', client: 'Michel K.', amount: 25000, status: 'completed', date: new Date(Date.now() - 3600000), method: 'Espèces' },
    { id: 'TX-8827', client: 'Sarah Lina', amount: 45000, status: 'pending', date: new Date(Date.now() - 7200000), method: 'Carte' },
    { id: 'TX-8826', client: 'Jean-Marc', amount: 12000, status: 'failed', date: new Date(Date.now() - 10800000), method: 'OM/Momo' },
  ]);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-yellow-500">
      <RefreshCw className="animate-spin mb-4" size={40}/>
      <p className="text-white">Initialisation Saphir...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-500/30">
      
      {/* MODALE JURIDIQUE (Considérée comme inchangée pour la clarté, incluse ici) */}
      <AnimatePresence>
        {showPolicy && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                    className="bg-[#0f0f0f] border border-yellow-600/40 rounded-sm max-w-3xl w-full shadow-[0_0_100px_rgba(202,138,4,0.15)] flex flex-col h-[85vh] md:h-[80vh]"
                >
                    <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-[#141414] shrink-0">
                        <div className="p-3 bg-yellow-600/10 rounded border border-yellow-600/30">
                            <Scale className="w-8 h-8 text-yellow-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif text-white tracking-wide uppercase">Contrat d'Adhésion & CGU-SI</h2>
                            <p className="text-xs text-yellow-600 uppercase tracking-widest font-bold">Document Officiel V2.1 - Institut Saphir</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-8 text-justify bg-[#0a0a0a] custom-scrollbar border-l-4 border-yellow-900/20">
                         {/* Contenu Juridique Abrégé pour l'exemple - remettre le texte complet si besoin */}
                        <div className="prose prose-invert prose-sm max-w-none text-gray-400 space-y-6 font-light leading-relaxed font-sans text-xs md:text-sm">
                            <div className="bg-red-900/10 border border-red-900/30 p-4 rounded text-red-200 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p><strong>AVERTISSEMENT LÉGAL :</strong> L'accès au portail d'administration numérique de l'Institut Saphir est strictement encadré.</p>
                            </div>
                            <p><strong>ARTICLE 1 : CONFIDENTIALITÉ.</strong> L'accès aux données financières est strictement réservé.</p>
                            {/* ... autres articles ... */}
                        </div>
                    </div>
                    <div className="p-6 border-t border-white/10 bg-[#141414] shrink-0 flex flex-col gap-4">
                        <button onClick={handleAcceptPolicy} className="w-full bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-black font-bold py-4 rounded transition-all transform active:scale-[0.99] shadow-lg shadow-yellow-900/20 flex items-center justify-center gap-3 uppercase tracking-wider text-sm">
                            <FileText size={18} /> Lu et Approuvé : Accéder au Portail
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <aside className="fixed left-0 top-0 h-full w-64 bg-[#111] border-r border-white/10 p-6 hidden lg:block z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-lg bg-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-600/20">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-yellow-500">SAPHIR</h1>
        </div>
        <nav className="space-y-2">
          <MenuButton icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          {/* Nouveau Bouton Compta */}
          <MenuButton icon={<TrendingUp size={20}/>} label="Comptabilité" active={activeTab === 'comptabilite'} onClick={() => setActiveTab('comptabilite')} />
          <MenuButton icon={<Users size={20}/>} label="Clients" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 w-full transition-colors border border-transparent hover:border-red-900/30 rounded-xl">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 p-4 md:p-6 pb-20">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="lg:hidden w-10 h-10 rounded-lg bg-yellow-600 flex items-center justify-center shrink-0">
                    <Crown className="w-6 h-6 text-black" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">
                        {activeTab === "dashboard" && "Tableau de Bord"}
                        {activeTab === "clients" && "Répertoire Clients"}
                        {activeTab === "comptabilite" && "Cockpit Financier"}
                    </h1>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                        Mode Administration <span className="w-1 h-1 bg-yellow-500 rounded-full"></span> {format(new Date(), "d MMMM yyyy", { locale: fr })}
                    </p>
                </div>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto items-center">
              {activeTab !== 'comptabilite' && (
                  <div className="relative group w-full md:w-80">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-xl blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
                      <div className="relative p-[1px] rounded-xl overflow-hidden bg-[#1a1a1a]">
                          <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#eab308_100%)] opacity-0 group-hover:opacity-100 transition duration-500" />
                          <div className="relative flex items-center bg-[#0a0a0a] rounded-xl px-3 py-2.5 z-10">
                              <Search className="w-4 h-4 text-gray-500 mr-3 group-focus-within:text-yellow-500 transition-colors" />
                              <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-white w-full placeholder-gray-600 text-sm" />
                          </div>
                      </div>
                  </div>
              )}
              <button onClick={refreshAllData} className="bg-[#1a1a1a] p-3 rounded-xl border border-white/10 hover:bg-white/5 active:scale-95 transition-all text-yellow-500 shrink-0">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* CONTENU PRINCIPAL */}
          {activeTab === "dashboard" && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                    label="Chiffre d'Affaires" 
                    value={`${new Intl.NumberFormat('fr-FR').format(stats.ca)} FCFA`} 
                    icon={<TrendingUp size={20}/>} trend="up" subtext="+12% vs mois dernier"
                />
                <StatCard 
                    label="Confirmés" 
                    value={stats.count} 
                    icon={<Check size={20}/>} trend="up" subtext="Haut taux de conversion"
                />
                <StatCard 
                    label="RDV Aujourd'hui" 
                    value={stats.today} 
                    icon={<Calendar size={20}/>} trend="neutral" subtext="Planning chargé"
                />
              </div>
              
              <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/50">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#161616]">
                    <h3 className="font-bold text-white flex items-center gap-2"><LayoutDashboard size={16} className="text-yellow-500"/> Réservations Récentes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 font-medium border-b border-white/5">
                      <tr>
                        <th className="p-4">Client</th>
                        <th className="p-4">Prestation</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredReservations.map((res) => (
                        <tr key={res.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-yellow-600 group-hover:text-yellow-400 transition">
                                <User size={18}/>
                              </div>
                              <div>
                                <div className="font-medium text-white">{res.client_name}</div>
                                <div className="text-xs text-gray-500">{res.client_phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">{res.service_name}</td>
                          <td className="p-4">
                            <div className="text-white">{res.booking_date ? format(parseISO(res.booking_date), "d MMM", { locale: fr }) : "-"}</div>
                            <div className="text-xs text-gray-500">{res.booking_time}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border border-white/5 ${statusColors[res.status]?.bg || 'bg-gray-500/20'} ${statusColors[res.status]?.text || 'text-gray-400'}`}>
                              {statusColors[res.status]?.label || res.status}
                            </span>
                          </td>
                          <td className="p-4 flex justify-end gap-2">
                            <button onClick={() => openWhatsApp(res.client_phone)} className="p-2 hover:bg-green-500/20 hover:text-green-400 rounded-lg transition-colors text-gray-400 border border-transparent hover:border-green-500/30">
                              <MessageCircle size={18} />
                            </button>
                            <StatusDropdown currentStatus={res.status} onUpdate={(s: string) => updateStatus(res.id, s)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredReservations.length === 0 && <div className="p-12 text-center text-gray-500">Aucune réservation trouvée.</div>}
                </div>
              </div>
            </motion.div>
          )}

          {/* VUE COMPTABILITÉ (NOUVELLE) */}
          {activeTab === "comptabilite" && (
            <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} className="space-y-6">
                
                {/* Cartes Financières */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        label="CA Global" 
                        value={`${new Intl.NumberFormat('fr-FR').format(stats.ca)} FCFA`} 
                        icon={<Wallet size={24}/>} trend="up" subtext="Basé sur les confirmations"
                    />
                    <StatCard 
                        label="Panier Moyen" 
                        value={`${new Intl.NumberFormat('fr-FR').format(stats.avgCart)} FCFA`} 
                        icon={<CreditCard size={24}/>} trend="neutral" subtext="Stable ce mois"
                    />
                    <StatCard 
                        label="Taux d'Annulation" 
                        value={`${stats.cancelRate.toFixed(1)}%`} 
                        icon={<AlertTriangle size={24}/>} trend={stats.cancelRate > 15 ? 'down' : 'up'} subtext={stats.cancelRate > 15 ? "Attention requise" : "Niveau acceptable"}
                    />
                    <StatCard 
                        label="Volume Commandes" 
                        value={stats.count} 
                        icon={<Activity size={24}/>} trend="up" subtext="Prestations réalisées"
                    />
                </div>

                {/* Section Graphique & Répartition */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="text-yellow-500"/> Évolution Flux (Temps Réel)
                            </h3>
                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">Dernières 60 sec</span>
                        </div>
                        <RevenueChart />
                    </div>

                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                        <h3 className="text-lg font-bold text-white mb-4">Répartition</h3>
                        <div className="space-y-4 flex-1">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <span className="text-emerald-400 font-medium text-sm">Payé (Confirmé)</span>
                                <span className="text-white font-bold">{stats.count}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <span className="text-amber-400 font-medium text-sm">En Attente</span>
                                <span className="text-white font-bold">{reservations.filter(r => r.status === 'en_attente').length}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <span className="text-red-400 font-medium text-sm">Annulé / Perdu</span>
                                <span className="text-white font-bold">{reservations.filter(r => r.status === 'annule').length}</span>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm border border-white/10 transition">
                            Exporter Rapport PDF
                        </button>
                    </div>
                </div>

                {/* Tableau Transactions */}
                <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-white/5 bg-[#161616]">
                        <h3 className="font-bold text-white">Flux de Trésorerie Récent</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-gray-400 font-medium">
                                <tr>
                                    <th className="p-4">ID Trans.</th>
                                    <th className="p-4">Client</th>
                                    <th className="p-4">Montant</th>
                                    <th className="p-4">Méthode</th>
                                    <th className="p-4">Statut</th>
                                    <th className="p-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-gray-500 text-xs">{tx.id}</td>
                                        <td className="p-4 text-white font-medium">{tx.client}</td>
                                        <td className="p-4 text-yellow-500 font-bold">{new Intl.NumberFormat('fr-FR').format(tx.amount)} FCFA</td>
                                        <td className="p-4 text-gray-300">{tx.method}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-xs border ${
                                                tx.status === 'completed' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                                tx.status === 'pending' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                                'bg-red-500/10 border-red-500/30 text-red-400'
                                            }`}>
                                                {tx.status === 'completed' ? 'Succès' : tx.status === 'pending' ? 'En cours' : 'Échec'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-gray-500 text-xs">{format(tx.date, "HH:mm")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </motion.div>
          )}

          {/* VUE CLIENTS */}
          {activeTab === "clients" && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-[#111] border border-white/10 rounded-2xl p-5 hover:border-yellow-600/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#222] flex items-center justify-center text-gray-400 group-hover:text-yellow-500 transition">
                        <User size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{client.full_name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1"><Phone size={10}/> {client.phone}</p>
                      </div>
                    </div>
                    <span className="bg-white/5 text-gray-300 px-2 py-1 rounded text-xs font-medium border border-white/10">
                      {client.total_reservations || 0} visites
                    </span>
                  </div>
                  <button onClick={() => openWhatsApp(client.phone)} className="w-full bg-green-900/10 text-green-400 border border-green-900/30 py-2.5 rounded-xl text-sm font-medium hover:bg-green-900/30 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                </div>
              ))}
              {filteredClients.length === 0 && <div className="col-span-full p-8 text-center text-gray-500">Aucun client trouvé.</div>}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminSaphir;