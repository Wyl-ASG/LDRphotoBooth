export const LAYOUT_DEFINITIONS = Object.freeze([
  {
    id: 'layout-a',
    name: 'Layout A',
    subtitle: 'Size: 2x6 (Strip) 3 Pose',
    type: 'strip',
    poses: 3,
    aspectRatio: '1/3',
    canvasWidth: 600,
    canvasHeight: 1800,
    boxes: [
      { poseIndex: 0, x: 4, y: 3, w: 92, h: 24 },
      { poseIndex: 1, x: 4, y: 29, w: 92, h: 24 },
      { poseIndex: 2, x: 4, y: 55, w: 92, h: 24 },
    ],
    footers: [
      { x: 4, y: 81, w: 92, h: 16, type: 'full' },
    ],
  },
  {
    id: 'layout-b',
    name: 'Layout B',
    subtitle: 'Size: 2x6 (Strip) 3 Pose',
    type: 'strip',
    poses: 3,
    aspectRatio: '1/3',
    canvasWidth: 600,
    canvasHeight: 1800,
    headers: [
      { x: 4, y: 3, w: 92, h: 12, type: 'title_date' },
    ],
    boxes: [
      { poseIndex: 0, x: 4, y: 17, w: 92, h: 22 },
      { poseIndex: 1, x: 4, y: 41, w: 92, h: 22 },
      { poseIndex: 2, x: 4, y: 65, w: 92, h: 22 },
    ],
    footers: [
      { x: 4, y: 89, w: 92, h: 8, type: 'logo_only' },
    ],
  },
  {
    id: 'layout-c',
    name: 'Layout C',
    subtitle: 'Size: 2x6 (Strip) 4 Pose',
    type: 'strip',
    poses: 4,
    aspectRatio: '1/3',
    canvasWidth: 600,
    canvasHeight: 1800,
    boxes: [
      { poseIndex: 0, x: 4, y: 3, w: 92, h: 18.5 },
      { poseIndex: 1, x: 4, y: 23, w: 92, h: 18.5 },
      { poseIndex: 2, x: 4, y: 43, w: 92, h: 18.5 },
      { poseIndex: 3, x: 4, y: 63, w: 92, h: 18.5 },
    ],
    footers: [
      { x: 4, y: 83, w: 92, h: 14, type: 'full' },
    ],
  },
  {
    id: 'layout-d',
    name: 'Layout D',
    subtitle: 'Size: 2x6 (Strip) 4 Pose',
    type: 'strip',
    poses: 4,
    aspectRatio: '1/3',
    canvasWidth: 600,
    canvasHeight: 1800,
    headers: [
      { x: 4, y: 3, w: 92, h: 11, type: 'title_date' },
    ],
    boxes: [
      { poseIndex: 0, x: 4, y: 15, w: 92, h: 17.5 },
      { poseIndex: 1, x: 4, y: 33.5, w: 92, h: 17.5 },
      { poseIndex: 2, x: 4, y: 52, w: 92, h: 17.5 },
      { poseIndex: 3, x: 4, y: 70.5, w: 92, h: 17.5 },
    ],
    footers: [
      { x: 4, y: 89, w: 92, h: 8, type: 'logo_only' },
    ],
  },
  {
    id: 'layout-e',
    name: 'Layout E',
    subtitle: 'Size: 6x4 (4R) 4 Pose',
    type: '4R',
    poses: 4,
    aspectRatio: '3/2',
    canvasWidth: 1800,
    canvasHeight: 1200,
    boxes: [
      { poseIndex: 0, x: 3, y: 4, w: 56, h: 44 },
      { poseIndex: 1, x: 3, y: 51, w: 30, h: 44 },
      { poseIndex: 2, x: 35, y: 51, w: 30, h: 44 },
      { poseIndex: 3, x: 67, y: 51, w: 30, h: 44 },
    ],
    headers: [
      { x: 61, y: 4, w: 36, h: 44, type: 'full' },
    ],
  },
  {
    id: 'layout-f',
    name: 'Layout F',
    subtitle: 'Size: 6x4 (4R) 4 Pose',
    type: '4R',
    poses: 4,
    aspectRatio: '3/2',
    canvasWidth: 1800,
    canvasHeight: 1200,
    boxes: [
      { poseIndex: 0, x: 3, y: 4, w: 45.5, h: 40 },
      { poseIndex: 1, x: 51.5, y: 4, w: 45.5, h: 40 },
      { poseIndex: 2, x: 3, y: 46, w: 45.5, h: 40 },
      { poseIndex: 3, x: 51.5, y: 46, w: 45.5, h: 40 },
    ],
    footers: [
      { x: 3, y: 88, w: 94, h: 9, type: 'horizontal_bar' },
    ],
  },
  {
    id: 'layout-g',
    name: 'Layout G',
    subtitle: 'Size: 6x4 (4R) 3 Pose',
    type: '4R',
    poses: 3,
    aspectRatio: '3/2',
    canvasWidth: 1800,
    canvasHeight: 1200,
    boxes: [
      { poseIndex: 0, x: 3, y: 4, w: 45.5, h: 44 },
      { poseIndex: 1, x: 51.5, y: 4, w: 45.5, h: 44 },
      { poseIndex: 2, x: 3, y: 51, w: 45.5, h: 44 },
    ],
    footers: [
      { x: 51.5, y: 51, w: 45.5, h: 44, type: 'full' },
    ],
  },
  {
    id: 'layout-h',
    name: 'Layout H',
    subtitle: 'Size: 6x4 (4R) 3 Pose',
    type: '4R',
    poses: 3,
    aspectRatio: '3/2',
    canvasWidth: 1800,
    canvasHeight: 1200,
    boxes: [
      { poseIndex: 0, x: 3, y: 4, w: 45.5, h: 44 },
      { poseIndex: 1, x: 3, y: 51, w: 45.5, h: 44 },
      { poseIndex: 2, x: 51.5, y: 51, w: 45.5, h: 44 },
    ],
    headers: [
      { x: 51.5, y: 4, w: 45.5, h: 44, type: 'full' },
    ],
  },
  {
    id: 'layout-i',
    name: 'Layout I',
    subtitle: 'Size: 6x4 (4R) 2 Pose',
    type: '4R',
    poses: 2,
    aspectRatio: '3/2',
    canvasWidth: 1800,
    canvasHeight: 1200,
    boxes: [
      { poseIndex: 0, x: 3, y: 4, w: 45.5, h: 44 },
      { poseIndex: 1, x: 3, y: 51, w: 45.5, h: 44 },
    ],
    headers: [
      { x: 51.5, y: 4, w: 45.5, h: 91, type: 'full' },
    ],
  },
  {
    id: 'layout-j',
    name: 'Layout J',
    subtitle: 'Size: 6x4 (4R) 2 Pose',
    type: '4R',
    poses: 2,
    aspectRatio: '3/2',
    canvasWidth: 1800,
    canvasHeight: 1200,
    boxes: [
      { poseIndex: 0, x: 3, y: 4, w: 45.5, h: 45 },
      { poseIndex: 1, x: 51.5, y: 4, w: 45.5, h: 45 },
    ],
    footers: [
      { x: 3, y: 52, w: 94, h: 44, type: 'full' },
    ],
  },
  {
    id: 'layout-k',
    name: 'Layout K',
    subtitle: 'Size: 6x4 (4R) 2 Pose',
    type: '4R-portrait',
    poses: 2,
    aspectRatio: '2/3',
    canvasWidth: 1200,
    canvasHeight: 1800,
    boxes: [
      { poseIndex: 0, x: 4, y: 3, w: 92, h: 42 },
      { poseIndex: 1, x: 4, y: 47, w: 92, h: 42 },
    ],
    footers: [
      { x: 4, y: 90, w: 92, h: 8, type: 'horizontal_bar' },
    ],
  },
  {
    id: 'layout-l',
    name: 'Layout L',
    subtitle: 'Size: 6x4 (4R) 1 Pose',
    type: '4R',
    poses: 1,
    aspectRatio: '3/2',
    canvasWidth: 1800,
    canvasHeight: 1200,
    boxes: [
      { poseIndex: 0, x: 3, y: 4, w: 94, h: 82 },
    ],
    footers: [
      { x: 3, y: 88, w: 94, h: 9, type: 'horizontal_bar' },
    ],
  },
]);

