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
});


function checkAuthStatusAndUpdateHeader() {
    const token = localStorage.getItem('accessToken');
    const nav = document.querySelector('header nav');

    if (token) 
    {
        nav.innerHTML = `
            <a href="cart.html">Корзина</a>
            <a href="profile.html">Профиль</a>
            <a href="#" id="logout-button">Выйти</a>
        `;
        document.getElementById('logout-button').addEventListener('click', logout);
    } 
    else 
    {
        nav.innerHTML = `
            <a href="cart.html">Корзина</a>
            <a href="login.html">Войти</a>
        `;
    }
}

function logout(event) {
    event.preventDefault();
    localStorage.removeItem('accessToken');
    alert('Вы вышли из аккаунта');
    window.location.href = 'index.html';
}


async function fetchAndDisplayProducts() {
    const productsContainer = document.getElementById('products-container');
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (!productsContainer) {
        return;
    }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();

        productsContainer.innerHTML = '';

        products.forEach(product => {
        const productCard = `
            <a href="product.html?id=${product.id}" class="product-card-link">
                <div class="product-card">
                    <img src="${product.image_url || 'https://via.placeholder.com/150'}" alt="${product.name}">
                    <h2>${product.name}</h2>
                    <p class="price">${product.price.toFixed(2)} ₽</p>
                    <button>Подробнее</button>
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
                <a href="index.html" class="button">Вернуться в каталог</a>
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
            <button>Оформить заказ</button>
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
                    <button onclick="addToCart(${product.id})">Добавить в корзину</button>
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



