import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

/**
 * Nút "Quản lý" trên thanh menu: hiện "Đăng nhập" khi chưa có phiên,
 * hiện "Quản lý + Đăng xuất" khi đã đăng nhập.
 */
export function AuthAffordance() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setSignedIn(Boolean(data.user));
        setReady(true);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
      setReady(true);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/dang-nhap", replace: true });
  }

  // Chưa biết phiên hay chưa: không hiện gì, tránh nhấp nháy khi tải trang.
  if (!ready) return null;

  if (!signedIn) {
    return (
      <Link
        to="/dang-nhap"
        className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Quản lý
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        to="/quan-ly"
        className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        activeProps={{ className: "text-foreground bg-muted" }}
      >
        Quản lý
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">Đăng xuất</span>
      </button>
    </div>
  );
}
