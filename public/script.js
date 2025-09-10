
const menuItems = [
    { name: 'Pizza', price: 250 },
    { name: 'Samosa', price: 16 },
    { name: 'Burger', price: 100 },
    { name: 'French Fries', price: 80 },
    { name: 'Pasta', price: 180 },
    { name: 'Coke', price: 50 }
];

const menuDiv = document.getElementById('menu');
const summaryDiv = document.getElementById('summary');
const paymentDiv = document.getElementById('payment');
const statusDiv = document.getElementById('status');
const orderDetailsDiv = document.getElementById('order-details');
const totalPriceSpan = document.getElementById('total-price');
const proceedToPaymentBtn = document.getElementById('proceed-to-payment');
const payUpiBtn = document.getElementById('pay-upi');
const payCodBtn = document.getElementById('pay-cod');
const orderMessageP = document.getElementById('order-message');

let selectedItems = {};

// Menu items ko display karna
function renderMenu() {
    menuDiv.innerHTML = menuItems.map(item => `
        <div class="menu-item">
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-price">₹${item.price}</span>
            </div>
            <div class="quantity-control">
                <label for="qty-${item.name}">Quantity:</label>
                <input type="number" id="qty-${item.name}" min="0" value="0" class="quantity-input">
            </div>
        </div>
    `).join('');
    
    // Event listeners add karna
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', updateOrderSummary);
    });
}

function updateOrderSummary() {
    selectedItems = {};
    let total = 0;
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        const itemName = input.id.replace('qty-', '');
        const quantity = parseInt(input.value);
        const item = menuItems.find(i => i.name === itemName);
        
        if (quantity > 0) {
            selectedItems[itemName] = quantity;
            total += quantity * item.price;
        }
    });

    totalPriceSpan.textContent = `₹${total}`;
    
    // "Review Order" button show karna
    if (total > 0) {
        summaryDiv.style.display = 'block';
    } else {
        summaryDiv.style.display = 'none';
    }
}

proceedToPaymentBtn.addEventListener('click', () => {
    let summaryHtml = '';
    for (const item in selectedItems) {
        const itemPrice = menuItems.find(i => i.name === item).price;
        summaryHtml += `<p>${item} x ${selectedItems[item]} = ₹${selectedItems[item] * itemPrice}</p>`;
    }
    orderDetailsDiv.innerHTML = summaryHtml;
    
    summaryDiv.style.display = 'none';
    paymentDiv.style.display = 'block';
});

async function submitOrder(paymentMethod) {
    try {
        const response = await fetch('https://food-order-backend-1bbl.onrender.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: selectedItems,
                paymentMethod: paymentMethod,
                total: parseInt(totalPriceSpan.textContent.replace('₹', ''))
            })
        });

        const result = await response.json();
        
        paymentDiv.style.display = 'none';
        statusDiv.style.display = 'block';
        orderMessageP.textContent = result.message;

    } catch (error) {
        paymentDiv.style.display = 'none';
        statusDiv.style.display = 'block';
        orderMessageP.textContent = 'Error placing order. Please try again.';
        console.error('Error:', error);
    }
}

payUpiBtn.addEventListener('click', () => {
    submitOrder('UPI');
});

payCodBtn.addEventListener('click', () => {
    submitOrder('COD');
});

// Initial load
renderMenu();