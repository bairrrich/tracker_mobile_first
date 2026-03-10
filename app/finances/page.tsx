'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react'
import Link from 'next/link'
import { useFinancesStore } from '@/store/finances-store'
import { TransactionForm } from '@/components/finances/transaction-form'
import { AccountForm } from '@/components/finances/account-form'
import { TransactionCard } from '@/components/finances/transaction-card'
import { BudgetForm } from '@/components/finances/budget-form'
import { BudgetCard } from '@/components/finances/budget-card'
import { CategoryForm } from '@/components/finances/category-form'
import { RecurringTransactionForm } from '@/components/finances/recurring-transaction-form'
import { RecurringTransactionCard } from '@/components/finances/recurring-transaction-card'
import { TransactionFilters } from '@/components/finances/transaction-filters'
import { Pagination } from '@/components/ui/pagination'
import { CSVImport } from '@/components/finances/csv-import'
import { SavingsGoalForm } from '@/components/finances/savings-goal-form'
import { SavingsGoalCard } from '@/components/finances/savings-goal-card'
import { AddFundsDialog } from '@/components/finances/add-funds-dialog'
import { useRecurringTransactionNotifications } from '@/hooks/use-recurring-notifications'
import { useBudgetAlerts } from '@/hooks/use-budget-alerts'
import { FinanceAccount, FinanceTransaction, FinanceCategory, FinanceBudget, FinanceRecurringTransaction, FinanceSavingsGoal } from '@/lib/db'

