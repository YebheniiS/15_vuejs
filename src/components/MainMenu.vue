<template>
    <div class="flex items-center justify-center">
        <ul v-for="btn in items" :key="btn.scKey" class="flex">
            <li @keyup.enter="switchScreen(btn.scKey)" @click="switchScreen(btn.scKey)" :id="btn.scKey" class="btn cursor-pointer">
                <i v-bind:class="btn.icon" class="icon"></i>
                {{ btn.caption }}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SpatialNavigation from 'spatial-navigation-ts';
import { HomeScreen, MenuLink } from '@/dataStructures';

export default defineComponent({
    name: 'MainMenu',
    props: {
        items: {
            type: Array as () => MenuLink[] | null | undefined
        },
        sc: HomeScreen
    },
    created() {
        const selector = localStorage.getItem('lastFocused')
        
        setTimeout( () => {
            SpatialNavigation.init()
            SpatialNavigation.add({
                selector: '.btn, li'
            });
            SpatialNavigation.makeFocusable();
            if (!selector) return
            SpatialNavigation.focus('#' + selector)
            this.unFocus(selector)
        }, 300)
    },
    beforeUnmount() {
        SpatialNavigation.uninit()
    },
    methods: {
        unFocus(selector: string) {
            const elem = document.getElementById(selector)
            if (!elem) return
            
            setTimeout(() => {
                localStorage.removeItem('lastFocused');
                elem ? elem.blur(): undefined
            }, 5000)
        },
        switchScreen(screen: string | undefined) {
            if (!screen) return
            localStorage.setItem('lastFocused', screen);
            this.$emit('switchScreen', screen)
        }
    }
})

</script>


<style scoped>



.btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    color: lightgray;
    border: none;
    border-radius: 5px;
    width: 90px;
    height: 60px;
    margin: 5px;
    text-align: center;
    font-size: 10px;
    font-weight: bold;
    text-transform: uppercase;
    transition: all 0.3s ease-in-out;
    /* Set the fill color to white */
    -webkit-text-fill-color: white;
    /* Set the stroke color to black */
    /* Set the stroke width to 1px */

    text-shadow: 0 0 6px black, 0 0 3px black;
    transform-origin: bottom;
}

.btn:focus {
    color: gold;
    cursor: pointer;
    outline: none;
    transform: scale(1.8);
}

.icon {
    font-size: 24px;
    margin-bottom: 5px;
    color: lightgrey;
}

.icon:focus {
    color: gold;
}

@media (min-width: 1024px) {
    .btn {
        transform: scale(1.2);
        transform-origin: bottom;
        width: 200px;
        height: 120px;
        margin: 10px;
        font-size: 20px;
    }

    .btn:focus {
        transform: scale(1.8);
        transform-origin: bottom;
    }

    .icon {
        font-size: 48px;
        margin-bottom: 10px;
    }
}
</style>