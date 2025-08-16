// Simple store.js that definitely works
const API_URL = 'http://localhost:3000/api';
const DEMO_MODE = true;

let cart = [];
let products = [];
let currentCategory = 'all';
let currentPage = 1;
const PRODUCTS_PER_PAGE = 50;

// Load everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, loading products...');
    
    // Load products
    if (typeof printifyProducts !== 'undefined') {
        products = printifyProducts;
        console.log('Loaded', products.length, 'products');
    }
    
    // Hide loading overlay
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    // Display products
    displayProducts('all');
    
    // Load cart
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
});

function displayProducts(category) {
    currentCategory = category;
    const grid = document.getElementById('product-grid');
    const title = document.getElementById('category-title');
    const count = document.getElementById('product-count');
    
    if (!grid) {
        console.error('Product grid not found!');
        return;
    }
    
    // Filter products
    let filtered = products;
    if (category !== 'all') {
        filtered = products.filter(p => p.category === category);
    }
    
    // Update UI
    if (title) {
        const titles = {
            'all': 'All Products',
            'shirts': 'T-Shirts',
            'hoodies': 'Hoodies',
            'accessories': 'Accessories',
            'prints': 'Art Prints',
            'stickers': 'Stickers',
            'home': 'Home & Living'
        };
        title.textContent = titles[category] || 'Products';
    }
    
    // Paginate
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    const paginated = filtered.slice(start, end);
    
    if (count) {
        if (filtered.length > PRODUCTS_PER_PAGE) {
            count.innerHTML = 'Showing ' + (start + 1) + '-' + Math.min(end, filtered.length) + ' of ' + filtered.length + ' products';
            
            // Add pagination buttons
            const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
            count.innerHTML += '<div style="margin-top: 10px;">';
            if (currentPage > 1) {
                count.innerHTML += '<button onclick="changePage(' + (currentPage - 1) + ')">← Previous</button> ';
            }
            count.innerHTML += 'Page ' + currentPage + ' of ' + totalPages + ' ';
            if (currentPage < totalPages) {
                count.innerHTML += '<button onclick="changePage(' + (currentPage + 1) + ')">Next →</button>';
            }
            count.innerHTML += '</div>';
        } else {
            count.textContent = 'Showing ' + filtered.length + ' products';
        }
    }
    
    // Clear and fill grid
    grid.innerHTML = '';
    
    paginated.forEach(function(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cursor = 'pointer';
        
        // Build card HTML
        let html = '<div class="product-image-container">';
        html += '<img src="' + product.image + '" alt="' + product.title + '" class="product-image">';
        html += '</div>';
        html += '<div class="product-info">';
        html += '<h3 class="product-title">' + product.title + '</h3>';
        html += '<p class="product-price">$' + product.price.toFixed(2) + '</p>';
        
        // Add variant selector if variants exist
        if (product.variants && product.variants.length > 0) {
            html += '<div class="product-variants">';
            html += '<select id="variant-' + product.id + '" class="variant-select">';
            product.variants.slice(0, 20).forEach(function(v) {
                html += '<option value="' + v.id + '">' + v.name + '</option>';
            });
            html += '</select>';
            html += '</div>';
        }
        
        html += '<button class="add-to-cart" onclick="addToCart(\'' + product.id + '\')">+ cart</button>';
        html += '</div>';
        
        card.innerHTML = html;
        grid.appendChild(card);
    });
    
    console.log('Displayed', paginated.length, 'products');
}

function filterProducts(category) {
    currentPage = 1;
    displayProducts(category);
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function changePage(page) {
    currentPage = page;
    displayProducts(currentCategory);
    window.scrollTo(0, 400);
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const variantSelect = document.getElementById('variant-' + productId);
    const variantId = variantSelect ? variantSelect.value : product.variants[0].id;
    const variant = product.variants.find(v => v.id === variantId);
    
    // Check if already in cart
    const existing = cart.find(item => 
        item.productId === productId && item.variantId === variantId
    );
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            productId: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            variantId: variantId,
            variantName: variant ? variant.name : 'Default',
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    alert('Added to cart!');
}

function updateCartUI() {
    const count = document.getElementById('cart-count');
    if (count) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        count.textContent = total;
    }
    
    const cartItems = document.getElementById('cart-items');
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center;">Your cart is empty</p>';
        } else {
            let html = '';
            cart.forEach(function(item, index) {
                html += '<div class="cart-item">';
                html += '<img src="' + item.image + '" alt="' + item.title + '">';
                html += '<div class="cart-item-info">';
                html += '<div class="cart-item-title">' + item.title + '</div>';
                html += '<div class="cart-item-variant">' + item.variantName + '</div>';
                html += '<div class="cart-item-price">$' + item.price.toFixed(2) + '</div>';
                html += '<div class="cart-item-quantity">';
                html += '<button onclick="updateQuantity(' + index + ', -1)">-</button>';
                html += '<span> ' + item.quantity + ' </span>';
                html += '<button onclick="updateQuantity(' + index + ', 1)">+</button>';
                html += '<button onclick="removeFromCart(' + index + ')">Remove</button>';
                html += '</div></div></div>';
            });
            cartItems.innerHTML = html;
        }
    }
    
    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = '$' + total.toFixed(2);
    }
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    alert('Checkout functionality coming soon!');
}

// Placeholder for modal functions
function openProductModal(id) {
    console.log('Modal function not implemented yet');
}

function closeProductModal() {
    console.log('Modal close not implemented yet');
}

console.log('Store.js loaded successfully');