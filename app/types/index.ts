
export interface User {
  userId: string;
  farcasterId?: string;
  walletAddress: string;
  preferences?: {
    location?: string;
    favoriteVibes?: string[];
  };
  savedLocations?: string[];
}

export interface Recommendation {
  recommendationId: string;
  name: string;
  address: string;
  type: 'restaurant' | 'bar' | 'event' | 'cafe';
  vibeTags: string[];
  socialSentimentScore: number;
  sourceDataUrl?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  description?: string;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  openNow?: boolean;
}

export interface Query {
  queryId: string;
  userId: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  filters: {
    vibes?: string[];
    type?: string[];
    priceRange?: string;
  };
  results: Recommendation[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: any[];
}

export interface VibeFilter {
  id: string;
  label: string;
  emoji: string;
  active: boolean;
}
