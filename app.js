const pokemonInput = document.getElementById("pokemon-input");
const searchButton = document.getElementById("search-button");
const pokemonName = document.getElementById("pokemon-name");
const pokemonWeight = document.getElementById("pokemon-weight");
const pokemonImage = document.getElementById("pokemon-image");
const errorMessage = document.getElementById("error-message");
const pokemonDescription = document.getElementById("pokemon-description");
const pokemonExtra = document.getElementById("pokemon-extra");

const PLACEHOLDER_IMAGE =
  "https://placehold.co/220x220/fee2e2/b91c1c?text=Pok%C3%A9mon";

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function clearExtraCards() {
  pokemonDescription.textContent = "Espacio para endpoint #2";
  pokemonExtra.textContent = "Espacio para endpoint #3";
}

async function searchPokemon() {
  const query = pokemonInput.value.trim().toLowerCase();

  if (!query) {
    errorMessage.textContent = "Escribe el nombre o ID de un Pokémon.";
    return;
  }

  try {
    errorMessage.textContent = "";
    pokemonDescription.textContent = "Cargando descripción...";
    pokemonExtra.textContent = "Cargando información extra...";

    const data = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${query}`);

    const name = data.name ?? "--";
    const weight = data.weight ?? "--";
    const image = data.sprites?.front_default ?? PLACEHOLDER_IMAGE;

    pokemonName.textContent = `Nombre: ${name}`;
    pokemonWeight.textContent = `Peso: ${weight}`;
    pokemonImage.src = image;
    pokemonImage.alt = `Imagen de ${name}`;

    const speciesUrl = data.species?.url;
    if (!speciesUrl) {
      throw new Error("Species URL missing");
    }

    const speciesData = await fetchJson(speciesUrl);
    const evolutionUrl = speciesData.evolution_chain?.url;
    if (!evolutionUrl) {
      throw new Error("Evolution URL missing");
    }

    const evolutionData = await fetchJson(evolutionUrl);

    const spanishFlavor = speciesData.flavor_text_entries.find(
      (entry) => entry.language.name === "es"
    );
    const cleanedFlavor = spanishFlavor
      ? spanishFlavor.flavor_text.replace(/[\n\f\r]/g, " ").trim()
      : "No hay descripción disponible en español.";

    const firstEvolution = evolutionData.chain?.evolves_to?.[0]?.species?.name;
    const evolutionMessage = firstEvolution
      ? `Primera evolución: ${firstEvolution}`
      : "Este Pokémon no tiene evolución disponible.";

    pokemonDescription.textContent = cleanedFlavor;
    pokemonExtra.textContent = evolutionMessage;
  } catch (error) {
    pokemonName.textContent = "Nombre: --";
    pokemonWeight.textContent = "Peso: -- kg";
    pokemonImage.src = PLACEHOLDER_IMAGE;
    pokemonImage.alt = "Imagen del Pokémon";
    clearExtraCards();
    errorMessage.textContent =
      "No se pudo encontrar el Pokémon. Verifica el nombre o ID e intenta de nuevo.";
  }
}

searchButton.addEventListener("click", searchPokemon);

pokemonInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchPokemon();
  }
});
