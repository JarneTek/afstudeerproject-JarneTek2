export default function ExtraItemsPopup({
  setShowExtraPopup,
  setActiveTab,
  submitOrder,
}: {
  setShowExtraPopup: (show: boolean) => void;
  setActiveTab: (tab: "basic" | "extra") => void;
  submitOrder: () => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center relative overflow-hidden transform animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500" />
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-sm">
          🎁
        </div>
        <h3 className="text-2xl font-black text-brand-navy mb-3 tracking-tight">
          Finished with your basic items?
        </h3>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Would you like to add{" "}
          <strong className="text-brand-navy font-bold">
            optional extra items
          </strong>{" "}
          before checkout? Please note: these items are payable.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => {
              setShowExtraPopup(false);
              setActiveTab("extra");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full bg-brand-navy text-white rounded-xl py-3.5 text-sm font-bold hover:bg-brand-navy/90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Yes, show me the extra items
          </button>
          <button
            onClick={async () => {
              setShowExtraPopup(false);
              await submitOrder();
            }}
            className="w-full bg-white border-2 border-gray-100 text-gray-600 rounded-xl py-3.5 text-sm font-bold hover:bg-gray-50 hover:border-gray-200 transition-all"
          >
            No, place order now
          </button>
        </div>
      </div>
    </div>
  );
}
