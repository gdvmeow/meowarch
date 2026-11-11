// Separate, full-frame tonal derivatives. The source assets are unchanged.
export const imageCorrections = {
  "antinous.jpg": {
    "src": "antinous-neutral.webp",
    "width": 1536,
    "height": 2048,
    "sha256": "d060942135aef792b2f03bb1fca4329b7a4d9055a5725edf52d24bdee255f47d"
  },
  "antinous-scan.webp": {
    "src": "antinous-scan-neutral.webp",
    "width": 1643,
    "height": 2387,
    "sha256": "b776976d4cc15a255a23eb849a8950eeb5d6e4ce3b869853079bd3270834d64f"
  },
  "awards/on-our-land-diploma-2024.webp": {
    "src": "awards/on-our-land-diploma-2024-neutral.webp",
    "width": 745,
    "height": 1128,
    "sha256": "bac3fde9ded8668861bc16259f268a5ac2106e2a633041716f1a5f1bc9b474fd"
  }
};

export function displayImage(image) {
  return { ...image, ...(imageCorrections[image.src] ?? {}) };
}
