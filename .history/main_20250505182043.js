// Elementos DOM
const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMoreButton');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// Configurações
const MAX_RECORDS = 151;
const LIMIT = 10;
let offset = 0;
let allPokemons = [];

// Carrega os itens com tratamento de erro
async function loadPokemonItems(offset, limit) {
    try {
        toggleLoading(true);
        
        const pokemons = await pokeApi.getPokemons(offset, limit);
        allPokemons = [...allPokemons, ...pokemons];
        
        renderPokemonCards(pokemons);
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

// Cria um card individual
function createPokemonCard(pokemon) {
    const li = document.createElement('li');
    li.className = `pokemon-card ${pokemon.type}`;
    li.innerHTML = `
        <span class="number">#${pokemon.number.toString().padStart(3, '0')}</span>
        <h2 class="name">${pokemon.name}</h2>
        <img src="${pokemon.photo}" 
             alt="${pokemon.name}" 
             loading="lazy"
             onerror="this.src='assets/pokeball.png'">
        <div class="types">
            ${pokemon.types.map(type => `
                <span class="type ${type}">${type}</span>
            `).join('')}
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
    if (show) {
        loadMoreButton.disabled = true;
        loadMoreButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
    } else {
        loadMoreButton.disabled = false;
        loadMoreButton.innerHTML = 'Carregar Mais';
    }
}

// Mostra mensagem de erro
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 3000);
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