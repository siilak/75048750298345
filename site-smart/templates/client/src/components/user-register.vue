<style>
button.success {
  background-color: red;
}

</style>

<template>
<div>
  <div>
    <input v-model='firstName' type="text" placeholder="Vorname">
    <input v-model='lastName' type='text' placeholder="Nachname">
    <input v-model='company' type='text' placeholder="Firma">
  </div>
  <div>
    <input v-model='address' type='text' placeholder='Adresse'>
    <input v-model='postalCode' type='text' placeholder='Postleitzahl'>
    <input v-model='city' type='text' placeholder='Ort'>
    <input v-model='state' type='text' placeholder='Provinz'>
    <input v-model='country' type='text' placeholder='Land'>
  </div>
  <div>
    <input v-model='landline' type='text' placeholder='Festnetz'>
    <input v-model='mobile' type='text' placeholder='Mobile'>
    <input v-model='email' type='text' placeholder='E-mail'>
  </div>
  <div>
    <input v-model='password' type='password' placeholder='Passwort'>
    <input v-model='duplicate' type='password' placeholder='Bestätigen Sie Ihr Passwort*'>
  </div>
  <button @click='createAccount' :class='{success: success}'>Konto erstellen</button>
</div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'UserRegister',
    data: () => ({
      firstName: '',
      lastName: '',
      company: '',
      address: '',
      postalCode: '',
      city: '',
      state: '',
      country: '',
      landline: '',
      mobile: '',
      email: '',
      password: '',
      duplicate: '',
      success: false
    }),

    methods: {
      createAccount() {
        axios({
          method: 'post',
          url: '/api/register/',
          headers: {'X-Requested-With': 'XMLHttpRequest'},
          data: {
            firstName: this.firstName,
            lastName: this.lastName,
            company: this.company,
            address: this.address,
            postalCode: this.postalCode,
            city: this.city,
            state: this.state,
            country: this.country,
            landline: this.landline,
            mobile: this.mobile,
            email: this.email,
            password: this.password
          }
        })
        .then(response => {
          console.log(response)
          this.success = true
        })
        .catch(error => {
          console.log(error)
          this.success = false
        })
      }
    },
    mounted: function() {
      this.$store.dispatch('loading', false)
    }
  }
</script>
