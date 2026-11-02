// DentalLab Pro API Client

const BASE_URL = '/api/v1'

export interface Role {
  id: number
  name: string
  description: string
  allowed_menus: string
}

export interface User {
  id: string
  employee_code?: string
  username: string
  email: string
  full_name: string
  phone: string
  avatar_url?: string
  specialization?: string
  skills?: string
  work_schedule?: string
  address?: string
  join_date?: string
  updated_at?: string
  bio?: string
  is_active: boolean
  role_id?: number
  role: Role
  active_orders_count?: number
  completed_orders_count?: number
  completed_stages_count?: number
  on_time_rate?: number
  qc_pass_rate?: number
  avg_feedback_rating?: number
  total_overtime_hours?: number
  attendance_present_days?: number
  created_at?: string
}

export interface StaffAttendance {
  id: string
  user_id: string
  user?: User
  attendance_date: string
  shift_schedule: string
  check_in: string
  check_out: string
  status: 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'CUTI' | string
  overtime_hours: number
  overtime_notes: string
  created_at: string
}

export interface Customer {
  id: string
  code: string
  name: string
  clinic_name: string
  phone: string
  email: string
  address: string
  notes: string
  favorite_shade?: string
  favorite_denture_type?: string
  loyalty_tier?: 'REGULAR' | 'SILVER' | 'GOLD' | 'VIP' | string
  discount_percent?: number
  preferences: string
  total_orders?: number
  total_spent?: number
  last_order_date?: string
  days_since_last_order?: number
  patients_count?: number
  created_at: string
}

export interface Patient {
  id: string
  code: string
  customer_id?: string
  customer?: Customer
  name: string
  gender: 'L' | 'P' | string
  age: number
  phone: string
  default_shade: string
  last_teeth_numbers: string
  allergies_or_notes: string
  is_active: boolean
  total_orders?: number
  last_order_date?: string
  created_at: string
}

export interface DentureType {
  id: number
  code: string
  name: string
  category: string
  base_price: number
  estimated_days: number
  description: string
  stage_templates: {
    id: number
    stage_order: number
    stage_code: string
    stage_name: string
    description: string
  }[]
}

export interface StageRun {
  id: string
  stage_code: string
  stage_name: string
  stage_order: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REWORKED' | 'SKIPPED'
  technician_id?: string
  technician?: User
  started_at?: string
  finished_at?: string
  notes?: string
}

export interface QualityCheck {
  id: string
  production_order_id: string
  inspector_id: string
  inspector?: User
  passed: boolean
  checklist_results?: string
  defect_notes: string
  rework_target_stage?: string
  checked_at: string
}

export interface OrderAttachment {
  id: string
  production_order_id: string
  file_name: string
  stored_file_path: string
  file_size: number
  mime_type: string
  attachment_type: string
  description: string
  created_at: string
}

export interface ProductionOrder {
  id: string
  order_number: string
  customer_id: string
  customer: Customer
  patient_id?: string
  patient?: Patient
  patient_name: string
  denture_type_id: number
  denture_type: DentureType
  teeth_numbers: string
  shade_guide: string
  received_date: string
  promised_due_date: string
  completed_at?: string
  delivered_at?: string
  status: 'INTAKE' | 'IN_PRODUCTION' | 'QC_PENDING' | 'QC_FAILED' | 'REOPENED_FOR_REWORK' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED'
  current_stage_code: string
  current_stage_name: string
  current_technician_id?: string
  current_technician?: User
  priority: 'NORMAL' | 'URGENT'
  doctor_notes: string
  internal_notes: string
  discount_percent?: number
  discount_amount?: number
  total_price: number
  feedback_rating?: number
  feedback_notes?: string
  stage_runs?: StageRun[]
  quality_checks?: QualityCheck[]
  attachments?: OrderAttachment[]
  created_at: string
}

export interface ProductionPeriodChartItem {
  period: string
  total_orders: number
  completed_orders: number
  active_orders: number
  revenue: number
}

