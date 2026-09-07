import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { h as staffLabel } from "./roles-BISHNnDi.mjs";
import { s as fmtInt } from "./org-DsT_3HSb.mjs";
import { L as resetDemo, T as getPlatformStaff, a as createBackupOwner, it as setPlatformOwner, o as createOrganization, rt as setPlatformAdmin, y as getHoldings } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { n as Label, r as Select, t as Input } from "./input-x1ihG6i4.mjs";
import { K as ArrowRight, U as Building2 } from "../_libs/lucide-react.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/holdings.index-CkMfW8Pw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Holdings() {
	const { data, error, loading, setData } = useAsync(() => getHoldings(), []);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	if (!data) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.16em] text-subtle",
					children: staffLabel(data.profile)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-medium tracking-tight md:text-4xl",
					children: "Господарства"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: "Хазяїн і адміністратор системи відкривають господарства. Кожне отримує свій код — передайте його технологу компанії. Люди не можуть створити господарство самі."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoPromo, {
				stats: data.demo,
				onDone: async () => {
					setData(await getHoldings());
				}
			}),
			data.holdings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Поки порожньо" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Відкрийте перше господарство нижче і віддайте код головному технологу цієї компанії."
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: data.holdings.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/holdings/$orgId",
					params: { orgId: String(h.id) },
					className: "block rounded-[20px] bg-surface p-4 shadow-[var(--shadow-border)] transition-colors hover:bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-display text-lg font-medium tracking-tight",
								children: [h.name, h.isDemo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 rounded-full bg-primary/12 px-2 py-0.5 text-xs font-sans font-medium text-primary",
									children: "демо"
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [
									h.factoryCount,
									" фабр. · ",
									h.houseCount,
									" пташн. · ",
									fmtInt(h.head),
									" гол.",
									h.technoName ? ` · ${h.technoName}` : ""
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-display text-sm tracking-[0.16em] text-fg",
								children: ["Код ", h.inviteCode]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex h-11 items-center gap-1 text-sm text-muted",
							children: ["Відкрити", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						})]
					})
				}, h.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OwnerCreate, { onDone: async () => {
				setData(await getHoldings());
			} }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SysAdmins, { canAssign: data.profile.isOwner }),
			data.profile.isOwner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackupOwner, {}) : null
		]
	});
}
function DemoPromo({ stats, onDone }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const link = `${typeof window !== "undefined" ? window.location.origin : "https://ptakhozvit.com.ua"}/demo`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Демо для реклами" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Посилання відкриває навчальну ферму з чотирма пташниками і звітами. Гості не бачать ваших компаній і не стають хазяїном сайту. Скидання повертає вітрину до типових цифр."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 break-all font-display text-sm tracking-wide text-fg",
			children: link
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					k: "Гостей спробували",
					v: fmtInt(stats.guests),
					s: "окремі люди, що відкрили /demo"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					k: "За 7 днів",
					v: fmtInt(stats.guests7d),
					s: "унікальні за тиждень"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					k: "Відкриттів",
					v: fmtInt(stats.visits),
					s: `${fmtInt(stats.visits24h)} за добу`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					k: "Останній захід",
					v: stats.lastVisit ? fmtWhen(stats.lastVisit) : "ще нікого",
					s: `${fmtInt(stats.visits7d)} відкриттів за тиждень`
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				type: "button",
				onClick: async () => {
					try {
						await navigator.clipboard.writeText(link);
						setMsg("Посилання скопійовано");
					} catch {
						setMsg(link);
					}
				},
				children: "Копіювати посилання"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				disabled: busy,
				onClick: async () => {
					setBusy(true);
					setMsg(null);
					try {
						await resetDemo();
						await onDone();
						setMsg("Вітрину оновлено");
					} catch (err) {
						setMsg(err instanceof Error ? err.message : "Помилка");
					} finally {
						setBusy(false);
					}
				},
				children: busy ? "…" : "Оновити демо-дані"
			})]
		}),
		msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: msg
		}) : null
	] });
}
function OwnerCreate({ onDone }) {
	const [name, setName] = (0, import_react.useState)("");
	const [factoryName, setFactoryName] = (0, import_react.useState)("Фабрика 1");
	const [houseCount, setHouseCount] = (0, import_react.useState)("2");
	const [capacity, setCapacity] = (0, import_react.useState)("9000");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [created, setCreated] = (0, import_react.useState)(null);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			const res = await createOrganization({ data: {
				name,
				factoryName,
				houseCount: Number(houseCount) || 1,
				capacity: Number(capacity) || 9e3
			} });
			const saved = name.trim();
			setCreated({
				name: saved,
				code: res.inviteCode
			});
			setName("");
			setFactoryName("Фабрика 1");
			await onDone();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Помилка");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, {
				className: "size-4",
				strokeWidth: 1.75
			}), "Нове господарство"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Відкриваєте ви. Код віддайте технологу компанії — він зареєструється і введе його."
		}),
		created ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 rounded-[12px] bg-ok/15 px-3 py-2 text-sm text-ok",
			children: [
				"«",
				created.name,
				"» відкрито. Код",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display tracking-[0.16em] text-fg",
					children: created.code
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 space-y-3",
			onSubmit,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "own-org",
					children: "Назва компанії"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "own-org",
					value: name,
					onChange: (e) => setName(e.target.value),
					required: true
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "own-factory",
					children: "Перша фабрика"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "own-factory",
					value: factoryName,
					onChange: (e) => setFactoryName(e.target.value),
					required: true
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "own-houses",
						children: "Пташників"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "own-houses",
						inputMode: "numeric",
						value: houseCount,
						onChange: (e) => setHouseCount(e.target.value)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "own-cap",
						children: "Місткість / пташник"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "own-cap",
						inputMode: "numeric",
						value: capacity,
						onChange: (e) => setCapacity(e.target.value)
					})] })]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-bad",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy || name.trim().length < 2,
					children: busy ? "Створення…" : "Відкрити господарство"
				})
			]
		})
	] });
}
function SysAdmins({ canAssign }) {
	const { data, error, loading, setData } = useAsync(() => getPlatformStaff(), []);
	const [pick, setPick] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const people = data?.people ?? [];
	const admins = people.filter((p) => p.isOwner || p.isAdmin);
	const candidates = people.filter((p) => !p.isOwner && !p.isAdmin);
	async function toggle(userId, admin) {
		setBusy(userId);
		setMsg(null);
		try {
			await setPlatformAdmin({ data: {
				userId,
				admin
			} });
			setData(await getPlatformStaff());
			setPick("");
			setMsg(admin ? "Призначено адміністратора" : "Знято з адміністраторів");
		} catch (err) {
			setMsg(err instanceof Error ? err.message : "Помилка");
		} finally {
			setBusy(null);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Адміністратори системи" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Бачать усі господарства, як хазяїн: коди, посадки, команду. Не замінюють хазяїна сайту. Це не роль у господарстві — доступ на весь сайт."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-2",
			children: admins.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-bg px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: p.fullName || p.email || "Користувач"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						p.isOwner ? "Хазяїн сайту" : "Адміністратор системи",
						p.orgName ? ` · ${p.orgName}` : "",
						p.email && p.fullName ? ` · ${p.email}` : ""
					]
				})] }), canAssign && p.isAdmin && !p.isOwner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					disabled: busy === p.userId,
					onClick: () => void toggle(p.userId, false),
					children: "Зняти"
				}) : null]
			}, p.userId))
		}),
		canAssign ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 flex flex-wrap items-end gap-2",
			onSubmit: (e) => {
				e.preventDefault();
				if (pick) toggle(pick, true);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-56 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "sys-admin",
					children: "Призначити з зареєстрованих"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					id: "sys-admin",
					value: pick,
					onChange: (e) => setPick(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Оберіть користувача"
					}), candidates.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: p.userId,
						children: p.fullName || p.email || p.userId
					}, p.userId))]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				size: "sm",
				disabled: !pick || Boolean(busy),
				children: "Призначити"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "Зняти чи додати адміністратора може лише хазяїн сайту."
		}),
		msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: msg
		}) : null,
		canAssign && !candidates.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Немає інших зареєстрованих користувачів."
		}) : null
	] });
}
function BackupOwner() {
	const { data, error, loading, setData } = useAsync(() => getPlatformStaff(), []);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("Запасний хазяїн");
	const [pick, setPick] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const owners = (data?.people ?? []).filter((p) => p.isOwner);
	const others = (data?.people ?? []).filter((p) => !p.isOwner);
	async function create(e) {
		e.preventDefault();
		setBusy(true);
		setMsg(null);
		try {
			await createBackupOwner({ data: {
				email,
				password,
				name
			} });
			setEmail("");
			setPassword("");
			setData(await getPlatformStaff());
			setMsg("Запасний запис створено.");
		} catch (err) {
			setMsg(err instanceof Error ? err.message : "Не створено");
		} finally {
			setBusy(false);
		}
	}
	async function appoint() {
		if (!pick) return;
		setBusy(true);
		setMsg(null);
		try {
			await setPlatformOwner({ data: {
				userId: pick,
				owner: true
			} });
			setPick("");
			setData(await getPlatformStaff());
			setMsg("Призначено запасного хазяїна");
		} catch (err) {
			setMsg(err instanceof Error ? err.message : "Помилка");
		} finally {
			setBusy(false);
		}
	}
	async function revoke(userId) {
		setBusy(true);
		setMsg(null);
		try {
			await setPlatformOwner({ data: {
				userId,
				owner: false
			} });
			setData(await getPlatformStaff());
			setMsg("Знято права хазяїна");
		} catch (err) {
			setMsg(err instanceof Error ? err.message : "Помилка");
		} finally {
			setBusy(false);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Запасний хазяїн сайту" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Окремий вхід з тими самими правами: усі господарства, коди, команда. Якщо Google не відкриється — заходьте поштою і паролем. Не більше трьох хазяїнів."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-2",
			children: owners.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-bg px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: p.fullName || p.email || "Хазяїн"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: p.email
				})] }), owners.length > 1 && p.userId !== data?.profile.userId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					disabled: busy,
					onClick: () => void revoke(p.userId),
					children: "Зняти"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-subtle",
					children: "повний доступ"
				})]
			}, p.userId))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3 sm:grid-cols-2",
			onSubmit: (e) => void create(e),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sm:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "bo-name",
						children: "Імʼя в системі"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "bo-name",
						value: name,
						onChange: (e) => setName(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "bo-email",
					children: "Пошта для входу"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "bo-email",
					type: "email",
					autoComplete: "off",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "backup@…"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "bo-pass",
					children: "Пароль (від 10 символів)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "bo-pass",
					type: "password",
					autoComplete: "new-password",
					value: password,
					onChange: (e) => setPassword(e.target.value)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sm:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy || email.trim().length < 5 || password.length < 10,
						children: busy ? "…" : "Створити запасний запис"
					})
				})
			]
		}),
		others.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 flex flex-wrap items-end gap-2",
			onSubmit: (e) => {
				e.preventDefault();
				appoint();
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-56 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "bo-pick",
					children: "Або призначити вже зареєстрованого"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					id: "bo-pick",
					value: pick,
					onChange: (e) => setPick(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Оберіть"
					}), others.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: p.userId,
						children: p.fullName || p.email || p.userId
					}, p.userId))]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				size: "sm",
				disabled: !pick || busy,
				children: "Зробити хазяїном"
			})]
		}) : null,
		msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: msg
		}) : null
	] });
}
function Stat({ k, v, s }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[14px] bg-bg px-3 py-2.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.12em] text-subtle",
				children: k
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-display text-lg font-medium tracking-tight text-fg",
				children: v
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted",
				children: s
			})
		]
	});
}
function fmtWhen(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso.slice(0, 16).replace("T", " ");
	return new Intl.DateTimeFormat("uk-UA", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Europe/Kyiv"
	}).format(d);
}
//#endregion
export { Holdings as component };
