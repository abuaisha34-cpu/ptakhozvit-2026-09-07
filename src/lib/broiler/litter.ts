import type { Severity } from "./calc";

export type DroppingLook =
  | "normal"
  | "soft"
  | "loose"
  | "watery"
  | "foamy"
  | "undigested"
  | "green"
  | "bloody"
  | "white"
  | "dry_hard";

export type LitterState = "dry" | "moist" | "sticky" | "caked" | "wet" | "dusty";

export type LitterOption<T extends string> = {
  id: T;
  label: string;
  hint: string;
};

export const DROPPING_LOOKS: LitterOption<DroppingLook>[] = [
  {
    id: "normal",
    label: "Нормальний, сформований",
    hint: "Темно-коричневий, щільний, з білою шапочкою сечової кислоти.",
  },
  {
    id: "soft",
    label: "М'який, кашкоподібний",
    hint: "Тримає форму слабко, трохи вологий, без калюжі.",
  },
  {
    id: "loose",
    label: "Рідкий",
    hint: "Розпливається, але ще не водянистий.",
  },
  {
    id: "watery",
    label: "Водянистий, без форми",
    hint: "Калюжка, майже без твердої фракції.",
  },
  {
    id: "foamy",
    label: "Пінистий",
    hint: "Бульбашки, газ, часто з різким запахом.",
  },
  {
    id: "undigested",
    label: "З неперетравленим кормом",
    hint: "Видно гранулу або зерно в посліді.",
  },
  {
    id: "green",
    label: "Зелений або жовтий",
    hint: "Незвичний колір, іноді з жовчю.",
  },
  {
    id: "bloody",
    label: "З кров'ю або помаранчевим слизом",
    hint: "Кров, слиз, «іржавий» або кораловий відтінок.",
  },
  {
    id: "white",
    label: "Білий, крейдяний",
    hint: "Багато сечової кислоти, майже білий послід.",
  },
  {
    id: "dry_hard",
    label: "Сухий, твердий",
    hint: "Дрібні сухі кульки, мало вологи.",
  },
];

export const LITTER_STATES: LitterOption<LitterState>[] = [
  {
    id: "dry",
    label: "Суха, сипуча",
    hint: "Рихла, не липне до ніг, без коржа.",
  },
  {
    id: "moist",
    label: "Трохи волога",
    hint: "Ще сипуча, холодна на дотик, без калюж.",
  },
  {
    id: "sticky",
    label: "Волога, липне до ніг",
    hint: "Береться грудками, слід від підошви.",
  },
  {
    id: "caked",
    label: "Корж під ніпелями",
    hint: "Злежана плита біля поїлок або вздовж лінії.",
  },
  {
    id: "wet",
    label: "Мокра, калюжі",
    hint: "Блищить, вода стоїть, птах брудний.",
  },
  {
    id: "dusty",
    label: "Дуже суха, пилова",
    hint: "Пилить при ходінні, щипає в носі.",
  },
];

const LOOK_IDS = new Set(DROPPING_LOOKS.map((o) => o.id));
const LITTER_IDS = new Set(LITTER_STATES.map((o) => o.id));

export function parseDroppingLook(value: unknown): DroppingLook | null {
  if (value == null || value === "") return null;
  const id = String(value);
  return LOOK_IDS.has(id as DroppingLook) ? (id as DroppingLook) : null;
}

export function parseLitterState(value: unknown): LitterState | null {
  if (value == null || value === "") return null;
  const id = String(value);
  return LITTER_IDS.has(id as LitterState) ? (id as LitterState) : null;
}

export function droppingLabel(id: string | null | undefined): string {
  return DROPPING_LOOKS.find((o) => o.id === id)?.label ?? "—";
}

export function litterLabel(id: string | null | undefined): string {
  return LITTER_STATES.find((o) => o.id === id)?.label ?? "—";
}

export type LitterAdvice = {
  severity: Severity;
  lookLabel: string;
  litterLabel: string;
  tech: string[];
  vet: string[];
};

const RANK: Record<Severity, number> = { ok: 0, watch: 1, warn: 2, critical: 3 };

