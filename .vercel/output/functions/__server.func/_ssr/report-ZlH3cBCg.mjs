import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as canManageFlocks } from "./roles-BISHNnDi.mjs";
import { a as fmtDate, c as fmtNum, l as fmtPct, n as cn, o as fmtDateShort, s as fmtInt } from "./org-DsT_3HSb.mjs";
import { D as getReportPrefill, U as saveDailyReport } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { i as Textarea, n as Label, r as Select, t as Input } from "./input-x1ihG6i4.mjs";
import { S as Plus, t as X } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
import { i as houseDailyForecast } from "./standards-DCoZ9WxY.mjs";
import { c as Route$9 } from "./router-CKSXmWZm.mjs";
import { t as StatusBadge } from "./badge-C54FFsVZ.mjs";
import { a as litterLabel, i as droppingLabel, n as LITTER_STATES, o as parseDroppingLook, r as buildLitterAdvice, s as parseLitterState, t as DROPPING_LOOKS } from "./litter-D5RpUDRr.mjs";
import { a as unitLabel, i as parseWaterMeds, n as WATER_MED_GROUPS, o as waterMedById, t as WATER_MEDS } from "./water-meds-a1fez1uw.mjs";
import { a as saleAvgWeightG, n as fcrAtSale } from "./calc-pmcuGk45.mjs";
import { r as WeatherPanel } from "./weather-panel-nJeJGT7J.mjs";
import { t as NumberField } from "./number-field-DR-0SZDk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/report-ZlH3cBCg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LitterCheck({ look, state, ageDays, previousLook, previousState, onLook, onState }) {
	const advice = buildLitterAdvice(parseDroppingLook(look), parseLitterState(state), ageDays);
	const yesterday = previousLook || previousState ? `Учора: ${droppingLabel(previousLook)} · ${litterLabel(previousState)}` : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Послід і підстилка" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Обовʼязково. Оберіть, як виглядає послід і який стан підстилки в залі — тоді зʼявляться дії для технолога і ветеринара."
				}),
				yesterday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-subtle",
					children: yesterday
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "mb-2 text-xs font-medium uppercase tracking-wide text-subtle",
					children: "Вигляд посліду"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					role: "group",
					"aria-label": "Вигляд посліду",
					children: DROPPING_LOOKS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						selected: look === o.id,
						label: o.label,
						onClick: () => onLook(o.id)
					}, o.id))
				}),
				look ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: DROPPING_LOOKS.find((o) => o.id === look)?.hint
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "mb-2 text-xs font-medium uppercase tracking-wide text-subtle",
					children: "Стан підстилки"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					role: "group",
					"aria-label": "Стан підстилки",
					children: LITTER_STATES.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						selected: state === o.id,
						label: o.label,
						onClick: () => onState(o.id)
					}, o.id))
				}),
				state ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: LITTER_STATES.find((o) => o.id === state)?.hint
				}) : null
			] }),
			advice ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 rounded-[16px] bg-bg p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: advice.severity }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							advice.lookLabel,
							" · ",
							advice.litterLabel
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdviceCol, {
						title: "Технологічний підхід",
						items: advice.tech
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdviceCol, {
						title: "Ветеринарний підхід",
						items: advice.vet
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Оберіть обидва пункти — рекомендації зʼявляться одразу."
			})
		]
	});
}
function Choice({ selected, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": selected,
		onClick,
		className: cn("inline-flex min-h-11 items-center rounded-[12px] px-3 text-left text-sm transition-colors duration-150", selected ? "bg-primary text-primary-fg" : "bg-bg text-fg hover:bg-surface-2"),
		children: label
	});
}
function AdviceCol({ title, items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs font-medium uppercase tracking-wide text-subtle",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 space-y-2",
		children: items.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "text-sm leading-relaxed text-fg",
			children: t
		}, t))
	})] });
}
function uid() {
	return Math.random().toString(36).slice(2, 9);
}
function draftsFromDoses(doses) {
	return doses.map((d) => ({
		uid: uid(),
		prepId: d.prepId,
		conc: String(d.conc),
		customName: d.prepId === "custom" ? d.name : ""
	}));
}
function WaterMedsField({ none, rows, onNone, onRows }) {
	function setRow(uid, patch) {
		onRows(rows.map((r) => r.uid === uid ? {
			...r,
			...patch
		} : r));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Випоювання" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Які препарати стоять у воду сьогодні і яка концентрація на 1 м³. Список розділений по групах."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "mt-4 flex min-h-11 cursor-pointer items-center gap-2 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "checkbox",
				className: "size-4 accent-primary",
				checked: none,
				onChange: (e) => onNone(e.target.checked)
			}), "Випоювання сьогодні немає"]
		}),
		none ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-xs text-muted",
			children: "У журнал піде відмітка, що воду не медикаментували."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-3",
			children: [rows.map((row) => {
				const item = waterMedById(row.prepId);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[16px] bg-bg p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-[1fr_7rem_auto] sm:items-end",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Препарат" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: row.prepId,
								onChange: (e) => {
									const next = e.target.value;
									const cat = waterMedById(next);
									setRow(row.uid, {
										prepId: next,
										customName: next === "custom" ? row.customName : "",
										conc: row.conc || (cat?.typical.match(/\d+/)?.[0] ?? "")
									});
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Оберіть зі списку"
								}), WATER_MED_GROUPS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
									label: g.label,
									children: WATER_MEDS.filter((p) => p.group === g.id).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: p.id,
										children: p.name
									}, p.id))
								}, g.id))]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "На 1 м³" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "relative",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										inputMode: "decimal",
										value: row.conc,
										onChange: (e) => setRow(row.uid, { conc: e.target.value })
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-[11px] text-subtle",
									children: [item ? unitLabel(item.unit) : "мл або г", item?.typical ? ` · ${item.typical}` : ""]
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								size: "icon",
								"aria-label": "Прибрати",
								onClick: () => onRows(rows.filter((r) => r.uid !== row.uid)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
									className: "size-4",
									strokeWidth: 1.75
								})
							})
						]
					}), row.prepId === "custom" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Назва препарату" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: row.customName,
							onChange: (e) => setRow(row.uid, { customName: e.target.value }),
							placeholder: "Як на етикетці"
						})]
					}) : null]
				}, row.uid);
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "secondary",
				onClick: () => onRows([...rows, {
					uid: uid(),
					prepId: "",
					conc: "",
					customName: ""
				}]),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
					className: "size-4",
					strokeWidth: 1.75
				}), "Додати препарат"]
			})]
		})
	] });
}
async function compressPhoto(file, maxEdge = 960, quality = .58) {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
	const w = Math.max(1, Math.round(bitmap.width * scale));
	const h = Math.max(1, Math.round(bitmap.height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Немає canvas");
	ctx.drawImage(bitmap, 0, 0, w, h);
	bitmap.close();
	const data = canvas.toDataURL("image/jpeg", quality);
	if (data.length > 18e4) return canvas.toDataURL("image/jpeg", .42);
	return data;
}
var prefix = "ptahozvit.draft.v1.";
function key(houseId, reportDate) {
	return `${prefix}${houseId}.${reportDate}`;
}
function loadReportDraft(houseId, reportDate) {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(key(houseId, reportDate));
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed.houseId !== houseId || parsed.reportDate !== reportDate) return null;
		return parsed;
	} catch {
		return null;
	}
}
function saveReportDraft(draft) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(key(draft.houseId, draft.reportDate), JSON.stringify(draft));
	} catch {}
}
function clearReportDraft(houseId, reportDate) {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(key(houseId, reportDate));
}
function ReportPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportForm, {}) });
}
function ReportForm() {
	const search = Route$9.useSearch();
	const [houseId, setHouseId] = (0, import_react.useState)(search.house);
	const [reportDate, setReportDate] = (0, import_react.useState)(search.date);
	const [tick, setTick] = (0, import_react.useState)(0);
	const { data, error, loading } = useAsync(() => getReportPrefill({ data: {
		houseId,
		reportDate
	} }), [
		houseId,
		reportDate,
		tick
	]);
	const [mortality, setMortality] = (0, import_react.useState)("");
	const [culled, setCulled] = (0, import_react.useState)("0");
	const [weight, setWeight] = (0, import_react.useState)("");
	const [feed, setFeed] = (0, import_react.useState)("");
	const [water, setWater] = (0, import_react.useState)("");
	const [tMin, setTMin] = (0, import_react.useState)("");
	const [tMax, setTMax] = (0, import_react.useState)("");
	const [hum, setHum] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [soldHead, setSoldHead] = (0, import_react.useState)("");
	const [soldKg, setSoldKg] = (0, import_react.useState)("");
	const [droppingLook, setDroppingLook] = (0, import_react.useState)("");
	const [litterState, setLitterState] = (0, import_react.useState)("");
	const [medsNone, setMedsNone] = (0, import_react.useState)(false);
	const [medRows, setMedRows] = (0, import_react.useState)([]);
	const [photo, setPhoto] = (0, import_react.useState)(null);
	const [saleOpen, setSaleOpen] = (0, import_react.useState)(false);
	const [offline, setOffline] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [done, setDone] = (0, import_react.useState)(null);
	const [formError, setFormError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!data) return;
		if (!houseId && data.house) setHouseId(data.house.id);
		if (!reportDate) {
			setReportDate(data.reportDate);
			return;
		}
		if (data.reportDate !== reportDate) return;
		const src = data.existing;
		if (src) {
			setMortality(String(src.mortality));
			setCulled(String(src.culled));
			setWeight(String(src.avgWeightG));
			setFeed(String(src.feedKg));
			setWater(src.waterL != null ? String(src.waterL) : "");
			setTMin(src.tempMin != null ? String(src.tempMin) : "");
			setTMax(src.tempMax != null ? String(src.tempMax) : "");
			setHum(src.humidityPct != null ? String(src.humidityPct) : "");
			setNotes(src.notes);
			setSoldHead(src.soldHead ? String(src.soldHead) : "");
			setSoldKg(src.soldWeightKg ? String(src.soldWeightKg) : "");
			setDroppingLook(src.droppingLook ?? "");
			setLitterState(src.litterState ?? "");
			setMedsNone(src.meds.length === 0);
			setMedRows(draftsFromDoses(src.meds));
			setPhoto(src.droppingPhoto);
			setSaleOpen(src.soldHead > 0);
		} else {
			setMortality("0");
			setCulled("0");
			setWeight("");
			setFeed("");
			setWater("");
			setTMin("");
			setTMax("");
			setHum("");
			setNotes("");
			setSoldHead("");
			setSoldKg("");
			setDroppingLook("");
			setLitterState("");
			setMedsNone(false);
			setMedRows([]);
			setPhoto(null);
			setSaleOpen(false);
			const draft = houseId && reportDate ? loadReportDraft(houseId, reportDate) : null;
			if (draft) {
				setMortality(draft.mortality);
				setCulled(draft.culled);
				setWeight(draft.weight);
				setFeed(draft.feed);
				setWater(draft.water);
				setTMin(draft.tMin);
				setTMax(draft.tMax);
				setHum(draft.hum);
				setNotes(draft.notes);
				setSoldHead(draft.soldHead);
				setSoldKg(draft.soldKg);
				setDroppingLook(draft.droppingLook);
				setLitterState(draft.litterState);
				setMedsNone(draft.medsNone);
				setMedRows(draft.medRows.map((r) => ({
					uid: Math.random().toString(36).slice(2, 9),
					prepId: r.prepId,
					conc: r.conc,
					customName: r.customName
				})));
				setPhoto(draft.droppingPhoto);
				setSaleOpen(Boolean(draft.soldHead));
			}
		}
	}, [
		data,
		houseId,
		reportDate
	]);
	(0, import_react.useEffect)(() => {
		const sync = () => setOffline(typeof navigator !== "undefined" && !navigator.onLine);
		sync();
		window.addEventListener("online", sync);
		window.addEventListener("offline", sync);
		return () => {
			window.removeEventListener("online", sync);
			window.removeEventListener("offline", sync);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!houseId || !reportDate || data?.existing) return;
		const t = window.setTimeout(() => {
			saveReportDraft({
				houseId,
				reportDate,
				mortality,
				culled,
				weight,
				feed,
				water,
				tMin,
				tMax,
				hum,
				notes,
				soldHead,
				soldKg,
				droppingLook,
				litterState,
				medsNone,
				medRows,
				droppingPhoto: photo,
				savedAt: Date.now()
			});
		}, 400);
		return () => window.clearTimeout(t);
	}, [
		houseId,
		reportDate,
		data?.existing,
		mortality,
		culled,
		weight,
		feed,
		water,
		tMin,
		tMax,
		hum,
		notes,
		soldHead,
		soldKg,
		droppingLook,
		litterState,
		medsNone,
		medRows,
		photo
	]);
	const live = (0, import_react.useMemo)(() => {
		const headStart = data?.previous?.headEnd ?? data?.flock?.chicksPlaced ?? 0;
		const m = Number(mortality) || 0;
		const c = Number(culled) || 0;
		const w = Number(weight) || 0;
		const f = Number(feed) || 0;
		const wat = water === "" ? null : Number(water);
		const soldH = Number(soldHead) || 0;
		const soldW = Number(soldKg) || 0;
		const saleAvgG = saleAvgWeightG(soldH, soldW);
		const stdFc = data?.std ? houseDailyForecast(data.std, headStart) : null;
		const stdFeedKg = stdFc?.feedKg ?? 0;
		const stdWaterL = stdFc?.waterL ?? 0;
		const feedG = headStart ? f * 1e3 / headStart : 0;
		const waterMl = wat != null && headStart ? wat * 1e3 / headStart : null;
		const weightDelta = data?.std?.weightG && weight !== "" && w > 0 ? (w - data.std.weightG) / data.std.weightG * 100 : null;
		const feedDelta = data?.std?.feedGPerBird && feed !== "" && feedG ? (feedG - data.std.feedGPerBird) / data.std.feedGPerBird * 100 : null;
		const waterDelta = data?.std?.waterMlPerBird && waterMl != null ? (waterMl - data.std.waterMlPerBird) / data.std.waterMlPerBird * 100 : null;
		const headEnd = Math.max(0, headStart - m - c - soldH);
		const cumFeedKg = (data?.cumFeedBefore ?? 0) + f;
		const remainingAvg = w || saleAvgG;
		const saleFcr = soldH > 0 && data?.flock ? fcrAtSale({
			cumFeedKg,
			cumSoldWeightKg: (data.priorSoldKg ?? 0) + soldW,
			remainingHead: headEnd,
			remainingAvgG: remainingAvg,
			placed: data.flock.chicksPlaced,
			breed: data.flock.breed
		}) : 0;
		const oversold = soldH > Math.max(0, headStart - m - c);
		return {
			headStart,
			headEnd,
			dayMort: headStart ? (m + c) / headStart * 100 : 0,
			stdFeedKg,
			stdWaterL,
			stdFc,
			w,
			f,
			wat,
			weightDelta,
			feedDelta,
			waterDelta,
			soldH,
			soldW,
			saleAvgG,
			saleFcr,
			cumFeedKg,
			oversold,
			closesFlock: soldH > 0 && headEnd === 0 && !oversold
		};
	}, [
		data,
		mortality,
		culled,
		weight,
		feed,
		water,
		soldHead,
		soldKg
	]);
	if (loading && !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	if (!data) return null;
	const prefill = data;
	const selectedId = houseId ?? prefill.house?.id;
	const housesForSite = prefill.houses.filter((h) => selectedId ? h.siteId === (prefill.houses.find((x) => x.id === selectedId)?.siteId ?? h.siteId) : true);
	const siteIdOfSelected = prefill.houses.find((h) => h.id === selectedId)?.siteId ?? prefill.sites[0]?.id;
	const selectedDate = reportDate ?? prefill.reportDate;
	const skippedBefore = prefill.missingDates.length > 0 && prefill.missingDates[0] < selectedDate ? prefill.missingDates[0] : null;
	async function onSubmit(e) {
		e.preventDefault();
		const hid = selectedId;
		if (!hid || !prefill.flock) {
			setFormError("Немає активної посадки в цьому пташнику");
			return;
		}
		if (!droppingLook || !litterState) {
			setFormError("Вкажіть вигляд посліду і стан підстилки");
			return;
		}
		if (!weight || Number(weight) <= 0) {
			setFormError("Вкажіть фактичну середню масу або підставте прогноз кросу і скоригуйте");
			return;
		}
		if (feed === "" || Number.isNaN(Number(feed)) || Number(feed) < 0) {
			setFormError("Вкажіть фактичну видачу корму або підставте прогноз і скоригуйте");
			return;
		}
		const meds = medsNone ? [] : parseWaterMeds(medRows.map((r) => ({
			prepId: r.prepId,
			conc: Number(String(r.conc).replace(",", ".")),
			name: r.customName,
			unit: waterMedById(r.prepId)?.unit
		})));
		if (!medsNone && meds.length === 0) {
			setFormError("Додайте препарат на випоюванні або позначте, що випоювання немає");
			return;
		}
		setBusy(true);
		setFormError(null);
		setDone(null);
		try {
			const res = await saveDailyReport({ data: {
				houseId: hid,
				reportDate: selectedDate,
				mortality: Number(mortality) || 0,
				culled: Number(culled) || 0,
				avgWeightG: Number(weight) || 0,
				feedKg: Number(feed) || 0,
				waterL: water === "" ? null : Number(water),
				tempMin: tMin === "" ? null : Number(tMin),
				tempMax: tMax === "" ? null : Number(tMax),
				humidityPct: hum === "" ? null : Number(hum),
				droppingLook,
				litterState,
				notes,
				soldHead: Number(soldHead) || 0,
				soldWeightKg: Number(soldKg) || 0,
				medsNone,
				meds,
				droppingPhoto: photo
			} });
			if (hid && selectedDate) clearReportDraft(hid, selectedDate);
			const saleBit = res.soldHead > 0 ? ` Продано ${fmtInt(res.soldHead)} гол. · середня ${fmtInt(res.saleAvgG)} г · FCR ${fmtNum(res.saleFcr, 3)}.` : "";
			const closedBit = res.closed ? " Посадку закрито." : "";
			if (res.nextDate) {
				setDone(`Збережено за ${fmtDateShort(selectedDate)}.${saleBit} Далі ${fmtDateShort(res.nextDate)} — лишилось ${res.missingLeft} діб.`);
				setReportDate(res.nextDate);
			} else {
				setDone(`Збережено. Поголівʼя на ранок: ${fmtInt(res.headEnd)} гол.${saleBit}${closedBit}`);
				setTick((n) => n + 1);
			}
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Не збережено");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.16em] text-subtle",
					children: fmtDate(selectedDate)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-medium tracking-tight",
					children: "Щоденний звіт"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: data.flock ? `${data.house?.name ?? ""} · ${data.flock.breed} · ${data.flock.code} · ${data.ageDays} доба · пос. ${fmtDateShort(data.flock.placedAt)}${data.flock.status === "closed" ? " · здано" : ""}` : canManageFlocks(data.profile) ? "Немає активної посадки в цьому пташнику." : "Зачекайте, поки керівник або технолог відкриє посадку."
				}),
				!data.flock && canManageFlocks(data.profile) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/settings",
					className: "mt-3 inline-flex h-11 items-center rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-fg",
					children: "Відкрити посадку"
				}) : null
			] }),
			offline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-[16px] bg-warn/15 px-4 py-3 text-sm text-warn",
				children: "Немає мережі. Цифри лишаються в чернетці на цьому телефоні. Коли зʼявиться звʼязок — натисніть «Зберегти» ще раз."
			}) : null,
			data.density && data.density.areaM2 > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: data.density.warn ? "border border-warn/40" : "",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-wider text-subtle",
						children: "Жива маса на 1 м²"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-display text-2xl tabular-nums tracking-tight",
						children: [fmtNum(data.density.kgM2, 1), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1 font-sans text-sm font-normal text-muted",
							children: "кг/м²"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-1 text-sm ${data.density.warn ? "text-warn" : "text-muted"}`,
						children: data.density.reached ? `Ліміт ${data.density.limitKgM2} кг/м² уже досягнуто.` : data.density.daysToLimit != null ? `${data.density.limitKgM2} кг/м² — на ${data.density.reachAgeDays} добу (${fmtDateShort(data.density.reachDate)}), через ${data.density.daysToLimit} діб.` : `Площа ${fmtInt(data.density.areaM2)} м² · ліміт ${data.density.limitKgM2} кг/м².`
					})
				]
			}) : data.house && !data.house.areaM2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Вкажіть площу пташника в параметрах, щоб рахувати кг/м² і прогноз 42 кг/м²."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					data.sites.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "factory",
						children: "Фабрика"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						id: "factory",
						value: String(siteIdOfSelected ?? ""),
						onChange: (e) => {
							const sid = Number(e.target.value);
							const first = data.houses.find((h) => h.siteId === sid);
							setReportDate(void 0);
							setDone(null);
							if (first) setHouseId(first.id);
						},
						children: data.sites.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s.id,
							children: s.name
						}, s.id))
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "house",
						children: "Пташник"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						id: "house",
						value: String(selectedId ?? ""),
						onChange: (e) => {
							setReportDate(void 0);
							setDone(null);
							setHouseId(Number(e.target.value));
						},
						children: (data.sites.length > 1 ? housesForSite : data.houses).map((h) => {
							const site = data.sites.find((s) => s.id === h.siteId);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: h.id,
								children: data.sites.length > 1 ? `${h.name}` : `${site?.name ?? ""} · ${h.name}`
							}, h.id);
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: data.sites.length > 1 ? "sm:col-span-2" : "",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "report-date",
								children: "Дата звіту"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "report-date",
								type: "date",
								value: selectedDate,
								min: data.minDate ?? void 0,
								max: data.maxDate,
								disabled: !data.flock,
								onChange: (e) => {
									setDone(null);
									setReportDate(e.target.value);
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: "Звіт подають за попередню добу. Сьогоднішню зміну закриваєте завтра. Заднім числом — від посадки."
							})
						]
					})
				]
			}),
			siteIdOfSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeatherPanel, {
				siteId: siteIdOfSelected,
				geoName: data.sites.find((s) => s.id === siteIdOfSelected)?.geoName ?? null,
				canSetGeo: canManageFlocks(data.profile),
				weather: data.weather,
				weatherError: data.weatherError,
				reportDate: selectedDate,
				ageDays: data.ageDays,
				houseTempMin: data.std?.tempMin ?? null,
				houseTempMax: data.std?.tempMax ?? null,
				indoorMin: tMin === "" ? null : Number(tMin),
				indoorMax: tMax === "" ? null : Number(tMax),
				indoorHumidity: hum === "" ? null : Number(hum),
				humidityMin: data.std?.humidityMin ?? null,
				humidityMax: data.std?.humidityMax ?? null,
				onGeoSaved: () => setTick((n) => n + 1)
			}) : null,
			data.flock && data.missingDates.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-fg",
				children: [
					"Немає звітів за ",
					data.missingDates.length,
					" ",
					data.missingDates.length === 1 ? "добу" : "діб",
					" від посадки до вчора. Заповніть по черзі — після збереження відкриється наступний пропущений день."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [data.missingDates.slice(0, 8).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setDone(null);
						setReportDate(d);
					},
					className: `h-11 rounded-[12px] px-3 text-sm ${d === selectedDate ? "bg-primary text-primary-fg" : "bg-bg text-muted"}`,
					children: fmtDateShort(d)
				}, d)), data.missingDates.length > 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "self-center text-xs text-muted",
					children: ["+", data.missingDates.length - 8]
				}) : null]
			})] }) : null,
			skippedBefore ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-warn",
				children: [
					"Раніше за цю дату ще немає звіту (",
					fmtDateShort(skippedBefore),
					"). Краще заповнити спочатку пропущені дні — інакше поголівʼя не врахує падіж між ними."
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-5",
				onSubmit,
				children: [
					data.std && live.stdFc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForecastCard, {
						breed: data.flock?.breed ?? "крос",
						ageDays: data.ageDays,
						head: live.headStart,
						forecast: live.stdFc,
						yesterdayG: data.previous?.avgWeightG ?? null,
						applied: weight !== "" && Number(weight) === live.stdFc.weightG && feed !== "" && Math.abs(Number(feed) - live.stdFc.feedKg) < .05 && water !== "" && Math.abs(Number(water) - live.stdFc.waterL) < .5,
						onApply: () => {
							const fc = live.stdFc;
							setWeight(String(fc.weightG));
							setFeed(fc.feedKg % 1 === 0 ? String(Math.round(fc.feedKg)) : fc.feedKg.toFixed(1));
							setWater(String(fc.waterL));
						}
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "grid grid-cols-2 gap-4 p-4 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "col-span-2 text-[11px] uppercase tracking-wider text-subtle md:col-span-3",
								children: "Факт у корпусі"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "Падіж",
								unit: "гол.",
								required: true,
								value: mortality,
								onChange: setMortality,
								step: 1,
								hint: `норма до ${fmtPct(data.std?.dailyMortPct ?? 0, 2)}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "Вибраковка",
								unit: "гол.",
								value: culled,
								onChange: setCulled,
								step: 1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "Середня маса, факт",
								unit: "г",
								required: true,
								value: weight,
								onChange: setWeight,
								step: 5,
								forecast: live.stdFc ? String(live.stdFc.weightG) : void 0,
								onApplyForecast: live.stdFc ? () => setWeight(String(live.stdFc.weightG)) : void 0,
								hint: live.weightDelta != null ? `відхилення ${deltaLabel(live.weightDelta)}` : void 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "Корм, факт",
								unit: "кг",
								required: true,
								value: feed,
								onChange: setFeed,
								step: 10,
								decimals: 1,
								forecast: live.stdFc ? live.stdFc.feedKg % 1 === 0 ? String(Math.round(live.stdFc.feedKg)) : live.stdFc.feedKg.toFixed(1) : void 0,
								onApplyForecast: live.stdFc ? () => setFeed(live.stdFc.feedKg % 1 === 0 ? String(Math.round(live.stdFc.feedKg)) : live.stdFc.feedKg.toFixed(1)) : void 0,
								hint: live.feedDelta != null ? `відхилення ${deltaLabel(live.feedDelta)}` : void 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "Вода, факт",
								unit: "л",
								value: water,
								onChange: setWater,
								step: 10,
								decimals: 1,
								forecast: live.stdFc ? String(live.stdFc.waterL) : void 0,
								onApplyForecast: live.stdFc ? () => setWater(String(live.stdFc.waterL)) : void 0,
								hint: live.waterDelta != null ? `відхилення ${deltaLabel(live.waterDelta)}` : void 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "Вологість",
								unit: "%",
								value: hum,
								onChange: setHum,
								step: 1,
								min: 0,
								max: 100,
								hint: data.std ? `норма ${fmtNum(data.std.humidityMin, 0)}–${fmtNum(data.std.humidityMax, 0)}%` : void 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "t° мін",
								unit: "°C",
								value: tMin,
								onChange: setTMin,
								step: .5,
								decimals: 1,
								min: -5,
								max: 45,
								hint: data.std ? `норма ${fmtNum(data.std.tempMin, 0)}–${fmtNum(data.std.tempMax, 0)} · у залі` : void 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "t° макс",
								unit: "°C",
								value: tMax,
								onChange: setTMax,
								step: .5,
								decimals: 1,
								min: -5,
								max: 45
							})
						]
					}),
					data.flock ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LitterCheck, {
						look: droppingLook,
						state: litterState,
						ageDays: data.ageDays,
						previousLook: data.previous?.droppingLook,
						previousState: data.previous?.litterState,
						onLook: setDroppingLook,
						onState: setLitterState
					}) : null,
					data.flock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "dropping-photo",
								children: "Фото посліду (бажано)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "dropping-photo",
								type: "file",
								accept: "image/*",
								capture: "environment",
								className: "block w-full text-sm text-muted file:mr-3 file:rounded-[10px] file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-sm file:text-fg",
								onChange: async (e) => {
									const file = e.target.files?.[0];
									if (!file) return;
									try {
										setPhoto(await compressPhoto(file));
									} catch {
										setFormError("Не вдалося стиснути фото");
									}
								}
							}),
							photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: photo,
								alt: "Послід",
								className: "mt-2 max-h-40 rounded-[14px] object-cover"
							}) : null
						]
					}) : null,
					data.flock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [data.previous?.meds.length && !medsNone && medRows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							size: "sm",
							onClick: () => setMedRows(draftsFromDoses(data.previous?.meds ?? [])),
							children: "Випоювання як учора"
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaterMedsField, {
							none: medsNone,
							rows: medRows,
							onNone: setMedsNone,
							onRows: setMedRows
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Здача птиці" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Окремий крок. Не чіпайте, якщо сьогодні звичайний день вирощування."
						}),
						data.withdrawal.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-warn",
							children: [
								"Каренція: ",
								data.withdrawal.map((w) => `${w.name} ще ${w.daysLeft} діб (до ${w.until})`).join("; "),
								"."
							]
						}) : null,
						!saleOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4",
							variant: "secondary",
							onClick: () => setSaleOpen(true),
							children: "Сьогодні здача"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
									label: "Продано",
									unit: "гол.",
									value: soldHead,
									onChange: setSoldHead,
									step: 10,
									hint: `можна здати до ${fmtInt(Math.max(0, live.headStart - (Number(mortality) || 0) - (Number(culled) || 0)))} гол.`
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
									label: "Загальна вага",
									unit: "кг",
									value: soldKg,
									onChange: setSoldKg,
									step: 10,
									decimals: 1
								})]
							}),
							live.soldH > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 grid grid-cols-2 gap-3 md:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hint, {
										k: "Середня курка",
										v: `${fmtInt(live.saleAvgG)} г`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hint, {
										k: "FCR на продаж",
										v: live.saleFcr ? fmtNum(live.saleFcr, 3) : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hint, {
										k: "Залишок",
										v: fmtInt(live.headEnd),
										warn: live.oversold
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hint, {
										k: "Корм з посадки",
										v: `${fmtInt(live.cumFeedKg)} кг`
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs text-muted",
								children: "Немає здачі сьогодні — залиште порожнім."
							}),
							live.oversold ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-bad",
								children: "Продаж більший за залишок після падежу."
							}) : null,
							live.closesFlock ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-ok",
								children: "Залишок 0 — посадку буде закрито після збереження."
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-4",
								variant: "ghost",
								size: "sm",
								onClick: () => {
									setSaleOpen(false);
									setSoldHead("");
									setSoldKg("");
								},
								children: "Скасувати здачу"
							})
						] })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "notes",
						children: "Примітка / інцидент"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "notes",
						value: notes,
						onChange: (e) => setNotes(e.target.value),
						placeholder: "Що відхилилось від технології, які дії вжито"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "grid grid-cols-2 gap-3 p-4 text-sm md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hint, {
								k: "Поголівʼя зранку",
								v: fmtInt(live.headStart)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hint, {
								k: "Залишок",
								v: fmtInt(live.headEnd)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hint, {
								k: "Падіж %",
								v: fmtPct(live.dayMort, 2),
								warn: live.dayMort > (data.std?.dailyMortPct ?? .12) * 1.8
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hint, {
								k: "Маса vs прогноз",
								v: live.weightDelta == null ? "—" : deltaLabel(live.weightDelta),
								warn: Math.abs(live.weightDelta ?? 0) >= data.thresholds.weightPct
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hint, {
								k: "Корм vs прогноз",
								v: live.feedDelta == null ? "—" : deltaLabel(live.feedDelta),
								warn: Math.abs(live.feedDelta ?? 0) >= data.thresholds.feedPct
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hint, {
								k: "Вода vs прогноз",
								v: live.waterDelta == null ? "—" : deltaLabel(live.waterDelta),
								warn: Math.abs(live.waterDelta ?? 0) >= data.thresholds.waterPct
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							"Прогноз ",
							data.flock?.breed ?? "кросу",
							" на ",
							data.ageDays,
							" добу для ",
							fmtInt(live.headStart),
							" гол. Поріг корму ±",
							fmtNum(data.thresholds.feedPct, 0),
							"%, води ±",
							fmtNum(data.thresholds.waterPct, 0),
							"%, маси",
							" ",
							fmtNum(data.thresholds.weightPct, 0),
							"%. Сайт не записує прогноз як факт — керівник коригує."
						]
					}),
					data.previous ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							"Попередній день (",
							fmtDateShort(data.previous.reportDate),
							"): падіж ",
							data.previous.mortality,
							" гол., маса ",
							fmtInt(data.previous.avgWeightG),
							" г, корм ",
							fmtNum(data.previous.feedKg, 0),
							" кг."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Це перший день посадки — поголівʼя зранку = посадка."
					}),
					data.existing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-[12px] bg-surface-2 px-3 py-2 text-xs text-muted",
						children: [
							"Звіт за ",
							fmtDateShort(selectedDate),
							" уже є. Збереження замінить падіж, масу, корм, воду, послід і продаж за цей день."
						]
					}) : null,
					formError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-bad",
						children: formError
					}) : null,
					done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-ok",
						children: done
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full md:w-auto",
						disabled: busy || !data.flock,
						children: busy ? "Збереження…" : data.existing ? `Оновити звіт за ${fmtDateShort(selectedDate)}` : `Подати звіт за ${fmtDateShort(selectedDate)}`
					})
				]
			})
		]
	});
}
function deltaLabel(pct) {
	return `${pct > 0 ? "+" : ""}${fmtNum(pct, 1)}%`;
}
function Hint({ k, v, warn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[11px] uppercase tracking-wide text-subtle",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: `mt-1 tabular-nums ${warn ? "text-bad" : "text-fg"}`,
		children: v
	})] });
}
function ForecastCard({ breed, ageDays, head, forecast, yesterdayG, applied, onApply }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-[11px] uppercase tracking-wider text-subtle",
			children: [
				"Прогноз кросу · ",
				breed,
				" · ",
				ageDays,
				" доба"
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-sm text-muted",
			children: [
				"На ",
				fmtInt(head),
				" гол. зранку. Підставте й скоригуйте по вагах, бункеру і лічильнику."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid grid-cols-3 gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-wide text-subtle",
						children: "Середня маса"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-display text-2xl tabular-nums tracking-tight",
						children: [fmtInt(forecast.weightG), " г"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-[11px] text-muted",
						children: [
							"+",
							fmtNum(forecast.dailyGainG, 0),
							" г/добу"
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-wide text-subtle",
						children: "Корм"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-display text-2xl tabular-nums tracking-tight",
						children: [fmtNum(forecast.feedKg, 0), " кг"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-[11px] text-muted",
						children: [fmtNum(forecast.feedGPerBird, 0), " г/гол."]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-wide text-subtle",
						children: "Вода"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-display text-2xl tabular-nums tracking-tight",
						children: [fmtNum(forecast.waterL, 0), " л"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-[11px] text-muted",
						children: [fmtInt(forecast.waterMlPerBird), " мл/гол."]
					})
				] })
			]
		}),
		yesterdayG != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-xs text-muted",
			children: [
				"Учора факт ",
				fmtInt(yesterdayG),
				" г."
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onApply,
			disabled: applied,
			className: "mt-4 h-11 w-full rounded-[14px] bg-primary/12 text-sm font-medium text-primary disabled:opacity-60",
			children: applied ? "Прогноз підставлено — коригуйте факт" : "Підставити прогноз у факт"
		})
	] });
}
//#endregion
export { ReportPage as component };