export const getLayoutById = (id) => {
  return LAYOUT_DEFINITIONS.find((l) => l.id === id) || LAYOUT_DEFINITIONS[0];
};

/**
 * Draws an image/video source into a target rectangle with object-fit: cover,
 * horizontal mirroring (photobooth style), and optional CSS filter styling.
 */
export const drawImageCoverToCanvas = (ctx, source, rect, cameraFilter = 'none') => {
  if (!source) return;

  const sourceW = source.videoWidth || source.width || 640;
  const sourceH = source.videoHeight || source.height || 480;
  if (!sourceW || !sourceH) return;

  const sourceRatio = sourceW / sourceH;
  const targetRatio = rect.w / rect.h;

  let sWidth = sourceW;
  let sHeight = sourceH;
  let sx = 0;
  let sy = 0;

  if (sourceRatio > targetRatio) {
    sWidth = sourceH * targetRatio;
    sx = (sourceW - sWidth) / 2;
  } else {
    sHeight = sourceW / targetRatio;
    sy = (sourceH - sHeight) / 2;
  }

  let filterStr = 'none';
  if (cameraFilter === 'kawaii') filterStr = 'brightness(1.15) saturate(1.3) contrast(1.05) sepia(0.2) hue-rotate(-5deg)';
  else if (cameraFilter === 'vintage') filterStr = 'sepia(0.7) contrast(1.1) brightness(0.9)';
  else if (cameraFilter === 'bnw') filterStr = 'grayscale(1) contrast(1.2)';

  ctx.save();
  ctx.filter = filterStr;
  ctx.translate(rect.x + rect.w, rect.y);
  ctx.scale(-1, 1);
  ctx.beginPath();
  ctx.rect(0, 0, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(source, sx, sy, sWidth, sHeight, 0, 0, rect.w, rect.h);
  ctx.restore();
};

/**
 * Renders text sections (title, date, branding logo) into a canvas section box.
 */

export const drawTextSectionToCanvas = (ctx, section, canvasW, canvasH, titleText = 'Groom & Bride', dateText = 'DD/MM/YY') => {
  const sx = (section.x / 100) * canvasW;
  const sy = (section.y / 100) * canvasH;
  const sw = (section.w / 100) * canvasW;
  const sh = (section.h / 100) * canvasH;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const centerX = sx + sw / 2;
  const centerY = sy + sh / 2;

  if (section.type === 'horizontal_bar') {
    // Left: Date, Middle: Script Title, Right: Logo
    const fontScale = Math.min(sw, sh) * 0.35;

    // Left Date
    ctx.font = `600 ${fontScale * 0.8}px "M PLUS Rounded 1c", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(dateText, sx + sw * 0.05, centerY);

    // Middle Title
    ctx.font = `italic 700 ${fontScale * 1.2}px "Great Vibes", "Caveat", "Dancing Script", "Brush Script MT", cursive`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(titleText, centerX, centerY);

    // Right Logo
    ctx.font = `800 ${fontScale * 0.7}px "M PLUS Rounded 1c", sans-serif`;
    ctx.fillStyle = '#ff99c8';
    ctx.textAlign = 'right';
    ctx.fillText('✨ PURI-PURI BOOTH ✨', sx + sw * 0.95, centerY);

  } else if (section.type === 'title_date') {
    const fontScale = Math.min(sw, sh) * 0.35;
    ctx.font = `italic 700 ${fontScale * 1.3}px "Great Vibes", "Caveat", "Dancing Script", "Brush Script MT", cursive`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(titleText, centerX, centerY - sh * 0.15);

    ctx.font = `600 ${fontScale * 0.65}px "M PLUS Rounded 1c", sans-serif`;
    ctx.fillStyle = '#d1d5db';
    ctx.fillText(dateText, centerX, centerY + sh * 0.25);

  } else if (section.type === 'logo_only') {
    const fontScale = Math.min(sw, sh) * 0.45;
    ctx.font = `800 ${fontScale}px "M PLUS Rounded 1c", sans-serif`;
    ctx.fillStyle = '#ff99c8';
    ctx.fillText('✨ PURI-PURI BOOTH ✨', centerX, centerY);

  } else {
    // Full section (Layout E, G, H, I, J text sections)
    const fontScale = Math.min(sw, sh) * 0.18;

    // Main Script Title
    ctx.font = `italic 700 ${fontScale * 2.2}px "Great Vibes", "Caveat", "Dancing Script", "Brush Script MT", cursive`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(titleText, centerX, centerY - sh * 0.15);

    // Date
    ctx.font = `600 ${fontScale * 1.1}px "M PLUS Rounded 1c", sans-serif`;
    ctx.fillStyle = '#e5e7eb';
    ctx.fillText(dateText, centerX, centerY + sh * 0.15);

    // Logo badge
    ctx.font = `800 ${fontScale * 0.9}px "M PLUS Rounded 1c", sans-serif`;
    ctx.fillStyle = '#ff99c8';
    ctx.fillText('✨ PURI-PURI BOOTH ✨', centerX, centerY + sh * 0.35);
  }

  ctx.restore();
};

const loadImage = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    if (src instanceof HTMLCanvasElement || src instanceof HTMLVideoElement || src instanceof HTMLImageElement) {
      return resolve(src);
    }
    if (typeof src === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    } else {
      resolve(null);
    }
  });
};

/**
 * Compiles a complete photobooth print canvas for the specified layout and captured pose pairs.
 * Each photo box gets host image on left half and guest image on right half (0 gap!).
 */
export const compileLayoutCanvas = async ({
  layoutId,
  poseImages = [], // Array of { host: dataUrl/canvas/img, guest: dataUrl/canvas/img }
  customTitle = 'Groom & Bride',
  customDate = 'DD/MM/YY',
  cameraFilter = 'none',
  backgroundColor = '#111111',
}) => {
  const layout = getLayoutById(layoutId);
  const canvas = document.createElement('canvas');
  canvas.width = layout.canvasWidth;
  canvas.height = layout.canvasHeight;

  const ctx = canvas.getContext('2d');
  const cw = canvas.width;
  const ch = canvas.height;

  // Background card color (black card stock)
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, cw, ch);

  // Preload all pose images safely
  const loadedPoses = await Promise.all(
    poseImages.map(async (pose) => ({
      host: await loadImage(pose?.host),
      guest: await loadImage(pose?.guest),
    }))
  );

  // Render photo boxes
  layout.boxes.forEach((box) => {
    const bx = (box.x / 100) * cw;
    const by = (box.y / 100) * ch;
    const bw = (box.w / 100) * cw;
    const bh = (box.h / 100) * ch;

    // Draw white photo frame box
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.rect(bx, by, bw, bh);
    ctx.fill();

    const borderWidth = Math.max(4, Math.min(bw, bh) * 0.03);
    const ix = bx + borderWidth;
    const iy = by + borderWidth;
    const iw = bw - borderWidth * 2;
    const ih = bh - borderWidth * 2;

    // Imperial Requirement: Left half = Person 1 (Host), Right half = Person 2 (Guest) with 0 gap!
    const halfWidth = iw / 2;
    const leftRect = { x: ix, y: iy, w: halfWidth, h: ih };
    const rightRect = { x: ix + halfWidth, y: iy, w: halfWidth, h: ih };

    const currentPose = loadedPoses[box.poseIndex] || {};

    if (currentPose.host) {
      drawImageCoverToCanvas(ctx, currentPose.host, leftRect, cameraFilter);
    } else {
      ctx.fillStyle = '#fce7f3';
      ctx.fillRect(leftRect.x, leftRect.y, leftRect.w, leftRect.h);
    }

    if (currentPose.guest) {
      drawImageCoverToCanvas(ctx, currentPose.guest, rightRect, cameraFilter);
    } else {
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(rightRect.x, rightRect.y, rightRect.w, rightRect.h);
    }
  });

  // Render headers
  if (layout.headers) {
    layout.headers.forEach((header) => {
      drawTextSectionToCanvas(ctx, header, cw, ch, customTitle, customDate);
    });
  }

  // Render footers
  if (layout.footers) {
    layout.footers.forEach((footer) => {
      drawTextSectionToCanvas(ctx, footer, cw, ch, customTitle, customDate);
    });
  }

  return canvas.toDataURL('image/jpeg', 0.88);
};

