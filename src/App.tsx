import { CurrencyConverter } from "./components/CurrencyConverter";
import { CurrencyProvider } from "./context/CurrencyContext";
import { LanguageProvider } from "./context/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <div className="h-[100dvh] w-full relative overflow-hidden selection:bg-emerald-500/30 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
          <div className="aurora-bg" />
          {/* Blobs */}
          <div className="aurora-blob-1 top-[-10%] left-[-10%] w-[60vh] h-[60vh] rounded-full" />
          <div className="aurora-blob-2 bottom-[-10%] right-[-10%] w-[60vh] h-[60vh] rounded-full" />

          {/* Content Container - Clean Full Height 50/50 Layout */}
          <main className="relative z-10 h-full w-full flex flex-col md:flex-row">
            {/* Header Removed for Cleanliness */}
            <CurrencyConverter />
          </main>

          {/* Bottom Navigation Removed as requested */}
        </div>
      </CurrencyProvider>
    </LanguageProvider>
  );
}

export default App;
