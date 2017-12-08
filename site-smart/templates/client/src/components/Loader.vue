<template>
  <transition name="tr-loader-fade">
    <div class="loader">
      <v-progress-circular indeterminate v-show="loading" v-bind:size="70" v-bind:width="7" class="white--text"></v-progress-circular>
    </div>
  </transition>
</template>

<script>
  import { mapGetters } from 'vuex'
  export default {
    name: 'Loader',
    computed: {
      ...mapGetters([
        'loading'
      ])
    }
  }
</script>
