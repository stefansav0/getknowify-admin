"use client";

import { useEffect, useState } from "react";

export default function AffiliateDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSales() {
    try {
      setLoading(true);

      const response = await fetch(
        "https://www.getknowify.com/api/affiliate/sale-data",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to load sales"
        );
      }

      setData(result);

    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to load sales data"
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSales();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        Loading affiliate data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl bg-red-50 p-5 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Affiliate Sales
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            The Art of Natural Attraction
          </p>
        </div>

        <button
          onClick={loadSales}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Refresh
        </button>

      </div>

      {/* Stats */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Total Clicks"
          value={stats.totalClicks || 0}
        />

        <StatCard
          title="Total Sales"
          value={stats.totalSales || 0}
        />

        <StatCard
          title="Revenue"
          value={`$${Number(
            stats.totalRevenue || 0
          ).toFixed(2)}`}
        />

        <StatCard
          title="Commission"
          value={`$${Number(
            stats.totalCommission || 0
          ).toFixed(2)}`}
        />

      </div>

      {/* More stats */}

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Today"
          value={stats.todaySales || 0}
        />

        <StatCard
          title="This Week"
          value={stats.weekSales || 0}
        />

        <StatCard
          title="This Month"
          value={stats.monthSales || 0}
        />

        <StatCard
          title="Conversion"
          value={`${stats.conversionRate || 0}%`}
        />

      </div>

      {/* Sales Table */}

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">

          <h2 className="text-lg font-bold text-slate-900">
            Recent Sales
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Date
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Order
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Transaction
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Country
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Sale
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500">
                  Commission
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {data?.sales?.length > 0 ? (

                data.sales.map((sale) => (

                  <tr
                    key={sale._id}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {sale.purchasedAt
                        ? new Date(
                            sale.purchasedAt
                          ).toLocaleString()
                        : new Date(
                            sale.updatedAt
                          ).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          ${
                            sale.status ===
                            "purchased"
                              ? "bg-green-100 text-green-700"
                              : sale.status ===
                                "refunded"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }
                        `}
                      >
                        {sale.status}
                      </span>

                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {sale.orderId || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {sale.transactionId || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {sale.country || "Unknown"}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                      {sale.currency || "$"}{" "}
                      {Number(
                        sale.saleAmount || 0
                      ).toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-green-600">
                      {sale.currency || "$"}{" "}
                      {Number(
                        sale.commission || 0
                      ).toFixed(2)}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No sales yet
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

function StatCard({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}