<?php

namespace App\Service;

use Cloudinary\Cloudinary;

class CloudinaryService
{
    private Cloudinary $cloudinary;

    public function __construct(
        string $cloudName,
        string $apiKey,
        string $apiSecret
    ) {
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => $cloudName,
                'api_key' => $apiKey,
                'api_secret' => $apiSecret,
            ],
            'url' => [
                'secure' => true,
            ],
        ]);
    }

    public function upload(string $filePath): array
    {
        $response = $this->cloudinary
            ->uploadApi()
            ->upload($filePath, [
                'folder' => 'myuniverse/profile_pictures',
            ]);

        return $response->getArrayCopy();
    }
}