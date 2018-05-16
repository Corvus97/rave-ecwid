<?php

session_start();
  $ref = $_GET['txref'];
  $amount = $_SESSION["total"]; //Correct Amount from Server
  $currency = $_SESSION["currency"]; //Correct Currency from Server

  $query = array(
    "SECKEY" => $_SESSION["secretKey"],
    "txref" => $ref,
    "include_payment_entity" => "1"
  );

  $data_string = json_encode($query);

  // $ch = curl_init($_SESSION["apiURL"] . 'flwv3-pug/getpaidx/api/xrequery');
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/xrequery");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postdata));  //Post Fields
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$headers = [
  'Content-Type: application/json',
];

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$request = curl_exec($ch);
$err = curl_error($ch);

if ($err) {
	// there was an error contacting rave
  die('Curl returned error: ' . $err);
}


curl_close($ch);

$result = json_decode($request, true);

if ('error' == $result->status) {
  // there was an error from the API
  die('API returned error: ' . $result->message);
}

if ('successful' == $result->data->status && '00' == $result->data->chargecode) {
  // transaction was successful...
  // please check other things like whether you already gave value for this ref
  // If the amount and currency matches the expected amount and currency etc.
  // if the email matches the customer who owns the product etc
  // Give value
  echo "success";
}