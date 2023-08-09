<template>
    <div class="absolute flex items-center justify-center min-w-full min-h-full backdrop-blur-sm lg:text-2xl">
        <div class="bg-gray-200 min-w-[60%] max-h-[80%] rounded-md text-gray-800">
            <div class="text-center text-xl lg:text-3xl my-2">Review and confirm</div>
            <table class="min-w-full">
                <tr>
                    <th class="pl-3 text-left">Item</th>
                    <th class="text-left px-1">Price</th>
                    <th>Quantity</th>
                    <th class="text-left px-1">Total</th>
                </tr>
                <tr v-for="item in basket.getItemSummary()" :key="item.scKey" class="border-b border-dotted border-gray-800">
                    <th class="pt-1 font-light pl-3 border-b-1 text-left capitalize">{{ item.caption }}</th>
                    <th class="pt-1 font-normal px-1 border-b-1 text-left">IDR {{ item.price }}</th>
                    <th class="pt-1 font-normal px-1 border-b-1">{{ basket.countItem(item) }}</th>
                    <th class="pt-1 font-normal px-1 border-b-1 text-left">IDR {{ basket.countItem(item) * item.price! }}</th>
                </tr>
                <tr class="my-2">
                    <th class="text-sm lg:text-lg px-1 italic font-normal"> All the prices are in thousand Indonesian rupiah</th>
                    <th class="text-right">Sub Total</th>
                    <th></th>
                    <th class="text-left px-1">IDR {{ basket.getTotalPrice()}}</th>
                </tr>
                <tr class="my-2">
                    <th></th>
                    <th class="text-right">Service + Tax</th>
                    <th></th>
                    <th class="text-left px-1">IDR {{ (basket.getTotalPrice() * 0.21).toFixed(2)}}</th>
                </tr>
                <tr class="my-2">
                    <th class=""></th>
                    <th class="text-right">Grand Total</th>
                    <th></th>
                    <th class="text-left px-1">IDR {{ ((basket.getTotalPrice() * 0.21) + basket.getTotalPrice()).toFixed(2)}}</th>
                </tr>
            </table>
            <div class="flex justify-end px-2 my-4">
                <button class="p-2 lg:p-4 bg-emerald-600 rounded-sm btn focus:animate-pulse">Confirm & Order</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Basket from '@/api/baskets';
import SpatialNavigation from 'spatial-navigation-ts';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'OrderPreview',
    data() {
        return {
            basket: new Basket()
        }
    },
    methods: {
        confirm() {
            this.$emit('confirm');
        },
        goBack() {
            this.$emit('reviewState');
        }
    },
    mounted() {
        window.addEventListener('popstate', this.goBack)
    },
    created() {
        setTimeout(() => {
            SpatialNavigation.add({
                selector: '.btn',
                tabIndexIgnoreList: 'a, input, select, textarea, iframe, [contentEditable=true]',
                //straightOverlapThreshold: 1.0
            });
            SpatialNavigation.makeFocusable()
            SpatialNavigation.init()
            SpatialNavigation.focus()
        }, 300)
    },
    beforeUnmount() {
        window.removeEventListener('popstate', this.goBack)
        setTimeout(() => {
            SpatialNavigation.add({
                selector: '.focusable',
                tabIndexIgnoreList: 'a, input, select, textarea, iframe, [contentEditable=true]',
                //straightOverlapThreshold: 1.0
            });
            SpatialNavigation.makeFocusable()
            SpatialNavigation.init()
            SpatialNavigation.focus()
        }, 300)
    }
});
</script>