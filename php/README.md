# Changelog SDK PHP Adapter

This helper wraps the Changelog REST API endpoints so PHP backends can read or manage changelog entries.

## Usage

```php
require_once __DIR__ . '/ChangelogApi.php';

$api = new ChangelogApi('https://your-app.com', '/api/changelog', __DIR__ . '/changelog.cookies');

$feed = $api->getFeed(['page' => 1, 'limit' => 10]);
$login = $api->login(['email' => 'admin@example.com', 'password' => 'secret']);
$create = $api->createEntry([
  'title' => 'v1.2.0 Released',
  'content' => '## Features\n- New feature',
  'version' => '1.2.0',
  'status' => 'published',
  'tags' => ['Features'],
]);
```

The `$cookieJar` argument persists the admin session cookie across requests.
