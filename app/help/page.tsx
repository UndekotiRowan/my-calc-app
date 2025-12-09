export default function Help() {
  return (
    <div className="p-10 font-sans">
      <h1 className="text-3xl font-bold mb-4">How to use</h1>
      <ul className="list-disc pl-5 space-y-2">
        <li>Log in using your Google Account.</li>
        <li>Enter the Principal amount, Rate, and Time.</li>
        <li>Click Calculate to see your result and save it automatically.</li>
      </ul>
      <p className="mt-4"><a href="/" className="text-blue-500 underline">← Back to Calculator</a></p>
    </div>
  );
}