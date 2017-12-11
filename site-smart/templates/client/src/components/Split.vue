<template>
  <div class="default typography" v-if="loadedData">
  
    <v-layout row>
  
      <v-flex xs12 sm7>
        <h1 class="light">{{ pageData.title.data }}</h1>
        <v-card light>
          <v-card-text>
            <div class="txt" v-html="pageData.content.data"></div>
  
            <div class="faqs" v-if="hasFAQ">
              <div class="faq">
                <div v-for="faq in pageData.faq_list">
                  <v-btn color="primary" dark @click.stop="dialog = true">{{ faq.title }}</v-btn>
                  <v-dialog v-model="dialog" transition="dialog-bottom-transition" :overlay=false scrollable>
                    <v-card>
                      <v-toolbar style="flex: 0 0 auto;" dark class="primary">
                        <v-btn icon @click.native="dialog = false" dark>
                          <v-icon>close</v-icon>
                        </v-btn>
                        <v-toolbar-title>Settings</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                          <v-menu bottom right offset-y>
                            <v-btn slot="activator" dark icon>
                              <v-icon>close</v-icon>
                            </v-btn>
                            <v-list>
                              <v-list-tile v-for="item in items" :key="item.title" @click="">
                                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                              </v-list-tile>
                            </v-list>
                          </v-menu>
                        </v-toolbar-items>
                      </v-toolbar>
                      <v-card-text>
                        <v-list three-line subheader>
                          <v-subheader>User Controls</v-subheader>
                          <v-list-tile avatar>
                            <v-list-tile-content>
                              <v-list-tile-title>Content filtering</v-list-tile-title>
                              <v-list-tile-sub-title>Set the content filtering level to restrict apps that can be downloaded</v-list-tile-sub-title>
                            </v-list-tile-content>
                          </v-list-tile>
                        </v-list>
                        <v-divider></v-divider>
                        <v-list three-line subheader>
                          <v-subheader>General</v-subheader>
                          <v-list-tile avatar>
                            <v-list-tile-action>
                              <v-checkbox v-model="notifications"></v-checkbox>
                            </v-list-tile-action>
                            <v-list-tile-content>
                              <v-list-tile-title>Notifications</v-list-tile-title>
                              <v-list-tile-sub-title>Notify me about updates to apps or games that I downloaded</v-list-tile-sub-title>
                            </v-list-tile-content>
                          </v-list-tile>
                        </v-list>
                      </v-card-text>
  
                      <div style="flex: 1 1 auto;"></div>
                    </v-card>
                  </v-dialog>
  
                </div>
              </div>
            </div>
  
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
        title: this.pageData.title || config.titleFallback,
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
