import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as isPlatformAdmin } from "./roles-BISHNnDi.mjs";
import { n as cn } from "./org-DsT_3HSb.mjs";
import { X as saveOrgHandbookNorms, Z as saveOrgTreatments, _ as getHandbook, nt as setHandbookPriority, q as saveHandbookArticle, r as askHandbookQuestion } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { i as Textarea, n as Label, r as Select, t as Input } from "./input-x1ihG6i4.mjs";
import { E as LayoutGrid, M as Droplets, O as Layers, d as ThermometerSun, i as Wheat, k as HeartPulse, m as Star } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
import { n as HANDBOOK_CATEGORIES } from "./handbook-OalI0BW1.mjs";
import { u as Route$14 } from "./router-CKSXmWZm.mjs";
import { t as TreatmentCalendarCard } from "./treatment-calendar-aA5wPRYW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guide-D-DzM0hv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ICONS = {
	climate: ThermometerSun,
	litter: Layers,
	water: Droplets,
	feed: Wheat,
	density: LayoutGrid,
	health: HeartPulse
};
var TONE = {
	climate: "bg-amber-50 text-amber-700",
	litter: "bg-lime-50 text-lime-700",
	water: "bg-sky-50 text-sky-700",
	feed: "bg-orange-50 text-orange-700",
	density: "bg-emerald-50 text-emerald-700",
	health: "bg-rose-50 text-rose-700"
};
function CatIcon({ category, className, size = "md" }) {
	const Icon = ICONS[category] ?? LayoutGrid;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("grid shrink-0 place-items-center rounded-[12px]", size === "sm" ? "size-8" : "size-10", TONE[category], className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: size === "sm" ? "size-4" : "size-5",
			strokeWidth: 1.9
		})
	});
}
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Guide, {}) });
}
function Guide() {
	const { org } = Route$14.useSearch();
	const { data, error, loading, setData } = useAsync(() => getHandbook({ data: { orgId: org } }), [org]);
	const [cat, setCat] = (0, import_react.useState)("all");
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const published = (0, import_react.useMemo)(() => {
		if (!data) return [];
		return data.articles.filter((a) => {
			if (a.status !== "published") return false;
			if (!data.canEdit && a.hidden) return false;
			if (cat !== "all" && a.category !== cat) return false;
			return true;
		});
	}, [data, cat]);
	const questions = data?.articles.filter((a) => a.status === "question") ?? [];
	const featured = published.filter((a) => a.priority);
	const rest = cat === "all" ? published.filter((a) => !a.priority) : published;
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	if (!data) return null;
	if (isPlatformAdmin(data.profile) && !data.articles.length && !org) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-sm text-muted",
		children: [
			"Відкрийте господарство в",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/holdings",
				className: "underline underline-offset-4",
				children: "списку"
			}),
			", щоб бачити його довідник."
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.16em] text-subtle",
					children: "Щоденні питання"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-medium tracking-tight",
					children: "Довідник"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: ["Пріоритетні теми зверху. Далі — мікроклімат, послід, вода, корм і падіж. Відповіді окремо: технологія і ветеринарія.", data.canEdit ? " Технолог може закріпити питання зірочкою і замінити будь-яку рекомендацію." : " Немає відповіді — поставте питання технологу."]
				})
			] }),
			msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ok",
				children: msg
			}) : null,
			data.canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NormsCard, {
				initial: data.norms,
				orgId: org,
				onSaved: async (norms) => {
					setData({
						...data,
						norms
					});
					setMsg("Нормативи оновлено. Вони вже діють у звітах і прогнозах.");
				}
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreatmentCalendarCard, {
				title: "Шаблон календаря обробок",
				hint: "Це графік для нових посадок. У пташнику технолог або ветлікар може змінити його під конкретну партію.",
				items: data.treatments,
				canEdit: true,
				onSave: async (items) => {
					const res = await saveOrgTreatments({ data: {
						orgId: org,
						items
					} });
					setData({
						...data,
						treatments: res.items
					});
					setMsg("Шаблон календаря збережено. Нові посадки візьмуть його.");
				}
			})] }) : null,
			data.canEdit && questions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Питання від керівників"
				}), questions.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArticleCard, {
					article: a,
					canEdit: true,
					open: openId === a.id,
					onToggle: () => setOpenId(openId === a.id ? null : a.id),
					orgId: org,
					onSaved: async () => {
						setData(await getHandbook({ data: { orgId: org } }));
						setMsg("Відповідь опубліковано");
					}
				}, a.id))]
			}) : null,
			cat === "all" && featured.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium tracking-tight",
					children: "Пріоритетні сьогодні"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Те, що найчастіше питають у залі — відкрийте і дійте."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2",
					children: featured.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setOpenId(openId === a.id ? null : a.id),
						className: "flex items-start gap-3 rounded-[20px] bg-surface p-4 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatIcon, { category: a.category }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] uppercase tracking-wider text-subtle",
								children: HANDBOOK_CATEGORIES.find((c) => c.id === a.category)?.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block font-medium leading-snug text-fg",
								children: a.question
							})]
						})]
					}, a.id))
				}),
				openId && featured.some((a) => a.id === openId) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArticleCard, {
						article: featured.find((a) => a.id === openId),
						canEdit: data.canEdit,
						open: true,
						onToggle: () => setOpenId(null),
						orgId: org,
						onSaved: async () => {
							setData(await getHandbook({ data: { orgId: org } }));
							setMsg("Рекомендацію оновлено");
						}
					})
				}) : null
			] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
					active: cat === "all",
					onClick: () => setCat("all"),
					label: "Усі"
				}), HANDBOOK_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
					active: cat === c.id,
					onClick: () => setCat(c.id),
					label: c.label,
					category: c.id
				}, c.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: rest.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArticleCard, {
					article: a,
					canEdit: data.canEdit,
					open: openId === a.id,
					onToggle: () => setOpenId(openId === a.id ? null : a.id),
					orgId: org,
					onSaved: async () => {
						setData(await getHandbook({ data: { orgId: org } }));
						setMsg("Рекомендацію оновлено");
					}
				}, a.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AskCard, {
				orgId: org,
				onAsked: async () => {
					setData(await getHandbook({ data: { orgId: org } }));
					setMsg("Питання надіслано головному технологу");
				}
			})
		]
	});
}
function FilterChip({ active, onClick, label, category }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm transition-colors", active ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-[var(--shadow-border)] hover:text-fg"),
		children: [category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatIcon, {
			category,
			size: "sm",
			className: cn("size-6 rounded-[8px]", active && "bg-white/20 text-primary-fg")
		}) : null, label]
	});
}
function ArticleCard({ article, canEdit, open, onToggle, orgId, onSaved }) {
	const cat = HANDBOOK_CATEGORIES.find((c) => c.id === article.category)?.label ?? article.category;
	const [edit, setEdit] = (0, import_react.useState)(false);
	const [question, setQuestion] = (0, import_react.useState)(article.question);
	const [tech, setTech] = (0, import_react.useState)(article.answerTech);
	const [vet, setVet] = (0, import_react.useState)(article.answerVet);
	const [category, setCategory] = (0, import_react.useState)(article.category);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	async function save(e, hidden = article.hidden) {
		e.preventDefault();
		setBusy(true);
		setErr(null);
		try {
			await saveHandbookArticle({ data: {
				orgId,
				id: article.id,
				question,
				answerTech: tech,
				answerVet: vet,
				category,
				hidden
			} });
			setEdit(false);
			await onSaved();
		} catch (ex) {
			setErr(ex instanceof Error ? ex.message : "Не збережено");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: article.status === "question" ? "ring-1 ring-warn/40" : "",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatIcon, { category: article.category }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onToggle,
					className: "min-w-0 flex-1 text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] uppercase tracking-wider text-subtle",
								children: cat
							}), article.priority ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3 fill-current" }), "пріоритет"]
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block font-display text-lg font-medium tracking-tight",
							children: article.question
						}),
						article.hidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-xs text-muted",
							children: "Приховано для керівників"
						}) : null,
						article.status === "question" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-xs text-warn",
							children: "Чекає відповіді технолога"
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pt-1 text-xs text-subtle",
					children: open ? "згорнути" : "відкрити"
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 space-y-4",
			children: canEdit && edit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3",
				onSubmit: (e) => void save(e),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Питання" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: question,
						onChange: (e) => setQuestion(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Розділ" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: category,
						onChange: (e) => setCategory(e.target.value),
						children: HANDBOOK_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.label
						}, c.id))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Технологічний підхід" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: tech,
						onChange: (e) => setTech(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ветеринарний підхід" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: vet,
						onChange: (e) => setVet(e.target.value)
					})] }),
					err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-bad",
						children: err
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy,
							children: "Зберегти"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setEdit(false),
							children: "Скасувати"
						})]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[16px] bg-bg p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-wider text-subtle",
						children: "Технологія"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-fg",
						children: article.answerTech || "Ще немає відповіді."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[16px] bg-bg p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-wider text-subtle",
						children: "Ветеринарія"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-fg",
						children: article.answerVet || "Ще немає відповіді."
					})]
				})]
			}), canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						onClick: () => setEdit(true),
						children: "Замінити рекомендацію"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						variant: "secondary",
						disabled: busy,
						onClick: async () => {
							setBusy(true);
							try {
								await setHandbookPriority({ data: {
									orgId,
									id: article.id,
									priority: !article.priority
								} });
								await onSaved();
							} finally {
								setBusy(false);
							}
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-3.5", article.priority && "fill-current text-primary") }), article.priority ? "Зняти пріоритет" : "У пріоритет"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: "secondary",
						disabled: busy,
						onClick: () => void save({ preventDefault() {} }, !article.hidden),
						children: article.hidden ? "Показати" : "Приховати"
					})
				]
			}) : null] })
		}) : null]
	});
}
function NormsCard({ initial, orgId, onSaved }) {
	const [n, setN] = (0, import_react.useState)(initial);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	function set(key, v) {
		setN((prev) => ({
			...prev,
			[key]: Number(v)
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Нормативи господарства" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Вологість і ліміт кг/м². Після збереження звіти, прогнози і попередження беруть ці цифри, а не заводські."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
			onSubmit: async (e) => {
				e.preventDefault();
				setBusy(true);
				setErr(null);
				try {
					await onSaved((await saveOrgHandbookNorms({ data: {
						orgId,
						norms: n
					} })).norms);
				} catch (ex) {
					setErr(ex instanceof Error ? ex.message : "Не збережено");
				} finally {
					setBusy(false);
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
					k: "RH посадка мін %",
					v: n.humidityPlaceMin,
					onChange: (v) => set("humidityPlaceMin", v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
					k: "RH посадка макс %",
					v: n.humidityPlaceMax,
					onChange: (v) => set("humidityPlaceMax", v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
					k: "Ранній період до доби",
					v: n.humidityEarlyUntil,
					onChange: (v) => set("humidityEarlyUntil", v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
					k: "RH до цієї доби мін",
					v: n.humidityEarlyMin,
					onChange: (v) => set("humidityEarlyMin", v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
					k: "RH до цієї доби макс",
					v: n.humidityEarlyMax,
					onChange: (v) => set("humidityEarlyMax", v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
					k: "RH далі мін",
					v: n.humidityLateMin,
					onChange: (v) => set("humidityLateMin", v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
					k: "RH далі макс",
					v: n.humidityLateMax,
					onChange: (v) => set("humidityLateMax", v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
					k: "Ліміт кг/м²",
					v: n.densityLimitKgM2,
					onChange: (v) => set("densityLimitKgM2", v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
					k: "Попередження за діб",
					v: n.densityWarnDays,
					onChange: (v) => set("densityWarnDays", v)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sm:col-span-2 lg:col-span-3",
					children: [err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-sm text-bad",
						children: err
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						children: "Застосувати нормативи"
					})]
				})
			]
		})
	] });
}
function Num({ k, v, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		inputMode: "decimal",
		value: String(v),
		onChange: (e) => onChange(e.target.value)
	})] });
}
function AskCard({ orgId, onAsked }) {
	const [category, setCategory] = (0, import_react.useState)("health");
	const [question, setQuestion] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Задати питання" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Керівник описує, що турбує сьогодні. Технолог отримає сповіщення і додасть відповідь у довідник."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 space-y-3",
			onSubmit: async (e) => {
				e.preventDefault();
				setBusy(true);
				setErr(null);
				try {
					await askHandbookQuestion({ data: {
						orgId,
						category,
						question
					} });
					setQuestion("");
					await onAsked();
				} catch (ex) {
					setErr(ex instanceof Error ? ex.message : "Не надіслано");
				} finally {
					setBusy(false);
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Розділ" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
					value: category,
					onChange: (e) => setCategory(e.target.value),
					children: HANDBOOK_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: c.id,
						children: c.label
					}, c.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Питання" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: question,
					onChange: (e) => setQuestion(e.target.value),
					placeholder: "Наприклад: після перепаду нічної температури курчата хриплять, що перевірити першим?"
				})] }),
				err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-bad",
					children: err
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy,
					children: "Надіслати технологу"
				})
			]
		})
	] });
}
//#endregion
export { Page as component };
