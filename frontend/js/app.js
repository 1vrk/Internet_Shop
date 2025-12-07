const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

document.addEventListener('DOMContentLoaded', fetchAndDisplayProducts);

// вошелнет
if (loginForm) {
    loginForm.addEventListener('submit', async function(event) 
    {
        event.preventDefault(); 
        errorMessage.textContent = '';

        // Собираем данные из полей формы
        const formData = new FormData(loginForm);
        // ВАЖНО: FastAPI ожидает данные в формате `application/x-www-form-urlencoded`
        // для `OAuth2PasswordRequestForm`. FormData идеально для этого подходит.

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                body: formData 
            });

            const data = await response.json();

            if (!response.ok) {
                errorMessage.textContent = data.detail || 'Произошла ошибка входа.';
                throw new Error(data.detail || 'Login failed');
            }

            localStorage.setItem('accessToken', data.access_token);
            
            window.location.href = 'index.html';

        } catch (error) {
            console.error("Login error:", error);
            if (!errorMessage.textContent) {
                errorMessage.textContent = 'Не удалось подключиться к серверу.';
            }
        }
    });
}

//проверка вошел ли, чекаем токен
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatusAndUpdateHeader(); 
    
    if (document.getElementById('products-container')) 
    {
        fetchAndDisplayProducts();
    }

    if (document.getElementById('cart-container')) 
    {
        fetchAndDisplayCart();
    }

    if (document.querySelector('.profile-section')) 
    {
        initializeProfilePage();
    }

     if (document.getElementById('product-details-container')) {
        initializeProductPage();
    }

     if (document.getElementById('checkout-page')) {
        initializeCheckoutPage();
    }

     if (document.getElementById('admin-panel')) {
        initializeAdminPage();
    }
});


function checkAuthStatusAndUpdateHeader() {
    const token = localStorage.getItem('accessToken');
    const nav = document.querySelector('header nav');

    if (token) 
    {
        const payload = JSON.parse(atob(token.split('.')[1]));
        fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(user => {
            const isAdmin = user.is_admin;
            
            let adminLink = '';
            if (isAdmin) {
                adminLink = '<a href="admin.html" class="admin-link">Админка</a>';
            }

            nav.innerHTML = `
                ${adminLink}
                <a href="cart.html"><i class="fa-solid fa-cart-shopping"></i> Корзина</a>
                <a href="profile.html"><i class="fa-solid fa-user"></i> Профиль</a>
                <a href="#" id="logout-button"><i class="fa-solid fa-right-from-bracket"></i> Выйти</a>
            `;
            document.getElementById('logout-button').addEventListener('click', logout);
        });
        
    } 
    else 
    {
        nav.innerHTML = `
            <a href="cart.html"><i class="fa-solid fa-cart-shopping"></i> Корзина</a>
            <a href="login.html"><i class="fa-solid fa-right-to-bracket"></i> Войти</a>
        `;
    }
}

function logout(event) {
    event.preventDefault();
    localStorage.removeItem('accessToken');
    alert('Вы вышли из аккаунта');
    window.location.href = 'index.html';
}


async function fetchAndDisplayProducts(searchTerm = '') 
{ 
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    let url = `${API_BASE_URL}/products`;
    if (searchTerm) {
        
        url += `?search=${encodeURIComponent(searchTerm)}`;
    }

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        productsContainer.innerHTML = '';

        if (products.length === 0) {
             productsContainer.innerHTML = '<p>Товары не найдены.</p>';
             return;
        }

        products.forEach(product => {
            const productCard = `
                <a href="product.html?id=${product.id}" class="product-card-link">
                    <div class="product-card">
                        <img src="${product.image_url || 'https://via.placeholder.com/150'}" alt="${product.name}">
                        <h2>${product.name}</h2>
                        <p class="price">${product.price.toFixed(2)} ₽</p>
                        <button><i class="fa-solid fa-arrow-right"></i> Подробнее</button>
                    </div>
                </a>
            `;
            productsContainer.insertAdjacentHTML('beforeend', productCard);
        });

    } catch (error) {
        console.error("Could not fetch products:", error);
        productsContainer.innerHTML = '<p>Не удалось загрузить товары. Попробуйте позже.</p>';
    }
}

