
var loadedConfig = {
	testSecretKey: "",
	testPublicKey: "",
	liveSecretKey: "",
	livePublicKey: "",
	logo: "",
	country: "",
	pm: "",
	env: "",
	delay: ""
};

var initialConfig = {
	testSecretKey: "",
	testPublicKey: "",
	liveSecretKey: "",
	livePublicKey: "",
	logo: "",
	country: "",
	pm: "",
	env: false,
	delay: 0
};

// For getting store information from Ecwid REST API
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}


// Executes when we have a new user install the app. It creates and sets the default data using Ecwid JS SDK and Application storage
function createUserData() {

	var theUrl = 'https://app.ecwid.com/api/v3/' + storeId + '/profile?token=' + accessToken;

	var storeProfile = httpGet(theUrl);
	storeProfile = JSON.parse(storeProfile);

	initialConfig.testSecretKey = "";
	initialConfig.testPublicKey = "";
	initialConfig.liveSecretKey = "";
	initialConfig.livePublicKey = "";
	initialConfig.logo = "";
	initialConfig.country = "";
	initialConfig.pm = "";
	initialConfig.env = false;
	initialConfig.delay = 0;

	var data = '{"testSecretKey": "'+ initialConfig.testSecretKey + '", "testPublicKey": "'+ initialConfig.testPublicKey + '", "liveSecretKey": "'+ initialConfig.liveSecretKey + '", "livePublicKey": "'+ initialConfig.livePublicKey + '", "logo": "'+ initialConfig.logo + '", "country": "'+ initialConfig.country + '", "pm": "'+ initialConfig.pm + '", "env": '+ initialConfig.env +', "delay":'+ initialConfig.delay +'}';


	EcwidApp.setAppPublicConfig(data, function(){
		console.log('Public config saved!');
	});

	document.getElementById('testSecretKey').value = initialConfig.testSecretKey;
	document.getElementById('testPublicKey').value = initialConfig.testPublicKey;
	document.getElementById('liveSecretKey').value = initialConfig.liveSecretKey;
	document.getElementById('livePublicKey').value = initialConfig.livePublicKey;
	document.getElementById('country').value = initialConfig.country;
	document.getElementById('pm').value = initialConfig.pm;
	document.getElementById('env').checked = initialConfig.env;
	document.querySelector("#testPub").style.display = 'table-row';
	document.querySelector("#testSec").style.display = 'table-row';
	document.querySelector("#test-keys").style.display = 'block';
	document.querySelector("#livePK").disabled = true;
	document.querySelector("#liveSK").disabled = true;
	document.querySelector("#livePub").style.display = 'none';
	document.querySelector("#liveSec").style.display = 'none';
	document.querySelector("#live-keys").style.display = 'none';
	document.getElementById('delay').value = initialConfig.delay;


	// Setting flag to determine that we already created and saved defaults for this user
	var appExists = {
		exists: 'yes'
	};

	EcwidApp.setAppStorage(appExists, function(){
	  console.log('Data saved!');
	});

}




// Executes if we have a user who logs in to the app not the first time. We load their preferences from Application storage with Ecwid JS SDK and display them in the app iterface
function getUserData() {

	EcwidApp.getAppStorage('public', function(config){
		config = JSON.parse(config);

		loadedConfig.testSecretKey = config.testSecretKey;
		loadedConfig.testPublicKey = config.testPublicKey;
		loadedConfig.liveSecretKey = config.liveSecretKey;
		loadedConfig.livePublicKey = config.livePublicKey;
		loadedConfig.logo = config.logo;
		loadedConfig.country = config.country;
		loadedConfig.pm = config.pm;
		loadedConfig.env = config.env;
		loadedConfig.delay = config.delay;

		console.log(loadedConfig);
	});

	setTimeout(function(){

		document.getElementById('testSecretKey').value = loadedConfig.testSecretKey;
		document.getElementById('testSecretKey').disabled = loadedConfig.env;
		document.getElementById('testPublicKey').value = loadedConfig.testPublicKey;
		document.getElementById('testPublicKey').disabled = loadedConfig.env;
		document.getElementById('liveSecretKey').value = loadedConfig.liveSecretKey;
		document.getElementById('liveSecretKey').disabled = !loadedConfig.env;
		document.getElementById('livePublicKey').value = loadedConfig.livePublicKey;
		document.getElementById('livePublicKey').disabled = !loadedConfig.env;
		document.getElementById('country').value = loadedConfig.country;
		document.getElementById('pm').value = loadedConfig.pm;
		document.getElementById('logo').value = loadedConfig.logo;
		document.getElementById('env').checked = loadedConfig.env;
		document.getElementById('delay').value = loadedConfig.delay;

		if (loadedConfig.env) {
			document.querySelector("#testPub").style.display = 'none';
			document.querySelector("#testSec").style.display = 'none';
			document.querySelector("#test-keys").style.display = 'none';
			document.querySelector("#livePub").style.display = 'table-row';
			document.querySelector("#liveSec").style.display = 'table-row';
			document.querySelector("#live-keys").style.display = 'block';
		} else {
			document.querySelector("#testPub").style.display = 'table-row';
			document.querySelector("#testSec").style.display = 'table-row';
			document.querySelector("#test-keys").style.display = 'block';
			document.querySelector("#livePub").style.display = 'none';
			document.querySelector("#liveSec").style.display = 'none';
			document.querySelector("#live-keys").style.display = 'none';
		}

	}, 1000);

}




// Executes when Save button is pressed. Gets all elements' values and saves them to Application storage via Ecwid JS SDK
function saveUserData() {

	var d = document.getElementById("save");
	d.className += " btn-loading";

	setTimeout(function(){
		d.className = "btn btn-primary btn-large";
	},500)

	var saveData = {
		testSecretKey: loadedConfig.testSecretKey,
		testPublicKey: loadedConfig.testPublicKey,
		liveSecretKey: loadedConfig.liveSecretKey,
		livePublicKey: loadedConfig.livePublicKey,
		logo: loadedConfig.logo,
		country: loadedConfig.country,
		pm: loadedConfig.pm,
		env: loadedConfig.env,
		delay: loadedConfig.delay
	}

	saveData.testSecretKey = document.getElementById('testSecretKey').value;
	saveData.testPublicKey = document.getElementById('testPublicKey').value;
	saveData.liveSecretKey = document.getElementById('liveSecretKey').value;
	saveData.livePublicKey = document.getElementById('livePublicKey').value;
	saveData.logo = document.getElementById('logo').value;
	saveData.country = document.getElementById('country').value;
	saveData.pm = document.getElementById('pm').value;
	saveData.env = document.getElementById('env').checked;

	if (isNaN(saveData.delay)) {
		saveData.delay = 0;
	}

	var dataToSave = '{"testSecretKey": "'+ saveData.testSecretKey + '", "testPublicKey": "'+ saveData.testPublicKey + '", "liveSecretKey": "'+ saveData.liveSecretKey + '", "livePublicKey": "'+ saveData.livePublicKey + '", "logo": "'+ saveData.logo + '", "country": "'+ saveData.country + '", "pm": "'+ saveData.pm + '", "env": '+ saveData.env +', "delay":'+ saveData.delay +'}';

	EcwidApp.setAppPublicConfig(dataToSave, function(){
		console.log('Public config saved!');
	});

}

// Main app function to determine if the user is new or just logs into the app
EcwidApp.getAppStorage('exists', function(value){

  if (value != null) {
  		getUserData();
  }
  else {
  		createUserData();
  }
})



