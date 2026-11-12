import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { authErrorText } from "@/lib/auth-messages";

export const Route = createFileRoute("/doi-mat-khau")({
  head: () => ({
    meta: [
      { title: "Đặt lại mật khẩu — QT tiles" },
      { name: "description", content: "Đặt mật khẩu mới cho tài khoản quản lý QT tiles." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (params.get("type") !== "recovery") return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 6) {
      toast.error("Mật khẩu cần ít nhất 6 ký tự");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(authErrorText(error));
        return;
      }
      toast.success("Đã đổi mật khẩu");
      await navigate({ to: "/quan-ly" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <h1 className="text-3xl font-bold sm:text-4xl">Đặt lại mật khẩu</h1>

      {ready ? (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <Input
              id="new-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            Lưu mật khẩu mới
          </Button>
        </form>
      ) : (
        <p className="mt-4 rounded-xl border bg-card p-6 text-muted-foreground shadow-tile">
          Link đặt lại mật khẩu không còn hợp lệ. Hãy bấm “Quên mật khẩu?” ở trang đăng nhập để
          nhận link mới.
        </p>
      )}
    </div>
  );
}