// корзина и тд
async function addToCart(productId, quantity = 1) {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        alert('Пожалуйста, войдите в аккаунт, чтобы добавить товар в корзину.');
        window.location.href = 'login.html';
        return; 
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`Ошибка: ${data.detail || 'Не удалось добавить товар'}`);
            throw new Error(data.detail || 'Failed to add item to cart');
        }

        alert(`Товар "${data.product.name}" добавлен в корзину!`);
        // Здесь можно добавить обновление иконки корзины в шапке (более сложная логика)

    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

async function fetchAndDisplayCart() {
    const cartContainer = document.getElementById('cart-container');
    if (!cartContainer) return; 

    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cart');
        }

        const cart = await response.json();
        renderCart(cart);

    } catch (error) {
        console.error('Error fetching cart:', error);
        cartContainer.innerHTML = '<p>Не удалось загрузить корзину.</p>';
    }
}

function renderCart(cart) {
    const cartContainer = document.getElementById('cart-container');
    cartContainer.innerHTML = ''; 

    if (cart.items.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart-empty-message">
                <p>Ваша корзина пуста.</p>
                <a href="index.html" class="checkout-button">Вернуться в каталог</a>
            </div>
        `;
        return;
    }

    cart.items.forEach(item => {
        const cartItemHTML = `
            <div class="cart-item">
                <img src="${item.product.image_url || 'https://via.placeholder.com/150'}" alt="${item.product.name}">
                <div class="cart-item-details">
                    <h3>${item.product.name}</h3>
                    <p>${item.product.price.toFixed(2)} ₽</p>
                </div>
                <div class="cart-item-quantity">
                    <input type="number" value="${item.quantity}" min="1" 
                           onchange="updateCartItemQuantity(${item.product.id}, this.value)">
                </div>
                <div class="cart-item-price">
                    <strong>${(item.product.price * item.quantity).toFixed(2)} ₽</strong>
                </div>
                <div class="cart-item-actions">
                    <button onclick="removeCartItem(${item.product.id})">Удалить</button>
                </div>
            </div>
        `;
        cartContainer.insertAdjacentHTML('beforeend', cartItemHTML);
    });

    const cartTotalHTML = `
        <div class="cart-total">
            <h2>Итого: ${cart.total_cost.toFixed(2)} ₽</h2>
            <a href="checkout.html" class="checkout-button">Оформить заказ</a>
        </div>
    `;
    cartContainer.insertAdjacentHTML('beforeend', cartTotalHTML);
}

async function updateCartItemQuantity(productId, newQuantity) {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity: parseInt(newQuantity) })
        });

        if (!response.ok) throw new Error('Failed to update quantity');

        fetchAndDisplayCart();

    } catch (error) {
        console.error('Error updating cart item:', error);
        alert('Не удалось обновить количество товара.');
        fetchAndDisplayCart();
    }
}

async function removeCartItem(productId) {
    if (!confirm('Вы уверены, что хотите удалить этот товар из корзины?')) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to remove item');

        fetchAndDisplayCart();

    } catch (error) {
        console.error('Error removing cart item:', error);
        alert('Не удалось удалить товар.');
    }
}

//мегалогика профиля

async function initializeProfilePage() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    await Promise.all([
        fetchAndDisplayProfile(token),
        fetchAndDisplayAddresses(token),
        fetchAndDisplayOrders(token)
    ]);
    
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    document.getElementById('add-address-form').addEventListener('submit', handleAddAddress);
}

//личные бонусы
async function fetchAndDisplayProfile(token) {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const user = await response.json();

    const form = document.getElementById('profile-form');
    
    const profile = user.profile || {};

    form.innerHTML = `
        <div class="form-group">
            <label>Имя пользователя:</label>
            <input type="text" value="${user.username}" disabled>
        </div>
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="${user.email}" required>
        </div>
        
        <div class="form-group">
            <label for="first_name">Имя:</label>
            <input type="text" id="first_name" name="first_name" value="${profile.first_name || ''}">
        </div>
        <div class="form-group">
            <label for="last_name">Фамилия:</label>
            <input type="text" id="last_name" name="last_name" value="${profile.last_name || ''}">
        </div>
        <div class="form-group">
            <label for="phone_number">Номер телефона:</label>
            <input type="tel" id="phone_number" name="phone_number" value="${profile.phone_number || ''}">
        </div>
        
        <button type="submit">Сохранить изменения</button>
    `;
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const email = document.getElementById('email').value;
    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const phoneNumber = document.getElementById('phone_number').value;

    const userData = { email: email };
    const profileData = {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber
    };

    try {
        const [userResponse, profileResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            }),
            fetch(`${API_BASE_URL}/users/me/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            })
        ]);

        if (userResponse.ok && profileResponse.ok) {
            alert('Данные успешно обновлены!');
            fetchAndDisplayProfile(token);
        } else {
            console.error('User response:', await userResponse.text());
            console.error('Profile response:', await profileResponse.text());
            alert('Произошла ошибка при обновлении данных.');
        }
    } catch (error) {
        console.error('Failed to update profile:', error);
        alert('Не удалось подключиться к серверу.');
    }
}
//адреса пользователя
async function fetchAndDisplayAddresses(token) {
    const response = await fetch(`${API_BASE_URL}/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const addresses = await response.json();
    const container = document.getElementById('addresses-container');
    container.innerHTML = '';
    addresses.forEach(addr => {
        const stateHTML = addr.state ? `, ${addr.state}` : '';
        container.innerHTML += `
            <div class="address-card" id="address-${addr.id}">
                <p>${addr.street}, ${addr.city}${stateHTML}, ${addr.postal_code}, ${addr.country}</p>
                <button onclick='editAddress(${JSON.stringify(addr)})'>Изменить</button>
                <button onclick="deleteAddress(${addr.id})">Удалить</button>
            </div>
        `;
    });
}
function editAddress(addressObject) {
    const form = document.getElementById('add-address-form');
    
    form.street.value = addressObject.street;
    form.city.value = addressObject.city;
    form.state.value = addressObject.state || ''; 
    form.postal_code.value = addressObject.postal_code;
    form.country.value = addressObject.country;

    const existingHiddenInput = form.querySelector('input[name="address_id"]');
    if (existingHiddenInput) {
        existingHiddenInput.remove();
    }
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'address_id';
    hiddenInput.value = addressObject.id;
    form.appendChild(hiddenInput);

    form.querySelector('button').textContent = 'Сохранить изменения';
    document.querySelector('#add-address-form-container h3').textContent = 'Редактирование адреса';
}

async function handleAddAddress(event) {
    event.preventDefault();
    const token = localStorage.getItem('accessToken');
    const form = event.target;
    const formData = new FormData(form);
    const addressData = Object.fromEntries(formData.entries());

    const addressId = addressData.address_id;
    
    let url = `${API_BASE_URL}/addresses`;
    let method = 'POST';

    if (addressId) {
        url = `${API_BASE_URL}/addresses/${addressId}`;
        method = 'PUT';
        delete addressData.address_id; 
    }

    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
    });

    if (response.ok) {
        form.reset(); 
        const hiddenInput = form.querySelector('input[name="address_id"]');
        if (hiddenInput) hiddenInput.remove();
        form.querySelector('button').textContent = 'Добавить адрес';
        document.querySelector('#add-address-form-container h3').textContent = 'Добавить новый адрес'; 
        fetchAndDisplayAddresses(token); 
    } else {
        alert(addressId ? 'Не удалось обновить адрес.' : 'Не удалось добавить адрес.');
    }
}

async function deleteAddress(addressId) {
    if (!confirm('Удалить этот адрес?')) return;
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        fetchAndDisplayAddresses(token); 
    } else {
        alert('Не удалось удалить адрес.');
    }
}

// истьория заказов
async function fetchAndDisplayOrders(token) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const orders = await response.json();
    const container = document.getElementById('orders-container');
    container.innerHTML = '';

    if(orders.length === 0) {
        container.innerHTML = '<p>У вас еще нет заказов.</p>';
        return;
    }

    orders.forEach(order => {
        const orderItemsHTML = order.items.map(item => `
            <div class="order-item">
                <img src="${item.product.image_url}" alt="${item.product.name}">
                <div>
                    <strong>${item.product.name}</strong><br>
                    <span>${item.quantity} шт. x ${item.price_per_item.toFixed(2)} ₽</span>
                </div>
            </div>
        `).join('');

        container.innerHTML += `
            <div class="order-card">
                <div class="order-header">
                    <div>Заказ №${order.id} от ${new Date(order.order_date).toLocaleDateString()}</div>
                    <div>Статус: <span>${order.status}</span></div>
                    <div>Сумма: <span>${order.total_amount.toFixed(2)} ₽</span></div>
                </div>
                <div class="order-body">
                    ${orderItemsHTML}
                </div>
            </div>
        `;
    });
}



//страница товара
async function initializeProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        document.getElementById('product-details-container').innerHTML = '<h1>Товар не найден</h1>';
        return;
    }
    
    await Promise.all([
        fetchAndDisplayProductDetails(productId),
        fetchAndDisplayReviews(productId)
    ]);
    
    checkIfUserCanReview(productId);
}

async function fetchAndDisplayProductDetails(productId) {
    const container = document.getElementById('product-details-container');
        
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (!response.ok) throw new Error('Product not found');
        const product = await response.json();

        document.title = `PokéShop - ${product.name}`;

        container.innerHTML = `
            <div class="product-details">
                <div class="product-image-large">
                    <img src="${product.image_url}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h1>${product.name}</h1>
                    <p class="price">${product.price.toFixed(2)} ₽</p>
                    <p>${product.description}</p>
                    <p><strong>В наличии:</strong> ${product.stock_quantity} шт.</p>
                    <p><strong>Категория:</strong> ${product.category.name}</p> 
                    <button onclick="addToCart(${product.id})"><i class="fa-solid fa-cart-plus"></i> Добавить в корзину</button>
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Ошибка в fetchAndDisplayProductDetails:", error); 
        container.innerHTML = '<h1>Не удалось загрузить товар</h1>';
    }
}

