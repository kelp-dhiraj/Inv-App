// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  adalConfig: {
    tenant: 'truenorth.co.in',
    clientId: '82a27711-b598-46d5-b5c8-8bd0e0c157ef',
    postLogoutRedirectUri: 'http://inv-dev.truenorth.co.in/logout',
    endpoints: {
      'http://inv-dev.truenorth.co.in': '82a27711-b598-46d5-b5c8-8bd0e0c157ef'
    },
  },
  apiUrl: 'http://inv-dev.truenorth.co.in/api',
  openApiUrl: 'http://inv-dev.truenorth.co.in/open/api'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
