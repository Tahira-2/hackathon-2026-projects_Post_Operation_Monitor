import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:8000';

function App() {
  const [currentPage, setCurrentPage] = useState('assessment');
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState({});
  const [lifestyle, setLifestyle] = useState({
    smoking: false,
    sleep_hours: 7,
    pollution_level: 'low',
  });
  const [prediction, setPrediction] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [symptomSearch, setSymptomSearch] = useState('');

  useEffect(() => {
    axios
      .get(`${API_BASE}/symptoms`)
      .then((res) => setSymptoms(res.data.symptoms))
      .catch((err) => console.error(err));
  }, []);

  const handleSymptomChange = (symptom) => {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [symptom]: prev[symptom] ? 0 : 1,
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/predict`, {
        symptoms: selectedSymptoms,
        lifestyle: lifestyle,
      });
      setPrediction(response.data);

      const simResponse = await axios.post(`${API_BASE}/simulate`, {
        disease: response.data.disease,
        base_probability: response.data.base_risk,
        current_lifestyle: lifestyle,
      });
      setSimulation(simResponse.data);

      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Error making prediction. Please try again.');
    }
    setLoading(false);
  };

  const handleNewAssessment = () => {
    setCurrentPage('assessment');
    setPrediction(null);
    setSimulation(null);
    setSelectedSymptoms({});
    setLifestyle({
      smoking: false,
      sleep_hours: 7,
      pollution_level: 'low',
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Low':
        return '#10b981';
      case 'Moderate':
        return '#f59e0b';
      case 'High':
        return '#f97316';
      case 'Critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'Low':
        return 'bg-green-500';
      case 'Moderate':
        return 'bg-yellow-500';
      case 'High':
        return 'bg-orange-500';
      case 'Critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // PAGE 1: HEALTH ASSESSMENT
  if (currentPage === 'assessment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-lg mb-4">
              <span className="text-4xl">🏥</span>
              <h1 className="text-3xl font-bold text-gray-900">
                CausalCare AI
              </h1>
            </div>
            <p className="text-lg text-gray-600 font-medium">
              Root-Cause Health Intelligence Engine
            </p>
            <p className="text-sm text-indigo-600 italic mt-2">
              "Most AI predicts disease. CausalCare AI explains why—and how to
              reduce risk."
            </p>
          </div>

          {/* Assessment Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Health Assessment
              </h2>
              <p className="text-gray-600">
                Please provide your health information for analysis
              </p>
            </div>

            {/* Lifestyle Factors */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Lifestyle Factors
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Smoking */}
                <div className="bg-slate-50 p-5 rounded-xl border-2 border-slate-200">
                  <label className="block text-gray-800 font-semibold mb-3 text-sm">
                    🚬 Smoking Status
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {lifestyle.smoking ? 'Yes' : 'No'}
                    </span>
                    <button
                      onClick={() =>
                        setLifestyle((prev) => ({
                          ...prev,
                          smoking: !prev.smoking,
                        }))
                      }
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        lifestyle.smoking ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                          lifestyle.smoking
                            ? 'translate-x-7'
                            : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  {lifestyle.smoking && (
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      ⚠️ Increases risk — impact varies by condition
                    </p>
                  )}
                </div>

                {/* Sleep */}
                <div className="bg-slate-50 p-5 rounded-xl border-2 border-slate-200">
                  <label className="block text-gray-800 font-semibold mb-3 text-sm">
                    😴 Sleep Hours:{' '}
                    <span className="text-indigo-600">
                      {lifestyle.sleep_hours}h
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="3"
                      max="12"
                      value={lifestyle.sleep_hours}
                      onChange={(e) =>
                        setLifestyle((prev) => ({
                          ...prev,
                          sleep_hours: parseInt(e.target.value),
                        }))
                      }
                      style={{
                        '--sleep-progress': `${((lifestyle.sleep_hours - 3) / 9) * 100}%`,
                      }}
                      className="sleep-slider w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>3h</span>
                      <span className="text-green-600 font-semibold">7-8h</span>
                      <span>12h</span>
                    </div>
                  </div>
                  {lifestyle.sleep_hours < 4 && (
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      ⚠️ Severe deprivation — significantly increases risk
                    </p>
                  )}
                  {lifestyle.sleep_hours >= 4 && lifestyle.sleep_hours < 5 && (
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      ⚠️ Poor sleep — increases risk for many conditions
                    </p>
                  )}
                  {lifestyle.sleep_hours >= 5 && lifestyle.sleep_hours < 6 && (
                    <p className="text-xs text-yellow-600 mt-2 font-medium">
                      Below average — small improvement can help
                    </p>
                  )}
                  {lifestyle.sleep_hours >= 6 && lifestyle.sleep_hours < 7 && (
                    <p className="text-xs text-yellow-600 mt-2 font-medium">
                      Slightly below optimal range (7-9h)
                    </p>
                  )}
                  {lifestyle.sleep_hours > 9 && (
                    <p className="text-xs text-yellow-600 mt-2 font-medium">
                      Oversleeping may indicate underlying issues
                    </p>
                  )}
                </div>

                {/* Pollution */}
                <div className="bg-slate-50 p-5 rounded-xl border-2 border-slate-200">
                  <label className="block text-gray-800 font-semibold mb-3 text-sm">
                    🌍 Pollution Level
                  </label>
                  <select
                    value={lifestyle.pollution_level}
                    onChange={(e) =>
                      setLifestyle((prev) => ({
                        ...prev,
                        pollution_level: e.target.value,
                      }))
                    }
                    className="pollution-select w-full p-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm font-medium"
                  >
                    <option value="very_low">🟢 Very Low</option>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Moderate</option>
                    <option value="high">🟠 High</option>
                    <option value="very_high">🔴 Very High</option>
                  </select>
                  {lifestyle.pollution_level === 'very_high' && (
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      ⚠️ Significant risk — especially for respiratory conditions
                    </p>
                  )}
                  {lifestyle.pollution_level === 'high' && (
                    <p className="text-xs text-orange-600 mt-2 font-medium">
                      ⚠️ Increases risk — impact varies by condition
                    </p>
                  )}
                  {lifestyle.pollution_level === 'medium' && (
                    <p className="text-xs text-yellow-600 mt-2 font-medium">
                      May mildly increase risk for sensitive conditions
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Symptoms */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🩺</span>
                Select Your Symptoms
                <span className="ml-auto text-sm font-normal text-indigo-600">
                  Selected:{' '}
                  {
                    Object.values(selectedSymptoms).filter((v) => v === 1)
                      .length
                  }
                </span>
              </h3>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="🔍 Search symptoms..."
                  value={symptomSearch}
                  onChange={(e) => setSymptomSearch(e.target.value)}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                />
              </div>
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5 max-h-96 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {symptoms
                    .filter((s) =>
                      s.replace(/_/g, ' ').toLowerCase().includes(symptomSearch.toLowerCase())
                    )
                    .map((symptom) => (
                    <label
                      key={symptom}
                      className="flex items-center space-x-2 p-2.5 hover:bg-white rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSymptoms[symptom] === 1}
                        onChange={() => handleSymptomChange(symptom)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">
                        {symptom.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handlePredict}
              disabled={loading || Object.keys(selectedSymptoms).length === 0}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing Your Health...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <span className="text-xl">🔬</span>
                  Analyze Health Risk
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 2: DASHBOARD
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-xl shadow-md">
              <span className="text-3xl">🏥</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Health Risk Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Comprehensive analysis and recommendations
              </p>
            </div>
          </div>
          <button
            onClick={handleNewAssessment}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
          >
            <span>🔄</span>
            New Assessment
          </button>
        </div>

        {/* Dashboard Grid - 3x2 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Prediction Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-indigo-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <span className="text-2xl">🧠</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Prediction</h2>
            </div>
            <div className="bg-indigo-600 rounded-xl p-6 text-center">
              <div className="text-sm text-indigo-200 mb-2">
                Predicted Condition
              </div>
              <div className="text-2xl font-bold text-white mb-3">
                {prediction.disease}
              </div>
              {prediction.disease_severity && (
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                  prediction.disease_severity === 'Critical'
                    ? 'bg-red-500 text-white'
                    : prediction.disease_severity === 'Serious'
                    ? 'bg-orange-500 text-white'
                    : prediction.disease_severity === 'Moderate'
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-green-500 text-white'
                }`}>
                  {prediction.disease_severity === 'Critical' ? '⚠️' : prediction.disease_severity === 'Serious' ? '🚨' : 'ℹ️'} Disease Severity: {prediction.disease_severity}
                </div>
              )}
              <div className="text-sm text-indigo-200">
                Base Probability:{' '}
                <span className="text-white font-bold">
                  {prediction.base_risk_percent}%
                </span>
              </div>
            </div>
          </div>

          {/* 2. Risk Assessment Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Risk Assessment
              </h2>
            </div>
            <div className="text-center">
              <div
                className="text-6xl font-black mb-2"
                style={{ color: getSeverityColor(prediction.severity) }}
              >
                {prediction.adjusted_risk_percent}%
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Adjusted Risk Score
              </div>
              <div
                className={`inline-block px-4 py-2 rounded-full text-white font-bold ${getSeverityBadgeClass(prediction.severity)}`}
              >
                {prediction.severity} Risk
              </div>
              {prediction.base_risk_percent !==
                prediction.adjusted_risk_percent && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-yellow-800">
                    Risk increased from {prediction.base_risk_percent}% to{' '}
                    {prediction.adjusted_risk_percent}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Risk Factors Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-red-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <span className="text-2xl">🔍</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Risk Factors</h2>
            </div>
            <div className="space-y-3">
              {prediction.factors && prediction.factors.length > 0 ? (
                prediction.factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="bg-red-50 p-4 rounded-xl border border-red-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-800">
                        {factor.name}
                      </span>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                        {factor.impact}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {factor.description}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">
                    No additional risk factors identified
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 4. Intervention Simulator Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Intervention Simulator
              </h2>
            </div>
            {simulation && simulation.scenarios && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-green-500 text-white">
                      <tr>
                        <th className="text-left py-3 px-4 rounded-tl-lg font-bold">
                          Scenario
                        </th>
                        <th className="text-center py-3 px-4 font-bold">
                          Risk
                        </th>
                        <th className="text-center py-3 px-4 font-bold">
                          Severity
                        </th>
                        <th className="text-right py-3 px-4 rounded-tr-lg font-bold">
                          Change
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulation.scenarios.map((scenario, idx) => (
                        <tr
                          key={idx}
                          className={`border-b ${idx === 0 ? 'bg-gray-50' : idx === simulation.scenarios.length - 1 ? 'bg-green-50' : 'bg-white'}`}
                        >
                          <td className="py-3 px-4 font-semibold text-gray-800">
                            {scenario.name}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-lg font-bold text-indigo-600">
                              {scenario.risk_percent}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold ${getSeverityBadgeClass(scenario.severity)}`}
                            >
                              {scenario.severity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {scenario.reduction !== undefined && (
                              <span className="text-green-600 font-bold">
                                -{scenario.reduction}%
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {simulation.max_reduction > 0 && (
                  <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-4">
                    <div className="text-sm font-bold text-green-900">
                      💡 Maximum Risk Reduction: {simulation.max_reduction}%
                    </div>
                    <div className="text-xs text-green-800 mt-1">
                      By implementing all lifestyle improvements
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 5. Risk Breakdown Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Risk Breakdown
              </h2>
            </div>
            {prediction.risk_breakdown && prediction.risk_breakdown.length > 0 ? (
              <div className="space-y-3">
                {prediction.risk_breakdown.map((item, idx) => {
                  const maxVal = Math.max(...prediction.risk_breakdown.map(b => b.value), 1);
                  const barWidth = Math.max((item.value / maxVal) * 100, item.value > 0 ? 8 : 0);
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold ${
                          item.type === 'base' ? 'text-indigo-700'
                          : item.type === 'total' ? 'text-amber-700'
                          : 'text-red-600'
                        }`}>
                          {item.type === 'factor' ? `↑ ${item.name}` : item.name}
                        </span>
                        <span className={`text-sm font-bold ${
                          item.type === 'base' ? 'text-indigo-700'
                          : item.type === 'total' ? 'text-amber-700'
                          : 'text-red-600'
                        }`}>
                          {item.type === 'factor' ? `+${item.value}%` : `${item.value}%`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            item.type === 'base' ? 'bg-indigo-500'
                            : item.type === 'total' ? 'bg-amber-500'
                            : 'bg-red-400'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {/* Summary */}
                {prediction.base_risk_percent !== prediction.adjusted_risk_percent && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Lifestyle factors added</span>
                      <span className="text-sm font-bold text-red-600">
                        +{(prediction.adjusted_risk_percent - prediction.base_risk_percent).toFixed(1)}% total increase
                      </span>
                    </div>
                  </div>
                )}
                {prediction.base_risk_percent === prediction.adjusted_risk_percent && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-green-600 font-medium">
                      ✅ No lifestyle factors are increasing your risk — great job!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <p className="text-sm">No risk breakdown data available</p>
              </div>
            )}
          </div>

          {/* 6. Recommendations Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100 lg:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <span className="text-2xl">💡</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Personalized Recommendations
              </h2>
            </div>

            {prediction.recommendations && (
              <div className="space-y-6">
                {/* Urgency Banner */}
                <div
                  className={`urgency-banner p-4 rounded-xl border-2 ${
                    prediction.recommendations.urgency === 'visit_doctor_immediately'
                      ? 'bg-red-50 border-red-300'
                      : prediction.recommendations.urgency === 'consult_soon'
                      ? 'bg-yellow-50 border-yellow-300'
                      : prediction.recommendations.urgency === 'monitor'
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-green-50 border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {prediction.recommendations.urgency === 'visit_doctor_immediately'
                        ? '🚨'
                        : prediction.recommendations.urgency === 'consult_soon'
                        ? '⚠️'
                        : prediction.recommendations.urgency === 'monitor'
                        ? '👁️'
                        : '✅'}
                    </span>
                    <span
                      className={`font-bold text-sm uppercase tracking-wide ${
                        prediction.recommendations.urgency === 'visit_doctor_immediately'
                          ? 'text-red-800'
                          : prediction.recommendations.urgency === 'consult_soon'
                          ? 'text-yellow-800'
                          : prediction.recommendations.urgency === 'monitor'
                          ? 'text-blue-800'
                          : 'text-green-800'
                      }`}
                    >
                      {prediction.recommendations.urgency === 'visit_doctor_immediately'
                        ? 'Immediate Medical Attention Recommended'
                        : prediction.recommendations.urgency === 'consult_soon'
                        ? 'Doctor Consultation Recommended'
                        : prediction.recommendations.urgency === 'monitor'
                        ? 'Monitor Your Symptoms'
                        : 'Self-Care & Healthy Habits'}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      prediction.recommendations.urgency === 'visit_doctor_immediately'
                        ? 'text-red-700'
                        : prediction.recommendations.urgency === 'consult_soon'
                        ? 'text-yellow-700'
                        : prediction.recommendations.urgency === 'monitor'
                        ? 'text-blue-700'
                        : 'text-green-700'
                    }`}
                  >
                    {prediction.recommendations.urgency_message}
                  </p>
                </div>

                {/* Disease-Specific Advice */}
                {prediction.recommendations.disease_specific &&
                  prediction.recommendations.disease_specific.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span>🎯</span> Advice for {prediction.disease}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {prediction.recommendations.disease_specific.map(
                          (tip, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200"
                            >
                              <div className="bg-indigo-600 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                                {idx + 1}
                              </div>
                              <div className="text-sm text-gray-800">
                                {tip}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Lifestyle Tips */}
                {prediction.recommendations.lifestyle &&
                  prediction.recommendations.lifestyle.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span>🌿</span> General Lifestyle Tips
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {prediction.recommendations.lifestyle.map(
                          (tip, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200"
                            >
                              <div className="bg-green-600 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                                ✓
                              </div>
                              <div className="text-sm text-gray-800">
                                {tip}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Risk Awareness */}
                {prediction.recommendations.risk_awareness &&
                  prediction.recommendations.risk_awareness.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span>💬</span> Risk Awareness
                      </h3>
                      <div className="space-y-3">
                        {prediction.recommendations.risk_awareness.map(
                          (msg, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200"
                            >
                              <span className="text-amber-500 flex-shrink-0 mt-0.5">ℹ️</span>
                              <div className="text-sm text-gray-700">
                                {msg}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Disclaimer */}
                {prediction.recommendations.disclaimer && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2">
                    <p className="text-xs text-gray-500 italic flex items-start gap-2">
                      <span className="flex-shrink-0">⚕️</span>
                      {prediction.recommendations.disclaimer}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