function worse(a: Severity, b: Severity): Severity {
  return RANK[a] >= RANK[b] ? a : b;
}

function lookPart(look: DroppingLook, age: number): { severity: Severity; tech: string[]; vet: string[] } {
  const chicks = age <= 7;
  switch (look) {
    case "normal":
      return {
        severity: "ok",
        tech: ["Форма посліду в нормі — не змінюйте корм і світловий день «на око»."],
        vet: ["Біла шапочка сечової кислоти і щільна фракція — травлення в порядку."],
      };
    case "soft":
      return {
        severity: "watch",
        tech: [
          "Перевірте тиск ніпелів і чи не мокрі зони під поїлками. Не збільшуйте даванку корму різко.",
        ],
        vet: [
          chicks
            ? "У перший тиждень м'який послід може бути від жовтка — стежте, чи не рідшає далі."
            : "Кашкоподібний послід — початок дисбактеріозу або надлишок білка. Порахуйте падіж і воду.",
        ],
      };
    case "loose":
      return {
        severity: "warn",
        tech: [
          "Промийте лінію поїння, перевірте свіжість корму і чи немає затхлого силосу/макухи. Не давайте додатковий білок.",
        ],
        vet: [
          "Рідкий послід — ентерит, кокцидії або мікотоксини. Огляньте клоаку, візьміть 2–3 трупи на розтин, якщо падіж росте.",
        ],
      };
    case "watery":
      return {
        severity: "warn",
        tech: [
          "Водянистий послід швидко мочить підстилку. Знайдіть протікання, підніміть мінімальну вентиляцію з підігрівом, підсипте суху стружку на мокрі плями.",
        ],
        vet: [
          "Безформений послід — сильний ентерит або нирки. Обмежте стрес (пересадку, вакцинацію), викликайте ветлікаря, якщо тримається другу добу.",
        ],
      };
    case "foamy":
      return {
        severity: "warn",
        tech: [
          "Не підвищуйте сирий протеїн і рибне борошно. Тримайте підстилку сухою — клостридії люблять вологу й білок.",
        ],
        vet: [
          "Пінистий послід з газом — підозра на некротичний ентерит (клостридії). Потрібна схема ветлікаря, не «антибіотик на око».",
        ],
      };
    case "undigested":
      return {
        severity: "watch",
        tech: [
          "Перевірте гранулу (розсип, дрібна фракція), години світла і швидкість лінії корму. Не перегодовуйте вранці.",
        ],
        vet: [
          "Неперетравлений корм — швидкий транзит, ферменти або кокцидії середнього відділу. Звірте споживання й приріст.",
        ],
      };
    case "green":
      return {
        severity: "warn",
        tech: [
          "Перевірте, чи не затхлий або перегрітий корм, чи немає голодної паузи. Не змінюйте раціон самі в цей день.",
        ],
        vet: [
          "Зелений — швидкий транзит / жовч / вірус. Жовтий — мальабсорбція або кокцидії. Потрібен огляд ветлікаря.",
        ],
      };
    case "bloody":
      return {
        severity: "critical",
        tech: [
          "Не чіпайте корм і вакцинацію без команди. Підсипте суху підстилку на брудні зони, зменшіть стрес і протяг.",
        ],
        vet: [
          "Кров або помаранчевий слиз — кокцидіоз (Eimeria) або геморагічний ентерит. Терміново ветлікар, розтин, кокцидіостатик за схемою господарства.",
        ],
      };
    case "white":
      return {
        severity: "warn",
        tech: [
          "Переконайтесь, що вода є на всіх ніпелях. Не пересушуйте зал і не тримайте високу температуру без доступу до води.",
        ],
        vet: [
          "Крейдяний білий послід — нирки, надлишок білка/кальцію, зневоднення або інфекційний бронхіт. Перевірте споживання води.",
        ],
      };
    case "dry_hard":
      return {
        severity: "watch",
        tech: [
          "Сухий твердий послід — мало п'ють. Пройдіть лінію поїння, висоту ніпелів, тиск. Вологість у залі доведіть до норми доби.",
        ],
        vet: [
          chicks
            ? "У курчат це зневоднення: ризик нефропатії. Відновіть воду, не перегрівайте брудер."
            : "Зневоднення або нирки. Стежте за споживанням води і падежем.",
        ],
      };
  }
}

