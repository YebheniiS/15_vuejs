<template>
    <div v-if="sc?.textHtml" class="flex justify-between mr-[10%] ml-[3%] -mt-[5%] h-[75vh] lg:text-2xl">
        <div v-if="pathName !== ''" class="flex flex-col items-start">
            <div class="mt-0 bg-opacity-60 rounded-md p-1 text-shadow capitalize">
                <i class="fa-solid fa-house-chimney"></i> {{ `> ${pathName} > ${sc.heading}` }}
            </div>
        </div>
        <div v-if="sc.heading" class="bg-black bg-opacity-60 p-3 mt-8 rounded-md w-1/3 text-sm lg:text-3xl h-fit lg:px-4">
            <img class="px-16 my-2 w-full lg:my-4 lg:px-32" v-if="isHotelInfo.val" :src="hd.logoUrl" alt="Hotel Logo">
            <div :class="isHotelInfo.css">{{ sc.heading }}</div>
            <div class="text-justify lg:leading-tight">
                {{ sc.textHtml }}
            </div>
            <div class="flex justify-between items-center pt-4 lg:pt-6 text-xl lg:text-4xl" v-if="!isHotelInfo.val">
                <div class="capitalize py-1 lg:text-3xl">IDR {{ item.price }} K</div>
                <div class="grid grid-cols-3 gap-2 h-fit w-fit place-items-center px-2 lg:py-1 ml-1 rounded-sm">
                    <button @click="basket.addItem(item)"
                        class="text-blue-600 opacity-50 focusable focus:outline-none focus:opacity-100">
                        <i class="fa fa-plus-circle p-[2px]" aria-hidden="true"></i></button>
                    <div class="font-bold text-xl lg:text-3xl">{{ basket.countItem(item) }}</div>
                    <button @click="basket.removeItem(item)"
                        class="rounded-full opacity-50 focusable focus:outline-none focus:opacity-100"
                        :class="basket.countItem(item) === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600'"
                        :disabled="basket.countItem(item) === 0"><i class="fa fa-minus-circle p-[2px]" aria-hidden="true"></i></button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DetailScreen, DiningItem, Header, TvScreen } from '@/dataStructures';
import SpatialNavigation from 'spatial-navigation-ts';
import Basket from '@/api/baskets';

export default defineComponent({
    name: 'DetailPage',
    data() {
        return {
            sc: {} as DetailScreen,
            hd: {} as Header,
            pathName: '',
            basket: new Basket,
        }
    },
    computed: {
        isHotelInfo() {
            const val = location.hash.includes('hotelInfo');
            console.log('is hotel info? ' + val);
            const css = val ? 'font-bold lg:my-2 capitalize' : 'font-bold lg:my-2 capitalize text-xl lg:text-4xl py-1';
            return {
                val,
                css,
            };
        },
        item() {
            const item = localStorage.getItem('diningItem');
            return JSON.parse(item!) as DiningItem;
        }
    },
    methods: {
        loadScreens() {
            const data = localStorage.getItem('tvScreens') ? localStorage.getItem('tvScreens') : {} as any;
            const screens = JSON.parse(data) as TvScreen[]
            console.log(screens)
            return screens
        },
        loadHeader() {
            const data = localStorage.getItem('header') ? localStorage.getItem('header') : {} as any;
            const header = JSON.parse(data) as Header
            console.log(header)
            this.hd = header
        },
        loadRoute() {
            const route = this.$route
            console.log('examining route')
            const str = route.matched.map(r => r.name)
            console.log(str)
            this.pathName = str.join('')
        },
        getScreen() {
            const screen = this.loadScreens();

            let sk = this.$route.path.substring(1)
            const current = this.$route.params
            current.page ? sk = current.page as string : current.item ? sk = current.item as string : undefined;

            console.log('screen key: ', sk);
            const sc = screen.find(d => d.key === sk);
            this.sc = sc as DetailScreen;
        },
        goBack() {
            this.$router.back();
        }
    },
    mounted() {
        this.getScreen()
        this.loadHeader()
        this.loadRoute()
        window.addEventListener('popstate', this.goBack)
    },
    created() {
        setTimeout(() => {
            SpatialNavigation.add({
                selector: 'button',
            })
            SpatialNavigation.init()
            SpatialNavigation.focus()
        }, 300)
    },
    beforeUnmount() {
        window.removeEventListener('popstate', this.goBack)
        SpatialNavigation.uninit()
    },
})
</script>

<style scoped>

button:focus-within i {
    border-radius: 9999px;
    background-color: rgb(229 231 235);
}
.text-shadow {
    -webkit-text-fill-color: white;
    /* Set the stroke color to black */
    /* Set the stroke width to 1px */

    text-shadow: 0 0 3px black;
}
</style>