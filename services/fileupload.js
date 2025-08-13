const multer = require("multer");
const sharp = require("sharp");
const { S3Client, DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const fs = require("fs");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsBaseUrl = process.env.AWS_BASE_URL;
const fileStorage = process.env.FILE_STORAGE || 'local';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_VIDEO_SIZE = 10 * 1024 * 1024;

const s3Client = new S3Client({
    region: region,
    endpoint: awsBaseUrl,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
    forcePathStyle: false
});

const deleteObjS3 = async (fileUrl) => {
    const fileKey = fileUrl.replace(`${awsBaseUrl}/${bucketName}/`, "");
    const command = new DeleteObjectCommand({ Bucket: bucketName, Key: fileKey });
    try {
        await s3Client.send(command);
    } catch (err) {
        console.error("deleteObjS3 => ", err);
    }
};

const fileFilter = (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    if (!isImage && !isVideo) {
        return cb(new Error("Only image and video files are allowed!"), false);
    }
    cb(null, true);
};

const uploadToS3 = async (buffer, originalName, mimeType) => {
    const extension = originalName.split(".").pop();
    const filenameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");
    const sanitizedFilename = filenameWithoutExtension.replace(/[^a-zA-Z0-9]/g, "");
    const key = `${sanitizedFilename}.${extension}`;
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: "public-read",
    };
    const data = await s3Client.send(new PutObjectCommand(params));
    const location = `${awsBaseUrl}/${bucketName}/${key}`;
    return { ...data, Key: key, Location: location };
};

// ---------- S3 STORAGE ----------
const s3Storage = {
    _handleFile: (req, file, cb) => {
        const chunks = [];
        let totalSize = 0;
        file.stream.on("data", (chunk) => {
            totalSize += chunk.length;
            chunks.push(chunk);
            if (file.mimetype.startsWith("image/") && totalSize > MAX_IMAGE_SIZE) {
                return cb(new Error("Image size exceeds 2MB"));
            }
            if (file.mimetype.startsWith("video/") && totalSize > MAX_VIDEO_SIZE) {
                return cb(new Error("Video size exceeds 10MB"));
            }
        });
        file.stream.on("end", async () => {
            const buffer = Buffer.concat(chunks);
            const mimeType = file.mimetype;
            try {
                let processedBuffer = buffer;
                if (mimeType.startsWith("image/")) {
                    const image = sharp(buffer);
                    if (mimeType.includes("jpeg") || mimeType.includes("jpg"))
                        processedBuffer = await image.jpeg({ quality: 60 }).toBuffer();
                    else if (mimeType.includes("png"))
                        processedBuffer = await image.png({ quality: 60 }).toBuffer();
                    else if (mimeType.includes("webp"))
                        processedBuffer = await image.webp({ quality: 60 }).toBuffer();
                    else if (mimeType.includes("gif"))
                        processedBuffer = await image.gif({ quality: 60 }).toBuffer();
                }
                const result = await uploadToS3(processedBuffer, file.originalname, mimeType);
                cb(null, { key: result.Key, location: result.Location });
            } catch (err) {
                cb(err);
            }
        });
        file.stream.on("error", (err) => cb(err));
    },
    _removeFile: (req, file, cb) => cb(null),
};

// ---------- LOCAL STORAGE ----------
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../public/uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = file.originalname.replace(ext, "").replace(/[^a-zA-Z0-9]/g, "");
        const finalName = `${name}${ext}`;
        cb(null, finalName);
    }
});

// ---------- MULTER CONFIG ----------
const upload = multer({
    storage: fileStorage === "aws" ? s3Storage : localStorage,
    fileFilter,
    limits: { fileSize: Math.max(MAX_IMAGE_SIZE, MAX_VIDEO_SIZE) }
});

const deleteLocalFile = (url) => {
    const match = url.match(/\/uploads\/(.+)$/);
    if (!match || !match[1]) {
        console.warn(`⚠️ Invalid file path format in URL: ${url}`);
        return;
    }

    const filename = match[1];
    const filepath = path.join(__dirname, '../public/uploads', filename);

    if (fs.existsSync(filepath)) {
        fs.unlink(filepath, (err) => {
            if (err) {
                console.warn(`⚠️ Failed to delete local file: ${filepath}`);
            }
        });
    } else {
        console.warn(`⚠️ File not found (already deleted?): ${filepath}`);
    }
};

module.exports = { upload, deleteObjS3, deleteLocalFile };