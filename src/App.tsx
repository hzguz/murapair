import { CurrencyConverter } from "./components/CurrencyConverter";
import { CurrencyProvider } from "./context/CurrencyContext";

function App() {
  return (
    <CurrencyProvider>
      <div className="min-h-screen w-full relative overflow-hidden selection:bg-emerald-500/30">
        <div className="aurora-bg" />
        {/* Blobs */}
        <div className="aurora-blob-1 top-[-10%] left-[-10%] w-[60vh] h-[60vh] rounded-full" />
        <div className="aurora-blob-2 bottom-[-10%] right-[-10%] w-[60vh] h-[60vh] rounded-full" />

        {/* Content Container - Clean Full Height 50/50 Layout */}
        <main className="relative z-10 h-screen w-full flex flex-col md:flex-row pb-0">
          {/* Header Removed for Cleanliness */}
          <CurrencyConverter />
        </main>

        {/* Bottom Navigation Removed as requested */}
      </div>
    </CurrencyProvider>
  );
}

export default App;
