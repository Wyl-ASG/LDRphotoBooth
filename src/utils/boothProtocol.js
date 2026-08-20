import { LAYOUT_DEFINITIONS } from './layoutsConfig';

export const BOOTH_PROTOCOL = Object.freeze({
  defaults: Object.freeze({
    layoutStyle: 'layout-a',
    cameraFilter: 'none',
    customTitle: 'Groom & Bride',
    customDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
  }),
  layouts: Object.freeze(
    LAYOUT_DEFINITIONS.map((l) =>
      Object.freeze({
        value: l.id,
        label: `${l.name} - ${l.subtitle}`,
        id: l.id,
        name: l.name,
        subtitle: l.subtitle,
        type: l.type,
        poses: l.poses,
      })
    )
  ),
  filters: Object.freeze([
    Object.freeze({ value: 'none', label: 'Normal' }),
    Object.freeze({ value: 'kawaii', label: '🌸 Kawaii' }),
    Object.freeze({ value: 'vintage', label: '🎞️ Vintage' }),
    Object.freeze({ value: 'bnw', label: '🖤 B&W' }),
  ]),
  messageTypes: Object.freeze({
    countdownTick: 'COUNTDOWN_TICK',
    photoTaken: 'PHOTO_TAKEN',
    backToBooth: 'BACK_TO_BOOTH',
    layoutChange: 'LAYOUT_CHANGE',
    filterChange: 'FILTER_CHANGE',
    syncStickers: 'SYNC_STICKERS',
    updateSticker: 'UPDATE_STICKER',
    initiateFinish: 'INITIATE_FINISH',
    startSession: 'START_SESSION',
    titleChange: 'TITLE_CHANGE',
    dateChange: 'DATE_CHANGE',
  }),
  limits: Object.freeze({
    maxRemotePhotoDataUrlLength: 5_000_000,
    maxRemoteStickers: 24,
    maxEmojiLength: 4,
    maxStickerSize: 400,
  }),
});

const MESSAGE_TYPE_VALUES = new Set(Object.values(BOOTH_PROTOCOL.messageTypes));
const LAYOUT_VALUES = new Set(BOOTH_PROTOCOL.layouts.map((option) => option.value));
const FILTER_VALUES = new Set(BOOTH_PROTOCOL.filters.map((option) => option.value));

const isPlainObject = (value) => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const isValidSticker = (sticker) => {
  return isPlainObject(sticker)
    && Number.isFinite(sticker.id)
    && typeof sticker.emoji === 'string'
    && sticker.emoji.length > 0
    && sticker.emoji.length <= BOOTH_PROTOCOL.limits.maxEmojiLength
    && Number.isFinite(sticker.x)
    && Number.isFinite(sticker.y)
    && Number.isFinite(sticker.size)
    && sticker.size > 0
    && sticker.size <= BOOTH_PROTOCOL.limits.maxStickerSize;
};

export const dataUrlToBlob = (dataUrl) => {
  const split = dataUrl.split(',');
  const mimeMatch = split[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const b64 = split[1] || split[0];
  const byteCharacters = atob(b64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
};

export const createPhotoObjectUrl = async (photoPayload) => {
  if (photoPayload instanceof Blob) {
    return URL.createObjectURL(photoPayload);
  }

  if (typeof photoPayload === 'string' && photoPayload.length > 0) {
    const blob = dataUrlToBlob(photoPayload);
    return URL.createObjectURL(blob);
  }

  throw new Error('Invalid photo payload');
};

export const normalizePeerMessage = (data) => {
  const { messageTypes, limits } = BOOTH_PROTOCOL;

  if (!isPlainObject(data) || typeof data.type !== 'string' || !MESSAGE_TYPE_VALUES.has(data.type)) {
    return null;
  }

  switch (data.type) {
    case messageTypes.countdownTick:
      if (data.count === null || data.count === 'burst' || (Number.isInteger(data.count) && data.count >= 0 && data.count <= 9)) {
        return {
          type: data.type,
          count: data.count,
          poseIndex: typeof data.poseIndex === 'number' ? data.poseIndex : 0,
          totalPoses: typeof data.totalPoses === 'number' ? data.totalPoses : 1,
        };
      }
      return null;
    case messageTypes.photoTaken:
      if (typeof data.photoUrl === 'string' && data.photoUrl.length > 0 && data.photoUrl.length <= limits.maxRemotePhotoDataUrlLength) {
        return { type: data.type, photoUrl: data.photoUrl };
      }
      return null;
    case messageTypes.backToBooth:
    case messageTypes.initiateFinish:
    case messageTypes.startSession:
      return { type: data.type };
    case messageTypes.layoutChange:
      if (typeof data.layoutStyle === 'string' && LAYOUT_VALUES.has(data.layoutStyle)) {
        return {
          type: data.type,
          layoutStyle: data.layoutStyle,
          customTitle: typeof data.customTitle === 'string' ? data.customTitle : undefined,
          customDate: typeof data.customDate === 'string' ? data.customDate : undefined,
        };
      }
      return null;
    case messageTypes.titleChange:
      if (typeof data.customTitle === 'string') {
        return { type: data.type, customTitle: data.customTitle };
      }
      return null;
    case messageTypes.dateChange:
      if (typeof data.customDate === 'string') {
        return { type: data.type, customDate: data.customDate };
      }
      return null;
    case messageTypes.filterChange:
      if (typeof data.cameraFilter === 'string' && FILTER_VALUES.has(data.cameraFilter)) {
        return { type: data.type, cameraFilter: data.cameraFilter };
      }
      return null;
    case messageTypes.syncStickers:
      if (Array.isArray(data.stickers) && data.stickers.length <= limits.maxRemoteStickers && data.stickers.every(isValidSticker)) {
        return { type: data.type, stickers: data.stickers };
      }
      return null;
    case messageTypes.updateSticker:
      if (isValidSticker(data.sticker)) {
        return { type: data.type, sticker: data.sticker };
      }
      return null;
    default:
      return null;
  }
};