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
        return colors[type] || '#68A090';  // Cor padrão se o tipo não for encontrado
    }

    // Getters públicos
    get number() {
        return this._id.toString().padStart(3, '0'); // Retorna o número do Pokémon com 3 dígitos
    }

    get name() {
        return this._name.charAt(0).toUpperCase() + this._name.slice(1); // Primeira letra maiúscula
    }

    get type() {
        return this._types.primary; // Tipo principal
    }

    get types() {
        return this._types.all; // Todos os tipos
    }

    get typeColors() {
        return this._types.colors; // Cores associadas aos tipos
    }

    get stats() {
        return this._stats; // Estatísticas do Pokémon
    }

    get photo() {
        return this._photo; // Foto do Pokémon
    }

    get height() {
        return `${(this._height / 10).toFixed(1)} m`; // Altura convertida para metros
    }

    get weight() {
        return `${(this._weight / 10).toFixed(1)} kg`; // Peso convertido para kg
    }

    get abilities() {
        return this._abilities.map(ability => ({
            name: ability.ability.name,
            isHidden: ability.is_hidden
        }));
    }

    // Métodos úteis
    getMainColor() {
        return this._types.colors[0]; // A primeira cor da lista de cores associadas aos tipos
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

export { Pokemon, convertPokeApiDetailToPokemon };
