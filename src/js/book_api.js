document.addEventListener('DOMContentLoaded', function () {
     // Инициализация
     fetchCategories();
     fetchBooksByCategory();
     updateCartCounter();
     loadCartFromLocalStorage();
 
     // Обработчик для кнопок выбора категории
     const categoryButtonsContainer = document.getElementById('categoryButtons');
    categoryButtonsContainer.addEventListener('click', function (event) {
        const target = event.target;

        if (target.tagName === 'BUTTON') {
            const selectedCategory = target.textContent;
            updateSelectedCategory(selectedCategory);
            updateCategoryQuery();
        }
    });
 
     // Обработчик для кнопок добавления в корзину
     const resultsContainer = document.getElementById('results');
     resultsContainer.addEventListener('click', function (event) {
         const target = event.target;
 
         if (target.classList.contains('add-to-cart-button')) {
             const title = target.getAttribute('data-title');
             const price = target.getAttribute('data-price');
 
             toggleCartItem(title, price);
             updateAddToCartButton(target);
         }
     });

     const loadmoreBtn = document.getElementById('loadmoreBtn');
    loadmoreBtn.addEventListener('click', function () {
        startIndex += maxResults;
        fetchBooksByCategory();
    });
 });
 
 const apiKey = 'AIzaSyAuwmooz561678TCyZa49BcnK41Jl0AnuI';
 let startIndex = 0;
 const maxResults = 6;
 let selectedCategory = '';
 let cart = new Map();
 
 function fetchCategories() {
     const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=*&startIndex=${startIndex}&maxResults=${maxResults}&key=${apiKey}`;
 
     fetch(apiUrl)
         .then(response => {
             if (!response.ok) {
                 throw new Error(`Network response was not ok (${response.status})`);
             }
             return response.json();
         })
         .then(data => {
             const uniqueCategories = getUniqueCategories(data);
             displayCategories(uniqueCategories);
             if (uniqueCategories.length > 0) {
                selectedCategory = uniqueCategories[0];
                updateSelectedCategory();
                fetchBooksByCategory();
            }
         })
         .catch(error => {
             console.error('Error fetching categories:', error);
         });
 }
 
 function getUniqueCategories(data) {
     const categories = new Set();
 
     if (data.items && data.items.length > 0) {
         data.items.forEach(item => {
             if (item.volumeInfo.categories) {
                 item.volumeInfo.categories.forEach(category => {
                     categories.add(category);
                 });
             }
         });
     }
 
     return Array.from(categories);
 }
 
 function displayCategories(categories) {
    const categoryButtonsContainer = document.getElementById('categoryButtons');

    categories.forEach((category, index) => {
        const categoryButton = document.createElement('button');
        const liElement = document.createElement('li');
        categoryButton.textContent = category;
        categoryButton.classList.add('custom__button_asside');
        liElement.classList.add('list-unstyled', 'mb-2', 'custom__li_button_asside');
        liElement.appendChild(categoryButton);

        liElement.addEventListener('click', function () {
            selectCategory(category);
        });
        
        
        categoryButtonsContainer.appendChild(liElement);
    });
    console.log('categories', categories.length, categories);
    console.log('categoryButtonsContainer', categoryButtonsContainer);
    

    // Вызываем функцию обновления активной категории после создания кнопок
    updateSelectedCategory();
}
 

 function selectCategory(category) {
     selectedCategory = category;
     fetchBooksByCategory();
     updateSelectedCategory();
 }
 function updateSelectedCategory(selectedCategory) {
    const categoryButtons = document.querySelectorAll('.custom__button_asside');
    categoryButtons.forEach(button => {
        button.classList.remove('custom__button_asside__active');
        if (containsText(button, selectedCategory)) {
            button.classList.add('custom__button_asside__active');
        }
    });

    // Если selectedCategory не передан (undefined), то добавляем активный класс к первой категории
    if (!selectedCategory) {
        const firstCategoryButton = categoryButtons[0];
        if (firstCategoryButton) {
            firstCategoryButton.classList.add('custom__button_asside__active');
        }
    }

    function containsText(element, text) {
        return element.textContent.includes(text);
    }
}


function containsText(element, text) {
    return element.textContent.includes(text);
}
 
function updateCategoryQuery() {
    startIndex = 0;
    clearResults();
    fetchBooksByCategory();
    // Убеждаемся, что активная категория обновлена после загрузки книг
    updateSelectedCategory(selectedCategory);
}

 function fetchBooksByCategory() {
     const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=*subject:${selectedCategory}&startIndex=${startIndex}&maxResults=${maxResults}&key=${apiKey}`;
     console.log('API URL:', apiUrl);
     fetch(apiUrl)
         .then(response => response.json())
         .then(data => {
             displayResults(data);
         })
         .catch(error => {
             console.error('Error fetching data:', error);
         });
 }
 

