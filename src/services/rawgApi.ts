const API_KEY = '2bb4f048adda4899962bc31c6c71a3d9';
const BASE_URL = 'https://api.rawg.io/api';

export interface Game {
  id: number;
  name: string;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings_count: number;
  metacritic: number | null;
  released: string;
  platforms: Array<{
    platform: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  genres: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  short_screenshots: Array<{
    id: number;
    image: string;
  }>;
  clip?: {
    clip: string;
    clips: {
      [key: string]: string;
    };
  };
}

export interface GameDetails extends Game {
  description_raw: string;
  description: string;
  website: string;
  reddit_url: string;
  metacritic_url: string;
  developers: Array<{
    id: number;
    name: string;
  }>;
  publishers: Array<{
    id: number;
    name: string;
  }>;
  esrb_rating: {
    id: number;
    name: string;
  } | null;
}

export interface Platform {
  id: number;
  name: string;
  slug: string;
  games_count: number;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  games_count: number;
}

class RawgAPI {
  private async fetchData<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('key', API_KEY);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value.toString());
      }
    });

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  }

  async getGames(params: {
    page?: number;
    page_size?: number;
    search?: string;
    genres?: string;
    platforms?: string;
    ordering?: string;
    dates?: string;
    metacritic?: string;
  } = {}): Promise<{ results: Game[]; count: number; next: string | null; previous: string | null }> {
    return this.fetchData('/games', {
      page_size: 20,
      ...params,
    });
  }

  async getGame(id: number): Promise<GameDetails> {
    return this.fetchData(`/games/${id}`);
  }

  async getGameScreenshots(id: number): Promise<{ results: Array<{ id: number; image: string; width: number; height: number }> }> {
    return this.fetchData(`/games/${id}/screenshots`);
  }

  async getGameTrailers(id: number): Promise<{ results: Array<{ id: number; name: string; preview: string; data: { [key: string]: string } }> }> {
    return this.fetchData(`/games/${id}/movies`);
  }

  async getPlatforms(): Promise<{ results: Platform[] }> {
    return this.fetchData('/platforms', { page_size: 50 });
  }

  async getGenres(): Promise<{ results: Genre[] }> {
    return this.fetchData('/genres');
  }

  async getTrendingGames(): Promise<{ results: Game[] }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const today = new Date();
    
    return this.fetchData('/games', {
      dates: `${thirtyDaysAgo.toISOString().split('T')[0]},${today.toISOString().split('T')[0]}`,
      ordering: '-added',
      page_size: 20,
    });
  }

  async getUpcomingGames(): Promise<{ results: Game[] }> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    return this.fetchData('/games', {
      dates: `${today.toISOString().split('T')[0]},${futureDate.toISOString().split('T')[0]}`,
      ordering: 'released',
      page_size: 20,
    });
  }
}

export const rawgAPI = new RawgAPI();