/**
 * Đổi thông báo lỗi đăng nhập (vốn bằng tiếng Anh) sang tiếng Việt để
 * người dùng cửa hàng dễ hiểu.
 */
const MATCHES: Array<{ test: string; vi: string }> = [
  {
    test: "known to be weak",
    vi: "Mật khẩu này đã bị lộ trong các vụ rò rỉ dữ liệu. Bạn chọn mật khẩu khác nhé.",
  },
  { test: "should be at least", vi: "Mật khẩu cần dài hơn nữa (ít nhất 6 ký tự)." },
  { test: "invalid login credentials", vi: "Email hoặc mật khẩu chưa đúng." },
  { test: "email not confirmed", vi: "Email chưa được xác nhận. Bạn mở link trong email chúng tôi đã gửi rồi đăng nhập lại." },
  { test: "already registered", vi: "Email này đã có tài khoản. Bạn đăng nhập, hoặc dùng email khác." },
  { test: "rate limit", vi: "Bạn thao tác hơi nhanh. Chờ một chút rồi thử lại." },
  { test: "once every", vi: "Bạn vừa yêu cầu gần đây. Chờ một chút rồi thử lại." },
  { test: "unable to validate email", vi: "Email chưa đúng định dạng." },
  { test: "unable to validate email address", vi: "Email chưa đúng định dạng." },
  { test: "different from the old password", vi: "Mật khẩu mới cần khác mật khẩu cũ." },
  { test: "signups not allowed", vi: "Tài khoản mới đang tạm khóa. Bạn gọi cửa hàng để được thêm tài khoản." },
];

export function authErrorText(error: { message?: string } | null | undefined): string {
  const raw = (error?.message ?? "").toLowerCase();
  for (const item of MATCHES) {
    if (raw.includes(item.test)) return item.vi;
  }
  return "Có lỗi xảy ra, vui lòng thử lại. Nếu vẫn không được, hãy gọi cửa hàng.";
}
