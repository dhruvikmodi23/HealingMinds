"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Chart from "react-apexcharts";

const validateStatsData = (data) => {
  if (!data)
    return {
      counts: {
        users: 0,
        counselors: 0,
        appointments: 0,
        pendingCounselors: 0,
      },
      recentAppointments: [],
      weeklyStats: [],
    };

  return {
    counts: {
      users: data.counts?.users || 0,
      counselors: data.counts?.counselors || 0,
      appointments: data.counts?.appointments || 0,
      pendingCounselors: data.counts?.pendingCounselors || 0,
    },
    recentAppointments: data.recentAppointments || [],
    weeklyStats: data.weeklyStats || [],
  };
};

const validateRevenueData = (data) => {
  if (!data)
    return {
      totalRevenue: 0,
      totalPayments: 0,
      monthlyRevenue: [],
      revenueByPlan: [],
    };

  return {
    totalRevenue: data.totalRevenue || 0,
    totalPayments: data.totalPayments || 0,
    monthlyRevenue: Array.isArray(data.monthlyRevenue)
      ? data.monthlyRevenue
      : [],
    revenueByPlan: Array.isArray(data.revenueByPlan) ? data.revenueByPlan : [],
  };
};

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    counts: {
      users: 0,
      counselors: 0,
      appointments: 0,
      pendingCounselors: 0,
    },
  });
  const [revenue, setRevenue] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    monthlyRevenue: [],
    revenueByPlan: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState("monthly");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, revenueResponse] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/revenue"),
      ]);

      // Handle stats data
      if (statsResponse?.data?.counts) {
        setStats(statsResponse.data);
      } else {
        console.warn("Stats data missing expected counts field");
      }

      // Handle revenue data
      if (revenueResponse?.data) {
        setRevenue({
          totalRevenue: revenueResponse.data.totalRevenue || 0,
          totalPayments: revenueResponse.data.totalPayments || 0,
          monthlyRevenue: Array.isArray(revenueResponse.data.monthlyRevenue)
            ? revenueResponse.data.monthlyRevenue
            : [],
          revenueByPlan: Array.isArray(revenueResponse.data.revenueByPlan)
            ? revenueResponse.data.revenueByPlan
            : [],
        });
      } else {
        console.warn("Revenue data missing expected fields");
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load analytics data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    await fetchData();
  };

  const revenueChartOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: ["#3B82F6"],
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100],
        },
      },
      xaxis: {
        categories: revenue.monthlyRevenue.map((item) => item.month) || [],
        labels: {
          style: {
            colors: "#6B7280",
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#6B7280",
            fontSize: "12px",
          },
          formatter: (value) => `₹${value}`,
        },
      },
      tooltip: {
        y: {
          formatter: (value) => `₹${value}`,
        },
      },
      grid: {
        borderColor: "#E5E7EB",
        strokeDashArray: 4,
      },
    }),
    [revenue.monthlyRevenue]
  );

  const revenueChartSeries = useMemo(
    () => [
      {
        name: "Revenue",
        data: revenue.monthlyRevenue.map((item) => item.total) || [],
      },
    ],
    [revenue.monthlyRevenue]
  );

  const planRevenueOptions = useMemo(() => ({
    chart: {
      type: "donut",
      height: 350
    },
    colors: ["#3B82F6", "#10B981", "#6366F1"],
    labels: revenue.revenueByPlan.map(item => item._id) || [],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      markers: {
        width: 10,
        height: 10,
        radius: 2
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Revenue",
              formatter: () => `₹${revenue.totalRevenue?.toLocaleString() || 0}`
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    }
  }), [revenue.revenueByPlan, revenue.totalRevenue]);

  const planRevenueSeries = useMemo(() => 
    revenue.revenueByPlan.map(item => item.total) || [],
    [revenue.revenueByPlan]
  );
  
  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Analytics Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <Link
              to="/admin"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 mr-3">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Platform Analytics
                  </h2>
                </div>
                <p className="text-gray-600 max-w-3xl">
                  Insights into your platform's performance and growth
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                >
                  <svg
                    className={`w-5 h-5 text-blue-600 ${
                      loading ? "animate-spin" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading
                    ? "--"
                    : `₹${revenue?.totalRevenue?.toLocaleString() || 0}`}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">
                    12% from last {timeFrame}
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? "--" : stats?.counts?.users || 0}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">
                    8% from last {timeFrame}
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completed Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? "--" : stats?.counts?.appointments || 0}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600 ml-1">
                    3% from last {timeFrame}
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Revenue Trend
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 bg-blue-200 rounded-full mb-2"></div>
                  <p className="text-gray-500">Loading chart...</p>
                </div>
              </div>
            ) : (
              <Chart
                options={revenueChartOptions}
                series={revenueChartSeries}
                type="area"
                height={350}
              />
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Revenue by Plan
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 bg-blue-200 rounded-full mb-2"></div>
                  <p className="text-gray-500">Loading chart...</p>
                </div>
              </div>
            ) : (
              <Chart
                options={planRevenueOptions}
                series={planRevenueSeries}
                type="donut"
                height={350}
              />
            )}
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Platform Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Counselor Utilization
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {loading
                      ? "--"
                      : stats?.counts?.counselors
                      ? `${
                          Math.round(
                            (stats.counts.appointments /
                              stats.counts.counselors) *
                              10
                          ) / 10 || 0
                        } sessions/counselor`
                      : "0 sessions/counselor"}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <UserGroupIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="border border-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    User Retention
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {loading ? "--" : "78%"}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <UsersIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="border border-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Avg. Session Rating
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {loading ? "--" : "4.7/5"}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
