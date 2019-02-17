<template>
  <v-ons-page class="laravel-app">
    <v-ons-navigator swipeable
      :page-stack="stack"
      :options="options"
    ></v-ons-navigator>
    <v-ons-alert-dialog
      :footer="{
        'OK': () => init()
      }"
      :visible.sync="showNetworkErrorDialog"
      title="通信エラー"
      modifier="rowfooter"
    >
      初期情報の取得に失敗しました。
      リトライします。
    </v-ons-alert-dialog>
  </v-ons-page>
</template>

<script>
import AppTabbar from '@/components/AppTabbar'
import { mapState, mapMutations } from 'vuex'
import { getMaster } from '@/libs/api'

export default {
  data() {
    return {
      showNetworkErrorDialog: false
    }
  },
  beforeCreate() {
    // androidとiOSでstyleを共通に
    this.$ons.disableAutoStyling()
  },
  beforeMount() {
    if (this.$ons.platform.isIPhoneX()) {
      document.documentElement.setAttribute('onsflag-iphonex-portrait', '')
    }
  },
  mounted() {
    try {
      cordova.plugins.notification.local.hasPermission(permission => {
        if (!permission) {
          const now = new Date().getTime()
          const _5_sec_from_now = new Date(now + 5 * 1000)
          cordova.plugins.notification.local.schedule({
            id: 999999,
            title: '実行委員からのお知らせ',
            text: '気になるセッションを登録すると開始10分前に通知されます',
            sound: null,
            foreground: true,
            at: _5_sec_from_now
          })
        }
      })
    } catch (error) {
      console.log(error)
    }
  },
  async created() {
    this.push(AppTabbar)
    this.init()
  },
  computed: {
    ...mapState('navigator', ['stack', 'options'])
  },
  methods: {
    ...mapMutations('navigator', ['push']),
    ...mapMutations('master', ['setMaster']),
    async init() {
      try {
        const { data } = await getMaster()
        this.setMaster(data)
        this.showNetworkErrorDialog = false
      } catch (error) {
        this.showNetworkErrorDialog = true
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
