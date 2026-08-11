import Link from "next/link";

const managementModules = [
  {
    title: "Quản lý Sự kiện Câu cá",
    description: "Chỉnh loài cá, cân nặng, điểm và mốc thưởng theo mùa",
    href: "/fishing-event",
    color: "sky",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 15c4-5 10-5 16 0-6 5-12 5-16 0zm0 0-2-3m12 2h.01" />
      </svg>
    ),
  },
  {
    title: "Quản lý Tab Shop",
    description: "Quản lý các tab trong shop, thêm/sửa/xóa items và cấu hình shop",
    href: "/tab-shop",
    color: "blue",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    title: "Quản lý Item Template",
    description: "Quản lý danh mục trang bị và vật phẩm gốc trong game",
    href: "/item-template",
    color: "amber",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: "Quản lý Mốc Nạp",
    description: "Quản lý thông tin và chi tiết các mốc nạp trong hệ thống",
    href: "/moc-nap",
    color: "purple",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a6 6 0 00-12 0v2m3 10h8a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
  },
  {
    title: "Quản lý Giftcode",
    description: "Quản lý giftcode, thêm/sửa/xóa mã quà tặng và phần thưởng",
    href: "/giftcode",
    color: "pink",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
  {
    title: "Quản lý Player",
    description: "Quản lý người chơi, ban/unban tài khoản, cộng/trừ tiền",
    href: "/player-management",
    color: "yellow",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: "Quản lý Mốc Online",
    description: "Quản lý phần thưởng theo thời gian online",
    href: "/moc-online",
    color: "green",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Quản lý Mốc Tiêu Tiền",
    description: "Quản lý phần thưởng theo mốc tiêu tiền",
    href: "/moc-tieutien",
    color: "orange",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
  },
  {
    title: "Quản lý Gói Quà",
    description: "Quản lý các gói quà trong hệ thống",
    href: "/goi-qua",
    color: "red",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
  {
    title: "Quản lý Weekly Top",
    description: "Quản lý bảng xếp hạng hàng tuần và phần thưởng",
    href: "/weekly-top",
    color: "indigo",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
      </svg>
    ),
  },
  {
    title: "Quản lý Boss Data",
    description: "Quản lý thông tin boss, stats, skills, rewards và spawn",
    href: "/boss-data",
    color: "cyan",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Lịch sử Giao dịch",
    description: "Xem lịch sử giao dịch giữa các người chơi, items và thời gian",
    href: "/history-transaction",
    color: "teal",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: "Quản lý Cấu hình",
    description: "Quản lý các thông số cấu hình hệ thống và game",
    href: "/settings",
    color: "slate",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const colorClasses: { [key: string]: string } = {
  blue: "bg-blue-500 text-blue-600",
  purple: "bg-purple-500 text-purple-600",
  pink: "bg-pink-500 text-pink-600",
  yellow: "bg-yellow-500 text-yellow-600",
  green: "bg-green-500 text-green-600",
  orange: "bg-orange-500 text-orange-600",
  red: "bg-red-500 text-red-600",
  indigo: "bg-indigo-500 text-indigo-600",
  cyan: "bg-cyan-500 text-cyan-600",
  teal: "bg-teal-500 text-teal-600",
  slate: "bg-slate-600 text-slate-600",
  amber: "bg-amber-500 text-amber-600",
  sky: "bg-sky-500 text-sky-600",
};

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900 font-sans">
      <main className="flex-1 w-full max-w-7xl mx-auto py-12 px-6 lg:px-8">
        <header className="mb-12 text-center lg:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-50 mb-3">
            Hệ thống quản lý Game NRO
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Trang điều hướng quản trị hệ thống game Ngọc Rồng Online
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {managementModules.map((module) => {
            const [bgClass, textClass] = colorClasses[module.color].split(" ");
            return (
              <Link key={module.href} href={module.href} className="group">
                <div className="h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 p-5 flex flex-col justify-between hover:-translate-y-1">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`${bgClass} rounded-xl p-2.5 shadow-sm group-hover:scale-110 transition-transform`}>
                        <div className="text-white">
                          {module.icon}
                        </div>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        {module.title}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                  <div className={`mt-5 pt-4 border-t border-gray-50 dark:border-gray-750 flex items-center text-sm font-bold ${textClass} group-hover:translate-x-1 transition-transform`}>
                    Truy cập
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}
