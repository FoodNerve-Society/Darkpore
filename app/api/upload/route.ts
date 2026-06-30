import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { r2Client } from '@/lib/storage';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const folder = (formData.get('folder') as string) || 'society_avatars';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const useR2 = process.env.STORAGE_PROVIDER === 'r2';

        if (useR2) {
            const bucketName = process.env.R2_BUCKET_NAME;
            if (!bucketName) {
                throw new Error("R2_BUCKET_NAME is not defined in environment variables");
            }
            
            // Generate a unique filename
            const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            
            await r2Client.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: fileName,
                Body: buffer,
                ContentType: file.type,
            }));
            
            const publicUrl = process.env.R2_PUBLIC_URL 
                ? `${process.env.R2_PUBLIC_URL}/${fileName}`
                : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucketName}/${fileName}`;
            
            return NextResponse.json({
                secure_url: publicUrl,
                public_id: fileName,
                provider: 'r2'
            });
        } else {
            // Upload to Cloudinary
            const base64Data = buffer.toString('base64');
            const fileUri = `data:${file.type};base64,${base64Data}`;

            const result = await cloudinary.uploader.upload(fileUri, {
                folder: folder,
                resource_type: 'auto',
            });

            return NextResponse.json({
                secure_url: result.secure_url,
                public_id: result.public_id,
                provider: 'cloudinary'
            });
        }
    } catch (error: any) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload file', details: error.message },
            { status: 500 }
        );
    }
}
