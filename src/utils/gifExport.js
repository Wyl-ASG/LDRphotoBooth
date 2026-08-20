import GIF from 'gif.js';
import { getLayoutById, compileLayoutCanvas } from './layoutsConfig';

export const createGifFromPoses = async ({
  burstFrames,
  cameraFilter = 'none',
  layoutId = 'layout-a',
  customTitle = 'Groom & Bride',
  customDate = 'DD/MM/YY',
  totalPoses = 3
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const layout = getLayoutById(layoutId);
      
      const gif = new GIF({
        workers: 4,
        quality: 10,
        workerScript: '/gif.worker.js',
        width: layout.canvasWidth,
        height: layout.canvasHeight,
      });

      // burstFrames has multiple frames for each pose in order.
      // E.g., for 3 poses, if there are 27 frames per pose, total = 81 frames.
      // We want to create 27 GIF frames.
      const framesPerPose = Math.floor(burstFrames.length / totalPoses);
      
      for (let f = 0; f < framesPerPose; f++) {
        // Collect the f-th frame for each pose
        const currentFramePoses = [];
        for (let p = 0; p < totalPoses; p++) {
          const frameIndex = p * framesPerPose + f;
          currentFramePoses.push(burstFrames[frameIndex]);
        }

        // We can just use compileLayoutCanvas which handles the drawing
        const compiledImageData = await compileLayoutCanvas({
          layoutId,
          poseImages: currentFramePoses,
          customTitle,
          customDate,
          cameraFilter,
          returnType: 'imageData'
        });
        
        gif.addFrame(compiledImageData, { delay: 125 }); // 8 frames per sec -> 125ms delay
      }

      gif.on('finished', (blob) => {
        resolve(URL.createObjectURL(blob));
      });

      gif.on('error', (err) => {
        reject(err);
      });

      gif.render();
    } catch (err) {
      reject(err);
    }
  });
};
