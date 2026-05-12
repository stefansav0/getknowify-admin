import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

// Initialize the GA4 Client
// We use regex to ensure the newline characters in the private key are parsed correctly by Node.js
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export async function GET() {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;

    // Safety check: Ensure environment variables are set
    if (!propertyId || !process.env.GA_PRIVATE_KEY) {
      console.warn("GA4 Credentials missing. Returning empty array.");
      return NextResponse.json({ success: true, visits: [] });
    }

    // Run the report against GA4
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'dateHour' }, // Returns format: YYYYMMDDHH (e.g., 2026051210)
        { name: 'country' },  // Returns format: Country Name (e.g., "India", "United States")
        { name: 'pagePath' } // <--- Add this
      ],
      metrics: [
        { name: 'screenPageViews' }, // Total page views
        { name: 'userEngagementDuration' } // <--- Add this (Google returns total seconds)
      ],
    });

    // We need to format the GA4 aggregated data to match what your frontend expects.
    const visits = [];

    // Loop through the data provided by Google Analytics
    response.rows.forEach(row => {
      // Dimension 0 is 'dateHour', Dimension 1 is 'country', Dimension 2 is 'pagePath'
      const dateHourString = row.dimensionValues[0].value; // e.g., "2026051210"
      const countryName = row.dimensionValues[1].value;    // e.g., "India"
      
      const pageViews = parseInt(row.metricValues[0].value, 10);

      // Extract parts to build a valid ISO date string
      const year = dateHourString.substring(0, 4);
      const month = dateHourString.substring(4, 6);
      const day = dateHourString.substring(6, 8);
      const hour = dateHourString.substring(8, 10);
      
      const timestamp = new Date(`${year}-${month}-${day}T${hour}:00:00Z`).toISOString();

      // For every page view in that hour/country combination, push one object to the array.
      // This allows your frontend's .filter() logic and country aggregations to work perfectly.
      for (let i = 0; i < pageViews; i++) {
        visits.push({ 
          createdAt: timestamp,
          country: countryName === "(not set)" ? "Unknown" : countryName 
        });
      }
    });

    return NextResponse.json({ success: true, visits });

  } catch (error) {
    console.error("Google Analytics Fetch Error:", error);
    // Return empty array on failure so the frontend UI doesn't crash
    return NextResponse.json({ success: false, visits: [] }, { status: 500 });
  }
}