export default function FinancesPage() {
  const t = useTranslations('Finances')
  const tc = useTranslations('Common')

  // Initialize notifications
  useRecurringTransactionNotifications()
  useBudgetAlerts()

  const {
    accounts,
    categories,
    transactions,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    fetchAccounts,
    fetchCategories,
    fetchTransactions,
    deleteTransaction,
    deleteAccount,
    initializePredefinedCategories,
    budgets,
    fetchBudgets,
    deleteBudget,
  } = useFinancesStore()

  const { updateCategory: _uc, deleteCategory: _dc } = useFinancesStore()
  const { recurringTransactions, fetchRecurringTransactions, addRecurringTransaction: _art, updateRecurringTransaction: _urt, deleteRecurringTransaction: _drt, toggleRecurringTransaction: _trt } = useFinancesStore()
  const { filters, setFilters } = useFinancesStore()
  const { savingsGoals, fetchSavingsGoals, addSavingsGoal: _asg, updateSavingsGoal, deleteSavingsGoal } = useFinancesStore()

  const [transactionFormOpen, setTransactionFormOpen] = React.useState(false)
  const [accountFormOpen, setAccountFormOpen] = React.useState(false)
  const [budgetFormOpen, setBudgetFormOpen] = React.useState(false)
  const [categoryFormOpen, setCategoryFormOpen] = React.useState(false)
  const [recurringFormOpen, setRecurringFormOpen] = React.useState(false)
  const [selectedTransaction, setSelectedTransaction] = React.useState<FinanceTransaction | null>(null)
  const [selectedAccount, setSelectedAccount] = React.useState<FinanceAccount | null>(null)
  const [selectedBudget, setSelectedBudget] = React.useState<FinanceBudget | null>(null)
  const [selectedCategory, setSelectedCategory] = React.useState<FinanceCategory | null>(null)
  const [selectedRecurring, setSelectedRecurring] = React.useState<FinanceRecurringTransaction | null>(null)
  const [transactionType, setTransactionType] = React.useState<'income' | 'expense' | 'transfer'>('expense')
  
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(25)
  const [selectedTransactions, setSelectedTransactions] = React.useState<Set<string>>(new Set())
  const [showSelectMode, setShowSelectMode] = React.useState(false)
  const [showImportDialog, setShowImportDialog] = React.useState(false)
  
  // Savings goals state
  const [goalFormOpen, setGoalFormOpen] = React.useState(false)
  const [addFundsOpen, setAddFundsOpen] = React.useState(false)
  const [selectedGoal, setSelectedGoal] = React.useState<FinanceSavingsGoal | null>(null)

  React.useEffect(() => {
    const initData = async () => {
      await fetchAccounts()
      await initializePredefinedCategories()
      await fetchCategories()
      await fetchTransactions()
      await fetchBudgets()
      await fetchRecurringTransactions()
      await fetchSavingsGoals()
    }
    initData()
  }, [])

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getCategoryById = (id?: string) => {
    if (!id) return undefined
    return categories.find((c: FinanceCategory) => c.id === id)
  }

  const getAccountById = (id?: string) => {
    if (!id) return undefined
    return accounts.find((a: FinanceAccount) => a.id === id)
  }

  const handleEditTransaction = (transaction: FinanceTransaction) => {
    setSelectedTransaction(transaction)
    setTransactionFormOpen(true)
  }

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id)
  }

  const handleEditAccount = (account: FinanceAccount) => {
    setSelectedAccount(account)
    setAccountFormOpen(true)
  }

  const handleDeleteAccount = async (id: string) => {
    await deleteAccount(id)
  }

  const handleEditBudget = (budget: FinanceBudget) => {
    setSelectedBudget(budget)
    setBudgetFormOpen(true)
  }

  const handleDeleteBudget = async (id: string) => {
    await deleteBudget(id)
  }

  const handleEditCategory = (category: FinanceCategory) => {
    setSelectedCategory(category)
    setCategoryFormOpen(true)
  }

  const handleDeleteCategory = async (id: string) => {
    await _dc(id)
  }

  const handleEditRecurring = (transaction: FinanceRecurringTransaction) => {
    setSelectedRecurring(transaction)
    setRecurringFormOpen(true)
  }

  const handleDeleteRecurring = async (id: string) => {
    await _drt(id)
  }

  const handleToggleRecurring = async (id: string) => {
    await _trt(id)
  }

  // Savings goals handlers
  const handleEditGoal = (goal: FinanceSavingsGoal) => { setSelectedGoal(goal); setGoalFormOpen(true) }
  const handleDeleteGoal = async (id: string) => { await deleteSavingsGoal(id) }
  const handleAddFunds = async (amount: number) => {
    if (!selectedGoal) return
    const newAmount = selectedGoal.currentAmount + amount
    await updateSavingsGoal(selectedGoal.id, { currentAmount: newAmount })
  }

  // Bulk selection handlers
  const toggleSelectTransaction = (id: string) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedTransactions(newSelected)
  }

  const selectAllTransactions = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(new Set(paginatedTransactions.map(t => t.id)))
    } else {
      setSelectedTransactions(new Set())
    }
  }

  const deleteSelectedTransactions = async () => {
    for (const id of selectedTransactions) {
      await deleteTransaction(id)
    }
    setSelectedTransactions(new Set())
    setShowSelectMode(false)
  }

  // Pagination calculations
  const totalPages = Math.ceil(transactions.length / pageSize)
  const paginatedTransactions = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return transactions.slice(start, end)
  }, [transactions, currentPage, pageSize])

  const allSelected = paginatedTransactions.length > 0 && selectedTransactions.size === paginatedTransactions.length

  React.useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [filters])

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-[var(--text-muted)]">{t('description')}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild>
              <Link href="/finances/reports">
                <PieChart className="w-4 h-4 mr-2" />
                {t('reports')}
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              {t('importCSV')}
            </Button>
            <Button variant="outline" onClick={() => setAccountFormOpen(true)}>
              <Wallet className="w-4 h-4 mr-2" />
              {t('addAccount')}
            </Button>
            <Button onClick={() => setTransactionFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('addTransaction')}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-[var(--card)] border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('totalBalance')}
              </CardTitle>
              <Wallet className="h-4 w-4 text-[var(--text-muted)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--card)] border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('monthlyIncome')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                +{formatCurrency(monthlyIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--card)] border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('monthlyExpenses')}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                -{formatCurrency(monthlyExpenses)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">{t('transactions')}</TabsTrigger>
            <TabsTrigger value="accounts">{t('accounts')}</TabsTrigger>
            <TabsTrigger value="categories">{t('categories')}</TabsTrigger>
            <TabsTrigger value="budgets">{t('budgets')}</TabsTrigger>
            <TabsTrigger value="recurring">{t('recurring.title')}</TabsTrigger>
            <TabsTrigger value="goals">{t('goals.title')}</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={transactionType === 'expense' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTransactionType('expense')}
                >
                  {t('expense')}
                </Button>
                <Button
                  variant={transactionType === 'income' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTransactionType('income')}
                >
                  {t('income')}
                </Button>
                <Button
                  variant={transactionType === 'transfer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTransactionType('transfer')}
                >
                  {t('transfer')}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showSelectMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setShowSelectMode(!showSelectMode); setSelectedTransactions(new Set()) }}
                >
                  {showSelectMode ? tc('cancel') : tc('select')}
                </Button>
                {showSelectMode && selectedTransactions.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteSelectedTransactions}
                  >
                    {tc('delete')} ({selectedTransactions.size})
                  </Button>
                )}
              </div>
            </div>

            {/* Filters Panel */}
            <Card className="bg-[var(--card)] border-[var(--border)]">
              <CardContent className="p-4">
                {showSelectMode && (
                  <div className="flex items-center gap-2 mb-4">
                    <Checkbox checked={allSelected} onCheckedChange={selectAllTransactions} />
                    <span className="text-sm text-[var(--text-muted)]">{tc('selectAll')}</span>
                    {selectedTransactions.size > 0 && (
                      <span className="text-sm text-[var(--text-muted)] ml-auto">
                        {tc('selected')}: {selectedTransactions.size}
                      </span>
                    )}
                  </div>
                )}
                <TransactionFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  accounts={accounts}
                  categories={categories}
                />
              </CardContent>
            </Card>

            {paginatedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💸</div>
                <h3 className="text-lg font-semibold mb-2">{t('noTransactionsFound')}</h3>
                <p className="text-[var(--text-muted)] mb-4">{t('createFirstTransaction')}</p>
                <Button onClick={() => setTransactionFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addTransaction')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedTransactions.map((transaction: FinanceTransaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    category={getCategoryById(transaction.categoryId || '')}
                    account={getAccountById(transaction.accountId)}
                    onEdit={() => handleEditTransaction(transaction)}
                    onDelete={() => handleDeleteTransaction(transaction.id)}
                    selected={selectedTransactions.has(transaction.id)}
                    onSelect={() => toggleSelectTransaction(transaction.id)}
                    showCheckbox={showSelectMode}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={transactions.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
              />
            )}
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-lg font-semibold mb-2">{t('noAccountsFound')}</h3>
                <p className="text-[var(--text-muted)] mb-4">{t('createFirstAccount')}</p>
                <Button onClick={() => setAccountFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addAccount')}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account: FinanceAccount) => (
                  <Card key={account.id} className="bg-[var(--card)] border-[var(--border)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{account.icon}</span>
                          {account.name}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(account.currentBalance, account.currency)}
                      </div>
                      <div className="text-sm text-[var(--text-muted)] mt-1">
                        {t(`accountTypes.${account.type}`)} • {account.currency}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditAccount(account)}
                        >
                          {t('edit', { ns: 'Common' })}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          {t('delete', { ns: 'Common' })}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('categories')}</h3>
              <Button size="sm" onClick={() => setCategoryFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('addCategory')}
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-[var(--card)] border-[var(--border)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>{t('income')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories
                      .filter((c: FinanceCategory) => c.type === 'income')
                      .map((category: FinanceCategory) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[var(--border)]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                          {!category.isPredefined && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCategory(category)}>✏️</Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteCategory(category.id)}>🗑️</Button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--card)] border-[var(--border)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <span>{t('expense')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories
                      .filter((c: FinanceCategory) => c.type === 'expense')
                      .map((category: FinanceCategory) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[var(--border)]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                          {!category.isPredefined && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCategory(category)}>✏️</Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteCategory(category.id)}>🗑️</Button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budgets">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('budgets')}</h3>
              <Button size="sm" onClick={() => setBudgetFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('addBudget')}
              </Button>
            </div>
            {budgets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-semibold mb-2">{t('noBudgetsFound')}</h3>
                <p className="text-[var(--text-muted)] mb-4">{t('createFirstAccount', { ns: 'Finances' }).replace('счёт', 'бюджет')}</p>
                <Button onClick={() => setBudgetFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addBudget')}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {budgets.map((budget: FinanceBudget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    category={getCategoryById(budget.categoryId)}
                    onEdit={() => handleEditBudget(budget)}
                    onDelete={() => handleDeleteBudget(budget.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recurring">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('recurring.title')}</h3>
              <Button size="sm" onClick={() => setRecurringFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('recurring.add')}
              </Button>
            </div>
            {recurringTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔁</div>
                <h3 className="text-lg font-semibold mb-2">{t('recurring.noRecurring')}</h3>
                <p className="text-[var(--text-muted)] mb-4">{t('recurring.createFirst')}</p>
                <Button onClick={() => setRecurringFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('recurring.addRecurring')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recurringTransactions.map((transaction: FinanceRecurringTransaction) => (
                  <RecurringTransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    category={getCategoryById(transaction.categoryId)}
                    account={getAccountById(transaction.accountId)}
                    onEdit={() => handleEditRecurring(transaction)}
                    onDelete={() => handleDeleteRecurring(transaction.id)}
                    onToggle={() => handleToggleRecurring(transaction.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="goals">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('goals.title')}</h3>
              <Button size="sm" onClick={() => setGoalFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('goals.add')}
              </Button>
            </div>
            {savingsGoals.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-lg font-semibold mb-2">{t('goals.noGoals')}</h3>
                <p className="text-[var(--text-muted)] mb-4">{t('goals.createFirst')}</p>
                <Button onClick={() => setGoalFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('goals.add')}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {savingsGoals.map((goal: FinanceSavingsGoal) => (
                  <SavingsGoalCard
                    key={goal.id}
                    goal={goal}
                    account={getAccountById(goal.accountId)}
                    onEdit={() => handleEditGoal(goal)}
                    onDelete={() => handleDeleteGoal(goal.id)}
                    onAddFunds={() => { setSelectedGoal(goal); setAddFundsOpen(true) }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Forms */}
        <TransactionForm
          open={transactionFormOpen}
          onOpenChange={(open) => {
            setTransactionFormOpen(open)
            if (!open) setSelectedTransaction(null)
          }}
          editId={selectedTransaction?.id}
          initialType={transactionType}
        />

        <AccountForm
          open={accountFormOpen}
          onOpenChange={(open) => {
            setAccountFormOpen(open)
            if (!open) setSelectedAccount(null)
          }}
          editId={selectedAccount?.id}
        />

        <BudgetForm
          open={budgetFormOpen}
          onOpenChange={(open) => {
            setBudgetFormOpen(open)
            if (!open) setSelectedBudget(null)
          }}
          editId={selectedBudget?.id}
        />

        <CategoryForm
          open={categoryFormOpen}
          onOpenChange={(open) => {
            setCategoryFormOpen(open)
            if (!open) setSelectedCategory(null)
          }}
          editId={selectedCategory?.id}
        />

        <RecurringTransactionForm
          open={recurringFormOpen}
          onOpenChange={(open) => {
            setRecurringFormOpen(open)
            if (!open) setSelectedRecurring(null)
          }}
          editId={selectedRecurring?.id}
        />

        <SavingsGoalForm
          open={goalFormOpen}
          onOpenChange={(open) => {
            setGoalFormOpen(open)
            if (!open) setSelectedGoal(null)
          }}
          editId={selectedGoal?.id}
        />

        <AddFundsDialog
          open={addFundsOpen}
          onOpenChange={setAddFundsOpen}
          goalName={selectedGoal?.name || ''}
          currentAmount={selectedGoal?.currentAmount || 0}
          onAdd={handleAddFunds}
        />

        <CSVImport
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
        />
      </div>
    </MainLayout>
  )
}
