import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 font-sans">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between py-20 px-8 sm:items-start">
        <div className="flex flex-col items-center gap-8 text-center sm:items-start sm:text-left w-full">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50 mb-4">
              Hệ thống quản lý Game NRO
            </h1>
            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Chào mừng bạn đến với hệ thống quản lý game Ngọc Rồng Online
            </p>
          </div>

          {/* Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
            <Link href="/tab-shop" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-2xl hover:scale-105 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-500 rounded-lg p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Quản lý Tab Shop
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Quản lý các tab trong shop, thêm/sửa/xóa items và cấu hình shop
                </p>
                <div className="mt-4 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Truy cập →
                </div>
              </div>
            </Link>

            <Link href="/moc-nap" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-2xl hover:scale-105 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-purple-500 rounded-lg p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a6 6 0 00-12 0v2m3 10h8a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Quản lý Mốc Nạp
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Quản lý thông tin và chi tiết các mốc nạp trong hệ thống
                </p>
                <div className="mt-4 text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Truy cập →
                </div>
              </div>
            </Link>

            <Link href="/giftcode" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-2xl hover:scale-105 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-pink-500 rounded-lg p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Quản lý Giftcode
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Quản lý giftcode, thêm/sửa/xóa mã quà tặng và phần thưởng
                </p>
                <div className="mt-4 text-pink-600 dark:text-pink-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Truy cập →
                </div>
              </div>
            </Link>

            <Link href="/player-management" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-2xl hover:scale-105 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-yellow-500 rounded-lg p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Quản lý Player
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Quản lý người chơi, ban/unban tài khoản, cộng/trừ tiền
                </p>
                <div className="mt-4 text-yellow-600 dark:text-yellow-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Truy cập →
                </div>
              </div>
            </Link>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 opacity-60">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-500 rounded-lg p-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Quản lý Event
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Sắp ra mắt - Cấu hình và quản lý các sự kiện trong game
              </p>
              <div className="mt-4 text-gray-400 font-semibold">
                Đang phát triển...
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 opacity-60">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-orange-500 rounded-lg p-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Quản lý Giao dịch
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Sắp ra mắt - Theo dõi lịch sử giao dịch và nạp tiền
              </p>
              <div className="mt-4 text-gray-400 font-semibold">
                Đang phát triển...
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
