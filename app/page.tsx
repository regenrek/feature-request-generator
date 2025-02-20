'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Rnd } from 'react-rnd';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Share2, Trash2, RefreshCw, Maximize2, Twitter, Send } from 'lucide-react';
import { toPng } from 'html-to-image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

interface TextBox {
  id: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  isSelected: boolean;
}

export default function Home() {
  const [textInput, setTextInput] = useState('');
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [currentMeme, setCurrentMeme] = useState(1);
  const memeRef = useRef<HTMLDivElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function handleSwitchMeme() {
    setCurrentMeme(current => current === 5 ? 1 : current + 1);
  }

  function handleAddTextBox() {
    if (!textInput.trim()) return;
    setTextBoxes((prev) => [
      ...prev.map(tb => ({ ...tb, isSelected: false })),
      {
        id: Date.now(),
        text: textInput,
        x: 0,
        y: 0,
        width: 200,
        height: 60,
        fontSize: 20,
        isSelected: true
      },
    ]);
    setTextInput('');
  }

  function handleDrag(e: any, data: any, id: number) {
    setTextBoxes((prev) =>
      prev.map((tb) => (tb.id === id ? { ...tb, x: data.x, y: data.y } : tb))
    );
  }

  const handleShare = useCallback(async () => {
    if (memeRef.current) {
      try {
        const dataUrl = await toPng(memeRef.current, {
          quality: 1.0,
          pixelRatio: 2,
          cacheBust: true
        });

        // Try to share using the Web Share API
        if (navigator.canShare && navigator.canShare({ url: dataUrl })) {
          try {
            await navigator.share({
              title: 'My Meme Creation',
              text: 'Check out this meme I created!',
              url: dataUrl
            });
          } catch (shareError) {
            // If sharing fails, fall back to download
            downloadImage(dataUrl);
          }
        } else {
          // If Web Share API is not supported, fall back to download
          downloadImage(dataUrl);
        }
      } catch (error) {
        console.error('Error generating image:', error);
        alert('Failed to generate image. Please try again.');
      }
    }
  }, []);

  const downloadImage = (dataUrl: string) => {
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'meme.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  function handleRemoveTextBox(id: number) {
    setTextBoxes((prev) => prev.filter((tb) => tb.id !== id));
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleAddTextBox();
    }
  }

  const generateImage = useCallback(async () => {
    if (memeRef.current) {
      try {
        // Store original styles
        const textBoxes = memeRef.current.querySelectorAll('.text-box');
        const originalStyles = Array.from(textBoxes).map(el => ({
          el,
          bg: (el as HTMLElement).style.backgroundColor,
          border: (el as HTMLElement).style.border
        }));

        // Remove backgrounds and borders
        textBoxes.forEach(el => {
          (el as HTMLElement).style.backgroundColor = 'transparent';
          (el as HTMLElement).style.border = 'none';
        });

        const dataUrl = await toPng(memeRef.current, { cacheBust: true });
        setImagePreview(dataUrl);

        // Restore original styles
        originalStyles.forEach(({ el, bg, border }) => {
          (el as HTMLElement).style.backgroundColor = bg;
          (el as HTMLElement).style.border = border;
        });
      } catch (err) {
        console.error('Error generating image:', err);
      }
    }
  }, []);

  const shareToX = () => {
    if (imagePreview) {
      // Prepare share content
      const text = "I want this!";
      
      // Construct X web intent URL with proper parameters
      const intentUrl = new URL("https://x.com/intent/post");
      intentUrl.searchParams.append("text", text);
      intentUrl.searchParams.append("url", window.location.href);
      
      // Open X share dialog
      window.open(intentUrl.toString(), "_blank");
    }
  };

  const shareToBluesky = () => {
    if (imagePreview) {
      // Bluesky doesn't have a web intent system yet, so we'll copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied! You can now paste it on Bluesky");
    }
  };

  const shareToThreads = () => {
    if (imagePreview) {
      // Threads doesn't have a web intent system yet, so we'll copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied! You can now paste it on Threads");
    }
  };

  const handleTextBoxSelect = (id: number) => {
    setTextBoxes(prev => 
      prev.map(tb => ({
        ...tb,
        isSelected: tb.id === id
      }))
    );
  };

  const handleFontSizeChange = (value: number[]) => {
    setTextBoxes(prev =>
      prev.map(tb =>
        tb.isSelected ? { ...tb, fontSize: value[0] } : tb
      )
    );
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Feature Request Generator</h1>
        
        <div className="relative">
          <div ref={memeRef} className="relative w-full aspect-square mb-6">
            <Image
              src={`/meme${currentMeme}.jpg`}
              alt="Meme Template"
              fill
              className="object-cover rounded-lg border border-gray-200"
              priority
            />
            {textBoxes.map((box) => (
              <Rnd
                key={box.id}
                default={{
                  x: box.x,
                  y: box.y,
                  width: box.width,
                  height: box.height
                }}
                minWidth={100}
                minHeight={40}
                bounds="parent"
                onDragStop={(e, d) => {
                  setTextBoxes(prev =>
                    prev.map(tb =>
                      tb.id === box.id ? { ...tb, x: d.x, y: d.y } : tb
                    )
                  );
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  setTextBoxes(prev =>
                    prev.map(tb =>
                      tb.id === box.id
                        ? {
                            ...tb,
                            width: parseInt(ref.style.width),
                            height: parseInt(ref.style.height),
                            x: position.x,
                            y: position.y
                          }
                        : tb
                    )
                  );
                }}
                onClick={() => handleTextBoxSelect(box.id)}
                className={`group ${box.isSelected ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="text-box w-full h-full bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg px-3 py-2 shadow-lg flex items-center justify-between">
                  <span 
                    className="text-lg font-semibold flex-1 text-center"
                    style={{ fontSize: `${box.fontSize}px` }}
                  >
                    {box.text}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTextBox(box.id);
                      }}
                      className="p-1 rounded-full hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                    <div className="p-1 rounded-full hover:bg-gray-100">
                      <Maximize2 className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              </Rnd>
            ))}
          </div>

          {textBoxes.some(tb => tb.isSelected) && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-64 flex flex-col items-center gap-2 bg-white/95 rounded-lg p-3 shadow-lg border border-gray-200">
              <span className="text-xs font-medium text-gray-500">Size</span>
              <Slider
                orientation="vertical"
                min={12}
                max={72}
                step={1}
                value={[textBoxes.find(tb => tb.isSelected)?.fontSize || 20]}
                onValueChange={handleFontSizeChange}
                className="h-full"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your text here..."
              className="w-full"
            />
          </div>
          <Button
            variant="default"
            onClick={handleAddTextBox}
            className="sm:w-24"
          >
            Add
          </Button>
          <Button
            variant="outline"
            onClick={handleSwitchMeme}
            className="sm:w-32 whitespace-nowrap"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Change Image
          </Button>
          <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={generateImage}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Meme</DialogTitle>
            <DialogDescription>
              Share your creation on your favorite social platform
            </DialogDescription>
          </DialogHeader>
          
          {imagePreview && (
            <div className="flex flex-col gap-4">
              <div className="relative aspect-square w-full">
                <Image
                  src={imagePreview}
                  alt="Meme preview"
                  className="rounded-lg object-contain"
                  fill
                />
              </div>
              
              <Tabs defaultValue="x" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="x">X</TabsTrigger>
                  <TabsTrigger value="bluesky">Bluesky</TabsTrigger>
                  <TabsTrigger value="threads">Threads</TabsTrigger>
                </TabsList>
                <TabsContent value="x">
                  <Button onClick={shareToX} className="w-full gap-2">
                    <svg 
                      viewBox="0 0 24 24" 
                      className="h-4 w-4" 
                      aria-hidden="true"
                    >
                      <path 
                        fill="currentColor" 
                        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                      />
                    </svg>
                    Share on X
                  </Button>
                </TabsContent>
                <TabsContent value="bluesky">
                  <Button onClick={shareToBluesky} className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    Share on Bluesky
                  </Button>
                </TabsContent>
                <TabsContent value="threads">
                  <Button onClick={shareToThreads} className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    Share on Threads
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </div>
      </div>

      {/* Add backlink */}
      <div className="mt-4 text-sm text-gray-500">
        <a 
          href="https://kevinkern.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-gray-800 transition-colors duration-200 flex items-center gap-2"
        >
          Built by Kevin Kern
          <svg 
            className="h-4 w-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
            />
          </svg>
        </a>
      </div>
    </main>
  );
}