<?php
/**
 * generate-sitemap.php
 * Dynamically generates sitemap.xml by fetching data from Supabase REST API
 */

header("Content-Type: application/xml; charset=utf-8");

// Configuration - Values mirror assets/js/config.js
$supabaseUrl = 'https://fdevgkvjloezhyelciqb.supabase.co';
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZXZna3ZqbG9lemh5ZWxjaXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTQ5MzgsImV4cCI6MjA4ODYzMDkzOH0.hahG-eXojQZulQPTRJ59rn3oaqGcuHWEHn6YVChAE_M';
$siteUrl = 'https://elebtikar-sa.com';

function fetchSupabase($table, $select = '*') {
    global $supabaseUrl, $supabaseKey;
    $url = $supabaseUrl . "/rest/v1/" . $table . "?select=" . $select;
    
    $opts = [
        "http" => [
            "method" => "GET",
            "header" => "apikey: " . $supabaseKey . "\r\n" .
                        "Authorization: Bearer " . $supabaseKey . "\r\n"
        ]
    ];
    
    $context = stream_context_create($opts);
    $result = file_get_contents($url, false, $context);
    return $result ? json_decode($result, true) : [];
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// 1. Static Pages
$staticPages = [
    ['loc' => '/', 'priority' => '1.0'],
    ['loc' => '/services', 'priority' => '0.8'],
    ['loc' => '/blog', 'priority' => '0.8'],
];

foreach ($staticPages as $page) {
    echo '  <url>' . PHP_EOL;
    echo '    <loc>' . $siteUrl . $page['loc'] . '</loc>' . PHP_EOL;
    echo '    <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
    echo '    <priority>' . $page['priority'] . '</priority>' . PHP_EOL;
    echo '  </url>' . PHP_EOL;
}

// 2. Dynamic Services
$services = fetchSupabase('services', 'slug');
foreach ($services as $srv) {
    if (!empty($srv['slug'])) {
        echo '  <url>' . PHP_EOL;
        echo '    <loc>' . $siteUrl . '/services/' . htmlspecialchars($srv['slug']) . '</loc>' . PHP_EOL;
        echo '    <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
        echo '    <priority>0.7</priority>' . PHP_EOL;
        echo '  </url>' . PHP_EOL;
    }
}

// 3. Dynamic Blog Posts
$posts = fetchSupabase('posts', 'slug,created_at');
foreach ($posts as $post) {
    if (!empty($post['slug'])) {
        $date = !empty($post['created_at']) ? date('Y-m-d', strtotime($post['created_at'])) : date('Y-m-d');
        echo '  <url>' . PHP_EOL;
        echo '    <loc>' . $siteUrl . '/post?slug=' . htmlspecialchars($post['slug']) . '</loc>' . PHP_EOL;
        echo '    <lastmod>' . $date . '</lastmod>' . PHP_EOL;
        echo '    <priority>0.6</priority>' . PHP_EOL;
        echo '  </url>' . PHP_EOL;
    }
}

echo '</urlset>' . PHP_EOL;
