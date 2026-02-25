let cartData = {
    items: [],
    total: 0
};

// Initialize cart from URL parameters if available
function initializeCart() {
    const urlParams = new URLSearchParams(window.location.search);
    const cartParam = urlParams.get('cart');
    
    if (cartParam) {
        try {
            cartData = JSON.parse(decodeURIComponent(cartParam));
        } catch (e) {
            console.log('Error parsing cart data, starting fresh');
            cartData = { items: [], total: 0 };
        }
    }
    
    updateCartDisplay();
    
    if (window.location.pathname.includes('Order.html')) {
        populateOrderSummary();
    }
}

function updateCartDisplay() {
    const cartAmount = document.querySelector('.cart-amount');
    if (cartAmount) {
        const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalItems > 0) {
            cartAmount.style.display = "block";
            cartAmount.textContent = totalItems;
        } else {
            cartAmount.style.display = "none";
        }
    }
}

// Add item to cart
function addToCart(itemName, itemPrice) {
    const priceNum = parseFloat(itemPrice.replace(/[^\d.]/g, ''));
    
    const existingItemIndex = cartData.items.findIndex(item => item.name === itemName);
    
    if (existingItemIndex > -1) {
        cartData.items[existingItemIndex].quantity += 1;
    } else {
        cartData.items.push({
            name: itemName,
            price: priceNum,
            priceText: itemPrice,
            quantity: 1,
        });
    }
    
    calculateTotal();
    updateCartDisplay();
    saveCartToUrl();
}

// Remove item from cart
function removeFromCart(itemName) {
    cartData.items = cartData.items.filter(item => item.name !== itemName);
    calculateTotal();
    updateCartDisplay();
    saveCartToUrl();
}

// Update item quantity
function updateQuantity(itemName, newQuantity) {
    const item = cartData.items.find(item => item.name === itemName);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(itemName);
        } else {
            item.quantity = newQuantity;
            calculateTotal();
            updateCartDisplay();
            saveCartToUrl();
        }
    }
}

// Calculate total price
function calculateTotal() {
    cartData.total = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Save cart data to URL for persistence
function saveCartToUrl() {
    const cartParam = encodeURIComponent(JSON.stringify(cartData));
    const url = new URL(window.location);
    if (cartData.items.length > 0) {
        url.searchParams.set('cart', cartParam);
    } else {
        url.searchParams.delete('cart');
    }
    window.history.replaceState({}, '', url);
}


// Navigate to order page with cart data
function goToOrderPage() {
    const cartParam = encodeURIComponent(JSON.stringify(cartData));
    window.location.href = `../html/Order.html?cart=${cartParam}`;
}

// Populate order summary on order page
function populateOrderSummary() {
    const orderContainer = document.querySelector('.order-bill');
    if (!orderContainer || cartData.items.length === 0) {
        if (orderContainer) {
            orderContainer.innerHTML = `
                <h2 class="bill-header">Order Summary</h2>
            `;
        }
        return;
    }

    let orderHtml = '<h2 class="bill-header">Order Summary</h2>';
    
    cartData.items.forEach((item, index) => {
        orderHtml += `
            <div class="item-desc" data-item="${item.name}">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus-btn" onclick="adjustQuantity('${item.name}', -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus-btn" onclick="adjustQuantity('${item.name}', 1)">+</button>
                    </div>
                </div>
                <div class="item-price">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}k</div>
            </div>
        `;
    });
    
    orderHtml += `
        <div class="total-section">
            <div class="total-price">Total: Rp ${cartData.total.toLocaleString('id-ID')}k</div>
        </div>
    `;
    
    orderContainer.innerHTML = orderHtml;
}

// Adjust quantity from order page
function adjustQuantity(itemName, change) {
    const item = cartData.items.find(item => item.name === itemName);
    if (item) {
        const newQuantity = item.quantity + change;
        updateQuantity(itemName, newQuantity);
        populateOrderSummary();
    }
}


document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    

    document.querySelectorAll('.add-button').forEach(button => {
        button.addEventListener('click', function() {
            const menuItem = this.closest('.menu-item');
            const itemName = menuItem.querySelector('.item-name').textContent;
            const itemPrice = menuItem.querySelector('.item-price').textContent;
            
            addToCart(itemName, itemPrice);
            
            const originalText = this.textContent;
            const originalBackground = this.style.background;
            
            this.textContent = 'Added!';
            this.style.background = '#28a745';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = originalBackground;
            }, 1000);

        });
    });

    const cartLink = document.querySelector('.cart a');
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            goToOrderPage();
        });
    }

    const form = document.getElementById("form");
    if (form) {
        form.addEventListener("submit", validateForm);
    }
});

// Form validation function
function validateForm(event) {
    event.preventDefault();

    const Name = document.getElementById("Name");
    const Email = document.getElementById("Email");
    const Address = document.getElementById("Address");
    const Qris = document.getElementById("Qris");
    const Ovo = document.getElementById("Ovo");
    const Dana = document.getElementById("Dana");
    
    let valid = true;
    

    if (cartData.items.length === 0) {
        valid = false;
        alert('Your cart is empty! Please add items to your order.');
        return;
    }

    if (!Name.value.trim()) {
        valid = false;
        alert('Please fill out Name');
        return;
    }
    if (!isNaN(Name.value)) {
        valid = false;
        alert('Please use only alphabets for name');
        return;
    }
    if (!Email.value.trim()) {
        valid = false;
        alert('Please fill out Email');
        return;
    }    
    if (!Email.value.endsWith('@gmail.com')) {
        valid = false;
        alert('Email must end with @gmail.com');
        return;
    }   
    if (!Address.value.trim()) {
        valid = false;
        alert('Please fill out Address');
        return;
    }   
    if (!isAlphaNum(Address.value)) {
        valid = false;
        alert('Address must contain both numbers and letters');
        return;
    }    
    if (!Qris.checked && !Ovo.checked && !Dana.checked) {
        valid = false;
        alert('Please choose a payment method');
        return;
    }

    if (valid) {
        let orderSummary = "Order confirmed!\n\nOrder Details:\n";
        cartData.items.forEach(item => {
            orderSummary += `${item.name} x${item.quantity} - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}k\n`;
        });
        orderSummary += `\nTotal: Rp ${cartData.total.toLocaleString('id-ID')}k`;
        orderSummary += `\n\nCustomer: ${Name.value}`;
        orderSummary += `\nEmail: ${Email.value}`;
        orderSummary += `\nAddress: ${Address.value}`;
        
        if (document.getElementById("Addons").value.trim()) {
            orderSummary += `\nAdd-ons: ${document.getElementById("Addons").value}`;
        }
        
        let paymentMethod = '';
        if (Qris.checked) paymentMethod = 'QRIS';
        if (Ovo.checked) paymentMethod = 'OVO';
        if (Dana.checked) paymentMethod = 'DANA';
        orderSummary += `\nPayment: ${paymentMethod}`;
        
        alert(orderSummary);
        
        cartData = { items: [], total: 0 };
        updateCartDisplay();
        saveCartToUrl();

        window.location.href = '../index.html';
        
    }
}

function isAlphaNum(string) {
    let hasAlpha = false;
    let hasNum = false;

    for (let i = 0; i < string.length; i++) {
        if (isNaN(string[i]) && string[i] !== ' ') {
            hasAlpha = true;
        } else if (!isNaN(string[i]) && string[i] !== ' ') {
            hasNum = true;
        }
    }
    
    return hasAlpha && hasNum;
}