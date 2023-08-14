# eLogical

![TeamCity build status](https://teamcity.sedrad.com/app/rest/builds/buildType:id:ELogical_Build/statusIcon.svg)

Mobile eLearning PWA to teach solving boolean formulas which are randomly generated and visualized as trees.

<img src="https://github.com/srad/eLogical/blob/master/assets/media/0.jpg?raw=true" width="30%"> <img src="https://github.com/srad/eLogical/blob/master/assets/media/1.jpg?raw=true" width="30%"> <img src="https://github.com/srad/eLogical/blob/master/assets/media/2.jpg?raw=true" width="30%">

The application is build on Vue 2.x and many other libraries for the visualization

The project [eLogical.API](https://github.com/srad/eLogical.API) is used as a service to do user management and to track analytics data.

## Build

### Docker

Since the api url and a secret key must be available statically on the client, you must create your own docker image build:

```shell
docker build \
   --build-arg API_URL=https://api.example.com \
   --build-arg ENCRYPT_KEY=1234 \
   -t elogical .
```

### Dev environment

```bash
git clone https://github.com/srad/eLogical.git
cd eLogical
npm install
npm run serve
```

## Commands

Command                    | Description
---------------------------|---------------------------------------------------------------------------------------
npm install                | Install dependencies
npm run serve              | Compiles and hot-reloads for development
npm run build              | Compiles and minifies for production
npm run test:unit          | Run your unit tests
npm run lint               | Lints and fixes files
