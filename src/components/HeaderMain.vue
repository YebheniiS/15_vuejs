<template>
    <div class="flex w-full justify-between px-8 pt-4 text-xs lg:text-2xl h-[15vh]">
        <div class="flex flex-none max-w-[84%]">
            <img class="w-[120px] h-[40px] lg:w-[240px] lg:h-[80px]" :src="data?.logoUrl" alt="Hotel Logo">
            <div class="text-shadow px-4 items-center p-1 min-w-fit">Welcome {{ data?.greeting }}</div>
            <div v-if="data?.directMessages && data?.directMessages?.length > 0" class="flex flex-col">
                <div class=" rounded-sm p-1 flex items-center bg-black bg-opacity-60">
                    <i class="fa-solid fa-envelope px-1 lg:px-3"></i>
                    <div ref="container" class="max-w-[45vw] lg:max-w-[48vw] relative overflow-hidden ml-2">
                        <p ref="msg" v-bind:class="{ 'running-text': isOverflowed }" class="msg px-1 w-auto">
                            {{ data.directMessages.join(" | ") }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col">
            <div v-if="data?.showTime === true" class="flex flex-none mt-1">
                <div class="min-w-fit px-2 text-shadow w-fit">
                    <span class="pr-2 lg:px-2">{{ timeString }}</span>
                    <span class="lg:px-2">{{ dateString }}</span>
                </div>
                <div class="min-w-fit text-shadow"><i class="fab fa-chromecast"></i> {{ tvName }}</div>
            </div>
            <div v-if="sc?.showWeather === true" class="weather flex justify-end">
                <div class="w-full lg:w-[10vw] lg:-mr-16 div-weather" v-html="data?.weatherHtml">

                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Header, TvScreen } from '@/dataStructures';
import ItchIO from '@/utils/io';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default defineComponent({
    name: "HeaderMain",
    props: {
        data: Header,
        sc: TvScreen,
    },
    data() {
        return {
            timeString: "",
            dateString: "",
            isOverflowed: false,
            tvName: "",
        }
    },
    mounted() {
        this.checkOverflow();
    },
    methods: {
        updateTime() {
            const date = new Date();
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            const month = months[date.getMonth()];
            const timeString = `${hours}:${minutes}`;
            this.dateString = `${month} ${day}`;
            this.timeString = timeString
        },
        checkOverflow() {
            const msgContainer = this.$refs.msgcontainer as HTMLElement;
            const msg = this.$refs.msg as HTMLElement;
            if (msgContainer && msg) {
                this.isOverflowed = msg.offsetWidth > msgContainer.offsetWidth
            }
            console.log("msg header overflow: " + this.isOverflowed)
        },
        loadWeather(d: any, s: string, id: string) {
            let js, fjs = d.getElementsByTagName(s)[0];
            if (!d.getElementById(id)) { js = d.createElement(s); js.id = id; js.src = 'https://weatherwidget.io/js/widget.min.js'; fjs.parentNode.insertBefore(js, fjs); }
        },
        setDeviceName(deviceName: string) {
            ItchIO.setDeviceName(deviceName)
        },
        getDeviceName(): string {
            return ItchIO.getDeviceName();
        },
    },
    created() {
        this.updateTime()
        setInterval(this.updateTime, 60000);
        this.tvName = this.getDeviceName();
        this.loadWeather(document, 'script', 'weatherwidget-io-js')
    }
});
</script>

<style scoped>
.text-shadow {
    text-shadow: 0 0 3px black;
}

.msg {
    display: inline-block;
    white-space: nowrap;
}

.div-weather {
    transform: scale(0.5);
    transform-origin: top right;

}

.running-text {
    animation: marquee 40s linear infinite;
}

@keyframes marquee {
    0% {
        transform: translateX(50%);
    }

    100% {
        transform: translateX(-100%);
    }
}

@media (min-width: 1024px) {
    .div-weather {
        transform: scale(1.4);
        transform-origin: top right;

    }
}
</style>