//#region node_modules/.nitro/vite/services/ssr/assets/feed-s9t3EOEY.js
var FEED_PHASES = [
	{
		id: "prestarter",
		label: "Престартер",
		age: "0–10 доба",
		purpose: "Старт, жовток, імунітет"
	},
	{
		id: "starter",
		label: "Стартер",
		age: "11–21 доба",
		purpose: "Ріст кістяка і мʼяза"
	},
	{
		id: "grower",
		label: "Гровер",
		age: "22–35 доба",
		purpose: "Набір маси, FCR"
	},
	{
		id: "finisher",
		label: "Фінішер",
		age: "36–42 доба",
		purpose: "Фінішна маса, здача"
	}
];
var MACRO_HINTS = {
	moisture: {
		meaning: "Скільки води в гранулі. Вище 14% — корм гріється, пліснявіє, падає енергія.",
		lowTech: "Сухий корм пилить. Зволожте лінію або перевірте матрицю гранулятора.",
		lowVet: "Пил сідає на легені. Стежте за респіраторкою і поїнням.",
		highTech: "Не тримайте в бункері. Поверніть партію або швидко згодуйте провітрюючи.",
		highVet: "Ризик плісняви і мікотоксинів. Дивіться послід і падіж через 1–2 доби."
	},
	protein: {
		meaning: "Сирий протеїн — це «цегла» мʼяза. Мало — відстає маса. Багато — рідкий послід і нирки.",
		lowTech: "Перевірте рецепт і шрот. Не компенсуйте самим кукурудзяним силосом.",
		lowVet: "Маса відстане, пірʼя слабке. Не ставте антибіотик «замість білка».",
		highTech: "Зменшіть шрот / рибне. Стежте за підстилкою — азот піде в послід.",
		highVet: "Надлишок білка дає сечову кислоту, білий послід, навантаження на нирки."
	},
	fat: {
		meaning: "Жир дає енергію. Мало — слабкий приріст. Багато / згірклий — пронос і відмова від корму.",
		lowTech: "Додайте олію в рецепт, перевірте, чи не сушать гранулу перегрівом.",
		lowVet: "Мало енергії — птах їсть багато, FCR росте.",
		highTech: "Гранула масна, бункер липне. Зменшіть олію, перевірте свіжість жиру.",
		highVet: "Згірклий жир бʼє печінку і дає пронос. Дивіться жовтий/водянистий послід."
	},
	fiber: {
		meaning: "Клітковина розбавляє раціон. Трохи треба для кишечника, багато — порожній приріст.",
		lowTech: "Дуже «голий» раціон. Трохи висівок не завадить перистальтиці.",
		lowVet: "Рідкий послід без структури кишечника.",
		highTech: "Багато висівок / соняшнику. Замініть енергійнішим зерном.",
		highVet: "Птах голодний при повному зобі. Маса стоїть, послід грубий."
	},
	ash: {
		meaning: "Зола — мінерали плюс пісок і бруд. Висока зола без кальцію = розбавлення.",
		lowTech: "Мало преміксу / черепашки. Перевірте мінеральну частину.",
		lowVet: "Може не вистачати кальцію і фосфору для кістки.",
		highTech: "Пісок, земля, лушпиння. Попросіть млин просіяти сировину.",
		highVet: "Розбавлений корм: маса падає, іноді закупорка мʼязового шлунка."
	},
	calcium: {
		meaning: "Кальцій для кістки і шкаралупи ферменту. Дисбаланс з фосфором ламає ноги.",
		lowTech: "Додайте вапняк дрібного помолу. Не сипте великі фракції курчатам.",
		lowVet: "Мʼякі ноги, сидячий птах, переломи при відлові.",
		highTech: "Надлишок вапняку ріже засвоєння інших мінералів і корм.",
		highVet: "Подагра, білий послід, нирки. Зніміть кальцій і перевірте воду."
	},
	phosphorus: {
		meaning: "Фосфор разом із кальцієм тримає кістку. У рослинах багато фітатного — дивіться доступний.",
		lowTech: "Додайте монокальційфосфат і фітазу. Не компенсуйте самим вапняком.",
		lowVet: "Рахіт, кульгавість, погана підстилка від малорухливого птаха.",
		highTech: "Дорого і зайве. Зменшіть фосфат, стежте за Ca:P ≈ 2:1.",
		highVet: "Дисбаланс Ca:P дає ті самі ноги, що й дефіцит."
	},
	sodium: {
		meaning: "Сіль тримає воду в тілі і апетит. Мало — птах не їсть. Багато — пʼє і мочить підстилку.",
		lowTech: "Перевірте сіль у преміксі. Не сипте «на око» в бункер.",
		lowVet: "Слабкий тонус, мало пʼють, відставання.",
		highTech: "Приберіть сіль, промийте лінію, замініть партію.",
		highVet: "Полідипсія, водянистий послід, мокра підстилка, асцит на фініші."
	},
	energyKcal: {
		meaning: "Обмінна енергія — скільки калорій птах бере з кілограма. Це головний драйвер FCR.",
		lowTech: "Мало олії / кукурудзи. Птах переїдає обʼєм, FCR росте.",
		lowVet: "Худий птах при нормальному зобі.",
		highTech: "Зайва олія. Зменшіть жир, стежте щоб гранула не розсипалась.",
		highVet: "На фініші висока енергія + спека = серце і асцит."
	},
	lysine: {
		meaning: "Лізин — перша лімітуюча амінокислота для мʼяза грудки.",
		lowTech: "Додайте L-лізин у рецепт. Протеїн «на етикетці» без лізину не рятує.",
		lowVet: "Слабка грудка, пірʼя, відставання без явної хвороби.",
		highTech: "Дорого і зайве, якщо решта амінокислот не підтягнуті.",
		highVet: "Дисбаланс амінокислот дає той самий рідкий послід, що надлишок білка."
	},
	methionine: {
		meaning: "Метіонін для пера, печінки і старту. Критичний у престартері.",
		lowTech: "Додайте DL-метіонін. Особливо якщо багато пшениці.",
		lowVet: "Погане перо, жирна печінка, слабкий старт.",
		highTech: "Не сипте метіонін «з запасом» без розрахунку.",
		highVet: "Рідко токсичний у робочих дозах; дивіться радше дефіцит."
	},
	aflatoxin: {
		meaning: "Афлатоксин B1 з пліснявої кукурудзи. Бʼє печінку навіть у малих дозах.",
		lowTech: "",
		lowVet: "",
		highTech: "Зупиніть партію. Змішати «щоб розбавити» — погана ідея.",
		highVet: "Жовта печінка, падіж, імуносупресія. Токсинозвʼязувач — лише підтримка, не лікування."
	},
	don: {
		meaning: "ДОН (вомітоксин) з фузарію на пшениці/кукурудзі. Ріже поїдання.",
		lowTech: "",
		lowVet: "",
		highTech: "Недожор без видимої причини. Замініть зерно, перевірте склад.",
		highVet: "Відмова від корму, блювання у молодняка, виразки рота."
	},
	t2: {
		meaning: "T-2 токсин — агресивний трихотецен. Опіки рота і клоаки.",
		lowTech: "",
		lowVet: "",
		highTech: "Негайно змініть партію. Не гранулюйте заражене зерно «для маскування».",
		highVet: "Некроз язика, клоаки, різкий падіж. Розтин обовʼязковий."
	}
};
var PHASE_SPECS = {
	prestarter: {
		moisture: {
			min: 11,
			max: 13.5,
			hardMax: 14.5
		},
		protein: {
			min: 22,
			max: 24.2
		},
		fat: {
			min: 4.5,
			max: 7.5
		},
		fiber: {
			min: 1.8,
			max: 3.5,
			hardMax: 4.2
		},
		ash: {
			min: 5,
			max: 7,
			hardMax: 7.8
		},
		calcium: {
			min: .9,
			max: 1.1
		},
		phosphorus: {
			min: .65,
			max: .82
		},
		sodium: {
			min: .16,
			max: .22
		},
		energyKcal: {
			min: 2950,
			max: 3100
		},
		lysine: {
			min: 1.28,
			max: 1.45
		},
		methionine: {
			min: .5,
			max: .62
		},
		aflatoxin: {
			max: .02,
			hardMax: .05
		},
		don: {
			max: 5,
			hardMax: 8
		},
		t2: {
			max: .1,
			hardMax: .25
		}
	},
	starter: {
		moisture: {
			min: 11,
			max: 13.5,
			hardMax: 14.5
		},
		protein: {
			min: 20.5,
			max: 22.8
		},
		fat: {
			min: 5,
			max: 8
		},
		fiber: {
			min: 2,
			max: 4,
			hardMax: 4.8
		},
		ash: {
			min: 5,
			max: 6.8,
			hardMax: 7.5
		},
		calcium: {
			min: .84,
			max: 1.02
		},
		phosphorus: {
			min: .6,
			max: .76
		},
		sodium: {
			min: .16,
			max: .22
		},
		energyKcal: {
			min: 3e3,
			max: 3150
		},
		lysine: {
			min: 1.15,
			max: 1.32
		},
		methionine: {
			min: .47,
			max: .58
		},
		aflatoxin: {
			max: .02,
			hardMax: .05
		},
		don: {
			max: 5,
			hardMax: 8
		},
		t2: {
			max: .1,
			hardMax: .25
		}
	},
	grower: {
		moisture: {
			min: 11,
			max: 13.5,
			hardMax: 14.5
		},
		protein: {
			min: 19,
			max: 21
		},
		fat: {
			min: 6,
			max: 9
		},
		fiber: {
			min: 2.2,
			max: 4.5,
			hardMax: 5.2
		},
		ash: {
			min: 4.8,
			max: 6.5,
			hardMax: 7.2
		},
		calcium: {
			min: .8,
			max: .96
		},
		phosphorus: {
			min: .55,
			max: .7
		},
		sodium: {
			min: .15,
			max: .22
		},
		energyKcal: {
			min: 3050,
			max: 3200
		},
		lysine: {
			min: 1.05,
			max: 1.22
		},
		methionine: {
			min: .42,
			max: .54
		},
		aflatoxin: {
			max: .02,
			hardMax: .05
		},
		don: {
			max: 5,
			hardMax: 8
		},
		t2: {
			max: .1,
			hardMax: .25
		}
	},
	finisher: {
		moisture: {
			min: 11,
			max: 13.5,
			hardMax: 14.5
		},
		protein: {
			min: 17.5,
			max: 19.6
		},
		fat: {
			min: 6.5,
			max: 10
		},
		fiber: {
			min: 2.4,
			max: 5,
			hardMax: 5.8
		},
		ash: {
			min: 4.5,
			max: 6.3,
			hardMax: 7
		},
		calcium: {
			min: .75,
			max: .92
		},
		phosphorus: {
			min: .5,
			max: .66
		},
		sodium: {
			min: .14,
			max: .22
		},
		energyKcal: {
			min: 3100,
			max: 3250
		},
		lysine: {
			min: .95,
			max: 1.12
		},
		methionine: {
			min: .38,
			max: .5
		},
		aflatoxin: {
			max: .02,
			hardMax: .05
		},
		don: {
			max: 5,
			hardMax: 8
		},
		t2: {
			max: .1,
			hardMax: .25
		}
	}
};
var NUTRIENT_META = [
	{
		id: "moisture",
		label: "Волога",
		unit: "%",
		group: "macro",
		step: .1,
		decimals: 1
	},
	{
		id: "protein",
		label: "Сирий протеїн",
		unit: "%",
		group: "macro",
		step: .1,
		decimals: 1
	},
	{
		id: "fat",
		label: "Сирий жир",
		unit: "%",
		group: "macro",
		step: .1,
		decimals: 1
	},
	{
		id: "fiber",
		label: "Сира клітковина",
		unit: "%",
		group: "macro",
		step: .1,
		decimals: 1
	},
	{
		id: "ash",
		label: "Зола",
		unit: "%",
		group: "macro",
		step: .1,
		decimals: 1
	},
	{
		id: "energyKcal",
		label: "Обмінна енергія",
		unit: "ккал/кг",
		group: "macro",
		step: 10,
		decimals: 0
	},
	{
		id: "calcium",
		label: "Кальцій",
		unit: "%",
		group: "mineral",
		step: .01,
		decimals: 2
	},
	{
		id: "phosphorus",
		label: "Фосфор",
		unit: "%",
		group: "mineral",
		step: .01,
		decimals: 2
	},
	{
		id: "sodium",
		label: "Натрій",
		unit: "%",
		group: "mineral",
		step: .01,
		decimals: 2
	},
	{
		id: "lysine",
		label: "Лізин",
		unit: "%",
		group: "amino",
		step: .01,
		decimals: 2
	},
	{
		id: "methionine",
		label: "Метіонін",
		unit: "%",
		group: "amino",
		step: .01,
		decimals: 2
	},
	{
		id: "aflatoxin",
		label: "Афлатоксин B1",
		unit: "мг/кг",
		group: "toxin",
		step: .001,
		decimals: 3
	},
	{
		id: "don",
		label: "ДОН (вомітоксин)",
		unit: "мг/кг",
		group: "toxin",
		step: .1,
		decimals: 1
	},
	{
		id: "t2",
		label: "T-2 токсин",
		unit: "мг/кг",
		group: "toxin",
		step: .01,
		decimals: 2
	}
];
var NUTRIENT_GROUPS = [
	{
		id: "macro",
		label: "Основний аналіз"
	},
	{
		id: "mineral",
		label: "Мінерали"
	},
	{
		id: "amino",
		label: "Амінокислоти"
	},
	{
		id: "toxin",
		label: "Мікотоксини"
	}
];
function phaseById(id) {
	return FEED_PHASES.find((p) => p.id === id) ?? FEED_PHASES[0];
}
function specsFor(phase) {
	const row = PHASE_SPECS[phase];
	return NUTRIENT_META.map((m) => ({
		...m,
		hint: MACRO_HINTS[m.id]?.meaning ?? "",
		...row[m.id]
	}));
}
function rangeLabel(spec) {
	if (spec.min != null && spec.max != null) return `${spec.min}–${spec.max} ${spec.unit}`;
	if (spec.max != null) return `до ${spec.max} ${spec.unit}`;
	if (spec.min != null) return `від ${spec.min} ${spec.unit}`;
	return "—";
}
function grade(value, spec) {
	const { min, max, hardMax } = spec;
	if (hardMax != null && value > hardMax) return "critical";
	if (min == null && max == null) return "ok";
	if (min != null && max != null) {
		if (value >= min && value <= max) return "ok";
		const span = Math.max(1e-4, max - min);
		const pct = (value > max ? value - max : min - value) / span;
		if (pct <= .08) return "watch";
		if (pct <= .22) return "warn";
		return "critical";
	}
	if (max != null) {
		if (value <= max) return "ok";
		if (value <= max * 1.25) return "warn";
		return "critical";
	}
	if (min != null) {
		if (value >= min) return "ok";
		if (value >= min * .92) return "watch";
		if (value >= min * .8) return "warn";
		return "critical";
	}
	return "ok";
}
var RANK = {
	ok: 0,
	watch: 1,
	warn: 2,
	critical: 3
};
function worse(a, b) {
	return RANK[a] >= RANK[b] ? a : b;
}
function side(value, spec) {
	if (spec.min != null && value < spec.min) return "low";
	if (spec.max != null && value > spec.max) return "high";
	return "ok";
}
function parseFeedValues(raw) {
	if (!raw || typeof raw !== "object") return {};
	const o = raw;
	const out = {};
	for (const meta of NUTRIENT_META) {
		const n = Number(String(o[meta.id] ?? "").replace(",", "."));
		if (Number.isFinite(n) && n >= 0) out[meta.id] = n;
	}
	return out;
}
function kcalFromMj(mj) {
	return Math.round(mj * 239);
}
function evaluateFeed(phase, values) {
	const info = phaseById(phase);
	const specs = specsFor(phase);
	const checks = [];
	for (const spec of specs) {
		const raw = values[spec.id];
		if (raw == null || !Number.isFinite(raw)) continue;
		const value = raw;
		const sev = grade(value, spec);
		const dir = side(value, spec);
		const copy = MACRO_HINTS[spec.id];
		const tech = dir === "low" ? copy.lowTech : dir === "high" ? copy.highTech : "У нормі для цієї фази — не чіпайте рецепт «на око».";
		const vet = dir === "low" ? copy.lowVet : dir === "high" ? copy.highVet : "Лабораторно спокійно. Дивіться послід і масу як завжди.";
		const detail = dir === "ok" ? `${value} ${spec.unit} — у межах ${rangeLabel(spec)}.` : dir === "low" ? `${value} ${spec.unit} — нижче норми ${rangeLabel(spec)}.` : `${value} ${spec.unit} — вище норми ${rangeLabel(spec)}.`;
		checks.push({
			id: spec.id,
			label: spec.label,
			unit: spec.unit,
			group: spec.group,
			value,
			min: spec.min,
			max: spec.max,
			severity: sev,
			rangeLabel: rangeLabel(spec),
			detail,
			tech,
			vet
		});
	}
	if (!checks.length) return null;
	let score = 100;
	let sev = "ok";
	for (const c of checks) {
		sev = worse(sev, c.severity);
		if (c.severity === "watch") score -= c.group === "toxin" ? 8 : 5;
		if (c.severity === "warn") score -= c.group === "toxin" ? 18 : 12;
		if (c.severity === "critical") score -= c.group === "toxin" ? 40 : 22;
	}
	score = Math.max(0, Math.min(100, Math.round(score)));
	const headline = sev === "ok" ? "Раціон у нормі" : sev === "watch" ? "Є зауваження" : sev === "warn" ? "Раціон слабкий — корегуйте" : "Не давати без корекції";
	const bad = checks.filter((c) => c.severity !== "ok");
	const summary = sev === "ok" ? `По ${checks.length} показниках ${info.label.toLowerCase()} (${info.age}) вкладається в робочий коридор.` : `Відхилення: ${bad.map((c) => c.label.toLowerCase()).join(", ")}. Фаза ${info.label.toLowerCase()}, ${info.age}.`;
	const tech = [...new Set(checks.filter((c) => c.severity !== "ok" && c.tech).map((c) => c.tech))].slice(0, 4);
	const vet = [...new Set(checks.filter((c) => c.severity !== "ok" && c.vet).map((c) => c.vet))].slice(0, 4);
	if (!tech.length) tech.push("Залиште цей рецепт. Наступну партію теж перевірте — млин «плаває».");
	if (!vet.length) vet.push("Лабораторно спокійно. Далі дивіться послід, воду і добовий падіж.");
	return {
		phase,
		phaseLabel: info.label,
		age: info.age,
		filled: checks.length,
		score,
		severity: sev,
		headline,
		summary,
		checks,
		tech,
		vet
	};
}
function feedPhaseLabel(id) {
	return phaseById(id).label;
}
//#endregion
export { feedPhaseLabel as a, specsFor as c, evaluateFeed as i, NUTRIENT_GROUPS as n, kcalFromMj as o, NUTRIENT_META as r, parseFeedValues as s, FEED_PHASES as t };
