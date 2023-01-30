Vue.component('product', {
    template: `
        <div class="product">
            <div class="product-image">
                <img :alt="altText" :src="image"/>
            </div>

            <div class="product-info">

                <h1>{{ title }}</h1>
                <p>{{ description }}</p>
                 <p>Shipping: {{ shipping }}</p>
                <p v-if="inStock">In stock</p>
                <p
                    v-else
                    :class="{ lineThrough: !inStock }"
                >
                    Out of Stock
                </p>
                <span v-if="sale">On sale</span>
                <hr>

                <product-details :details="details"></product-details>

                <span>Sizes:</span>
                <ul>
                    <li v-for="size in sizes">{{ size }}</li>
                </ul>

                <span>Colors:</span>
                <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor: variant.variantColor }"
                    @mousedown="updateProduct(index)"
                >
                </div>

                <button
                        @click="addToCart"
                        :disabled="!inStock"
                        :class="{ disabledButton: !inStock }"
                >
                    Add to cart
                </button>
                <button @click="removeFromCart">Remove from cart</button>

            </div>
        </div>
    `,
    props: {
        premium: {
            type: Boolean,
            required: true,
        },
        cart: {
            type: Number
        }
    },
    data() {
        return {
            product: 'Socks',
            brand: 'Vue Mastery',
            description: 'A pair of warm, fuzzy socks',
            selectedVariant: 0,
            altText: 'A pair of socks',
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                    onSale: false,
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 4,
                    onSale: true,
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        removeFromCart(){
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
        },
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity;
        },
        sale() {
            return this.variants[this.selectedVariant].onSale;
        },
        shipping() {
            if (this.premium) {
                return 'Free'
            } else {
                return 2.99
            }
        },
    },
})

Vue.component('product-details', {
    template: `
    <div class="product-details">
        <span>Details:</span>
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>   
    </div>
    `,
    props: {
        details: {
            type: Array,
        }
    },
})

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        deleteCart(id) {
            if(this.cart.includes(id)) {
                this.cart.splice(this.cart.indexOf(id), 1)
            }
        }
    },
})