async function fetchAndDisplayReviews(productId) {
    const container = document.getElementById('reviews-list-container');
    const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
    const reviews = await response.json();

    if (reviews.length === 0) {
        container.innerHTML = '<p>Отзывов пока нет. Станьте первым</p>';
        return;
    }

    const token = localStorage.getItem('accessToken');
    const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).sub_id : null;

    reviews.forEach(review => {
        const isOwnReview = currentUserId === review.user.id;
        const actionButtons = isOwnReview ? `
            <div class="review-actions">
                <button onclick="deleteReview(${review.id}, ${productId})">Удалить</button>
            </div>
        ` : '';

        container.innerHTML += `
            <div class="review-card">
                <div class="review-header">
                    <strong>${review.user.username}</strong>
                    <span class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p>${review.comment || ''}</p>
                <div class="review-footer">
                    <small>${new Date(review.created_at).toLocaleString()}</small>
                    ${actionButtons}
                </div>
            </div>
        `;
    });
}
async function deleteReview(reviewId, productId) {
    if (!confirm('Удалить этот отзыв?')) return;
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
        checkIfUserCanReview(productId);
        fetchAndDisplayReviews(productId); 
    } else {
        alert('Не удалось удалить отзыв.');
    }
}
//показываем форму отзыва, только если пользователь купил товар
async function checkIfUserCanReview(productId) {
    const token = localStorage.getItem('accessToken');
    if (!token) return; 

    const formContainer = document.getElementById('add-review-form-container');

    
    try {
        const response = await fetch(`${API_BASE_URL}/users/me/can-review/${productId}`, {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.can_review) {
            formContainer.innerHTML = `
                <h3>Оставить свой отзыв</h3>
                <form id="review-form">
                    <label>Рейтинг (1-5):</label>
                    <input type="number" name="rating" min="1" max="5" required>
                    <label>Комментарий:</label>
                    <textarea name="comment" rows="4"></textarea>
                    <button type="submit">Отправить отзыв</button>
                </form>
            `;
            document.getElementById('review-form').addEventListener('submit', (e) => handleAddReview(e, productId));
        }
    } catch(e) { /* ignore */ }
}

async function handleAddReview(event, productId) {
    event.preventDefault();
    const token = localStorage.getItem('accessToken');
    const form = event.target;
    const rating = form.rating.value;
    const comment = form.comment.value;

    const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: parseInt(rating), comment: comment })
    });
    
    if (response.ok) {
        alert('Спасибо за ваш отзыв!');
        form.style.display = 'none'; 
        fetchAndDisplayReviews(productId); 
    } else {
        const error = await response.json();
        alert(`Ошибка: ${error.detail}`);
    }
}

