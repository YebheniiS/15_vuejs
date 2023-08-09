<template>
  <div class="flex flex-col items-center w-full text-gray-200 lg:text-2xl">
    <div>TV id: {{ tvid }}</div>
    <div>TV IP: {{ tvip }}</div>
    <div>Hotel code: {{ hotelCode }}</div>
    <div>Hub connection status: {{ state }}</div>
    <div>RSSI: {{ wifi?.rssi }} dBm</div>
    <div>Signal level: {{ wifi?.signalLevel }}%</div>
  </div>
  <div class="flex flex-col w-fit items-center bg-black bg-opacity-60 p-4 rounded-md">
    <figure class="qrcode">
      <vue-qrcode :value="`https://tv.nettify.io/init?tvid=${tvid}&tvip=${tvip}`" />
      <img class="qrcode__image" :src="require('../assets/qr-icon.png')" alt="QR">
    </figure>
    <div class="flex flex-col">
      <div>To register this device please scan the QR code</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import idb from '@/api/idb';
import signalr from '@/api/signalr';
import ItchIO, { WifiDetail } from '@/utils/io';

export default defineComponent({
  name: 'InitPage',
  data() {
    return {
      tvid: 'none',
      tvip: 'none',
      hotelCode: 'Unknown',
      state: 'Connecting',
      wifi: {} as WifiDetail | undefined
    }
  },
  methods: {
    getTvId() {
      this.tvid = ItchIO.getDeviceId()      
    },
    async getTvIp() {
        const data = await fetch("/api/Init/ip");
        const appData = await data.text();
        this.tvip = appData;
        console.log("got IP:" + appData);
    },
    async getHotelCode() {
      const code = await signalr.conn.invoke('GetHotelCode');
      console.log(code);
      return code
    },
    async addItemToBlob(item: { key: string, value: any }) {
      await idb.addRecord(item, idb.storage.state)
    },
    async unlockMachine() {
      console.log("unlock invoked!")
      await this.addItemToBlob({ key: 'unlocked', value: true })
      await this.addItemToBlob({ key: 'hotelCode', value: this.hotelCode })
      localStorage.setItem('registered', 'true');
      this.$emit('initialize')
    }
  },
  async created() {
    this.getTvId();
    await this.getTvIp();
   
    this.wifi = ItchIO.getWifiSignal();
    setInterval(() => {
      this.wifi = ItchIO.getWifiSignal();
    }, 30000)

    signalr.conn.on('onUnlock', this.unlockMachine)
    
    
    setTimeout(async () => {
      this.state = signalr.conn.state
      this.hotelCode = await this.getHotelCode();
      const dataKey = {
        code: this.hotelCode,
        ip: this.tvip
      }
      localStorage.setItem('tvip', JSON.stringify(dataKey))
    }, 1500)
  }
})
</script>

<style scoped>
.qrcode {
  display: inline-block;
  font-size: 0;
  margin-bottom: 0;
  position: relative;
}

.qrcode__image {
  background-color: #fff;
  border: 0.25rem solid #fff;
  border-radius: 0.25rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.25);
  height: 19%;
  left: 50%;
  overflow: hidden;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 19%;
}
</style>
