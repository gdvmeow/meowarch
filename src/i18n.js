import { lyublinoTranslations } from './lyublino.js';
import { scanStudyTranslations } from './scanStudies.js';

export const languages = [
  { code: 'ru', flag: `${import.meta.env?.BASE_URL ?? '/'}assets/flag-ru.svg`, label: 'Русский' },
  { code: 'en', flag: `${import.meta.env?.BASE_URL ?? '/'}assets/flag-us.svg`, label: 'English' },
  { code: 'zh', flag: `${import.meta.env?.BASE_URL ?? '/'}assets/flag-cn.svg`, label: '中文' },
];

export const copy = {
  ru: {
    name: 'Виктория Терзян',
    homeLabel: 'Виктория Терзян — главная',
    skip: 'Перейти к содержимому',
    navigationLabel: 'Основная навигация',
    footerNavigationLabel: 'Разделы сайта',
    siteLanguage: 'Язык сайта',
    menu: 'Меню',
    closeMenu: 'Закрыть',
    write: 'Написать',
    nav: { portfolio: 'Портфолио', about: 'О себе', contacts: 'Контакты', education: 'Образование и опыт' },
    hero: {
      architecture: 'Архитектура',
      and: 'и',
      graphics: 'графика.',
      description: 'Архитектурные проекты и академический рисунок.',
      action: 'Смотреть работы',
    },
    selectedProjects: 'Избранные работы',
    fullPortfolio: 'Смотреть портфолио',
    portfolio: {
      heading: 'Работы',
      filtersLabel: 'Разделы работ',
      viewLabel: 'Вид работ',
      all: 'Все',
      architecture: 'Архитектура',
      graphics: 'Графика',
      grid: 'Сетка',
      list: 'Список',
    },
    project: {
      back: 'Все работы',
      zoom: 'Увеличить',
      zoomImage: alt => `Увеличить: ${alt}`,
      next: 'Следующая работа',
      count: (index, total) => `${index} из ${total}`,
      close: 'Закрыть',
      previous: 'Назад',
      nextImage: 'Далее',
      previousLabel: 'Предыдущее изображение',
      nextLabel: 'Следующее изображение',
      openFull: 'Открыть в полном разрешении',
    },
    education: {
      heading: 'Образование и опыт',
      title: 'Свидетельство с отличием',
      school: 'Детская художественная школа № 2, Сочи',
      description: 'Пятилетняя предпрофессиональная программа «Живопись». Рисунок, живопись, композиция, история искусства, пленэр и скульптура.',
      pageAlts: ['Обложка свидетельства с отличием по программе «Живопись»', 'Свидетельство Виктории Терзян об окончании программы «Живопись» с отличием', 'Приложение к свидетельству: учебные предметы и итоговые оценки'],
    },
    about: {
      "heading": "О себе",
      "role": "Архитектура, проектирование и дизайн",
      "body": [
        "Мне 19 лет. Я учусь архитектуре в колледже ГБПОУ «МКАГ» в Москве и работаю над проектами частных домов.",
        "Разрабатываю планировки и чертежи, делаю 3D-модели и визуализации."
      ],
      "competenciesHeading": "Чем я занимаюсь",
      "competencies": [
        {
          "title": "Концепция и планировка",
          "body": "Продумываю концепцию дома, назначение комнат и связи между ними. В планировке учитываю потребности будущих жильцов."
        },
        {
          "title": "Чертежи и документация",
          "body": "Готовлю планы этажей, фасады и разрезы. Работаю с конструктивными элементами зданий и проектной документацией."
        },
        {
          "title": "Модель и визуализация",
          "body": "Делаю 3D-модели, подбираю материалы и освещение, готовлю визуализации и презентации проекта."
        },
        {
          "title": "Генплан и благоустройство",
          "body": "Размещаю дом на участке и разрабатываю благоустройство вокруг него."
        }
      ],
      "practiceHeading": "Практика в Сочи",
      "practicePeriod": "Май — июнь 2026",
      "practicePhotoAlts": ["Модель частного дома на экране ноутбука во время практики", "Современные фасады в Сочи", "Рабочее пространство во время практики в Сочи"],
      "practice": [
        "Во время практики в архитектурной организации в Сочи я разработала планировку частного дома. На работу ушло меньше недели. Исходными материалами были только наброски планов и размеры, по которым я определила функциональные зоны и связи между помещениями.",
        "Планировку приняли почти без правок и передали инженеру. Затем проект перешёл к строительству."
      ],
      "educationHeading": "Образование и художественная подготовка",
      "education": [
        {
          "title": "ГБПОУ «МКАГ», Москва",
          "body": "Учусь архитектуре и применяю полученные знания в проектах жилых домов.",
          "period": "2025 — настоящее время"
        },
        {
          "title": "Детская художественная школа № 2, Сочи",
          "body": "Окончила художественную школу с отличием. Изучала академический рисунок, живопись, композицию, перспективу и пластическую анатомию. Получала дипломы, грамоты и награды за достижения в художественной деятельности.",
          "period": "2019 — 2024"
        }
      ],
      "educationLink": "Посмотреть образование и опыт",
      "toolsHeading": "Программы",
      "toolsIntro": "Программы, которые использую для проектирования, моделирования, визуализации и графической подачи.",
      "portraitAlt": "Портрет Виктории Терзян",
      "portraitLabel": "Место для фотографии",
      "action": "Обсудить проект"
    },
    contacts: {
      heading: 'Контакты',
      intro: 'Расскажите о проекте или задайте вопрос.',
      emailLabel: 'Электронная почта',
      copy: 'Скопировать адрес',
      copied: 'Адрес скопирован',
      copyFailed: 'Выделите адрес выше и скопируйте вручную.',
    },
    footer: {
      description: 'Архитектура и графика',
      sections: 'Разделы',
      platforms: 'Ссылки',
      top: 'Наверх',
      copyright: year => `© ${year} Виктория Терзян`,
    },
    social: {
      telegram: { label: 'Telegram', detail: '@gdvmeow' },
      behance: { label: 'Behance', detail: 'behance.net/gdvmeow' },
      linkedin: { label: 'LinkedIn', detail: 'linkedin.com/in/gdvmeow' },
      publications: { label: 'Публикации', detail: 't.me/tori_arch' },
    },
    notFound: { heading: 'Страница не найдена', body: 'Возможно, ссылка изменилась. Все работы доступны в портфолио.', action: 'Открыть работы' },
    pageTitles: { home: 'Архитектура и графика', portfolio: 'Работы', about: 'О себе', contacts: 'Контакты', education: 'Образование и опыт', notFound: 'Страница не найдена' },
    metaDescription: 'Портфолио Виктории Терзян: архитектурные проекты, ручная подача и академический рисунок.',
  },
  en: {
    name: 'Viktoria Terzyan',
    homeLabel: 'Viktoria Terzyan — home',
    skip: 'Skip to content',
    navigationLabel: 'Main navigation',
    footerNavigationLabel: 'Footer navigation',
    siteLanguage: 'Site language',
    menu: 'Menu',
    closeMenu: 'Close',
    write: 'Email me',
    nav: { portfolio: 'Portfolio', about: 'About', contacts: 'Contact', education: 'Education & experience' },
    hero: {
      architecture: 'Architecture',
      and: 'and',
      graphics: 'drawing.',
      description: 'Architectural projects and academic drawing.',
      action: 'Explore work',
    },
    selectedProjects: 'Selected work',
    fullPortfolio: 'View portfolio',
    portfolio: {
      heading: 'Work',
      filtersLabel: 'Project categories',
      viewLabel: 'Project view',
      all: 'All',
      architecture: 'Architecture',
      graphics: 'Drawing',
      grid: 'Grid',
      list: 'List',
    },
    project: {
      back: 'All work',
      zoom: 'Enlarge',
      zoomImage: alt => `Enlarge: ${alt}`,
      next: 'Next project',
      count: (index, total) => `${index} of ${total}`,
      close: 'Close',
      previous: 'Previous',
      nextImage: 'Next',
      previousLabel: 'Previous image',
      nextLabel: 'Next image',
      openFull: 'Open full resolution',
    },
    education: {
      heading: 'Education & experience',
      title: 'Certificate with honours',
      school: 'Children’s Art School No. 2, Sochi',
      description: 'A five-year pre-professional Painting programme. Drawing, painting, composition, art history, plein air studies and sculpture.',
      pageAlts: ['Cover of the certificate with honours for the Painting programme', 'Viktoria Terzyan’s certificate of completion with honours in Painting', 'Certificate supplement: subjects and final grades'],
    },
    about: {
      "heading": "About",
      "role": "Architecture, planning and design",
      "body": [
        "I’m 19 and study architecture at MKAG College in Moscow. I also work on private house designs.",
        "I develop layouts and drawings, make 3D models and prepare visualisations."
      ],
      "competenciesHeading": "What I do",
      "competencies": [
        {
          "title": "Concepts and layouts",
          "body": "I develop house concepts and layouts around the needs of their future residents, deciding how each room will be used and how the rooms connect."
        },
        {
          "title": "Drawings and documentation",
          "body": "I prepare floor plans, elevations and sections, and work with structural components and project documentation."
        },
        {
          "title": "Modelling and visualisation",
          "body": "I make 3D models, choose materials and lighting, and prepare visualisations and project presentations."
        },
        {
          "title": "Site and landscape design",
          "body": "I plan where the house sits on its site and design the outdoor space around it."
        }
      ],
      "practiceHeading": "Architectural placement in Sochi",
      "practicePeriod": "May–June 2026",
      "practicePhotoAlts": ["A private-house model on a laptop during the placement", "Contemporary facades in Sochi", "The workspace during the placement in Sochi"],
      "practice": [
        "During my placement at an architectural organisation in Sochi, I developed the layout of a private house. The work took less than a week. Starting with only rough plans and dimensions, I worked out the functional zones and connections between rooms.",
        "The layout was accepted with almost no changes and passed to an engineer. The project then moved into construction."
      ],
      "educationHeading": "Education and art background",
      "education": [
        {
          "title": "MKAG College (ГБПОУ «МКАГ»), Moscow",
          "body": "I study architecture and use what I learn in residential projects.",
          "period": "2025 — present"
        },
        {
          "title": "Children’s Art School No. 2, Sochi",
          "body": "I graduated from art school with honours, having studied academic drawing, painting, composition, perspective and anatomy for artists. I received certificates and awards for artistic achievement.",
          "period": "2019 — 2024"
        }
      ],
      "educationLink": "View education and experience",
      "toolsHeading": "Software",
      "toolsIntro": "The programs I use for design, modelling, visualisation and graphic presentation.",
      "portraitAlt": "Portrait of Viktoria Terzyan",
      "portraitLabel": "Space for a portrait",
      "action": "Discuss a project"
    },
    contacts: {
      heading: 'Contact',
      intro: 'Tell me about your project or ask a question.',
      emailLabel: 'Email',
      copy: 'Copy email address',
      copied: 'Email address copied',
      copyFailed: 'Select the address above and copy it manually.',
    },
    footer: {
      description: 'Architecture and drawing',
      sections: 'Pages',
      platforms: 'Links',
      top: 'Back to top',
      copyright: year => `© ${year} Viktoria Terzyan`,
    },
    social: {
      telegram: { label: 'Telegram', detail: '@gdvmeow' },
      behance: { label: 'Behance', detail: 'behance.net/gdvmeow' },
      linkedin: { label: 'LinkedIn', detail: 'linkedin.com/in/gdvmeow' },
      publications: { label: 'Publications', detail: 't.me/tori_arch' },
    },
    notFound: { heading: 'Page not found', body: 'The link may have changed. You can find all the work in the portfolio.', action: 'Explore work' },
    pageTitles: { home: 'Architecture and drawing', portfolio: 'Work', about: 'About', contacts: 'Contact', education: 'Education & experience', notFound: 'Page not found' },
    metaDescription: 'Viktoria Terzyan’s portfolio: architectural projects, hand-drawn presentations and academic drawing.',
    projects: {
      ...scanStudyTranslations.en,
      'lyublino-restoration': lyublinoTranslations.en,
      antinous: {
        title: 'Antinous', category: 'Academic drawing',
        summary: 'Antinous’s head in three-quarter view. Pencil on paper.',
        description: 'Hatching conveys the volume of the face, curls and neck. The drawing explores light and shade and the transitions between the main planes.',
        imageAlts: ['Antinous: pencil head study in three-quarter view'],
      },
      'caesar-study': {
        title: 'Caesar', category: 'Academic drawing',
        summary: 'A frontal study of the structure of Caesar’s head. Pencil on paper.',
        description: 'A line drawing of the head and neck, marking the axes and main planes. Light hatching defines the eye sockets and cheekbones; the construction lines remain visible.',
        imageAlts: ['Caesar — full sheet with a frontal head study, construction axes and planes'],
      },
      "two-family-house-rotterdam": {
        "title": "Two-family house in Rotterdam",
        "category": "Architectural graphics",
        "summary": "A house with a detailed ornamental facade.",
        "description": "A hand-drawn front elevation and four floor plans. Tonal shading defines the ornamental gable, window surrounds, cornices and masonry patterns. The facade is also shown at a larger scale.",
        "imageAlts": [
          "Two-family house in Rotterdam — full sheet with a front elevation and four floor plans",
          "Two-family house in Rotterdam — complete facade from finial to base"
        ]
      },
      "mansard-house": {
        "title": "Low-rise house",
        "category": "Residential architecture",
        "summary": "A house with a mansard roof, garage and balcony.",
        "description": "A hand-drawn colour presentation: front elevation, ground- and upper-floor plans, a site plan and a room schedule.",
        "imageAlts": [
          "Low-rise house — front elevation, two floor plans, site plan and room schedule"
        ]
      },
      "house-on-slope": {
        "title": "House on a slope",
        "category": "Residential architecture",
        "summary": "A detached house on a sloping site.",
        "description": "Hand-drawn plans for two floors, a building section, a stair section and two elevations, on coloured paper. The ground-floor plan includes the site contours and planting.",
        "imageAlts": [
          "House on a slope — two floor plans, sections, elevations and a site layout with contours"
        ]
      },
      'low-rise-house': {
        title: 'Low-rise house', category: 'Residential architecture',
        summary: 'A house with a sloping roof and large windows.',
        description: 'A student project presented by hand in colour: a perspective, two elevations, ground- and upper-floor plans, a section and a site plan.',
        imageAlts: ['Low-rise house — perspective, elevations, floor plans, section and site plan'],
      },
      'folded-roof-cafe': {
        title: 'Café for 50 guests', category: 'Public architecture',
        summary: 'A café with a folded roof and glazing around the dining room.',
        description: 'Hand-drawn plans for a 50-seat café: a perspective, floor plan, section, front and side elevations, and a site diagram.',
        imageAlts: ['Café for 50 guests — perspective, plan, section and two elevations'],
      },
      'single-storey-house': {
        title: 'Single-storey house', category: 'Residential architecture',
        summary: 'A house with a pitched roof and an integrated garage.',
        description: 'A student project with a front elevation and its surroundings, a floor plan with a room schedule, and a section. Hand drafting with tonal shading on the elevation.',
        imageAlts: ['Single-storey house — front elevation, floor plan with room schedule, and section'],
      },
      'house-construction': {
        title: 'House construction', category: 'Architectural construction',
        summary: 'Construction drawings for a house, from foundations to roof.',
        description: 'A hand-drafted sheet with foundation, floor framing, rafter and roof plans, sections, and construction details for the stairs, walls and floors.',
        imageAlts: ['House construction — foundation, floor framing, rafter and roof plans, sections and details'],
      },
      socrates: {
        title: 'Socrates', category: 'Academic drawing',
        summary: 'A plaster head in two views. Pencil on paper.',
        description: 'A study from a plaster cast: head proportions and construction, tonal relationships, and volume expressed through hatching.',
        imageAlts: ['Plaster head of Socrates — first view', 'Plaster head of Socrates — second view'],
      },
    },
  },
  zh: {
    name: 'Viktoria Terzyan',
    homeLabel: 'Viktoria Terzyan：首页',
    skip: '跳转到主要内容',
    navigationLabel: '主导航',
    footerNavigationLabel: '页脚导航',
    siteLanguage: '网站语言',
    menu: '菜单',
    closeMenu: '关闭',
    write: '发邮件',
    nav: { portfolio: '作品集', about: '关于我', contacts: '联系方式', education: '教育与经历' },
    hero: {
      architecture: '建筑设计',
      and: '与',
      graphics: '手绘。',
      description: '建筑设计项目与素描习作。',
      action: '浏览作品',
    },
    selectedProjects: '精选作品',
    fullPortfolio: '浏览作品集',
    portfolio: {
      heading: '作品',
      filtersLabel: '项目类别',
      viewLabel: '项目视图',
      all: '全部',
      architecture: '建筑',
      graphics: '手绘',
      grid: '网格',
      list: '列表',
    },
    project: {
      openFull: '打开原始分辨率图像',
      back: '全部作品',
      zoom: '查看大图',
      zoomImage: alt => `放大：${alt}`,
      next: '下一个项目',
      count: (index, total) => `第 ${index} 张，共 ${total} 张`,
      close: '关闭',
      previous: '上一张',
      nextImage: '下一张',
      previousLabel: '上一张图片',
      nextLabel: '下一张图片',
    },
    education: {
      heading: '教育与经历',
      title: '优秀结业证书',
      school: '索契第二儿童艺术学校',
      description: '五年制绘画专业预备课程，涵盖素描、绘画、构图、美术史、户外写生与雕塑。',
      pageAlts: ['绘画课程优秀结业证书封面', 'Viktoria Terzyan 的绘画专业优秀结业证书', '证书附页：课程及最终成绩'],
    },
    about: {
      "heading": "关于我",
      "role": "建筑、空间规划与设计",
      "body": [
        "我今年19岁，在莫斯科的 MKAG 学院学习建筑设计，也参与私人住宅项目。",
        "我设计平面布局、绘制图纸、建立三维模型并制作效果图。"
      ],
      "competenciesHeading": "我的工作内容",
      "competencies": [
        {
          "title": "概念与空间布局",
          "body": "我推敲住宅的设计概念、各个房间的用途及相互联系，并根据未来居住者的需求安排平面布局。"
        },
        {
          "title": "图纸与项目文件",
          "body": "我绘制楼层平面图、立面图和剖面图，也处理建筑结构构件与项目文件。"
        },
        {
          "title": "三维建模与效果图",
          "body": "我建立三维模型，选择材质和光照，制作效果图和项目演示材料。"
        },
        {
          "title": "总平面与场地设计",
          "body": "我安排住宅在场地中的位置，设计周围的室外空间。"
        }
      ],
      "practiceHeading": "索契建筑实习",
      "practicePeriod": "2026年5月至6月",
      "practicePhotoAlts": ["实习期间笔记本电脑屏幕上的私人住宅模型", "索契的现代建筑立面", "在索契实习期间的工作空间"],
      "practice": [
        "在索契一家建筑机构实习期间，我为一栋私人住宅设计了平面布局。工作用时不到一周，最初只有平面草图和尺寸。我据此划分功能区，并安排各个房间之间的联系。",
        "方案几乎未经修改便获采纳，随后交给工程师。之后，项目进入施工阶段。"
      ],
      "educationHeading": "教育与美术基础",
      "education": [
        {
          "title": "MKAG 学院（ГБПОУ «МКАГ»），莫斯科",
          "body": "我学习建筑，并将所学用于住宅项目。",
          "period": "2025年至今"
        },
        {
          "title": "索契第二儿童艺术学校",
          "body": "我以优异成绩从美术学校毕业，学习过素描、绘画、构图、透视和艺术解剖，也曾获得艺术方面的证书与奖项。",
          "period": "2019 — 2024"
        }
      ],
      "educationLink": "查看教育与经历",
      "toolsHeading": "工作软件",
      "toolsIntro": "我用于设计、建模、可视化和图形表达的软件。",
      "portraitAlt": "Viktoria Terzyan的照片",
      "portraitLabel": "照片位置",
      "action": "讨论项目"
    },
    contacts: {
      heading: '联系方式',
      intro: '欢迎介绍您的项目或提出问题。',
      emailLabel: '电子邮箱',
      copy: '复制邮箱地址',
      copied: '邮箱地址已复制',
      copyFailed: '请选中上方的邮箱地址并手动复制。',
    },
    footer: {
      description: '建筑与手绘',
      sections: '页面',
      platforms: '社交平台',
      top: '返回顶部',
      copyright: year => `© ${year} Viktoria Terzyan`,
    },
    social: {
      telegram: { label: 'Telegram', detail: '@gdvmeow' },
      behance: { label: 'Behance', detail: 'behance.net/gdvmeow' },
      linkedin: { label: 'LinkedIn', detail: 'linkedin.com/in/gdvmeow' },
      publications: { label: '文章', detail: 't.me/tori_arch' },
    },
    notFound: { heading: '页面未找到', body: '链接可能已更改。您可以在作品集中浏览所有项目。', action: '浏览作品' },
    pageTitles: { home: '建筑与手绘', portfolio: '作品', about: '关于我', contacts: '联系方式', education: '教育与经历', notFound: '页面未找到' },
    metaDescription: 'Viktoria Terzyan 的作品集：建筑设计项目、手绘表现与素描习作。',
    projects: {
      ...scanStudyTranslations.zh,
      'lyublino-restoration': lyublinoTranslations.zh,
      antinous: {
        title: '安提诺乌斯', category: '素描习作',
        summary: '安提诺乌斯头像的四分之三侧面。纸本铅笔。',
        description: '排线表现面部、卷发和颈部的体积，刻画明暗关系与主要转折面之间的过渡。',
        imageAlts: ['安提诺乌斯：四分之三侧面头像铅笔素描'],
      },
      'caesar-study': {
        title: '恺撒', category: '素描习作',
        summary: '恺撒头像的正面结构素描。纸本铅笔。',
        description: '以线条构建头部与颈部，标示轴线和主要转折面。轻排线刻画眼窝与颧骨，保留辅助构造线。',
        imageAlts: ['恺撒：正面头像素描，保留结构轴线与转折面'],
      },
      "two-family-house-rotterdam": {
        "title": "鹿特丹双户住宅",
        "category": "建筑表现",
        "summary": "带有精细装饰立面的住宅。",
        "description": "手绘正立面与四幅平面图，以明暗表现装饰山墙、窗框、檐口和砌体纹理。另附放大的完整立面图。",
        "imageAlts": [
          "鹿特丹双户住宅 — 包含正立面及四幅平面图的完整图纸",
          "鹿特丹双户住宅 — 从顶部装饰到基座的完整立面"
        ]
      },
      "mansard-house": {
        "title": "低层住宅",
        "category": "住宅建筑",
        "summary": "带折线坡屋顶、车库和阳台的住宅。",
        "description": "手绘彩色建筑表现：正立面、首层与二层平面、场地总平面及房间明细表。",
        "imageAlts": [
          "低层住宅 — 正立面、两层平面、总平面及房间明细表"
        ]
      },
      "house-on-slope": {
        "title": "坡地住宅",
        "category": "住宅建筑",
        "summary": "位于明显坡地上的独立住宅。",
        "description": "在彩色纸上绘制的建筑图纸：两层平面、建筑剖面、楼梯剖面及两个立面。首层平面结合场地等高线与绿化布置呈现。",
        "imageAlts": [
          "坡地住宅 — 两层平面、剖面、立面及带等高线的场地布置"
        ]
      },
      'low-rise-house': {
        title: '低层住宅', category: '住宅建筑',
        summary: '带斜屋顶和大窗的住宅。',
        description: '手绘彩色课程设计：透视图、两个立面、首层与二层平面、剖面及场地总平面。',
        imageAlts: ['低层住宅 — 透视、立面、楼层平面、剖面及总平面'],
      },
      'folded-roof-cafe': {
        title: '50座咖啡馆', category: '公共建筑',
        summary: '采用折板屋顶、用餐区四周设有玻璃立面的咖啡馆。',
        description: '50座咖啡馆的手绘设计图，包括透视图、平面图、剖面图、正立面、侧立面与场地布置示意图。',
        imageAlts: ['50座咖啡馆 — 透视、平面、剖面及两个立面'],
      },
      'single-storey-house': {
        title: '单层住宅', category: '住宅建筑',
        summary: '带坡屋顶与内置车库的住宅。',
        description: '建筑课程图纸：带环境表现的正立面、附房间明细表的平面及剖面。采用手工制图，并对立面进行明暗处理。',
        imageAlts: ['单层住宅 — 正立面、附房间明细表的平面及剖面'],
      },
      'house-construction': {
        title: '住宅构造', category: '建筑构造',
        summary: '从基础到屋顶的住宅构造设计。',
        description: '手工绘制的基础、楼板梁、椽架与屋顶平面，剖面及楼梯、墙体和楼板构造节点。',
        imageAlts: ['住宅构造 — 基础、楼板梁、椽架与屋顶平面，剖面及构造节点'],
      },
      socrates: {
        title: '苏格拉底', category: '素描习作',
        summary: '石膏头像的两个视角。纸本铅笔。',
        description: '石膏像写生习作：研究头部比例与结构、明暗关系，并通过排线表现体积。',
        imageAlts: ['苏格拉底石膏头像 — 第一视角', '苏格拉底石膏头像 — 第二视角'],
      },
    },
  },
};

export function localizeProject(project, language) {
  if (language === 'ru') return project;
  const translated = copy[language]?.projects?.[project.id];
  if (!translated) return project;
  return {
    ...project,
    title: translated.title,
    category: translated.category,
    summary: translated.summary,
    description: translated.description,
    stagesLabel: translated.stagesLabel ?? project.stagesLabel,
    sections: project.sections?.map((section, index) => ({ ...section, ...translated.sections?.[index] })),
    resources: project.resources && translated.resources ? {
      ...project.resources,
      ...translated.resources,
      files: project.resources.files.map((file, index) => ({ ...file, label: translated.resources.fileLabels[index] ?? file.label })),
    } : project.resources,
    images: project.images.map((image, index) => ({ ...image, alt: translated.imageAlts[index] ?? image.alt })),
  };
}

export function localizeSocial(link, language) {
  return { ...link, ...copy[language]?.social[link.id] };
}
