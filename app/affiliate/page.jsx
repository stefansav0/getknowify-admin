"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const API_URL =
  "https://www.getknowify.com/api/affiliate/stats";

export default function AffiliatePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH DATA
  // =========================================================

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to load affiliate data"
        );
      }

      setData(result);
    } catch (error) {
      console.error(
        "Affiliate dashboard error:",
        error
      );

      setError(
        "Unable to load affiliate statistics. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchStats();
  }, []);

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return <LoadingScreen />;
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
              !
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Unable to load data
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <button
              onClick={() => fetchStats()}
              className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // DATA
  // =========================================================

  const stats = data?.stats || {
    totalClicks: 0,
    todayClicks: 0,
    weekClicks: 0,
    monthClicks: 0,
  };

  const dailyClicks = data?.dailyClicks || [];
  const deviceClicks = data?.deviceClicks || [];
  const sourceClicks = data?.sourceClicks || [];
  const countryClicks = data?.countryClicks || [];
  const recentClicks = data?.recentClicks || [];

  // =========================================================
  // FORMAT DAILY DATA
  // =========================================================

  const chartData = dailyClicks.map((item) => ({
    date: formatDate(item._id),
    fullDate: item._id,
    clicks: item.clicks,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-xl">
                ❤️
              </div>

              <div>
    <h1 className="text-3xl font-bold text-slate-900">
      Affiliate
    </h1>

    <p className="mt-1 text-sm text-slate-500">
      Track clicks, sales and commissions
    </p>
  </div>

  <a
    href="/affiliate/sale"
    className="
      inline-flex
      items-center
      justify-center
      gap-2
      rounded-xl
      bg-slate-900
      px-5
      py-3
      text-sm
      font-semibold
      text-white
      shadow-sm
      transition
      hover:bg-slate-800
    "
  >
    💰 Sale Data
  </a>


            </div>
          </div>

          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-slate-900
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <span
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            >
              ↻
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* =====================================================
            ERROR BANNER
        ====================================================== */}

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={() => fetchStats(true)}
              className="text-sm font-semibold text-red-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* =====================================================
            PRODUCT CARD
        ====================================================== */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 text-2xl">
                💕
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Tracking Product
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  The Art of Natural Attraction
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  GetKnowify homepage banner
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Status
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Tracking Active
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            STAT CARDS
        ====================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Clicks"
            value={stats.totalClicks}
            icon="👆"
            description="All time"
          />

          <StatCard
            title="Today"
            value={stats.todayClicks}
            icon="📅"
            description="Since midnight"
          />

          <StatCard
            title="This Week"
            value={stats.weekClicks}
            icon="📊"
            description="Current week"
          />

          <StatCard
            title="This Month"
            value={stats.monthClicks}
            icon="🚀"
            description="Current month"
          />

        </div>

        {/* =====================================================
            DATE-WISE CHART
        ====================================================== */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Clicks Over Time
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Daily affiliate banner clicks
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
                {dailyClicks.length} days tracked
              </div>

            </div>
          </div>

          <div className="p-4 sm:p-6">

            {chartData.length === 0 ? (
              <EmptyChart />
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="clickGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopOpacity={0.25}
                        />

                        <stop
                          offset="100%"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 11,
                      }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                      }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      content={<CustomTooltip />}
                    />

                    <Area
                      type="monotone"
                      dataKey="clicks"
                      strokeWidth={3}
                      fill="url(#clickGradient)"
                      dot={{
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

          </div>
        </div>

        {/* =====================================================
            DEVICE + SOURCE
        ====================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* DEVICE */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                Device Breakdown
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Where your clicks are coming from
              </p>
            </div>

            <div className="p-5">

              {deviceClicks.length === 0 ? (
                <EmptyData />
              ) : (
                <div className="space-y-5">

                  {deviceClicks.map(
                    (item) => {
                      const percentage =
                        stats.totalClicks > 0
                          ? Math.round(
                              (item.clicks /
                                stats.totalClicks) *
                                100
                            )
                          : 0;

                      return (
                        <div
                          key={item._id}
                        >
                          <div className="mb-2 flex items-center justify-between">

                            <div className="flex items-center gap-3">
                              <span className="text-lg">
                                {getDeviceIcon(
                                  item._id
                                )}
                              </span>

                              <span className="text-sm font-semibold capitalize text-slate-700">
                                {item._id}
                              </span>
                            </div>

                            <span className="text-sm font-bold text-slate-900">
                              {item.clicks}
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-slate-900 transition-all duration-700"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                          <p className="mt-1 text-right text-xs text-slate-400">
                            {percentage}%
                          </p>
                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>
          </div>

          {/* SOURCE */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                Traffic Sources
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Where the affiliate clicks originated
              </p>
            </div>

            <div className="p-5">

              {sourceClicks.length === 0 ? (
                <EmptyData />
              ) : (
                <div className="space-y-5">

                  {sourceClicks.map(
                    (item) => {
                      const percentage =
                        stats.totalClicks > 0
                          ? Math.round(
                              (item.clicks /
                                stats.totalClicks) *
                                100
                            )
                          : 0;

                      return (
                        <div
                          key={item._id}
                        >
                          <div className="mb-2 flex items-center justify-between">

                            <div className="flex items-center gap-3">
                              <span className="text-lg">
                                🔗
                              </span>

                              <span className="text-sm font-semibold text-slate-700">
                                {formatSource(
                                  item._id
                                )}
                              </span>
                            </div>

                            <span className="text-sm font-bold text-slate-900">
                              {item.clicks}
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-slate-900 transition-all duration-700"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                          <p className="mt-1 text-right text-xs text-slate-400">
                            {percentage}%
                          </p>
                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>
          </div>

        </div>

        {/* =====================================================
    COUNTRY BREAKDOWN
====================================================== */}

<div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

  <div className="border-b border-slate-200 p-5 sm:p-6">

    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Visitors by Country
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Countries generating affiliate clicks
        </p>
      </div>

      <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
        {countryClicks.length} countries
      </div>

    </div>

  </div>

  <div className="p-5 sm:p-6">

    {countryClicks.length === 0 ? (
      <EmptyData />
    ) : (

      <div className="space-y-5">

        {countryClicks.map((item) => {

          const percentage =
            stats.totalClicks > 0
              ? Math.round(
                  (item.clicks /
                    stats.totalClicks) *
                    100
                )
              : 0;

          const countryName =
            getCountryName(
              item._id,
              item.country
            );

          return (
            <div key={item._id}>

              <div className="mb-2 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <span className="text-xl">
                    {getCountryFlag(item._id)}
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {countryName}
                    </p>

                    <p className="text-xs uppercase text-slate-400">
                      {item._id}
                    </p>
                  </div>

                </div>

                <div className="text-right">

                  <p className="text-sm font-bold text-slate-900">
                    {item.clicks}
                  </p>

                  <p className="text-xs text-slate-400">
                    {percentage}%
                  </p>

                </div>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-700"
                  style={{
                    width: `${percentage}%`,
                  }}
                />

              </div>

            </div>
          );
        })}

      </div>

    )}

  </div>

</div>

        {/* =====================================================
            RECENT CLICKS
        ====================================================== */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5 sm:p-6">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Clicks
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest affiliate activity
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {recentClicks.length} recent
              </span>

            </div>

          </div>

          {recentClicks.length === 0 ? (
            <EmptyData />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[750px]">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
  Date & Time
</th>

<th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
  Country
</th>

<th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
  Device
</th>

<th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
  Source
</th>

<th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
  Referrer
</th>

                  </tr>
                </thead>

                <tbody>

                  {recentClicks.map(
                    (click, index) => (
                      <tr
                        key={
                          click._id ||
                          index
                        }
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >

                        <td className="whitespace-nowrap px-5 py-4">

                          <p className="text-sm font-medium text-slate-700">
                            {formatDateTime(
                              click.createdAt
                            )}
                          </p>

                        </td>

                        <td className="px-5 py-4">

  <div className="flex items-center gap-2">

    <span className="text-lg">
      {getCountryFlag(
        click.countryCode
      )}
    </span>

    <div>
      <p className="text-sm font-semibold text-slate-700">
        {getCountryName(
          click.countryCode,
          click.country
        )}
      </p>

      <p className="text-xs uppercase text-slate-400">
        {click.countryCode || "XX"}
      </p>
    </div>

  </div>

</td>

                        <td className="px-5 py-4">

                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-700">
                            {getDeviceIcon(
                              click.device
                            )}

                            {click.device ||
                              "Unknown"}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span className="text-sm text-slate-700">
                            {formatSource(
                              click.source
                            )}
                          </span>

                        </td>

                        <td className="max-w-[320px] px-5 py-4">

                          <p
                            className="truncate text-sm text-slate-500"
                            title={
                              click.referrer ||
                              "Direct"
                            }
                          >
                            {click.referrer ||
                              "Direct"}
                          </p>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="py-8 text-center">
          <p className="text-xs text-slate-400">
            Affiliate tracking powered by GetKnowify
          </p>
        </div>

      </main>
    </div>
  );
}

// =============================================================
// STAT CARD
// =============================================================

function StatCard({
  title,
  value,
  icon,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {(value || 0).toLocaleString()}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}

// =============================================================
// CUSTOM TOOLTIP
// =============================================================

function CustomTooltip({
  active,
  payload,
}) {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">

      <p className="text-xs font-medium text-slate-400">
        {item.fullDate}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {item.clicks}{" "}
        <span className="text-sm font-medium text-slate-500">
          clicks
        </span>
      </p>

    </div>
  );
}

// =============================================================
// LOADING SCREEN
// =============================================================

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="mx-auto max-w-7xl">

        <div className="animate-pulse">

          <div className="mb-8 h-10 w-72 rounded-xl bg-slate-200" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-36 rounded-2xl bg-white shadow-sm"
                />
              )
            )}

          </div>

          <div className="mt-6 h-[380px] rounded-2xl bg-white shadow-sm" />

          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            <div className="h-72 rounded-2xl bg-white shadow-sm" />

            <div className="h-72 rounded-2xl bg-white shadow-sm" />

          </div>

        </div>

      </div>

    </div>
  );
}

// =============================================================
// EMPTY CHART
// =============================================================

function EmptyChart() {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center">

      <div className="text-4xl">
        📈
      </div>

      <p className="mt-3 font-semibold text-slate-700">
        No click data yet
      </p>

      <p className="mt-1 text-sm text-slate-400">
        Your daily clicks will appear here.
      </p>

    </div>
  );
}

// =============================================================
// EMPTY DATA
// =============================================================

function EmptyData() {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center p-6 text-center">

      <div className="text-3xl">
        📭
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        No data yet
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Data will appear after visitors click your banner.
      </p>

    </div>
  );
}

// =============================================================
// FORMAT DATE
// =============================================================

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
}

// =============================================================
// FORMAT DATE + TIME
// =============================================================

function formatDateTime(dateString) {
  if (!dateString) return "Unknown";

  return new Date(
    dateString
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =============================================================
// DEVICE ICON
// =============================================================

function getDeviceIcon(device) {
  switch (device) {
    case "mobile":
      return "📱";

    case "tablet":
      return "📲";

    case "desktop":
      return "💻";

    default:
      return "🌐";
  }
}

// =============================================================
// COUNTRY NAME
// =============================================================

function getCountryName(
  countryCode,
  fallback
) {
  if (!countryCode) {
    return fallback || "Unknown";
  }

  try {
    const displayNames =
      new Intl.DisplayNames(
        ["en"],
        {
          type: "region",
        }
      );

    return (
      displayNames.of(
        countryCode.toUpperCase()
      ) ||
      fallback ||
      countryCode
    );
  } catch {
    return (
      fallback ||
      countryCode
    );
  }
}

// =============================================================
// COUNTRY FLAG
// =============================================================

function getCountryFlag(
  countryCode
) {
  if (
    !countryCode ||
    countryCode === "XX" ||
    countryCode.length !== 2
  ) {
    return "🌐";
  }

  return countryCode
    .toUpperCase()
    .split("")
    .map(
      (char) =>
        String.fromCodePoint(
          127397 +
            char.charCodeAt(0)
        )
    )
    .join("");
}

// =============================================================
// FORMAT SOURCE
// =============================================================

function formatSource(source) {
  if (!source) return "Unknown";

  return source
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}