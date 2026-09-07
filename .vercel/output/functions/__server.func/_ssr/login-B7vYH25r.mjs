import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as useCurrentUserState } from "./brand-CvpLANUL.mjs";
import { t as LoginScreen } from "./login-screen-TavYfF3H.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-B7vYH25r.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!isPending && user) navigate({ to: "/" });
	}, [
		isPending,
		user,
		navigate
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginScreen, {});
}
//#endregion
export { Login as component };
