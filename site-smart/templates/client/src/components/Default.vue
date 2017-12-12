<template>
  <div class="default typography" v-if="loadedData">
    
    <v-layout row transition="fade-in">
      <v-flex xs12 sm3>

        <v-layout row v-if="hasGallery">
          <v-flex xs6 sm4 v-for="img in pageData.gallery.data">
            <img :src="img.thumb.httpUrl" alt="">
          </v-flex>
        </v-layout>

        <div v-for="page in pageData.children" v-if="hasChildren">
          <router-link class="logo" :to="page.url">
            {{ page.title.data }}
          </router-link>
        </div>
      
      </v-flex>
      
      <v-flex xs12 sm9>
        <h1 class="light">{{ pageData.title.data }}</h1>
        <div v-if="hasContent">
          <div class="txt" v-html="pageData.content.data"></div>
        </div>
      </v-flex>
      
    </v-layout>
  
    <div class="galleries" v-if="hasImage">
      <div class="gallery">
        <div v-for="img in pageData.image">
          <a :href="img.origin.httpUrl"><img :src="img.mobile.httpUrl" alt=""></a>
        </div>
      </div>
    </div>
    
    <!-- FAQs (repeater list) example -->
    <div class="faqs" v-if="hasFAQ">
      <h2>FAQs</h2>
      <ul class="faq">
        <li v-for="faq in pageData.faq_list">
          <h3>{{ faq.title }}</h3>
          <div class="faq__text" v-html="faq.content"></div>
        </li>
      </ul>
    </div>
    
  </div>
</template>

<script>
  import * as config from '@/config'
  import {mapGetters} from 'vuex'

  export default {
    name: 'Default',
    computed: {
      ...mapGetters([
        'loading',
        'pageData'
      ]),
      loadedData() {
        return !this.loading && this.$route.path === this.pageData.url
      },
      hasContent() {
        return this.pageData.content
      },
      hasGallery() {
        return this.pageData.gallery && this.pageData.gallery.length
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
