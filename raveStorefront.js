function createEcwidSDK() {

  return {
    init: init,
    ready: ready,
    setSize: setSize,
    openPage: openPage,
    closeAppPopup: closeAppPopup,
    getPayload: getPayload,
    getAppStorage: getAppStorage,
    setAppStorage: setAppStorage,
    setAppPublicConfig: setAppPublicConfig,
    getAppPublicConfig: getAppPublicConfig,
    sendUserToUpgrade: sendUserToUpgrade
  }

  var app_id, lastHeight, payload, initialized

  function init(params) {
    checkNotInitialized()
    checkCondition(isObject(params), "The argument is not an object")
    if (params.app_id != null) {
      checkCondition(isString(params.app_id), "'app_id' param must be string")
    }
        payload = getPayloadFromHash() || getPayloadFromParam();
    app_id = params.app_id
    initialized = true

    if (!!params.autoloadedflag) {
      window.addEventListener("load", function(e) {
        ready()
      })
    }

    if (!!params.autoheight) {
      window.setInterval(function() {
        var height;

        if (/MSIE (6|7|8|9|10).+Win/.test(navigator.userAgent)) {
          // IE shit
          height = Math.max(
            Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
            Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
            Math.max(document.body.clientHeight, document.documentElement.clientHeight)
          );
        } else {
          // Normal browser
          height = document.documentElement.offsetHeight
        }

        if (lastHeight != height) {
          lastHeight = height
          setSize({height: height})
        }
      }, 333)
    }
  }

  function ready() {
    checkInitialized()
    postMessage("ready", {})
  }

  function setSize(params) {
    checkInitialized()
    checkCondition(isObject(params), "The argument is not an object")

    var height;
    if (isInteger(params.height)) {
      height = params.height+"px"
    } else if (isString(params.height)) {
      height = params.height
    } else {
      throw Error("Missing or invalid 'height' param")
    }

    postMessage("setSize", {height: height})
  }

  function postMessage(method, data) {
    checkInitialized()
    window.parent.postMessage(JSON.stringify({
      ecwidAppNs: app_id,
      method: method,
      data: data
    }), "*")
  }

  function isObject(arg) {
    return arg !== null && typeof arg == 'object'
  }

  function isString(arg) {
    return typeof arg == 'string'
  }

  function isInteger(arg) {
    return arg === parseInt(arg)
  }

  function isFunction(arg) {
    return typeof arg == 'function' || false;
  }

  function checkCondition(condition, message) {
    if (!condition) {
      throw Error(message || '')
    }
  }

  function isInitialized() {
    return initialized == true
  }

  function checkInitialized() {
    checkCondition(isInitialized(), "Not initialized")
  }

  function checkNotInitialized() {
    checkCondition(!isInitialized(), "Already initialized")
  }

  function getPayloadFromHash() {
        var hashvalue = window.location.hash;
    if( hashvalue == 'undefined' || hashvalue.length <= 1) {
      if (window.console != 'undefined') {
        window.console.log("Wrong hash value:"+hashvalue);
        return null;
      }
    }
    var encodedPayload = hashvalue.substring(1); // Exclude # from the string
    return decodePayload(encodedPayload);
  }

  function getPayloadFromParam() {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) === 'devpayload') {
        return decodePayload(decodeURIComponent(pair[1]));
      }
    }
    return null;
  }

  function decodePayload(encodedPayload) {
    var payloadStr, decodedPayload;

    try {
      payloadStr = hex2str(encodedPayload);
      decodedPayload = JSON.parse(payloadStr);
    } catch (e) {
      if(typeof(window.console) != 'undefined') {
        window.console.log("Error when parsing json :"+payloadStr+" , retrieved from hex value:"+encodedPayload+" "+e);
      }
    }

    return decodedPayload;
  }

    function hex2str(hexx) {
        var hex = hexx.toString();
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }

  function getPayload() {
    return payload;
  }

  function openPage(page) {
    postMessage("openPage", page)
  }

  function closeAppPopup() {
    postMessage("closeAppPopup")
  }

  function getAppStorage() {
    var callback;
    if (arguments.length === 0) {
      throw Error('No arguments passed');
    }

    function processResponse(text, key) {
      if (text == null) {
        callback(text);
                return;
      }
      if (key) {
        callback(JSON.parse(text).value);
      } else {
        callback(JSON.parse(text));
      }

    }

    // Try to retrieve value by key
    if (isString(arguments[0])) {
      if (arguments.length > 1 && isFunction(arguments[1])) {
        callback = arguments[1];
      } else {
        throw Error('No success callback specified');
      }

      ajax(
                getApiDomain() + payload.store_id + '/storage/' + arguments[0] + '?token=' + payload.access_token,
                function (e) {
                    if (e.target.readyState > 3) {
                        if (e.target.status == 200) {
                            processResponse(e.target.responseText, true);
                        } else if (e.target.status == 404) {
                            processResponse(null, true);
                        } else if (arguments.length > 2 && isFunction(arguments[2])) {
                            arguments[2](e.target);
                        }
                    }
                },
                'GET'
            );
    } else {
      if (isFunction(arguments[0])) {
        callback = arguments[0];
      } else {
        throw Error('No success callback specified');
      }
      ajax(
                getApiDomain() + payload.store_id + '/storage?token=' + payload.access_token,
                function (e) {
                    if (e.target.readyState > 3 && e.target.status == 200) {
                        processResponse(e.target.responseText);
                    } else if (arguments.length > 1 && isFunction(arguments[1])) {
                        arguments[1](e.target);
                    }
                },
                'GET'
            );

    }
  }

  function setAppStorage(kv, callback, errorCallback) {
    for (var k in kv) {
      if (kv.hasOwnProperty(k)) {
        if (isString(k) && isString(kv[k])) {
          ajax(
                        getApiDomain() + payload.store_id + '/storage/' + k + '?token=' + payload.access_token,
                        function (e) {
                            if (e.target.readyState > 3) {
                                if (e.target.status == 200) {
                                    if (isFunction(callback)) {
                                        callback(e.target);
                                    }
                                } else {
                                    if (isFunction(errorCallback)) {
                                        errorCallback(e.target);
                                    }
                                }
                            }
                        },
                        'POST',
                        kv[k]);
        }
      }
    }
  }

    function setAppPublicConfig(config, callback, errorCallback) {
        ajax(
            getApiDomain() + payload.store_id + '/storage/public?token=' + payload.access_token,
            function (e) {
                if (e.target.readyState > 3) {
                    if (e.target.status == 200) {
                        if (isFunction(callback)) {
                            callback(e.target);
                        }
                    } else {
                        if (isFunction(errorCallback)) {
                            errorCallback(e.target);
                        }
                    }
                }
            },
            'POST',
            config
        );
    }

  function getAppPublicConfig(callback, errorCallback) {
    getAppStorage('public', callback, errorCallback);
  }

  function sendUserToUpgrade(features, plan, period) {
    if (features != null) {
      checkCondition(Array.isArray(features), "EcwidApp.sendUserToUpgrade() failed: please pass features array as a parameter");
      checkCondition(features.length > 0, "EcwidApp.sendUserToUpgrade() failed: please pass at least one feature flag as a parameter");
    }
    postMessage("upgradePlan", {features : features, plan: plan, period: period});
  }

  function getApiDomain() {
    return isFunction(window.getEcwidSdkApiDomain) ? window.getEcwidSdkApiDomain() : 'https://app.ecwid.com/api/v3/';
  }

  function ajax(url, callback, method, data) {
    var x = new (this.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
    x.open(method, url, 1);
    x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    x.setRequestHeader('Content-type', 'text/plain; charset=utf-8');
    x.onreadystatechange = callback;
    x.send(data);
  }

}

