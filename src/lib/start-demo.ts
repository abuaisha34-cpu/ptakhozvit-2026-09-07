import { authClient, authEnabled } from "@/lib/auth/client";
import { enterDemo } from "@/lib/server/fns";

export async function startDemoSession(): Promise<void> {
  if (authEnabled) {
    const session = await authClient.getSession();
    if (!session.data?.user) {
      const id = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
      const email = `demo.${id}@guest.ptakhozvit.com.ua`;
      const password = `Pt-${id}-zvit9`;
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: "Гість демо",
      });
      if (error) throw new Error(error.message);
      await authClient.getSession();
    }
  }
  await enterDemo();
}
