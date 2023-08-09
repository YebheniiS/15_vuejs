import idb from "@/api/idb";
import signalr from "@/api/signalr";

declare const Android: any;

export enum Platform {
    Android = 'Android',
    Tizen = 'Tizen',
    Other = 'Other',
}

export class WifiDetail {
    ssid: string;
    rssi: number;;
    signalLevel: number;

    constructor(resString: string) {
        const matches = resString.match(/SSID:(.*) rssi:(.*) signalLevel:(.*)/);

        if (matches !== null) {
            const [_, ssid, rssi, signalLevel] = matches;
            const rssiNumber = parseInt(rssi, 10);
            const signalLevelNumber = parseInt(signalLevel, 10);
            this.ssid = ssid;
            this.rssi = rssiNumber;
            this.signalLevel = signalLevelNumber;
            return;
        }

        throw new Error("Unable to parse signal string from ItchIO!");

    }
}

const ItchIO = {
    getPlatform(): Platform {
        const isAndroid = /Android/i.test(navigator.userAgent)
        const isTizen = /Tizen/i.test(navigator.userAgent);

        return isAndroid ? Platform.Android : isTizen ? Platform.Tizen : Platform.Other;
    },

    configUrl(): string {
        const defaultConfig = 'config.json';
        switch (this.getPlatform()) {
            case Platform.Android: {
                const tvip = localStorage.getItem('tvip')
                const parsed = tvip ? JSON.parse(tvip) : undefined;
                const url = `/api/TV/config?hotelCode=${parsed.code}&tvip=${parsed.ip}&tvName=${ItchIO.getDeviceName()}`
                return url;
            }
            case Platform.Tizen: {
                return defaultConfig
            }
            case Platform.Other: {
                return defaultConfig
            }
        }
    },

    launchApp(app: string): void {
        switch (this.getPlatform()) {
            case Platform.Android:
                Android.launchApplication(app);
                break;
            case Platform.Tizen:
                console.error('Not implemented!')
                break;
            case Platform.Other:
                console.error('Not implemented!')
                break;
        }
    },

    showSettings(): void {
        switch (this.getPlatform()) {
            case Platform.Android:
                Android.showSettings();
                break;
            case Platform.Tizen:
                console.error('Not implemented!')
                break;
            case Platform.Other:
                console.error('Not implemented!')
                break;
        }
    },

    setDeviceName(newName: string): void {
        switch (this.getPlatform()) {
            case Platform.Android:
                Android.setDeviceName(newName);
                break;
            case Platform.Tizen:
                console.error('Not implemented!')
                break;
            case Platform.Other:
                console.error('Not implemented!')
                break;
        }
    },

    getDeviceName(): string {
        switch (this.getPlatform()) {
            case Platform.Android:
                return Android.getDeviceName();
            case Platform.Tizen:
                console.error('Not implemented!')
                return "Room 106 TV"
            case Platform.Other:
                console.error('Not implemented!')
                return "Livingroom 106 TV"
        }
    },

    getDeviceId(): string {
        switch (this.getPlatform()) {
            case Platform.Android:
                return Android.getAndroidId();
            case Platform.Tizen:
                console.error('Not implemented!')
                return '201ff8b546eab8ac'
            case Platform.Other:
                console.error('Not implemented!')
                return '201ff8b546eab8ac'
        }
    },

    getWifiSignal(): WifiDetail | undefined {
        switch (this.getPlatform()) {
            case Platform.Android:
                return new WifiDetail(Android.getWifiSignal());
            case Platform.Tizen:
                console.error('Not implemented!')
                return
            case Platform.Other:
                console.error('Not implemented!')
                return
        }
    },

    async wsInit(deviceID: string): Promise<void> {
        switch (this.getPlatform()) {
            case Platform.Android:
                await signalr.init(deviceID)
                return
            case Platform.Tizen:
                console.error('Not implemented!')
                return
            case Platform.Other:
                console.error('Not implemented!')
                return
        }
    },

    wsListen(eventName: string, callback: any): void {
        switch (this.getPlatform()) {
            case Platform.Android:
                return signalr.conn.on(eventName, callback)
            case Platform.Tizen:
                console.error('Not implemented!')
                return
            case Platform.Other:
                console.error('Not implemented!')
                return
        }
    },

    async wsInvoke(eventName: string): Promise<void> {
        switch (this.getPlatform()) {
            case Platform.Android:
                return signalr.conn.invoke(eventName)
            case Platform.Tizen:
                console.error('Not implemented!')
                return
            case Platform.Other:
                console.error('Not implemented!')
                return
        }
    },

    getCurrentScriptFileName() {
        const scriptElement = document.scripts;
        const regex = /app\.[a-f0-9]+\.(js)/

        for (const s of scriptElement) {
            if (regex.test(s.src)) {
                const arr = s.src.split('/')
                return arr[arr.length - 1]
            }
        }

        return null;
    },

    async clearData() {
        await idb.dropObjectStore();
        console.log('clearing localstorage');
        localStorage.removeItem('header');
        localStorage.removeItem('footer');
        localStorage.removeItem('tvScreens');
        localStorage.removeItem('bgContents');
        localStorage.removeItem('Basket');
        console.log('dropped and cleared!');
    },

    async isNewVersion() {
        // check state.version if its equal current file name
        const version = this.getCurrentScriptFileName();
        console.log("currentJS.version:" + version);
        if (!version) return console.error("cannot check build version, please run in production mode!");
        const current = await idb.getRecord('version', idb.storage.state);
        if (!current) await idb.addRecord({ key: 'version', value: version }, idb.storage.state);
        console.log('Got current version: ' + current.value);

        if (current.value !== version) {
            console.log('new version is detected: ' + version);
            await idb.addRecord({ key: "version", value: version }, idb.storage.state);
            console.log('dropping objectstore');
            await this.clearData();
        }

        console.log('no updated version found')

    }
}

export default ItchIO;