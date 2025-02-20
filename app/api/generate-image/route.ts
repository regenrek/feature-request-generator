import { NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';

export async function POST(req: Request) {
  try {
    const { memeNumber, textBoxes } = await req.json();
    
    // Create canvas with 1:1 aspect ratio
    const canvas = createCanvas(800, 800);
    const ctx = canvas.getContext('2d');
    
    // Load and draw the base image
    const image = await loadImage(`${process.env.NEXT_PUBLIC_URL}/meme${memeNumber}.jpg`);
    ctx.drawImage(image, 0, 0, 800, 800);
    
    // Add text boxes
    textBoxes.forEach((box: any) => {
      const { text, x, y, width, height, fontSize } = box;
      
      ctx.save();
      // Add semi-transparent background for text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(x, y, width, height);
      
      // Add text
      ctx.fillStyle = 'black';
      ctx.font = `${fontSize}px Inter`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(text, x + width / 2, y + height / 2);
      ctx.restore();
    });
    
    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/jpeg');
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'attachment; filename="meme.jpg"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}