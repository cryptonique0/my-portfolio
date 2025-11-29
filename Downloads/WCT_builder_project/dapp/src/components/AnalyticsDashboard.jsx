import React, { useState, useEffect } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export default function AnalyticsDashboard() {
  const [txData, setTxData] = useState([])
  const [balanceData, setBalanceData] = useState([])
  const [gasData, setGasData] = useState([])

  useEffect(() => {
    // Mock data; in real app, fetch from API or localStorage
    setTxData([10, 20, 15, 30, 25])
    setBalanceData([100, 120, 110, 140, 130])
    setGasData([20, 25, 18, 30, 22])
  }, [])

  const txChartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
    datasets: [{
      label: 'Transaction Volume',
      data: txData,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }],
  }

  const balanceChartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
    datasets: [{
      label: 'Token Balance',
      data: balanceData,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  }

  const gasChartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
    datasets: [{
      label: 'Gas Usage',
      data: gasData,
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1,
    }],
  }

  return (
    <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <h3>Analytics Dashboard</h3>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <h4>Transaction Volume</h4>
          <Line data={txChartData} />
        </div>
        <div style={{ flex: 1, minWidth: 300 }}>
          <h4>Token Balances Over Time</h4>
          <Bar data={balanceChartData} />
        </div>
        <div style={{ flex: 1, minWidth: 300 }}>
          <h4>Gas Usage Trends</h4>
          <Line data={gasChartData} />
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
        Note: Using mock data. Integrate with real transaction history and API for live data.
      </p>
    </div>
  )
}