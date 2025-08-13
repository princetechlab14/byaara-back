const fs = require('fs');
const path = require('path');
const axios = require('axios');

// List of image URLs
const imageUrls = [
    "https:\/\/thevitashope.com\/wp-content\/uploads\/2025\/02\/2260032_01-1.jpg",
    "https:\/\/thevitashope.com\/wp-content\/uploads\/2025\/02\/2260032_03-1.jpg",
    "https:\/\/thevitashope.com\/wp-content\/uploads\/2025\/02\/2260032_04-1.jpg",
    "https:\/\/thevitashope.com\/wp-content\/uploads\/2025\/02\/2260032_04.jpg",
    "https:\/\/thevitashope.com\/wp-content\/uploads\/2025\/02\/2260032_03.jpg",
    "https:\/\/thevitashope.com\/wp-content\/uploads\/2025\/02\/2260032_01.jpg",
];

// Directory: download/images
const downloadDir = path.join(__dirname, 'download', 'images');
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true }); // Creates nested folders if not exist
}

// Function to download a single image
async function downloadImage(url, index) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        // Extract filename or create one
        const fileName = path.basename(new URL(url).pathname) || `image_${index}.jpg`;
        const filePath = path.join(downloadDir, fileName);

        // Save the file
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                // console.log(`✅ Downloaded: ${fileName}`);
                resolve();
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`❌ Failed to download ${url}:`, error.message);
    }
}

// Download all images sequentially
async function downloadAllImages() {
    for (let i = 0; i < imageUrls.length; i++) {
        await downloadImage(imageUrls[i], i);
    }
}

downloadAllImages();