const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = '';

        const username = this.username.value;
        const email = this.email.value;
        const password = this.password.value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                errorMessage.textContent = data.detail || 'Ошибка регистрации.';
                throw new Error(data.detail);
            }

            alert('Вы успешно зарегистрированы! Теперь можете войти.');
            window.location.href = 'login.html';

        } catch (error) {
            console.error("Register error:", error);
        }
    });
}


// логика страницы

async function initializeCheckoutPage() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const [cartData, addressesData, paymentMethodsData] = await Promise.all([
            fetch(`${API_BASE_URL}/cart`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
            fetch(`${API_BASE_URL}/addresses`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
            fetch(`${API_BASE_URL}/payment-methods`).then(res => res.json()) // Публичный эндпоинт
        ]);
        
        renderCheckoutSummary(cartData);
        renderAddressSelection(addressesData);
        renderPaymentSelection(paymentMethodsData);

        document.getElementById('place-order-button').addEventListener('click', handlePlaceOrder);

    } catch (error) {
        console.error("Failed to initialize checkout page:", error);
        document.querySelector('.checkout-main').innerHTML = '<p>Не удалось загрузить данные для оформления заказа.</p>';
    }
}

function renderCheckoutSummary(cart) {
    const container = document.getElementById('order-summary-container');
    const itemsHTML = cart.items.map(item => `
        <div class="summary-item">
            <span>${item.product.name} x ${item.quantity}</span>
            <span>${(item.product.price * item.quantity).toFixed(2)} ₽</span>
        </div>
    `).join('');
    container.innerHTML = `
        ${itemsHTML}
        <div class="summary-item summary-total">
            <span>Итого:</span>
            <span>${cart.total_cost.toFixed(2)} ₽</span>
        </div>
    `;
}

