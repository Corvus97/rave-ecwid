// Set payment method title that matches merchant's payment method title set in Ecwid Control Panel. Use public token to get it from store profile

    var paymentMethodTitle = "PayPal";

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
