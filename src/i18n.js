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
    footerNavigationLabel: 'Навигация в футере',
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
        "Мне 19 лет. Я занимаюсь архитектурой и дизайном, опираясь на художественную подготовку и архитектурное образование.",
        "Работаю с частными жилыми проектами: продумываю пространство, разрабатываю чертежи и трёхмерные модели, готовлю визуальную подачу. Мне важно, чтобы идея была понятной и в плане, и в объёме."
      ],
      "competenciesHeading": "Чем я занимаюсь",
      "competencies": [
        {
          "title": "Концепция и планировка",
          "body": "Разрабатываю концепции, продумываю функциональное зонирование и связи между помещениями. Собираю планировку вокруг задач будущих жильцов."
        },
        {
          "title": "Чертежи и документация",
          "body": "Готовлю планы этажей, фасады и разрезы. Работаю с конструктивом и проектной документацией, увязываю решения между собой."
        },
        {
          "title": "Модель и визуализация",
          "body": "Создаю трёхмерные модели, работаю с материалами и светом. Готовлю визуализации и презентации, которые помогают объяснить проект."
        },
        {
          "title": "Генплан и благоустройство",
          "body": "Работаю с размещением здания на участке и благоустройством территории. Рассматриваю дом вместе с его окружением."
        }
      ],
      "practiceHeading": "Практика в Сочи",
      "practice": [
        "Во время практики в архитектурной организации в Сочи я разработала план частного дома: функциональное зонирование и связи между помещениями.",
        "План приняли почти без корректировок и передали инженеру. Затем проект перешёл к строительству. Этот опыт показал мне, как решение на чертеже становится частью реального дома."
      ],
      "educationHeading": "Образование и художественная подготовка",
      "education": [
        {
          "title": "МКАГ, Москва",
          "body": "Получаю архитектурное образование и применяю знания в работе над жилыми проектами.",
          "period": "2025 — настоящее время"
        },
        {
          "title": "Художественная школа",
          "body": "Окончила художественную школу с красным дипломом. Моя база — академический рисунок, живопись, композиция, перспектива и пластическая анатомия. Есть дипломы и награды.",
          "period": "2019 — 2024"
        }
      ],
      "educationLink": "Посмотреть образование и опыт",
      "approachHeading": "Как я работаю",
      "approach": [
        "Обсуждаю задачу, задаю вопросы и понятно представляю свои решения. Умею вести переговоры, презентовать идеи и работать в команде.",
        "Беру ответственность за свою часть работы, предлагаю варианты и адаптируюсь к изменениям. В проектировании соединяю творческий поиск и аналитическое мышление."
      ],
      "toolsHeading": "Рабочие инструменты",
      "toolsIntro": "Программы, которые использую для проектирования, моделирования, визуализации и графической подачи.",
      "iconsNote": "Помеченные авторские иконки нарисованы для этого сайта и не являются фирменными знаками программ.",
      "portraitAlt": "Портрет Виктории Терзян",
      "portraitLabel": "Место для фотографии",
      "action": "Обсудить проект",
      "originalIconLabel": "Авторская иконка"
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
      platforms: 'Площадки',
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
    metaDescription: 'Виктория Терзян — архитектурные проекты, ручная подача, академический рисунок и контакты.',
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
        "I’m 19 and work in architecture and design, building on an art background and an architectural education.",
        "I work on private residential projects: planning spaces, developing drawings and 3D models, and preparing visual presentations. I want an idea to be clear both on the plan and in three dimensions."
      ],
      "competenciesHeading": "What I do",
      "competencies": [
        {
          "title": "Concepts and layouts",
          "body": "I develop concepts, organise functional zones and work out how rooms connect. I shape layouts around the needs of the people who will live there."
        },
        {
          "title": "Drawings and documentation",
          "body": "I prepare floor plans, elevations and sections. I work with structural design and project documentation, keeping the different decisions coordinated."
        },
        {
          "title": "Modelling and visualisation",
          "body": "I create 3D models and work with materials and lighting. I prepare visualisations and presentations that help explain the design."
        },
        {
          "title": "Site planning and landscape",
          "body": "I work on the building’s position on its site and the surrounding outdoor space, considering the house together with its setting."
        }
      ],
      "practiceHeading": "Practice in Sochi",
      "practice": [
        "During a placement at an architectural organisation in Sochi, I developed a private house plan, including its functional zoning and the connections between rooms.",
        "The plan was accepted with almost no revisions and passed to an engineer. The project then moved into construction. It gave me a direct view of how a decision on paper becomes part of a real home."
      ],
      "educationHeading": "Education and art background",
      "education": [
        {
          "title": "МКАГ, Moscow",
          "body": "I’m studying architecture and applying what I learn to residential projects.",
          "period": "2025 — present"
        },
        {
          "title": "Art school",
          "body": "I graduated from art school with honours. My foundation includes academic drawing, painting, composition, perspective and artistic anatomy. I also have diplomas and awards.",
          "period": "2019 — 2024"
        }
      ],
      "educationLink": "View education and experience",
      "approachHeading": "How I work",
      "approach": [
        "I discuss the brief, ask questions and present my decisions clearly. I can negotiate, communicate ideas and work as part of a team.",
        "I take responsibility for my part of the work, put forward options and adapt to changes. My design process combines creative exploration with analytical thinking."
      ],
      "toolsHeading": "Working tools",
      "toolsIntro": "The programs I use for design, modelling, visualisation and graphic presentation.",
      "iconsNote": "Icons marked as original were drawn for this site and are not the programs’ official marks.",
      "portraitAlt": "Portrait of Viktoria Terzyan",
      "portraitLabel": "Space for a portrait",
      "action": "Discuss a project",
      "originalIconLabel": "Original icon"
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
      platforms: 'Platforms',
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
    metaDescription: 'Viktoria Terzyan — architectural projects, hand-drawn presentation, academic drawing and contact details.',
    projects: {
      ...scanStudyTranslations.en,
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
        "summary": "An individual house on a site with a pronounced slope.",
        "description": "An architecture sheet on coloured paper: two floor plans, a building section, a stair section and two elevations. The ground-floor plan is shown within the site’s contours and planting.",
        "imageAlts": [
          "House on a slope — two floor plans, sections, elevations and a site layout with contours"
        ]
      },
      'low-rise-house': {
        title: 'Low-rise house', category: 'Residential architecture',
        summary: 'A house with a sloping roof and expressive glazing.',
        description: 'A student project presented by hand in colour: a perspective, two elevations, ground- and upper-floor plans, a section and a site plan.',
        imageAlts: ['Low-rise house — perspective, elevations, floor plans, section and site plan'],
      },
      'folded-roof-cafe': {
        title: 'Café for 50 guests', category: 'Public architecture',
        summary: 'A café with a folded roof and glazing around the dining room.',
        description: 'A hand-drawn presentation of a café for 50 guests. The sheet brings together a perspective, plan, section, front and side elevations, and a site diagram.',
        imageAlts: ['Café for 50 guests — perspective, plan, section and two elevations'],
      },
      'single-storey-house': {
        title: 'Single-storey house', category: 'Residential architecture',
        summary: 'A house with a pitched roof and an integrated garage.',
        description: 'A student architecture sheet: a front elevation with its surroundings, a floor plan with a room schedule, and a section. Hand drafting with tonal work on the elevation.',
        imageAlts: ['Single-storey house — front elevation, floor plan with room schedule, and section'],
      },
      'house-construction': {
        title: 'House construction', category: 'Architectural construction',
        summary: 'A house developed from its foundations to its roof.',
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
    homeLabel: 'Viktoria Terzyan — 首页',
    skip: '跳转到主要内容',
    navigationLabel: '主导航',
    footerNavigationLabel: '页脚导航',
    siteLanguage: '网站语言',
    menu: '菜单',
    closeMenu: '关闭',
    write: '联系我',
    nav: { portfolio: '作品集', about: '关于', contacts: '联系', education: '教育与经历' },
    hero: {
      architecture: '建筑设计',
      and: '与',
      graphics: '图形表达。',
      description: '建筑设计项目与学院素描。',
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
      graphics: '绘图',
      grid: '网格',
      list: '列表',
    },
    project: {
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
        "我今年19岁，从事建筑与设计，将美术训练和建筑教育融入工作。",
        "我参与私人住宅项目，推敲空间布局、绘制图纸、建立三维模型并准备视觉表达。我希望一个设计既能在平面上说清楚，也能在立体空间中被理解。"
      ],
      "competenciesHeading": "我的工作内容",
      "competencies": [
        {
          "title": "概念与空间布局",
          "body": "发展设计概念，安排功能分区，梳理房间之间的联系，根据未来居住者的需求组织平面。"
        },
        {
          "title": "图纸与项目文件",
          "body": "绘制楼层平面、立面和剖面，参与结构设计与项目文件工作，协调不同设计决定。"
        },
        {
          "title": "模型与可视化",
          "body": "建立三维模型，推敲材质与光线，准备可视化图像和演示材料，帮助他人理解设计。"
        },
        {
          "title": "总平面与场地设计",
          "body": "研究建筑在场地中的位置及周边室外空间，将住宅与其环境一起考虑。"
        }
      ],
      "practiceHeading": "在索契的实践",
      "practice": [
        "在索契一家建筑机构实习期间，我为一栋私人住宅设计了平面布局，包括功能分区和房间之间的联系。",
        "方案几乎未经修改便获采纳，随后交给工程师，项目进入施工阶段。这段经历让我看到，图纸上的决定如何成为真实住宅的一部分。"
      ],
      "educationHeading": "教育与美术基础",
      "education": [
        {
          "title": "МКАГ，莫斯科",
          "body": "学习建筑，并将所学运用到住宅项目中。",
          "period": "2025年至今"
        },
        {
          "title": "美术学校",
          "body": "以优异成绩从美术学校毕业。我的基础包括学院素描、绘画、构图、透视和艺术解剖，也获得过证书与奖项。",
          "period": "2019 — 2024"
        }
      ],
      "educationLink": "查看教育与经历",
      "approachHeading": "我的工作方式",
      "approach": [
        "我会讨论需求、提出问题，并清楚地说明设计决定，能够进行沟通协商、展示想法，也能与团队合作。",
        "我对自己负责的工作承担责任，主动提出方案，并适应变化。在设计中，我将创意探索与分析思考结合起来。"
      ],
      "toolsHeading": "工作软件",
      "toolsIntro": "我用于设计、建模、可视化和图形表达的软件。",
      "iconsNote": "标注为原创的图标为本网站绘制，并非软件的官方标志。",
      "portraitAlt": "Viktoria Terzyan的照片",
      "portraitLabel": "照片位置",
      "action": "讨论项目",
      "originalIconLabel": "原创图标"
    },
    contacts: {
      heading: '联系',
      intro: '欢迎介绍您的项目或提出问题。',
      emailLabel: '电子邮箱',
      copy: '复制邮箱地址',
      copied: '邮箱地址已复制',
      copyFailed: '请选中上方的邮箱地址并手动复制。',
    },
    footer: {
      description: '建筑与绘图',
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
    pageTitles: { home: '建筑与绘图', portfolio: '作品', about: '关于', contacts: '联系', education: '教育与经历', notFound: '页面未找到' },
    metaDescription: 'Viktoria Terzyan — 建筑设计项目、手绘表现、学院素描与联系信息。',
    projects: {
      ...scanStudyTranslations.zh,
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
        summary: '以斜屋顶和富有表现力的玻璃立面塑造的住宅。',
        description: '手绘彩色课程设计：透视图、两个立面、首层与二层平面、剖面及场地总平面。',
        imageAlts: ['低层住宅 — 透视、立面、楼层平面、剖面及总平面'],
      },
      'folded-roof-cafe': {
        title: '50座咖啡馆', category: '公共建筑',
        summary: '采用折板屋顶、餐厅周围设玻璃立面的咖啡馆。',
        description: '50座咖啡馆手绘建筑表现图。图纸汇集透视图、平面、剖面、正立面、侧立面与场地布置示意。',
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
        title: '苏格拉底', category: '学院素描',
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
    images: project.images.map((image, index) => ({ ...image, alt: translated.imageAlts[index] ?? image.alt })),
  };
}

export function localizeSocial(link, language) {
  return { ...link, ...copy[language]?.social[link.id] };
}
