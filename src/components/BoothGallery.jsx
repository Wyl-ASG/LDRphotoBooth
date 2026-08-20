import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Save, Loader2, RefreshCcw, CheckCircle2, Download, Film } from 'lucide-react';
import { Button } from './Button';
import { createGifFromPoses } from '../utils/gifExport';

export const BoothGallery = ({ 
  photos, 
  role, 
  isUploading, 
  uploadSuccess, 
  onBackToBooth, 
  onSaveToDrive,
  capturedPoses,
  cameraFilter,
  layoutStyle,
  customTitle,
  customDate,
  totalPoses
}) => {
  const latestPhoto = photos.length > 0 ? photos[photos.length - 1] : null;
  const [aspectRatio, setAspectRatio] = useState(null);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [generatedGifUrl, setGeneratedGifUrl] = useState(null);

  useEffect(() => {
    if (!latestPhoto) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = latestPhoto;
  }, [latestPhoto]);

  const handleDownload = () => {
    if (!latestPhoto) return;
    const a = document.createElement('a');
    a.href = latestPhoto;
    a.download = `Purikura_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadGif = async () => {
    if (!capturedPoses || capturedPoses.length === 0) return;
    try {
      setIsGeneratingGif(true);
      
      let finalGifUrl = generatedGifUrl;
      if (!finalGifUrl) {
        finalGifUrl = await createGifFromPoses({
          burstFrames: capturedPoses,
          cameraFilter,
          layoutId: layoutStyle,
          customTitle,
          customDate,
          totalPoses
        });
        setGeneratedGifUrl(finalGifUrl);
      }
      
      const a = document.createElement('a');
      a.href = finalGifUrl;
      a.download = `Purikura_Animated_${Date.now()}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to generate GIF:', err);
      alert('Failed to generate GIF. Please try again.');
    } finally {
      setIsGeneratingGif(false);
    }
  };

  const handleSaveToDrive = async () => {
    try {
      let finalGifUrl = generatedGifUrl;
      if (!finalGifUrl && capturedPoses && capturedPoses.length > 0) {
        setIsGeneratingGif(true);
        finalGifUrl = await createGifFromPoses({
          burstFrames: capturedPoses,
          cameraFilter,
          layoutId: layoutStyle,
          customTitle,
          customDate,
          totalPoses
        });
        setGeneratedGifUrl(finalGifUrl);
        setIsGeneratingGif(false);
      }
      onSaveToDrive(finalGifUrl);
    } catch (err) {
      console.error('Failed to generate GIF before saving:', err);
      onSaveToDrive(null);
      setIsGeneratingGif(false);
    }
  };

  const maxWidthClass = aspectRatio
    ? aspectRatio < 0.5
      ? 'max-w-xs sm:max-w-sm'
      : aspectRatio < 1
      ? 'max-w-md'
      : 'max-w-2xl'
    : 'max-w-2xl';

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <ImageIcon /> Photo Gallery
      </h2>
      
      <div className={`w-full ${maxWidthClass} mb-6 flex flex-col items-center`}>
        {latestPhoto ? (
          <img 
            src={latestPhoto} 
            alt="Captured photobooth print" 
            className="w-full h-auto rounded-2xl shadow-2xl block border border-neutral-800" 
          />
        ) : (
          <div className="w-full h-64 flex items-center justify-center text-gray-400 bg-neutral-900 rounded-2xl border border-neutral-800">
            No photos yet!
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {latestPhoto && (
          <Button icon={Download} onClick={handleDownload}>
            Download Photo
          </Button>
        )}

        {capturedPoses && capturedPoses.length > 0 && (
          <Button 
            icon={isGeneratingGif ? Loader2 : Film} 
            onClick={handleDownloadGif}
            disabled={isGeneratingGif}
            variant="secondary"
            className={isGeneratingGif ? '[&>svg]:animate-spin' : ''}
          >
            {isGeneratingGif ? 'Generating...' : 'Download GIF'}
          </Button>
        )}

        {role === 'host' && (
          <Button icon={RefreshCcw} variant="secondary" onClick={onBackToBooth}>
            Back to Booth
          </Button>
        )}

        {role === 'host' && (
          <Button 
            icon={isUploading ? Loader2 : uploadSuccess ? CheckCircle2 : Save} 
            onClick={handleSaveToDrive}
            disabled={isUploading || uploadSuccess || !latestPhoto}
            className={isUploading ? '[&>svg]:animate-spin' : ''}
          >
            {isUploading ? 'Saving...' : uploadSuccess ? 'Saved to Drive!' : 'Save to Drive'}
          </Button>
        )}
      </div>
      
      {role === 'guest' && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          Host controls returning to the booth. You can download your photo strip directly above!
        </p>
      )}
    </div>
  );
};
export default BoothGallery;