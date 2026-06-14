import { useState } from 'react';

interface UploadResult {
    secure_url: string;
    public_id: string;
    [key: string]: any;
}

export const useCloudinaryUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadToCloudinary = async (file: File): Promise<UploadResult | null> => {
        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                const detailedError = errData.details ? `${errData.error}: ${errData.details}` : (errData.error || 'Upload failed');
                throw new Error(detailedError);
            }

            const data = await response.json();
            return data as UploadResult;
        } catch (err: any) {
            console.error("Cloudinary upload error:", err);
            setError(err.message || "Failed to upload image.");
            return null;
        } finally {
            setUploading(false);
        }
    };

    return { uploadToCloudinary, uploading, error };
};
