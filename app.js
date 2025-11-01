const cart = []
let appliedDiscount = null
let discountCode = ''
let discountError = ''

async function init() {
    populateCities()
    await fetchProducts()
    setupEventListeners()
}

function populateCities() {
    const select = document.getElementById('city')
    CITIES.forEach(city => {
        const option = document.createElement('option')
        option.value = city
        option.textContent = city
        select.appendChild(option)
    })
}

async function fetchProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name')

        if (error) throw error
        renderProducts(data || [])
    } catch (error) {
        document.getElementById('productsGrid').innerHTML = '<p>Error loading products</p>'
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid')
    if (products.length === 0) {
        grid.innerHTML = '<p>No products available</p>'
        return
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card" onclick="showProduct('${product.id}')">
            <img src="${product.image_url || product.images?.[0] || 'placeholder.jpg'}" alt="${product.name}" onerror="this.src='placeholder.jpg'">
            <div class="info">
                <h4>${product.name}</h4>
                <p class="price">${product.price || 'TBD'} ${product.price ? 'SAR' : ''}</p>
            </div>
        </div>
    `).join('')
}

let selectedImageIndex = 0
let currentProduct = null
async function showProduct(id) {
    const { data } = await supabase.from('products').select('*').eq('id', id).single()
    if (!data) return

    currentProduct = data
    selectedImageIndex = 0
    const modal = document.getElementById('productModal')
    const body = document.getElementById('modalBody')
    
    const images = (data.images && data.images.length > 0 ? data.images : [data.image_url]).filter(Boolean)
    
    body.innerHTML = `
        <div class="modal-header">
            <h2>${data.name}</h2>
            <button onclick="closeModal()" class="close-btn">&times;</button>
        </div>
        <div class="modal-content-grid">
            <div class="image-section">
                <div class="main-image-container">
                    ${images.map((img, idx) => `
                        <img src="${img}" alt="${data.name}" class="main-image ${idx === selectedImageIndex ? 'active' : ''}" style="display: ${idx === selectedImageIndex ? 'block' : 'none'};">
                    `).join('')}
                    ${images.length > 1 ? `
                        <button onclick="navigateImage(-1)" class="nav-btn nav-left">←</button>
                        <button onclick="navigateImage(1)" class="nav-btn nav-right">→</button>
                    ` : ''}
                </div>
                ${images.length > 1 ? `
                    <div class="thumbnails">
                        ${images.map((img, idx) => `
                            <button onclick="selectThumbnail(${idx})" class="thumb ${idx === selectedImageIndex ? 'active' : ''}">
                                <img src="${img}" alt="Thumbnail">
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="product-info">
                <div class="price-section">
                    <h1>${data.name}</h1>
                    ${data.price ? `<div class="price-large">${data.price} SAR</div>` : ''}
                </div>
                ${data.description ? `<p class="description">${data.description}</p>` : ''}
                <div class="size-section">
                    <label>Select Your Size</label>
                    <div class="sizes">
                        <button onclick="selectSize('S')" class="size-btn" data-size="S">S</button>
                        <button onclick="selectSize('M')" class="size-btn" data-size="M">M</button>
                        <button onclick="selectSize('L')" class="size-btn" data-size="L">L</button>
                    </div>
                </div>
                <button onclick="addToCartFromModal('${data.id}', '${data.name}', ${data.price || 0})" class="add-btn" id="addToCartBtn">Select a Size to Continue</button>
                <div class="features">
                    <div><span>✓</span> Premium Quality</div>
                    <div><span>✓</span> Free Shipping</div>
                    <div><span>✓</span> Fast Delivery</div>
                    <div><span>✓</span> Easy Returns</div>
                </div>
            </div>
        </div>
    `

    modal.classList.add('active')
    document.querySelectorAll('[data-size]').forEach(btn => btn.classList.remove('selected'))
}

let selectedSize = null
function selectSize(size) {
    selectedSize = size
    document.querySelectorAll('[data-size]').forEach(btn => {
        btn.classList.remove('selected')
        if (btn.dataset.size === size) {
            btn.classList.add('selected')
        }
    })
    const btn = document.getElementById('addToCartBtn')
    if (btn) {
        btn.textContent = `Add to Cart - Size ${size}`
        btn.disabled = false
    }
}

function navigateImage(direction) {
    if (!currentProduct) return
    const images = (currentProduct.images && currentProduct.images.length > 0 ? currentProduct.images : [currentProduct.image_url]).filter(Boolean)
    selectedImageIndex += direction
    if (selectedImageIndex < 0) selectedImageIndex = images.length - 1
    if (selectedImageIndex >= images.length) selectedImageIndex = 0
    selectThumbnail(selectedImageIndex)
}

function selectThumbnail(idx) {
    selectedImageIndex = idx
    document.querySelectorAll('.main-image').forEach((img, i) => {
        img.style.display = i === idx ? 'block' : 'none'
    })
    document.querySelectorAll('.thumb').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === idx)
    })
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active')
    selectedSize = null
}

async function addToCartFromModal(id, name, price) {
    if (!selectedSize) {
        alert('Please select a size')
        return
    }
    addToCart(id, name, price)
    closeModal()
}

function addToCart(id, name, price) {
    cart.push({ id, name, price, size: selectedSize })
    updateCartDisplay()
    showMessage('Added to cart!', 'success')
}

function updateCartDisplay() {
    const section = document.getElementById('cartSection')
    const items = document.getElementById('cartItems')
    const totalSection = document.getElementById('totalSection')

    if (cart.length === 0) {
        section.style.display = 'none'
        return
    }

    section.style.display = 'block'
    items.innerHTML = cart.map((item, i) => `
        <div class="cart-item">
            <span>${item.name} (${item.size}) - ${item.price} SAR</span>
            <button onclick="removeFromCart(${i})" class="remove-btn">✕</button>
        </div>
    `).join('')

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0)
    const discount = appliedDiscount ? subtotal * (appliedDiscount.percent / 100) : 0
    const total = subtotal - discount

    totalSection.innerHTML = `
        ${appliedDiscount ? `
            <div class="total-line">
                <span>Subtotal:</span>
                <span>${subtotal} SAR</span>
            </div>
            <div class="total-line discount">
                <span>Discount (${appliedDiscount.percent}%):</span>
                <span>-${discount} SAR</span>
            </div>
        ` : ''}
        <div class="total-final">
            <span>Total:</span>
            <span>${total} SAR</span>
        </div>
    `

    renderDiscountSection()
}

function renderDiscountSection() {
    const section = document.getElementById('discountSection')
    
    if (appliedDiscount) {
        section.innerHTML = `
            <div class="discount-applied">
                <div>
                    <div>Code: ${appliedDiscount.code}</div>
                    <div>${appliedDiscount.percent}% off applied</div>
                </div>
                <button onclick="removeDiscount()">Remove</button>
            </div>
        `
    } else {
        section.innerHTML = `
            <div class="discount-input">
                <input type="text" id="discountCode" placeholder="Discount Code" onkeypress="if(event.key==='Enter') applyDiscount()">
                <button onclick="applyDiscount()">Apply</button>
                ${discountError ? `<div class="discount-error">${discountError}</div>` : ''}
            </div>
        `
    }
}

async function applyDiscount() {
    const code = document.getElementById('discountCode').value.toUpperCase()
    if (!code.trim()) {
        discountError = 'Please enter a discount code'
        renderDiscountSection()
        return
    }

    discountError = ''

    try {
        const { data, error } = await supabase
            .from('discount_codes')
            .select('*')
            .eq('code', code)
            .eq('is_active', true)
            .single()

        if (error) throw error

        if (!data) {
            discountError = 'Invalid discount code'
            renderDiscountSection()
            return
        }

        if (data.uses_count >= data.max_uses) {
            discountError = 'This code has reached its maximum uses'
            renderDiscountSection()
            return
        }

        appliedDiscount = { code: data.code, percent: data.discount_percent }
        discountCode = ''
        updateCartDisplay()
    } catch (err) {
        if (err.code === 'PGRST116') {
            discountError = 'Invalid discount code'
        } else {
            discountError = 'Failed to apply discount code'
        }
        renderDiscountSection()
    }
}

function removeDiscount() {
    appliedDiscount = null
    discountCode = ''
    discountError = ''
    updateCartDisplay()
}

function removeFromCart(index) {
    cart.splice(index, 1)
    updateCartDisplay()
}

function showMessage(text, type) {
    const msg = document.getElementById('message')
    msg.textContent = text
    msg.className = type
    setTimeout(() => msg.className = '', 3000)
}

function setupEventListeners() {
    document.getElementById('orderForm').onsubmit = handleOrder
}

async function handleOrder(e) {
    e.preventDefault()

    const city = document.getElementById('city').value
    if (city !== 'Riyadh') {
        showMessage('Pre-orders are limited to Riyadh only', 'error')
        return
    }

    if (cart.length === 0) {
        showMessage('Please add items to your cart', 'error')
        return
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0)
    const discount = appliedDiscount ? subtotal * (appliedDiscount.percent / 100) : 0

    const order = {
        full_name: document.getElementById('name').value,
        phone_number: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        city: city,
        items: cart,
        total_amount: subtotal - discount,
        status: 'pending'
    }

    try {
        if (appliedDiscount) {
            const { data: codeData } = await supabase
                .from('discount_codes')
                .select('uses_count')
                .eq('code', appliedDiscount.code)
                .single()

            await supabase
                .from('discount_codes')
                .update({ uses_count: codeData.uses_count + 1 })
                .eq('code', appliedDiscount.code)
        }

        const { error } = await supabase.from('pre_orders').insert(order)
        if (error) throw error

        cart.length = 0
        appliedDiscount = null
        discountCode = ''
        discountError = ''
        updateCartDisplay()
        document.getElementById('orderForm').reset()
        showMessage('Order placed successfully! Awaiting approval.', 'success')
    } catch (error) {
        showMessage('Error placing order', 'error')
    }
}

init()

