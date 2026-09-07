//#region node_modules/.nitro/vite/services/ssr/assets/roles-BISHNnDi.js
var ROLE_LABELS = {
	technologist: "Головний технолог",
	partner: "Партнер",
	director: "Директор",
	veterinarian: "Ветеринарний лікар",
	site_manager: "Керівник фабрики",
	pending: "Очікує призначення"
};
var ASSIGNABLE_ROLES = [
	"technologist",
	"partner",
	"director",
	"veterinarian",
	"site_manager",
	"pending"
];
function roleLabel(role) {
	return ROLE_LABELS[role] ?? role;
}
function staffLabel(profile) {
	if (profile.isDemo) return "Демо-доступ";
	if (profile.isOwner) return "Хазяїн сайту";
	if (profile.isAdmin) return "Адміністратор системи";
	return roleLabel(profile.role);
}
/** Owner or appointed system administrator — all holdings. */
function isPlatformAdmin(profile) {
	return profile.isOwner || profile.isAdmin;
}
/** Same visibility and ops as the chief technologist. */
function hasTechAccess(profile) {
	return isPlatformAdmin(profile) || profile.role === "technologist" || profile.role === "partner";
}
function seesAllFactories(profile) {
	if (hasTechAccess(profile)) return true;
	if ((profile.role === "director" || profile.role === "veterinarian") && !profile.siteId) return true;
	return false;
}
function factoryRequired(role) {
	return role === "site_manager";
}
function factorySelectable(role) {
	return role === "site_manager" || role === "director" || role === "veterinarian";
}
function canManageOps(profile) {
	return hasTechAccess(profile);
}
/** Open/edit placements and headcount on accessible factories. */
function canManageFlocks(profile) {
	return hasTechAccess(profile) || profile.role === "site_manager" || profile.role === "director";
}
function canDeleteReports(profile) {
	return hasTechAccess(profile) && !profile.isDemo;
}
/** Change vaccination/treatment calendar for a house or the org template. */
function canEditTreatments(profile) {
	if (profile.isDemo) return false;
	return hasTechAccess(profile) || profile.role === "veterinarian";
}
/** Guest on the shared advertising demo farm. */
function isDemoUser(profile) {
	return Boolean(profile.isDemo);
}
function dashboardTitle(profile, factoryName) {
	if (profile.role === "site_manager") return factoryName ?? "Моя фабрика";
	if (profile.role === "veterinarian") return profile.orgName ? `Ветеринарія · ${profile.orgName}` : "Ветеринарний контроль";
	if (profile.orgName) return profile.orgName;
	return "Зведення виробництва";
}
//#endregion
export { canManageFlocks as a, factoryRequired as c, isDemoUser as d, isPlatformAdmin as f, staffLabel as h, canEditTreatments as i, factorySelectable as l, seesAllFactories as m, ROLE_LABELS as n, canManageOps as o, roleLabel as p, canDeleteReports as r, dashboardTitle as s, ASSIGNABLE_ROLES as t, hasTechAccess as u };
