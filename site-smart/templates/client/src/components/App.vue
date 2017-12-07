<template>
  <div id="app" @click="linkHandler" v-if="loadedData">
    <NavigationMain></NavigationMain>
    <Loading></Loading>
    <router-view></router-view>
  </div>
</template>

<script>

  // App components
  import * as config from '@/config'
  import router from '@/router'
  import NavigationMain from '@/components/navigation/NavigationMain'
  import Loading from '@/components/loading/Loading'
  
  // App export
  export default {
    name: 'App',
    components: {
      NavigationMain,
      Loading
    },
    computed: {
      loadedData() {
        return !this.loading
      }
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
        return ((url.indexOf(':') > -1 || url.indexOf('//') > -1) && this.checkDomain(window.location.href) !== this.checkDomain(url))
      },
      linkHandler(e) {
        // let $typ = e.target.closest('.typography')
        let $link = e.target
        if (!$link) return
        let linkHref = $link.getAttribute('href')
        // allow default to occur if it is external or it doesn't have an href.
        if (!linkHref || this.linkIsExternal(linkHref)) return

        e.preventDefault()
        router.push({ path: linkHref })
      }
    },
    metaInfo: {
      title: config.title,
      meta: [
        {
          vmid: 'description',
          name: 'description',
          content: config.description
        }
      ],
      titleTemplate: `%s | ${config.websiteName}`
    },
    created() {
      this.fetchData()
    }
  }
</script>
