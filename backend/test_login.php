<?php
// Test login directly
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REQUEST_URI'] = '/api/auth/login';
$_SERVER['CONTENT_TYPE'] = 'application/json';
$_SERVER['REQUEST_URI'] = '/api/auth/login';

// Simulate input
$input = '{"email":"admin@trendle.local","password":"admin123"}';

// Create a stream wrapper for php://input
stream_wrapper_unregister('php');
stream_wrapper_register('php', 'TestStreamWrapper');

class TestStreamWrapper
{
    public $position = 0;
    public $data = '';

    public function stream_open($path, $mode)
    {
        global $input;
        $this->data = $input;
        $this->position = 0;
        return true;
    }

    public function stream_read($count)
    {
        $ret = substr($this->data, $this->position, $count);
        $this->position += strlen($ret);
        return $ret;
    }

    public function stream_eof()
    {
        return $this->position >= strlen($this->data);
    }
}

// Now include index.php
require 'index.php';
