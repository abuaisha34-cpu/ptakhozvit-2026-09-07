import { o as getRequest, r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-B592UzGh.mjs";
import { t as auth } from "./server-CpLwKTbo.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/set-password-B8bhC699.js
var setMyPassword_createServerFn_handler = createServerRpc({
	id: "f9b57ea792c42f2356922f9307bc51fe0b762827b7c2d97130efcecd218e4181",
	name: "setMyPassword",
	filename: "src/lib/server/set-password.ts"
}, (opts) => setMyPassword.__executeServer(opts));
var setMyPassword = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(setMyPassword_createServerFn_handler, async ({ data }) => {
	const password = data.password;
	if (password.length < 8) throw new Error("Пароль від 8 символів");
	const request = getRequest();
	if (!request) throw new Error("Немає сесії");
	try {
		await auth.api.setPassword({
			body: { newPassword: password },
			headers: request.headers
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "";
		if (/already/i.test(message)) throw new Error("Пароль уже стоїть. Увійдіть ним на своєму домені.");
		throw new Error(message || "Не вдалося зберегти пароль");
	}
	return { ok: true };
});
//#endregion
export { setMyPassword_createServerFn_handler };
