<template>
  <v-ons-page class="tabbar-page">
    <v-ons-tabbar
      position="auto"
      animation="none"
      :tabs="tabs"
      :visible="true"
      :index.sync="tabIndex"
    >
    </v-ons-tabbar>
  </v-ons-page>
</template>

<script>
import TopPage from '@/pages/Top'
import TimeTablePage from '@/pages/TimeTable'
import MyTimeTablePage from '@/pages/MyTimeTable'
import SponsorPage from '@/pages/Sponsor'
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      label: '',
      tabs: [
        {
          icon: 'fa-photo',
          label: 'トップ',
          page: TopPage
        },
        {
          icon: 'fa-clock-o',
          label: 'タイムテーブル',
          page: TimeTablePage
        },
        {
          icon: 'fa-thumbs-o-up',
          label: '気になる',
          page: MyTimeTablePage
        },
        {
          icon: 'fa-handshake-o',
          label: 'スポンサー',
          page: SponsorPage
        }
      ]
    }
  },
  computed: {
    ...mapState('tabbar', ['index']),
    tabIndex: {
      get: function() {
        return this.index
      },
      set: function(newValue) {
        this.set(newValue)
      }
    }
  },
  methods: {
    ...mapMutations('tabbar', ['set'])
  },
  components: { TopPage, SponsorPage, TimeTablePage, MyTimeTablePage }
}
</script>
<style>
.tabbar__button {
  color: #999 !important;
}

:checked + .tabbar__button {
  color: #f4645f !important;
}
</style>
