"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Connect to Supabase using the keys from your .env.local file
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [inputs, setInputs] = useState({ principal: '', rate: '', time: '' });
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user?.email) fetchHistory(user.email);
    };
    checkUser();
  }, []);

  // 2. Login function
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  // 3. Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
    setResult(null);
  };

  // 4. Fetch History
  const fetchHistory = async (email: string) => {
    const { data } = await supabase
      .from('history')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  // 5. Calculate (Call Python + Save)
  const handleCalculate = async () => {
    setLoading(true);
    try {
      // Call Python API
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      setResult(data);

      // Save to Database if logged in
      if (user && data.status === 'success') {
        await supabase.from('history').insert({
          user_email: user.email,
          input_data: inputs,
          result: data.total_amount
        });
        fetchHistory(user.email);
      }
    } catch (error) {
      alert("Error connecting to calculation engine");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Finance Calc App</h1>
        <div className="space-x-4">
          <a href="/about" className="text-gray-600 hover:text-black">About</a>
          <a href="/contact" className="text-gray-600 hover:text-black">Contact</a>
          <a href="/help" className="text-gray-600 hover:text-black">Help</a>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        {!user ? (
          <div className="text-center py-10">
            <h2 className="text-xl mb-4">Please log in to save your calculations</h2>
            <button onClick={handleLogin} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Login with Google
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-green-700 font-medium">Welcome, {user.email}</p>
              <button onClick={handleLogout} className="text-sm text-red-500 border border-red-200 px-3 py-1 rounded">Logout</button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <input type="number" placeholder="Principal ($)" 
                onChange={e => setInputs({ ...inputs, principal: e.target.value })} 
                className="border p-3 rounded bg-gray-50" />
              <input type="number" placeholder="Rate (%)" 
                onChange={e => setInputs({ ...inputs, rate: e.target.value })} 
                className="border p-3 rounded bg-gray-50" />
              <input type="number" placeholder="Time (Years)" 
                onChange={e => setInputs({ ...inputs, time: e.target.value })} 
                className="border p-3 rounded bg-gray-50" />
            </div>

            <button 
              onClick={handleCalculate} 
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">
              {loading ? 'Calculating...' : 'Calculate Interest'}
            </button>

            {/* Results */}
            {result && result.status === 'success' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-green-700">${result.total_amount}</p>
                <p className="text-sm text-gray-500 mt-1">Interest Earned: ${result.interest_earned}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Section */}
      {user && history.length > 0 && (
        <div className="max-w-2xl mx-auto mt-8">
          <h3 className="font-bold text-gray-700 mb-4">Calculation History</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {history.map((item: any) => (
              <div key={item.id} className="p-4 border-b flex justify-between items-center hover:bg-gray-50">
                <div>
                  <span className="font-bold text-gray-800">${item.result}</span>
                  <span className="text-xs text-gray-500 ml-2">({new Date(item.created_at).toLocaleDateString()})</span>
                </div>
                <div className="text-xs text-gray-400">
                  P: {item.input_data.principal} | R: {item.input_data.rate}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}