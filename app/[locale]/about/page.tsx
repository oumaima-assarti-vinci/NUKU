import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <h1 className="text-4xl font-bold mb-6">{t("title")}</h1>
      <p className="text-gray-600 text-lg mb-10">{t("intro")}</p>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 border rounded-2xl">
          <h3 className="font-semibold mb-2">{t("mission_title")}</h3>
          <p className="text-gray-600 text-sm">{t("mission_text")}</p>
        </div>
        <div className="p-6 border rounded-2xl">
          <h3 className="font-semibold mb-2">{t("values_title")}</h3>
          <p className="text-gray-600 text-sm">{t("values_text")}</p>
        </div>
        <div className="p-6 border rounded-2xl">
          <h3 className="font-semibold mb-2">{t("made_title")}</h3>
          <p className="text-gray-600 text-sm">{t("made_text")}</p>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden border">
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=500&fit=crop"
          alt="Workshop"
          className="w-full h-[260px] md:h-[360px] object-cover"
        />
      </div>
    </div>
  );
}