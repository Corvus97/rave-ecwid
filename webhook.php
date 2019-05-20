<?php

// Retrieve the request's body
$body = @file_get_contents("php://input");
// retrieve the signature sent in the request header's.
$signature = (isset($_SERVER['HTTP_VERIF_HASH']) ? $_SERVER['HTTP_VERIF_HASH'] : '');
/* It is a good idea to log all events received. Add code *
* here to log the signature and body to db or file       */
if (!$signature) {
    // only a post with rave signature header gets our attention
    exit();
}
// Store the same signature on your server as an env variable and check against what was sent in the headers
$local_signature = "Ecwid-Rave-Secret-Hash";
// confirm the event's signature
if( $signature !== $local_signature ){
// silently forget this ever happened
exit();
}
sleep(10);
http_response_code(200); // PHP 5.4 or greater
// parse event (which is json string) as object
// Give value to your customer but don't give any output
// Remember that this is a call from rave's servers and 
// Your customer is not seeing the response here at all
$response = json_decode($body);
if ($response->status == 'successful') {
    $ref_array = explode("-", $response->txRef);// split the reference into orderID, reference number and token
    $url = "https://app.ecwid.com/api/v3/". $ref_array[1] ."/orders/". $ref_array[0] ."?token=". $ref_array[2];

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
}
exit();