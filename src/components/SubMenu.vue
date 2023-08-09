<template>
    <div v-if="!$route.params.page" class="flex justify-center lg:text-2xl">
        <ul class="grid grid-cols-2 gap-5 lg:gap-16 place-items-center h-[78vh] lg:-h-[80vh] p-2 overflow-y-auto">
            <li v-for="item in sc?.items" :key="item.scKey" class="p-2 m-4 w-[330px] lg:w-[660px]">
                <div @keyup.enter="goToDetail(item.scKey)" @click="goToDetail(item.scKey)" class="flex zoomIn flex-col cursor-pointer">
                    <img class="static shadow-img aspect-[16/7] -mb-10 lg:-mb-16" :src="item.icon" :alt="item.scKey">
                    <div class="mt-2 text-shadow px-2 lg:px-6">{{ item.caption }}</div>
                </div>
            </li>
        </ul>
    </div>
    <router-view v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SpatialNavigation from 'spatial-navigation-ts';
import { SubMenuScreen, TvScreen } from '@/dataStructures';

export default defineComponent({
    name: "SubMenu",
    data() {
        return {
            sc: {} as SubMenuScreen,
        }
    },
    methods: {
        loadScreens() {
            const data = localStorage.getItem('tvScreens') ? localStorage.getItem('tvScreens') : {} as any;
            return JSON.parse(data) as TvScreen[]
        },
        getScreen() {
            const screen = this.loadScreens();
            const sk = this.$route.path.substring(1)
            console.log('screen key: ', sk);
            const sc = screen.find(d => d.key === sk);
            console.log(sc);
            this.sc = sc as SubMenuScreen;
        },
        goToDetail(subPath: string | undefined) {

            if (subPath?.startsWith('app:')) {
                return this.$router.push(subPath)
            }

            const sk = this.$route.path;
            this.$router.push(`${sk}/${subPath}`)
        }
    },
    mounted() {
        this.getScreen()
        setTimeout(() => {
            SpatialNavigation.init()
            SpatialNavigation.add({
                selector: '.zoomIn'
            });
            SpatialNavigation.makeFocusable();
            SpatialNavigation.focus();
        }, 300)

    },
    beforeUnmount() {
        SpatialNavigation.uninit()
    }
})
</script>

<style scoped>
ul {
    transform: translateZ(0);
    scroll-behavior: smooth;
    will-change: transform;
}

.zoomIn:focus {
    outline: none;
    transform: scale(1.1);
    transition: all 0.3s ease-in-out;

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
      @apply bg-gray-700 bg-opacity-60 rounded-md
    }
    
    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
      @apply bg-gray-900 bg-opacity-50 rounded-md
    } 
}


.text-shadow {
    -webkit-text-fill-color: white;
    /* Set the stroke color to black */
    /* Set the stroke width to 1px */

    text-shadow: 0 0 3px black;
}


.shadow-img {
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.6), 0 0 6px rgba(0, 0, 0, 0.6);
}
</style>