function renderAddressSelection(addresses) {
    const container = document.getElementById('address-selection-container');
    if (addresses.length === 0) {
        container.innerHTML = '<p>У вас нет сохраненных адресов. <a href="profile.html">Добавьте адрес</a> в личном кабинете.</p>';
        return;
    }
    const addressesHTML = addresses.map((addr, index) => `
        <div class="address-option">
            <input type="radio" name="address_id" value="${addr.id}" id="addr-${addr.id}" ${index === 0 ? 'checked' : ''}>
            <label for="addr-${addr.id}">${addr.street}, ${addr.city}, ${addr.postal_code}</label>
        </div>
    `).join('');
    container.innerHTML = addressesHTML;
}

function renderPaymentSelection(methods) {
    const container = document.getElementById('payment-selection-container');
    const methodsHTML = methods.map((method, index) => `
        <div class="payment-option">
            <input type="radio" name="payment_method_id" value="${method.id}" id="pay-${method.id}" ${index === 0 ? 'checked' : ''}>
            <label for="pay-${method.id}">${method.name}</label>
        </div>
    `).join('');
    container.innerHTML = methodsHTML;
}

async function handlePlaceOrder() {
    const token = localStorage.getItem('accessToken');
    const errorP = document.getElementById('checkout-error');
    errorP.textContent = '';
    
    const selectedAddress = document.querySelector('input[name="address_id"]:checked');
    const selectedPayment = document.querySelector('input[name="payment_method_id"]:checked');

    if (!selectedAddress) {
        errorP.textContent = 'Пожалуйста, выберите или добавьте адрес доставки.';
        return;
    }
    if (!selectedPayment) {
        errorP.textContent = 'Пожалуйста, выберите способ оплаты.';
        return;
    }

    const orderData = {
        address_id: parseInt(selectedAddress.value),
        payment_method_id: parseInt(selectedPayment.value)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();
        if (!response.ok) {
            errorP.textContent = data.detail || 'Не удалось создать заказ.';
            throw new Error(data.detail);
        }

        alert(`Заказ №${data.id} успешно создан!`);
        window.location.href = 'profile.html'; 

    } catch (error) {
        console.error("Failed to place order:", error);
    }
}


// поиск
const searchForm = document.getElementById('search-form');
if (searchForm) {
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput.value.trim(); 
        
        fetchAndDisplayProducts(searchTerm);
    });
}



// админ пнель

