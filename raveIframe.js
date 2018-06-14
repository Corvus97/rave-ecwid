// Initialize the application

EcwidApp.init({
	app_id: "rave-payments", // use your application namespace
	autoloadedflag: true,
	autoheight: true
});

var storeData = EcwidApp.getPayload();

var storeId = storeData.store_id;
var accessToken = storeData.access_token;
var language = storeData.lang;
var viewMode = storeData.view_mode;

if (storeData.public_token !== undefined) {
	var publicToken = storeData.public_token;
}

if (storeData.app_state !== undefined) {
	var appState = storeData.app_state;
}

// For getting store information from Ecwid REST API
function httpGet(theUrl) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false); // false for synchronous request
	xmlHttp.send(null);
	return xmlHttp.responseText;
}

var theUrl = 'https://app.ecwid.com/api/v3/' + storeId + '/profile?token=' + publicToken;

var storeProfile = httpGet(theUrl);
storeProfile = JSON.parse(storeProfile);

// Reads values from HTML page and sends them to application config
// To fill values successfully, the input, select or textarea elements on a page must have 'data-name' and 'data-visibility' attributes set.

function readValuesFromPage() {

	var applicationConfig = {
		public: {},
		private: {}
	}

	var allInputs = document.querySelectorAll('input, select, textarea');

	for (i = 0; i < allInputs.length; i++) {
		var fieldVisibility = allInputs[i].dataset.visibility;

		if (fieldVisibility !== undefined) {
			if (allInputs[i].tagName == "INPUT") {

				if (allInputs[i].type == 'checkbox' || allInputs[i].type == 'radio') {
					applicationConfig[fieldVisibility][allInputs[i].dataset.name] = String(allInputs[i].checked);
				}
				if (allInputs[i].type == 'text' || allInputs[i].type == 'number' || allInputs[i].type == 'date') {
					applicationConfig[fieldVisibility][allInputs[i].dataset.name] = allInputs[i].value;
				}
			}
			if (allInputs[i].tagName == "SELECT" || allInputs[i].tagName == "TEXTAREA") {
				applicationConfig[fieldVisibility][allInputs[i].dataset.name] = allInputs[i].value;
			}
		}
	}

	applicationConfig.public = JSON.stringify(applicationConfig.public);

	return applicationConfig;
}

// Reads values from provided config and sets them for inputs on the page. 
// To fill values successfully, the input, select or textarea elements must have 'data-name' and 'data-visibility' attributes set.

function setValuesForPage(applicationConfig) {

	var applicationConfigTemp = {
		public: {},
		private: {}
	};

	// for cases when we get existing users' data

	if (applicationConfig.constructor === Array) {
		for (i = 0; i < applicationConfig.length; i++) {
			if (applicationConfig[i].key !== 'public') {
				applicationConfigTemp.private[applicationConfig[i].key] = applicationConfig[i].value;
			} else {
				applicationConfigTemp[applicationConfig[i].key] = applicationConfig[i].value;
			}
		}
		applicationConfig = applicationConfigTemp;
	}

	applicationConfig.public = JSON.parse(applicationConfig.public);
	var allInputs = document.querySelectorAll('input, select, textarea');

	// Set values from config for input, select, textarea elements

	for (i = 0; i < allInputs.length; i++) {
		var fieldVisibility = allInputs[i].dataset.visibility;

		if (fieldVisibility !== undefined && applicationConfig[fieldVisibility][allInputs[i].dataset.name] !== undefined) {
			if (allInputs[i].tagName == "INPUT") {

				if (allInputs[i].type == 'checkbox' || allInputs[i].type == 'radio') {
					allInputs[i].checked = (applicationConfig[fieldVisibility][allInputs[i].dataset.name] == "true");
					checkFieldChange(allInputs[i]);
				}
				if (allInputs[i].type == 'text' || allInputs[i].type == 'number' || allInputs[i].type == 'date') {
					allInputs[i].value = applicationConfig[fieldVisibility][allInputs[i].dataset.name];
					checkFieldChange(allInputs[i]);
				}
			}
			if (allInputs[i].tagName == "SELECT" || allInputs[i].tagName == "TEXTAREA") {
				allInputs[i].value = applicationConfig[fieldVisibility][allInputs[i].dataset.name];
				checkFieldChange(allInputs[i]);
			}
		}
	}
}

// Default settings for new accounts

var initialConfig = {
	public: {
		env: "false",
		pm: "both",
		logo: "",
		testPublicKey:"",
		testSecretKey:"",
		livePublicKey:"",
		liveSecretKey:"",
		country: storeProfile.company.countryCode
	},
	private: {
		env: "false",
		pm: "both",
		logo: "",
		testPublicKey: "",
		testSecretKey: "",
		livePublicKey: "",
		liveSecretKey: "",
		country: storeProfile.company.countryCode
	}
};


