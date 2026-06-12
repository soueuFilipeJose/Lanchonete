const products = [
  {
    id: 1,
    name: 'X-Bacon',
    description: 'Pão, hambúrguer, queijo, bacon, alface e molho especial.',
    price: 24.90,
    category: 'lanches',
    image: 'assets/img/burger.svg'
  },
  {
    id: 2,
    name: 'Batata Frita',
    description: 'Porção sequinha e crocante, ideal para acompanhar.',
    price: 10.90,
    category: 'combos',
    image: 'assets/img/batata.svg'
  },
  {
    id: 3,
    name: 'Coxinha',
    description: 'Salgado tradicional com massa macia e recheio cremoso.',
    price: 6.50,
    category: 'salgados',
    image: 'assets/img/coxinha.svg'
  },
  {
    id: 4,
    name: 'Refrigerante',
    description: 'Bebida gelada para acompanhar seu pedido.',
    price: 7.00,
    category: 'bebidas',
    image: 'assets/img/bebida.svg'
  },
  {
    id: 5,
    name: 'Bolo de Chocolate',
    description: 'Fatia de bolo fofinho com cobertura cremosa.',
    price: 8.90,
    category: 'doces',
    image: 'assets/img/bolo.svg'
  },
  {
    id: 6,
    name: 'Combo Estudante',
    description: 'Lanche, batata pequena e bebida por preço especial.',
    price: 29.90,
    category: 'combos',
    image: 'assets/img/combo.svg'
  }
];

const state = {
  filter: 'lanches',
  cart: []
};

const formatCurrency = value => value.toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const productList = document.querySelector('#productList');
const cartCount = document.querySelector('#cartCount');
const cartItems = document.querySelector('#cartItems');
const cartTotal = document.querySelector('#cartTotal');
const toast = document.querySelector('#toast');

function renderProducts() {
  const filtered = state.filter === 'todos'
    ? products
    : products.filter(product => product.category === state.filter);

  productList.innerHTML = filtered.map(product => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <strong>${formatCurrency(product.price)}</strong>
      </div>
      <button class="product-add" data-add-product="${product.id}" aria-label="Adicionar ${product.name} ao carrinho">+</button>
    </article>
  `).join('');

  if (!filtered.length) {
    productList.innerHTML = '<article class="product-card"><div><h3>Nenhum produto encontrado</h3><p>Tente selecionar outra categoria.</p></div></article>';
  }
}

function renderCart() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = formatCurrency(totalPrice);

  if (!state.cart.length) {
    cartItems.innerHTML = '<p>Seu carrinho ainda está vazio.</p>';
    return;
  }

  cartItems.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <small>${item.quantity} × ${formatCurrency(item.price)}</small>
      </div>
      <button class="icon-close" data-remove-product="${item.id}" aria-label="Remover ${item.name}">×</button>
    </div>
  `).join('');
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  const current = state.cart.find(item => item.id === productId);

  if (current) {
    current.quantity += 1;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }

  renderCart();
  showToast(`${product.name} adicionado ao carrinho.`);
}

function removeFromCart(productId) {
  const current = state.cart.find(item => item.id === productId);
  if (!current) return;

  current.quantity -= 1;

  if (current.quantity <= 0) {
    state.cart = state.cart.filter(item => item.id !== productId);
  }

  renderCart();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2400);
}

function openModal(id) {
  const modal = document.querySelector(id);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModals() {
  document.querySelectorAll('.modal.open').forEach(modal => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  });
}

function toggleMenu(open) {
  const sideMenu = document.querySelector('#sideMenu');
  sideMenu.classList.toggle('open', open);
  sideMenu.setAttribute('aria-hidden', String(!open));
}

document.addEventListener('click', event => {
  const addButton = event.target.closest('[data-add-product]');
  const removeButton = event.target.closest('[data-remove-product]');
  const filterButton = event.target.closest('[data-filter]');

  if (addButton) {
    addToCart(Number(addButton.dataset.addProduct));
  }

  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.removeProduct));
  }

  if (filterButton) {
    state.filter = filterButton.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(button => button.classList.remove('active'));
    document.querySelectorAll(`[data-filter="${state.filter}"]`).forEach(button => button.classList.add('active'));
    renderProducts();
  }

  if (event.target.matches('[data-close-modal]')) {
    closeModals();
  }
});

document.querySelector('#openMenu').addEventListener('click', () => toggleMenu(true));
document.querySelector('#closeMenu').addEventListener('click', () => toggleMenu(false));
document.querySelector('#openCart').addEventListener('click', () => openModal('#cartModal'));
document.querySelector('#openAdmin').addEventListener('click', () => {
  toggleMenu(false);
  openModal('#adminModal');
});
document.querySelector('#openAccount').addEventListener('click', () => showToast('Área de conta do cliente pronta para integração.'));
document.querySelector('#openCommandDemo').addEventListener('click', () => showToast('Comanda aberta: Cliente Balcão #01.'));

document.querySelector('#finishOrder').addEventListener('click', () => {
  const name = document.querySelector('#clientName').value.trim();

  if (!state.cart.length) {
    showToast('Adicione ao menos um produto antes de finalizar.');
    return;
  }

  if (!name) {
    showToast('Informe seu nome, mesa ou turma.');
    return;
  }

  state.cart = [];
  renderCart();
  closeModals();
  showToast(`Pedido enviado com sucesso para ${name}.`);
});

document.querySelector('#increaseFont').addEventListener('click', () => {
  const root = document.documentElement;
  const current = Number(getComputedStyle(root).getPropertyValue('--font-scale')) || 1;
  const next = current >= 1.18 ? 1 : current + 0.06;
  root.style.setProperty('--font-scale', next.toFixed(2));
  showToast(next === 1 ? 'Tamanho do texto restaurado.' : 'Texto aumentado.');
});

document.querySelector('#toggleContrast').addEventListener('click', () => {
  document.body.classList.toggle('high-contrast');
  showToast(document.body.classList.contains('high-contrast') ? 'Alto contraste ativado.' : 'Alto contraste desativado.');
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModals();
    toggleMenu(false);
  }
});

renderProducts();
renderCart();
