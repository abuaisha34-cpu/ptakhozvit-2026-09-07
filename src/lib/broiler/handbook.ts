export type HandbookCategory =
  | "climate"
  | "litter"
  | "water"
  | "feed"
  | "density"
  | "health";

export type HandbookArticle = {
  id: number;
  slug: string;
  category: HandbookCategory;
  question: string;
  answerTech: string;
  answerVet: string;
  sortOrder: number;
  status: "published" | "question";
  hidden: boolean;
  priority: boolean;
  askedBy: string | null;
};

export type OrgNorms = {
  humidityPlaceMin: number;
  humidityPlaceMax: number;
  humidityEarlyUntil: number;
  humidityEarlyMin: number;
  humidityEarlyMax: number;
  humidityLateMin: number;
  humidityLateMax: number;
  densityLimitKgM2: number;
  densityWarnDays: number;
};

export const DEFAULT_NORMS: OrgNorms = {
  humidityPlaceMin: 50,
  humidityPlaceMax: 55,
  humidityEarlyUntil: 14,
  humidityEarlyMin: 50,
  humidityEarlyMax: 60,
  humidityLateMin: 50,
  humidityLateMax: 70,
  densityLimitKgM2: 42,
  densityWarnDays: 5,
};

export const HANDBOOK_CATEGORIES: { id: HandbookCategory; label: string; hint: string }[] = [
  { id: "climate", label: "Мікроклімат", hint: "тепло, волога, вентиляція" },
  { id: "litter", label: "Послід і підстилка", hint: "форма, волога, корж" },
  { id: "water", label: "Вода і випоювання", hint: "ніпелі, препарати" },
  { id: "feed", label: "Корм", hint: "даванка, недожор" },
  { id: "density", label: "Посадка і кг/м²", hint: "ліміт, відлов" },
  { id: "health", label: "Падіж і здоровʼя", hint: "доба, вакцинація" },
];

export function humidityFromNorms(
  ageDays: number,
  norms: OrgNorms = DEFAULT_NORMS,
): { min: number; max: number } {
  const age = Math.max(0, Math.round(ageDays));
  if (age <= 0) return { min: norms.humidityPlaceMin, max: norms.humidityPlaceMax };
  if (age <= norms.humidityEarlyUntil) {
    return { min: norms.humidityEarlyMin, max: norms.humidityEarlyMax };
  }
  return { min: norms.humidityLateMin, max: norms.humidityLateMax };
}

export type SeedArticle = {
  slug: string;
  category: HandbookCategory;
  question: string;
  answerTech: string;
  answerVet: string;
  sortOrder: number;
  priority?: boolean;
};

