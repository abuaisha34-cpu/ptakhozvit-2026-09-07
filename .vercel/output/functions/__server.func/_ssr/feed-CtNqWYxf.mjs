import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as isPlatformAdmin } from "./roles-BISHNnDi.mjs";
import { n as cn, y as todayISO } from "./org-DsT_3HSb.mjs";
import { W as saveFeedAnalysis, g as getFeedTool, l as deleteFeedAnalysis } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { n as Label, r as Select, t as Input } from "./input-x1ihG6i4.mjs";
import { i as Wheat } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
import { d as Route$16 } from "./router-CKSXmWZm.mjs";
import { a as feedPhaseLabel, c as specsFor, i as evaluateFeed, n as NUTRIENT_GROUPS, o as kcalFromMj, r as NUTRIENT_META, s as parseFeedValues, t as FEED_PHASES } from "./feed-s9t3EOEY.mjs";
import { t as StatusBadge } from "./badge-C54FFsVZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/feed-CtNqWYxf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedTool, {}) });
}
function FeedTool() {
	const { org } = Route$16.useSearch();
	const { data, error, loading, setData } = useAsync(() => getFeedTool({ data: { orgId: org } }), [org]);
	const [phase, setPhase] = (0, import_react.useState)("starter");
	const [fields, setFields] = (0, import_react.useState)({});
	const [energyUnit, setEnergyUnit] = (0, import_react.useState)("kcal");
	const [siteId, setSiteId] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [labDate, setLabDate] = (0, import_react.useState)(todayISO());
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	const values = (0, import_react.useMemo)(() => {
		const raw = { ...fields };
		if (energyUnit === "mj" && fields.energyKcal) {
			const mj = Number(String(fields.energyKcal).replace(",", "."));
			if (Number.isFinite(mj) && mj > 0) raw.energyKcal = kcalFromMj(mj);
		}
		return parseFeedValues(raw);
	}, [fields, energyUnit]);
	const verdict = (0, import_react.useMemo)(() => evaluateFeed(phase, values), [phase, values]);
	const specs = (0, import_react.useMemo)(() => specsFor(phase), [phase]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	if (!data) return null;
	if (isPlatformAdmin(data.profile) && !data.sites.length && !org) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-sm text-muted",
		children: [
			"Відкрийте господарство в",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/holdings",
				className: "underline underline-offset-4",
				children: "списку"
			}),
			", щоб бачити аналізи корму."
		]
	});
	function setField(id, v) {
		setFields((prev) => ({
			...prev,
			[id]: v
		}));
	}
	async function onSave(e) {
		e.preventDefault();
		setBusy(true);
		setErr(null);
		setMsg(null);
		try {
			await saveFeedAnalysis({ data: {
				orgId: org,
				siteId: siteId ? Number(siteId) : null,
				phase,
				name,
				labDate,
				values
			} });
			setMsg("Аналіз збережено в журналі корму.");
			setData(await getFeedTool({ data: { orgId: org } }));
		} catch (ex) {
			setErr(ex instanceof Error ? ex.message : "Не збережено");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.16em] text-subtle",
					children: "Якість раціону"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-medium tracking-tight",
					children: "Корм"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: [
						"Внесіть цифри з протоколу лабораторії — сайт порівняє з нормою фази бройлера і пояснить, що робити технологу і ветлікарю. Замовлення GREENFEED — в",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/tools",
							hash: "premix",
							className: "text-primary underline-offset-4 hover:underline",
							children: "інструменті преміксу"
						}),
						"."
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
				children: FEED_PHASES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setPhase(p.id),
					className: cn("rounded-[20px] p-4 text-left shadow-[var(--shadow-border)] transition-shadow", phase === p.id ? "bg-primary text-primary-fg shadow-[0_8px_18px_rgb(47_154_76_/_0.22)]" : "bg-surface hover:shadow-[var(--shadow-border-hover)]"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2 text-sm font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wheat, {
							className: "size-4",
							strokeWidth: 1.9
						}), p.label]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("mt-1 block text-xs", phase === p.id ? "text-primary-fg/80" : "text-muted"),
						children: [
							p.age,
							" · ",
							p.purpose
						]
					})]
				}, p.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => void onSave(e),
				className: "space-y-6",
				children: [
					NUTRIENT_GROUPS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: g.label }),
						g.id === "toxin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Не обовʼязково — якщо в протоколі немає, залиште порожнім."
						}) : g.id === "amino" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Якщо млин дав розрахунок амінокислот — внесіть. Інакше пропустіть."
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
							children: NUTRIENT_META.filter((n) => n.group === g.id).map((n) => {
								const spec = specs.find((s) => s.id === n.id);
								const check = verdict?.checks.find((c) => c.id === n.id);
								const energyLabel = n.id === "energyKcal" && energyUnit === "mj" ? "МДж/кг" : n.unit;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: n.label }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											inputMode: "decimal",
											value: fields[n.id] ?? "",
											onChange: (e) => setField(n.id, e.target.value),
											placeholder: spec ? spec.min != null && spec.max != null ? `${spec.min}–${spec.max}` : `до ${spec.max}` : ""
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-subtle",
											children: energyLabel
										})]
									}),
									n.id === "energyKcal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "mt-1 text-[11px] text-muted underline-offset-2 hover:underline",
										onClick: () => setEnergyUnit((u) => u === "kcal" ? "mj" : "kcal"),
										children: ["вводжу в ", energyUnit === "kcal" ? "ккал/кг, перемкнути на МДж" : "МДж/кг, перемкнути на ккал"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: cn("mt-1 text-[11px]", check && check.severity !== "ok" ? "text-warn" : "text-subtle"),
										children: check ? check.detail : spec?.hint
									})
								] }, n.id);
							})
						})
					] }, g.id)),
					verdict ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] uppercase tracking-wider text-subtle",
									children: ["Висновок · ", verdict.phaseLabel]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-1 font-display text-2xl font-medium tracking-tight",
									children: verdict.headline
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: verdict.summary
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: verdict.severity }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-3xl tabular-nums tracking-tight",
									children: verdict.score
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[520px] text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "text-[11px] uppercase tracking-wider text-subtle",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "Показник"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "Факт"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "Норма фази"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "py-2 font-medium",
											children: "Статус"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: verdict.checks.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2",
											children: c.label
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-2 tabular-nums",
											children: [
												c.value,
												" ",
												c.unit
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 text-muted",
											children: c.rangeLabel
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: c.severity })
										})
									]
								}, c.id)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-3 md:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-[16px] bg-bg p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] uppercase tracking-wider text-subtle",
									children: "Технологія"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1.5 text-sm leading-relaxed",
									children: verdict.tech.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: t }, t))
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-[16px] bg-bg p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] uppercase tracking-wider text-subtle",
									children: "Ветеринарія"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1.5 text-sm leading-relaxed",
									children: verdict.vet.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: t }, t))
								})]
							})]
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Почніть з вологості і протеїну — висновок зʼявиться одразу."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Зберегти партію" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Щоб порівняти наступний протокол з цим і показати технологу."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Назва / номер партії" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: name,
									onChange: (e) => setName(e.target.value),
									placeholder: "Стартер №14, елеватор"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Дата протоколу" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: labDate,
									onChange: (e) => setLabDate(e.target.value)
								})] }),
								data.sites.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Фабрика" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: siteId,
									onChange: (e) => setSiteId(e.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Усе господарство"
									}), data.sites.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: s.id,
										children: s.name
									}, s.id))]
								})] }) : null
							]
						}),
						err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-bad",
							children: err
						}) : null,
						msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-ok",
							children: msg
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "mt-4",
							disabled: busy || !verdict,
							children: busy ? "Збереження…" : "Зберегти аналіз"
						})
					] })
				]
			}),
			data.analyses.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium tracking-tight",
				children: "Збережені протоколи"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-2",
				children: data.analyses.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex flex-wrap items-center justify-between gap-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium",
						children: [a.name || feedPhaseLabel(a.phase), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-2 text-xs font-normal text-muted",
							children: [
								feedPhaseLabel(a.phase),
								a.siteName ? ` · ${a.siteName}` : "",
								a.labDate ? ` · ${a.labDate}` : ""
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							a.headline,
							" · ",
							a.score
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: a.severity }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => {
									setPhase(a.phase);
									const next = {};
									for (const [k, v] of Object.entries(a.values)) if (v != null) next[k] = String(v);
									setFields(next);
									setEnergyUnit("kcal");
									window.scrollTo({
										top: 0,
										behavior: "smooth"
									});
								},
								children: "Відкрити"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: async () => {
									if (!window.confirm("Видалити цей аналіз?")) return;
									await deleteFeedAnalysis({ data: {
										orgId: org,
										id: a.id
									} });
									setData(await getFeedTool({ data: { orgId: org } }));
								},
								children: "Видалити"
							})
						]
					})]
				}, a.id))
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Як читати протокол"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Коротко, що означає кожна цифра з лабораторії."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3 md:grid-cols-2",
					children: specs.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-[20px] bg-surface p-4 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium",
							children: [
								s.label,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-normal text-muted",
									children: s.min != null && s.max != null ? `${s.min}–${s.max} ${s.unit}` : s.max != null ? `до ${s.max} ${s.unit}` : s.unit
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm leading-relaxed text-muted",
							children: s.hint
						})]
					}, s.id))
				})
			] })
		]
	});
}
//#endregion
export { Page as component };