export interface TopCustomerItem {
  customer_id: string
  doctor_name: string
  clinic_name: string
  phone: string
  loyalty_tier: string
  total_orders: number
  total_revenue: number
}

export interface TopProductItem {
  denture_type_id: number
  product_name: string
  category: string
  total_orders: number
  total_revenue: number
  percentage: number
}

export interface CostRevenueAnalysis {
  total_revenue: number
  paid_revenue: number
  material_cost: number
  labor_cost: number
  operational_cost: number
  total_cost: number
  gross_profit: number
  net_profit: number
  profit_margin_pct: number
}

export interface SystemAlert {
  id: string
  category: 'LATE_PRODUCTION' | 'LOW_STOCK' | 'OVERDUE_INVOICE' | string
  severity: 'CRITICAL' | 'WARNING' | string
  title: string
  description: string
  reference_code: string
  reference_id: string
  target_tab: string
  days_diff: number
  amount_or_qty: number
}

export interface BackupLog {
  id: string
  backup_name: string
  backup_type: string
  total_records: number
  size_kb: number
  created_by: string
  status: string
  created_at: string
}

export interface BackupInfoSummary {
  database_status: string
  auto_backup: boolean
  last_backup_at: string
  total_records: number
  table_counts: Record<string, number>
  backup_history: BackupLog[]
}

export interface UserActivityLog {
  id: string
  user_id: string
  username: string
  full_name: string
  role_name: string
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'BACKUP' | string
  module_name: 'PRODUKSI_SPK' | 'DOKTER_PASIEN' | 'STOK_BAHAN' | 'KEUANGAN_INVOICE' | 'SDM_ABSENSI' | 'KEAMANAN_SISTEM' | string
  target_entity: string
  description: string
  changed_data: string
  ip_address: string
  http_method: string
  endpoint: string
  created_at: string
}

export interface ActivityLogSummary {
  total_logs: number
  create_count: number
  update_count: number
  delete_count: number
  login_count: number
  active_users_today: number
  logs: UserActivityLog[]
}

export interface DashboardSummary {
  active_orders_count: number
  qc_pending_count: number
  completed_this_month: number
  total_revenue_month: number
  total_expenses_month: number
  net_operating_income: number
  total_receivables: number
  low_stock_count: number
  late_orders_count?: number
  overdue_invoices_count?: number
  recent_orders: ProductionOrder[]
  weekly_production?: ProductionPeriodChartItem[]
  monthly_production?: ProductionPeriodChartItem[]
  top_customers?: TopCustomerItem[]
  top_products?: TopProductItem[]
  cost_vs_revenue?: CostRevenueAnalysis
  auto_alerts?: SystemAlert[]
}

export interface UnitOfMeasure {
  id: number
  code: string
  name: string
}

export interface Supplier {
  id: string
  code: string
  name: string
  contact_person: string
  phone: string
  email: string
  address: string
}

export interface Item {
  id: string
  code: string
  name: string
  category: string
  unit_id: number
  unit: UnitOfMeasure
  supplier_id?: string
  supplier?: Supplier
  current_stock: number
  min_stock_level: number
  purchase_price: number
  lot_number?: string
  expiry_date?: string
  description?: string
}

export interface InventoryBatch {
  id: string
  item_id: string
  item: Item
  lot_number?: string
  expiry_date?: string
  initial_quantity: number
  current_quantity: number
  unit_cost: number
  received_date: string
  created_at: string
}

export interface StockMovement {
  id: string
  movement_type: string
  item_id: string
  item: Item
  batch_id?: string
  batch?: InventoryBatch
  quantity: number
  unit_cost: number
  reference_type: string
  reference_id?: string
  notes: string
  created_at: string
}

export interface TopUsedMaterial {
  item_id: string
  item_code: string
  item_name: string
  category: string
  unit_code: string
  total_used: number
  usage_count: number
  total_value: number
}

export interface InventoryReportSummary {
  total_items: number
  total_stock_value: number
  low_stock_count: number
  expiring_soon_count: number
  expired_count: number
  low_stock_items: Item[]
  top_used_materials: TopUsedMaterial[]
}

