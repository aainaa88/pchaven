document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const template = document.getElementById('product-card-template');
    const categoryFilter = document.getElementById('category-filter');
    const sortBy = document.getElementById('sort-by');
    const searchFilter = document.getElementById('search-filter');
    const viewToggle = document.getElementById('view-toggle');
    const filterForm = document.getElementById('filter-form');
    const toggleText = viewToggle.querySelector('.toggle-text');
    const clearFiltersBtn = document.getElementById('clear-filters');
    let isGridView = true;
    let products = [];

    function getCategoryFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('category');
    }

    function clearFilters() {
        searchFilter.value = '';
        categoryFilter.value = 'all';
        sortBy.value = 'name';
        const categoryLinks = document.querySelectorAll('.category-link');
        categoryLinks.forEach(link => link.classList.remove('active'));
        const allProductsLink = document.querySelector('[data-category="all"]');
        if (allProductsLink) allProductsLink.classList.add('active');
        const urlCategory = getCategoryFromURL();
        if (urlCategory) {
    categoryFilter.value = urlCategory;
    categoryFilter.dispatchEvent(new Event('change'));
} else {
    filterAndSortProducts();
}

    }

    clearFiltersBtn.addEventListener('click', clearFilters);

    filterForm.addEventListener('submit', (e) => e.preventDefault());

    searchFilter.addEventListener('input', debounce(() => {
        filterAndSortProducts();
    }, 300));

    function getElementTextContent(parent, tagName) {
        const element = parent.getElementsByTagName(tagName)[0];
        return element ? element.textContent : '';
    }

    async function loadProducts() {
        try {
            const response = await fetch('xml/products.xml');
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const productElements = xmlDoc.getElementsByTagName('product');

            products = Array.from(productElements).map(prod => ({
                category: getElementTextContent(prod, 'category'),
                name: getElementTextContent(prod, 'name'),
                price: parseFloat(getElementTextContent(prod, 'price')),
                specs: getElementTextContent(prod, 'specs'),
                image: getElementTextContent(prod, 'image').replace(/\\\\|\\/g, '/'),

                description: getElementTextContent(prod, 'description'),
                quantity: parseInt(getElementTextContent(prod, 'quantity')) || 0
            }));

            filterAndSortProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            const categoryFromURL = getCategoryFromURL();
if (!productList.querySelector('.product-card') && !categoryFromURL) {

                const placeholder = document.createElement('article');
                placeholder.className = 'product-card';
                placeholder.innerHTML = `
                    <div class="product-image-container">
                        <img class="product-image" src="images/placeholder.png" alt="Default Product">
                    </div>
                    <div class="product-details">
                        <h3 class="product-title">Sample Product</h3>
                        <p class="product-description">Failed to load product list. This is a placeholder.</p>
                        <p class="product-price">$0.00</p>
                    </div>
                `;
                productList.appendChild(placeholder);
            }
        }
    }

    function renderProducts(productsToRender) {
        productList.innerHTML = '';
        if (isGridView) {
            productsToRender.forEach(product => {
                const productCard = template.content.cloneNode(true);
                const image = productCard.querySelector('.product-image');
                image.src = product.image || 'images/placeholder.png';
                image.alt = `Image of ${product.name}`;

                productCard.querySelector('.product-title').textContent = product.name;
                productCard.querySelector('.product-description').textContent = product.description;
                productCard.querySelector('.product-price').textContent = `$${product.price.toFixed(2)}`;

                const quantityElement = document.createElement('div');
                quantityElement.className = 'product-quantity';
                quantityElement.textContent = `Qty: ${product.quantity || 0}`;
                const priceElement = productCard.querySelector('.product-price');
                priceElement.parentNode.insertBefore(quantityElement, priceElement.nextSibling);

                const article = productCard.querySelector('.product-card');
                article.dataset.category = product.category.toLowerCase().replace(/\s+/g, '-');
                article.classList.add(`category-${article.dataset.category}`);

                // Add click event listener to the article
                article.style.cursor = 'pointer'; // Makes it visually clickable
                article.addEventListener('click', () => {
                    const productName = article.querySelector('.product-title').textContent;
                    // Encode the name to handle special characters in URLs
                    const encodedName = encodeURIComponent(productName);
                    window.location.href = `product_details.html?name=${encodedName}`;
                });

                const specsTooltip = document.createElement('div');
                specsTooltip.className = 'specs-tooltip';
                specsTooltip.textContent = product.specs;
                article.appendChild(specsTooltip);

                productList.appendChild(productCard);
            });
        } else {
            const table = document.createElement('table');
            table.className = 'product-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Description</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsToRender.map(product => `
                        <tr style="cursor: pointer">
                            <td><img src="${product.image || 'images/placeholder.png'}" alt="${product.name}" width="80" height="80"></td>
                            <td>${product.name}</td>
                            <td>${product.category}</td>
                            <td>$${product.price.toFixed(2)}</td>
                            <td>${product.description}</td>
                            <td>${product.quantity}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
        
            // Add click event listeners to table rows
            table.querySelectorAll('tbody tr').forEach(row => {
                row.addEventListener('click', () => {
                    const productName = row.cells[1].textContent; // Name is in the second column
                    window.location.href = `product_details.html?name=${encodeURIComponent(productName)}`;
                });
            });
        
            productList.appendChild(table);
        }
    }

    function filterAndSortProducts() {
        let filtered = [...products];
        const searchTerm = searchFilter.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm)
            );
        }

        const selectedCategory = categoryFilter.value;
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product =>
                product.category.toLowerCase() === selectedCategory
            );
        }

        switch (sortBy.value) {
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
        }

        renderProducts(filtered);
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    viewToggle.addEventListener('click', () => {
        isGridView = !isGridView;
        toggleText.textContent = isGridView ? 'Switch to Table View' : 'Switch to Grid View';
        productList.className = isGridView ? 'product-grid' : 'product-list';
        renderProducts(products);
    });

    categoryFilter.addEventListener('change', filterAndSortProducts);
    sortBy.addEventListener('change', filterAndSortProducts);

    productList.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            e.target.src = 'images/placeholder.png';
            e.target.alt = 'Image not available';
        }
    }, true);

    loadProducts();
});