function litterPart(state: LitterState, age: number): { severity: Severity; tech: string[]; vet: string[] } {
  const chicks = age <= 7;
  const finish = age >= 28;
  switch (state) {
    case "dry":
      return {
        severity: "ok",
        tech: ["Підстилка рихла — тримайте цей режим вентиляції і тиск ніпелів."],
        vet: ["Суха підстилка знижує аміак і опіки подушок. Так і тримайте."],
      };
    case "moist":
      return {
        severity: "watch",
        tech: [
          "Ще прийнятно. Перевірте ніпелі на крапель, не переливайте воду. Вентиляцію не знижуйте «бо тепло».",
        ],
        vet: [
          "Якщо послід нормальний — волога швидше технологічна. Якщо послід рідкий — спочатку лікуйте причину, не лише сушіть зал.",
        ],
      };
    case "sticky":
      return {
        severity: "warn",
        tech: [
          chicks
            ? "У брудингу липка підстилка небезпечна. Підігрів + короткі цикли вентиляції, підсипка сухої стружки, знайдіть протікання."
            : "Підніміть повітрообмін з підігрівом, розпушіть де можна без паніки птиці, підсипте сухе на проходах.",
        ],
        vet: ["Липка підстилка дає аміак і опіки лап. Огляньте подушки стопи і очі — чи немає сльозотечі."],
      };
    case "caked":
      return {
        severity: "warn",
        tech: [
          "Корж під ніпелями — тиск лінії зависокий або поїлки низько. Відрегулюйте висоту і тиск, підсипте сухе, приберіть плиту де безпечно.",
        ],
        vet: [
          finish
            ? "Корж на фініші — контактний дерматит, брак на забої. Потрібна суха підстилка до здачі."
            : "Корж тримає вологу й бактерії біля клоаки. Стежте за лапами і клоацитом.",
        ],
      };
    case "wet":
      return {
        severity: "critical",
        tech: [
          "Калюжі — аварія мікроклімату. Перекрийте протікання, максимум підігріву і вентиляції без протягу на курча, суха підсипка шарами. Не мийте підлогу водою.",
        ],
        vet: [
          chicks
            ? "Мокра підстилка в перший тиждень — жовтковий мішок, переохолодження, спалах падежу. Огляньте живіт курчат."
            : "Аміак, респіратор, опіки. Якщо очі сльозяться — виводьте газ вентиляцією, не масками «на запах».",
        ],
      };
    case "dusty":
      return {
        severity: "watch",
        tech: [
          "Пилова підстилка. Зволожте повітря до норми доби (туман, не полив на птаха). Не женіть максимальну вентиляцію холодним сухим повітрям.",
        ],
        vet: [
          "Пил осідає в дихальних шляхах і гірше працює вакцина спреєм. Стежте за хрипами і прищуреними очима.",
        ],
      };
  }
}

export function buildLitterAdvice(
  look: DroppingLook | null,
  state: LitterState | null,
  ageDays: number,
): LitterAdvice | null {
  if (!look && !state) return null;
  const age = Math.max(0, Math.round(ageDays));
  const a = look ? lookPart(look, age) : { severity: "ok" as const, tech: [] as string[], vet: [] as string[] };
  const b = state ? litterPart(state, age) : { severity: "ok" as const, tech: [] as string[], vet: [] as string[] };
  const lookMeta = DROPPING_LOOKS.find((o) => o.id === look);
  const litterMeta = LITTER_STATES.find((o) => o.id === state);
  return {
    severity: worse(a.severity, b.severity),
    lookLabel: lookMeta?.label ?? "не вказано",
    litterLabel: litterMeta?.label ?? "не вказано",
    tech: [...a.tech, ...b.tech],
    vet: [...a.vet, ...b.vet],
  };
}
