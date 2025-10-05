import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  MapPinIcon,
  StarIcon,
  BuildingOfficeIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import analyticsAPI from '../services/analyticsAPI';
import { api } from '../services';
import { useAuthStore } from '../store';

const VendorAnalytics = () => {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageRating: 0,
    occupancyRate: 0,
    customerSegments: { vip: 0, regular: 0, new: 0 },
    monthlyRevenue: [],
    topParkingLots: [],
    recentActivity: [],
    rfmAnalysis: [],
    clvAnalysis: [],
    npsScore: 0,
    projections: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBusinessMetrics();
  }, [timeframe]);

  const fetchBusinessMetrics = async () => {
    try {
      setLoading(true);
      
      console.log('Current user:', user);
      console.log('User type:', user?.userType);
      
      // First try to get vendor dashboard data as fallback
      let dashboardData = null;
      try {
        console.log('Calling vendor dashboard API...');
        const dashboardResponse = await api.vendors.getDashboard();
        console.log('Full dashboard response:', dashboardResponse);
        console.log('Dashboard response data:', dashboardResponse.data);
        dashboardData = dashboardResponse.data.data; // This contains stats and summary
        console.log('Extracted dashboard data:', dashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        console.error('Error details:', error.response?.data || error.message);
      }
      
      // Fetch all analytics data from APIs
      console.log('Fetching analytics data...');
      const [overviewResponse, rfmResponse, clvResponse, npsResponse, projectionsResponse] = await Promise.all([
        analyticsAPI.getVendorAnalytics(timeframe).catch((err) => {
          console.error('Analytics overview error:', err);
          return { data: null };
        }),
        analyticsAPI.getRFMAnalysis().catch((err) => {
          console.error('RFM analysis error:', err);
          return { data: [] };
        }),
        analyticsAPI.getCLVAnalysis().catch((err) => {
          console.error('CLV analysis error:', err);
          return { data: [] };
        }),
        analyticsAPI.getNPSScore().catch((err) => {
          console.error('NPS score error:', err);
          return { data: { npsScore: 0, npsBreakdown: { promoters: 0, passives: 0, detractors: 0 } } };
        }),
        analyticsAPI.getRevenueProjections().catch((err) => {
          console.error('Projections error:', err);
          return { data: { nextMonthRevenue: 0, nextMonthBookings: 0, growthRate: 0, seasonalTrends: [] } };
        })
      ]);
      
      console.log('Analytics responses:', { overviewResponse, rfmResponse, clvResponse, npsResponse, projectionsResponse });

      // Combine all data - fix data extraction from responses
      const overviewData = overviewResponse.data || overviewResponse || {};
      
      const analyticsData = {
        // Overview data - use the actual data from the response
        totalRevenue: overviewData.totalRevenue || dashboardData?.stats?.totalEarnings || 0,
        totalBookings: overviewData.totalBookings || dashboardData?.stats?.totalBookings || 0,
        averageRating: overviewData.averageRating || dashboardData?.stats?.averageRating || 0,
        occupancyRate: overviewData.occupancyRate || 0,
        revenueGrowth: overviewData.revenueGrowth || 0,
        bookingsGrowth: overviewData.bookingsGrowth || 0,
        customerSegments: overviewData.customerSegments || { vip: 0, regular: 0, new: 0 },
        monthlyRevenue: overviewData.monthlyRevenue || [],
        topParkingLots: overviewData.topParkingLots || [],
        recentActivity: overviewData.recentActivity || [],
        
        // RFM Analysis
        rfmAnalysis: rfmResponse.data || [],
        
        // CLV Analysis
        clvAnalysis: clvResponse.data || [],
        
        // NPS Score
        npsScore: npsResponse.data?.npsScore || 0,
        npsBreakdown: npsResponse.data?.npsBreakdown || { promoters: 0, passives: 0, detractors: 0 },
        
        // Projections
        projections: {
          nextMonthRevenue: projectionsResponse.data?.nextMonthRevenue || 0,
          nextMonthBookings: projectionsResponse.data?.nextMonthBookings || 0,
          growthRate: projectionsResponse.data?.growthRate || 0,
          seasonalTrends: projectionsResponse.data?.seasonalTrends || []
        }
      };
      
      console.log('Final analytics data being set:', analyticsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch business metrics:', error);
      
      // Fallback to empty data structure if API fails
      setAnalytics({
        totalRevenue: 0,
        totalBookings: 0,
        averageRating: 0,
        occupancyRate: 0,
        revenueGrowth: 0,
        bookingsGrowth: 0,
        customerSegments: { vip: 0, regular: 0, new: 0 },
        monthlyRevenue: [],
        topParkingLots: [],
        recentActivity: [],
        rfmAnalysis: [],
        clvAnalysis: [],
        npsScore: 0,
        npsBreakdown: { promoters: 0, passives: 0, detractors: 0 },
        projections: {
          nextMonthRevenue: 0,
          nextMonthBookings: 0,
          growthRate: 0,
          seasonalTrends: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue', subtitle = '' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            {change && (
              <div className="flex items-center mt-2">
                {change > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(change)}% from last month
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg border-2 ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Business Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Metrics Dashboard</h1>
          <p className="text-gray-600 mt-2">Advanced analytics with MongoDB aggregation pipelines & NoSQL</p>
          
          {/* Controls */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
            
            {/* Tab Navigation */}
            <div className="flex gap-2 flex-wrap">
              <TabButton
                id="overview"
                label="Overview"
                isActive={activeTab === 'overview'}
                onClick={setActiveTab}
              />
              <TabButton
                id="rfm"
                label="RFM Analysis"
                isActive={activeTab === 'rfm'}
                onClick={setActiveTab}
              />
              <TabButton
                id="clv"
                label="Customer CLV"
                isActive={activeTab === 'clv'}
                onClick={setActiveTab}
              />
              <TabButton
                id="nps"
                label="NPS Score"
                isActive={activeTab === 'nps'}
                onClick={setActiveTab}
              />
              <TabButton
                id="projections"
                label="Projections"
                isActive={activeTab === 'projections'}
                onClick={setActiveTab}
              />
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={`₹${analytics.totalRevenue.toLocaleString()}`}
                change={analytics.revenueGrowth}
                icon={CurrencyDollarIcon}
                color="green"
                subtitle="This month"
              />
              <StatCard
                title="Total Bookings"
                value={analytics.totalBookings}
                change={analytics.bookingsGrowth}
                icon={UsersIcon}
                color="blue"
                subtitle={`${analytics.customerSegments.new} new customers`}
              />
              <StatCard
                title="Average Rating"
                value={`${analytics.averageRating}/5`}
                change={2.1}
                icon={StarIcon}
                color="yellow"
                subtitle="Customer satisfaction"
              />
              <StatCard
                title="Occupancy Rate"
                value={`${analytics.occupancyRate}%`}
                change={-3.2}
                icon={ClockIcon}
                color="purple"
                subtitle="Average across all lots"
              />
            </div>

            {/* Customer Segments */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="VIP Customers"
                value={analytics.customerSegments.vip}
                icon={StarIcon}
                color="yellow"
                subtitle="High-value customers"
              />
              <StatCard
                title="Regular Customers"
                value={analytics.customerSegments.regular}
                icon={UsersIcon}
                color="blue"
                subtitle="Repeat customers"
              />
              <StatCard
                title="New Customers"
                value={analytics.customerSegments.new}
                icon={UsersIcon}
                color="green"
                subtitle="This month"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Revenue Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PresentationChartLineIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Revenue & Booking Trends
                </h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {analytics.monthlyRevenue.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full">
                        {/* Revenue Bar */}
                        <div 
                          className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors"
                          style={{ 
                            height: `${(data.revenue / Math.max(...analytics.monthlyRevenue.map(d => d.revenue))) * 180}px` 
                          }}
                        ></div>
                        {/* Booking Overlay */}
                        <div 
                          className="w-full bg-green-400 opacity-70 absolute bottom-0 rounded-t"
                          style={{ 
                            height: `${(data.bookings / Math.max(...analytics.monthlyRevenue.map(d => d.bookings))) * 60}px` 
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                      <span className="text-xs font-medium text-gray-700">₹{(data.revenue/1000).toFixed(1)}k</span>
                      <span className="text-xs text-green-600">{data.bookings} bookings</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Bookings</span>
                  </div>
                </div>
              </div>

              {/* Top Parking Lots Enhanced */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Top Performing Locations
                </h3>
                <div className="space-y-4">
                  {analytics.topParkingLots.map((lot, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center flex-1">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{lot.name}</h4>
                          <div className="flex items-center mt-1 space-x-4">
                            <p className="text-sm text-gray-500">{lot.bookings} bookings</p>
                            <div className="flex items-center">
                              <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="text-sm text-gray-600">{lot.rating}</span>
                            </div>
                            <span className="text-sm text-gray-600">{lot.occupancy}% occupied</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{lot.revenue.toLocaleString()}</p>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${lot.occupancy}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RFM Analysis Tab */}
        {activeTab === 'rfm' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">MongoDB RFM Segmentation Analysis</h3>
              <p className="text-gray-600 mb-6">Customer segmentation using MongoDB aggregation pipelines based on Recency, Frequency, and Monetary value</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analytics.rfmAnalysis.map((segment, index) => (
                  <div key={index} className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200">
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">{segment.segment}</h4>
                    <p className="text-gray-600 text-sm mb-4">{segment.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customers:</span>
                        <span className="font-semibold text-gray-900">{segment.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Revenue:</span>
                        <span className="font-semibold text-green-600">₹{segment.avgRevenue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CLV Analysis Tab */}
        {activeTab === 'clv' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Lifetime Value Analysis</h3>
              <p className="text-gray-600 mb-6">Projected customer value and retention rates calculated using NoSQL aggregations</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analytics.clvAnalysis.map((segment, index) => (
                  <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors">
                    <h4 className="font-semibold text-gray-900 text-xl mb-4">{segment.segment}</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Customer Count</span>
                          <span className="font-semibold">{segment.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${(segment.count / Math.max(...analytics.clvAnalysis.map(s => s.count))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Avg CLV</span>
                          <span className="font-semibold text-green-600">₹{segment.avgCLV}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Retention Rate</span>
                          <span className="font-semibold text-blue-600">{segment.retention}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${segment.retention}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NPS Tab */}
        {activeTab === 'nps' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Net Promoter Score (NPS)</h3>
              <p className="text-gray-600 mb-6">Customer satisfaction and loyalty metrics from MongoDB collections</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* NPS Score Display */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white mb-4">
                    <span className="text-4xl font-bold">{analytics.npsScore}</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Excellent Score!</h4>
                  <p className="text-gray-600">Your NPS score indicates strong customer loyalty</p>
                </div>
                
                {/* NPS Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <h5 className="font-semibold text-green-800">Promoters (9-10)</h5>
                      <p className="text-green-600">Loyal enthusiasts</p>
                    </div>
                    <span className="text-2xl font-bold text-green-800">{analytics.npsBreakdown.promoters}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <h5 className="font-semibold text-yellow-800">Passives (7-8)</h5>
                      <p className="text-yellow-600">Satisfied but unenthusiastic</p>
                    </div>
                    <span className="text-2xl font-bold text-yellow-800">{analytics.npsBreakdown.passives}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <h5 className="font-semibold text-red-800">Detractors (0-6)</h5>
                      <p className="text-red-600">Unhappy customers</p>
                    </div>
                    <span className="text-2xl font-bold text-red-800">{analytics.npsBreakdown.detractors}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projections Tab */}
        {activeTab === 'projections' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                title="Next Month Revenue"
                value={`₹${analytics.projections.nextMonthRevenue?.toLocaleString()}`}
                change={analytics.projections.growthRate}
                icon={CurrencyDollarIcon}
                color="green"
                subtitle="AI-powered prediction"
              />
              <StatCard
                title="Next Month Bookings"
                value={analytics.projections.nextMonthBookings}
                change={8.5}
                icon={CalendarIcon}
                color="blue"
                subtitle="Based on trends"
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Quarterly Projections</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {analytics.projections.seasonalTrends?.map((trend, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{trend.period}</h4>
                    <p className="text-2xl font-bold text-blue-600 mb-2">₹{trend.projected.toLocaleString()}</p>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">{trend.confidence}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Real-time Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Business Activity</h3>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 px-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    activity.priority === 'urgent' ? 'bg-red-500 animate-pulse' :
                    activity.priority === 'high' ? 'bg-orange-400' :
                    activity.type === 'booking' ? 'bg-blue-400' :
                    activity.type === 'payment' ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  <span className="text-gray-700 font-medium">{activity.message}</span>
                  {activity.priority === 'urgent' && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                      URGENT
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;