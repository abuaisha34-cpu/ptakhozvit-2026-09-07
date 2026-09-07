import { o as __toESM } from "../_runtime.mjs";
import { H as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-async-D_XiVQwO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useAsync(fn, deps = []) {
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setLoading(true);
		fn().then((value) => {
			if (!cancelled) {
				setData(value);
				setError(null);
			}
		}).catch((err) => {
			if (!cancelled) {
				setError(err instanceof Error ? err.message : "Помилка");
				setData(null);
			}
		}).finally(() => {
			if (!cancelled) setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, deps);
	return {
		data,
		error,
		loading,
		setData
	};
}
//#endregion
export { useAsync as t };
