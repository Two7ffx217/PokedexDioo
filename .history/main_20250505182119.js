// Elementos DOM
const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMoreButton');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const loadingIndicator = document.getElementById('loadingIndicator');

// Configurações
const MAX_RECORDS = 151;
const LIMIT = 10;
let offset = 0;
let allPokemons = [];

// Função para buscar Pokémon da API
const pokeApi = {
    async getPokemons(offset, limit) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        return data.results.map(pokemon => ({
            name: pokemon.name,
            url: pokemon.url,
        }));
    },

    async getPokemonDetails(url) {
        const response = await fetch(url);
        const data = await response.json();
        return {
            name: data.name,
            number: data.id,
            types: data.types.map(type => type.type.name),
            photo: data.sprites.front_default,
        };
    }
};

// Carrega os itens com tratamento de erro
async function loadPokemonItems(offset, limit) {
    try {
        toggleLoading(true);
        
        // Carregar Pokémon básicos
        const pokemons = await pokeApi.getPokemons(offset, limit);
        
        // Carregar detalhes de cada Pokémon
        const detailedPokemons = await Promise.all(pokemons.map(pokemon => pokeApi.getPokemonDetails(pokemon.url)));

        allPokemons = [...allPokemons, ...detailedPokemons];
        
        renderPokemonCards(detailedPokemons);
        updateLoadMoreButton();
        
    } catch (error) {
        console.error("Erro ao carregar Pokémon:", error);
        showError("Falha ao carregar Pokémon. Tente recarregar a página.");
    } finally {
        toggleLoading(false);
    }
}

// Renderiza os cards de Pokémon
function renderPokemonCards(pokemons) {
    const fragment = document.createDocumentFragment();
    
    pokemons.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        fragment.appendChild(card);
    });
    
    pokemonList.appendChild(fragment);
}

// Cria um card individual de Pokémon
function createPokemonCard(pokemon) {
    const li = document.createElement('li');
    li.className = `pokemon-card ${pokemon.types.join(' ')}`;
    li.innerHTML = `
        <span class="number">#${pokemon.number.toString().padStart(3, '0')}</span>
        <h2 class="name">${pokemon.name}</h2>
        <img src="${pokemon.photo}" alt="${pokemon.name}" loading="lazy" onerror="this.src='assets/pokeball.png'">
        <div class="types">
            ${pokemon.types.map(type => `<span class="type ${type}">${type}</span>`).join('')}
        </div>
    `;
    return li;
}

// Busca Pokémon
function searchPokemons() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const allCards = document.querySelectorAll('.pokemon-card');
    
    allCards.forEach(card => {
        const name = card.querySelector('.name').textContent.toLowerCase();
        const number = card.querySelector('.number').textContent.toLowerCase();
        const matches = name.includes(searchTerm) || number.includes(searchTerm);
        card.style.display = matches ? 'block' : 'none';
    });
}

// Atualiza o botão "Carregar Mais"
function updateLoadMoreButton() {
    if ((offset + LIMIT) >= MAX_RECORDS) {
        loadMoreButton.style.display = 'none';
    }
}

// Controle de loading
function toggleLoading(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
    loadMoreButton.disabled = show;
    loadMoreButton.innerHTML = show ? '<i class="fas fa-spinner fa-spin"></i> Carregando...' : 'Carregar Mais';
}

// Mostra mensagem de erro
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 3000);
}

// Função de busca
function searchPokemons() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const allCards = document.querySelectorAll('.pokemon-card');
    
    allCards.forEach(card => {
        const name = card.querySelector('.name').textContent.toLowerCase();
        const number = card.querySelector('.number').textContent.toLowerCase();
        const matches = name.includes(searchTerm) || number.includes(searchTerm);
        card.style.display = matches ? 'block' : 'none';
    });
}

// Event Listeners
loadMoreButton.addEventListener('click', () => {
    offset += LIMIT;
    loadPokemonItems(offset, LIMIT);
});

searchButton.addEventListener('click', searchPokemons);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') searchPokemons();
});

// Inicialização
loadPokemonItems(offset, LIMIT);