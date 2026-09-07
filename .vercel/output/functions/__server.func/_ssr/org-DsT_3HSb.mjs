import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/org-DsT_3HSb.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function num(value) {
	if (value == null || value === "") return 0;
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? n : 0;
}
function round(value, digits = 1) {
	const f = 10 ** digits;
	return Math.round(value * f) / f;
}
/** Calendar date in Europe/Kyiv as YYYY-MM-DD. */
function todayISO(timeZone = "Europe/Kyiv") {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(/* @__PURE__ */ new Date());
}
/** Previous calendar day in Europe/Kyiv — the day a daily report is due. */
function yesterdayISO(timeZone = "Europe/Kyiv") {
	return addDaysISO(todayISO(timeZone), -1);
}
function addDaysISO(iso, days) {
	const [y, m, d] = iso.split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d + days));
	return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}
function eachDateISO(from, to) {
	if (!from || !to || from > to) return [];
	const out = [];
	let d = from;
	while (d <= to) {
		out.push(d);
		d = addDaysISO(d, 1);
		if (out.length > 80) break;
	}
	return out;
}
function diffDays(fromIso, toIso) {
	const a = Date.parse(`${fromIso}T00:00:00Z`);
	const b = Date.parse(`${toIso}T00:00:00Z`);
	return Math.round((b - a) / 864e5);
}
var uaInt = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 });
new Intl.NumberFormat("uk-UA", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});
function fmtInt(n) {
	return uaInt.format(Math.round(n));
}
function fmtNum(n, digits = 1) {
	if (digits === 0) return uaInt.format(Math.round(n));
	return new Intl.NumberFormat("uk-UA", {
		minimumFractionDigits: digits > 1 ? digits : 0,
		maximumFractionDigits: digits
	}).format(n);
}
function fmtPct(n, digits = 2) {
	return `${n.toLocaleString("uk-UA", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	})}%`;
}
function fmtDate(iso) {
	const [y, m, d] = iso.split("-").map(Number);
	return new Intl.DateTimeFormat("uk-UA", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC"
	}).format(new Date(Date.UTC(y, m - 1, d)));
}
function fmtDateShort(iso) {
	const [y, m, d] = iso.split("-").map(Number);
	return new Intl.DateTimeFormat("uk-UA", {
		day: "numeric",
		month: "short",
		timeZone: "UTC"
	}).format(new Date(Date.UTC(y, m - 1, d)));
}
function shortSite(name) {
	return name.replace("Фабрика ", "").replace(/[«»]/g, "");
}
function pctDelta(actual, standard) {
	if (!standard) return null;
	return (actual - standard) / standard * 100;
}
var ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateInviteCode(rng = Math.random) {
	let out = "";
	for (let i = 0; i < 6; i += 1) out += ALPHABET[Math.floor(rng() * 32) % 32];
	return out;
}
function normalizeInviteCode(raw) {
	return raw.trim().toUpperCase().replace(/[\s\-_.]/g, "");
}
function isInviteCodeFormat(code) {
	return /^[A-Z0-9]{6}$/.test(code);
}
function generateSheetsToken(rng = Math.random) {
	const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";
	let out = "";
	for (let i = 0; i < 24; i += 1) out += alphabet[Math.floor(rng() * 33) % 33];
	return out;
}
function isSheetsTokenFormat(code) {
	return /^[a-z2-9]{24}$/.test(code);
}
//#endregion
export { round as _, fmtDate as a, yesterdayISO as b, fmtNum as c, generateSheetsToken as d, isInviteCodeFormat as f, pctDelta as g, num as h, eachDateISO as i, fmtPct as l, normalizeInviteCode as m, cn as n, fmtDateShort as o, isSheetsTokenFormat as p, diffDays as r, fmtInt as s, addDaysISO as t, generateInviteCode as u, shortSite as v, todayISO as y };
