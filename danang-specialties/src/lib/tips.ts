export type TipPost = {
  slug: string;
  titleVi: string;
  titleEn: string;
  excerptVi: string;
  excerptEn: string;
  date: string;
  coverImage: string;
  bodyVi: string[];
  bodyEn: string[];
};

export const TIP_POSTS: TipPost[] = [
  {
    slug: "pack-da-nang-specialties-for-flights",
    titleVi: "Mang đặc sản Đà Nẵng lên máy bay thế nào?",
    titleEn: "How to pack Da Nang specialties for your flight",
    excerptVi:
      "Chọn món khô, đóng gói kín, và để trong hành lý xách tay hoặc ký gửi đúng cách.",
    excerptEn:
      "Pick shelf-stable items, seal them well, and pack carry-on vs checked bags the smart way.",
    date: "2026-09-01",
    coverImage: "/brand/shop-stall-hero.jpg",
    bodyVi: [
      "Ưu tiên hải sản khô, bò khô, bánh mè, trà và nước mắm chai nhỏ — những món chịu được nhiệt và không dễ đổ.",
      "Giữ túi zip hoặc hộp kín; nếu mang nước mắm, bọc thêm túi chống rò và để trong hành lý ký gửi khi quá dung tích xách tay.",
      "Tại kiốt Duy Nhân (90 Hùng Vương), bạn có thể nhờ đóng gói mang đi — tiện hơn mua rời ngoài chợ.",
      "Trước giờ bay, kiểm tra quy định hãng về thực phẩm khô; hầu hết đặc sản khô của chúng tôi phù hợp mang về nước ngoài.",
    ],
    bodyEn: [
      "Prioritize dried seafood, jerky, sesame crisps, tea, and small fish-sauce bottles — items that travel well.",
      "Use zip bags or sealed boxes; wrap fish sauce extra and put it in checked bags if it exceeds carry-on liquid limits.",
      "At Duy Nhan (90 Hung Vuong) we can pack gifts for travel — easier than loose market bags.",
      "Before flying, check your airline’s rules for dry foods; most of our shelf-stable specialties are travel-friendly.",
    ],
  },
  {
    slug: "da-nang-gift-ideas",
    titleVi: "Gợi ý quà Đà Nẵng biếu người thân",
    titleEn: "Da Nang gift ideas for family and friends",
    excerptVi:
      "Từ trà sâm dứa, mực rim đến hộp quà Nam Ô — chọn set theo người nhận.",
    excerptEn:
      "From pandan tea and tamarind squid to Nam O gift boxes — match the set to the recipient.",
    date: "2026-09-08",
    coverImage: "/products/hop-qua-tra-sam-dua-real.jpg",
    bodyVi: [
      "Biếu sếp hoặc đối tác: chọn hộp trà sâm dứa hoặc giỏ quà Tết — nhìn chỉn chu, dễ giải thích.",
      "Biếu bạn bè thích ăn vặt: mực rim me, bò khô, bánh khô mè Cẩm Lệ.",
      "Gia đình xa quê: nước mắm Nam Ô, mắm nêm Dì Cẩn và bánh tráng Đại Lộc — vị quê rõ ràng.",
      "Khách nước ngoài: ưu tiên món khô, có tem rõ, kèm hướng dẫn pha/ăn ngắn bằng tiếng Anh.",
    ],
    bodyEn: [
      "For bosses or partners: pandan-ginseng tea boxes or Tet baskets look polished and easy to explain.",
      "For snack lovers: tamarind squid, beef jerky, and Cam Le sesame crisps.",
      "For family back home: Nam O fish sauce, Di Can mam nem, and Dai Loc rice paper — clear hometown flavors.",
      "For international friends: choose labeled dry foods and add a short English how-to-eat note.",
    ],
  },
  {
    slug: "how-we-order-at-duy-nhan",
    titleVi: "Đặt hàng tại Duy Nhân: Zalo, gọi điện hay WhatsApp?",
    titleEn: "Ordering at Duy Nhan: Zalo, call, or WhatsApp?",
    excerptVi:
      "Khách Việt thường Zalo/gọi; khách quốc tế dùng WhatsApp — cùng một kiốt 90 Hùng Vương.",
    excerptEn:
      "Local guests usually use Zalo or a call; international guests use WhatsApp — same kiosk on Hung Vuong.",
    date: "2026-09-12",
    coverImage: "/brand/shop-stall-enhanced.jpg",
    bodyVi: [
      "Thêm món vào giỏ trên website, rồi gửi đơn qua Zalo để xác nhận còn hàng và hẹn lấy/giao.",
      "Cần nhanh: gọi 0905 747 413 — nói rõ món và số lượng.",
      "Đang dùng tiếng Anh: chuyển ngôn ngữ EN trên web, chat WhatsApp theo số quốc tế hiển thị.",
      "Messenger cũng được nếu bạn đang theo dõi fanpage Đặc Sản Đà Nẵng Duy Nhân.",
    ],
    bodyEn: [
      "Add items to your cart online, then confirm stock and pickup/delivery on Zalo (Vietnamese line).",
      "In a hurry: call 0905 747 413 and list items clearly.",
      "Prefer English: switch the site to EN and message the WhatsApp number shown in the header.",
      "Messenger works too if you already follow the Duy Nhan Da Nang specialties Page.",
    ],
  },
];

export function listTips(): TipPost[] {
  return [...TIP_POSTS].sort((a, b) => b.date.localeCompare(a.date));
}

export function getTipBySlug(slug: string): TipPost | null {
  return TIP_POSTS.find((post) => post.slug === slug) ?? null;
}
