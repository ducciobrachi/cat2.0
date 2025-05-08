// catalog.js
let updatedProducts = [];
let currentLang = 'it';

const catalog = document.getElementById('catalog');
const searchInput = document.getElementById('search');
const fiberFilter = document.getElementById('fiberFilter');
const categoryFilter = document.getElementById('categoryFilter');
const priceRange = document.getElementById('priceRange');
const priceLabel = document.getElementById('priceLabel');

// Create and insert value badge
const priceValue = document.createElement('span');
priceValue.id = 'priceValue';
priceValue.style.marginLeft = '1rem';
priceValue.style.fontWeight = 'bold';
priceLabel.after(priceValue);

// Mappa codici brevi ai nomi interni dei listini
const listMap = {
  r: 'retail',
  w: 'wholesale',
  wt: 'wholesale-trade'
};
const urlParams = new URLSearchParams(window.location.search);
const selectedListKey = urlParams.get('list') || 'r';
const selectedList = listMap[selectedListKey] || 'retail';

const translations = {
  it: {
    title: 'Catalogo Arca',
    search: 'Cerca prodotti...',
    fiber: ['Tutti i materiali', 'Cashmere', 'Cotone', 'Lana', 'Alpaca'],
    category: ['Tutte le categorie', 'Plaid', 'Cuscino', 'Copripiumino', 'Lenzuolo', 'Calzini', 'Pantofola', 'Short', 'Pantalone', 'Asciugamano', 'Telo', 'Cardigan', 'Federe'],
    price: val => `Prezzo massimo: €${val}`,
    noProducts: 'Nessun prodotto trovato.'
  },
  en: {
    title: 'Arca Catalog',
    search: 'Search products...',
    fiber: ['All materials', 'Cashmere', 'Cotton', 'Wool', 'Alpaca'],
    category: ['All categories', 'Throw', 'Cushion', 'Duvet cover', 'Sheet', 'Socks', 'Slippers', 'Shorts', 'Trousers', 'Towel', 'Beach towel', 'Cardigan', 'Pillowcase'],
    price: val => `Maximum price: €${val}`,
    noProducts: 'No products found.'
  },
  fr: {
    title: 'Catalogue Arca',
    search: 'Rechercher des produits...',
    fiber: ['Tous les matériaux', 'Cachemire', 'Coton', 'Laine', 'Alpaga'],
    category: ['Toutes les catégories', 'Plaid', 'Coussin', 'Housse de couette', 'Drap', 'Chaussettes', 'Pantoufles', 'Short', 'Pantalon', 'Serviette', 'Drap de plage', 'Cardigan', 'Taie d’oreiller'],
    price: val => `Prix maximum : €${val}`,
    noProducts: 'Aucun produit trouvé.'
  }
};

function updateSliderProgress() {
  const percentage = (priceRange.value / priceRange.max) * 100;
  priceRange.style.setProperty('--progress', `${percentage}%`);
  priceValue.textContent = `€${priceRange.value}`;
}

function updateFilterHighlight() {
  document.querySelectorAll('.active-filter').forEach(el => el.classList.remove('active-filter'));
  if (fiberFilter.value) fiberFilter.classList.add('active-filter');
  if (categoryFilter.value) categoryFilter.classList.add('active-filter');
  if (priceRange.value && priceRange.value < priceRange.max) priceRange.classList.add('active-filter');
}

function displayProducts(items) {
  catalog.innerHTML = "";
  if (items.length === 0) {
    catalog.innerHTML = `<p>${translations[currentLang].noProducts}</p>`;
  } else {
    items.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      const price = product.priceList?.[selectedList] ?? 'N/A';
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
    const price = product.priceList?.[selectedList] ?? 0;
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
  updateSliderProgress();
  priceLabel.textContent = translations[currentLang].price(priceRange.max);
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

document.querySelectorAll('.lang-button').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    currentLang = lang;
    const t = translations[lang];
    document.getElementById('catalog-title').innerText = t.title;
    document.getElementById('page-title').innerText = t.title;
    searchInput.placeholder = t.search;
    const fiberOptions = fiberFilter.options;
    const categoryOptions = categoryFilter.options;
    t.fiber.forEach((label, i) => fiberOptions[i].text = label);
    t.category.forEach((label, i) => categoryOptions[i].text = label);
    priceLabel.textContent = t.price(priceRange.value);
    updateSliderProgress();
    document.querySelectorAll('.lang-button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadProducts(lang);
  });
});

searchInput.addEventListener('input', filterProducts);
fiberFilter.addEventListener('change', filterProducts);
categoryFilter.addEventListener('change', filterProducts);
priceRange.addEventListener('input', () => {
  updateSliderProgress();
  priceLabel.textContent = translations[currentLang].price(priceRange.value);
  filterProducts();
});

document.addEventListener("DOMContentLoaded", () => {
  updateSliderProgress();
  loadProducts(currentLang);
  const resetBtn = document.getElementById('reset-filters');
  if (resetBtn) resetBtn.addEventListener('click', resetFilters);
});
