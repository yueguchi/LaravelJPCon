<template>
  <v-ons-page>
    <v-ons-toolbar static>
        <div class="left">
          <v-ons-toolbar-button @click="goBack">
            <v-ons-icon icon="md-chevron-left" size="24px" style="color: white"/>
          </v-ons-toolbar-button>
        </div>
        <div class="center">詳細</div>
    </v-ons-toolbar>
    <div class="detail">

      <div class="detail-header">
        <div class="detail-headerInfo">
          <p class="date">{{ timeSchedule }}</p>
          <span>{{ timeTable.place }}</span>
        </div>
        <div class="detail-headerTitle">
          <h3>{{ timeTable.title }}</h3>
        </div>
      </div>

      <div class="detail-options">
        <div class="detail-optionsFavorites">
          <i
            ref="likeicon"
            :class="{'--on': isVoted(timeTable.uuid), '--off': !isVoted(timeTable.uuid)}"
            @click="handleClickLike(timeTable.uuid)"></i>
          <span>{{ timeTable.like.count }}</span>
        </div>
        <div class="detail-optionsTwitter">
          <i></i>
          <span>
            <a @click="showTwitterHashTag()">
              #{{ timeTable.hash_tag }}
            </a>
          </span>
        </div>
      </div>

      <div class="detail-description">
        <p>
          {{ timeTable.description }}
        </p>
        <span v-if="isSponsorSession(timeTable.sponsor_id)" class="--sponsor">スポンサー</span>
      </div>

      <div class="detail-speaker">
        <div class="detail-speakerImage">
          <img
            v-if="timeTable.avatar"
            :src="timeTable.avatar">
          <img
            v-else
            src="../assets/images/detail-speaker_img.png">
        </div>
        <ul class="detail-speakerInfo">
          <li class="detail-speakerName">{{ timeTable.speaker }}</li>
          <li class="detail-speakerTwitter" v-show="timeTable.twitter">
            <i></i>
            <span>
              <a @click="showTwitterProfile">@{{ timeTable.twitter }}</a>
            </span>
          </li>
        </ul>
      </div>

    </div>
  </v-ons-page>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import moment from 'moment'
import { incrementsLike, decrementsLike } from '@/libs/api'

export default {
  data() {
    return {
      timeTable: {},
      label: '詳細'
    }
  },
  computed: {
    ...mapGetters('master', ['sponsors']),
    timeSchedule() {
      // 10:20 - 12:00 (1時間40分)
      const startMoment = moment(this.timeTable.start_at)
      const endMoment = moment(this.timeTable.end_at)
      const diffMinutes = endMoment.diff(startMoment, 'minutes')

      return `${startMoment.format('HH:mm')} - ${endMoment.format('HH:mm')} (${diffMinutes}分)`
    }
  },
  methods: {
    ...mapMutations('navigator', ['pop']),
    goBack() {
      this.pop()
    },
    /** likeはDB集計対象なのでAPI叩く */
    async handleClickLike(uuid) {
      try {
        // APIを叩くが、見た目は叩いとこ変えたいので、selectorを操作する
        const likeicon = this.$refs.likeicon
        if (this.isVoted(uuid)) {
          likeicon.className = '--off'
          await decrementsLike(uuid)
          localStorage.removeItem(uuid)
          this.timeTable.like.count--
        } else {
          likeicon.className = '--on'
          await incrementsLike(uuid)
          localStorage.setItem(uuid, true)
          this.timeTable.like.count++
        }
      } catch (error) {
        alert('ネットワークエラー')
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
    isVoted(uuid) {
      return localStorage.hasOwnProperty(uuid)
    },
    showTwitterHashTag() {
      window.open(`https://twitter.com/intent/tweet?hashtags=${this.timeTable.hash_tag}`, '_system')
    },
    showTwitterProfile() {
      window.open(`https://twitter.com/${this.timeTable.twitter}`, '_system')
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

.toolbar {
  background-color: #cb4819;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
}

.toolbar__title {
  font-size: 16px;
  font-size: calc((100vw / 375) * 16);
  font-weight: bold;
  color: #fff;
  background-color: #cb4819;
}

ons-toolbar-button > ons-icon[icon*='ion-'] {
  color: #fff;
}

.detail {
  background: #fff;
  margin-bottom: 16px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
}

.detail-header {
  &Info {
    padding: 12px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;

    .date {
      font-size: 14px;
      font-size: calc((100vw / 375) * 14);
      color: #9a9a9a;
      margin: 0;
      padding: 0;
    }

    span {
      padding: 4px 6px;
      font-size: 12px;
      font-size: calc((100vw / 375) * 12);
      display: inline-block;
      background: #eff2f3;
      color: #9a9a9a;
    }
  }

  &Title {
    padding: 0 12px;

    h3 {
      font-size: 14px;
      font-weight: bold;
      line-height: 1.3;
      margin: 0;
    }
  }
}

.detail-options {
  width: 100%;
  margin: 0;
  padding: 12px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;

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
    margin-left: 40px;

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

.detail-description {
  margin: 0 12px;
  padding: 0 0 12px;
  border-bottom: 1px solid #e5e7eb;

  p {
    white-space: pre-line;
    word-break: break-word;
    font-size: 14px;
    font-size: calc((100vw / 375) * 14);
    line-height: 1.5;
    margin: 0;
  }

  span {
    margin-top: 12px;
    padding: 4px 6px;
    font-size: 12px;
    font-size: calc((100vw / 375) * 12);
    display: inline-block;
    background: #daa520;
    color: #fff;
  }
}

.detail-speaker {
  padding: 20px 12px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;

  &Image {
    width: 120px;

    img {
      width: 120px;
      height: 120px;
      border-radius: 100%;
    }
  }

  &Info {
    flex: 1;
    margin: 0 0 0 20px;
    padding: 0;
    list-style: none;
  }

  &Name {
    font-size: 14px;
    font-size: calc((100vw / 375) * 14);
    font-weight: bold;
  }

  &Twitter {
    margin-top: 10px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
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
