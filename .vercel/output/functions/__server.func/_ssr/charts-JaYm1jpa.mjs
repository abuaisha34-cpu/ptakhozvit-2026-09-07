import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as fmtNum, s as fmtInt } from "./org-DsT_3HSb.mjs";
import { a as YAxis, c as Line, d as ResponsiveContainer, f as Tooltip, i as LineChart, l as CartesianGrid, n as AreaChart, o as XAxis, p as Legend, r as BarChart, s as Area, t as ComposedChart, u as Bar } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/charts-JaYm1jpa.js
var import_jsx_runtime = require_jsx_runtime();
var axis = {
	fill: "#45634d",
	fontSize: 11
};
var grid = "rgba(22,52,28,0.08)";
var actual = "#2d8a48";
var standard = "#7b9582";
var warn = "#d07028";
var accent = "#3a9a55";
var SITE_COLORS = [
	"#2d8a48",
	"#16341c",
	"#3a9a55",
	"#c0922e",
	"#d07028"
];
var tipStyle = {
	background: "#ffffff",
	border: "1px solid rgba(22,52,28,0.1)",
	borderRadius: 12,
	fontSize: 12,
	color: "#16341c"
};
var legendStyle = {
	fontSize: 12,
	color: "#45634d",
	paddingTop: 8
};
function tickDate(v) {
	if (v.length >= 10) return `${v.slice(8, 10)}.${v.slice(5, 7)}`;
	return v.slice(5);
}
function EmptyChart() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid h-48 place-items-center text-sm text-muted",
		children: "Немає даних для графіка"
	});
}
function WeightChart({ data }) {
	if (!data.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyChart, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-56 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
			data,
			margin: {
				top: 8,
				right: 8,
				left: 0,
				bottom: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					stroke: grid,
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "date",
					tickFormatter: tickDate,
					minTickGap: 22,
					tick: axis,
					axisLine: false,
					tickLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					tick: axis,
					axisLine: false,
					tickLine: false,
					width: 44
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					contentStyle: tipStyle,
					formatter: (v) => [`${fmtInt(Number(v))} г`]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					type: "monotone",
					dataKey: "stdWeight",
					name: "Норма, г",
					stroke: standard,
					strokeWidth: 1.5,
					dot: false,
					strokeDasharray: "4 4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					type: "monotone",
					dataKey: "weight",
					name: "Факт, г",
					stroke: actual,
					strokeWidth: 2,
					dot: false
				})
			]
		}) })
	});
}
function MortChart({ data }) {
	if (!data.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyChart, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-48 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
			data,
			margin: {
				top: 8,
				right: 8,
				left: 0,
				bottom: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					stroke: grid,
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "date",
					tickFormatter: tickDate,
					minTickGap: 22,
					tick: axis,
					axisLine: false,
					tickLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					tick: axis,
					axisLine: false,
					tickLine: false,
					width: 36
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					contentStyle: tipStyle,
					formatter: (v) => [`${fmtNum(Number(v), 2)}%`]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					type: "monotone",
					dataKey: "mortPct",
					name: "Падіж, %",
					stroke: warn,
					fill: "rgba(179,107,50,0.16)",
					strokeWidth: 1.75
				})
			]
		}) })
	});
}
/** Daily feed kg vs breed standard (same headcount). */
function FeedKgChart({ data }) {
	if (!data.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyChart, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-56 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
			data,
			margin: {
				top: 8,
				right: 8,
				left: 0,
				bottom: 0
			},
			barCategoryGap: "28%",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					stroke: grid,
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "date",
					tickFormatter: tickDate,
					minTickGap: 22,
					tick: axis,
					axisLine: false,
					tickLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					tick: axis,
					axisLine: false,
					tickLine: false,
					width: 48,
					tickFormatter: (v) => fmtInt(v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					contentStyle: tipStyle,
					formatter: (v) => [`${fmtNum(Number(v), 0)} кг`]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
					wrapperStyle: legendStyle,
					iconType: "circle",
					iconSize: 8
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "feedKg",
					name: "Факт",
					fill: actual,
					radius: [
						4,
						4,
						0,
						0
					],
					maxBarSize: 28
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					type: "monotone",
					dataKey: "stdFeedKg",
					name: "Норма кросу",
					stroke: standard,
					strokeWidth: 1.75,
					dot: false,
					strokeDasharray: "4 4"
				})
			]
		}) })
	});
}
/** Daily feed grams per bird vs breed standard. */
function FeedPerBirdChart({ data }) {
	if (!data.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyChart, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-56 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
			data,
			margin: {
				top: 8,
				right: 8,
				left: 0,
				bottom: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					stroke: grid,
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "date",
					tickFormatter: tickDate,
					minTickGap: 22,
					tick: axis,
					axisLine: false,
					tickLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					tick: axis,
					axisLine: false,
					tickLine: false,
					width: 40,
					tickFormatter: (v) => fmtInt(v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					contentStyle: tipStyle,
					formatter: (v) => [`${fmtNum(Number(v), 0)} г/гол.`]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
					wrapperStyle: legendStyle,
					iconType: "circle",
					iconSize: 8
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					type: "monotone",
					dataKey: "stdFeedGPerBird",
					name: "Норма",
					stroke: standard,
					strokeWidth: 1.5,
					dot: false,
					strokeDasharray: "4 4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					type: "monotone",
					dataKey: "feedGPerBird",
					name: "Факт",
					stroke: accent,
					strokeWidth: 2,
					dot: false
				})
			]
		}) })
	});
}
function WaterPerBirdChart({ data }) {
	if (!data.filter((d) => d.waterMlPerBird != null).length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyChart, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-56 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
			data,
			margin: {
				top: 8,
				right: 8,
				left: 0,
				bottom: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					stroke: grid,
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "date",
					tickFormatter: tickDate,
					minTickGap: 22,
					tick: axis,
					axisLine: false,
					tickLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					tick: axis,
					axisLine: false,
					tickLine: false,
					width: 40,
					tickFormatter: (v) => fmtInt(v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					contentStyle: tipStyle,
					formatter: (v) => [`${fmtNum(Number(v), 0)} мл/гол.`]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
					wrapperStyle: legendStyle,
					iconType: "circle",
					iconSize: 8
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					type: "monotone",
					dataKey: "stdWaterMlPerBird",
					name: "Норма",
					stroke: standard,
					strokeWidth: 1.5,
					dot: false,
					strokeDasharray: "4 4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					type: "monotone",
					dataKey: "waterMlPerBird",
					name: "Факт",
					stroke: warn,
					strokeWidth: 2,
					dot: false,
					connectNulls: true
				})
			]
		}) })
	});
}
/** Cumulative feed vs standard — house / flock view. */
function CumFeedChart({ data }) {
	if (!data.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyChart, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-56 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
			data,
			margin: {
				top: 8,
				right: 8,
				left: 0,
				bottom: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					stroke: grid,
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "date",
					tickFormatter: tickDate,
					minTickGap: 22,
					tick: axis,
					axisLine: false,
					tickLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					tick: axis,
					axisLine: false,
					tickLine: false,
					width: 52,
					tickFormatter: (v) => fmtInt(v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					contentStyle: tipStyle,
					formatter: (v) => [`${fmtNum(Number(v), 0)} кг`]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
					wrapperStyle: legendStyle,
					iconType: "circle",
					iconSize: 8
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					type: "monotone",
					dataKey: "stdCumFeedKg",
					name: "Норма накопичено",
					stroke: standard,
					fill: "rgba(138,144,130,0.14)",
					strokeWidth: 1.5,
					strokeDasharray: "4 4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					type: "monotone",
					dataKey: "cumFeedKg",
					name: "Факт накопичено",
					stroke: accent,
					fill: "rgba(79,106,70,0.18)",
					strokeWidth: 2
				})
			]
		}) })
	});
}
/** Stacked daily feed by factory. */
function FeedBySiteChart({ data, keys }) {
	if (!data.length || !keys.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyChart, {});
	const flat = data.map((row) => {
		const next = { date: String(row.date) };
		const src = row.feedBySite ?? {};
		for (const k of keys) {
			const v = src[k] ?? Number(row[k] ?? 0);
			next[k] = Number.isFinite(v) ? v : 0;
		}
		return next;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-64 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
			data: flat,
			margin: {
				top: 8,
				right: 8,
				left: 0,
				bottom: 0
			},
			barCategoryGap: "22%",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					stroke: grid,
					vertical: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "date",
					tickFormatter: tickDate,
					minTickGap: 22,
					tick: axis,
					axisLine: false,
					tickLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					tick: axis,
					axisLine: false,
					tickLine: false,
					width: 52,
					tickFormatter: (v) => fmtInt(v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					contentStyle: tipStyle,
					formatter: (v, name) => [`${fmtNum(Number(v), 0)} кг`, String(name)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
					wrapperStyle: legendStyle,
					iconType: "circle",
					iconSize: 8
				}),
				keys.map((k, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: k,
					name: k,
					stackId: "feed",
					fill: SITE_COLORS[i % SITE_COLORS.length],
					maxBarSize: 36
				}, k))
			]
		}) })
	});
}
//#endregion
export { MortChart as a, FeedPerBirdChart as i, FeedBySiteChart as n, WaterPerBirdChart as o, FeedKgChart as r, WeightChart as s, CumFeedChart as t };
