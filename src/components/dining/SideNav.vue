<template>
    <div class="flex flex-col justify-between w-1/4 h-[85vh] pl-8 pr-2 bg-black bg-opacity-60 rounded-r-md lg:text-3xl">
        <div class="flex flex-col">
            <div class="p-2 text-lg lg:text-4xl lg:p-4 font-bold">Menus</div>
            <ul>
                <li v-for="cat in categories" :key="cat.key" @focus="changeCat(cat.key)" @click="changeCat(cat.key)"
                    :id="cat.key" :data-sn-right="moveTo(0)"
                    class="focusable focus:bg-blue-600 outline-none focus:scale-110 ease-in-out p-2 lg:p-4 lg:my-4 min-w-full capitalize cursor-pointer">
                    {{ cat.name }}</li>
            </ul>
            <div class="border-b w-full"></div>
        </div>
        <div class="flex flex-col mb-5">
            <div class="lg:py-">Total:
                <span v-if="basket.items && basket.items.length > 0">
                    IDR {{ basket.getTotalPrice() }} K
                </span>
            </div>
            <button @click="reviewOrder" id="checkout" class="focusable py-2 bg-blue-700 lg:py-4">Review Order</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DiningCategory, DiningItem } from '@/dataStructures';
import SpatialNavigation from 'spatial-navigation-ts';
import ItchIO from '@/utils/io';
import Basket from '@/api/baskets';


export default defineComponent({
    name: 'SideNav',
    data() {
        return {
            tvid: ''
        }
    },
    props: {
        categories: {
            type: Array as () => DiningCategory[],
            required: true
        },
        basket: {
            type: Basket,
            required: true
        },
        items: {
            type: Array as () => DiningItem[],
            required: true
        }
    },
    methods: {
        changeCat(key?: string) {
            const cats = [...this.categories]

            cats.forEach(cat => {
                const elem = document.getElementById(cat.key!) as HTMLLIElement;
                cat.key === key ? elem.classList.add('underline') : elem.classList.remove('underline');
            })

            this.$emit('changeCat', key)
        },
        reviewOrder() {
            SpatialNavigation.uninit()
            this.$router.push('/dining/review')
        },
        moveTo(index: number) {
            const obj = this.items[index]

            const selector = '#' + obj.scKey + index;
            return selector
        },
    },
    mounted() {
        this.tvid = ItchIO.getDeviceId()
    },
    created() {
        setTimeout(() => {
            SpatialNavigation.focus()
        }, 300)
    }
})

</script>

<style scoped>
.qrcode {
    display: inline-block;
    font-size: 0;
    margin-bottom: 0;
    position: relative;
    width: 80px;
    height: 80px;
}

.qrcode__image {
    background-color: #fff;
    border: 0.25rem solid #fff;
    border-radius: 0.25rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.25);
    height: 19%;
    left: 50%;
    overflow: hidden;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 19%;
}
</style>