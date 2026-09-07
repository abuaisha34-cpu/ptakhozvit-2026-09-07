import { o as getRequest, r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-B592UzGh.mjs";
import { a as canManageFlocks, c as factoryRequired, d as isDemoUser, f as isPlatformAdmin, h as staffLabel, i as canEditTreatments, l as factorySelectable, m as seesAllFactories, o as canManageOps, p as roleLabel, r as canDeleteReports, u as hasTechAccess } from "./roles-BISHNnDi.mjs";
import { _ as round, b as yesterdayISO, d as generateSheetsToken, f as isInviteCodeFormat, h as num, i as eachDateISO, m as normalizeInviteCode, r as diffDays, t as addDaysISO, u as generateInviteCode, y as todayISO } from "./org-DsT_3HSb.mjs";
import { i as humidityFromNorms, r as SEED_ARTICLES, t as DEFAULT_NORMS } from "./handbook-OalI0BW1.mjs";
import { a as startWeight, n as breedByName, r as getStandard } from "./standards-DCoZ9WxY.mjs";
import { r as getSql } from "./db-CZOlgmpB.mjs";
import { a as feedPhaseLabel, i as evaluateFeed, s as parseFeedValues } from "./feed-s9t3EOEY.mjs";
import { o as parseDroppingLook, s as parseLitterState } from "./litter-D5RpUDRr.mjs";
import { i as parseWaterMeds } from "./water-meds-a1fez1uw.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { a as saleAvgWeightG, i as forecastDensity, n as fcrAtSale, o as snapshotFromSeries, r as forecastCycle, s as statusFromDeviations, t as evaluateDeviations } from "./calc-pmcuGk45.mjs";
import { a as parseTreatmentCalendar, n as calendarFromTemplate, r as defaultTreatmentCalendar, t as activeWithdrawals } from "./treatments-CsIFZeLW.mjs";
import { n as weatherKindLabel, t as buildClimateAdvice } from "./climate-D8vYDIpX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fns-DVXXIo92.js
var UA = "PtahoZvit/1.0 (poultry production; weather for house climate)";
var CACHE_MS = 12e5;
var g = globalThis;
g.__wxCache__ ??= /* @__PURE__ */ new Map();
async function readJson(url, ms = 8e3) {
	const res = await fetch(url, {
		headers: {
			"User-Agent": UA,
			Accept: "application/json"
		},
		signal: AbortSignal.timeout(ms)
	});
	if (!res.ok) throw new Error(`weather ${res.status}`);
	return res.json();
}
function kyivYmd(iso) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Europe/Kyiv",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(new Date(iso));
}
function kyivHour(iso) {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Europe/Kyiv",
		hour: "2-digit",
		hourCycle: "h23"
	}).formatToParts(new Date(iso));
	return Number(parts.find((p) => p.type === "hour")?.value ?? 0);
}
var KIND_RANK = {
	clear: 0,
	partly: 1,
	cloudy: 2,
	fog: 3,
	rain: 4,
	snow: 5,
	thunder: 6
};
function metSymbolKind(code) {
	const c = code.replace(/_day|_night|_polartwilight/g, "");
	if (c.includes("thunder")) return "thunder";
	if (c.includes("snow") || c.includes("sleet")) return "snow";
	if (c.includes("rain") || c.includes("drizzle")) return "rain";
	if (c.includes("fog") || c.includes("mist")) return "fog";
	if (c === "cloudy") return "cloudy";
	if (c.includes("partlycloudy") || c === "fair") return "partly";
	return "clear";
}
function pickKind(kinds) {
	return kinds.reduce((a, b) => KIND_RANK[b] > KIND_RANK[a] ? b : a, "clear");
}
function mean(xs) {
	if (!xs.length) return null;
	return xs.reduce((s, n) => s + n, 0) / xs.length;
}
function daysFromMetNo(points) {
	const buckets = /* @__PURE__ */ new Map();
	for (const p of points) {
		const date = kyivYmd(p.time);
		const b = buckets.get(date) ?? {
			temps: [],
			rh: [],
			wind: [],
			precip: [],
			kinds: []
		};
		const d = p.data.instant?.details;
		if (typeof d?.air_temperature === "number") b.temps.push(d.air_temperature);
		if (typeof d?.relative_humidity === "number") b.rh.push(d.relative_humidity);
		if (typeof d?.wind_speed === "number") b.wind.push(d.wind_speed);
		const rain = p.data.next_1_hours?.details?.precipitation_amount ?? (p.data.next_6_hours?.details?.precipitation_amount != null ? p.data.next_6_hours.details.precipitation_amount / 6 : 0);
		if (typeof rain === "number") b.precip.push(rain);
		const hour = kyivHour(p.time);
		const sym = p.data.next_1_hours?.summary?.symbol_code ?? p.data.next_6_hours?.summary?.symbol_code;
		if (sym && hour >= 6 && hour <= 18) b.kinds.push(metSymbolKind(sym));
		else if (sym) b.kinds.push(metSymbolKind(sym));
		buckets.set(date, b);
	}
	return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).filter(([, b]) => b.temps.length).map(([date, b]) => {
		const kind = pickKind(b.kinds.length ? b.kinds : ["partly"]);
		return {
			date,
			tempMin: Math.round(Math.min(...b.temps) * 10) / 10,
			tempMax: Math.round(Math.max(...b.temps) * 10) / 10,
			humidityMean: mean(b.rh) != null ? Math.round(mean(b.rh)) : null,
			precipMm: Math.round(b.precip.reduce((s, n) => s + n, 0) * 10) / 10,
			precipProb: null,
			windMaxMs: Math.round(Math.max(0, ...b.wind) * 10) / 10,
			kind,
			label: weatherKindLabel(kind)
		};
	});
}
async function fromMetNo(lat, lon) {
	const ts = (await readJson(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`)).properties?.timeseries ?? [];
	if (!ts.length) throw new Error("порожній прогноз");
	return daysFromMetNo(ts);
}
function wttrKind(desc) {
	const d = desc.toLowerCase();
	if (d.includes("thunder") || d.includes("гроз")) return "thunder";
	if (d.includes("snow") || d.includes("сніг") || d.includes("sleet")) return "snow";
	if (d.includes("rain") || d.includes("drizzle") || d.includes("shower") || d.includes("дощ")) return "rain";
	if (d.includes("fog") || d.includes("mist") || d.includes("туман")) return "fog";
	if (d.includes("overcast") || d.includes("cloud") || d.includes("хмар")) return d.includes("partly") || d.includes("мінлив") ? "partly" : "cloudy";
	return "clear";
}
async function fromWttr(lat, lon) {
	const rows = (await readJson(`https://wttr.in/${lat},${lon}?format=j1&m&lang=uk`)).weather ?? [];
	if (!rows.length) throw new Error("порожній прогноз");
	return rows.map((d) => {
		const hours = d.hourly ?? [];
		const rh = mean(hours.map((h) => Number(h.humidity)).filter(Number.isFinite));
		const windKmh = Math.max(0, ...hours.map((h) => Number(h.windspeedKmph)).filter(Number.isFinite));
		const precip = hours.reduce((s, h) => s + (Number(h.precipMM) || 0), 0);
		const mid = hours[Math.min(4, hours.length - 1)];
		const kind = wttrKind(mid?.weatherDesc?.[0]?.value ?? "");
		return {
			date: d.date,
			tempMin: Number(d.mintempC),
			tempMax: Number(d.maxtempC),
			humidityMean: rh != null ? Math.round(rh) : null,
			precipMm: Math.round(precip * 10) / 10,
			precipProb: null,
			windMaxMs: Math.round(windKmh / 3.6 * 10) / 10,
			kind,
			label: weatherKindLabel(kind)
		};
	});
}
async function fromOpenMeteo(lat, lon, date) {
	const start = date;
	const endParts = date.split("-").map(Number);
	const json = await readJson(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code&hourly=relative_humidity_2m&timezone=Europe%2FKyiv&start_date=${start}&end_date=${new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2] + 2)).toISOString().slice(0, 10)}`);
	if (json.error || !json.daily?.time?.length) throw new Error("open-meteo");
	const rhByDate = /* @__PURE__ */ new Map();
	json.hourly?.time.forEach((t, i) => {
		const d = t.slice(0, 10);
		const arr = rhByDate.get(d) ?? [];
		arr.push(json.hourly.relative_humidity_2m[i]);
		rhByDate.set(d, arr);
	});
	return json.daily.time.map((d, i) => {
		const kind = wmoKind(json.daily.weather_code[i] ?? 1);
		const rh = mean(rhByDate.get(d) ?? []);
		return {
			date: d,
			tempMin: json.daily.temperature_2m_min[i],
			tempMax: json.daily.temperature_2m_max[i],
			humidityMean: rh != null ? Math.round(rh) : null,
			precipMm: json.daily.precipitation_sum[i] ?? 0,
			precipProb: json.daily.precipitation_probability_max?.[i] ?? null,
			windMaxMs: json.daily.wind_speed_10m_max[i] ?? 0,
			kind,
			label: weatherKindLabel(kind)
		};
	});
}
function wmoKind(code) {
	if (code === 0) return "clear";
	if (code <= 3) return "partly";
	if (code <= 48) return "fog";
	if (code >= 71 && code <= 77) return "snow";
	if (code >= 85 && code <= 86) return "snow";
	if (code >= 95) return "thunder";
	if (code >= 51) return "rain";
	return "cloudy";
}
async function searchPlaces$1(query) {
	const q = query.trim().slice(0, 80);
	if (q.length < 2) return [];
	const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=uk&country=ua`;
	try {
		return ((await readJson(url, 6e3)).results ?? []).map((r) => ({
			name: r.name,
			admin: r.admin1 ?? null,
			country: r.country ?? null,
			lat: r.latitude,
			lon: r.longitude,
			label: [r.name, r.admin1].filter(Boolean).join(", ")
		}));
	} catch {
		return [];
	}
}
async function loadWeather(input) {
	const key = `${input.lat.toFixed(3)},${input.lon.toFixed(3)}`;
	const hit = g.__wxCache__.get(key);
	if (hit && Date.now() - hit.at < CACHE_MS) return sliceWeather(hit.weather, input.date);
	const days = await fetchDays(input.lat, input.lon, input.date);
	if (!days.length) return null;
	const weather = {
		place: input.place,
		lat: input.lat,
		lon: input.lon,
		source: "metno",
		days,
		selected: days[0]
	};
	g.__wxCache__.set(key, {
		at: Date.now(),
		weather
	});
	return sliceWeather(weather, input.date);
}
async function fetchDays(lat, lon, date) {
	const errors = [];
	try {
		return await fromMetNo(lat, lon);
	} catch (e) {
		errors.push(e instanceof Error ? e.message : "metno");
	}
	try {
		return await fromWttr(lat, lon);
	} catch (e) {
		errors.push(e instanceof Error ? e.message : "wttr");
	}
	try {
		return await fromOpenMeteo(lat, lon, date);
	} catch (e) {
		errors.push(e instanceof Error ? e.message : "om");
	}
	throw new Error(`Немає прогнозу (${errors.join("; ")})`);
}
function sliceWeather(weather, date) {
	const selected = weather.days.find((d) => d.date === date) ?? weather.days.find((d) => d.date >= todayISO()) ?? weather.days[0];
	return {
		...weather,
		selected
	};
}
async function backfillHousesFromSites(sql) {
	const sites = await sql.query(`select s.id, s.code, s.name, s.houses, s.capacity
       from sites s
      where not exists (select 1 from houses h where h.site_id = s.id)
      order by s.id`);
	if (!sites.length) return;
	for (const site of sites) {
		const n = Math.max(1, site.houses || 1);
		const cap = Math.max(1e3, Math.round((site.capacity || 1e4) / n));
		const houseIds = [];
		for (let i = 1; i <= n; i += 1) {
			const rows = await sql.query(`insert into houses (site_id, code, name, capacity, area_m2, sort_order)
         values ($1, $2, $3, $4, $5, $6) returning id`, [
				site.id,
				`H${i}`,
				`Пташник ${i}`,
				cap,
				Math.round(cap / 18),
				i
			]);
			houseIds.push(rows[0].id);
		}
		const newName = site.name.replace(/^Дільниця\b/, "Фабрика");
		if (newName !== site.name) await sql.query("update sites set name = $2 where id = $1", [site.id, newName]);
		await sql.query(`update flocks set house_id = $2
        where site_id = $1 and house_id is null`, [site.id, houseIds[0]]);
	}
}
/** Drop generated demo flocks/reports once so production can start empty. */
async function clearDemoOnce(sql) {
	try {
		const flag = await sql.query("select ops_reset from cost_settings where id = 1");
		if (Number(flag[0]?.ops_reset ?? 0) !== 0) return;
	} catch {
		return;
	}
	await sql.query("delete from daily_reports where submitted_by = 'seed'");
	await sql.query(`delete from flocks f
      where not exists (select 1 from daily_reports r where r.flock_id = f.id)`);
	await sql.query("update cost_settings set ops_reset = 1 where id = 1");
}
async function attachOrphanSites(sql) {
	try {
		if (!(await sql.query("select id from sites where org_id is null limit 1"))[0]) return;
	} catch {
		return;
	}
	let code = generateInviteCode();
	for (let attempt = 0; attempt < 6; attempt += 1) try {
		const orgId = (await sql.query(`insert into organizations (name, invite_code, created_by)
         values ($1, $2, $3) returning id`, [
			"Господарство",
			code,
			"seed"
		]))[0].id;
		await sql.query("update sites set org_id = $1 where org_id is null", [orgId]);
		await sql.query("update staff_profiles set org_id = $1 where org_id is null", [orgId]);
		if (!(await sql.query("select id from cost_settings where org_id = $1", [orgId]))[0]) await sql.query(`insert into cost_settings (id, org_id)
           select coalesce(max(id), 0) + 1, $1 from cost_settings`, [orgId]);
		return;
	} catch {
		code = generateInviteCode();
	}
}
async function seedIfEmpty(sql) {
	await clearDemoOnce(sql);
	await backfillHousesFromSites(sql);
	await attachOrphanSites(sql);
	try {
		await sql.query(`update staff_profiles set is_owner = true
        where user_id = (
          select user_id from staff_profiles order by created_at, user_id limit 1
        )
        and not exists (select 1 from staff_profiles where is_owner = true)`);
	} catch {}
}
var ForbiddenError = class extends Error {
	status = 403;
	constructor(message = "Недостатньо прав") {
		super(message);
		this.name = "ForbiddenError";
	}
};
var FALLBACK_COSTS = {
	feedPriceUah: 14.5,
	chickPriceUah: 18,
	liveWeightPriceUah: 62,
	otherPerBirdUah: 11.5,
	gasPerBirdUah: 4.2,
	medsPerBirdUah: 2.8,
	feedAlertPct: 8,
	waterAlertPct: 10,
	weightAlertPct: 6
};
function mapProfile(row) {
	const role = row.role;
	return {
		userId: row.user_id,
		role,
		siteId: row.site_id,
		fullName: row.full_name,
		email: row.email,
		orgId: row.org_id,
		orgName: row.org_name,
		inviteCode: hasTechAccess({
			role,
			isOwner: Boolean(row.is_owner),
			isAdmin: Boolean(row.is_admin)
		}) ? row.invite_code : null,
		isOwner: Boolean(row.is_owner),
		isAdmin: Boolean(row.is_admin),
		isDemo: Boolean(row.is_demo)
	};
}
var PROFILE_SELECT = `p.user_id, p.role, p.site_id, p.full_name, p.email, p.org_id, p.is_owner,
       coalesce(p.is_admin, false) as is_admin,
       coalesce(p.is_demo, false) as is_demo,
       o.name as org_name, o.invite_code`;
