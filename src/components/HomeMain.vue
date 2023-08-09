<template>
  <div class="flex items-end justify-start h-screen w-screen pl-8 pr-12 absolute">
    <img v-if="isDS" class="w-1/6 pt-2 opacity-40 pb-16" :src="require('../assets/nettifySignTM-highres.png')" alt="Nettify Sign">
    <img v-else class="w-1/6 p-2 opacity-40 pb-[6%]" :src="require('../assets/nettifyIPTV TM-highres-white.png')"
      alt="Nettify IPTVCast">
  </div>
  <div class="px-8 min-h-full min-w-full flex justify-center lg:text-3xl">
    <div v-if="sc.msg && sc.msg.confirmed === false"
      class="flex flex-col bg-black bg-opacity-80 w-1/2 items-center p-3 lg:p-8 rounded-md">
      <div class="text-bold">{{ sc.msg.messageKey }} </div>
      <p v-for="str in msg" :key="str" class="text-center">
        {{ str }}
      </p>
      <button @click="confirmMsg"
        class="bg-[#0054A6] w-[10vw] p-1 rounded-sm m-3 focus:animate-pulse outline-sky-600 lg:py-4">OK</button>
    </div>
  </div>
</template>


<script lang="ts">
import {defineComponent} from 'vue';
import {HomeScreen, TvScreen} from '@/dataStructures'
import SpatialNavigation from 'spatial-navigation-ts';
import ScreenManager from '@/utils/screens';

export default defineComponent({
  name: "HomeMain",
  data() {
    return {
      sc: {} as HomeScreen,
      msg: [] as string[]
    }
  },
  computed: {
    isDS() {
      const screens = ScreenManager.getAllScreen();
      if (!screens) return false;

      return screens?.length < 2;


    }
  },
  methods: {
    loadScreens() {
      const data = localStorage.getItem('tvScreens') ? localStorage.getItem('tvScreens') : {} as any;
      return JSON.parse(data) as TvScreen[]
    },
    getHomeData() {
      const screen = this.loadScreens()

      const sc = screen.find(d => d.key === 'Home') as HomeScreen;
      this.sc = sc

      this.msg = sc.msg?.message ? sc.msg.message.split('.') : []
    },
    confirmMsg() {
      const screen = this.loadScreens();

      const sc = { ...this.sc }
      sc.msg ? sc.msg.confirmed = true : undefined;
      console.log(sc);
      const scs = [...screen].filter(s => s.key !== 'Home')
      scs.unshift(sc as TvScreen)
      // console.log(scs)
      localStorage.setItem('tvScreens', JSON.stringify(scs))
      SpatialNavigation.uninit()
      this.sc = sc;
      this.$router.push('/home')
    }
  },
  mounted() {
    this.getHomeData()
    if (this.sc.msg && this.sc.msg.confirmed === false) {
      setTimeout(() => {
        SpatialNavigation.init()
        SpatialNavigation.add({
          selector: 'button'
        });
        SpatialNavigation.makeFocusable();
        SpatialNavigation.focus();
      }, 300)
    }
  }
})

</script>