import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SHOP } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

/** Mẫu gạch mà khách đang hỏi giá. */
export type InquiryTarget = { id: string; name: string };

/**
 * Hộp "Gửi yêu cầu báo giá": khách để lại tên và số điện thoại,
 * cửa hàng xem ở trang Quản lý.
 */
export function InquiryDialog({
  product,
  open,
  onOpenChange,
}: {
  product: InquiryTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const send = useMutation({
    mutationFn: async () => {
      if (name.trim().length < 2) throw new Error("Bạn ơi, cho xin tên để cửa hàng gọi lại");
      if (phone.replace(/\D/g, "").length < 8) throw new Error("Số điện thoại chưa đúng, kiểm tra lại nhé");

      const { error } = await supabase.from("inquiries").insert({
        product_id: product.id,
        product_name: product.name,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Đã gửi xong — cửa hàng sẽ gọi lại cho bạn sớm nhất");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      onOpenChange(false);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Gửi chưa được, bạn thử lại nhé"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Gửi yêu cầu báo giá</DialogTitle>
          <DialogDescription className="text-sm">
            Bạn đang hỏi về <span className="font-medium text-foreground">{product.name}</span>. Điền
            tên và số điện thoại, cửa hàng gọi lại trong giờ làm việc.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            send.mutate();
          }}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="inquiry-name">Tên của bạn</Label>
            <Input
              id="inquiry-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="inquiry-phone">Số điện thoại</Label>
              <Input
                id="inquiry-phone"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0909 123 456"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inquiry-email">Email (không bắt buộc)</Label>
              <Input
                id="inquiry-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@email.com"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="inquiry-message">Ghi chú</Label>
            <Textarea
              id="inquiry-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Diện tích cần lát, thời gian thi công…"
            />
          </div>

          <Button type="submit" size="lg" disabled={send.isPending}>
            {send.isPending && <Loader2 className="animate-spin" />}
            Gửi yêu cầu
          </Button>
          <p className="text-xs text-muted-foreground">
            Cần gấp thì gọi trực tiếp {SHOP.phone} hoặc nhắn Zalo, cửa hàng trả lời nhanh hơn.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
