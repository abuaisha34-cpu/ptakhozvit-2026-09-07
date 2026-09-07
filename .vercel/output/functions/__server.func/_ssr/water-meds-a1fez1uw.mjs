//#region node_modules/.nitro/vite/services/ssr/assets/water-meds-a1fez1uw.js
var WATER_MED_GROUPS = [
	{
		id: "antibiotic",
		label: "Антибіотики"
	},
	{
		id: "coccidiostat",
		label: "Протикокцидійні"
	},
	{
		id: "acidifier",
		label: "Підкислювачі"
	},
	{
		id: "vitamin",
		label: "Вітаміни та електроліти"
	},
	{
		id: "probiotic",
		label: "Пробіотики"
	},
	{
		id: "other",
		label: "Інші добавки"
	}
];
var WATER_MEDS = [
	{
		id: "enro",
		group: "antibiotic",
		name: "Енрофлоксацин",
		unit: "ml",
		typical: "50–100 мл/м³"
	},
	{
		id: "colistin",
		group: "antibiotic",
		name: "Колістин",
		unit: "g",
		typical: "50–100 г/м³"
	},
	{
		id: "amox",
		group: "antibiotic",
		name: "Амоксицилін",
		unit: "g",
		typical: "100–200 г/м³"
	},
	{
		id: "doxy",
		group: "antibiotic",
		name: "Доксициклін",
		unit: "g",
		typical: "100–200 г/м³"
	},
	{
		id: "tylosin",
		group: "antibiotic",
		name: "Тілозин",
		unit: "g",
		typical: "100–200 г/м³"
	},
	{
		id: "tilmico",
		group: "antibiotic",
		name: "Тілмікозин",
		unit: "ml",
		typical: "150–300 мл/м³"
	},
	{
		id: "florfen",
		group: "antibiotic",
		name: "Флорфенікол",
		unit: "ml",
		typical: "100–200 мл/м³"
	},
	{
		id: "oxytet",
		group: "antibiotic",
		name: "Окситетрациклін",
		unit: "g",
		typical: "200–400 г/м³"
	},
	{
		id: "tmp_sulfa",
		group: "antibiotic",
		name: "Сульфаніламід + триметоприм",
		unit: "g",
		typical: "100–200 г/м³"
	},
	{
		id: "toltraz",
		group: "coccidiostat",
		name: "Толтразурил",
		unit: "ml",
		typical: "25–50 мл/м³"
	},
	{
		id: "amprol",
		group: "coccidiostat",
		name: "Ампроліум",
		unit: "g",
		typical: "120–240 г/м³"
	},
	{
		id: "formic",
		group: "acidifier",
		name: "Мурашина кислота",
		unit: "ml",
		typical: "500–1500 мл/м³"
	},
	{
		id: "propion",
		group: "acidifier",
		name: "Пропіонова кислота",
		unit: "ml",
		typical: "500–1000 мл/м³"
	},
	{
		id: "lactic",
		group: "acidifier",
		name: "Молочна кислота",
		unit: "ml",
		typical: "500–1500 мл/м³"
	},
	{
		id: "acid_mix",
		group: "acidifier",
		name: "Комплексний підкислювач",
		unit: "ml",
		typical: "500–2000 мл/м³"
	},
	{
		id: "citric",
		group: "acidifier",
		name: "Лимонна кислота",
		unit: "g",
		typical: "200–500 г/м³"
	},
	{
		id: "ad3e",
		group: "vitamin",
		name: "Вітаміни AD3E",
		unit: "ml",
		typical: "200–500 мл/м³"
	},
	{
		id: "vit_c",
		group: "vitamin",
		name: "Вітамін C",
		unit: "g",
		typical: "100–200 г/м³"
	},
	{
		id: "vit_e_se",
		group: "vitamin",
		name: "Вітамін E + селен",
		unit: "ml",
		typical: "200–400 мл/м³"
	},
	{
		id: "b_complex",
		group: "vitamin",
		name: "Вітаміни групи B",
		unit: "ml",
		typical: "200–500 мл/м³"
	},
	{
		id: "electro",
		group: "vitamin",
		name: "Електроліти",
		unit: "g",
		typical: "500–1000 г/м³"
	},
	{
		id: "vit_electro",
		group: "vitamin",
		name: "Вітаміни + електроліти",
		unit: "g",
		typical: "300–800 г/м³"
	},
	{
		id: "probiotic",
		group: "probiotic",
		name: "Пробіотик (лактобацили)",
		unit: "g",
		typical: "50–200 г/м³"
	},
	{
		id: "yeast",
		group: "probiotic",
		name: "Живі дріжджі",
		unit: "g",
		typical: "50–150 г/м³"
	},
	{
		id: "glucose",
		group: "other",
		name: "Глюкоза / енергетик",
		unit: "g",
		typical: "500–2000 г/м³"
	},
	{
		id: "hepato",
		group: "other",
		name: "Гепатопротектор",
		unit: "ml",
		typical: "200–500 мл/м³"
	},
	{
		id: "phyto",
		group: "other",
		name: "Фітопрепарат",
		unit: "ml",
		typical: "200–1000 мл/м³"
	},
	{
		id: "iodine",
		group: "other",
		name: "Йод / санація води",
		unit: "ml",
		typical: "20–50 мл/м³"
	},
	{
		id: "custom",
		group: "other",
		name: "Інший препарат",
		unit: "g",
		typical: "вкажіть назву і дозу"
	}
];
var BY_ID = new Map(WATER_MEDS.map((p) => [p.id, p]));
function waterMedById(id) {
	return BY_ID.get(id);
}
function unitLabel(unit) {
	return unit === "ml" ? "мл/м³" : "г/м³";
}
function formatDose(d) {
	const n = Number.isInteger(d.conc) ? String(d.conc) : String(d.conc);
	return `${d.name} ${n} ${unitLabel(d.unit)}`;
}
function parseWaterMeds(raw) {
	if (!Array.isArray(raw)) return [];
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const row of raw) {
		if (!row || typeof row !== "object") continue;
		const r = row;
		const prepId = String(r.prepId ?? "").trim();
		const item = waterMedById(prepId);
		if (!item) continue;
		const conc = Number(r.conc);
		if (!Number.isFinite(conc) || conc <= 0) continue;
		const custom = String(r.name ?? "").trim();
		const name = prepId === "custom" ? custom : item.name;
		if (!name) continue;
		const unit = r.unit === "ml" || r.unit === "g" ? r.unit : item.unit;
		const key = `${prepId}:${name.toLowerCase()}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push({
			prepId,
			group: item.group,
			name,
			conc: Math.round(conc * 100) / 100,
			unit
		});
	}
	return out.slice(0, 12);
}
//#endregion
export { unitLabel as a, parseWaterMeds as i, WATER_MED_GROUPS as n, waterMedById as o, formatDose as r, WATER_MEDS as t };
