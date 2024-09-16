// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  adalConfig: {
    tenant: 'kelpglobal.com',
    clientId: '4de24a49-50a9-463f-abdd-0e0a78f4b8db',
    postLogoutRedirectUri: 'https://alphav2.kelpglobal.com:7442/logout',
    endpoints: {
      'https://alphav2.kelpglobal.com:7442': '4de24a49-50a9-463f-abdd-0e0a78f4b8db'
    },
  },
  apiUrl: 'https://alphav2.kelpglobal.com:7442/api',
  openApiUrl: 'https://alphav2.kelpglobal.com:7442/open/api',
  clientId:'793e81da-af47-414a-a2c9-5e4b32e767f7'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
