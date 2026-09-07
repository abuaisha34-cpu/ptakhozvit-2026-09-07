import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as fmtNum, n as cn, o as fmtDateShort } from "./org-DsT_3HSb.mjs";
import { et as saveSiteGeo, tt as searchPlaces } from "./fns-aaDGwzaQ.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { t as Input } from "./input-x1ihG6i4.mjs";
import { F as Cloud, I as CloudRain, L as CloudLightning, M as Droplets, P as Cloudy, R as CloudFog, h as Snowflake, p as Sun, r as Wind } from "../_libs/lucide-react.mjs";
import { t as StatusBadge } from "./badge-C54FFsVZ.mjs";
import { t as buildClimateAdvice } from "./climate-D8vYDIpX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/weather-panel-nJeJGT7J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KIND_ICON = {
	clear: Sun,
	partly: Cloud,
	cloudy: Cloudy,
	rain: CloudRain,
	snow: Snowflake,
	thunder: CloudLightning,
	fog: CloudFog
};
function GeoPicker({ siteId, current, onSaved }) {
	const [q, setQ] = (0, import_react.useState)(current ?? "");
	const [hits, setHits] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const t = window.setTimeout(() => {
			const query = q.trim();
			if (query.length < 2) {
				setHits([]);
				return;
			}
			searchPlaces({ data: { query } }).then(setHits).catch(() => setHits([]));
		}, 280);
		return () => window.clearTimeout(t);
	}, [q]);
	async function pick(hit) {
		setBusy(true);
		setErr(null);
		try {
			await saveSiteGeo({ data: {
				siteId,
				geoName: hit.name,
				geoAdmin: hit.admin,
				lat: hit.lat,
				lon: hit.lon
			} });
			setQ(hit.label);
			setOpen(false);
			await onSaved();
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Не збережено");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				placeholder: "Місто або село фабрики",
				"aria-label": "Населений пункт",
				autoComplete: "off",
				onChange: (e) => {
					setQ(e.target.value);
					setOpen(true);
				},
				onFocus: () => setOpen(true)
			}),
			open && hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-[12px] bg-surface p-1 shadow-[var(--shadow-border-hover)]",
				children: hits.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					className: "flex h-11 w-full items-center rounded-[10px] px-3 text-left text-sm text-fg hover:bg-bg",
					onClick: () => void pick(h),
					children: h.label
				}) }, `${h.lat},${h.lon}`))
			}) : null,
			err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-bad",
				children: err
			}) : null
		]
	});
}
function WeatherPanel({ siteId, geoName, canSetGeo, weather, weatherError, reportDate, ageDays, houseTempMin, houseTempMax, indoorMin, indoorMax, indoorHumidity, humidityMin, humidityMax, onGeoSaved }) {
	const climate = (0, import_react.useMemo)(() => {
		if (!weather?.selected || houseTempMin == null || houseTempMax == null) return null;
		return buildClimateAdvice({
			ageDays,
			houseTempMin,
			houseTempMax,
			indoorMin,
			indoorMax,
			indoorHumidity,
			outdoor: weather.selected,
			upcoming: weather.days,
			humidityMin: humidityMin ?? void 0,
			humidityMax: humidityMax ?? void 0
		});
	}, [
		weather,
		ageDays,
		houseTempMin,
		houseTempMax,
		indoorMin,
		indoorMax,
		indoorHumidity,
		humidityMin,
		humidityMax
	]);
	if (!geoName && !weather) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Погода і мікроклімат" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Вкажіть населений пункт фабрики — підтягнеться прогноз, і з нього будуть рекомендації для залу за віком птиці."
		}),
		canSetGeo && siteId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeoPicker, {
				siteId,
				onSaved: onGeoSaved
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted",
			children: "Населений пункт задає керівник фабрики або технолог у «Посадках»."
		})
	] });
	const day = weather?.selected;
	const Icon = day ? KIND_ICON[day.kind] : Cloud;
	const upcoming = weather?.days.filter((d) => d.date !== day?.date).slice(0, 3) ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Погода надворі" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						weather?.place ?? geoName,
						day ? ` · ${fmtDateShort(day.date)}` : "",
						reportDate && day && day.date !== reportDate ? " · найближчий прогноз" : ""
					]
				})] }), climate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: climate.severity }) : null]
			}),
			weatherError && !day ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-bad",
				children: weatherError
			}) : null,
			day ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: Icon,
						k: day.label,
						v: `${fmtNum(day.tempMax, 0)}° / ${fmtNum(day.tempMin, 0)}°`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: Wind,
						k: "Вітер",
						v: `${fmtNum(day.windMaxMs, 1)} м/с`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: Droplets,
						k: "Вологість",
						v: day.humidityMean != null ? `${fmtNum(day.humidityMean, 0)}%` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: CloudRain,
						k: "Опади",
						v: day.precipMm > 0 ? `${fmtNum(day.precipMm, 1)} мм` : "без опадів"
					})
				]
			}), upcoming.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: upcoming.map((d) => {
					const DIcon = KIND_ICON[d.kind];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-[7.5rem] rounded-[16px] bg-bg px-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: fmtDateShort(d.date)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 flex items-center gap-1.5 text-sm tabular-nums text-fg",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DIcon, {
										className: "size-3.5 text-muted",
										strokeWidth: 1.75
									}),
									fmtNum(d.tempMax, 0),
									"°/",
									fmtNum(d.tempMin, 0),
									"°"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: d.label
							})
						]
					}, d.date);
				})
			}) : null] }) : null,
			climate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[16px] bg-bg p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-subtle",
						children: ["Мікроклімат · ", climate.ageBand]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-lg font-medium leading-snug tracking-tight text-fg",
						children: climate.headline
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"Норма в залі ",
							fmtNum(climate.houseTempMin, 0),
							"–",
							fmtNum(climate.houseTempMax, 0),
							" °C · RH",
							" ",
							climate.humidityMin,
							"–",
							climate.humidityMax,
							"%",
							day ? ` · надворі ${fmtNum(day.tempMin, 0)}–${fmtNum(day.tempMax, 0)} °C` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-3",
						children: climate.items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("font-medium", tone(it.severity)),
								children: it.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 leading-relaxed text-muted",
								children: it.detail
							})]
						}, it.title))
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Відкрийте посадку — рекомендації підуть від доби життя птиці."
			}),
			canSetGeo && siteId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-1 text-xs text-subtle",
				children: "Змінити населений пункт"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeoPicker, {
				siteId,
				current: geoName,
				onSaved: onGeoSaved
			})] }) : null
		]
	});
}
function Metric({ icon: Icon, k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[16px] bg-bg px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-1.5 text-xs uppercase tracking-wide text-subtle",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: "size-3.5",
				strokeWidth: 1.75
			}), k]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm tabular-nums text-fg",
			children: v
		})]
	});
}
function tone(s) {
	if (s === "critical") return "text-bad";
	if (s === "warn") return "text-warn";
	if (s === "watch") return "text-watch";
	return "text-fg";
}
function FactoryWeatherLine({ place, weather, climate }) {
	if (!weather && !place) return null;
	const Icon = weather ? KIND_ICON[weather.kind] : Cloud;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 space-y-1",
		children: [weather ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-1.5 text-sm text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-3.5 shrink-0",
					strokeWidth: 1.75
				}),
				"Надворі",
				place ? ` ${place}` : "",
				": ",
				fmtNum(weather.tempMax, 0),
				"° / ",
				fmtNum(weather.tempMin, 0),
				"° ·",
				" ",
				weather.label
			]
		}) : place ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: place
		}) : null, climate && climate.severity !== "ok" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("text-sm", tone(climate.severity)),
			children: climate.headline
		}) : null]
	});
}
//#endregion
export { GeoPicker as n, WeatherPanel as r, FactoryWeatherLine as t };
