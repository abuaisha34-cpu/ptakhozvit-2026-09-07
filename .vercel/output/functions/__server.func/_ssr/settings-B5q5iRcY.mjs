import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as canManageFlocks, d as isDemoUser, o as canManageOps } from "./roles-BISHNnDi.mjs";
import { y as todayISO } from "./org-DsT_3HSb.mjs";
import { $ as saveSite, F as placeFlock, G as saveFlock, H as saveCosts, J as saveHouse, O as getSettings, Q as saveOrganization, V as rotateSheetsToken, at as setSiteHouseCount, d as deleteHouse, k as getSheetsIntegration, n as addSite, ot as wipeOperations, t as addHouse, u as deleteFlock } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { n as Label, r as Select, t as Input } from "./input-x1ihG6i4.mjs";
import { t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
import { n as breedByName, t as BREEDS } from "./standards-DCoZ9WxY.mjs";
import { s as Route$8 } from "./router-CKSXmWZm.mjs";
import { n as GeoPicker } from "./weather-panel-nJeJGT7J.mjs";
import { t as NumberField } from "./number-field-DR-0SZDk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-B5q5iRcY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {}) });
}
function Settings() {
	const { org } = Route$8.useSearch();
	const { data, error, loading, setData } = useAsync(() => getSettings({ data: { orgId: org } }), [org]);
	const [msg, setMsg] = (0, import_react.useState)(null);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "font-display text-3xl font-medium",
		children: "Параметри"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-sm text-muted",
		children: error
	})] });
	if (!data) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: canManageOps(data.profile) ? "Параметри" : "Посадки"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: canManageOps(data.profile) ? "Господарство, фабрики, пороги відхилень і посадки. Населений пункт фабрики потрібен для прогнозу погоди в щоденному звіті." : "Відкрийте посадку, змініть поголівʼя або крос. Вкажіть місто фабрики — у звіті зʼявиться прогноз і рекомендації мікроклімату."
			})] }),
			msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ok",
				children: msg
			}) : null,
			canManageOps(data.profile) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrgForm, {
				name: data.orgName ?? data.profile.orgName ?? "",
				orgId: org,
				onSaved: async () => {
					setData(await getSettings({ data: { orgId: org } }));
					setMsg("Назву господарства оновлено");
				}
			}) : null,
			canManageOps(data.profile) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetsCard, { orgId: org }) : null,
			data.costs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CostsForm, {
				initial: data.costs,
				orgId: org,
				canEdit: !isDemoUser(data.profile),
				onSaved: async () => {
					setData(await getSettings({ data: { orgId: org } }));
					setMsg("Параметри оновлено");
				}
			}) : null,
			canManageOps(data.profile) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddFactoryForm, {
				orgId: org,
				onSaved: async (name) => {
					setData(await getSettings({ data: { orgId: org } }));
					setMsg(`Фабрику «${name}» додано`);
				}
			}) : null,
			data.sites.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactoryBlock, {
				site: s,
				houses: data.houses.filter((h) => h.siteId === s.id),
				flocks: data.flocks,
				profile: data.profile,
				onSaved: async (text) => {
					setData(await getSettings({ data: { orgId: org } }));
					setMsg(text);
				}
			}, s.id)),
			data.sites.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceForm, {
				sites: data.sites,
				houses: data.houses,
				onSaved: async (code) => {
					setData(await getSettings({ data: { orgId: org } }));
					setMsg(`Відкрито посадку ${code}`);
				}
			}) : null,
			canManageOps(data.profile) && !isDemoUser(data.profile) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WipeBlock, {
				orgId: org,
				onWiped: async () => {
					setData(await getSettings({ data: { orgId: org } }));
					setMsg("Усі посадки і звіти видалено. Фабрики та пташники лишились.");
				}
			}) : null
		]
	});
}
function CostsForm({ initial, orgId, canEdit, onSaved }) {
	const [form, setForm] = (0, import_react.useState)({
		feedAlertPct: String(initial.feedAlertPct),
		waterAlertPct: String(initial.waterAlertPct),
		weightAlertPct: String(initial.weightAlertPct)
	});
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setForm({
			feedAlertPct: String(initial.feedAlertPct),
			waterAlertPct: String(initial.waterAlertPct),
			weightAlertPct: String(initial.weightAlertPct)
		});
	}, [initial]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Пороги відхилень" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Коли факт корму, води або маси відходить від норми кросу."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3 md:grid-cols-3",
			onSubmit: async (e) => {
				e.preventDefault();
				if (!canEdit) return;
				setBusy(true);
				try {
					await saveCosts({ data: {
						...initial,
						feedAlertPct: Number(form.feedAlertPct) || 8,
						waterAlertPct: Number(form.waterAlertPct) || 10,
						weightAlertPct: Number(form.weightAlertPct) || 6,
						orgId
					} });
					await onSaved();
				} finally {
					setBusy(false);
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
					label: "Поріг корму",
					unit: "%",
					value: form.feedAlertPct,
					onChange: (v) => setForm({
						...form,
						feedAlertPct: v
					}),
					step: 1,
					hint: "Сповіщення, якщо |факт − норма| ≥ цього %"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
					label: "Поріг води",
					unit: "%",
					value: form.waterAlertPct,
					onChange: (v) => setForm({
						...form,
						waterAlertPct: v
					}),
					step: 1,
					hint: "Споживання води відносно норми кросу"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
					label: "Поріг маси",
					unit: "%",
					value: form.weightAlertPct,
					onChange: (v) => setForm({
						...form,
						weightAlertPct: v
					}),
					step: 1,
					hint: "Відставання живої маси від норми кросу"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "md:col-span-3",
					children: canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						children: busy ? "Збереження…" : "Зберегти пороги"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "У демо пороги не змінюються."
					})
				})
			]
		})
	] });
}
function OrgForm({ name: initial, orgId, onSaved }) {
	const [name, setName] = (0, import_react.useState)(initial);
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Господарство" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-4 grid gap-3 md:grid-cols-[1fr_auto]",
		onSubmit: async (e) => {
			e.preventDefault();
			setBusy(true);
			try {
				await saveOrganization({ data: {
					name,
					orgId
				} });
				await onSaved();
			} finally {
				setBusy(false);
			}
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: "org-rename",
			children: "Назва компанії"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id: "org-rename",
			value: name,
			onChange: (e) => setName(e.target.value)
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-end",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				size: "sm",
				variant: "secondary",
				disabled: busy || name.trim().length < 2,
				children: "Зберегти"
			})
		})]
	})] });
}
function AddFactoryForm({ orgId, onSaved }) {
	const [name, setName] = (0, import_react.useState)("");
	const [location, setLocation] = (0, import_react.useState)("");
	const [houseCount, setHouseCount] = (0, import_react.useState)("2");
	const [capacity, setCapacity] = (0, import_react.useState)("9000");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Нова фабрика" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Додайте майданчик цього господарства — чужі компанії його не побачать."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3 md:grid-cols-4",
			onSubmit: async (e) => {
				e.preventDefault();
				setBusy(true);
				setError(null);
				try {
					await addSite({ data: {
						name,
						location,
						houseCount: Number(houseCount) || 1,
						capacity: Number(capacity) || 9e3,
						orgId
					} });
					const saved = name.trim();
					setName("");
					setLocation("");
					await onSaved(saved);
				} catch (err) {
					setError(err instanceof Error ? err.message : "Помилка");
				} finally {
					setBusy(false);
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "new-factory",
						children: "Назва"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "new-factory",
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "Фабрика «Схід»"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "new-houses",
					children: "Пташників"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "new-houses",
					inputMode: "numeric",
					value: houseCount,
					onChange: (e) => setHouseCount(e.target.value)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "new-cap",
					children: "Місткість / пташник"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "new-cap",
					inputMode: "numeric",
					value: capacity,
					onChange: (e) => setCapacity(e.target.value)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "new-loc",
						children: "Розташування"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "new-loc",
						value: location,
						onChange: (e) => setLocation(e.target.value),
						placeholder: "Корпус, район"
					})]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "md:col-span-4 text-sm text-bad",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "md:col-span-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy || name.trim().length < 2,
						children: busy ? "Додавання…" : "Додати фабрику"
					})
				})
			]
		})
	] });
}
function FactoryBlock({ site, houses, flocks, profile, onSaved }) {
	const [name, setName] = (0, import_react.useState)(site.name);
	const [location, setLocation] = (0, import_react.useState)(site.location);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [adding, setAdding] = (0, import_react.useState)(false);
	const [wantHouses, setWantHouses] = (0, import_react.useState)(String(houses.length));
	const [countBusy, setCountBusy] = (0, import_react.useState)(false);
	const [countErr, setCountErr] = (0, import_react.useState)(null);
	const structure = canManageOps(profile);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: site.name }),
			structure ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 md:grid-cols-[1fr_1fr_auto]",
				onSubmit: async (e) => {
					e.preventDefault();
					setBusy(true);
					try {
						await saveSite({ data: {
							id: site.id,
							name,
							location
						} });
						await onSaved("Фабрику оновлено");
					} finally {
						setBusy(false);
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Назва фабрики" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Розташування" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: location,
						onChange: (e) => setLocation(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "sm",
							variant: "secondary",
							disabled: busy,
							children: "Зберегти"
						})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: site.location
			}),
			canManageFlocks(profile) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-wide text-subtle",
					children: "Населений пункт для погоди"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-2 text-sm text-muted",
					children: site.geoName ? `${site.geoName}${site.geoAdmin ? `, ${site.geoAdmin}` : ""}` : "Ще не вказано — прогноз у звіті не підтягнеться."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeoPicker, {
					siteId: site.id,
					current: site.geoName,
					onSaved: () => onSaved("Населений пункт збережено")
				})
			] }) : site.geoName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Погода: ",
					site.geoName,
					site.geoAdmin ? `, ${site.geoAdmin}` : ""
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-subtle",
						children: "Пташники"
					}),
					structure ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-wrap items-end gap-2",
						onSubmit: async (e) => {
							e.preventDefault();
							setCountBusy(true);
							setCountErr(null);
							try {
								const res = await setSiteHouseCount({ data: {
									siteId: site.id,
									houseCount: Number(wantHouses) || houses.length
								} });
								await onSaved(res.added ? `Додано ${res.added} пташник(и)` : res.removed ? `Прибрано ${res.removed} зайвих порожніх` : "Кількість уже така");
							} catch (err) {
								setCountErr(err instanceof Error ? err.message : "Не змінено");
							} finally {
								setCountBusy(false);
							}
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `houses-${site.id}`,
								children: "Має бути пташників"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: `houses-${site.id}`,
								inputMode: "numeric",
								className: "w-24",
								value: wantHouses,
								onChange: (e) => setWantHouses(e.target.value)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "sm",
								variant: "secondary",
								disabled: countBusy,
								children: countBusy ? "…" : "Виправити кількість"
							}),
							countErr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "w-full text-sm text-bad",
								children: countErr
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "w-full text-xs text-muted",
								children: [
									"Зараз ",
									houses.length,
									". Зайві порожні приберуться, потрібні — додадуться. Пташник із посадкою не видалиться."
								]
							})
						]
					}) : null,
					houses.map((h) => {
						const flock = flocks.find((f) => f.houseId === h.id && f.status === "active");
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseRow, {
							house: h,
							flock: flock ?? null,
							canEditHouse: structure,
							onSaved,
							onDelete: structure ? async () => {
								if (!window.confirm(`Прибрати «${h.name}» з фабрики? Посадку з кошика можна буде повернути лише якщо пташник лишиться.`)) return;
								await deleteHouse({ data: { houseId: h.id } });
								await onSaved(`«${h.name}» прибрано`);
							} : void 0
						}, h.id);
					}),
					structure ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: adding,
						onClick: async () => {
							setAdding(true);
							try {
								await addHouse({ data: {
									siteId: site.id,
									capacity: 9e3
								} });
								await onSaved("Пташник додано");
							} finally {
								setAdding(false);
							}
						},
						children: adding ? "…" : "Додати пташник"
					}) : null
				]
			})
		]
	});
}
function HouseRow({ house, flock, canEditHouse, onSaved, onDelete }) {
	const [name, setName] = (0, import_react.useState)(house.name);
	const [capacity, setCapacity] = (0, import_react.useState)(String(house.capacity));
	const [areaM2, setAreaM2] = (0, import_react.useState)(String(house.areaM2 || Math.round(house.capacity / 18)));
	const [breed, setBreed] = (0, import_react.useState)(flock?.breed ?? BREEDS[0].name);
	const [chicks, setChicks] = (0, import_react.useState)(String(flock?.chicksPlaced ?? 9e3));
	const [placedAt, setPlacedAt] = (0, import_react.useState)(flock?.placedAt ?? todayISO());
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setBreed(flock?.breed ?? BREEDS[0].name);
		setChicks(String(flock?.chicksPlaced ?? 9e3));
		setPlacedAt(flock?.placedAt ?? todayISO());
	}, [
		flock?.breed,
		flock?.chicksPlaced,
		flock?.placedAt
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2 rounded-[16px] bg-bg p-3",
		children: [canEditHouse ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-2 md:grid-cols-[1fr_7rem_7rem_auto_auto] md:items-end",
			onSubmit: async (e) => {
				e.preventDefault();
				setBusy(true);
				try {
					await saveHouse({ data: {
						id: house.id,
						name,
						capacity: Number(capacity) || 0,
						areaM2: Number(areaM2) || 0
					} });
					await onSaved("Пташник оновлено");
				} finally {
					setBusy(false);
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Пташник" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Гол." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					inputMode: "numeric",
					value: capacity,
					onChange: (e) => setCapacity(e.target.value),
					"aria-label": "Місткість"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "м²" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					inputMode: "numeric",
					value: areaM2,
					onChange: (e) => setAreaM2(e.target.value),
					"aria-label": "Площа м²"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "sm",
					variant: "secondary",
					disabled: busy,
					children: "Ок"
				}),
				onDelete && !flock ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "ghost",
					disabled: busy,
					onClick: async () => {
						setBusy(true);
						try {
							await onDelete();
						} catch (err) {
							window.alert(err instanceof Error ? err.message : "Не прибрано");
						} finally {
							setBusy(false);
						}
					},
					children: "Прибрати"
				}) : null
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm font-medium text-fg",
			children: [house.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "ml-2 text-xs font-normal text-muted",
				children: [
					"місткість ",
					house.capacity,
					house.areaM2 > 0 ? ` · ${house.areaM2} м²` : ""
				]
			})]
		}), flock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_8rem_9rem_auto_auto] lg:items-end",
			onSubmit: async (e) => {
				e.preventDefault();
				setBusy(true);
				try {
					await saveFlock({ data: {
						flockId: flock.id,
						chicksPlaced: Number(chicks) || 0,
						placedAt,
						breed,
						chickCostUah: flock.chickCostUah,
						targetDays: flock.targetDays,
						targetWeightG: flock.targetWeightG
					} });
					await onSaved(`Посадку ${house.name} оновлено · ${chicks} гол.`);
				} finally {
					setBusy(false);
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Крос" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: breed,
					"aria-label": "Крос",
					onChange: (e) => setBreed(e.target.value),
					children: [BREEDS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: b.name,
						children: b.name
					}, b.id)), BREEDS.some((b) => b.name === breed) ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: breed,
						children: breed
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: `chicks-${house.id}`,
					children: "Поголівʼя"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: `chicks-${house.id}`,
					inputMode: "numeric",
					value: chicks,
					onChange: (e) => setChicks(e.target.value)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: `placed-${house.id}`,
					children: "Дата посадки"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: `placed-${house.id}`,
					type: "date",
					value: placedAt,
					onChange: (e) => setPlacedAt(e.target.value)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "sm",
					disabled: busy,
					children: busy ? "…" : "Зберегти"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "danger",
					disabled: busy,
					onClick: async () => {
						if (!window.confirm(`Надіслати посадку ${flock.code} в кошик? Звіти можна повернути в Журналі.`)) return;
						setBusy(true);
						try {
							await deleteFlock({ data: { flockId: flock.id } });
							await onSaved("Посадку відправлено в кошик");
						} finally {
							setBusy(false);
						}
					},
					children: "Видалити"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "sm:col-span-2 lg:col-span-5 text-xs text-muted",
					children: [flock.code, ". Зміна поголівʼя перерахує залишок у всіх звітах цієї посадки."]
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: "Немає посадки — відкрийте нижче."
		})]
	});
}
function PlaceForm({ sites, houses, onSaved }) {
	const [siteId, setSiteId] = (0, import_react.useState)(String(sites[0]?.id ?? ""));
	const housesOfSite = houses.filter((h) => String(h.siteId) === siteId);
	const [houseId, setHouseId] = (0, import_react.useState)(String(housesOfSite[0]?.id ?? ""));
	const [placedAt, setPlacedAt] = (0, import_react.useState)(todayISO());
	const [chicks, setChicks] = (0, import_react.useState)("9000");
	const [days, setDays] = (0, import_react.useState)("42");
	const [weight, setWeight] = (0, import_react.useState)("2800");
	const [breed, setBreed] = (0, import_react.useState)(BREEDS[0].name);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const next = houses.filter((h) => String(h.siteId) === siteId);
		if (!next.some((h) => String(h.id) === houseId)) setHouseId(String(next[0]?.id ?? ""));
	}, [
		siteId,
		houses,
		houseId
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Нова посадка" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Посадка відкривається в обраному пташнику на вказану дату. Норми корму, води і маси беруться з обраного кросу. Поточна активна посадка цього пташника буде закрита."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3 md:grid-cols-3",
			onSubmit: async (e) => {
				e.preventDefault();
				setBusy(true);
				try {
					await onSaved((await placeFlock({ data: {
						houseId: Number(houseId),
						placedAt,
						chicksPlaced: Number(chicks),
						chickCostUah: 0,
						targetDays: Number(days),
						targetWeightG: Number(weight),
						breed
					} })).code);
				} finally {
					setBusy(false);
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "place-site",
					children: "Фабрика"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
					id: "place-site",
					value: siteId,
					onChange: (e) => setSiteId(e.target.value),
					children: sites.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: s.id,
						children: s.name
					}, s.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "place-house",
					children: "Пташник"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
					id: "place-house",
					value: houseId,
					onChange: (e) => setHouseId(e.target.value),
					children: housesOfSite.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: h.id,
						children: h.name
					}, h.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "place-breed",
					children: "Крос"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
					id: "place-breed",
					value: breed,
					onChange: (e) => {
						const next = e.target.value;
						setBreed(next);
						const meta = breedByName(next);
						setDays(String(meta.targetDays));
						setWeight(String(meta.targetWeightG));
					},
					children: BREEDS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: b.name,
						children: b.name
					}, b.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "placed-at",
					children: "Дата посадки"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "placed-at",
					type: "date",
					value: placedAt,
					onChange: (e) => setPlacedAt(e.target.value)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
					label: "Поголівʼя",
					unit: "гол.",
					value: chicks,
					onChange: setChicks,
					step: 50
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
					label: "Цільова доба",
					unit: "діб",
					value: days,
					onChange: setDays,
					step: 1,
					min: 20,
					max: 56
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
					label: "Цільова маса",
					unit: "г",
					value: weight,
					onChange: setWeight,
					step: 50
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "md:col-span-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy || !houseId,
						children: busy ? "…" : "Відкрити посадку"
					})
				})
			]
		})
	] });
}
function WipeBlock({ orgId, onWiped }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Чистий старт" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Ховає всі посадки в кошик. Звіти не знищуються — їх можна повернути в Журналі. Фабрики, пташники і користувачі лишаються."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4",
			variant: "danger",
			disabled: busy,
			onClick: async () => {
				if (!window.confirm("Надіслати всі посадки в кошик? Звіти можна буде повернути з Журналу.")) return;
				setBusy(true);
				try {
					await wipeOperations({ data: { orgId } });
					await onWiped();
				} finally {
					setBusy(false);
				}
			},
			children: busy ? "…" : "Очистити всі звіти і посадки"
		})
	] });
}
function SheetsCard({ orgId }) {
	const { data, error, loading, setData } = useAsync(() => getSheetsIntegration({ data: { orgId } }), [orgId]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(null);
	async function copy(text, id) {
		await navigator.clipboard.writeText(text);
		setCopied(id);
	}
	async function rotate() {
		if (!window.confirm("Старе посилання перестане працювати в усіх таблицях. Продовжити?")) return;
		setBusy(true);
		try {
			await rotateSheetsToken({ data: { orgId } });
			setData(await getSheetsIntegration({ data: { orgId } }));
		} finally {
			setBusy(false);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	if (!data) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Google Sheets" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Жива таблиця підтягує цифри з сайту. Створіть Google Таблицю, вставте формулу в A1. Google оновлює її сама. Кнопка «Google Sheets» на звітах ще й копіює поточний вигляд у буфер."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
			className: "mt-3 list-decimal space-y-1 pl-4 text-sm text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Відкрийте нову таблицю" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Вставте формулу в клітинку A1" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "За потреби Файл → Імпорт, якщо формула заблокована політикою домену" })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 space-y-3",
			children: data.feeds.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[16px] bg-bg p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: f.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "mt-1 block break-all text-[11px] text-muted",
						children: f.formula
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => void copy(f.formula, f.kind),
							children: copied === f.kind ? "Скопійовано" : "Копіювати формулу"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => window.open("https://docs.google.com/spreadsheets/create", "_blank", "noopener,noreferrer"),
							children: "Створити таблицю"
						})]
					})
				]
			}, f.kind))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4",
			variant: "ghost",
			disabled: busy,
			onClick: () => void rotate(),
			children: busy ? "…" : "Оновити посилання"
		})
	] });
}
//#endregion
export { Page as component };
