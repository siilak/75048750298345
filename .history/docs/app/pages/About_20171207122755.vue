<template>
  <page-container centered :title="$t('pages.about.title')">
    <section class="page-container-section">
      <h2 class="md-headline">Tele2 Material</h2>
      <strong>Material Design for Vue.js</strong>
      <p>Tele2 Material is simple, lightweight and built exactly according to the Google Material Design specs.</p>
      <p>Build well-designed apps that can fit on every screen with support to all modern Web Browsers with dynamic themes, components on demand and all with an ease-to-use API.</p>
    </section>

    <section class="page-container-section">
      <h2 class="md-title">Want to pay me a coffee?</h2>

      <p>I don't drink coffee, but I can easily turn this into a strong and bold IPA beer... Or a burger... Or a Redbull! If you think that this project helped you or your company in any way, you can consider become a backer/sponsor on Patreon.</p>
      <a href="https://www.patreon.com/bePatron?u=4832202" target="_blank" class="about-patreon">
        <img src="/assets/sponsors/patreon.png">
      </a>
    </section>

    <section class="page-container-section">
      <h2 class="md-title">Want to contribute with the Project?</h2>

      <p>Well. All kind of help are welcome. If you want to contribute with the project, just send me a message and I will tell what you can do. We have a <a href="https://join.slack.com/t/vuematerial/shared_invite/MTgzMzU2NDQ5ODkwLTE0OTQ4MDI3MDAtNWYyZjhkNzEzMA">Slack Channel</a> to share ideas and to keep all the comunication in one place.</p>
    </section>

    <section class="page-container-section">
      <h2 class="md-title">Need extra help?</h2>

      <p>I'm always online on our <a href="https://join.slack.com/t/vuematerial/shared_invite/MTgzMzU2NDQ5ODkwLTE0OTQ4MDI3MDAtNWYyZjhkNzEzMA">Slack channel</a>. If you need anything, fell free to ask me directly there. :)</p>
    </section>

    <section class="page-container-section">
      <h2 class="md-title">What is the Browser Support?</h2>

      <p>Tele2 Material supports the latest version of all Browsers</p>
    </section>

    <section class="page-container-section">
      <h2 class="md-title">What about the license?</h2>
      <p><a href="https://github.com/vuematerial/tele2-material/blob/dev/LICENSE" target="_blank">MIT</a>. Always. Forever!</p>
    </section>

    <section class="page-container-section">
      <h2 class="md-title">Credits and Thanks</h2>
      <ul>
        <li><a href="https://github.com/elviskang" target="_blank">elviskang</a> for donating the npm package name!</li>
        <li><a href="https://github.com/brunocastro" target="_blank">Bruno Castro</a> for the awesome Tele2 Material Logo. <logo-tele2-material animated /></li>
      </ul>
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
