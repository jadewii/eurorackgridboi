// Configuration
const API_URL = 'http://localhost:3000/api';
const STRIPE_PUBLIC_KEY = 'pk_test_51234567890abcdefghijklmnop';
const DEMO_MODE = false;

// Initialize Stripe
let stripe = null;
if (!DEMO_MODE && STRIPE_PUBLIC_KEY.includes('pk_test_') && STRIPE_PUBLIC_KEY.length > 30) {
    stripe = Stripe(STRIPE_PUBLIC_KEY);
}

// Cart state
let cart = [];
let products = [];

// Current filter state
let currentCategory = 'all';
let currentPage = 1;
const PRODUCTS_PER_PAGE = 50;

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCartFromStorage();
    updateCartUI();
});

// Load products into the grid
function loadProducts() {
    const productGrid = document.getElementById('product-grid');
    
    // Load products directly from printify-products.js if available
    if (typeof printifyProducts !== 'undefined') {
        products = printifyProducts;
        console.log('Loaded Printify products:', products.length);
    } else {
        console.log('No Printify products found, using empty array');
        products = [];
    }
    
    // Display all products initially
    displayProducts('all');
}

// Display products based on category
function displayProducts(category = 'all', page = 1) {
    const productGrid = document.getElementById('product-grid');
    const categoryTitle = document.getElementById('category-title');
    const productCount = document.getElementById('product-count');
    
    // Clear grid
    productGrid.innerHTML = '';
    
    // Filter products
    let filteredProducts = products;
    if (category !== 'all') {
        filteredProducts = products.filter(p => p.category === category);
    }
    
    // Paginate
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Update title
    const categoryNames = {
        'all': 'All Products',
        'shirts': 'T-Shirts',
        'hoodies': 'Hoodies',
        'accessories': 'Accessories',
        'prints': 'Art Prints',
        'stickers': 'Stickers',
        'home': 'Home & Living'
    };
    categoryTitle.textContent = categoryNames[category] || 'Products';
    
    // Update count with pagination info
    if (filteredProducts.length > PRODUCTS_PER_PAGE) {
        productCount.innerHTML = `
            Showing ${startIndex + 1}-${Math.min(endIndex, filteredProducts.length)} of ${filteredProducts.length} products
            <div class="pagination" style="margin-top: 10px;">
                ${page > 1 ? `<button onclick="changePage(${page - 1})">← Previous</button>` : ''}
                Page ${page} of ${totalPages}
                ${page < totalPages ? `<button onclick="changePage(${page + 1})">Next →</button>` : ''}
            </div>
        `;
    } else {
        productCount.textContent = `Showing ${filteredProducts.length} products`;
    }
    
    // Display products
    if (paginatedProducts.length === 0) {
        productGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No products found in this category.</p>';
    } else {
        paginatedProducts.forEach(product => {
            const productCard = createProductCard(product);
            productGrid.appendChild(productCard);
        });
    }
    
    currentPage = page;
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Try to find a black variant image for hover
    let hoverImage = product.image;
    if (product.image && product.image.includes('camera_label=front')) {
        hoverImage = product.image.replace('camera_label=front', 'camera_label=back');
    } else if (product.image) {
        hoverImage = product.image + (product.image.includes('?') ? '&' : '?') + 'camera_label=back';
    }
    
    card.innerHTML = `
        <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit;">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.title}" class="product-image">
                <img src="${hoverImage}" alt="${product.title} back" class="product-image-hover">
            </div>
        </a>
        <div class="product-info">
            <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                <h3 class="product-title">${product.title}</h3>
            </a>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <div class="product-variants">
                <select id="variant-${product.id}" class="variant-select" onclick="event.stopPropagation();">
                    ${product.variants.slice(0, 20).map(v => `
                        <option value="${v.id}">${v.name}</option>
                    `).join('')}
                </select>
            </div>
            <button class="add-to-cart" onclick="event.preventDefault(); addToCart('${product.id}')">
                + cart
            </button>
        </div>
    `;
    
    return card;
}

// Change page
function changePage(page) {
    displayProducts(currentCategory, page);
    window.scrollTo(0, 400);
}

// Filter products by category
function filterProducts(category) {
    currentCategory = category;
    currentPage = 1;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Display filtered products
    displayProducts(category);
}

// Add item to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const variantSelect = document.getElementById(`variant-${productId}`);
    const selectedVariantId = variantSelect.value;
    const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => 
        item.productId === productId && item.variantId === selectedVariantId
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: product.id,
            printifyId: product.printifyId,
            title: product.title,
            price: product.price,
            image: product.image,
            variantId: selectedVariantId,
            variantName: selectedVariant.name,
            variantDetails: selectedVariant,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartUI();
    showNotification('Product added to cart!');
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-variant">${item.variantName}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Update item quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    saveCartToStorage();
    updateCartUI();
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCartToStorage();
    updateCartUI();
}

// Toggle cart sidebar
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('open');
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #000;
        color: #fff;
        padding: 15px 20px;
        border-radius: 0;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    toggleCart();
    document.getElementById('checkout-modal').classList.add('show');
}

// Close checkout modal
function closeCheckout() {
    document.getElementById('checkout-modal').classList.remove('show');
}

// Handle checkout form submission
document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            alert('Checkout functionality will be connected to Printify soon!');
        });
    }
});