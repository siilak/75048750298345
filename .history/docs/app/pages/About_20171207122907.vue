<template>
  <page-container centered :title="$t('pages.about.title')">
    <section class="page-container-section">
      <h2 class="md-headline">Tele2 Material</h2>
      <strong>Material Design for Vue.js</strong>
      <p>Tele2 Material is simple, lightweight and built exactly according to the Google Material Design specs.</p>
      <p>Build well-designed apps that can fit on every screen with support to all modern Web Browsers with dynamic themes, components on demand and all with an ease-to-use API.</p>
    </section>

    <section class="page-container-section">
      <h2 class="md-title">What is the Browser Support?</h2>

      <p>Tele2 Material supports the latest version of all Browsers</p>
    </section>

    <section class="page-container-section">
      <h2 class="md-title">What about the license?</h2>
      <p><a href="https://github.com/vuematerial/tele2-material/blob/dev/LICENSE" target="_blank">MIT</a>. Always. Forever!</p>
    </section>

  </page-container>
</template>

<script>
  export default {
    name: 'About'
  }
</script>

<style lang="scss" scoped>
  .author-card {
    display: inline-flex;
    align-items: center;

    .md-avatar {
      margin-right: 16px;
    }

    .author-card-info {
      display: flex;
      flex-flow: column;
      flex: 1;
    }

    span {
      font-size: 16px;
    }

    .author-card-links {
      display: flex;
      flex-direction: column;
    }
  }

  .logo-tele2-material {
    width: 24px;
    display: inline-block;
    vertical-align: middle;
  }

  .about-patreon {
    max-width: 180px;
    display: inline-block;
  }
</style>
