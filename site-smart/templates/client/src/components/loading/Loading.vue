<template>
  <transition name="fade">
    <div class="loader" v-show="loading">Loading</div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Loading',
  computed: {
    ...mapGetters([
      'loading'
    ])
  }
}
</script>