window.EcwidApp = window.EcwidApp || createEcwidSDK()
// Set payment method title that matches merchant's payment method title set in Ecwid Control Panel. Use public token to get it from store profile

    var paymentMethodTitle = "PayPal";

    // Initialize the application
    EcwidApp.init({
      app_id: "rave-payments", 
      autoloadedflag: true, 
      autoheight: true
    });

    

    console.log(storeData);

    // Get store info
    var storeData = EcwidApp.getPayload();
    var storeId = storeData.store_id;
    var accessToken = storeData.access_token;
    var lang = storeData.lang;

// Custom styles for icons for our application

    var customStyleForPaymentIcons = document.createElement('style');
    customStyleForPaymentIcons.innerHTML = ".ecwid-PaymentMethodsBlockSvgCustom { display: inline-block; width: 40px; height: 26px; background-color: #fff !important; border: 1px solid #e2e2e2 !important;}";

    document.querySelector('body').appendChild(customStyleForPaymentIcons);

// Set your custom icons or use your own URLs to icons here

    var iconsSrcList = [
        'https://djqizrxa6f10j.cloudfront.net/apps/ecwid-api-docs/payment-icons-svg/paypal.svg',
        'https://djqizrxa6f10j.cloudfront.net/apps/ecwid-api-docs/payment-icons-svg/mastercard.svg',
        'https://djqizrxa6f10j.cloudfront.net/apps/ecwid-api-docs/payment-icons-svg/visa.svg',
        'https://djqizrxa6f10j.cloudfront.net/apps/ecwid-api-docs/payment-icons-svg/amex.svg'
    ]

// Function to process current payment in the list

    var getPaymentContainer = function(label) {
        var container = label.parentNode.getElementsByClassName('payment-methods');
        if (container.length === 0) {
            container = [document.createElement('div')];
            container[0].className += 'payment-methods';
            container[0].style.paddingLeft = '18px';
            label.parentNode.appendChild(container[0]);
        }
          return container[0];
    }

// Function to process the payment page

    var ecwidUpdatePaymentData = function() {
        var optionsContainers = document.getElementsByClassName('ecwid-Checkout')[0].getElementsByClassName('ecwid-PaymentMethodsBlock-PaymentOption');

        for (var i = 0; i < optionsContainers.length; i++) {
            var radioContainer = optionsContainers[i].getElementsByClassName('gwt-RadioButton')[0];
            var label = radioContainer.getElementsByTagName('label')[0];

// If current payment method title matches the one you need

            if (paymentMethodTitle && label.innerHTML.indexOf(paymentMethodTitle) !== -1) {
                var container = getPaymentContainer(label);
                if (
                    container
                    && container.getElementsByTagName('img').length === 0
                ) {
                    for (i=0; i<iconsSrcList.length; i++) {
                        var image = document.createElement('img');
                        image.setAttribute('src', iconsSrcList[i]);
                        image.setAttribute('class', 'ecwid-PaymentMethodsBlockSvgCustom');
                        if (container.children.length !== 0) {
                            image.style.marginLeft = '5px';
                        }
                        container.appendChild(image);
                    }
                }
            }
        }
    }


// Execute the code after the necessary page has loaded

    Ecwid.OnPageLoaded.add(function(page){
        if(page.type == "CHECKOUT_PAYMENT_DETAILS"){
            ecwidUpdatePaymentData();
        }
    })
