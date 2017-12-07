<template>
  <div>Hi, I'm the MANAGER. What needs to be managed?</div>
</template>

<script>

  export default {
    name: 'PwManage',
    mounted: function() {
      this.$store.dispatch('loading', false)
    }
  }
</script>
