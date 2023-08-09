<template>
    <div v-if="!$route.params.page" class="flex justify-center lg:text-2xl h-[80vh] lg:-h-[80vh]">
        <ul class="grid grid-cols-2 gap-4 lg:gap-16 place-items-start p-2 overflow-y-auto" ref="itemList">
            <li v-for="item in items" :key="item.scKey" ref="items"
                class="p-[2px] m-4 h-fit w-auto bg-black bg-opacity-60 rounded-sm focus:z-50 cursor-pointer zoomIn">
                <div v-if="item.icon" class="w-[310px] lg:w-[620px]">
                    <div class="flex flex-col">
                        <img class="shadow-img aspect-[20/9] -mb-10 lg:-mb-16 rounded-sm" :src="item.icon"
                            :alt="item.scKey">
                        <div class="flex justify-between items-center">
                            <button @click="goToDetail(item)" :id="genDomId(item)"
                                class="text-xs text-shadow border border-gray-200 focus:border-2 rounded-full px-2 mx-2 focusable focus:outline-none focus:bg-blue-600 lg:text-xl lg:border-2 lg:px-4 lg:py-1"
                                :data-sn-down="'#' + genDomId(item) + 'add'" 
                                :data-sn-left="moveLeft(item)"
                                :data-sn-up="moveUp(item)" @focus="scrollToTop(genDomId(item))">Show
                                Detail</button>
                            <div class="mt-2 mb-3 text-shadow px-2 lg:px-6 flex max-w-fit justify-end lg:text-3xl">
                                {{ item.price ? 'IDR ' + item.price + ' K' : 'Free' }}</div>
                        </div>
                    </div>
                    <div class="flex justify-between items-center lg:pt-4">
                        <div class="capitalize py-1 lg:text-3xl">{{ item.caption }}</div>
                        <div v-if="item.price"
                            class="grid grid-cols-3 gap-2 h-fit w-fit place-items-center px-2 lg:py-1 ml-1 rounded-sm">
                            <button @click="basket.addItem(item)"
                                class="text-blue-600 rounded-full opacity-50 focusable focus:outline-none focus:opacity-100"
                                :id="genDomId(item) + 'add'" :data-sn-up="'#' + genDomId(item)"
                                :data-sn-down="moveTo(item, 2)"
                                :data-sn-left="moveLeft(item)"
                                >
                                <i class="fa fa-plus-circle p-[2px]"
                                    aria-hidden="true"></i></button>
                            <div class="font-bold text-xl lg:text-3xl">{{ basket.countItem(item) }}</div>
                            <button @click="basket.removeItem(item)"
                                class="rounded-full opacity-50 focusable focus:outline-none focus:opacity-100"
                                :data-sn-up="'#' + item.scKey + 'detail'"
                                :class="basket.countItem(item) === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600'"
                                :disabled="basket.countItem(item) === 0"><i class="fa fa-minus-circle p-[2px]"
                                    aria-hidden="true"></i></button>
                        </div>

                    </div>
                    <div class="desc text-[10px] lg:text-xl">{{ item.description }}</div>
                </div>
                <div v-else class="px-2 lg:px-6">
                    <div class="flex flex-row justify-between w-full bg-blue-800 rounded-sm py-1 px-3 my-1">
                        <div class="capitalize py-1 lg:text-3xl">{{ item.caption }}</div>
                        <div class="lg:text-3xl flex flex-col">{{ item.price ? 'IDR ' + item.price + ' K' : 'Free' }}</div>
                    </div>
                    <div class="flex min-w-full justify-end">
                        <div class="grid grid-cols-3 gap-2 h-fit w-fit place-items-center px-2 lg:py-1 ml-1 rounded-sm">
                            <button @click="basket.addItem(item)"
                                class="text-blue-600 opacity-50 focusable focus:outline-none focus:opacity-100"
                                :id="genDomId(item)"
                                :data-sn-down="moveTo(item, 2)"
                                :data-sn-left="moveLeft(item)"
                                @focus="scrollToTop(genDomId(item))"
                                ><i class="fa fa-plus-circle p-[2px]" aria-hidden="true"></i></button>
                            <div class="font-bold text-xl lg:text-3xl">{{ basket.countItem(item) }}</div>
                            <button @click="basket.removeItem(item)"
                                class="rounded-full opacity-50 focusable focus:outline-none focus:opacity-100"
                                :class="basket.countItem(item) === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600'"
                                :disabled="basket.countItem(item) === 0"><i class="fa fa-minus-circle p-[2px]"
                                    aria-hidden="true"></i></button>
                        </div>
                    </div>
                    <div class="desc text-[10px] line-clamp-2 ease-in-out lg:text-xl">{{ item.description }}</div>

                </div>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {DiningCategory, DiningItem} from '@/dataStructures';
import Basket from '@/api/baskets';


export default defineComponent({
    name: 'MenuItem',
    props: {
        items: {
            type: Array as () => DiningItem[],
            required: true
        },
        categories: {
            type: Array as () => DiningCategory[],
            required: true
        },
        basket: {
            type: Basket,
            required: true
        }
    },
    methods: {
        goToDetail(item: DiningItem) {
            const sk = `${this.$route.path}/${item.category}/${item.scKey}`;
            console.log('switching to: ' + sk);
            localStorage.setItem('diningItem', JSON.stringify(item));
            this.$router.push(sk)
        },
        moveTo(item: DiningItem, offset: number) {
            if (this.items.length % 2 !== 0 && this.items.indexOf(item) === this.items.length - 2) return '#' + this.items[this.items.length - 1].scKey + (this.items.length - 1);

            const index = this.items.indexOf(item) + offset;
            const obj = this.items[index];
            if (!obj) {
                const currentCat = this.categories.findIndex(cat => cat.key === item.category)
                const nextCat = currentCat + 1;
                if (nextCat > this.categories.length - 1) return '#checkout'
                return '#' + this.categories[nextCat].key

            }

            return '#' + obj.scKey + index
        },
        moveLeft(item: DiningItem) {
            const index = this.items.indexOf(item);
            if (index === 0) return '#' + item.category;
            if (index % 2 === 0) return '#' + item.category;
        },
        moveUp(item: DiningItem) {
            const index = this.items.indexOf(item);
            if (index < 2) return '#' + item.category;
        },
        genDomId(item: DiningItem) {
            return item.scKey! + this.items.indexOf(item);
        },
        scrollToTop(domID: string) {
            const item = document.getElementById(domID) as HTMLLIElement;

            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

</script>

<style scoped>
ul {
    transform: translateZ(0);
    scroll-behavior: smooth;
    will-change: transform;
}


.desc {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.zoomIn:focus-within .desc {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
}


button:focus-within i {
    border-radius: 9999px;
    background-color: rgb(229 231 235);
}

@media (min-width: 1024px) {
    ::-webkit-scrollbar {
        width: 8px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
        background: #f3f3f3;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
        border-radius: 0.375rem
            /* 6px */
        ;
        --tw-bg-opacity: 0.6;
        background-color: rgb(55 65 81 / var(--tw-bg-opacity));
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
        border-radius: 0.375rem
            /* 6px */
        ;
        --tw-bg-opacity: 0.5;
        background-color: rgb(17 24 39 / var(--tw-bg-opacity));
    }
}


.text-shadow {
    -webkit-text-fill-color: white;
    /* Set the stroke color to black */
    /* Set the stroke width to 1px */

    text-shadow: 0 0 4px black;
}
</style>