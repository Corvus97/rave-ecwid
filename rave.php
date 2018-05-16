

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