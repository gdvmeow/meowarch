import { displayImage } from './imageCorrections.js';
// Five individually reviewed awards. Source inventory: content/scan-imports/awards-2026-11.json.
export const awardDocuments = [
  {
    "id": "art-school-letter-2024",
    "src": "awards/art-school-letter-2024.webp",
    "width": 2060,
    "height": 2924,
    "sha256": "6fa0d6e99ccbfbd7f7e715a29e92c5764ce90e5b0f7a6d0a22a5fac1c3177f4c"
  },
  {
    "id": "we-together-certificate",
    "src": "awards/we-together-certificate.webp",
    "width": 1813,
    "height": 2574,
    "sha256": "a08b32e6fadfa5e685e1d5cccc31e649b5d1aa17081de91b31bf401699dd8546"
  },
  {
    "id": "we-together-diploma-2024",
    "src": "awards/we-together-diploma-2024.webp",
    "width": 1757,
    "height": 2468,
    "sha256": "fba1e86ee65760494ab978a4e8261c95124b076c01c1f3f72360f37e6b64d2f5"
  },
  {
    "id": "spring-palette-diploma-2023",
    "src": "awards/spring-palette-diploma-2023.webp",
    "width": 1767,
    "height": 2518,
    "sha256": "01583805dec6891058383057c18c44bf9bcc2a08b135a35ed317efaf3fd510ae"
  },
  {
    "id": "on-our-land-diploma-2024",
    "src": "awards/on-our-land-diploma-2024.webp",
    "width": 745,
    "height": 1128,
    "sha256": "3bf720455d82bb92ca30e972fcd02d45c238030b5b26a1dd99e974fce3001559"
  }
].map(displayImage);

export const antinousScan = displayImage({
  "src": "antinous-scan.webp",
  "width": 1643,
  "height": 2387,
  "sha256": "a1261e8f7f08ac3d6f341ee3b7a2fbbd8cf89896ce4d383783b9522637e81b51"
});
