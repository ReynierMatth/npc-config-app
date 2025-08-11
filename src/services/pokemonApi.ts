const POKEMON_API_BASE = 'https://pokeapi.co/api/v2';

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
    };
  };
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
  version_group_details: {
    level_learned_at: number;
    move_learn_method: {
      name: string;
    };
    version_group: {
      name: string;
    };
  }[];
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonType[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
  moves: PokemonMove[];
}

export interface CobblemonPokemon {
  name: string;
  level: number;
  moves: string[];
  displayName?: string;
}

class PokemonApiService {
  private cache = new Map<string, any>();
  private readonly CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

  private async fetchWithCache<T>(url: string): Promise<T> {
    const cacheKey = url;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Pokemon API fetch error:', error);
      throw error;
    }
  }

  async getAllPokemon(limit: number = 1000): Promise<PokemonListResponse> {
    return this.fetchWithCache<PokemonListResponse>(`${POKEMON_API_BASE}/pokemon?limit=${limit}`);
  }

  async searchPokemon(query: string, limit: number = 20): Promise<PokemonListItem[]> {
    const allPokemon = await this.getAllPokemon();
    const filtered = allPokemon.results
      .filter(pokemon => pokemon.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
    
    return filtered;
  }

  async getPokemon(nameOrId: string | number): Promise<Pokemon> {
    return this.fetchWithCache<Pokemon>(`${POKEMON_API_BASE}/pokemon/${nameOrId}`);
  }

  async getRandomPokemon(): Promise<Pokemon> {
    const randomId = Math.floor(Math.random() * 1010) + 1; // Gen 1-9 Pokemon
    return this.getPokemon(randomId);
  }

  async generateRandomTeam(teamSize: number = 6): Promise<CobblemonPokemon[]> {
    const team: CobblemonPokemon[] = [];
    const usedPokemon = new Set<number>();

    for (let i = 0; i < teamSize; i++) {
      let pokemon: Pokemon;
      let attempts = 0;
      
      do {
        pokemon = await this.getRandomPokemon();
        attempts++;
      } while (usedPokemon.has(pokemon.id) && attempts < 50);

      if (attempts >= 50) {
        break; // Prevent infinite loop
      }

      usedPokemon.add(pokemon.id);
      
      const level = this.generateRandomLevel();
      const moves = this.selectRandomMoves(pokemon, 4);
      
      team.push({
        name: pokemon.name,
        level,
        moves,
        displayName: this.formatPokemonName(pokemon.name)
      });
    }

    return team;
  }

  formatToCobblemonString(pokemon: CobblemonPokemon): string {
    const moves = pokemon.moves.length > 0 ? ` moves=${pokemon.moves.join(',')}` : '';
    return `${pokemon.name} level=${pokemon.level}${moves}`;
  }

  private generateRandomLevel(): number {
    // Generate levels between 20 and 80 with higher probability for mid-range
    const min = 20;
    const max = 80;
    const avg = (min + max) / 2;
    const stdDev = (max - min) / 6;
    
    // Simple normal distribution approximation
    let level = Math.round(avg + stdDev * (Math.random() + Math.random() + Math.random() - 1.5));
    return Math.max(min, Math.min(max, level));
  }

  private selectRandomMoves(pokemon: Pokemon, count: number): string[] {
    // Filter moves that can be learned by leveling up
    const levelMoves = pokemon.moves
      .filter(moveData => 
        moveData.version_group_details.some(detail => 
          detail.move_learn_method.name === 'level-up' && 
          detail.level_learned_at > 0
        )
      )
      .map(moveData => moveData.move.name);

    if (levelMoves.length === 0) {
      // If no level moves, use any moves
      const allMoves = pokemon.moves.map(moveData => moveData.move.name);
      return this.shuffleArray(allMoves).slice(0, count);
    }

    return this.shuffleArray(levelMoves).slice(0, count);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private formatPokemonName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  async generateTeamByType(type: string, teamSize: number = 6): Promise<CobblemonPokemon[]> {
    try {
      const typeResponse = await this.fetchWithCache<any>(`${POKEMON_API_BASE}/type/${type.toLowerCase()}`);
      const pokemonOfType = typeResponse.pokemon.map((p: any) => p.pokemon);
      
      if (pokemonOfType.length === 0) {
        throw new Error(`No Pokemon found for type: ${type}`);
      }

      const team: CobblemonPokemon[] = [];
      const selectedPokemon = this.shuffleArray(pokemonOfType).slice(0, teamSize);

      for (const pokemonRef of selectedPokemon) {
        try {
          const pokemonData = pokemonRef as { name: string; pokemon: { name: string; url: string } };
          const pokemon = await this.getPokemon(pokemonData.pokemon.name);
          const level = this.generateRandomLevel();
          const moves = this.selectRandomMoves(pokemon, 4);
          
          team.push({
            name: pokemon.name,
            level,
            moves,
            displayName: this.formatPokemonName(pokemon.name)
          });
        } catch (error) {
          const pokemonData = pokemonRef as { pokemon: { name: string } };
          console.warn(`Failed to fetch pokemon ${pokemonData.pokemon.name}:`, error);
        }
      }

      return team;
    } catch (error) {
      console.error(`Failed to generate team for type ${type}:`, error);
      // Fallback to random team
      return this.generateRandomTeam(teamSize);
    }
  }
}

export const pokemonApi = new PokemonApiService();