
import React, { useState, useCallback, FC } from 'react';
import { AppStatus, UsernameInfo, PlatformAvailability } from './types';
import { findAvailableUsernames } from './services/geminiService';

const SearchIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const CopyIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 4.625-2.25-2.25m0 0a3.75 3.75 0 0 1-5.303-5.303m-3.75 5.303 5.303-5.303" />
  </svg>
);

const CheckIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const PlatformBadge: FC<{ name: string; available: boolean; color: string }> = ({ name, available, color }) => (
  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${available ? `${color} text-white` : 'bg-slate-700/50 text-slate-500 line-through'}`}>
    <span>{name}</span>
    {available && <CheckIcon className="w-3 h-3" />}
  </div>
);

const LoadingSpinner: FC = () => (
  <div className="flex flex-col items-center justify-center gap-6 text-center py-12">
    <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-t-blue-500 rounded-full animate-spin absolute top-0 left-0"></div>
    </div>
    <div className="space-y-2">
        <p className="text-xl font-bold text-white">جاري تحليل البيانات واستكشاف المنصات...</p>
        <p className="text-slate-400">نستخدم الذكاء الاصطناعي للتنبؤ بأفضل الخيارات لك</p>
    </div>
  </div>
);

interface UsernameCardProps {
  info: UsernameInfo;
}

const UsernameCard: FC<UsernameCardProps> = ({ info }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(info.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700 p-5 rounded-2xl flex flex-col gap-4 shadow-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10 group">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">@{info.name}</span>
        <button
          onClick={handleCopy}
          className="p-2.5 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-blue-600 hover:text-white transition-all relative"
        >
          {copied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        <PlatformBadge name="Instagram" available={info.availability.instagram} color="bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500" />
        <PlatformBadge name="TikTok" available={info.availability.tiktok} color="bg-black border border-slate-600" />
        <PlatformBadge name="X" available={info.availability.x} color="bg-slate-900" />
        <PlatformBadge name="Snap" available={info.availability.snapchat} color="bg-yellow-400 !text-black" />
        <PlatformBadge name="YouTube" available={info.availability.youtube} color="bg-red-600" />
      </div>
    </div>
  );
};

const App: FC = () => {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.Idle);
  const [usernames, setUsernames] = useState<UsernameInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setStatus(AppStatus.Loading);
    setError(null);
    setUsernames([]);

    try {
      const results = await findAvailableUsernames(keyword);
      setUsernames(results);
      setStatus(AppStatus.Success);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع.');
      setStatus(AppStatus.Error);
    }
  }, [keyword]);

  const renderContent = () => {
    switch (status) {
      case AppStatus.Loading:
        return <LoadingSpinner />;
      case AppStatus.Success:
        return usernames.length > 0 ? (
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold text-slate-100">النتائج المقترحة</h2>
                <span className="text-sm text-slate-400 italic">* التوقعات بناءً على تحليلات الذكاء الاصطناعي</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {usernames.map((info, idx) => (
                <UsernameCard key={`${info.name}-${idx}`} info={info} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <div className="text-5xl">🔍</div>
            <p className="text-slate-400 text-lg">لم يتم العثور على اقتراحات دقيقة. جرب استخدام كلمات مفتاحية مختلفة أو أطول قليلاً.</p>
          </div>
        );
      case AppStatus.Error:
        return (
            <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center max-w-lg mx-auto">
                <p className="text-red-400 font-bold">{error}</p>
                <button onClick={() => setStatus(AppStatus.Idle)} className="mt-4 text-sm text-red-300 underline underline-offset-4">إعادة المحاولة</button>
            </div>
        );
      case AppStatus.Idle:
      default:
        return (
          <div className="text-center py-20 space-y-8 max-w-2xl">
            <div className="grid grid-cols-3 gap-4 opacity-20">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-20 bg-slate-700 rounded-xl animate-pulse"></div>
                ))}
            </div>
            <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-200">ابدأ رحلة البحث عن هويتك الرقمية</h3>
                <p className="text-slate-400 text-lg">أدخل اهتماماتك أو اسمك وسنقوم بتوليد خيارات فريدة مع فحص توفرها على أشهر المنصات.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center selection:bg-blue-500/30">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-12 relative z-10">
        <header className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-4">
                تحديث جديد: دعم فحص المنصات المتعددة ✨
            </div>
            <h1 className="text-5xl sm:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 leading-tight">
                مستشار اليوزرات الذكي
            </h1>
            <p className="text-slate-400 text-xl max-w-xl mx-auto font-medium">احصل على اسم مستخدم فريد من 3-7 أحرف وتعرف على المنصات المتاحة فوراً</p>
        </header>

        <main className="w-full flex-grow flex flex-col items-center">
          <form onSubmit={handleSearch} className="w-full max-w-2xl mb-12 group">
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="مثلاً: coder, design, dx, ksa..."
                className="w-full px-8 pr-16 py-5 bg-slate-800/50 backdrop-blur-xl border-2 border-slate-700 rounded-3xl text-white text-xl placeholder-slate-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-500 shadow-2xl"
              />
              <button
                type="submit"
                className="absolute inset-y-2 right-2 flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white transition-all rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-105 active:scale-95"
                disabled={status === AppStatus.Loading}
              >
                <SearchIcon className="w-7 h-7" />
              </button>
            </div>
          </form>

          <div className="w-full min-h-[400px]">
            {renderContent()}
          </div>
        </main>

        <footer className="w-full border-t border-slate-800 mt-20 pt-8 pb-12 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} جميع الحقوق محفوظة - مدعوم بتقنيات Gemini 3</p>
            <p className="mt-2 text-slate-600 italic">ملاحظة: النتائج مبنية على تقديرات ذكاء اصطناعي للاحتمالية، يرجى التأكد يدوياً قبل الاعتماد النهائي.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
