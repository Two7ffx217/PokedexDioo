// Definindo a classe para o Pokémon
class Pokemon {
    constructor(data) {
        this._id = data.id;
        this._name = data.name;
        this._types = this._processTypes(data.types);
        this._stats = this._processStats(data.stats);
        this._height = data.height;
        this._weight = data.weight;
        this._abilities = data.abilities;
        this._photo = data.sprites.other['official-artwork'].front_default || 
                      data.sprites.front_default;
    }

    // Processa os tipos incluindo cores
    _processTypes(types) {
        return {
            primary: types[0].type.name,
            all: types.map(type => type.type.name),
            colors: types.map(type => this._getTypeColor(type.type.name))
        };
    }

    // Processa as estatísticas
    _processStats(stats) {
        const statMap = {
            'hp': 'HP',
            'attack': 'Attack',
            'defense': 'Defense',
            'special-attack': 'Sp. Atk',
            'special-defense': 'Sp. Def',
            'speed': 'Speed'
        };

        return stats.map(stat => ({
            name: statMap[stat.stat.name] || stat.stat.name,
            base: stat.base_stat,
            effort: stat.effort
        }));
    }

    // Cores baseadas nos tipos
    _getTypeColor(type) {
        const colors = {
            normal: '#A8A878',
            fire: '#F08030',
            water: '#6890F0',
            electric: '#F8D030',
            grass: '#78C850',
            ice: '#98D8D8',
            fighting: '#C03028',
            poison: '#A040A0',
            ground: '#E0C068',
            flying: '#A890F0',
            psychic: '#F85888',
            bug: '#A8B820',
            rock: '#B8A038',
            ghost: '#705898',
            dragon: '#7038F8',
            dark: '#705848',
            steel: '#B8B8D0',
            fairy: '#EE99AC'
        };
        return colors[type] || '#68A090';
    }

    // Getters públicos
    get number() {
        return this._id.toString().padStart(3, '0');
    }

    get name() {
        return this._name.charAt(0).toUpperCase() + this._name.slice(1);
    }

    get type() {
        return this._types.primary;
    }

    get types() {
        return this._types.all;
    }

    get typeColors() {
        return this._types.colors;
    }

    get stats() {
        return this._stats;
    }

    get photo() {
        return this._photo;
    }

    get height() {
        return `${(this._height / 10).toFixed(1)} m`; // Converte para metros
    }

    get weight() {
        return `${(this._weight / 10).toFixed(1)} kg`; // Converte para kg
    }

    get abilities() {
        return this._abilities.map(ability => ({
            name: ability.ability.name,
            isHidden: ability.is_hidden
        }));
    }

    // Métodos úteis
    getMainColor() {
        return this._types.colors[0];
    }

    getStat(statName) {
        return this._stats.find(stat => 
            stat.name.toLowerCase() === statName.toLowerCase())?.base || 0;
    }
}

// Função de conversão para manter compatibilidade
function convertPokeApiDetailToPokemon(pokeDetail) {
    return new Pokemon(pokeDetail);
}

// API - Interação com a PokéAPI
const pokeApi = {
    baseUrl: 'https://pokeapi.co/api/v2',
    cache: new Map(),
    cacheDuration: 0, // desativado

    // Função que verifica o cache ou faz a requisição
    async getResource(url) {
        if (this.cache.has(url)) {
            const cached = this.cache.get(url);
            if (Date.now() - cached.timestamp < this.cacheDuration) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            // Atualiza cache
            this.cache.set(url, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error(`Failed to fetch: ${url}`, error);
            throw error;
        }
    },

    // Função que obtém detalhes de um Pokémon
    async getPokemonDetail(pokemon) {
        const url = typeof pokemon === 'string' ? 
            `${this.baseUrl}/pokemon/${pokemon}` : 
            pokemon.url;
            
        const data = await this.getResource(url);
        return convertPokeApiDetailToPokemon(data);
    },

    // Função que obtém uma lista de Pokémons
    async getPokemons(offset = 0, limit = 10) {
        const url = `${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`;
        const listData = await this.getResource(url);
        
        const pokemonDetails = await Promise.all(
            listData.results.map(pokemon => this.getPokemonDetail(pokemon))
        );
        
        return pokemonDetails;
    },

    // Função que retorna Pokémon por nome ou ID
    async getPokemonByNameOrId(identifier) {
        return this.getPokemonDetail(identifier.toLowerCase());
    }
};

// Exporte o modelo do Pokémon e a API
export { pokeApi, Pokemon, convertPokeApiDetailToPokemon };