initialConfig.public = JSON.stringify(initialConfig.public);

// Executes when we have a new user install the app. It creates and sets the default data using Ecwid JS SDK and Application storage

function createUserData() {

	// Saves data for application storage 
	EcwidApp.setAppStorage(initialConfig.private, function (value) {
		console.log('Initial private user preferences saved!');
	});

	// Saves data for public app config
	EcwidApp.setAppPublicConfig(initialConfig.public, function (value) {
		console.log('Initial public user preferences saved!');
	});

	// Function to prepopulate values of select, input and textarea elements based on default settings for new accounts
	setValuesForPage(initialConfig);

	selected();
	setInfo();
	loadReq();

	document.querySelector("#body").style.display = 'block';
}

//Checks when to put the required text
function loadReq() {
	if (document.querySelector('#liveSecretKey').value.length > 7) {
		document.querySelector("#liveSecretKeyReq").style.display = 'none';
	}

	if (document.querySelector('#testSecretKey').value.length > 7) {
		document.querySelector("#testSecretKeyReq").style.display = 'none';
	}

	if (document.querySelector('#livePublicKey').value.length > 7) {
		document.querySelector("#livePublicKeyReq").style.display = 'none';
	}

	if (document.querySelector('#testPublicKey').value.length > 7) {
		document.querySelector("#testPublicKeyReq").style.display = 'none';
	}
}

// Executes if we have a user who logs in to the app not the first time. We load their preferences from Application storage with Ecwid JS SDK and display them in the app interface

function getUserData() {

	// Retrieve all keys and values from application storage, including public app config. Set the values for select, input and textarea elements on a page in a callback

	EcwidApp.getAppStorage(function (allValues) {
		setValuesForPage(allValues);
		selected();
		setInfo();
		loadReq();
		document.querySelector("#body").style.display = 'block';
	});

}

// Set's an alert info if a country or currency not supported by Rave is selected so as to inform the user.
function setInfo() {
	var currency = storeProfile.formatsAndUnits.currency;
	var country = storeProfile.company.countryCode;

	if (currency == "NGN") {
		document.querySelector("#paymentMethod").style.display = 'block';
	} else {
		document.getElementById('paymentMethodList').value = "both";
		saveUserData();
	}
	
	if (country != "NG" && country != "KE" && country != "US" && country != "GH" && country != "ZA") {
		document.querySelector("#no-country").style.display = 'block';
	} else {
		if (country == "NG" || country == "US") {
			if (currency != "NGN" && currency != "USD" && currency != "EUR" && currency != "GBP" && currency != "KES") {
				document.getElementById("supported-currencies").innerHTML="NGN, EUR, USD, GBP, KES";
				document.querySelector("#currencies-info").style.display = 'block';
			}
		} else if (country == "KE") {
			if (currency != "KES" && currency != "USD") {
				document.getElementById("supported-currencies").innerHTML = "KES, USD";
				document.querySelector("#currencies-info").style.display = 'block';
			}
		} else if (country == "GH") {
			if (currency != "GHS" && currency != "USD") {
				document.getElementById("supported-currencies").innerHTML = "GHS, USD";
				document.querySelector("#currencies-info").style.display = 'block';
			}
		} else if (country == "ZA") {
			if (currency != "ZAR") {
				document.getElementById("supported-currencies").innerHTML = "ZAR";
				document.querySelector("#currencies-info").style.display = 'block';
			}
		}
	}
}

// Show's the required fields depending on staging or live.
function selected() {
	var dropDown = document.querySelector("#staging_env").checked;

	if (dropDown) {
		document.querySelector("#staging-rave").style.display = 'none';
		document.querySelector("#staging-link").style.display = 'none';
		document.querySelector("#live-rave").style.display = 'block';
		document.querySelector("#live-link").style.display = 'block';
	} else {
		document.querySelector("#live-rave").style.display = 'none';
		document.querySelector("#live-link").style.display = 'none';
		document.querySelector("#staging-rave").style.display = 'block';
		document.querySelector("#staging-link").style.display = 'block';
	}

	// console.log(storeProfile.formatsAndUnits.currency);
	
}

// Executes when we need to save data. Gets all elements' values and saves them to Application storage and public app config via Ecwid JS SDK

function saveUserData() {

	var saveData = readValuesFromPage();

	EcwidApp.setAppStorage(saveData.private, function (savedData) {
		console.log('Private preferences saved!');
	});

	EcwidApp.setAppPublicConfig(saveData.public, function (savedData) {
		console.log('Public preferences saved!');
	})

}


// Main app function to determine if the user is new or just logs into the app

EcwidApp.getAppStorage('pm', function (value) {
	
	if (value != null) {
		getUserData();
	}
	else {
		createUserData();
	}
})