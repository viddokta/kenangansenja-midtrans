<?php
/*Install Midtrans PHP Library (https://github.com/Midtrans/midtrans-php)
composer require midtrans/midtrans-php

Alternatively, if you are not using **Composer**, you can download midtrans-php library 
(https://github.com/Midtrans/midtrans-php/archive/master.zip), and then require 
the file manually.   

require_once dirname(__FILE__) . '/pathofproject/Midtrans.php'; */

require_once dirname(__FILE__) . '/midtrans-php-master/Midtrans.php';

// Set your Merchant Server Key
\Midtrans\Config::$serverKey = 'SB-Mid-server-p-20k7GDcsKAGH0TyHZ4S-6r';
// Set to Development/Sandbox Environment (default). Set to true for Production Environment (accept real transaction).
\Midtrans\Config::$isProduction = false;
// Set sanitization on (default)
\Midtrans\Config::$isSanitized = true;
// Set 3DS transaction for credit card to true
\Midtrans\Config::$is3ds = true;

try {
    // Validate input
    if (!isset($_POST['name'], $_POST['email'], $_POST['phone'], $_POST['items'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Data tidak lengkap']);
        exit;
    }

    // Get input values from the order form
    $customerName = $_POST['name'];
    $customerEmail = $_POST['email'];
    $customerPhone = $_POST['phone'];

    // Decode product data from the form or another data source
    $items = json_decode($_POST['items'], true);

    // Validate product data structure
    foreach ($items as $item) {
        if (!isset($item['price'], $item['quantity'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Struktur data produk tidak valid']);
            exit;
        }
    }

    // Calculate total purchase amount
    $totalAmount = array_reduce($items, function ($acc, $item) {
        return $acc + ($item['price'] * $item['quantity']);
    }, 0);

    // Parameters to create Snap token
    $params = [
        'transaction_details' => [
            'order_id' => rand(), // Use a unique method for order ID
            'gross_amount' => $totalAmount, // Replace with your total purchase amount
        ],
        'item_details' => $items,
        'customer_details' => [
            'first_name' => $customerName,
            'email' => $customerEmail,
            'phone' => $customerPhone,
        ],
    ];

    // Get Snap token
    $snapToken = \Midtrans\Snap::getSnapToken($params);

    // Output the token
    echo json_encode(['token' => $snapToken]);
} catch (\Exception $e) {
    // Handle errors
    http_response_code(500);
    echo json_encode(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
}

// Contoh header CORS di skrip PHP
header("Access-Control-Allow-Origin: https://github.com/viddokta"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
?>