//  ниже все работает!!!!!!!!!!
 function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    const errorContainer = document.getElementById('error');
     
 
     if (startIndex === 0) {
         clearResults();
     }
 
     if (data.items && data.items.length > 0) {
         data.items.forEach(item => {
             const title = item.volumeInfo.title;
             const authors = item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Author Unknown';
             const thumbnail = item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : 'No Image';
             const rating = item.volumeInfo.averageRating ? item.volumeInfo.averageRating : 'No Rating';
             const ratingCount = item.volumeInfo.ratingsCount ? item.volumeInfo.ratingsCount : 'No Rating';
             const description = item.volumeInfo.description ? item.volumeInfo.description : 'No Description';
             const price = item.saleInfo && item.saleInfo.listPrice ? `${item.saleInfo.listPrice.amount} ${item.saleInfo.listPrice.currencyCode}` : 'Price not specified';
            
             const bookDetails = document.createElement('div');
             bookDetails.classList.add('card_block');
             bookDetails.classList.add('d-flex');
             bookDetails.classList.add('mt-5');
             bookDetails.classList.add('mb-4');
             bookDetails.classList.add('z-3');
             bookDetails.innerHTML = `
             <div class="card_block_image"><img src="${thumbnail}" alt="title" loading="lazy"></div>
             <div class="card_block_text ms-5 d-flex flex-column justify-content-center">
                 <h2 class="card_auhtor">${authors}</h2>
                 <p class="card_heading m-0">${title}</p>
                 <div class="rating-container d-flex">
                    <div class="rating-stars">
                        ${getStarRatingHTML(rating)}
                        <span class='custom-font-size' 
                        >${ratingCount || '0'} reviwew</span>
                    </div>
                </div>
                 <p class="card_description">${description}</p>
                 <p class="card_price">${price}</p>
             </div>
             `;
             function getStarRatingHTML(rating) {
                const maxRating = 5;
                const filledStars = Math.floor(rating);
                const halfStar = rating % 1 > 0 ? 1 : 0;
                const emptyStars = maxRating - filledStars - halfStar;
                
                let starsHTML = '';
                
                for (let i = 0; i < filledStars; i++) {
                    starsHTML += `
                    <i class="bi bi-star-fill text-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                        </svg>
                    </i>`;
                }
                
                if (halfStar) {
                    starsHTML += `<i class="bi bi-star-half text-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-star-half" viewBox="0 0 16 16">
                            <path d="M5.354 5.119 7.538.792A.52.52 0 0 1 8 .5c.183 0 .366.097.465.292l2.184 4.327 4.898.696A.54.54 0 0 1 16 6.32a.55.55 0 0 1-.17.445l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256a.5.5 0 0 1-.146.05c-.342.06-.668-.254-.6-.642l.83-4.73L.173 6.765a.55.55 0 0 1-.172-.403.6.6 0 0 1 .085-.302.51.51 0 0 1 .37-.245zM8 12.027a.5.5 0 0 1 .232.056l3.686 1.894-.694-3.957a.56.56 0 0 1 .162-.505l2.907-2.77-4.052-.576a.53.53 0 0 1-.393-.288L8.001 2.223 8 2.226z"/>
                        </svg>
                    </i>`;
                }
                
                for (let i = 0; i < emptyStars; i++) {
                    starsHTML += `<i class="bi bi-star text-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-star" viewBox="0 0 16 16">
                            <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"/>
                        </svg>
                    </i>`;
                }
                
                return starsHTML;
            }
 
             const addToCartButton = document.createElement('button');
             addToCartButton.textContent = cart.has(title) ? 'in the cart' : 'buy now';
             addToCartButton.addEventListener('click', function () {
                 toggleCartItem(title, price);
                 updateAddToCartButton(addToCartButton);
             });
             addToCartButton.classList.add('card_button');
             addToCartButton.setAttribute('data-title', title);
             addToCartButton.setAttribute('data-price', price);
 
          //    bookInfo.appendChild(bookImage);
          //    bookInfo.appendChild(bookDetails);
 
          //    bookContainer.appendChild(bookInfo);
             bookDetails.querySelector('.card_block_text').appendChild(addToCartButton);
             resultsContainer.appendChild(bookDetails);
         });
     } else {
         if (startIndex === 0) {
            errorContainer.innerHTML = ' <div class="Not_found_block"><p class="Not_found_text">Книги не найдены</p></div>';
             
         
         } else {
            errorContainer.innerHTML += '<div class="Not_found_block"><p class="Not_found_text">Книг больше нет</p></div>';
         }
     }
 
     updateAddToCartButtons();
 }
 
 function toggleCartItem(title, price) {
     if (cart.has(title)) {
         cart.delete(title);
     } else {
         cart.set(title, { price });
     }
     console.log('Cart:', cart);
     updateCartCounter();
     updateAddToCartButtons();
     saveCartToLocalStorage();
 }
 
 function updateCartCounter() {
    const cartCounterContainer = document.querySelector('.card__block_a');
    const cartCounter = cartCounterContainer.querySelector('#cartCounter');
    if (cart.size > 0) {
        if (!cartCounter) {
            const newCartCounter = document.createElement('span');
            newCartCounter.id = 'cartCounter';
            newCartCounter.classList.add('card__span');
            cartCounterContainer.appendChild(newCartCounter);
        }
        const cartCounterElement = document.getElementById('cartCounter');
        if (cartCounterElement) {
            cartCounterElement.textContent = cart.size;
        }
    } else {
        if (cartCounter) {
            cartCounter.remove();
        }
    }
    updateAddToCartButtons();
}

 function updateAddToCartButtons() {
     const addToCartButtons = document.querySelectorAll('.book-container .add-to-cart-button');
     addToCartButtons.forEach(button => {
         updateAddToCartButton(button);
     });
 }
 
 function updateAddToCartButton(button) {
     const title = button.getAttribute('data-title');
     button.textContent = cart.has(title) ? 'in the cart' : 'buy now';
 }
 
 function clearResults() {
     const resultsContainer = document.getElementById('results');
     resultsContainer.innerHTML = '';
 }
 
 function saveCartToLocalStorage() {
     const cartArray = Array.from(cart.entries());
     localStorage.setItem('cart', JSON.stringify(cartArray));
 }
 
 function loadCartFromLocalStorage() {
     const cartData = localStorage.getItem('cart');
 
     if (cartData) {
         const parsedCart = new Map(JSON.parse(cartData));
         cart = parsedCart;
         updateCartCounter();
     }
 }
 