export const SEED_ARTICLES: SeedArticle[] = [
  {
    slug: "humidity-age",
    category: "climate",
    sortOrder: 10,
    priority: true,
    question: "Яка вологість має бути в залі на посадці і до 14-ї доби?",
    answerTech:
      "На посадку тримайте 50–55%. До 14-ї доби — 50–60%. Далі можна до 70%, якщо підстилка суха. Вологість дивіться по підстилці і по ніпелях, не лише по датчику на стіні.",
    answerVet:
      "Сухе повітря в перші дні сушить слизові і піднімає пил — респіраторка. Надто вологе — кокцидії і дерматит подушок. Якщо RH вище норми і послід рідкий — шукайте причину в воді і кишечнику, не лише в вентиляції.",
  },
  {
    slug: "chicks-huddle",
    category: "climate",
    sortOrder: 20,
    priority: true,
    question: "Курчата збились у купу. Це холод чи протяг?",
    answerTech:
      "Купка під стіною або біля дверей — протяг. Рівне кільце навколо брудера і вільна середина — норма. Усі в центрі брудера — холодно: підніміть температуру на 0,5–1 °C і перевірте підстилку на дотик біля підлоги.",
    answerVet:
      "Якщо курчата пищать, липкі і з невтягнутим жовтком — переохолодження з першої ночі. Огляньте клоаку і пуповину. Не підвищуйте температуру різко більше ніж на 1,5 °C за раз.",
  },
  {
    slug: "heat-panting",
    category: "climate",
    sortOrder: 30,
    priority: true,
    question: "Птах розкрив дзьоб, лежить розпластано. Що робити в спеку?",
    answerTech:
      "Максимальна вентиляція, швидкість повітря на рівні птаха, повні ніпелі. Не годуйте в пік спеки — корм уранці і ввечері. Зволожте дах/штори, якщо є. Не поливайте птаха холодною водою.",
    answerVet:
      "Тепловий стрес бʼє серце і нирки. На випоювання — електроліти і вітамін C. Антибіотик «від спеки» не ставте. Якщо падіж пішов — охолоджуйте залу, потім уже лікування.",
  },
  {
    slug: "wet-drinkers",
    category: "litter",
    sortOrder: 40,
    question: "Підстилка мокра лише під поїлками. Що перевірити?",
    answerTech:
      "Тиск ніпельної лінії, висота поїлок (спина птаха, не дзьоб до підлоги), чи не течуть ніпелі. Підсипте суху стружку локально. Не розкидайте вапно товстим шаром на мокре — буде корж.",
    answerVet:
      "Мокрі зони ростять кокцидії і аммоній. Якщо плюс рідкий послід — спочатку лінія поїння і ентерит, не загальна вентиляція.",
  },
  {
    slug: "loose-droppings",
    category: "litter",
    sortOrder: 50,
    priority: true,
    question: "Послід став рідким. З чого почати?",
    answerTech:
      "Не збільшуйте корм. Перевірте свіжість партії, воду, тиск ніпелів. У звіті обовʼязково зазначте вигляд посліду — технолог побачить відхилення по всій фабриці.",
    answerVet:
      "Рідкий послід — ентерит, кокцидії, мікотоксини або надлишок білка. Порахуйте добовий падіж. Якщо росте — розтин 2–3 свіжих трупів. Не ставте антибіотик «на всяк випадок» без картини.",
  },
  {
    slug: "green-droppings",
    category: "litter",
    sortOrder: 60,
    question: "Послід зелений або жовтий. Це жовч чи хвороба?",
    answerTech:
      "Зелений часто буває, коли птах голодує або стоїть без корму вночі занадто довго. Перевірте роздачу і чи всі лінії сиплять. Жовтий з піною — вже не «голод».",
    answerVet:
      "Зелений з жовчю після голоду може пройти за добу. Якщо плюс падіж, кров або піна — вірусний ентерит / Gumboro / кокцидії. Ізолюйте сумнівний пташник у звітах і кличте ветлікаря.",
  },
  {
    slug: "water-intake",
    category: "water",
    sortOrder: 70,
    question: "Скільки мають пити і коли «багато пʼють»?",
    answerTech:
      "Орієнтир — приблизно вдвічі більше води, ніж корму за вагою, у спеку більше. Стрибок води при нормальній температурі — дивіться ніпелі, сіль у раціоні, підкислювач.",
    answerVet:
      "Різке зростання води часто випереджає ентерит на півдоби. Не глушіть антибіотиком одразу: спочатку електроліти, огляд посліду, падіж.",
  },
  {
    slug: "water-meds",
    category: "water",
    sortOrder: 80,
    priority: true,
    question: "Як ставити препарат на випоювання і як рахувати на 1 м³?",
    answerTech:
      "У щоденному звіті вкажіть препарат зі списку і концентрацію на 1 м³ води. Не мішайте антибіотик і сильний підкислювач в одній бочці без схеми технолога. Після курсу промийте лінію.",
    answerVet:
      "Доза з етикетки — на м³ випитої води, не «на око в бачок». Курс 3–5 діб, не 1 день «для заспокоєння». Вітаміни після антибіотика, не замість діагнозу.",
  },
  {
    slug: "acidifier",
    category: "water",
    sortOrder: 90,
    question: "Коли давати підкислювач, а коли прибрати?",
    answerTech:
      "Підкислювач тримає біоплівку в лінії і pH води. Прибирайте, якщо птах різко зменшив воду або стоїть антибіотик, який з кислотою не сумісний.",
    answerVet:
      "Постійний сильний підкислювач на слабких курчатах може бити споживання. При кокцидіях кислота не лікує. Якщо послід рідкий на кислоті — знизьте дозу і шукайте кишечник.",
  },
  {
    slug: "low-feed",
    category: "feed",
    sortOrder: 100,
    question: "Недожор: бункер повний, а по нормі мало зʼїли. Що перевірити?",
    answerTech:
      "Лінії, датчики, чи корм дійшов до кінця пташника, світловий день, температура. Спека ріже споживання вдень. Не засипайте «з запасом» — згірклий корм у трубі ще гірший.",
    answerVet:
      "Раптовий недожор при нормальній температурі — респіраторка або кокцидії. Подивіться зоб, слиз з носа, падіж. Маса відстане через 1–2 доби.",
  },
  {
    slug: "density-42",
    category: "density",
    sortOrder: 110,
    priority: true,
    question: "Коли зал дійде до 42 кг/м² і що робити за 5 діб?",
    answerTech:
      "Сайт рахує кг/м² від поголівʼя, маси і площі пташника. За 5 діб до 42 кг/м² прийде попередження. Готуйте відлов, вентиляцію фінішу і не ставте нову голову «в щілину».",
    answerVet:
      "Вище 42 кг/м² росте дерматит, намини, падіж від тисняви. Якщо ліміт близько, а падіж уже високий — краще здати раніше, ніж тримати «до графіка».",
  },
  {
    slug: "day-mortality",
    category: "health",
    sortOrder: 120,
    priority: true,
    question: "Добовий падіж вищий за норму. Коли бити тривогу?",
    answerTech:
      "Норма кросу на добу — у звіті. Якщо падіж вище порогу — не чекайте трьох днів «само пройде». Перевірте температуру ночі, воду, корм, послід.",
    answerVet:
      "Стрибок падежу + водянистий або кривавий послід — розтин сьогодні. Легені/повітряні мішки — респіраторка. Серце/асцит на фініші — вентиляція і щільність, не антибіотик.",
  },
  {
    slug: "after-vaccine",
    category: "health",
    sortOrder: 130,
    question: "Після вакцинації просіла маса і вода. Це нормально?",
    answerTech:
      "1–2 доби легкого недожору після вакцинації буває. Світло і температура — стабільні. Не ставте в цей день сильний підкислювач і не чіпайте лінії.",
    answerVet:
      "Якщо падіж пішов у день вакцинації — це не «реакція», а техніка введення або вже хворий птах. Вітаміни можна, антибіотик — лише за схемою ветлікаря.",
  },
];
