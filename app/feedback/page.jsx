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
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold">Type</th>
                <th className="p-5 font-bold">User</th>
                <th className="p-5 font-bold">Message</th>
                <th className="p-5 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feedbacks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">No feedback received yet.</td>
                </tr>
              ) : (
                feedbacks.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        item.status === 'new' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-5 font-bold text-slate-700 capitalize">{item.type}</td>
                    <td className="p-5">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.email || "No email provided"}</p>
                    </td>
                    <td className="p-5 max-w-md">
                      <p className="text-slate-600 line-clamp-2">{item.message}</p>
                    </td>
                    <td className="p-5 text-sm font-medium text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
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