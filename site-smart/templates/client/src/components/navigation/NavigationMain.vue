<template>
<md-toolbar class="container">
      <h3 class="md-title" style="flex: 1">
        <router-link class="logo" to="/">
          <img src="../../assets/logo-smart.png">
        </router-link>
      </h3>
      <md-menu-content>
      <!-- -->
      <md-menu-item
        class="nav__item nav__link"
        tag="li"
        active-class="-active"
        :href="nav.url"
        :to="nav.url"
        :key="nav.name"
        v-for="nav in navs">
        <!--<a class="nav__link" :href="nav.httpUrl">{{ nav.name }}</a>-->
        <a>{{ nav.name }}</a>
      </md-menu-item>
        <!--
        <router-link class="nav__item nav__link" tag="li" active-class="-active" to="/manage">NO-Manage</router-link>
         -->
        <!-- <router-link class="nav__item nav__link" tag="li" active-class="-active" :to="{ name: 'user-register' }">Register</router-link> -->
        <!-- <li class="nav__item"><a class="nav__item nav__link" href='http://smart.dev/processwire'>Admin</a></li> -->
    </md-menu-content>
      <md-button class="md-icon-button">
        <md-icon>more_vert</md-icon>
      </md-button>
</md-toolbar>

</template>

<script>
  import { mapGetters } from 'vuex'
  
  export default {
    name: 'NavigationMain',
    // data: () => { return { manage: PwManage } },
    computed: {
      ...mapGetters([
        'navData'
      ]),
      navs() {
        if (!(this.navData.length)) return
        // remove home page from array
        console.log(this.navData)
        return this.navData.slice(1, this.navData.length)
      }
    }
  }
</script>
