/**
 * Location data for African countries, states, and local government areas
 * Used for the location dropdown selectors in the land listing creation form
 */

export interface LocationData {
  countries: {
    [key: string]: {
      states: {
        [key: string]: string[]; // Local government areas
      };
    };
  };
}

// African countries with states and local government areas
// This is a simplified dataset - in a production environment, this would be more comprehensive
export const africanLocationData: LocationData = {
  countries: {
    "Nigeria": {
      states: {
        "Lagos": [
          "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", 
          "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye", 
          "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", 
          "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"
        ],
        "Abuja FCT": [
          "Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"
        ],
        "Rivers": [
          "Port Harcourt", "Obio-Akpor", "Okrika", "Ogu–Bolo", "Eleme", 
          "Tai", "Gokana", "Khana", "Oyigbo", "Opobo–Nkoro", 
          "Andoni", "Bonny", "Degema", "Asari-Toru", "Akuku-Toru", 
          "Abua–Odual", "Ahoada West", "Ahoada East", "Ogba–Egbema–Ndoni", "Emohua", 
          "Ikwerre", "Etche", "Omuma"
        ]
      }
    },
    "Kenya": {
      states: {
        "Nairobi": [
          "Westlands", "Dagoretti", "Langata", "Kibra", "Roysambu", 
          "Kasarani", "Ruaraka", "Embakasi", "Makadara", "Kamukunji", 
          "Starehe", "Mathare"
        ],
        "Mombasa": [
          "Changamwe", "Jomvu", "Kisauni", "Nyali", "Likoni", "Mvita"
        ],
        "Kisumu": [
          "Kisumu East", "Kisumu West", "Kisumu Central", "Seme", "Nyando", 
          "Muhoroni", "Nyakach"
        ]
      }
    },
    "South Africa": {
      states: {
        "Gauteng": [
          "Johannesburg", "Ekurhuleni", "Tshwane", "West Rand", "Sedibeng"
        ],
        "Western Cape": [
          "Cape Town", "Cape Winelands", "Overberg", "West Coast", "Garden Route", "Central Karoo"
        ],
        "KwaZulu-Natal": [
          "eThekwini", "uMgungundlovu", "Ugu", "King Cetshwayo", "iLembe",
          "Harry Gwala", "Uthukela", "Umzinyathi", "Amajuba", "Zululand", "Umkhanyakude"
        ]
      }
    },
    "Ghana": {
      states: {
        "Greater Accra": [
          "Accra Metropolitan", "Tema Metropolitan", "Ashaiman Municipal", "La Dade Kotopon Municipal", 
          "Ledzokuku Municipal", "La Nkwantanang Madina Municipal", "Adentan Municipal", "Ga East Municipal",
          "Ga West Municipal", "Ga South Municipal", "Ga Central Municipal", "Okaikwei North Municipal",
          "Ablekuma North Municipal", "Ablekuma West Municipal", "Ablekuma Central Municipal", "Ayawaso West Municipal",
          "Ayawaso East Municipal", "Ayawaso Central Municipal", "Krowor Municipal", "Kpone Katamanso Municipal"
        ],
        "Ashanti": [
          "Kumasi Metropolitan", "Asokore Mampong Municipal", "Oforikrom Municipal", "Tafo Municipal",
          "Suame Municipal", "Old Tafo Municipal", "Asokwa Municipal", "Kwadaso Municipal", "Ejisu Municipal"
        ],
        "Western": [
          "Sekondi Takoradi Metropolitan", "Effia-Kwesimintsim Municipal", "Ahanta West Municipal",
          "Tarkwa-Nsuaem Municipal", "Prestea-Huni Valley Municipal", "Wassa Amenfi East Municipal"
        ]
      }
    },
    "Egypt": {
      states: {
        "Cairo": [
          "Heliopolis", "Nasr City", "Maadi", "Zamalek", "Downtown Cairo", 
          "Helwan", "6th of October", "New Cairo"
        ],
        "Alexandria": [
          "Montaza", "Eastern District", "Middle District", "Western District", 
          "El-Gomrok", "El-Agamy", "Amreya", "Borg El Arab"
        ],
        "Giza": [
          "Dokki", "Mohandessin", "Agouza", "Imbaba", "Haram", "Faisal", "6th of October"
        ]
      }
    }
  }
};

// Get list of African countries
export const getAfricanCountries = (): string[] => {
  return Object.keys(africanLocationData.countries);
};

// Get states for a specific country
export const getStatesForCountry = (country: string): string[] => {
  if (!country || !africanLocationData.countries[country]) {
    return [];
  }
  return Object.keys(africanLocationData.countries[country].states);
};

// Get local government areas for a specific state in a country
export const getLocalGovernmentAreas = (country: string, state: string): string[] => {
  if (!country || !state || !africanLocationData.countries[country] || !africanLocationData.countries[country].states[state]) {
    return [];
  }
  return africanLocationData.countries[country].states[state];
};
