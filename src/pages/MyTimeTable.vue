<template>
  <v-ons-page @show="handleShowPage">
    <v-ons-toolbar static>
      <div class="center">気になるリスト</div>
    </v-ons-toolbar>
    <div class="timetable">

      <div class="timetable-detail">
        <div v-if="timeTables.length === 0" @click="set(1)">
          <div class="timetable-null">
            <p>
              気になるセッションが登録されていません。<br>
              タイムテーブルで気になるセッションの
            <div>
              <img src="../assets/images/common-laravel_off.png">
              <span>気になる</span>
            </div>
            <p>
              を押してみましょう。
            </p>

          </div>
        </div>
        <template
          v-else
          v-for="(timeTable, index) in timeTables">
          <h5
            v-if="isShowTimeLabel(index, timeTables)"
            :key="(index + 1) * 10"
            >{{ formatTime(timeTable.start_at) }}</h5>
          <div
            :key="(index + 1) * 100"
            class="timetable-detailUnit">
            <div class="timetable-detailTime">
              <span>
                {{ formatTime(timeTable.start_at) }}<br>
                |<br>
                {{ formatTime(timeTable.end_at) }}
              </span>
            </div>
            <div
              ref="detail"
              @click="pushDetail(timeTable)"
              class="timetable-detailDescription">
              <h3>{{ timeTable.title }}</h3>
              <p>{{ timeTable.description.length >= 50 ? timeTable.description.slice(0, 50) + '...' : timeTable.description }}</p>
              <p>{{ timeTable.speaker }}</p>
              <div>
                <span class="--room">{{ timeTable.place }}</span>
                <span v-if="isSponsorSession(timeTable.sponsor_id)" class="--sponsor">スポンサー</span>
              </div>
            </div>
          </div>
        </template>
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
      お気に入り情報の取得に失敗しました。
      リトライします。
    </v-ons-alert-dialog>
  </v-ons-page>
</template>
<script>
import DetailPage from '@/pages/Detail'
import { mapGetters, mapMutations } from 'vuex'
import { getTimeTables, incrementsLike, decrementsLike } from '@/libs/api'
import moment from 'moment'

export default {
  data() {
    return {
      showNetworkErrorDialog: false,
      // APIの全結果タイムテーブル
      allTimeTables: [],
      // localStorageのタイムテーブル
      timeTables: []
    }
  },
  computed: {
    ...mapGetters('master', ['sponsors'])
  },
  methods: {
    ...mapMutations('navigator', ['push']),
    ...mapMutations('tabbar', ['set']),
    /** onShowハンドラー */
    async handleShowPage() {
      const diff = this.updatedAt && moment(Date.now()).diff(moment(this.updatedAt))
      // 5秒以内の更新は無視
      if (diff <= 5000) return

      await this.init()
      if (!this.timeTables) return
      // 通知設定
      try {
        cordova.plugins.notification.local.clearAll()
        this.timeTables.forEach(function(d, index) {
          const target = moment(d.start_at).subtract('minutes', 10)
          cordova.plugins.notification.local.schedule({
            id: index + 1,
            title: '間もなくセッションが始まります',
            text: d.title,
            sound: null,
            foreground: true,
            at: target.toDate()
          })
        })
      } catch (error) {
        console.log(error)
      }
    },
    hashTagLink(hashTag) {
      window.open(`https://twitter.com/intent/tweet?hashtags=${hashTag}`, '_system')
    },
    async handleClickLike(uuid) {
      try {
        if (this.isVoted(uuid)) {
          await decrementsLike(uuid)
          localStorage.removeItem(uuid)
        } else {
          await incrementsLike(uuid)
          localStorage.setItem(uuid, true)
        }
        this.init()
      } catch (error) {
        alert('ネットワークエラー')
      }
    },
    isVoted(uuid) {
      return localStorage.hasOwnProperty(uuid)
    },
    async init() {
      try {
        const { data } = await getTimeTables()
        this.allTimeTables = data
        this.timeTables = data.filter(d => {
          return localStorage.hasOwnProperty(`mine-${d.uuid}`)
        })
        this.showNetworkErrorDialog = false
      } catch (error) {
        this.showNetworkErrorDialog = true
      } finally {
        this.updatedAt = Date.now()
      }
    },
    isSponsorSession(sponsorId) {
      return (
        this.sponsors &&
        this.sponsors.length > 0 &&
        this.sponsors.findIndex(s => {
          // スポンサーセッションは「スポンサー」と出す
          return s.id === sponsorId && (s.grade === 'Gold' || s.grade === 'Lunch')
        }) > -1
      )
    },
    formatTime(atTime) {
      return moment(atTime).format('HH:mm')
    },
    /**
     * タイムテーブルラベルを表示するかどうか
     * 同じ開始時間帯のスピーカーはサマリーされる
     */
    isShowTimeLabel(index, speakers) {
      return index === 0 || (index > 0 && speakers[index].start_at !== speakers[index - 1].start_at)
    },
    pushDetail(timeTable) {
      this.push({
        extends: DetailPage,
        data() {
          return {
            timeTable: timeTable,
            updatedAt: undefined
          }
        }
      })
    }
  },
  components: { DetailPage }
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

.toolbar {
  background-color: #cb4819;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
}

.toolbar__title {
  font-size: calc((100vw / 375) * 16);
  font-weight: bold;
  color: #fff;
  background-color: #cb4819;
  ons-icon {
    font-weight: bold;
    color: #fff;
    margin-left: 1rem;
  }
}

.timetable-null {
  padding: 12px;
  background: #fff;
  margin-bottom: 16px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);

  p {
    text-align: center;
    line-height: 1.5;
  }

  div {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    width: fit-content;
    margin: 0 auto;
    padding: 20px;
    border: 5px solid #999;
    border-radius: 5px;

    img {
      display: inline-block;
      margin-right: 10px;
    }

    span {
      font-size: 22px;
      font-size: calc((100vw / 375) * 22);
      color: #555;
    }
  }
}

.timetable-detail {
  h5 {
    background-color: #e0e0e0;
    font-size: 16px;
    font-size: calc((100vw / 375) * 16);
    font-weight: bold;
    color: black;
    margin: 0;
    padding: 12px;
  }

  &Unit {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: stretch;
    margin-bottom: 10px;
    padding: 12px 0 0;
    border-bottom: 1px solid #e5e7eb;
    background: #fff;
  }

  &Time {
    width: 40px;
    margin-left: 12px;
    border-bottom: 1px solid #e5e7eb;

    span {
      font-size: 12px;
      font-size: calc((100vw / 375) * 12);
      text-align: center;
      display: block;
    }
  }

  &Description {
    flex: 1;
    padding: 0 12px;
    border-bottom: 1px solid #e5e7eb;

    h3 {
      font-size: 14px;
      font-size: calc((100vw / 375) * 14);
      font-weight: bold;
      line-height: 1.3;
      margin: 0;
    }

    p {
      white-space: pre-line;
      word-break: break-word;
      font-size: 14px;
      font-size: calc((100vw / 375) * 14);
      line-height: 1.5;
      margin: 6px 0 0 0;
    }

    div {
      margin: 6px 0 12px;

      span {
        padding: 4px 6px;
        font-size: 12px;
        font-size: calc((100vw / 375) * 12);
        display: inline-block;

        &.--room {
          background: #eff2f3;
          color: #9a9a9a;
        }

        &.--sponsor {
          color: #fff;
          background: #daa520;
        }
      }
    }
  }
}
</style>
