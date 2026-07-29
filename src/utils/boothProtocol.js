export const BOOTH_PROTOCOL = Object.freeze({
  defaults: Object.freeze({
    layoutStyle: 'split-horizontal',
    cameraFilter: 'none',
  }),
  layouts: Object.freeze([
    Object.freeze({ value: 'split-horizontal', label: 'Split Horizontal' }),
    Object.freeze({ value: 'split-vertical', label: 'Split Vertical' }),
    Object.freeze({ value: 'pip', label: 'Picture-in-Picture' }),
  ]),
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
    initiateFinish: 'INITIATE_FINISH',
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

export const createPhotoObjectUrl = async (photoPayload) => {
  if (photoPayload instanceof Blob) {
    return URL.createObjectURL(photoPayload);
  }

  if (typeof photoPayload === 'string' && photoPayload.length > 0) {
    const split = photoPayload.split(',');
    const b64 = split[1] || split[0];
    const byteCharacters = atob(b64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteArraysChunk = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteArraysChunk[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteArraysChunk));
    }

    const blob = new Blob(byteArrays, { type: 'image/jpeg' });
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
      if (data.count === null || (Number.isInteger(data.count) && data.count >= 0 && data.count <= 9)) {
        return { type: data.type, count: data.count };
      }
      return null;
    case messageTypes.photoTaken:
      if (typeof data.photoUrl === 'string' && data.photoUrl.length > 0 && data.photoUrl.length <= limits.maxRemotePhotoDataUrlLength) {
        return { type: data.type, photoUrl: data.photoUrl };
      }
      return null;
    case messageTypes.backToBooth:
    case messageTypes.initiateFinish:
      return { type: data.type };
    case messageTypes.layoutChange:
      if (typeof data.layoutStyle === 'string' && LAYOUT_VALUES.has(data.layoutStyle)) {
        return { type: data.type, layoutStyle: data.layoutStyle };
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
    default:
      return null;
  }
};