<template>
    <ContainerMain class="font-helvetica" v-if="unlocked" :sc="home" :key="home.type" :bg="bg" @playNext="nextContent">
        <HeaderMain v-if="home.showHeader" :data="header" :sc="home" />

        <router-view :key="home.key" />
        <div class="max-w-[100vw]">
            <MainMenu
                v-if="home.type === 'HomeScreen' && !(home as HomeScreen).msg || (home as HomeScreen).msg && (home as HomeScreen).msg?.confirmed === true"
                :items="(home as HomeScreen).items" @switchScreen="screenChange" />
            <FooterMain v-if="home.showFooter" :msg="footer" />
        </div>
    </ContainerMain>
    <div class="main-div bg-black flex flex-col justify-center items-center" v-else>
        <InitPage @initialize="fetchData" v-if="!registered" />
        <div class="lg:text-3xl" v-else>Launching Apps...</div>
    </div>
</template>

<script lang="ts">
import HeaderMain from "@/components/HeaderMain.vue";
import {defineComponent} from "vue";
import * as structure from "@/dataStructures";
import {BgBanner, BgBannerCached, HomeScreen, TvScreen} from "@/dataStructures";
import FooterMain from "@/components/FooterMain.vue";
import MainMenu from "@/components/MainMenu.vue";
import ContainerMain from "@/components/ContainerMain.vue";
import InitPage from "@/components/InitPage.vue";
import idb from '@/api/idb';
import ItchIO, {Platform} from "@/utils/io";
import ScreenManager from "@/utils/screens";
import signalr from "./api/signalr";
import {HubConnection} from "@microsoft/signalr";

