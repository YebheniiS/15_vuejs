
export class Header {
    logoUrl: string | undefined;
    greeting: string | undefined;
    directMessages: string[] | undefined;
    showTime: boolean = true;
    weatherHtml: string | undefined;
    tvName: string | undefined;
}


export class Footer {
    messages: string[] | undefined
}

export enum BgType {
    unknown,
    audio = 'audio',
    video = 'video',
    image = 'image',
}

export class BgBanner {    
    type?: BgType;
    url?: string;
    imgDuration?: number; // in seconds   
    playAudio?: boolean;
   
}

export class BgBannerCached{
    
    constructor(data: BgBanner) {
        this.obj = data;
    }
    
    obj: BgBanner;
    localUrl?: string;
    etag?: string;
}

export class MenuLink {
    scKey: string | undefined;
    contentHtml: string | undefined;
    icon: string | undefined;
    caption: string | undefined;
}


export class TvScreen {
    key: string;
    type: string;
    constructor(_key: string, _type: string) {
        this.key = _key;
        this.type = _type;
    }
    showHeader: boolean = false;
    showFooter: boolean = false;
    showWeather: boolean = false;
    background?: BgBanner | BgBannerCached
    breadcrumbContent?: string;
}

export class WlcmMessage {
    message?: string;
    messageKey?: string;
    confirmed?: boolean;
}

export class HomeScreen extends TvScreen {
    constructor() {
        super("Home", "HomeScreen");
    }

    items: MenuLink[] | null | undefined;
    msg?: WlcmMessage

}

export class SubMenuScreen extends TvScreen {
    items: MenuLink[] | null | undefined;
}


export class DetailScreen extends TvScreen {
    heading: string | undefined;
    textHtml: string | undefined
}

export class DiningPage extends TvScreen {
    items?: DiningItem[];
    categories?: DiningCategory[];
}

export class DiningCategory {
    key?: string;
    name?: string;
}

export class DiningItem extends MenuLink {
    description?: string;
    category?: string;
    price?: number;
}