'use client';

import React from 'react';
import { IndianRupee, ShoppingBag, Boxes, AlertTriangle, TrendingUp } from 'lucide-react';
import { useSeller } from '@/context/SellerContext';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentOrdersTable } from '@/components/dashboard/RecentOrdersTable';
import { TopSellers } from '@/components/dashboard/TopSellers';
import { MerchantHero } from '@/components/dashboard/MerchantHero';

export default function DashboardOverviewPage() {
  const { totalRevenue, totalOrders, lowStockCount, averageOrderValue, totalProductsCount } =
    useSeller();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Executive Merchant Hero Section */}
      <MerchantHero />

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Gross Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          subtitle="Net after refunds"
          change={totalOrders > 0 ? '+14.2%' : undefined}
          isPositive={true}
          icon={IndianRupee}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <MetricCard
          title="Total Orders Processed"
          value={totalOrders.toString()}
          subtitle="Customer transactions"
          change={totalOrders > 0 ? '+8.5%' : undefined}
          isPositive={true}
          icon={ShoppingBag}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />

        <MetricCard
          title="Average Order Value (AOV)"
          value={`₹${averageOrderValue.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle={totalOrders > 0 ? 'Hardware and components' : 'Per transaction average'}
          change={totalOrders > 0 ? '+5.1%' : undefined}
          isPositive={true}
          icon={TrendingUp}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />

        <MetricCard
          title="Low Stock Warnings"
          value={`${lowStockCount} Items`}
          subtitle={totalProductsCount === 0 ? 'No products listed' : `Across ${totalProductsCount} SKUs`}
          change={totalProductsCount === 0 ? undefined : (lowStockCount > 0 ? 'Requires Restock' : 'Healthy')}
          isPositive={lowStockCount === 0}
          isAlert={lowStockCount > 0}
          icon={lowStockCount > 0 ? AlertTriangle : Boxes}
          iconBgColor={lowStockCount > 0 ? 'bg-red-50' : 'bg-slate-100'}
          iconColor={lowStockCount > 0 ? 'text-red-600' : 'text-slate-600'}
        />
      </div>

      {/* Main Revenue Velocity Chart */}
      <RevenueChart />

      {/* Split Feed: Recent Orders & Top Performing Hardware */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <RecentOrdersTable />
        </div>
        <div className="lg:col-span-5">
          <TopSellers />
        </div>
      </div>
    </div>
  );
}
