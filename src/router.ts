import { createRouter, createWebHashHistory } from 'vue-router';
import HomeMain from '@/components/HomeMain.vue';
import DetailPage from '@/components/DetailPage.vue';
import SubMenu from '@/components/SubMenu.vue';
import DiningPage from '@/components/dining/DiningPage.vue';
import OrderPreview from './components/dining/OrderPreview.vue';
import LiveTV from '@/components/LiveTV.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeMain
    },
    {
        path: '/connectDevice',
        name: 'Connect Device',
        component: DetailPage
    },
    {
        path: '/hotelInfo',
        name: 'Hotel Info',
        component: SubMenu,
        children: [
            {
                path: ':page',
                component: DetailPage
            }
        ]
    },
    {
        path: '/apps',
        name: 'Applications List',
        component: SubMenu
    },
    {
        path: '/dining',
        name: 'In Room Dinings',
        component: DiningPage,
        children: [
            {
                path: 'review',
                name: 'Review Order',
                component: OrderPreview,
            }
        ]
    },
    {
        path: '/dining/:cat/:item',
        name: 'Dining > Item Detail',
        component: DetailPage
    },
    {
        path: '/liveTv',
        name: 'Live TV',
        component: LiveTV
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router