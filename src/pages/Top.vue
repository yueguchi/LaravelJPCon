<template>
  <v-ons-page>
    <div class="top">
      <div class="top-catch">
        <img src="../assets/images/top-main_image.png">
        <p>{{ info.description }}</p>
      </div>
      <div class="top-detail">
        <dl>
          <dt>開催日時</dt>
          <dd>
            {{ startDate }}
          </dd>
          <dt>場所</dt>
          <dd @click="handleClickAddress">
          {{ info.place }}<br>
          〒{{ info.zip }}<br>
          {{ info.address1 }}<br>
          {{ info.address2 }}
          </dd>
        </dl>
      </div>
      <div class="top-sponsored">
        <h4>ゴールドスポンサー</h4>
        <div class="top-sponsoredItems">
          <ul>
            <li>
              <a href=""><img src="../assets/images/top-sponsor_1.png"></a>
            </li>
            <li>
              <a href=""><img src="../assets/images/top-sponsor_2.png"></a>
            </li>
            <li>
              <a href=""><img src="../assets/images/top-sponsor_3.png"></a>
            </li>
          </ul>
        </div>
        <div class="top-sponsoredList" @click="set(3)">
          <a>スポンサー一覧</a>
        </div>
      </div>
      <div class="top-sponsorship">
        <h4>主催</h4>
        <div class="top-sponsorshipItems">
          <p>
            {{ info.organizer }}
          </p>
        </div>
        <div class="top-sponsorshipLink">
          <a @click="commonTwitterHash(info.hash_tag)">#{{ info.hash_tag }}</a>
        </div>
      </div>
    </div>
    <v-ons-alert-dialog
      :footer="{
        'OK': () => init()
      }"
      :visible.sync="showNetworkErrorDialog"
      title="通信エラー"
      modifier="rowfooter"
    >
      カンファレンス情報の取得に失敗しました。
      リトライします。
    </v-ons-alert-dialog>
  </v-ons-page>
</template>
<script>
import { getInfos } from '@/libs/api'
import moment from 'moment'
import { mapMutations } from 'vuex'

moment.locale('ja', { weekdaysShort: ['日', '月', '火', '水', '木', '金', '土'] })

export default {
  created() {
    this.init()
  },
  data() {
    return {
      showNetworkErrorDialog: false,
      info: {}
    }
  },
  computed: {
    startDate() {
      const startMoment = moment(this.info.start_at)
      const endMoment = moment(this.info.end_at)
      return `${startMoment.format('YYYY年MM月DD日(ddd)')} ${startMoment.format('HH:mm')} - ${endMoment.format(
        'HH:mm'
      )}`
    }
  },
  methods: {
    ...mapMutations('tabbar', ['set']),
    commonTwitterHash(hashTag) {
      window.open(`https://twitter.com/search?f=tweets&q=${hashTag}`, '_system')
    },
    handleClickAddress() {
      window.open('https://goo.gl/maps/jjKtmTcffSm', '_system')
    },
    async init() {
      try {
        const { data } = await getInfos()
        this.info = data
        this.showNetworkErrorDialog = false
      } catch (error) {
        this.showNetworkErrorDialog = true
      }
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
  color: #f4645f;
  text-decoration: none;
}

.top {
  background-color: #fff;
  margin-bottom: 16px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
}

.top-catch {
  img {
    width: 100vw;
    height: calc((100vw / 375) * 414);
  }

  p {
    font-size: 14px;
    font-size: calc((100vw / 375) * 14);
    margin: 0;
    padding: 20px 12px;
    background-color: #fff;
  }
}

.top-detail {
  border-top: 2px solid #e5e7eb;
  background-color: #fff;

  dl {
    width: 100%;
    margin: 0;
    padding: 0 12px;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: stretch;

    dt {
      width: 80px;
      font-size: 14px;
      font-size: calc((100vw / 375) * 14);
      color: #9a9a9a;
      margin: 0;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    dd {
      width: calc(100% - 80px);
      font-size: 14px;
      font-size: calc((100vw / 375) * 14);
      margin: 0;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    dt:nth-last-child(2),
    dd:nth-last-child(1) {
      border-bottom: none;
    }
  }
}

.top-sponsored {
  background-color: #fff;

  h4 {
    background-color: #cb4819;
    font-size: 16px;
    font-size: calc((100vw / 375) * 16);
    font-weight: bold;
    color: #fff;
    margin: 0;
    padding: 12px;
  }

  &Items {
    padding: 0 0 0 12px;

    ul {
      list-style: none;
      margin: 0;
      padding: 20px 12px 20px 0;
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e5e7eb;

      li {
        width: calc((100% - 22px) / 3);

        img {
          width: 100%;
        }
      }
    }
  }

  &List {
    padding: 12px;
    text-align: right;

    a {
      text-align: right;

      &::after {
        content: '';
        position: relative;
        width: 8px;
        height: 12px;
        background: url(../assets/images/common-link_arrow.png) no-repeat;
        background-size: contain;
        display: inline-block;
        margin-left: 10px;
      }
    }
  }
}

.top-sponsorship {
  background-color: #fff;

  h4 {
    background-color: #cb4819;
    font-size: 16px;
    font-size: calc((100vw / 375) * 16);
    font-weight: bold;
    color: #fff;
    margin: 0;
    padding: 12px;
  }

  &Items {
    padding: 0 0 0 12px;

    p {
      font-size: 14px;
      font-size: calc((100vw / 375) * 14);
      border-bottom: 1px solid #e5e7eb;
      margin: 0;
      padding: 20px 12px 20px 0;
    }
  }

  &Link {
    padding: 12px;

    a {
      display: flex;
      flex-flow: row nowrap;
      justify-content: flex-end;
      align-items: center;

      &::before {
        content: '';
        position: relative;
        width: 18px;
        height: 18px;
        background: url(../assets/images/common-twitter_icon.png) no-repeat center;
        background-size: contain;
        display: inline-block;
        margin-right: 10px;
      }

      &::after {
        content: '';
        position: relative;
        width: 8px;
        height: 12px;
        background: url(../assets/images/common-link_arrow.png) no-repeat;
        background-size: contain;
        display: inline-block;
        margin-left: 10px;
      }
    }
  }
}
</style>
