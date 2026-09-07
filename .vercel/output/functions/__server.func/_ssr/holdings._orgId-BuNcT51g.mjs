import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as rotateInviteCode, Q as saveOrganization, f as deleteOrganization, v as getHoldingDetail } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { n as Label, t as Input } from "./input-x1ihG6i4.mjs";
import { o as Users, v as Settings2, y as ScrollText } from "../_libs/lucide-react.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
import { a as Route$4 } from "./router-CKSXmWZm.mjs";
import { n as FactoryJumpNav, r as FactorySummary } from "./factory-summary-BngOe8MX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/holdings._orgId-BuNcT51g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HoldingPage() {
	const { orgId } = Route$4.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Holding, { orgId: Number(orgId) });
}
function Holding({ orgId }) {
	const { data, error, loading, setData } = useAsync(() => getHoldingDetail({ data: { orgId } }), [orgId]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	if (!data) return null;
	const many = data.factories.length > 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/holdings",
						className: "text-xs text-muted hover:text-fg",
						children: "← Усі господарства"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-3xl font-medium tracking-tight md:text-4xl",
						children: data.org.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"Код запрошення ",
							data.org.inviteCode,
							" · зведення лише цього господарства"
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/guide",
							search: { org: orgId },
							className: "inline-flex h-11 items-center gap-2 rounded-[12px] bg-surface px-4 text-sm text-fg shadow-[var(--shadow-border)]",
							children: "Довідник"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/journal",
							search: { org: orgId },
							className: "inline-flex h-11 items-center gap-2 rounded-[12px] bg-surface px-4 text-sm text-fg shadow-[var(--shadow-border)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, {
								className: "size-4",
								strokeWidth: 1.75
							}), "Журнал"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/team",
							search: { org: orgId },
							className: "inline-flex h-11 items-center gap-2 rounded-[12px] bg-surface px-4 text-sm text-fg shadow-[var(--shadow-border)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
								className: "size-4",
								strokeWidth: 1.75
							}), "Команда"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/settings",
							search: { org: orgId },
							className: "inline-flex h-11 items-center gap-2 rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
								className: "size-4",
								strokeWidth: 1.75
							}), "Посадки"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrgAdmin, {
				orgId,
				name: data.org.name,
				inviteCode: data.org.inviteCode,
				staffCount: data.staffCount,
				onChanged: async () => setData(await getHoldingDetail({ data: { orgId } }))
			}, orgId),
			many ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactoryJumpNav, { factories: data.factories }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-6",
				children: data.factories.map((factory) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorySummary, {
					factory,
					thresholds: data.thresholds,
					headingLevel: "h2",
					showSiteLink: true,
					showHeading: true
				}, factory.site.id))
			})
		]
	});
}
function OrgAdmin({ orgId, name, inviteCode, staffCount, onChanged }) {
	const navigate = useNavigate();
	const [orgName, setOrgName] = (0, import_react.useState)(name);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	const [confirm, setConfirm] = (0, import_react.useState)("");
	async function saveName(e) {
		e.preventDefault();
		setBusy("save");
		setErr(null);
		setMsg(null);
		try {
			await saveOrganization({ data: {
				name: orgName,
				orgId
			} });
			await onChanged();
			setMsg("Назву оновлено");
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Помилка");
		} finally {
			setBusy(null);
		}
	}
	async function newCode() {
		setBusy("code");
		setErr(null);
		setMsg(null);
		try {
			const res = await rotateInviteCode({ data: { orgId } });
			await onChanged();
			setMsg(`Новий код ${res.inviteCode}. Старий більше не діє.`);
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Помилка");
		} finally {
			setBusy(null);
		}
	}
	async function remove() {
		setBusy("delete");
		setErr(null);
		setMsg(null);
		try {
			await deleteOrganization({ data: {
				orgId,
				confirmName: confirm
			} });
			await navigate({ to: "/holdings" });
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Помилка");
			setBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Параметри господарства" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Лише хазяїн сайту. Фабрики й посадки — кнопка «Посадки» вище."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3 md:grid-cols-[1fr_auto]",
			onSubmit: saveName,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "hold-name",
				children: "Назва"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: "hold-name",
				value: orgName,
				onChange: (e) => setOrgName(e.target.value)
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "sm",
					variant: "secondary",
					disabled: busy !== null || orgName.trim().length < 2,
					children: busy === "save" ? "Збереження…" : "Зберегти"
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 flex flex-wrap items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl tracking-[0.16em] text-fg",
					children: inviteCode
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					disabled: busy !== null,
					onClick: () => void newCode(),
					children: busy === "code" ? "…" : "Новий код"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Старий код одразу перестає пускати людей."
				})
			]
		}),
		msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-ok",
			children: msg
		}) : null,
		err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-bad",
			children: err
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 border-t border-border pt-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-bad",
					children: "Видалити господарство"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						"Зникнуть фабрики, посадки, звіти і код. Люди з команди втратять доступ",
						staffCount ? ` (${staffCount})` : "",
						". Облікові записи залишаться."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-end gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-[16rem] flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "hold-del",
							children: [
								"Введіть назву «",
								name,
								"»"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "hold-del",
							value: confirm,
							onChange: (e) => setConfirm(e.target.value),
							autoComplete: "off"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						disabled: busy !== null || confirm.trim() !== name.trim(),
						onClick: () => void remove(),
						children: busy === "delete" ? "Видалення…" : "Видалити"
					})]
				})
			]
		})
	] });
}
//#endregion
export { HoldingPage as component };
