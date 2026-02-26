"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SupabaseTestPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      console.log("🔍 Testing Supabase connection...");
      
      const { data, error } = await supabase
        .from("products")
        .select("*");

      console.log("📦 Data received:", data);
      console.log("❌ Error:", error);

      setResult(data);
      setError(error);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Test Supabase Connection</h1>

        {loading && (
          <div className="p-6 bg-blue-50 rounded-lg">
            <p className="text-blue-900">⏳ Testing connection...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* RÉSULTAT */}
            <div className="mb-6 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-bold mb-4">📊 Result:</h2>
              <pre className="bg-white p-4 rounded overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>

            {/* ERREUR */}
            {error && (
              <div className="mb-6 p-6 bg-red-50 rounded-lg">
                <h2 className="text-xl font-bold mb-4 text-red-900">❌ Error:</h2>
                <pre className="bg-white p-4 rounded overflow-auto text-sm text-red-700">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            )}

            {/* DIAGNOSTIC */}
            <div className="p-6 bg-purple-50 rounded-lg">
              <h2 className="text-xl font-bold mb-4">🔍 Diagnostic:</h2>
              
              {result && result.length > 0 ? (
                <div className="text-green-700">
                  <p className="font-bold text-2xl mb-2">✅ SUCCESS!</p>
                  <p>Found {result.length} products in database.</p>
                  <p className="mt-4 text-sm">Your Supabase connection is working correctly.</p>
                </div>
              ) : result && result.length === 0 ? (
                <div className="text-orange-700">
                  <p className="font-bold text-2xl mb-2">⚠️ EMPTY TABLE</p>
                  <p>Connection works but no products found.</p>
                  <p className="mt-4 text-sm">Add products in Supabase Table Editor.</p>
                </div>
              ) : error ? (
                <div className="text-red-700">
                  <p className="font-bold text-2xl mb-2">❌ RLS / AUTH ERROR</p>
                  <p className="mb-4">Most likely cause: Row Level Security blocking public read.</p>
                  
                  <div className="bg-white p-4 rounded mt-4">
                    <p className="font-bold mb-2">Fix in Supabase:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to Authentication → Policies</li>
                      <li>Select "products" table</li>
                      <li>Add policy: <code className="bg-gray-100 px-2 py-1 rounded">SELECT</code></li>
                      <li>Target role: <code className="bg-gray-100 px-2 py-1 rounded">anon</code></li>
                      <li>Using expression: <code className="bg-gray-100 px-2 py-1 rounded">true</code></li>
                    </ol>
                  </div>

                  <div className="bg-white p-4 rounded mt-4">
                    <p className="font-bold mb-2">Or run this SQL:</p>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
{`CREATE POLICY "Public read products"
ON products
FOR SELECT
USING (true);`}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-gray-700">
                  <p className="font-bold text-2xl mb-2">❓ UNKNOWN STATE</p>
                  <p>Check console logs for more details.</p>
                </div>
              )}
            </div>

            {/* ENV CHECK */}
            <div className="mt-6 p-6 bg-yellow-50 rounded-lg">
              <h2 className="text-xl font-bold mb-4">🔑 Environment Check:</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-bold">NEXT_PUBLIC_SUPABASE_URL:</span>{" "}
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                    <span className="text-green-600">✅ Set</span>
                  ) : (
                    <span className="text-red-600">❌ Missing</span>
                  )}
                </p>
                <p>
                  <span className="font-bold">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>{" "}
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                    <span className="text-green-600">✅ Set</span>
                  ) : (
                    <span className="text-red-600">❌ Missing</span>
                  )}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}