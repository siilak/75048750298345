<template>
  <div id="app" @click="linkHandler" v-if="loadedData">
    <v-app id="smart" dark toolbar>
      <v-navigation-drawer temporary v-model="drawer" :mini-variant.sync="mini" dark overflow absolute>
        <v-chip>
          <v-avatar>
            <img src="https://randomuser.me/api/portraits/men/97.jpg" alt="trevor">
          </v-avatar>
          Marko Siilak
        </v-chip>
        <NavigationSide></NavigationSide>
      </v-navigation-drawer>
      <v-toolbar fixed class="material-dark" dark>
        <v-toolbar-side-icon @click.stop="drawer = !drawer">
          <v-logo>
            <img src="./../assets/logo.svg">
          </v-logo>
        </v-toolbar-side-icon>
        <v-spacer></v-spacer>
        <v-toolbar-items class="margin-righ hidden-sm-and-down">
          <Navigation></Navigation>
        </v-toolbar-items>
      </v-toolbar>
      <main>
        <v-container>
          <loader></loader>
          <router-view></router-view>
          <!--v-router-->
        </v-container>
      </main>
    </v-app>
  </div>
</template>

<script>
  import * as config from '@/config'
  import router from '@/router'
  import {
    mapGetters
  } from 'vuex'
  import Navigation from '@/components/Navigation'
  import NavigationSide from '@/components/NavigationSide'
  import Loader from '@/components/Loader'
  import Footer from '@/components/Footer'

  export default {
    name: 'App',
    components: {
      Navigation,
      NavigationSide,
      Footer,
      Loader
    },
    data() {
      return {
        drawer: null,
        mini: false,
        right: null
      }
    },
    computed: {
      loadedData() {
        return !this.loading
      },
      ...mapGetters([
        'pageData'
      ])
    },
    methods: {
      fetchData() {
        this.$store.dispatch('setNavData', '?listing=1&parent_included=1').then(() => {
          this.loading = false
        })
      },
      checkDomain(url) {
        if (url.indexOf('//') === 0) {
          url = window.location.protocol + url
        }
        return url.toLowerCase().replace(/([a-z])?:\/\//, '$1').split('/')[0]
      },
      linkIsExternal(url) {
        return ((url.indexOf(':') > -1 || url.indexOf('//') > -1) && this.checkDomain(window.location.href) !== this.checkDomain(
          url))
      },
      linkHandler(e) {
        let $typ = e.target.closest('.typography')
        let $link = e.target.closest('a')
        if (!$typ || !$link) return

        let linkHref = $link.getAttribute('href')
        if (this.linkIsExternal(linkHref)) return

        e.preventDefault()
        router.push({
          path: linkHref
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

<style lang="scss">
  html {
    overflow-y: scroll;
  }

  .loader {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

</style>
