import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isToday, parseISO, subDays, startOfDay, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Crown, LayoutDashboard, Users, RefreshCw, 
  Search, MessageCircle, Calendar, Check, ChevronDown, Phone, LogOut, 
  Scale, AlertTriangle, FileText,
  TrendingUp, Wallet, CreditCard, Activity
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

// --- 3. COMPOSANT GRAPHIQUE SVG (REAL DATA) ---

const RevenueChart = ({ data }: { data: Reservation[] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 1. Calculer les 7 derniers jours et le CA par jour
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayRevenue = data
        .filter(r => r.status === 'confirme' && r.booking_date && isSameDay(parseISO(r.booking_date), date))
        .reduce((sum, r) => sum + (r.total_price || 0), 0);
      
      days.push({
        date: date,
        label: format(date, 'dd MMM', { locale: fr }),
        value: dayRevenue
      });
    }
    return days;
  }, [data]);

  // 2. Normalisation pour le SVG (0 à 100 en X, 0 à 100 en Y pour simplifier)
  const maxValue = Math.max(...chartData.map(d => d.value), 10000); // Min 10000 pour éviter platitude
  const width = 100;
  const height = 50;
  
  // Fonction pour convertir valeur en coordonnée Y
  const getY = (val: number) => height - (val / maxValue) * height; // Inversé car SVG Y=0 est en haut
  const getX = (index: number) => (index / (chartData.length - 1)) * width;

  // Création du chemin SVG
  const points = chartData.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPath = `M 0,${height} ${points} L ${width},${height} Z`;
  const linePath = `M ${points.replace(/ /g, ' L ')}`;

  return (
    <div className="w-full h-80 relative bg-[#0a0a0a] rounded-xl border border-white/10 p-6 flex flex-col">
       
       {/* Titre Interne */}
       <div className="flex justify-between items-end mb-4">
         <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Performance Hebdomadaire</p>
            <h4 className="text-2xl font-bold text-white font-serif mt-1">
               {new Intl.NumberFormat('fr-FR').format(chartData.reduce((acc, curr) => acc + curr.value, 0))} <span className="text-sm text-yellow-500">FCFA</span>
            </h4>
         </div>
       </div>

       {/* Zone Graphique */}
       <div className="flex-1 relative w-full" onMouseLeave={() => setHoveredIndex(null)}>
          {/* Lignes de repère (Axes Y) */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-gray-600 font-mono">
              <div className="w-full h-px bg-white/5 border-dashed border-white/10 flex items-center">
                  <span className="-mt-4">{new Intl.NumberFormat('fr-FR', { notation: "compact" }).format(maxValue)}</span>
              </div>
              <div className="w-full h-px bg-white/5 border-dashed border-white/10 flex items-center">
                  <span className="-mt-4">{new Intl.NumberFormat('fr-FR', { notation: "compact" }).format(maxValue / 2)}</span>
              </div>
              <div className="w-full h-px bg-white/5 border-dashed border-white/10 flex items-center">
                  <span className="-mt-4">0</span>
              </div>
          </div>

          <svg className="w-full h-full overflow-visible z-10 relative" preserveAspectRatio="none" viewBox="0 0 100 50">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#eab308" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#eab308" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* Aire */}
              <path d={areaPath} fill="url(#chartGradient)" />
              
              {/* Ligne */}
              <path d={linePath} fill="none" stroke="#eab308" strokeWidth="0.8" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Points Interactifs */}
              {chartData.map((point, i) => (
                <circle 
                    key={i}
                    cx={getX(i)} 
                    cy={getY(point.value)} 
                    r="2" // Zone clickable invisible plus grande
                    stroke="transparent"
                    strokeWidth="10"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                />
              ))}

              {/* Point Survolé Visuel */}
              {hoveredIndex !== null && (
                 <circle 
                    cx={getX(hoveredIndex)} 
                    cy={getY(chartData[hoveredIndex].value)} 
                    r="1.5" 
                    fill="#fff" 
                    stroke="#eab308" 
                    strokeWidth="0.5" 
                 />
              )}
          </svg>
          
          {/* Tooltip */}
          {hoveredIndex !== null && (
             <div 
                className="absolute bg-[#1a1a1a] border border-yellow-500/30 px-3 py-2 rounded-lg shadow-xl pointer-events-none z-20"
                style={{ 
                    left: `${(hoveredIndex / (chartData.length - 1)) * 100}%`, 
                    top: '10%',
                    transform: 'translate(-50%, -100%)' 
                }}
             >
                <p className="text-xs text-gray-400 mb-0.5">{chartData[hoveredIndex].label}</p>
                <p className="text-sm font-bold text-yellow-500 whitespace-nowrap">
                    {new Intl.NumberFormat('fr-FR').format(chartData[hoveredIndex].value)} FCFA
                </p>
             </div>
          )}
       </div>

       {/* Labels Axe X (Dates) */}
       <div className="flex justify-between mt-2 px-1">
          {chartData.map((d, i) => (
             <span key={i} className={`text-[10px] uppercase font-bold tracking-wider ${i === hoveredIndex ? 'text-white' : 'text-gray-600'} transition-colors`}>
                {d.label.split(' ')[0]} {/* Juste le jour */}
             </span>
          ))}
       </div>
    </div>
  );
}

