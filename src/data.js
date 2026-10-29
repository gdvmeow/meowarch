import { scanStudies } from './scanStudies.js';

export const projects = [
  {
    id: 'low-rise-house',
    title: 'Малоэтажный жилой дом',
    category: 'Жилая архитектура',
    group: 'architecture',
    summary: 'Жилой дом с наклонной кровлей и выразительным остеклением.',
    description: 'Учебный проект в ручной цветной подаче: перспектива, два фасада, планы первого и второго этажей, разрез и генеральный план участка.',
    cover: { src: 'low-rise-house-cover.webp', width: 1480, height: 945 },
    images: [
      { src: 'low-rise-house-sheet.webp', alt: 'Малоэтажный жилой дом — перспектива, фасады, планы этажей, разрез и генплан', width: 3029, height: 2077 },
    ],
  },
  {
    id: 'folded-roof-cafe',
    title: 'Кафе на 50 мест',
    category: 'Общественная архитектура',
    group: 'architecture',
    summary: 'Кафе со складчатой кровлей и остеклением по периметру зала.',
    description: 'Ручная архитектурная подача кафе на 50 мест. На листе собраны перспектива, план, разрез, главный и боковой фасады, схема размещения на участке.',
    cover: { src: 'folded-roof-cafe-cover.webp', width: 1600, height: 908 },
    images: [
      { src: 'folded-roof-cafe-sheet.webp', alt: 'Кафе на 50 мест — перспектива, план, разрез и два фасада', width: 1741, height: 2309 },
    ],
  },
  {
    id: 'single-storey-house',
    title: 'Одноэтажный дом',
    category: 'Жилая архитектура',
    group: 'architecture',
    summary: 'Дом со скатной кровлей и встроенным гаражом.',
    description: 'Учебный архитектурный лист: главный фасад с окружением, план с экспликацией помещений и разрез. Ручное черчение с тональной проработкой фасада.',
    images: [
      { src: 'single-storey-house-sheet.webp', alt: 'Одноэтажный дом — главный фасад, план с экспликацией и разрез', width: 2762, height: 1690 },
    ],
  },
  {
    id: 'house-construction',
    title: 'Конструкция дома',
    category: 'Архитектурные конструкции',
    group: 'architecture',
    summary: 'Конструктивная разработка жилого дома от фундамента до кровли.',
    description: 'Ручной чертёж с планами фундамента, перекрытия, стропил и кровли, разрезами и конструктивными узлами лестницы, стен и перекрытий.',
    cover: { src: 'house-construction-cover.webp', width: 780, height: 800 },
    images: [
      { src: 'house-construction-sheet.webp', alt: 'Конструкция дома — планы фундамента, перекрытия, стропил и кровли, разрезы и узлы', width: 2051, height: 2670 },
    ],
  },
  {
    id: 'socrates',
    title: 'Сократ',
    category: 'Академический рисунок',
    group: 'graphics',
    summary: 'Гипсовая голова в двух ракурсах. Бумага, карандаш.',
    description: 'Учебная работа с гипсовой моделью: пропорции и конструкция головы, светотеневые отношения и передача объёма штриховкой.',
    images: [
      { src: 'socrates-01.webp', alt: 'Гипсовая голова Сократа — первый ракурс', width: 1650, height: 2153 },
      { src: 'socrates-02.webp', alt: 'Гипсовая голова Сократа — второй ракурс', width: 1503, height: 2011 },
    ],
  },
  ...scanStudies,
];

// Biography, education and tools live in copy.<language>.about in i18n.js.
export const profile = { portrait: { src: 'about-photo.webp', width: 1280, height: 960 } };

export const socialLinks = [
  { id: 'telegram', label: 'Telegram', detail: '@gdvmeow', href: 'https://t.me/gdvmeow' },
  { id: 'behance', label: 'Behance', detail: 'behance.net/gdvmeow', href: 'https://www.behance.net/gdvmeow' },
  { id: 'linkedin', label: 'LinkedIn', detail: 'Профиль Виктории', href: 'https://www.linkedin.com/in/gdvmeow' },
  { id: 'publications', label: 'Публикации', detail: 't.me/tori_arch', href: 'https://t.me/tori_arch' },
];

export const contactEmail = 'gdvmeow@gmail.com';
export const asset = name => `${import.meta.env?.BASE_URL ?? '/'}assets/${name}`;
