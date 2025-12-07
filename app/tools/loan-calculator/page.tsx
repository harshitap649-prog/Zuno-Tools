'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { Calculator, DollarSign } from 'lucide-react'

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [loanTerm, setLoanTerm] = useState('')
  const [result, setResult] = useState<{
    monthlyPayment: number
    totalPayment: number
    totalInterest: number
  } | null>(null)

  const calculate = () => {
    const p = parseFloat(principal)
    const r = parseFloat(interestRate) / 100 / 12 // Monthly interest rate
    const n = parseFloat(loanTerm) * 12 // Number of monthly payments

    if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || r < 0 || n <= 0) {
      return
    }

    if (r === 0) {
      const monthlyPayment = p / n
      setResult({
        monthlyPayment,
        totalPayment: p,
        totalInterest: 0
      })
      return
    }

    const monthlyPayment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const totalPayment = monthlyPayment * n
    const totalInterest = totalPayment - p

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest
    })
  }

  const reset = () => {
    setPrincipal('')
    setInterestRate('')
    setLoanTerm('')
    setResult(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 mb-4">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Loan Calculator</h1>
            <p className="text-gray-900">Calculate loan payments and interest</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Loan Amount ($)
                </label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  onBlur={calculate}
                  placeholder="100000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Annual Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  onBlur={calculate}
                  placeholder="5.5"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Loan Term (years)
                </label>
                <input
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  onBlur={calculate}
                  placeholder="30"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={calculate}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Calculator className="h-5 w-5" />
              <span>Calculate</span>
            </button>

            {result && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-900 mb-2">Monthly Payment</p>
                    <p className="text-5xl font-bold text-gray-900">
                      ${result.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 mb-1">Total Payment</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${result.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 mb-1">Total Interest</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${result.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full text-gray-900 hover:text-gray-900 py-2"
            >
              Reset
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


