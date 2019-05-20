<?php

session_start();

$ref = $_GET['txref'];
$amount = $_SESSION["total"]; //Correct Amount from Server
$currency = $_SESSION["currency"]; //Correct Currency from Server

$query = array(
  "SECKEY" => $_SESSION["secretKey"],
  "txref" => $ref
);

$data_string = json_encode($query);

$ch = curl_init($_SESSION["apiURL"] . 'flwv3-pug/getpaidx/api/v2/verify');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

$response = curl_exec($ch);

$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$header = substr($response, 0, $header_size);
$body = substr($response, $header_size);

curl_close($ch);

$resp = json_decode($response, true);
// header('Content-Type: application/json');
// The resulting JSON array will be in $result variable
$json_string = json_encode($resp, JSON_PRETTY_PRINT);

// echo $json_string;
// die();

$paymentStatus = $resp['data']['status'];
$chargeResponsecode = $resp['data']['chargecode'];
$chargeAmount = $resp['data']['amount'];
$chargeCurrency = $resp['data']['currency'];
$txRef = explode("-", $resp['data']['txref']); // split the reference into orderID, reference number and token

if (($chargeResponsecode == "00" || $chargeResponsecode == "0") && ($chargeAmount == $amount) && ($chargeCurrency == $currency)) {
  // $url = "https://app.ecwid.com/api/v3/". $_SESSION["storeId"] ."/orders/". $_GET['txref'] ."?token=". $_SESSION["token"];
  $url = "https://app.ecwid.com/api/v3/". $txRef[1] ."/orders/". $txRef[0] ."?token=". $txRef[2];

  $data = array('paymentStatus' => 'PAID');
  $data_json = json_encode($data);

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Content-Length: ' . strlen($data_json)));
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
  curl_setopt($ch, CURLOPT_POSTFIELDS, $data_json);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

  $response = curl_exec($ch);
  curl_close($ch);
  header('Location: ' . $_SESSION["returnUrl"]);
} else {
  header('Location: ' . $_SESSION["returnUrl"]);
  
}