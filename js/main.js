let eventBus = new Vue()

Vue.component('product', {
    template: `
        <div id="dragImage" class="product">
            <div class="product-image">
                <img  :alt="altText"
                      :src="image"
                      @mousedown="openDetails"/>
                <div v-show="detailsVisibility">Details: 
                    <ul>
                        <li v-for="detail in details">{{ detail }}</li>
                    </ul>
                </div>
            </div>

            <div class="product-info">

                <h1>{{ title }}</h1>
                <p>{{ description }}</p>
                <p v-if="inStock">In stock</p>
                <p
                    v-else
                    :class="{ lineThrough: !inStock }"
                >Out of Stock</p>
                <span v-if="sale">On sale</span>
                <hr>
                
                <product-info-tabs :shipping="shipping" :details="details"></product-info-tabs>
                
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
                    @mousedown="updateProduct( index)"
                ></div>
                
                <button
                        @click="addToCart"
                        :disabled="!inStock"
                        :class="{ disabledButton: !inStock }"
                >Add to cart</button>
                <button @click="removeFromCart">Remove from cart</button>
                
                <product-tabs :reviews="reviews"></product-tabs>
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
            reviews: [],
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
            detailsVisibility: false,
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
        openDetails() {
            this.detailsVisibility = !this.detailsVisibility
        }
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
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
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

Vue.component('product-review', {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>

            <p>
                <label for="name">Name:</label>
                <input id="name" v-model="name" placeholder="name">
            </p>
            
            <p>
                <label for="review">Review:</label>
                <textarea id="review" v-model="review"></textarea>
            </p>
            
            <p>
                <p>Would you recommend this product?</p>
                
                <input v-model="recommend" class="radioRec" type="radio" id="choice1"
                    name="recommend" value="yes">
                <label for="choice1">Yes</label>
                
                <input v-model="recommend" class="radioRec" type="radio" id="choice2"
                    name="recommend" value="no">
                <label for="choice2">No</label>
            </p>
            
            <p>
                <label for="rating">Rating:</label>
                <select id="rating" v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
                </select>
            </p>
            
            <p>
                <input type="submit" value="Submit"> 
            </p>
        </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            recommend: null,
            rating: null,
            errors: [],
        }
    },
    methods:{
        onSubmit() {
            if(this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    recommend: this.recommend,
                    rating: this.rating,
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.recommend = null
                this.rating = null
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.recommend) this.errors.push("Recommend required.")
                if(!this.rating) this.errors.push("Rating required.")
            }
        }

    },
})

Vue.component('product-tabs', {
    template: `
     <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <ul>
           <li v-for="review in reviews">
           <p>{{ review.name }}</p>
           <p>Rating: {{ review.rating }}</p>
           <p>Recommend: {{ review.recommend }}</p>
           <p>{{ review.review }}</p>
           </li>
         </ul>
       </div>
       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
     </div>
    `,
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    },
})

Vue.component('product-info-tabs', {
    template: `
        <div>   
            <ul>
                <span class="tab"
                    :class="{ activeTab: selectedTab === tab }"
                    v-for="(tab, index) in tabs"
                    @click="selectedTab = tab"
                >{{ tab }}</span>
            </ul>
            
            <div v-show="selectedTab === 'Shipping'">
                <p>Shipping: {{ shipping }}</p> 
            </div>
            
            <div v-show="selectedTab === 'Details'">
                <product-details :details="details"></product-details>
            </div>
        </div>
    `,
    props: {
        shipping: {
            type: Function,
            required: false
        },
        details: {
            type: Array,
            required: true,
        }
    },
    data() {
        return {
            tabs: ['Shipping', 'Details'],
            selectedTab: 'Shipping'
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
        },
    },
})
