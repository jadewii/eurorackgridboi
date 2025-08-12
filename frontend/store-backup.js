// Configuration - You'll need to add your actual API endpoint
const API_URL = 'http://localhost:3000/api'; // Your backend URL
const STRIPE_PUBLIC_KEY = 'pk_test_51234567890abcdefghijklmnop'; // Add your Stripe public key
const DEMO_MODE = false; // Now using real Printify products!

// Initialize Stripe (only if not in demo mode)
let stripe = null;
if (!DEMO_MODE && STRIPE_PUBLIC_KEY.includes('pk_test_') && STRIPE_PUBLIC_KEY.length > 30) {
    stripe = Stripe(STRIPE_PUBLIC_KEY);
}

// Cart state
let cart = [];
let products = [];

// Sample products for fallback (these would come from your Printify catalog)
const sampleProducts = [
    // T-SHIRTS
    {
        id: 'prod_1',
        title: 'Eurorack Modular T-Shirt',
        category: 'shirts',
        price: 24.99,
        image: 'https://via.placeholder.com/300x400/667eea/ffffff?text=Eurorack+Tee',
        printifyId: 'printify_product_id_1',
        variants: [
            { id: 'var_1', name: 'Small - Black', size: 'S', color: 'Black' },
            { id: 'var_2', name: 'Medium - Black', size: 'M', color: 'Black' },
            { id: 'var_3', name: 'Large - Black', size: 'L', color: 'Black' },
            { id: 'var_4', name: 'Small - White', size: 'S', color: 'White' },
            { id: 'var_5', name: 'Medium - White', size: 'M', color: 'White' },
            { id: 'var_6', name: 'Large - White', size: 'L', color: 'White' }
        ]
    },
    {
        id: 'prod_5',
        title: 'Synth Waveform T-Shirt',
        category: 'shirts',
        price: 26.99,
        image: 'https://via.placeholder.com/300x400/059669/ffffff?text=Waveform+Tee',
        printifyId: 'printify_product_id_5',
        variants: [
            { id: 'var_20', name: 'Small - Navy', size: 'S', color: 'Navy' },
            { id: 'var_21', name: 'Medium - Navy', size: 'M', color: 'Navy' },
            { id: 'var_22', name: 'Large - Navy', size: 'L', color: 'Navy' }
        ]
    },
    
    // HOODIES
    {
        id: 'prod_2',
        title: 'Modular Synth Hoodie',
        category: 'hoodies',
        price: 44.99,
        image: 'https://via.placeholder.com/300x400/764ba2/ffffff?text=Synth+Hoodie',
        printifyId: 'printify_product_id_2',
        variants: [
            { id: 'var_7', name: 'Small - Gray', size: 'S', color: 'Gray' },
            { id: 'var_8', name: 'Medium - Gray', size: 'M', color: 'Gray' },
            { id: 'var_9', name: 'Large - Gray', size: 'L', color: 'Gray' },
            { id: 'var_10', name: 'XL - Gray', size: 'XL', color: 'Gray' }
        ]
    },
    {
        id: 'prod_6',
        title: 'Patch Cable Chaos Hoodie',
        category: 'hoodies',
        price: 47.99,
        image: 'https://via.placeholder.com/300x400/DC2626/ffffff?text=Patch+Hoodie',
        printifyId: 'printify_product_id_6',
        variants: [
            { id: 'var_23', name: 'Small - Black', size: 'S', color: 'Black' },
            { id: 'var_24', name: 'Medium - Black', size: 'M', color: 'Black' },
            { id: 'var_25', name: 'Large - Black', size: 'L', color: 'Black' }
        ]
    },
    
    // ACCESSORIES
    {
        id: 'prod_3',
        title: 'Synth Coffee Mug',
        category: 'accessories',
        price: 14.99,
        image: 'https://via.placeholder.com/300x400/3498db/ffffff?text=Synth+Mug',
        printifyId: 'printify_product_id_3',
        variants: [
            { id: 'var_11', name: '11oz - White', size: '11oz', color: 'White' },
            { id: 'var_12', name: '15oz - White', size: '15oz', color: 'White' }
        ]
    },
    {
        id: 'prod_7',
        title: 'Modular Tote Bag',
        category: 'accessories',
        price: 22.99,
        image: 'https://via.placeholder.com/300x400/F59E0B/ffffff?text=Tote+Bag',
        printifyId: 'printify_product_id_7',
        variants: [
            { id: 'var_26', name: 'Standard - Natural', size: 'Standard', color: 'Natural' },
            { id: 'var_27', name: 'Standard - Black', size: 'Standard', color: 'Black' }
        ]
    },
    {
        id: 'prod_8',
        title: 'Synth Phone Case',
        category: 'accessories',
        price: 19.99,
        image: 'https://via.placeholder.com/300x400/8B5CF6/ffffff?text=Phone+Case',
        printifyId: 'printify_product_id_8',
        variants: [
            { id: 'var_28', name: 'iPhone 14', size: 'iPhone 14', color: 'Black' },
            { id: 'var_29', name: 'iPhone 15', size: 'iPhone 15', color: 'Black' },
            { id: 'var_30', name: 'Samsung S23', size: 'Samsung S23', color: 'Black' }
        ]
    },
    
    // ART PRINTS
    {
        id: 'prod_4',
        title: 'Modular Setup Canvas',
        category: 'prints',
        price: 39.99,
        image: 'https://via.placeholder.com/300x400/e74c3c/ffffff?text=Canvas+Print',
        printifyId: 'printify_product_id_4',
        variants: [
            { id: 'var_13', name: '12x12 inch', size: '12x12', color: 'N/A' },
            { id: 'var_14', name: '16x16 inch', size: '16x16', color: 'N/A' },
            { id: 'var_15', name: '20x20 inch', size: '20x20', color: 'N/A' }
        ]
    },
    {
        id: 'prod_9',
        title: 'Vintage Synth Poster',
        category: 'prints',
        price: 24.99,
        image: 'https://via.placeholder.com/300x400/10B981/ffffff?text=Poster',
        printifyId: 'printify_product_id_9',
        variants: [
            { id: 'var_31', name: '18x24 inch', size: '18x24', color: 'N/A' },
            { id: 'var_32', name: '24x36 inch', size: '24x36', color: 'N/A' }
        ]
    },
    
    // STICKERS
    {
        id: 'prod_10',
        title: 'Synth Brand Sticker Pack',
        category: 'stickers',
        price: 8.99,
        image: 'https://via.placeholder.com/300x400/EC4899/ffffff?text=Stickers',
        printifyId: 'printify_product_id_10',
        variants: [
            { id: 'var_33', name: '5 Pack - Mixed', size: '3 inch', color: 'Mixed' },
            { id: 'var_34', name: '10 Pack - Mixed', size: '3 inch', color: 'Mixed' }
        ]
    },
    {
        id: 'prod_11',
        title: 'Modular Patch Points Stickers',
        category: 'stickers',
        price: 6.99,
        image: 'https://via.placeholder.com/300x400/14B8A6/ffffff?text=Patch+Stickers',
        printifyId: 'printify_product_id_11',
        variants: [
            { id: 'var_35', name: 'Sheet of 20', size: '1 inch', color: 'Black/White' }
        ]
    }
];

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for all stylesheets to load
    Promise.all(
        Array.from(document.styleSheets).map(sheet => {
            return new Promise(resolve => {
                if (sheet.href) {
                    // External stylesheet
                    const img = new Image();
                    img.onerror = resolve;
                    img.onload = resolve;
                    img.src = sheet.href;
                } else {
                    // Inline stylesheet
                    resolve();
                }
            });
        })
    ).then(() => {
        // All stylesheets loaded, now load products
        loadProducts();
        loadCartFromStorage();
        updateCartUI();
        
        // Show demo mode banner if in demo mode
        if (DEMO_MODE) {
            showDemoModeBanner();
        }
    });
});

