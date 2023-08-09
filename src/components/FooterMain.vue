<template>
    <div class="max-w-[100vw]">
        <MainMenu/>
        <!-- Flex messages -->
        <div ref="msgContainer" class="bg-black bg-opacity-60 w-full h-fit pb-3 lg:pb-5 lg:pt-2 relative overflow-hidden">
            <div ref="msg" class="running-text text-xl lg:text-3xl">
                {{ msg?.messages?.join(" | ") }}
            </div>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import { Footer } from "@/dataStructures"

export default defineComponent({
    name: "FooterMain",
    props: {
        msg: Footer
    },
    data() {
        return {
            isOverflowed: false,
        }
    },
    mounted() {
        this.checkOverflow();
    },
    methods: {
        checkOverflow() {
            const msgContainer = this.$refs.msgcontainer as HTMLElement;
            const msg = this.$refs.msg as HTMLElement;
            if (msgContainer && msg) {
                this.isOverflowed = msg.offsetWidth > msgContainer.offsetWidth
            }
            console.log("msg footer overflow: " + this.isOverflowed)
        }
    },
})
</script>

<style scoped>
.running-text {
    white-space: nowrap;
    /* prevent text from wrapping */
    overflow: visible;
    /* hide text outside container */
    animation: marquee 40s linear infinite;
    /* run animation */
}

@keyframes marquee {
    0% {
        transform: translateX(100%);
        /* starting position */
    }

    100% {
        transform: translateX(-200%);
        /* end position */
    }
}
</style>