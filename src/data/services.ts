import massageImg from "@/assets/massage.jpg";
import facialImg from "@/assets/facial.jpg";
import hammamImg from "@/assets/hammam.jpg";
import signatureImg from "@/assets/signature.jpg";

export interface ServiceOption {
  id: string;
  name: string;
  price: number;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  options: {
    huiles: ServiceOption[];
    musique: ServiceOption[];
    intensite: ServiceOption[];
  };
}

export const categories = [
  { id: "all", name: "Tous" },
  { id: "massages", name: "Massages" },
  { id: "visage", name: "Soins du Visage" },
  { id: "hammam", name: "Rituels Hammam" },
  { id: "signature", name: "Soins Signature" },
];

export const services: Service[] = [
  {
    id: "massage-relaxant",
    name: "Massage Relaxant Or Rose",
    category: "massages",
    description: "Un voyage sensoriel aux huiles précieuses pour une détente absolue du corps et de l'esprit.",
    duration: "60 min",
    price: 35000,
    image: massageImg,
    options: {
      huiles: [
        { id: "lavande", name: "Lavande Provence", price: 0 },
        { id: "eucalyptus", name: "Eucalyptus Premium", price: 3000 },
        { id: "rose", name: "Rose de Damas", price: 5000 },
      ],
      musique: [
        { id: "zen", name: "Zen & Nature", price: 0 },
        { id: "piano", name: "Piano Classique", price: 0 },
        { id: "silence", name: "Silence Absolu", price: 0 },
      ],
      intensite: [
        { id: "douce", name: "Douce", price: 0 },
        { id: "moyenne", name: "Moyenne", price: 0 },
        { id: "intense", name: "Intense", price: 0 },
      ],
    },
  },
  {
    id: "massage-pierres",
    name: "Massage aux Pierres Chaudes",
    category: "massages",
    description: "L'alliance parfaite de la chaleur des pierres volcaniques et des techniques ancestrales.",
    duration: "90 min",
    price: 55000,
    image: massageImg,
    options: {
      huiles: [
        { id: "argan", name: "Argan Bio", price: 0 },
        { id: "jasmin", name: "Jasmin d'Orient", price: 4000 },
        { id: "oud", name: "Oud Royal", price: 8000 },
      ],
      musique: [
        { id: "zen", name: "Zen & Nature", price: 0 },
        { id: "oriental", name: "Oriental Dreams", price: 0 },
        { id: "silence", name: "Silence Absolu", price: 0 },
      ],
      intensite: [
        { id: "douce", name: "Douce", price: 0 },
        { id: "moyenne", name: "Moyenne", price: 0 },
        { id: "intense", name: "Intense", price: 0 },
      ],
    },
  },
  {
    id: "facial-eclat",
    name: "Soin Visage Éclat Diamant",
    category: "visage",
    description: "Révélez la luminosité naturelle de votre peau avec notre soin signature aux actifs précieux.",
    duration: "75 min",
    price: 45000,
    image: facialImg,
    options: {
      huiles: [
        { id: "hyaluronique", name: "Acide Hyaluronique", price: 0 },
        { id: "vitaminec", name: "Vitamine C Pure", price: 5000 },
        { id: "or", name: "Masque à l'Or 24K", price: 15000 },
      ],
      musique: [
        { id: "spa", name: "Spa Melody", price: 0 },
        { id: "nature", name: "Sons de la Nature", price: 0 },
        { id: "silence", name: "Silence Absolu", price: 0 },
      ],
      intensite: [
        { id: "hydratant", name: "Hydratant", price: 0 },
        { id: "antiage", name: "Anti-Âge", price: 5000 },
        { id: "detox", name: "Détox Profond", price: 3000 },
      ],
    },
  },
  {
    id: "hammam-royal",
    name: "Rituel Hammam Royal",
    category: "hammam",
    description: "Une expérience complète inspirée des traditions orientales : gommage, enveloppement et massage.",
    duration: "120 min",
    price: 75000,
    image: hammamImg,
    options: {
      huiles: [
        { id: "savonnoir", name: "Savon Noir Traditionnel", price: 0 },
        { id: "argan", name: "Huile d'Argan Pure", price: 5000 },
        { id: "ambre", name: "Ambre & Musc", price: 7000 },
      ],
      musique: [
        { id: "oriental", name: "Musique Orientale", price: 0 },
        { id: "meditation", name: "Méditation", price: 0 },
        { id: "silence", name: "Silence Absolu", price: 0 },
      ],
      intensite: [
        { id: "doux", name: "Gommage Doux", price: 0 },
        { id: "moyen", name: "Gommage Moyen", price: 0 },
        { id: "intense", name: "Gommage Intense", price: 0 },
      ],
    },
  },
  {
    id: "signature-saphir",
    name: "L'Expérience SAPHIR",
    category: "signature",
    description: "Notre rituel exclusif combinant les meilleurs soins dans une parenthèse de luxe ultime.",
    duration: "180 min",
    price: 150000,
    image: signatureImg,
    options: {
      huiles: [
        { id: "signature", name: "Mélange Signature SAPHIR", price: 0 },
        { id: "diamant", name: "Élixir aux Diamants", price: 20000 },
        { id: "royal", name: "Royal Collection", price: 30000 },
      ],
      musique: [
        { id: "live", name: "Musique Live (Harpe)", price: 25000 },
        { id: "personnalisee", name: "Playlist Personnalisée", price: 0 },
        { id: "silence", name: "Silence Absolu", price: 0 },
      ],
      intensite: [
        { id: "equilibre", name: "Équilibré", price: 0 },
        { id: "intense", name: "Intense & Profond", price: 0 },
        { id: "zen", name: "Zen & Méditatif", price: 0 },
      ],
    },
  },
];

export const timeSlots = [
  "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];
