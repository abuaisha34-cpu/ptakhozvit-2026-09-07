import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authMiddleware } from "@/lib/auth/middleware";
import { auth } from "@/lib/auth/server";

export const setMyPassword = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const password = data.password;
    if (password.length < 8) throw new Error("Пароль від 8 символів");
    const request = getRequest();
    if (!request) throw new Error("Немає сесії");
    try {
      await auth.api.setPassword({
        body: { newPassword: password },
        headers: request.headers,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (/already/i.test(message)) {
        throw new Error("Пароль уже стоїть. Увійдіть ним на своєму домені.");
      }
      throw new Error(message || "Не вдалося зберегти пароль");
    }
    return { ok: true };
  });
