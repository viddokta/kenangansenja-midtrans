document.addEventListener('alpine:init', () => {
    Alpine.data('products', () => ({
        items: [{
                id: 1,
                name: 'Robusta Dampit',
                img: 'img2.png',
                price: '120000'
            },
            {
                id: 2,
                name: 'Robusta Puntang',
                img: 'img3.png',
                price: '85000'
            },
            {
                id: 3,
                name: 'Robusta Malabar',
                img: 'img4.png',
                price: '70000'
            },
            {
                id: 4,
                name: 'Robusta Solok',
                img: 'img5.png',
                price: '50000'
            },
            {
                id: 5,
                name: 'Robusta Tolu Batak',
                img: 'img6.png',
                price: '129000'
            },
            {
                id: 6,
                name: 'Robusta Jawa Ciwidey',
                img: 'img7.png',
                price: '57000'
            },
            {
                id: 7,
                name: 'Robusta Lintong',
                img: 'img8.png',
                price: '65000'
            },
            {
                id: 8,
                name: 'Robusta Flores',
                img: 'img9.png',
                price: '57000'
            },
            {
                id: 9,
                name: 'Robusta Mt. Ijen',
                img: 'img10.png',
                price: '52000'
            },
        ],
    }));

    Alpine.store('cart', {
        items: [],
        total: 0,
        quantity: 0,
        add(newItem) {
            const existingItem = this.items.find(item => item.id === newItem.id);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                this.items.push({
                    ...newItem,
                    quantity: 1
                });
            }

            this.quantity++;
            this.total += newItem.price;
        },
        remove(itemId) {
            const index = this.items.findIndex(item => item.id === itemId);

            if (index !== -1) {
                const removedItem = this.items[index];

                if (removedItem.quantity > 1) {
                    removedItem.quantity--;
                } else {
                    this.items.splice(index, 1);
                }

                this.quantity--;
                this.total -= removedItem.price;
            }
        },
    });
});

// Konversi ke Rupiah
const rupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(number);
};

document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('checkoutForm');
    const checkoutButton = document.getElementById('checkout-button');
    const notificationElement = document.getElementById('notification');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            return;
        }

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const items = JSON.parse(document.getElementById('items').value);

        const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('items', JSON.stringify(items));

        try {
            const response = await fetch('../php/placeOrder.php', {
                method: 'POST',
                body: formData,
            });


            const result = await response.json();

            if (result.token) {
                // Process payment
                snap.pay(result.token, {
                    onSuccess: function(result) {
                        showNotification('Pembayaran sukses: ' + JSON.stringify(result));
                        // Additional logic or page redirection after successful payment
                    },
                    onPending: function(result) {
                        showNotification('Pembayaran tertunda: ' + JSON.stringify(result));
                        // Additional logic or page redirection for pending payment
                    },
                    onError: function(result) {
                        showNotification('Pembayaran gagal: ' + JSON.stringify(result));
                        // Additional logic or page redirection for failed payment
                    },
                    onClose: function() {
                        showNotification('Pop-up ditutup tanpa menyelesaikan pembayaran');
                    },
                });
            } else {
                // Handle error, e.g., display a message to the user
                showNotification('Gagal mendapatkan token: ' + JSON.stringify(result));
            }
        } catch (error) {
            console.error(error.message);
            // Handle error if any
        }
    });

    form.addEventListener('input', function() {
        console.log('Form input berubah');
        checkoutButton.disabled = !(isInputFilled('name') && isInputFilled('email') && isInputFilled('phone'));
    });

    function isInputFilled(inputId) {
        const input = document.getElementById(inputId);
        const isFilled = input.value.trim() !== '';
        console.log(`Input ${inputId} terisi: ${isFilled}`);
        return isFilled;
    }

    function showNotification(message) {
        notificationElement.textContent = message;
        // Or use another method, such as adding a new HTML element to display the notification
    }
});