export default defineComponent({
    name: 'App',
    components: {
        HeaderMain,
        FooterMain,
        MainMenu,
        ContainerMain,
        InitPage
    },
    watch: {
        $route() {
            const { path, params } = this.$route;
            const navs = {
                path: path === '/' ? '/' : path.substring(1),
                params: params.page ? params.page as string : params.item ? params.item as string : undefined
            }

            console.log("got navs request details")
            console.log(params);
            console.log(navs);

            if (navs.path.startsWith('app:')) {
                this.launchApp(navs.path.substring(4));
                return;
            }

            const screen = this.screens.find(s => (
                navs.params ? s.key === navs.params && s.type === 'DetailPage' :
                    s.key === navs.path && (s.type === 'SubMenu' || s.type === 'DetailPage' || s.type === 'DiningPage')
            ));

            if (screen) {
                console.log('screen change to: ')
                console.log(screen);
                this.bg = screen.background ? screen.background as BgBannerCached : this.bg;
                this.home = screen;
                return;
            }

            if (navs.path === 'home') {
                const scs = this.loadDataStore<structure.TvScreen[]>('tvScreens');
                this.screens = scs ? scs : [];
                if (ItchIO.getPlatform() === Platform.Other) this.nextContent();
                this.$router.back();
                return
            }

            if (navs.path === '/') {
                this.home = this.screens.find(s => s.key === 'Home') as structure.HomeScreen;
                if (!this.bgs.includes(this.bg)) {
                    this.bg = this.bgs[0]
                    return
                }
                return;
            }


            console.log(`Route path ${navs.path} or param ${navs.params} not recognized!`)
        }
    },
    data() {
        return {
            home: {} as structure.TvScreen,
            bgs: [] as structure.BgBannerCached[],
            screens: [] as structure.TvScreen[],
            header: {} as structure.Header,
            footer: {} as structure.Footer,
            bg: {} as structure.BgBannerCached,
            unlocked: false,
            ws: {} as HubConnection
        }
    },
    computed: {
        HomeScreen() {
            return HomeScreen
        },
        registered() {
            const platform = ItchIO.getPlatform()

            if (platform === Platform.Other) {
                return true
            }

            const reg = localStorage.getItem('registered')
            return reg === 'true';

        }
    },
    methods: {
        async fetchData() {
            const data = await fetch(ItchIO.configUrl());
            const appData = await data.json();
            console.log('fetching appData config')
            console.log(appData);
            // TODO: Save other BGs other than Home also to the IDB.
            for (let [key, val] of Object.entries(appData)) {
                if (key === 'bgContents') {
                    const bgs = [...val as BgBanner[]];
                    val = await Promise.all(bgs.map(async (b) => {
                        const storedB = ScreenManager.getBg(b.url) ? ScreenManager.getBg(b.url) : undefined;
                        if (storedB) {
                            const data = await this.loadFromBlob(storedB);
                            storedB.localUrl = data?.url;
                            storedB.etag = data?.etag;
                            return storedB
                        }
                        const bg = new structure.BgBannerCached(b)
                        const data = await this.loadFromBlob(bg)
                        bg.localUrl = data?.url;
                        bg.etag = data?.etag;
                        return bg
                    }));
                    console.log('updated backgrounds!')
                    console.log(val);
                }

                if (key === 'tvScreens') {
                    const scs = [...val as TvScreen[]];
                    val = await Promise.all(scs.map(async (s) => {
                        const bg = new structure.BgBannerCached(s.background as BgBanner)
                        const data = await this.loadFromBlob(bg)
                        bg.localUrl = data?.url;
                        bg.etag = data?.etag;
                        s.background = bg
                        return s
                    }));
                    console.log('updated backgrounds!')
                    console.log(val);
                }

                this.storeData(key, val)

            }
            this.loadData();
        },
        loadDataStore<T>(key: string) {
            console.log('loading data with key: ' + key);
            const storeData = localStorage.getItem(key)
            if (!storeData) {
                return undefined;
            }
            const parsedData = JSON.parse(storeData);
            console.log(parsedData)
            return parsedData as T;

        },
        async fetchResource(url: string, etag?: string) {

            let response: Response;

            try {
                if (etag != null) {
                    const requestOptions = {
                        method: 'GET',
                        headers: {
                            // Add any other headers you need
                            'If-None-Match': etag!
                        },
                    };

                    console.log('current etag: ' + etag);
                    response = await fetch(url, requestOptions);

                }
                else {
                    response = await fetch(url);
                }

                if (response.status === 304 || response.status === 404 || !response.ok)
                    return {
                        etag: null,
                        blob: undefined,
                    };

                const blob = await response.blob()
                response.headers.forEach((val, name) => console.log(name, val))
                return {
                    blob: blob,
                    etag: response.headers.get('etag'),
                };
            }
            catch (err: any) {
                console.error('Network error', err);
                return {
                    etag: null,
                    blob: undefined,
                };
            }
        },
        async saveToBlob(bg: structure.BgBannerCached) {
            const url = bg.obj.url;
            if (!url) return undefined;

            const { etag, blob } = await this.fetchResource(url, bg.etag);
            console.log(etag, blob);
            if (!etag) return undefined;

            if (blob) {
                await idb.addRecord({ key: bg.obj.url, etag, blob: blob }, idb.storage.media);
                return { url: URL.createObjectURL(blob), etag: etag };
            }

            if (!bg.obj.url) return undefined;

            const record = await idb.getRecord(bg.obj.url, idb.storage.media);
            if (!record.blob) return undefined;

            return { url: URL.createObjectURL(record.blob), etag: etag };
        },
        async loadFromBlob(bg: structure.BgBannerCached) {
            if (!bg?.obj) return undefined;
            if (!bg?.obj?.url) return await this.saveToBlob(bg);

            const record = await idb.getRecord(bg.obj.url, idb.storage.media);

            if (record && record.etag) {
                if (!record.blob) return undefined;
                console.log(record.key, record.etag)
                return { url: URL.createObjectURL(record.blob), etag: record.etag };
            }

            return await this.saveToBlob(bg);
        },
        loadData() {
            const scs = this.loadDataStore<structure.TvScreen[]>('tvScreens');
            this.screens = scs ? scs : [];

            this.home = this.screens.find(s => s.key == 'Home') as structure.HomeScreen;

            const header = this.loadDataStore<structure.Header>('header');
            this.header = header ? header : {} as structure.Header;

            const footer = this.loadDataStore<structure.Footer>('footer');
            this.footer = footer ? footer : {} as structure.Footer;

            const bgs = this.loadDataStore<BgBannerCached[]>('bgContents');
            this.bgs = bgs ? bgs : [];
            this.bg = this.bgs[0];
            this.unlocked = true;
        },
        storeData(key: string, data: any) {
            console.log('Storing bgs data');
            console.log(data)
            localStorage.setItem(key, JSON.stringify(data))
        },
        launchApp(appName: string) {
            ItchIO.launchApp(appName)
        },
        async getState() {
            const platform = ItchIO.getPlatform()

            if (platform === Platform.Other) {
                await this.fetchData()
                return true
            }

            const state = await idb.getRecord('unlocked', idb.storage.state);
            if (!state) return false;

            await this.fetchData()

            return true
        },
        screenChange(scKey: string) {
            this.$router.push(scKey)
        },
        nextContent() {
            const currentIndex = this.bgs.findIndex((bg) => bg === this.bg);

            const nextIndex = (currentIndex + 1) % this.bgs.length;
            console.log('next content index: ' + nextIndex);
            this.bg = this.bgs[nextIndex];
        }
    },
    async beforeMount() {
        await ItchIO.wsInit(ItchIO.getDeviceId())
        this.ws = signalr.conn;
    },
    async mounted() {
        // check state.version if its equal current file name
        await idb.initDB();
        await ItchIO.isNewVersion();
        this.unlocked = await this.getState();
        console.log("Device is unlocked: " + this.unlocked)
        console.log("Device is registered: " + this.registered)
        ItchIO.wsListen('getConfig', this.fetchData)
    }
});
</script>


<style>
body {
    margin: 0;
    font-family: Helvetica Neue, sans-serif;
    font-weight: 400;
    color: #f3f3f3;
    font-size: 15px;
}
</style>
