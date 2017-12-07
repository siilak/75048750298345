<?php
/*
 * ProcessWire REST Helper.
 *
 * Copyright (c) 2014 Camilo Castro <camilo@cervezapps.cl>
 *
 * Some portions of code are based on the Lime Project
 * https://github.com/aheinze/Lime/
 * Copyright (c) 2014 Artur Heinze
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

namespace ajax;

class Request {
    //
    // constructor
    //     this gets the HTTP payload and initializes the object. It optionally checks
    //     to make sure the associative array keys in $signatures exist.
    //
    function __construct($options = ['ajax-only' => false]) {
        $this->status = 200;
        $this->response = [];
        $this->json = null;

        $this->ajax_only = isset($options['ajax-only']) ? $options['ajax-only'] : false;
        $signatures = isset($options['signatures']) ? $options['signatures'] : [];


        // HEADER information
        $this->method = strtoupper($_SERVER['REQUEST_METHOD']);
        $this->user_agent = strtolower($_SERVER['HTTP_USER_AGENT']);

        //Basic HTTP Authentication
        $this->uname = $this->upass = null;
        if (isset($_SERVER['PHP_AUTH_USER'])) {
            $this->uname = $_SERVER['PHP_AUTH_USER'];
            $this->upass = $_SERVER['PHP_AUTH_PW'];
        };

        $this->submitKey = null;

        // remember error
        if ($this->ajax_only && !$this->isAJAX()) {
            $this->status = 400;
            $this->response['error'] = 'XMLHttpRequest required';
            return;
        }

        $this->request = $this->decode_request();

        // if asked to check the signature then do so. Bad Request if
        // it's an error.
        if (!is_null($signatures)) {
            $result = $this->check_signatures($signatures);
            if (!$result) {
                $this->status = 400;
                $this->response['error'] = 'Incorrect signature for request';
            }
        }
    }

    protected function decode_request () {
        // if it cannot be decoded from JSON then don't try to handle it. use
        // wireDecodeJSON because it handles edge cases. This allows JSON data
        // in a GET body (not recommended though).
        try {
            $request = \ProcessWire\wireDecodeJSON(file_get_contents('php://input'));
        } catch (\Exception $e) {
            // this leaves out some other verbs but let them go. this code expects
            // them to send JSON-encoded data in the body.
            $request = array_merge([], $this->method('GET') ? $_GET : $_POST);
        }
        return $request;
    }

    private function check_signatures($required) {
        foreach ($required as $required_arg) {
            if (!isset($this->request[$required_arg])) {
                $this->debug_log("missing $required_arg");
                return false;
            }
        }
        return true;
    }

    public function is_good() {
        return $this->status === 200;
    }

    public function set_status($code = 200) {
        $this->status = $code;
    }

    // set a mime type header
    public function set_mime_type($mime) {
        header(Request::mime_type_header($mime));
    }

    // return the existing status and data. success or error
    // status depends on $this->status.
    public function echoResponse($data = []) {
        http_response_code($this->status);
        $this->set_mime_type('json');
        $results = array_merge($this->response, $data);
        echo $return = json_encode($results);
        return $return;
    }

    public function echoErrorResponse($code, $data = []) {
        $this->status = $code;
        return $this->echoResponse($data);
    }

    public function isAJAX() {
        return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest';
    }

    public function isSSL() {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    }

    public function method($method = null) {
        if (is_null($method)) return $this->method;
        return $this->method === strtoupper($method);
    }

    // TODO - do I care about this?
    public function isMobile() {
        $mobileDevices = array(
            "midp" => true,
            "240x320" => true,
            "blackberry" => true,
            "netfront" => true,
            "nokia" => true,
            "panasonic" => true,
            "portalmmm" => true,
            "sharp" => true,
            "sie-" => true,
            "sonyericsson" => true,
            "symbian" => true,
            "windows ce" => true,
            "benq" => true,
            "mda" => true,
            "mot-" => true,
            "opera mini" => true,
            "philips" => true,
            "pocket pc" => true,
            "sagem" => true,
            "samsung" => true,
            "sda" => true,
            "sgh-" => true,
            "vodafone" => true,
            "xda" => true,
            "iphone" => true,
            "ipod" => true,
            "android" => true
        );
        return isset($mobileDevices[$this->user_agent]);
    }


    public static $statusCodes = array(
        // Informational 1xx
        100 => 'Continue',
        101 => 'Switching Protocols',
        // Successful 2xx
        200 => 'OK',
        201 => 'Created',
        202 => 'Accepted',
        203 => 'Non-Authoritative Information',
        204 => 'No Content',
        205 => 'Reset Content',
        206 => 'Partial Content',
        // Redirection 3xx
        300 => 'Multiple Choices',
        301 => 'Moved Permanently',
        302 => 'Found',
        303 => 'See Other',
        304 => 'Not Modified',
        305 => 'Use Proxy',
        307 => 'Temporary Redirect',
        // Client Error 4xx
        400 => 'Bad Request',
        401 => 'Unauthorized',
        402 => 'Payment Required',
        403 => 'Forbidden',
        404 => 'Not Found',
        405 => 'Method Not Allowed',
        406 => 'Not Acceptable',
        407 => 'Proxy Authentication Required',
        408 => 'Request Timeout',
        409 => 'Conflict',
        410 => 'Gone',
        411 => 'Length Required',
        412 => 'Precondition Failed',
        413 => 'Request Entity Too Large',
        414 => 'Request-URI Too Long',
        415 => 'Unsupported Media Type',
        416 => 'Request Range Not Satisfiable',
        417 => 'Expectation Failed',
        // Server Error 5xx
        500 => 'Internal Server Error',
        501 => 'Not Implemented',
        502 => 'Bad Gateway',
        503 => 'Service Unavailable',
        504 => 'Gateway Timeout',
        505 => 'HTTP Version Not Supported'
    );

    /* mime types */
    public static $mime_types = array(
        'asc'   => 'text/plain',
        'au'    => 'audio/basic',
        'avi'   => 'video/x-msvideo',
        'bin'   => 'application/octet-stream',
        'class' => 'application/octet-stream',
        'css'   => 'text/css',
        'csv'   => 'application/vnd.ms-excel',
        'doc'   => 'application/msword',
        'dll'   => 'application/octet-stream',
        'dvi'   => 'application/x-dvi',
        'exe'   => 'application/octet-stream',
        'htm'   => 'text/html',
        'html'  => 'text/html',
        'json'  => 'application/json',
        'js'    => 'application/x-javascript',
        'txt'   => 'text/plain',
        'bmp'   => 'image/bmp',
        'rss'   => 'application/rss+xml',
        'atom'  => 'application/atom+xml',
        'gif'   => 'image/gif',
        'jpeg'  => 'image/jpeg',
        'jpg'   => 'image/jpeg',
        'jpe'   => 'image/jpeg',
        'png'   => 'image/png',
        'ico'   => 'image/vnd.microsoft.icon',
        'mpeg'  => 'video/mpeg',
        'mpg'   => 'video/mpeg',
        'mpe'   => 'video/mpeg',
        'qt'    => 'video/quicktime',
        'mov'   => 'video/quicktime',
        'wmv'   => 'video/x-ms-wmv',
        'mp2'   => 'audio/mpeg',
        'mp3'   => 'audio/mpeg',
        'rm'    => 'audio/x-pn-realaudio',
        'ram'   => 'audio/x-pn-realaudio',
        'rpm'   => 'audio/x-pn-realaudio-plugin',
        'ra'    => 'audio/x-realaudio',
        'wav'   => 'audio/x-wav',
        'zip'   => 'application/zip',
        'pdf'   => 'application/pdf',
        'xls'   => 'application/vnd.ms-excel',
        'ppt'   => 'application/vnd.ms-powerpoint',
        'wbxml' => 'application/vnd.wap.wbxml',
        'wmlc'  => 'application/vnd.wap.wmlc',
        'wmlsc' => 'application/vnd.wap.wmlscriptc',
        'spl'   => 'application/x-futuresplash',
        'gtar'  => 'application/x-gtar',
        'gzip'  => 'application/x-gzip',
        'swf'   => 'application/x-shockwave-flash',
        'tar'   => 'application/x-tar',
        'xhtml' => 'application/xhtml+xml',
        'snd'   => 'audio/basic',
        'midi'  => 'audio/midi',
        'mid'   => 'audio/midi',
        'm3u'   => 'audio/x-mpegurl',
        'tiff'  => 'image/tiff',
        'tif'   => 'image/tiff',
        'rtf'   => 'text/rtf',
        'wml'   => 'text/vnd.wap.wml',
        'wmls'  => 'text/vnd.wap.wmlscript',
        'xsl'   => 'text/xml',
        'xml'   => 'text/xml'
    );

    private static function mime_type_header($mime) {
        if (!isset(Request::$mime_types[$mime])) {
            throw new Exception('Illegal mime type: ' . $mime);
        }
        return 'Content-Type: ' . Request::$mime_types[$mime];
    }

    protected function log($text) {
        \ProcessWire\wire('log')->save('ajax', $text);
    }

    private function debug_log($text) {
        if (!\ProcessWire\wire('config')->debug) return;
        $this->log($text);
    }
}



