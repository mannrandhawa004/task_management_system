import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const uniquSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const originalName = file.originalname.split('.')[0];

        const cleanedName = originalName
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9-_]/g, '')
            .slice(0, 50);

        const safeFileName = `${cleanedName}_${uniquSuffix}`;
        return {
            folder: `task_management/users/profile_picture`,
            public_id: safeFileName,
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            transformation: [
                { width: 500, height: 500, crop: "fill", gravity: "face" }
            ]
        }

    }
})

const imageFileFilter = (req, file, callback) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
        callback(new Error("Profile photo must be a JPG, PNG, or WebP image."));
        return;
    }
    callback(null, true);
};

export const uploadProfilePic = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: imageFileFilter,
});

export const deleteUploadedImage = async (publicId) => {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};
