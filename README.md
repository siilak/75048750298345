<p align="center">Material Design for Vue.js</p>

Tele2 Material is Simple, lightweight and built exactly according to the Google <a href="http://material.google.com" target="_blank">Material Design</a> specs

Build well-designed apps that can fit on every screen with support to all modern Web Browsers with dynamic themes, components on demand and all with an ease-to-use API

## Installation and Usage

Install Tele2 Material through npm or yarn

``` bash
npm install tele2-material@beta --save
yarn add tele2-material@beta
```

``` javascript
import Vue from 'vue'
import Tele2Material from 'tele2-material'
import 'tele2-material/dist/tele2-material.min.css'

Vue.use(Tele2Material)
```

Or use individual components:

``` javascript
import Vue from 'vue'
import { MdButton, MdContent, MdTabs } from 'tele2-material/dist/components'
import 'tele2-material/dist/tele2-material.min.css'

Vue.use(MdButton)
Vue.use(MdContent)
Vue.use(MdTabs)
```

Alternativelly you can <a href="https://github.com/vuematerial/tele2-material/archive/master.zip" target="_blank" rel="noopener">download</a> and reference the script and the stylesheet in your HTML:

``` html
<link rel="stylesheet" href="path/to/tele2-material.css">
<script src="path/to/tele2-material.js"></script>
```

Optionally import Roboto font from Google CDN:

``` html
<link rel="stylesheet" href="//fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic">
<link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons">
```

### ProcessVue is a Tele2 boilerplate for getting started with ProcessWire 3.0 as a headless CMS for Vue 2.0 SPAs.

## Features:

- REST API
  - Fetch title fields
  - Fetch textearea fields 
  - Fetch image/gallery fields (included resizing)
  - Fetch repeater fields
  - Fetch children pages
- Vue Webpack boilerplate
- Vue Router
- Vue Meta (to update metatags)
- Vuex (store management)

## Installation

1. Extract this repository in your local machine
2. Install `processvue_pw.sql` database which is included on the root of this repo
3. Update `site/config.php` with your local machine settings
4. Update `site/templates/client/config/index.js` proxyTable with the right domain name
4. Install npm packages from `site/templates/client` by running `npm i` 
5. Run webpack dev server by running `npm run dev`, or compile all assets with `npm run build`

## Processwire Login

- User: **admin**
- Pass: **password**

## Browser Support

Tele2 Material supports all [modern browsers](http://browserl.ist/?q=%3E%3D+1%25).
