<?php

session_start();

if (isset($_GET['txref'])) {
  $ref = $_GET['txref'];
  $amount = $_SESSION["total"]; //Correct Amount from Server
  $currency = $_SESSION["currency"]; //Correct Currency from Server

  $query = array(
    "SECKEY" => $_SESSION["secretKey"],
    "txref" => $ref,
    "include_payment_entity" => "1"
  );

  $data_string = json_encode($query);

  $ch = curl_init($_SESSION["apiURL"] . 'flwv3-pug/getpaidx/api/xrequery');
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

  $paymentStatus = $resp['data']['status'];
  $chargeResponsecode = $resp['data']['chargecode'];
  $chargeAmount = $resp['data']['amount'];
  $chargeCurrency = $resp['data']['currency'];

  if (($chargeResponsecode == "00" || $chargeResponsecode == "0") && ($chargeAmount == $amount) && ($chargeCurrency == $currency)) {
     echo "Correct";
  } else {
    echo "Not Correct";
  }
}