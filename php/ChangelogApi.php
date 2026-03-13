<?php

class ChangelogApi
{
    private string $baseUrl;
    private string $apiBasePath;
    private ?string $cookieJar;

    public function __construct(string $baseUrl = '', string $apiBasePath = '/api/changelog', ?string $cookieJar = null)
    {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->apiBasePath = '/' . trim($apiBasePath, '/');
        $this->cookieJar = $cookieJar;
    }

    private function request(string $path, string $method = 'GET', ?array $body = null): array
    {
        $url = $this->baseUrl . $this->apiBasePath . $path;
        $ch = curl_init($url);
        $headers = ['Content-Type: application/json'];

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if ($this->cookieJar) {
            curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookieJar);
            curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookieJar);
        }

        if ($body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }

        $response = curl_exec($ch);
        curl_close($ch);

        if ($response === false || $response === null || $response === '') {
            return [];
        }

        $decoded = json_decode($response, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function getFeed(array $params = []): array
    {
        $query = http_build_query($params);
        return $this->request('/feed' . ($query ? ('?' . $query) : ''));
    }

    public function getEntryBySlug(string $slug): array
    {
        return $this->request('/entries/' . urlencode($slug));
    }

    public function getAdminFeed(array $params = []): array
    {
        $query = http_build_query($params);
        return $this->request('/admin/entries' . ($query ? ('?' . $query) : ''));
    }

    public function getAdminEntryById(string $id): array
    {
        return $this->request('/admin/entries/' . urlencode($id));
    }

    public function createEntry(array $input): array
    {
        return $this->request('/admin/entries', 'POST', $input);
    }

    public function updateEntry(string $id, array $input): array
    {
        return $this->request('/admin/entries/' . urlencode($id), 'PATCH', $input);
    }

    public function deleteEntry(string $id): array
    {
        return $this->request('/admin/entries/' . urlencode($id), 'DELETE');
    }

    public function login(array $input): array
    {
        return $this->request('/admin/login', 'POST', $input);
    }

    public function register(array $input): array
    {
        return $this->request('/admin/register', 'POST', $input);
    }

    public function canRegister(): array
    {
        return $this->request('/admin/can-register');
    }

    public function logout(): array
    {
        return $this->request('/admin/logout', 'POST');
    }

    public function enhance(array $input): array
    {
        return $this->request('/admin/enhance', 'POST', $input);
    }

    public function getAISettings(): array
    {
        return $this->request('/admin/ai-settings');
    }

    public function updateAISettings(array $input): array
    {
        return $this->request('/admin/ai-settings', 'POST', $input);
    }

    public function listModels(array $input): array
    {
        return $this->request('/admin/ai-models', 'POST', $input);
    }

    public function getChangelogSettings(): array
    {
        return $this->request('/admin/changelog-settings');
    }

    public function updateChangelogSettings(array $input): array
    {
        return $this->request('/admin/changelog-settings', 'POST', $input);
    }

    public function getLatestPublishedVersion(): array
    {
        return $this->request('/admin/latest-version');
    }

    public function getRepoSettings(): array
    {
        return $this->request('/admin/repo-settings');
    }

    public function updateRepoSettings(array $input): array
    {
        return $this->request('/admin/repo-settings', 'POST', $input);
    }

    public function previewRepoCommits(array $input): array
    {
        return $this->request('/admin/repo-commits', 'POST', $input);
    }

    public function generateChangelogFromCommits(array $input): array
    {
        return $this->request('/admin/repo-generate', 'POST', $input);
    }
}
