<template>
  <div>
    <md-chips v-model="projects" :md-limit="5" md-placeholder="Add project...">
      <template slot="md-chip" slot-scope="{ chip }">
        {{ chip }} <small v-if="chip === currentProject">(Marko Siilak)</small>
      </template>

      <div class="md-helper-text">Up to 5 projects</div>
    </md-chips>
  </div>
</template>

<script>
  export default {
    name: 'ChipCustomTemplate',
    data: () => ({
      currentProject: 'Tele2 Material',
      projects: [
        'Tele2 Material',
        'Element UI',
        'Quasar'
      ]
    })
  }
</script>

<style lang="scss" scoped>
  small {
    font-weight: 500;
  }
</style>
