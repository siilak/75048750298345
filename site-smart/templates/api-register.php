<?php

require_once './inc/ajax-request.php';

// set vars with the default output
$statuscode = 200;
$response = [];

$request = new ajax\Request(['ajax-only' => true]);

wire('log')->save('ajax', 'seeing a ' . $request->method());

// if it isn't good return whatever error was detected.
if (!$request->is_good()) {
    return $request->echoResponse();
}

if (!$request->method('POST')) {
    return $request->echoErrorResponse(400, ['error' => 'invalid method ' . $request->method()]);
}

return $request->echoResponse(['status' => 'wonderful']);
