import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { authErrorText } from "@/lib/auth-messages";
import { SHOP } from "@/lib/catalog";

export const Route = createFileRoute("/dang-nhap")({
  head: () => ({
    meta: [
      { title: "Đăng nhập quản lý — QT tiles" },
      {
        name: "description",
        content: "Trang đăng nhập để quản lý bảng sản phẩm và giá gạch của QT tiles.",
      },
      { property: "og:title", content: "Đăng nhập quản lý — QT tiles" },
      { property: "og:description", content: "Dành cho cửa hàng QT tiles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignInPage,
});

type Mode = "signin" | "signup";

function SignInPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 6) {
      toast.error("Mật khẩu cần ít nhất 6 ký tự");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(authErrorText(error));
          return;
        }
        await navigate({ to: "/quan-ly" });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        toast.error(authErrorText(error));
        return;
      }
      // Email xác nhận đang bật: chưa đăng nhập cho tới khi bấm link trong email.
      if (data.session === null) {
        setConfirmSent(true);
        return;
      }
      await navigate({ to: "/quan-ly" });
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      toast.error("Nhập email trước đã");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/doi-mat-khau`,
    });
    if (error) {
      toast.error(authErrorText(error));
      return;
    }
    toast.success("Đã gửi email đặt lại mật khẩu");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
      <h1 className="text-3xl font-bold sm:text-4xl">
        {mode === "signin" ? "Đăng nhập quản lý" : "Tạo tài khoản quản lý"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Trang này dành cho {SHOP.name}. Khách xem gạch không cần tài khoản.
      </p>

      {confirmSent ? (
        <div className="mt-8 rounded-xl border bg-card p-6 shadow-tile">
          <p className="font-semibold">Kiểm tra email của bạn</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Chúng tôi đã gửi email xác nhận tới <span className="font-medium">{email}</span>. Mở
            link trong email, sau đó quay lại đây đăng nhập.
          </p>
          <Button className="mt-6" onClick={() => setConfirmSent(false)}>
            Quay lại trang đăng nhập
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {mode === "signin" ? "Đăng nhập" : "Tạo tài khoản"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-muted-foreground hover:underline"
            >
              Quên mật khẩu?
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signin" ? "Chưa có tài khoản? Tạo mới" : "Đã có tài khoản? Đăng nhập"}
            </button>
          </div>
        </form>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">
          ← Về trang chủ
        </Link>
      </p>
    </div>
  );
}