async function initializeAdminPage() {
    const token = localStorage.getItem('accessToken');
    const adminPanel = document.getElementById('admin-panel');
    if (!adminPanel) return;

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await response.json();

        if (!user.is_admin) {
            alert('Доступ запрещен.');
            window.location.href = 'index.html';
            return;
        }

        // Загружаем все данные параллельно
        await Promise.all([
            fetchAndDisplayAllUsers(token),
            fetchAndDisplayAllOrders(token),
            fetchAndDisplayAllCategories(token),
            fetchAndDisplayAllProductsAdmin(token),
            fetchAndDisplayAllReviews(token), 
            loadCategoriesIntoProductForm()
        ]);
        
        document.getElementById('order-status-filter').addEventListener('change', () => {
            fetchAndDisplayAllOrders(token);
        });

        document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);
        document.getElementById('cancel-category-edit').addEventListener('click', resetCategoryForm);

        document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
        document.getElementById('cancel-product-edit').addEventListener('click', resetProductForm);

        setupAdminTabs();
    } catch (error) {
        console.error("Admin page initialization failed:", error);
        adminPanel.innerHTML = '<p>Ошибка загрузки. Попробуйте войти снова.</p>';
    }
}


function setupAdminTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Убираем active у всех
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Добавляем active нужным
            button.classList.add('active');
            const tabId = button.dataset.tab;
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

// товары
async function fetchAndDisplayAllProductsAdmin(token) {
    const container = document.getElementById('admin-products-container');
    try {
        const response = await fetch(`${API_BASE_URL}/products?limit=10`); 
        
        const products = await response.json();
        
        let productsHTML = `<table class="admin-table">
            <thead><tr><th>ID</th><th>Название</th><th>Цена</th><th>Кол-во</th><th>Категория</th><th>Действия</th></tr></thead>
            <tbody>`;
        
        products.forEach(p => {
            const productObjectString = JSON.stringify(p).replace(/"/g, '&quot;');
            productsHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.name}</td>
                    <td>${p.price.toFixed(2)} ₽</td>
                    <td>${p.stock_quantity}</td>
                    <td>${p.category.name}</td>
                    <td>
                        <button onclick='editProduct(${productObjectString})'>Изменить</button>
                        <button onclick="deleteProduct(${p.id})">Удалить</button>
                    </td>
                </tr>
            `;
        });
        productsHTML += `</tbody></table>`;
        container.innerHTML = productsHTML;
    } catch (error) {
        console.error("Failed to fetch admin products:", error);
        container.innerHTML = '<p>Не удалось загрузить товары.</p>';
    }
}

async function loadCategoriesIntoProductForm() {
    const categorySelect = document.querySelector('#product-form select[name="category_id"]');
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const categories = await response.json();
        categorySelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch (error) {
        categorySelect.innerHTML = '<option>Не удалось загрузить категории</option>';
    }
}

function resetProductForm() {
    const form = document.getElementById('product-form');
    form.reset();
    form.product_id.value = ''; 
    document.getElementById('product-form-title').textContent = 'Добавить новый товар';
    document.getElementById('cancel-product-edit').style.display = 'none';
}

function editProduct(productObject) {
    const form = document.getElementById('product-form');
    form.product_id.value = productObject.id;
    form.name.value = productObject.name;
    form.description.value = productObject.description || '';
    form.price.value = productObject.price;
    form.stock_quantity.value = productObject.stock_quantity;
    form.image_url.value = productObject.image_url || '';
    form.category_id.value = productObject.category_id; // Используем category_id
    
    document.getElementById('product-form-title').textContent = `Редактирование: ${productObject.name}`;
    document.getElementById('cancel-product-edit').style.display = 'inline-block';
    
    form.scrollIntoView({ behavior: 'smooth' });
}

async function handleProductSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem('accessToken');
    const form = event.target;
    const productId = form.product_id.value;
    const productData = {
        name: form.name.value,
        description: form.description.value,
        price: parseFloat(form.price.value),
        stock_quantity: parseInt(form.stock_quantity.value),
        image_url: form.image_url.value,
        category_id: parseInt(form.category_id.value)
    };
    
    const method = productId ? 'PUT' : 'POST';
    let url = `${API_BASE_URL}/products`;
    if (productId) {
        url += `/${productId}`;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error((await response.json()).detail);

        resetProductForm();
        fetchAndDisplayAllProductsAdmin(token); 
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    const token = localStorage.getItem('accessToken');
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error((await response.json()).detail);
        fetchAndDisplayAllProductsAdmin(token); // Обновляем таблицу
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

// админка: пользователи 
async function fetchAndDisplayAllUsers(token) {
    const container = document.getElementById('users-container');
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        
        let usersHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Admin</th>
                        <th>Действие</th>
                    </tr>
                </thead>
                <tbody>
        `;
        users.forEach(user => {
            usersHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.is_admin ? 'Да' : 'Нет'}</td>
                    <td>
                        <button onclick="toggleAdminStatus(${user.id}, ${!user.is_admin})">
                            ${user.is_admin ? 'Снять админку' : 'Назначить админом'}
                        </button>
                    </td>
                </tr>
            `;
        });
        usersHTML += '</tbody></table>';
        container.innerHTML = usersHTML;

    } catch (error) {
        container.innerHTML = '<p>Не удалось загрузить пользователей.</p>';
    }
}

async function toggleAdminStatus(userId, newStatus) {
    const action = newStatus ? 'назначить администратором' : 'снять права администратора';
    if (!confirm(`Вы уверены, что хотите ${action} этого пользователя?`)) return;

    const token = localStorage.getItem('accessToken');
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-admin`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ is_admin: newStatus })
        });
        const data = await response.json();
        if (!response.ok) {
             throw new Error(data.detail || 'Ошибка при изменении статуса');
        }
        fetchAndDisplayAllUsers(token);

    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}


