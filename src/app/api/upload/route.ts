import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const purpose = formData.get('purpose') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 创建新的 FormData 对象用于转发
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('purpose', purpose);

    // 转发请求到第三方 API
    const response = await fetch(`${process.env.UPLOAD_API_ENDPOINT}?GroupId=${process.env.GROUP_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'authority': 'api.minimaxi.com',
      },
      body: uploadFormData,
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
} 