// Show demo mode banner
function showDemoModeBanner() {
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 99;
        font-size: 14px;
        text-align: center;
    `;
    banner.innerHTML = `
        <strong>🎨 Demo Mode Active</strong><br>
        <small>Test the store without real API keys. Orders won't be processed.</small>
    `;
    document.body.appendChild(banner);
}

// Current filter state
let currentCategory = 'all';

// Load products into the grid
async function loadProducts() {
    const productGrid = document.getElementById('product-grid');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Keep grid hidden initially
    productGrid.classList.remove('loaded');
    
    // Load products directly from printify-products.js if available
    if (typeof printifyProducts !== 'undefined') {
        products = printifyProducts;
        console.log('Loaded Printify products:', products.length);
    } else {
        try {
            // Try to fetch products from backend
            const response = await fetch(`${API_URL}/products`);
            const data = await response.json();
            
            if (data.success && data.products) {
                // Make sure fetched products have categories
                products = data.products.map(p => ({
                    ...p,
                    category: p.category || 'accessories' // Default category if missing
                }));
                console.log('Loaded products from backend:', products.length);
            } else {
                // Fallback to sample products
                products = sampleProducts;
                console.log('Using sample products');
            }
        } catch (error) {
            console.log('Could not fetch from backend, using sample products:', error.message);
            products = sampleProducts;
        }
    }
    
    // Display all products initially
    displayProducts('all');
    
    // Wait for images to start loading, then show content
    setTimeout(() => {
        productGrid.classList.add('loaded');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }, 200);
}

// Current page for pagination
let currentPage = 1;
const PRODUCTS_PER_PAGE = 50;

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
                ${page > 1 ? `<button onclick="changePage(${page - 1})" style="margin-right: 10px;">← Previous</button>` : ''}
                Page ${page} of ${totalPages}
                ${page < totalPages ? `<button onclick="changePage(${page + 1})" style="margin-left: 10px;">Next →</button>` : ''}
            </div>
        `;
    } else {
        productCount.textContent = `Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`;
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

// Change page
function changePage(page) {
    displayProducts(currentCategory, page);
    window.scrollTo(0, 400); // Scroll to products section
}

// Filter products by category
function filterProducts(category) {
    currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Display filtered products
    displayProducts(category);
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.cursor = 'pointer';
    
    // Try to find a black variant image for hover
    let hoverImage = product.image;
    
    // Change the camera_label parameter to show back view on hover
    if (product.image && product.image.includes('camera_label=front')) {
        hoverImage = product.image.replace('camera_label=front', 'camera_label=back');
    } else if (product.image) {
        // If no camera_label, try adding it
        hoverImage = product.image + (product.image.includes('?') ? '&' : '?') + 'camera_label=back';
    }
    
    // Create elements programmatically to ensure proper loading
    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image-container';
    imageContainer.onclick = () => openProductModal(product.id);
    
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.title;
    img.className = 'product-image';
    img.loading = 'lazy';
    
    const imgHover = document.createElement('img');
    imgHover.src = hoverImage;
    imgHover.alt = product.title + ' back';
    imgHover.className = 'product-image-hover';
    imgHover.loading = 'lazy';
    
    imageContainer.appendChild(img);
    imageContainer.appendChild(imgHover);
    card.appendChild(imageContainer);
    
    // Add the rest of the card content
    const infoDiv = document.createElement('div');
    infoDiv.className = 'product-info';
    infoDiv.innerHTML = `
        <h3 class="product-title" onclick="openProductModal('${product.id}')" style="cursor: pointer;">${product.title}</h3>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <div class="product-variants">
            <select id="variant-${product.id}" class="variant-select" onclick="event.stopPropagation();">
                ${product.variants.slice(0, 20).map(v => `
                    <option value="${v.id}">${v.name}</option>
                `).join('')}
            </select>
        </div>
        <button class="add-to-cart" onclick="event.preventDefault(); event.stopPropagation(); addToCart('${product.id}')">
            + cart
        </button>
    `;
    
    card.appendChild(infoDiv);
    return card;
}

// Add item to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId) || sampleProducts.find(p => p.id === productId);
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
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
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
    setupStripeElements();
}

