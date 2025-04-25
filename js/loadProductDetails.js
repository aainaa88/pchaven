document.addEventListener('DOMContentLoaded', () => {
    // Get product name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productName = decodeURIComponent(urlParams.get('name'));

    // Get elements
    const productImage = document.getElementById('product-image');
    const productNameElement = document.getElementById('product-name');
    const productPrice = document.getElementById('product-price');
    const productDescription = document.getElementById('product-description');
    const quantityInput = document.getElementById('quantity');
    const addToCartButton = document.getElementById('add-to-cart');

    // Load product details
        // Load product details
        async function loadProductDetails() {
        try {
            const response = await fetch('xml/products.xml');
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            const products = xmlDoc.getElementsByTagName('product');
            let product = null;
            
            for (let i = 0; i < products.length; i++) {
                const currentName = products[i].getElementsByTagName('name')[0].textContent;
                if (currentName === productName) {
                    product = products[i];
                    break;
                }
            }

            if (product) {
                productImage.src = product.getElementsByTagName('image')[0].textContent;
                productImage.alt = productName;
                productNameElement.textContent = productName;
                productPrice.textContent = `$${product.getElementsByTagName('price')[0].textContent}`;
                productDescription.textContent = product.getElementsByTagName('description')[0].textContent;
            } else {
                console.error('Product not found:', productName);
            }
        } catch (error) {
            console.error('Error loading product details:', error);
        }
    }

    // Rest of your existing code for quantity controls and cart functionality...
    // Just update the cart addition to use name instead of id:

    // Initial load
    loadProductDetails();
    });