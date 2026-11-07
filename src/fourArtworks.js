// Four works supplied as photographs. The original framing is retained.
export const fourArtworks = [
  {
    id: 'composition', group: 'graphics', title: 'Композиция', category: 'Рисунок',
    summary: 'Композиция из геометрических форм и линий построения.',
    description: 'Объёмы соединены в пространственную композицию. Линии построения и штриховка показывают форму и взаимное расположение элементов.',
    images: [{ src: 'composition.jpg', width: 960, height: 1280, alt: 'Композиция из геометрических форм с линиями построения и штриховкой' }],
  },
  {
    id: 'column', group: 'graphics', title: 'Колонна', category: 'Рисунок',
    summary: 'Рисунок колонны с каннелюрами и капителью.',
    description: 'Фотография рисунка колонны на листе: линии и штриховка передают профиль капители и форму каннелюр.',
    images: [{ src: 'column.jpg', width: 960, height: 1280, alt: 'Рисунок колонны с капителью и каннелюрами на листе' }],
  },
  {
    id: 'still-life', group: 'graphics', title: 'Натюрморт', category: 'Рисунок',
    summary: 'Натюрморт с птицей, книгами и сосудом.',
    description: 'Линия и штриховка передают формы птицы, предметов и ткани, а также пространство между ними.',
    images: [{ src: 'still-life.jpg', width: 1280, height: 986, alt: 'Натюрморт с птицей, книгами, сосудом, яйцом и тканью' }],
  },
  {
    id: 'decorative-painting', group: 'graphics', title: 'Декоративная живопись', category: 'Живопись',
    summary: 'Декоративная композиция с рыбами и предметами натюрморта.',
    description: 'Линии, орнамент и цвет объединяют рыбу, растения, фонарь и другие предметы в насыщенную композицию.',
    images: [{ src: 'decorative-painting.jpg', width: 994, height: 1280, alt: 'Декоративная композиция с рыбами, растением, фонарём и посудой' }],
  },
];

export const fourArtworksTranslations = {
  en: {
    composition: { title: 'Composition', category: 'Drawing', summary: 'A composition of geometric forms and construction lines.', description: 'Volumes come together in a spatial composition. Construction lines and hatching describe the forms and their positions.', imageAlts: ['Composition of geometric forms with construction lines and hatching'] },
    column: { title: 'Column', category: 'Drawing', summary: 'A drawing of a fluted column and its capital.', description: 'A photograph of a column drawing on paper: lines and hatching describe the capital’s profile and the flutes.', imageAlts: ['Drawing of a fluted column and capital on a sheet of paper'] },
    'still-life': { title: 'Still life', category: 'Drawing', summary: 'A still life with a bird, books and a vessel.', description: 'Line and hatching convey the forms of the bird, objects and fabric, and the space between them.', imageAlts: ['Still life with a bird, books, a vessel, an egg and fabric'] },
    'decorative-painting': { title: 'Decorative painting', category: 'Painting', summary: 'A decorative composition with fish and still-life objects.', description: 'Line, ornament and colour bring together fish, plants, a lantern and other objects in a richly detailed composition.', imageAlts: ['Decorative composition with fish, a plant, a lantern and vessels'] },
  },
  zh: {
    composition: { title: '构图', category: '绘画', summary: '由几何形体和辅助线组成的构图。', description: '多个体块组合成空间构图，辅助线和排线表现形体及其相互位置。', imageAlts: ['几何形体构图，可见辅助线与排线'] },
    column: { title: '柱子', category: '绘画', summary: '带柱槽和柱头的柱子绘图。', description: '纸上柱子绘图的照片：线条和排线表现柱头轮廓与柱槽形态。', imageAlts: ['纸上绘制的带柱头和柱槽的柱子'] },
    'still-life': { title: '静物', category: '绘画', summary: '以鸟、书和容器组成的静物。', description: '线条与排线表现鸟、物件和布料的形态，以及它们之间的空间。', imageAlts: ['有鸟、书、容器、蛋和布料的静物'] },
    'decorative-painting': { title: '装饰绘画', category: '绘画', summary: '以鱼和静物物件组成的装饰构图。', description: '线条、纹饰与色彩将鱼、植物、提灯和其他物件组合成细节丰富的画面。', imageAlts: ['有鱼、植物、提灯和器皿的装饰构图'] },
  },
};
