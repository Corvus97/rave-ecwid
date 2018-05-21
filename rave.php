<?php 
session_start(); 
  function getEcwidPayload($app_secret_key, $data)
  {
  // Get the encryption key (16 first bytes of the app's client_secret key)
    $encryption_key = substr($app_secret_key, 0, 16);

  // Decrypt payload
    $json_data = aes_128_decrypt($encryption_key, $data);

  // Decode json
    $json_decoded = json_decode($json_data, true);
    return $json_decoded;
  }

  function aes_128_decrypt($key, $data)
  {
  // Ecwid sends data in url-safe base64. Convert the raw data to the original base64 first
    $base64_original = str_replace(array('-', '_'), array('+', '/'), $data);

  // Get binary data
    $decoded = base64_decode($base64_original);

  // Initialization vector is the first 16 bytes of the received data
    $iv = substr($decoded, 0, 16);

  // The payload itself is is the rest of the received data
    $payload = substr($decoded, 16);

  // Decrypt raw binary payload
    $json = openssl_decrypt($payload, "aes-128-cbc", $key, OPENSSL_RAW_DATA, $iv);
  //$json = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $payload, MCRYPT_MODE_CBC, $iv); // You can use this instead of openssl_decrupt, if mcrypt is enabled in your system

    return $json;
  }

// Get payload from the POST and process it
  $ecwid_payload = $_POST['data'];
  $client_secret = "coLPrs9NN5mDgr6xqwUaNAF0PAqBF3Zr"; // this is a dummy value. Please place your app secret key here
  header('Content-Type: application/json');
// The resulting JSON array will be in $result variable
  $data = getEcwidPayload($client_secret, $ecwid_payload);
  $json_string = json_encode($data, JSON_PRETTY_PRINT);
  $result = json_decode(json_encode($data), false);

  var_dump ($result);
  die();


  if (!$result->merchantAppSettings->env) {
    $secretKey = $result->merchantAppSettings->testSecretKey;
    $publicKey = $result->merchantAppSettings->testPublicKey;
    $env = "staging";
    $apiLink = "https://ravesandboxapi.flutterwave.com/";
  } else {
    $secretKey = $result->merchantAppSettings->liveSecretKey;
    $publicKey = $result->merchantAppSettings->livePublicKey;
    $env = "live";
    $apiLink = "https://api.ravepay.co/";
  }


  $firstName = "";
  $lastName = "";

  $name = explode(" ", $result->cart->order->billingPerson->name);

  if ($name[1]) {
    $lastName = $name[1];
  }

  $total = $result->cart->order->total;
  $paymentMethod = $result->merchantAppSettings->pm;
  $country = $result->merchantAppSettings->country;
  $logo = $result->merchantAppSettings->logo;
  $currency = $result->cart->currency;
  $email = $result->cart->order->email;
  $firstName = $name[0];
  $phone = $result->cart->order->billingPerson->phone;
  $ref = $result->cart->order->referenceTransactionId;


  echo $json_string;
  die();

  $_SESSION["secretKey"] = $secretKey;
  $_SESSION["storeId"] = $result->storeId;
  $_SESSION["token"] = $result->token;
  $_SESSION["total"] = $total;
  $_SESSION["currency"] = $currency;
  $_SESSION["returnUrl"] = $result->returnUrl;
  $_SESSION["apiURL"] = $apiLink;


  ?>
<!DOCTYPE html>
  <html>
  <body>

  <form method="POST" action="https://hosted.flutterwave.com/processPayment.php" id="paymentForm">
    <input type="hidden" name="amount" value="<?php echo $total; ?>" /> <!-- Replace the value with your transaction amount -->
    <input type="hidden" name="payment_method" value="<?php echo $paymentMethod; ?>" /> <!-- Can be card, account, both (optional) -->
    <input type="hidden" name="logo" value="<?php echo $logo; ?>" /> <!-- Replace the value with your logo url (optional) -->
    <input type="hidden" name="country" value="<?php echo $country; ?>" /> <!-- Replace the value with your transaction country -->
    <input type="hidden" name="currency" value="<?php echo $currency; ?>" /> <!-- Replace the value with your transaction currency -->
    <input type="hidden" name="email" value="<?php echo $email; ?>" /> <!-- Replace the value with your customer email -->
    <input type="hidden" name="firstname" value="<?php echo $firstName; ?>" /> <!-- Replace the value with your customer firstname (optional) -->
    <input type="hidden" name="lastname"value="<?php echo $lastName; ?>" /> <!-- Replace the value with your customer lastname (optional) -->
    <input type="hidden" name="phonenumber" value="<?php echo $phone; ?>" /> <!-- Replace the value with your customer phonenumber (optional if email is passes) -->
    <input type="hidden" name="ref" value="<?php echo $ref; ?>" />
    <input type="hidden" name="env" value="<?php echo $env; ?>"> <!-- live or staging -->
    <input type="hidden" name="publicKey" value="<?php echo $publicKey; ?>"> <!-- Put your public key here -->
    <input type="hidden" name="secretKey" value="<?php echo $secretKey; ?>"> <!-- Put your secret key here -->
    <input type="hidden" name="successurl" value="https://rave.deatt.com/verify.php"> <!-- Put your success url here -->
    <input type="hidden" name="failureurl" value="<?php echo $result->returnUrl; ?>"> <!-- Put your failure url here -->
    <!-- <input type="submit" value="Submit" /> -->
  </form>
  <script
    src="https://code.jquery.com/jquery-3.3.1.min.js"
    integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
    crossorigin="anonymous"></script>
  <script>
    $(document).ready(function(){
      $("#paymentForm").submit();
  });
  </script>
</body>
</html>
