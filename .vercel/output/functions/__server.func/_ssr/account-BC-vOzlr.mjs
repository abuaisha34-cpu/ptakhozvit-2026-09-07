import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-B592UzGh.mjs";
import { h as staffLabel } from "./roles-BISHNnDi.mjs";
import { S as getMe, Y as saveMyProfile, s as createSsrRpc } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { n as Label, t as Input } from "./input-x1ihG6i4.mjs";
import { n as InstallCard, t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-BC-vOzlr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var setMyPassword = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("f9b57ea792c42f2356922f9307bc51fe0b762827b7c2d97130efcecd218e4181"));
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Account, {}) });
}
function Account() {
	const { data, error, loading, setData } = useAsync(() => getMe(), []);
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [password2, setPassword2] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	const [passMsg, setPassMsg] = (0, import_react.useState)(null);
	const [passErr, setPassErr] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!data) return;
		setName(data.profile.fullName ?? "");
		setEmail(data.profile.email ?? "");
	}, [data]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	if (!data) return null;
	async function onSubmit(e) {
		e.preventDefault();
		setBusy("profile");
		setMsg(null);
		setErr(null);
		try {
			await saveMyProfile({ data: {
				fullName: name,
				email
			} });
			setData(await getMe());
			setMsg("Профіль збережено");
		} catch (e2) {
			setErr(e2 instanceof Error ? e2.message : "Не збережено");
		} finally {
			setBusy(null);
		}
	}
	async function onPassword(e) {
		e.preventDefault();
		setPassMsg(null);
		setPassErr(null);
		if (password !== password2) {
			setPassErr("Паролі не збігаються");
			return;
		}
		setBusy("pass");
		try {
			await setMyPassword({ data: { password } });
			setPassword("");
			setPassword2("");
			setPassMsg("Пароль збережено. Ним можна входити на своєму домені.");
		} catch (e2) {
			setPassErr(e2 instanceof Error ? e2.message : "Не збережено");
		} finally {
			setBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Обліковий запис"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [staffLabel(data.profile), data.sites.length === 1 ? ` · ${data.sites[0].name}` : ""]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "ПІБ і логін" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-3",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "me-name",
						children: "ПІБ"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "me-name",
						value: name,
						onChange: (e) => setName(e.target.value),
						required: true
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "me-email",
						children: "Email (логін)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "me-email",
						type: "email",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						required: true
					})] }),
					msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-ok",
						children: msg
					}) : null,
					err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-bad",
						children: err
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy !== null,
						children: busy === "profile" ? "Збереження…" : "Зберегти"
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Пароль для свого домену" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Якщо зайшли через Google — пароля ще немає. Задайте його тут, потім на цьому домені входьте поштою Google і цим паролем."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 space-y-3",
					onSubmit: onPassword,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "me-pass",
							children: "Новий пароль"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "me-pass",
							type: "password",
							autoComplete: "new-password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							minLength: 8,
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "me-pass2",
							children: "Ще раз"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "me-pass2",
							type: "password",
							autoComplete: "new-password",
							value: password2,
							onChange: (e) => setPassword2(e.target.value),
							minLength: 8,
							required: true
						})] }),
						passMsg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-ok",
							children: passMsg
						}) : null,
						passErr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-bad",
							children: passErr
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy !== null || password.length < 8,
							children: busy === "pass" ? "Збереження…" : "Задати пароль"
						})
					]
				})
			] })
		]
	});
}
//#endregion
export { Page as component };
