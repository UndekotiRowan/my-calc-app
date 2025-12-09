"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [inputs, setInputs] = useState({ principal: '', rate: '', time: '' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. Check if user is logged in immediately when page loads
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user); // If user exists, they are logged in
    };
    checkUser();
  }, []);

  // 2. Login Function
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  // 3. Logout Function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); // Hide calculator immediately
    setResult(null);
  };

  // 4. The Calculation Logic (Talks to Python)
  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      setResult(data);
      
      // Save to History (Optional - happens in background)
      if (user && data.status === 'success') {
        await supabase.from('history').insert({
          user_email: user.email,
          input_data: inputs,
          result: data.total_amount
        });
      }
    } catch (error) {
      alert("Calculation Error");
    }
    setLoading(false);
  };

  // THE UI: Everything inside here determines what is shown
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Finance App</h1>

      {/* CONDITIONAL RENDERING: This is the logic you asked for */}
      {!user ? (
        // SCENE 1: USER IS NOT LOGGED IN
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Welcome Back</h2>
          <p className="text-gray-600 mb-6">Please sign in to access the calculator and save your history.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Login with Google
          </button>
        </div>
      ) : (
        // SCENE 2: USER IS LOGGED IN (SHOW CALCULATOR)
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <span className="text-sm text-green-600 font-medium">✓ Logged in as {user.email}</span>
            <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 underline">Logout</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Principal Amount ($)</label>
              <input 
                type="number" 
                onChange={e => setInputs({ ...inputs, principal: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 5000"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate (%)</label>
                <input 
                  type="number" 
                  onChange={e => setInputs({ ...inputs, rate: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time (Years)</label>
                <input 
                  type="number" 
                  onChange={e => setInputs({ ...inputs, time: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="2"
                />
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition mt-4"
            >
              {loading ? 'Calculating...' : 'Calculate Interest'}
            </button>
          </div>

          {/* RESULT AREA */}
          {result && result.status === 'success' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg text-center animate-pulse-once">
              <p className="text-gray-500 text-sm uppercase tracking-wide">Total Amount</p>
              <p className="text-4xl font-bold text-green-700 mt-1">${result.total_amount}</p>
              <p className="text-sm text-gray-600 mt-2">Interest Earned: ${result.interest_earned}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}