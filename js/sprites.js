// Loads character/pipe/background/item art and auto-trims blank space
// around each sprite so hitboxes stay tight to the artwork.
// ---- Auto-trim extra blank/transparent space around the image ----
// Keeps the hitbox tight to the real artwork, avoiding "lost before touching" feel.
function trimImage(img) {
  try {
    const src = document.createElement('canvas');
    src.width = img.naturalWidth;
    src.height = img.naturalHeight;
    const sctx = src.getContext('2d');
    sctx.drawImage(img, 0, 0);
    const data = sctx.getImageData(0, 0, src.width, src.height).data;

    let minX = src.width, minY = src.height, maxX = -1, maxY = -1;
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        const i = (y * src.width + x) * 4;
        const alpha = data[i + 3];
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // Skip transparent or near-pure-white pixels (extra blank space)
        const isBlank = alpha < 15 || (r > 248 && g > 248 && b > 248);
        if (!isBlank) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      // No content region found -> use the original image
      minX = 0; minY = 0; maxX = src.width - 1; maxY = src.height - 1;
    }

    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    out.getContext('2d').drawImage(src, minX, minY, w, h, 0, 0, w, h);
    return out;
  } catch (e) {
    // If the browser blocks pixel reading (rare with same-folder files), use the original image
    console.warn('Could not trim image, using original:', e);
    return img;
  }
}

// ---- Load images ----
// Place assets/nhanvat.png, assets/nhanvat2.png (2 characters) and assets/ongkhoi.png (pipe) in the same folder as this HTML file.
let birdSprite = null; // trimmed canvas of the CURRENTLY selected character, used for drawing + hitbox
let pipeSprite = null;
let birdAspect = 40 / 30; // default ratio, updated once the image finishes loading

// Preload sprite + aspect ratio for both characters so the player can choose before playing
const birdSpritesByChar = { 1: null, 2: null };
const birdAspectsByChar = { 1: 40 / 30, 2: 40 / 30 };
let selectedCharNum = null; // 1 or 2, set when the player picks on the setup screen

function loadCharacterSprite(num, src) {
  const img = new Image();
  img.onload = () => {
    birdSpritesByChar[num] = trimImage(img);
    birdAspectsByChar[num] = birdSpritesByChar[num].width / birdSpritesByChar[num].height;
    // If the player already selected this character and the image just finished loading, update it now
    if (selectedCharNum === num) {
      birdSprite = birdSpritesByChar[num];
      birdAspect = birdAspectsByChar[num];
    }
  };
  img.src = src;
  return img;
}
loadCharacterSprite(1, 'assets/nhanvat.png');
loadCharacterSprite(2, 'assets/nhanvat2.png');

const pipeImg = new Image();
pipeImg.onload = () => {
  pipeSprite = trimImage(pipeImg);
};
pipeImg.src = 'assets/ongkhoi.png';

const bgImg = new Image();
let bgLoaded = false;
bgImg.onload = () => { bgLoaded = true; };
bgImg.src = 'assets/bg.png';

let itemSprite = null;
let itemAspect = 1;
const itemImg = new Image();
itemImg.onload = () => {
  itemSprite = trimImage(itemImg);
  itemAspect = itemSprite.width / itemSprite.height;
};
itemImg.src = 'assets/item.png';
