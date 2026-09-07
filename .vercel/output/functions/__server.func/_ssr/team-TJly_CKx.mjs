import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as factoryRequired, l as factorySelectable, n as ROLE_LABELS, t as ASSIGNABLE_ROLES } from "./roles-BISHNnDi.mjs";
import { I as removeStaff, i as assignStaff, j as getTeam } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { n as Label, r as Select, t as Input } from "./input-x1ihG6i4.mjs";
import { t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
import { o as Route$7 } from "./router-CKSXmWZm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/team-TJly_CKx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Team, {}) });
}
function Team() {
	const { org } = Route$7.useSearch();
	const { data, error, loading, setData } = useAsync(() => getTeam({ data: { orgId: org } }), [org]);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [msg, setMsg] = (0, import_react.useState)(null);
	async function save(member, patch) {
		setBusy(member.userId);
		setMsg(null);
		try {
			await assignStaff({ data: {
				userId: member.userId,
				role: patch.role,
				siteId: patch.siteId,
				fullName: patch.fullName,
				email: patch.email,
				orgId: org
			} });
			const next = await getTeam({ data: { orgId: org } });
			setData(next);
			setMsg("Обліковий запис оновлено");
		} catch (err) {
			setMsg(err instanceof Error ? err.message : "Помилка");
		} finally {
			setBusy(null);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "font-display text-3xl font-medium",
		children: "Команда"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-sm text-muted",
		children: error
	})] });
	if (!data) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Команда"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-sm text-muted",
				children: "Людина реєструється сама і вводить код запрошення цього господарства. Потім ви призначаєте роль: партнер, керівник фабрики, ветеринарний лікар або директор. Новий запит одразу зʼявляється в дзвіночку сповіщень."
			})] }),
			data.inviteCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InviteCard, { code: data.inviteCode }) : null,
			msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ok",
				children: msg
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: data.members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberRow, {
					member: m,
					sites: data.sites,
					self: m.userId === data.profile.userId,
					busy: busy === m.userId,
					onSave: save,
					onRemove: async () => {
						if (!window.confirm("Виключити цю людину з господарства?")) return;
						setBusy(m.userId);
						setMsg(null);
						try {
							await removeStaff({ data: {
								userId: m.userId,
								orgId: org
							} });
							setData(await getTeam({ data: { orgId: org } }));
							setMsg("Людину виключено");
						} catch (err) {
							setMsg(err instanceof Error ? err.message : "Помилка");
						} finally {
							setBusy(null);
						}
					}
				}, m.userId))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Ролі" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 space-y-2 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "Керівник фабрики"
					}), " — своя фабрика: відкриває посадки, змінює поголівʼя, подає і замінює щоденні звіти (у тому числі заднім числом)."] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "Ветеринарний лікар"
					}), " — усі фабрики або одна. Бачить падіж, воду, температуру і може подавати звіт."] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "Директор"
					}), " — зведення і прогнози; може відкривати посадки та змінювати поголівʼя на доступних фабриках."] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "Головний технолог"
					}), " — посадки по всіх фабриках, пороги і команда."] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "Партнер"
					}), " — бачить і керує всім, як головний технолог: усі фабрики, звіти, корм, довідник, команда і посадки."] })
				]
			})] })
		]
	});
}
function InviteCard({ code }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Код запрошення" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Новий співробітник реєструється на цьому сайті і вводить код — потрапляє лише у ваше господарство, не в чужі."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl tracking-[0.2em] text-fg",
				children: code
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				type: "button",
				onClick: async () => {
					try {
						await navigator.clipboard.writeText(code);
						setCopied(true);
						setTimeout(() => setCopied(false), 2e3);
					} catch {
						setCopied(false);
					}
				},
				children: copied ? "Скопійовано" : "Копіювати"
			})]
		})
	] });
}
function MemberRow({ member, sites, self, busy, onSave, onRemove }) {
	const [role, setRole] = (0, import_react.useState)(member.role);
	const [siteId, setSiteId] = (0, import_react.useState)(member.siteId ? String(member.siteId) : "");
	const [fullName, setFullName] = (0, import_react.useState)(member.fullName ?? "");
	const [email, setEmail] = (0, import_react.useState)(member.email ?? "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 rounded-[20px] bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 md:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: `name-${member.userId}`,
					children: "ПІБ"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: `name-${member.userId}`,
					value: fullName,
					onChange: (e) => setFullName(e.target.value),
					placeholder: "Імʼя прізвище"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: `email-${member.userId}`,
					children: "Email"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: `email-${member.userId}`,
					type: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "you@farm.ua"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: `role-${member.userId}`,
					children: "Роль"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
					id: `role-${member.userId}`,
					value: role,
					disabled: self,
					onChange: (e) => setRole(e.target.value),
					children: ASSIGNABLE_ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: r,
						children: ROLE_LABELS[r]
					}, r))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: `site-${member.userId}`,
					children: "Фабрика"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					id: `site-${member.userId}`,
					value: siteId,
					disabled: !factorySelectable(role),
					onChange: (e) => setSiteId(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: factoryRequired(role) ? "Оберіть фабрику" : "Усі фабрики"
					}), sites.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: s.id,
						children: s.name
					}, s.id))]
				})] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: self ? "Це ви. Роль технолога зняти з себе не можна." : member.email
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					disabled: busy,
					onClick: () => onSave(member, {
						role,
						siteId: siteId ? Number(siteId) : null,
						fullName,
						email
					}),
					children: busy ? "…" : "Зберегти"
				}), !self ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					disabled: busy,
					onClick: onRemove,
					children: "Виключити"
				}) : null]
			})]
		})]
	});
}
//#endregion
export { Page as component };
