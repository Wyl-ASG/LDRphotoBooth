import React from 'react';
import { Image as ImageIcon, Save, Loader2, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export const BoothGallery = ({ 
  photos, 
  role, 
  isUploading, 
  uploadSuccess, 
  onBackToBooth, 
  onSaveToDrive 
}) => {
  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <ImageIcon /> Photo Gallery
      </h2>
      
      <div className="w-full max-w-3xl aspect-[4/3] bg-gray-100 rounded-2xl border-4 border-white shadow-lg overflow-hidden relative mb-6">
        {photos.length > 0 ? (
          <img src={photos[photos.length - 1]} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No photos yet!</div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {role === 'host' && (
          <Button icon={RefreshCcw} variant="secondary" onClick={onBackToBooth}>
            Back to Booth
          </Button>
        )}
        
        {role === 'host' && (
          <Button 
            icon={isUploading ? Loader2 : uploadSuccess ? CheckCircle2 : Save} 
            onClick={onSaveToDrive}
            disabled={isUploading || uploadSuccess}
            className={isUploading ? '[&>svg]:animate-spin' : ''}
          >
            {isUploading ? 'Saving...' : uploadSuccess ? 'Saved to Drive!' : 'Save to Drive'}
          </Button>
        )}
      </div>
      
      {role === 'guest' && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          Only the Host can return to the booth or save photos to Google Drive.
        </p>
      )}
    </div>
  );
};
export default BoothGallery;