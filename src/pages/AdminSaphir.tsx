import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isToday, parseISO, subDays, isSameDay, isValid } from "date-fns";
import { fr } from "date-fns/locale";
// On garde uniquement les icônes basiques garanties pour éviter les crashs
import {
  User, Crown, LayoutDashboard, Users, RefreshCw, 
  Search, MessageCircle, Calendar, Check, ChevronDown, Phone, LogOut, 
  CreditCard, AlertTriangle, FileText
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
  
  // CORRECTION OPTION 1 : Le point d'interrogation rend ce champ optionnel
  client_email?: string | null;
  
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

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  en_attente: { bg: "bg-amber-500/20", text: "text-amber-400", label: "En attente" },
  confirme: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Confirmé" },
  termine: { bg: "bg-slate-500/20", text: "text-slate-400", label: "Terminé" },
  annule: { bg: "bg-red-500/20", text: "text-red-400", label: "Annulé" },
};

// --- 2. PETITS COMPOSANTS ---

const StatCard = ({ label, value, subtext, icon }: any) => (
  <div className="bg-[#111] border border-white/10 p-5 rounded-2xl flex flex-col justify-between shadow-lg shadow-black/40 h-32 relative overflow-hidden">
    <div className="flex justify-between items-start z-10">
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">{label}</p>
        <p className="text-2xl font-bold text-white font-serif tracking-wide">{value}</p>
      </div>
      <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-yellow-500">
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
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-gradient-to-r from-yellow-700 to-yellow-600 text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
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

// --- 3. GRAPHIQUE SVG ULTRA-ROBUSTE ---

const RevenueChart = ({ data }: { data: Reservation[] }) => {
  const chartData = useMemo(() => {
    const days = [];
    // On boucle sur les 7 derniers jours
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      let dayRevenue = 0;
      
      try {
        if (Array.isArray(data)) {
          dayRevenue = data
            .filter(r => {
               if (!r.booking_date || r.status !== 'confirme') return false;
               try {
                  const rDate = parseISO(r.booking_date);
                  return isValid(rDate) && isSameDay(rDate, date);
               } catch { return false; }
            })
            .reduce((sum, r) => sum + (Number(r.total_price) || 0), 0);
        }
      } catch (e) {
        console.error("Erreur calcul", e);
      }
      
      days.push({
        label: format(date, 'dd', { locale: fr }),
        value: dayRevenue
      });
    }
    return days;
  }, [data]);

  // Sécurité Mathématique pour éviter Division par Zéro
  const maxValue = Math.max(...chartData.map(d => d.value), 1); // Min 1
  const width = 100;
  const height = 50;
  
  // Fonctions de coordonnées sécurisées
  const getY = (val: number) => {
     const safeVal = Number.isFinite(val) ? val : 0;
     return height - (safeVal / maxValue) * height;
  };
  const getX = (index: number) => {
     return (index / (Math.max(chartData.length - 1, 1))) * width;
  };

  const points = chartData.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPath = `M 0,${height} ${points} L ${width},${height} Z`;
  const linePath = `M ${points.replace(/ /g, ' L ')}`;

  return (
    <div className="w-full h-64 relative bg-[#0a0a0a] rounded-xl border border-white/10 p-4 flex flex-col">
       <div className="flex justify-between items-end mb-4">
         <div>
            <p className="text-gray-400 text-xs uppercase font-bold">Semaine</p>
            <h4 className="text-xl font-bold text-white font-serif mt-1">
               {new Intl.NumberFormat('fr-FR').format(chartData.reduce((acc, curr) => acc + curr.value, 0))} <span className="text-sm text-yellow-500">FCFA</span>
            </h4>
         </div>
       </div>

       <div className="flex-1 relative w-full">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#eab308" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#eab308" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#chartGradient)" />
              <path d={linePath} fill="none" stroke="#eab308" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
              {chartData.map((point, i) => (
                <circle 
                    key={i} cx={getX(i)} cy={getY(point.value)} r="2" fill="#eab308"
                />
              ))}
          </svg>
       </div>

       <div className="flex justify-between mt-2 px-1 text-[10px] text-gray-500 font-mono">
          {chartData.map((d, i) => <span key={i}>{d.label}</span>)}
       </div>
    </div>
  );
}

