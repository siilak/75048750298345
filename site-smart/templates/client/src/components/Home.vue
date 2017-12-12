<template>
    <div class="home typography" v-if="loadedData">
        <v-layout row>

            <v-flex xs12 sm6 v-if="hasTitle">
                <h1 class="light">{{ pageData.title.data }}</h1>
            </v-flex>

            <v-flex xs12 sm6 v-if="hasContent">
                <div class="txt" v-html="pageData.content.data"></div>
            </v-flex>
        </v-layout>
    </div>
</template>

<script>
  import * as config from '@/config'
  import {mapGetters} from 'vuex'

  export default {
    name: 'Home',
    computed: {
      ...mapGetters([
        'loading',
        'pageData'
      ]),
      loadedData() {
        return !this.loading && this.$route.path === this.pageData.url
      },
      hasTitle() {
        return this.pageData.title
      },
      hasContent() {
        return this.pageData.content && this.pageData.content.length
      }
    },
    watch: {
      '$route': 'fetchData'
    },
    methods: {
      fetchData() {
        let loaderTimer = new Date()
        this.$store.dispatch('setPageData', this.$route.path).then(() => {
          let loaderTimerDiff = 1000 - (Date.now() - loaderTimer)
          setTimeout(() => {
            this.$store.dispatch('loading', false)
          }, loaderTimerDiff)
        })
      }
    },
    metaInfo() {
      return {
        title: this.pageData.title.data || config.titleFallback,
        meta: [
          {
            vmid: 'description',
            name: 'description',
            content: this.pageData.summary || config.description
          }
        ],
        bodyAttrs: {
          class: `-${this.pageData.template}`
        }
      }
    },
    created() {
      this.fetchData()
    }
  }
</script>
