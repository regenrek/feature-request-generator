import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('image');

    // If no custom image is provided, return the default OG image
    if (!imageUrl) {
      return new Response('Missing image parameter', { status: 400 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            background: 'white',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={imageUrl}
            alt="Feature Request"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      ),
      {
        width: 800,
        height: 800,
      },
    );
  } catch (e) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
} 