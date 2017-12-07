<template>
  <md-content md-tag="section" md-theme="default" class="home-sponsors">
  </md-content>
</template>

<script>
  import MdSvgLoader from 'tele2-material/components/MdSvgLoader/MdSvgLoader'

  export default {
    name: 'HomeSponsors',
    components: {
      MdSvgLoader
    }
  }
</script>

<style lang="scss" scoped>
  @import "~tele2-material/components/MdAnimation/variables";
  @import "~tele2-material/components/MdLayout/mixins";

  .home-sponsors {
    width: calc(100% + 32px);
    margin: 0 -16px -16px;
  }

  .page-wrapper {
    max-width: 1344px;
    margin: 0 auto;
    padding: 56px 16px;
  }

  .home-sponsors-title {
    margin-bottom: 56px;
    color: rgba(#000, .87);
  }

  .home-sponsors-patreon {
    max-width: 180px;
    display: inline-block;
  }

  .home-sponsors-backers {
    margin-top: 36px;
  }

  .home-sponsor {
    color: #000 !important;

    + .home-sponsor {
      margin-left: 16px;
    }

    .md-ripple {
      padding: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border-radius: 2px;
    }

    img,
    >>> svg,
    .md-svg-loader {
      max-width: 256px;
      max-height: 96px;
      display: block;
    }
  }

  .home-sponsor-list {
    margin-bottom: 36px;
  }
</style>
