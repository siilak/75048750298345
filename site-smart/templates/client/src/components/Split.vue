<template>
  <div class="default typography" v-if="loadedData">
  
    <v-layout row>
  
      <v-flex xs12 sm7>
        <h1 class="light">{{ pageData.title.data }}</h1>
        <v-card light>
          <v-card-text v-if="hasContent">
            <div class="txt" v-html="pageData.content.data"></div>
          </v-card-text>
        </v-card>
  
      </v-flex>
  
      <v-flex xs12 sm5>
        <div v-if="hasImage">
          <div v-for="img in pageData.image">
            <img :src="img.large.httpUrl" alt="">
          </div>
  
        </div>
      </v-flex>
  
    </v-layout>
  
  </div>
</template>

<script>
  import * as config from '@/config'
  import {
    mapGetters
  } from 'vuex'
  
  export default {
    name: 'Split',
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
      hasContent() {
        return this.pageData.content
      },
      hasImage() {
        return this.pageData.image && this.pageData.image.length
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
        meta: [{
          vmid: 'description',
          name: 'description',
          content: this.pageData.summary || config.description
        }],
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
