import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

// ==========================================
// GOOGLE ANALYTICS CLIENT
// ==========================================

const analyticsDataClient =
  new BetaAnalyticsDataClient({
    credentials: {
      client_email:
        process.env.GA_CLIENT_EMAIL,

      private_key:
        process.env.GA_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
    },
  });

// ==========================================
// GET ANALYTICS DATA
// ==========================================

export async function GET() {
  try {
    const propertyId =
      process.env.GA_PROPERTY_ID;

    // ==========================================
    // SAFETY CHECK
    // ==========================================

    if (
      !propertyId ||
      !process.env.GA_PRIVATE_KEY
    ) {
      console.warn(
        "GA4 Credentials missing."
      );

      return NextResponse.json({
        success: true,
        visits: [],
      });
    }

    // ==========================================
    // FETCH REPORT
    // ==========================================

    const [response] =
      await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,

        dateRanges: [
          {
            startDate: "30daysAgo",
            endDate: "today",
          },
        ],

        dimensions: [
          {
            name: "dateHour",
          },

          {
            name: "country",
          },

          {
            name: "pagePath",
          },
        ],

        metrics: [
          {
            name: "screenPageViews",
          },

          {
            name:
              "userEngagementDuration",
          },

          {
            name: "activeUsers",
          },
        ],
      });

    // ==========================================
    // FORMAT DATA
    // ==========================================

    const visits = [];

    response.rows?.forEach((row) => {

      // ==========================================
      // DIMENSIONS
      // ==========================================

      const dateHour =
        row.dimensionValues?.[0]?.value;

      const country =
        row.dimensionValues?.[1]?.value;

      const pagePath =
        row.dimensionValues?.[2]?.value;

      // ==========================================
      // METRICS
      // ==========================================

      const pageViews =
        parseInt(
          row.metricValues?.[0]?.value || "0",
          10
        ) || 0;

      const engagementDuration =
        parseFloat(
          row.metricValues?.[1]?.value || "0"
        ) || 0;

      const activeUsers =
        parseInt(
          row.metricValues?.[2]?.value || "0",
          10
        ) || 0;

      // ==========================================
      // DATE FORMAT
      // ==========================================

      if (!dateHour || dateHour.length < 10)
        return;

      const year =
        dateHour.substring(0, 4);

      const month =
        dateHour.substring(4, 6);

      const day =
        dateHour.substring(6, 8);

      const hour =
        dateHour.substring(8, 10);

      const timestamp = new Date(
        `${year}-${month}-${day}T${hour}:00:00Z`
      ).toISOString();

      // ==========================================
      // AVERAGE TIME PER VIEW
      // ==========================================

      const avgTimeSpent =
        pageViews > 0
          ? Math.round(
              engagementDuration / pageViews
            )
          : 0;

      // ==========================================
      // PUSH VISIT DATA
      // ==========================================

      visits.push({
        createdAt: timestamp,

        country:
          country === "(not set)"
            ? "Unknown"
            : country || "Unknown",

        pagePath:
          pagePath || "/",

        pageViews,

        activeUsers,

        visitors: activeUsers,

        timeSpent: avgTimeSpent,
      });
    });

    // ==========================================
    // SORT NEWEST FIRST
    // ==========================================

    visits.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    // ==========================================
    // RETURN RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,
      visits,
    });

  } catch (error) {

    console.error(
      "Google Analytics Fetch Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        visits: [],
      },
      {
        status: 500,
      }
    );
  }
}