// --- 4. COMPOSANT PRINCIPAL ---

const AdminSaphir = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPolicy, setShowPolicy] = useState(false);

  // AUTHENTIFICATION
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (!session) { navigate("/login", { replace: true }); return; }
        
        if (!localStorage.getItem("saphir_admin_cgu_v2_1")) {
            setShowPolicy(true);
        }
        await loadData();
      } catch (e) {
        console.error(e);
      }
    };
    init();
    return () => { isMounted = false; };
  }, [navigate]);

  const loadData = async () => {
    try {
      const { data: resData } = await supabase.from("reservations").select(`*, clients(*)`).order("created_at", { ascending: false });
      if (resData) {
        setReservations(resData.map(r => ({ ...r, clients: Array.isArray(r.clients) ? r.clients[0] : r.clients })));
      }
      const { data: cliData } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (cliData) setClients(cliData);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleAcceptPolicy = () => {
    localStorage.setItem("saphir_admin_cgu_v2_1", "true");
    setShowPolicy(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) toast.error("Erreur");
    else {
      toast.success("Statut mis à jour");
      loadData();
    }
  };

  const openWhatsApp = (phone: string | null) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\s+/g, "").replace("+", "").replace(/^00/, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  // CALCULS STATS SÉCURISÉS
  const stats = useMemo(() => {
    const safeRes = Array.isArray(reservations) ? reservations : [];
    const confirmed = safeRes.filter(r => r.status === "confirme");
    const cancelled = safeRes.filter(r => r.status === "annule");
    const totalRevenue = confirmed.reduce((sum, r) => sum + (Number(r.total_price) || 0), 0);
    const count = confirmed.length;
    
    return {
      ca: totalRevenue,
      count: count,
      today: safeRes.filter(r => r.booking_date && isToday(parseISO(r.booking_date))).length,
      avgCart: count > 0 ? totalRevenue / count : 0,
      cancelRate: safeRes.length > 0 ? (cancelled.length / safeRes.length) * 100 : 0
    };
  }, [reservations]);

  // FILTRES
  const filteredReservations = useMemo(() => {
     return (reservations || []).filter(r => 
        (r.client_name || "").toLowerCase().includes(searchTerm.toLowerCase())
     );
  }, [reservations, searchTerm]);

  const filteredClients = useMemo(() => {
     return (clients || []).filter(c => 
        (c.full_name || "").toLowerCase().includes(searchTerm.toLowerCase())
     );
  }, [clients, searchTerm]);

  // RENDU DU CHARGEMENT
  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      
      {/* MODALE CGU */}
      {showPolicy && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
            <div className="bg-[#111] border border-yellow-600/40 p-6 rounded max-w-lg w-full">
                <h2 className="text-xl text-yellow-500 font-bold mb-4">Accès Réservé</h2>
                <p className="text-gray-400 text-sm mb-6">L'accès à la comptabilité est soumis à confidentialité.</p>
                <button onClick={handleAcceptPolicy} className="w-full bg-yellow-600 text-black font-bold py-3 rounded">Accepter et Entrer</button>
            </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#111] border-r border-white/10 p-6 hidden lg:block z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-yellow-600 rounded flex items-center justify-center"><Crown className="text-black"/></div>
          <h1 className="text-xl font-bold text-yellow-500">SAPHIR</h1>
        </div>
        <nav className="space-y-2">
          <MenuButton icon={<LayoutDashboard size={20}/>} label="Tableau de Bord" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <MenuButton icon={<CreditCard size={20}/>} label="Comptabilité" active={activeTab === 'comptabilite'} onClick={() => setActiveTab('comptabilite')} />
          <MenuButton icon={<Users size={20}/>} label="Clients" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
        </nav>
        <button onClick={handleLogout} className="absolute bottom-6 left-6 flex gap-3 text-red-400"><LogOut/> Déconnexion</button>
      </aside>

      {/* MAIN */}
      <main className="lg:ml-64 p-4 md:p-6 pb-20">
         <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
                <div className="lg:hidden w-10 h-10 bg-yellow-600 rounded flex items-center justify-center"><Crown className="text-black w-5 h-5"/></div>
                <h1 className="text-2xl font-bold">
                   {activeTab === 'dashboard' && 'Tableau de Bord'}
                   {activeTab === 'comptabilite' && 'Finance'}
                   {activeTab === 'clients' && 'Clients'}
                </h1>
            </div>
            <button onClick={() => window.location.reload()} className="bg-[#222] p-2 rounded text-yellow-500"><RefreshCw/></button>
         </div>

         {/* VUE COMPTABILITÉ */}
         {activeTab === "comptabilite" && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="CA Global" value={`${new Intl.NumberFormat('fr-FR').format(stats.ca)} FCFA`} icon={<CreditCard size={24}/>} />
                    <StatCard label="Panier Moyen" value={`${new Intl.NumberFormat('fr-FR').format(stats.avgCart)} FCFA`} icon={<CreditCard size={24}/>} />
                    <StatCard label="Taux Annulation" value={`${stats.cancelRate.toFixed(1)}%`} icon={<AlertTriangle size={24}/>} />
                    <StatCard label="Commandes" value={stats.count} icon={<LayoutDashboard size={24}/>} />
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <RevenueChart data={reservations} />
                </div>
            </div>
         )}

         {/* VUE DASHBOARD */}
         {activeTab === "dashboard" && (
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard label="Chiffre d'Affaires" value={`${new Intl.NumberFormat('fr-FR').format(stats.ca)} FCFA`} icon={<CreditCard size={20}/>} />
                  <StatCard label="Confirmés" value={stats.count} icon={<Check size={20}/>} />
                  <StatCard label="RDV Aujourd'hui" value={stats.today} icon={<Calendar size={20}/>} />
               </div>
               
               {/* Recherche */}
               <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex items-center border border-white/10">
                  <Search className="w-4 h-4 text-gray-500 mr-3" />
                  <input type="text" placeholder="Rechercher client..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-white w-full text-sm" />
               </div>

               {/* Tableau simple */}
               <div className="bg-[#111] rounded-2xl overflow-hidden border border-white/10">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-white">
                            <tr><th className="p-4">Client</th><th className="p-4">Prestation</th><th className="p-4">Date</th><th className="p-4">Statut</th><th className="p-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredReservations.map(res => (
                            <tr key={res.id}>
                                <td className="p-4">
                                    <div className="text-white font-medium">{res.client_name}</div>
                                    <div className="text-xs">{res.client_phone}</div>
                                </td>
                                <td className="p-4">{res.service_name}</td>
                                <td className="p-4">
                                    <div>{res.booking_date ? format(parseISO(res.booking_date), "dd MMM", {locale:fr}) : "-"}</div>
                                    <div className="text-xs">{res.booking_time}</div>
                                </td>
                                <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${statusColors[res.status]?.text}`}>{res.status}</span></td>
                                <td className="p-4 flex justify-end gap-2">
                                    <button onClick={() => openWhatsApp(res.client_phone)} className="p-2 bg-green-900/20 text-green-500 rounded"><MessageCircle size={16}/></button>
                                    <StatusDropdown currentStatus={res.status} onUpdate={(s: string) => updateStatus(res.id, s)} />
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredReservations.length === 0 && <div className="p-8 text-center text-gray-500">Aucune réservation trouvée.</div>}
                  </div>
               </div>
            </div>
         )}

         {/* VUE CLIENTS */}
         {activeTab === "clients" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {filteredClients.map(c => (
                  <div key={c.id} className="bg-[#111] p-5 rounded-2xl border border-white/10">
                     <h3 className="font-bold text-white">{c.full_name}</h3>
                     <p className="text-sm text-gray-500">{c.phone}</p>
                     <p className="text-xs mt-2 text-yellow-500">{c.total_reservations || 0} visites</p>
                     <button onClick={() => openWhatsApp(c.phone)} className="mt-4 w-full py-2 bg-white/5 text-gray-300 rounded text-sm hover:bg-white/10">Contacter</button>
                  </div>
               ))}
            </div>
         )}

      </main>
    </div>
  );
};

export default AdminSaphir;