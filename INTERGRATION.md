## Using Library in standalone app outside this workspace
This assumes you have npm, node, ng already installed

### USING SELF HOSTED YARN/NPM PACKAGE
This assumes you have publish `dist/amp-ng-library` with verdaccio through `npm publish --registry http://localhost:4873` if not please install [verdaccio](https://github.com/verdaccio/verdaccio) once it running, here is a quick run through:
```shell
npm install verdaccio
verdaccio #runs verdaccio server
# on a new tab
ng build
cd dist/amp-ng-library
npm publish --registry http://localhost:4873
```
Create a new app:
```shell 
ng new <app_name>
# if using hosted self hosted npm
yarn config set registry http://localhost:4873 #or you url
yarn add amp-ng-library
```
#### Install bootstrap in the project using the `amp-ng-library`
```bash
yarn install bootstrap
yarn install font-awesome@4.7.0
```
#### For Webpack, add the following in your global css:
```scss
@import "./scss/bootstrap/dist/css/bootstrap.min.css";
@import "scss/bootstrap/scss/bootstrap.scss"
```

#### Or add these lines to `index.html`
Add to the header of the file:
```html
<!-- using online bootstrap -->
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
<!-- or using the bootstrap shipped with the amp-ng-library  -->
<link type="text/css" rel="stylesheet" href="assets/css/bootstrap-4.3.1.min.css" />
```
Add font-awesome in `angular.json`:
```json
"styles": [
    "node_modules/font-awesome/css/font-awesome.min.css"
]
```
Add to the very end of the body of `index.html`.:
```html
<!-- using bootstrap from online -->
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
<!-- using bootstrap from the library -->
<script src="assets/js/jquery-3.3.1.slim.min.js"></script>
<script src="assets/js/popper.min.js"></script>
<script src="assets/js/bootstrap-4.3.1.min.js"></script>
```

#### Configure the application
Configure the library assets by adding this to your app `angular.json`. This tells the application to load assets from the specified directory in the installed `node_modules` folder. This is so that the library knows where to look for its assets for your app.
```json
{
    "glob": "**/*",
    "input": "./node_modules/amp-ng-library/assets",
    "output": "/assets/"
}
```
### Using self build/compile. follow these steps
Everything mentions in [USING SELF HOSTED YARN/NPM PACKAGE](#using-self-hosted-yarnnpm-package) remains except the method of adding the library to the app

To include the library to the app, run `link-library.sh` clones and compiles library in your current working dir.

include the dependency in the `package.json`
```json
"dependencies": {
    ...
    "amp-ng-library": "file:./AMPNGLibrary/dist/amp-ng-library",
    ....
},
...
```
Then run clean build:
```typescript
yarn cache clean
rm -rf node_modules/
rm package.lock.json //or
rm yarn.lock.json
yarn install
```