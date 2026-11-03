import React, { useState, useEffect } from 'react'
import {
  Activity,
  AlertCircle,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  DollarSign,
  Download,
  MessageCircle,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  TrendingUp,
  Users,
  LogOut,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Globe,
  Upload,
  UserPlus,
  Menu,
  X,
} from 'lucide-react'
import {
  api,
  type ActivityLogSummary,
  type BackupInfoSummary,
  type Customer,
  type DashboardSummary,
  type DentureType,
  type Expense,
  type ExpenseCategory,
  type FinanceReportSummary,
  type InventoryBatch,
  type InventoryReportSummary,
  type Invoice,
  type Item,
  type Patient,
  type ProductionOrder,
  type PurchaseRequest,
  type Role,
  type StaffAttendance,
  type StockMovement,
  type Supplier,
  type Tenant,
  type UnitOfMeasure,
  type User,
} from './api'
import { Odontogram } from './components/Odontogram'
import { generateWAMessage, openWhatsApp } from './utils/whatsapp'
import { translations, type Language } from './utils/i18n'

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(api.getUser())
  
  // Theme & Language State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('dl_theme') as 'light' | 'dark') || 'light'
  })
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('dl_lang') as Language) || 'id'
  })

  const t = translations[lang]
  const tr = (idText: string, enText: string) => (lang === 'en' ? enText : idText)
  const dateLocale = lang === 'en' ? 'en-US' : 'id-ID'

  // Apply Theme to DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
    localStorage.setItem('dl_theme', theme)
  }, [theme])

  // Save Language
  useEffect(() => {
    localStorage.setItem('dl_lang', lang)
  }, [lang])

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'new_order' | 'customers' | 'patients' | 'hr' | 'profile' | 'inventory' | 'approvals' | 'finance' | 'settings'>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Auth State
  const [loginUsername, setLoginUsername] = useState('owner')
  const [loginPassword, setLoginPassword] = useState('admin12345')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)

  // Data State
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null)
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [dentureTypes, setDentureTypes] = useState<DentureType[]>([])
  const [inventoryItems, setInventoryItems] = useState<Item[]>([])
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])

  // Settings Data State
  const [usersList, setUsersList] = useState<User[]>([])
  const [rolesList, setRolesList] = useState<Role[]>([])
  const [systemSettings, setSystemSettings] = useState<Record<string, string>>({})
  const [settingsSubTab, setSettingsSubTab] = useState<'users' | 'roles' | 'tenants' | 'security_logs' | 'backup' | 'appearance'>('users')

  // Dashboard Analytics, Auto Alerts, Mobile Quick Update, Backup & Security Audit Log State
  const [dashChartMode, setDashChartMode] = useState<'weekly' | 'monthly'>('weekly')
  const [dashAlertFilter, setDashAlertFilter] = useState<'ALL' | 'LATE_PRODUCTION' | 'LOW_STOCK' | 'OVERDUE_INVOICE'>('ALL')
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [showQuickMobileModal, setShowQuickMobileModal] = useState(false)
  const [backupInfo, setBackupInfo] = useState<BackupInfoSummary | null>(null)
  const [creatingBackup, setCreatingBackup] = useState(false)
  const [restoringBackup, setRestoringBackup] = useState(false)
  const [activitySummary, setActivitySummary] = useState<ActivityLogSummary | null>(null)
  const [auditModuleFilter, setAuditModuleFilter] = useState('')
  const [auditActionFilter, setAuditActionFilter] = useState('')
  const [auditUserFilter, setAuditUserFilter] = useState('')
  const [auditSearch, setAuditSearch] = useState('')

  // Logo Upload State
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Multi-Tenant Architecture State (Super Admin)
  const [tenantsList, setTenantsList] = useState<Tenant[]>([])
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('')
  const [tenantSearchQuery, setTenantSearchQuery] = useState('')
  const [showAddTenantModal, setShowAddTenantModal] = useState(false)
  const [newTenantCode, setNewTenantCode] = useState('')
  const [newTenantName, setNewTenantName] = useState('')
  const [newTenantAddress, setNewTenantAddress] = useState('')
  const [newTenantPhone, setNewTenantPhone] = useState('')
  const [newTenantEmail, setNewTenantEmail] = useState('')

  // Edit Tenant State
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [editTenantName, setEditTenantName] = useState('')
  const [editTenantAddress, setEditTenantAddress] = useState('')
  const [editTenantPhone, setEditTenantPhone] = useState('')
  const [editTenantEmail, setEditTenantEmail] = useState('')
  const [editTenantActive, setEditTenantActive] = useState(true)

  // Add Role State (Super Admin)
  const [showAddRoleModal, setShowAddRoleModal] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')
  const [newRoleMenus, setNewRoleMenus] = useState<string[]>([])

  // Add User Form State
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newFullName, setNewFullName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newRoleID, setNewRoleID] = useState(2)
  const [newUserTenantID, setNewUserTenantID] = useState<string>('')

  // Role Menus Editing State (Map of roleId -> array of menu keys)
  const [roleMenuMap, setRoleMenuMap] = useState<Record<number, string[]>>({})

  // Modal / Selection State
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)
  const [qcModalOpen, setQcModalOpen] = useState(false)
  const [qcPassed, setQcPassed] = useState(true)
  const [qcNotes, setQcNotes] = useState('')
  const [qcReworkStage, setQcReworkStage] = useState('')
  const [qcChecklist, setQcChecklist] = useState({
    oklusi: true,
    marginal_fit: true,
    kontak_proksimal: true,
    shade_match: true,
    polishing: true,
  })
  const [qcPhotoFile, setQcPhotoFile] = useState<File | null>(null)

  // Order Attachment Upload State
  const [attFile, setAttFile] = useState<File | null>(null)
  const [attType, setAttType] = useState('QC_PHOTO')
  const [attDesc, setAttDesc] = useState('')
  const [uploadingAtt, setUploadingAtt] = useState(false)

  // New Order Form State
  const [newOrderCustomer, setNewOrderCustomer] = useState('')
  const [newOrderPatientId, setNewOrderPatientId] = useState('')
  const [newOrderPatient, setNewOrderPatient] = useState('')
  const [newOrderType, setNewOrderType] = useState<number>(1)
  const [newOrderTeeth, setNewOrderTeeth] = useState<string[]>(['11', '21'])
  const [newOrderShade, setNewOrderShade] = useState('VITA A2')
  const [newOrderReceivedDate, setNewOrderReceivedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [newOrderDueDate, setNewOrderDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 4)
    return d.toISOString().split('T')[0]
  })
  const [newOrderTechId, setNewOrderTechId] = useState('')
  const [newOrderPriority, setNewOrderPriority] = useState('NORMAL')
  const [newOrderDoctorNotes, setNewOrderDoctorNotes] = useState('')
  const [newOrderPrice, setNewOrderPrice] = useState(750000)
  const [newOrderInitialPhoto, setNewOrderInitialPhoto] = useState<File | null>(null)

  // CRM (Master Dokter & Master Pasien) State
  const [patients, setPatients] = useState<Patient[]>([])
  const [crmSubTab, setCrmSubTab] = useState<'doctors' | 'patients' | 'history' | 'reminders'>('doctors')
  const [crmDoctorSearch, setCrmDoctorSearch] = useState('')
  const [crmPatientSearch, setCrmPatientSearch] = useState('')
  const [crmPatientDoctorFilter, setCrmPatientDoctorFilter] = useState('')
  const [crmHistoryDoctorFilter, setCrmHistoryDoctorFilter] = useState('')

  // Master Dokter / Klinik Modal State
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [newCustName, setNewCustName] = useState('')
  const [newCustClinic, setNewCustClinic] = useState('')
  const [newCustPhone, setNewCustPhone] = useState('')
  const [newCustEmail, setNewCustEmail] = useState('')
  const [newCustAddress, setNewCustAddress] = useState('')
  const [newCustNotes, setNewCustNotes] = useState('')
  const [newCustFavShade, setNewCustFavShade] = useState('VITA A2')
  const [newCustFavType, setNewCustFavType] = useState('Zirconia Crown (Full Contour)')
  const [newCustLoyaltyTier, setNewCustLoyaltyTier] = useState('REGULAR')
  const [newCustDiscount, setNewCustDiscount] = useState(0)

  // Master Pasien Modal State
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [patCustomerId, setPatCustomerId] = useState('')
  const [patName, setPatName] = useState('')
  const [patGender, setPatGender] = useState('L')
  const [patAge, setPatAge] = useState(35)
  const [patPhone, setPatPhone] = useState('')
  const [patDefaultShade, setPatDefaultShade] = useState('VITA A2')
  const [patLastTeeth, setPatLastTeeth] = useState('')
  const [patNotes, setPatNotes] = useState('')

  // Feedback / Rating Order Modal State
  const [feedbackOrder, setFeedbackOrder] = useState<ProductionOrder | null>(null)
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackNotes, setFeedbackNotes] = useState('')

  // HR (Manajemen SDM & Tugas) & User Profile State
  const [attendances, setAttendances] = useState<StaffAttendance[]>([])
  const [hrSubTab, setHrSubTab] = useState<'profiles' | 'assignments' | 'kpi' | 'attendance'>('profiles')
  const [hrRoleFilter, setHrRoleFilter] = useState('')
  const [hrSearch, setHrSearch] = useState('')
  const [hrAttUserFilter, setHrAttUserFilter] = useState('')

  // Edit Staff Profile Modal (HR / Admin)
  const [editingStaff, setEditingStaff] = useState<User | null>(null)
  const [staffFullName, setStaffFullName] = useState('')
  const [staffEmail, setStaffEmail] = useState('')
  const [staffPhone, setStaffPhone] = useState('')
  const [staffRoleId, setStaffRoleId] = useState(4)
  const [staffSpecialization, setStaffSpecialization] = useState('')
  const [staffSkills, setStaffSkills] = useState('')
  const [staffSchedule, setStaffSchedule] = useState('Senin - Sabtu (08:00 - 17:00)')
  const [staffJoinDate, setStaffJoinDate] = useState('2024-01-15')
  const [staffAddress, setStaffAddress] = useState('')
  const [staffBio, setStaffBio] = useState('')
  const [staffAvatarFile, setStaffAvatarFile] = useState<File | null>(null)

  // Attendance & Overtime Modal State
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [attUserId, setAttUserId] = useState('')
  const [attDate, setAttDate] = useState(() => new Date().toISOString().split('T')[0])
  const [attShift, setAttShift] = useState('Shift Pagi (08:00 - 17:00)')
  const [attCheckIn, setAttCheckIn] = useState('08:00')
  const [attCheckOut, setAttCheckOut] = useState('17:00')
  const [attStatus, setAttStatus] = useState('HADIR')
  const [attOvertimeHours, setAttOvertimeHours] = useState(0)
  const [attOvertimeNotes, setAttOvertimeNotes] = useState('')

  // My Profile Self-Edit State (for logged-in user)
  const [myFullName, setMyFullName] = useState('')
  const [myEmail, setMyEmail] = useState('')
  const [myPhone, setMyPhone] = useState('')
  const [mySpecialization, setMySpecialization] = useState('')
  const [mySkills, setMySkills] = useState('')
  const [mySchedule, setMySchedule] = useState('')
  const [myJoinDate, setMyJoinDate] = useState('')
  const [myAddress, setMyAddress] = useState('')
  const [myBio, setMyBio] = useState('')
  const [myNewPassword, setMyNewPassword] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Inventory & PR Form State
  const [unitsList, setUnitsList] = useState<UnitOfMeasure[]>([])
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([])
  const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [inventoryReport, setInventoryReport] = useState<InventoryReportSummary | null>(null)
  const [invSubTab, setInvSubTab] = useState<'master' | 'movements' | 'batches' | 'report' | 'suppliers'>('master')
  const [invSearch, setInvSearch] = useState('')
  const [invCategoryFilter, setInvCategoryFilter] = useState('')
  const [movementTypeFilter, setMovementTypeFilter] = useState('')

  // Master Item Modal State
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [itemName, setItemName] = useState('')
  const [itemCategory, setItemCategory] = useState('RAW_MATERIAL')
  const [itemUnitId, setItemUnitId] = useState(1)
  const [itemSupplierId, setItemSupplierId] = useState('')
  const [itemPrice, setItemPrice] = useState(100000)
  const [itemStock, setItemStock] = useState(10)
  const [itemMinStock, setItemMinStock] = useState(5)
  const [itemLotNumber, setItemLotNumber] = useState('')
  const [itemExpiryDate, setItemExpiryDate] = useState('')
  const [itemDesc, setItemDesc] = useState('')

  // Stock In (Receive) Modal State
  const [showStockInModal, setShowStockInModal] = useState(false)
  const [inItemId, setInItemId] = useState('')
  const [inQty, setInQty] = useState(1)
  const [inUnitCost, setInUnitCost] = useState(0)
  const [inLotNumber, setInLotNumber] = useState('')
  const [inExpiryDate, setInExpiryDate] = useState('')
  const [inSupplierId, setInSupplierId] = useState('')
  const [inNotes, setInNotes] = useState('')

  // Stock Out (Issue / Usage) Modal State
  const [showStockOutModal, setShowStockOutModal] = useState(false)
  const [outItemId, setOutItemId] = useState('')
  const [outBatchId, setOutBatchId] = useState('')
  const [outQty, setOutQty] = useState(1)
  const [outOrderId, setOutOrderId] = useState('')
  const [outNotes, setOutNotes] = useState('')

  // Supplier Modal State
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [supName, setSupName] = useState('')
  const [supContact, setSupContact] = useState('')
  const [supPhone, setSupPhone] = useState('')
  const [supEmail, setSupEmail] = useState('')
  const [supAddress, setSupAddress] = useState('')

  const [showAddPRModal, setShowAddPRModal] = useState(false)
  const [prItem, setPrItem] = useState('')
  const [prSupplierId, setPrSupplierId] = useState('')
  const [prQty, setPrQty] = useState(1)
  const [prEstPrice, setPrEstPrice] = useState(100000)
  const [prNotes, setPrNotes] = useState('')

  // Invoice, Finance & Sales State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER')
  const [paymentType, setPaymentType] = useState('PARTIAL')
  const [financeSummary, setFinanceSummary] = useState<FinanceReportSummary | null>(null)
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
  const [finSubTab, setFinSubTab] = useState<'invoices' | 'sales_report' | 'expenses' | 'customers'>('invoices')
  const [finInvoiceStatusFilter, setFinInvoiceStatusFilter] = useState('')
  const [finInvoiceSearch, setFinInvoiceSearch] = useState('')
  const [finExpenseCatFilter, setFinExpenseCatFilter] = useState(0)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [expCategoryId, setExpCategoryId] = useState(1)
  const [expAmount, setExpAmount] = useState(250000)
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0])
  const [expDesc, setExpDesc] = useState('')

  // Search
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('')

  // Check allowed menus for current user
  const isSuperAdmin = currentUser?.role?.name === 'SUPER_ADMIN'
  const allowedMenus: string[] = React.useMemo(() => {
    if (!currentUser) return []
    if (isSuperAdmin || currentUser.role?.name === 'OWNER') {
      return ['dashboard', 'orders', 'new_order', 'customers', 'patients', 'hr', 'profile', 'inventory', 'approvals', 'finance', 'settings']
    }
    try {
      const parsed = JSON.parse(currentUser.role?.allowed_menus || '[]')
      const list = Array.isArray(parsed) ? [...parsed] : []
      if ((list.includes('customers') || list.includes('orders') || list.includes('new_order')) && !list.includes('patients')) {
        list.push('patients')
      }
      if ((list.includes('orders') || list.includes('new_order')) && !list.includes('customers')) {
        list.push('customers')
      }
      if ((list.includes('orders') || currentUser.role?.name === 'TECHNICIAN' || currentUser.role?.name === 'ADMIN') && !list.includes('hr')) {
        list.push('hr')
      }
      if (!list.includes('profile')) {
        list.push('profile')
      }
      return list
    } catch {
      return ['dashboard', 'orders', 'customers', 'patients', 'hr', 'profile']
    }
  }, [currentUser, isSuperAdmin])

  // Sync My Profile form fields whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      setMyFullName(currentUser.full_name || '')
      setMyEmail(currentUser.email || '')
      setMyPhone(currentUser.phone || '')
      setMySpecialization(currentUser.specialization || '')
      setMySkills(currentUser.skills || '')
      setMySchedule(currentUser.work_schedule || 'Senin - Sabtu (08:00 - 17:00)')
      setMyJoinDate(currentUser.join_date || '2024-01-15')
      setMyAddress(currentUser.address || '')
      setMyBio(currentUser.bio || '')
    }
  }, [currentUser?.id, currentUser?.updated_at, currentUser?.avatar_url])

  // If superadmin or role has no access to current activeTab, switch to first allowed menu
  useEffect(() => {
    if (currentUser) {
      if (!allowedMenus.includes(activeTab) && activeTab !== 'profile') {
        if (allowedMenus.length > 0) {
          setActiveTab(allowedMenus[0] as any)
        }
      }
    }
  }, [currentUser?.id, allowedMenus, activeTab])

  const loadInitialData = React.useCallback(async () => {
    try {
      setLoading(true)
      const [meData, dashData, ordersData, custData, patsData, typesData, itemsData, prData, invData, expData, usersData, rolesData, settingsData, unitsData, supsData, batchesData, movesData, invReportData, attData, finSumData, expCatData, backupData, actLogData, tenantsData] = await Promise.all([
        api.getMe().catch(() => null),
        api.getDashboard().catch(() => null),
        api.getOrders().catch(() => []),
        api.getCustomers().catch(() => []),
        api.getPatients().catch(() => []),
        api.getDentureTypes().catch(() => []),
        api.getItems().catch(() => []),
        api.getPurchaseRequests().catch(() => []),
        api.getInvoices().catch(() => []),
        api.getExpenses().catch(() => []),
        api.getUsers().catch(() => []),
        api.getRoles().catch(() => []),
        api.getSettings().catch(() => ({})),
        api.getUnits().catch(() => []),
        api.getSuppliers().catch(() => []),
        api.getBatches().catch(() => []),
        api.getMovements().catch(() => []),
        api.getInventoryReport().catch(() => null),
        api.getAttendances().catch(() => []),
        api.getFinanceSummary().catch(() => null),
        api.getExpenseCategories().catch(() => []),
        api.getBackupInfo().catch(() => null),
        api.getActivityLogs().catch(() => null),
        api.getTenants().catch(() => []),
      ])
      if (meData) {
        api.setUser(meData)
        setCurrentUser(meData)
      }
      if (dashData) setDashboard(dashData)
      setOrders(ordersData || [])
      setCustomers(custData || [])
      setPatients(patsData || [])
      setDentureTypes(typesData || [])
      setInventoryItems(itemsData || [])
      setPurchaseRequests(prData || [])
      setInvoices(invData || [])
      setExpenses(expData || [])
      setUsersList(usersData || [])
      setRolesList(rolesData || [])
      setSystemSettings(settingsData || {})
      setUnitsList(unitsData || [])
      setSuppliersList(supsData || [])
      setInventoryBatches(batchesData || [])
      setStockMovements(movesData || [])
      if (invReportData) setInventoryReport(invReportData)
      setAttendances(attData || [])
      if (finSumData) setFinanceSummary(finSumData)
      setExpenseCategories(expCatData || [])
      if (backupData) setBackupInfo(backupData)
      if (actLogData) setActivitySummary(actLogData)
      setTenantsList(tenantsData || [])
      if (tenantsData && tenantsData.length > 0) {
        setNewUserTenantID((prev) => prev || tenantsData[0].id)
      }

      // Initialize roleMenuMap
      if (rolesData) {
        const m: Record<number, string[]> = {}
        for (const r of rolesData) {
          try {
            m[r.id] = JSON.parse(r.allowed_menus || '[]')
          } catch {
            m[r.id] = []
          }
        }
        setRoleMenuMap(m)
      }
    } catch (err: any) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser?.id) {
      loadInitialData()
    }
  }, [currentUser?.id, loadInitialData])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      setLoading(true)
      const res = await api.login(loginUsername, loginPassword)
      setCurrentUser(res.user)
    } catch (err: any) {
      setLoginError(err.message || 'Gagal login. Periksa username dan password.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    api.clearToken()
    setCurrentUser(null)
  }

  // Multi-User Role Based Quick Switch
  const handleQuickSwitchRole = async (username: string) => {
    try {
      setLoading(true)
      const res = await api.login(username, 'admin12345')
      setCurrentUser(res.user)
    } catch (err: any) {
      alert(err.message || `Gagal beralih ke akun ${username}`)
    } finally {
      setLoading(false)
    }
  }

  // Backup Data Snapshot & Download JSON
  const handleDownloadBackup = async (backupType = 'MANUAL_FULL_BACKUP', downloadFile = true) => {
    try {
      setCreatingBackup(true)
      const res = await api.createBackupSnapshot(backupType, currentUser?.full_name || currentUser?.username || 'Admin')
      if (downloadFile && res.snapshot) {
        const blob = new Blob([JSON.stringify(res.snapshot, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = res.log?.backup_name || `dentallab_backup_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      await loadInitialData()
      if (!downloadFile) {
        alert('Snapshot backup database berhasil diamankan ke server!')
      }
    } catch (err: any) {
      alert(err.message || 'Gagal membuat backup data')
    } finally {
      setCreatingBackup(false)
    }
  }

  // Restore / Verify Backup Data File
  const handleRestoreBackupFile = async (file: File) => {
    try {
      setRestoringBackup(true)
      const text = await file.text()
      const parsed = JSON.parse(text)
      await api.restoreBackupSnapshot(parsed)
      alert('File backup berhasil diverifikasi dan disinkronkan ke database!')
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'File backup tidak valid atau gagal dipulihkan')
    } finally {
      setRestoringBackup(false)
    }
  }

  // Helper: Select Doctor in New Order Form & apply Preferences + Loyalty Discount automatically
  const handleSelectOrderDoctor = (custId: string) => {
    setNewOrderCustomer(custId)
    const doc = customers.find((c) => c.id === custId)
    if (!doc) return

    // Apply favorite shade preference if available
    if (doc.favorite_shade) {
      setNewOrderShade(doc.favorite_shade)
    }
    // Apply favorite denture type if available
    let selectedDt = dentureTypes.find((t) => t.id === Number(newOrderType))
    if (doc.favorite_denture_type) {
      const favDt = dentureTypes.find(
        (t) =>
          t.name.toLowerCase().includes(doc.favorite_denture_type!.toLowerCase()) ||
          doc.favorite_denture_type!.toLowerCase().includes(t.name.toLowerCase())
      )
      if (favDt) {
        selectedDt = favDt
        setNewOrderType(favDt.id)
      }
    }
    // Auto-calculate price with Loyalty Discount
    const basePrice = selectedDt?.base_price || 750000
    const discPct = doc.discount_percent || 0
    const finalPrice = Math.round(basePrice * (1 - discPct / 100))
    setNewOrderPrice(finalPrice)

    // Pre-fill doctor special notes if empty
    if (doc.notes && !newOrderDoctorNotes) {
      setNewOrderDoctorNotes(doc.notes)
    }
  }

  // Helper: Select Patient from Master Pasien in New Order Form
  const handleSelectOrderPatient = (patientId: string) => {
    setNewOrderPatientId(patientId)
    if (!patientId) return
    const pat = patients.find((p) => p.id === patientId)
    if (!pat) return
    setNewOrderPatient(pat.name)
    if (pat.default_shade) {
      setNewOrderShade(pat.default_shade)
    }
    if (pat.customer_id && !newOrderCustomer) {
      handleSelectOrderDoctor(pat.customer_id)
    }
  }

  // Master Dokter / Klinik Modal Helpers
  const openCreateCustomerModal = () => {
    setEditingCustomer(null)
    setNewCustName('')
    setNewCustClinic('')
    setNewCustPhone('')
    setNewCustEmail('')
    setNewCustAddress('')
    setNewCustNotes('')
    setNewCustFavShade('VITA A2')
    setNewCustFavType(dentureTypes[0]?.name || 'Zirconia Crown (Full Contour)')
    setNewCustLoyaltyTier('REGULAR')
    setNewCustDiscount(0)
    setShowAddCustomerModal(true)
  }

  const openEditCustomerModal = (c: Customer) => {
    setEditingCustomer(c)
    setNewCustName(c.name)
    setNewCustClinic(c.clinic_name || '')
    setNewCustPhone(c.phone || '')
    setNewCustEmail(c.email || '')
    setNewCustAddress(c.address || '')
    setNewCustNotes(c.notes || '')
    setNewCustFavShade(c.favorite_shade || 'VITA A2')
    setNewCustFavType(c.favorite_denture_type || dentureTypes[0]?.name || 'Zirconia Crown (Full Contour)')
    setNewCustLoyaltyTier(c.loyalty_tier || 'REGULAR')
    setNewCustDiscount(c.discount_percent || 0)
    setShowAddCustomerModal(true)
  }

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustName || !newCustPhone) {
      alert('Nama dokter dan nomor WhatsApp wajib diisi')
      return
    }
    try {
      setLoading(true)
      const payload = {
        name: newCustName,
        clinic_name: newCustClinic,
        phone: newCustPhone,
        email: newCustEmail,
        address: newCustAddress,
        notes: newCustNotes,
        favorite_shade: newCustFavShade,
        favorite_denture_type: newCustFavType,
        loyalty_tier: newCustLoyaltyTier,
        discount_percent: Number(newCustDiscount),
      }
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, payload)
      } else {
        const res = await api.createCustomer(payload)
        setNewOrderCustomer(res.id)
      }
      setShowAddCustomerModal(false)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data dokter')
    } finally {
      setLoading(false)
    }
  }

  // Master Pasien Modal Helpers
  const openCreatePatientModal = (defaultCustomerId?: string) => {
    setEditingPatient(null)
    setPatCustomerId(defaultCustomerId || newOrderCustomer || customers[0]?.id || '')
    setPatName('')
    setPatGender('L')
    setPatAge(35)
    setPatPhone('')
    setPatDefaultShade('VITA A2')
    setPatLastTeeth('')
    setPatNotes('')
    setShowPatientModal(true)
  }

  const openEditPatientModal = (p: Patient) => {
    setEditingPatient(p)
    setPatCustomerId(p.customer_id || '')
    setPatName(p.name)
    setPatGender(p.gender || 'L')
    setPatAge(p.age || 35)
    setPatPhone(p.phone || '')
    setPatDefaultShade(p.default_shade || 'VITA A2')
    setPatLastTeeth(p.last_teeth_numbers || '')
    setPatNotes(p.allergies_or_notes || '')
    setShowPatientModal(true)
  }

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patName) {
      alert('Nama pasien wajib diisi')
      return
    }
    try {
      setLoading(true)
      const payload = {
        customer_id: patCustomerId || undefined,
        name: patName,
        gender: patGender,
        age: Number(patAge),
        phone: patPhone,
        default_shade: patDefaultShade,
        last_teeth_numbers: patLastTeeth,
        allergies_or_notes: patNotes,
      }
      if (editingPatient) {
        await api.updatePatient(editingPatient.id, payload)
      } else {
        const createdPat = await api.createPatient(payload)
        setNewOrderPatientId(createdPat.id)
        setNewOrderPatient(createdPat.name)
        if (createdPat.default_shade) {
          setNewOrderShade(createdPat.default_shade)
        }
        if (createdPat.customer_id && !newOrderCustomer) {
          setNewOrderCustomer(createdPat.customer_id)
        }
      }
      setShowPatientModal(false)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data pasien')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePatient = async (id: string, name: string) => {
    if (!confirm(`Arsipkan data pasien "${name}"?`)) return
    try {
      setLoading(true)
      await api.deletePatient(id)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pasien')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackOrder) return
    try {
      setLoading(true)
      const updated = await api.updateOrderFeedback(feedbackOrder.id, feedbackRating, feedbackNotes)
      if (selectedOrder?.id === feedbackOrder.id) {
        setSelectedOrder(updated)
      }
      setFeedbackOrder(null)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan feedback dokter')
    } finally {
      setLoading(false)
    }
  }

  // Handle Create Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrderCustomer || !newOrderPatient) {
      alert(lang === 'id' ? 'Mohon pilih dokter dan isi nama pasien' : 'Please select dentist and enter patient name')
      return
    }
    try {
      setLoading(true)
      const doc = customers.find((c) => c.id === newOrderCustomer)
      const dt = dentureTypes.find((t) => t.id === Number(newOrderType))
      const basePrice = dt?.base_price || Number(newOrderPrice)
      const discPct = doc?.discount_percent || 0
      const discAmt = Math.max(0, basePrice - Number(newOrderPrice))

      const created = await api.createOrder({
        customer_id: newOrderCustomer,
        patient_id: newOrderPatientId || undefined,
        patient_name: newOrderPatient,
        denture_type_id: Number(newOrderType),
        teeth_numbers: JSON.stringify(newOrderTeeth),
        shade_guide: newOrderShade,
        received_date: newOrderReceivedDate,
        promised_due_date: newOrderDueDate,
        technician_id: newOrderTechId || undefined,
        priority: newOrderPriority,
        doctor_notes: newOrderDoctorNotes,
        discount_percent: discPct,
        discount_amount: discAmt,
        total_price: Number(newOrderPrice),
      })
      if (newOrderInitialPhoto && created?.id) {
        await api.uploadOrderAttachment(created.id, newOrderInitialPhoto, 'IMPRESSION_PHOTO', 'Foto cetakan / referensi awal SPK')
      }
      alert(lang === 'id' ? 'SPK Pesanan Gigi berhasil dibuat!' : 'Work Order created successfully!')
      await loadInitialData()
      if (created?.id) {
        const fresh = await api.getOrderById(created.id).catch(() => created)
        setSelectedOrder(fresh)
      }
      setActiveTab('orders')
      setNewOrderPatientId('')
      setNewOrderPatient('')
      setNewOrderDoctorNotes('')
      setNewOrderInitialPhoto(null)
    } catch (err: any) {
      alert(err.message || 'Gagal membuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  // Handle Advance Stage
  const handleAdvanceStage = async (orderId: string, currentRunId: string, currentTechId?: string) => {
    const notes = prompt(lang === 'id' ? 'Catatan pengerjaan tahapan ini (opsional):' : 'Technician work notes (optional):')
    if (notes === null) return
    try {
      setLoading(true)
      await api.advanceStage(orderId, currentRunId, notes, currentTechId)
      await loadInitialData()
      const updated = await api.getOrderById(orderId)
      setSelectedOrder(updated)
    } catch (err: any) {
      alert(err.message || 'Gagal memajukan tahapan')
    } finally {
      setLoading(false)
    }
  }

  // Handle Assign / Change PIC Technician on a specific stage
  const handleChangeStagePIC = async (orderId: string, runId: string, technicianId: string) => {
    try {
      setLoading(true)
      const updated = await api.updateStageRun(orderId, runId, {
        technician_id: technicianId || undefined,
      })
      setSelectedOrder(updated)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah PIC Teknis')
    } finally {
      setLoading(false)
    }
  }

  // Handle Change Order Status ("Dalam Proses", "Selesai", "Dikirim", dll.)
  const handleChangeOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true)
      const updated = await api.updateOrderStatus(orderId, newStatus)
      setSelectedOrder(updated)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status produksi')
    } finally {
      setLoading(false)
    }
  }

  // Handle Upload Attachment (Foto Hasil Akhir / QC Report / Model)
  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder || !attFile) return
    try {
      setUploadingAtt(true)
      await api.uploadOrderAttachment(selectedOrder.id, attFile, attType, attDesc || 'Dokumentasi hasil kerja / QC')
      setAttFile(null)
      setAttDesc('')
      const updated = await api.getOrderById(selectedOrder.id)
      setSelectedOrder(updated)
      await loadInitialData()
      alert('Foto dokumentasi / QC report berhasil diunggah!')
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah foto')
    } finally {
      setUploadingAtt(false)
    }
  }

  // Handle QC Submit
  const handleQCSubmit = async () => {
    if (!selectedOrder) return
    try {
      setLoading(true)
      if (qcPhotoFile) {
        await api.uploadOrderAttachment(
          selectedOrder.id,
          qcPhotoFile,
          'QC_PHOTO',
          `Foto Hasil Akhir / Pemeriksaan QC (${qcPassed ? 'LOLOS QC' : 'REVISI'}) - ${qcNotes || 'Terverifikasi'}`
        )
      }
      await api.submitQC(selectedOrder.id, qcPassed, qcNotes, qcReworkStage, JSON.stringify(qcChecklist))
      setQcModalOpen(false)
      setQcPhotoFile(null)
      await loadInitialData()
      const updated = await api.getOrderById(selectedOrder.id)
      setSelectedOrder(updated)
      alert(qcPassed ? (lang === 'id' ? 'Lolos QC! Pesanan selesai dan siap dikirim / ditagihkan.' : 'QC Passed! Order completed and ready for billing.') : (lang === 'id' ? 'Revisi/Rework tercatat. Pesanan dibuka kembali.' : 'Rework requested. Order reopened.'))
    } catch (err: any) {
      alert(err.message || 'Gagal memproses QC')
    } finally {
      setLoading(false)
    }
  }

  // Create Invoice from Order (or open existing auto-generated invoice)
  const handleCreateInvoice = async (orderId: string) => {
    const existing = invoices.find((inv) => inv.production_order_id === orderId || inv.production_order?.id === orderId)
    if (existing) {
      setViewingInvoice(existing)
      return
    }
    try {
      setLoading(true)
      const created = await api.createInvoice({
        production_order_id: orderId,
        discount_amount: 0,
        notes: 'Invoice otomatis terintegrasi dari hasil produksi SPK & QC',
      })
      await loadInitialData()
      setViewingInvoice(created)
    } catch (err: any) {
      alert(err.message || 'Gagal membuat invoice')
    } finally {
      setLoading(false)
    }
  }

  // Sync Invoices automatically from all COMPLETED / DELIVERED production orders
  const handleSyncInvoices = async () => {
    try {
      setLoading(true)
      const res = await api.syncInvoicesFromProduction()
      await loadInitialData()
      alert(res.message || `Sinkronisasi selesai (${res.synced_count} invoice baru diterbitkan dari data produksi).`)
    } catch (err: any) {
      alert(err.message || 'Gagal menyinkronkan invoice dari produksi')
    } finally {
      setLoading(false)
    }
  }

  // Create Expense (Biaya Bahan, Tenaga Kerja, Operasional)
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (expAmount <= 0 || !expDesc.trim()) {
      alert('Nominal dan keterangan biaya wajib diisi')
      return
    }
    try {
      setLoading(true)
      await api.createExpense({
        category_id: Number(expCategoryId),
        amount: Number(expAmount),
        expense_date: expDate ? new Date(expDate).toISOString() : new Date().toISOString(),
        description: expDesc,
      })
      alert('Pengeluaran / biaya produksi berhasil dicatat!')
      setShowExpenseModal(false)
      setExpDesc('')
      setExpAmount(250000)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat pengeluaran')
    } finally {
      setLoading(false)
    }
  }

  // Owner Approve PR
  const handleApprovePR = async (id: string) => {
    if (!confirm(lang === 'id' ? 'ACC dan Setujui pengadaan bahan baku ini?' : 'Approve this material procurement?')) return
    try {
      setLoading(true)
      await api.approvePR(id)
      await loadInitialData()
      alert(lang === 'id' ? 'Pengadaan disetujui Owner!' : 'Procurement approved by Owner!')
    } catch (err: any) {
      alert(err.message || 'Gagal menyetujui')
    } finally {
      setLoading(false)
    }
  }

  // Receive Approved Stock
  const handleReceiveStock = async (id: string) => {
    try {
      setLoading(true)
      await api.receiveApprovedPR(id)
      await loadInitialData()
      alert(lang === 'id' ? 'Barang diterima & saldo stok diperbarui!' : 'Materials received and stock updated!')
    } catch (err: any) {
      alert(err.message || 'Gagal menerima barang')
    } finally {
      setLoading(false)
    }
  }

  // Create PR
  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prItem) {
      alert(lang === 'id' ? 'Pilih bahan yang diajukan' : 'Please select material')
      return
    }
    try {
      setLoading(true)
      await api.createPurchaseRequest({
        supplier_id: prSupplierId || undefined,
        notes: prNotes,
        items: [
          {
            item_id: prItem,
            quantity: Number(prQty),
            estimated_unit_price: Number(prEstPrice),
          },
        ],
      })
      alert(lang === 'id' ? 'Pengajuan pembelian terkirim ke antrean Owner Approval!' : 'Purchase request sent to Owner Approval queue!')
      setShowAddPRModal(false)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal mengajukan')
    } finally {
      setLoading(false)
    }
  }

  // Open Master Item Modal (Create or Edit)
  const openCreateItemModal = () => {
    setEditingItem(null)
    setItemName('')
    setItemCategory('RAW_MATERIAL')
    setItemUnitId(unitsList[0]?.id || 1)
    setItemSupplierId(suppliersList[0]?.id || '')
    setItemPrice(100000)
    setItemStock(10)
    setItemMinStock(5)
    setItemLotNumber('')
    setItemExpiryDate('')
    setItemDesc('')
    setShowItemModal(true)
  }

  const openEditItemModal = (itm: Item) => {
    setEditingItem(itm)
    setItemName(itm.name)
    setItemCategory(itm.category || 'RAW_MATERIAL')
    setItemUnitId(itm.unit?.id || itm.unit_id || 1)
    setItemSupplierId(itm.supplier_id || itm.supplier?.id || '')
    setItemPrice(itm.purchase_price || 0)
    setItemStock(itm.current_stock || 0)
    setItemMinStock(itm.min_stock_level || 0)
    setItemLotNumber(itm.lot_number || '')
    setItemExpiryDate(itm.expiry_date ? itm.expiry_date.split('T')[0] : '')
    setItemDesc(itm.description || '')
    setShowItemModal(true)
  }

  // Save Master Item (Create or Update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName) return
    try {
      setLoading(true)
      const payload = {
        name: itemName,
        category: itemCategory,
        unit_id: Number(itemUnitId),
        supplier_id: itemSupplierId,
        purchase_price: Number(itemPrice),
        current_stock: Number(itemStock),
        min_stock_level: Number(itemMinStock),
        lot_number: itemLotNumber,
        expiry_date: itemExpiryDate,
        description: itemDesc,
      }
      if (editingItem) {
        await api.updateItem(editingItem.id, payload)
        alert('Data bahan/produk berhasil diperbarui!')
      } else {
        await api.createItem(payload)
        alert('Master data bahan/produk baru berhasil ditambahkan!')
      }
      setShowItemModal(false)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data bahan')
    } finally {
      setLoading(false)
    }
  }

  // Handle Stock In (Receive Material)
  const handleStockIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inItemId || inQty <= 0) return
    try {
      setLoading(true)
      await api.receiveStock({
        item_id: inItemId,
        quantity: Number(inQty),
        unit_cost: Number(inUnitCost),
        lot_number: inLotNumber,
        expiry_date: inExpiryDate,
        supplier_id: inSupplierId,
        notes: inNotes || 'Penerimaan pembelian stok bahan masuk',
      })
      alert('Stok masuk & data batch berhasil dicatat!')
      setShowStockInModal(false)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat stok masuk')
    } finally {
      setLoading(false)
    }
  }

  // Handle Stock Out (Issue / Usage Material)
  const handleStockOut = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!outItemId || outQty <= 0) return
    try {
      setLoading(true)
      await api.issueStock({
        item_id: outItemId,
        batch_id: outBatchId || undefined,
        quantity: Number(outQty),
        production_order_id: outOrderId || undefined,
        movement_type: 'ISSUE_PRODUCTION',
        notes: outNotes || 'Pemakaian bahan produksi lab',
      })
      alert('Pemakaian bahan (stok keluar) berhasil dicatat secara otomatis!')
      setShowStockOutModal(false)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat pemakaian bahan')
    } finally {
      setLoading(false)
    }
  }

  // Handle Save Supplier
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supName) return
    try {
      setLoading(true)
      const created = await api.createSupplier({
        name: supName,
        contact_person: supContact,
        phone: supPhone,
        email: supEmail,
        address: supAddress,
      })
      await loadInitialData()
      setItemSupplierId(created.id)
      setInSupplierId(created.id)
      setPrSupplierId(created.id)
      setShowSupplierModal(false)
      setSupName('')
      setSupContact('')
      setSupPhone('')
      setSupEmail('')
      setSupAddress('')
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan supplier')
    } finally {
      setLoading(false)
    }
  }

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoice || paymentAmount <= 0) return
    try {
      setLoading(true)
      await api.recordPayment({
        invoice_id: selectedInvoice.id,
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
        payment_type: paymentType,
      })
      alert(lang === 'id' ? 'Pembayaran berhasil dicatat!' : 'Payment recorded successfully!')
      setSelectedInvoice(null)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat pembayaran')
    } finally {
      setLoading(false)
    }
  }

  // Create User (User Management)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername || !newPassword || !newFullName) {
      alert(lang === 'id' ? 'Username, password, dan nama lengkap wajib diisi' : 'Username, password, and full name are required')
      return
    }
    if (!newUserTenantID) {
      alert(lang === 'id' ? 'Tenant / Lab wajib dipilih' : 'Tenant / Lab is required')
      return
    }
    try {
      setLoading(true)
      await api.createUser({
        username: newUsername,
        password: newPassword,
        full_name: newFullName,
        email: newEmail,
        phone: newPhone,
        role_id: Number(newRoleID),
        tenant_id: newUserTenantID,
      })
      alert(lang === 'id' ? 'User baru berhasil dibuat!' : 'User created successfully!')
      setShowAddUserModal(false)
      setNewUsername('')
      setNewPassword('')
      setNewFullName('')
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal membuat user')
    } finally {
      setLoading(false)
    }
  }

  // Multi-Tenant: Setup New Tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTenantCode.trim() || !newTenantName.trim()) {
      alert(lang === 'id' ? 'Kode dan nama tenant wajib diisi' : 'Tenant code and name are required')
      return
    }
    try {
      setLoading(true)
      await api.createTenant({
        code: newTenantCode.trim().toLowerCase(),
        name: newTenantName.trim(),
        address: newTenantAddress.trim(),
        phone: newTenantPhone.trim(),
        email: newTenantEmail.trim(),
      })
      alert(lang === 'id' ? 'Tenant baru berhasil dibuat!' : 'New tenant successfully created!')
      setShowAddTenantModal(false)
      setNewTenantCode('')
      setNewTenantName('')
      setNewTenantAddress('')
      setNewTenantPhone('')
      setNewTenantEmail('')
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal membuat tenant')
    } finally {
      setLoading(false)
    }
  }

  // Multi-Tenant: Update Tenant (Edit Name, Address, Contact, Status)
  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTenant || !editTenantName.trim()) {
      alert(lang === 'id' ? 'Nama tenant wajib diisi' : 'Tenant name is required')
      return
    }
    try {
      setLoading(true)
      await api.updateTenant(editingTenant.id, {
        name: editTenantName.trim(),
        address: editTenantAddress.trim(),
        phone: editTenantPhone.trim(),
        email: editTenantEmail.trim(),
        is_active: editTenantActive,
      })
      alert(lang === 'id' ? 'Data tenant berhasil diperbarui!' : 'Tenant details successfully updated!')
      setEditingTenant(null)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui tenant')
    } finally {
      setLoading(false)
    }
  }

  // Multi-Tenant: Delete Tenant
  const handleDeleteTenant = async (tenant: Tenant) => {
    if (tenant.code === 'main') {
      alert(lang === 'id' ? 'Tenant utama (main) tidak dapat dihapus.' : 'Main tenant cannot be deleted.')
      return
    }
    if (!confirm(lang === 'id' ? `Yakin ingin menghapus tenant "${tenant.name}"?` : `Are you sure you want to delete tenant "${tenant.name}"?`)) return
    try {
      setLoading(true)
      await api.deleteTenant(tenant.id)
      alert(lang === 'id' ? 'Tenant berhasil dihapus' : 'Tenant deleted')
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus tenant')
    } finally {
      setLoading(false)
    }
  }

  // Role Management: Create New Role (Super Admin Only)
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoleName.trim()) {
      alert(lang === 'id' ? 'Nama role wajib diisi' : 'Role name is required')
      return
    }
    try {
      setLoading(true)
      await api.createRole({
        name: newRoleName.trim().toUpperCase(),
        description: newRoleDesc.trim(),
        allowed_menus: newRoleMenus,
      })
      alert(lang === 'id' ? 'Role baru berhasil dibuat!' : 'New role successfully created!')
      setShowAddRoleModal(false)
      setNewRoleName('')
      setNewRoleDesc('')
      setNewRoleMenus([])
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal membuat role')
    } finally {
      setLoading(false)
    }
  }

  // Toggle User Active Status
  const handleToggleUserActive = async (user: User) => {
    try {
      setLoading(true)
      const newStatus = !user.is_active
      await api.updateUser(user.id, { is_active: newStatus })
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal mengupdate status user')
    } finally {
      setLoading(false)
    }
  }

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm(lang === 'id' ? 'Hapus / Nonaktifkan user ini?' : 'Deactivate this user?')) return
    try {
      setLoading(true)
      await api.deleteUser(userId)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus user')
    } finally {
      setLoading(false)
    }
  }

  // Save Role Menu Permissions
  const handleSaveRoleMenus = async (roleId: number) => {
    const menus = roleMenuMap[roleId] || []
    try {
      setLoading(true)
      await api.updateRole(roleId, menus)
      alert(lang === 'id' ? 'Hak akses menu berhasil disimpan!' : 'Role menu permissions saved!')
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan akses role')
    } finally {
      setLoading(false)
    }
  }

  // Toggle Menu in roleMenuMap
  const toggleRoleMenu = (roleId: number, menuKey: string) => {
    const current = roleMenuMap[roleId] || []
    if (current.includes(menuKey)) {
      setRoleMenuMap({
        ...roleMenuMap,
        [roleId]: current.filter((m) => m !== menuKey),
      })
    } else {
      setRoleMenuMap({
        ...roleMenuMap,
        [roleId]: [...current, menuKey],
      })
    }
  }

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!logoFile) return
    try {
      setUploadingLogo(true)
      const logoURL = await api.uploadLogo(logoFile)
      setSystemSettings({ ...systemSettings, header_logo: logoURL })
      setLogoPreview(logoURL)
      alert(lang === 'id' ? 'Logo header berhasil diunggah!' : 'Header logo uploaded successfully!')
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0)
  }

  // Open Edit Staff Profile Modal (HR / Admin)
  const openEditStaffModal = (u: User) => {
    setEditingStaff(u)
    setStaffFullName(u.full_name || '')
    setStaffEmail(u.email || '')
    setStaffPhone(u.phone || '')
    setStaffRoleId(u.role_id || u.role?.id || 4)
    setStaffSpecialization(u.specialization || '')
    setStaffSkills(u.skills || '')
    setStaffSchedule(u.work_schedule || 'Senin - Sabtu (08:00 - 17:00)')
    setStaffJoinDate(u.join_date || '2024-01-15')
    setStaffAddress(u.address || '')
    setStaffBio(u.bio || '')
    setStaffAvatarFile(null)
  }

  const handleSaveStaffProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStaff) return
    try {
      setLoading(true)
      await api.updateUser(editingStaff.id, {
        full_name: staffFullName,
        email: staffEmail,
        phone: staffPhone,
        role_id: Number(staffRoleId),
        specialization: staffSpecialization,
        skills: staffSkills,
        work_schedule: staffSchedule,
        join_date: staffJoinDate,
        address: staffAddress,
        bio: staffBio,
      })
      if (staffAvatarFile) {
        await api.uploadUserAvatar(editingStaff.id, staffAvatarFile)
      }
      alert('Profil tekniker/staf berhasil diperbarui!')
      setEditingStaff(null)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui profil staf')
    } finally {
      setLoading(false)
    }
  }

  // Save Logged-In User's Own Profile ("Profil Saya")
  const handleSaveMyProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const payload: Record<string, any> = {
        full_name: myFullName,
        email: myEmail,
        phone: myPhone,
        specialization: mySpecialization,
        skills: mySkills,
        work_schedule: mySchedule,
        join_date: myJoinDate,
        address: myAddress,
        bio: myBio,
      }
      if (myNewPassword && myNewPassword.trim().length > 0) {
        payload.password = myNewPassword.trim()
      }
      const updated = await api.updateMyProfile(payload)
      setCurrentUser(updated)
      setMyNewPassword('')
      alert('Profil Anda berhasil disimpan!')
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan profil')
    } finally {
      setLoading(false)
    }
  }

  // Upload Logged-In User's Avatar Image
  const handleMyAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    try {
      setUploadingAvatar(true)
      const updated = await api.uploadMyAvatar(file)
      setCurrentUser(updated)
      await loadInitialData()
      alert('Foto profil berhasil diperbarui!')
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah foto profil')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Open Attendance & Overtime Modal
  const openCreateAttendanceModal = (defaultUserId?: string) => {
    setAttUserId(defaultUserId || currentUser?.id || usersList[0]?.id || '')
    setAttDate(new Date().toISOString().split('T')[0])
    setAttShift(currentUser?.work_schedule || 'Shift Pagi (08:00 - 17:00)')
    setAttCheckIn('08:00')
    setAttCheckOut('17:00')
    setAttStatus('HADIR')
    setAttOvertimeHours(0)
    setAttOvertimeNotes('')
    setShowAttendanceModal(true)
  }

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.saveAttendance({
        user_id: attUserId || currentUser?.id,
        attendance_date: attDate,
        shift_schedule: attShift,
        check_in: attCheckIn,
        check_out: attCheckOut,
        status: attStatus,
        overtime_hours: Number(attOvertimeHours),
        overtime_notes: attOvertimeNotes,
      })
      alert('Data absensi & lembur berhasil disimpan!')
      setShowAttendanceModal(false)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data absensi')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickCheckInToday = async (targetUserId?: string) => {
    try {
      setLoading(true)
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      await api.saveAttendance({
        user_id: targetUserId || currentUser?.id,
        attendance_date: now.toISOString().split('T')[0],
        shift_schedule: currentUser?.work_schedule || 'Shift Produksi (08:00 - 17:00)',
        check_in: `${hh}:${mm}`,
        check_out: '17:00',
        status: 'HADIR',
        overtime_hours: 0,
        overtime_notes: 'Check-in kehadiran harian otomatis',
      })
      alert('Presensi hadir hari ini berhasil dicatat!')
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal mencatat presensi')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAttendance = async (id: string) => {
    if (!confirm('Hapus catatan absensi ini?')) return
    try {
      setLoading(true)
      await api.deleteAttendance(id)
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus absensi')
    } finally {
      setLoading(false)
    }
  }

  // All available system menus for Role Management setup
  const allSystemMenus = [
    { key: 'dashboard', label: t.navDashboard },
    { key: 'orders', label: t.navOrders },
    { key: 'new_order', label: t.navNewOrder },
    { key: 'customers', label: t.navCustomers },
    { key: 'hr', label: t.navHr },
    { key: 'inventory', label: t.navInventory },
    { key: 'approvals', label: t.navApprovals },
    { key: 'finance', label: t.navFinance },
    { key: 'settings', label: t.navSettings },
  ]

  // If not authenticated, render Login Card with Super Admin Quick Button
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme === 'dark' ? '#0b0f19' : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: '20px' }}>
        <div style={{ background: 'var(--bg-card)', width: '100%', maxWidth: '460px', borderRadius: '20px', padding: '40px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-light)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '16px' }}>
              <Stethoscope size={36} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{t.brandName}</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>{t.brandTagline}</p>
          </div>

          {loginError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={18} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>{t.username}</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder={tr('Username akun lab', 'Lab account username')}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid var(--border-light)', fontSize: '14px', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>{t.password}</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder={t.password}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid var(--border-light)', fontSize: '14px', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', background: 'var(--primary)', color: '#ffffff', fontWeight: 700, fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : t.loginButton}
            </button>
          </form>

          {/* Quick Demo Fill Buttons including Super Admin */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.quickDemoLabel}</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
              {[
                { label: tr('🛡️ Super Admin (Full Access)', '🛡️ Super Admin (Full Access)'), u: 'superadmin' },
                { label: tr('👑 Owner (Pemilik)', '👑 Owner (Lab Owner)'), u: 'owner' },
                { label: tr('🩺 Admin (Asisten Lab)', '🩺 Admin (Lab Assistant)'), u: 'admin' },
                { label: tr('🔬 Teknisi Gigi', '🔬 Dental Technician'), u: 'teknisi1' },
                { label: tr('💳 Kasir / Finance', '💳 Cashier / Finance'), u: 'kasir' },
              ].map((acc) => (
                <button
                  key={acc.u}
                  type="button"
                  onClick={() => {
                    setLoginUsername(acc.u)
                    setLoginPassword('admin12345')
                  }}
                  style={{ padding: '8px', fontSize: '11px', background: acc.u === 'superadmin' ? '#f0fdf4' : 'var(--bg-surface)', border: acc.u === 'superadmin' ? '1.5px solid #86efac' : '1px solid var(--border-light)', borderRadius: '8px', color: acc.u === 'superadmin' ? '#166534' : 'var(--text-main)', fontWeight: 700 }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Header Logo Component
  const headerLogoSrc = systemSettings['header_logo'] || ''

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Mobile Hamburger Button */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {headerLogoSrc ? (
            <img
              src={headerLogoSrc}
              alt="Lab Logo"
              style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '10px' }}
            />
          ) : (
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
              <Stethoscope size={22} />
            </div>
          )}
          <div>
            <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {systemSettings['app_name'] || t.brandName} <span style={{ fontSize: '10px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>v1.1</span>
            </span>
            <span className="hide-on-mobile" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{systemSettings['lab_name'] || t.brandTagline}</span>
          </div>
        </div>

        {/* Action Controls & User Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          {/* Quick Mobile / Web Status Update Button */}
          <button
            type="button"
            onClick={() => setShowQuickMobileModal(true)}
            title={tr('Akses Cepat Web/Mobile: Update Status Produksi dari Mana Saja', 'Quick Web/Mobile Access: Update Production Status from Anywhere')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <Smartphone size={15} />
            <span className="hide-on-mobile">{tr('Status Cepat', 'Quick Status')}</span>
          </button>

          {/* Auto Notification Bell (Keterlambatan Produksi, Stok Menipis, Invoice Jatuh Tempo) */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              title={tr('Notifikasi Otomatis (Keterlambatan Produksi, Stok Menipis, Invoice Jatuh Tempo)', 'Auto Notifications (Production Delay, Low Stock, Overdue Invoice)')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: showNotifPanel ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-main)',
                border: showNotifPanel ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                position: 'relative',
              }}
            >
              <Bell size={16} />
              {(dashboard?.auto_alerts?.length || 0) > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    border: '2px solid var(--bg-card)',
                  }}
                >
                  {dashboard?.auto_alerts?.length}
                </span>
              )}
            </button>

            {/* Dropdown Panel Notifikasi Otomatis */}
            {showNotifPanel && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  width: '360px',
                  maxWidth: '90vw',
                  maxHeight: '460px',
                  overflowY: 'auto',
                  background: 'var(--bg-card)',
                  borderRadius: '14px',
                  border: '1px solid var(--border-light)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                  zIndex: 999,
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>
                      🔔 {tr('Notifikasi Peringatan Otomatis', 'Automatic Warning Notifications')}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {tr('Keterlambatan Produksi, Stok Menipis & Invoice Jatuh Tempo', 'Production Delay, Low Stock & Overdue Invoices')}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNotifPanel(false)}
                    style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', background: 'transparent' }}
                  >
                    ✕
                  </button>
                </div>

                {(dashboard?.auto_alerts || []).length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    ✅ {tr('Seluruh produksi, stok bahan, dan tagihan dalam kondisi aman.', 'All production orders, material stock, and invoices are in good standing.')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(dashboard?.auto_alerts || []).map((al) => (
                      <div
                        key={al.id}
                        onClick={() => {
                          setShowNotifPanel(false)
                          setActiveTab(al.target_tab as any)
                        }}
                        style={{
                          cursor: 'pointer',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background:
                            al.category === 'LATE_PRODUCTION'
                              ? '#fff7ed'
                              : al.category === 'LOW_STOCK'
                              ? '#fef2f2'
                              : '#eff6ff',
                          border:
                            al.category === 'LATE_PRODUCTION'
                              ? '1px solid #fed7aa'
                              : al.category === 'LOW_STOCK'
                              ? '1px solid #fecaca'
                              : '1px solid #bfdbfe',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: al.severity === 'CRITICAL' ? '#dc2626' : '#d97706',
                              color: '#ffffff',
                            }}
                          >
                            {al.category === 'LATE_PRODUCTION'
                              ? tr('⏰ PRODUKSI', '⏰ PRODUCTION')
                              : al.category === 'LOW_STOCK'
                              ? tr('📦 STOK MENIPIS', '📦 LOW STOCK')
                              : tr('🧾 INVOICE', '🧾 INVOICE')}
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary)' }}>{tr('Buka Modul →', 'Open Module →')}</span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>{al.title}</div>
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{al.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Night Mode Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? t.darkMode : t.lightMode}
            style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#f59e0b" />}
          </button>

          {/* Language Toggle (ID / EN) */}
          <button
            onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            title="Ubah Bahasa / Switch Language"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', background: 'var(--bg-surface)', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', border: '1px solid var(--border-light)' }}
          >
            <Globe size={15} />
            <span>{lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
          </button>

          {/* New SPK Button (Only if user has access to new_order) */}
          {allowedMenus.includes('new_order') && (
            <button
              onClick={() => {
                setActiveTab('new_order')
                setMobileMenuOpen(false)
              }}
              className="hide-on-mobile"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#ffffff', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)' }}
            >
              <Plus size={16} /> {t.newSpkBtn}
            </button>
          )}

          {/* Current User Pill (Clickable -> Opens "Profil Saya") */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile')
              setMobileMenuOpen(false)
            }}
            title={tr('Klik untuk melihat & edit Profil Saya', 'Click to view & edit My Profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              background: activeTab === 'profile' ? 'var(--primary-subtle)' : 'var(--bg-surface)',
              borderRadius: '10px',
              border: activeTab === 'profile' ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid var(--primary)' }}
              />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isSuperAdmin ? '#10b981' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', color: '#ffffff' }}>
                {(currentUser.full_name || currentUser.username || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="hide-on-mobile">
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{currentUser.full_name}</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: isSuperAdmin ? '#10b981' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{currentUser.role?.name || 'STAFF'}</span>
                <span style={{ color: 'var(--text-subtle)' }}>• {tr('Profil', 'Profile')}</span>
              </div>
            </div>
          </button>

          <button onClick={handleLogout} title={t.logout} style={{ color: 'var(--text-subtle)', padding: '6px', borderRadius: '6px' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Super Admin Notice Bar with Multi-Tenant Switcher */}
      {isSuperAdmin && (
        <div style={{ background: '#ecfdf5', borderBottom: '1px solid #a7f3d0', color: '#065f46', padding: '8px 20px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} />
            <span>{t.settingsOnlyNotice}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>
              🏢 {tr('Context Tenant:', 'Tenant Context:')}
            </span>
            <select
              value={selectedTenantFilter}
              onChange={(e) => setSelectedTenantFilter(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #6ee7b7',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#065f46',
                cursor: 'pointer',
              }}
            >
              <option value="">{tr('🌐 Semua Tenant (Global Multi-Tenant)', '🌐 All Tenants (Global Multi-Tenant)')}</option>
              {tenantsList.map((tn) => (
                <option key={tn.id} value={tn.id}>
                  🏢 {tn.name} ({tn.code})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setActiveTab('settings')
                setSettingsSubTab('tenants')
              }}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <Building2 size={13} />
              <span>{tr('Setup Tenant', 'Setup Tenant')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="app-main-layout">
        {/* Backdrop for mobile */}
        <div
          className={`sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Sidebar Nav */}
        <aside className={`app-sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
          {[
            { id: 'dashboard', label: t.navDashboard, icon: TrendingUp },
            { id: 'orders', label: t.navOrders, icon: ClipboardList },
            { id: 'new_order', label: t.navNewOrder, icon: Plus },
            { id: 'customers', label: t.navCustomers, icon: Stethoscope },
            { id: 'hr', label: t.navHr, icon: Users },
            { id: 'inventory', label: t.navInventory, icon: Package, badge: inventoryItems.filter((i) => i.current_stock <= i.min_stock_level).length },
            { id: 'approvals', label: t.navApprovals, icon: ShieldCheck, badge: purchaseRequests.filter((p) => p.status === 'PENDING_APPROVAL').length },
            { id: 'finance', label: t.navFinance, icon: DollarSign },
            { id: 'profile', label: t.navProfile, icon: Activity },
            { id: 'settings', label: t.navSettings, icon: SettingsIcon },
          ]
            .filter((item) => allowedMenus.includes(item.id))
            .map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any)
                    setMobileMenuOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    background: isActive ? 'var(--primary-subtle)' : 'transparent',
                    border: isActive ? '1px solid var(--primary-light)' : '1px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-subtle)'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '999px' }}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              )
            })}
        </aside>

        {/* Main Content Area */}
        <main className="app-content">
          {/* TAB: DASHBOARD & LAPORAN VISUALISASI DATA */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {tr('Dashboard & Laporan Visualisasi Operasional Lab', 'Lab Operations Dashboard & Visual Analytics Report')}
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {tr(
                      'Grafik produksi mingguan/bulanan, top customer & top product, analisis biaya produksi vs pendapatan, serta notifikasi otomatis keterlambatan produksi, stok menipis & invoice jatuh tempo.',
                      'Weekly/monthly production charts, top customers & top products, production cost vs revenue analysis, and automated alerts for late production, low stock & overdue invoices.'
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowQuickMobileModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1.5px solid #059669',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <Smartphone size={15} /> {tr('Update Status Cepat (Web/Mobile)', 'Quick Status Update (Web/Mobile)')}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('settings')
                      setSettingsSubTab('security_logs')
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#f5f3ff',
                      color: '#6d28d9',
                      border: '1.5px solid #6d28d9',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <ShieldCheck size={15} /> {tr('Log Aktivitas Pengguna', 'User Activity Logs')} ({activitySummary?.total_logs || 0})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('settings')
                      setSettingsSubTab('backup')
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'var(--bg-card)',
                      color: 'var(--primary)',
                      border: '1.5px solid var(--primary)',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <Database size={15} /> {tr('Backup Data & Akses Multi-Role', 'Data Backup & Multi-Role Access')}
                  </button>
                </div>
              </div>

              {/* 4 KPI Utama */}
              <div className="grid-stats">
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{t.activeOrders}</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>{dashboard?.active_orders_count || 0}</div>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                    {tr('Selesai Bulan Ini', 'Completed This Month')}: {dashboard?.completed_this_month || 0} SPK
                  </span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{t.qcPending}</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#d97706' }}>{dashboard?.qc_pending_count || 0}</div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {tr('Deadline / Terlambat', 'Deadline / Overdue')}: <strong style={{ color: '#dc2626' }}>{dashboard?.late_orders_count || 0} SPK</strong>
                  </span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{t.revenueMonth}</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>{formatRupiah(dashboard?.total_revenue_month || 0)}</div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {tr('Laba Bersih', 'Net Profit')}: <strong style={{ color: '#059669' }}>{formatRupiah(dashboard?.net_operating_income || 0)}</strong>
                  </span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{t.receivables}</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertCircle size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}>{formatRupiah(dashboard?.total_receivables || 0)}</div>
                  <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>
                    {dashboard?.overdue_invoices_count || 0} {tr('Invoice Belum Lunas', 'Unpaid Invoices')} • {dashboard?.low_stock_count || 0} {tr('Stok Menipis', 'Low Stock')}
                  </span>
                </div>
              </div>

              {/* BAGIAN 1: NOTIFIKASI OTOMATIS (KETERLAMBATAN PRODUKSI, STOK MENIPIS, INVOICE JATUH TEMPO) */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-light)',
                  padding: '20px',
                  marginBottom: '24px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🔔 {tr('Pusat Notifikasi Otomatis (Early Warning System)', 'Automated Notification Center (Early Warning System)')}
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: '#fee2e2',
                          color: '#dc2626',
                        }}
                      >
                        {(dashboard?.auto_alerts || []).length} {tr('Peringatan Aktif', 'Active Alerts')}
                      </span>
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {tr(
                        'Deteksi otomatis keterlambatan produksi SPK, stok bahan menipis di bawah batas minimum, dan tagihan invoice jatuh tempo.',
                        'Automatic detection of delayed SPK production orders, material stock below minimum threshold, and overdue invoices.'
                      )}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'ALL', label: `${tr('Semua', 'All')} (${(dashboard?.auto_alerts || []).length})` },
                      {
                        key: 'LATE_PRODUCTION',
                        label: `⏰ ${tr('Keterlambatan Produksi', 'Production Delays')} (${(dashboard?.auto_alerts || []).filter((a) => a.category === 'LATE_PRODUCTION').length})`,
                      },
                      {
                        key: 'LOW_STOCK',
                        label: `📦 ${tr('Stok Menipis', 'Low Stock')} (${(dashboard?.auto_alerts || []).filter((a) => a.category === 'LOW_STOCK').length})`,
                      },
                      {
                        key: 'OVERDUE_INVOICE',
                        label: `🧾 ${tr('Invoice Jatuh Tempo', 'Overdue Invoices')} (${(dashboard?.auto_alerts || []).filter((a) => a.category === 'OVERDUE_INVOICE').length})`,
                      },
                    ].map((flt) => (
                      <button
                        key={flt.key}
                        onClick={() => setDashAlertFilter(flt.key as any)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: dashAlertFilter === flt.key ? 'var(--primary)' : 'var(--bg-surface)',
                          color: dashAlertFilter === flt.key ? '#ffffff' : 'var(--text-muted)',
                          border: dashAlertFilter === flt.key ? 'none' : '1px solid var(--border-light)',
                        }}
                      >
                        {flt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const alerts = (dashboard?.auto_alerts || []).filter((a) =>
                    dashAlertFilter === 'ALL' ? true : a.category === dashAlertFilter
                  )
                  if (alerts.length === 0) {
                    return (
                      <div style={{ padding: '18px', borderRadius: '10px', background: '#ecfdf5', color: '#065f46', fontSize: '13px', fontWeight: 700 }}>
                        ✓ {tr('Tidak ada peringatan pada kategori ini. Seluruh indikator operasional berjalan normal.', 'No warnings in this category. All operational indicators are running normally.')}
                      </div>
                    )
                  }
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '12px' }}>
                      {alerts.map((al) => (
                        <div
                          key={al.id}
                          style={{
                            padding: '14px',
                            borderRadius: '12px',
                            background:
                              al.category === 'LATE_PRODUCTION'
                                ? '#fff7ed'
                                : al.category === 'LOW_STOCK'
                                ? '#fef2f2'
                                : '#eff6ff',
                            border:
                              al.category === 'LATE_PRODUCTION'
                                ? '1px solid #fed7aa'
                                : al.category === 'LOW_STOCK'
                                ? '1px solid #fecaca'
                                : '1px solid #bfdbfe',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '8px',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  padding: '3px 8px',
                                  borderRadius: '999px',
                                  background:
                                    al.category === 'LATE_PRODUCTION'
                                      ? '#ea580c'
                                      : al.category === 'LOW_STOCK'
                                      ? '#dc2626'
                                      : '#2563eb',
                                  color: '#ffffff',
                                }}
                              >
                                {al.category === 'LATE_PRODUCTION'
                                  ? tr('⏰ KETERLAMBATAN / DEADLINE PRODUKSI', '⏰ PRODUCTION DELAY / DEADLINE')
                                  : al.category === 'LOW_STOCK'
                                  ? tr('📦 STOK BAHAN MENIPIS', '📦 LOW MATERIAL STOCK')
                                  : tr('🧾 INVOICE JATUH TEMPO / BELUM LUNAS', '🧾 OVERDUE / UNPAID INVOICE')}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>{al.reference_code}</span>
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{al.title}</div>
                            <div style={{ fontSize: '12px', color: '#334155', marginTop: '3px' }}>{al.description}</div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                            <button
                              onClick={() => {
                                if (al.category === 'LATE_PRODUCTION') {
                                  const ord = orders.find((o) => o.id === al.reference_id || o.order_number === al.reference_code)
                                  if (ord) setSelectedOrder(ord)
                                  setActiveTab('orders')
                                } else if (al.category === 'LOW_STOCK') {
                                  setActiveTab('inventory')
                                } else {
                                  setActiveTab('finance')
                                  setFinSubTab('invoices')
                                }
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: '#0f172a',
                                color: '#ffffff',
                              }}
                            >
                              {al.category === 'LATE_PRODUCTION'
                                ? tr('🔍 Pantau & Update SPK →', '🔍 Inspect & Update SPK →')
                                : al.category === 'LOW_STOCK'
                                ? tr('📦 Cek & Tambah Stok →', '📦 Check & Restock →')
                                : tr('💳 Tagih / Catat Bayar →', '💳 Collect / Record Payment →')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>

              {/* BAGIAN 2: VISUALISASI DATA — GRAFIK PRODUKSI (MINGGUAN/BULANAN) & ANALISIS BIAYA VS PENDAPATAN */}
              <div className="grid-2col" style={{ gap: '20px', marginBottom: '24px' }}>
                {/* Grafik Produksi: Jumlah Order per Minggu / Bulan */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                        📈 {tr('Grafik Produksi (Jumlah Order)', 'Production Volume Chart (Orders)')}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tr('Visualisasi volume SPK masuk vs selesai QC per minggu & bulan.', 'Visualizing incoming SPK orders vs QC-completed orders weekly & monthly.')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <button
                        onClick={() => setDashChartMode('weekly')}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: dashChartMode === 'weekly' ? 'var(--primary)' : 'transparent',
                          color: dashChartMode === 'weekly' ? '#ffffff' : 'var(--text-muted)',
                        }}
                      >
                        📅 {tr('Per Minggu', 'Weekly')}
                      </button>
                      <button
                        onClick={() => setDashChartMode('monthly')}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: dashChartMode === 'monthly' ? 'var(--primary)' : 'transparent',
                          color: dashChartMode === 'monthly' ? '#ffffff' : 'var(--text-muted)',
                        }}
                      >
                        🗓️ {tr('Per Bulan', 'Monthly')}
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const chartData =
                      dashChartMode === 'weekly'
                        ? dashboard?.weekly_production || []
                        : dashboard?.monthly_production || []
                    const maxOrders = Math.max(...chartData.map((d) => d.total_orders), 4)

                    return (
                      <div>
                        {/* Visual Bar Chart */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${Math.max(chartData.length, 1)}, 1fr)`,
                            gap: '10px',
                            alignItems: 'end',
                            height: '180px',
                            padding: '16px 10px 8px 10px',
                            background: 'var(--bg-surface)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-light)',
                            marginBottom: '12px',
                          }}
                        >
                          {chartData.map((item) => {
                            const totalHeightPct = Math.max(Math.round((item.total_orders / maxOrders) * 100), item.total_orders > 0 ? 22 : 8)
                            const compHeightPct = Math.max(Math.round((item.completed_orders / maxOrders) * 100), item.completed_orders > 0 ? 16 : 4)
                            return (
                              <div
                                key={item.period}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  height: '100%',
                                  justifyContent: 'flex-end',
                                }}
                              >
                                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                                  {item.total_orders} SPK
                                </div>
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '115px', width: '100%', justifyContent: 'center' }}>
                                  <div
                                    title={`${tr('Total Order', 'Total Orders')}: ${item.total_orders} SPK`}
                                    style={{
                                      width: '18px',
                                      height: `${totalHeightPct}%`,
                                      background: 'linear-gradient(180deg, #0284c7 0%, #38bdf8 100%)',
                                      borderRadius: '6px 6px 2px 2px',
                                    }}
                                  />
                                  <div
                                    title={`${tr('Selesai QC', 'Completed QC')}: ${item.completed_orders} SPK`}
                                    style={{
                                      width: '18px',
                                      height: `${compHeightPct}%`,
                                      background: 'linear-gradient(180deg, #059669 0%, #34d399 100%)',
                                      borderRadius: '6px 6px 2px 2px',
                                    }}
                                  />
                                </div>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center', lineHeight: 1.2 }}>
                                  {item.period}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Legend & Summary */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '14px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
                              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#0284c7', display: 'inline-block' }} />
                              {tr('Total Order Masuk', 'Total Incoming Orders')}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
                              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#059669', display: 'inline-block' }} />
                              {tr('Selesai Produksi & QC', 'Completed Production & QC')}
                            </span>
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                            {tr('Total Volume', 'Total Volume')}: {orders.length} SPK ({formatRupiah(orders.reduce((s, o) => s + o.total_price, 0))})
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Analisis Biaya Produksi dan Pendapatan */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                        💰 {tr('Analisis Biaya Produksi & Pendapatan', 'Production Cost & Revenue Analysis')}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tr(
                          'Perbandingan Pendapatan (Omzet) terhadap Biaya Bahan, Tenaga Kerja, Operasional & Laba.',
                          'Comparison of Revenue against Raw Materials, Labor, Operational Costs & Gross Profit.'
                        )}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background: '#dcfce7',
                        color: '#15803d',
                      }}
                    >
                      {tr('Margin Kotor', 'Gross Margin')}: {dashboard?.cost_vs_revenue?.profit_margin_pct ?? 48}%
                    </span>
                  </div>

                  {(() => {
                    const cvr = dashboard?.cost_vs_revenue || {
                      total_revenue: dashboard?.total_revenue_month || 1620000,
                      paid_revenue: 0,
                      material_cost: 850000,
                      labor_cost: 650000,
                      operational_cost: 320000,
                      total_cost: 1820000,
                      gross_profit: 120000,
                      net_profit: -200000,
                      profit_margin_pct: 7.4,
                    }
                    const baseMax = Math.max(cvr.total_revenue, cvr.total_cost, 1)
                    const bars = [
                      { label: tr('Pendapatan / Omzet Penjualan', 'Sales Revenue / Turnover'), val: cvr.total_revenue, color: '#0284c7', bg: '#e0f2fe' },
                      { label: tr('Biaya Bahan Produksi (RAW_MATERIAL)', 'Production Material Cost (RAW_MATERIAL)'), val: cvr.material_cost, color: '#ea580c', bg: '#ffedd5' },
                      { label: tr('Biaya Tenaga Kerja (LABOR)', 'Technician Labor Cost (LABOR)'), val: cvr.labor_cost, color: '#d97706', bg: '#fef3c7' },
                      { label: tr('Biaya Operasional (OPERATIONAL)', 'Operational Cost (OPERATIONAL)'), val: cvr.operational_cost, color: '#7c3aed', bg: '#f3e8ff' },
                      { label: tr('Laba Kotor (Gross Profit)', 'Gross Profit'), val: Math.max(cvr.gross_profit, 0), color: '#059669', bg: '#dcfce7' },
                    ]

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {bars.map((b) => {
                          const pct = Math.min(Math.max(Math.round((b.val / baseMax) * 100), 6), 100)
                          return (
                            <div key={b.label}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{b.label}</span>
                                <span style={{ fontWeight: 800, color: b.color }}>{formatRupiah(b.val)}</span>
                              </div>
                              <div style={{ width: '100%', height: '10px', borderRadius: '999px', background: 'var(--bg-surface)', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', borderRadius: '999px', background: b.color }} />
                              </div>
                            </div>
                          )
                        })}

                        <div
                          style={{
                            marginTop: '6px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12px',
                          }}
                        >
                          <span>
                            {tr('Total Biaya Produksi & Ops', 'Total Production & Ops Cost')}: <strong style={{ color: '#dc2626' }}>{formatRupiah(cvr.total_cost)}</strong>
                          </span>
                          <button
                            onClick={() => {
                              setActiveTab('finance')
                              setFinSubTab('sales_report')
                            }}
                            style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', background: 'transparent' }}
                          >
                            {tr('Buka Laporan Keuangan Lengkap →', 'Open Full Financial Report →')}
                          </button>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* BAGIAN 3: TOP CUSTOMER (DOKTER/KLINIK) & TOP PRODUCT (JENIS GIGI TIRUAN) */}
              <div className="grid-2col" style={{ gap: '20px', marginBottom: '24px' }}>
                {/* Top Customer */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                        🏆 {tr('Top Customer (Dokter / Klinik)', 'Top Customers (Doctors / Clinics)')}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tr('Pelanggan dengan frekuensi order & kontribusi omzet tertinggi.', 'Customers with the highest order frequency & revenue contribution.')}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('customers')}
                      style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', background: 'transparent' }}
                    >
                      {tr('Semua Dokter →', 'All Doctors →')}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(dashboard?.top_customers || []).map((tc, idx) => (
                      <div
                        key={tc.customer_id}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '8px',
                              background: idx === 0 ? '#fef3c7' : 'var(--primary-light)',
                              color: idx === 0 ? '#d97706' : 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '13px',
                            }}
                          >
                            #{idx + 1}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>{tc.doctor_name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {tc.clinic_name || tr('Klinik Mitra', 'Partner Clinic')} •{' '}
                              <span style={{ color: '#7c3aed', fontWeight: 700 }}>{tc.loyalty_tier || 'GOLD'}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>
                            {tc.total_orders} {tr('Order SPK', 'SPK Orders')}
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>
                            {formatRupiah(tc.total_revenue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Product */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                        🦷 {tr('Top Product (Jenis Gigi Tiruan Terlaris)', 'Top Products (Best-Selling Prosthetics)')}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tr('Distribusi jenis restorasi gigi palsu paling banyak dipesan.', 'Distribution of the most frequently ordered dental restorations.')}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', background: 'transparent' }}
                    >
                      {tr('Lihat SPK →', 'View SPK →')}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(dashboard?.top_products || []).map((tp, idx) => (
                      <div
                        key={tp.denture_type_id || idx}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-light)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>
                              #{idx + 1} {tp.product_name}
                            </span>
                            {tp.category && (
                              <span
                                style={{
                                  marginLeft: '6px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  background: 'var(--primary-light)',
                                  color: 'var(--primary)',
                                }}
                              >
                                {tp.category}
                              </span>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>
                              {tp.total_orders} SPK ({tp.percentage}%)
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', marginLeft: '8px' }}>
                              {formatRupiah(tp.total_revenue)}
                            </span>
                          </div>
                        </div>
                        <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'var(--border-light)', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.max(tp.percentage, 12)}%`,
                              height: '100%',
                              borderRadius: '999px',
                              background: 'linear-gradient(90deg, #0284c7 0%, #0d9488 100%)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders List */}
              <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{t.recentOrdersTitle}</h3>
                  <button onClick={() => setActiveTab('orders')} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
                    {t.viewAllSpk}
                  </button>
                </div>

                <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 12px' }}>{t.colSpk}</th>
                        <th style={{ padding: '10px 12px' }}>{t.colPatient}</th>
                        <th style={{ padding: '10px 12px' }}>{t.colDoctor}</th>
                        <th style={{ padding: '10px 12px' }}>{t.colDentureType}</th>
                        <th style={{ padding: '10px 12px' }}>{t.colStage}</th>
                        <th style={{ padding: '10px 12px' }}>{t.colDueDate}</th>
                        <th style={{ padding: '10px 12px' }}>{t.colActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{o.order_number}</td>
                          <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                            {o.patient_name}
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{tr('Warna', 'Shade')}: {o.shade_guide}</span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 600 }}>{o.customer?.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.customer?.clinic_name}</div>
                          </td>
                          <td style={{ padding: '12px' }}>{o.denture_type?.name}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                              {o.current_stage_name || o.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                            {new Date(o.promised_due_date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button
                              onClick={() => {
                                setSelectedOrder(o)
                                setActiveTab('orders')
                              }}
                              style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}
                            >
                              {t.detail}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS (Super Admin & Owner Setup Segment + Akses Online & Backup Data) */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {tr('Pengaturan Sistem, Akses Multi-User & Backup Data', 'System Settings, Multi-User Access & Data Backup')}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  {tr(
                    'Kelola login multi-user berbasis role (Owner, Admin, Teknisi, Kasir), akses cepat web/mobile, serta backup & restore data agar tidak hilang.',
                    'Manage role-based multi-user login (Owner, Admin, Technician, Cashier), quick web/mobile access, and database backup & restore.'
                  )}
                </p>
              </div>

              {/* Sub-tabs Navigation */}
              <div className="tabs-scroll-container" style={{ borderBottom: '1px solid var(--border-light)', marginBottom: '24px' }}>
                {[
                  ...(isSuperAdmin
                    ? [{ id: 'tenants', label: `🏢 ${t.tabTenants} (${tenantsList.length})`, icon: Building2 }]
                    : []),
                  { id: 'users', label: t.tabUsers, icon: Users },
                  { id: 'roles', label: t.tabRoles, icon: ShieldCheck },
                  { id: 'security_logs', label: `🛡️ ${tr('Modul Keamanan & Log Aktivitas', 'Security & Activity Audit Logs')} (${activitySummary?.total_logs || 0})`, icon: Activity },
                  { id: 'backup', label: `☁️ ${tr('Akses Online & Backup Data', 'Online Access & Data Backup')}`, icon: Database },
                  { id: 'appearance', label: t.tabAppearance, icon: Upload },
                ].map((st) => {
                  const Icon = st.icon
                  const isCurrent = settingsSubTab === st.id
                  return (
                    <button
                      key={st.id}
                      onClick={() => setSettingsSubTab(st.id as any)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 18px',
                        fontSize: '14px',
                        fontWeight: isCurrent ? 700 : 500,
                        color: isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: isCurrent ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                        background: 'transparent',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Icon size={16} />
                      <span>{st.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* SETTINGS SUB-TAB: MULTI-TENANT SETUP (SUPER ADMIN ONLY) */}
              {settingsSubTab === 'tenants' && isSuperAdmin && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={20} color="var(--primary)" />
                        <span>{tr('Setup & Manajemen Multi-Tenant Lab', 'Lab Multi-Tenant Setup & Management')}</span>
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {tr(
                          'Kelola isolasi data multi-tenant lab. Semua pengguna, SPK, dokter, dan keuangan terisolasi per tenant. Hanya Role yang bersifat global.',
                          'Manage multi-tenant lab data isolation. All users, orders, dentists, and finances are scoped per tenant. Only roles are global.'
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setNewTenantCode('')
                        setNewTenantName('')
                        setNewTenantAddress('')
                        setNewTenantPhone('')
                        setNewTenantEmail('')
                        setShowAddTenantModal(true)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--primary)',
                        color: '#ffffff',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                      }}
                    >
                      <Plus size={16} />
                      <span>{t.addTenantBtn}</span>
                    </button>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid-4col" style={{ gap: '14px', marginBottom: '24px' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{tr('Total Tenant Terdaftar', 'Total Registered Tenants')}</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{tenantsList.length}</div>
                      <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '2px' }}>{tr('Pusat & Cabang Lab', 'Main Lab & Branches')}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{tr('Tenant Berstatus Aktif', 'Active Tenants')}</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                        {tenantsList.filter((tn) => tn.is_active).length}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{tr('Operasional Berjalan', 'Operational')}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{tr('Total User Lintas Tenant', 'Total Users Across Tenants')}</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{usersList.length}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{tr('Diisolasi per Tenant', 'Isolated per Tenant')}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{tr('Total Role Global', 'Total Global Roles')}</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>{rolesList.length}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{tr('Dapat Dipakai Semua Tenant', 'Shared by All Tenants')}</div>
                    </div>
                  </div>

                  {/* Tenant List Table */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
                        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                        <input
                          type="text"
                          placeholder={tr('Cari kode, nama, atau kota tenant...', 'Search tenant code, name, or city...')}
                          value={tenantSearchQuery}
                          onChange={(e) => setTenantSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px 8px 34px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            fontSize: '13px',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-main)',
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tr('Menampilkan', 'Showing')} {tenantsList.filter((tn) => !tenantSearchQuery || tn.name.toLowerCase().includes(tenantSearchQuery.toLowerCase()) || tn.code.toLowerCase().includes(tenantSearchQuery.toLowerCase())).length} tenant
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '12px' }}>{t.tenantCode}</th>
                            <th style={{ padding: '12px' }}>{t.tenantName}</th>
                            <th style={{ padding: '12px' }}>{t.tenantAddress}</th>
                            <th style={{ padding: '12px' }}>{t.tenantPhone}</th>
                            <th style={{ padding: '12px' }}>{tr('Pengguna', 'Users')}</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>{t.colActions}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tenantsList
                            .filter((tn) => !tenantSearchQuery || tn.name.toLowerCase().includes(tenantSearchQuery.toLowerCase()) || tn.code.toLowerCase().includes(tenantSearchQuery.toLowerCase()))
                            .map((tn) => (
                              <tr key={tn.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '12px' }}>
                                  <span style={{ fontFamily: 'monospace', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, background: tn.code === 'main' ? '#dbeafe' : 'var(--bg-surface)', color: tn.code === 'main' ? '#1e40af' : 'var(--text-main)', border: '1px solid var(--border-light)' }}>
                                    {tn.code}
                                  </span>
                                  {tn.code === 'main' && (
                                    <span style={{ marginLeft: '6px', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#fef3c7', color: '#92400e' }}>
                                      PUSAT
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                                  <div>{tn.name}</div>
                                  {tn.email && <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>{tn.email}</div>}
                                </td>
                                <td style={{ padding: '12px', color: 'var(--text-muted)', maxWidth: '200px' }}>{tn.address || '-'}</td>
                                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{tn.phone || '-'}</td>
                                <td style={{ padding: '12px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '2px 8px', borderRadius: '999px' }}>
                                    {usersList.filter((u) => u.tenant_id === tn.id).length} {tr('User', 'Users')}
                                  </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: tn.is_active ? '#ecfdf5' : '#fee2e2', color: tn.is_active ? '#059669' : '#dc2626' }}>
                                    {tn.is_active ? t.active : t.inactive}
                                  </span>
                                </td>
                                <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingTenant(tn)
                                        setEditTenantName(tn.name)
                                        setEditTenantAddress(tn.address || '')
                                        setEditTenantPhone(tn.phone || '')
                                        setEditTenantEmail(tn.email || '')
                                        setEditTenantActive(tn.is_active)
                                      }}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        background: 'var(--primary-subtle)',
                                        color: 'var(--primary)',
                                        border: '1px solid var(--primary-light)',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      ✏️ {tr('Edit Data', 'Edit Details')}
                                    </button>
                                    {tn.code !== 'main' && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTenant(tn)}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          padding: '6px 12px',
                                          borderRadius: '8px',
                                          fontSize: '12px',
                                          fontWeight: 600,
                                          background: '#fee2e2',
                                          color: '#dc2626',
                                          border: '1px solid #fecaca',
                                          cursor: 'pointer',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        🗑️ {t.delete}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS SUB-TAB 1: USER MANAGEMENT */}
              {settingsSubTab === 'users' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{t.tabUsers}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {tr('Kelola data akun pengguna, role, dan hak login sistem yang diassign per tenant.', 'Manage user accounts, roles, and login privileges assigned per tenant.')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {isSuperAdmin && (
                        <select
                          value={selectedTenantFilter}
                          onChange={(e) => setSelectedTenantFilter(e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            fontSize: '13px',
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                          }}
                        >
                          <option value="">{tr('Semua Tenant', 'All Tenants')}</option>
                          {tenantsList.map((tn) => (
                            <option key={tn.id} value={tn.id}>
                              {tn.name}
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={() => setShowAddUserModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                      >
                        <UserPlus size={16} /> {t.addUserBtn}
                      </button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '12px' }}>Username</th>
                            <th style={{ padding: '12px' }}>{tr('Nama Lengkap', 'Full Name')}</th>
                            <th style={{ padding: '12px' }}>{t.tenantLabel}</th>
                            <th style={{ padding: '12px' }}>Email</th>
                            <th style={{ padding: '12px' }}>Role</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>{t.colActions}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersList
                            .filter((u) => !selectedTenantFilter || u.tenant_id === selectedTenantFilter)
                            .map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{u.username}</td>
                              <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{u.full_name}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}>
                                  🏢 {u.tenant?.name || (tenantsList.find((tn) => tn.id === u.tenant_id)?.name) || 'Main Dental Lab'}
                                </span>
                              </td>
                              <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{u.email || '-'}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: u.role?.name === 'SUPER_ADMIN' ? '#dcfce7' : 'var(--primary-light)', color: u.role?.name === 'SUPER_ADMIN' ? '#166534' : 'var(--primary)' }}>
                                  {u.role?.name}
                                </span>
                              </td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: u.is_active ? '#ecfdf5' : '#fee2e2', color: u.is_active ? '#059669' : '#dc2626' }}>
                                  {u.is_active ? t.active : t.inactive}
                                </span>
                              </td>
                              <td style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleToggleUserActive(u)}
                                    style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}
                                  >
                                    {u.is_active ? tr('Nonaktifkan', 'Deactivate') : tr('Aktifkan', 'Activate')}
                                  </button>
                                  {u.username !== 'owner' && u.username !== 'superadmin' && (
                                    <button
                                      onClick={() => handleDeleteUser(u.id)}
                                      style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: '#fee2e2', color: '#dc2626' }}
                                    >
                                      {t.delete}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS SUB-TAB 2: ROLE MANAGEMENT (MENU PERMISSIONS) */}
              {settingsSubTab === 'roles' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{t.tabRoles}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {tr('Atur menu yang dapat diakses oleh masing-masing role pengguna. Role bersifat global lintas seluruh tenant.', 'Manage menus accessible by each user role. Roles are globally shared across all tenants.')}
                      </p>
                    </div>
                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          setNewRoleName('')
                          setNewRoleDesc('')
                          setNewRoleMenus(['dashboard', 'orders'])
                          setShowAddRoleModal(true)
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                      >
                        <Plus size={16} /> {t.addRoleBtn}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {rolesList.map((r) => {
                      const currentSelected = roleMenuMap[r.id] || []
                      return (
                        <div key={r.id} style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>{r.name}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>— {r.description}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSaveRoleMenus(r.id)}
                              style={{ background: 'var(--primary)', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}
                            >
                              {t.saveChangesBtn}
                            </button>
                          </div>

                          {/* Menu Checkboxes */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                            {allSystemMenus.map((menu) => {
                              const checked = currentSelected.includes(menu.key)
                              return (
                                <label
                                  key={menu.key}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    background: checked ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                                    border: checked ? '1px solid var(--primary-light)' : '1px solid var(--border-light)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: checked ? 700 : 500,
                                    color: checked ? 'var(--primary)' : 'var(--text-main)',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleRoleMenu(r.id, menu.key)}
                                    style={{ cursor: 'pointer' }}
                                  />
                                  <span>{menu.label}</span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* SETTINGS SUB-TAB: MODUL KEAMANAN & LOG AKTIVITAS PENGGUNA (SIAPA YANG MENAMBAH/MENGUBAH DATA) */}
              {settingsSubTab === 'security_logs' && (
                <div className="animate-fade-in">
                  {/* 4 Kartu KPI Audit Keamanan */}
                  <div className="grid-kpi" style={{ marginBottom: '20px' }}>
                    <div
                      onClick={() => setAuditActionFilter('')}
                      style={{ cursor: 'pointer', background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
                    >
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        🛡️ {tr('Total Log Aktivitas Tercatat', 'Total Recorded Activity Logs')}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                        {activitySummary?.total_logs || 0} {tr('Aktivitas', 'Activities')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {tr('Pengguna aktif hari ini', 'Active users today')}: <strong>{activitySummary?.active_users_today || 1} {tr('Akun', 'Accounts')}</strong>
                      </div>
                    </div>

                    <div
                      onClick={() => setAuditActionFilter(auditActionFilter === 'CREATE' ? '' : 'CREATE')}
                      style={{
                        cursor: 'pointer',
                        background: 'var(--bg-card)',
                        padding: '18px',
                        borderRadius: '14px',
                        border: auditActionFilter === 'CREATE' ? '2px solid #059669' : '1px solid var(--border-light)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                        ➕ {tr('Menambah Data Baru (CREATE)', 'Create New Data (CREATE)')}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                        {activitySummary?.create_count || 0} {tr('Aksi', 'Actions')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {tr('Input SPK, Dokter/Pasien, Stok Masuk, Invoice & Biaya', 'SPK Intake, Doctor/Patient, Stock In, Invoice & Expenses')}
                      </div>
                    </div>

                    <div
                      onClick={() => setAuditActionFilter(auditActionFilter === 'UPDATE' ? '' : 'UPDATE')}
                      style={{
                        cursor: 'pointer',
                        background: 'var(--bg-card)',
                        padding: '18px',
                        borderRadius: '14px',
                        border: auditActionFilter === 'UPDATE' ? '2px solid #d97706' : '1px solid var(--border-light)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 700 }}>
                        ✏️ {tr('Mengubah Data & Status (UPDATE)', 'Update Data & Status (UPDATE)')}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                        {activitySummary?.update_count || 0} {tr('Aksi', 'Actions')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {tr('Update tahapan SPK, QC, PIC Teknis, Profil & Hak Role', 'Update SPK stages, QC, Technician PIC, Profile & Role Permissions')}
                      </div>
                    </div>

                    <div
                      onClick={() => setAuditActionFilter(auditActionFilter === 'LOGIN' ? '' : 'LOGIN')}
                      style={{
                        cursor: 'pointer',
                        background: 'var(--bg-card)',
                        padding: '18px',
                        borderRadius: '14px',
                        border: auditActionFilter === 'LOGIN' ? '2px solid #6d28d9' : '1px solid var(--border-light)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#6d28d9', fontWeight: 700 }}>
                        🔐 {tr('Sesi Login, Backup & Hapus Data', 'Login Sessions, Backup & Deletions')}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#6d28d9', marginTop: '4px' }}>
                        {(activitySummary?.login_count || 0) + (activitySummary?.delete_count || 0)} {tr('Aksi', 'Actions')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {tr('Login Multi-Role, Backup Database & Penghapusan Data', 'Multi-Role Logins, Database Backups & Data Deletions')}
                      </div>
                    </div>
                  </div>

                  {/* Tabel & Filter Audit Trail */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                          🛡️ {tr('Log Aktivitas Pengguna (Audit Trail: Siapa yang Menambah / Mengubah Data)', 'User Activity Audit Trail (Who Added / Modified Data)')}
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {tr(
                            'Setiap penambahan, perubahan, maupun penghapusan data di seluruh modul tercatat otomatis beserta nama pengguna, jabatan (role), waktu, dan rincian perubahannya.',
                            'Every creation, modification, or deletion across all modules is automatically logged with user identity, role, timestamp, and payload details.'
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => loadInitialData()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          background: 'var(--bg-surface)',
                          color: 'var(--primary)',
                          border: '1px solid var(--primary)',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        <RefreshCw size={14} /> {tr('Refresh Log Aktivitas', 'Refresh Activity Logs')}
                      </button>
                    </div>

                    {/* Filter Bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                      <input
                        type="text"
                        placeholder={tr('Cari nama user, SPK, Invoice, atau perubahan...', 'Search user, SPK, Invoice, or changes...')}
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          fontSize: '12px',
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                        }}
                      />

                      <select
                        value={auditActionFilter}
                        onChange={(e) => setAuditActionFilter(e.target.value)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                        }}
                      >
                        <option value="">{tr('Semua Jenis Aksi', 'All Action Types')}</option>
                        <option value="CREATE">➕ {tr('Menambah Data (CREATE)', 'Create Data (CREATE)')}</option>
                        <option value="UPDATE">✏️ {tr('Mengubah Data (UPDATE)', 'Update Data (UPDATE)')}</option>
                        <option value="DELETE">🗑️ {tr('Menghapus Data (DELETE)', 'Delete Data (DELETE)')}</option>
                        <option value="LOGIN">🔐 {tr('Login Sesi Pengguna', 'User Session Login')}</option>
                        <option value="BACKUP">💾 {tr('Backup & Restore Data', 'Data Backup & Restore')}</option>
                      </select>

                      <select
                        value={auditModuleFilter}
                        onChange={(e) => setAuditModuleFilter(e.target.value)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                        }}
                      >
                        <option value="">{tr('Semua Modul Sistem', 'All System Modules')}</option>
                        <option value="PRODUKSI_SPK">🦷 {tr('Produksi & QC (SPK)', 'Production & QC (SPK)')}</option>
                        <option value="DOKTER_PASIEN">🏥 {tr('Master Dokter & Pasien', 'Master Doctors & Patients')}</option>
                        <option value="STOK_BAHAN">📦 {tr('Stok & Bahan', 'Stock & Materials')}</option>
                        <option value="KEUANGAN_INVOICE">💰 {tr('Keuangan & Invoice', 'Finance & Invoices')}</option>
                        <option value="SDM_ABSENSI">👥 {tr('SDM, Tugas & Absensi', 'HR, Tasks & Attendance')}</option>
                        <option value="KEAMANAN_SISTEM">⚙️ {tr('Keamanan & Pengaturan', 'Security & Settings')}</option>
                      </select>

                      <select
                        value={auditUserFilter}
                        onChange={(e) => setAuditUserFilter(e.target.value)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                        }}
                      >
                        <option value="">{tr('Semua Pengguna (Siapa)', 'All Users (Actor)')}</option>
                        {usersList.map((u) => (
                          <option key={u.id} value={u.username}>
                            {u.full_name} (@{u.username} - {u.role?.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '12px' }}>{tr('Waktu Kejadian', 'Timestamp')}</th>
                            <th style={{ padding: '12px' }}>{tr('Pengguna / Pelaku (Siapa)', 'User / Actor (Who)')}</th>
                            <th style={{ padding: '12px' }}>{tr('Tipe Aktivitas', 'Activity Type')}</th>
                            <th style={{ padding: '12px' }}>{tr('Modul & Entitas Data', 'Module & Target Entity')}</th>
                            <th style={{ padding: '12px' }}>{tr('Rincian Data yang Ditambah / Diubah', 'Details of Added / Modified Data')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(activitySummary?.logs || [])
                            .filter((lg) => {
                              if (auditActionFilter && lg.action_type !== auditActionFilter) return false
                              if (auditModuleFilter && lg.module_name !== auditModuleFilter) return false
                              if (auditUserFilter && lg.username !== auditUserFilter) return false
                              if (!auditSearch.trim()) return true
                              const q = auditSearch.toLowerCase()
                              return (
                                lg.description.toLowerCase().includes(q) ||
                                lg.full_name.toLowerCase().includes(q) ||
                                lg.username.toLowerCase().includes(q) ||
                                lg.target_entity.toLowerCase().includes(q) ||
                                (lg.changed_data || '').toLowerCase().includes(q)
                              )
                            })
                            .map((lg) => (
                              <tr key={lg.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '12px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                    {new Date(lg.created_at).toLocaleDateString(dateLocale, {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {tr('Pukul', 'At')} {new Date(lg.created_at).toLocaleTimeString(dateLocale)}
                                  </div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-subtle)', marginTop: '2px' }}>
                                    IP: {lg.ip_address || '127.0.0.1'}
                                  </div>
                                </td>

                                <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                  <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '13px' }}>
                                    {lg.full_name || lg.username}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{lg.username}</div>
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      marginTop: '4px',
                                      padding: '2px 7px',
                                      borderRadius: '6px',
                                      fontSize: '10px',
                                      fontWeight: 800,
                                      background:
                                        lg.role_name === 'SUPER_ADMIN'
                                          ? '#dcfce7'
                                          : lg.role_name === 'OWNER'
                                          ? '#fef3c7'
                                          : '#e0f2fe',
                                      color:
                                        lg.role_name === 'SUPER_ADMIN'
                                          ? '#15803d'
                                          : lg.role_name === 'OWNER'
                                          ? '#b45309'
                                          : '#0369a1',
                                    }}
                                  >
                                    {lg.role_name || 'STAFF'}
                                  </span>
                                </td>

                                <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      padding: '4px 10px',
                                      borderRadius: '999px',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      background:
                                        lg.action_type === 'CREATE'
                                          ? '#dcfce7'
                                          : lg.action_type === 'UPDATE'
                                          ? '#fef3c7'
                                          : lg.action_type === 'DELETE'
                                          ? '#fee2e2'
                                          : '#f3e8ff',
                                      color:
                                        lg.action_type === 'CREATE'
                                          ? '#15803d'
                                          : lg.action_type === 'UPDATE'
                                          ? '#b45309'
                                          : lg.action_type === 'DELETE'
                                          ? '#dc2626'
                                          : '#6d28d9',
                                    }}
                                  >
                                    {lg.action_type === 'CREATE'
                                      ? tr('➕ MENAMBAH DATA', '➕ CREATED DATA')
                                      : lg.action_type === 'UPDATE'
                                      ? tr('✏️ MENGUBAH DATA', '✏️ UPDATED DATA')
                                      : lg.action_type === 'DELETE'
                                      ? tr('🗑️ MENGHAPUS DATA', '🗑️ DELETED DATA')
                                      : lg.action_type === 'BACKUP'
                                      ? tr('💾 BACKUP DATA', '💾 DATA BACKUP')
                                      : tr('🔐 LOGIN SISTEM', '🔐 SYSTEM LOGIN')}
                                  </span>
                                  <div style={{ fontSize: '10px', color: 'var(--text-subtle)', marginTop: '4px', fontFamily: 'monospace' }}>
                                    {lg.http_method} {lg.endpoint}
                                  </div>
                                </td>

                                <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      padding: '2px 7px',
                                      borderRadius: '4px',
                                      fontSize: '10px',
                                      fontWeight: 800,
                                      background: 'var(--bg-surface)',
                                      color: 'var(--primary)',
                                      border: '1px solid var(--border-light)',
                                    }}
                                  >
                                    {lg.module_name}
                                  </span>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                                    {lg.target_entity}
                                  </div>
                                </td>

                                <td style={{ padding: '12px', verticalAlign: 'top', maxWidth: '380px' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                                    {lg.description}
                                  </div>
                                  {lg.changed_data && lg.changed_data !== '' && (
                                    <div
                                      style={{
                                        padding: '6px 8px',
                                        borderRadius: '6px',
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-light)',
                                        fontSize: '10px',
                                        fontFamily: 'monospace',
                                        color: 'var(--text-muted)',
                                        wordBreak: 'break-all',
                                      }}
                                    >
                                      {lg.changed_data}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS SUB-TAB: AKSES ONLINE, MULTI-USER ROLE & BACKUP DATA */}
              {settingsSubTab === 'backup' && (
                <div className="animate-fade-in">
                  {/* Row 1: Login Multi-User Role Based & Akses Cepat Web/Mobile */}
                  <div className="grid-2col" style={{ gap: '20px', marginBottom: '20px' }}>
                    {/* Card 1: Login Multi-User Role Based */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                          🔐 {tr('Login Multi-User (Role-Based Access)', 'Multi-User Login (Role-Based Access)')}
                        </h3>
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 800,
                            background: '#dcfce7',
                            color: '#15803d',
                          }}
                        >
                          {tr('Aktif', 'Active')}: {currentUser.role?.name}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        {tr(
                          'Sistem mendukung multi-user sesuai jabatan (Owner, Admin, Teknisi, Kasir, Super Admin). Klik akun di bawah untuk beralih sesi login secara langsung:',
                          'The system supports role-based multi-user access (Owner, Admin, Technician, Cashier, Super Admin). Click any account below to switch sessions instantly:'
                        )}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: '8px' }}>
                        {[
                          { role: 'SUPER_ADMIN', username: 'superadmin', label: '🛡️ Super Admin', desc: tr('Akses penuh seluruh modul & sistem', 'Full access to all modules & settings') },
                          { role: 'OWNER', username: 'owner', label: '👑 Owner Lab', desc: tr('Approval PR, Keuangan, Laporan & QC', 'PR Approvals, Finance, Reports & QC') },
                          { role: 'ADMIN', username: 'admin', label: '🩺 Admin / CRM', desc: tr('Input SPK, Dokter/Pasien, Jadwal', 'SPK Intake, Doctors/Patients, Schedule') },
                          { role: 'TECHNICIAN', username: 'teknisi1', label: tr('🔬 Teknisi 1 (Zirconia)', '🔬 Technician 1 (Zirconia)'), desc: tr('Update tahapan produksi, QC & SDM', 'Update production stages, QC & HR') },
                          { role: 'TECHNICIAN', username: 'teknisi2', label: tr('🔬 Teknisi 2 (Akrilik)', '🔬 Technician 2 (Acrylic)'), desc: tr('Update tahapan produksi & absensi', 'Update production stages & attendance') },
                          { role: 'CASHIER', username: 'kasir', label: tr('💳 Kasir / Finance', '💳 Cashier / Finance'), desc: tr('Invoice pembayaran, kas & piutang', 'Payment invoices, cashflow & receivables') },
                        ].map((acc) => {
                          const isCurrent = currentUser.username === acc.username
                          return (
                            <div
                              key={acc.username}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '10px',
                                background: isCurrent ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                                border: isCurrent ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: '6px',
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>{acc.label}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  User: <code>{acc.username}</code> • {acc.desc}
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={isCurrent || loading}
                                onClick={() => handleQuickSwitchRole(acc.username)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: isCurrent ? '#16a34a' : 'var(--primary)',
                                  color: '#ffffff',
                                  opacity: isCurrent ? 0.85 : 1,
                                }}
                              >
                                {isCurrent ? tr('✓ Sedang Login', '✓ Logged In') : `${tr('Login sebagai', 'Login as')} ${acc.username} →`}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Card 2: Akses Online via Web / Mobile */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                            📱 {tr('Akses Online via Web / Mobile', 'Online Access via Web / Mobile')}
                          </h3>
                          <span
                            style={{
                              padding: '3px 9px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 800,
                              background: '#e0f2fe',
                              color: '#0369a1',
                            }}
                          >
                            Responsive Web & Mobile Ready
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                          {tr(
                            'Memudahkan teknisi, admin, maupun kurir melakukan update status produksi SPK (`Dalam Proses`, `Menunggu QC`, `Selesai`, `Dikirim`) dari smartphone atau browser di mana saja.',
                            'Allows technicians, admins, and couriers to quickly update SPK production statuses (`In Progress`, `QC Pending`, `Completed`, `Delivered`) from any smartphone or browser.'
                          )}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                          <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{tr('Status Server API', 'API Server Status')}</div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                              ● {backupInfo?.database_status || 'ONLINE & PROTECTED'}
                            </div>
                          </div>
                          <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{tr('Auto-Backup Terakhir', 'Last Auto-Backup')}</div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                              {backupInfo?.last_backup_at || tr('Hari Ini', 'Today')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setShowQuickMobileModal(true)}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '10px',
                            background: '#059669',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <Smartphone size={16} /> {tr('Buka Mode Update Status Mobile / Web', 'Open Mobile / Web Quick Status Mode')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Backup & Restore Data Database (Agar Data Tidak Hilang) */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                          💾 {tr('Backup & Restore Data Sistem (Agar Data Tidak Hilang)', 'System Data Backup & Restore (Data Loss Prevention)')}
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {tr(
                            'Cadangkan seluruh database (Dokter, Pasien, SPK Produksi, QC, Stok Bahan, Batch, Invoice, Pembayaran, Pengeluaran, SDM & Pengaturan) ke dalam file snapshot JSON atau pulihkan kapan saja.',
                            'Back up the entire database (Doctors, Patients, SPK Orders, QC, Material Stock, Batches, Invoices, Payments, Expenses, HR & Settings) into a JSON snapshot or restore anytime.'
                          )}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                          type="button"
                          disabled={creatingBackup}
                          onClick={() => handleDownloadBackup('MANUAL_FULL_BACKUP', true)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 16px',
                            borderRadius: '8px',
                            background: 'var(--primary)',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 800,
                          }}
                        >
                          <Download size={15} /> {creatingBackup ? tr('Membuat Backup...', 'Creating Backup...') : tr('Download Full Backup (.JSON)', 'Download Full Backup (.JSON)')}
                        </button>

                        <button
                          type="button"
                          disabled={creatingBackup}
                          onClick={() => handleDownloadBackup('CLOUD_SNAPSHOT', false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 14px',
                            borderRadius: '8px',
                            background: 'var(--bg-surface)',
                            color: 'var(--primary)',
                            border: '1.5px solid var(--primary)',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          <Database size={15} /> {tr('Simpan Snapshot Server', 'Save Server Snapshot')}
                        </button>

                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 14px',
                            borderRadius: '8px',
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <Upload size={15} /> {restoringBackup ? tr('Memulihkan...', 'Restoring...') : tr('Restore dari File Backup', 'Restore from Backup File')}
                          <input
                            type="file"
                            accept=".json,application/json"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleRestoreBackupFile(e.target.files[0])
                                e.target.value = ''
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Ringkasan Jumlah Record per Modul yang Diamankan */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '10px',
                        marginBottom: '18px',
                      }}
                    >
                      {[
                        { label: tr('SPK Produksi', 'SPK Orders'), count: backupInfo?.table_counts?.['production_orders'] ?? orders.length },
                        { label: tr('Dokter / Klinik', 'Doctors / Clinics'), count: backupInfo?.table_counts?.['customers'] ?? customers.length },
                        { label: tr('Master Pasien', 'Master Patients'), count: backupInfo?.table_counts?.['patients'] ?? patients.length },
                        { label: tr('Stok Bahan & Batch', 'Stock & Batches'), count: (backupInfo?.table_counts?.['items'] ?? inventoryItems.length) + (backupInfo?.table_counts?.['inventory_batches'] ?? 0) },
                        { label: tr('Invoice & Pembayaran', 'Invoices & Payments'), count: (backupInfo?.table_counts?.['invoices'] ?? invoices.length) + (backupInfo?.table_counts?.['payments'] ?? 0) },
                        { label: tr('Pengeluaran & PR', 'Expenses & PRs'), count: (backupInfo?.table_counts?.['expenses'] ?? expenses.length) + (backupInfo?.table_counts?.['purchase_requests'] ?? 0) },
                        { label: tr('SDM, User & Absensi', 'HR, Users & Attendance'), count: (backupInfo?.table_counts?.['users'] ?? usersList.length) + (backupInfo?.table_counts?.['staff_attendances'] ?? 0) },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-light)',
                          }}
                        >
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                            {stat.count} {tr('Data', 'Records')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tabel Riwayat Backup Data */}
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                      📋 {tr('Riwayat Backup Data Otomatis & Manual:', 'Automated & Manual Backup History:')}
                    </div>
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '10px' }}>{tr('Nama File Snapshot', 'Snapshot File Name')}</th>
                            <th style={{ padding: '10px' }}>{tr('Tipe Backup', 'Backup Type')}</th>
                            <th style={{ padding: '10px' }}>{tr('Total Record', 'Total Records')}</th>
                            <th style={{ padding: '10px' }}>{tr('Ukuran', 'Size')}</th>
                            <th style={{ padding: '10px' }}>{tr('Dibuat Oleh', 'Created By')}</th>
                            <th style={{ padding: '10px' }}>{tr('Waktu Backup', 'Backup Time')}</th>
                            <th style={{ padding: '10px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(backupInfo?.backup_history || []).map((b) => (
                            <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '10px', fontWeight: 700, color: 'var(--primary)' }}>{b.backup_name}</td>
                              <td style={{ padding: '10px' }}>
                                <span
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '999px',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    background: b.backup_type.includes('AUTO') ? '#e0f2fe' : '#f3e8ff',
                                    color: b.backup_type.includes('AUTO') ? '#0369a1' : '#6d28d9',
                                  }}
                                >
                                  {b.backup_type}
                                </span>
                              </td>
                              <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-main)' }}>{b.total_records} {tr('baris', 'rows')}</td>
                              <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{b.size_kb} KB</td>
                              <td style={{ padding: '10px', color: 'var(--text-main)' }}>{b.created_by}</td>
                              <td style={{ padding: '10px', color: 'var(--text-muted)' }}>
                                {new Date(b.created_at).toLocaleString(dateLocale)}
                              </td>
                              <td style={{ padding: '10px' }}>
                                <span
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '999px',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    background: '#dcfce7',
                                    color: '#15803d',
                                  }}
                                >
                                  ✓ {b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS SUB-TAB 3: APPEARANCE & LOGO HEADER */}
              {settingsSubTab === 'appearance' && (
                <div className="animate-fade-in" style={{ maxWidth: '640px' }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>{t.uploadLogoTitle}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>{t.uploadLogoDesc}</p>

                    <form onSubmit={handleLogoUpload}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ width: '70px', height: '70px', borderRadius: '12px', border: '2px dashed var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', overflow: 'hidden' }}>
                          {logoPreview || headerLogoSrc ? (
                            <img src={logoPreview || headerLogoSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <Stethoscope size={32} color="var(--primary)" />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0]
                                setLogoFile(file)
                                setLogoPreview(URL.createObjectURL(file))
                              }
                            }}
                            style={{ fontSize: '13px' }}
                          />
                          <p style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px' }}>
                            {lang === 'en' ? 'Supported formats: PNG, JPG, SVG (Max. 2MB)' : 'Format yang didukung: PNG, JPG, SVG (Maks. 2MB)'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!logoFile || uploadingLogo}
                        style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--primary)', color: '#ffffff', fontSize: '13px', fontWeight: 700, opacity: !logoFile ? 0.6 : 1 }}
                      >
                        {uploadingLogo ? (lang === 'en' ? 'Uploading...' : 'Mengunggah...') : t.saveLogoBtn}
                      </button>
                    </form>
                  </div>

                  {/* Theme and Language Quick Settings Box */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
                      {lang === 'en' ? 'Display & Language Preferences' : 'Preferensi Tampilan & Bahasa'}
                    </h3>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>{t.themeSetting}:</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => setTheme('light')}
                          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: theme === 'light' ? '2px solid var(--primary)' : '1px solid var(--border-light)', background: theme === 'light' ? 'var(--primary-subtle)' : 'var(--bg-surface)', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <Sun size={16} /> {t.lightMode}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme('dark')}
                          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: theme === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border-light)', background: theme === 'dark' ? 'var(--primary-subtle)' : 'var(--bg-surface)', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <Moon size={16} /> {t.darkMode}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>{t.languageSetting}:</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => setLang('id')}
                          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: lang === 'id' ? '2px solid var(--primary)' : '1px solid var(--border-light)', background: lang === 'id' ? 'var(--primary-subtle)' : 'var(--bg-surface)', fontWeight: 700, color: 'var(--text-main)' }}
                        >
                          🇮🇩 Bahasa Indonesia
                        </button>
                        <button
                          type="button"
                          onClick={() => setLang('en')}
                          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: lang === 'en' ? '2px solid var(--primary)' : '1px solid var(--border-light)', background: lang === 'en' ? 'var(--primary-subtle)' : 'var(--bg-surface)', fontWeight: 700, color: 'var(--text-main)' }}
                        >
                          🇬🇧 English
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ORDERS & QC */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>{t.ordersTitle}</h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {tr(
                      'Pantau alur pembuatan gigi palsu (Model Gips → Design → Wax-up → Casting → Finishing → QC), PIC Teknis tiap tahap, status produksi, dan dokumentasi foto hasil akhir.',
                      'Track prosthetic production stages (Gypsum Model → Design → Wax-up → Casting → Finishing → QC), Technician PIC per stage, production status, and final QC photo documentation.'
                    )}
                  </p>
                </div>
                {allowedMenus.includes('new_order') && (
                  <button
                    onClick={() => setActiveTab('new_order')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#ffffff', padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                  >
                    <Plus size={16} /> {t.newSpkBtn}
                  </button>
                )}
              </div>

              {/* Status Pipeline Quick Filter Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                {[
                  { key: '', label: tr('Semua SPK', 'All SPK Orders'), count: orders.length, color: 'var(--primary)' },
                  { key: 'INTAKE', label: tr('📥 Order Masuk', '📥 Order Intake'), count: orders.filter((o) => o.status === 'INTAKE').length, color: '#6366f1' },
                  { key: 'IN_PRODUCTION', label: tr('⚙️ Dalam Proses', '⚙️ In Production'), count: orders.filter((o) => o.status === 'IN_PRODUCTION' || o.status === 'REOPENED_FOR_REWORK').length, color: '#0284c7' },
                  { key: 'QC_PENDING', label: tr('🔍 Menunggu QC', '🔍 QC Pending'), count: orders.filter((o) => o.status === 'QC_PENDING').length, color: '#d97706' },
                  { key: 'COMPLETED', label: tr('✅ Selesai (Siap Kirim)', '✅ Completed (Ready)'), count: orders.filter((o) => o.status === 'COMPLETED').length, color: '#059669' },
                  { key: 'DELIVERED', label: tr('🚚 Dikirim ke Dokter', '🚚 Delivered to Doctor'), count: orders.filter((o) => o.status === 'DELIVERED').length, color: '#0d9488' },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setOrderStatusFilter(st.key)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: orderStatusFilter === st.key ? 'var(--primary-subtle)' : 'var(--bg-card)',
                      border: orderStatusFilter === st.key ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{st.label}</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: st.color }}>{st.count}</span>
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                  <Search size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    placeholder={tr('Cari No. SPK, nama pasien, atau nama dokter...', 'Search SPK No., patient name, or doctor name...')}
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '14px' }}
                  />
                </div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '14px', fontWeight: 600 }}
                >
                  <option value="">{t.allStatus}</option>
                  <option value="INTAKE">{tr('Order Masuk (Intake)', 'Order Intake')}</option>
                  <option value="IN_PRODUCTION">{tr('Dalam Proses Produksi', 'In Production')}</option>
                  <option value="QC_PENDING">{tr('Menunggu QC', 'QC Pending')}</option>
                  <option value="REOPENED_FOR_REWORK">{tr('Revisi / Rework', 'Reopened for Rework')}</option>
                  <option value="COMPLETED">{tr('Selesai (Siap Kirim)', 'Completed (Ready)')}</option>
                  <option value="DELIVERED">{tr('Dikirim ke Dokter', 'Delivered to Doctor')}</option>
                </select>
              </div>

              {/* Orders Grid / Split View */}
              <div className={selectedOrder ? "grid-order-split" : ""}>
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '10px 8px' }}>{t.colSpk}</th>
                          <th style={{ padding: '10px 8px' }}>{tr('Pasien & Jenis Gigi', 'Patient & Prosthetic Type')}</th>
                          <th style={{ padding: '10px 8px' }}>{tr('Dokter & Jadwal', 'Doctor & Schedule')}</th>
                          <th style={{ padding: '10px 8px' }}>{tr('PIC Teknis', 'Technician PIC')}</th>
                          <th style={{ padding: '10px 8px' }}>{tr('Tahap & Status Produksi', 'Stage & Production Status')}</th>
                          <th style={{ padding: '10px 8px' }}>{t.colActions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders
                          .filter((o) => !orderStatusFilter || o.status === orderStatusFilter)
                          .filter(
                            (o) =>
                              !orderSearch ||
                              o.patient_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
                              o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
                              (o.customer?.name || '').toLowerCase().includes(orderSearch.toLowerCase())
                          )
                          .map((o) => {
                            const totalStages = o.stage_runs?.length || 0
                            const doneStages = o.stage_runs?.filter((s) => s.status === 'COMPLETED').length || 0
                            const statusLabelMap: Record<string, string> = {
                              INTAKE: tr('Order Masuk', 'Intake'),
                              IN_PRODUCTION: tr('Dalam Proses', 'In Production'),
                              QC_PENDING: tr('Menunggu QC', 'QC Pending'),
                              REOPENED_FOR_REWORK: tr('Revisi / Rework', 'Rework'),
                              COMPLETED: tr('Selesai', 'Completed'),
                              DELIVERED: tr('Dikirim', 'Delivered'),
                            }
                            return (
                              <tr
                                key={o.id}
                                onClick={async () => {
                                  setSelectedOrder(o)
                                  const full = await api.getOrderById(o.id).catch(() => o)
                                  setSelectedOrder(full)
                                }}
                                style={{
                                  borderBottom: '1px solid var(--border-light)',
                                  cursor: 'pointer',
                                  background: selectedOrder?.id === o.id ? 'var(--primary-subtle)' : 'transparent',
                                }}
                              >
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{o.order_number}</div>
                                  {o.priority === 'URGENT' && (
                                    <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                                      URGENT
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{o.patient_name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>{o.denture_type?.name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tr('Gigi', 'Teeth')}: {o.teeth_numbers} ({o.shade_guide})</div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{o.customer?.name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{o.customer?.clinic_name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {tr('Masuk', 'In')}: {new Date(o.received_date).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short' })} → {tr('Target', 'Due')}: <strong>{new Date(o.promised_due_date).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short' })}</strong>
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                                    👨‍🔬 {o.current_technician?.full_name || tr('Belum Ditentukan', 'Unassigned')}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ marginBottom: '4px' }}>
                                    <span
                                      style={{
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        background:
                                          o.status === 'DELIVERED'
                                            ? '#ccfbf1'
                                            : o.status === 'COMPLETED'
                                            ? '#ecfdf5'
                                            : o.status === 'QC_PENDING'
                                            ? '#fef3c7'
                                            : o.status === 'REOPENED_FOR_REWORK'
                                            ? '#fee2e2'
                                            : 'var(--primary-subtle)',
                                        color:
                                          o.status === 'DELIVERED'
                                            ? '#0f766e'
                                            : o.status === 'COMPLETED'
                                            ? '#059669'
                                            : o.status === 'QC_PENDING'
                                            ? '#d97706'
                                            : o.status === 'REOPENED_FOR_REWORK'
                                            ? '#dc2626'
                                            : 'var(--primary)',
                                      }}
                                    >
                                      {statusLabelMap[o.status] || o.status}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {o.current_stage_name} {totalStages > 0 ? `(${doneStages}/${totalStages})` : ''}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <ChevronRight size={16} color="var(--text-subtle)" />
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Details Panel */}
                {selectedOrder && (
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>{selectedOrder.order_number}</span>
                          <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                            {selectedOrder.denture_type?.name}
                          </span>
                          {selectedOrder.priority === 'URGENT' && (
                            <span style={{ background: '#fee2e2', color: '#dc2626', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                              ⚡ CITO / URGENT
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {tr('Dokter', 'Doctor')}: <strong style={{ color: 'var(--text-main)' }}>{selectedOrder.customer?.name}</strong> ({selectedOrder.customer?.clinic_name})
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {tr('Pasien', 'Patient')}: <strong style={{ color: 'var(--text-main)' }}>{selectedOrder.patient_name}</strong> | {tr('Warna', 'Shade')}: <strong>{selectedOrder.shade_guide}</strong>
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Direct WhatsApp Action Button */}
                        <button
                          onClick={() => {
                            const msg = generateWAMessage(
                              selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'DELIVERED' ? 'COMPLETED' : 'ORDER_INTAKE',
                              selectedOrder.customer.name,
                              selectedOrder.patient_name,
                              selectedOrder.denture_type.name,
                              selectedOrder.order_number,
                              selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'DELIVERED'
                                ? formatRupiah(selectedOrder.total_price)
                                : new Date(selectedOrder.promised_due_date).toLocaleDateString(dateLocale)
                            )
                            openWhatsApp(selectedOrder.customer.phone, msg)
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#22c55e', color: '#ffffff', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                        >
                          <MessageCircle size={16} /> <span className="hide-on-mobile">{t.waDoctorBtn}</span>
                        </button>

                        {/* Close Detail Panel Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(null)}
                          style={{ padding: '8px 12px', background: 'var(--bg-surface)', color: 'var(--text-muted)', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: '1px solid var(--border-light)' }}
                          title={tr('Tutup Panel', 'Close Panel')}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Order Metadata Summary Box (Tanggal Masuk, Target Selesai, Status Produksi, PIC Utama) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '10px', padding: '12px', background: 'var(--bg-surface)', borderRadius: '12px', marginBottom: '18px', border: '1px solid var(--border-light)' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{tr('Tgl Masuk Order', 'Received Date')}</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {new Date(selectedOrder.received_date).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{tr('Target Selesai', 'Promised Due Date')}</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#dc2626' }}>
                          {new Date(selectedOrder.promised_due_date).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{tr('Status Produksi', 'Production Status')}</div>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => handleChangeOrderStatus(selectedOrder.id, e.target.value)}
                          style={{ marginTop: '2px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '12px', fontWeight: 700, background: 'var(--bg-card)', color: 'var(--primary)', width: '100%' }}
                        >
                          <option value="INTAKE">📥 {tr('Order Masuk', 'Order Intake')}</option>
                          <option value="IN_PRODUCTION">⚙️ {tr('Dalam Proses', 'In Production')}</option>
                          <option value="QC_PENDING">🔍 {tr('Menunggu QC', 'QC Pending')}</option>
                          <option value="REOPENED_FOR_REWORK">🔄 {tr('Revisi / Rework', 'Rework')}</option>
                          <option value="COMPLETED">✅ {tr('Selesai Produksi', 'Completed Production')}</option>
                          <option value="DELIVERED">🚚 {tr('Dikirim ke Dokter', 'Delivered to Doctor')}</option>
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{tr('Biaya SPK', 'SPK Cost')}</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a' }}>{formatRupiah(selectedOrder.total_price)}</div>
                      </div>
                    </div>

                    {selectedOrder.doctor_notes && (
                      <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', fontSize: '12px', color: '#92400e', marginBottom: '16px' }}>
                        <strong>{tr('Instruksi Dokter:', 'Doctor Instructions:')}</strong> {selectedOrder.doctor_notes}
                      </div>
                    )}

                    {/* Odontogram View */}
                    <div style={{ marginBottom: '20px' }}>
                      <Odontogram selectedTeeth={JSON.parse(selectedOrder.teeth_numbers || '[]')} onChange={() => {}} readOnly={true} lang={lang} />
                    </div>

                    {/* Stage Runs Stepper with Per-Stage PIC Teknis */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                          ⚙️ {tr('Tracking Tahapan Produksi & PIC Teknis:', 'Production Stage Tracking & Technician PIC:')}
                        </h4>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                          {selectedOrder.stage_runs?.filter((s) => s.status === 'COMPLETED').length || 0} / {selectedOrder.stage_runs?.length || 0} {tr('Tahap Selesai', 'Stages Completed')}
                        </span>
                      </div>

                      {/* Visual Progress Bar */}
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '999px', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                        <div
                          style={{
                            width: `${
                              selectedOrder.stage_runs?.length
                                ? Math.round(((selectedOrder.stage_runs.filter((s) => s.status === 'COMPLETED').length || 0) / selectedOrder.stage_runs.length) * 100)
                                : 0
                            }%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #0284c7, #10b981)',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedOrder.stage_runs?.map((sr, idx) => {
                          const isDone = sr.status === 'COMPLETED'
                          const isCurrent = sr.status === 'IN_PROGRESS'
                          return (
                            <div
                              key={sr.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '10px',
                                padding: '12px 14px',
                                borderRadius: '10px',
                                background: isCurrent ? 'var(--primary-subtle)' : isDone ? 'var(--bg-surface)' : 'var(--bg-card)',
                                border: isCurrent ? '1.5px solid var(--border-focus)' : '1px solid var(--border-light)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '200px' }}>
                                <div
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    background: isDone ? '#10b981' : isCurrent ? 'var(--primary)' : '#cbd5e1',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  {isDone ? '✓' : idx + 1}
                                </div>
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 700, color: isCurrent ? 'var(--primary)' : 'var(--text-main)' }}>
                                    {sr.stage_name}
                                  </div>
                                  {sr.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tr('Catatan', 'Notes')}: {sr.notes}</div>}
                                  {sr.finished_at && (
                                    <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>
                                      {tr('Selesai', 'Completed')}: {new Date(sr.finished_at).toLocaleString(dateLocale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* PIC Teknis Selector per Stage + Action Button */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>PIC:</span>
                                  <select
                                    value={sr.technician_id || sr.technician?.id || ''}
                                    onChange={(e) => handleChangeStagePIC(selectedOrder.id, sr.id, e.target.value)}
                                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '11px', fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text-main)' }}
                                  >
                                    <option value="">-- {tr('Pilih PIC Teknis', 'Select Technician PIC')} --</option>
                                    {usersList.map((u) => (
                                      <option key={u.id} value={u.id}>
                                        {u.full_name} ({u.role?.name})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {isCurrent && (
                                  <button
                                    onClick={() => handleAdvanceStage(selectedOrder.id, sr.id, sr.technician_id || sr.technician?.id)}
                                    style={{ background: 'var(--primary)', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}
                                  >
                                    {t.advanceStageBtn}
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Photo Documentation & QC Report Section */}
                    <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                        📸 {tr('Upload Foto Hasil Akhir & Dokumentasi QC Report', 'Upload Final Result Photo & QC Report Documentation')}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        {tr(
                          'Unggah foto hasil kerja akhir gigi tiruan, foto model gips/wax-up, atau dokumen pemeriksaan Quality Control.',
                          'Upload photos of final prosthetic work, gypsum model/wax-up photos, or Quality Control inspection documents.'
                        )}
                      </p>

                      <form onSubmit={handleUploadAttachment} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                        <div className="grid-2col" style={{ gap: '8px' }}>
                          <select
                            value={attType}
                            onChange={(e) => setAttType(e.target.value)}
                            style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px', fontWeight: 600, background: 'var(--bg-card)', color: 'var(--text-main)' }}
                          >
                            <option value="QC_PHOTO">📸 {tr('Foto Hasil Akhir / QC Report', 'Final Result Photo / QC Report')}</option>
                            <option value="IMPRESSION_PHOTO">🦷 {tr('Foto Model Gips / Wax-up', 'Gypsum Model / Wax-up Photo')}</option>
                            <option value="TEETH_PHOTO">🎨 {tr('Foto Shade / Gigi Pasien', 'Shade / Patient Teeth Photo')}</option>
                            <option value="STL_SCAN">💻 {tr('File CAD / 3D Scan', 'CAD / 3D Scan File')}</option>
                          </select>
                          <input
                            type="text"
                            placeholder={tr('Keterangan foto (mis: Hasil akhir poles & oklusi)...', 'Photo description (e.g., Final polish & occlusion)...')}
                            value={attDesc}
                            onChange={(e) => setAttDesc(e.target.value)}
                            style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <input
                            type="file"
                            accept="image/*,.pdf,.stl"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setAttFile(e.target.files[0])
                              }
                            }}
                            style={{ fontSize: '12px', flex: 1 }}
                          />
                          <button
                            type="submit"
                            disabled={!attFile || uploadingAtt}
                            style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--primary)', color: '#ffffff', fontSize: '12px', fontWeight: 700, opacity: !attFile ? 0.6 : 1 }}
                          >
                            {uploadingAtt ? tr('Mengunggah...', 'Uploading...') : tr('⬆️ Upload Foto / QC', '⬆️ Upload Photo / QC')}
                          </button>
                        </div>
                      </form>

                      {/* Uploaded Photos Gallery */}
                      {selectedOrder.attachments && selectedOrder.attachments.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginTop: '10px' }}>
                          {selectedOrder.attachments.map((att) => {
                            const url = att.stored_file_path.startsWith('/') ? att.stored_file_path : `/${att.stored_file_path.replace(/\\/g, '/')}`
                            return (
                              <a
                                key={att.id}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'block', background: 'var(--bg-card)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-light)', padding: '6px' }}
                              >
                                <img
                                  src={url}
                                  alt={att.file_name}
                                  style={{ width: '100%', height: '85px', objectFit: 'cover', borderRadius: '6px', marginBottom: '4px', background: '#e2e8f0' }}
                                />
                                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>{att.attachment_type}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {att.description || att.file_name}
                                </div>
                              </a>
                            )
                          })}
                        </div>
                      )}

                      {/* Quality Checks History */}
                      {selectedOrder.quality_checks && selectedOrder.quality_checks.length > 0 && (
                        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                            📋 {tr('Riwayat Laporan Quality Control (QC Report):', 'Quality Control Report History (QC Report):')}
                          </div>
                          {selectedOrder.quality_checks.map((qc) => (
                            <div
                              key={qc.id}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: qc.passed ? '#ecfdf5' : '#fef2f2',
                                border: qc.passed ? '1px solid #a7f3d0' : '1px solid #fecaca',
                                marginBottom: '6px',
                                fontSize: '12px',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: qc.passed ? '#065f46' : '#991b1b' }}>
                                <span>{qc.passed ? tr('✓ LOLOS QC', '✓ PASSED QC') : `✗ ${tr('REVISI', 'REWORK')} (${qc.rework_target_stage})`}</span>
                                <span style={{ fontSize: '11px' }}>
                                  {tr('Oleh', 'By')}: {qc.inspector?.full_name || 'Inspector'} ({new Date(qc.checked_at).toLocaleDateString(dateLocale)})
                                </span>
                              </div>
                              {qc.defect_notes && <div style={{ color: 'var(--text-main)', marginTop: '2px' }}>{tr('Catatan QC', 'QC Notes')}: {qc.defect_notes}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Kartu Hasil Order & Integrasi Invoice Pembayaran Otomatis */}
                    {(() => {
                      const linkedInv = invoices.find(
                        (inv) => inv.production_order_id === selectedOrder.id || inv.production_order?.id === selectedOrder.id
                      )
                      return (
                        <div
                          style={{
                            marginBottom: '16px',
                            padding: '14px 16px',
                            borderRadius: '12px',
                            background: linkedInv
                              ? linkedInv.status === 'PAID'
                                ? '#ecfdf5'
                                : '#eff6ff'
                              : 'var(--bg-surface)',
                            border: linkedInv
                              ? linkedInv.status === 'PAID'
                                ? '1px solid #a7f3d0'
                                : '1px solid #bfdbfe'
                              : '1px solid var(--border-light)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>
                                🧾 {tr('Ringkasan Hasil Order & Integrasi Invoice Keuangan', 'Order Result Summary & Financial Invoice Integration')}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {selectedOrder.denture_type?.name} • {tr('Pasien', 'Patient')}: <strong>{selectedOrder.patient_name}</strong> • Shade: <strong>{selectedOrder.shade_guide || 'A2'}</strong>
                              </div>
                            </div>
                            {linkedInv ? (
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  background:
                                    linkedInv.status === 'PAID'
                                      ? '#059669'
                                      : linkedInv.status === 'PARTIALLY_PAID'
                                      ? '#d97706'
                                      : '#dc2626',
                                  color: '#ffffff',
                                }}
                              >
                                {linkedInv.invoice_number} •{' '}
                                {linkedInv.status === 'PAID'
                                  ? tr('LUNAS', 'PAID')
                                  : linkedInv.status === 'PARTIALLY_PAID'
                                  ? tr('CICILAN', 'PARTIAL')
                                  : tr('BELUM LUNAS', 'UNPAID')}
                              </span>
                            ) : (
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: '#fef3c7',
                                  color: '#b45309',
                                }}
                              >
                                {tr('Invoice Otomatis saat Selesai / Lolos QC', 'Auto-Invoice upon Completion / QC Pass')}
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, 1fr)',
                              gap: '8px',
                              padding: '8px 10px',
                              background: 'var(--bg-card)',
                              borderRadius: '8px',
                              border: '1px solid var(--border-light)',
                              fontSize: '12px',
                              marginBottom: linkedInv ? '10px' : '0',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tr('Nilai Hasil Order', 'Order Value')}</div>
                              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{formatRupiah(selectedOrder.total_price)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tr('Terbayar', 'Paid')}</div>
                              <div style={{ fontWeight: 800, color: '#16a34a' }}>{formatRupiah(linkedInv?.paid_amount || 0)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tr('Sisa Tagihan', 'Balance Due')}</div>
                              <div style={{ fontWeight: 800, color: (linkedInv ? linkedInv.balance_due : selectedOrder.total_price) > 0 ? '#dc2626' : '#059669' }}>
                                {formatRupiah(linkedInv ? linkedInv.balance_due : selectedOrder.total_price)}
                              </div>
                            </div>
                          </div>

                          {linkedInv && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => setViewingInvoice(linkedInv)}
                                style={{
                                  flex: 1,
                                  padding: '7px 12px',
                                  background: 'var(--bg-card)',
                                  color: 'var(--primary)',
                                  border: '1.5px solid var(--primary)',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                }}
                              >
                                📄 {tr('Lihat & Cetak Nota + Hasil Order', 'View & Print Invoice + Order Result')}
                              </button>
                              {linkedInv.balance_due > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedInvoice(linkedInv)
                                    setPaymentAmount(linkedInv.balance_due)
                                  }}
                                  style={{
                                    padding: '7px 12px',
                                    background: '#059669',
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                  }}
                                >
                                  💳 {tr('Catat Bayar', 'Record Payment')}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })()}

                    {/* QC Action / Delivery Action / Invoice Action */}
                    <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '16px', flexWrap: 'wrap' }}>
                      {(selectedOrder.status === 'QC_PENDING' || selectedOrder.status === 'IN_PRODUCTION') && (
                        <button
                          onClick={() => {
                            setQcModalOpen(true)
                            setQcPassed(true)
                            setQcNotes('')
                          }}
                          style={{ flex: 1, padding: '10px 14px', background: '#d97706', color: '#ffffff', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}
                        >
                          🔍 {t.qcBtn} ({tr('Otomatis Buat Invoice jika Lolos', 'Auto-Generates Invoice on Pass')})
                        </button>
                      )}

                      {selectedOrder.status === 'COMPLETED' && (
                        <>
                          <button
                            onClick={() => handleChangeOrderStatus(selectedOrder.id, 'DELIVERED')}
                            style={{ flex: 1, padding: '10px 14px', background: '#0d9488', color: '#ffffff', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}
                          >
                            🚚 {tr('Tandai Dikirim ke Dokter', 'Mark as Delivered to Doctor')}
                          </button>
                          <button
                            onClick={() => handleCreateInvoice(selectedOrder.id)}
                            style={{ flex: 1, padding: '10px 14px', background: '#059669', color: '#ffffff', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}
                          >
                            🧾 {tr('Lihat / Terbitkan Nota Invoice', 'View / Issue Invoice')}
                          </button>
                        </>
                      )}

                      {selectedOrder.status === 'DELIVERED' && (
                        <button
                          onClick={() => handleCreateInvoice(selectedOrder.id)}
                          style={{ flex: 1, padding: '10px 14px', background: '#059669', color: '#ffffff', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}
                        >
                          🧾 {tr('Lihat / Cetak Nota Invoice & Hasil Order', 'View / Print Invoice & Order Result')}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: INPUT SPK BARU */}
          {activeTab === 'new_order' && (
            <div className="animate-fade-in" style={{ maxWidth: '820px', margin: '0 auto' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>{t.newOrderTitle}</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  {tr(
                    'Input order produksi gigi tiruan: nama dokter/pasien, jenis gigi tiruan, tanggal masuk, target selesai, PIC Teknis, dan acuan odontogram.',
                    'Input prosthetic production order: doctor/patient name, denture type, received date, promised due date, Technician PIC, and odontogram chart.'
                  )}
                </p>
              </div>

              <form onSubmit={handleCreateOrder} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid-2col" style={{ marginBottom: '20px', alignItems: 'start' }}>
                  {/* Master Dokter / Klinik */}
                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      {t.doctorClinicLabel}
                    </label>
                    <div style={{ display: 'flex', gap: '8px', width: '100%', minWidth: 0 }}>
                      <select
                        value={newOrderCustomer}
                        onChange={(e) => handleSelectOrderDoctor(e.target.value)}
                        required
                        style={{ flex: 1, minWidth: 0, width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-main)', textOverflow: 'ellipsis' }}
                      >
                        <option value="">{t.selectDoctorPlaceholder}</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.clinic_name}) {c.discount_percent ? `— ★ ${c.loyalty_tier} (-${c.discount_percent}%)` : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={openCreateCustomerModal}
                        style={{ flexShrink: 0, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', border: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}
                      >
                        {t.btnNewDoctor}
                      </button>
                    </div>

                    {/* Preview Preferensi & Loyalty Dokter yang Dipilih */}
                    {newOrderCustomer && customers.find((c) => c.id === newOrderCustomer) && (() => {
                      const doc = customers.find((c) => c.id === newOrderCustomer)!
                      return (
                        <div style={{ marginTop: '8px', padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                              🏥 {doc.code} — {doc.clinic_name}
                            </span>
                            <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 800, background: doc.discount_percent ? '#fef3c7' : '#e2e8f0', color: doc.discount_percent ? '#b45309' : '#475569' }}>
                              ★ {doc.loyalty_tier || 'REGULAR'} {doc.discount_percent ? `(${tr('Diskon', 'Discount')} ${doc.discount_percent}%)` : ''}
                            </span>
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                            {tr('Preferensi', 'Preference')}: <strong>{doc.favorite_shade || '-'}</strong> | {tr('Favorit', 'Favorite')}: <strong>{doc.favorite_denture_type || '-'}</strong>
                          </div>
                          {doc.notes && (
                            <div style={{ color: 'var(--text-main)', fontSize: '11px', marginTop: '3px', fontStyle: 'italic' }}>
                              📌 "{doc.notes}"
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>

                  {/* Master Data Pasien */}
                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      {t.patientNameLabel}
                    </label>
                    <div style={{ display: 'flex', gap: '8px', width: '100%', minWidth: 0 }}>
                      <select
                        value={newOrderPatientId}
                        onChange={(e) => {
                          const val = e.target.value
                          if (!val) {
                            setNewOrderPatientId('')
                            setNewOrderPatient('')
                            return
                          }
                          handleSelectOrderPatient(val)
                        }}
                        required={!newOrderPatient}
                        style={{ flex: 1, minWidth: 0, width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-main)', textOverflow: 'ellipsis' }}
                      >
                        <option value="">{tr('Pilih Pasien...', 'Select Patient...')}</option>
                        {newOrderCustomer && patients.some((p) => p.customer_id === newOrderCustomer) && (
                          <optgroup label={tr('Pasien Dokter Ini', 'Patients of This Doctor')}>
                            {patients
                              .filter((p) => p.customer_id === newOrderCustomer)
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.code}) — {p.gender === 'P' ? (lang === 'en' ? 'F' : 'P') : (lang === 'en' ? 'M' : 'L')}, {p.age} {tr('thn', 'yo')} [{p.default_shade}]
                                </option>
                              ))}
                          </optgroup>
                        )}
                        <optgroup label={tr('Semua Master Pasien', 'All Master Patients')}>
                          {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.code}) {p.customer?.name ? `— ${p.customer.name}` : ''}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <button
                        type="button"
                        onClick={() => openCreatePatientModal(newOrderCustomer)}
                        style={{ flexShrink: 0, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', border: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}
                      >
                        {t.btnNewDoctor}
                      </button>
                    </div>

                    {/* Preview Info Klinis / Alergi dari Master Pasien yang Dipilih */}
                    {newOrderPatientId && patients.find((p) => p.id === newOrderPatientId) && (() => {
                      const pat = patients.find((p) => p.id === newOrderPatientId)!
                      return (
                        <div style={{ marginTop: '8px', padding: '10px 12px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '12px', color: '#166534' }}>
                          <div style={{ fontWeight: 800 }}>
                            🧑 {pat.code} — {pat.name} ({pat.gender === 'P' ? tr('Perempuan', 'Female') : tr('Laki-laki', 'Male')}, {pat.age} {tr('thn', 'yrs')}) | Shade: {pat.default_shade}
                          </div>
                          {pat.allergies_or_notes && (
                            <div style={{ marginTop: '3px', color: '#b91c1c', fontWeight: 700, fontSize: '11px' }}>
                              ⚠️ {tr('Catatan Medis / Alergi', 'Medical / Allergy Notes')}: {pat.allergies_or_notes}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>

                <div className="grid-3col" style={{ marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      {t.dentureTypeLabel}
                    </label>
                    <select
                      value={newOrderType}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        setNewOrderType(val)
                        const found = dentureTypes.find((t) => t.id === val)
                        if (found) {
                          const doc = customers.find((c) => c.id === newOrderCustomer)
                          const discPct = doc?.discount_percent || 0
                          setNewOrderPrice(Math.round(found.base_price * (1 - discPct / 100)))
                        }
                      }}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    >
                      {dentureTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      {t.shadeGuideLabel}
                    </label>
                    <select
                      value={newOrderShade}
                      onChange={(e) => setNewOrderShade(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    >
                      {['VITA A1', 'VITA A2', 'VITA A3', 'VITA A3.5', 'VITA B1', 'VITA B2', 'VITA C1', 'BLEACH BL2', 'BLEACH BL3'].map((sh) => (
                        <option key={sh} value={sh}>
                          {sh}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      {t.priorityLabel}
                    </label>
                    <select
                      value={newOrderPriority}
                      onChange={(e) => setNewOrderPriority(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    >
                      <option value="NORMAL">{t.priorityNormal}</option>
                      <option value="URGENT">{t.priorityUrgent}</option>
                    </select>
                  </div>
                </div>

                {/* Preview Alur Tahapan Produksi dari Jenis Gigi Tiruan yang Dipilih */}
                {dentureTypes.find((dt) => dt.id === Number(newOrderType))?.stage_templates && (
                  <div style={{ marginBottom: '20px', padding: '12px 14px', background: 'var(--primary-subtle)', borderRadius: '10px', border: '1px solid var(--primary-light)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      {tr('Alur Tahapan Produksi Otomatis:', 'Automatic Production Stage Workflow:')}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {dentureTypes
                        .find((dt) => dt.id === Number(newOrderType))
                        ?.stage_templates.map((st, idx, arr) => (
                          <React.Fragment key={st.id}>
                            <span style={{ background: 'var(--bg-card)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                              {idx + 1}. {st.stage_name}
                            </span>
                            {idx < arr.length - 1 && <span style={{ color: 'var(--primary)', fontWeight: 800 }}>→</span>}
                          </React.Fragment>
                        ))}
                    </div>
                  </div>
                )}

                {/* Odontogram Interactive Teeth Selector */}
                <div style={{ marginBottom: '20px' }}>
                  <Odontogram selectedTeeth={newOrderTeeth} onChange={setNewOrderTeeth} lang={lang} />
                </div>

                {/* Tanggal Masuk, Target Selesai, PIC Teknis & Estimasi Harga */}
                <div className="grid-2col" style={{ marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      {tr('Tanggal Masuk Order *', 'Order Received Date *')}
                    </label>
                    <input
                      type="date"
                      value={newOrderReceivedDate}
                      onChange={(e) => setNewOrderReceivedDate(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      {tr('Target Selesai (Tenggat) *', 'Promised Due Date *')}
                    </label>
                    <input
                      type="date"
                      value={newOrderDueDate}
                      onChange={(e) => setNewOrderDueDate(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>

                <div className="grid-2col" style={{ marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      {tr('PIC Teknis Penanggung Jawab', 'Assigned Technician PIC')}
                    </label>
                    <select
                      value={newOrderTechId}
                      onChange={(e) => setNewOrderTechId(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    >
                      <option value="">-- {tr('Pilih PIC Teknis', 'Select Technician PIC')} --</option>
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.role?.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      {t.priceLabel}
                    </label>
                    <input
                      type="number"
                      value={newOrderPrice}
                      onChange={(e) => setNewOrderPrice(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '14px', fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    />
                    {(() => {
                      const doc = customers.find((c) => c.id === newOrderCustomer)
                      const dt = dentureTypes.find((t) => t.id === Number(newOrderType))
                      if (doc && (doc.discount_percent || 0) > 0 && dt) {
                        return (
                          <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, marginTop: '4px' }}>
                            🏷️ {tr('Harga Normal', 'Base Price')} {formatRupiah(dt.base_price)} — {tr('Diskon Loyalty', 'Loyalty Discount')} {doc.loyalty_tier} ({doc.discount_percent}%): {tr('Hemat', 'Save')} {formatRupiah(Math.round((dt.base_price * (doc.discount_percent || 0)) / 100))}
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {tr('Upload Foto Cetakan Awal / Referensi Pasien (Opsional)', 'Upload Initial Impression / Patient Reference Photo (Optional)')}
                  </label>
                  <input
                    type="file"
                    accept="image/*,.stl"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewOrderInitialPhoto(e.target.files[0])
                      }
                    }}
                    style={{ fontSize: '13px' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {t.doctorNotesLabel}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={tr('Instruksi anatomi, kontak proksimal, adaptasi tepi...', 'Anatomical instructions, proximal contact, marginal adaptation...')}
                    value={newOrderDoctorNotes}
                    onChange={(e) => setNewOrderDoctorNotes(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    style={{ padding: '12px 20px', borderRadius: '10px', background: 'var(--bg-surface)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '14px' }}
                  >
                    {t.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '12px 28px', borderRadius: '10px', background: 'var(--primary)', color: '#ffffff', fontWeight: 700, fontSize: '14px' }}
                  >
                    {loading ? tr('Menyimpan...', 'Saving...') : t.submitOrderBtn}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: STOK & INVENTARIS */}
          {activeTab === 'inventory' && (
            <div className="animate-fade-in">
              {/* Header & Quick Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {tr('Manajemen Bahan, Produk & Inventori', 'Material, Product & Inventory Management')}
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {tr(
                      'Master data bahan & produk, pencatatan stok masuk/keluar otomatis, batch & exp tracking, serta laporan analitik penggunaan bahan.',
                      'Material & product master data, automated stock in/out logging, batch & expiration tracking, and material usage analytics.'
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={openCreateItemModal}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', color: 'var(--primary)', border: '1.5px solid var(--primary)', padding: '9px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                  >
                    <Plus size={15} /> {tr('Master Bahan / Produk', 'Material / Product Master')}
                  </button>
                  <button
                    onClick={() => {
                      const first = inventoryItems[0]
                      setInItemId(first?.id || '')
                      setInUnitCost(first?.purchase_price || 0)
                      setInSupplierId(first?.supplier_id || suppliersList[0]?.id || '')
                      setInQty(5)
                      setInLotNumber(`LOT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`)
                      setInExpiryDate('')
                      setInNotes('')
                      setShowStockInModal(true)
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', color: '#ffffff', padding: '9px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                  >
                    {tr('+ Stok Masuk (Beli)', '+ Stock In (Purchase)')}
                  </button>
                  <button
                    onClick={() => {
                      const first = inventoryItems[0]
                      setOutItemId(first?.id || '')
                      setOutBatchId('')
                      setOutQty(1)
                      setOutOrderId('')
                      setOutNotes('')
                      setShowStockOutModal(true)
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f59e0b', color: '#ffffff', padding: '9px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                  >
                    {tr('- Pakai Bahan (Keluar)', '- Use Material (Stock Out)')}
                  </button>
                  <button
                    onClick={() => {
                      const first = inventoryItems[0]
                      setPrItem(first?.id || '')
                      setPrEstPrice(first?.purchase_price || 100000)
                      setPrSupplierId(first?.supplier_id || suppliersList[0]?.id || '')
                      setShowAddPRModal(true)
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#ffffff', padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                  >
                    <Plus size={15} /> {t.requestMaterialBtn}
                  </button>
                </div>
              </div>

              {/* Minimum Stock Warning Banner */}
              {inventoryItems.filter((i) => i.current_stock <= i.min_stock_level).length > 0 && (
                <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <AlertCircle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b' }}>
                        {tr(
                          `Peringatan Minimum Stok! (${inventoryItems.filter((i) => i.current_stock <= i.min_stock_level).length} Bahan di Bawah Batas Aman)`,
                          `Minimum Stock Warning! (${inventoryItems.filter((i) => i.current_stock <= i.min_stock_level).length} Materials Below Safe Limit)`
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#b91c1c', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {inventoryItems
                          .filter((i) => i.current_stock <= i.min_stock_level)
                          .map((low) => (
                            <span
                              key={low.id}
                              style={{ background: '#fee2e2', border: '1px solid #fecaca', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, color: '#991b1b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              {low.name}: {tr('sisa', 'rem.')} {low.current_stock} {low.unit?.code} (Min: {low.min_stock_level} {low.unit?.code})
                              <button
                                onClick={() => {
                                  setPrItem(low.id)
                                  setPrEstPrice(low.purchase_price)
                                  setPrSupplierId(low.supplier_id || '')
                                  setPrQty(Math.max(low.min_stock_level * 2 - low.current_stock, 5))
                                  setPrNotes(tr(`Restock bahan di bawah batas aman (${low.name})`, `Restock material below safe limit (${low.name})`))
                                  setShowAddPRModal(true)
                                }}
                                style={{ background: '#dc2626', color: '#ffffff', padding: '1px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}
                              >
                                {tr('Beli', 'Buy')}
                              </button>
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Real-Time KPI Summary Cards */}
              <div className="grid-stats" style={{ marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {tr('Total Jenis Bahan & Produk', 'Total Material & Product Types')}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {inventoryItems.length} {tr('Item', 'Items')}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                    {tr('Stok Real-Time Terpantau', 'Real-Time Stock Monitored')}
                  </span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {tr('Total Nilai Stok Gudang', 'Total Warehouse Stock Value')}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#16a34a' }}>
                    {formatRupiah(inventoryReport?.total_stock_value || inventoryItems.reduce((acc, i) => acc + i.current_stock * i.purchase_price, 0))}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {tr('Valuasi aset bahan & produk saat ini', 'Current material & product asset valuation')}
                  </span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {tr('Notifikasi Minimum Stok', 'Minimum Stock Alert')}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: inventoryItems.filter((i) => i.current_stock <= i.min_stock_level).length > 0 ? '#dc2626' : '#10b981' }}>
                    {inventoryItems.filter((i) => i.current_stock <= i.min_stock_level).length} {tr('Bahan', 'Items')}
                  </div>
                  <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                    {tr('Di bawah batas aman stok', 'Below safe stock threshold')}
                  </span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {tr('Monitoring Batch & Exp', 'Batch & Expiry Monitoring')}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: (inventoryReport?.expiring_soon_count || 0) + (inventoryReport?.expired_count || 0) > 0 ? '#d97706' : 'var(--text-main)' }}>
                    {(inventoryReport?.expiring_soon_count || 0) + (inventoryReport?.expired_count || 0)} {tr('Batch', 'Batches')}
                  </div>
                  <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 600 }}>
                    {tr('Mendekati Exp (< 60 hari) / Expired', 'Expiring Soon (< 60 days) / Expired')}
                  </span>
                </div>
              </div>

              {/* Sub-Navigation Tabs with Mouse Drag Slide, Wheel Scroll & Arrow Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('inv-tabs-scroll')
                    if (el) el.scrollBy({ left: -220, behavior: 'smooth' })
                  }}
                  title={tr('Geser Kiri', 'Scroll Left')}
                  style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-main)', fontWeight: 800, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ‹
                </button>

                <div
                  id="inv-tabs-scroll"
                  className="tabs-scroll-container"
                  style={{ flex: 1, paddingBottom: '2px' }}
                  onWheel={(e) => {
                    if (e.deltaY !== 0) {
                      e.currentTarget.scrollLeft += e.deltaY
                    }
                  }}
                  onMouseDown={(e) => {
                    const slider = e.currentTarget
                    const startX = e.pageX - slider.offsetLeft
                    const scrollLeft = slider.scrollLeft
                    const onMouseMove = (moveEvent: MouseEvent) => {
                      const x = moveEvent.pageX - slider.offsetLeft
                      const walk = (x - startX) * 1.5
                      slider.scrollLeft = scrollLeft - walk
                    }
                    const onMouseUp = () => {
                      window.removeEventListener('mousemove', onMouseMove)
                      window.removeEventListener('mouseup', onMouseUp)
                    }
                    window.addEventListener('mousemove', onMouseMove)
                    window.addEventListener('mouseup', onMouseUp)
                  }}
                >
                  {[
                    { id: 'master', label: tr(`📦 Master Bahan & Produk (${inventoryItems.length})`, `📦 Material & Product Master (${inventoryItems.length})`) },
                    { id: 'movements', label: tr(`🔄 Stok Masuk & Keluar (${stockMovements.length})`, `🔄 Stock In & Out (${stockMovements.length})`) },
                    { id: 'batches', label: tr(`🧪 Batch & Exp Tracking (${inventoryBatches.length})`, `🧪 Batch & Expiry Tracking (${inventoryBatches.length})`) },
                    { id: 'report', label: tr(`📊 Laporan Inventori & Pemakaian`, `📊 Inventory & Usage Report`) },
                    { id: 'suppliers', label: tr(`🏢 Data Supplier (${suppliersList.length})`, `🏢 Supplier Directory (${suppliersList.length})`) },
                  ].map((tab) => {
                    const isCurrent = invSubTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={(e) => {
                          setInvSubTab(tab.id as any)
                          e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
                        }}
                        style={{
                          padding: '11px 14px',
                          fontSize: '13px',
                          fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                          borderBottom: isCurrent ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                          background: 'transparent',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('inv-tabs-scroll')
                    if (el) el.scrollBy({ left: 220, behavior: 'smooth' })
                  }}
                  title={tr('Geser Kanan', 'Scroll Right')}
                  style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-main)', fontWeight: 800, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ›
                </button>
              </div>

              {/* SUB-TAB 1: MASTER DATA BAHAN & PRODUK */}
              {invSubTab === 'master' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                      <Search size={17} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                      <input
                        type="text"
                        placeholder={tr(
                          'Cari nama bahan (akrilik, gips, logam, gigi tiruan), kode, atau nomor batch...',
                          'Search material name (acrylic, gypsum, metal, denture), code, or batch number...'
                        )}
                        value={invSearch}
                        onChange={(e) => setInvSearch(e.target.value)}
                        style={{ width: '100%', padding: '9px 14px 9px 38px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '13px' }}
                      />
                    </div>
                    <select
                      value={invCategoryFilter}
                      onChange={(e) => setInvCategoryFilter(e.target.value)}
                      style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600 }}
                    >
                      <option value="">{tr('Semua Kategori', 'All Categories')}</option>
                      <option value="RAW_MATERIAL">{tr('RAW_MATERIAL (Bahan Baku)', 'RAW_MATERIAL (Raw Materials)')}</option>
                      <option value="PRODUCT">{tr('PRODUCT (Produk / Elemen Gigi)', 'PRODUCT (Products / Tooth Elements)')}</option>
                      <option value="CONSUMABLE">{tr('CONSUMABLE (Bahan Habis Pakai)', 'CONSUMABLE (Consumables)')}</option>
                      <option value="TOOL">{tr('TOOL (Alat & Mata Bur)', 'TOOL (Instruments & Burs)')}</option>
                    </select>
                  </div>

                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '10px' }}>{tr('Kode', 'Code')}</th>
                            <th style={{ padding: '10px' }}>{tr('Nama Bahan / Produk', 'Material / Product Name')}</th>
                            <th style={{ padding: '10px' }}>{tr('Kategori', 'Category')}</th>
                            <th style={{ padding: '10px' }}>Supplier</th>
                            <th style={{ padding: '10px' }}>{tr('Stok & Batas Min', 'Stock & Min Limit')}</th>
                            <th style={{ padding: '10px' }}>{tr('Harga / Nilai Stok', 'Unit Cost / Stock Value')}</th>
                            <th style={{ padding: '10px' }}>{tr('Batch & Tgl Exp', 'Batch & Expiry Date')}</th>
                            <th style={{ padding: '10px' }}>{tr('Status', 'Status')}</th>
                            <th style={{ padding: '10px' }}>{tr('Aksi', 'Action')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryItems
                            .filter((i) => !invCategoryFilter || i.category === invCategoryFilter)
                            .filter(
                              (i) =>
                                !invSearch ||
                                i.name.toLowerCase().includes(invSearch.toLowerCase()) ||
                                i.code.toLowerCase().includes(invSearch.toLowerCase()) ||
                                (i.lot_number || '').toLowerCase().includes(invSearch.toLowerCase())
                            )
                            .map((item) => {
                              const isLow = item.current_stock <= item.min_stock_level
                              const expDate = item.expiry_date ? new Date(item.expiry_date) : null
                              const daysToExp = expDate ? Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
                              const isExpSoon = daysToExp !== null && daysToExp <= 60 && daysToExp >= 0
                              const isExpired = daysToExp !== null && daysToExp < 0
                              return (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)', background: isLow ? 'rgba(254, 242, 242, 0.35)' : 'transparent' }}>
                                  <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--primary)' }}>{item.code}</td>
                                  <td style={{ padding: '12px 10px' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                                    {item.description && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.description}</div>}
                                  </td>
                                  <td style={{ padding: '12px 10px' }}>
                                    <span style={{ background: item.category === 'PRODUCT' ? '#e0e7ff' : 'var(--bg-surface)', color: item.category === 'PRODUCT' ? '#3730a3' : 'var(--text-main)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                                      {item.category}
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px 10px' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.supplier?.name || '-'}</div>
                                    {item.supplier?.phone && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.supplier.phone}</div>}
                                  </td>
                                  <td style={{ padding: '12px 10px' }}>
                                    <div style={{ fontWeight: 800, fontSize: '14px', color: isLow ? '#dc2626' : 'var(--text-main)' }}>
                                      {item.current_stock} {item.unit?.code}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                      Min: {item.min_stock_level} {item.unit?.code}
                                    </div>
                                  </td>
                                  <td style={{ padding: '12px 10px' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatRupiah(item.purchase_price)}/{item.unit?.code}</div>
                                    <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                                      Total: {formatRupiah(item.current_stock * item.purchase_price)}
                                    </div>
                                  </td>
                                  <td style={{ padding: '12px 10px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{item.lot_number || '-'}</div>
                                    {expDate ? (
                                      <div style={{ fontSize: '11px', fontWeight: 700, color: isExpired ? '#dc2626' : isExpSoon ? '#d97706' : 'var(--text-muted)' }}>
                                        Exp: {expDate.toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        {isExpired ? ' (EXPIRED)' : isExpSoon ? ` (${daysToExp} ${tr('hr lagi', 'days left')})` : ''}
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Non-Exp</div>
                                    )}
                                  </td>
                                  <td style={{ padding: '12px 10px' }}>
                                    {isLow ? (
                                      <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                                        ⚠️ {tr('Stok Menipis', 'Low Stock')}
                                      </span>
                                    ) : (
                                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                                        ✓ {tr('Aman', 'Safe')}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '12px 10px' }}>
                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                      <button
                                        onClick={() => {
                                          setInItemId(item.id)
                                          setInUnitCost(item.purchase_price)
                                          setInSupplierId(item.supplier_id || '')
                                          setInQty(5)
                                          setInLotNumber(item.lot_number || `LOT-${item.code}`)
                                          setInExpiryDate(item.expiry_date ? item.expiry_date.split('T')[0] : '')
                                          setInNotes(`Restock ${item.name}`)
                                          setShowStockInModal(true)
                                        }}
                                        title={tr('Catat Stok Masuk', 'Record Stock In')}
                                        style={{ padding: '4px 8px', borderRadius: '6px', background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 700 }}
                                      >
                                        {tr('+ Masuk', '+ In')}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setOutItemId(item.id)
                                          setOutBatchId('')
                                          setOutQty(1)
                                          setOutOrderId('')
                                          setOutNotes(tr(`Pemakaian ${item.name}`, `Usage of ${item.name}`))
                                          setShowStockOutModal(true)
                                        }}
                                        title={tr('Catat Pemakaian Bahan', 'Record Material Usage')}
                                        style={{ padding: '4px 8px', borderRadius: '6px', background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 700 }}
                                      >
                                        {tr('- Pakai', '- Use')}
                                      </button>
                                      <button
                                        onClick={() => openEditItemModal(item)}
                                        style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-light)', fontSize: '11px', fontWeight: 600 }}
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: STOK MASUK & KELUAR (AUTOMATIC MOVEMENT LOGS) */}
              {invSubTab === 'movements' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {tr('Riwayat Mutasi Stok Masuk & Keluar', 'Stock In & Out Movement History')}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {tr(
                          'Pencatatan otomatis setiap kali ada penerimaan pembelian atau pemakaian bahan produksi.',
                          'Automatic audit trail whenever purchase receipts or production material usages occur.'
                        )}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['', 'IN', 'OUT'].map((tFilter) => (
                        <button
                          key={tFilter}
                          onClick={() => setMovementTypeFilter(tFilter)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: movementTypeFilter === tFilter ? 'var(--primary)' : 'var(--bg-card)',
                            color: movementTypeFilter === tFilter ? '#ffffff' : 'var(--text-main)',
                            border: '1px solid var(--border-light)',
                          }}
                        >
                          {tFilter === ''
                            ? tr('Semua Mutasi', 'All Movements')
                            : tFilter === 'IN'
                            ? tr('⬇ Stok Masuk (Beli)', '⬇ Stock In (Purchase)')
                            : tr('⬆ Stok Keluar (Pakai)', '⬆ Stock Out (Usage)')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '10px' }}>{tr('Waktu', 'Timestamp')}</th>
                            <th style={{ padding: '10px' }}>{tr('Tipe Mutasi', 'Movement Type')}</th>
                            <th style={{ padding: '10px' }}>{tr('Bahan / Produk', 'Material / Product')}</th>
                            <th style={{ padding: '10px' }}>{tr('Jumlah (Qty)', 'Quantity (Qty)')}</th>
                            <th style={{ padding: '10px' }}>Batch / Lot</th>
                            <th style={{ padding: '10px' }}>{tr('Nilai Satuan', 'Unit Cost')}</th>
                            <th style={{ padding: '10px' }}>{tr('Referensi & Keterangan', 'Reference & Notes')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockMovements
                            .filter((m) => !movementTypeFilter || (movementTypeFilter === 'IN' ? m.quantity > 0 : m.quantity < 0))
                            .map((mv) => {
                              const isIn = mv.quantity > 0
                              return (
                                <tr key={mv.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                    {new Date(mv.created_at).toLocaleString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                  <td style={{ padding: '12px 10px' }}>
                                    <span
                                      style={{
                                        padding: '4px 9px',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        background: isIn ? '#dcfce7' : '#fef3c7',
                                        color: isIn ? '#166534' : '#92400e',
                                      }}
                                    >
                                      {isIn ? tr('⬇ STOK MASUK', '⬇ STOCK IN') : tr('⬆ STOK KELUAR', '⬆ STOCK OUT')}
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--text-main)' }}>
                                    {mv.item?.name}
                                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--primary)' }}>{mv.item?.code}</span>
                                  </td>
                                  <td style={{ padding: '12px 10px', fontWeight: 800, fontSize: '14px', color: isIn ? '#16a34a' : '#dc2626' }}>
                                    {isIn ? `+${mv.quantity}` : mv.quantity} {mv.item?.unit?.code}
                                  </td>
                                  <td style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 600 }}>
                                    {mv.batch?.lot_number || mv.item?.lot_number || '-'}
                                  </td>
                                  <td style={{ padding: '12px 10px' }}>{formatRupiah(mv.unit_cost)}</td>
                                  <td style={{ padding: '12px 10px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', marginRight: '6px' }}>[{mv.reference_type}]</span>
                                    <span style={{ color: 'var(--text-main)' }}>{mv.notes}</span>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: BATCH & EXPIRY TRACKING */}
              {invSubTab === 'batches' && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {tr('Batch & Expiration Date Tracking (Bahan Medis & Gigi Tiruan Resin)', 'Batch & Expiration Date Tracking (Medical & Denture Resin Materials)')}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {tr(
                        'Pemantauan nomor Lot/Batch dan masa berlaku bahan medis seperti akrilik, resin gigi tiruan, porselen, dan valplast (FEFO: First Expired, First Out).',
                        'Monitoring Lot/Batch numbers and shelf-life of medical materials such as acrylic, denture resin, porcelain, and valplast (FEFO: First Expired, First Out).'
                      )}
                    </p>
                  </div>

                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '10px' }}>{tr('No. Batch / Lot', 'Batch / Lot No.')}</th>
                            <th style={{ padding: '10px' }}>{tr('Nama Bahan / Produk', 'Material / Product Name')}</th>
                            <th style={{ padding: '10px' }}>Supplier</th>
                            <th style={{ padding: '10px' }}>{tr('Tanggal Masuk', 'Received Date')}</th>
                            <th style={{ padding: '10px' }}>{tr('Tanggal Kadaluarsa (Exp)', 'Expiration Date (Exp)')}</th>
                            <th style={{ padding: '10px' }}>{tr('Sisa Stok Batch', 'Remaining Batch Stock')}</th>
                            <th style={{ padding: '10px' }}>{tr('Harga Batch', 'Batch Cost')}</th>
                            <th style={{ padding: '10px' }}>{tr('Status Exp', 'Expiry Status')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryBatches.map((b) => {
                            const exp = b.expiry_date ? new Date(b.expiry_date) : null
                            const daysLeft = exp ? Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
                            const isExpired = daysLeft !== null && daysLeft < 0
                            const isSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 60
                            return (
                              <tr key={b.id} style={{ borderBottom: '1px solid var(--border-light)', background: isExpired ? '#fef2f2' : isSoon ? '#fffbeb' : 'transparent' }}>
                                <td style={{ padding: '12px 10px', fontWeight: 800, color: 'var(--primary)' }}>{b.lot_number || 'BATCH-STD'}</td>
                                <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--text-main)' }}>
                                  {b.item?.name}
                                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{b.item?.code} ({b.item?.category})</span>
                                </td>
                                <td style={{ padding: '12px 10px' }}>{b.item?.supplier?.name || '-'}</td>
                                <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                                  {new Date(b.received_date).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td style={{ padding: '12px 10px', fontWeight: 700, color: isExpired ? '#dc2626' : isSoon ? '#d97706' : 'var(--text-main)' }}>
                                  {exp ? exp.toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' }) : tr('Tidak Kadaluarsa', 'Non-Expiring')}
                                </td>
                                <td style={{ padding: '12px 10px', fontWeight: 800 }}>
                                  {b.current_quantity} / {b.initial_quantity} {b.item?.unit?.code}
                                </td>
                                <td style={{ padding: '12px 10px' }}>{formatRupiah(b.unit_cost)}</td>
                                <td style={{ padding: '12px 10px' }}>
                                  {exp === null ? (
                                    <span style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                                      Non-Exp
                                    </span>
                                  ) : isExpired ? (
                                    <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                                      ❌ EXPIRED ({Math.abs(daysLeft!)} {tr('hr lalu', 'd ago')})
                                    </span>
                                  ) : isSoon ? (
                                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                                      ⏳ {tr(`Segera Exp (${daysLeft} hari)`, `Expiring Soon (${daysLeft} days)`)}
                                    </span>
                                  ) : (
                                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                                      ✓ {tr(`Aman (${daysLeft} hari)`, `Safe (${daysLeft} days)`)}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: LAPORAN INVENTORI (REAL-TIME STOCK, VALUATION, TOP USED MATERIALS) */}
              {invSubTab === 'report' && (
                <div className="animate-fade-in">
                  <div className="grid-2col" style={{ gap: '20px', marginBottom: '20px' }}>
                    {/* Top Used Materials Card */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                        🔥 {tr('Bahan Paling Sering Digunakan (Top Used Materials)', 'Top Used Materials in Production')}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        {tr(
                          'Berdasarkan frekuensi pemakaian dan total kuantitas pengeluaran produksi.',
                          'Based on usage frequency and total production consumption quantity.'
                        )}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(inventoryReport?.top_used_materials || []).map((top, idx) => {
                          const maxVal = inventoryReport?.top_used_materials?.[0]?.total_value || 1
                          const pct = Math.min(100, Math.max(12, Math.round((top.total_value / maxVal) * 100)))
                          return (
                            <div key={top.item_id} style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <div>
                                  <span style={{ fontWeight: 800, color: 'var(--primary)', marginRight: '8px' }}>#{idx + 1}</span>
                                  <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>{top.item_name}</span>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626' }}>
                                  {tr('Terpakai:', 'Used:')} {top.total_used} {top.unit_code} ({top.usage_count}x {tr('transaksi', 'tx')})
                                </span>
                              </div>
                              <div style={{ width: '100%', height: '7px', background: 'var(--border-light)', borderRadius: '999px', overflow: 'hidden', marginBottom: '4px' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #0d9488)', borderRadius: '999px' }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                <span>{tr('Kode:', 'Code:')} {top.item_code} ({top.category})</span>
                                <span>{tr('Nilai Pemakaian:', 'Usage Value:')} <strong>{formatRupiah(top.total_value)}</strong></span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Real-Time Stock Valuation Breakdown */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                        💰 {tr('Laporan Valuasi & Stok Real-Time', 'Real-Time Stock & Valuation Report')}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        {tr(
                          `Rincian nilai persediaan setiap bahan terhadap total nilai aset gudang (${formatRupiah(inventoryItems.reduce((a, b) => a + b.current_stock * b.purchase_price, 0))}).`,
                          `Inventory valuation breakdown per material against total warehouse assets (${formatRupiah(inventoryItems.reduce((a, b) => a + b.current_stock * b.purchase_price, 0))}).`
                        )}
                      </p>

                      <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '8px' }}>{tr('Bahan / Produk', 'Material / Product')}</th>
                              <th style={{ padding: '8px' }}>{tr('Stok Real-Time', 'Real-Time Stock')}</th>
                              <th style={{ padding: '8px' }}>{tr('Harga Satuan', 'Unit Price')}</th>
                              <th style={{ padding: '8px' }}>{tr('Total Nilai Stok', 'Total Stock Value')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...inventoryItems]
                              .sort((a, b) => b.current_stock * b.purchase_price - a.current_stock * a.purchase_price)
                              .map((itm) => (
                                <tr key={itm.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                  <td style={{ padding: '9px 8px', fontWeight: 700, color: 'var(--text-main)' }}>{itm.name}</td>
                                  <td style={{ padding: '9px 8px', fontWeight: 700, color: itm.current_stock <= itm.min_stock_level ? '#dc2626' : 'var(--text-main)' }}>
                                    {itm.current_stock} {itm.unit?.code}
                                  </td>
                                  <td style={{ padding: '9px 8px' }}>{formatRupiah(itm.purchase_price)}</td>
                                  <td style={{ padding: '9px 8px', fontWeight: 800, color: '#16a34a' }}>
                                    {formatRupiah(itm.current_stock * itm.purchase_price)}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 5: DATA SUPPLIER */}
              {invSubTab === 'suppliers' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {tr('Daftar Supplier Bahan & Alat Gigi', 'Dental Material & Instrument Suppliers')}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {tr(
                          'Pemasok resmi bahan akrilik, gips, logam, zirconia, dan instrumen dental lab.',
                          'Authorized suppliers for acrylic, gypsum, alloy, zirconia, and dental lab instruments.'
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSupplierModal(true)}
                      style={{ background: 'var(--primary)', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                    >
                      {tr('+ Tambah Supplier', '+ Add Supplier')}
                    </button>
                  </div>

                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '10px' }}>{tr('Kode', 'Code')}</th>
                            <th style={{ padding: '10px' }}>{tr('Nama Perusahaan Supplier', 'Supplier Company Name')}</th>
                            <th style={{ padding: '10px' }}>{tr('Kontak Person', 'Contact Person')}</th>
                            <th style={{ padding: '10px' }}>{tr('No. Telepon / WA', 'Phone / WhatsApp')}</th>
                            <th style={{ padding: '10px' }}>Email</th>
                            <th style={{ padding: '10px' }}>{tr('Alamat', 'Address')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {suppliersList.map((sup) => (
                            <tr key={sup.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--primary)' }}>{sup.code}</td>
                              <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--text-main)' }}>{sup.name}</td>
                              <td style={{ padding: '12px 10px' }}>{sup.contact_person || '-'}</td>
                              <td style={{ padding: '12px 10px', fontWeight: 600 }}>{sup.phone || '-'}</td>
                              <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{sup.email || '-'}</td>
                              <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{sup.address || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: APPROVAL OWNER */}
          {activeTab === 'approvals' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>{t.approvalsTitle}</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{t.approvalsSubtitle}</p>
              </div>

              <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                {purchaseRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-subtle)' }}>
                    {tr('Belum ada pengajuan pembelian bahan saat ini.', 'No material purchase requests at this time.')}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px' }}>{tr('No. PR', 'PR No.')}</th>
                          <th style={{ padding: '12px' }}>{t.colDate}</th>
                          <th style={{ padding: '12px' }}>{tr('Total Estimasi', 'Estimated Total')}</th>
                          <th style={{ padding: '12px' }}>{t.colStatus}</th>
                          <th style={{ padding: '12px' }}>{tr('Aksi Owner', 'Owner Action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseRequests.map((pr) => (
                          <tr key={pr.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{pr.pr_number}</td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(pr.created_at).toLocaleDateString(dateLocale)}</td>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{formatRupiah(pr.total_amount)}</td>
                            <td style={{ padding: '12px' }}>
                              <span
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: pr.status === 'APPROVED_BY_OWNER' ? '#ecfdf5' : pr.status === 'PENDING_APPROVAL' ? '#fef3c7' : '#fee2e2',
                                  color: pr.status === 'APPROVED_BY_OWNER' ? '#059669' : pr.status === 'PENDING_APPROVAL' ? '#d97706' : '#dc2626',
                                }}
                              >
                                {pr.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {pr.status === 'PENDING_APPROVAL' ? (
                                <button
                                  onClick={() => handleApprovePR(pr.id)}
                                  style={{ background: '#10b981', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}
                                >
                                  {t.approveAccBtn}
                                </button>
                              ) : pr.status === 'APPROVED_BY_OWNER' ? (
                                <button
                                  onClick={() => handleReceiveStock(pr.id)}
                                  style={{ background: 'var(--primary)', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}
                                >
                                  {t.receiveStockBtn}
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-subtle)' }}>-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PENJUALAN & KEUANGAN (INVOICE & HASIL ORDER) */}
          {activeTab === 'finance' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {tr('Penjualan & Keuangan (Invoice & Hasil Order)', 'Sales & Finance (Invoices & Order Results)')}
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {tr(
                      'Mencatat seluruh transaksi & arus kas: invoice pembayaran otomatis dari hasil produksi SPK, laporan penjualan harian/bulanan (omzet, laba kotor, pelanggan aktif), pengeluaran biaya produksi (bahan, tenaga kerja, operasional), dan history order pelanggan.',
                      'Track all transactions & cash flow: automated billing invoices from SPK production results, daily/monthly sales reports (revenue, gross profit, active customers), production expenses (materials, labor, operations), and customer order history.'
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleSyncInvoices}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'var(--bg-card)',
                      color: 'var(--primary)',
                      border: '1.5px solid var(--primary)',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  >
                    <RefreshCw size={15} /> {tr('Sinkronkan Invoice dari Produksi', 'Sync Invoices from Production')}
                  </button>
                  <button
                    onClick={() => {
                      setExpCategoryId(expenseCategories[0]?.id || 1)
                      setExpDate(new Date().toISOString().split('T')[0])
                      setExpAmount(250000)
                      setExpDesc('')
                      setShowExpenseModal(true)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  >
                    <Plus size={15} /> {tr('Catat Pengeluaran / Biaya Produksi', 'Record Expense / Production Cost')}
                  </button>
                </div>
              </div>

              {/* 4 KPI Utama Penjualan & Keuangan */}
              <div className="grid-kpi" style={{ marginBottom: '20px' }}>
                <div
                  onClick={() => setFinSubTab('sales_report')}
                  style={{ cursor: 'pointer', background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                    {tr('Omzet Penjualan (Bulanan & Harian)', 'Sales Revenue (Monthly & Daily)')}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatRupiah(financeSummary?.monthly_omzet ?? invoices.reduce((acc, i) => acc + i.total_amount, 0))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700, marginTop: '4px' }}>
                    {tr('Hari ini:', 'Today:')} {formatRupiah(financeSummary?.daily_omzet || 0)} • Total {financeSummary?.total_invoices_count ?? invoices.length} {tr('Invoice', 'Invoices')}
                  </div>
                </div>

                <div
                  onClick={() => setFinSubTab('sales_report')}
                  style={{ cursor: 'pointer', background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                    {tr('Laba Kotor (Gross Profit)', 'Gross Profit')}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>
                    {formatRupiah(financeSummary?.gross_profit || 0)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
                    {tr('Laba Bersih Operasional:', 'Net Operating Profit:')} <strong style={{ color: '#059669' }}>{formatRupiah(financeSummary?.net_operating_profit || 0)}</strong>
                  </div>
                </div>

                <div
                  onClick={() => setFinSubTab('invoices')}
                  style={{ cursor: 'pointer', background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                    {tr('Status Tagihan Invoice (Belum Lunas)', 'Outstanding Invoice Receivables (Unpaid)')}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}>
                    {formatRupiah(financeSummary?.total_receivables ?? invoices.reduce((acc, i) => acc + i.balance_due, 0))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                    {tr('Sudah Terbayar (Kas Masuk):', 'Paid (Cash In):')} {formatRupiah(financeSummary?.total_paid ?? invoices.reduce((acc, i) => acc + i.paid_amount, 0))}
                  </div>
                </div>

                <div
                  onClick={() => setFinSubTab('customers')}
                  style={{ cursor: 'pointer', background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                    {tr('Pelanggan Aktif (Dokter / Klinik)', 'Active Customers (Dentists / Clinics)')}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#7c3aed' }}>
                    {financeSummary?.active_customers_count || customers.length} {tr('Dokter', 'Dentists')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 700, marginTop: '4px' }}>
                    {tr(
                      `Total ${financeSummary?.total_customers_count || customers.length} Mitra Terdaftar • Lihat History Order →`,
                      `Total ${financeSummary?.total_customers_count || customers.length} Registered Partners • View Order History →`
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-Tab Navigasi Penjualan & Keuangan */}
              <div className="tabs-scrollable" style={{ marginBottom: '18px' }}>
                {[
                  { key: 'invoices', label: tr(`🧾 Invoice Pembayaran & Hasil Order (${invoices.length})`, `🧾 Payment Invoices & Order Results (${invoices.length})`) },
                  { key: 'sales_report', label: tr(`📈 Laporan Penjualan Harian & Bulanan`, `📈 Daily & Monthly Sales Report`) },
                  { key: 'expenses', label: tr(`💸 Pengeluaran & Biaya Produksi (${expenses.length})`, `💸 Expenses & Production Costs (${expenses.length})`) },
                  { key: 'customers', label: tr(`🏥 Data Pelanggan & History Order (${customers.length})`, `🏥 Customer Directory & Order History (${customers.length})`) },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setFinSubTab(st.key as any)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      background: finSubTab === st.key ? 'var(--primary)' : 'var(--bg-card)',
                      color: finSubTab === st.key ? '#ffffff' : 'var(--text-muted)',
                      border: finSubTab === st.key ? 'none' : '1px solid var(--border-light)',
                      boxShadow: finSubTab === st.key ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* SUB-TAB 1: INVOICE PEMBAYARAN & HASIL ORDER (INTEGRASI PRODUKSI) */}
              {finSubTab === 'invoices' && (
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  {/* Banner Integrasi Produksi -> Invoice Otomatis */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af' }}>
                        ⚡ {tr('Integrasi Otomatis dengan Produksi & Hasil Order (SPK & QC)', 'Automated Integration with Production & Order Results (SPK & QC)')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#1e3a8a' }}>
                        {lang === 'en' ? (
                          <>
                            Every Production SPK that <strong>Passes QC / Completes Production (COMPLETED)</strong> automatically generates a <strong>Payment Invoice</strong> with attached <strong>Order Result & QC Report</strong>.
                          </>
                        ) : (
                          <>
                            Setiap SPK Produksi yang <strong>Lolos QC / Selesai Produksi (COMPLETED)</strong> otomatis dibuatkan <strong>Invoice Pembayaran</strong> beserta lampiran <strong>Hasil Order & QC Report</strong>.
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder={tr('Cari No. Invoice, Dokter, Pasien, SPK...', 'Search Invoice No., Dentist, Patient, SPK...')}
                        value={finInvoiceSearch}
                        onChange={(e) => setFinInvoiceSearch(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          fontSize: '12px',
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          minWidth: '220px',
                        }}
                      />
                      <select
                        value={finInvoiceStatusFilter}
                        onChange={(e) => setFinInvoiceStatusFilter(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                        }}
                      >
                        <option value="">{tr('Semua Status Pembayaran', 'All Payment Statuses')}</option>
                        <option value="UNPAID">{tr('BELUM LUNAS (UNPAID)', 'UNPAID')}</option>
                        <option value="PARTIALLY_PAID">{tr('CICILAN (PARTIALLY PAID)', 'PARTIALLY PAID')}</option>
                        <option value="PAID">{tr('LUNAS (PAID)', 'PAID')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Daftar SPK yang belum ada invoice (jika ada order yang masih proses tapi ingin dibuatkan invoice lebih awal) */}
                  {(() => {
                    const uninvoicedOrders = orders.filter(
                      (o) => !invoices.some((inv) => inv.production_order_id === o.id || inv.production_order?.id === o.id)
                    )
                    if (uninvoicedOrders.length === 0) return null
                    return (
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'var(--bg-surface)',
                          border: '1px dashed var(--border-light)',
                          marginBottom: '16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '10px',
                        }}
                      >
                        <div style={{ fontSize: '12px', color: 'var(--text-main)' }}>
                          📌 {tr('Terdapat', 'There are')} <strong>{uninvoicedOrders.length} {tr('SPK Aktif', 'Active SPK Orders')}</strong> {tr('dalam proses produksi yang belum diterbitkan tagihan awal:', 'in production without an initial invoice:')}{' '}
                          {uninvoicedOrders.slice(0, 3).map((uo) => (
                            <span key={uo.id} style={{ marginRight: '8px', fontWeight: 700, color: 'var(--primary)' }}>
                              {uo.order_number} ({uo.patient_name} - {formatRupiah(uo.total_price)})
                            </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {uninvoicedOrders.slice(0, 2).map((uo) => (
                            <button
                              key={uo.id}
                              onClick={() => handleCreateInvoice(uo.id)}
                              style={{
                                padding: '5px 10px',
                                background: '#0284c7',
                                color: '#ffffff',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              {tr(`+ Buat Invoice ${uo.order_number}`, `+ Create Invoice ${uo.order_number}`)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px' }}>{tr('No. Invoice & Tgl', 'Invoice No. & Date')}</th>
                          <th style={{ padding: '12px' }}>{tr('Pelanggan (Dokter / Klinik)', 'Customer (Dentist / Clinic)')}</th>
                          <th style={{ padding: '12px' }}>{tr('Hasil Order Produksi & QC', 'Production Order Result & QC')}</th>
                          <th style={{ padding: '12px' }}>{tr('Informasi Tagihan', 'Billing Details')}</th>
                          <th style={{ padding: '12px' }}>{tr('Status Pembayaran', 'Payment Status')}</th>
                          <th style={{ padding: '12px' }}>{tr('Aksi', 'Action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices
                          .filter((inv) => {
                            if (finInvoiceStatusFilter && inv.status !== finInvoiceStatusFilter) return false
                            if (!finInvoiceSearch.trim()) return true
                            const q = finInvoiceSearch.toLowerCase()
                            const orderObj = inv.production_order || orders.find((o) => o.id === inv.production_order_id)
                            return (
                              inv.invoice_number.toLowerCase().includes(q) ||
                              (inv.customer?.name || '').toLowerCase().includes(q) ||
                              (inv.customer?.clinic_name || '').toLowerCase().includes(q) ||
                              (orderObj?.order_number || '').toLowerCase().includes(q) ||
                              (orderObj?.patient_name || '').toLowerCase().includes(q)
                            )
                          })
                          .map((inv) => {
                            const orderObj = inv.production_order || orders.find((o) => o.id === inv.production_order_id)
                            const qcPassedObj = orderObj?.quality_checks?.find((q) => q.passed)
                            return (
                              <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '14px' }}>{inv.invoice_number}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {tr('Terbit:', 'Issued:')} {new Date(inv.issue_date).toLocaleDateString(dateLocale)}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {tr('Jatuh Tempo:', 'Due Date:')} {new Date(inv.due_date).toLocaleDateString(dateLocale)}
                                  </div>
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      marginTop: '4px',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      background: '#e0f2fe',
                                      color: '#0369a1',
                                    }}
                                  >
                                    ⚡ {tr('Auto-Sync Produksi', 'Production Auto-Sync')}
                                  </span>
                                </td>

                                <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{inv.customer?.name || '-'}</div>
                                  <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>{inv.customer?.clinic_name || '-'}</div>
                                  {inv.customer?.phone && (
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>📱 {inv.customer.phone}</div>
                                  )}
                                  {inv.customer?.address && (
                                    <div style={{ fontSize: '11px', color: 'var(--text-subtle)', maxWidth: '210px' }}>📍 {inv.customer.address}</div>
                                  )}
                                </td>

                                <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                  {orderObj ? (
                                    <div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{orderObj.order_number}</span>
                                        <span
                                          style={{
                                            padding: '2px 7px',
                                            borderRadius: '999px',
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            background:
                                              orderObj.status === 'COMPLETED' || orderObj.status === 'DELIVERED' ? '#dcfce7' : '#fef3c7',
                                            color:
                                              orderObj.status === 'COMPLETED' || orderObj.status === 'DELIVERED' ? '#15803d' : '#b45309',
                                          }}
                                        >
                                          {orderObj.status === 'DELIVERED'
                                            ? tr('🚚 DIKIRIM', '🚚 DELIVERED')
                                            : orderObj.status === 'COMPLETED'
                                            ? tr('✓ SELESAI PRODUKSI', '✓ COMPLETED')
                                            : orderObj.status}
                                        </span>
                                      </div>
                                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginTop: '3px' }}>
                                        {tr('Pasien:', 'Patient:')} {orderObj.patient_name}
                                      </div>
                                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        🦷 {orderObj.denture_type?.name || inv.items?.[0]?.description || tr('Restorasi Gigi Tiruan', 'Denture Restoration')}
                                      </div>
                                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {tr('Elemen:', 'Teeth:')} <strong>{orderObj.teeth_numbers}</strong> • Shade: <strong>{orderObj.shade_guide || 'A2'}</strong>
                                      </div>
                                      {qcPassedObj && (
                                        <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700, marginTop: '3px' }}>
                                          ✓ {tr('Lolos QC:', 'QC Passed:')} {qcPassedObj.defect_notes || tr('Presisi & Estetika Terverifikasi', 'Precision & Aesthetics Verified')}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                      {inv.items?.[0]?.description || tr('Tagihan Produksi Gigi Tiruan', 'Denture Production Invoice')}
                                    </div>
                                  )}
                                </td>

                                <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    Subtotal: {formatRupiah(inv.subtotal || inv.total_amount)}
                                  </div>
                                  {inv.discount_amount > 0 && (
                                    <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600 }}>
                                      {tr('Diskon Loyalty:', 'Loyalty Discount:')} -{formatRupiah(inv.discount_amount)}
                                    </div>
                                  )}
                                  <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '14px', marginTop: '2px' }}>
                                    Total: {formatRupiah(inv.total_amount)}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                                    {tr('Dibayar:', 'Paid:')} {formatRupiah(inv.paid_amount)}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '12px',
                                      color: inv.balance_due > 0 ? '#dc2626' : '#059669',
                                      fontWeight: 800,
                                    }}
                                  >
                                    {tr('Sisa:', 'Balance:')} {formatRupiah(inv.balance_due)}
                                  </div>
                                </td>

                                <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      padding: '5px 10px',
                                      borderRadius: '999px',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      background:
                                        inv.status === 'PAID'
                                          ? '#dcfce7'
                                          : inv.status === 'PARTIALLY_PAID'
                                          ? '#fef3c7'
                                          : '#fee2e2',
                                      color:
                                        inv.status === 'PAID'
                                          ? '#15803d'
                                          : inv.status === 'PARTIALLY_PAID'
                                          ? '#b45309'
                                          : '#dc2626',
                                    }}
                                  >
                                    {inv.status === 'PAID'
                                      ? tr('✓ LUNAS (PAID)', '✓ PAID')
                                      : inv.status === 'PARTIALLY_PAID'
                                      ? tr('⏳ CICILAN (PARTIAL)', '⏳ PARTIALLY PAID')
                                      : tr('❗ BELUM LUNAS', '❗ UNPAID')}
                                  </span>
                                  {inv.payments && inv.payments.length > 0 && (
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                      {inv.payments.length}x {tr('riwayat bayar', 'payments')} ({inv.payments[inv.payments.length - 1].payment_method})
                                    </div>
                                  )}
                                </td>

                                <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <button
                                      onClick={() => setViewingInvoice(inv)}
                                      style={{
                                        background: 'var(--bg-surface)',
                                        color: 'var(--primary)',
                                        border: '1px solid var(--primary)',
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        fontWeight: 700,
                                        fontSize: '11px',
                                        textAlign: 'center',
                                      }}
                                    >
                                      📄 {tr('Nota & Hasil Order', 'Invoice & Order Result')}
                                    </button>
                                    {inv.balance_due > 0 && (
                                      <button
                                        onClick={() => {
                                          setSelectedInvoice(inv)
                                          setPaymentAmount(inv.balance_due)
                                        }}
                                        style={{
                                          background: 'var(--primary)',
                                          color: '#ffffff',
                                          padding: '6px 10px',
                                          borderRadius: '6px',
                                          fontWeight: 700,
                                          fontSize: '11px',
                                          textAlign: 'center',
                                        }}
                                      >
                                        💳 {t.recordPaymentBtn}
                                      </button>
                                    )}
                                    {inv.customer?.phone && (
                                      <button
                                        onClick={() => {
                                          const msg = `Halo ${inv.customer?.name}, berikut informasi tagihan & hasil order Dental Lab:\nNo. Invoice: *${inv.invoice_number}*\nNo. SPK: *${orderObj?.order_number || '-'}* (Pasien: ${orderObj?.patient_name || '-'})\nTotal Tagihan: *${formatRupiah(inv.total_amount)}*\nSisa Tagihan: *${formatRupiah(inv.balance_due)}* (${inv.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}).\nTerima kasih dokter!`
                                          openWhatsApp(inv.customer.phone, msg)
                                        }}
                                        style={{
                                          background: '#ecfdf5',
                                          color: '#059669',
                                          border: '1px solid #a7f3d0',
                                          padding: '5px 10px',
                                          borderRadius: '6px',
                                          fontWeight: 700,
                                          fontSize: '11px',
                                        }}
                                      >
                                        💬 {tr('Kirim WA Tagihan', 'Send WhatsApp Bill')}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: LAPORAN PENJUALAN HARIAN & BULANAN (OMZET, LABA KOTOR, PELANGGAN AKTIF) */}
              {finSubTab === 'sales_report' && (
                <div>
                  {/* Kartu Perhitungan Laba Kotor (Gross Profit) & Laba Bersih */}
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '16px',
                      border: '1px solid var(--border-light)',
                      padding: '20px',
                      marginBottom: '20px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                      📊 {tr('Ringkasan Laporan Penjualan, Laba Kotor (Gross Profit) & Arus Kas', 'Sales Report Summary, Gross Profit & Cash Flow')}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      {tr(
                        'Perhitungan otomatis dari seluruh tagihan produksi (Omzet) dikurangi Biaya Produksi (Bahan + Tenaga Kerja) dan Biaya Operasional.',
                        'Automatically calculated from total production invoices (Revenue) minus Production Costs (Materials + Labor) and Operating Expenses.'
                      )}
                    </p>

                    <div className="grid-kpi">
                      <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                          {tr('1. Total Omzet Penjualan', '1. Total Sales Revenue')}
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                          {formatRupiah(financeSummary?.total_invoiced || 0)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {tr('Bulan Ini:', 'This Month:')} <strong>{formatRupiah(financeSummary?.monthly_omzet || 0)}</strong>
                        </div>
                      </div>

                      <div style={{ padding: '14px', borderRadius: '12px', background: '#fff7ed', border: '1px solid #fed7aa' }}>
                        <div style={{ fontSize: '11px', color: '#9a3412', fontWeight: 700 }}>
                          {tr('2. HPP (Bahan + Tenaga Kerja)', '2. COGS (Materials + Labor)')}
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#ea580c', marginTop: '4px' }}>
                          -{formatRupiah((financeSummary?.material_cost || 0) + (financeSummary?.labor_cost || 0))}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9a3412', marginTop: '4px' }}>
                          {tr('Bahan:', 'Materials:')} {formatRupiah(financeSummary?.material_cost || 0)} • {tr('SDM:', 'Labor:')} {formatRupiah(financeSummary?.labor_cost || 0)}
                        </div>
                      </div>

                      <div style={{ padding: '14px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                        <div style={{ fontSize: '11px', color: '#065f46', fontWeight: 700 }}>
                          {tr('3. Laba Kotor (Gross Profit)', '3. Gross Profit')}
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                          {formatRupiah(financeSummary?.gross_profit || 0)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#047857', marginTop: '4px' }}>
                          {tr('Margin Kotor:', 'Gross Margin:')}{' '}
                          <strong>
                            {financeSummary && financeSummary.total_invoiced > 0
                              ? `${Math.round((financeSummary.gross_profit / financeSummary.total_invoiced) * 100)}%`
                              : '0%'}
                          </strong>
                        </div>
                      </div>

                      <div style={{ padding: '14px', borderRadius: '12px', background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                        <div style={{ fontSize: '11px', color: '#5b21b6', fontWeight: 700 }}>
                          {tr('4. Laba Bersih & Pelanggan Aktif', '4. Net Profit & Active Customers')}
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#6d28d9', marginTop: '4px' }}>
                          {formatRupiah(financeSummary?.net_operating_profit || 0)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#5b21b6', marginTop: '4px' }}>
                          {tr('Pelanggan Aktif:', 'Active Customers:')} <strong>{financeSummary?.active_customers_count || customers.length} {tr('Dokter/Klinik', 'Dentists/Clinics')}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabel Penjualan Harian & Bulanan */}
                  <div className="grid-2col" style={{ gap: '20px' }}>
                    {/* Tabel Laporan Penjualan Harian */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                        📅 {tr('Laporan Penjualan Harian', 'Daily Sales Report')}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        {tr('Rekapitulasi omzet harian, jumlah SPK/Invoice, dan pelanggan aktif per hari.', 'Daily revenue breakdown, SPK/Invoice count, and active customers per day.')}
                      </p>
                      <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '10px' }}>{tr('Tanggal', 'Date')}</th>
                              <th style={{ padding: '10px' }}>{tr('Order & Dokter Aktif', 'Orders & Active Dentists')}</th>
                              <th style={{ padding: '10px' }}>{tr('Omzet Harian', 'Daily Revenue')}</th>
                              <th style={{ padding: '10px' }}>{tr('Terbayar', 'Paid')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(financeSummary?.daily_breakdown || []).map((d) => (
                              <tr key={d.period} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-main)' }}>
                                  {new Date(d.period).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td style={{ padding: '10px', color: 'var(--text-muted)' }}>
                                  <strong>{d.orders_count}</strong> {tr('Order', 'Orders')} • <strong>{d.active_customers}</strong> {tr('Dokter', 'Dentists')}
                                </td>
                                <td style={{ padding: '10px', fontWeight: 800, color: 'var(--primary)' }}>{formatRupiah(d.omzet)}</td>
                                <td style={{ padding: '10px', fontWeight: 700, color: '#16a34a' }}>{formatRupiah(d.paid_amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Tabel Laporan Penjualan Bulanan */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                        🗓️ {tr('Laporan Penjualan Bulanan', 'Monthly Sales Report')}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        {tr('Rekapitulasi omzet bulanan, penerimaan kas, piutang, dan jumlah pelanggan aktif.', 'Monthly revenue summary, cash receipts, receivables, and active customer count.')}
                      </p>
                      <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '10px' }}>{tr('Periode Bulan', 'Month Period')}</th>
                              <th style={{ padding: '10px' }}>{tr('Order & Pelanggan Aktif', 'Orders & Active Customers')}</th>
                              <th style={{ padding: '10px' }}>{tr('Omzet Bulanan', 'Monthly Revenue')}</th>
                              <th style={{ padding: '10px' }}>{tr('Sisa Piutang', 'Unpaid Balance')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(financeSummary?.monthly_breakdown || []).map((m) => (
                              <tr key={m.period} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '10px', fontWeight: 800, color: 'var(--primary)' }}>{m.period}</td>
                                <td style={{ padding: '10px', color: 'var(--text-muted)' }}>
                                  <strong>{m.orders_count}</strong> {tr('Order', 'Orders')} • <strong>{m.active_customers}</strong> {tr('Dokter Aktif', 'Active Dentists')}
                                </td>
                                <td style={{ padding: '10px', fontWeight: 800, color: 'var(--text-main)' }}>{formatRupiah(m.omzet)}</td>
                                <td style={{ padding: '10px', fontWeight: 700, color: m.unpaid_amount > 0 ? '#dc2626' : '#059669' }}>
                                  {formatRupiah(m.unpaid_amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: PENGELUARAN & BIAYA PRODUKSI (BAHAN, TENAGA KERJA, OPERASIONAL) */}
              {finSubTab === 'expenses' && (
                <div>
                  {/* 3 Kartu Kategori Biaya: Bahan, Tenaga Kerja, Operasional */}
                  <div className="grid-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '20px' }}>
                    <div
                      onClick={() => setFinExpenseCatFilter(finExpenseCatFilter === 1 ? 0 : 1)}
                      style={{
                        cursor: 'pointer',
                        background: 'var(--bg-card)',
                        padding: '18px',
                        borderRadius: '14px',
                        border: finExpenseCatFilter === 1 ? '2px solid #0284c7' : '1px solid var(--border-light)',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7' }}>
                        🧪 {tr('1. Biaya Bahan Produksi (RAW_MATERIAL)', '1. Production Material Cost (RAW_MATERIAL)')}
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                        {formatRupiah(
                          financeSummary?.material_cost ??
                            expenses.filter((e) => e.category?.code === 'RAW_MATERIAL' || e.category_id === 1).reduce((s, e) => s + e.amount, 0)
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {tr('Blok Zirconia, Gips Die Stone, Ingot E-Max, Akrilik, Alloy', 'Zirconia Blocks, Die Stone Gypsum, E-Max Ingots, Acrylic, Alloy')}
                      </div>
                    </div>

                    <div
                      onClick={() => setFinExpenseCatFilter(finExpenseCatFilter === 2 ? 0 : 2)}
                      style={{
                        cursor: 'pointer',
                        background: 'var(--bg-card)',
                        padding: '18px',
                        borderRadius: '14px',
                        border: finExpenseCatFilter === 2 ? '2px solid #d97706' : '1px solid var(--border-light)',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#d97706' }}>
                        👨‍🔬 {tr('2. Biaya Tenaga Kerja (LABOR)', '2. Technician Labor Cost (LABOR)')}
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                        {formatRupiah(
                          financeSummary?.labor_cost ??
                            expenses.filter((e) => e.category?.code === 'LABOR' || e.category_id === 2).reduce((s, e) => s + e.amount, 0)
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {tr('Gaji & Insentif Tekniker per Unit, Uang Lembur Produksi', 'Technician Salary & Unit Incentives, Production Overtime Pay')}
                      </div>
                    </div>

                    <div
                      onClick={() => setFinExpenseCatFilter(finExpenseCatFilter === 3 ? 0 : 3)}
                      style={{
                        cursor: 'pointer',
                        background: 'var(--bg-card)',
                        padding: '18px',
                        borderRadius: '14px',
                        border: finExpenseCatFilter === 3 ? '2px solid #7c3aed' : '1px solid var(--border-light)',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed' }}>
                        ⚡ {tr('3. Biaya Operasional Lab (OPERATIONAL)', '3. Lab Operating Expenses (OPERATIONAL)')}
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                        {formatRupiah(
                          financeSummary?.operational_cost ??
                            expenses.filter((e) => e.category?.code === 'OPERATIONAL' || e.category_id === 3).reduce((s, e) => s + e.amount, 0)
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {tr('Listrik Furnace/CAD-CAM, Kurir Antar-Jemput, Maintenance', 'Furnace/CAD-CAM Electricity, Pickup-Delivery Courier, Maintenance')}
                      </div>
                    </div>
                  </div>

                  {/* Tabel Rincian Pengeluaran & Biaya Produksi */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                          {tr('Buku Kas Pengeluaran & Biaya Produksi', 'Expense & Production Cost Ledger')}
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {tr(
                            'Pencatatan biaya bahan baku, biaya tenaga kerja tekniker, dan biaya operasional harian laboratorium.',
                            'Record raw material expenses, technician labor costs, and daily laboratory operating expenses.'
                          )}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                          value={finExpenseCatFilter}
                          onChange={(e) => setFinExpenseCatFilter(Number(e.target.value))}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                          }}
                        >
                          <option value={0}>{tr('Semua Kategori Biaya', 'All Expense Categories')}</option>
                          <option value={1}>🧪 {tr('Biaya Bahan Produksi', 'Production Material Cost')}</option>
                          <option value={2}>👨‍🔬 {tr('Biaya Tenaga Kerja', 'Technician Labor Cost')}</option>
                          <option value={3}>⚡ {tr('Biaya Operasional Lab', 'Lab Operating Expense')}</option>
                        </select>
                        <button
                          onClick={() => setShowExpenseModal(true)}
                          style={{
                            padding: '8px 14px',
                            background: 'var(--primary)',
                            color: '#ffffff',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          {tr('+ Tambah Pengeluaran', '+ Add Expense')}
                        </button>
                      </div>
                    </div>

                    {expenses.length === 0 ? (
                      <div style={{ color: 'var(--text-subtle)', fontSize: '13px', padding: '24px', textAlign: 'center' }}>
                        {tr('Belum ada pengeluaran dicatat.', 'No expenses recorded yet.')}
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '12px' }}>{tr('No. Biaya', 'Expense No.')}</th>
                              <th style={{ padding: '12px' }}>{tr('Kategori Biaya', 'Expense Category')}</th>
                              <th style={{ padding: '12px' }}>{tr('Keterangan Pengeluaran', 'Expense Description')}</th>
                              <th style={{ padding: '12px' }}>{tr('Tanggal', 'Date')}</th>
                              <th style={{ padding: '12px' }}>{tr('Nominal Biaya', 'Amount')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expenses
                              .filter((e) => (finExpenseCatFilter === 0 ? true : e.category_id === finExpenseCatFilter))
                              .map((e) => {
                                const code = e.category?.code || (e.category_id === 1 ? 'RAW_MATERIAL' : e.category_id === 2 ? 'LABOR' : 'OPERATIONAL')
                                return (
                                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '12px', fontWeight: 800, color: 'var(--primary)' }}>{e.expense_number}</td>
                                    <td style={{ padding: '12px' }}>
                                      <span
                                        style={{
                                          padding: '4px 9px',
                                          borderRadius: '999px',
                                          fontSize: '11px',
                                          fontWeight: 800,
                                          background:
                                            code === 'RAW_MATERIAL'
                                              ? '#e0f2fe'
                                              : code === 'LABOR'
                                              ? '#fef3c7'
                                              : '#f3e8ff',
                                          color:
                                            code === 'RAW_MATERIAL'
                                              ? '#0369a1'
                                              : code === 'LABOR'
                                              ? '#b45309'
                                              : '#6d28d9',
                                        }}
                                      >
                                        {code === 'RAW_MATERIAL'
                                          ? tr('🧪 Biaya Bahan', '🧪 Material Cost')
                                          : code === 'LABOR'
                                          ? tr('👨‍🔬 Tenaga Kerja', '👨‍🔬 Labor Cost')
                                          : tr('⚡ Operasional', '⚡ Operating')}
                                      </span>
                                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                                        {e.category?.name}
                                      </div>
                                    </td>
                                    <td style={{ padding: '12px', color: 'var(--text-main)', fontWeight: 600 }}>{e.description}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                                      {new Date(e.expense_date).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '12px', fontWeight: 800, color: '#dc2626' }}>{formatRupiah(e.amount)}</td>
                                  </tr>
                                )
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: DATA PELANGGAN (DOKTER / KLINIK) & HISTORY ORDER KEUANGAN */}
              {finSubTab === 'customers' && (
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                        🏥 {tr('Data Pelanggan (Dokter / Klinik) & History Order Transaksi', 'Customer Directory (Dentists / Clinics) & Transaction Order History')}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tr(
                          'Informasi lengkap nama dokter/klinik, No. HP, alamat pengiriman, daftar history order SPK, serta total tagihan & pembayaran.',
                          'Complete dentist/clinic details, phone number, delivery address, SPK order history list, and total billing & payments.'
                        )}
                      </p>
                    </div>
                    <button
                      onClick={openCreateCustomerModal}
                      style={{
                        padding: '8px 14px',
                        background: 'var(--primary)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {tr('+ Tambah Pelanggan (Dokter/Klinik)', '+ Add Customer (Dentist/Clinic)')}
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px' }}>{tr('Nama Dokter & Klinik', 'Dentist & Clinic Name')}</th>
                          <th style={{ padding: '12px' }}>{tr('No. HP & Alamat Lengkap', 'Phone & Full Address')}</th>
                          <th style={{ padding: '12px' }}>{tr('History Order Produksi (SPK)', 'Production Order History (SPK)')}</th>
                          <th style={{ padding: '12px' }}>{tr('Rekap Tagihan & Pembayaran', 'Billing & Payment Summary')}</th>
                          <th style={{ padding: '12px' }}>{tr('Aksi', 'Action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((c) => {
                          const custOrders = orders.filter((o) => o.customer_id === c.id)
                          const custInvoices = invoices.filter((i) => i.customer_id === c.id)
                          const totalBilled = custInvoices.reduce((s, i) => s + i.total_amount, 0)
                          const totalPaid = custInvoices.reduce((s, i) => s + i.paid_amount, 0)
                          const totalDue = custInvoices.reduce((s, i) => s + i.balance_due, 0)

                          return (
                            <tr key={c.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{c.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>{c.clinic_name || '-'}</div>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    marginTop: '4px',
                                    padding: '2px 7px',
                                    borderRadius: '999px',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    background: '#f3e8ff',
                                    color: '#6d28d9',
                                  }}
                                >
                                  {c.loyalty_tier || 'REGULAR'} • {tr('Diskon', 'Discount')} {c.discount_percent || 0}%
                                </span>
                              </td>

                              <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '12px' }}>📱 {c.phone || '-'}</div>
                                {c.email && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>✉️ {c.email}</div>}
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px', maxWidth: '240px' }}>
                                  📍 {c.address || tr('Alamat klinik belum diisi', 'Clinic address not set')}
                                </div>
                              </td>

                              <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '12px', marginBottom: '4px' }}>
                                  📋 {custOrders.length} {tr('History Order SPK:', 'SPK Order History:')}
                                </div>
                                {custOrders.length === 0 ? (
                                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                                    {tr('Belum ada riwayat order', 'No order history yet')}
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {custOrders.slice(0, 3).map((co) => (
                                      <div
                                        key={co.id}
                                        style={{
                                          fontSize: '11px',
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          background: 'var(--bg-surface)',
                                          border: '1px solid var(--border-light)',
                                        }}
                                      >
                                        <strong style={{ color: 'var(--primary)' }}>{co.order_number}</strong> • {tr('Pasien:', 'Patient:')} <strong>{co.patient_name}</strong> ({co.denture_type?.name || tr('Gigi Tiruan', 'Denture')}) —{' '}
                                        <span style={{ fontWeight: 700, color: co.status === 'COMPLETED' || co.status === 'DELIVERED' ? '#16a34a' : '#d97706' }}>
                                          {co.status}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>

                              <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-main)' }}>
                                  {tr('Total Tagihan:', 'Total Billed:')} <strong>{formatRupiah(totalBilled)}</strong>
                                </div>
                                <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>
                                  {tr('Sudah Lunas:', 'Total Paid:')} {formatRupiah(totalPaid)}
                                </div>
                                <div style={{ fontSize: '12px', color: totalDue > 0 ? '#dc2626' : '#059669', fontWeight: 800 }}>
                                  {tr('Sisa Piutang:', 'Balance Due:')} {formatRupiah(totalDue)}
                                </div>
                              </td>

                              <td style={{ padding: '12px', verticalAlign: 'top' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <button
                                    onClick={() => openEditCustomerModal(c)}
                                    style={{
                                      padding: '5px 10px',
                                      background: 'var(--bg-surface)',
                                      color: 'var(--text-main)',
                                      border: '1px solid var(--border-light)',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                    }}
                                  >
                                    ✏️ {tr('Edit Data Dokter', 'Edit Dentist Info')}
                                  </button>
                                  {c.phone && (
                                    <button
                                      onClick={() =>
                                        openWhatsApp(
                                          c.phone,
                                          `Halo ${c.name} (${c.clinic_name || 'Klinik'}), berikut rekap transaksi Dental Lab: Total Order ${custOrders.length} SPK, Sisa Tagihan: ${formatRupiah(totalDue)}.`
                                        )
                                      }
                                      style={{
                                        padding: '5px 10px',
                                        background: '#ecfdf5',
                                        color: '#059669',
                                        border: '1px solid #a7f3d0',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                      }}
                                    >
                                      💬 {tr('Hubungi WA', 'Contact WhatsApp')}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: MASTER DOKTER & PASIEN (CRM) */}
          {activeTab === 'customers' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {tr('Master Dokter & Pasien (CRM Pelanggan)', 'Dentist & Patient Master (CRM)')}
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {tr(
                      'Database dokter/klinik (kontak, preferensi, catatan khusus), master data pasien, history order & feedback, reminder follow-up order, serta sistem loyalty/diskon otomatis.',
                      'Dentist/clinic database (contacts, preferences, special notes), patient master directory, order history & feedback, follow-up reminders, and automatic loyalty discount system.'
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => openCreatePatientModal()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', color: 'var(--primary)', border: '1.5px solid var(--primary)', padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                  >
                    <Plus size={15} /> {tr('Tambah Master Pasien', 'Add Patient Master')}
                  </button>
                  <button
                    onClick={openCreateCustomerModal}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#ffffff', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                  >
                    <Plus size={15} /> {tr('Tambah Master Dokter / Klinik', 'Add Dentist / Clinic')}
                  </button>
                </div>
              </div>

              {/* CRM KPI Summary Cards */}
              <div className="grid-4col" style={{ marginBottom: '20px' }}>
                <div
                  onClick={() => setCrmSubTab('doctors')}
                  style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '16px 18px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{tr('Master Dokter & Klinik', 'Dentist & Clinic Master')}</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{customers.length} {tr('Mitra', 'Partners')}</div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>{tr('Kontak, Preferensi & Catatan Khusus', 'Contacts, Preferences & Notes')}</div>
                </div>

                <div
                  onClick={() => setCrmSubTab('patients')}
                  style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '16px 18px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{tr('Master Data Pasien', 'Patient Master Data')}</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>{patients.length} {tr('Pasien', 'Patients')}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px' }}>{tr('Terintegrasi langsung ke Input SPK', 'Directly integrated with New SPK')}</div>
                </div>

                <div
                  onClick={() => setCrmSubTab('reminders')}
                  style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '16px 18px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{tr('Reminder Follow-Up Order', 'Order Follow-Up Reminder')}</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                    {customers.filter((c) => (c.days_since_last_order ?? 999) >= 7).length} {tr('Dokter', 'Dentists')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 600, marginTop: '4px' }}>{tr('Perlu follow-up order berkala', 'Requires periodic order follow-up')}</div>
                </div>

                <div
                  onClick={() => setCrmSubTab('doctors')}
                  style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '16px 18px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{tr('Loyalty System & Diskon', 'Loyalty System & Discount')}</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    {customers.filter((c) => (c.discount_percent || 0) > 0).length} {tr('Member', 'Members')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>{tr('Otomatis potong harga SPK tetap', 'Automated SPK flat discount')}</div>
                </div>
              </div>

              {/* Sub-Navigation Tabs for CRM */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px', borderBottom: '1.5px solid var(--border-light)', paddingBottom: '10px' }}>
                {[
                  { key: 'doctors', label: tr(`🏥 Master Dokter & Klinik (${customers.length})`, `🏥 Dentist & Clinic Master (${customers.length})`) },
                  { key: 'patients', label: tr(`🧑 Master Data Pasien (${patients.length})`, `🧑 Patient Master Data (${patients.length})`) },
                  { key: 'history', label: tr(`📋 History Order & Feedback (${orders.length})`, `📋 Order History & Feedback (${orders.length})`) },
                  { key: 'reminders', label: tr(`⏰ Reminder Order & Follow-Up`, `⏰ Order Reminder & Follow-Up`) },
                ].map((tb) => (
                  <button
                    key={tb.key}
                    type="button"
                    onClick={() => setCrmSubTab(tb.key as any)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      background: crmSubTab === tb.key ? 'var(--primary)' : 'var(--bg-card)',
                      color: crmSubTab === tb.key ? '#ffffff' : 'var(--text-muted)',
                      border: crmSubTab === tb.key ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                    }}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* SUB-TAB 1: DATABASE DOKTER & KLINIK (KONTAK, PREFERENSI, CATATAN KHUSUS, LOYALTY DISKON) */}
              {crmSubTab === 'doctors' && (
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                      <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                      <input
                        type="text"
                        placeholder={tr("Cari nama dokter, klinik, kode, atau nomor WA...", "Search dentist name, clinic, code, or WhatsApp number...")}
                        value={crmDoctorSearch}
                        onChange={(e) => setCrmDoctorSearch(e.target.value)}
                        style={{ width: '100%', padding: '9px 14px 9px 36px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 8px' }}>{tr('Kode & Dokter', 'Code & Dentist')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Klinik & Kontak', 'Clinic & Contact')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Preferensi & Catatan Khusus', 'Preferences & Special Notes')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Loyalty & Diskon', 'Loyalty & Discount')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Statistik Order', 'Order Statistics')}</th>
                          <th style={{ padding: '12px 8px' }}>{t.colActions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers
                          .filter(
                            (c) =>
                              !crmDoctorSearch ||
                              c.name.toLowerCase().includes(crmDoctorSearch.toLowerCase()) ||
                              (c.clinic_name || '').toLowerCase().includes(crmDoctorSearch.toLowerCase()) ||
                              c.code.toLowerCase().includes(crmDoctorSearch.toLowerCase()) ||
                              c.phone.includes(crmDoctorSearch)
                          )
                          .map((c) => {
                            const tierColors: Record<string, { bg: string; fg: string }> = {
                              VIP: { bg: '#fef3c7', fg: '#b45309' },
                              GOLD: { bg: '#fef9c3', fg: '#854d0e' },
                              SILVER: { bg: '#f1f5f9', fg: '#334155' },
                              REGULAR: { bg: 'var(--bg-surface)', fg: 'var(--text-muted)' },
                            }
                            const tierStyle = tierColors[c.loyalty_tier || 'REGULAR'] || tierColors.REGULAR
                            return (
                              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '12px' }}>{c.code}</div>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🧑 {c.patients_count || 0} {tr('Pasien Terdaftar', 'Registered Patients')}</div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.clinic_name || '-'}</div>
                                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>📱 {c.phone}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{c.address || '-'}</div>
                                </td>
                                <td style={{ padding: '12px 8px', maxWidth: '270px' }}>
                                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                    {c.favorite_shade && (
                                      <span style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                                        🎨 Shade: {c.favorite_shade}
                                      </span>
                                    )}
                                    {c.favorite_denture_type && (
                                      <span style={{ background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                                        🦷 {c.favorite_denture_type}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    {c.notes ? `"${c.notes}"` : tr('Belum ada catatan khusus', 'No special notes')}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800, background: tierStyle.bg, color: tierStyle.fg }}>
                                    ★ {c.loyalty_tier || 'REGULAR'}
                                  </span>
                                  <div style={{ fontSize: '12px', fontWeight: 800, color: (c.discount_percent || 0) > 0 ? '#059669' : 'var(--text-subtle)', marginTop: '4px' }}>
                                    {tr('Diskon Tetap:', 'Flat Discount:')} {c.discount_percent || 0}%
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.total_orders || 0} SPK</div>
                                  <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>{formatRupiah(c.total_spent || 0)}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                                    {c.last_order_date
                                      ? `${tr('Terakhir:', 'Last:')} ${new Date(c.last_order_date).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}`
                                      : tr('Belum ada SPK', 'No SPK yet')}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCrmHistoryDoctorFilter(c.id)
                                        setCrmSubTab('history')
                                      }}
                                      style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '6px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '11px' }}
                                    >
                                      History ({c.total_orders || 0})
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openEditCustomerModal(c)}
                                      style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-light)', padding: '6px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openWhatsApp(c.phone, tr(`Halo Dokter ${c.name}, salam hangat dari Dental Lab. Semoga praktik klinik hari ini lancar!`, `Hello Dr. ${c.name}, warm greetings from Dental Lab!`))}
                                      style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#059669', padding: '6px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '11px' }}
                                    >
                                      <MessageCircle size={13} /> WA
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: MASTER DATA PASIEN (RELASI DOKTER & SPK PRODUKSI) */}
              {crmSubTab === 'patients' && (
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                      <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                      <input
                        type="text"
                        placeholder={tr("Cari nama pasien, kode pasien, atau catatan alergi/medis...", "Search patient name, code, or allergy/clinical notes...")}
                        value={crmPatientSearch}
                        onChange={(e) => setCrmPatientSearch(e.target.value)}
                        style={{ width: '100%', padding: '9px 14px 9px 36px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '13px' }}
                      />
                    </div>
                    <select
                      value={crmPatientDoctorFilter}
                      onChange={(e) => setCrmPatientDoctorFilter(e.target.value)}
                      style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600 }}
                    >
                      <option value="">{tr('Semua Dokter / Klinik Pengirim', 'All Referring Dentists / Clinics')}</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.clinic_name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 8px' }}>{tr('Kode & Nama Pasien', 'Patient Code & Name')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Gender & Usia', 'Gender & Age')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Dokter / Klinik Pengirim', 'Referring Dentist / Clinic')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Acuan Warna & Gigi', 'Shade & Tooth Reference')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Catatan Klinis / Alergi Bahan', 'Clinical Notes / Material Allergies')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Riwayat SPK', 'SPK History')}</th>
                          <th style={{ padding: '12px 8px' }}>{t.colActions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients
                          .filter((p) => !crmPatientDoctorFilter || p.customer_id === crmPatientDoctorFilter)
                          .filter(
                            (p) =>
                              !crmPatientSearch ||
                              p.name.toLowerCase().includes(crmPatientSearch.toLowerCase()) ||
                              p.code.toLowerCase().includes(crmPatientSearch.toLowerCase()) ||
                              (p.allergies_or_notes || '').toLowerCase().includes(crmPatientSearch.toLowerCase())
                          )
                          .map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '12px' }}>{p.code}</div>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</div>
                                {p.phone && <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>📱 {p.phone}</div>}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                  {p.gender === 'P' ? tr('👩 Perempuan', '👩 Female') : tr('👨 Laki-laki', '👨 Male')}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.age ? `${p.age} ${tr('Tahun', 'Years')}` : '-'}</div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.customer?.name || '-'}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{p.customer?.clinic_name || ''}</div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <span style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                                  🎨 {p.default_shade || 'VITA A2'}
                                </span>
                                {p.last_teeth_numbers && (
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    {tr('Gigi:', 'Teeth:')} {p.last_teeth_numbers}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '12px 8px', maxWidth: '240px' }}>
                                <div style={{ fontSize: '12px', color: p.allergies_or_notes?.toLowerCase().includes('alergi') ? '#dc2626' : 'var(--text-muted)', fontWeight: p.allergies_or_notes?.toLowerCase().includes('alergi') ? 700 : 400 }}>
                                  {p.allergies_or_notes || '-'}
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.total_orders || 0} SPK</div>
                                {p.last_order_date && (
                                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                                    {new Date(p.last_order_date).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (p.customer_id) handleSelectOrderDoctor(p.customer_id)
                                      handleSelectOrderPatient(p.id)
                                      setActiveTab('new_order')
                                    }}
                                    style={{ background: 'var(--primary)', color: '#ffffff', padding: '6px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '11px' }}
                                  >
                                    {tr('+ Buat SPK', '+ Create SPK')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openEditPatientModal(p)}
                                    style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-light)', padding: '6px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePatient(p.id, p.name)}
                                    style={{ background: '#fef2f2', color: '#dc2626', padding: '6px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}
                                  >
                                    {tr('Hapus', 'Delete')}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: HISTORY ORDER & FEEDBACK DOKTER */}
              {crmSubTab === 'history' && (
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                        {tr('Riwayat Order & Feedback Kepuasan Dokter', 'Order History & Dentist Feedback')}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tr(
                          'Mempermudah melihat seluruh SPK sebelumnya per dokter serta mencatat testimoni/evaluasi hasil kerja lab.',
                          'Easily inspect prior SPKs per doctor and record evaluations or testimonials on dental lab workmanship.'
                        )}
                      </p>
                    </div>
                    <select
                      value={crmHistoryDoctorFilter}
                      onChange={(e) => setCrmHistoryDoctorFilter(e.target.value)}
                      style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600 }}
                    >
                      <option value="">{tr(`Semua Dokter / Klinik (${orders.length} SPK)`, `All Dentists / Clinics (${orders.length} SPKs)`)}</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.clinic_name} ({c.total_orders || 0} SPK)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 8px' }}>{tr('No. SPK & Tgl', 'SPK No. & Date')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Dokter & Klinik', 'Dentist & Clinic')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Pasien & Jenis Gigi Tiruan', 'Patient & Restoration')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Status & Nilai Order', 'Status & Order Amount')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Feedback / Evaluasi Dokter', 'Feedback & Evaluation')}</th>
                          <th style={{ padding: '12px 8px' }}>{t.colActions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders
                          .filter((o) => !crmHistoryDoctorFilter || o.customer_id === crmHistoryDoctorFilter)
                          .map((o) => (
                            <tr key={o.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{o.order_number}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  {new Date(o.received_date).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{o.customer?.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{o.customer?.clinic_name}</div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{o.patient_name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>{o.denture_type?.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tr('Gigi:', 'Teeth:')} {o.teeth_numbers} ({o.shade_guide})</div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{formatRupiah(o.total_price)}</div>
                                {(o.discount_percent || 0) > 0 && (
                                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                                    {tr('Diskon Loyalty', 'Loyalty Discount')} {o.discount_percent}%
                                  </div>
                                )}
                                <span style={{ display: 'inline-block', marginTop: '3px', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                                  {o.status}
                                </span>
                              </td>
                              <td style={{ padding: '12px 8px', maxWidth: '260px' }}>
                                {o.feedback_rating && o.feedback_rating > 0 ? (
                                  <div>
                                    <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '13px' }}>
                                      {'★'.repeat(o.feedback_rating)}{'☆'.repeat(Math.max(0, 5 - o.feedback_rating))} ({o.feedback_rating}/5)
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-main)', fontStyle: 'italic', marginTop: '2px' }}>
                                      "{o.feedback_notes || tr('Puas dengan hasil kerja lab', 'Satisfied with lab craftsmanship')}"
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{tr('Belum ada feedback dicatat', 'No feedback recorded yet')}</span>
                                )}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFeedbackOrder(o)
                                      setFeedbackRating(o.feedback_rating && o.feedback_rating > 0 ? o.feedback_rating : 5)
                                      setFeedbackNotes(o.feedback_notes || '')
                                    }}
                                    style={{ background: '#fef3c7', color: '#b45309', padding: '6px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '11px' }}
                                  >
                                    ★ {tr('Input Feedback', 'Record Feedback')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedOrder(o)
                                      setActiveTab('orders')
                                    }}
                                    style={{ background: 'var(--bg-surface)', color: 'var(--primary)', border: '1px solid var(--border-light)', padding: '6px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '11px' }}
                                  >
                                    {tr('Detail SPK', 'SPK Detail')}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: REMINDER ORDER & FOLLOW-UP DOKTER */}
              {crmSubTab === 'reminders' && (
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {tr('Reminder Follow-Up Dokter & Klinik', 'Dentist & Clinic Follow-Up Reminders')}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {tr(
                        'Daftar pemantauan otomatis untuk melakukan follow-up kepada dokter yang belum mengirim order SPK baru atau mengingatkan program diskon pelanggan tetap.',
                        'Automated tracking to follow up with dentists who have not placed recent orders or remind them of loyalty discounts.'
                      )}
                    </p>
                  </div>

                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 8px' }}>{tr('Status Reminder', 'Reminder Status')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Dokter & Klinik', 'Dentist & Clinic')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Order Terakhir', 'Last Order')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Preferensi Favorit & Loyalty', 'Favorite Preference & Loyalty')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Aksi Follow-Up Cepat', 'Quick Follow-Up Action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...customers]
                          .sort((a, b) => (b.days_since_last_order ?? 999) - (a.days_since_last_order ?? 999))
                          .map((c) => {
                            const days = c.days_since_last_order ?? 999
                            const needsFollowUp = days >= 7
                            return (
                              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '12px 8px' }}>
                                  {days >= 30 ? (
                                    <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800 }}>
                                      🔔 {tr(`Perlu Follow-Up Segera (${days === 999 ? 'Belum Order' : `${days} hari lalu`})`, `Follow-Up Needed (${days === 999 ? 'No orders' : `${days} days ago`})`)}
                                    </span>
                                  ) : needsFollowUp ? (
                                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800 }}>
                                      ⏰ {tr(`Jadwal Follow-Up (${days} hari lalu)`, `Follow-Up Scheduled (${days} days ago)`)}
                                    </span>
                                  ) : (
                                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800 }}>
                                      ✅ {tr(`Aktif Order (${days === 0 ? 'Hari ini' : `${days} hari lalu`})`, `Active Orders (${days === 0 ? 'Today' : `${days} days ago`})`)}
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{c.clinic_name} — 📱 {c.phone}</div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                    {c.last_order_date
                                      ? new Date(c.last_order_date).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })
                                      : tr('Belum Pernah Order', 'No Prior Order')}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total: {c.total_orders || 0} SPK</div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                                    {c.favorite_denture_type || 'Zirconia / PFM'} ({c.favorite_shade || 'VITA A2'})
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                                    Member {c.loyalty_tier || 'REGULAR'} ({tr('Diskon', 'Discount')} {c.discount_percent || 0}%)
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const promoText =
                                          (c.discount_percent || 0) > 0
                                            ? tr(
                                                `Sebagai mitra ${c.loyalty_tier}, Dokter berhak menikmati diskon otomatis ${c.discount_percent}% untuk setiap pembuatan gigi tiruan (${c.favorite_denture_type || 'Zirconia/PFM/Valplast'}).`,
                                                `As a ${c.loyalty_tier} partner, you receive an automatic ${c.discount_percent}% discount on all dental prosthesis cases.`
                                              )
                                            : tr(
                                                `Kami siap membantu penjemputan cetakan gigi pasien untuk pembuatan ${c.favorite_denture_type || 'gigi tiruan'} di klinik Dokter.`,
                                                `We are ready to arrange pickup of impressions for ${c.favorite_denture_type || 'denture'} cases.`
                                              )
                                        openWhatsApp(
                                          c.phone,
                                          tr(
                                            `Halo ${c.name} (${c.clinic_name}), salam sehat dari Dental Lab! 🙏\n\nKami ingin melakukan follow-up apakah ada cetakan/kasus gigi tiruan pasien yang perlu kami jemput minggu ini? ${promoText}\n\nTerima kasih Dok!`,
                                            `Hello ${c.name} (${c.clinic_name}), greetings from Dental Lab! 🙏\n\nFollowing up to check if you have any dental impression cases ready for pickup this week? ${promoText}\n\nThank you Doctor!`
                                          )
                                        )
                                      }}
                                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#22c55e', color: '#ffffff', padding: '7px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '12px' }}
                                    >
                                      <MessageCircle size={14} /> Follow-Up WA
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleSelectOrderDoctor(c.id)
                                        setActiveTab('new_order')
                                      }}
                                      style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '7px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '12px' }}
                                    >
                                      {tr('+ Input SPK Dokter Ini', '+ New SPK for Doctor')}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 9. MANAJEMEN SDM & TUGAS (HR, TECHNICIAN ASSIGNMENT, KPI, ATTENDANCE & OVERTIME) */}
          {activeTab === 'hr' && (
            <div>
              <div className="page-header-row" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {tr('Manajemen SDM & Tugas Tekniker', 'HR & Technician Task Management')}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {tr(
                      'Profile tekniker & staf (keahlian, jadwal kerja, performa, role), penugasan tekniker, KPI produksi, serta pencatatan absensi & lembur.',
                      'Technician & staff profiles (skills, work schedule, performance, role), assignments, production KPIs, and attendance & overtime logs.'
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickCheckInToday(currentUser.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', border: '1.5px solid #6ee7b7', padding: '10px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '13px' }}
                  >
                    ✅ {tr('Check-In Hadir Hari Ini', 'Check-In Today')}
                  </button>
                  <button
                    type="button"
                    onClick={() => openCreateAttendanceModal(currentUser.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', color: 'var(--primary)', border: '1.5px solid var(--primary)', padding: '10px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '13px' }}
                  >
                    ⏰ {tr('+ Catat Absensi / Lembur', '+ Log Attendance / Overtime')}
                  </button>
                  {(isSuperAdmin || currentUser.role?.name === 'OWNER' || currentUser.role?.name === 'ADMIN') && (
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#ffffff', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)' }}
                    >
                      <UserPlus size={16} /> {tr('+ Tambah Staf / Tekniker', '+ Add Staff / Technician')}
                    </button>
                  )}
                </div>
              </div>

              {/* 4 KPI Summary Cards */}
              <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {tr('Total Tekniker & Staf Aktif', 'Active Technicians & Staff')}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                    {usersList.filter((u) => u.is_active).length} {tr('Orang', 'Staff')}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>
                    {usersList.filter((u) => u.role?.name === 'TECHNICIAN').length} {tr('Tekniker Gigi', 'Technicians')} • {usersList.filter((u) => u.role?.name !== 'TECHNICIAN').length} {tr('Manajemen/Staf', 'Management/Staff')}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {tr('Penugasan SPK Sedang Dikerjakan', 'Active Assigned SPKs')}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                    {orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length} SPK
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px', fontWeight: 600 }}>
                    {tr('Terdistribusi ke PIC tekniker tiap tahapan', 'Distributed to stage technicians')}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {tr('Rata-Rata KPI Mutu & Ketepatan', 'Avg Quality & On-Time KPI')}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                    {usersList.length > 0
                      ? `${Math.round(usersList.reduce((acc, u) => acc + (u.qc_pass_rate || 95), 0) / usersList.length)}% QC`
                      : '98% QC'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                    {tr('Ketepatan Waktu (On-Time):', 'On-Time Delivery:')}{' '}
                    {usersList.length > 0
                      ? `${Math.round(usersList.reduce((acc, u) => acc + (u.on_time_rate || 95), 0) / usersList.length)}%`
                      : '96%'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {tr('Total Jam Lembur & Presensi', 'Total Overtime & Attendance')}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                    {attendances.reduce((acc, a) => acc + (a.overtime_hours || 0), 0).toFixed(1)} {tr('Jam', 'Hours')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#d97706', marginTop: '4px', fontWeight: 600 }}>
                    {attendances.length} {tr('Rekap Kehadiran Tercatat', 'Logged Presences')}
                  </div>
                </div>
              </div>

              {/* Sub-Navigation Tabs for HR Module */}
              <div className="sub-tabs-scroll" style={{ marginBottom: '18px' }}>
                {[
                  { id: 'profiles', label: tr(`👨‍🔬 Profile Tekniker & Staf (${usersList.length})`, `👨‍🔬 Technician & Staff Profiles (${usersList.length})`) },
                  { id: 'assignments', label: tr(`📋 Penugasan Tekniker (${orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length} SPK)`, `📋 Technician Assignments (${orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length} SPKs)`) },
                  { id: 'kpi', label: tr(`📊 KPI Produksi & Performa`, `📊 Production KPI & Performance`) },
                  { id: 'attendance', label: tr(`⏰ Absensi & Lembur (${attendances.length})`, `⏰ Attendance & Overtime (${attendances.length})`) },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setHrSubTab(tab.id as any)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      background: hrSubTab === tab.id ? 'var(--primary)' : 'var(--bg-card)',
                      color: hrSubTab === tab.id ? '#ffffff' : 'var(--text-muted)',
                      border: hrSubTab === tab.id ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                      boxShadow: hrSubTab === tab.id ? '0 2px 8px rgba(2,132,199,0.25)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SUB-TAB 1: PROFILE TEKNIKER DAN STAF (KEAHLIAN, JADWAL KERJA, PERFORMA, ROLE) */}
              {hrSubTab === 'profiles' && (
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 280px' }}>
                      <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                      <input
                        type="text"
                        placeholder={tr("Cari nama staf/tekniker, NIK, spesialisasi, atau keahlian...", "Search staff name, code, specialization, or skills...")}
                        value={hrSearch}
                        onChange={(e) => setHrSearch(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '13px', outline: 'none', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                      />
                    </div>
                    <select
                      value={hrRoleFilter}
                      onChange={(e) => setHrRoleFilter(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600 }}
                    >
                      <option value="">{tr(`Semua Role (${usersList.length})`, `All Roles (${usersList.length})`)}</option>
                      {rolesList.map((r) => (
                        <option key={r.id} value={r.name}>
                          Role: {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cards Grid of Staff & Technicians */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '16px' }}>
                    {usersList
                      .filter((u) => {
                        if (hrRoleFilter && u.role?.name !== hrRoleFilter) return false
                        if (!hrSearch) return true
                        const q = hrSearch.toLowerCase()
                        return (
                          u.full_name.toLowerCase().includes(q) ||
                          u.username.toLowerCase().includes(q) ||
                          (u.employee_code || '').toLowerCase().includes(q) ||
                          (u.specialization || '').toLowerCase().includes(q) ||
                          (u.skills || '').toLowerCase().includes(q)
                        )
                      })
                      .map((u) => {
                        const skillsArr = (u.skills || '')
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                        const isMe = u.id === currentUser.id
                        return (
                          <div
                            key={u.id}
                            style={{
                              background: 'var(--bg-surface)',
                              borderRadius: '14px',
                              border: isMe ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                              padding: '18px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '12px',
                            }}
                          >
                            <div>
                              {/* Top row: Avatar + Name + Role Badge */}
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                                {u.avatar_url ? (
                                  <img
                                    src={u.avatar_url}
                                    alt={u.full_name}
                                    style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover', border: '2px solid var(--primary)', flexShrink: 0 }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '56px',
                                      height: '56px',
                                      borderRadius: '14px',
                                      background: u.role?.name === 'TECHNICIAN' ? 'linear-gradient(135deg, #0284c7, #0d9488)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                      color: '#ffffff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '20px',
                                      fontWeight: 800,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {(u.full_name || u.username || 'U')[0].toUpperCase()}
                                  </div>
                                )}
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>{u.full_name}</span>
                                    {isMe && (
                                      <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px' }}>
                                        {tr('Akun Saya', 'My Account')}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {u.employee_code || 'EMP-001'} • @{u.username}
                                  </div>
                                  <div style={{ display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                                    <span
                                      style={{
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        background: u.role?.name === 'TECHNICIAN' ? '#e0f2fe' : u.role?.name === 'SUPER_ADMIN' ? '#dcfce7' : '#fef3c7',
                                        color: u.role?.name === 'TECHNICIAN' ? '#0369a1' : u.role?.name === 'SUPER_ADMIN' ? '#15803d' : '#b45309',
                                      }}
                                    >
                                      ROLE: {u.role?.name}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>
                                      {u.specialization || tr('Staf Operasional Lab', 'Lab Operations Staff')}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Work Schedule & Contact */}
                              <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '12px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>🕒 {tr('Jadwal Kerja:', 'Schedule:')}</span>
                                  <strong style={{ color: 'var(--text-main)' }}>{u.work_schedule || tr('Senin - Sabtu (08:00 - 17:00)', 'Mon - Sat (08:00 - 17:00)')}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>📱 {tr('Kontak WA:', 'WhatsApp:')}</span>
                                  <strong style={{ color: 'var(--text-main)' }}>{u.phone || '-'}</strong>
                                </div>
                              </div>

                              {/* Keahlian / Skills Chips */}
                              <div style={{ marginBottom: '10px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px' }}>
                                  {tr('KEAHLIAN & KOMPETENSI:', 'SKILLS & COMPETENCY:')}
                                </div>
                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                  {skillsArr.length > 0 ? (
                                    skillsArr.map((sk, idx) => (
                                      <span
                                        key={idx}
                                        style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}
                                      >
                                        ✓ {sk}
                                      </span>
                                    ))
                                  ) : (
                                    <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                                      {tr('Prostodonsia & Operasional Lab', 'Prosthodontics & Lab Operations')}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Performance Mini Summary */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', background: 'var(--bg-card)', padding: '8px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                                <div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tr('Order Selesai', 'Completed')}</div>
                                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                                    {(u.completed_orders_count || 0) + (u.completed_stages_count || 0)}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>On-Time</div>
                                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>{u.on_time_rate ?? 100}%</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tr('Kualitas QC', 'QC Quality')}</div>
                                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7' }}>{u.qc_pass_rate ?? 100}%</div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-light)', gap: '6px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {tr('Aktif:', 'Active:')} <strong>{u.active_orders_count || 0} SPK</strong> • {tr('Lembur:', 'Overtime:')} <strong>{u.total_overtime_hours || 0}{tr('j', 'h')}</strong>
                              </span>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {isMe && (
                                  <button
                                    type="button"
                                    onClick={() => setActiveTab('profile')}
                                    style={{ background: 'var(--primary)', color: '#ffffff', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}
                                  >
                                    {tr('Profil Saya', 'My Profile')}
                                  </button>
                                )}
                                {(isSuperAdmin || currentUser.role?.name === 'OWNER' || currentUser.role?.name === 'ADMIN') && (
                                  <button
                                    type="button"
                                    onClick={() => openEditStaffModal(u)}
                                    style={{ background: 'var(--bg-card)', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}
                                  >
                                    {tr('Edit Profil & Keahlian', 'Edit Profile & Skills')}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: PENUGASAN TEKNIKER (ASSIGN TUGAS TEKNIKER) */}
              {hrSubTab === 'assignments' && (
                <div>
                  {/* Workload Summary per Technician */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                    {usersList
                      .filter((u) => u.role?.name === 'TECHNICIAN' || u.role?.name === 'OWNER' || u.role?.name === 'SUPER_ADMIN')
                      .map((tech) => {
                        const assignedActive = orders.filter(
                          (o) =>
                            o.status !== 'COMPLETED' &&
                            o.status !== 'DELIVERED' &&
                            o.status !== 'CANCELLED' &&
                            (o.current_technician_id === tech.id || (o.stage_runs || []).some((sr) => sr.technician_id === tech.id && sr.status === 'IN_PROGRESS'))
                        ).length
                        return (
                          <div
                            key={tech.id}
                            style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '12px' }}
                          >
                            {tech.avatar_url ? (
                              <img src={tech.avatar_url} alt={tech.full_name} style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                {tech.full_name[0]}
                              </div>
                            )}
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {tech.full_name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tech.specialization || tech.role?.name}</div>
                              <div style={{ fontSize: '11px', fontWeight: 800, color: assignedActive > 0 ? '#0284c7' : '#059669', marginTop: '2px' }}>
                                {tr('Beban Kerja:', 'Workload:')} {assignedActive} {tr('SPK Aktif', 'Active SPKs')}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>

                  {/* Table to Assign / Reassign Technicians on Active SPKs & Stages */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                        {tr('Papan Penugasan Tekniker (Assign Tugas SPK & Tahapan Produksi)', 'Technician Assignment Board (SPK & Production Stage Assign)')}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tr(
                          'Pilih atau ubah PIC Tekniker untuk setiap tahap pengerjaan SPK (Model Gips → Design → Wax-up → Casting → Finishing → QC).',
                          'Assign or change technician PIC for each SPK stage (Plaster Model → Design → Wax-up → Casting → Finishing → QC).'
                        )}
                      </p>
                    </div>

                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '12px 8px' }}>{tr('No. SPK & Prioritas', 'SPK No. & Priority')}</th>
                            <th style={{ padding: '12px 8px' }}>{tr('Pasien & Dokter', 'Patient & Dentist')}</th>
                            <th style={{ padding: '12px 8px' }}>{tr('Jenis Gigi Tiruan', 'Restoration Type')}</th>
                            <th style={{ padding: '12px 8px' }}>{tr('Tahap Aktif Saat Ini', 'Active Stage')}</th>
                            <th style={{ padding: '12px 8px' }}>{tr('Assign PIC Tekniker (Tahap Aktif)', 'Assign Stage Technician')}</th>
                            <th style={{ padding: '12px 8px' }}>{tr('Target Selesai', 'Target Due Date')}</th>
                            <th style={{ padding: '12px 8px' }}>{tr('Aksi', 'Action')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders
                            .filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED')
                            .map((o) => {
                              const activeRun =
                                (o.stage_runs || []).find((sr) => sr.status === 'IN_PROGRESS') ||
                                (o.stage_runs || []).find((sr) => sr.stage_code === o.current_stage_code) ||
                                (o.stage_runs || [])[0]
                              return (
                                <tr key={o.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                  <td style={{ padding: '12px 8px' }}>
                                    <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{o.order_number}</div>
                                    {o.priority === 'URGENT' ? (
                                      <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                                        🔥 CITO / URGENT
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Normal</span>
                                    )}
                                  </td>
                                  <td style={{ padding: '12px 8px' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{o.patient_name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{o.customer?.name}</div>
                                  </td>
                                  <td style={{ padding: '12px 8px' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{o.denture_type?.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tr('Gigi:', 'Teeth:')} {o.teeth_numbers} ({o.shade_guide})</div>
                                  </td>
                                  <td style={{ padding: '12px 8px' }}>
                                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800 }}>
                                      {o.current_stage_name || activeRun?.stage_name || o.status}
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px 8px', minWidth: '210px' }}>
                                    {activeRun ? (
                                      <select
                                        value={activeRun.technician_id || o.current_technician_id || ''}
                                        onChange={async (e) => {
                                          const techId = e.target.value
                                          try {
                                            setLoading(true)
                                            await api.updateStageRun(o.id, activeRun.id, { technician_id: techId })
                                            await loadInitialData()
                                          } catch (err: any) {
                                            alert(err.message || tr('Gagal assign tekniker', 'Failed to assign technician'))
                                          } finally {
                                            setLoading(false)
                                          }
                                        }}
                                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid var(--primary-light)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '12px', fontWeight: 700 }}
                                      >
                                        <option value="">-- {tr('Pilih PIC Tekniker', 'Select Technician PIC')} --</option>
                                        {usersList.map((u) => (
                                          <option key={u.id} value={u.id}>
                                            👨‍🔬 {u.full_name} ({u.role?.name})
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {o.current_technician?.full_name || tr('Belum ditugaskan', 'Unassigned')}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--text-main)' }}>
                                    {new Date(o.promised_due_date).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </td>
                                  <td style={{ padding: '12px 8px' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedOrder(o)
                                        setActiveTab('orders')
                                      }}
                                      style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '12px' }}
                                    >
                                      {tr('Detail & Tahapan →', 'Details & Stages →')}
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: KPI PRODUKSI (JUMLAH ORDER SELESAI, KETEPATAN WAKTU, KUALITAS HASIL) */}
              {hrSubTab === 'kpi' && (
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {tr('Laporan KPI Produksi & Evaluasi Kualitas Kerja Tekniker', 'Production KPI Report & Technician Quality Evaluation')}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {tr(
                        'Metrik terukur berdasarkan jumlah order selesai, tahapan produksi yang diselesaikan, persentase ketepatan waktu (On-Time Delivery), tingkat kelulusan QC (Quality Pass Rate), dan rating kepuasan dokter.',
                        'Measurable metrics based on completed orders, finished stages, on-time delivery rate, QC pass rate, and dentist satisfaction ratings.'
                      )}
                    </p>
                  </div>

                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 8px' }}>{tr('Tekniker / Staf', 'Technician / Staff')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Role & Spesialisasi', 'Role & Specialization')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Order & Tahap Selesai', 'Orders & Stages Done')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Ketepatan Waktu (On-Time)', 'On-Time Rate')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Kualitas Hasil (Lolos QC)', 'QC Pass Rate')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Rating Dokter', 'Dentist Rating')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Grade Performa', 'Performance Grade')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((u) => {
                          const onTime = u.on_time_rate ?? 100
                          const qcRate = u.qc_pass_rate ?? 100
                          const avgScore = (onTime + qcRate) / 2
                          const grade = avgScore >= 95 ? tr('A+ (Sangat Baik)', 'A+ (Excellent)') : avgScore >= 85 ? tr('A (Baik)', 'A (Good)') : tr('B (Cukup)', 'B (Satisfactory)')
                          return (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {u.avatar_url ? (
                                    <img src={u.avatar_url} alt={u.full_name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                      {u.full_name[0]}
                                    </div>
                                  )}
                                  <div>
                                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{u.full_name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.employee_code || 'EMP'}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <span style={{ background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>
                                  {u.role?.name}
                                </span>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{u.specialization || '-'}</div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                                  {u.completed_orders_count || 0} {tr('SPK Selesai', 'SPKs Done')}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                                  ✓ {u.completed_stages_count || 0} {tr('Tahap Kerja', 'Stages')} • {u.active_orders_count || 0} {tr('Aktif', 'Active')}
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px', minWidth: '150px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, color: '#059669', marginBottom: '4px' }}>
                                  <span>{onTime}% {tr('Tepat Waktu', 'On-Time')}</span>
                                </div>
                                <div style={{ width: '100%', height: '7px', background: 'var(--bg-surface)', borderRadius: '99px', overflow: 'hidden' }}>
                                  <div style={{ width: `${Math.min(100, onTime)}%`, height: '100%', background: '#10b981', borderRadius: '99px' }} />
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px', minWidth: '150px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, color: '#0284c7', marginBottom: '4px' }}>
                                  <span>{qcRate}% {tr('Lolos QC', 'QC Pass')}</span>
                                </div>
                                <div style={{ width: '100%', height: '7px', background: 'var(--bg-surface)', borderRadius: '99px', overflow: 'hidden' }}>
                                  <div style={{ width: `${Math.min(100, qcRate)}%`, height: '100%', background: '#0284c7', borderRadius: '99px' }} />
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '13px' }}>
                                  ★ {(u.avg_feedback_rating || 5.0).toFixed(1)} / 5.0
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tr('Kepuasan Dokter', 'Dentist Rating')}</div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <span
                                  style={{
                                    background: avgScore >= 90 ? '#ecfdf5' : '#fef3c7',
                                    color: avgScore >= 90 ? '#059669' : '#b45309',
                                    padding: '4px 10px',
                                    borderRadius: '99px',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                  }}
                                >
                                  {grade}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: ABSENSI DAN LEMBUR */}
              {hrSubTab === 'attendance' && (
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                        {tr('Rekap Absensi Harian & Jam Lembur Tekniker/Staf', 'Daily Attendance & Overtime Log')}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tr(
                          'Pencatatan kehadiran harian (Hadir, Terlambat, Izin, Sakit, Cuti), jam masuk/pulang, serta durasi & keterangan lembur pengerjaan SPK.',
                          'Daily presence records (Present, Late, Permission, Sick, Leave), check in/out time, and overtime hours for SPK cases.'
                        )}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <select
                        value={hrAttUserFilter}
                        onChange={(e) => setHrAttUserFilter(e.target.value)}
                        style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600 }}
                      >
                        <option value="">{tr(`Semua Staf & Tekniker (${attendances.length})`, `All Staff & Technicians (${attendances.length})`)}</option>
                        {usersList.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name} ({u.role?.name})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => openCreateAttendanceModal(hrAttUserFilter || currentUser.id)}
                        style={{ background: 'var(--primary)', color: '#ffffff', padding: '9px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}
                      >
                        {tr('+ Input Absensi / Lembur', '+ Log Attendance / Overtime')}
                      </button>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 8px' }}>{tr('Tanggal', 'Date')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Nama Staf / Tekniker', 'Staff / Technician Name')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Shift & Jadwal', 'Shift & Schedule')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Jam Masuk - Pulang', 'Check-In - Out')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Status Kehadiran', 'Presence Status')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Jam Lembur', 'Overtime')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Catatan Lembur / Pekerjaan', 'Overtime Notes / Job')}</th>
                          <th style={{ padding: '12px 8px' }}>{tr('Aksi', 'Action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendances
                          .filter((a) => !hrAttUserFilter || a.user_id === hrAttUserFilter)
                          .map((a) => (
                            <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--text-main)' }}>
                                {new Date(a.attendance_date).toLocaleDateString(dateLocale, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{a.user?.full_name || tr('Staf Lab', 'Lab Staff')}</div>
                                <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>{a.user?.role?.name || ''}</div>
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '12px', color: 'var(--text-muted)' }}>{a.shift_schedule}</td>
                              <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--text-main)' }}>
                                {a.check_in} — {a.check_out}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <span
                                  style={{
                                    padding: '3px 10px',
                                    borderRadius: '99px',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    background:
                                      a.status === 'HADIR'
                                        ? '#ecfdf5'
                                        : a.status === 'TERLAMBAT'
                                        ? '#fef3c7'
                                        : '#fee2e2',
                                    color:
                                      a.status === 'HADIR'
                                        ? '#059669'
                                        : a.status === 'TERLAMBAT'
                                        ? '#b45309'
                                        : '#dc2626',
                                  }}
                                >
                                  {a.status}
                                </span>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                {a.overtime_hours > 0 ? (
                                  <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>
                                    +{a.overtime_hours} {tr('Jam Lembur', 'Hours Overtime')}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-subtle)', fontSize: '12px' }}>0 {tr('Jam', 'Hours')}</span>
                                )}
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '12px', color: 'var(--text-main)', maxWidth: '260px' }}>
                                {a.overtime_notes || '-'}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                {(isSuperAdmin || currentUser.role?.name === 'OWNER' || currentUser.role?.name === 'ADMIN') && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAttendance(a.id)}
                                    style={{ background: '#fef2f2', color: '#dc2626', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}
                                  >
                                    {tr('Hapus', 'Delete')}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 10. PROFIL SAYA (PERSONAL USER LOGIN PROFILE, AVATAR UPLOAD, ROLE & PERSONAL KPI) */}
          {activeTab === 'profile' && (
            <div>
              <div className="page-header-row" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {tr('Profil Saya & Identitas Akun Login', 'My Profile & Login Account Details')}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {tr(
                      'Detail data lengkap pengguna yang sedang login, foto profil (avatar), informasi keahlian & jadwal kerja, hak akses role, serta performa pribadi.',
                      'Complete logged-in user profile, avatar photo, technical skills & work schedule, role permissions, and personal performance KPIs.'
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickCheckInToday(currentUser.id)}
                    style={{ background: '#ecfdf5', color: '#059669', border: '1.5px solid #6ee7b7', padding: '10px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '13px' }}
                  >
                    ✅ {tr('Check-In Kehadiran Hari Ini', 'Check-In Today')}
                  </button>
                  <button
                    type="button"
                    onClick={() => openCreateAttendanceModal(currentUser.id)}
                    style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '10px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '13px' }}
                  >
                    ⏰ {tr('+ Catat Lembur Saya', '+ Log My Overtime')}
                  </button>
                </div>
              </div>

              {/* Top Profile Hero Card with Profile Image & Role Info */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '18px',
                  border: '1px solid var(--border-light)',
                  padding: '24px',
                  marginBottom: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  gap: '24px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {/* Avatar Image + Upload Trigger */}
                <div style={{ position: 'relative', textAlign: 'center' }}>
                  {currentUser.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.full_name}
                      style={{ width: '110px', height: '110px', borderRadius: '22px', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 6px 16px rgba(2,132,199,0.25)' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '110px',
                        height: '110px',
                        borderRadius: '22px',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '42px',
                        fontWeight: 800,
                        boxShadow: '0 6px 16px rgba(2,132,199,0.25)',
                      }}
                    >
                      {(currentUser.full_name || currentUser.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginTop: '10px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={13} />
                    <span>{uploadingAvatar ? tr('Mengunggah...', 'Uploading...') : tr('Ganti Foto Profil', 'Change Photo')}</span>
                    <input type="file" accept="image/*" onChange={handleMyAvatarChange} style={{ display: 'none' }} />
                  </label>
                </div>

                {/* Complete User Identity Details */}
                <div style={{ flex: '1 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>{currentUser.full_name}</h3>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800 }}>
                      ROLE: {currentUser.role?.name}
                    </span>
                    <span style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, border: '1px solid var(--border-light)' }}>
                      NIK: {currentUser.employee_code || 'EMP-0001'}
                    </span>
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
                    {currentUser.specialization || tr('Staf Profesional DentalLab Pro', 'DentalLab Pro Specialist')}
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
                    {currentUser.bio || tr('Anggota tim laboratorium gigi presisi DentalLab Pro.', 'DentalLab Pro Precision Dental Laboratory Specialist.')}
                  </p>

                  <div className="grid-3col" style={{ gap: '10px', background: 'var(--bg-surface)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>👤 Username & Email</span>
                      <strong style={{ color: 'var(--text-main)' }}>@{currentUser.username} • {currentUser.email || '-'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>🕒 {tr('Jadwal Kerja', 'Work Schedule')}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{currentUser.work_schedule || tr('Senin - Sabtu (08:00 - 17:00)', 'Mon - Sat (08:00 - 17:00)')}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>📱 {tr('No. WhatsApp & Tgl Gabung', 'WhatsApp & Joined Date')}</span>
                      <strong style={{ color: 'var(--text-main)' }}>{currentUser.phone || '-'} ({tr('Sejak', 'Since')} {currentUser.join_date || '2023'})</strong>
                    </div>
                  </div>

                  {/* Role Menu Permissions Badges */}
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {tr(`Akses Menu Role (${currentUser.role?.name}):`, `Menu Access for Role (${currentUser.role?.name}):`)}
                    </span>
                    {allowedMenus.map((m) => (
                      <span key={m} style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800 }}>
                        ✓ {m.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4 Personal KPI & Attendance Cards */}
              <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {tr('Tugas SPK & Tahap Selesai', 'Finished Orders & Stages')}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                    {(currentUser.completed_orders_count || 0) + (currentUser.completed_stages_count || 0)} {tr('Selesai', 'Done')}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                    {tr('Sedang dikerjakan:', 'In Progress:')} {currentUser.active_orders_count || 0} {tr('SPK Aktif', 'Active SPKs')}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {tr('Ketepatan Waktu Pribadi', 'Personal On-Time Rate')}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                    {currentUser.on_time_rate ?? 100}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                    On-Time Delivery Rate
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {tr('Kualitas Hasil Kerja (QC)', 'Workmanship Quality (QC)')}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                    {currentUser.qc_pass_rate ?? 100}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, marginTop: '4px' }}>
                    ★ {tr('Rating Dokter:', 'Dentist Rating:')} {(currentUser.avg_feedback_rating || 5.0).toFixed(1)} / 5.0
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {tr('Presensi & Jam Lembur Saya', 'My Presence & Overtime')}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                    {currentUser.attendance_present_days || 0} {tr('Hari Hadir', 'Days Present')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 700, marginTop: '4px' }}>
                    {tr('Total Lembur:', 'Total Overtime:')} {currentUser.total_overtime_hours || 0} {tr('Jam', 'Hours')}
                  </div>
                </div>
              </div>

              {/* 2-Column Layout: Form Edit Profil Saya & Daftar Tugas/Absensi Saya */}
              <div className="grid-2col" style={{ gap: '20px', alignItems: 'start' }}>
                {/* Left Column: Edit My Profile Form */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                    ✏️ {tr('Edit Data Lengkap Profil Saya', 'Edit My Full Profile')}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    {tr(
                      'Perbarui informasi pribadi, keahlian teknis, jadwal kerja, alamat, dan kata sandi akun Anda.',
                      'Update personal details, technical competency, work schedule, address, and password.'
                    )}
                  </p>
                  <form onSubmit={handleSaveMyProfile}>
                    <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                          {tr('Nama Lengkap *', 'Full Name *')}
                        </label>
                        <input
                          type="text"
                          value={myFullName}
                          onChange={(e) => setMyFullName(e.target.value)}
                          required
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                          {tr('Jabatan / Spesialisasi', 'Job Title / Specialization')}
                        </label>
                        <input
                          type="text"
                          value={mySpecialization}
                          onChange={(e) => setMySpecialization(e.target.value)}
                          placeholder="Contoh: Senior Ceramist / CAD-CAM"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                        />
                      </div>
                    </div>

                    <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Email</label>
                        <input
                          type="email"
                          value={myEmail}
                          onChange={(e) => setMyEmail(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                          {tr('No. WhatsApp / Telepon', 'WhatsApp / Phone No.')}
                        </label>
                        <input
                          type="text"
                          value={myPhone}
                          onChange={(e) => setMyPhone(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                        />
                      </div>
                    </div>

                    <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                          {tr('Jadwal Kerja / Shift', 'Work Schedule / Shift')}
                        </label>
                        <input
                          type="text"
                          value={mySchedule}
                          onChange={(e) => setMySchedule(e.target.value)}
                          placeholder="Senin - Sabtu (08:00 - 17:00)"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                          {tr('Tanggal Bergabung', 'Joined Date')}
                        </label>
                        <input
                          type="date"
                          value={myJoinDate}
                          onChange={(e) => setMyJoinDate(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        {tr('Keahlian Teknis / Kompetensi (Pisahkan dengan koma)', 'Technical Competencies (Comma-separated)')}
                      </label>
                      <input
                        type="text"
                        value={mySkills}
                        onChange={(e) => setMySkills(e.target.value)}
                        placeholder="Contoh: Model Gips, CAD Design, Wax-up, Zirconia Milling, Porcelain Layering, QC"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        {tr('Alamat Domisili', 'Home Address')}
                      </label>
                      <input
                        type="text"
                        value={myAddress}
                        onChange={(e) => setMyAddress(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        {tr('Bio Singkat / Catatan Profil', 'Short Bio / Profile Notes')}
                      </label>
                      <textarea
                        rows={2}
                        value={myBio}
                        onChange={(e) => setMyBio(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        {tr('Ganti Password Baru (Kosongkan jika tidak ingin mengubah)', 'New Password (Leave blank to keep current)')}
                      </label>
                      <input
                        type="password"
                        value={myNewPassword}
                        onChange={(e) => setMyNewPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--primary)', color: '#ffffff', fontWeight: 700, fontSize: '14px' }}
                    >
                      {loading ? tr('Menyimpan...', 'Saving...') : tr('Simpan Perubahan Profil Saya', 'Save Profile Changes')}
                    </button>
                  </form>
                </div>

                {/* Right Column: My Assigned Tasks & My Recent Attendance */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* My Assigned SPK Orders */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
                      📋 {tr('Penugasan SPK Saya', 'My Assigned SPKs')} ({orders.filter((o) => o.current_technician_id === currentUser.id || (o.stage_runs || []).some((sr) => sr.technician_id === currentUser.id)).length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {orders
                        .filter((o) => o.current_technician_id === currentUser.id || (o.stage_runs || []).some((sr) => sr.technician_id === currentUser.id))
                        .slice(0, 5)
                        .map((o) => (
                          <div
                            key={o.id}
                            style={{ padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <div>
                              <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '13px' }}>
                                {o.order_number} — {o.patient_name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {o.denture_type?.name} • {tr('Tahap:', 'Stage:')} <strong>{o.current_stage_name || o.status}</strong>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrder(o)
                                setActiveTab('orders')
                              }}
                              style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}
                            >
                              {tr('Buka SPK', 'Open SPK')}
                            </button>
                          </div>
                        ))}
                      {orders.filter((o) => o.current_technician_id === currentUser.id || (o.stage_runs || []).some((sr) => sr.technician_id === currentUser.id)).length === 0 && (
                        <div style={{ fontSize: '12px', color: 'var(--text-subtle)', padding: '12px 0' }}>
                          {tr('Belum ada SPK spesifik yang ditugaskan langsung ke akun ini.', 'No active SPK orders directly assigned to this account.')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* My Attendance & Overtime History */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
                      ⏰ {tr('Riwayat Absensi & Lembur Saya', 'My Attendance & Overtime History')}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {attendances
                        .filter((a) => a.user_id === currentUser.id)
                        .slice(0, 6)
                        .map((a) => (
                          <div
                            key={a.id}
                            style={{ padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-main)' }}>
                                {new Date(a.attendance_date).toLocaleDateString(dateLocale, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} ({a.check_in} - {a.check_out})
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.overtime_notes || a.shift_schedule}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 800 }}>
                                {a.status}
                              </span>
                              {a.overtime_hours > 0 && (
                                <div style={{ fontSize: '11px', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
                                  +{a.overtime_hours} {tr('Jam Lembur', 'Hours OT')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Edit Profil & Keahlian Staf/Tekniker (HR Management) */}
      {editingStaff && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              Edit Profile Tekniker & Staf: {editingStaff.full_name}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Atur role, keahlian/kompetensi teknis, jadwal kerja, dan foto profil staf.
            </p>
            <form onSubmit={handleSaveStaffProfile}>
              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Nama Lengkap *</label>
                  <input
                    type="text"
                    value={staffFullName}
                    onChange={(e) => setStaffFullName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Role Sistem *</label>
                  <select
                    value={staffRoleId}
                    onChange={(e) => setStaffRoleId(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    {rolesList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Spesialisasi / Jabatan</label>
                  <input
                    type="text"
                    value={staffSpecialization}
                    onChange={(e) => setStaffSpecialization(e.target.value)}
                    placeholder="Senior Ceramist / CAD-CAM"
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Jadwal Kerja / Shift</label>
                  <input
                    type="text"
                    value={staffSchedule}
                    onChange={(e) => setStaffSchedule(e.target.value)}
                    placeholder="Senin - Sabtu (08:00 - 17:00)"
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Keahlian Teknis (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={staffSkills}
                  onChange={(e) => setStaffSkills(e.target.value)}
                  placeholder="Model Gips, CAD Design, Wax-up, Casting, Porcelain, QC"
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>No. WhatsApp</label>
                  <input
                    type="text"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Upload Foto Profil Baru (Opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setStaffAvatarFile(e.target.files[0])
                    }}
                    style={{ fontSize: '12px', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Bio / Catatan Kompetensi</label>
                <textarea
                  rows={2}
                  value={staffBio}
                  onChange={(e) => setStaffBio(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setEditingStaff(null)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Absensi & Lembur (HR Management) */}
      {showAttendanceModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              ⏰ Catat Kehadiran & Jam Lembur
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Input presensi harian tekniker/staf beserta jam lembur pengerjaan produksi.
            </p>
            <form onSubmit={handleSaveAttendance}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Pilih Staf / Tekniker *</label>
                <select
                  value={attUserId}
                  onChange={(e) => setAttUserId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Tanggal Kehadiran *</label>
                  <input
                    type="date"
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Status Kehadiran *</label>
                  <select
                    value={attStatus}
                    onChange={(e) => setAttStatus(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="HADIR">HADIR (Tepat Waktu)</option>
                    <option value="TERLAMBAT">TERLAMBAT</option>
                    <option value="IZIN">IZIN</option>
                    <option value="SAKIT">SAKIT</option>
                    <option value="CUTI">CUTI</option>
                  </select>
                </div>
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Jam Masuk (Check-In)</label>
                  <input
                    type="time"
                    value={attCheckIn}
                    onChange={(e) => setAttCheckIn(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Jam Pulang (Check-Out)</label>
                  <input
                    type="time"
                    value={attCheckOut}
                    onChange={(e) => setAttCheckOut(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Shift Kerja</label>
                  <input
                    type="text"
                    value={attShift}
                    onChange={(e) => setAttShift(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Durasi Lembur (Jam)</label>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    step={0.5}
                    value={attOvertimeHours}
                    onChange={(e) => setAttOvertimeHours(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', fontWeight: 700, background: 'var(--bg-card)', color: '#d97706' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Catatan Lembur / Pekerjaan SPK
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Lembur 2 jam finishing & glazing SPK Zirconia Cito..."
                  value={attOvertimeNotes}
                  onChange={(e) => setAttOvertimeNotes(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAttendanceModal(false)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add User (User Management) */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>Tambah User Baru</h3>
            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Username *</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Nama Lengkap *</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {tr('Tenant / Cabang Lab *', 'Tenant / Lab Branch *')}
                </label>
                <select
                  value={newUserTenantID}
                  onChange={(e) => setNewUserTenantID(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  <option value="">{tr('-- Pilih Tenant / Lab --', '-- Select Tenant / Lab --')}</option>
                  {tenantsList.map((tn) => (
                    <option key={tn.id} value={tn.id}>
                      🏢 {tn.name} ({tn.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Role Akun *</label>
                <select
                  value={newRoleID}
                  onChange={(e) => setNewRoleID(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2col" style={{ gap: '10px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>No. Handphone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddUserModal(false)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Tenant (Super Admin Only) */}
      {showAddTenantModal && isSuperAdmin && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} color="var(--primary)" />
              <span>{t.addTenantBtn}</span>
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {tr('Buat tenant / cabang baru. Data pesanan, user, stok & keuangan akan diisolasi mandiri.', 'Create a new tenant / branch. Orders, users, stock & finances will be strictly isolated.')}
            </p>
            <form onSubmit={handleCreateTenant}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {tr('Kode Tenant (Unik, huruf kecil tanpa spasi) *', 'Tenant Code (Unique, lowercase without spaces) *')}
                </label>
                <input
                  type="text"
                  placeholder="cth: surabaya, medan, cabang-02"
                  value={newTenantCode}
                  onChange={(e) => setNewTenantCode(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {tr('Nama Tenant / Cabang Lab *', 'Tenant / Branch Lab Name *')}
                </label>
                <input
                  type="text"
                  placeholder="cth: Dental Lab Mandiri Cabang Surabaya"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {t.tenantAddress}
                </label>
                <input
                  type="text"
                  placeholder="cth: Jl. Pemuda No. 45, Surabaya"
                  value={newTenantAddress}
                  onChange={(e) => setNewTenantAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="grid-2col" style={{ gap: '10px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {t.tenantPhone}
                  </label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={newTenantPhone}
                    onChange={(e) => setNewTenantPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {t.tenantEmail}
                  </label>
                  <input
                    type="email"
                    placeholder="lab.sby@dentallab.com"
                    value={newTenantEmail}
                    onChange={(e) => setNewTenantEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}
                >
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Tenant (Super Admin Only) */}
      {editingTenant && isSuperAdmin && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} color="var(--primary)" />
              <span>{tr('Edit Informasi Tenant', 'Edit Tenant Information')}</span>
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {tr(`Ubah nama, kontak atau status operasional tenant "${editingTenant.code}".`, `Update name, contact or operational status of tenant "${editingTenant.code}".`)}
            </p>
            <form onSubmit={handleUpdateTenant}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {t.tenantName} *
                </label>
                <input
                  type="text"
                  value={editTenantName}
                  onChange={(e) => setEditTenantName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {t.tenantAddress}
                </label>
                <input
                  type="text"
                  value={editTenantAddress}
                  onChange={(e) => setEditTenantAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="grid-2col" style={{ gap: '10px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {t.tenantPhone}
                  </label>
                  <input
                    type="text"
                    value={editTenantPhone}
                    onChange={(e) => setEditTenantPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {t.tenantEmail}
                  </label>
                  <input
                    type="email"
                    value={editTenantEmail}
                    onChange={(e) => setEditTenantEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  <input
                    type="checkbox"
                    checked={editTenantActive}
                    onChange={(e) => setEditTenantActive(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{tr('Status Tenant Aktif (Bisa Login & Transaksi)', 'Active Tenant Status (Can Login & Transact)')}</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}
                >
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Role (Super Admin Only) */}
      {showAddRoleModal && isSuperAdmin && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--primary)" />
              <span>{t.addRoleBtn}</span>
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {tr('Role dibuat di Super Admin page dan bersifat global untuk seluruh tenant.', 'Roles are created on Super Admin page and shared globally across all tenants.')}
            </p>
            <form onSubmit={handleCreateRole}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {t.roleName} *
                </label>
                <input
                  type="text"
                  placeholder="cth: MARKETING, SUPERVISOR, COURIER"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {t.roleDesc}
                </label>
                <input
                  type="text"
                  placeholder="cth: Akses operasional lapangan dan monitoring pesanan"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  {tr('Pilih Akses Menu Awal:', 'Select Initial Menu Access:')}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '10px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  {allSystemMenus.map((menu) => {
                    const checked = newRoleMenus.includes(menu.key)
                    return (
                      <label key={menu.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setNewRoleMenus(newRoleMenus.filter((k) => k !== menu.key))
                            } else {
                              setNewRoleMenus([...newRoleMenus, menu.key])
                            }
                          }}
                        />
                        <span>{menu.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}
                >
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QC Review Modal */}
      {qcModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>{t.qcModalTitle}</h3>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Checklist Pemeriksaan Mutu (QC):</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                {[
                  { key: 'oklusi', label: 'Oklusi & Artikulasi' },
                  { key: 'marginal_fit', label: 'Marginal Fit / Tepi' },
                  { key: 'kontak_proksimal', label: 'Kontak Proksimal' },
                  { key: 'shade_match', label: 'Kesesuaian Shade Warna' },
                  { key: 'polishing', label: 'Finishing & Poles Kilap' },
                ].map((chk) => (
                  <label key={chk.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={(qcChecklist as any)[chk.key]}
                      onChange={(e) => setQcChecklist({ ...qcChecklist, [chk.key]: e.target.checked })}
                    />
                    <span>{chk.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Hasil Pemeriksaan Akhir:</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setQcPassed(true)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: qcPassed ? '2px solid #10b981' : '1px solid var(--border-light)', background: qcPassed ? '#ecfdf5' : 'var(--bg-card)', color: qcPassed ? '#059669' : 'var(--text-muted)', fontWeight: 700 }}
                >
                  {t.qcPassedBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setQcPassed(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: !qcPassed ? '2px solid #ef4444' : '1px solid var(--border-light)', background: !qcPassed ? '#fef2f2' : 'var(--bg-card)', color: !qcPassed ? '#b91c1c' : 'var(--text-muted)', fontWeight: 700 }}
                >
                  {t.qcFailedBtn}
                </button>
              </div>
            </div>

            {!qcPassed && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>{t.qcTargetStage}</label>
                <select
                  value={qcReworkStage}
                  onChange={(e) => setQcReworkStage(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  {(selectedOrder?.stage_runs || []).map((sr) => (
                    <option key={sr.id} value={sr.stage_code}>
                      {sr.stage_name} ({sr.stage_code})
                    </option>
                  ))}
                  {(!selectedOrder?.stage_runs || selectedOrder.stage_runs.length === 0) && (
                    <>
                      <option value="CAST_MODEL">Cetak Ulang Model Gips</option>
                      <option value="WAX_COPING">Wax-up / Design Ulang</option>
                      <option value="METAL_CASTING">Casting / Milling Ulang</option>
                      <option value="GLAZE_POLISH">Finishing & Poles Ulang</option>
                    </>
                  )}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                📸 Upload Foto Hasil Akhir / Dokumentasi QC (Opsional):
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setQcPhotoFile(e.target.files[0])
                  }
                }}
                style={{ fontSize: '12px', width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>{t.qcNotesLabel}</label>
              <textarea
                rows={3}
                placeholder="Catatan ketepatan marginal fit, kontak oklusi, warna..."
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setQcModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                {t.cancelBtn}
              </button>
              <button onClick={handleQCSubmit} style={{ padding: '8px 20px', background: qcPassed ? '#10b981' : '#ef4444', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                {t.saveQcBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Master Dokter & Klinik (CRM) */}
      {showAddCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
              {editingCustomer ? tr(`Edit Master Dokter: ${editingCustomer.name}`, `Edit Dentist Master: ${editingCustomer.name}`) : tr('Tambah Master Dokter / Klinik Baru', 'Add New Dentist / Clinic Master')}
            </h3>
            <form onSubmit={handleSaveCustomer}>
              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Nama Dokter *', 'Dentist Name *')}</label>
                  <input
                    type="text"
                    placeholder={tr("drg. Nama Dokter, Sp.Pros", "Dr. Dentist Name, DDS")}
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Nama Klinik / RS *', 'Clinic / Hospital Name *')}</label>
                  <input
                    type="text"
                    placeholder={tr("Klinik Gigi / RS...", "Dental Clinic / Hospital...")}
                    value={newCustClinic}
                    onChange={(e) => setNewCustClinic(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('No. WhatsApp *', 'WhatsApp Number *')}</label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Email</label>
                  <input
                    type="email"
                    placeholder="dokter@klinik.id"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Alamat Klinik / Pengiriman', 'Clinic / Delivery Address')}</label>
                <input
                  type="text"
                  placeholder={tr("Jl. ...", "Street address...")}
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              {/* Preferensi Dokter (Warna Gigi & Tipe Gigi Favorit) */}
              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Preferensi Warna Gigi Favorit', 'Preferred Tooth Shade')}</label>
                  <select
                    value={newCustFavShade}
                    onChange={(e) => setNewCustFavShade(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    {['VITA A1', 'VITA A2', 'VITA A3', 'VITA A3.5', 'VITA B1', 'VITA B2', 'VITA C1', 'BLEACH BL2'].map((sh) => (
                      <option key={sh} value={sh}>
                        {sh}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Tipe Gigi Tiruan Favorit', 'Preferred Denture Type')}</label>
                  <select
                    value={newCustFavType}
                    onChange={(e) => setNewCustFavType(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    {dentureTypes.map((dt) => (
                      <option key={dt.id} value={dt.name}>
                        {dt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Loyalty System & Diskon Pelanggan Tetap */}
              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Loyalty Tier Pelanggan', 'Customer Loyalty Tier')}</label>
                  <select
                    value={newCustLoyaltyTier}
                    onChange={(e) => {
                      const tier = e.target.value
                      setNewCustLoyaltyTier(tier)
                      if (tier === 'REGULAR') setNewCustDiscount(0)
                      else if (tier === 'SILVER') setNewCustDiscount(5)
                      else if (tier === 'GOLD') setNewCustDiscount(10)
                      else if (tier === 'VIP') setNewCustDiscount(15)
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="REGULAR">{tr('REGULAR (Diskon 0%)', 'REGULAR (0% Discount)')}</option>
                    <option value="SILVER">{tr('SILVER (Diskon Tetap 5%)', 'SILVER (5% Fixed Discount)')}</option>
                    <option value="GOLD">{tr('GOLD (Diskon Tetap 10%)', 'GOLD (10% Fixed Discount)')}</option>
                    <option value="VIP">{tr('VIP Partner (Diskon Tetap 15%)', 'VIP Partner (15% Fixed Discount)')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Diskon Otomatis SPK (%)', 'Automatic Work Order Discount (%)')}</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={newCustDiscount}
                    onChange={(e) => setNewCustDiscount(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', fontWeight: 700, background: 'var(--bg-card)', color: '#059669' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {tr('Catatan Khusus Dokter (Preferensi Oklusi / Kontak / Anatomi)', 'Dentist Special Notes (Occlusion / Contact / Anatomy)')}
                </label>
                <textarea
                  rows={2}
                  placeholder={tr("Contoh: Suka oklusi ringan, kontak proksimal rapat, margin servikal halus...", "Example: Prefers light occlusion, tight proximal contacts, smooth margins...")}
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddCustomerModal(false)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Master Data Pasien */}
      {showPatientModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
              {editingPatient ? tr(`Edit Master Pasien: ${editingPatient.name}`, `Edit Patient Master: ${editingPatient.name}`) : tr('Tambah Master Data Pasien', 'Add New Patient Master')}
            </h3>
            <form onSubmit={handleSavePatient}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {tr('Dokter / Klinik Pengirim *', 'Referring Dentist / Clinic *')}
                </label>
                <select
                  value={patCustomerId}
                  onChange={(e) => setPatCustomerId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  <option value="">{tr('-- Pilih Dokter / Klinik --', '-- Select Dentist / Clinic --')}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.clinic_name})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {tr('Nama Lengkap Pasien *', 'Patient Full Name *')}
                </label>
                <input
                  type="text"
                  placeholder={tr("Contoh: Bpk. Hendra Gunawan", "Example: Mr. John Doe")}
                  value={patName}
                  onChange={(e) => setPatName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="grid-3col" style={{ gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Jenis Kelamin', 'Gender')}</label>
                  <select
                    value={patGender}
                    onChange={(e) => setPatGender(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="L">{tr("Laki-laki (L)", "Male (M)")}</option>
                    <option value="P">{tr("Perempuan (P)", "Female (F)")}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Usia (Tahun)', 'Age (Years)')}</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={patAge}
                    onChange={(e) => setPatAge(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Shade Gigi Pasien', 'Patient Tooth Shade')}</label>
                  <select
                    value={patDefaultShade}
                    onChange={(e) => setPatDefaultShade(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    {['VITA A1', 'VITA A2', 'VITA A3', 'VITA A3.5', 'VITA B1', 'VITA B2', 'VITA C1', 'BLEACH BL2'].map((sh) => (
                      <option key={sh} value={sh}>
                        {sh}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2col" style={{ gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('No. Telepon Pasien (Opsional)', 'Patient Phone (Optional)')}</label>
                  <input
                    type="text"
                    placeholder="0812..."
                    value={patPhone}
                    onChange={(e) => setPatPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Riwayat Elemen Gigi', 'Tooth Elements History')}</label>
                  <input
                    type="text"
                    placeholder={tr('Contoh: ["11","21"]', 'Example: ["11","21"]')}
                    value={patLastTeeth}
                    onChange={(e) => setPatLastTeeth(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {tr('Catatan Klinis / Riwayat Alergi Bahan (Logam, Akrilik, dll)', 'Clinical Notes / Material Allergy History (Metal, Acrylic, etc.)')}
                </label>
                <textarea
                  rows={2}
                  placeholder={tr("Contoh: Alergi logam nikel (gunakan Valplast/Zirconia), riwayat bruxism...", "Example: Nickel metal allergy (use Valplast/Zirconia), history of bruxism...")}
                  value={patNotes}
                  onChange={(e) => setPatNotes(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowPatientModal(false)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Input Feedback / Evaluasi Dokter atas Order */}
      {feedbackOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              ★ Catat Feedback / Evaluasi Dokter
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              SPK <strong>{feedbackOrder.order_number}</strong> — {tr('Dokter:', 'Doctor:')} <strong>{feedbackOrder.customer?.name}</strong> ({tr('Pasien:', 'Patient:')} {feedbackOrder.patient_name})
            </p>
            <form onSubmit={handleSaveFeedback}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {tr('Rating Kepuasan Dokter (1 - 5 Bintang)', 'Doctor Satisfaction Rating (1 - 5 Stars)')}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 800,
                        background: feedbackRating >= star ? '#fef3c7' : 'var(--bg-surface)',
                        color: feedbackRating >= star ? '#d97706' : 'var(--text-subtle)',
                        border: feedbackRating === star ? '2px solid #f59e0b' : '1px solid var(--border-light)',
                      }}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  {tr('Catatan Feedback / Testimoni Dokter', 'Dentist Feedback Notes / Testimonial')}
                </label>
                <textarea
                  rows={3}
                  placeholder={tr("Contoh: Marginal fit sangat presisi, warna sesuai shade guide, insersi cepat tanpa grinding...", "Example: Marginal fit is very precise, shade matches well, quick insertion without grinding...")}
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setFeedbackOrder(null)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  {tr('Simpan Feedback', 'Save Feedback')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Master Bahan & Produk */}
      {showItemModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
              {editingItem ? tr(`Edit Master Bahan: ${editingItem.name}`, `Edit Material Master: ${editingItem.name}`) : tr('Tambah Master Data Bahan / Produk', 'Add New Material / Product Master')}
            </h3>
            <form onSubmit={handleSaveItem}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {tr('Nama Bahan / Produk *', 'Material / Product Name *')}
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Akrilik Heat Cure, Gips Tipe 4, Gigi Tiruan Resin..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Kategori *', 'Category *')}</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="RAW_MATERIAL">{tr("RAW_MATERIAL (Bahan Baku)", "RAW_MATERIAL (Raw Material)")}</option>
                    <option value="PRODUCT">{tr("PRODUCT (Produk / Gigi Tiruan)", "PRODUCT (Finished Product)")}</option>
                    <option value="CONSUMABLE">{tr("CONSUMABLE (Habis Pakai)", "CONSUMABLE (Consumables)")}</option>
                    <option value="TOOL">{tr("TOOL (Alat & Bur)", "TOOL (Tools & Bur Bits)")}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Satuan *', 'Unit *')}</label>
                  <select
                    value={itemUnitId}
                    onChange={(e) => setItemUnitId(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    {unitsList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Supplier Utama', 'Primary Supplier')}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={itemSupplierId}
                    onChange={(e) => setItemSupplierId(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="">{tr('-- Pilih Supplier --', '-- Select Supplier --')}</option>
                    {suppliersList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowSupplierModal(true)}
                    style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-surface)', color: 'var(--primary)', border: '1px solid var(--border-light)', fontSize: '12px', fontWeight: 700 }}
                  >
                    + Supplier
                  </button>
                </div>
              </div>

              <div className="grid-3col" style={{ gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Harga Beli (IDR) *', 'Purchase Price (IDR) *')}</label>
                  <input
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    required
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                {!editingItem && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Stok Awal', 'Initial Stock')}</label>
                    <input
                      type="number"
                      value={itemStock}
                      onChange={(e) => setItemStock(Number(e.target.value))}
                      min={0}
                      style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Min. Stok Aman *', 'Min. Safety Stock *')}</label>
                  <input
                    type="number"
                    value={itemMinStock}
                    onChange={(e) => setItemMinStock(Number(e.target.value))}
                    min={0}
                    required
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>No. Batch / Lot</label>
                  <input
                    type="text"
                    placeholder="Contoh: LOT-ACR-2026"
                    value={itemLotNumber}
                    onChange={(e) => setItemLotNumber(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Tanggal Kadaluarsa (Exp)</label>
                  <input
                    type="date"
                    value={itemExpiryDate}
                    onChange={(e) => setItemExpiryDate(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Keterangan / Spesifikasi</label>
                <input
                  type="text"
                  placeholder="Spesifikasi bahan..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowItemModal(false)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Stok Masuk (Pembelian / Restock Batch) */}
      {showStockInModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>⬇ Catat Stok Masuk (Pembelian / Restock)</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {tr('Menambah saldo stok bahan secara otomatis beserta pencatatan nomor Batch/Lot dan tanggal Expired.', 'Automatically increases material stock balance and records Batch/Lot number and Expiry date.')}
            </p>
            <form onSubmit={handleStockIn}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Pilih Bahan / Produk *', 'Select Material / Product *')}</label>
                <select
                  value={inItemId}
                  onChange={(e) => {
                    setInItemId(e.target.value)
                    const found = inventoryItems.find((i) => i.id === e.target.value)
                    if (found) {
                      setInUnitCost(found.purchase_price)
                      setInSupplierId(found.supplier_id || '')
                    }
                  }}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  <option value="">{tr('-- Pilih Bahan --', '-- Select Material --')}</option>
                  {inventoryItems.map((itm) => (
                    <option key={itm.id} value={itm.id}>
                      {itm.name} (Stok: {itm.current_stock} {itm.unit?.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Jumlah Masuk (Qty) *', 'Quantity In (Qty) *')}</label>
                  <input
                    type="number"
                    value={inQty}
                    onChange={(e) => setInQty(Number(e.target.value))}
                    min={0.1}
                    step="any"
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Harga Beli Satuan (IDR)', 'Unit Purchase Price (IDR)')}</label>
                  <input
                    type="number"
                    value={inUnitCost}
                    onChange={(e) => setInUnitCost(Number(e.target.value))}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Nomor Batch / Lot', 'Batch / Lot Number')}</label>
                  <input
                    type="text"
                    placeholder="Contoh: LOT-2026-11"
                    value={inLotNumber}
                    onChange={(e) => setInLotNumber(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Tanggal Exp (Opsional)', 'Exp Date (Optional)')}</label>
                  <input
                    type="date"
                    value={inExpiryDate}
                    onChange={(e) => setInExpiryDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Catatan Penerimaan', 'Receipt Notes')}</label>
                <input
                  type="text"
                  placeholder="Pembelian faktur supplier / restock gudang..."
                  value={inNotes}
                  onChange={(e) => setInNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowStockInModal(false)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: '#10b981', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  {tr('Simpan Stok Masuk', 'Save Stock In')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Pemakaian Bahan (Stok Keluar) */}
      {showStockOutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>⬆ Catat Pemakaian Bahan (Stok Keluar)</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {tr('Mengurangi stok secara otomatis dengan metode FEFO (batch yang mendekati expired dikurangi lebih dulu) dan mencatat riwayat penggunaan.', 'Automatically deducts stock using FEFO (nearest expiry first) and logs usage history.')}
            </p>
            <form onSubmit={handleStockOut}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Pilih Bahan yang Digunakan *', 'Select Material to Use *')}</label>
                <select
                  value={outItemId}
                  onChange={(e) => {
                    setOutItemId(e.target.value)
                    setOutBatchId('')
                  }}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  <option value="">-- Pilih Bahan --</option>
                  {inventoryItems.map((itm) => (
                    <option key={itm.id} value={itm.id}>
                      {itm.name} (Tersedia: {itm.current_stock} {itm.unit?.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Jumlah Pemakaian (Qty) *', 'Usage Quantity (Qty) *')}</label>
                  <input
                    type="number"
                    value={outQty}
                    onChange={(e) => setOutQty(Number(e.target.value))}
                    min={0.1}
                    step="any"
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Batch / Lot (Otomatis FEFO)', 'Batch / Lot (Automatic FEFO)')}</label>
                  <select
                    value={outBatchId}
                    onChange={(e) => setOutBatchId(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="">{tr('Otomatis (Exp Terdekat / FEFO)', 'Automatic (Nearest Exp / FEFO)')}</option>
                    {inventoryBatches
                      .filter((b) => b.item_id === outItemId && b.current_quantity > 0)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.lot_number || 'Batch'} (Sisa: {b.current_quantity})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Kaitkan dengan No. SPK Produksi (Opsional)', 'Link to SPK Work Order (Optional)')}</label>
                <select
                  value={outOrderId}
                  onChange={(e) => setOutOrderId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  <option value="">{tr('-- Pemakaian Umum / Tanpa SPK Spesifik --', '-- General Lab Usage / No Specific SPK --')}</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.order_number} — Pasien: {o.patient_name} ({o.denture_type?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Catatan Pemakaian Teknisi', 'Technician Usage Notes')}</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengecoran model kerja / packing akrilik SPK..."
                  value={outNotes}
                  onChange={(e) => setOutNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowStockOutModal(false)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: '#f59e0b', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  Catat Pemakaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Supplier */}
      {showSupplierModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>{tr('Tambah Supplier Bahan Dental', 'Add Dental Material Supplier')}</h3>
            <form onSubmit={handleSaveSupplier}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Nama Perusahaan Supplier *', 'Supplier Company Name *')}</label>
                <input
                  type="text"
                  placeholder="PT / CV Dental Supply..."
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>
              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Kontak Person</label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>No. Telepon / WA</label>
                  <input
                    type="text"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Alamat</label>
                <input
                  type="text"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowSupplierModal(false)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Purchase Request */}
      {showAddPRModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>{t.requestMaterialBtn}</h3>
            <form onSubmit={handleCreatePR}>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Pilih Bahan Baku / Produk *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPRModal(false)
                      openCreateItemModal()
                    }}
                    style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', background: 'transparent' }}
                  >
                    + Bahan Baru
                  </button>
                </div>
                <select
                  value={prItem}
                  onChange={(e) => {
                    setPrItem(e.target.value)
                    const itm = inventoryItems.find((i) => i.id === e.target.value)
                    if (itm) {
                      setPrEstPrice(itm.purchase_price)
                      if (itm.supplier_id) setPrSupplierId(itm.supplier_id)
                    }
                  }}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  <option value="">Pilih barang...</option>
                  {inventoryItems.map((itm) => (
                    <option key={itm.id} value={itm.id}>
                      {itm.name} ({itm.code}) — Stok: {itm.current_stock} {itm.unit?.code}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Supplier Tujuan</label>
                <select
                  value={prSupplierId}
                  onChange={(e) => setPrSupplierId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  <option value="">-- Pilih Supplier --</option>
                  {suppliersList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Jumlah (Qty)</label>
                  <input
                    type="number"
                    value={prQty}
                    onChange={(e) => setPrQty(Number(e.target.value))}
                    min={1}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Estimasi Harga</label>
                  <input
                    type="number"
                    value={prEstPrice}
                    onChange={(e) => setPrEstPrice(Number(e.target.value))}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>{tr('Catatan Pengajuan', 'Request Notes')}</label>
                <textarea
                  rows={2}
                  placeholder="Kebutuhan stok mendesak untuk produksi mahkota..."
                  value={prNotes}
                  onChange={(e) => setPrNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowAddPRModal(false)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  {tr('Kirim ke Owner', 'Submit to Owner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>{tr('Catat Pembayaran Tagihan', 'Record Invoice Payment')}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {selectedInvoice.invoice_number} — Sisa: <strong style={{ color: '#dc2626' }}>{formatRupiah(selectedInvoice.balance_due)}</strong>
            </p>

            <form onSubmit={handleRecordPayment}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>{tr('Nominal Pembayaran (IDR)', 'Payment Amount (IDR)')}</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '14px', fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>{tr('Metode Bayar', 'Payment Method')}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="BANK_TRANSFER">{tr("Transfer Bank", "Bank Transfer")}</option>
                    <option value="CASH">{tr("Tunai (Cash)", "Cash")}</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>{tr('Jenis Bayar', 'Payment Type')}</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="PARTIAL">{tr("Cicilan / Bertahap", "Installment / Partial")}</option>
                    <option value="DEPOSIT">{tr("Uang Muka (DP)", "Deposit (DP)")}</option>
                    <option value="FINAL">{tr("Pelunasan", "Full Settlement")}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button type="button" onClick={() => setSelectedInvoice(null)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  {tr('Konfirmasi Pembayaran', 'Confirm Payment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`

      {/* Modal Preview & Cetak Nota Invoice Pembayaran + Hasil Order Produksi */}
      {viewingInvoice && (
        <div className="modal-overlay" onClick={() => setViewingInvoice(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '720px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const orderObj =
                viewingInvoice.production_order || orders.find((o) => o.id === viewingInvoice.production_order_id)
              const qcPassedObj = orderObj?.quality_checks?.find((q) => q.passed) || orderObj?.quality_checks?.[0]
              return (
                <div>
                  {/* Header Dokumen Nota Invoice & Hasil Order */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      borderBottom: '2px solid var(--border-light)',
                      paddingBottom: '14px',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px' }}>
                        DENTAL LABORATORY MANAGEMENT SYSTEM
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                        {tr('NOTA INVOICE & BUKTI HASIL ORDER', 'OFFICIAL INVOICE & ORDER PROOF')}
                      </h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tr('No. Invoice:', 'Invoice No:')} <strong style={{ color: 'var(--primary)' }}>{viewingInvoice.invoice_number}</strong> &bull; {tr('Tgl Terbit:', 'Issue Date:')}{' '}
                        {new Date(viewingInvoice.issue_date).toLocaleDateString(dateLocale)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '6px 14px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 800,
                          background:
                            viewingInvoice.status === 'PAID'
                              ? '#dcfce7'
                              : viewingInvoice.status === 'PARTIALLY_PAID'
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            viewingInvoice.status === 'PAID'
                              ? '#15803d'
                              : viewingInvoice.status === 'PARTIALLY_PAID'
                              ? '#b45309'
                              : '#dc2626',
                        }}
                      >
                        {viewingInvoice.status === 'PAID'
                          ? tr('✓ LUNAS (PAID)', '✓ PAID IN FULL')
                          : viewingInvoice.status === 'PARTIALLY_PAID'
                          ? tr('⏳ CICILAN (PARTIALLY PAID)', '⏳ PARTIALLY PAID')
                          : tr('⚠️ BELUM BAYAR (UNPAID)', '⚠️ UNPAID')}
                      </span>
                    </div>
                  </div>

                  {/* Bagian 1: Data Pelanggan Dokter & Identitas SPK Pasien */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-light)',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {tr('Tagihan Kepada (Dokter / Klinik):', 'Billed To (Dentist / Clinic):')}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                        {viewingInvoice.customer?.name || orderObj?.customer?.name || '-'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {viewingInvoice.customer?.clinic_name || orderObj?.customer?.clinic_name || '-'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        WA/Telp: {viewingInvoice.customer?.phone || orderObj?.customer?.phone || '-'}
                      </div>
                      {viewingInvoice.customer?.address && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {viewingInvoice.customer?.address}
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {tr('Rujukan Pesanan & Pasien (SPK):', 'Work Order & Patient Reference:')}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
                        {orderObj?.order_number || viewingInvoice.production_order_id || '-'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-main)' }}>
                        {tr('Nama Pasien:', 'Patient Name:')} <strong>{orderObj?.patient_name || '-'}</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tr('Jenis Gigi:', 'Denture Type:')} {orderObj?.denture_type?.name || '-'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Shade: <strong>{orderObj?.shade_guide || '-'}</strong> | {tr('Elemen Gigi:', 'Teeth Element:')}{' '}
                        {orderObj?.teeth_numbers || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Bagian 2: Rincian Tagihan Pekerjaan Laboratorium */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                      {tr('Rincian Biaya Pembuatan Gigi Tiruan:', 'Denture Fabrication Fee Breakdown:')}
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                          <th style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{tr('Deskripsi Pekerjaan', 'Work Description')}</th>
                          <th style={{ padding: '8px 10px', color: 'var(--text-muted)', textAlign: 'center' }}>Qty</th>
                          <th style={{ padding: '8px 10px', color: 'var(--text-muted)', textAlign: 'right' }}>{tr('Harga Satuan', 'Unit Price')}</th>
                          <th style={{ padding: '8px 10px', color: 'var(--text-muted)', textAlign: 'right' }}>{tr('Subtotal', 'Subtotal')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingInvoice.items && viewingInvoice.items.length > 0 ? (
                          viewingInvoice.items.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '10px', color: 'var(--text-main)', fontWeight: 600 }}>{item.description}</td>
                              <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-main)' }}>{item.quantity}</td>
                              <td style={{ padding: '10px', textAlign: 'right', color: 'var(--text-main)' }}>
                                {formatRupiah(item.unit_price)}
                              </td>
                              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                                {formatRupiah(item.subtotal)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '10px', color: 'var(--text-main)', fontWeight: 600 }}>
                              {orderObj?.denture_type?.name || tr('Pembuatan Gigi Tiruan', 'Denture Fabrication')}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>1</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                              {formatRupiah(viewingInvoice.subtotal || viewingInvoice.total_amount)}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>
                              {formatRupiah(viewingInvoice.subtotal || viewingInvoice.total_amount)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Bagian 3: Foto Dokumentasi Hasil Akhir & Ringkasan Pembayaran */}
                  <div className="grid-2col" style={{ gap: '16px', marginBottom: '16px', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                        📷 {tr('Dokumentasi Hasil Akhir & Riwayat Pembayaran:', 'Final Output Photos & Payment History:')}
                      </div>
                      {orderObj?.attachments && orderObj.attachments.length > 0 ? (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          {orderObj.attachments.map((att) => {
                            const rawPath = att.stored_file_path || ''
                            const url = rawPath.startsWith('http') ? rawPath : ('http://127.0.0.1:8080' + (rawPath.startsWith('/') ? '' : '/') + rawPath)
                            return (
                              <a
                                key={att.id}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'block',
                                  width: '90px',
                                  padding: '4px',
                                  borderRadius: '8px',
                                  border: '1px solid var(--border-light)',
                                  background: 'var(--bg-surface)',
                                }}
                              >
                                <img
                                  src={url}
                                  alt={att.file_name}
                                  style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                                <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
                                  {att.attachment_type}
                                </div>
                              </a>
                            )
                          })}
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                          {tr('Catatan:', 'Notes:')} {viewingInvoice.notes || orderObj?.doctor_notes || tr('Hasil produksi telah melewati tahapan QC akhir.', 'Production output passed final QC inspection.')}
                        </div>
                      )}

                      {viewingInvoice.payments && viewingInvoice.payments.length > 0 && (
                        <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                            {tr('Riwayat Pembayaran Masuk:', 'Recorded Payment History:')}
                          </div>
                          {viewingInvoice.payments.map((p) => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                              <span>{new Date(p.payment_date).toLocaleDateString(dateLocale)} ({p.payment_method})</span>
                              <strong style={{ color: '#10b981' }}>{formatRupiah(p.amount)}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Ringkasan Subtotal, Diskon Loyalty, dan Sisa Tagihan */}
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-light)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{tr('Subtotal Tagihan:', 'Subtotal:')}</span>
                        <span style={{ fontWeight: 600 }}>{formatRupiah(viewingInvoice.subtotal || viewingInvoice.total_amount)}</span>
                      </div>
                      {viewingInvoice.discount_amount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: '#10b981' }}>
                          <span>{tr('Diskon Loyalty Pelanggan:', 'Customer Loyalty Discount:')}</span>
                          <span style={{ fontWeight: 700 }}>- {formatRupiah(viewingInvoice.discount_amount)}</span>
                        </div>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '14px',
                          fontWeight: 800,
                          borderTop: '1px dashed var(--border-light)',
                          paddingTop: '6px',
                          marginBottom: '6px',
                          color: 'var(--text-main)',
                        }}
                      >
                        <span>{tr('Total Tagihan Bersih:', 'Net Total Due:')}</span>
                        <span style={{ color: 'var(--primary)' }}>{formatRupiah(viewingInvoice.total_amount)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{tr('Sudah Dibayar (DP/Cicilan):', 'Paid (Deposit/Partial):')}</span>
                        <span style={{ fontWeight: 700, color: '#10b981' }}>{formatRupiah(viewingInvoice.paid_amount)}</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '13px',
                          fontWeight: 800,
                          borderTop: '1px solid var(--border-light)',
                          paddingTop: '6px',
                          color: viewingInvoice.balance_due > 0 ? '#dc2626' : '#10b981',
                        }}
                      >
                        <span>{tr('Sisa Tagihan (Piutang):', 'Outstanding Balance Due:')}</span>
                        <span>{formatRupiah(viewingInvoice.balance_due)}</span>
                      </div>
                    </div>
                  </div>

                  {/* QC Verification Card */}
                  {qcPassedObj && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        fontSize: '12px',
                        color: '#065f46',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} color="#059669" />
                        <span>
                          {tr('Lolos Pemeriksaan Mutu (QC)', 'Passed Quality Control (QC)')} &bull; {qcPassedObj.defect_notes || tr('Sesuai spesifikasi dokter pengirim', 'Compliant with dentist specifications')}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '11px' }}>
                        QC Passed: {new Date(qcPassedObj.checked_at || new Date()).toLocaleDateString(dateLocale)}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      🖨️ {tr('Cetak Nota Invoice (PDF / Print)', 'Print Invoice (PDF / Print)')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewingInvoice(null)}
                      style={{
                        padding: '8px 20px',
                        background: 'var(--primary)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      {tr('Tutup', 'Close')}
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Modal Catat Pengeluaran & Biaya Produksi */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '520px', width: '95%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                {tr('Catat Biaya Operasional & Produksi', 'Record Operating & Production Expenses')}
              </h3>
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-muted)', background: 'transparent' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {tr('Kategori Pengeluaran *', 'Expense Category *')}
                </label>
                <select
                  value={expCategoryId}
                  onChange={(e) => setExpCategoryId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                  }}
                  required
                >
                  {expenseCategories && expenseCategories.length > 0 ? (
                    expenseCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.code})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value={1}>{tr('Bahan Baku Produksi', 'Raw Materials (Direct Material)')}</option>
                      <option value={2}>{tr('Gaji & Lembur Teknisi (Labor)', 'Technician Wages & Overtime (Labor)')}</option>
                      <option value={3}>{tr('Listrik, Air & Gas Lab (Overhead)', 'Utilities & Electricity (Overhead)')}</option>
                      <option value={4}>{tr('Maintenance Alat & Burnout Furnace', 'Equipment Maintenance & Furnace')}</option>
                      <option value={5}>{tr('Logistik & Kurir Pengiriman', 'Logistics & Delivery Courier')}</option>
                      <option value={6}>{tr('Operasional & ATK Kantor', 'Office & Administration')}</option>
                      <option value={7}>{tr('Lain-lain', 'Other')}</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {tr('Jumlah Nominal (IDR) *', 'Expense Amount (IDR) *')}
                  </label>
                  <input
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    min={100}
                    step="any"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      fontSize: '13px',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {tr('Tanggal Pengeluaran *', 'Expense Date *')}
                  </label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      fontSize: '13px',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {tr('Keterangan / Deskripsi Biaya *', 'Expense Description *')}
                </label>
                <input
                  type="text"
                  placeholder={tr('Contoh: Beli mata bur tambahan / servis furnace...', 'Example: Purchased additional bur bits / furnace maintenance...')}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--bg-surface)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                  }}
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  {tr('Simpan Biaya', 'Save Expense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Akses Online Web / Mobile: Update Status SPK Cepat dari Mana Saja */}
      {showQuickMobileModal && (
        <div className="modal-overlay" onClick={() => setShowQuickMobileModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px', width: '95%', maxHeight: '88vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smartphone size={18} color="#059669" /> {tr('Mode Update Status Cepat (Web / Mobile)', 'Quick Status Update Mode (Web / Mobile)')}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {tr('Memudahkan teknisi, admin, atau kurir mengupdate status pengerjaan SPK dari HP maupun web di mana saja.', 'Allows technicians, admins, and couriers to update SPK work order status quickly from mobile or web.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickMobileModal(false)}
                style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-muted)', background: 'transparent' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <div>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '14px' }}>{ord.order_number}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginLeft: '8px' }}>
                        {tr('Pasien:', 'Patient:')} {ord.patient_name}
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {ord.denture_type?.name} &bull; {tr('Dokter:', 'Doctor:')} {ord.customer?.name} ({ord.customer?.clinic_name})
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background:
                          ord.status === 'COMPLETED' || ord.status === 'DELIVERED'
                            ? '#dcfce7'
                            : ord.status === 'QC_PENDING'
                            ? '#fef3c7'
                            : '#e0f2fe',
                        color:
                          ord.status === 'COMPLETED' || ord.status === 'DELIVERED'
                            ? '#15803d'
                            : ord.status === 'QC_PENDING'
                            ? '#b45309'
                            : '#0369a1',
                      }}
                    >
                      {ord.current_stage_name || ord.status}
                    </span>
                  </div>

                  {/* Quick 1-Tap Status Buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {[
                      { code: 'INTAKE', label: tr('📥 Order Masuk', '📥 Order Intake') },
                      { code: 'IN_PRODUCTION', label: tr('⚙️ Dalam Proses', '⚙️ In Production') },
                      { code: 'QC_PENDING', label: tr('🔍 Siap QC', '🔍 Ready for QC') },
                      { code: 'COMPLETED', label: tr('✓ Selesai (+Auto Invoice)', '✓ Completed (+Auto Invoice)') },
                      { code: 'DELIVERED', label: tr('🚚 Dikirim ke Dokter', '🚚 Delivered to Doctor') },
                    ].map((st) => {
                      const active = ord.status === st.code
                      return (
                        <button
                          key={st.code}
                          type="button"
                          disabled={active || loading}
                          onClick={() => handleChangeOrderStatus(ord.id, st.code)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: active ? 'var(--primary)' : 'var(--bg-card)',
                            color: active ? '#ffffff' : 'var(--text-main)',
                            border: active ? 'none' : '1px solid var(--border-light)',
                          }}
                        >
                          {st.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowQuickMobileModal(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {tr('Selesai', 'Done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
