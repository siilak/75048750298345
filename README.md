ProcessVue is a Tele2 boilerplate for getting started with ProcessWire 3.0 as a headless CMS for Vue 2.0 SPAs.

## Tele2 Sites
- `site-smart`

## Installation

1. Extract this repository in your local machine
2. Install `site-smart/assets/backups/database/manual.sql` database which is included on the root of this repo
3. Update `site-smart/config.php` with your local machine settings, depends on your MAMP or other. Example domain name: smart.dev
4. Update `site-smart/templates/client/config/index.js` proxyTable with the right domain name
4. Install npm packages from `site-smart/templates/client` by running `npm install` 
5. Run webpack dev server by running `site-smart/templates/client/ && npm run dev`, (http://localhost:8010) or compile all assets with `npm run build` and then run with a http://smart.dev

## Admin Login

- User: admin
- Pass: fjr5FsA234

## TODO's

- All development is described: http://smart.dev/admin/todo/

## API Features:

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

## Extra modules

- CronjobDatabaseBackup & ProcessDatabaseBackups for database backups
- ProcessCustomUploadNames - for uploading images with a custom file names
- MarkupSocialShareButtons - for content social sharing
- InputfieldCKEditor - CKEditor for a content