// --- 4. COMPOSANT PRINCIPAL (ADMIN SAPHIR) ---

const AdminSaphir = () => {
  const navigate = useNavigate();
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

  // Transactions factices pour la démo Compta (À connecter plus tard si besoin de table transactions dédiée)
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
      
      {/* MODALE JURIDIQUE */}
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
                        <div className="prose prose-invert prose-sm max-w-none text-gray-400 space-y-6 font-light leading-relaxed font-sans text-xs md:text-sm">
                            <div className="bg-red-900/10 border border-red-900/30 p-4 rounded text-red-200 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p><strong>AVERTISSEMENT LÉGAL :</strong> L'accès au portail d'administration numérique de l'Institut Saphir est strictement encadré.</p>
                            </div>
                            <p><strong>ARTICLE 1 : CONFIDENTIALITÉ.</strong> L'accès aux données financières est strictement réservé.</p>
                            {/* ... Texte abrégé pour l'affichage ... */}
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
                          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#0a0a0a] border-none outline-none text-white w-full placeholder-gray-600 text-sm px-3 py-2.5 rounded-xl" />
                      </div>
                  </div>
              )}
              <button onClick={refreshAllData} className="bg-[#1a1a1a] p-3 rounded-xl border border-white/10 hover:bg-white/5 active:scale-95 transition-all text-yellow-500 shrink-0">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* VUE COMPTABILITÉ */}
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
                        {/* GRAPHIQUE CONNECTÉ */}
                        <RevenueChart data={reservations} />
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
                    </div>
                </div>

                {/* Tableau Transactions (Fictif pour l'instant) */}
                <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl opacity-60 pointer-events-none grayscale">
                    <div className="p-4 border-b border-white/5 bg-[#161616] flex justify-between">
                        <h3 className="font-bold text-white">Flux de Trésorerie (Module en dév.)</h3>
                    </div>
                     <div className="p-8 text-center text-gray-500">
                        La connexion bancaire directe sera disponible dans la version 2.2
                     </div>
                </div>

            </motion.div>
          )}

          {/* VUE DASHBOARD (EXISTANTE) */}
          {activeTab === "dashboard" && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Chiffre d'Affaires" value={`${new Intl.NumberFormat('fr-FR').format(stats.ca)} FCFA`} icon={<TrendingUp size={20}/>} trend="up" />
                <StatCard label="Confirmés" value={stats.count} icon={<Check size={20}/>} trend="up" />
                <StatCard label="RDV Aujourd'hui" value={stats.today} icon={<Calendar size={20}/>} trend="neutral" />
              </div>
              <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/50">
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
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminSaphir;