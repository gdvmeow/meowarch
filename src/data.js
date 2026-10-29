export const projects = [
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
];

// Add a portrait filename from public/assets when the real photo is ready.
// Biography, education and tools live in copy.<language>.about in i18n.js.
export const profile = { portrait: null };

export const socialLinks = [
  { id: 'telegram', label: 'Telegram', detail: '@gdvmeow', href: 'https://t.me/gdvmeow' },
  { id: 'behance', label: 'Behance', detail: 'behance.net/gdvmeow', href: 'https://www.behance.net/gdvmeow' },
  { id: 'linkedin', label: 'LinkedIn', detail: 'Профиль Виктории', href: 'https://www.linkedin.com/in/gdvmeow' },
  { id: 'publications', label: 'Публикации', detail: 't.me/tori_arch', href: 'https://t.me/tori_arch' },
];

export const contactEmail = 'gdvmeow@gmail.com';
export const asset = name => `${import.meta.env?.BASE_URL ?? '/'}assets/${name}`;
