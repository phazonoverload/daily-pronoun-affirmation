<?php

$name = $_POST['name'];
$msisdn = $_POST['msisdn'];
$pronouns = $_POST['pronouns'];

$postData = '{"name": "' . $name . '", "msisdn": "' . $msisdn . '", "pronouns": "' . $pronouns . '"}';


echo $postData;

echo "..........";

$ch = curl_init( 'https://affirmation-station.netlify.com/.netlify/functions/create' );
# Setup request to send json via POST.
curl_setopt( $ch, CURLOPT_POSTFIELDS, $postData );
curl_setopt( $ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
# Return response instead of printing.
curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
# Send request.
$result = curl_exec($ch);
curl_close($ch);

echo $result;

?>
