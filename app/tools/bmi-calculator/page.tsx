'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Activity } from 'lucide-react'

export default function BMICalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')
  const [bmi, setBmi] = useState<number | null>(null)
  const [category, setCategory] = useState('')

  const calculateBMI = () => {
    let heightInMeters: number
    let weightInKg: number

    if (unit === 'metric') {
      heightInMeters = parseFloat(height) / 100 // cm to meters
      weightInKg = parseFloat(weight)
    } else {
      // Imperial: height in feet and inches, weight in pounds
      const heightParts = height.split("'")
      const feet = parseFloat(heightParts[0]) || 0
      const inches = parseFloat(heightParts[1]?.replace('"', '') || '0')
      heightInMeters = ((feet * 12 + inches) * 2.54) / 100
      weightInKg = parseFloat(weight) * 0.453592
    }

    if (isNaN(heightInMeters) || isNaN(weightInKg) || heightInMeters <= 0 || weightInKg <= 0) {
      return
    }

    const bmiValue = weightInKg / (heightInMeters * heightInMeters)
    setBmi(bmiValue)

    if (bmiValue < 18.5) {
      setCategory('Underweight')
    } else if (bmiValue < 25) {
      setCategory('Normal weight')
    } else if (bmiValue < 30) {
      setCategory('Overweight')
    } else {
      setCategory('Obese')
    }
  }

  const getCategoryColor = () => {
    if (!category) return 'from-gray-500 to-gray-600'
    if (category === 'Normal weight') return 'from-green-500 to-emerald-500'
    if (category === 'Underweight') return 'from-blue-500 to-cyan-500'
    if (category === 'Overweight') return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const reset = () => {
    setHeight('')
    setWeight('')
    setBmi(null)
    setCategory('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 mb-4">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">BMI Calculator</h1>
            <p className="text-gray-900">Calculate your Body Mass Index</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => {
                  setUnit('metric')
                  reset()
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  unit === 'metric'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Metric (kg, cm)
              </button>
              <button
                onClick={() => {
                  setUnit('imperial')
                  reset()
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  unit === 'imperial'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Imperial (lbs, ft/in)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {unit === 'metric' ? 'Height (cm)' : 'Height (feet\'inches")'}
                </label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  onBlur={calculateBMI}
                  placeholder={unit === 'metric' ? '170' : '5\'10"'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  onBlur={calculateBMI}
                  placeholder={unit === 'metric' ? '70' : '150'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={calculateBMI}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Calculate BMI
            </button>

            {bmi !== null && (
              <div className={`bg-gradient-to-r ${getCategoryColor()} text-white rounded-lg p-6`}>
                <div className="text-center">
                  <p className="text-sm mb-2 opacity-90">Your BMI</p>
                  <p className="text-6xl font-bold mb-2">
                    {bmi.toFixed(1)}
                  </p>
                  <p className="text-xl font-semibold">{category}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-white border-opacity-30">
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="text-center">
                      <div className="h-2 bg-white bg-opacity-30 rounded mb-1"></div>
                      <p className="text-xs opacity-90">Underweight</p>
                      <p className="text-xs font-semibold">&lt;18.5</p>
                    </div>
                    <div className="text-center">
                      <div className="h-2 bg-white rounded mb-1"></div>
                      <p className="text-xs opacity-90">Normal</p>
                      <p className="text-xs font-semibold">18.5-24.9</p>
                    </div>
                    <div className="text-center">
                      <div className="h-2 bg-white bg-opacity-30 rounded mb-1"></div>
                      <p className="text-xs opacity-90">Overweight</p>
                      <p className="text-xs font-semibold">25-29.9</p>
                    </div>
                    <div className="text-center">
                      <div className="h-2 bg-white bg-opacity-30 rounded mb-1"></div>
                      <p className="text-xs opacity-90">Obese</p>
                      <p className="text-xs font-semibold">≥30</p>
                    </div>
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


