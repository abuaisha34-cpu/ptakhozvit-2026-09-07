import { o as waterMedById } from "./water-meds-a1fez1uw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/treatments-CsIFZeLW.js
/** Typical broiler vaccination reminders (as-hatched, Ukraine practice). */
var VAX_SCHEDULE = [
	{
		day: 0,
		name: "Марек / ІБ (інкубатор)"
	},
	{
		day: 7,
		name: "Ньюкасл + інфекційний бронхіт"
	},
	{
		day: 12,
		name: "Гамборо (IBD)"
	},
	{
		day: 14,
		name: "Ньюкасл (повтор)"
	},
	{
		day: 21,
		name: "Ньюкасл + ІБ (повтор)"
	}
];
function defaultTreatmentCalendar() {
	return VAX_SCHEDULE.map((v, i) => ({
		id: `vax-${v.day}-${i}`,
		day: v.day,
		name: v.name,
		done: false,
		doneDate: null,
		notes: ""
	}));
}
function newTreatmentEvent(partial) {
	return {
		id: partial?.id || `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
		day: Number.isFinite(Number(partial?.day)) ? Math.max(0, Math.round(Number(partial?.day))) : 0,
		name: (partial?.name ?? "").trim(),
		done: Boolean(partial?.done),
		doneDate: partial?.doneDate ? String(partial.doneDate).slice(0, 10) : null,
		notes: (partial?.notes ?? "").trim()
	};
}
function parseTreatmentCalendar(raw) {
	if (!Array.isArray(raw)) return null;
	const out = [];
	for (const row of raw) {
		if (!row || typeof row !== "object") continue;
		const r = row;
		const name = String(r.name ?? "").trim();
		if (!name) continue;
		const day = Math.max(0, Math.min(80, Math.round(Number(r.day) || 0)));
		const done = Boolean(r.done);
		const doneDate = r.doneDate ? String(r.doneDate).slice(0, 10) : null;
		out.push({
			id: String(r.id ?? `t-${day}-${out.length}`),
			day,
			name: name.slice(0, 120),
			done,
			doneDate: done ? doneDate : null,
			notes: String(r.notes ?? "").trim().slice(0, 200)
		});
	}
	return out.sort((a, b) => a.day - b.day || a.name.localeCompare(b.name, "uk"));
}
function calendarFromTemplate(template) {
	return template.map((t, i) => ({
		...t,
		id: t.id || `vax-${t.day}-${i}`,
		done: false,
		doneDate: null
	}));
}
var WITHDRAWAL_DAYS = {
	enro: 7,
	colistin: 7,
	amox: 7,
	doxy: 7,
	tylosin: 5,
	tilmico: 12,
	florfen: 5,
	oxytet: 7,
	tmp_sulfa: 7,
	toltraz: 5,
	amprol: 3
};
function withdrawalDaysFor(prepId, group) {
	if (WITHDRAWAL_DAYS[prepId] != null) return WITHDRAWAL_DAYS[prepId];
	if (group === "antibiotic") return 7;
	if (group === "coccidiostat") return 5;
	const item = waterMedById(prepId);
	if (item?.group === "antibiotic") return 7;
	if (item?.group === "coccidiostat") return 5;
	return 0;
}
function addDays(iso, days) {
	const [y, m, d] = iso.split("-").map(Number);
	return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
function diffDays(from, to) {
	const a = Date.parse(`${from}T00:00:00Z`);
	const b = Date.parse(`${to}T00:00:00Z`);
	return Math.round((b - a) / 864e5);
}
function activeWithdrawals(history, today) {
	const lastByName = /* @__PURE__ */ new Map();
	for (const row of history) for (const med of row.meds) {
		const days = withdrawalDaysFor(med.prepId, med.group);
		if (days <= 0) continue;
		const prev = lastByName.get(med.name);
		if (!prev || row.date >= prev.date) lastByName.set(med.name, {
			date: row.date,
			days
		});
	}
	const out = [];
	for (const [name, v] of lastByName) {
		const until = addDays(v.date, v.days);
		const daysLeft = diffDays(today, until);
		if (daysLeft > 0) out.push({
			name,
			lastDate: v.date,
			until,
			daysLeft
		});
	}
	return out.sort((a, b) => b.daysLeft - a.daysLeft);
}
//#endregion
export { parseTreatmentCalendar as a, newTreatmentEvent as i, calendarFromTemplate as n, defaultTreatmentCalendar as r, activeWithdrawals as t };
