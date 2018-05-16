<?php
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
$result = getEcwidPayload($client_secret, $ecwid_payload);
$json_string = json_encode($result, JSON_PRETTY_PRINT);
echo $json_string;
die();
?>

<form method="POST" action="https://hosted.flutterwave.com/processPayment.php" id="paymentForm">
  <input type="hidden" name="amount" value="<?php echo $result->cart->order->total; ?>" /> <!-- Replace the value with your transaction amount -->
  <input type="hidden" name="payment_method" value="both" /> <!-- Can be card, account, both (optional) -->
  <input type="hidden" name="description" value="I Phone X, 100GB, 32GB RAM" /> <!-- Replace the value with your transaction description -->
  <input type="hidden" name="logo" value="http://brandmark.io/logo-rank/random/apple.png" /> <!-- Replace the value with your logo url (optional) -->
  <input type="hidden" name="title" value="Victor Store" /> <!-- Replace the value with your transaction title (optional) -->
  <input type="hidden" name="country" value="NG" /> <!-- Replace the value with your transaction country -->
  <input type="hidden" name="currency" value="<?php echo $result->cart->currency; ?>" /> <!-- Replace the value with your transaction currency -->
  <input type="hidden" name="email" value="<?php echo $result->cart->order->email; ?>" /> <!-- Replace the value with your customer email -->
  <input type="hidden" name="firstname" value="<?php echo $result->cart->order->billingPerson->name; ?>" /> <!-- Replace the value with your customer firstname (optional) -->
  <input type="hidden" name="lastname"value="Olanipekun" /> <!-- Replace the value with your customer lastname (optional) -->
  <input type="hidden" name="phonenumber" value="<?php echo $result->cart->order->billingPerson->phone; ?>" /> <!-- Replace the value with your customer phonenumber (optional if email is passes) -->
  <input type="hidden" name="ref" value="MY_NAME_522a7f270abc8879" /> <!-- Replace the value with your transaction reference. It must be unique per transaction. You can delete this line if you want one to be generated for you. -->
  <input type="hidden" name="env" value="staging"> <!-- live or staging -->
  <input type="hidden" name="publicKey" value="FLWPUBK-8ba286388b24dbd6c20706def0b4ea23-X"> <!-- Put your public key here -->
  <input type="hidden" name="secretKey" value="FLWSECK-c45e0f704619e673263844e584bba013-X"> <!-- Put your secret key here -->
  <input type="hidden" name="successurl" value="http://request.lendlot.com/13b9gxc1?name=success"> <!-- Put your success url here -->
  <input type="hidden" name="failureurl" value="http://request.lendlot.com/13b9gxc1?name=failed"> <!-- Put your failure url here -->
  <input type="submit" value="Submit" />
</form>