async function loadProfileRow(sql, userId) {
	return (await sql.query(`select ${PROFILE_SELECT}
       from staff_profiles p
       left join organizations o on o.id = p.org_id
      where p.user_id = $1`, [userId]))[0] ?? null;
}
async function ensureProfile(sql, userId, hint) {
	await seedIfEmpty(sql);
	let row = await loadProfileRow(sql, userId);
	if (!row) {
		const ownerRows = await sql.query("select count(*)::int as c from staff_profiles where is_owner = true");
		const demoHint = /@guest\.ptakhozvit\.com\.ua$/i.test(hint?.email ?? "");
		const isOwner = num(ownerRows[0]?.c) === 0 && !demoHint;
		try {
			await sql.query(`insert into staff_profiles (user_id, role, site_id, full_name, email, org_id, is_owner)
         values ($1, 'pending', null, $2, $3, null, $4)`, [
				userId,
				hint?.name ?? null,
				hint?.email ?? null,
				isOwner
			]);
		} catch {
			if (!isOwner) throw new Error("Не вдалося створити профіль");
			await sql.query(`insert into staff_profiles (user_id, role, site_id, full_name, email, org_id, is_owner)
         values ($1, 'pending', null, $2, $3, null, false)`, [
				userId,
				hint?.name ?? null,
				hint?.email ?? null
			]);
		}
		row = await loadProfileRow(sql, userId);
		if (!row) throw new Error("Не вдалося створити профіль");
		return mapProfile(row);
	}
	if (!row.is_owner) {
		const ownerRows = await sql.query("select count(*)::int as c from staff_profiles where is_owner = true");
		if (num(ownerRows[0]?.c) === 0) {
			await sql.query("update staff_profiles set is_owner = true where user_id = $1", [userId]);
			row = {
				...row,
				is_owner: true
			};
		}
	}
	if (row.role === "pending" && row.org_id) {
		const techCountRows = await sql.query("select count(*)::int as c from staff_profiles where org_id = $1 and role = 'technologist'", [row.org_id]);
		if (num(techCountRows[0]?.c) === 0) {
			await sql.query("update staff_profiles set role = 'technologist' where user_id = $1", [userId]);
			row = {
				...row,
				role: "technologist"
			};
		}
	}
	if (hint?.name && !row.full_name || hint?.email && !row.email) {
		await sql.query(`update staff_profiles
          set full_name = coalesce(full_name, $2),
              email = coalesce(email, $3)
        where user_id = $1`, [
			userId,
			hint?.name ?? null,
			hint?.email ?? null
		]);
		return mapProfile({
			...row,
			full_name: row.full_name ?? hint?.name ?? null,
			email: row.email ?? hint?.email ?? null
		});
	}
	return mapProfile(row);
}
function requireOrgId(profile) {
	if (!profile.orgId) throw new ForbiddenError("Введіть код запрошення свого господарства");
	return profile.orgId;
}
function assertPlatformOwner(profile) {
	if (!profile.isOwner) throw new ForbiddenError("Лише хазяїн сайту");
}
function assertPlatformAdmin(profile) {
	if (isPlatformAdmin(profile)) return;
	throw new ForbiddenError("Лише хазяїн або адміністратор системи");
}
function assertTechnologist(profile) {
	if (hasTechAccess(profile)) return;
	throw new ForbiddenError("Лише головний технолог або партнер");
}
async function resolveOrgId(sql, profile, requested) {
	if (isPlatformAdmin(profile) && requested) {
		if (!(await sql.query("select id from organizations where id = $1", [requested]))[0]) throw new ForbiddenError("Господарство не знайдено");
		return requested;
	}
	return requireOrgId(profile);
}
function assertCanAccessSite(profile, siteId) {
	if (isPlatformAdmin(profile)) return;
	if (!profile.orgId) throw new ForbiddenError("Немає доступу до цієї фабрики");
	if (seesAllFactories(profile)) return;
	if ((profile.role === "site_manager" || profile.role === "director" || profile.role === "veterinarian") && profile.siteId === siteId) return;
	throw new ForbiddenError("Немає доступу до цієї фабрики");
}
function assertCanManageFlocks(profile, siteId) {
	if (!canManageFlocks(profile)) throw new ForbiddenError("Немає права відкривати посадки чи змінювати поголівʼя");
	assertCanAccessSite(profile, siteId);
}
async function assertSiteOfOrg(sql, profile, siteId) {
	if (isPlatformAdmin(profile)) {
		if (!(await sql.query("select id from sites where id = $1", [siteId]))[0]) throw new ForbiddenError("Немає доступу до цієї фабрики");
		return;
	}
	if (!(await visibleSiteIds(sql, profile)).includes(siteId)) throw new ForbiddenError("Немає доступу до цієї фабрики");
	assertCanAccessSite(profile, siteId);
}
async function loadSites(sql, orgId) {
	if (!orgId) return [];
	return loadSitesWhere(sql, "s.org_id = $1", [orgId]);
}
async function loadSiteById(sql, siteId) {
	return (await loadSitesWhere(sql, "s.id = $1", [siteId]))[0] ?? null;
}
async function loadSitesWhere(sql, where, params) {
	return (await sql.query(`select s.id, s.org_id, s.code, s.name, s.location, s.sort_order,
            s.geo_name, s.geo_admin, s.lat, s.lon,
            coalesce(h.n, s.houses)::int as houses,
            coalesce(h.cap, s.capacity)::int as capacity
       from sites s
       left join (
         select site_id, count(*)::int as n, coalesce(sum(capacity),0)::int as cap
           from houses group by site_id
       ) h on h.site_id = s.id
      where ${where}
      order by s.sort_order, s.id`, params)).map((r) => ({
		id: r.id,
		orgId: r.org_id,
		code: r.code,
		name: r.name,
		location: r.location,
		houses: r.houses,
		capacity: r.capacity,
		sortOrder: r.sort_order,
		geoName: r.geo_name,
		geoAdmin: r.geo_admin,
		lat: r.lat == null ? null : num(r.lat),
		lon: r.lon == null ? null : num(r.lon)
	}));
}
async function loadHouses(sql, siteIds) {
	if (siteIds && siteIds.length === 0) return [];
	const filter = siteIds?.length ? `where site_id in (${siteIds.map((_, i) => `$${i + 1}`).join(", ")})` : "";
	return (await sql.query(`select id, site_id, code, name, capacity, area_m2, sort_order from houses ${filter} order by site_id, sort_order, id`, siteIds ?? [])).map((r) => ({
		id: r.id,
		siteId: r.site_id,
		code: r.code,
		name: r.name,
		capacity: r.capacity,
		areaM2: num(r.area_m2),
		sortOrder: r.sort_order
	}));
}
async function loadHouseById(sql, houseId) {
	const r = (await sql.query("select id, site_id, code, name, capacity, area_m2, sort_order from houses where id = $1", [houseId]))[0];
	if (!r) return null;
	return {
		id: r.id,
		siteId: r.site_id,
		code: r.code,
		name: r.name,
		capacity: r.capacity,
		areaM2: num(r.area_m2),
		sortOrder: r.sort_order
	};
}
async function ensureCostSettings(sql, orgId) {
	if ((await sql.query("select id from cost_settings where org_id = $1", [orgId]))[0]) return;
	await sql.query(`insert into cost_settings (id, org_id)
     select coalesce(max(id), 0) + 1, $1 from cost_settings`, [orgId]);
}
async function loadCostSettings(sql, orgId) {
	if (!orgId) return FALLBACK_COSTS;
	try {
		await ensureCostSettings(sql, orgId);
		const r = (await sql.query(`select feed_price_uah, chick_price_uah, live_weight_price_uah, other_per_bird_uah,
              gas_per_bird_uah, meds_per_bird_uah,
              feed_alert_pct, water_alert_pct, weight_alert_pct
         from cost_settings where org_id = $1`, [orgId]))[0];
		return {
			feedPriceUah: num(r?.feed_price_uah ?? FALLBACK_COSTS.feedPriceUah),
			chickPriceUah: num(r?.chick_price_uah ?? FALLBACK_COSTS.chickPriceUah),
			liveWeightPriceUah: num(r?.live_weight_price_uah ?? FALLBACK_COSTS.liveWeightPriceUah),
			otherPerBirdUah: num(r?.other_per_bird_uah ?? FALLBACK_COSTS.otherPerBirdUah),
			gasPerBirdUah: num(r?.gas_per_bird_uah ?? FALLBACK_COSTS.gasPerBirdUah),
			medsPerBirdUah: num(r?.meds_per_bird_uah ?? FALLBACK_COSTS.medsPerBirdUah),
			feedAlertPct: num(r?.feed_alert_pct ?? FALLBACK_COSTS.feedAlertPct) || FALLBACK_COSTS.feedAlertPct,
			waterAlertPct: num(r?.water_alert_pct ?? FALLBACK_COSTS.waterAlertPct) || FALLBACK_COSTS.waterAlertPct,
			weightAlertPct: num(r?.weight_alert_pct ?? FALLBACK_COSTS.weightAlertPct) || FALLBACK_COSTS.weightAlertPct
		};
	} catch {
		return FALLBACK_COSTS;
	}
}
async function visibleSiteIds(sql, profile) {
	if (!profile.orgId) return [];
	const sites = await loadSites(sql, profile.orgId);
	if (seesAllFactories(profile)) return sites.map((s) => s.id);
	if (profile.siteId && (profile.role === "site_manager" || profile.role === "director" || profile.role === "veterinarian") && sites.some((s) => s.id === profile.siteId)) return [profile.siteId];
	return [];
}
async function insertOrganization(sql, userId, name) {
	const trimmed = name.trim();
	if (trimmed.length < 2) throw new Error("Вкажіть назву господарства");
	if (trimmed.length > 80) throw new Error("Назва задовга");
	let inviteCode = generateInviteCode();
	let lastError;
	for (let attempt = 0; attempt < 8; attempt += 1) try {
		const orgId = (await sql.query(`insert into organizations (name, invite_code, created_by)
         values ($1, $2, $3) returning id`, [
			trimmed,
			inviteCode,
			userId
		]))[0].id;
		await ensureCostSettings(sql, orgId);
		return {
			orgId,
			inviteCode
		};
	} catch (err) {
		lastError = err;
		inviteCode = generateInviteCode();
	}
	throw lastError instanceof Error ? lastError : /* @__PURE__ */ new Error("Не вдалося створити господарство");
}
async function insertFactory(sql, orgId, data) {
	const name = data.name.trim();
	if (name.length < 2) throw new Error("Вкажіть назву фабрики");
	const houseCount = Math.min(24, Math.max(1, Math.round(data.houseCount)));
	const cap = Math.min(2e5, Math.max(500, Math.round(data.capacity)));
	let n = ((await sql.query("select coalesce(max(sort_order), 0)::int as c from sites where org_id = $1", [orgId]))[0]?.c ?? 0) + 1;
	let code = `F${n}`;
	for (let attempt = 0; attempt < 20; attempt += 1) {
		if (!(await sql.query("select id from sites where org_id = $1 and code = $2", [orgId, code]))[0]) break;
		n += 1;
		code = `F${n}`;
	}
	const siteId = (await sql.query(`insert into sites (org_id, code, name, location, houses, capacity, sort_order)
     values ($1, $2, $3, $4, $5, $6, $7) returning id`, [
		orgId,
		code,
		name,
		(data.location ?? "").trim(),
		houseCount,
		cap * houseCount,
		n
	]))[0].id;
	for (let i = 1; i <= houseCount; i += 1) await sql.query(`insert into houses (site_id, code, name, capacity, area_m2, sort_order)
       values ($1, $2, $3, $4, $5, $6)`, [
		siteId,
		`H${i}`,
		`Пташник ${i}`,
		cap,
		Math.round(cap / 18),
		i
	]);
	return {
		siteId,
		code
	};
}
async function loadAudience(sql, orgId, includeAllPlatform = false) {
	if (includeAllPlatform) return sql.query(`select user_id, role, site_id,
              coalesce(is_owner, false) as is_owner,
              coalesce(is_admin, false) as is_admin
         from staff_profiles
        where is_owner = true
           or is_admin = true
           or (org_id = $1 and role in ('technologist', 'partner', 'director', 'veterinarian', 'site_manager'))`, [orgId]);
	return sql.query(`select user_id, role, site_id,
            coalesce(is_owner, false) as is_owner,
            coalesce(is_admin, false) as is_admin
       from staff_profiles
      where (org_id = $1 and role in ('technologist', 'partner', 'director', 'veterinarian', 'site_manager'))
         or ((is_owner = true or is_admin = true) and org_id = $1)`, [orgId]);
}
async function fanOut(sql, opts) {
	const seen = /* @__PURE__ */ new Set();
	for (const userId of opts.recipients) {
		if (!userId || seen.has(userId)) continue;
		if (!opts.includeActor && userId === opts.actorUserId) continue;
		seen.add(userId);
		await sql.query(`insert into notifications
         (org_id, user_id, kind, title, body, href, actor_user_id)
       values ($1,$2,$3,$4,$5,$6,$7)`, [
			opts.orgId,
			userId,
			opts.kind,
			opts.title,
			opts.body,
			opts.href,
			opts.actorUserId
		]);
	}
}
function actorName$1(actor) {
	return actor.fullName?.trim() || actor.email || "Користувач";
}
async function notifyNewReport(sql, opts) {
	const recipients = (await loadAudience(sql, opts.orgId)).filter((row) => {
		if (row.is_owner || row.is_admin) return true;
		if (row.role === "technologist" || row.role === "partner") return true;
		if (row.role === "director" || row.role === "veterinarian") return !row.site_id || row.site_id === opts.siteId;
		if (row.role === "site_manager") return row.site_id === opts.siteId;
		return false;
	}).map((row) => row.user_id);
	await fanOut(sql, {
		orgId: opts.orgId,
		actorUserId: opts.actor.userId,
		recipients,
		kind: "report",
		title: "Новий щоденний звіт",
		body: `${actorName$1(opts.actor)} · ${opts.siteName}, ${opts.houseName} · ${opts.reportDate}`,
		href: `/houses/${opts.houseId}`
	});
}
async function notifyJoinRequest(sql, opts) {
	const recipients = (await loadAudience(sql, opts.orgId, true)).filter((row) => row.is_owner || row.is_admin || row.role === "technologist" || row.role === "partner" || row.role === "director").map((row) => row.user_id);
	await fanOut(sql, {
		orgId: opts.orgId,
		actorUserId: opts.actor.userId,
		recipients,
		kind: "join",
		title: "Запит у господарство",
		body: `${actorName$1(opts.actor)} хоче увійти в «${opts.orgName}». Призначте роль.`,
		href: `/team?org=${opts.orgId}`
	});
}
async function notifyDensity(sql, opts) {
	const recipients = (await loadAudience(sql, opts.orgId)).filter((row) => {
		if (row.is_owner || row.is_admin) return true;
		if (row.role === "technologist" || row.role === "partner") return true;
		if (row.role === "director" || row.role === "veterinarian") return !row.site_id || row.site_id === opts.siteId;
		if (row.role === "site_manager") return row.site_id === opts.siteId;
		return false;
	}).map((row) => row.user_id);
	const d = opts.density;
	const href = `/houses/${opts.houseId}`;
	if ((await sql.query(`select id from notifications
      where org_id = $1 and kind = 'density' and href = $2
        and created_at > now() - interval '2 days'
        and read = false
      limit 1`, [opts.orgId, href]))[0]) return;
	await fanOut(sql, {
		orgId: opts.orgId,
		actorUserId: "",
		includeActor: true,
		recipients,
		kind: "density",
		title: d.reached ? `Ліміт ${d.limitKgM2} кг/м² — ${opts.houseName}` : `За ${d.daysToLimit} діб — ${d.limitKgM2} кг/м² · ${opts.houseName}`,
		body: d.reached ? `${opts.siteName}, ${opts.houseName}: зараз ${d.kgM2} кг/м².` : `${opts.siteName}, ${opts.houseName}: зараз ${d.kgM2} кг/м². ${d.limitKgM2} кг/м² на ${d.reachAgeDays} добу (${d.reachDate}).`,
		href
	});
}
async function notifyHandbookQuestion(sql, opts) {
	const recipients = (await loadAudience(sql, opts.orgId)).filter((row) => row.is_owner || row.is_admin || row.role === "technologist" || row.role === "partner").map((row) => row.user_id);
	await fanOut(sql, {
		orgId: opts.orgId,
		actorUserId: opts.actor.userId,
		recipients,
		kind: "handbook",
		title: "Питання в довідник",
		body: `${actorName$1(opts.actor)}: ${opts.question.slice(0, 160)}`,
		href: "/guide"
	});
}
function actorName(actor) {
	return actor.fullName?.trim() || actor.email || staffLabel(actor);
}
async function writeJournal(sql, event) {
	if (!event.orgId) return;
	try {
		await sql.query(`insert into journal_events
         (org_id, site_id, actor_user_id, actor_name, actor_role, action, entity, summary, href)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
			event.orgId,
			event.siteId ?? null,
			event.actor.userId,
			actorName(event.actor),
			event.actor.isOwner ? "owner" : event.actor.isAdmin ? "sysadmin" : event.actor.role,
			event.action,
			event.entity,
			event.summary,
			event.href ?? null
		]);
	} catch (err) {
		console.error("[journal]", err);
	}
}
async function ensureRecycleTables(sql) {
	await sql.query(`
    create table if not exists recycle_flocks (
      id integer primary key,
      site_id integer not null,
      house_id integer not null,
      code text not null default '',
      breed text not null default '',
      placed_at date,
      chicks_placed integer,
      status text,
      payload jsonb not null,
      deleted_at timestamptz not null default now(),
      deleted_by text
    )`);
	await sql.query(`
    create table if not exists recycle_reports (
      id integer primary key,
      flock_id integer not null,
      house_id integer,
      report_date date,
      payload jsonb not null,
      deleted_at timestamptz not null default now(),
      deleted_by text
    )`);
}
async function bumpSerial(sql, table) {
	const q = table === "flocks" ? `select setval(pg_get_serial_sequence('flocks', 'id'), greatest(coalesce((select max(id) from flocks), 1), 1), true)` : `select setval(pg_get_serial_sequence('daily_reports', 'id'), greatest(coalesce((select max(id) from daily_reports), 1), 1), true)`;
	try {
		await sql.query(q);
	} catch {}
}
async function archiveFlock(sql, flockId, userId) {
	await ensureRecycleTables(sql);
	const flocks = await sql.query("select id, site_id, house_id, code, breed, placed_at, chicks_placed, status from flocks where id = $1", [flockId]);
	if (!flocks[0]) throw new Error("Посадку не знайдено");
	const f = flocks[0];
	await sql.query(`insert into recycle_reports (id, flock_id, house_id, report_date, payload, deleted_by)
     select r.id, r.flock_id, $2, r.report_date, to_jsonb(r), $3
       from daily_reports r
      where r.flock_id = $1
     on conflict (id) do update
        set payload = excluded.payload,
            flock_id = excluded.flock_id,
            house_id = excluded.house_id,
            report_date = excluded.report_date,
            deleted_at = now(),
            deleted_by = excluded.deleted_by`, [
		flockId,
		f.house_id,
		userId
	]);
	await sql.query(`insert into recycle_flocks (
        id, site_id, house_id, code, breed, placed_at, chicks_placed, status, payload, deleted_by
     )
     select id, site_id, house_id, code, breed, placed_at, chicks_placed, status, to_jsonb(flocks), $2
       from flocks where id = $1
     on conflict (id) do update
        set payload = excluded.payload,
            site_id = excluded.site_id,
            house_id = excluded.house_id,
            code = excluded.code,
            breed = excluded.breed,
            placed_at = excluded.placed_at,
            chicks_placed = excluded.chicks_placed,
            status = excluded.status,
            deleted_at = now(),
            deleted_by = excluded.deleted_by`, [flockId, userId]);
	await sql.query("delete from daily_reports where flock_id = $1", [flockId]);
	await sql.query("delete from flocks where id = $1", [flockId]);
	return {
		code: f.code,
		siteId: f.site_id
	};
}
async function archiveReport(sql, reportId, userId) {
	await ensureRecycleTables(sql);
	const rows = await sql.query(`select f.site_id, r.flock_id, f.house_id, r.report_date
       from daily_reports r
       join flocks f on f.id = r.flock_id
      where r.id = $1`, [reportId]);
	if (!rows[0]) throw new Error("Звіт не знайдено");
	await sql.query(`insert into recycle_reports (id, flock_id, house_id, report_date, payload, deleted_by)
     select r.id, r.flock_id, $2, r.report_date, to_jsonb(r), $3
       from daily_reports r where r.id = $1
     on conflict (id) do update
        set payload = excluded.payload,
            flock_id = excluded.flock_id,
            house_id = excluded.house_id,
            report_date = excluded.report_date,
            deleted_at = now(),
            deleted_by = excluded.deleted_by`, [
		reportId,
		rows[0].house_id,
		userId
	]);
	await sql.query("delete from daily_reports where id = $1", [reportId]);
	return {
		siteId: rows[0].site_id,
		flockId: rows[0].flock_id,
		reportDate: String(rows[0].report_date).slice(0, 10)
	};
}
async function archiveOrgFlocks(sql, orgId, userId) {
	await ensureRecycleTables(sql);
	const flocks = await sql.query(`select id from flocks where site_id in (select id from sites where org_id = $1)`, [orgId]);
	for (const f of flocks) await archiveFlock(sql, f.id, userId);
	return flocks.length;
}
async function restoreFlockRow(sql, flockId) {
	await ensureRecycleTables(sql);
	const rows = await sql.query("select site_id, house_id, code, status, payload from recycle_flocks where id = $1", [flockId]);
	if (!rows[0]) throw new Error("У кошику цієї посадки немає");
	if ((await sql.query("select id from flocks where id = $1", [flockId]))[0]) throw new Error("Ця посадка вже є в пташнику");
	await sql.query(`insert into flocks
     select x.*
       from recycle_flocks rf,
            jsonb_populate_record(null::flocks, rf.payload) as x
      where rf.id = $1`, [flockId]);
	const other = await sql.query(`select id from flocks where house_id = $1 and status = 'active' and id <> $2 limit 1`, [rows[0].house_id, flockId]);
	let status = rows[0].status === "closed" ? "closed" : "active";
	if (other[0]) {
		status = "closed";
		await sql.query(`update flocks
          set status = 'closed',
              closed_at = coalesce(closed_at, current_date)
        where id = $1`, [flockId]);
	}
	await sql.query(`insert into daily_reports
     select x.*
       from recycle_reports rr,
            jsonb_populate_record(null::daily_reports, rr.payload) as x
      where rr.flock_id = $1
        and not exists (select 1 from daily_reports d where d.id = rr.id)
        and not exists (
          select 1 from daily_reports d
           where d.flock_id = rr.flock_id and d.report_date = rr.report_date
        )`, [flockId]);
	await sql.query("delete from recycle_reports where flock_id = $1", [flockId]);
	await sql.query("delete from recycle_flocks where id = $1", [flockId]);
	await bumpSerial(sql, "flocks");
	await bumpSerial(sql, "daily_reports");
	return {
		houseId: rows[0].house_id,
		code: rows[0].code,
		siteId: rows[0].site_id,
		status
	};
}
async function restoreReportRow(sql, reportId) {
	await ensureRecycleTables(sql);
	const rows = await sql.query("select flock_id, house_id, report_date, payload from recycle_reports where id = $1", [reportId]);
	if (!rows[0]) throw new Error("У кошику цього звіту немає");
	const flock = await sql.query("select id, site_id, house_id from flocks where id = $1", [rows[0].flock_id]);
	if (!flock[0]) throw new Error("Спочатку поверніть посадку — звіт лежить разом із нею в кошику");
	if ((await sql.query(`select id from daily_reports where flock_id = $1 and report_date = $2`, [rows[0].flock_id, rows[0].report_date]))[0]) throw new Error(`На ${String(rows[0].report_date).slice(0, 10)} уже є звіт. Видаліть або змініть його, тоді повертайте з кошика.`);
	await sql.query(`insert into daily_reports
     select x.*
       from recycle_reports rr,
            jsonb_populate_record(null::daily_reports, rr.payload) as x
      where rr.id = $1
        and not exists (select 1 from daily_reports d where d.id = rr.id)`, [reportId]);
	await sql.query("delete from recycle_reports where id = $1", [reportId]);
	await bumpSerial(sql, "daily_reports");
	return {
		houseId: flock[0].house_id,
		flockId: flock[0].id,
		reportDate: String(rows[0].report_date ?? "").slice(0, 10),
		siteId: flock[0].site_id
	};
}
async function listRecycleBin(sql, siteIds) {
	if (!siteIds.length) return {
		flocks: [],
		reports: []
	};
	await ensureRecycleTables(sql);
	const ph = siteIds.map((_, i) => `$${i + 1}`).join(", ");
	const flocks = await sql.query(`select f.id, f.code, f.breed, f.placed_at, f.chicks_placed, f.status, f.deleted_at,
            h.id as house_id, h.name as house_name, s.id as site_id, s.name as site_name,
            (select count(*)::int from recycle_reports r where r.flock_id = f.id) as reports
       from recycle_flocks f
       join houses h on h.id = f.house_id
       join sites s on s.id = f.site_id
      where s.id in (${ph})
      order by f.deleted_at desc`, siteIds);
	const reports = await sql.query(`select r.id, r.report_date, r.payload, r.deleted_at,
            fl.id as flock_id, fl.code as flock_code, h.id as house_id, h.name as house_name, s.name as site_name
       from recycle_reports r
       join flocks fl on fl.id = r.flock_id
       join houses h on h.id = fl.house_id
       join sites s on s.id = fl.site_id
      where s.id in (${ph})
        and not exists (select 1 from recycle_flocks rf where rf.id = r.flock_id)
      order by r.deleted_at desc`, siteIds);
	return {
		flocks: flocks.map((f) => ({
			id: f.id,
			code: f.code,
			breed: f.breed,
			placedAt: f.placed_at ? String(f.placed_at).slice(0, 10) : "",
			chicksPlaced: Number(f.chicks_placed ?? 0),
			status: f.status ?? "active",
			deletedAt: String(f.deleted_at),
			houseId: f.house_id,
			houseName: f.house_name,
			siteId: f.site_id,
			siteName: f.site_name,
			reportCount: Number(f.reports)
		})),
		reports: reports.map((r) => {
			const payload = r.payload && typeof r.payload === "object" ? r.payload : {};
			return {
				id: r.id,
				reportDate: r.report_date ? String(r.report_date).slice(0, 10) : "",
				ageDays: Number(payload.age_days ?? 0),
				avgWeightG: Number(payload.avg_weight_g ?? 0),
				feedKg: Number(payload.feed_kg ?? 0),
				deletedAt: String(r.deleted_at),
				flockId: r.flock_id,
				flockCode: r.flock_code,
				houseId: r.house_id,
				houseName: r.house_name,
				siteName: r.site_name
			};
		})
	};
}
async function ensureTreatmentTables(sql) {
	await sql.query(`
    create table if not exists org_treatment_calendars (
      org_id integer primary key,
      payload jsonb not null default '[]',
      updated_at timestamptz not null default now(),
      updated_by text
    )`);
	await sql.query(`
    create table if not exists flock_treatment_calendars (
      flock_id integer primary key,
      payload jsonb not null default '[]',
      updated_at timestamptz not null default now(),
      updated_by text
    )`);
}
async function loadOrgTreatmentCalendar(sql, orgId) {
	await ensureTreatmentTables(sql);
	const rows = await sql.query("select payload from org_treatment_calendars where org_id = $1", [orgId]);
	return parseTreatmentCalendar(rows[0]?.payload) ?? defaultTreatmentCalendar();
}
async function saveOrgTreatmentCalendar(sql, orgId, items, userId) {
	await ensureTreatmentTables(sql);
	const parsed = parseTreatmentCalendar(items) ?? [];
	await sql.query(`insert into org_treatment_calendars (org_id, payload, updated_at, updated_by)
     values ($1, $2::jsonb, now(), $3)
     on conflict (org_id) do update set payload = excluded.payload, updated_at = now(), updated_by = excluded.updated_by`, [
		orgId,
		JSON.stringify(parsed),
		userId
	]);
	return parsed;
}
async function loadFlockTreatmentCalendar(sql, flockId, orgId) {
	await ensureTreatmentTables(sql);
	const rows = await sql.query("select payload from flock_treatment_calendars where flock_id = $1", [flockId]);
	const own = parseTreatmentCalendar(rows[0]?.payload);
	if (own) return own;
	const org = await loadOrgTreatmentCalendar(sql, orgId);
	return calendarFromTemplate(org);
}
async function saveFlockTreatmentCalendar(sql, flockId, items, userId) {
	await ensureTreatmentTables(sql);
	const parsed = parseTreatmentCalendar(items) ?? [];
	await sql.query(`insert into flock_treatment_calendars (flock_id, payload, updated_at, updated_by)
     values ($1, $2::jsonb, now(), $3)
     on conflict (flock_id) do update set payload = excluded.payload, updated_at = now(), updated_by = excluded.updated_by`, [
		flockId,
		JSON.stringify(parsed),
		userId
	]);
	return parsed;
}
async function copyOrgCalendarToFlock(sql, flockId, orgId, userId) {
	const org = await loadOrgTreatmentCalendar(sql, orgId);
	await saveFlockTreatmentCalendar(sql, flockId, calendarFromTemplate(org), userId);
}
function mapNorms(r) {
	return {
		humidityPlaceMin: num(r.humidity_place_min),
		humidityPlaceMax: num(r.humidity_place_max),
		humidityEarlyUntil: Number(r.humidity_early_until),
		humidityEarlyMin: num(r.humidity_early_min),
		humidityEarlyMax: num(r.humidity_early_max),
		humidityLateMin: num(r.humidity_late_min),
		humidityLateMax: num(r.humidity_late_max),
		densityLimitKgM2: num(r.density_limit_kg_m2),
		densityWarnDays: Number(r.density_warn_days)
	};
}
async function ensureOrgNorms(sql, orgId) {
	const existing = await sql.query("select * from org_norms where org_id = $1", [orgId]);
	if (existing[0]) return mapNorms(existing[0]);
	await sql.query("insert into org_norms (org_id) values ($1)", [orgId]);
	return { ...DEFAULT_NORMS };
}
async function saveOrgNorms(sql, orgId, norms, userId) {
	await sql.query(`insert into org_norms (
       org_id, humidity_place_min, humidity_place_max, humidity_early_until,
       humidity_early_min, humidity_early_max, humidity_late_min, humidity_late_max,
       density_limit_kg_m2, density_warn_days, updated_at, updated_by
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),$11)
     on conflict (org_id) do update set
       humidity_place_min = excluded.humidity_place_min,
       humidity_place_max = excluded.humidity_place_max,
       humidity_early_until = excluded.humidity_early_until,
       humidity_early_min = excluded.humidity_early_min,
       humidity_early_max = excluded.humidity_early_max,
       humidity_late_min = excluded.humidity_late_min,
       humidity_late_max = excluded.humidity_late_max,
       density_limit_kg_m2 = excluded.density_limit_kg_m2,
       density_warn_days = excluded.density_warn_days,
       updated_at = now(),
       updated_by = excluded.updated_by`, [
		orgId,
		norms.humidityPlaceMin,
		norms.humidityPlaceMax,
		norms.humidityEarlyUntil,
		norms.humidityEarlyMin,
		norms.humidityEarlyMax,
		norms.humidityLateMin,
		norms.humidityLateMax,
		norms.densityLimitKgM2,
		norms.densityWarnDays,
		userId
	]);
	return norms;
}
async function seedHandbook(sql, orgId) {
	for (const a of SEED_ARTICLES) await sql.query(`insert into handbook_articles
         (org_id, slug, category, question, answer_tech, answer_vet, sort_order, status, priority)
       values ($1,$2,$3,$4,$5,$6,$7,'published',$8)
       on conflict (org_id, slug) do nothing`, [
		orgId,
		a.slug,
		a.category,
		a.question,
		a.answerTech,
		a.answerVet,
		a.sortOrder,
		Boolean(a.priority)
	]);
	const already = await sql.query("select count(*) as n from handbook_articles where org_id = $1 and priority = true", [orgId]);
	if (Number(already[0]?.n ?? 0) === 0) {
		const slugs = SEED_ARTICLES.filter((a) => a.priority).map((a) => a.slug);
		if (slugs.length) {
			const ph = slugs.map((_, i) => `$${i + 2}`).join(", ");
			await sql.query(`update handbook_articles set priority = true where org_id = $1 and slug in (${ph})`, [orgId, ...slugs]);
		}
	}
}
function mapArticle(r) {
	return {
		id: r.id,
		slug: r.slug,
		category: r.category,
		question: r.question,
		answerTech: r.answer_tech,
		answerVet: r.answer_vet,
		sortOrder: r.sort_order,
		status: r.status === "question" ? "question" : "published",
		hidden: Boolean(r.hidden),
		priority: Boolean(r.priority),
		askedBy: r.asked_by
	};
}
async function loadHandbook(sql, orgId, includeHidden) {
	await seedHandbook(sql, orgId);
	return (await sql.query(`select id, slug, category, question, answer_tech, answer_vet, sort_order, status, hidden, asked_by, priority
       from handbook_articles
      where org_id = $1
        ${includeHidden ? "" : "and hidden = false"}
      order by case when status = 'question' then 0 else 1 end, priority desc, sort_order, id`, [orgId])).map(mapArticle);
}
var DEMO_ORG_NAME = "Демо · ПтахоЗвіт";
var DEMO_INVITE = "DEM7KX";
function jitter(seed) {
	const x = Math.sin(seed * 12.9898) * 43758.5453;
	return x - Math.floor(x);
}
function asIsoDate(value) {
	if (typeof value === "string") {
		const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
		return match ? match[1] : "";
	}
	if (value instanceof Date && Number.isFinite(value.getTime())) {
		if (value.getUTCHours() === 0 && value.getUTCMinutes() === 0 && value.getUTCSeconds() === 0) return value.toISOString().slice(0, 10);
		return new Intl.DateTimeFormat("en-CA", {
			timeZone: "Europe/Kyiv",
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).format(value);
	}
	return "";
}
async function ensureDemoOrg(sql) {
	const existing = await sql.query("select id from organizations where is_demo = true order by id limit 1");
	if (existing[0]) {
		await refreshDemoIfStale(sql, existing[0].id);
		return {
			orgId: existing[0].id,
			created: false
		};
	}
	const orgId = (await sql.query(`insert into organizations (name, invite_code, created_by, is_demo)
     values ($1, $2, 'demo-seed', true)
     returning id`, [DEMO_ORG_NAME, DEMO_INVITE]))[0].id;
	if (!(await sql.query("select id from cost_settings where org_id = $1", [orgId]))[0]) await sql.query(`insert into cost_settings (id, org_id)
       select coalesce(max(id), 0) + 1, $1 from cost_settings`, [orgId]);
	await fillDemoProduction(sql, orgId);
	return {
		orgId,
		created: true
	};
}
async function refreshDemoIfStale(sql, orgId) {
	await sql.query(`update flocks set breed = 'Hubbard Flex'
      where breed in ('Hubbard', 'hubbard')
        and site_id in (select id from sites where org_id = $1)`, [orgId]);
	const due = addDaysISO(todayISO(), -1);
	const stats = await sql.query(`select
       (select count(*)::int from flocks f join sites s on s.id = f.site_id
         where s.org_id = $1 and f.status = 'active') as flocks,
       (select max(d.report_date) from daily_reports d
          join flocks f on f.id = d.flock_id
          join sites s on s.id = f.site_id
         where s.org_id = $1) as last,
       (select min(f.placed_at) from flocks f join sites s on s.id = f.site_id
         where s.org_id = $1 and f.status = 'active') as oldest`, [orgId]);
	const flocks = Number(stats[0]?.flocks ?? 0);
	const last = asIsoDate(stats[0]?.last);
	const oldest = asIsoDate(stats[0]?.oldest);
	const agedOut = oldest ? diffDays(oldest, due) > 45 : false;
	if (flocks >= 4 && last === due && !agedOut) return;
	if (flocks >= 1 && last && last < due && !agedOut) {
		await topUpDemoReports(sql, orgId, due);
		return;
	}
	await wipeDemoProduction(sql, orgId);
	await fillDemoProduction(sql, orgId);
}
async function wipeDemoProduction(sql, orgId) {
	await sql.query(`delete from daily_reports
      where flock_id in (
        select f.id from flocks f join sites s on s.id = f.site_id where s.org_id = $1
      )`, [orgId]);
	await sql.query(`delete from flocks where site_id in (select id from sites where org_id = $1)`, [orgId]);
}
async function resetDemoOrg(sql) {
	const { orgId } = await ensureDemoOrg(sql);
	await wipeDemoProduction(sql, orgId);
	await fillDemoProduction(sql, orgId);
	return orgId;
}
async function topUpDemoReports(sql, orgId, due) {
	const flocks = await sql.query(`select f.id, f.breed, f.placed_at, f.house_id, f.chicks_placed
       from flocks f
       join sites s on s.id = f.site_id
      where s.org_id = $1 and f.status = 'active'`, [orgId]);
	for (const flock of flocks) {
		const placedAt = asIsoDate(flock.placed_at);
		const last = await sql.query(`select report_date, head_end, dropping_look, litter_state
         from daily_reports where flock_id = $1
         order by report_date desc limit 1`, [flock.id]);
		let cursor = last[0] ? addDaysISO(asIsoDate(last[0].report_date), 1) : placedAt;
		let head = last[0] ? Number(last[0].head_end) : Number(flock.chicks_placed);
		const look = last[0]?.dropping_look || "normal";
		const litter = last[0]?.litter_state || "dry";
		const houseIndex = flocks.indexOf(flock) % 4;
		while (cursor && cursor <= due) {
			const day = diffDays(placedAt, cursor);
			if (day < 0 || day > 49) break;
			head = await insertDemoReport(sql, {
				flockId: flock.id,
				houseId: flock.house_id,
				breed: flock.breed,
				date: cursor,
				day,
				headStart: head,
				look,
				litter,
				note: "",
				houseIndex
			});
			cursor = addDaysISO(cursor, 1);
		}
	}
}
async function insertDemoReport(sql, args) {
	const std = getStandard(args.day, args.breed);
	const j = jitter(args.houseId * 100 + args.day);
	const mort = args.day === 0 ? 0 : Math.max(0, Math.round(3 + j * 4 + args.day * .08));
	const culled = args.day > 0 && args.day % 9 === 0 ? 2 : 0;
	const head = Math.max(0, args.headStart - mort - culled);
	const weight = Math.max(40, Math.round(std.weightG * (.97 + args.houseIndex * .008 + (j - .5) * .03)));
	const feedKg = round(std.feedGPerBird * args.headStart * (1.01 + (j - .5) * .04) / 1e3, 1);
	const waterL = round(std.waterMlPerBird * args.headStart * (1.02 + (j - .5) * .05) / 1e3, 1);
	const tMin = round(std.tempMin + (j - .4), 1);
	const tMax = round(std.tempMax + (j - .5) * 1.2, 1);
	const hum = Math.round(58 + (j - .5) * 10);
	await sql.query(`insert into daily_reports (
       flock_id, report_date, age_days, head_start, mortality, culled, head_end,
       avg_weight_g, feed_kg, water_l, temp_min, temp_max, humidity_pct,
       dropping_look, litter_state, notes, submitted_by, sold_head, sold_weight_kg
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'demo-seed',0,0)`, [
		args.flockId,
		args.date,
		args.day,
		args.headStart,
		mort,
		culled,
		head,
		weight,
		feedKg,
		waterL,
		tMin,
		tMax,
		hum,
		args.look,
		args.litter,
		args.note
	]);
	return head;
}
async function fillDemoProduction(sql, orgId) {
	let sites = await sql.query("select id from sites where org_id = $1 order by id", [orgId]);
	if (!sites[0]) {
		await insertFactory(sql, orgId, {
			name: "Фабрика Весняна",
			location: "Вінницька область",
			houseCount: 4,
			capacity: 18e3
		});
		await sql.query(`update sites set geo_name = 'Вінниця', geo_admin = 'Вінницька область', lat = 49.2331, lon = 28.4682
        where org_id = $1`, [orgId]);
		sites = await sql.query("select id from sites where org_id = $1 order by id", [orgId]);
	}
	const siteId = sites[0].id;
	const houses = await sql.query("select id, code, name, coalesce(area_m2, 1000) as area_m2 from houses where site_id = $1 order by sort_order, id", [siteId]);
	if (houses.length < 4) return;
	const today = todayISO();
	const due = addDaysISO(today, -1);
	const specs = [
		{
			breed: "Ross 308",
			age: 18,
			chicks: 17540,
			look: "normal",
			litter: "dry",
			meds: false
		},
		{
			breed: "Ross 308",
			age: 27,
			chicks: 17820,
			look: "soft",
			litter: "moist",
			meds: true
		},
		{
			breed: "Cobb 500",
			age: 11,
			chicks: 17200,
			look: "normal",
			litter: "dry",
			meds: false
		},
		{
			breed: "Hubbard Flex",
			age: 33,
			chicks: 18e3,
			look: "loose",
			litter: "caked",
			meds: false
		}
	];
	for (let i = 0; i < 4; i += 1) {
		const house = houses[i];
		const spec = specs[i];
		const info = breedByName(spec.breed);
		const placedAt = addDaysISO(today, -spec.age);
		const code = `Д-${placedAt.slice(2, 7).replace("-", "")}-F1${house.code}`;
		const flockId = (await sql.query(`insert into flocks (site_id, house_id, code, breed, placed_at, chicks_placed, chick_cost_uah, target_days, target_weight_g, status)
       values ($1,$2,$3,$4,$5,$6,18,$7,$8,'active') returning id`, [
			siteId,
			house.id,
			code,
			spec.breed,
			placedAt,
			spec.chicks,
			info.targetDays,
			info.targetWeightG
		]))[0].id;
		let head = spec.chicks;
		for (let day = 0; day <= spec.age; day += 1) {
			const date = addDaysISO(placedAt, day);
			if (date > due) break;
			const look = day > spec.age - 3 ? spec.look : "normal";
			const litter = day > spec.age - 4 ? spec.litter : "dry";
			const note = day === spec.age && spec.meds ? "На випоюванні енрофлоксацин 3-тя доба курсу." : "";
			const before = head;
			head = await insertDemoReport(sql, {
				flockId,
				houseId: house.id,
				breed: spec.breed,
				date,
				day,
				headStart: before,
				look,
				litter,
				note,
				houseIndex: i
			});
			if (spec.meds && day >= spec.age - 4 && day <= spec.age) {
				const rec = await sql.query(`select id from daily_reports where flock_id = $1 and report_date = $2`, [flockId, date]);
				if (rec[0]) await sql.query(`insert into daily_report_meds (report_id, prep_id, group_id, name, conc, unit, sort_order)
             values ($1, 'enro', 'antibiotic', 'Енрофлоксацин', 80, 'ml', 0)`, [rec[0].id]);
			}
		}
	}
}
async function siteOrgId(sql, siteId) {
	const rec = await loadSiteById(sql, siteId);
	if (!rec) throw new Error("Фабрику не знайдено");
	return rec.orgId;
}
function mapFlock(r) {
	return {
		id: r.id,
		siteId: r.site_id,
		houseId: r.house_id,
		code: r.code,
		breed: r.breed,
		placedAt: r.placed_at,
		chicksPlaced: r.chicks_placed,
		chickCostUah: num(r.chick_cost_uah),
		targetDays: r.target_days,
		targetWeightG: r.target_weight_g,
		status: r.status === "closed" ? "closed" : "active",
		closedAt: r.closed_at,
		slaughterHead: r.slaughter_head == null ? null : Number(r.slaughter_head),
		slaughterWeightG: r.slaughter_weight_g == null ? null : Number(r.slaughter_weight_g)
	};
}
function mapReport(r) {
	return {
		id: r.id,
		flockId: r.flock_id,
		reportDate: r.report_date,
		ageDays: r.age_days,
		headStart: r.head_start,
		mortality: r.mortality,
		culled: r.culled,
		headEnd: r.head_end,
		avgWeightG: r.avg_weight_g,
		feedKg: num(r.feed_kg),
		waterL: r.water_l == null ? null : num(r.water_l),
		tempMin: r.temp_min == null ? null : num(r.temp_min),
		tempMax: r.temp_max == null ? null : num(r.temp_max),
		humidityPct: r.humidity_pct == null ? null : num(r.humidity_pct),
		droppingLook: r.dropping_look ?? null,
		litterState: r.litter_state ?? null,
		notes: r.notes ?? "",
		submittedBy: r.submitted_by,
		soldHead: Number(r.sold_head ?? 0),
		soldWeightKg: num(r.sold_weight_kg),
		meds: [],
		droppingPhoto: r.dropping_photo ?? null
	};
}
function houseLabel(site, house) {
	return `${site.name.replace(/^Фабрика\s+/, "")} · ${house.name}`;
}
async function sessionHint(sql, userId) {
	try {
		const rows = await sql.query(`select name, email from "user" where id = $1`, [userId]);
		return {
			name: rows[0]?.name ?? null,
			email: rows[0]?.email ?? null
		};
	} catch {
		return {
			name: null,
			email: null
		};
	}
}
async function rebuildReportHeads(sql, flockId) {
	const flocks = await sql.query("select chicks_placed from flocks where id = $1", [flockId]);
	if (!flocks[0]) return;
	const reports = await sql.query(`select id, mortality, culled, coalesce(sold_head, 0) as sold_head from daily_reports
      where flock_id = $1 order by report_date, id`, [flockId]);
	let head = flocks[0].chicks_placed;
	for (const r of reports) {
		const headStart = head;
		const headEnd = Math.max(0, headStart - r.mortality - r.culled - (r.sold_head ?? 0));
		await sql.query("update daily_reports set head_start = $2, head_end = $3 where id = $1", [
			r.id,
			headStart,
			headEnd
		]);
		head = headEnd;
	}
}
async function syncFlockStatus(sql, flockId) {
	const last = await sql.query(`select report_date, head_end from daily_reports
      where flock_id = $1 order by report_date desc, id desc limit 1`, [flockId]);
	const sums = await sql.query(`select coalesce(sum(sold_head), 0) as sold_head,
            coalesce(sum(sold_weight_kg), 0) as sold_kg
       from daily_reports where flock_id = $1`, [flockId]);
	const soldHead = Math.round(num(sums[0]?.sold_head));
	const soldWeightKg = num(sums[0]?.sold_kg);
	const saleAvgG = saleAvgWeightG(soldHead, soldWeightKg);
	const remaining = last[0]?.head_end ?? 1;
	if (last[0] && remaining <= 0) {
		await sql.query(`update flocks
          set status = 'closed',
              closed_at = $2,
              slaughter_head = $3,
              slaughter_weight_g = $4
        where id = $1`, [
			flockId,
			last[0].report_date,
			soldHead || null,
			saleAvgG ? Math.round(saleAvgG) : null
		]);
		return {
			closed: true,
			soldHead,
			soldWeightKg,
			saleAvgG
		};
	}
	await sql.query(`update flocks
        set status = 'active',
            closed_at = null,
            slaughter_head = $2,
            slaughter_weight_g = $3
      where id = $1`, [
		flockId,
		soldHead || null,
		saleAvgG ? Math.round(saleAvgG) : null
	]);
	return {
		closed: false,
		soldHead,
		soldWeightKg,
		saleAvgG
	};
}
var FLOCK_COLS = `id, site_id, house_id, code, breed, placed_at, chicks_placed, chick_cost_uah,
            target_days, target_weight_g, status, closed_at, slaughter_head, slaughter_weight_g`;
async function loadActiveFlocks(sql, siteIds) {
	if (!siteIds.length) return [];
	const ph = siteIds.map((_, i) => `$${i + 1}`).join(", ");
	return (await sql.query(`select ${FLOCK_COLS}
       from flocks
      where status = 'active' and site_id in (${ph})
      order by placed_at desc`, siteIds)).map(mapFlock);
}
async function loadFlocksForHouse(sql, houseId) {
	return (await sql.query(`select ${FLOCK_COLS}
       from flocks
      where house_id = $1
      order by case when status = 'active' then 0 else 1 end, placed_at desc`, [houseId])).map(mapFlock);
}
async function loadFlockForHouse(sql, houseId) {
	const rows = await sql.query(`select ${FLOCK_COLS}
       from flocks
      where house_id = $1
      order by case when status = 'active' then 0 else 1 end, placed_at desc
      limit 1`, [houseId]);
	return rows[0] ? mapFlock(rows[0]) : null;
}
async function loadReportsForFlocks(sql, flockIds) {
	const map = /* @__PURE__ */ new Map();
	if (!flockIds.length) return map;
	const ph = flockIds.map((_, i) => `$${i + 1}`).join(", ");
	const rows = await sql.query(`select id, flock_id, report_date, age_days, head_start, mortality, culled, head_end,
            avg_weight_g, feed_kg, water_l, temp_min, temp_max, humidity_pct,
            dropping_look, litter_state, notes, submitted_by,
            coalesce(sold_head, 0) as sold_head, coalesce(sold_weight_kg, 0) as sold_weight_kg,
            dropping_photo
       from daily_reports where flock_id in (${ph}) order by report_date asc`, flockIds);
	for (const r of rows) {
		const list = map.get(r.flock_id) ?? [];
		list.push(mapReport(r));
		map.set(r.flock_id, list);
	}
	const reportIds = rows.map((r) => r.id);
	if (reportIds.length) {
		const ph = reportIds.map((_, i) => `$${i + 1}`).join(", ");
		const medRows = await sql.query(`select report_id, prep_id, group_id, name, conc, unit
         from daily_report_meds
        where report_id in (${ph})
        order by sort_order, id`, reportIds);
		const byReport = /* @__PURE__ */ new Map();
		for (const m of medRows) {
			const unit = m.unit === "ml" ? "ml" : "g";
			const group = m.group_id;
			const list = byReport.get(m.report_id) ?? [];
			list.push({
				prepId: m.prep_id,
				group,
				name: m.name,
				conc: num(m.conc),
				unit
			});
			byReport.set(m.report_id, list);
		}
		for (const list of map.values()) for (const report of list) report.meds = byReport.get(report.id) ?? [];
	}
	return map;
}
async function replaceReportMeds(sql, reportId, meds) {
	await sql.query("delete from daily_report_meds where report_id = $1", [reportId]);
	for (let i = 0; i < meds.length; i += 1) {
		const m = meds[i];
		await sql.query(`insert into daily_report_meds (report_id, prep_id, group_id, name, conc, unit, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7)`, [
			reportId,
			m.prepId,
			m.group,
			m.name,
			m.conc,
			m.unit,
			i
		]);
	}
}
function cumFeed(reports, upto) {
	return reports.filter((r) => upto ? r.reportDate <= upto : true).reduce((s, r) => s + r.feedKg, 0);
}
function saleTotals(reports, flock) {
	const soldHead = reports.reduce((s, r) => s + r.soldHead, 0);
	const soldWeightKg = reports.reduce((s, r) => s + r.soldWeightKg, 0);
	const saleAvgG = saleAvgWeightG(soldHead, soldWeightKg);
	const lastSale = [...reports].reverse().find((r) => r.soldHead > 0) ?? null;
	return {
		soldHead,
		soldWeightKg,
		saleAvgG,
		saleFcr: flock && lastSale ? fcrAtSale({
			cumFeedKg: cumFeed(reports, lastSale.reportDate),
			cumSoldWeightKg: reports.filter((r) => r.reportDate <= lastSale.reportDate).reduce((s, r) => s + r.soldWeightKg, 0),
			remainingHead: lastSale.headEnd,
			remainingAvgG: lastSale.avgWeightG || saleAvgG,
			placed: flock.chicksPlaced,
			breed: flock.breed
		}) : 0
	};
}
function recentAdg(reports) {
	if (reports.length < 2) return 0;
	const last = reports.slice(-4);
	const first = last[0];
	const end = last[last.length - 1];
	const days = Math.max(1, end.ageDays - first.ageDays);
	return (end.avgWeightG - first.avgWeightG) / days;
}
function buildHouseOverview(site, house, flock, reports, today, costs, norms = DEFAULT_NORMS) {
	const last = reports[reports.length - 1] ?? null;
	const due = addDaysISO(today, -1);
	const reportDue = Boolean(flock && flock.status !== "closed" && flock.placedAt <= due);
	const missingToday = reportDue && (!last || last.reportDate < due);
	const label = houseLabel(site, house);
	const thresholds = {
		feedPct: costs.feedAlertPct,
		waterPct: costs.waterAlertPct,
		weightPct: costs.weightAlertPct
	};
	if (!flock || !last) return {
		site,
		house,
		flock,
		lastReportDate: last?.reportDate ?? null,
		missingToday: reportDue && !last,
		head: flock?.chicksPlaced ?? 0,
		ageDays: 0,
		avgWeightG: 0,
		stdWeightG: getStandard(0, flock?.breed).weightG,
		weightDeltaPct: null,
		feedKg: 0,
		feedGPerBird: 0,
		stdFeedGPerBird: 0,
		feedDeltaPct: null,
		waterMlPerBird: null,
		stdWaterMlPerBird: getStandard(0, flock?.breed).waterMlPerBird,
		waterDeltaPct: null,
		dayMortPct: 0,
		cumMortPct: 0,
		stdCumMortPct: 0,
		fcr: 0,
		stdFcr: 0,
		epef: 0,
		soldHead: 0,
		soldWeightKg: 0,
		saleAvgG: 0,
		saleFcr: 0,
		dayDead: 0,
		lastHeadStart: 0,
		status: reportDue && !last ? "warn" : "ok",
		deviations: reportDue && !last ? [{
			id: `${house.id}-empty`,
			severity: "warn",
			siteId: site.id,
			siteName: label,
			flockId: flock.id,
			title: "Немає звіту за попередню добу",
			detail: `${label}: посадку відкрито, звіту за вчора ще немає.`,
			metric: "звіт",
			actual: 0,
			standard: 1,
			deltaPct: -100
		}] : [],
		forecast: null,
		density: null,
		droppingLook: last?.droppingLook ?? null,
		litterState: last?.litterState ?? null,
		meds: last?.meds ?? []
	};
	const prev = reports.length > 1 ? reports[reports.length - 2] : null;
	const feedToDate = cumFeed(reports);
	const snap = snapshotFromSeries({
		placed: flock.chicksPlaced,
		ageDays: last.ageDays,
		head: last.headEnd,
		mortality: last.mortality,
		culled: last.culled,
		headStart: last.headStart,
		avgWeightG: last.avgWeightG,
		prevWeightG: prev?.avgWeightG ?? getStandard(Math.max(0, last.ageDays - 1), flock.breed).weightG,
		feedKg: last.feedKg,
		cumFeedKg: feedToDate,
		waterL: last.waterL,
		tempMin: last.tempMin,
		tempMax: last.tempMax,
		humidity: last.humidityPct,
		breed: flock.breed,
		soldHead: reports.reduce((s, r) => s + r.soldHead, 0),
		soldWeightKg: reports.reduce((s, r) => s + r.soldWeightKg, 0)
	});
	const rh = humidityFromNorms(snap.ageDays, norms);
	snap.standard.humidityMin = rh.min;
	snap.standard.humidityMax = rh.max;
	const deviations = evaluateDeviations({
		siteId: site.id,
		siteName: label,
		flockId: flock.id,
		snap,
		missingToday,
		reportDate: last.reportDate,
		thresholds,
		droppingLook: last.droppingLook,
		litterState: last.litterState
	});
	const density = forecastDensity({
		head: last.headEnd,
		avgWeightG: last.avgWeightG,
		ageDays: last.ageDays,
		areaM2: house.areaM2,
		recentAdgG: recentAdg(reports),
		breed: flock.breed,
		reportDate: last.reportDate,
		limitKgM2: norms.densityLimitKgM2,
		warnDays: norms.densityWarnDays
	});
	if (density.warn) deviations.push({
		id: `${flock.id}-density`,
		severity: density.reached ? "critical" : "warn",
		siteId: site.id,
		siteName: label,
		flockId: flock.id,
		title: density.reached ? `Щільність ${density.kgM2} кг/м² (ліміт ${density.limitKgM2})` : `До ${density.limitKgM2} кг/м² лишилось ${density.daysToLimit} діб`,
		detail: density.reached ? `${label}: жива маса ${density.kgM2} кг/м² при ліміті ${density.limitKgM2} кг/м².` : `${label}: зараз ${density.kgM2} кг/м². ${density.limitKgM2} кг/м² — на ${density.reachAgeDays} добу (${density.reachDate}).`,
		metric: "кг/м²",
		actual: density.kgM2,
		standard: density.limitKgM2,
		deltaPct: density.limitKgM2 ? (density.kgM2 - density.limitKgM2) / density.limitKgM2 * 100 : null
	});
	const fc = forecastCycle({
		chicksPlaced: flock.chicksPlaced,
		chickCostUah: flock.chickCostUah,
		cumFeedKg: feedToDate,
		feedPriceUah: costs.feedPriceUah,
		otherPerBirdUah: costs.otherPerBirdUah,
		gasPerBirdUah: costs.gasPerBirdUah,
		medsPerBirdUah: costs.medsPerBirdUah,
		liveWeightPriceUah: costs.liveWeightPriceUah,
		head: last.headEnd,
		avgWeightG: last.avgWeightG,
		ageDays: last.ageDays,
		targetDays: flock.targetDays,
		targetWeightG: flock.targetWeightG,
		recentAdgG: recentAdg(reports),
		breed: flock.breed,
		soldHead: reports.reduce((s, r) => s + r.soldHead, 0),
		soldWeightKg: reports.reduce((s, r) => s + r.soldWeightKg, 0)
	});
	const weightDeltaPct = snap.standard.weightG ? (snap.avgWeightG - snap.standard.weightG) / snap.standard.weightG * 100 : null;
	const feedDeltaPct = snap.standard.feedGPerBird ? (snap.feedGPerBird - snap.standard.feedGPerBird) / snap.standard.feedGPerBird * 100 : null;
	const waterDeltaPct = snap.waterMlPerBird != null && snap.standard.waterMlPerBird ? (snap.waterMlPerBird - snap.standard.waterMlPerBird) / snap.standard.waterMlPerBird * 100 : null;
	return {
		site,
		house,
		flock,
		lastReportDate: last.reportDate,
		missingToday,
		head: snap.head,
		ageDays: snap.ageDays,
		avgWeightG: snap.avgWeightG,
		stdWeightG: snap.standard.weightG,
		weightDeltaPct,
		feedKg: snap.feedKg,
		feedGPerBird: snap.feedGPerBird,
		stdFeedGPerBird: snap.standard.feedGPerBird,
		feedDeltaPct,
		waterMlPerBird: snap.waterMlPerBird,
		stdWaterMlPerBird: snap.standard.waterMlPerBird,
		waterDeltaPct,
		dayMortPct: snap.dayMortPct,
		cumMortPct: snap.cumMortPct,
		stdCumMortPct: snap.standard.cumMortPct,
		fcr: snap.fcr,
		stdFcr: snap.standard.fcr,
		epef: snap.epef,
		...saleTotals(reports, flock),
		status: statusFromDeviations(deviations),
		deviations,
		forecast: fc,
		density,
		droppingLook: last.droppingLook,
		litterState: last.litterState,
		meds: last.meds,
		dayDead: last.mortality + last.culled,
		lastHeadStart: last.headStart
	};
}
function buildTrend(flocks, reportsMap) {
	const seriesMap = /* @__PURE__ */ new Map();
	for (const flock of flocks) {
		const recent = (reportsMap.get(flock.id) ?? []).slice(-14);
		for (const r of recent) {
			const std = getStandard(r.ageDays, flock.breed);
			const cur = seriesMap.get(r.reportDate) ?? {
				date: r.reportDate,
				wSum: 0,
				wHead: 0,
				stdSum: 0,
				mort: 0,
				headStart: 0,
				feed: 0,
				stdFeed: 0,
				gainW: 0
			};
			cur.wSum += r.avgWeightG * r.headEnd;
			cur.wHead += r.headEnd;
			cur.stdSum += std.weightG * r.headEnd;
			cur.mort += r.mortality + r.culled;
			cur.headStart += r.headStart;
			cur.feed += r.feedKg;
			cur.stdFeed += std.feedGPerBird * r.headStart / 1e3;
			cur.gainW += Math.max(0, r.avgWeightG - startWeight(flock.breed)) * flock.chicksPlaced;
			seriesMap.set(r.reportDate, cur);
		}
	}
	return [...seriesMap.values()].sort((a, b) => a.date.localeCompare(b.date)).map((r) => ({
		date: r.date,
		ageLabel: r.date.slice(5),
		weight: r.wHead ? r.wSum / r.wHead : 0,
		stdWeight: r.wHead ? r.stdSum / r.wHead : 0,
		mortPct: r.headStart ? r.mort / r.headStart * 100 : 0,
		fcr: r.gainW > 0 ? r.feed / (r.gainW / 1e3) : 0,
		feedKg: round(r.feed, 1),
		stdFeedKg: round(r.stdFeed, 1),
		feedGPerBird: r.headStart ? round(r.feed * 1e3 / r.headStart, 1) : 0,
		stdFeedGPerBird: r.headStart ? round(r.stdFeed * 1e3 / r.headStart, 1) : 0
	}));
}
function rollupFactory(site, houses, series) {
	const active = houses.filter((h) => h.flock);
	const head = houses.reduce((s, h) => s + h.head, 0);
	const placed = houses.reduce((s, h) => s + (h.flock?.chicksPlaced ?? 0), 0);
	const dayMortality = houses.reduce((s, h) => s + h.dayDead, 0);
	const morningHead = houses.reduce((s, h) => s + (h.lastHeadStart || 0), 0);
	const weightSum = houses.reduce((s, h) => s + h.avgWeightG * h.head, 0);
	const fcrParts = houses.filter((h) => h.fcr > 0);
	const fcr = fcrParts.length > 0 ? fcrParts.reduce((s, h) => s + h.fcr * h.head, 0) / fcrParts.reduce((s, h) => s + h.head, 0) : 0;
	const epefParts = houses.filter((h) => h.epef > 0);
	const epef = epefParts.length > 0 ? epefParts.reduce((s, h) => s + h.epef * h.head, 0) / epefParts.reduce((s, h) => s + h.head, 0) : 0;
	const feedKg = houses.reduce((s, h) => s + h.feedKg, 0);
	const feedParts = houses.filter((h) => h.feedGPerBird > 0 && h.head > 0);
	const feedHead = feedParts.reduce((s, h) => s + h.head, 0);
	const feedGPerBird = feedHead ? feedParts.reduce((s, h) => s + h.feedGPerBird * h.head, 0) / feedHead : 0;
	const stdFeedGPerBird = feedHead ? feedParts.reduce((s, h) => s + h.stdFeedGPerBird * h.head, 0) / feedHead : 0;
	const feedDeltaPct = stdFeedGPerBird ? (feedGPerBird - stdFeedGPerBird) / stdFeedGPerBird * 100 : null;
	const soldHead = houses.reduce((s, h) => s + h.soldHead, 0);
	const soldWeightKg = houses.reduce((s, h) => s + h.soldWeightKg, 0);
	const deviations = houses.flatMap((h) => h.deviations);
	const forecasts = houses.filter((h) => h.forecast);
	const projectedCost = forecasts.reduce((s, h) => s + (h.forecast?.projectedCost ?? 0), 0);
	const projectedRevenue = forecasts.reduce((s, h) => s + (h.forecast?.projectedRevenue ?? 0), 0);
	const projectedProfit = projectedRevenue - projectedCost;
	const projectedLiveKg = forecasts.reduce((s, h) => {
		const f = h.forecast;
		if (!f) return s;
		return s + f.projectedHead * f.projectedWeightG / 1e3;
	}, 0);
	const remaining = forecasts.length ? Math.max(...forecasts.map((h) => h.forecast?.remainingDays ?? 0)) : 0;
	const projectedHead = forecasts.reduce((s, h) => s + (h.forecast?.projectedHead ?? 0), 0);
	const projectedWeightG = projectedHead ? Math.round(forecasts.reduce((s, h) => s + (h.forecast?.projectedWeightG ?? 0) * (h.forecast?.projectedHead ?? 0), 0) / projectedHead) : 0;
	const forecast = forecasts.length ? {
		costToDate: forecasts.reduce((s, h) => s + (h.forecast?.costToDate ?? 0), 0),
		costPerKgLive: head && weightSum ? projectedCost / Math.max(.001, head * (weightSum / head) / 1e3) : 0,
		inventoryValue: forecasts.reduce((s, h) => s + (h.forecast?.inventoryValue ?? 0), 0),
		marginToDate: forecasts.reduce((s, h) => s + (h.forecast?.marginToDate ?? 0), 0),
		profitabilityToDate: projectedCost > 0 ? projectedProfit / projectedCost * 100 : 0,
		remainingDays: remaining,
		projectedHead,
		projectedWeightG,
		projectedFeedKg: forecasts.reduce((s, h) => s + (h.forecast?.projectedFeedKg ?? 0), 0),
		projectedCost,
		projectedCostPerKg: projectedLiveKg > 0 ? projectedCost / projectedLiveKg : 0,
		projectedRevenue,
		projectedProfit,
		projectedProfitability: projectedCost > 0 ? projectedProfit / projectedCost * 100 : 0,
		projectedEpef: epef,
		projectedFcr: projectedHead ? forecasts.reduce((s, h) => s + (h.forecast?.projectedFcr ?? 0) * (h.forecast?.projectedHead ?? 0), 0) / projectedHead : 0
	} : null;
	return {
		site,
		houses,
		head: Math.round(head),
		placed,
		activeHouses: active.length,
		missingToday: houses.filter((h) => h.missingToday).length,
		avgWeightG: head ? Math.round(weightSum / head) : 0,
		dayMortality: Math.round(dayMortality),
		dayMortPct: morningHead ? dayMortality / morningHead * 100 : 0,
		morningHead: Math.round(morningHead),
		fcr,
		epef,
		feedKg: round(feedKg, 1),
		feedGPerBird: round(feedGPerBird, 1),
		stdFeedGPerBird: round(stdFeedGPerBird, 1),
		feedDeltaPct,
		soldHead,
		soldWeightKg: round(soldWeightKg, 1),
		status: statusFromDeviations(deviations),
		forecast,
		deviations,
		series,
		weather: null,
		weatherPlace: null,
		climate: null
	};
}
async function loadFactoryOverviews(sql, sites, today, costs, norms = DEFAULT_NORMS) {
	const siteIds = sites.map((s) => s.id);
	const houses = await loadHouses(sql, siteIds);
	const flocks = await loadActiveFlocks(sql, siteIds);
	const reportsMap = await loadReportsForFlocks(sql, flocks.map((f) => f.id));
	return await Promise.all(sites.map(async (site) => {
		const siteHouses = houses.filter((h) => h.siteId === site.id);
		const siteFlocks = flocks.filter((f) => f.siteId === site.id);
		return attachFactoryWeather(rollupFactory(site, siteHouses.map((house) => {
			const flock = siteFlocks.find((f) => f.houseId === house.id) ?? null;
			return buildHouseOverview(site, house, flock, flock ? reportsMap.get(flock.id) ?? [] : [], today, costs, norms);
		}), buildTrend(siteFlocks, reportsMap)), today, norms);
	}));
}
async function attachFactoryWeather(factory, date, norms = DEFAULT_NORMS) {
	const { site } = factory;
	if (site.lat == null || site.lon == null) return factory;
	try {
		const w = await loadWeather({
			lat: site.lat,
			lon: site.lon,
			place: site.geoName ?? site.name,
			date
		});
		if (!w) return factory;
		const youngest = factory.houses.filter((h) => h.flock).slice().sort((a, b) => a.ageDays - b.ageDays)[0];
		const std = youngest?.flock ? getStandard(youngest.ageDays, youngest.flock.breed) : null;
		const climate = youngest && std ? buildClimateAdvice({
			ageDays: youngest.ageDays,
			houseTempMin: std.tempMin,
			houseTempMax: std.tempMax,
			outdoor: w.selected,
			upcoming: w.days,
			norms
		}) : null;
		return {
			...factory,
			weather: w.selected,
			weatherPlace: w.place,
			climate
		};
	} catch {
		return factory;
	}
}
var getMe_createServerFn_handler = createServerRpc({
	id: "7749e2977d8573d9fb42eb288dd2cd725048dc1c975e1ed42bb8cb5b26f12aa1",
	name: "getMe",
	filename: "src/lib/server/fns.ts"
}, (opts) => getMe.__executeServer(opts));
var getMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMe_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const sites = await loadSites(sql, profile.orgId);
	const ids = await visibleSiteIds(sql, profile);
	const houses = await loadHouses(sql, ids);
	return {
		profile,
		sites: sites.filter((s) => ids.includes(s.id)),
		houses,
		today: todayISO()
	};
});
var getDashboard_createServerFn_handler = createServerRpc({
	id: "acca3fbf74b302df3c984c5468c7a02595c98a0b51b88b96a1fe324ce9a245e4",
	name: "getDashboard",
	filename: "src/lib/server/fns.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getDashboard_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const today = todayISO();
	const allSites = await loadSites(sql, profile.orgId);
	const ids = await visibleSiteIds(sql, profile);
	const sites = allSites.filter((s) => ids.includes(s.id));
	const costs = await loadCostSettings(sql, profile.orgId);
	const factories = await loadFactoryOverviews(sql, sites, today, costs, profile.orgId ? await ensureOrgNorms(sql, profile.orgId) : DEFAULT_NORMS);
	const head = factories.reduce((s, o) => s + o.head, 0);
	const placed = factories.reduce((s, o) => s + o.placed, 0);
	const dayMortality = factories.reduce((s, o) => s + o.dayMortality, 0);
	const morningHead = factories.reduce((s, o) => s + o.morningHead, 0);
	const weightSum = factories.reduce((s, o) => s + o.avgWeightG * o.head, 0);
	const fcrParts = factories.filter((o) => o.fcr > 0);
	const fcr = fcrParts.length > 0 ? fcrParts.reduce((s, o) => s + o.fcr * o.head, 0) / fcrParts.reduce((s, o) => s + o.head, 0) : 0;
	const epefParts = factories.filter((o) => o.epef > 0);
	const epef = epefParts.length > 0 ? epefParts.reduce((s, o) => s + o.epef * o.head, 0) / epefParts.reduce((s, o) => s + o.head, 0) : 0;
	const costPerKgParts = factories.filter((o) => o.forecast && o.forecast.projectedCostPerKg > 0);
	const costPerKg = costPerKgParts.length > 0 ? costPerKgParts.reduce((s, o) => s + (o.forecast?.projectedCostPerKg ?? 0) * o.head, 0) / costPerKgParts.reduce((s, o) => s + o.head, 0) : 0;
	const projectedProfit = factories.reduce((s, o) => s + (o.forecast?.projectedProfit ?? 0), 0);
	const projectedCost = factories.reduce((s, o) => s + (o.forecast?.projectedCost ?? 0), 0);
	const projectedLiveKg = factories.reduce((s, o) => {
		const f = o.forecast;
		if (!f) return s;
		return s + f.projectedHead * f.projectedWeightG / 1e3;
	}, 0);
	return {
		profile,
		today,
		factories,
		totals: {
			head: Math.round(head),
			placed,
			dayMortality: Math.round(dayMortality),
			dayMortPct: morningHead ? dayMortality / morningHead * 100 : 0,
			avgWeightG: head ? Math.round(weightSum / head) : 0,
			fcr,
			epef,
			costPerKg,
			projectedProfit,
			projectedProfitability: projectedCost > 0 ? projectedProfit / projectedCost * 100 : 0,
			projectedCostPerKg: projectedLiveKg > 0 ? projectedCost / projectedLiveKg : 0
		},
		thresholds: {
			feedPct: costs.feedAlertPct,
			waterPct: costs.waterAlertPct,
			weightPct: costs.weightAlertPct
		}
	};
});
var getCostTool_createServerFn_handler = createServerRpc({
	id: "9003c415d37edc9cb5d513eb0484894b4ea2167ecdbf60120d528ad71bf75ec8",
	name: "getCostTool",
	filename: "src/lib/server/fns.ts"
}, (opts) => getCostTool.__executeServer(opts));
var getCostTool = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(getCostTool_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const today = todayISO();
	if (isPlatformAdmin(profile) && !data.orgId && !profile.orgId) return {
		profile,
		factories: [],
		costs: await loadCostSettings(sql, null),
		canEdit: false,
		today
	};
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const allSites = await loadSites(sql, orgId);
	const ids = await visibleSiteIds(sql, isPlatformAdmin(profile) ? {
		...profile,
		orgId
	} : profile);
	const sites = allSites.filter((s) => ids.includes(s.id));
	const costs = await loadCostSettings(sql, orgId);
	const norms = await ensureOrgNorms(sql, orgId);
	return {
		profile,
		factories: sites.length ? await loadFactoryOverviews(sql, sites, today, costs, norms) : [],
		costs,
		canEdit: hasTechAccess(profile) && !isDemoUser(profile),
		today
	};
});
var getSiteDetail_createServerFn_handler = createServerRpc({
	id: "37cde9f2067602ca13495f6c8f7342704471984cb47a06e4cb1f4b617a5807ad",
	name: "getSiteDetail",
	filename: "src/lib/server/fns.ts"
}, (opts) => getSiteDetail.__executeServer(opts));
var getSiteDetail = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(getSiteDetail_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	await assertSiteOfOrg(sql, profile, data.siteId);
	const rec = await loadSiteById(sql, data.siteId);
	if (!rec) throw new Error("Фабрику не знайдено");
	const site = (await loadSites(sql, rec.orgId)).find((s) => s.id === data.siteId);
	if (!site) throw new Error("Фабрику не знайдено");
	const today = todayISO();
	const costs = await loadCostSettings(sql, rec.orgId);
	const norms = await ensureOrgNorms(sql, rec.orgId);
	const [factory] = await loadFactoryOverviews(sql, [site], today, costs, norms);
	if (!factory) throw new Error("Фабрику не знайдено");
	return {
		profile,
		factory,
		today,
		thresholds: {
			feedPct: costs.feedAlertPct,
			waterPct: costs.waterAlertPct,
			weightPct: costs.weightAlertPct
		}
	};
});
var getHouseDetail_createServerFn_handler = createServerRpc({
	id: "afce2566d5355ca6981797800193aa469e33d4df940023b0c0dade1ec61c7fef",
	name: "getHouseDetail",
	filename: "src/lib/server/fns.ts"
}, (opts) => getHouseDetail.__executeServer(opts));
var getHouseDetail = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(getHouseDetail_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const house = await loadHouseById(sql, data.houseId);
	if (!house) throw new Error("Пташник не знайдено");
	await assertSiteOfOrg(sql, profile, house.siteId);
	const rec = await loadSiteById(sql, house.siteId);
	if (!rec) throw new Error("Фабрику не знайдено");
	const site = rec;
	const today = todayISO();
	const costs = await loadCostSettings(sql, rec.orgId);
	const norms = await ensureOrgNorms(sql, rec.orgId);
	const allFlocks = await loadFlocksForHouse(sql, house.id);
	const flock = (data.flockId ? allFlocks.find((f) => f.id === data.flockId) : null) ?? allFlocks.find((f) => f.status === "active") ?? allFlocks[0] ?? null;
	const pastFlocks = allFlocks.filter((f) => f.id !== flock?.id);
	const reportsMap = await loadReportsForFlocks(sql, flock ? [flock.id] : []);
	const reports = flock ? reportsMap.get(flock.id) ?? [] : [];
	const overview = buildHouseOverview(site, house, flock, reports, today, costs, norms);
	let runningFeed = 0;
	let runningStdFeed = 0;
	return {
		profile,
		site,
		house,
		flock,
		pastFlocks,
		overview,
		reports,
		series: reports.map((r) => {
			runningFeed += r.feedKg;
			const std = getStandard(r.ageDays, flock?.breed);
			const stdFeedKg = std.feedGPerBird * r.headStart / 1e3;
			runningStdFeed += stdFeedKg;
			const chick = startWeight(flock?.breed);
			const fcr = flock && r.avgWeightG > chick ? runningFeed / (flock.chicksPlaced * (r.avgWeightG - chick) / 1e3) : 0;
			const waterMl = r.waterL != null && r.headStart ? r.waterL * 1e3 / r.headStart : null;
			return {
				date: r.reportDate,
				ageDays: r.ageDays,
				weight: r.avgWeightG,
				stdWeight: std.weightG,
				mort: r.mortality + r.culled,
				dayMortPct: r.headStart ? (r.mortality + r.culled) / r.headStart * 100 : 0,
				fcr,
				feedKg: round(r.feedKg, 1),
				stdFeedKg: round(stdFeedKg, 1),
				feedGPerBird: r.headStart ? round(r.feedKg * 1e3 / r.headStart, 1) : 0,
				stdFeedGPerBird: std.feedGPerBird,
				cumFeedKg: round(runningFeed, 1),
				stdCumFeedKg: round(runningStdFeed, 1),
				waterL: r.waterL,
				stdWaterL: round(std.waterMlPerBird * r.headStart / 1e3, 1),
				waterMlPerBird: waterMl != null ? round(waterMl, 0) : null,
				stdWaterMlPerBird: std.waterMlPerBird,
				tempMin: r.tempMin,
				tempMax: r.tempMax,
				head: r.headEnd,
				soldHead: r.soldHead,
				soldWeightKg: r.soldWeightKg,
				saleAvgG: saleAvgWeightG(r.soldHead, r.soldWeightKg)
			};
		}),
		treatments: flock ? await loadFlockTreatmentCalendar(sql, flock.id, rec.orgId) : await loadOrgTreatmentCalendar(sql, rec.orgId),
		canEditTreatments: canEditTreatments(profile)
	};
});
var getReportPrefill_createServerFn_handler = createServerRpc({
	id: "9cc4680754607d4ba145c84290c048d148c3ba4ef877e781c30354c446e0ad97",
	name: "getReportPrefill",
	filename: "src/lib/server/fns.ts"
}, (opts) => getReportPrefill.__executeServer(opts));
var getReportPrefill = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(getReportPrefill_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const today = todayISO();
	const due = yesterdayISO();
	let orgId = profile.orgId;
	if (isPlatformAdmin(profile) && data.houseId) {
		const found = await loadHouseById(sql, data.houseId);
		if (found) {
			const rec = await loadSiteById(sql, found.siteId);
			if (rec) orgId = rec.orgId;
		}
	} else if (isPlatformAdmin(profile) && data.siteId) {
		const rec = await loadSiteById(sql, data.siteId);
		if (rec) orgId = rec.orgId;
	}
	const allSites = await loadSites(sql, orgId);
	const ids = isPlatformAdmin(profile) && orgId ? allSites.map((s) => s.id) : await visibleSiteIds(sql, profile);
	const sites = allSites.filter((s) => ids.includes(s.id));
	const houses = await loadHouses(sql, ids);
	let house = (data.houseId ? houses.find((h) => h.id === data.houseId) : null) ?? (data.siteId ? houses.find((h) => h.siteId === data.siteId) : null) ?? (profile.siteId ? houses.find((h) => h.siteId === profile.siteId) : null) ?? houses[0] ?? null;
	if (house) assertCanAccessSite(profile, house.siteId);
	const flock = house ? await loadFlockForHouse(sql, house.id) : null;
	const reportsMap = await loadReportsForFlocks(sql, flock ? [flock.id] : []);
	const reports = flock ? reportsMap.get(flock.id) ?? [] : [];
	const minDate = flock?.placedAt ?? null;
	const horizon = flock?.status === "closed" && flock.closedAt && flock.closedAt < due ? flock.closedAt : due;
	const maxDate = today;
	const missingDates = flock ? eachDateISO(flock.placedAt, horizon).filter((d) => !reports.some((r) => r.reportDate === d)) : [];
	let reportDate = data.reportDate && /^\d{4}-\d{2}-\d{2}$/.test(data.reportDate) ? data.reportDate : "";
	if (minDate && reportDate && reportDate < minDate) reportDate = minDate;
	if (reportDate && reportDate > maxDate) reportDate = maxDate;
	if (!reportDate) reportDate = missingDates[0] ?? due;
	if (minDate && reportDate < minDate) reportDate = minDate;
	if (reportDate > maxDate) reportDate = maxDate;
	const existing = reports.find((r) => r.reportDate === reportDate) ?? null;
	const existingToday = reports.find((r) => r.reportDate === today) ?? null;
	const previous = reports.filter((r) => r.reportDate < reportDate).sort((a, b) => b.reportDate.localeCompare(a.reportDate))[0] ?? null;
	const ageDays = flock ? Math.max(0, diffDays(flock.placedAt, reportDate)) : 0;
	const std = getStandard(ageDays, flock?.breed);
	const costs = await loadCostSettings(sql, orgId);
	const norms = orgId ? await ensureOrgNorms(sql, orgId) : DEFAULT_NORMS;
	const rh = humidityFromNorms(ageDays, norms);
	const prior = reports.filter((r) => r.reportDate < reportDate);
	const site = house ? sites.find((s) => s.id === house.siteId) ?? null : null;
	let weather = null;
	let weatherError = null;
	if (site?.lat != null && site?.lon != null) try {
		weather = await loadWeather({
			lat: site.lat,
			lon: site.lon,
			place: site.geoName ?? site.name,
			date: reportDate
		});
	} catch (err) {
		weatherError = err instanceof Error ? err.message : "Немає прогнозу";
	}
	return {
		profile,
		sites,
		houses,
		house,
		flock,
		previous,
		existing,
		existingToday,
		today,
		reportDate,
		minDate,
		maxDate,
		missingDates,
		ageDays,
		std: flock ? {
			weightG: std.weightG,
			feedGPerBird: std.feedGPerBird,
			waterMlPerBird: std.waterMlPerBird,
			dailyMortPct: std.dailyMortPct,
			dailyGainG: std.dailyGainG,
			tempMin: std.tempMin,
			tempMax: std.tempMax,
			humidityMin: rh.min,
			humidityMax: rh.max
		} : null,
		weather,
		weatherError,
		density: house && flock && (existing || previous) ? forecastDensity({
			head: (existing ?? previous).headEnd,
			avgWeightG: (existing ?? previous).avgWeightG,
			ageDays: (existing ?? previous).ageDays,
			areaM2: house.areaM2,
			recentAdgG: recentAdg(reports),
			breed: flock.breed,
			reportDate: (existing ?? previous).reportDate,
			limitKgM2: norms.densityLimitKgM2,
			warnDays: norms.densityWarnDays
		}) : null,
		thresholds: {
			feedPct: costs.feedAlertPct,
			waterPct: costs.waterAlertPct,
			weightPct: costs.weightAlertPct
		},
		cumFeedBefore: prior.reduce((s, r) => s + r.feedKg, 0),
		priorSoldHead: prior.reduce((s, r) => s + r.soldHead, 0),
		priorSoldKg: prior.reduce((s, r) => s + r.soldWeightKg, 0),
		chickG: startWeight(flock?.breed),
		withdrawal: activeWithdrawals(reports.map((r) => ({
			date: r.reportDate,
			meds: r.meds
		})), reportDate)
	};
});
var saveDailyReport_createServerFn_handler = createServerRpc({
	id: "0fa8ce58638c02a4f0c2a985c8c467603152413b50329e54ea4039ab887472ce",
	name: "saveDailyReport",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveDailyReport.__executeServer(opts));
var saveDailyReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveDailyReport_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const house = await loadHouseById(sql, data.houseId);
	if (!house) throw new Error("Пташник не знайдено");
	await assertSiteOfOrg(sql, profile, house.siteId);
	const flock = await loadFlockForHouse(sql, house.id);
	if (!flock) throw new Error("Немає посадки в цьому пташнику");
	const look = parseDroppingLook(data.droppingLook);
	const litter = parseLitterState(data.litterState);
	if (!look || !litter) throw new Error("Вкажіть вигляд посліду і стан підстилки");
	const meds = data.medsNone ? [] : parseWaterMeds(data.meds);
	if (!data.medsNone && meds.length === 0) throw new Error("Вкажіть препарати на випоюванні або позначте, що випоювання немає");
	const today = todayISO();
	if (!/^\d{4}-\d{2}-\d{2}$/.test(data.reportDate)) throw new Error("Некоректна дата звіту");
	if (data.reportDate < flock.placedAt) throw new Error("Дата звіту не може бути раніше посадки");
	if (data.reportDate > today) throw new Error("Не можна подати звіт на майбутнє");
	const reports = (await loadReportsForFlocks(sql, [flock.id])).get(flock.id) ?? [];
	const existing = reports.find((r) => r.reportDate === data.reportDate);
	if (flock.status === "closed" && flock.closedAt && data.reportDate > flock.closedAt && !existing) throw new Error("Посадку вже здано. Відредагуйте звіт продажу або відкрийте нову посадку");
	const ageDays = Math.max(0, diffDays(flock.placedAt, data.reportDate));
	const headStart = (reports.filter((r) => r.reportDate < data.reportDate).sort((a, b) => b.reportDate.localeCompare(a.reportDate))[0] ?? null)?.headEnd ?? flock.chicksPlaced;
	const mort = Math.max(0, Math.round(data.mortality));
	const culled = Math.max(0, Math.round(data.culled));
	const sold = Math.max(0, Math.round(data.soldHead ?? 0));
	const soldKg = Math.max(0, Number(data.soldWeightKg ?? 0));
	if (mort + culled >= headStart) throw new Error("Падіж не може перевищувати поголів'я");
	if (mort + culled + sold > headStart) throw new Error("Продаж не може перевищувати залишок після падежу");
	if (sold > 0 && soldKg <= 0) throw new Error("Вкажіть загальну вагу продажу");
	if (soldKg > 0 && sold <= 0) throw new Error("Вкажіть кількість проданих голів");
	if (!Number.isFinite(data.avgWeightG) || data.avgWeightG < 0) throw new Error("Вкажіть середню масу");
	if (!Number.isFinite(data.feedKg) || data.feedKg < 0) throw new Error("Вкажіть корм");
	if (data.humidityPct != null && (data.humidityPct < 10 || data.humidityPct > 100)) throw new Error("Вологість має бути від 10 до 100%");
	const saleAvg = saleAvgWeightG(sold, soldKg);
	const headEnd = headStart - mort - culled - sold;
	let avgWeightG = Math.round(data.avgWeightG || 0);
	if (saleAvg && (headEnd === 0 || !avgWeightG)) avgWeightG = Math.round(saleAvg);
	if (avgWeightG <= 0) throw new Error("Вкажіть середню масу");
	const photoRaw = data.droppingPhoto;
	const photo = photoRaw === "" ? null : typeof photoRaw === "string" && photoRaw.startsWith("data:image/") && photoRaw.length < 18e4 ? photoRaw : existing?.droppingPhoto ?? null;
	let reportId = existing?.id ?? 0;
	if (existing) await sql.query(`update daily_reports set
           age_days = $1, head_start = $2, mortality = $3, culled = $4, head_end = $5,
           avg_weight_g = $6, feed_kg = $7, water_l = $8, temp_min = $9, temp_max = $10,
           humidity_pct = $11, dropping_look = $12, litter_state = $13, notes = $14, submitted_by = $15,
           sold_head = $16, sold_weight_kg = $17, dropping_photo = $18, updated_at = now()
         where id = $19`, [
		ageDays,
		headStart,
		mort,
		culled,
		headEnd,
		avgWeightG,
		data.feedKg,
		data.waterL,
		data.tempMin,
		data.tempMax,
		data.humidityPct,
		look,
		litter,
		data.notes.trim(),
		context.userId,
		sold,
		soldKg,
		photo,
		existing.id
	]);
	else {
		let inserted;
		try {
			inserted = await sql.query(`insert into daily_reports (
           flock_id, report_date, age_days, head_start, mortality, culled, head_end,
           avg_weight_g, feed_kg, water_l, temp_min, temp_max, humidity_pct,
           dropping_look, litter_state, notes, submitted_by,
           sold_head, sold_weight_kg, dropping_photo
         ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         returning id`, [
				flock.id,
				data.reportDate,
				ageDays,
				headStart,
				mort,
				culled,
				headEnd,
				avgWeightG,
				data.feedKg,
				data.waterL,
				data.tempMin,
				data.tempMax,
				data.humidityPct,
				look,
				litter,
				data.notes.trim(),
				context.userId,
				sold,
				soldKg,
				photo
			]);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "";
			if (/unique|duplicate/i.test(msg)) throw new Error("Звіт за цю дату вже є — відкрийте його і змініть");
			throw err;
		}
		reportId = inserted[0]?.id ?? 0;
		const site = await loadSiteById(sql, house.siteId);
		if (site) await notifyNewReport(sql, {
			orgId: site.orgId,
			siteId: site.id,
			houseId: house.id,
			houseName: house.name,
			siteName: site.name,
			reportDate: data.reportDate,
			actor: profile
		});
	}
	if (reportId) await replaceReportMeds(sql, reportId, meds);
	{
		const siteForLog = await loadSiteById(sql, house.siteId);
		if (siteForLog) await writeJournal(sql, {
			orgId: siteForLog.orgId,
			siteId: siteForLog.id,
			actor: profile,
			action: existing ? "update" : "create",
			entity: "report",
			summary: existing ? `Змінено звіт ${data.reportDate} · ${siteForLog.name}, ${house.name}` : `Створено звіт ${data.reportDate} · ${siteForLog.name}, ${house.name}`,
			href: `/houses/${house.id}`
		});
	}
	await rebuildReportHeads(sql, flock.id);
	const status = await syncFlockStatus(sql, flock.id);
	const after = (await loadReportsForFlocks(sql, [flock.id])).get(flock.id) ?? [];
	const saved = after.find((r) => r.reportDate === data.reportDate);
	if (!existing && saved) {
		const siteRec = await loadSiteById(sql, house.siteId);
		const norms = siteRec ? await ensureOrgNorms(sql, siteRec.orgId) : DEFAULT_NORMS;
		const dens = forecastDensity({
			head: saved.headEnd,
			avgWeightG: saved.avgWeightG,
			ageDays: saved.ageDays,
			areaM2: house.areaM2,
			recentAdgG: recentAdg(after),
			breed: flock.breed,
			reportDate: saved.reportDate,
			limitKgM2: norms.densityLimitKgM2,
			warnDays: norms.densityWarnDays
		});
		if (dens.warn) {
			const site = await loadSiteById(sql, house.siteId);
			if (site) await notifyDensity(sql, {
				orgId: site.orgId,
				siteId: site.id,
				houseId: house.id,
				houseName: house.name,
				siteName: site.name,
				density: dens
			});
		}
	}
	const savedId = saved?.id ?? existing?.id ?? 0;
	const due = addDaysISO(today, -1);
	const horizon = status.closed && saved ? saved.reportDate : due;
	const remainingDates = eachDateISO(flock.placedAt, horizon).filter((d) => !after.some((r) => r.reportDate === d));
	const cumSoldKg = after.filter((r) => r.reportDate <= data.reportDate).reduce((s, r) => s + r.soldWeightKg, 0);
	const saleFcr = sold > 0 ? fcrAtSale({
		cumFeedKg: cumFeed(after, data.reportDate),
		cumSoldWeightKg: cumSoldKg,
		remainingHead: saved?.headEnd ?? headEnd,
		remainingAvgG: saved?.avgWeightG || saleAvg,
		placed: flock.chicksPlaced,
		breed: flock.breed
	}) : 0;
	return {
		ok: true,
		id: savedId,
		headEnd: saved?.headEnd ?? headEnd,
		nextDate: remainingDates[0] ?? null,
		missingLeft: remainingDates.length,
		soldHead: sold,
		soldWeightKg: soldKg,
		saleAvgG: saleAvg,
		saleFcr,
		closed: status.closed
	};
});
var getPeriodReport_createServerFn_handler = createServerRpc({
	id: "5d73e3364bfc15066a23050b5daa59312417abc58693014b1140d9d4d4f559d9",
	name: "getPeriodReport",
	filename: "src/lib/server/fns.ts"
}, (opts) => getPeriodReport.__executeServer(opts));
var getPeriodReport = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(getPeriodReport_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const orgId = data.orgId ? await resolveOrgId(sql, profile, data.orgId) : isPlatformAdmin(profile) ? profile.orgId : profile.orgId;
	const allSites = await loadSites(sql, orgId);
	const ids = isPlatformAdmin(profile) && orgId ? allSites.map((s) => s.id) : await visibleSiteIds(sql, profile);
	const siteFilter = data.siteId && ids.includes(data.siteId) ? [data.siteId] : ids;
	if (!siteFilter.length) return {
		profile,
		rows: [],
		sites: []
	};
	const ph = siteFilter.map((_, i) => `$${i + 1}`).join(", ");
	return {
		profile,
		rows: (await sql.query(`select r.report_date, s.id as site_id, s.name as site_name,
              h.id as house_id, h.name as house_name,
              r.age_days, r.mortality, r.culled,
              r.head_end, r.avg_weight_g, r.feed_kg, r.notes, f.chicks_placed, f.breed,
              coalesce(r.sold_head, 0) as sold_head, coalesce(r.sold_weight_kg, 0) as sold_weight_kg,
              (select coalesce(sum(x.feed_kg),0) from daily_reports x
                where x.flock_id = r.flock_id and x.report_date <= r.report_date) as cum_feed,
              (select coalesce(sum(x.sold_weight_kg),0) from daily_reports x
                where x.flock_id = r.flock_id and x.report_date <= r.report_date) as cum_sold_kg
         from daily_reports r
         join flocks f on f.id = r.flock_id
         join houses h on h.id = f.house_id
         join sites s on s.id = f.site_id
        where s.id in (${ph})
          and r.report_date between $${siteFilter.length + 1} and $${siteFilter.length + 2}
        order by r.report_date desc, s.sort_order, h.sort_order`, [
			...siteFilter,
			data.from,
			data.to
		])).map((r) => {
			const cum = num(r.cum_feed);
			const soldHead = Number(r.sold_head ?? 0);
			const soldWeightKg = num(r.sold_weight_kg);
			const saleAvgG = saleAvgWeightG(soldHead, soldWeightKg);
			const remainingAvg = r.avg_weight_g || saleAvgG;
			const saleFcr = soldHead > 0 ? fcrAtSale({
				cumFeedKg: cum,
				cumSoldWeightKg: num(r.cum_sold_kg),
				remainingHead: r.head_end,
				remainingAvgG: remainingAvg,
				placed: r.chicks_placed,
				breed: r.breed
			}) : r.avg_weight_g > startWeight(r.breed) ? cum / (r.chicks_placed * (r.avg_weight_g - startWeight(r.breed)) / 1e3) : 0;
			const chick = startWeight(r.breed);
			const fcr = r.avg_weight_g > chick ? cum / (r.chicks_placed * (r.avg_weight_g - chick) / 1e3) : 0;
			return {
				date: r.report_date,
				siteId: r.site_id,
				siteName: r.site_name,
				houseId: r.house_id,
				houseName: r.house_name,
				ageDays: r.age_days,
				mortality: r.mortality,
				culled: r.culled,
				head: r.head_end,
				avgWeightG: r.avg_weight_g,
				feedKg: num(r.feed_kg),
				fcr,
				soldHead,
				soldWeightKg,
				saleAvgG,
				saleFcr,
				notes: r.notes
			};
		}),
		sites: allSites.filter((s) => ids.includes(s.id))
	};
});
var getTeam_createServerFn_handler = createServerRpc({
	id: "30d12a9564c6a4ccf5155ec7f7f2259a5a36cca9d8365a9dcbf7fb823a9509c4",
	name: "getTeam",
	filename: "src/lib/server/fns.ts"
}, (opts) => getTeam.__executeServer(opts));
var getTeam = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(getTeam_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const sites = await loadSites(sql, orgId);
	const orgRows = await sql.query("select invite_code from organizations where id = $1", [orgId]);
	return {
		profile,
		members: (await sql.query("select user_id, role, site_id, full_name, email, created_at from staff_profiles where org_id = $1 order by created_at", [orgId])).map((r) => ({
			userId: r.user_id,
			role: r.role,
			siteId: r.site_id,
			siteName: sites.find((s) => s.id === r.site_id)?.name ?? null,
			fullName: r.full_name,
			email: r.email,
			createdAt: String(r.created_at)
		})),
		sites,
		inviteCode: orgRows[0]?.invite_code ?? null
	};
});
var assignStaff_createServerFn_handler = createServerRpc({
	id: "69b2bdedd4b670857520a561cc38c1f5ee94594e1127456f53a826e96974c6a9",
	name: "assignStaff",
	filename: "src/lib/server/fns.ts"
}, (opts) => assignStaff.__executeServer(opts));
var assignStaff = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(assignStaff_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	if (data.userId === context.userId && !isPlatformAdmin(profile) && hasTechAccess(profile) && data.role !== profile.role) throw new Error("Не можна зняти з себе роль з повним доступом");
	if (factoryRequired(data.role) && !data.siteId) throw new Error("Призначте фабрику керівнику");
	const siteId = factorySelectable(data.role) ? data.siteId : null;
	if (siteId) await assertSiteOfOrg(sql, profile, siteId);
	const fullName = data.fullName?.trim() || null;
	const email = data.email?.trim().toLowerCase() || null;
	if (email) {
		if ((await sql.query(`select id from "user" where lower(email) = $1 and id <> $2`, [email, data.userId]))[0]) throw new Error("Цей email уже зайнятий");
	}
	if (!(await sql.query(`update staff_profiles
          set role = $2,
              site_id = $3,
              full_name = coalesce($4, full_name),
              email = coalesce($5, email)
        where user_id = $1 and org_id = $6
        returning user_id`, [
		data.userId,
		data.role,
		siteId,
		fullName,
		email,
		orgId
	]))[0]) throw new Error("Користувача не знайдено в цьому господарстві");
	if (fullName || email) await sql.query(`update "user"
            set name = coalesce($2, name),
                email = coalesce($3, email),
                "updatedAt" = now()
          where id = $1`, [
		data.userId,
		fullName,
		email
	]);
	await writeJournal(sql, {
		orgId,
		actor: profile,
		action: "assign",
		entity: "staff",
		summary: `Призначено: ${fullName || email || data.userId} · ${roleLabel(data.role)}${siteId ? ` · фабрика №${siteId}` : ""}`,
		href: `/team?org=${orgId}`
	});
	return { ok: true };
});
var saveMyProfile_createServerFn_handler = createServerRpc({
	id: "17588ceaae331a4d8ab589a9524032f94795651d290890438f37fea6eff34963",
	name: "saveMyProfile",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveMyProfile.__executeServer(opts));
var saveMyProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveMyProfile_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	await ensureProfile(sql, context.userId, hint);
	const fullName = data.fullName.trim();
	const email = data.email.trim().toLowerCase();
	if (!fullName) throw new Error("Вкажіть ПІБ");
	if (!email || !email.includes("@")) throw new Error("Вкажіть коректний email");
	if ((await sql.query(`select id from "user" where lower(email) = $1 and id <> $2`, [email, context.userId]))[0]) throw new Error("Цей email уже зайнятий");
	await sql.query("update staff_profiles set full_name = $2, email = $3 where user_id = $1", [
		context.userId,
		fullName,
		email
	]);
	await sql.query(`update "user" set name = $2, email = $3, "updatedAt" = now() where id = $1`, [
		context.userId,
		fullName,
		email
	]);
	return { ok: true };
});
var getSettings_createServerFn_handler = createServerRpc({
	id: "98ca1ba265b5aad6868ebe32f1bbd527e086b0abe59dfc74d039f1fd57e6f151",
	name: "getSettings",
	filename: "src/lib/server/fns.ts"
}, (opts) => getSettings.__executeServer(opts));
var getSettings = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(getSettings_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	if (!canManageFlocks(profile)) throw new Error("Немає права керувати посадками");
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const allSites = await loadSites(sql, orgId);
	const sites = isPlatformAdmin(profile) || seesAllFactories(profile) && profile.orgId === orgId ? allSites : allSites.filter((s) => s.id === profile.siteId);
	const ids = sites.map((s) => s.id);
	const houses = await loadHouses(sql, ids);
	const flocks = await loadActiveFlocks(sql, ids);
	return {
		profile,
		costs: canManageOps(profile) ? await loadCostSettings(sql, orgId) : null,
		sites,
		houses,
		flocks,
		orgId,
		orgName: (await sql.query("select name from organizations where id = $1", [orgId]))[0]?.name ?? null
	};
});
var saveCosts_createServerFn_handler = createServerRpc({
	id: "cc31920494914a1dd17f42efd14e500a80e519802c8c0907ac1658e83e8abbfb",
	name: "saveCosts",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveCosts.__executeServer(opts));
var saveCosts = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveCosts_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	if (isDemoUser(profile)) throw new Error("Демо не змінює параметри собівартості");
	assertTechnologist(profile);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	await ensureCostSettings(sql, orgId);
	await sql.query(`update cost_settings set
         feed_price_uah = $1, chick_price_uah = $2, live_weight_price_uah = $3,
         other_per_bird_uah = $4, gas_per_bird_uah = $5, meds_per_bird_uah = $6,
         feed_alert_pct = $8, water_alert_pct = $9, weight_alert_pct = $10,
         updated_at = now(), updated_by = $7
       where org_id = $11`, [
		data.feedPriceUah,
		data.chickPriceUah,
		data.liveWeightPriceUah,
		data.otherPerBirdUah,
		data.gasPerBirdUah,
		data.medsPerBirdUah,
		context.userId,
		data.feedAlertPct,
		data.waterAlertPct,
		data.weightAlertPct,
		orgId
	]);
	return { ok: true };
});
var saveSite_createServerFn_handler = createServerRpc({
	id: "0aea6daee078fc81f50bffa2ab68bd9b16286d5dff88b2ed20b6af08509a2103",
	name: "saveSite",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveSite.__executeServer(opts));
var saveSite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveSite_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	await assertSiteOfOrg(sql, profile, data.id);
	const orgId = await siteOrgId(sql, data.id);
	await sql.query("update sites set name = $2, location = $3 where id = $1 and org_id = $4", [
		data.id,
		data.name.trim(),
		data.location.trim(),
		orgId
	]);
	await writeJournal(sql, {
		orgId,
		siteId: data.id,
		actor: profile,
		action: "update",
		entity: "site",
		summary: `Змінено фабрику «${data.name.trim()}»`,
		href: `/sites/${data.id}`
	});
	return { ok: true };
});
var searchPlaces_createServerFn_handler = createServerRpc({
	id: "d4a60cddbd2bec31b10337fb54d4ecc2c1821436796c55fcf974fdf7a68f0e37",
	name: "searchPlaces",
	filename: "src/lib/server/fns.ts"
}, (opts) => searchPlaces.__executeServer(opts));
var searchPlaces = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(searchPlaces_createServerFn_handler, async ({ data }) => {
	return searchPlaces$1(data.query);
});
var saveSiteGeo_createServerFn_handler = createServerRpc({
	id: "0163c3dc679660ee464a54ea84071d4523ad1e98d884d0ee49afbbd9df5b6c19",
	name: "saveSiteGeo",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveSiteGeo.__executeServer(opts));
var saveSiteGeo = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveSiteGeo_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertCanManageFlocks(profile, data.siteId);
	await assertSiteOfOrg(sql, profile, data.siteId);
	if (!Number.isFinite(data.lat) || !Number.isFinite(data.lon)) throw new Error("Некоректні координати");
	const name = data.geoName.trim();
	if (!name) throw new Error("Вкажіть населений пункт");
	const orgId = await siteOrgId(sql, data.siteId);
	await sql.query("update sites set geo_name = $2, geo_admin = $3, lat = $4, lon = $5 where id = $1 and org_id = $6", [
		data.siteId,
		name,
		data.geoAdmin?.trim() || null,
		data.lat,
		data.lon,
		orgId
	]);
	return { ok: true };
});
var saveHouse_createServerFn_handler = createServerRpc({
	id: "7cfa3ac8e16fddfb16f5fae0dd600dd125a9aa899816ff9e2871aef00989edd0",
	name: "saveHouse",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveHouse.__executeServer(opts));
var saveHouse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveHouse_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	const houseRows = await sql.query(`select h.site_id, s.org_id from houses h
         join sites s on s.id = h.site_id
        where h.id = $1`, [data.id]);
	if (!houseRows[0]) throw new Error("Пташник не знайдено");
	await assertSiteOfOrg(sql, profile, houseRows[0].site_id);
	const orgId = houseRows[0].org_id;
	const cap = Math.max(0, Math.round(data.capacity));
	const area = data.areaM2 != null && Number.isFinite(data.areaM2) ? Math.max(0, Math.round(data.areaM2)) : Math.round(cap / 18);
	await sql.query("update houses set name = $2, capacity = $3, area_m2 = $4 where id = $1", [
		data.id,
		data.name.trim(),
		cap,
		area
	]);
	await writeJournal(sql, {
		orgId,
		siteId: houseRows[0].site_id,
		actor: profile,
		action: "update",
		entity: "house",
		summary: `Змінено пташник «${data.name.trim()}»`,
		href: `/houses/${data.id}`
	});
	return { ok: true };
});
var addHouse_createServerFn_handler = createServerRpc({
	id: "59bc09f29fce1107e3823ca94ae18507feb5de11b9b129a3e69e8ee1a04adfad",
	name: "addHouse",
	filename: "src/lib/server/fns.ts"
}, (opts) => addHouse.__executeServer(opts));
var addHouse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(addHouse_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	await assertSiteOfOrg(sql, profile, data.siteId);
	const n = (await loadHouses(sql, [data.siteId])).length + 1;
	const cap = Math.max(1e3, Math.round(data.capacity));
	const rows = await sql.query(`insert into houses (site_id, code, name, capacity, area_m2, sort_order)
       values ($1, $2, $3, $4, $5, $6) returning id`, [
		data.siteId,
		`H${n}`,
		`Пташник ${n}`,
		cap,
		Math.round(cap / 18),
		n
	]);
	await sql.query(`update sites set houses = (select count(*) from houses where site_id = $1),
                        capacity = (select coalesce(sum(capacity),0) from houses where site_id = $1)
        where id = $1`, [data.siteId]);
	await writeJournal(sql, {
		orgId: await siteOrgId(sql, data.siteId),
		siteId: data.siteId,
		actor: profile,
		action: "create",
		entity: "house",
		summary: `Додано пташник ${n}`,
		href: `/houses/${rows[0].id}`
	});
	return {
		ok: true,
		id: rows[0].id
	};
});
async function refreshSiteHouseStats(sql, siteId) {
	await sql.query(`update sites set houses = (select count(*) from houses where site_id = $1),
                      capacity = (select coalesce(sum(capacity),0) from houses where site_id = $1)
      where id = $1`, [siteId]);
}
var deleteHouse_createServerFn_handler = createServerRpc({
	id: "16686053252a12bd85fabf12c59a8bfd076ea4f9d88e4e026353aae498d193dc",
	name: "deleteHouse",
	filename: "src/lib/server/fns.ts"
}, (opts) => deleteHouse.__executeServer(opts));
var deleteHouse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteHouse_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	const house = await sql.query("select id, site_id, name from houses where id = $1", [data.houseId]);
	if (!house[0]) throw new Error("Пташник не знайдено");
	await assertSiteOfOrg(sql, profile, house[0].site_id);
	const flocks = await sql.query("select id, code from flocks where house_id = $1", [data.houseId]);
	if (flocks[0]) throw new Error(`У «${house[0].name}» є посадка ${flocks.map((f) => f.code).join(", ")}. Спочатку відправте її в кошик у Параметрах, тоді можна прибрати пташник.`);
	if (((await sql.query("select count(*)::int as c from houses where site_id = $1", [house[0].site_id]))[0]?.c ?? 0) <= 1) throw new Error("На фабриці має лишитися хоча б один пташник");
	await sql.query("delete from houses where id = $1", [data.houseId]);
	await refreshSiteHouseStats(sql, house[0].site_id);
	await writeJournal(sql, {
		orgId: await siteOrgId(sql, house[0].site_id),
		siteId: house[0].site_id,
		actor: profile,
		action: "delete",
		entity: "house",
		summary: `Прибрано зайвий пташник «${house[0].name}»`
	});
	return { ok: true };
});
var setSiteHouseCount_createServerFn_handler = createServerRpc({
	id: "8dd5a8ddc659e148aa3f1f535e9df6fee8dc0e144c872e278ebbb47f0aea4037",
	name: "setSiteHouseCount",
	filename: "src/lib/server/fns.ts"
}, (opts) => setSiteHouseCount.__executeServer(opts));
var setSiteHouseCount = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(setSiteHouseCount_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	await assertSiteOfOrg(sql, profile, data.siteId);
	const want = Math.min(24, Math.max(1, Math.round(data.houseCount)));
	const houses = await sql.query("select id, name, capacity, sort_order from houses where site_id = $1 order by sort_order, id", [data.siteId]);
	const current = houses.length;
	if (want === current) return {
		ok: true,
		added: 0,
		removed: 0
	};
	if (want > current) {
		const cap = houses.at(-1)?.capacity || 9e3;
		for (let i = current + 1; i <= want; i += 1) await sql.query(`insert into houses (site_id, code, name, capacity, area_m2, sort_order)
           values ($1, $2, $3, $4, $5, $6)`, [
			data.siteId,
			`H${i}`,
			`Пташник ${i}`,
			cap,
			Math.round(cap / 18),
			i
		]);
		await refreshSiteHouseStats(sql, data.siteId);
		await writeJournal(sql, {
			orgId: await siteOrgId(sql, data.siteId),
			siteId: data.siteId,
			actor: profile,
			action: "update",
			entity: "site",
			summary: `Кількість пташників змінено з ${current} на ${want}`
		});
		return {
			ok: true,
			added: want - current,
			removed: 0
		};
	}
	const occupied = await sql.query("select house_id, code from flocks where house_id = any($1::int[])", [houses.map((h) => h.id)]);
	const busy = new Set(occupied.map((r) => r.house_id));
	const extras = [...houses].reverse();
	const toDrop = [];
	for (const h of extras) {
		if (houses.length - toDrop.length <= want) break;
		if (busy.has(h.id)) continue;
		toDrop.push(h.id);
	}
	if (houses.length - toDrop.length > want) {
		const blockers = extras.filter((h) => busy.has(h.id) && !toDrop.includes(h.id)).map((h) => h.name);
		throw new Error(`Не можна зменшити до ${want}: зайняті ${blockers.join(", ")}. Відправте їхні посадки в кошик, тоді повторіть.`);
	}
	for (const id of toDrop) await sql.query("delete from houses where id = $1", [id]);
	await refreshSiteHouseStats(sql, data.siteId);
	await writeJournal(sql, {
		orgId: await siteOrgId(sql, data.siteId),
		siteId: data.siteId,
		actor: profile,
		action: "update",
		entity: "site",
		summary: `Кількість пташників змінено з ${current} на ${want}`
	});
	return {
		ok: true,
		added: 0,
		removed: toDrop.length
	};
});
var placeFlock_createServerFn_handler = createServerRpc({
	id: "bbfc121bb70f59afe797cbb94fb18c6381bb6a476ec67f0654fa3f7e8ac46fd2",
	name: "placeFlock",
	filename: "src/lib/server/fns.ts"
}, (opts) => placeFlock.__executeServer(opts));
var placeFlock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(placeFlock_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const house = await loadHouseById(sql, data.houseId);
	if (!house) throw new Error("Пташник не знайдено");
	await assertSiteOfOrg(sql, profile, house.siteId);
	assertCanManageFlocks(profile, house.siteId);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(data.placedAt)) throw new Error("Некоректна дата посадки");
	if (data.placedAt > todayISO()) throw new Error("Дата посадки не може бути в майбутньому");
	const chicks = Math.round(data.chicksPlaced);
	if (chicks < 1) throw new Error("Вкажіть поголівʼя посадки");
	await sql.query("update flocks set status = 'closed', closed_at = $2 where house_id = $1 and status = 'active'", [data.houseId, todayISO()]);
	const rec = await loadSiteById(sql, house.siteId);
	const code = `П-${data.placedAt.slice(2, 7).replace("-", "")}-${rec?.code ?? house.siteId}${house.code}`;
	const breed = data.breed.trim() || "Ross 308";
	let rows;
	try {
		rows = await sql.query(`insert into flocks (site_id, house_id, code, breed, placed_at, chicks_placed, chick_cost_uah, target_days, target_weight_g, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active') returning id`, [
			house.siteId,
			house.id,
			code,
			breed,
			data.placedAt,
			chicks,
			data.chickCostUah,
			data.targetDays,
			data.targetWeightG
		]);
	} catch (err) {
		const msg = err instanceof Error ? err.message : "";
		if (/unique|duplicate/i.test(msg)) throw new Error("У цьому пташнику вже є активна посадка");
		throw err;
	}
	await writeJournal(sql, {
		orgId: rec?.orgId ?? await siteOrgId(sql, house.siteId),
		siteId: house.siteId,
		actor: profile,
		action: "create",
		entity: "flock",
		summary: `Нова посадка ${code} · ${house.name} · ${chicks} гол. · ${breed}`,
		href: `/houses/${house.id}`
	});
	if (rec?.orgId) await copyOrgCalendarToFlock(sql, rows[0].id, rec.orgId, context.userId);
	return {
		ok: true,
		id: rows[0].id,
		code
	};
});
var saveFlock_createServerFn_handler = createServerRpc({
	id: "2d95db16f5b2cc7262742348b6f5ed1d7d0b7b55172edb42c1d8376872bed439",
	name: "saveFlock",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveFlock.__executeServer(opts));
var saveFlock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveFlock_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const rows = await sql.query(`select ${FLOCK_COLS} from flocks where id = $1`, [data.flockId]);
	if (!rows[0]) throw new Error("Посадку не знайдено");
	const flock = mapFlock(rows[0]);
	await assertSiteOfOrg(sql, profile, flock.siteId);
	assertCanManageFlocks(profile, flock.siteId);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(data.placedAt)) throw new Error("Некоректна дата посадки");
	if (data.placedAt > todayISO()) throw new Error("Дата посадки не може бути в майбутньому");
	const chicks = Math.round(data.chicksPlaced);
	if (chicks < 1) throw new Error("Вкажіть поголівʼя посадки");
	const breed = data.breed.trim();
	if (!breed) throw new Error("Вкажіть крос");
	const reports = (await loadReportsForFlocks(sql, [flock.id])).get(flock.id) ?? [];
	if (reports.some((r) => r.reportDate < data.placedAt)) throw new Error("Є звіти раніше нової дати посадки");
	const spent = reports.reduce((s, r) => s + r.mortality + r.culled + r.soldHead, 0);
	if (chicks <= spent && spent > 0) throw new Error(`Поголівʼя ${chicks} не покриває вже списані ${spent} гол.`);
	await sql.query(`update flocks
          set chicks_placed = $2,
              placed_at = $3,
              breed = $4,
              chick_cost_uah = coalesce($5, chick_cost_uah),
              target_days = coalesce($6, target_days),
              target_weight_g = coalesce($7, target_weight_g)
        where id = $1`, [
		flock.id,
		chicks,
		data.placedAt,
		breed,
		data.chickCostUah ?? null,
		data.targetDays ?? null,
		data.targetWeightG ?? null
	]);
	for (const r of reports) await sql.query("update daily_reports set age_days = $2 where id = $1", [r.id, Math.max(0, diffDays(data.placedAt, r.reportDate))]);
	await rebuildReportHeads(sql, flock.id);
	await syncFlockStatus(sql, flock.id);
	await writeJournal(sql, {
		orgId: await siteOrgId(sql, flock.siteId),
		siteId: flock.siteId,
		actor: profile,
		action: "update",
		entity: "flock",
		summary: `Змінено посадку ${flock.code} · ${chicks} гол. · ${breed} · ${data.placedAt}`,
		href: `/houses/${flock.houseId}`
	});
	return { ok: true };
});
var saveFlockBreed_createServerFn_handler = createServerRpc({
	id: "7f76f21ab79194b4e3750054e15888e79fdd9faf69b0b06a7eccb41d4d367de3",
	name: "saveFlockBreed",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveFlockBreed.__executeServer(opts));
var saveFlockBreed = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveFlockBreed_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const rows = await sql.query("select site_id from flocks where id = $1", [data.flockId]);
	if (!rows[0]) throw new Error("Посадку не знайдено");
	await assertSiteOfOrg(sql, profile, rows[0].site_id);
	assertCanManageFlocks(profile, rows[0].site_id);
	const breed = data.breed.trim();
	if (!breed) throw new Error("Вкажіть крос");
	await sql.query("update flocks set breed = $2 where id = $1", [data.flockId, breed]);
	await writeJournal(sql, {
		orgId: await siteOrgId(sql, rows[0].site_id),
		siteId: rows[0].site_id,
		actor: profile,
		action: "update",
		entity: "flock",
		summary: `Змінено крос посадки на ${breed}`
	});
	return { ok: true };
});
var deleteFlock_createServerFn_handler = createServerRpc({
	id: "13feaf4ee49b9a7f3972e29d8dab7470f5b2f3c998044ce2209a6bcaf39f72c0",
	name: "deleteFlock",
	filename: "src/lib/server/fns.ts"
}, (opts) => deleteFlock.__executeServer(opts));
var deleteFlock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteFlock_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const rows = await sql.query("select site_id from flocks where id = $1", [data.flockId]);
	if (!rows[0]) throw new Error("Посадку не знайдено");
	await assertSiteOfOrg(sql, profile, rows[0].site_id);
	assertCanManageFlocks(profile, rows[0].site_id);
	const archived = await archiveFlock(sql, data.flockId, context.userId);
	await writeJournal(sql, {
		orgId: await siteOrgId(sql, archived.siteId),
		siteId: archived.siteId,
		actor: profile,
		action: "delete",
		entity: "flock",
		summary: `Посадку ${archived.code} відправлено в кошик. Звіти збережено.`,
		href: "/journal"
	});
	return { ok: true };
});
var deleteDailyReport_createServerFn_handler = createServerRpc({
	id: "4419f0e2836165a8e40c4b4ebca7510bddbf74327425fbec4d826cc6d84fc718",
	name: "deleteDailyReport",
	filename: "src/lib/server/fns.ts"
}, (opts) => deleteDailyReport.__executeServer(opts));
var deleteDailyReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteDailyReport_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const peek = await sql.query(`select f.site_id from daily_reports r join flocks f on f.id = r.flock_id where r.id = $1`, [data.reportId]);
	if (!peek[0]) throw new Error("Звіт не знайдено");
	await assertSiteOfOrg(sql, profile, peek[0].site_id);
	if (!canDeleteReports(profile)) throw new Error("Видалити звіт може головний технолог, партнер або адміністратор");
	const archived = await archiveReport(sql, data.reportId, context.userId);
	await rebuildReportHeads(sql, archived.flockId);
	await syncFlockStatus(sql, archived.flockId);
	await writeJournal(sql, {
		orgId: await siteOrgId(sql, archived.siteId),
		siteId: archived.siteId,
		actor: profile,
		action: "delete",
		entity: "report",
		summary: `Звіт ${archived.reportDate} у кошику. Можна повернути з журналу.`,
		href: "/journal"
	});
	return { ok: true };
});
var wipeOperations_createServerFn_handler = createServerRpc({
	id: "c3f7c095b793e070e32f9b60cbda5d013a5d171cf01487e2947d6f5e4870ce34",
	name: "wipeOperations",
	filename: "src/lib/server/fns.ts"
}, (opts) => wipeOperations.__executeServer(opts));
var wipeOperations = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(wipeOperations_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	if (isDemoUser(profile)) throw new Error("Демо не очищає вітрину. Хазяїн сайту оновлює її в розділі Господарства.");
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const n = await archiveOrgFlocks(sql, orgId, context.userId);
	await sql.query("update cost_settings set ops_reset = 1 where org_id = $1", [orgId]);
	await writeJournal(sql, {
		orgId,
		actor: profile,
		action: "delete",
		entity: "org",
		summary: n ? `Посадки (${n}) відправлено в кошик. Звіти можна повернути з журналу.` : "Посадок не було"
	});
	return { ok: true };
});
var getRecycleBin_createServerFn_handler = createServerRpc({
	id: "e1cbaf4b06cdb281c10a2d1399d71d2fa76ff4249a6218854a9e6204838cfe89",
	name: "getRecycleBin",
	filename: "src/lib/server/fns.ts"
}, (opts) => getRecycleBin.__executeServer(opts));
var getRecycleBin = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(getRecycleBin_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const empty = {
		flocks: [],
		reports: []
	};
	if (isDemoUser(profile)) return {
		profile,
		bin: empty
	};
	if (!canManageFlocks(profile) && !canDeleteReports(profile) && !isPlatformAdmin(profile)) return {
		profile,
		bin: empty
	};
	if (isPlatformAdmin(profile) && !data.orgId && !profile.orgId) return {
		profile,
		bin: empty
	};
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	return {
		profile,
		bin: await listRecycleBin(sql, await visibleSiteIds(sql, isPlatformAdmin(profile) ? {
			...profile,
			orgId
		} : profile))
	};
});
var restoreFlock_createServerFn_handler = createServerRpc({
	id: "30a0624a8f2669bbe65baccc4a59de0d7036042fd2808add940a3f2afdf84841",
	name: "restoreFlock",
	filename: "src/lib/server/fns.ts"
}, (opts) => restoreFlock.__executeServer(opts));
var restoreFlock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(restoreFlock_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	if (isDemoUser(profile)) throw new Error("Демо не відновлює посадки");
	await ensureRecycleTables(sql);
	const peek = await sql.query("select site_id from recycle_flocks where id = $1", [data.flockId]);
	if (!peek[0]) throw new Error("У кошику цієї посадки немає");
	await assertSiteOfOrg(sql, profile, peek[0].site_id);
	assertCanManageFlocks(profile, peek[0].site_id);
	const restored = await restoreFlockRow(sql, data.flockId);
	await rebuildReportHeads(sql, data.flockId);
	if (restored.status === "active") await syncFlockStatus(sql, data.flockId);
	await writeJournal(sql, {
		orgId: await siteOrgId(sql, restored.siteId),
		siteId: restored.siteId,
		actor: profile,
		action: "restore",
		entity: "flock",
		summary: restored.status === "closed" ? `Повернуто посадку ${restored.code} в архів пташника — зараз там уже є активна` : `Повернуто посадку ${restored.code} з кошика`,
		href: `/houses/${restored.houseId}`
	});
	return {
		ok: true,
		status: restored.status,
		houseId: restored.houseId
	};
});
var restoreReport_createServerFn_handler = createServerRpc({
	id: "2327f499360d91847cd0dd4dcbd600c03545cdfac34aeb45644281e878e2ff6f",
	name: "restoreReport",
	filename: "src/lib/server/fns.ts"
}, (opts) => restoreReport.__executeServer(opts));
var restoreReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(restoreReport_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	if (isDemoUser(profile)) throw new Error("Демо не відновлює звіти");
	await ensureRecycleTables(sql);
	const peek = await sql.query("select flock_id from recycle_reports where id = $1", [data.reportId]);
	if (!peek[0]) throw new Error("У кошику цього звіту немає");
	const siteId = (await sql.query("select site_id from flocks where id = $1", [peek[0].flock_id]))[0]?.site_id;
	if (siteId) await assertSiteOfOrg(sql, profile, siteId);
	if (!canDeleteReports(profile) && !canManageFlocks(profile)) throw new Error("Повернути звіт може технолог або керівник дільниці");
	const restored = await restoreReportRow(sql, data.reportId);
	await rebuildReportHeads(sql, restored.flockId);
	await syncFlockStatus(sql, restored.flockId);
	await writeJournal(sql, {
		orgId: await siteOrgId(sql, restored.siteId),
		siteId: restored.siteId,
		actor: profile,
		action: "restore",
		entity: "report",
		summary: `Повернуто звіт ${restored.reportDate} з кошика`,
		href: `/houses/${restored.houseId}`
	});
	return {
		ok: true,
		houseId: restored.houseId
	};
});
var getHoldings_createServerFn_handler = createServerRpc({
	id: "80b9a727146bb368f3154aa4d7955141e1dc8348ff4e45b0c104e04c60f8f022",
	name: "getHoldings",
	filename: "src/lib/server/fns.ts"
}, (opts) => getHoldings.__executeServer(opts));
var getHoldings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getHoldings_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertPlatformAdmin(profile);
	const rows = await sql.query(`select o.id, o.name, o.invite_code, o.created_at,
              (select count(*)::int from sites s where s.org_id = o.id) as factories,
              (select count(*)::int from houses h join sites s on s.id = h.site_id where s.org_id = o.id) as houses,
              (select count(*)::int from staff_profiles p where p.org_id = o.id) as staff,
              (select coalesce(p.full_name, p.email)
                 from staff_profiles p
                where p.org_id = o.id and p.role = 'technologist'
                order by p.created_at
                limit 1) as techno,
              coalesce(o.is_demo, false) as is_demo
         from organizations o
        order by o.is_demo desc, o.created_at desc, o.id desc`);
	const today = todayISO();
	const holdings = [];
	for (const r of rows) {
		const head = (await loadFactoryOverviews(sql, await loadSites(sql, r.id), today, await loadCostSettings(sql, r.id), await ensureOrgNorms(sql, r.id))).reduce((s, f) => s + f.head, 0);
		holdings.push({
			id: r.id,
			name: r.name,
			inviteCode: r.invite_code,
			createdAt: String(r.created_at).slice(0, 10),
			factoryCount: Number(r.factories),
			houseCount: Number(r.houses),
			staffCount: Number(r.staff),
			head,
			technoName: r.techno,
			isDemo: Boolean(r.is_demo)
		});
	}
	const d = (await sql.query(`select
         (select count(*)::int from staff_profiles where is_demo = true) as guests,
         (select count(distinct user_id)::int from demo_visits
           where created_at > now() - interval '7 days') as guests_7d,
         (select count(*)::int from demo_visits) as visits,
         (select count(*)::int from demo_visits
           where created_at > now() - interval '1 day') as visits_24h,
         (select count(*)::int from demo_visits
           where created_at > now() - interval '7 days') as visits_7d,
         (select max(created_at) from demo_visits) as last_visit`))[0];
	const last = d?.last_visit ? String(d.last_visit) : null;
	return {
		profile,
		holdings,
		demo: {
			guests: Number(d?.guests ?? 0),
			guests7d: Number(d?.guests_7d ?? 0),
			visits: Number(d?.visits ?? 0),
			visits24h: Number(d?.visits_24h ?? 0),
			visits7d: Number(d?.visits_7d ?? 0),
			lastVisit: last
		}
	};
});
var getHoldingDetail_createServerFn_handler = createServerRpc({
	id: "dadcc7351d23511b3abf6d733bd867f5042fd5c93d0b272910c084db9eae93e7",
	name: "getHoldingDetail",
	filename: "src/lib/server/fns.ts"
}, (opts) => getHoldingDetail.__executeServer(opts));
var getHoldingDetail = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(getHoldingDetail_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertPlatformAdmin(profile);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const orgRows = await sql.query("select id, name, invite_code from organizations where id = $1", [orgId]);
	if (!orgRows[0]) throw new Error("Господарство не знайдено");
	const staffRows = await sql.query("select count(*)::int as c from staff_profiles where org_id = $1", [orgId]);
	const today = todayISO();
	const sites = await loadSites(sql, orgId);
	const costs = await loadCostSettings(sql, orgId);
	const factories = await loadFactoryOverviews(sql, sites, today, costs, await ensureOrgNorms(sql, orgId));
	return {
		profile,
		org: {
			id: orgRows[0].id,
			name: orgRows[0].name,
			inviteCode: orgRows[0].invite_code
		},
		staffCount: num(staffRows[0]?.c),
		factories,
		today,
		thresholds: {
			feedPct: costs.feedAlertPct,
			waterPct: costs.waterAlertPct,
			weightPct: costs.weightAlertPct
		}
	};
});
var createOrganization_createServerFn_handler = createServerRpc({
	id: "e2027fe84129f9e309609e6babe02d94b58fe80cc68de76b23382d5eaf8996cc",
	name: "createOrganization",
	filename: "src/lib/server/fns.ts"
}, (opts) => createOrganization.__executeServer(opts));
var createOrganization = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createOrganization_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertPlatformAdmin(profile);
	if (isDemoUser(profile)) throw new Error("Демо-доступ не створює господарства");
	const { orgId, inviteCode } = await insertOrganization(sql, context.userId, data.name);
	const factory = await insertFactory(sql, orgId, {
		name: data.factoryName,
		location: data.location,
		houseCount: data.houseCount,
		capacity: data.capacity
	});
	await writeJournal(sql, {
		orgId,
		siteId: factory.siteId,
		actor: profile,
		action: "create",
		entity: "org",
		summary: `Створено господарство «${data.name.trim()}» і фабрику «${data.factoryName.trim()}»`,
		href: `/holdings/${orgId}`
	});
	return {
		ok: true,
		orgId,
		inviteCode,
		siteId: factory.siteId,
		siteCode: factory.code
	};
});
var joinOrganization_createServerFn_handler = createServerRpc({
	id: "3a6e281079cd6a196b62c5aa508b177c96d92f67d1495e3f13b1502a2eba7f8e",
	name: "joinOrganization",
	filename: "src/lib/server/fns.ts"
}, (opts) => joinOrganization.__executeServer(opts));
var joinOrganization = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(joinOrganization_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	if (profile.orgId) throw new Error("Ви вже в господарстві");
	if (isDemoUser(profile)) throw new Error("Демо-доступ не входить у робочі господарства");
	if (isPlatformAdmin(profile)) throw new Error("Хазяїн і адміністратор системи не входять за кодом — відкрийте господарство зі списку");
	const code = normalizeInviteCode(data.code);
	if (!isInviteCodeFormat(code)) throw new Error("Код запрошення — 6 символів");
	await sql.query("insert into join_attempts (user_id) values ($1)", [context.userId]);
	const recent = await sql.query(`select count(*)::int as c from join_attempts
        where user_id = $1 and created_at > now() - interval '15 minutes'`, [context.userId]);
	if (num(recent[0]?.c) > 8) throw new Error("Забагато спроб. Зачекайте 15 хвилин.");
	const orgs = await sql.query("select id, name, coalesce(is_demo, false) as is_demo from organizations where invite_code = $1", [code]);
	if (!orgs[0]) throw new Error("Код запрошення не знайдено");
	const role = orgs[0].is_demo ? "technologist" : "pending";
	await sql.query(`update staff_profiles
          set org_id = $2, role = $3, site_id = null, is_demo = $4, is_owner = false, is_admin = false
        where user_id = $1`, [
		context.userId,
		orgs[0].id,
		role,
		orgs[0].is_demo
	]);
	if (orgs[0].is_demo) return {
		ok: true,
		orgId: orgs[0].id,
		orgName: orgs[0].name
	};
	await notifyJoinRequest(sql, {
		orgId: orgs[0].id,
		orgName: orgs[0].name,
		actor: {
			...profile,
			orgId: orgs[0].id,
			orgName: orgs[0].name
		}
	});
	await writeJournal(sql, {
		orgId: orgs[0].id,
		actor: {
			...profile,
			orgId: orgs[0].id,
			orgName: orgs[0].name
		},
		action: "join",
		entity: "staff",
		summary: `Заявка в господарство «${orgs[0].name}»`,
		href: `/team?org=${orgs[0].id}`
	});
	return {
		ok: true,
		orgId: orgs[0].id,
		orgName: orgs[0].name
	};
});
var enterDemo_createServerFn_handler = createServerRpc({
	id: "52cfd821a9e041b3fdf281be52a6c77036aa05ed7b0e7c6acacc1e82fb4d62c0",
	name: "enterDemo",
	filename: "src/lib/server/fns.ts"
}, (opts) => enterDemo.__executeServer(opts));
var enterDemo = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(enterDemo_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	if (isPlatformAdmin(profile) && !isDemoUser(profile)) throw new Error("Ви хазяїн сайту. Відкрийте демо в режимі інкогніто або оновіть вітрину в Господарствах.");
	if (profile.orgId && !isDemoUser(profile)) throw new Error("Ви вже в робочому господарстві. Для демо відкрийте посилання в інкогніто.");
	const { orgId } = await ensureDemoOrg(sql);
	await sql.query(`update staff_profiles
          set org_id = $2,
              role = 'technologist',
              site_id = null,
              is_demo = true,
              is_owner = false,
              is_admin = false,
              full_name = coalesce(nullif(full_name, ''), 'Гість демо')
        where user_id = $1`, [context.userId, orgId]);
	await sql.query("insert into demo_visits (user_id) values ($1)", [context.userId]);
	return {
		ok: true,
		orgId
	};
});
var resetDemo_createServerFn_handler = createServerRpc({
	id: "9389ce64a8c66731d6f76802159f333acef31cbf746f4623186d4d78af7e7fc2",
	name: "resetDemo",
	filename: "src/lib/server/fns.ts"
}, (opts) => resetDemo.__executeServer(opts));
var resetDemo = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(resetDemo_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	assertPlatformAdmin(await ensureProfile(sql, context.userId, hint));
	return {
		ok: true,
		orgId: await resetDemoOrg(sql)
	};
});
var removeStaff_createServerFn_handler = createServerRpc({
	id: "a82429db21e8e1d71644ee0f7c020fb3dd3a02871a5feca1d95e191ce5d5965f",
	name: "removeStaff",
	filename: "src/lib/server/fns.ts"
}, (opts) => removeStaff.__executeServer(opts));
var removeStaff = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(removeStaff_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	if (data.userId === context.userId) throw new Error("Не можна виключити себе");
	const rows = await sql.query(`select user_id, coalesce(is_owner, false) as is_owner, full_name, email
         from staff_profiles where user_id = $1 and org_id = $2`, [data.userId, orgId]);
	if (!rows[0]) throw new Error("Користувача не знайдено в цьому господарстві");
	if (rows[0].is_owner) throw new Error("Хазяїна сайту не можна виключити з господарства");
	await sql.query(`update staff_profiles
          set org_id = null, role = 'pending', site_id = null
        where user_id = $1 and org_id = $2`, [data.userId, orgId]);
	await writeJournal(sql, {
		orgId,
		actor: profile,
		action: "assign",
		entity: "staff",
		summary: `Виключено з господарства: ${rows[0].full_name || rows[0].email || data.userId}`,
		href: "/team"
	});
	return { ok: true };
});
var saveOrganization_createServerFn_handler = createServerRpc({
	id: "e330f532f33da1930b7e6141af1369e9c98ede630eee6cfb63545d65ac2dcc2b",
	name: "saveOrganization",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveOrganization.__executeServer(opts));
var saveOrganization = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveOrganization_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const name = data.name.trim();
	if (name.length < 2) throw new Error("Вкажіть назву господарства");
	await sql.query("update organizations set name = $2 where id = $1", [orgId, name]);
	await writeJournal(sql, {
		orgId,
		actor: profile,
		action: "update",
		entity: "org",
		summary: `Змінено назву господарства на «${name}»`,
		href: `/holdings/${orgId}`
	});
	return { ok: true };
});
var addSite_createServerFn_handler = createServerRpc({
	id: "b080ead8860d606f31c5d89801bcc17c9db86f51b57ce949daa3ead3e9f3659e",
	name: "addSite",
	filename: "src/lib/server/fns.ts"
}, (opts) => addSite.__executeServer(opts));
var addSite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(addSite_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const factory = await insertFactory(sql, orgId, data);
	await writeJournal(sql, {
		orgId,
		siteId: factory.siteId,
		actor: profile,
		action: "create",
		entity: "site",
		summary: `Додано фабрику «${data.name.trim()}»`,
		href: `/sites/${factory.siteId}`
	});
	return {
		ok: true,
		id: factory.siteId,
		code: factory.code
	};
});
var rotateInviteCode_createServerFn_handler = createServerRpc({
	id: "6bdb3fa169e7b614587d6b713eff34cb836dfc938f5d6ba71616b0e1a81b8aec",
	name: "rotateInviteCode",
	filename: "src/lib/server/fns.ts"
}, (opts) => rotateInviteCode.__executeServer(opts));
var rotateInviteCode = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(rotateInviteCode_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertPlatformAdmin(profile);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	let lastError;
	for (let attempt = 0; attempt < 8; attempt += 1) {
		const inviteCode = generateInviteCode();
		try {
			const rows = await sql.query("update organizations set invite_code = $2 where id = $1 returning invite_code", [orgId, inviteCode]);
			if (!rows[0]) throw new Error("Господарство не знайдено");
			await writeJournal(sql, {
				orgId,
				actor: profile,
				action: "update",
				entity: "invite",
				summary: "Оновлено код запрошення господарства",
				href: `/holdings/${orgId}`
			});
			return {
				ok: true,
				inviteCode: rows[0].invite_code
			};
		} catch (err) {
			lastError = err;
		}
	}
	throw lastError instanceof Error ? lastError : /* @__PURE__ */ new Error("Не вдалося оновити код");
});
var deleteOrganization_createServerFn_handler = createServerRpc({
	id: "959c8d768bd0e1e176f089dfb2d96174fbdc44e9b6590ed3492fe775d7d4aebf",
	name: "deleteOrganization",
	filename: "src/lib/server/fns.ts"
}, (opts) => deleteOrganization.__executeServer(opts));
var deleteOrganization = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteOrganization_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertPlatformAdmin(profile);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const rows = await sql.query("select name from organizations where id = $1", [orgId]);
	if (!rows[0]) throw new Error("Господарство не знайдено");
	if (rows[0].name.trim() !== data.confirmName.trim()) throw new Error("Назва не збігається — видалення скасовано");
	await sql.query(`update staff_profiles
          set org_id = null,
              site_id = null,
              role = case when is_owner then role else 'pending' end
        where org_id = $1`, [orgId]);
	await sql.query("delete from organizations where id = $1", [orgId]);
	return { ok: true };
});
var JOURNAL_ACTIONS = /* @__PURE__ */ new Set([
	"create",
	"update",
	"delete",
	"join",
	"assign",
	"restore"
]);
var JOURNAL_ENTITIES = /* @__PURE__ */ new Set([
	"report",
	"flock",
	"house",
	"site",
	"staff",
	"org",
	"invite",
	"feed"
]);
var getJournal_createServerFn_handler = createServerRpc({
	id: "6b7d26430c260c43bc1184deab861ecee4a915ed24912f44f7e63a5f772a2c56",
	name: "getJournal",
	filename: "src/lib/server/fns.ts"
}, (opts) => getJournal.__executeServer(opts));
var getJournal = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(getJournal_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	if (isPlatformAdmin(profile) && !data.orgId && !profile.orgId) return {
		profile,
		events: [],
		sites: []
	};
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const sites = await loadSites(sql, orgId);
	const ids = await visibleSiteIds(sql, isPlatformAdmin(profile) ? {
		...profile,
		orgId
	} : profile);
	const siteFilter = data.siteId && ids.includes(data.siteId) ? [data.siteId] : ids;
	if (!siteFilter.length && !isPlatformAdmin(profile)) return {
		profile,
		events: [],
		sites: []
	};
	const params = [
		orgId,
		data.from,
		data.to
	];
	let sqlExtra = "";
	if (siteFilter.length) {
		const ph = siteFilter.map((_, i) => `$${params.length + 1 + i}`).join(", ");
		sqlExtra += ` and (site_id is null or site_id in (${ph}))`;
		params.push(...siteFilter);
	}
	if (data.action && JOURNAL_ACTIONS.has(data.action)) {
		params.push(data.action);
		sqlExtra += ` and action = $${params.length}`;
	}
	const rows = await sql.query(`select id, org_id, site_id, actor_user_id, actor_name, actor_role, action, entity, summary, href, created_at
         from journal_events
        where org_id = $1
          and created_at >= $2::date
          and created_at < ($3::date + interval '1 day')
          ${sqlExtra}
        order by created_at desc, id desc
        limit 400`, params);
	return {
		profile,
		sites: sites.filter((s) => ids.includes(s.id)),
		events: rows.map((r) => ({
			id: r.id,
			orgId: r.org_id,
			siteId: r.site_id,
			actorUserId: r.actor_user_id,
			actorName: r.actor_name,
			actorRole: r.actor_role,
			action: JOURNAL_ACTIONS.has(r.action) ? r.action : "update",
			entity: JOURNAL_ENTITIES.has(r.entity) ? r.entity : "org",
			summary: r.summary,
			href: r.href,
			createdAt: String(r.created_at)
		}))
	};
});
var getNotifications_createServerFn_handler = createServerRpc({
	id: "08bfe83371565ae3d98a2ebb1336862bd3599da57232773e1897fde3050770ba",
	name: "getNotifications",
	filename: "src/lib/server/fns.ts"
}, (opts) => getNotifications.__executeServer(opts));
var getNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getNotifications_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	await ensureProfile(sql, context.userId, hint);
	const rows = await sql.query(`select id, org_id, kind, title, body, href, read_at, created_at
         from notifications
        where user_id = $1
        order by created_at desc
        limit 40`, [context.userId]);
	const unreadRows = await sql.query("select count(*)::int as c from notifications where user_id = $1 and read_at is null", [context.userId]);
	return {
		unread: num(unreadRows[0]?.c),
		items: rows.map((r) => ({
			id: r.id,
			orgId: r.org_id,
			kind: r.kind === "join" ? "join" : r.kind === "density" ? "density" : r.kind === "handbook" ? "handbook" : "report",
			title: r.title,
			body: r.body,
			href: r.href,
			read: Boolean(r.read_at),
			createdAt: String(r.created_at)
		}))
	};
});
var markNotificationRead_createServerFn_handler = createServerRpc({
	id: "feca8b474a83ce43f1395f8e26c4fa0eccea658c0e4faadacc17d641372d09cc",
	name: "markNotificationRead",
	filename: "src/lib/server/fns.ts"
}, (opts) => markNotificationRead.__executeServer(opts));
var markNotificationRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(markNotificationRead_createServerFn_handler, async ({ context, data }) => {
	await (await getSql()).query(`update notifications
          set read_at = coalesce(read_at, now())
        where id = $1 and user_id = $2`, [data.id, context.userId]);
	return { ok: true };
});
var markAllNotificationsRead_createServerFn_handler = createServerRpc({
	id: "5d4e0a54abf7892680f93a8a8bc82e3a153347b9d7b5d3597a8560e664893ca4",
	name: "markAllNotificationsRead",
	filename: "src/lib/server/fns.ts"
}, (opts) => markAllNotificationsRead.__executeServer(opts));
var markAllNotificationsRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(markAllNotificationsRead_createServerFn_handler, async ({ context }) => {
	await (await getSql()).query(`update notifications
          set read_at = now()
        where user_id = $1 and read_at is null`, [context.userId]);
	return { ok: true };
});
var getHandbook_createServerFn_handler = createServerRpc({
	id: "5d851171e4488a411f688ab2856eac2287aae9c4fc8049baaee8981317ab9f16",
	name: "getHandbook",
	filename: "src/lib/server/fns.ts"
}, (opts) => getHandbook.__executeServer(opts));
var getHandbook = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(getHandbook_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	if (isPlatformAdmin(profile) && !data.orgId && !profile.orgId) return {
		profile,
		articles: [],
		norms: DEFAULT_NORMS,
		canEdit: true,
		treatments: defaultTreatmentCalendar()
	};
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const canEdit = hasTechAccess(profile);
	const [articles, norms, treatments] = await Promise.all([
		loadHandbook(sql, orgId, canEdit),
		ensureOrgNorms(sql, orgId),
		loadOrgTreatmentCalendar(sql, orgId)
	]);
	return {
		profile,
		articles,
		norms,
		canEdit,
		treatments
	};
});
var saveOrgHandbookNorms_createServerFn_handler = createServerRpc({
	id: "f7dc12b5ec55b0f65f07d8e16a677e65e9a56c57d179f88139631ee9aefa57e7",
	name: "saveOrgHandbookNorms",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveOrgHandbookNorms.__executeServer(opts));
var saveOrgHandbookNorms = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveOrgHandbookNorms_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const n = data.norms;
	const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
	const norms = {
		humidityPlaceMin: clamp(Number(n.humidityPlaceMin) || 50, 20, 90),
		humidityPlaceMax: clamp(Number(n.humidityPlaceMax) || 55, 20, 95),
		humidityEarlyUntil: Math.round(clamp(Number(n.humidityEarlyUntil) || 14, 1, 28)),
		humidityEarlyMin: clamp(Number(n.humidityEarlyMin) || 50, 20, 90),
		humidityEarlyMax: clamp(Number(n.humidityEarlyMax) || 60, 20, 95),
		humidityLateMin: clamp(Number(n.humidityLateMin) || 50, 20, 90),
		humidityLateMax: clamp(Number(n.humidityLateMax) || 70, 20, 95),
		densityLimitKgM2: clamp(Number(n.densityLimitKgM2) || 42, 20, 60),
		densityWarnDays: Math.round(clamp(Number(n.densityWarnDays) || 5, 1, 14))
	};
	if (norms.humidityPlaceMin > norms.humidityPlaceMax) throw new Error("Вологість посадки: мін не може бути вищим за макс");
	await saveOrgNorms(sql, orgId, norms, context.userId);
	await writeJournal(sql, {
		orgId,
		actor: profile,
		action: "update",
		entity: "org",
		summary: "Оновлено нормативи вологості і щільності",
		href: "/guide"
	});
	return {
		ok: true,
		norms
	};
});
var saveOrgTreatments_createServerFn_handler = createServerRpc({
	id: "1f3b0c281c2fcdc164098e2bbfcdd764b50fa279444787344a7393ed1e8ed54b",
	name: "saveOrgTreatments",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveOrgTreatments.__executeServer(opts));
var saveOrgTreatments = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveOrgTreatments_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	if (!hasTechAccess(profile) || isDemoUser(profile)) throw new Error("Шаблон календаря змінює головний технолог");
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const saved = await saveOrgTreatmentCalendar(sql, orgId, parseTreatmentCalendar(data.items) ?? [], context.userId);
	await writeJournal(sql, {
		orgId,
		actor: profile,
		action: "update",
		entity: "org",
		summary: "Оновлено шаблон календаря обробок",
		href: "/guide"
	});
	return {
		ok: true,
		items: saved
	};
});
var saveFlockTreatments_createServerFn_handler = createServerRpc({
	id: "09240c93257256a5f8cbae1d4e9a062d90d3f1bb3f6af96ede9927ada6681e7b",
	name: "saveFlockTreatments",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveFlockTreatments.__executeServer(opts));
var saveFlockTreatments = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveFlockTreatments_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	if (isDemoUser(profile)) throw new Error("Демо не змінює календар");
	const rows = await sql.query("select site_id, house_id from flocks where id = $1", [data.flockId]);
	if (!rows[0]) throw new Error("Посадку не знайдено");
	await assertSiteOfOrg(sql, profile, rows[0].site_id);
	if (!canEditTreatments(profile)) throw new Error("Календар змінює технолог або ветлікар");
	const items = parseTreatmentCalendar(data.items) ?? [];
	const saved = await saveFlockTreatmentCalendar(sql, data.flockId, items, context.userId);
	await writeJournal(sql, {
		orgId: await siteOrgId(sql, rows[0].site_id),
		siteId: rows[0].site_id,
		actor: profile,
		action: "update",
		entity: "flock",
		summary: "Змінено календар обробок посадки",
		href: `/houses/${rows[0].house_id}`
	});
	return {
		ok: true,
		items: saved
	};
});
var saveHandbookArticle_createServerFn_handler = createServerRpc({
	id: "9dae6782b1a222fe056ba21bb28af8b6ef85d2c6e34479d2156767d16909c22d",
	name: "saveHandbookArticle",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveHandbookArticle.__executeServer(opts));
var saveHandbookArticle = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveHandbookArticle_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const question = data.question.trim();
	if (question.length < 8) throw new Error("Сформулюйте питання");
	await sql.query(`update handbook_articles
          set question = $3,
              answer_tech = $4,
              answer_vet = $5,
              category = $6,
              hidden = $7,
              priority = coalesce($8, priority),
              status = 'published',
              updated_at = now()
        where id = $1 and org_id = $2`, [
		data.id,
		orgId,
		question,
		data.answerTech.trim(),
		data.answerVet.trim(),
		data.category,
		Boolean(data.hidden),
		data.priority == null ? null : Boolean(data.priority)
	]);
	return { ok: true };
});
var setHandbookPriority_createServerFn_handler = createServerRpc({
	id: "e961932cda882887e0737ff4994807a65ab129ab246f1387f551b7ec70f30b54",
	name: "setHandbookPriority",
	filename: "src/lib/server/fns.ts"
}, (opts) => setHandbookPriority.__executeServer(opts));
var setHandbookPriority = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(setHandbookPriority_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertTechnologist(profile);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	await sql.query(`update handbook_articles set priority = $3, updated_at = now() where id = $1 and org_id = $2`, [
		data.id,
		orgId,
		data.priority
	]);
	return { ok: true };
});
var askHandbookQuestion_createServerFn_handler = createServerRpc({
	id: "bfd6cafadea511792ec416d188fe4cd5e30f7dfe9a116cd80a02fdd8b47cbe0e",
	name: "askHandbookQuestion",
	filename: "src/lib/server/fns.ts"
}, (opts) => askHandbookQuestion.__executeServer(opts));
var askHandbookQuestion = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(askHandbookQuestion_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const question = data.question.trim();
	if (question.length < 8) throw new Error("Напишіть питання повністю");
	const slug = `q-${Date.now().toString(36)}`;
	await sql.query(`insert into handbook_articles
         (org_id, slug, category, question, answer_tech, answer_vet, sort_order, status, asked_by)
       values ($1,$2,$3,$4,'','',900,'question',$5)`, [
		orgId,
		slug,
		data.category,
		question,
		context.userId
	]);
	await notifyHandbookQuestion(sql, {
		orgId,
		question,
		actor: profile
	});
	return { ok: true };
});
var getFeedTool_createServerFn_handler = createServerRpc({
	id: "5d47bd1246f8558043152caf11a7f9a044ae5cf435440078944cfd52707d3db4",
	name: "getFeedTool",
	filename: "src/lib/server/fns.ts"
}, (opts) => getFeedTool.__executeServer(opts));
var getFeedTool = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(getFeedTool_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	if (isPlatformAdmin(profile) && !data.orgId && !profile.orgId) return {
		profile,
		sites: [],
		analyses: []
	};
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const allSites = await loadSites(sql, orgId);
	const ids = await visibleSiteIds(sql, isPlatformAdmin(profile) ? {
		...profile,
		orgId
	} : profile);
	const sites = allSites.filter((s) => ids.includes(s.id));
	return {
		profile,
		sites,
		analyses: (await sql.query(`select id, site_id, phase, name, lab_date, values_json, score, severity, headline, submitted_by, created_at
         from feed_analyses
        where org_id = $1
        order by created_at desc
        limit 40`, [orgId])).filter((r) => !r.site_id || ids.includes(r.site_id)).map((r) => {
			let values = {};
			try {
				values = JSON.parse(r.values_json || "{}");
			} catch {
				values = {};
			}
			return {
				id: r.id,
				siteId: r.site_id,
				siteName: sites.find((s) => s.id === r.site_id)?.name ?? null,
				phase: r.phase ?? "starter",
				name: r.name,
				labDate: r.lab_date,
				values: parseFeedValues(values),
				score: Number(r.score) || 0,
				severity: [
					"ok",
					"watch",
					"warn",
					"critical"
				].includes(r.severity) ? r.severity : "ok",
				headline: r.headline,
				submittedBy: r.submitted_by,
				createdAt: String(r.created_at)
			};
		})
	};
});
var saveFeedAnalysis_createServerFn_handler = createServerRpc({
	id: "664c5cc1339170a0ce6b2c59cfa92a02b76e7e340b34ad50183433f955a288db",
	name: "saveFeedAnalysis",
	filename: "src/lib/server/fns.ts"
}, (opts) => saveFeedAnalysis.__executeServer(opts));
var saveFeedAnalysis = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveFeedAnalysis_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const phase = data.phase;
	if (![
		"prestarter",
		"starter",
		"grower",
		"finisher"
	].includes(phase)) throw new Error("Оберіть фазу раціону");
	const values = parseFeedValues(data.values);
	const verdict = evaluateFeed(phase, values);
	if (!verdict) throw new Error("Вкажіть хоча б один показник з протоколу");
	let siteId = data.siteId && data.siteId > 0 ? data.siteId : null;
	if (siteId) await assertSiteOfOrg(sql, profile, siteId);
	const name = data.name.trim().slice(0, 80) || `${feedPhaseLabel(phase)} · ${todayISO()}`;
	const labDate = data.labDate && /^\d{4}-\d{2}-\d{2}$/.test(data.labDate) ? data.labDate : null;
	const rows = await sql.query(`insert into feed_analyses
         (org_id, site_id, phase, name, lab_date, values_json, score, severity, headline, submitted_by)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       returning id`, [
		orgId,
		siteId,
		phase,
		name,
		labDate,
		JSON.stringify(values),
		verdict.score,
		verdict.severity,
		verdict.headline,
		context.userId
	]);
	await writeJournal(sql, {
		orgId,
		siteId,
		actor: profile,
		action: "create",
		entity: "feed",
		summary: `Аналіз корму «${name}»: ${verdict.score} · ${verdict.headline}`,
		href: "/feed"
	});
	return {
		ok: true,
		id: rows[0]?.id ?? 0,
		verdict
	};
});
var deleteFeedAnalysis_createServerFn_handler = createServerRpc({
	id: "c7df16bc5afa2c003a994b3f4d94b8310e523d9e428bd792fd364c1ed2366894",
	name: "deleteFeedAnalysis",
	filename: "src/lib/server/fns.ts"
}, (opts) => deleteFeedAnalysis.__executeServer(opts));
var deleteFeedAnalysis = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteFeedAnalysis_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const row = (await sql.query("select submitted_by, name from feed_analyses where id = $1 and org_id = $2", [data.id, orgId]))[0];
	if (!row) throw new Error("Аналіз не знайдено");
	if (!hasTechAccess(profile) && row.submitted_by !== context.userId) throw new Error("Можна видалити лише свій аналіз");
	await sql.query("delete from feed_analyses where id = $1 and org_id = $2", [data.id, orgId]);
	await writeJournal(sql, {
		orgId,
		actor: profile,
		action: "delete",
		entity: "feed",
		summary: `Видалено аналіз корму «${row.name}»`,
		href: "/feed"
	});
	return { ok: true };
});
var getPlatformStaff_createServerFn_handler = createServerRpc({
	id: "0980f41e569d76ad2efbd25b69c1802620cb1405461caa0e83ef0a08d1dc7e42",
	name: "getPlatformStaff",
	filename: "src/lib/server/fns.ts"
}, (opts) => getPlatformStaff.__executeServer(opts));
var getPlatformStaff = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getPlatformStaff_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertPlatformAdmin(profile);
	return {
		profile,
		people: (await sql.query(`select p.user_id, p.full_name, p.email,
              coalesce(p.is_owner, false) as is_owner,
              coalesce(p.is_admin, false) as is_admin,
              o.name as org_name
         from staff_profiles p
         left join organizations o on o.id = p.org_id
        order by p.is_owner desc, p.is_admin desc, p.created_at`)).map((r) => ({
			userId: r.user_id,
			fullName: r.full_name,
			email: r.email,
			isOwner: Boolean(r.is_owner),
			isAdmin: Boolean(r.is_admin),
			orgName: r.org_name
		}))
	};
});
var setPlatformAdmin_createServerFn_handler = createServerRpc({
	id: "b2a30d7484ccc901721ed6e36f049df7d29068bb7061460e0d0be069ab0521fe",
	name: "setPlatformAdmin",
	filename: "src/lib/server/fns.ts"
}, (opts) => setPlatformAdmin.__executeServer(opts));
var setPlatformAdmin = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(setPlatformAdmin_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertPlatformOwner(profile);
	if (data.userId === context.userId) throw new Error("Хазяїн сайту вже має повний доступ");
	const row = (await sql.query("select user_id, coalesce(is_owner, false) as is_owner, full_name, email from staff_profiles where user_id = $1", [data.userId]))[0];
	if (!row) throw new Error("Користувача не знайдено");
	if (row.is_owner) throw new Error("Хазяїна сайту не можна змінити цим призначенням");
	if ((await sql.query("select coalesce(is_demo, false) as is_demo from staff_profiles where user_id = $1", [data.userId]))[0]?.is_demo) throw new Error("Демо-гостя не призначають адміністратором");
	await sql.query("update staff_profiles set is_admin = $2 where user_id = $1", [data.userId, data.admin]);
	const who = row.full_name || row.email || data.userId;
	if (profile.orgId) await writeJournal(sql, {
		orgId: profile.orgId,
		actor: profile,
		action: "assign",
		entity: "staff",
		summary: data.admin ? `Призначено адміністратора системи: ${who}` : `Знято роль адміністратора системи: ${who}`,
		href: "/holdings"
	});
	return { ok: true };
});
var MAX_OWNERS = 3;
async function ownerCount(sql) {
	const rows = await sql.query("select count(*)::int as c from staff_profiles where coalesce(is_owner, false) = true");
	return Number(rows[0]?.c ?? 0);
}
var createBackupOwner_createServerFn_handler = createServerRpc({
	id: "89bceab0ef1b1dcfa496b8ff683580d2a46bd4e75f67abb28d1c8f40360e96d6",
	name: "createBackupOwner",
	filename: "src/lib/server/fns.ts"
}, (opts) => createBackupOwner.__executeServer(opts));
var createBackupOwner = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createBackupOwner_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	assertPlatformOwner(await ensureProfile(sql, context.userId, hint));
	try {
		await sql.query("drop index if exists staff_profiles_one_owner_idx");
	} catch (err) {
		console.error("[owner] drop unique index", err);
	}
	const email = data.email.trim().toLowerCase();
	data.name.trim();
	const password = data.password;
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Вкажіть справжню пошту");
	if (password.length < 10) throw new Error("Пароль щонайменше 10 символів");
	if (password.length > 72) throw new Error("Пароль занадто довгий");
	if (await ownerCount(sql) >= MAX_OWNERS) throw new Error("Уже є максимум запасних хазяїнів");
	throw new Error("Зареєструйте запасний вхід на сторінці /login (пошта і пароль), потім призначте цього користувача хазяїном у списку нижче.");
});
var setPlatformOwner_createServerFn_handler = createServerRpc({
	id: "60f09bcfa9c7b67e7f522800380aec7e6f56e4f68401ead744a0a6c9e53d4fe9",
	name: "setPlatformOwner",
	filename: "src/lib/server/fns.ts"
}, (opts) => setPlatformOwner.__executeServer(opts));
var setPlatformOwner = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(setPlatformOwner_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	assertPlatformOwner(profile);
	try {
		await sql.query("drop index if exists staff_profiles_one_owner_idx");
	} catch (err) {
		console.error("[owner] drop unique index", err);
	}
	if (data.userId === context.userId && !data.owner) throw new Error("Не можна зняти права з себе. Спочатку увійдіть запасним записом.");
	const row = (await sql.query(`select user_id, coalesce(is_owner, false) as is_owner, coalesce(is_demo, false) as is_demo,
              full_name, email
         from staff_profiles where user_id = $1`, [data.userId]))[0];
	if (!row) throw new Error("Користувача не знайдено");
	if (row.is_demo) throw new Error("Демо-гостя не роблять хазяїном");
	if (data.owner) {
		if (await ownerCount(sql) >= MAX_OWNERS) throw new Error("Уже є максимум хазяїнів сайту");
		await sql.query("update staff_profiles set is_owner = true, is_admin = true where user_id = $1", [data.userId]);
	} else {
		if (await ownerCount(sql) <= 1) throw new Error("Має лишитися хоча б один хазяїн сайту");
		await sql.query("update staff_profiles set is_owner = false where user_id = $1", [data.userId]);
	}
	const who = row.full_name || row.email || data.userId;
	if (profile.orgId) await writeJournal(sql, {
		orgId: profile.orgId,
		actor: profile,
		action: "assign",
		entity: "staff",
		summary: data.owner ? `Призначено запасного хазяїна: ${who}` : `Знято права хазяїна: ${who}`,
		href: "/holdings"
	});
	return { ok: true };
});
function publicOrigin() {
	try {
		const req = getRequest();
		const host = (req?.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || req?.headers.get("host") || "").split(":")[0]?.trim();
		if (!host || host === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return "https://ptakhozvit.com.ua";
		return `${req?.headers.get("x-forwarded-proto") || "https"}://${host}`;
	} catch {
		return "https://ptakhozvit.com.ua";
	}
}
async function ensureSheetsToken(sql, orgId) {
	const rows = await sql.query("select sheets_token from organizations where id = $1", [orgId]);
	if (rows[0]?.sheets_token) return rows[0].sheets_token;
	for (let i = 0; i < 8; i += 1) {
		const token = generateSheetsToken();
		try {
			const updated = await sql.query(`update organizations set sheets_token = $2
          where id = $1 and sheets_token is null
          returning sheets_token`, [orgId, token]);
			if (updated[0]?.sheets_token) return updated[0].sheets_token;
		} catch {}
	}
	throw new Error("Не вдалося створити посилання для Google Sheets");
}
var getSheetsIntegration_createServerFn_handler = createServerRpc({
	id: "10c9e7f3e733e97bf0453df15e5968c6ecdb7f93dea85fb80a4fcc49ba12cc9d",
	name: "getSheetsIntegration",
	filename: "src/lib/server/fns.ts"
}, (opts) => getSheetsIntegration.__executeServer(opts));
var getSheetsIntegration = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(getSheetsIntegration_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	if (!canManageOps(profile) && !isPlatformAdmin(profile)) throw new Error("Лише технолог, партнер або адміністратор");
	const token = await ensureSheetsToken(sql, await resolveOrgId(sql, profile, data.orgId));
	const origin = publicOrigin();
	const todayUrl = `${origin}/api/sheets/${token}?kind=today`;
	const periodUrl = `${origin}/api/sheets/${token}?kind=period`;
	return {
		profile,
		token,
		origin,
		feeds: [{
			kind: "today",
			label: "Зведення на сьогодні",
			url: todayUrl,
			formula: `=IMPORTDATA("${todayUrl}")`
		}, {
			kind: "period",
			label: "Щоденні звіти за 14 діб",
			url: periodUrl,
			formula: `=IMPORTDATA("${periodUrl}")`
		}]
	};
});
var rotateSheetsToken_createServerFn_handler = createServerRpc({
	id: "bb32b5f07b2dffff709608fc96f5bb4c272f94b51f3e8e2e49242a34933f7cff",
	name: "rotateSheetsToken",
	filename: "src/lib/server/fns.ts"
}, (opts) => rotateSheetsToken.__executeServer(opts));
var rotateSheetsToken = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(rotateSheetsToken_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hint = await sessionHint(sql, context.userId);
	const profile = await ensureProfile(sql, context.userId, hint);
	if (!canManageOps(profile) && !isPlatformAdmin(profile)) throw new Error("Лише технолог, партнер або адміністратор");
	const orgId = await resolveOrgId(sql, profile, data.orgId);
	const token = generateSheetsToken();
	await sql.query("update organizations set sheets_token = $2 where id = $1", [orgId, token]);
	await writeJournal(sql, {
		orgId,
		actor: profile,
		action: "update",
		entity: "org",
		summary: "Оновлено посилання для Google Sheets",
		href: "/settings"
	});
	return {
		ok: true,
		token
	};
});
//#endregion
export { addHouse_createServerFn_handler, addSite_createServerFn_handler, askHandbookQuestion_createServerFn_handler, assignStaff_createServerFn_handler, createBackupOwner_createServerFn_handler, createOrganization_createServerFn_handler, deleteDailyReport_createServerFn_handler, deleteFeedAnalysis_createServerFn_handler, deleteFlock_createServerFn_handler, deleteHouse_createServerFn_handler, deleteOrganization_createServerFn_handler, enterDemo_createServerFn_handler, getCostTool_createServerFn_handler, getDashboard_createServerFn_handler, getFeedTool_createServerFn_handler, getHandbook_createServerFn_handler, getHoldingDetail_createServerFn_handler, getHoldings_createServerFn_handler, getHouseDetail_createServerFn_handler, getJournal_createServerFn_handler, getMe_createServerFn_handler, getNotifications_createServerFn_handler, getPeriodReport_createServerFn_handler, getPlatformStaff_createServerFn_handler, getRecycleBin_createServerFn_handler, getReportPrefill_createServerFn_handler, getSettings_createServerFn_handler, getSheetsIntegration_createServerFn_handler, getSiteDetail_createServerFn_handler, getTeam_createServerFn_handler, joinOrganization_createServerFn_handler, markAllNotificationsRead_createServerFn_handler, markNotificationRead_createServerFn_handler, placeFlock_createServerFn_handler, removeStaff_createServerFn_handler, resetDemo_createServerFn_handler, restoreFlock_createServerFn_handler, restoreReport_createServerFn_handler, rotateInviteCode_createServerFn_handler, rotateSheetsToken_createServerFn_handler, saveCosts_createServerFn_handler, saveDailyReport_createServerFn_handler, saveFeedAnalysis_createServerFn_handler, saveFlockBreed_createServerFn_handler, saveFlockTreatments_createServerFn_handler, saveFlock_createServerFn_handler, saveHandbookArticle_createServerFn_handler, saveHouse_createServerFn_handler, saveMyProfile_createServerFn_handler, saveOrgHandbookNorms_createServerFn_handler, saveOrgTreatments_createServerFn_handler, saveOrganization_createServerFn_handler, saveSiteGeo_createServerFn_handler, saveSite_createServerFn_handler, searchPlaces_createServerFn_handler, setHandbookPriority_createServerFn_handler, setPlatformAdmin_createServerFn_handler, setPlatformOwner_createServerFn_handler, setSiteHouseCount_createServerFn_handler, wipeOperations_createServerFn_handler };
