// catalog.js
let updatedProducts = [];
let currentLang = 'it';

const catalog = document.getElementById('catalog');
const searchInput = document.getElementById('search');
const fiberFilter = document.getElementById('fiberFilter');
const categoryFilter = document.getElementById('categoryFilter');
const priceRange = document.getElementById('priceRange');
const priceLabel = document.getElementById('priceLabel');

function updateFilterHighlight() {
  document.querySelectorAll('.active-filter').forEach(el => el.classList.remove('active-filter'));
  if (fiberFilter.value) fiberFilter.classList.add('active-filter');
  if (categoryFilter.value) categoryFilter.classList.add('active-filter');
  if (priceRange.value && priceRange.value < priceRange.max) priceRange.classList.add('active-filter');
}

function displayProducts(items) {
  catalog.innerHTML = "";
  if (items.length === 0) {
    catalog.innerHTML = "<p>Nessun prodotto trovato.</p>";
  } else {
    items.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      const price = product.priceList?.retail ?? 'N/A';
      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <h2>${product.name}</h2>
        <p>${product.label}</p>
        <p><strong>Prezzo:</strong> €${price}</p>
      `;
      catalog.appendChild(card);
    });
  }
  const total = document.getElementById('total-products');
  if (total) {
    total.textContent = `Totale prodotti ${items.length}`;
  } else {
    const p = document.createElement('p');
    p.id = 'total-products';
    p.textContent = `Totale prodotti ${items.length}`;
    catalog.parentElement.insertBefore(p, catalog);
  }
}

function filterProducts() {
  const searchText = searchInput.value.toLowerCase().trim();
  const selectedFiber = fiberFilter.value?.trim().toLowerCase();
  const selectedCategory = categoryFilter.value?.trim().toLowerCase();
  const maxPrice = parseInt(priceRange.value);

  const filtered = updatedProducts.filter(product => {
    const price = product.priceList?.retail ?? 0;
    const matchesSearch =
      product.name.toLowerCase().includes(searchText) ||
      product.label.toLowerCase().includes(searchText);
    const matchesFiber = selectedFiber === "" || (product.fiber && product.fiber.toLowerCase() === selectedFiber);
    const matchesCategory = selectedCategory === "" || (product.category && product.category.toLowerCase() === selectedCategory);
    const matchesPrice = !isNaN(maxPrice) ? price <= maxPrice : true;
    return matchesSearch && matchesFiber && matchesCategory && matchesPrice;
  });

  updateFilterHighlight();
  displayProducts(filtered);
}

function resetFilters() {
  searchInput.value = "";
  fiberFilter.value = "";
  categoryFilter.value = "";
  priceRange.value = priceRange.max;
  priceLabel.textContent = `Prezzo massimo: €${priceRange.max}`;
  filterProducts();
}

function loadProducts(lang = 'it') {
  fetch(`products.${lang}.json`)
    .then(res => {
      if (!res.ok) throw new Error("File non trovato");
      return res.json();
    })
    .then(data => {
      updatedProducts = data.map(p => ({
        ...p,
        fiber: p.fiber?.trim().toLowerCase() || "various",
        category: p.category?.trim().toLowerCase() || "various"
      }));
      filterProducts();
    })
    .catch(err => {
      console.error('Errore caricamento prodotti:', err);
      catalog.innerHTML = `<p style="color:red;">Errore nel caricamento di products.${lang}.json</p>`;
    });
}

searchInput.addEventListener('input', filterProducts);
fiberFilter.addEventListener('change', filterProducts);
categoryFilter.addEventListener('change', filterProducts);
priceRange.addEventListener('input', () => {
  priceLabel.textContent = `Prezzo massimo: €${priceRange.value}`;
  filterProducts();
});

document.addEventListener("DOMContentLoaded", () => {
  loadProducts(currentLang);
  const resetBtn = document.getElementById('reset-filters');
  if (resetBtn) resetBtn.addEventListener('click', resetFilters);
});
