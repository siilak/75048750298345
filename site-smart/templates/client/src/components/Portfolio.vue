<template>
  <div class="default typography" v-if="loadedData">
      <h1 v-if="show" transition="fadeLeft" class="light">{{ pageData.title.data }}</h1>

    <v-layout row v-if="hasGallery">
      <v-flex m12 v-for="img in pageData.gallery">
        <img :src="img.full.httpUrl" alt="">
      </v-flex>
    </v-layout>

    <v-layout row v-if="hasVideo">
      <v-flex m12 v-for="video in pageData.video">
        {{ video }}
      </v-flex>
    </v-layout>

    <v-layout row>

      <div v-for="page in pageData.children" v-if="hasChildren">
        <router-link class="logo" :to="page.url">
          {{ page.title.data }}
          {{ page.image }}
        </router-link>
      </div>

    </v-layout>

  </div>
</template>

<script>
  import * as config from '@/config'
  import {mapGetters} from 'vuex'
  
  export default {
    name: 'Portfolio',
    components: {
      // Weather
    },
    computed: {
      ...mapGetters([
        'loading',
        'pageData'
      ]),
      loadedData() {
        return !this.loading && this.$route.path === this.pageData.url
      },
      hasGallery() {
        return this.pageData.gallery && this.pageData.gallery.length
      },
      hasImage() {
        return this.pageData.image && this.pageData.image.length
      },
      hasVideo() {
        return this.pageData.video && this.pageData.video.length
      },
      hasFAQ() {
        return this.pageData.faq_list && this.pageData.faq_list.length
      },
      hasChildren() {
        return this.pageData.children && this.pageData.children.length
      }
    },
    watch: {
      '$route': 'fetchData'
    },
    methods: {
      fetchData() {
        let loaderTimer = new Date()
        this.$store.dispatch('setPageData', `${this.$route.path}?children=1`).then(() => {
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
