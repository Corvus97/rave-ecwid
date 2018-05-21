// Get app public config value from Ecwid
var raveConfig = Ecwid.getAppPublicConfig('rave-payments');
raveConfig = JSON.parse(raveConfig);

console.log(raveConfig);

// If the app is enabled in storefront
if(raveConfig.enabled == true) {

    console.log('test');
}