export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F7FC] flex items-center justify-center text-[#0B1B3A]">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-[#E3E9F4] max-w-md">
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-sm text-[#5B6B8C] mb-4">The requested page could not be found.</p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 bg-[#0047AB] text-white font-bold rounded-xl text-sm"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
