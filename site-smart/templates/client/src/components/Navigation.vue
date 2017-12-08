<template>
    <div class="nav">
      <router-link
        active-class="active"
        :to="nav.url"
        :key="nav.name"
        v-for="nav in navs">
        <a :href="nav.httpUrl">{{ nav.name }}</a>
      </router-link>
    </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'Navigation',
    computed: {
      ...mapGetters([
        'navData'
      ]),
      navs() {
        if (!(this.navData.length)) return
        // remove home page from array
        return this.navData.slice(1, this.navData.length)
      }
    }
  }
</script>