// Close checkout modal
function closeCheckout() {
    document.getElementById('checkout-modal').classList.remove('show');
}

// Setup Stripe Elements
let cardElement;
function setupStripeElements() {
    if (DEMO_MODE) {
        // In demo mode, show a fake card input
        const cardElementDiv = document.getElementById('card-element');
        cardElementDiv.innerHTML = `
            <div style="padding: 12px; background: #f0f0f0; border-radius: 4px;">
                <p style="margin: 0; color: #666;">Demo Mode: No real payment required</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #999;">Use any test card number (e.g., 4242 4242 4242 4242)</p>
            </div>
        `;
        return;
    }
    
    if (!stripe) {
        console.error('Stripe not initialized');
        return;
    }
    
    const elements = stripe.elements();
    
    cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                '::placeholder': {
                    color: '#aab7c4'
                }
            }
        }
    });
    
    cardElement.mount('#card-element');
    
    cardElement.on('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
}

// Product Modal Functions
let currentModalProduct = null;

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentModalProduct = product;
    
    // Update modal content
    document.getElementById('modal-product-title').textContent = product.title;
    document.getElementById('modal-product-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('modal-product-image').src = product.image;
    document.getElementById('modal-product-image').alt = product.title;
    
    // Extract unique sizes and colors from variants
    const sizes = new Set();
    const colors = new Set();
    
    product.variants.forEach(variant => {
        // Parse variant name for size and color
        const variantName = variant.name || '';
        
        // Common patterns: "Small - Black", "S / Black", "Black / Small"
        if (variantName.includes(' - ')) {
            const parts = variantName.split(' - ');
            if (parts[0]) sizes.add(parts[0]);
            if (parts[1]) colors.add(parts[1]);
        } else if (variantName.includes(' / ')) {
            const parts = variantName.split(' / ');
            parts.forEach(part => {
                if (isSizeValue(part)) sizes.add(part);
                else if (isColorValue(part)) colors.add(part);
            });
        } else {
            // Single value - try to determine if it's size or color
            if (isSizeValue(variantName)) sizes.add(variantName);
            else colors.add(variantName);
        }
    });
    
    // Populate size select
    const sizeSelect = document.getElementById('modal-size-select');
    sizeSelect.innerHTML = '';
    if (sizes.size > 0) {
        Array.from(sizes).forEach(size => {
            sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
        });
        sizeSelect.parentElement.style.display = 'block';
    } else {
        sizeSelect.parentElement.style.display = 'none';
    }
    
    // Populate color select
    const colorSelect = document.getElementById('modal-color-select');
    colorSelect.innerHTML = '';
    if (colors.size > 0) {
        Array.from(colors).forEach(color => {
            colorSelect.innerHTML += `<option value="${color}">${color}</option>`;
        });
        colorSelect.parentElement.style.display = 'block';
    } else {
        colorSelect.parentElement.style.display = 'none';
    }
    
    // Load related products
    loadRelatedProducts(product);
    
    // Show modal
    document.getElementById('product-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function isSizeValue(str) {
    const sizePatterns = /^(XS|S|M|L|XL|XXL|XXXL|2XL|3XL|Small|Medium|Large|X-Large|\d+oz|\d+x\d+|Standard)$/i;
    return sizePatterns.test(str.trim());
}

function isColorValue(str) {
    const colorPatterns = /^(Black|White|Gray|Grey|Navy|Red|Blue|Green|Yellow|Pink|Purple|Orange|Brown|Natural|Mixed)$/i;
    return colorPatterns.test(str.trim());
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('show');
    document.body.style.overflow = 'auto';
    currentModalProduct = null;
}

function updateProductImage() {
    if (!currentModalProduct) return;
    
    const colorSelect = document.getElementById('modal-color-select');
    const selectedColor = colorSelect.value.toLowerCase();
    
    // Try to find a variant image for the selected color
    let newImage = currentModalProduct.image;
    
    // If it's a shirt and black is selected, try to modify the image URL
    if (selectedColor === 'black' && currentModalProduct.image) {
        // Some Printify URLs have color parameters
        if (currentModalProduct.image.includes('variant')) {
            // Try to find a black variant
            const blackVariant = currentModalProduct.variants.find(v => 
                v.name && v.name.toLowerCase().includes('black')
            );
            if (blackVariant && blackVariant.image) {
                newImage = blackVariant.image;
            }
        }
    }
    
    document.getElementById('modal-product-image').src = newImage;
}

function updateVariantSelection() {
    // This function can be expanded to update pricing based on variant selection
    // For now, it's a placeholder
}

function addToCartFromModal() {
    if (!currentModalProduct) return;
    
    const sizeSelect = document.getElementById('modal-size-select');
    const colorSelect = document.getElementById('modal-color-select');
    
    // Find the matching variant
    let selectedVariant = currentModalProduct.variants[0]; // Default to first
    
    if (sizeSelect.value || colorSelect.value) {
        const size = sizeSelect.value;
        const color = colorSelect.value;
        
        // Try to find exact match
        selectedVariant = currentModalProduct.variants.find(v => {
            const vName = v.name || '';
            return (size && vName.includes(size)) && (color && vName.includes(color));
        }) || currentModalProduct.variants.find(v => {
            const vName = v.name || '';
            return (size && vName.includes(size)) || (color && vName.includes(color));
        }) || selectedVariant;
    }
    
    // Add to cart
    const existingItem = cart.find(item => 
        item.productId === currentModalProduct.id && item.variantId === selectedVariant.id
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: currentModalProduct.id,
            printifyId: currentModalProduct.printifyId,
            title: currentModalProduct.title,
            price: currentModalProduct.price,
            image: currentModalProduct.image,
            variantId: selectedVariant.id,
            variantName: selectedVariant.name,
            variantDetails: selectedVariant,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartUI();
    showNotification('Product added to cart!');
    
    // Close modal after adding
    setTimeout(() => closeProductModal(), 500);
}

function loadRelatedProducts(product) {
    const relatedGrid = document.getElementById('related-products-grid');
    relatedGrid.innerHTML = '';
    
    // Find related products (same category, exclude current product)
    let relatedProducts = products.filter(p => 
        p.category === product.category && p.id !== product.id
    );
    
    // If not enough in same category, add some from other categories
    if (relatedProducts.length < 4) {
        const moreProducts = products.filter(p => 
            p.id !== product.id && !relatedProducts.includes(p)
        );
        relatedProducts = [...relatedProducts, ...moreProducts.slice(0, 4 - relatedProducts.length)];
    }
    
    // Show max 4 related products
    relatedProducts.slice(0, 4).forEach(p => {
        const card = document.createElement('div');
        card.className = 'related-product-card';
        card.onclick = () => {
            closeProductModal();
            setTimeout(() => openProductModal(p.id), 100);
        };
        
        card.innerHTML = `
            <div class="related-product-image">
                <img src="${p.image}" alt="${p.title}" loading="lazy">
            </div>
            <div class="related-product-info">
                <div class="related-product-title">${p.title}</div>
                <div class="related-product-price">$${p.price.toFixed(2)}</div>
            </div>
        `;
        
        relatedGrid.appendChild(card);
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('product-modal');
    if (e.target === modal) {
        closeProductModal();
    }
});

// Handle checkout form submission
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Processing...';
    
    // Collect form data
    const formData = {
        email: document.getElementById('email').value,
        name: document.getElementById('name').value,
        address: {
            line1: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            postal_code: document.getElementById('zip').value,
            country: document.getElementById('country').value
        }
    };
    
    try {
        let paymentMethodId = null;
        
        if (!DEMO_MODE) {
            // Create payment method with Stripe
            const {error, paymentMethod} = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: formData.name,
                    email: formData.email,
                    address: formData.address
                }
            });
            
            if (error) {
                throw error;
            }
            paymentMethodId = paymentMethod.id;
        } else {
            // Demo mode - use fake payment method ID
            paymentMethodId = `demo_pm_${Date.now()}`;
        }
        
        // Send order to backend
        const response = await fetch(`${API_URL}/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart,
                customer: formData,
                paymentMethodId: paymentMethodId,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Clear cart
            cart = [];
            saveCartToStorage();
            updateCartUI();
            
            // Close modal and show success
            closeCheckout();
            showNotification('Order placed successfully! Check your email for confirmation.');
            
            // Redirect to success page (optional)
            // window.location.href = '/success.html';
        } else {
            throw new Error(result.error || 'Order failed');
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        document.getElementById('card-errors').textContent = error.message || 'An error occurred. Please try again.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Order';
    }
});