// фдминка: заказы 
async function fetchAndDisplayAllOrders(token) {
    const container = document.getElementById('admin-orders-container');
    // 1. Получаем текущее значение из выпадающего списка (фильтра)
    const filterValue = document.getElementById('order-status-filter').value;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const allOrders = await response.json();
        
        let filteredOrders;
        if (filterValue === 'active') {
            filteredOrders = allOrders.filter(order => 
                ['pending', 'processing', 'shipped'].includes(order.status)
            );
        } else if (filterValue === 'completed') {
            filteredOrders = allOrders.filter(order => 
                ['delivered', 'cancelled'].includes(order.status)
            );
        } else {
            filteredOrders = allOrders;
        }

        if (filteredOrders.length === 0) {
            container.innerHTML = '<p>Подходящих заказов не найдено.</p>';
            return;
        }

        container.innerHTML = '';
        filteredOrders.forEach(order => {
            const isEditable = order.status !== 'delivered' && order.status !== 'cancelled';
            const actionsHTML = isEditable ? `
                <div class="admin-order-actions">
                    <label for="status-${order.id}">Изменить статус:</label>
                    <select id="status-${order.id}">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>В ожидании</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                    </select>
                    <button onclick="updateOrderStatus(${order.id})">Сохранить</button>
                </div>
            ` : '';

            const orderCardHTML = `
                <div class="order-card">
                    <div class="order-header">
                        <div>Заказ №${order.id}</div>
                        <div>Сумма: <span>${order.total_amount.toFixed(2)} ₽</span></div>
                    </div>
                    <div class="order-body">
                        <p><strong>Адрес:</strong> ${order.address.street}, ${order.address.city}</p>
                        <p><strong>Статус:</strong> ${order.status}</p>
                        ${actionsHTML}
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', orderCardHTML);
        });

    } catch (error) {
        console.error("Error fetching admin orders:", error);
        container.innerHTML = '<p>Не удалось загрузить заказы.</p>';
    }
}

async function updateOrderStatus(orderId) {
    const token = localStorage.getItem('accessToken');
    const selectElement = document.getElementById(`status-${orderId}`);
    const newStatus = selectElement.value;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status?status_in=${newStatus}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
         const data = await response.json();
        if (!response.ok) {
             throw new Error(data.detail || 'Ошибка при изменении статуса');
        }
        fetchAndDisplayAllOrders(token);
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

// категории
async function fetchAndDisplayAllCategories(token) {
    const container = document.getElementById('admin-categories-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const categories = await response.json();

        let categoriesHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        categories.forEach(cat => {
            const categoryObjectString = JSON.stringify(cat).replace(/"/g, '&quot;');
            categoriesHTML += `
                <tr>
                    <td>${cat.id}</td>
                    <td>${cat.name}</td>
                    <td>${cat.description || '---'}</td>
                    <td>
                        <button onclick='editCategory(${categoryObjectString})'>Изменить</button>
                        <button onclick="deleteCategory(${cat.id})">Удалить</button>
                    </td>
                </tr>
            `;
        });

        categoriesHTML += '</tbody></table>';
        container.innerHTML = categoriesHTML;
        
        document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);
        document.getElementById('cancel-category-edit').addEventListener('click', resetCategoryForm);

    } catch (error) {
        console.error("Error fetching categories for admin:", error);
        container.innerHTML = '<p>Не удалось загрузить категории.</p>';
    }
}

function editCategory(categoryObject) {
    const form = document.getElementById('category-form');
    form.category_id.value = categoryObject.id;
    form.name.value = categoryObject.name;
    form.description.value = categoryObject.description || '';
    document.getElementById('category-form-title').textContent = `Редактирование: ${categoryObject.name}`;
    document.getElementById('cancel-category-edit').style.display = 'inline-block';
}

function resetCategoryForm() {
    const form = document.getElementById('category-form');
    form.reset();
    form.category_id.value = '';
    document.getElementById('category-form-title').textContent = 'Добавить новую категорию';
    document.getElementById('cancel-category-edit').style.display = 'none';
}

async function handleCategorySubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem('accessToken');
    const form = event.target;
    const categoryId = form.category_id.value;
    const categoryData = {
        name: form.name.value,
        description: form.description.value
    };

    const method = categoryId ? 'PUT' : 'POST';
    let url = `${API_BASE_URL}/categories`;
    if (categoryId) {
        url += `/${categoryId}`;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(categoryData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail);

        resetCategoryForm();
        fetchAndDisplayAllCategories(token);
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

async function deleteCategory(categoryId) {
    if (!confirm(`Вы уверены, что хотите удалить категорию с ID ${categoryId}? Это может повлиять на связанные товары.`)) {
        return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('Сессия истекла. Пожалуйста, войдите снова.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

    
        if (response.status === 204 || response.ok) {
            alert('Категория успешно удалена.');
        
            fetchAndDisplayAllCategories(token);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Не удалось удалить категорию.');
        }

    } catch (error) {
        console.error('Error deleting category:', error);
        alert(`Ошибка: ${error.message}`);
    }
}


// модерация отзывов

async function fetchAndDisplayAllReviews(token) {
    const container = document.getElementById('admin-reviews-container');
    if (!container) return; 

    try {
        const response = await fetch(`${API_BASE_URL}/admin/reviews`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch reviews');
        
        const reviews = await response.json();
        
        if (reviews.length === 0) {
            container.innerHTML = '<p>Отзывов в системе пока нет.</p>';
            return;
        }

        let reviewsHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Товар (ID)</th>
                        <th>Автор</th>
                        <th>Рейтинг</th>
                        <th>Комментарий</th>
                        <th>Дата</th>
                        <th>Действие</th>
                    </tr>
                </thead>
                <tbody>`;

        reviews.forEach(review => {
            reviewsHTML += `
                <tr>
                    <td>${review.id}</td>
                    <td>${review.product_id}</td>
                    <td>${review.user.username}</td>
                    <td>${'★'.repeat(review.rating)}<span style="color:#ddd;">${'★'.repeat(5 - review.rating)}</span></td>
                    <td>${(review.comment || '').substring(0, 50)}...</td>
                    <td>${new Date(review.created_at).toLocaleDateString()}</td>
                    <td>
                        <button onclick="deleteReviewByAdmin(${review.id})">Удалить</button>
                    </td>
                </tr>
            `;
        });
        reviewsHTML += `</tbody></table>`;
        container.innerHTML = reviewsHTML;

    } catch (error) {
        console.error("Error fetching reviews for admin:", error);
        container.innerHTML = '<p>Не удалось загрузить отзывы.</p>';
    }
}

async function deleteReviewByAdmin(reviewId) {
    if (!confirm(`Вы уверены, что хотите удалить отзыв с ID ${reviewId}? Это действие необратимо.`)) {
        return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('Сессия истекла. Пожалуйста, войдите снова.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 204 || response.ok) {
            alert('Отзыв успешно удален');
            fetchAndDisplayAllReviews(token);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Не удалось удалить отзыв');
        }

    } catch (error) {
        console.error('Error deleting review by admin:', error);
        alert(`Ошибка: ${error.message}`);
    }
}