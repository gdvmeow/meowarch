export const projects = [
  {
    id: 'house',
    title: 'Дом на рельефе',
    category: 'Частная архитектура',
    group: 'architecture',
    summary: 'Дом, в котором перепад участка становится частью пространства.',
    description: 'Три уровня следуют естественному рельефу. Общие и приватные помещения связаны маршрутом через дом, светом и видом на ландшафт.',
    images: [
      { src: 'project-01.webp', alt: 'Разрез жилого дома на склоне' },
      { src: 'ihs-plan.webp', alt: 'Архитектурный план дома' },
      { src: 'ihs-section.webp', alt: 'Разрез дома и прилегающего участка' },
    ],
  },
  {
    id: 'structure',
    title: 'Структура и свет',
    category: 'Архитектура',
    group: 'architecture',
    summary: 'Объём, собранный вокруг света и внутреннего двора.',
    description: 'Исследование взаимосвязи объёмов, открытых пространств и естественного освещения — от общей схемы до архитектурной формы.',
    images: [
      { src: 'project-02.webp', alt: 'Аксонометрия здания с внутренним двором' },
      { src: 'academic-board.webp', alt: 'Планы, разрезы и пространственные схемы' },
    ],
  },
  {
    id: 'courtyard',
    title: 'Память двора',
    category: 'Общественное пространство',
    group: 'architecture',
    summary: 'Открытый двор как последовательность разных мест.',
    description: 'План объединяет проходные и камерные зоны. Пространство меняется по мере движения: от улицы к тихому центру.',
    images: [
      { src: 'project-03.webp', alt: 'Генеральный план пространства с внутренним двором' },
      { src: 'academic-wash.webp', alt: 'Эскизы архитектурного пространства' },
    ],
  },
  {
    id: 'drawing',
    title: 'Городской фрагмент',
    category: 'Архитектурный рисунок',
    group: 'graphics',
    summary: 'Ритм фасадов и характер городской ткани.',
    description: 'Рисунок застройки: наблюдение за пропорциями, светом и тем, как отдельные здания складываются в улицу.',
    images: [
      { src: 'site-background-perspective.png', alt: 'Авторский чертёж городского здания' },
    ],
  },
  {
    id: 'form',
    title: 'Наблюдение и форма',
    category: 'Графика',
    group: 'graphics',
    summary: 'Изучение объёма и света через рисунок.',
    description: 'Серия графических исследований формы, пропорций и тональных отношений.',
    images: [
      { src: 'academic-heads.webp', alt: 'Серия рисунков скульптурных голов' },
      { src: 'academic-board.webp', alt: 'Лист с архитектурными исследованиями' },
    ],
  },
];

export const socialLinks = [
  { id: 'telegram', label: 'Telegram', detail: '@gdvmeow', href: 'https://t.me/gdvmeow' },
  { id: 'behance', label: 'Behance', detail: 'behance.net/gdvmeow', href: 'https://www.behance.net/gdvmeow' },
  { id: 'linkedin', label: 'LinkedIn', detail: 'Профиль Виктории', href: 'https://www.linkedin.com/in/gdvmeow' },
  { id: 'publications', label: 'Публикации', detail: 'tori_arch.t.me', href: 'https://tori_arch.t.me' },
];

export const contactEmail = 'gdvmeow@gmail.com';
export const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;
