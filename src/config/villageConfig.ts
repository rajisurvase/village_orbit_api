// Multi-village configuration based on domain/origin

export interface VillageConfig {
  id: string;
  name: string;
  domain: string;
}


export interface Geography {
  altitude: string;
  latitude: string;
  longitude: string;
}

export interface HeroImage {
  alt: string;
  src: string;
}

export interface Population {
  male: number;
  total: number;
  female: number;
  literacy: string;
}

export interface VillageData {
  area: string;
  name: string;
  state: string;
  vision: string;
  culture: string[];
  pincode: string;
  district: string;
  geography: Geography;
  heroImages: HeroImage[];
  population: Population;
  description: string;
  established: string;
}

export interface Office {
  email: string;
  hours: string;
  phone: string;
  address: string;
  website: string;
}

export interface Emergency {
  fire: string;
  police: string;
  ambulance: string;
  local_emergency: string;
}

export interface PersonProfile {
  name: string;
  image: string;
  profession: string;
  description: string;
  contact?: string;
  email?: string;
}

export interface QuickService {
  id: string;
  title: string;
  description: string;
  requiredDocuments: string[];
  tips: string[];
  buttonText: string;
}

export interface Notice {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  attachmentUrl?: string;
  isActive?: boolean;
}

export interface GalleryItem {
  id?: string;
  title: string;
  image?: string;
  type?: string;
  category?: string;
  date?: string;
  description?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnail?: string;
  category?: string;
  description?: string;
}

export interface VillageConfigData {
  village: VillageData;
  panchayat: {
    sarpanch: PersonProfile;
    upsarpanch?: PersonProfile;
    secretary: PersonProfile;
    wardMembers: PersonProfile[];
    staff: PersonProfile[];
  };

  proudPeople?: PersonProfile[];
  ashaWorkers?: PersonProfile[];
  anganwadiWorkers?: PersonProfile[];

  announcements: any[];
  schemes: any[];
  developmentWorks: any;
  gallery: GalleryItem[];
  videos?: VideoItem[];
  contact: {
    office: Office;
    emergency: Emergency;
  };
  documents: any[];
  quickServices?: QuickService[];
  services: any[];
  notices?: Notice[];
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
    youtube?: string;
    arattai?: string;
  };
  govStaff?: Array<{
    name: string;
    role: string;
    photo: string;
    work: string;
    contact: string;
    email?: string;
  }>;
  newsTicker?: Array<{
    id: string;
    text: string;
    priority?: "high" | "medium" | "low";
  }>;

  scrollerCards?: Array<{
    id: string;
    title: string;
    description: string;
    icon?: string;
    image?: string;
  }>;
}


// Available villages configuration
export const VILLAGES: Record<string, VillageConfig> = {
  shivankhed: {
    id: 'c10f6335-ab11-48b1-b65d-62bfece2fffd',
    name: 'Shivankhed',
    domain: 'shivankhed'
  }
};

// Get current village based on hostname
// export const getCurrentVillage = (): VillageConfig => {
//   if (typeof window === 'undefined') {
//     return VILLAGES.shivankhed; // Default for SSR
//   }

//   const hostname = window.location.hostname;
  
//   // Check if hostname contains village identifier
//   for (const village of Object.values(VILLAGES)) {
//     if (hostname.includes(village.domain)) {
//       return village;
//     }
//   }
  
//   // Default to Shivankhed if no match found
//   return VILLAGES.shivankhed;
// };

// Get filtered village data
// export const getVillageData = (allData: any) => {
//   // const currentVillage = getCurrentVillage();

//   // If data has village-specific structure, filter by village ID
//   // For now, return all data but you can extend this to filter specific sections
//   return {
//     ...allData,
//     currentVillageId: currentVillage.id,
//     currentVillageName: currentVillage.name
//   };
// };
