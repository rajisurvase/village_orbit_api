// Multi-village configuration based on domain/origin

export interface VillageConfig {
  id: string;
  name: string;
  domain: string;
}

// Available villages configuration
export const VILLAGES: Record<string, VillageConfig> = {
  shivankhed: {
    id: '4dd1a3a2-5e25-46ff-a830-e476c92865e6',
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
