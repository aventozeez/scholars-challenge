export default function GalleryPage() {
  const placeholders = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-[#0a1628] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[#f5a623] font-bold text-sm tracking-widest uppercase mb-3">Memories</div>
          <h1 className="text-5xl font-black text-white mb-4">Photo Gallery</h1>
          <p className="text-white/60 text-xl">Highlights from past Scholars Challenge competitions</p>
        </div>
      </section>

      {/* Gallery grid */}
      <section className="py-16 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {placeholders.map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group hover:from-[#0a1628] hover:to-[#112244] transition-all cursor-pointer"
              >
                <span className="text-slate-400 group-hover:text-white/40 text-xs font-medium transition-colors">
                  Photo {i}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-400 text-sm mt-8">
            Gallery photos will be uploaded after the first competition event.
          </p>
        </div>
      </section>
    </div>
  );
}
