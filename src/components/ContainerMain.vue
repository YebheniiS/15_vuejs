<template>
    <div class="main-div bg-black">
        <video ref="videoRef" @ended="playNext()" class="main-div" :volume="contentVolume"></video>
        <img class="main-div" v-if="bg?.obj.type === bgType.image" :src="bg?.localUrl ? bg?.localUrl : bg?.obj.url" alt="Bg Image">
        <audio ref="audioRef" v-if="audio" @ended="playNext()" :src="audio.localUrl ? audio.localUrl : audio.obj.url"
            :loop="loopPlay" :volume="contentVolume" :autoplay=bg?.obj.playAudio></audio>
    </div>
    <div class="main-div flex flex-col min-w-screen min-h-screen justify-between">
        <slot></slot>
    </div>
</template>


<script lang="ts">
import { BgType, BgBannerCached, TvScreen } from '@/dataStructures';
import ScreenManager from '@/utils/screens';
import ItchIO, { Platform } from '@/utils/io';
import { defineComponent } from 'vue';

export default defineComponent({
    name: "ContainerMain",
    props: {
        bg: BgBannerCached,
        audio: BgBannerCached,
        sc: TvScreen,
    },
    watch: {
        bg(newVal) {
            console.log(newVal);
            this.videoElem.hidden = true;
            switch (this.bg?.obj.type) {
                case BgType.video:
                    this.playVideo(800);
                    break;
                case BgType.audio:
                    break;
                case BgType.image:
                    if (this.sc?.type === 'HomeScreen') {
                        setTimeout(() => this.$emit('playNext'), this.bg.obj.imgDuration as number * 1000)
                    }
                    break;
            }
        }
    },
    computed: {
        contentVolume() {
            if (ItchIO.getPlatform() === Platform.Other) {
                return 0.0;
            }
            return 1;
        },
        loopPlay() {
            return this.sc?.type !== 'HomeScreen';


        }
    },
    data() {
        return {
            videoElem: {} as HTMLVideoElement,
            audioElem: {} as HTMLAudioElement,
            bgType: BgType
        }
    },
    methods: {
        playVideo(timeout: number) {
            this.bg?.obj.type === BgType.video ? this.videoElem.src = this.bg?.localUrl ? this.bg?.localUrl : this.bg?.obj.url! : "";
            this.videoElem.play();
            setTimeout(() => this.videoElem.hidden = false, timeout);
        },
        playNext() {
            if (this.sc?.type !== 'HomeScreen') return;

            const bgsNumber = ScreenManager.countBgs();
            if (bgsNumber < 2) {
                console.log('only single bg detected, replaying current bg... ' + bgsNumber);
                if (this.bg?.obj.type === BgType.video) {
                    this.videoElem.play()
                    return;
                }

                if (this.bg?.obj.type === BgType.image) {
                    if (this.sc?.type === 'HomeScreen') {
                        setTimeout(() => this.$emit('playNext'), this.bg.obj.imgDuration as number * 1000)
                    }
                }
            }

            console.log("Invoking playNext function");
            this.videoElem.src = "";
            this.$emit('playNext');
        },
    },
    mounted() {
        console.log("current screen type is " + this.sc?.type);
        this.videoElem = this.$refs.videoRef as HTMLVideoElement;
        this.audioElem = this.$refs.audioRef as HTMLAudioElement;
        this.videoElem.hidden = true;

        switch (this.bg?.obj.type) {
            case BgType.video:
                this.playVideo(800);
                break;
            case BgType.audio:
                break;
            case BgType.image:
                if (this.sc?.type === 'HomeScreen') {
                    setTimeout(() => this.$emit('playNext'), this.bg.obj.imgDuration as number * 1000)
                }
                break;
        }

        if (this.videoElem && this.audioElem) {
            console.log('video volume: ' + this.videoElem.volume, 'audio volume: ' + this.audioElem.volume);
        }

    }
})

</script>

<style scoped>
img {
    background-color: black;
}

video {
    background-color: black;
}

video::-webkit-media-controls {
    display: none !important;
}

video::-webkit-media-controls-enclosure {
    display: none !important;
}

video::-webkit-media-controls-overlay-play-button {
    display: none !important;
}
</style>


<style>
.main-div {
    position: fixed;
    right: 0;
    bottom: 0;
    min-width: 100%;
    min-height: 100%;
}
</style>