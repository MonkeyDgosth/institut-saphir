import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isToday, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Crown, LayoutDashboard, Users, RefreshCw, 
  Search, MessageCircle, Calendar, Check, ChevronDown, Phone, LogOut, 
  ShieldCheck, Scale, AlertTriangle, Lock, FileText
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

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  en_attente: { bg: "bg-amber-500/20", text: "text-amber-400", label: "En attente" },
  confirme: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Confirmé" },
  termine: { bg: "bg-slate-500/20", text: "text-slate-400", label: "Terminé" },
  annule: { bg: "bg-red-500/20", text: "text-red-400", label: "Annulé" },
};

// --- 2. PETITS COMPOSANTS (DÉFINIS AVANT L'USAGE) ---

const StatCard = ({ label, value, icon }: any) => (
  <div className="bg-[#111] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-black/40">
    <div>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white font-serif">{value}</p>
    </div>
    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">{icon}</div>
  </div>
);

const MenuButton = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-yellow-600 text-black font-bold shadow-[0_0_15px_rgba(202,138,4,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
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

// --- 3. COMPOSANT PRINCIPAL (ADMIN SAPHIR) ---

const AdminSaphir = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"dashboard" | "clients">("dashboard");
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
        
        // Vérif Contrat V2.1
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

  const stats = useMemo(() => {
    const confirmed = reservations.filter(r => r.status === "confirme");
    return {
      ca: confirmed.reduce((sum, r) => sum + (r.total_price || 0), 0),
      count: confirmed.length,
      today: reservations.filter(r => r.booking_date && isToday(parseISO(r.booking_date))).length
    };
  }, [reservations]);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-yellow-500">
      <RefreshCw className="animate-spin mb-4" size={40}/>
      <p className="text-white">Chargement...</p>
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
                                <p><strong>AVERTISSEMENT LÉGAL :</strong> L'accès au portail d'administration numérique (ci-après le « Back-Office ») de l'Institut Saphir constitue une prérogative strictement encadrée. Toute connexion à cet espace vaut acceptation pleine, entière et irrévocable des présentes conditions.</p>
                            </div>
                            <h3 className="text-white font-bold border-b border-white/10 pb-2 mt-6">TITRE I : DISPOSITIONS GÉNÉRALES</h3>
                            <p><strong>ARTICLE 1 : DÉFINITIONS.</strong> 1.1. Utilisateur Habilité : Désigne exclusivement les membres de la direction ou employés accrédités. 1.2. Données Sensibles : Inclut les identités clients et chiffres d'affaires.</p>
                            <p><strong>ARTICLE 2 : AUTHENTIFICATION.</strong> 2.1. Incessibilité : Les identifiants sont personnels et ne peuvent être prêtés. 2.2. Responsabilité pénale : L'usurpation d'identité numérique est constitutive d'une infraction pénale.</p>
                            <p><strong>ARTICLE 3 : PROTOCOLE DE DÉCONNEXION.</strong> Il est impératif d'utiliser la fonction « Déconnexion » à l'issue de chaque session. En cas d'absence, le poste doit être verrouillé.</p>

                            <h3 className="text-white font-bold border-b border-white/10 pb-2 mt-6">TITRE II : PROTECTION DES DONNÉES</h3>
                            <p><strong>ARTICLE 4 : SECRET PROFESSIONNEL.</strong> L'Utilisateur est tenu au secret professionnel le plus strict. Aucune information issue du Back-Office ne doit être divulguée à des tiers.</p>
                            <p><strong>ARTICLE 5 : RGPD.</strong> La consultation des fiches clients n'est autorisée que pour les besoins stricts du service. Il est interdit d'annoter les fiches avec des commentaires subjectifs.</p>
                            <p><strong>ARTICLE 6 : PROPRIÉTÉ INTELLECTUELLE.</strong> L'ensemble de l'architecture logicielle et des bases de données reste la propriété exclusive de l'Institut Saphir.</p>
                            <p><strong>ARTICLE 7 : INTERDICTION D'EXTRACTION.</strong> Il est formellement interdit d'effectuer des captures d'écran ou d'exporter la base de données vers un support externe (clé USB, Cloud personnel).</p>

                            <h3 className="text-white font-bold border-b border-white/10 pb-2 mt-6">TITRE III : SÉCURITÉ INFORMATIQUE & TECHNIQUE</h3>
                            <p><strong>ARTICLE 8 : USAGE DES TERMINAUX.</strong> L'accès via des réseaux Wi-Fi publics est interdit sauf utilisation d'un VPN agréé. L'utilisateur garantit que son terminal est sécurisé.</p>
                            <p className="opacity-90"><strong>ARTICLE 9 : ORIGINE DU DÉVELOPPEMENT ET LIMITATION DE GARANTIE.</strong> 9.1. L'Utilisateur reconnaît que l'architecture logicielle du présent Back-Office a été élaborée à l'aide de technologies d'intelligence artificielle générative et de processus d'automatisation algorithmique. 9.2. En raison de la nature spécifique de ce mode de développement, il est expressément convenu qu'aucune demande de remboursement, partielle ou totale, ne pourra être exigée ou honorée une fois le déploiement de la solution effectué. 9.3. La garantie de service se limite exclusivement à l'application de révisions techniques et correctifs (maintenance) nécessaires à la stabilité du système, à l'exclusion de toute refonte.</p>
                            <p><strong>ARTICLE 10 : INTÉGRITÉ DES DONNÉES.</strong> L'Utilisateur certifie l'exactitude des montants saisis lors des encaissements. Toute manipulation visant à minorer le chiffre d'affaires constitue une faute lourde.</p>
                            <p><strong>ARTICLE 11 : TRAÇABILITÉ (LOGS).</strong> L'Utilisateur est informé que ses actions font l'objet d'un traçage informatique. Ces enregistrements font foi en justice.</p>

                            <h3 className="text-white font-bold border-b border-white/10 pb-2 mt-6">TITRE IV : SANCTIONS</h3>
                            <p><strong>ARTICLE 15 : SUSPENSION.</strong> La Direction se réserve le droit de révoquer l'accès d'un Utilisateur sans préavis en cas de suspicion de violation des règles.</p>
                            <p><strong>ARTICLE 16 : SANCTIONS.</strong> Le non-respect des dispositions de la présente Charte expose le contrevenant à des sanctions disciplinaires (licenciement) ainsi qu'à des poursuites pénales et civiles.</p>
                            <p><strong>ARTICLE 17 : JURIDICTION.</strong> Tout litige relève de la compétence exclusive des tribunaux du ressort du siège social de l'Institut Saphir.</p>
                            
                            <div className="pt-4 text-center text-xs text-gray-600 italic">Document confidentiel - Reproduction interdite - Direction Générale Saphir</div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-white/10 bg-[#141414] shrink-0 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-xs text-gray-500 bg-black/50 p-3 rounded border border-white/5">
                            <Lock className="w-4 h-4 shrink-0 text-gray-400" />
                            <p>En validant, je certifie avoir lu les 17 articles ci-dessus et j'engage ma responsabilité pénale et civile sur l'utilisation de cet outil.</p>
                        </div>
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
          <div className="w-10 h-10 rounded-lg bg-yellow-600 flex items-center justify-center">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-yellow-500">SAPHIR</h1>
        </div>
        <nav className="space-y-2">
          <MenuButton icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <MenuButton icon={<Users size={20}/>} label="Clients" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 w-full transition-colors border border-transparent hover:border-red-900/30 rounded-xl">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="lg:hidden w-10 h-10 rounded-lg bg-yellow-600 flex items-center justify-center shrink-0">
                    <Crown className="w-6 h-6 text-black" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{activeTab === "dashboard" ? "Tableau de Bord" : "Répertoire Clients"}</h1>
                    <p className="text-gray-500 text-sm">Mode Administration</p>
                </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto items-center">
              <div className="relative group w-full md:w-80">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-xl blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
                  <div className="relative p-[1px] rounded-xl overflow-hidden bg-[#1a1a1a]">
                      <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#eab308_100%)] opacity-0 group-hover:opacity-100 transition duration-500" />
                      <div className="relative flex items-center bg-[#0a0a0a] rounded-xl px-3 py-2.5 z-10">
                          <Search className="w-4 h-4 text-gray-500 mr-3 group-focus-within:text-yellow-500 transition-colors" />
                          <input type="text" placeholder="Rechercher client, tél..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-white w-full placeholder-gray-600 text-sm" />
                      </div>
                  </div>
              </div>
              <button onClick={refreshAllData} className="bg-[#1a1a1a] p-3 rounded-xl border border-white/10 hover:bg-white/5 active:scale-95 transition-all text-yellow-500 shrink-0">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {activeTab === "dashboard" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Chiffre d'Affaires" value={`${new Intl.NumberFormat('fr-FR').format(stats.ca)} FCFA`} icon={<Crown className="text-yellow-500"/>} />
                <StatCard label="Confirmés" value={stats.count} icon={<Check className="text-emerald-400"/>} />
                <StatCard label="RDV Aujourd'hui" value={stats.today} icon={<Calendar className="text-blue-400"/>} />
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
                  {filteredReservations.length === 0 && <div className="p-12 text-center text-gray-500">Aucune réservation trouvée.</div>}
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminSaphir;