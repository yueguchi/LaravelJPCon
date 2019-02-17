<template>
  <v-ons-page @show="handleShowPage">
    <v-ons-toolbar static>
      <div class="center">タイムテーブル</div>
    </v-ons-toolbar>
    <div class="timetable">

      <div class="timetable-detail">
        <template
          v-for="(timeTable, index) in timeTables">
          <div
            :key="(index + 1) * 100"
            class="timetable-detailUnit">
            <h5
              v-if="isShowTimeLabel(index, timeTables)"
              :key="(index + 1) * 10"
              >{{ formatTime(timeTable.start_at) }}</h5>
            <div class="timetable-detailTime">
              <span>
                {{ formatTime(timeTable.start_at) }}<br>
                |<br>
                {{ formatTime(timeTable.end_at) }}
              </span>
            </div>
            <div
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
            <div class="timetable-detailOptions">
              <div class="timetable-detailAttend" @click="handleClickMyTable(timeTable.uuid, timeTable.start_at)">
                <i
                  :class="{'--on': isMine(timeTable.uuid), '--off': !isMine(timeTable.uuid)}">
                </i>
                  <span></span>
              </div>
              <div class="timetable-detailFavorites">
                <i
                  ref="likeicon"
                  :class="{'--on': isVoted(timeTable.uuid), '--off': !isVoted(timeTable.uuid)}"
                  @click="handleClickLike(timeTable.uuid, index)"></i>
                <span>{{ timeTable.like.count }}</span>
              </div>
              <div class="timetable-detailTwitter">
                <i></i>
                <span>
                  <a @click="hashTagLink(timeTable.hash_tag)">#{{ timeTable.hash_tag }}</a>
                </span>
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
      タイムテーブル情報の取得に失敗しました。
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
      timeTables: []
    }
  },
  computed: {
    ...mapGetters('master', ['sponsors'])
  },
  methods: {
    ...mapMutations('navigator', ['push']),
    hashTagLink(hashTag) {
      window.open(`https://twitter.com/intent/tweet?hashtags=${hashTag}`, '_system')
    },
    /** MineはlocalStorageに突っ込むだけ */
    async handleClickMyTable(uuid, start_at) {
      if (this.isMine(uuid)) {
        localStorage.removeItem(`mine-${uuid}`)
      } else {
        localStorage.setItem(`mine-${uuid}`, start_at)
      }
      // リアクティブを強制発光して、アニメーションを発火させる
      this.$forceUpdate()
    },
    /** likeはDB集計対象なのでAPI叩く */
    async handleClickLike(uuid, index) {
      try {
        // APIを叩くが、見た目は叩いとこ変えたいので、selectorを操作する
        const likeicon = this.$refs.likeicon[index]
        if (this.isVoted(uuid)) {
          likeicon.className = '--off'
          await decrementsLike(uuid)
          localStorage.removeItem(uuid)
        } else {
          likeicon.className = '--on'
          await incrementsLike(uuid)
          localStorage.setItem(uuid, true)
        }
        setTimeout(() => {
          this.init()
        }, 500)
      } catch (error) {
        alert('ネットワークエラー')
      }
    },
    isMine(uuid) {
      return localStorage.hasOwnProperty(`mine-${uuid}`)
    },
    isVoted(uuid) {
      return localStorage.hasOwnProperty(uuid)
    },
    async init() {
      try {
        const { data } = await getTimeTables()
        this.timeTables = data
        this.showNetworkErrorDialog = false
      } catch (error) {
        this.showNetworkErrorDialog = true
      } finally {
        this.updatedAt = Date.now()
      }
    },
    async handleShowPage() {
      const diff = this.updatedAt && moment(Date.now()).diff(moment(this.updatedAt))
      // 5秒以内の更新は無視
      if (diff <= 5000) return
      await this.init()
      // 通知設定
      try {
        cordova.plugins.notification.local.clearAll()
        if (!this.timeTables) return
        this.timeTables.forEach(function(d, index) {
          if (localStorage.hasOwnProperty(`mine-${d.uuid}`)) {
            const target = moment(d.start_at).subtract('minutes', 10)
            console.log(index, target)
            cordova.plugins.notification.local.schedule({
              id: index + 1,
              title: '間もなくセッションが始まります',
              text: d.title,
              sound: null,
              foreground: true,
              at: target.toDate()
            })
          }
        })
      } catch (error) {
        console.log(error)
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

.timetable-detail {
  &Unit {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: stretch;
    margin-bottom: 10px;
    padding: 0 0 12px 0 0;
    border-bottom: 1px solid #e5e7eb;
    background: #fff;

    h5 {
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
  }

  &Time {
    width: 40px;
    margin: 12px 0 0 12px;
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
    padding: 12px 12px 0;
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

  &Options {
    width: 100%;
    margin: 0;
    padding: 12px 0;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-around;
    align-items: center;
  }

  &Attend {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    width: 90px;

    i {
      width: 23px;
      height: 23px;
      background-size: contain;
      display: inline-block;

      &.--on {
        background-image: url(../assets/images/common-laravel_on.png);
        animation: attend 0.3s ease-in-out forwards;

        & + span::before {
          content: '気になる';
          color: #555;
        }
      }

      @keyframes attend {
        0% {
          transform: scale(3);
          opacity: 0;
        }
        80% {
          transform: scale(0.75);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      &.--off {
        background-image: url(../assets/images/common-laravel_off.png);

        & + span::before {
          content: '気になる';
          color: #999;
        }
      }
    }

    span {
      font-size: 12px;
      font-size: calc((100vw / 375) * 12);
      font-weight: bold;
      margin-left: 5px;
      position: relative;
    }
  }

  &Favorites {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;

    i {
      width: 23px;
      height: 20px;
      background-size: contain;
      display: inline-block;

      &.--on {
        background-image: url(../assets/images/common-fav_on.png);
        animation: fav 0.3s ease-in-out forwards;
      }

      @keyframes fav {
        0% {
          transform: scale(0);
        }
        80% {
          transform: scale(1.5);
        }
        100% {
          transform: scale(1);
        }
      }

      &.--off {
        background-image: url(../assets/images/common-fav_off.png);
      }
    }

    span {
      font-size: 16px;
      font-size: calc((100vw / 375) * 16);
      margin-left: 5px;
    }
  }

  &Twitter {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;

    i {
      width: 23px;
      height: 20px;
      background: url(../assets/images/common-twitter_icon.png) no-repeat center;
      background-size: contain;
      display: inline-block;
    }

    span {
      font-size: 14px;
      font-size: calc((100vw / 375) * 14);
      margin-left: 5px;
    }
  }
}
</style>