export interface PurchaseRequest {
  id: string
  pr_number: string
  supplier?: { name: string }
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED_BY_OWNER' | 'REJECTED' | 'RECEIVED'
  requested_by: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  total_amount: number
  notes: string
  items?: {
    id: string
    item: Item
    quantity: number
    estimated_unit_price: number
    subtotal: number
  }[]
  created_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  discount: number
  subtotal: number
  line_total: number
}

export interface PaymentRecord {
  id: string
  payment_number: string
  invoice_id?: string
  customer_id: string
  amount: number
  payment_method: string
  payment_type: string
  payment_date: string
  reference_number?: string
  notes?: string
  created_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  production_order_id?: string
  customer_id?: string
  customer: Customer
  issue_date: string
  due_date: string
  subtotal: number
  discount_amount: number
  total_amount: number
  paid_amount: number
  balance_due: number
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERPAID' | 'VOID'
  notes: string
  items?: InvoiceItem[]
  payments?: PaymentRecord[]
  production_order?: ProductionOrder
}

export interface ExpenseCategory {
  id: number
  code: string
  name: string
}

export interface Expense {
  id: string
  expense_number: string
  category_id: number
  category: ExpenseCategory
  amount: number
  expense_date: string
  description: string
  created_at: string
}

export interface SalesPeriodItem {
  period: string
  orders_count: number
  active_customers: number
  omzet: number
  paid_amount: number
  unpaid_amount: number
}

export interface FinanceReportSummary {
  daily_omzet: number
  daily_orders_count: number
  monthly_omzet: number
  monthly_orders_count: number
  total_invoiced: number
  total_paid: number
  total_receivables: number
  total_invoices_count: number
  paid_invoices_count: number
  unpaid_invoices_count: number
  material_cost: number
  labor_cost: number
  operational_cost: number
  total_expenses: number
  gross_profit: number
  net_operating_profit: number
  active_customers_count: number
  total_customers_count: number
  daily_breakdown: SalesPeriodItem[]
  monthly_breakdown: SalesPeriodItem[]
}

