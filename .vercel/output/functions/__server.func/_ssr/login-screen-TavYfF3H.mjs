import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import "./client-BzrKyXF3.mjs";
import { n as Wordmark, t as BroilerField } from "./brand-CvpLANUL.mjs";
import "./button-ChVfL1l3.mjs";
import "./input-x1ihG6i4.mjs";
import "./server-CpLwKTbo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-screen-TavYfF3H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginScreen() {
	useNavigate();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [socialBusy, setSocialBusy] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-bg text-fg md:grid md:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#eef8e8] via-[#f6fbf2] to-[#fff8e8] px-10 py-10 pb-28 md:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-4xl font-medium tracking-tight",
						children: "Світло, корм і жива маса — щодня по кожному пташнику."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm leading-relaxed text-muted",
						children: "Кожна компанія бачить лише свої фабрики і звіти. Керівник подає звіт по пташнику. Технолог бачить відхилення від норми кросу, падіж, конверсію і прогноз."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative z-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: "Крос · жива маса · корм · вода · FCR"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BroilerField, { className: "pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-80" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "flex min-h-dvh flex-col justify-center px-5 py-10 md:px-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto w-full max-w-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-4 rounded-[16px] bg-primary/10 px-4 py-3 text-sm text-fg",
						children: [
							"Раніше заходили через Google — пароль не потрібен. Натисніть",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Увійти через Google" }),
							" і оберіть той самий Gmail."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "md:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-8 font-display text-3xl font-medium tracking-tight md:mt-0",
						children: mode === "in" ? "Вхід" : "Реєстрація"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Якщо раніше заходили через Google — пароль не потрібен. Натисніть Google і оберіть той самий Gmail."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/demo",
						className: "mt-6 flex h-12 w-full items-center justify-center rounded-[14px] bg-primary text-sm font-medium text-primary-fg",
						children: "Дивитись демо ферми"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Без реєстрації. Навчальна фабрика з чотирма пташниками, звітами і прогнозом кг/м². Ваші бойові дані не видно."
					}),
					null,
					error && socialBusy === null && !busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-bad",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "cursor-pointer text-sm text-muted",
								children: "Маю пароль — увійти поштою"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "Через Google пароля ще немає. Після входу його можна задати в розділі Профіль."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-8 text-sm text-muted",
								children: "Вхід вимкнено."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-4 text-sm text-muted underline-offset-4 hover:text-fg hover:underline",
						onClick: () => {
							setMode(mode === "in" ? "up" : "in");
							setError(null);
						},
						children: mode === "in" ? "Немає облікового запису — зареєструватися" : "Вже є запис — увійти"
					})
				]
			})
		})]
	});
}
//#endregion
export { LoginScreen as t };
