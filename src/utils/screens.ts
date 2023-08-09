import { BgBanner, BgBannerCached, TvScreen } from "@/dataStructures";

const ScreenManager = {
    getAllScreen(): TvScreen[] | undefined {
        const data = localStorage.getItem('tvScreens');
        if (!data) return undefined;
        return JSON.parse(data) as TvScreen[]
    },

    getScreen(key: string): TvScreen | undefined {
        const screen = this.getAllScreen();
        if (!screen) return undefined;
        const sc = screen.find(d => d.key === key);
        console.log(sc);
        return sc;
    },

    countBgs() {
        const bgs = this.getAllBgs()

        return bgs.length
    },

    getAllBgs(): BgBannerCached[] | [] {
        const bgs = localStorage.getItem('bgContents');
        const current = bgs ? JSON.parse(bgs) : undefined;
        if (!current) return [];

        return current
    },

    addBg(bg: BgBanner): BgBannerCached | undefined {
        const bgs = localStorage.getItem('bgContents');
        const current = bgs ? JSON.parse(bgs) : undefined;
        if (!current) return undefined;

        const newBg = new BgBannerCached(bg)
        const arr = [...current, newBg];
        localStorage.setItem('bgContents', JSON.stringify(arr));
        return newBg;
    },

    getBg(url?: string): BgBannerCached | undefined {
        const bgs = this.getAllBgs()

        return bgs.find(d => d.obj.url === url);
    }
}

export default ScreenManager