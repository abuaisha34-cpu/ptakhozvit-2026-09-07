import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-B592UzGh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fns-aaDGwzaQ.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("7749e2977d8573d9fb42eb288dd2cd725048dc1c975e1ed42bb8cb5b26f12aa1"));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("acca3fbf74b302df3c984c5468c7a02595c98a0b51b88b96a1fe324ce9a245e4"));
var getCostTool = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(createSsrRpc("9003c415d37edc9cb5d513eb0484894b4ea2167ecdbf60120d528ad71bf75ec8"));
var getSiteDetail = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("37cde9f2067602ca13495f6c8f7342704471984cb47a06e4cb1f4b617a5807ad"));
var getHouseDetail = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("afce2566d5355ca6981797800193aa469e33d4df940023b0c0dade1ec61c7fef"));
var getReportPrefill = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(createSsrRpc("9cc4680754607d4ba145c84290c048d148c3ba4ef877e781c30354c446e0ad97"));
var saveDailyReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("0fa8ce58638c02a4f0c2a985c8c467603152413b50329e54ea4039ab887472ce"));
var getPeriodReport = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("5d73e3364bfc15066a23050b5daa59312417abc58693014b1140d9d4d4f559d9"));
var getTeam = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(createSsrRpc("30d12a9564c6a4ccf5155ec7f7f2259a5a36cca9d8365a9dcbf7fb823a9509c4"));
var assignStaff = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("69b2bdedd4b670857520a561cc38c1f5ee94594e1127456f53a826e96974c6a9"));
var saveMyProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("17588ceaae331a4d8ab589a9524032f94795651d290890438f37fea6eff34963"));
var getSettings = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(createSsrRpc("98ca1ba265b5aad6868ebe32f1bbd527e086b0abe59dfc74d039f1fd57e6f151"));
var saveCosts = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("cc31920494914a1dd17f42efd14e500a80e519802c8c0907ac1658e83e8abbfb"));
var saveSite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("0aea6daee078fc81f50bffa2ab68bd9b16286d5dff88b2ed20b6af08509a2103"));
var searchPlaces = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("d4a60cddbd2bec31b10337fb54d4ecc2c1821436796c55fcf974fdf7a68f0e37"));
var saveSiteGeo = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("0163c3dc679660ee464a54ea84071d4523ad1e98d884d0ee49afbbd9df5b6c19"));
var saveHouse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("7cfa3ac8e16fddfb16f5fae0dd600dd125a9aa899816ff9e2871aef00989edd0"));
var addHouse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("59bc09f29fce1107e3823ca94ae18507feb5de11b9b129a3e69e8ee1a04adfad"));
var deleteHouse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("16686053252a12bd85fabf12c59a8bfd076ea4f9d88e4e026353aae498d193dc"));
var setSiteHouseCount = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("8dd5a8ddc659e148aa3f1f535e9df6fee8dc0e144c872e278ebbb47f0aea4037"));
var placeFlock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("bbfc121bb70f59afe797cbb94fb18c6381bb6a476ec67f0654fa3f7e8ac46fd2"));
var saveFlock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("2d95db16f5b2cc7262742348b6f5ed1d7d0b7b55172edb42c1d8376872bed439"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("7f76f21ab79194b4e3750054e15888e79fdd9faf69b0b06a7eccb41d4d367de3"));
var deleteFlock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("13feaf4ee49b9a7f3972e29d8dab7470f5b2f3c998044ce2209a6bcaf39f72c0"));
var deleteDailyReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("4419f0e2836165a8e40c4b4ebca7510bddbf74327425fbec4d826cc6d84fc718"));
var wipeOperations = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(createSsrRpc("c3f7c095b793e070e32f9b60cbda5d013a5d171cf01487e2947d6f5e4870ce34"));
var getRecycleBin = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(createSsrRpc("e1cbaf4b06cdb281c10a2d1399d71d2fa76ff4249a6218854a9e6204838cfe89"));
var restoreFlock = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("30a0624a8f2669bbe65baccc4a59de0d7036042fd2808add940a3f2afdf84841"));
var restoreReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("2327f499360d91847cd0dd4dcbd600c03545cdfac34aeb45644281e878e2ff6f"));
var getHoldings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("80b9a727146bb368f3154aa4d7955141e1dc8348ff4e45b0c104e04c60f8f022"));
var getHoldingDetail = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("dadcc7351d23511b3abf6d733bd867f5042fd5c93d0b272910c084db9eae93e7"));
var createOrganization = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("e2027fe84129f9e309609e6babe02d94b58fe80cc68de76b23382d5eaf8996cc"));
var joinOrganization = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("3a6e281079cd6a196b62c5aa508b177c96d92f67d1495e3f13b1502a2eba7f8e"));
var enterDemo = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("52cfd821a9e041b3fdf281be52a6c77036aa05ed7b0e7c6acacc1e82fb4d62c0"));
var resetDemo = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("9389ce64a8c66731d6f76802159f333acef31cbf746f4623186d4d78af7e7fc2"));
var removeStaff = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("a82429db21e8e1d71644ee0f7c020fb3dd3a02871a5feca1d95e191ce5d5965f"));
var saveOrganization = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("e330f532f33da1930b7e6141af1369e9c98ede630eee6cfb63545d65ac2dcc2b"));
var addSite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("b080ead8860d606f31c5d89801bcc17c9db86f51b57ce949daa3ead3e9f3659e"));
var rotateInviteCode = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("6bdb3fa169e7b614587d6b713eff34cb836dfc938f5d6ba71616b0e1a81b8aec"));
var deleteOrganization = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("959c8d768bd0e1e176f089dfb2d96174fbdc44e9b6590ed3492fe775d7d4aebf"));
var getJournal = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("6b7d26430c260c43bc1184deab861ecee4a915ed24912f44f7e63a5f772a2c56"));
var getNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("08bfe83371565ae3d98a2ebb1336862bd3599da57232773e1897fde3050770ba"));
var markNotificationRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("feca8b474a83ce43f1395f8e26c4fa0eccea658c0e4faadacc17d641372d09cc"));
var markAllNotificationsRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("5d4e0a54abf7892680f93a8a8bc82e3a153347b9d7b5d3597a8560e664893ca4"));
var getHandbook = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(createSsrRpc("5d851171e4488a411f688ab2856eac2287aae9c4fc8049baaee8981317ab9f16"));
var saveOrgHandbookNorms = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("f7dc12b5ec55b0f65f07d8e16a677e65e9a56c57d179f88139631ee9aefa57e7"));
var saveOrgTreatments = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("1f3b0c281c2fcdc164098e2bbfcdd764b50fa279444787344a7393ed1e8ed54b"));
var saveFlockTreatments = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("09240c93257256a5f8cbae1d4e9a062d90d3f1bb3f6af96ede9927ada6681e7b"));
var saveHandbookArticle = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("9dae6782b1a222fe056ba21bb28af8b6ef85d2c6e34479d2156767d16909c22d"));
var setHandbookPriority = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("e961932cda882887e0737ff4994807a65ab129ab246f1387f551b7ec70f30b54"));
var askHandbookQuestion = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("bfd6cafadea511792ec416d188fe4cd5e30f7dfe9a116cd80a02fdd8b47cbe0e"));
var getFeedTool = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(createSsrRpc("5d47bd1246f8558043152caf11a7f9a044ae5cf435440078944cfd52707d3db4"));
var saveFeedAnalysis = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("664c5cc1339170a0ce6b2c59cfa92a02b76e7e340b34ad50183433f955a288db"));
var deleteFeedAnalysis = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("c7df16bc5afa2c003a994b3f4d94b8310e523d9e428bd792fd364c1ed2366894"));
var getPlatformStaff = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0980f41e569d76ad2efbd25b69c1802620cb1405461caa0e83ef0a08d1dc7e42"));
var setPlatformAdmin = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("b2a30d7484ccc901721ed6e36f049df7d29068bb7061460e0d0be069ab0521fe"));
var createBackupOwner = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("89bceab0ef1b1dcfa496b8ff683580d2a46bd4e75f67abb28d1c8f40360e96d6"));
var setPlatformOwner = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("60f09bcfa9c7b67e7f522800380aec7e6f56e4f68401ead744a0a6c9e53d4fe9"));
var getSheetsIntegration = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(createSsrRpc("10c9e7f3e733e97bf0453df15e5968c6ecdb7f93dea85fb80a4fcc49ba12cc9d"));
var rotateSheetsToken = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data ?? {}).handler(createSsrRpc("bb32b5f07b2dffff709608fc96f5bb4c272f94b51f3e8e2e49242a34933f7cff"));
//#endregion
export { saveSite as $, getSiteDetail as A, rotateInviteCode as B, getNotifications as C, getReportPrefill as D, getRecycleBin as E, placeFlock as F, saveFlock as G, saveCosts as H, removeStaff as I, saveHouse as J, saveFlockTreatments as K, resetDemo as L, joinOrganization as M, markAllNotificationsRead as N, getSettings as O, markNotificationRead as P, saveOrganization as Q, restoreFlock as R, getMe as S, getPlatformStaff as T, saveDailyReport as U, rotateSheetsToken as V, saveFeedAnalysis as W, saveOrgHandbookNorms as X, saveMyProfile as Y, saveOrgTreatments as Z, getHandbook as _, createBackupOwner as a, setSiteHouseCount as at, getHouseDetail as b, deleteDailyReport as c, deleteHouse as d, saveSiteGeo as et, deleteOrganization as f, getFeedTool as g, getDashboard as h, assignStaff as i, setPlatformOwner as it, getTeam as j, getSheetsIntegration as k, deleteFeedAnalysis as l, getCostTool as m, addSite as n, setHandbookPriority as nt, createOrganization as o, wipeOperations as ot, enterDemo as p, saveHandbookArticle as q, askHandbookQuestion as r, setPlatformAdmin as rt, createSsrRpc as s, addHouse as t, searchPlaces as tt, deleteFlock as u, getHoldingDetail as v, getPeriodReport as w, getJournal as x, getHoldings as y, restoreReport as z };
