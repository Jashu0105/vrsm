import React from "react";
import { AppLayout } from "@/components/layout";
import { useGetDashboardStats, useListRentals } from "@workspace/api-client-react";
import { 
  Car, 
  ArrowUpRight, 
  CalendarRange, 
  IndianRupee, 
  Wrench, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from "date-fns";
import { motion } from "framer-motion";

function StatCard({ title, value, icon: Icon, trend, colorClass, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card rounded-2xl p-6 shadow-lg shadow-black/5 border border-border flex flex-col justify-between"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-display font-bold text-foreground">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
          <span className="text-emerald-500 font-medium">{trend}</span>
          <span className="text-muted-foreground ml-2">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: rentals, isLoading: rentalsLoading } = useListRentals();

  if (statsLoading || rentalsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  // Monthly revenue data in INR
  const mockRevenueData = [
    { name: 'Jan', value: 185000 },
    { name: 'Feb', value: 242000 },
    { name: 'Mar', value: 310000 },
    { name: 'Apr', value: 275000 },
    { name: 'May', value: 360000 },
    { name: 'Jun', value: stats?.monthlyRevenue || 420000 },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening with your fleet today.</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Revenue" 
              value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
              icon={IndianRupee}
              trend="+12.5%"
              colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
              delay={0}
            />
            <StatCard 
              title="Active Rentals" 
              value={stats.activeRentals}
              icon={CalendarRange}
              trend="+4.1%"
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
              delay={0.1}
            />
            <StatCard 
              title="Available Vehicles" 
              value={stats.availableVehicles}
              icon={Car}
              colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
              delay={0.2}
            />
            <StatCard 
              title="In Maintenance" 
              value={stats.maintenanceVehicles}
              icon={Wrench}
              colorClass="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
              delay={0.3}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-lg shadow-black/5 border border-border"
          >
            <h3 className="text-lg font-bold text-foreground mb-6">Revenue Growth</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} dx={-10} tickFormatter={(val) => val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : `₹${(val / 1000).toFixed(0)}K`} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {mockRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === mockRevenueData.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.4)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-card rounded-2xl p-6 shadow-lg shadow-black/5 border border-border flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">Recent Rentals</h3>
              <button className="text-sm text-primary hover:underline font-medium">View All</button>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              {Array.isArray(rentals) && rentals.length > 0 ? (
                rentals.slice(0, 5).map((rental) => (
                  <div key={rental.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {rental.status === 'active' ? (
                        <Clock className="w-5 h-5 text-primary" />
                      ) : rental.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <CalendarRange className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {rental.vehicle.make} {rental.vehicle.model}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {rental.customer.firstName} {rental.customer.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">₹{rental.dailyRate}/day</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(rental.startDate), 'MMM d')}</p>
                    </div>
                  </div>
                ))
              ) : Array.isArray(rentals) ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No recent rentals found.
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Unable to load rentals.
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
}