export const api = {
  getToken(): string | null {
    return localStorage.getItem('dl_token')
  },
  setToken(token: string) {
    localStorage.setItem('dl_token', token)
  },
  clearToken() {
    localStorage.removeItem('dl_token')
    localStorage.removeItem('dl_user')
  },
  getUser(): User | null {
    const raw = localStorage.getItem('dl_user')
    return raw ? JSON.parse(raw) : null
  },
  setUser(u: User) {
    localStorage.setItem('dl_user', JSON.stringify(u))
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.message || json.error || 'Terjadi kesalahan sistem')
    }
    return json.data !== undefined ? json.data : json
  },

  // Auth
  async login(username: string, password: string) {
    const res = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    this.setToken(res.token)
    this.setUser(res.user)
    return res
  },

  async getMe() {
    return this.request<User>('/auth/me')
  },

  // Dashboard
  async getDashboard() {
    return this.request<DashboardSummary>('/reports/dashboard')
  },

  // Customers & Patients (CRM Master)
  async getCustomers(search = '') {
    return this.request<Customer[]>(`/customers?search=${encodeURIComponent(search)}`)
  },
  async createCustomer(data: Partial<Customer>) {
    return this.request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async updateCustomer(id: string, data: Partial<Customer>) {
    return this.request<Customer>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
  async deleteCustomer(id: string) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    })
  },
  async getPatients(search = '', customerId = '') {
    return this.request<Patient[]>(`/patients?search=${encodeURIComponent(search)}&customer_id=${encodeURIComponent(customerId)}`)
  },
  async createPatient(data: Partial<Patient>) {
    return this.request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async updatePatient(id: string, data: Partial<Patient>) {
    return this.request<Patient>(`/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
  async deletePatient(id: string) {
    return this.request(`/patients/${id}`, {
      method: 'DELETE',
    })
  },

  // Denture Types & Production Orders
  async getDentureTypes() {
    return this.request<DentureType[]>('/production/denture-types')
  },
  async getOrders(status = '', search = '') {
    return this.request<ProductionOrder[]>(`/production/orders?status=${status}&search=${encodeURIComponent(search)}`)
  },
  async getOrderById(id: string) {
    return this.request<ProductionOrder>(`/production/orders/${id}`)
  },
  async createOrder(data: any) {
    return this.request<ProductionOrder>('/production/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async updateOrderFeedback(orderId: string, feedbackRating: number, feedbackNotes: string) {
    return this.request<ProductionOrder>(`/production/orders/${orderId}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify({ feedback_rating: feedbackRating, feedback_notes: feedbackNotes }),
    })
  },
  async advanceStage(orderId: string, currentRunId: string, notes = '', technicianId?: string, nextTechnicianId?: string) {
    return this.request(`/production/orders/${orderId}/advance-stage`, {
      method: 'POST',
      body: JSON.stringify({
        current_run_id: currentRunId,
        notes,
        technician_id: technicianId || undefined,
        next_technician_id: nextTechnicianId || undefined,
      }),
    })
  },
  async updateStageRun(orderId: string, runId: string, data: { technician_id?: string; status?: string; notes?: string }) {
    return this.request<ProductionOrder>(`/production/orders/${orderId}/stages/${runId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
  async updateOrderStatus(orderId: string, status: string, internalNotes = '') {
    return this.request<ProductionOrder>(`/production/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, internal_notes: internalNotes }),
    })
  },
  async submitQC(orderId: string, passed: boolean, defectNotes = '', reworkTargetStage = '', checklistResults = '{}') {
    return this.request(`/production/orders/${orderId}/qc`, {
      method: 'POST',
      body: JSON.stringify({
        passed,
        checklist_results: checklistResults,
        defect_notes: defectNotes,
        rework_target_stage: reworkTargetStage,
      }),
    })
  },
  async uploadOrderAttachment(orderId: string, file: File, attachmentType = 'QC_PHOTO', description = '') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('attachment_type', attachmentType)
    formData.append('description', description)
    const token = this.getToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${BASE_URL}/production/orders/${orderId}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || json.error || 'Gagal mengunggah foto dokumentasi')
    return json.data as OrderAttachment
  },

  // Inventory
  async getUnits() {
    return this.request<UnitOfMeasure[]>('/inventory/units')
  },
  async getSuppliers() {
    return this.request<Supplier[]>('/inventory/suppliers')
  },
  async createSupplier(data: Partial<Supplier>) {
    return this.request<Supplier>('/inventory/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async getItems(search = '', category = '') {
    return this.request<Item[]>(`/inventory/items?search=${encodeURIComponent(search)}&category=${category}`)
  },
  async createItem(data: any) {
    return this.request<Item>('/inventory/items', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async updateItem(id: string, data: any) {
    return this.request<Item>(`/inventory/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
  async getBatches(itemId = '') {
    return this.request<InventoryBatch[]>(`/inventory/batches?item_id=${itemId}`)
  },
  async getMovements(itemId = '', type = '') {
    return this.request<StockMovement[]>(`/inventory/movements?item_id=${itemId}&type=${type}`)
  },
  async getInventoryReport() {
    return this.request<InventoryReportSummary>('/inventory/report')
  },
  async receiveStock(data: any) {
    return this.request('/inventory/receive', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async issueStock(data: any) {
    return this.request('/inventory/issue', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Purchase Requests & Owner Approvals
  async getPurchaseRequests(status = '') {
    return this.request<PurchaseRequest[]>(`/inventory/purchase-requests?status=${status}`)
  },
  async createPurchaseRequest(data: any) {
    return this.request<PurchaseRequest>('/inventory/purchase-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async approvePR(id: string) {
    return this.request(`/inventory/purchase-requests/${id}/approve`, {
      method: 'POST',
    })
  },
  async rejectPR(id: string, reason: string) {
    return this.request(`/inventory/purchase-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  },
  async receiveApprovedPR(id: string) {
    return this.request(`/inventory/purchase-requests/${id}/receive`, {
      method: 'POST',
    })
  },

  // Finance & Sales
  async getFinanceSummary() {
    return this.request<FinanceReportSummary>('/finance/summary')
  },
  async getInvoices(status = '', search = '') {
    return this.request<Invoice[]>(`/finance/invoices?status=${status}&search=${encodeURIComponent(search)}`)
  },
  async createInvoice(data: any) {
    return this.request<Invoice>('/finance/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async syncInvoicesFromProduction() {
    return this.request<{ synced_count: number; message: string }>('/finance/invoices/sync', {
      method: 'POST',
    })
  },
  async recordPayment(data: any) {
    return this.request('/finance/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async getExpenseCategories() {
    return this.request<ExpenseCategory[]>('/finance/expense-categories')
  },
  async getExpenses() {
    return this.request<Expense[]>('/finance/expenses')
  },
  async createExpense(data: any) {
    return this.request<Expense>('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Users Management & HR
  async getUsers() {
    return this.request<User[]>('/users')
  },
  async createUser(data: any) {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async updateUser(id: string, data: any) {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    })
  },
  async updateMyProfile(data: any) {
    const updated = await this.request<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    this.setUser(updated)
    return updated
  },
  async uploadMyAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    const token = this.getToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${BASE_URL}/auth/profile/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || json.error || 'Gagal mengunggah foto profil')
    if (json.data) this.setUser(json.data)
    return json.data as User
  },
  async uploadUserAvatar(userId: string, file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    const token = this.getToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${BASE_URL}/users/${userId}/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || json.error || 'Gagal mengunggah foto profil staf')
    return json.data as User
  },
  async getAttendances(userId = '') {
    return this.request<StaffAttendance[]>(`/hr/attendances?user_id=${encodeURIComponent(userId)}`)
  },
  async saveAttendance(data: Partial<StaffAttendance>) {
    return this.request<StaffAttendance>('/hr/attendances', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async deleteAttendance(id: string) {
    return this.request(`/hr/attendances/${id}`, {
      method: 'DELETE',
    })
  },

  // Roles Management
  async getRoles() {
    return this.request<Role[]>('/roles')
  },
  async updateRole(id: number, allowedMenus: string[]) {
    return this.request(`/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ allowed_menus: JSON.stringify(allowedMenus) }),
    })
  },

  // System Settings & Logo
  async getSettings() {
    return this.request<Record<string, string>>('/settings')
  },
  async updateSetting(key: string, value: string) {
    return this.request('/settings', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    })
  },
  async uploadLogo(file: File) {
    const formData = new FormData()
    formData.append('logo', file)
    const token = this.getToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${BASE_URL}/settings/logo`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'Gagal mengunggah logo')
    return json.logo_url as string
  },

  // Backup & Restore System Data
  async getBackupInfo() {
    return this.request<BackupInfoSummary>('/reports/backup/info')
  },
  async createBackupSnapshot(backupType = 'MANUAL_FULL_BACKUP', createdBy = '') {
    const token = this.getToken()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${BASE_URL}/reports/backup/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ backup_type: backupType, created_by: createdBy }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || json.error || 'Gagal membuat backup data')
    return json as { success: boolean; log: BackupLog; snapshot: Record<string, any> }
  },
  async restoreBackupSnapshot(payload: Record<string, any>) {
    return this.request<BackupLog>('/reports/backup/restore', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // Security Module: User Activity Logs (Audit Trail)
  async getActivityLogs(module = '', actionType = '', username = '', search = '') {
    const params = new URLSearchParams()
    if (module) params.set('module', module)
    if (actionType) params.set('action_type', actionType)
    if (username) params.set('username', username)
    if (search) params.set('search', search)
    const qs = params.toString()
    return this.request<ActivityLogSummary>(`/reports/activity-logs${qs ? `?${qs}` : ''}`)
  },
}
