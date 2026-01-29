import Link from 'next/link';
import { BarChart3, Settings, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Tooling Spend Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track, compare, and manage your software tooling expenses against budgeted amounts.
            Powered by Ramp and Firebase.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Link href="/dashboard" className="group">
            <div className="card p-8 h-full hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Dashboard
              </h2>
              <p className="text-gray-600">
                View monthly spend summaries, compare against budgets, and track variances.
              </p>
            </div>
          </Link>

          <Link href="/admin" className="group">
            <div className="card p-8 h-full hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Admin
              </h2>
              <p className="text-gray-600">
                Manage vendors, set budgets, sync Ramp data, and configure vendor mappings.
              </p>
            </div>
          </Link>

          <div className="card p-8 h-full">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Analytics
            </h2>
            <p className="text-gray-600">
              View spending trends, identify cost-saving opportunities, and generate reports.
            </p>
            <p className="text-sm text-gray-400 mt-2">(Coming soon)</p>
          </div>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="card p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Key Features
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Real-time sync with Ramp API for up-to-date transaction data</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Intelligent fuzzy matching of merchants to known vendors</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Roll-forward accounting presentation with prior month, budget, and actuals</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Flag over-budget spending, unused subscriptions, and non-budgeted tools</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Year-to-date tracking with cumulative variance analysis</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
