import axios from "axios";

// 🚀 Fetch feedback on the server for the admin
async function getFeedback() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.getknowify.com/";
    // We use no-store so the admin always sees the latest feedback instantly
    const res = await fetch(`${baseUrl}/api/feedback`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch feedback", error);
    return [];
  }
}

export default async function AdminFeedbackDashboard() {
  const feedbacks = await getFeedback();

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">User Feedback Inbox</h1>
      
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                <th className="p-5 font-bold">User</th>
                <th className="p-5 font-bold">Rating</th>
                <th className="p-5 font-bold">Message</th>
                <th className="p-5 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feedbacks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500 font-medium">No feedback received yet.</td>
                </tr>
              ) : (
                feedbacks.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* USER NAME */}
                    <td className="p-5">
                      <p className="font-bold text-slate-900">{item.name || "Anonymous"}</p>
                    </td>

                    {/* RATING */}
                    <td className="p-5">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-700">{item.rating || "-"}</span>
                        {item.rating && <span className="text-amber-400 text-lg">★</span>}
                      </div>
                    </td>

                    {/* MESSAGE */}
                    <td className="p-5 max-w-lg">
                      <p className="text-slate-600 leading-relaxed">{item.message}</p>
                    </td>

                    {/* DATE */}
                    <td className="p-5 text-sm font-medium text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}