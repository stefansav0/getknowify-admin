"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  MousePointerClick,
  Megaphone,
  CalendarDays,
  ExternalLink,
  Power,
  Loader2,
  X,
} from "lucide-react";

export default function AdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  const emptyForm = {
    title: "",
    advertiser: "",
    image: "",
    targetUrl: "",
    placement: "HOME_TOP",
    startDate: "",
    endDate: "",
    status: "active",
  };

  const [form, setForm] = useState(emptyForm);

  // ============================================================
  // FETCH ADS
  // ============================================================

  const fetchAds = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`https://www.getknowify.com/api/ads`);

      if (response.data?.success) {
        setAds(response.data.ads || []);
      }
    } catch (error) {
      console.error("Failed to fetch ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // ============================================================
  // FORM
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingAd(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);

    setForm({
      title: ad.title || "",
      advertiser: ad.advertiser || "",
      image: ad.image || "",
      targetUrl: ad.targetUrl || "",
      placement: ad.placement || "HOME_TOP",
      startDate: ad.startDate
        ? new Date(ad.startDate).toISOString().split("T")[0]
        : "",
      endDate: ad.endDate
        ? new Date(ad.endDate).toISOString().split("T")[0]
        : "",
      status: ad.status || "active",
    });

    setShowModal(true);
  };

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingAd) {
        await axios.put(`https://www.getknowify.com/api/ads/${editingAd._id}`, form);
      } else {
        await axios.post(`https://www.getknowify.com/api/ads`, form);
      }

      setShowModal(false);
      setEditingAd(null);
      setForm(emptyForm);

      await fetchAds();
    } catch (error) {
      console.error("Save ad error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to save advertisement"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const deleteAd = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this advertisement?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`https://www.getknowify.com/api/ads/${id}`);

      await fetchAds();
    } catch (error) {
      console.error("Delete ad error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete advertisement"
      );
    }
  };

  // ============================================================
  // TOGGLE STATUS
  // ============================================================

  const toggleStatus = async (ad) => {
    try {
      const newStatus =
        ad.status === "active" ? "inactive" : "active";

      await axios.put(`https://www.getknowify.com/api/ads/${ad._id}`, {
        ...ad,
        status: newStatus,
      });

      await fetchAds();
    } catch (error) {
      console.error("Toggle status error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update advertisement"
      );
    }
  };

  // ============================================================
  // STATS
  // ============================================================

  const totalAds = ads.length;

  const activeAds = ads.filter(
    (ad) => ad.status === "active"
  ).length;

  const totalImpressions = ads.reduce(
    (sum, ad) => sum + (ad.impressions || 0),
    0
  );

  const totalClicks = ads.reduce(
    (sum, ad) => sum + (ad.clicks || 0),
    0
  );

  const ctr =
    totalImpressions > 0
      ? ((totalClicks / totalImpressions) * 100).toFixed(2)
      : "0.00";

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />

          <p className="text-sm font-medium text-zinc-500">
            Loading advertisements...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen space-y-8 bg-zinc-50/50 p-4 md:p-8">

      {/* HEADER */}

      <div className="flex flex-col gap-5 rounded-3xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-2">
              <Megaphone className="h-6 w-6 text-purple-600" />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
              Advertisement Manager
            </h1>
          </div>

          <p className="text-zinc-500">
            Manage your sponsored advertisements and campaigns.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          Create Advertisement
        </button>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">

        <StatCard
          title="Total Ads"
          value={totalAds}
          icon={Megaphone}
          color="purple"
        />

        <StatCard
          title="Active Ads"
          value={activeAds}
          icon={Power}
          color="green"
        />

        <StatCard
          title="Impressions"
          value={totalImpressions}
          icon={Eye}
          color="blue"
        />

        <StatCard
          title="Clicks"
          value={totalClicks}
          icon={MousePointerClick}
          color="orange"
        />

        <StatCard
          title="CTR"
          value={`${ctr}%`}
          icon={ExternalLink}
          color="pink"
        />

      </div>

      {/* ADS */}

      <Card className="rounded-3xl border-0 bg-white shadow-md">

        <CardHeader className="border-b border-zinc-100">
          <CardTitle className="text-xl">
            Advertisements
          </CardTitle>

          <CardDescription>
            Manage all advertisements running on GetKnowify.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">

          {ads.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

              <div className="mb-4 rounded-2xl bg-zinc-100 p-4">
                <Megaphone className="h-8 w-8 text-zinc-400" />
              </div>

              <h3 className="text-lg font-bold text-zinc-900">
                No advertisements yet
              </h3>

              <p className="mt-1 max-w-md text-sm text-zinc-500">
                Create your first advertisement to start showing
                sponsored content on GetKnowify.
              </p>

              <button
                onClick={openCreateModal}
                className="mt-5 flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4" />
                Create Advertisement
              </button>

            </div>
          ) : (
            <div className="divide-y divide-zinc-100">

              {ads.map((ad) => {

                const adCtr =
                  ad.impressions > 0
                    ? (
                        (ad.clicks / ad.impressions) *
                        100
                      ).toFixed(2)
                    : "0.00";

                const now = new Date();

                const startDate = new Date(ad.startDate);
                const endDate = new Date(ad.endDate);

                const dateActive =
                  now >= startDate && now <= endDate;

                const isRunning =
                  ad.status === "active" && dateActive;

                return (
                  <div
                    key={ad._id}
                    className="flex flex-col gap-5 p-5 transition hover:bg-zinc-50/50 lg:flex-row lg:items-center"
                  >

                    {/* IMAGE */}

                    <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl border bg-zinc-50 lg:w-48">
                      <img
                        src={ad.image}
                        alt={ad.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* INFO */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-bold text-zinc-900">
                          {ad.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                            isRunning
                              ? "bg-green-100 text-green-700"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {isRunning
                            ? "Running"
                            : ad.status}
                        </span>

                      </div>

                      <p className="mt-1 text-sm font-medium text-zinc-500">
                        {ad.advertiser}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">

                        <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-600">
                          {ad.placement}
                        </span>

                        <span className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
                          <CalendarDays className="h-3 w-3" />

                          {new Date(
                            ad.startDate
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            ad.endDate
                          ).toLocaleDateString()}
                        </span>

                      </div>

                    </div>

                    {/* PERFORMANCE */}

                    <div className="grid grid-cols-3 gap-4 lg:w-[300px]">

                      <Performance
                        icon={Eye}
                        label="Impressions"
                        value={(ad.impressions || 0).toLocaleString()}
                      />

                      <Performance
                        icon={MousePointerClick}
                        label="Clicks"
                        value={(ad.clicks || 0).toLocaleString()}
                      />

                      <Performance
                        icon={ExternalLink}
                        label="CTR"
                        value={`${adCtr}%`}
                      />

                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center gap-2">

                      <button
                        onClick={() => toggleStatus(ad)}
                        title={
                          ad.status === "active"
                            ? "Disable advertisement"
                            : "Enable advertisement"
                        }
                        className={`rounded-xl p-2.5 transition ${
                          ad.status === "active"
                            ? "bg-green-50 text-green-600 hover:bg-green-100"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}
                      >
                        <Power className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => openEditModal(ad)}
                        className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition hover:bg-blue-100"
                        title="Edit advertisement"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => deleteAd(ad._id)}
                        className="rounded-xl bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
                        title="Delete advertisement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </CardContent>

      </Card>

      {/* CREATE / EDIT MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b p-6">

              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  {editingAd
                    ? "Edit Advertisement"
                    : "Create Advertisement"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Configure your sponsored advertisement.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-zinc-100 p-2 text-zinc-500 hover:bg-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              <div className="grid gap-5 md:grid-cols-2">

                <FormField
                  label="Advertiser Name"
                  name="advertiser"
                  value={form.advertiser}
                  onChange={handleChange}
                  placeholder="ABC Academy"
                  required
                />

                <FormField
                  label="Advertisement Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Learn Web Development"
                  required
                />

              </div>

              <FormField
                label="Banner Image URL"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="/ads/my-banner.jpg"
                required
              />

              {form.image && (
                <div className="overflow-hidden rounded-xl border bg-zinc-50">
                  <img
                    src={form.image}
                    alt="Advertisement preview"
                    className="max-h-48 w-full object-contain"
                  />
                </div>
              )}

              <FormField
                label="Destination URL"
                name="targetUrl"
                value={form.targetUrl}
                onChange={handleChange}
                placeholder="https://example.com"
                required
              />

              <div className="grid gap-5 md:grid-cols-2">

                <FormSelect
                  label="Placement"
                  name="placement"
                  value={form.placement}
                  onChange={handleChange}
                  options={[
                    ["HOME_TOP", "Home - Top"],
                    ["HOME_MIDDLE", "Home - Middle"],
                    ["HOME_BOTTOM", "Home - Bottom"],
                    ["ARTICLE_TOP", "Article - Top"],
                    ["ARTICLE_MIDDLE", "Article - Middle"],
                    ["ARTICLE_BOTTOM", "Article - Bottom"],
                  ]}
                />

                <FormSelect
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={[
                    ["active", "Active"],
                    ["inactive", "Inactive"],
                  ]}
                />

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <FormField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />

                <FormField
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingAd
                    ? "Update Advertisement"
                    : "Create Advertisement"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}) {
  const colors = {
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    pink: "bg-pink-50 text-pink-600",
  };

  return (
    <Card className="rounded-3xl border-0 bg-white shadow-md">
      <CardContent className="p-5">

        <div className="flex items-start justify-between">

          <div>
            <p className="text-xs font-bold text-zinc-500">
              {title}
            </p>

            <h2 className="mt-2 text-2xl font-black text-zinc-900">
              {typeof value === "number"
                ? value.toLocaleString()
                : value}
            </h2>
          </div>

          <div
            className={`rounded-xl p-2.5 ${colors[color]}`}
          >
            <Icon className="h-5 w-5" />
          </div>

        </div>

      </CardContent>
    </Card>
  );
}

// ============================================================
// PERFORMANCE
// ============================================================

function Performance({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
        <Icon className="h-3 w-3" />
        {label}
      </div>

      <p className="text-sm font-black text-zinc-800">
        {value}
      </p>
    </div>
  );
}

// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-zinc-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

    </div>
  );
}

// ============================================================
// FORM SELECT
// ============================================================

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-zinc-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

    </div>
  );
}