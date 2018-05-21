// Set payment method title that matches merchant's payment method title set in Ecwid Control Panel. Use public token to get it from store profile

    var paymentMethodTitle = "Rave";

// Custom styles for icons for our application


var publicToken = Ecwid.getAppPublicToken('rave-payments');
var storeId = Ecwid.getOwnerId('rave-payments');
var theUrl = `https://app.ecwid.com/api/v3/${storeId}/profile?token=${publicToken}`;

var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    
    console.log(xmlHttp.responseText);


    var customStyleForPaymentIcons = document.createElement('style');
    customStyleForPaymentIcons.innerHTML = ".ecwid-PaymentMethodsBlockSvgCustom { width: 100%; display: inline-block; height: auto;}";

    document.querySelector('body').appendChild(customStyleForPaymentIcons);

// Set your custom icons or use your own URLs to icons here

    var iconsSrcList = [
        'https://rave.deatt.com/rave.png'
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
