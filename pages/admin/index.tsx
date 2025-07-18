import React from 'react'
import Link from 'next/link'
import AdminLayout from '@/layouts/AdminLayout'

import { useAuth } from '@/context/AuthContext'
import { withAdminAuth } from '@/lib/withAdminAuth'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import StatCard from '@/components/admin/StatCard'
import LowStockAlerts from '@/components/admin/LowStockAlerts'
import SalesOverTimeChart from '@/components/admin/SalesOverTimeChart'
import TopSellingProducts from '@/components/admin/TopSellingProducts'
import { FiPackage, FiBarChart2, FiDollarSign } from 'react-icons/fi'

// Define props for dynamic import
interface StockChartProps {
  data: { id: string; name: string; stock: number }[]
}

const StockChart = dynamic<StockChartProps>(
  () => import('@/components/admin/StockChart'),
  {
    ssr: false,
    loading: () => (
      <div className='h-96 flex items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md'>
        <p>Loading Chart...</p>
      </div>
    ),
  }
)

const fetcher = (url: string) => fetch(url).then(res => res.json())

const AdminDashboard = () => {
  const { logout } = useAuth()

  const { data: metrics, error: metricsError } = useSWR(
    '/api/analytics/metrics',
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds
    }
  )

  const { data: dashboardData, error: dashboardError } = useSWR(
    '/api/analytics/dashboard',
    fetcher,
    {
      refreshInterval: 5000,
    }
  )

  return (
    <AdminLayout>
      <h1 className='text-3xl font-bold mb-6'>Admin Dashboard</h1>

      {/* Data-driven content */}
      {(metricsError || dashboardError) && (
        <div className='text-center text-red-500'>
          Failed to load dashboard data. Please try again later.
        </div>
      )}
      {(!metrics || !dashboardData) && !(metricsError || dashboardError) && (
        <div className='text-center'>Loading dashboard insights...</div>
      )}
      {metrics && (
        <>
          {/* KPI Stat Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            <StatCard
              title='Total Products'
              value={metrics.kpis.totalProducts}
              icon={<FiPackage size={24} />}
            />
            <StatCard
              title='Total Stock'
              value={metrics.kpis.totalInventory}
              icon={<FiBarChart2 size={24} />}
            />
            <StatCard
              title='Average Price'
              value={new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(metrics.kpis.averagePrice)}
              icon={<FiDollarSign size={24} />}
            />
          </div>

          {/* Low Stock Alerts */}
          {metrics.lowStockProducts && metrics.lowStockProducts.length > 0 && (
            <div className='mb-8'>
              <LowStockAlerts products={metrics.lowStockProducts} />
            </div>
          )}

          {/* Live Stock Chart */}
          <div className='mb-8'>
            <StockChart data={metrics.stockData} />
          </div>

          {/* Advanced Analytics Section */}
          <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8'>
            <div className='lg:col-span-3 bg-white/5 dark:bg-gray-800/50 p-6 rounded-lg shadow-lg backdrop-blur-sm border border-white/10'>
              <h2 className='text-xl font-semibold text-white mb-4'>
                Sales - Last 30 Days
              </h2>
              <div className='h-80'>
                <SalesOverTimeChart
                  data={dashboardData?.salesOverTime}
                  isLoading={!dashboardData && !dashboardError}
                  error={dashboardError}
                />
              </div>
            </div>
            <div className='lg:col-span-2 bg-white/5 dark:bg-gray-800/50 p-6 rounded-lg shadow-lg backdrop-blur-sm border border-white/10'>
              <TopSellingProducts
                data={dashboardData?.topSellingProducts}
                isLoading={!dashboardData && !dashboardError}
                error={dashboardError}
              />
            </div>
          </div>
        </>
      )}

      {/* Management Section */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Products Card */}
        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
          <h2 className='text-2xl font-semibold mb-2'>Manage Products</h2>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>
            Add, edit, and delete products from your store&apos;s inventory.
          </p>
          <Link
            href='/admin/products'
            className='inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
          >
            Go to Products
          </Link>
        </div>

        {/* Orders Card */}
        <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'>
          <h2 className='text-2xl font-semibold mb-2'>Manage Orders</h2>
          <p className='mt-2 text-lg text-gray-400'>
            Here&apos;s a snapshot of your store&apos;s performance.
          </p>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>
            View and update customer orders and their statuses.
          </p>
          <Link
            href='/admin/orders'
            className='inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors'
          >
            Go to Orders
          </Link>
        </div>
      </div>
      <button
        onClick={logout}
        className='mt-8 px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors'
      >
        Logout
      </button>
    </AdminLayout>
  )
}

export default withAdminAuth(AdminDashboard)
