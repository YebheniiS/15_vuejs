<template>
    <div class="flex w-full h-full">
        <SideNav :categories="categories" :basket="basket" :items="items" @changeCat="switchCategorie"/>
        <div class="w-full h-full">
            <MenuItem :categories="categories" :items="items" :basket="basket" :category="currentCat" :key="currentCat.key"/>
        </div>
    </div>
    <router-view v-if="$router.currentRoute.value.path === '/dining/review' || '/roomService/review'">
    </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SideNav from './SideNav.vue';
import { DiningCategory, DiningItem, DiningPage, TvScreen } from '@/dataStructures';
import MenuItem from './MenuItem.vue';
import Basket from '@/api/baskets';
import SpatialNavigation from 'spatial-navigation-ts';

export default defineComponent({
    name: 'DiningPage',
    components: {
    SideNav,
    MenuItem
},
    data() {
        return {
            categories: [] as DiningCategory[],
            items: [] as DiningItem[],
            currentCat: {} as DiningCategory,
            sc: {} as DiningPage,
            basket: {} as Basket,
        }
    },
    methods: {
        loadScreens() {
            const data = localStorage.getItem('tvScreens') ? localStorage.getItem('tvScreens') : {} as any;
            const screens =  JSON.parse(data) as TvScreen[]
            console.log(screens)
            return screens
        },
        getScreen() {
            const screen = this.loadScreens();

            let sk = this.$route.path.substring(1)

            console.log('screen key: ', sk);
            this.sc = screen.find(d => d.key === sk) as DiningPage;
            this.categories = this.sc.categories as DiningCategory[];
            this.items = this.sc.items as DiningItem[];
        },
        switchCategorie(cat?: string) {
            console.log('Swicthing category to: ' + cat);
            this.currentCat = this.categories.find(d => d.key === cat) as DiningCategory;
            this.items = [...this.sc.items as DiningItem[]].filter(i => i.category === cat)
        }
    },
    mounted() {
        this.basket = new Basket();
        this.getScreen();
        const defCat = this.categories[0].key
        this.switchCategorie(defCat)
    },
    created() {
        setTimeout(() => {
            SpatialNavigation.add({
                selector: '.focusable',
                tabIndexIgnoreList: 'a, input, select, textarea, iframe, [contentEditable=true]',
                //straightOverlapThreshold: 1.0
            });
            SpatialNavigation.makeFocusable()
            SpatialNavigation.init()
        }, 300)
    },
    beforeUnmount() {
        SpatialNavigation.uninit();
    }
})

</script>