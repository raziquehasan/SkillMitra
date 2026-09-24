
"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function FutureDemandPage() {
  const { t } = useLanguage();

  return (
    <main>
      {/* ================= FUTURE DEMAND FORECAST ================= */}
      <section
        id="future-demand"
        className="border-b border-slate-200 bg-[#f0f4f8]"
        aria-labelledby="future-demand-heading"
      >
        <div className="mx-auto max-w-7xl px-5 py-5 lg:py-6">

          {/* Main Heading */}
          <div className="pt-1">
            <h2
              id="future-demand-heading"
              className="font-serif text-3xl font-semibold text-[#c2410c]"
            >
              {t("demand.futureForecast")}
            </h2>
          </div>

          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            {t("demand.futureForecastSubtitle")}
          </p>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#123b68]">
                {t("demand.currentHighDemand")}
              </h3>

              <span className="text-xs text-slate-500">
                {t("demand.forecastHorizon")}
              </span>
            </div>

            {/* Future Demand Forecast Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold text-[#123b68]">
                      {t("demand.skill")}
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[#123b68]">
                      {t("demand.forecast")}
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[#123b68]">
                      {t("demand.confidence")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 text-slate-700">
                      Data Analytics
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        {t("demand.growing")}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                        High
                      </span>
                    </td>
                  </tr>

                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 text-slate-700">
                      EV Technology
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                        {t("demand.highDemand")}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                        Medium
                      </span>
                    </td>
                  </tr>

                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 text-slate-700">
                      Cloud Computing
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        {t("demand.growing")}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                        High
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 text-slate-700">
                      Solar Installation
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">
                        {t("demand.stable")}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                        Medium
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              {t("demand.noForecasts")}
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Future demand forecasts are generated
              using historical demand analysis, job posting signals, and trend
              data from the SkillMitra platform. Confidence levels indicate the
              amount of evidence available for each forecast.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

