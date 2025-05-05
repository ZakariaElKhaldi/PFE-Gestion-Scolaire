import { DashboardLayout } from '../../components/dashboard/layout/dashboard-layout'
import { UserResponse } from '../../types/auth'
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  CalendarIcon, 
  Download, 
  Filter, 
  Plus, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  Users,
  Building
} from 'lucide-react';
import { DataTable } from '../../components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../../components/data-table-column-header';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { adminService } from '../../services/admin-service';

interface FinancePageProps {
  user: UserResponse
}

// Define transaction interface
interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: string;
}

interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  color: string;
}

// Sample data for fallback
const revenueData = [
  { name: 'Jan', revenue: 12000 },
  { name: 'Feb', revenue: 15000 },
  { name: 'Mar', revenue: 18000 },
  { name: 'Apr', revenue: 22000 },
  { name: 'May', revenue: 25000 },
  { name: 'Jun', revenue: 28000 },
  { name: 'Jul', revenue: 26000 },
  { name: 'Aug', revenue: 30000 },
  { name: 'Sep', revenue: 34000 },
  { name: 'Oct', revenue: 38000 },
  { name: 'Nov', revenue: 40000 },
  { name: 'Dec', revenue: 42000 },
];

export const FinancePage = ({ user }: FinancePageProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddTransactionDialog, setShowAddTransactionDialog] = useState(false);
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch financial data
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        const data = await adminService.getFinancialOverview();
        setFinancialData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch financial data:', err);
        setError('Failed to load financial data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6 flex justify-center items-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6 flex flex-col justify-center items-center min-h-[80vh]">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  // Use data from API or fallback to sample data
  const financialSummary = {
    totalBudget: 1250000,
    spent: financialData?.totalRevenue || 780000,
    remaining: 1250000 - (financialData?.totalRevenue || 780000),
    percentageUsed: ((financialData?.totalRevenue || 780000) / 1250000) * 100
  };

  const recentTransactions = financialData?.recentTransactions || [
    { id: 'TX123456', date: '2023-12-01', description: 'Staff Salaries', category: 'Payroll', amount: 45000, status: 'completed' },
    { id: 'TX123457', date: '2023-12-02', description: 'Laboratory Equipment', category: 'Equipment', amount: 12500, status: 'completed' },
    { id: 'TX123458', date: '2023-12-03', description: 'Software Licenses', category: 'IT', amount: 7800, status: 'completed' },
    { id: 'TX123459', date: '2023-12-04', description: 'Building Maintenance', category: 'Facilities', amount: 5600, status: 'pending' },
    { id: 'TX123460', date: '2023-12-05', description: 'Library Books', category: 'Academic', amount: 3200, status: 'completed' }
  ];

  // Transform API data for charts
  const revenueByMonthData = financialData?.revenueByMonth 
    ? Object.entries(financialData.revenueByMonth).map(([month, amount]) => ({
        name: month,
        revenue: amount
      })).sort((a, b) => a.name.localeCompare(b.name))
    : revenueData;

  const categoryData = financialData?.revenueByCategory
    ? Object.entries(financialData.revenueByCategory).map(([name, value]) => ({
        name,
        value
      }))
    : [
        { name: 'Tuition', value: 850000 },
        { name: 'Fees', value: 150000 },
        { name: 'Donations', value: 120000 },
        { name: 'Other', value: 130000 }
      ];

  const budgetData: BudgetCategory[] = [
    { name: 'Payroll', allocated: 550000, spent: 450000, remaining: 100000, color: '#8884d8' },
    { name: 'Facilities', allocated: 200000, spent: 120000, remaining: 80000, color: '#82ca9d' },
    { name: 'Academic', allocated: 180000, spent: 98000, remaining: 82000, color: '#ffc658' },
    { name: 'IT', allocated: 120000, spent: 45000, remaining: 75000, color: '#ff8042' },
    { name: 'Operations', allocated: 100000, spent: 32000, remaining: 68000, color: '#0088fe' },
    { name: 'Financial Aid', allocated: 100000, spent: 35000, remaining: 65000, color: '#00C49F' }
  ];

  const monthlyExpenses = [
    { name: 'Jan', amount: 65000 },
    { name: 'Feb', amount: 68000 },
    { name: 'Mar', amount: 72000 },
    { name: 'Apr', amount: 75000 },
    { name: 'May', amount: 74000 },
    { name: 'Jun', amount: 78000 },
    { name: 'Jul', amount: 82000 },
    { name: 'Aug', amount: 87000 },
    { name: 'Sep', amount: 90000 },
    { name: 'Oct', amount: 93000 },
    { name: 'Nov', amount: 96000 },
    { name: 'Dec', amount: 0 }
  ];

  const incomeSources = [
    { name: 'Tuition', value: 650000 },
    { name: 'Grants', value: 350000 },
    { name: 'Donations', value: 150000 },
    { name: 'Services', value: 100000 }
  ];

  // Transaction table columns
  const transactionColumns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transaction ID" />
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => <div>{row.getValue('date')}</div>,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => <div>{row.getValue('description')}</div>,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => <div>{row.getValue('category')}</div>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => <div className="font-medium">${(row.getValue('amount') as number).toLocaleString()}</div>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge
            className={
              status === 'completed'
                ? 'bg-green-100 text-green-800'
                : status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }
          >
            {status}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Financial Management</h1>
          <div className="text-sm text-gray-600">
            Logged in as: {user.firstName} {user.lastName}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${financialSummary.totalBudget.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Academic Year 2023-2024
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Spent</CardTitle>
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${financialSummary.spent.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {financialSummary.percentageUsed}% of budget used
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${financialSummary.remaining.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {(100 - financialSummary.percentageUsed).toFixed(1)}% of budget remaining
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Next Payroll</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Dec 15, 2023</div>
                  <p className="text-xs text-muted-foreground">
                    Estimated: $48,000
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Expenses</CardTitle>
                  <CardDescription>
                    Expense trend for the current academic year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyExpenses}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Income Sources</CardTitle>
                  <CardDescription>
                    Distribution of income by source
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeSources}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {incomeSources.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Most recent financial transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.slice(0, 5).map((transaction: Transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-2 border-b">
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-500">{transaction.date}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          className={
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {transaction.status}
                        </Badge>
                        <div className="font-semibold">${transaction.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('transactions')}>
                  View All Transactions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Transactions</CardTitle>
                  <CardDescription>
                    Manage and view all financial transactions
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddTransactionDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center py-4 gap-2">
                  <Input
                    placeholder="Search transactions..."
                    className="max-w-sm"
                  />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <DataTable columns={transactionColumns} data={recentTransactions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Allocation</CardTitle>
                <CardDescription>
                  Manage department budgets and allocations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={budgetData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Legend />
                      <Bar dataKey="allocated" name="Allocated" fill="#8884d8" />
                      <Bar dataKey="spent" name="Spent" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Budget Details</h3>
                  {budgetData.map((budget) => (
                    <div key={budget.name} className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: budget.color }}
                          ></div>
                          <span>{budget.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            ${budget.spent.toLocaleString()} / ${budget.allocated.toLocaleString()}
                          </span>
                          <span className="text-sm font-medium">
                            {((budget.spent / budget.allocated) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${(budget.spent / budget.allocated) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  Access and generate financial reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Expense Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" /> Monthly Expense Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" /> Quarterly Expense Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" /> Annual Expense Report
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Budget Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" /> Department Budget Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" /> Budget Variance Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" /> Budget Forecast Report
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Income Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" /> Tuition Revenue Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" /> Grant Funding Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" /> Donation Report
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Custom Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Select defaultValue="expense">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Report Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expense">Expense Report</SelectItem>
                            <SelectItem value="budget">Budget Report</SelectItem>
                            <SelectItem value="income">Income Report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button className="w-full">
                          Generate Custom Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Transaction Dialog */}
        <Dialog open={showAddTransactionDialog} onOpenChange={setShowAddTransactionDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
              <DialogDescription>
                Create a new financial transaction record
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="col-span-3"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Enter transaction description"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select defaultValue="payroll">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="facilities">Facilities</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select defaultValue="completed">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddTransactionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAddTransactionDialog(false)}>
                Add Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};