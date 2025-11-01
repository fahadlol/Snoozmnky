let isAuthenticated = false

function init() {
    checkAuth()
}

function checkAuth() {
    if (localStorage.getItem('admin-auth') === 'true') {
        showDashboard()
    }
}

function login() {
    const pass = document.getElementById('password').value
    if (pass === ADMIN_PASS) {
        localStorage.setItem('admin-auth', 'true')
        showDashboard()
    } else {
        document.getElementById('loginError').textContent = 'Invalid password'
    }
}

function showDashboard() {
    isAuthenticated = true
    document.getElementById('loginScreen').style.display = 'none'
    document.getElementById('dashboard').style.display = 'block'
    fetchOrders()
    fetchAdminProducts()
    fetchDiscountCodes()
    checkSettings()
}

function showTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'))
    event.target.classList.add('active')
    document.getElementById(tab + 'Tab').classList.add('active')
    
    if (tab === 'orders') fetchOrders()
    if (tab === 'products') fetchAdminProducts()
    if (tab === 'discount') fetchDiscountCodes()
}

async function fetchOrders() {
    const { data } = await supabase
        .from('pre_orders')
        .select('*')
        .order('created_at', { ascending: false })

    renderOrders(data || [])
}

function renderOrders(orders) {
    const list = document.getElementById('ordersList')
    if (orders.length === 0) {
        list.innerHTML = '<p>No orders yet</p>'
        return
    }

    list.innerHTML = orders.map(order => `
        <div class="order-item">
            <p><strong>${order.full_name}</strong></p>
            <p>${order.phone_number} | ${order.email || 'N/A'}</p>
            <p>${order.city}</p>
            <p>Items: ${order.items?.length || 0}</p>
            <p>Total: ${order.total_amount || 0} SAR</p>
            <p>Status: ${order.status}</p>
            <div class="order-actions">
                ${order.status === 'pending' ? `
                    <button onclick="updateOrder('${order.id}', 'approved')" style="background:#28a745">Approve</button>
                    <button onclick="updateOrder('${order.id}', 'denied')" style="background:#dc3545">Deny</button>
                ` : ''}
            </div>
        </div>
    `).join('')
}

async function updateOrder(id, status) {
    await supabase.from('pre_orders').update({ status }).eq('id', id)
    fetchOrders()
}

async function fetchAdminProducts() {
    const { data } = await supabase.from('products').select('*').order('name')
    renderAdminProducts(data || [])
}

function renderAdminProducts(products) {
    const list = document.getElementById('productsList')
    if (products.length === 0) {
        list.innerHTML = '<p>No products</p>'
        return
    }

    list.innerHTML = products.map(product => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:15px; margin-bottom:10px; border-radius:5px;">
            <span>${product.name} - ${product.price || 'N/A'} SAR</span>
            <button onclick="deleteProduct('${product.id}')" style="background:#dc3545">Delete</button>
        </div>
    `).join('')
}

async function addProduct() {
    const name = document.getElementById('pName').value
    const image = document.getElementById('pImage').value
    const price = parseFloat(document.getElementById('pPrice').value)

    if (!name || !image || !price) {
        alert('Please fill all fields')
        return
    }

    await supabase.from('products').insert({ name, image_url: image, price })
    document.getElementById('productForm').style.display = 'none'
    document.getElementById('pName').value = ''
    document.getElementById('pImage').value = ''
    document.getElementById('pPrice').value = ''
    fetchAdminProducts()
}

async function deleteProduct(id) {
    if (confirm('Delete this product?')) {
        await supabase.from('products').delete().eq('id', id)
        fetchAdminProducts()
    }
}

async function fetchDiscountCodes() {
    try {
        const { data } = await supabase
            .from('discount_codes')
            .select('*')
            .order('created_at', { ascending: false })
        renderDiscountCodes(data || [])
    } catch (error) {
        console.error('Error fetching discount codes:', error)
    }
}

function renderDiscountCodes(codes) {
    const list = document.getElementById('discountList')
    if (!list) return
    
    if (codes.length === 0) {
        list.innerHTML = '<p>No discount codes yet</p>'
        return
    }

    list.innerHTML = codes.map(code => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:15px; margin-bottom:10px; border-radius:5px;">
            <div>
                <div><strong>${code.code}</strong> - ${code.discount_percent}% off</div>
                <div style="font-size:12px; color:#666;">Used: ${code.uses_count}/${code.max_uses}</div>
            </div>
            <button onclick="deleteDiscountCode('${code.id}')" style="background:#dc3545">Delete</button>
        </div>
    `).join('')
}

function showDiscountForm() {
    document.getElementById('discountForm').style.display = 'block'
}

function hideDiscountForm() {
    document.getElementById('discountForm').style.display = 'none'
}

async function createDiscountCode() {
    const code = document.getElementById('dCode').value.toUpperCase()
    const percent = parseFloat(document.getElementById('dPercent').value)
    const maxUses = parseInt(document.getElementById('dMaxUses').value)

    if (!code || !percent || !maxUses) {
        alert('Please fill all fields')
        return
    }

    try {
        await supabase.from('discount_codes').insert({
            code,
            discount_percent: percent,
            max_uses: maxUses
        })
        hideDiscountForm()
        document.getElementById('dCode').value = ''
        document.getElementById('dPercent').value = ''
        document.getElementById('dMaxUses').value = ''
        fetchDiscountCodes()
    } catch (error) {
        alert('Error creating discount code')
    }
}

async function deleteDiscountCode(id) {
    if (confirm('Delete this discount code?')) {
        await supabase.from('discount_codes').delete().eq('id', id)
        fetchDiscountCodes()
    }
}

async function checkSettings() {
    const { data } = await supabase.from('admin_settings').select('*').eq('key', 'pre_orders_enabled').single()
    if (data) {
        document.getElementById('enabled').checked = data.value === 'true'
    }
}

async function toggleEnabled() {
    const enabled = document.getElementById('enabled').checked
    await supabase
        .from('admin_settings')
        .upsert({ key: 'pre_orders_enabled', value: enabled ? 'true' : 'false' })
}

init()

