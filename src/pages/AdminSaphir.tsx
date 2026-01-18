import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, isToday, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  User, Crown, LayoutDashboard, Users, RefreshCw, 
  Search, MessageCircle, Calendar, Check, ChevronDown, Phone, LogOut, AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- TYPES SÉCURISÉS ---
interface ReservationWithClient extends Tables<"reservations"> {
  clients: {
    total_reservations: number;
  } | null;
}

interface Client extends Tables<"clients"> {
  total_reservations?: number;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  en_attente: { bg: "bg-amber-500/20", text: "text-amber-400", label: "En attente" },
  confirme: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Confirmé" },
  termine: { bg: "bg-slate-500/20", text: "text-slate-400", label: "Terminé" },
  annule: { bg: "bg-red-500/20", text: "text-red-400", label: "Annulé" },
};

const AdminSaphir = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"dashboard" | "clients">("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [reservations, setReservations] = useState<ReservationWithClient[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- VÉRIFICATION D'AUTHENTIFICATION ---
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("❌ Non authentifié - Redirection vers login");
        navigate("/login");
        return;
      }
      
      console.log("✅ Authentifié");
      setIsAuthenticated(true);
    };
    
    checkAuth();
  }, [navigate]);

  // --- CHARGEMENT ---
  useEffect(() => {
    if (!isAuthenticated) return; // Ne charger que si authentifié
    console.log("🚀 Démarrage du Dashboard...");
    refreshAllData();
  }, [isAuthenticated]);

  // --- ABONNEMENT AUX CHANGEMENTS EN TEMPS RÉEL ---
  useEffect(() => {
    // On s'abonne aux changements en direct
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écoute tout : INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          // QUAND QUELQUE CHOSE CHANGE :
          
          // Cas A : Une mise à jour (ex: statut change)
          if (payload.eventType === 'UPDATE') {
            setReservations((current) => 
              current.map((res) => 
                res.id === payload.new.id ? { ...res, ...payload.new } : res
              )
            );
          }
          
          // Cas B : Une nouvelle réservation arrive !
          if (payload.eventType === 'INSERT') {
            // On pourrait recharger toute la liste, ou l'ajouter manuellement.
            // Le plus simple pour avoir les infos clients (jointure) est de recharger.
            fetchReservations(); 
            toast.info("Nouvelle réservation reçue ! 🔔");
          }
        }
      )
      .subscribe();

    // Nettoyage quand on quitte la page
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshAllData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await Promise.all([fetchReservations(), fetchClients()]);
    } catch (err: any) {
      console.error("🔥 ERREUR FATALE:", err);
      setErrorMsg(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    console.log("... Récupération des réservations");
    const { data, error } = await supabase
      .from("reservations")
      .select(`*, clients!fk_reservation_client_unique(*)`)
      .order("booking_date", { ascending: true });

    if (error) {
      console.error("Erreur Supabase Reservations:", error);
      throw error;
    }

    const formattedData = (data as any[] || []).map(res => ({
      ...res,
      clients: Array.isArray(res.clients) ? res.clients[0] : res.clients
    })) as ReservationWithClient[];

    console.log("✅ Réservations reçues:", formattedData.length);
    setReservations(formattedData);
  };

  const fetchClients = async () => {
    console.log("... Récupération des clients");
    const { data, error } = await supabase.from("clients").select("*").order("total_reservations", { ascending: false });
    
    if (error) {
       console.error("Erreur Supabase Clients:", error);
       // On ne bloque pas tout si les clients échouent, on met juste un tableau vide
       setClients([]);
       return;
    }

    if (data) {
      // Version simplifiée sans le count complexe pour l'instant pour éviter les bugs
      setClients(data as Client[]);
    }
    console.log("✅ Clients reçus:", data?.length);
  };

  // --- ACTIONS ---
  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reservations").update({ status }).eq("id", id);
    toast.success("Statut mis à jour");
    fetchReservations(); // On recharge pour voir le changement
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\s+/g, "").replace("+", "").replace(/^00/, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // --- FILTRES ---
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

  // --- STATS ---
  const stats = useMemo(() => {
    const confirmed = reservations.filter(r => r.status === "confirme");
    return {
      ca: confirmed.reduce((sum, r) => sum + (r.total_price || 0), 0),
      count: confirmed.length,
      today: reservations.filter(r => r.booking_date && isToday(parseISO(r.booking_date))).length
    };
  }, [reservations]);

  // --- RENDU : GESTION D'ERREURS ---
  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-admin-gold">
      <RefreshCw className="animate-spin mb-4" size={40}/>
      <p>Chargement des données...</p>
    </div>
  );

  if (errorMsg) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
      <AlertTriangle className="text-red-500 mb-4" size={50} />
      <h1 className="text-2xl font-bold mb-2">Oups, une erreur est survenue</h1>
      <code className="bg-red-900/30 p-4 rounded text-red-200 mb-6 max-w-lg text-center border border-red-500/30">
        {errorMsg}
      </code>
      <button onClick={refreshAllData} className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200">
        Réessayer
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-admin-gold/30">
      
      {/* Sidebar (PC) */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#111] border-r border-white/10 p-6 hidden lg:block z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-lg bg-admin-gold flex items-center justify-center">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-xl font-bold tracking-wider">SAPHIR</h1>
        </div>
        <nav className="space-y-2">
          <MenuButton icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <MenuButton icon={<Users size={20}/>} label="Clients" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 w-full transition-colors">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">{activeTab === "dashboard" ? "Tableau de Bord" : "Répertoire Clients"}</h1>
              <p className="text-gray-500 text-sm">Mode Administration</p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-admin-gold transition-colors" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 w-64 focus:outline-none focus:border-admin-gold transition-all"
                />
              </div>
              <button onClick={refreshAllData} className="bg-[#1a1a1a] p-2.5 rounded-xl border border-white/10 hover:bg-white/5 active:scale-95 transition-all">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {activeTab === "dashboard" ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Chiffre d'Affaires" value={`${new Intl.NumberFormat().format(stats.ca)} FCFA`} icon={<Crown className="text-admin-gold"/>} />
                <StatCard label="Réservations Confirmées" value={stats.count} icon={<Check className="text-emerald-400"/>} />
                <StatCard label="RDV Aujourd'hui" value={stats.today} icon={<Calendar className="text-blue-400"/>} />
              </div>

              {/* Tableau Réservations */}
              <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 font-medium">
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
                        <tr key={res.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-admin-gold">
                                  <User size={18}/>
                                </div>
                                {(res.clients?.total_reservations ?? 0) >= 3 && (
                                  <div className="absolute -top-1 -right-1 bg-admin-gold rounded-full p-[2px] border border-black">
                                    <Crown size={10} className="text-black fill-black" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-white flex items-center gap-2">
                                  {res.client_name}
                                  {(res.clients?.total_reservations ?? 0) >= 5 && <span className="text-[9px] bg-admin-gold text-black px-1.5 py-0.5 rounded font-bold">VIP</span>}
                                </div>
                                <div className="text-xs text-gray-500">{res.client_phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-300">{res.service_name}</td>
                          <td className="p-4">
                            <div className="text-white">
                              {res.booking_date ? format(parseISO(res.booking_date), "d MMM", { locale: fr }) : "-"}
                            </div>
                            <div className="text-xs text-gray-500">{res.booking_time}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[res.status]?.bg || 'bg-gray-500/20'} ${statusColors[res.status]?.text || 'text-gray-400'}`}>
                              {statusColors[res.status]?.label || res.status}
                            </span>
                          </td>
                          <td className="p-4 flex justify-end gap-2">
                            <button onClick={() => openWhatsApp(res.client_phone)} className="p-2 hover:bg-green-500/20 hover:text-green-400 rounded-lg transition-colors text-gray-400" title="Contacter sur WhatsApp">
                              <MessageCircle size={18} />
                            </button>
                            <StatusDropdown currentStatus={res.status} onUpdate={(s: string) => updateStatus(res.id, s)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredReservations.length === 0 && <div className="p-8 text-center text-gray-500">Aucune réservation trouvée.</div>}
                </div>
              </div>
            </>
          ) : (
            // Vue Clients (Simplifiée)
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-[#111] border border-white/10 rounded-2xl p-5 hover:border-admin-gold/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#222] flex items-center justify-center text-gray-400">
                        <User size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                          {client.full_name}
                          {client.total_reservations && client.total_reservations >= 5 && <Crown size={14} className="text-admin-gold fill-admin-gold"/>}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1"><Phone size={10}/> {client.phone}</p>
                      </div>
                    </div>
                    <span className="bg-white/5 text-gray-300 px-2 py-1 rounded text-xs font-medium border border-white/10">
                      {client.total_reservations || 0} visites
                    </span>
                  </div>

                  <button 
                    onClick={() => openWhatsApp(client.phone)} 
                    className="w-full bg-green-500/10 text-green-400 py-2.5 rounded-xl text-sm font-medium hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} /> Contacter sur WhatsApp
                  </button>
                </div>
              ))}
              {filteredClients.length === 0 && <div className="col-span-full p-8 text-center text-gray-500">Aucun client trouvé.</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// --- PETITS COMPOSANTS ---
const StatCard = ({ label, value, icon }: any) => (
  <div className="bg-[#111] border border-white/10 p-5 rounded-2xl flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white font-display">{value}</p>
    </div>
    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">{icon}</div>
  </div>
);

const MenuButton = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-admin-gold text-black font-medium shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);

const StatusDropdown = ({ currentStatus, onUpdate }: any) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
      <ChevronDown size={18} />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="bg-[#111] border-white/10">
      {Object.entries(statusColors).map(([key, val]) => (
        <DropdownMenuItem 
          key={key} 
          onClick={() => onUpdate(key)}
          className={`cursor-pointer text-gray-300 focus:bg-white/10 ${key === currentStatus ? 'bg-white/5' : ''}`}
        >
          <span className={`w-2 h-2 rounded-full mr-2 ${val.bg.replace('/20', '')}`} />
          {val.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default AdminSaphir;