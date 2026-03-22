<?php

// 1. Silenciar advertencias de PHP 8.5 (Esto sí déjalo)
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
ini_set('display_errors', 0);

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// El resto de tu código igual...
if (file_exists($maintenance = __DIR__ . '/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__ . '/../vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__ . '/../bootstrap/app.php';

$app->handleRequest(Request::capture());
