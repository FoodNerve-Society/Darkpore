import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert the buffer to a base64 string
        const base64Data = buffer.toString('base64');
        const fileUri = `data:${file.type};base64,${base64Data}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(fileUri, {
            folder: 'society_avatars', // Optional folder in Cloudinary
            resource_type: 'auto',
        });

        return NextResponse.json({
            secure_url: result.secure_url,
            public_id: result.public_id,
        });

    } catch (error: any) {
        console.error('Error uploading to Cloudinary:', error);
        return NextResponse.json(
            { error: 'Failed to upload image', details: error.message },
            { status: 500 }
        );
    }
}
