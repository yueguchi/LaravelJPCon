<template>
  <v-ons-page>
    <v-ons-toolbar static>
      <div class="center">スポンサー一覧</div>
    </v-ons-toolbar>
    <ul class="sponsor-list">
      <li class="sponsor-list-item"
        v-for="(clazz, index) in sponsors"
        :key="index">
        <p class="clazz">{{ clazz.name }}</p>
        <ul>
          <li
          v-for="(sponsor, index) in clazz.sponsors"
          :key="index"
          @click="handleExternalSiteUrlClick(sponsor.url)">
            <a>{{ sponsor.name }}</a>
            <img v-if="sponsor.avatar" :src="sponsor.avatar" class="company-logo" />
          </li>
        </ul>
      </li>
    </ul>
    <v-ons-alert-dialog
      :footer="{
        'OK': () => init()
      }"
      :visible.sync="showNetworkErrorDialog"
      title="通信エラー"
      modifier="rowfooter"
    >
      スポンサー情報の取得に失敗しました。
      リトライします。
    </v-ons-alert-dialog>
  </v-ons-page>
</template>
<script>
import { getSponsors } from '@/libs/api'

export default {
  data() {
    return {
      showNetworkErrorDialog: false,
      sponsors: []
    }
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      try {
        const {
          data: { sponsor_plans }
        } = await getSponsors()
        this.sponsors = sponsor_plans
        this.showNetworkErrorDialog = false
      } catch (error) {
        this.showNetworkErrorDialog = true
      }
    },
    handleExternalSiteUrlClick(url) {
      window.open(url, '_system')
    }
  }
}
</script>
<style lang="scss" scoped>
* {
  box-sizing: border-box;
  color: #404040;
}

a {
  text-decoration: none;
}

.toolbar {
  background-color: #cb4819;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
}

.toolbar__title {
  font-size: calc((100vw / 375) * 16);
  font-weight: bold;
  color: #fff;
  background-color: #cb4819;
}

.sponsor-list {
  margin: 0;
  padding: 0;
  list-style: none;

  &-item {
    padding: 0;
    margin-bottom: 16px;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);

    .clazz {
      width: 100%;
      background-color: #cb4819;
      font-size: 16px;
      font-size: calc((100vw / 375) * 16);
      font-weight: bold;
      color: #fff;
      margin: 0;
      padding: 12px;
      position: sticky;
      top: 0;
    }

    ul {
      width: 100%;
      list-style: none;
      margin: 0;
      padding: 0 12px;
      background: #fff;

      li {
        width: 100%;
        height: 81px;
        padding: 0;
        font-size: 16px;
        font-size: calc((100vw / 375) * 16);
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-items: center;

        .company-logo {
          width: 120px;
          height: 80px;
          object-fit: cover;
          display: inline-block;
          vertical-align: middle;
        }

        a {
          font-size: 16px;
          font-size: calc((100vw / 375) * 16);
        }
      }
    }
  }
}
</style>
