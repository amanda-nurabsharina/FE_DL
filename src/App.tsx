import React, { useState, useEffect } from 'react'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  DollarSign,
  MessageCircle,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
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
  type Customer,
  type DashboardSummary,
  type DentureType,
  type Expense,
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
  const [settingsSubTab, setSettingsSubTab] = useState<'users' | 'roles' | 'appearance'>('users')

  // Logo Upload State
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Add User Form State
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newFullName, setNewFullName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newRoleID, setNewRoleID] = useState(2)

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

  // Invoice & Payment State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER')
  const [paymentType, setPaymentType] = useState('PARTIAL')

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
      const [meData, dashData, ordersData, custData, patsData, typesData, itemsData, prData, invData, expData, usersData, rolesData, settingsData, unitsData, supsData, batchesData, movesData, invReportData, attData] = await Promise.all([
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

  // Create Invoice from Order
  const handleCreateInvoice = async (orderId: string) => {
    if (!confirm(lang === 'id' ? 'Terbitkan invoice untuk pesanan ini?' : 'Issue invoice for this order?')) return
    try {
      setLoading(true)
      await api.createInvoice({
        production_order_id: orderId,
        discount_amount: 0,
        notes: 'Tagihan pesanan gigi tiruan siap kirim',
      })
      alert(lang === 'id' ? 'Invoice berhasil diterbitkan!' : 'Invoice issued successfully!')
      await loadInitialData()
    } catch (err: any) {
      alert(err.message || 'Gagal membuat invoice')
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
    try {
      setLoading(true)
      await api.createUser({
        username: newUsername,
        password: newPassword,
        full_name: newFullName,
        email: newEmail,
        phone: newPhone,
        role_id: Number(newRoleID),
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Username akun lab"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid var(--border-light)', fontSize: '14px', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid var(--border-light)', fontSize: '14px', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', background: 'var(--primary)', color: '#ffffff', fontWeight: 700, fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Masuk ke Sistem'}
            </button>
          </form>

          {/* Quick Demo Fill Buttons including Super Admin */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pilih Akun Demo Cepat:</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
              {[
                { label: '🛡️ Super Admin (Full Access)', u: 'superadmin' },
                { label: '👑 Owner (Pemilik)', u: 'owner' },
                { label: '🩺 Admin (Asisten Lab)', u: 'admin' },
                { label: '🔬 Teknisi Gigi', u: 'teknisi1' },
                { label: '💳 Kasir / Finance', u: 'kasir' },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            title="Klik untuk melihat & edit Profil Saya"
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
                <span style={{ color: 'var(--text-subtle)' }}>• Profil</span>
              </div>
            </div>
          </button>

          <button onClick={handleLogout} title={t.logout} style={{ color: 'var(--text-subtle)', padding: '6px', borderRadius: '6px' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Super Admin Notice Bar if active */}
      {isSuperAdmin && (
        <div style={{ background: '#ecfdf5', borderBottom: '1px solid #a7f3d0', color: '#065f46', padding: '8px 20px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} />
          <span>{t.settingsOnlyNotice}</span>
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
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>{t.dashTitle}</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{t.dashSubtitle}</p>
              </div>

              {/* KPI Cards */}
              <div className="grid-stats">
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{t.activeOrders}</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>{dashboard?.active_orders_count || 0}</div>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>{t.activeOrdersSub}</span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{t.qcPending}</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#d97706' }}>{dashboard?.qc_pending_count || 0}</div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.qcPendingSub}</span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{t.revenueMonth}</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a' }}>{formatRupiah(dashboard?.total_revenue_month || 0)}</div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.operatingIncome}: {formatRupiah(dashboard?.net_operating_income || 0)}</span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{t.receivables}</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertCircle size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}>{formatRupiah(dashboard?.total_receivables || 0)}</div>
                  <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>{t.receivablesSub}</span>
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
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Warna: {o.shade_guide}</span>
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
                            {new Date(o.promised_due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button
                              onClick={() => {
                                setSelectedOrder(o)
                                setActiveTab('orders')
                              }}
                              style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}
                            >
                              Detail
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

          {/* TAB: SETTINGS (Super Admin & Owner Setup Segment) */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>{t.settingsTitle}</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{t.settingsSubtitle}</p>
              </div>

              {/* Sub-tabs Navigation */}
              <div className="tabs-scroll-container" style={{ borderBottom: '1px solid var(--border-light)', marginBottom: '24px' }}>
                {[
                  { id: 'users', label: t.tabUsers, icon: Users },
                  { id: 'roles', label: t.tabRoles, icon: ShieldCheck },
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

              {/* SETTINGS SUB-TAB 1: USER MANAGEMENT */}
              {settingsSubTab === 'users' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{t.tabUsers}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Kelola data akun pengguna, role, dan hak login sistem.</p>
                    </div>
                    <button
                      onClick={() => setShowAddUserModal(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                    >
                      <UserPlus size={16} /> {t.addUserBtn}
                    </button>
                  </div>

                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '12px' }}>Username</th>
                            <th style={{ padding: '12px' }}>Nama Lengkap</th>
                            <th style={{ padding: '12px' }}>Email</th>
                            <th style={{ padding: '12px' }}>Role</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersList.map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{u.username}</td>
                              <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{u.full_name}</td>
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
                                    {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                  </button>
                                  {u.username !== 'owner' && u.username !== 'superadmin' && (
                                    <button
                                      onClick={() => handleDeleteUser(u.id)}
                                      style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: '#fee2e2', color: '#dc2626' }}
                                    >
                                      Hapus
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
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{t.tabRoles}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {lang === 'en' ? 'Manage menus accessible by each user role.' : 'Atur menu yang dapat diakses oleh masing-masing role pengguna.'}
                    </p>
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
                    Pantau alur pembuatan gigi palsu (Model Gips → Design → Wax-up → Casting → Finishing → QC), PIC Teknis tiap tahap, status produksi, dan dokumentasi foto hasil akhir.
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
                  { key: '', label: 'Semua SPK', count: orders.length, color: 'var(--primary)' },
                  { key: 'INTAKE', label: '📥 Order Masuk', count: orders.filter((o) => o.status === 'INTAKE').length, color: '#6366f1' },
                  { key: 'IN_PRODUCTION', label: '⚙️ Dalam Proses', count: orders.filter((o) => o.status === 'IN_PRODUCTION' || o.status === 'REOPENED_FOR_REWORK').length, color: '#0284c7' },
                  { key: 'QC_PENDING', label: '🔍 Menunggu QC', count: orders.filter((o) => o.status === 'QC_PENDING').length, color: '#d97706' },
                  { key: 'COMPLETED', label: '✅ Selesai (Siap Kirim)', count: orders.filter((o) => o.status === 'COMPLETED').length, color: '#059669' },
                  { key: 'DELIVERED', label: '🚚 Dikirim ke Dokter', count: orders.filter((o) => o.status === 'DELIVERED').length, color: '#0d9488' },
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
                    placeholder="Cari No. SPK, nama pasien, atau nama dokter..."
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
                  <option value="INTAKE">Order Masuk (Intake)</option>
                  <option value="IN_PRODUCTION">Dalam Proses Produksi</option>
                  <option value="QC_PENDING">Menunggu QC</option>
                  <option value="REOPENED_FOR_REWORK">Revisi / Rework</option>
                  <option value="COMPLETED">Selesai (Siap Kirim)</option>
                  <option value="DELIVERED">Dikirim ke Dokter</option>
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
                          <th style={{ padding: '10px 8px' }}>Pasien & Jenis Gigi</th>
                          <th style={{ padding: '10px 8px' }}>Dokter & Jadwal</th>
                          <th style={{ padding: '10px 8px' }}>PIC Teknis</th>
                          <th style={{ padding: '10px 8px' }}>Tahap & Status Produksi</th>
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
                              INTAKE: 'Order Masuk',
                              IN_PRODUCTION: 'Dalam Proses',
                              QC_PENDING: 'Menunggu QC',
                              REOPENED_FOR_REWORK: 'Revisi / Rework',
                              COMPLETED: 'Selesai',
                              DELIVERED: 'Dikirim',
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
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gigi: {o.teeth_numbers} ({o.shade_guide})</div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{o.customer?.name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{o.customer?.clinic_name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    Masuk: {new Date(o.received_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} → Target: <strong>{new Date(o.promised_due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</strong>
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                                    👨‍🔬 {o.current_technician?.full_name || 'Belum Ditentukan'}
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
                          Dokter: <strong style={{ color: 'var(--text-main)' }}>{selectedOrder.customer?.name}</strong> ({selectedOrder.customer?.clinic_name})
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Pasien: <strong style={{ color: 'var(--text-main)' }}>{selectedOrder.patient_name}</strong> | Warna: <strong>{selectedOrder.shade_guide}</strong>
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
                                : new Date(selectedOrder.promised_due_date).toLocaleDateString('id-ID')
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
                          title="Tutup Panel"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Order Metadata Summary Box (Tanggal Masuk, Target Selesai, Status Produksi, PIC Utama) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '10px', padding: '12px', background: 'var(--bg-surface)', borderRadius: '12px', marginBottom: '18px', border: '1px solid var(--border-light)' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Tgl Masuk Order</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {new Date(selectedOrder.received_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Target Selesai</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#dc2626' }}>
                          {new Date(selectedOrder.promised_due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Status Produksi</div>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => handleChangeOrderStatus(selectedOrder.id, e.target.value)}
                          style={{ marginTop: '2px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '12px', fontWeight: 700, background: 'var(--bg-card)', color: 'var(--primary)', width: '100%' }}
                        >
                          <option value="INTAKE">📥 Order Masuk</option>
                          <option value="IN_PRODUCTION">⚙️ Dalam Proses</option>
                          <option value="QC_PENDING">🔍 Menunggu QC</option>
                          <option value="REOPENED_FOR_REWORK">🔄 Revisi / Rework</option>
                          <option value="COMPLETED">✅ Selesai Produksi</option>
                          <option value="DELIVERED">🚚 Dikirim ke Dokter</option>
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Biaya SPK</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a' }}>{formatRupiah(selectedOrder.total_price)}</div>
                      </div>
                    </div>

                    {selectedOrder.doctor_notes && (
                      <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', fontSize: '12px', color: '#92400e', marginBottom: '16px' }}>
                        <strong>Instruksi Dokter:</strong> {selectedOrder.doctor_notes}
                      </div>
                    )}

                    {/* Odontogram View */}
                    <div style={{ marginBottom: '20px' }}>
                      <Odontogram selectedTeeth={JSON.parse(selectedOrder.teeth_numbers || '[]')} onChange={() => {}} readOnly={true} />
                    </div>

                    {/* Stage Runs Stepper with Per-Stage PIC Teknis */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                          ⚙️ Tracking Tahapan Produksi & PIC Teknis:
                        </h4>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                          {selectedOrder.stage_runs?.filter((s) => s.status === 'COMPLETED').length || 0} / {selectedOrder.stage_runs?.length || 0} Tahap Selesai
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
                                  {sr.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Catatan: {sr.notes}</div>}
                                  {sr.finished_at && (
                                    <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>
                                      Selesai: {new Date(sr.finished_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
                                    <option value="">-- Pilih PIC Teknis --</option>
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
                        📸 Upload Foto Hasil Akhir & Dokumentasi QC Report
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Unggah foto hasil kerja akhir gigi tiruan, foto model gips/wax-up, atau dokumen pemeriksaan Quality Control.
                      </p>

                      <form onSubmit={handleUploadAttachment} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                        <div className="grid-2col" style={{ gap: '8px' }}>
                          <select
                            value={attType}
                            onChange={(e) => setAttType(e.target.value)}
                            style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px', fontWeight: 600, background: 'var(--bg-card)', color: 'var(--text-main)' }}
                          >
                            <option value="QC_PHOTO">📸 Foto Hasil Akhir / QC Report</option>
                            <option value="IMPRESSION_PHOTO">🦷 Foto Model Gips / Wax-up</option>
                            <option value="TEETH_PHOTO">🎨 Foto Shade / Gigi Pasien</option>
                            <option value="STL_SCAN">💻 File CAD / 3D Scan</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Keterangan foto (mis: Hasil akhir poles & oklusi)..."
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
                            {uploadingAtt ? 'Mengunggah...' : '⬆️ Upload Foto / QC'}
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
                          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>📋 Riwayat Laporan Quality Control (QC Report):</div>
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
                                <span>{qc.passed ? '✓ LOLOS QC' : `✗ REVISI (${qc.rework_target_stage})`}</span>
                                <span style={{ fontSize: '11px' }}>
                                  Oleh: {qc.inspector?.full_name || 'Inspector'} ({new Date(qc.checked_at).toLocaleDateString('id-ID')})
                                </span>
                              </div>
                              {qc.defect_notes && <div style={{ color: 'var(--text-main)', marginTop: '2px' }}>Catatan QC: {qc.defect_notes}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

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
                          🔍 {t.qcBtn}
                        </button>
                      )}

                      {selectedOrder.status === 'COMPLETED' && (
                        <>
                          <button
                            onClick={() => handleChangeOrderStatus(selectedOrder.id, 'DELIVERED')}
                            style={{ flex: 1, padding: '10px 14px', background: '#0d9488', color: '#ffffff', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}
                          >
                            🚚 Tandai Dikirim ke Dokter
                          </button>
                          <button
                            onClick={() => handleCreateInvoice(selectedOrder.id)}
                            style={{ flex: 1, padding: '10px 14px', background: '#059669', color: '#ffffff', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}
                          >
                            💳 {t.createInvoiceBtn}
                          </button>
                        </>
                      )}

                      {selectedOrder.status === 'DELIVERED' && (
                        <button
                          onClick={() => handleCreateInvoice(selectedOrder.id)}
                          style={{ flex: 1, padding: '10px 14px', background: '#059669', color: '#ffffff', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}
                        >
                          💳 {t.createInvoiceBtn}
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
                  Input order produksi gigi tiruan: nama dokter/pasien, jenis gigi tiruan, tanggal masuk, target selesai, PIC Teknis, dan acuan odontogram.
                </p>
              </div>

              <form onSubmit={handleCreateOrder} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid-2col" style={{ marginBottom: '20px', alignItems: 'start' }}>
                  {/* Master Dokter / Klinik Pengirim */}
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
                              ★ {doc.loyalty_tier || 'REGULAR'} {doc.discount_percent ? `(Diskon ${doc.discount_percent}%)` : ''}
                            </span>
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                            Preferensi: <strong>{doc.favorite_shade || '-'}</strong> | Favorit: <strong>{doc.favorite_denture_type || '-'}</strong>
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
                        <option value="">Pilih Pasien...</option>
                        {newOrderCustomer && patients.some((p) => p.customer_id === newOrderCustomer) && (
                          <optgroup label="Pasien Dokter Ini">
                            {patients
                              .filter((p) => p.customer_id === newOrderCustomer)
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.code}) — {p.gender === 'P' ? 'P' : 'L'}, {p.age} thn [{p.default_shade}]
                                </option>
                              ))}
                          </optgroup>
                        )}
                        <optgroup label="Semua Master Pasien">
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
                            🧑 {pat.code} — {pat.name} ({pat.gender === 'P' ? 'Perempuan' : 'Laki-laki'}, {pat.age} thn) | Shade: {pat.default_shade}
                          </div>
                          {pat.allergies_or_notes && (
                            <div style={{ marginTop: '3px', color: '#b91c1c', fontWeight: 700, fontSize: '11px' }}>
                              ⚠️ Catatan Medis / Alergi: {pat.allergies_or_notes}
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
                      Alur Tahapan Produksi Otomatis:
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
                  <Odontogram selectedTeeth={newOrderTeeth} onChange={setNewOrderTeeth} />
                </div>

                {/* Tanggal Masuk, Target Selesai, PIC Teknis & Estimasi Harga */}
                <div className="grid-2col" style={{ marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      Tanggal Masuk Order *
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
                      Target Selesai (Tenggat) *
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
                      PIC Teknis Penanggung Jawab
                    </label>
                    <select
                      value={newOrderTechId}
                      onChange={(e) => setNewOrderTechId(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    >
                      <option value="">-- Pilih PIC Teknis --</option>
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
                            🏷️ Harga Normal {formatRupiah(dt.base_price)} — Diskon Loyalty {doc.loyalty_tier} ({doc.discount_percent}%): Hemat {formatRupiah(Math.round((dt.base_price * (doc.discount_percent || 0)) / 100))}
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Upload Foto Cetakan Awal / Referensi Pasien (Opsional)
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
                    placeholder="Instruksi anatomi, kontak proksimal, adaptasi tepi..."
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
                    {loading ? 'Menyimpan...' : t.submitOrderBtn}
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
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>Manajemen Bahan, Produk & Inventori</h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    Master data bahan & produk, pencatatan stok masuk/keluar otomatis, batch & exp tracking, serta laporan analitik penggunaan bahan.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={openCreateItemModal}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', color: 'var(--primary)', border: '1.5px solid var(--primary)', padding: '9px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                  >
                    <Plus size={15} /> Master Bahan / Produk
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
                    + Stok Masuk (Beli)
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
                    - Pakai Bahan (Keluar)
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
                        Peringatan Minimum Stok! ({inventoryItems.filter((i) => i.current_stock <= i.min_stock_level).length} Bahan di Bawah Batas Aman)
                      </div>
                      <div style={{ fontSize: '13px', color: '#b91c1c', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {inventoryItems
                          .filter((i) => i.current_stock <= i.min_stock_level)
                          .map((low) => (
                            <span
                              key={low.id}
                              style={{ background: '#fee2e2', border: '1px solid #fecaca', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, color: '#991b1b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              {low.name}: sisa {low.current_stock} {low.unit?.code} (Min: {low.min_stock_level} {low.unit?.code})
                              <button
                                onClick={() => {
                                  setPrItem(low.id)
                                  setPrEstPrice(low.purchase_price)
                                  setPrSupplierId(low.supplier_id || '')
                                  setPrQty(Math.max(low.min_stock_level * 2 - low.current_stock, 5))
                                  setPrNotes(`Restock bahan di bawah batas aman (${low.name})`)
                                  setShowAddPRModal(true)
                                }}
                                style={{ background: '#dc2626', color: '#ffffff', padding: '1px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}
                              >
                                Beli
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
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Total Jenis Bahan & Produk</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>{inventoryItems.length} Item</div>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>Stok Real-Time Terpantau</span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Total Nilai Stok Gudang</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#16a34a' }}>
                    {formatRupiah(inventoryReport?.total_stock_value || inventoryItems.reduce((acc, i) => acc + i.current_stock * i.purchase_price, 0))}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Valuasi aset bahan & produk saat ini</span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Notifikasi Minimum Stok</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: inventoryItems.filter((i) => i.current_stock <= i.min_stock_level).length > 0 ? '#dc2626' : '#10b981' }}>
                    {inventoryItems.filter((i) => i.current_stock <= i.min_stock_level).length} Bahan
                  </div>
                  <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>Di bawah batas aman stok</span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>Monitoring Batch & Exp</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: (inventoryReport?.expiring_soon_count || 0) + (inventoryReport?.expired_count || 0) > 0 ? '#d97706' : 'var(--text-main)' }}>
                    {(inventoryReport?.expiring_soon_count || 0) + (inventoryReport?.expired_count || 0)} Batch
                  </div>
                  <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 600 }}>Mendekati Exp (&lt; 60 hari) / Expired</span>
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
                  title="Geser Kiri"
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
                    { id: 'master', label: `📦 Master Bahan & Produk (${inventoryItems.length})` },
                    { id: 'movements', label: `🔄 Stok Masuk & Keluar (${stockMovements.length})` },
                    { id: 'batches', label: `🧪 Batch & Exp Tracking (${inventoryBatches.length})` },
                    { id: 'report', label: `📊 Laporan Inventori & Pemakaian` },
                    { id: 'suppliers', label: `🏢 Data Supplier (${suppliersList.length})` },
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
                  title="Geser Kanan"
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
                        placeholder="Cari nama bahan (akrilik, gips, logam, gigi tiruan), kode, atau nomor batch..."
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
                      <option value="">Semua Kategori</option>
                      <option value="RAW_MATERIAL">RAW_MATERIAL (Bahan Baku)</option>
                      <option value="PRODUCT">PRODUCT (Produk / Elemen Gigi)</option>
                      <option value="CONSUMABLE">CONSUMABLE (Bahan Habis Pakai)</option>
                      <option value="TOOL">TOOL (Alat & Mata Bur)</option>
                    </select>
                  </div>

                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '10px' }}>Kode</th>
                            <th style={{ padding: '10px' }}>Nama Bahan / Produk</th>
                            <th style={{ padding: '10px' }}>Kategori</th>
                            <th style={{ padding: '10px' }}>Supplier</th>
                            <th style={{ padding: '10px' }}>Stok & Batas Min</th>
                            <th style={{ padding: '10px' }}>Harga / Nilai Stok</th>
                            <th style={{ padding: '10px' }}>Batch & Tgl Exp</th>
                            <th style={{ padding: '10px' }}>Status</th>
                            <th style={{ padding: '10px' }}>Aksi</th>
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
                                        Exp: {expDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        {isExpired ? ' (EXPIRED)' : isExpSoon ? ` (${daysToExp} hr lagi)` : ''}
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Non-Exp</div>
                                    )}
                                  </td>
                                  <td style={{ padding: '12px 10px' }}>
                                    {isLow ? (
                                      <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                                        ⚠️ Stok Menipis
                                      </span>
                                    ) : (
                                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                                        ✓ Aman
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
                                        title="Catat Stok Masuk"
                                        style={{ padding: '4px 8px', borderRadius: '6px', background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 700 }}
                                      >
                                        + Masuk
                                      </button>
                                      <button
                                        onClick={() => {
                                          setOutItemId(item.id)
                                          setOutBatchId('')
                                          setOutQty(1)
                                          setOutOrderId('')
                                          setOutNotes(`Pemakaian ${item.name}`)
                                          setShowStockOutModal(true)
                                        }}
                                        title="Catat Pemakaian Bahan"
                                        style={{ padding: '4px 8px', borderRadius: '6px', background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 700 }}
                                      >
                                        - Pakai
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
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Riwayat Mutasi Stok Masuk & Keluar</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pencatatan otomatis setiap kali ada penerimaan pembelian atau pemakaian bahan produksi.</p>
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
                          {tFilter === '' ? 'Semua Mutasi' : tFilter === 'IN' ? '⬇ Stok Masuk (Beli)' : '⬆ Stok Keluar (Pakai)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '10px' }}>Waktu</th>
                            <th style={{ padding: '10px' }}>Tipe Mutasi</th>
                            <th style={{ padding: '10px' }}>Bahan / Produk</th>
                            <th style={{ padding: '10px' }}>Jumlah (Qty)</th>
                            <th style={{ padding: '10px' }}>Batch / Lot</th>
                            <th style={{ padding: '10px' }}>Nilai Satuan</th>
                            <th style={{ padding: '10px' }}>Referensi & Keterangan</th>
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
                                    {new Date(mv.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
                                      {isIn ? '⬇ STOK MASUK' : '⬆ STOK KELUAR'}
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
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Batch & Expiration Date Tracking (Bahan Medis & Gigi Tiruan Resin)</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Pemantauan nomor Lot/Batch dan masa berlaku bahan medis seperti akrilik, resin gigi tiruan, porselen, dan valplast (FEFO: First Expired, First Out).
                    </p>
                  </div>

                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '10px' }}>No. Batch / Lot</th>
                            <th style={{ padding: '10px' }}>Nama Bahan / Produk</th>
                            <th style={{ padding: '10px' }}>Supplier</th>
                            <th style={{ padding: '10px' }}>Tanggal Masuk</th>
                            <th style={{ padding: '10px' }}>Tanggal Kadaluarsa (Exp)</th>
                            <th style={{ padding: '10px' }}>Sisa Stok Batch</th>
                            <th style={{ padding: '10px' }}>Harga Batch</th>
                            <th style={{ padding: '10px' }}>Status Exp</th>
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
                                  {new Date(b.received_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td style={{ padding: '12px 10px', fontWeight: 700, color: isExpired ? '#dc2626' : isSoon ? '#d97706' : 'var(--text-main)' }}>
                                  {exp ? exp.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Tidak Kadaluarsa'}
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
                                      ❌ EXPIRED ({Math.abs(daysLeft!)} hr lalu)
                                    </span>
                                  ) : isSoon ? (
                                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                                      ⏳ Segera Exp ({daysLeft} hari)
                                    </span>
                                  ) : (
                                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                                      ✓ Aman ({daysLeft} hari)
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
                        🔥 Bahan Paling Sering Digunakan (Top Used Materials)
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Berdasarkan frekuensi pemakaian dan total kuantitas pengeluaran produksi.
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
                                  Terpakai: {top.total_used} {top.unit_code} ({top.usage_count}x transaksi)
                                </span>
                              </div>
                              <div style={{ width: '100%', height: '7px', background: 'var(--border-light)', borderRadius: '999px', overflow: 'hidden', marginBottom: '4px' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #0d9488)', borderRadius: '999px' }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                <span>Kode: {top.item_code} ({top.category})</span>
                                <span>Nilai Pemakaian: <strong>{formatRupiah(top.total_value)}</strong></span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Real-Time Stock Valuation Breakdown */}
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                        💰 Laporan Valuasi & Stok Real-Time
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Rincian nilai persediaan setiap bahan terhadap total nilai aset gudang ({formatRupiah(inventoryItems.reduce((a, b) => a + b.current_stock * b.purchase_price, 0))}).
                      </p>

                      <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '8px' }}>Bahan / Produk</th>
                              <th style={{ padding: '8px' }}>Stok Real-Time</th>
                              <th style={{ padding: '8px' }}>Harga Satuan</th>
                              <th style={{ padding: '8px' }}>Total Nilai Stok</th>
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
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Daftar Supplier Bahan & Alat Gigi</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pemasok resmi bahan akrilik, gips, logam, zirconia, dan instrumen dental lab.</p>
                    </div>
                    <button
                      onClick={() => setShowSupplierModal(true)}
                      style={{ background: 'var(--primary)', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                    >
                      + Tambah Supplier
                    </button>
                  </div>

                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '10px' }}>Kode</th>
                            <th style={{ padding: '10px' }}>Nama Perusahaan Supplier</th>
                            <th style={{ padding: '10px' }}>Kontak Person</th>
                            <th style={{ padding: '10px' }}>No. Telepon / WA</th>
                            <th style={{ padding: '10px' }}>Email</th>
                            <th style={{ padding: '10px' }}>Alamat</th>
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
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-subtle)' }}>Belum ada pengajuan pembelian bahan saat ini.</div>
                ) : (
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px' }}>No. PR</th>
                          <th style={{ padding: '12px' }}>{t.colDate}</th>
                          <th style={{ padding: '12px' }}>Total Estimasi</th>
                          <th style={{ padding: '12px' }}>{t.colStatus}</th>
                          <th style={{ padding: '12px' }}>Aksi Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseRequests.map((pr) => (
                          <tr key={pr.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{pr.pr_number}</td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(pr.created_at).toLocaleDateString('id-ID')}</td>
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

          {/* TAB: KEUANGAN & INVOICE */}
          {activeTab === 'finance' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>{t.financeTitle}</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{t.financeSubtitle}</p>
              </div>

              {/* Invoices List */}
              <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>{t.invoicesListTitle}</h3>
                <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px' }}>No. Invoice</th>
                        <th style={{ padding: '12px' }}>{t.colDoctor}</th>
                        <th style={{ padding: '12px' }}>{t.colTotal}</th>
                        <th style={{ padding: '12px' }}>{t.colPaid}</th>
                        <th style={{ padding: '12px' }}>{t.colBalance}</th>
                        <th style={{ padding: '12px' }}>{t.colStatus}</th>
                        <th style={{ padding: '12px' }}>{t.colActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{inv.invoice_number}</td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{inv.customer?.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{inv.customer?.clinic_name}</div>
                          </td>
                          <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{formatRupiah(inv.total_amount)}</td>
                          <td style={{ padding: '12px', color: '#16a34a' }}>{formatRupiah(inv.paid_amount)}</td>
                          <td style={{ padding: '12px', color: inv.balance_due > 0 ? '#dc2626' : 'var(--text-muted)', fontWeight: 700 }}>
                            {formatRupiah(inv.balance_due)}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: inv.status === 'PAID' ? '#ecfdf5' : '#fee2e2',
                                color: inv.status === 'PAID' ? '#059669' : '#dc2626',
                              }}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {inv.balance_due > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv)
                                  setPaymentAmount(inv.balance_due)
                                }}
                                style={{ background: 'var(--primary)', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}
                              >
                                {t.recordPaymentBtn}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Operational Expenses List */}
              <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>{t.expensesTitle}</h3>
                {expenses.length === 0 ? (
                  <div style={{ color: 'var(--text-subtle)', fontSize: '13px' }}>Belum ada pengeluaran dicatat bulan ini.</div>
                ) : (
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px' }}>No. Biaya</th>
                          <th style={{ padding: '12px' }}>Kategori</th>
                          <th style={{ padding: '12px' }}>Keterangan</th>
                          <th style={{ padding: '12px' }}>Jumlah Biaya</th>
                          <th style={{ padding: '12px' }}>{t.colDate}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((e) => (
                          <tr key={e.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)' }}>{e.expense_number}</td>
                            <td style={{ padding: '12px', color: 'var(--text-main)' }}>{e.category?.name}</td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{e.description}</td>
                            <td style={{ padding: '12px', fontWeight: 700, color: '#dc2626' }}>{formatRupiah(e.amount)}</td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(e.expense_date).toLocaleDateString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: MASTER DOKTER & PASIEN (CRM) */}
          {activeTab === 'customers' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
                    Master Dokter & Pasien (CRM Pelanggan)
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    Database dokter/klinik (kontak, preferensi, catatan khusus), master data pasien, history order & feedback, reminder follow-up order, serta sistem loyalty/diskon otomatis.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => openCreatePatientModal()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', color: 'var(--primary)', border: '1.5px solid var(--primary)', padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                  >
                    <Plus size={15} /> Tambah Master Pasien
                  </button>
                  <button
                    onClick={openCreateCustomerModal}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#ffffff', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                  >
                    <Plus size={15} /> Tambah Master Dokter / Klinik
                  </button>
                </div>
              </div>

              {/* CRM KPI Summary Cards */}
              <div className="grid-4col" style={{ marginBottom: '20px' }}>
                <div
                  onClick={() => setCrmSubTab('doctors')}
                  style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '16px 18px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Master Dokter & Klinik</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{customers.length} Mitra</div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>Kontak, Preferensi & Catatan Khusus</div>
                </div>

                <div
                  onClick={() => setCrmSubTab('patients')}
                  style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '16px 18px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Master Data Pasien</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>{patients.length} Pasien</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px' }}>Terintegrasi langsung ke Input SPK</div>
                </div>

                <div
                  onClick={() => setCrmSubTab('reminders')}
                  style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '16px 18px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Reminder Follow-Up Order</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                    {customers.filter((c) => (c.days_since_last_order ?? 999) >= 7).length} Dokter
                  </div>
                  <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 600, marginTop: '4px' }}>Perlu follow-up order berkala</div>
                </div>

                <div
                  onClick={() => setCrmSubTab('doctors')}
                  style={{ background: 'var(--bg-card)', borderRadius: '14px', padding: '16px 18px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Loyalty System & Diskon</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    {customers.filter((c) => (c.discount_percent || 0) > 0).length} Member
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>Otomatis potong harga SPK tetap</div>
                </div>
              </div>

              {/* Sub-Navigation Tabs for CRM */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px', borderBottom: '1.5px solid var(--border-light)', paddingBottom: '10px' }}>
                {[
                  { key: 'doctors', label: `🏥 Master Dokter & Klinik (${customers.length})` },
                  { key: 'patients', label: `🧑 Master Data Pasien (${patients.length})` },
                  { key: 'history', label: `📋 History Order & Feedback (${orders.length})` },
                  { key: 'reminders', label: `⏰ Reminder Order & Follow-Up` },
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
                        placeholder="Cari nama dokter, klinik, kode, atau nomor WA..."
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
                          <th style={{ padding: '12px 8px' }}>Kode & Dokter</th>
                          <th style={{ padding: '12px 8px' }}>Klinik & Kontak</th>
                          <th style={{ padding: '12px 8px' }}>Preferensi & Catatan Khusus</th>
                          <th style={{ padding: '12px 8px' }}>Loyalty & Diskon</th>
                          <th style={{ padding: '12px 8px' }}>Statistik Order</th>
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
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🧑 {c.patients_count || 0} Pasien Terdaftar</div>
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
                                    {c.notes ? `"${c.notes}"` : 'Belum ada catatan khusus'}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800, background: tierStyle.bg, color: tierStyle.fg }}>
                                    ★ {c.loyalty_tier || 'REGULAR'}
                                  </span>
                                  <div style={{ fontSize: '12px', fontWeight: 800, color: (c.discount_percent || 0) > 0 ? '#059669' : 'var(--text-subtle)', marginTop: '4px' }}>
                                    Diskon Tetap: {c.discount_percent || 0}%
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.total_orders || 0} SPK</div>
                                  <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>{formatRupiah(c.total_spent || 0)}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                                    {c.last_order_date
                                      ? `Terakhir: ${new Date(c.last_order_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`
                                      : 'Belum ada SPK'}
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
                                      onClick={() => openWhatsApp(c.phone, `Halo Dokter ${c.name}, salam hangat dari Dental Lab. Semoga praktik klinik hari ini lancar!`)}
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
                        placeholder="Cari nama pasien, kode pasien, atau catatan alergi/medis..."
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
                      <option value="">Semua Dokter / Klinik Pengirim</option>
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
                          <th style={{ padding: '12px 8px' }}>Kode & Nama Pasien</th>
                          <th style={{ padding: '12px 8px' }}>Gender & Usia</th>
                          <th style={{ padding: '12px 8px' }}>Dokter / Klinik Pengirim</th>
                          <th style={{ padding: '12px 8px' }}>Acuan Warna & Gigi</th>
                          <th style={{ padding: '12px 8px' }}>Catatan Klinis / Alergi Bahan</th>
                          <th style={{ padding: '12px 8px' }}>Riwayat SPK</th>
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
                                  {p.gender === 'P' ? '👩 Perempuan' : '👨 Laki-laki'}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.age ? `${p.age} Tahun` : '-'}</div>
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
                                    Gigi: {p.last_teeth_numbers}
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
                                    {new Date(p.last_order_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
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
                                    + Buat SPK
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
                                    Hapus
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
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Riwayat Order & Feedback Kepuasan Dokter</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mempermudah melihat seluruh SPK sebelumnya per dokter serta mencatat testimoni/evaluasi hasil kerja lab.</p>
                    </div>
                    <select
                      value={crmHistoryDoctorFilter}
                      onChange={(e) => setCrmHistoryDoctorFilter(e.target.value)}
                      style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600 }}
                    >
                      <option value="">Semua Dokter / Klinik ({orders.length} SPK)</option>
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
                          <th style={{ padding: '12px 8px' }}>No. SPK & Tgl</th>
                          <th style={{ padding: '12px 8px' }}>Dokter & Klinik</th>
                          <th style={{ padding: '12px 8px' }}>Pasien & Jenis Gigi Tiruan</th>
                          <th style={{ padding: '12px 8px' }}>Status & Nilai Order</th>
                          <th style={{ padding: '12px 8px' }}>Feedback / Evaluasi Dokter</th>
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
                                  {new Date(o.received_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{o.customer?.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{o.customer?.clinic_name}</div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{o.patient_name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>{o.denture_type?.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gigi: {o.teeth_numbers} ({o.shade_guide})</div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{formatRupiah(o.total_price)}</div>
                                {(o.discount_percent || 0) > 0 && (
                                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                                    Diskon Loyalty {o.discount_percent}%
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
                                      "{o.feedback_notes || 'Puas dengan hasil kerja lab'}"
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Belum ada feedback dicatat</span>
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
                                    ★ Input Feedback
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedOrder(o)
                                      setActiveTab('orders')
                                    }}
                                    style={{ background: 'var(--bg-surface)', color: 'var(--primary)', border: '1px solid var(--border-light)', padding: '6px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '11px' }}
                                  >
                                    Detail SPK
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
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Reminder Follow-Up Dokter & Klinik</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Daftar pemantauan otomatis untuk melakukan follow-up kepada dokter yang belum mengirim order SPK baru atau mengingatkan program diskon pelanggan tetap.
                    </p>
                  </div>

                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 8px' }}>Status Reminder</th>
                          <th style={{ padding: '12px 8px' }}>Dokter & Klinik</th>
                          <th style={{ padding: '12px 8px' }}>Order Terakhir</th>
                          <th style={{ padding: '12px 8px' }}>Preferensi Favorit & Loyalty</th>
                          <th style={{ padding: '12px 8px' }}>Aksi Follow-Up Cepat</th>
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
                                      🔔 Perlu Follow-Up Segera ({days === 999 ? 'Belum Order' : `${days} hari lalu`})
                                    </span>
                                  ) : needsFollowUp ? (
                                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800 }}>
                                      ⏰ Jadwal Follow-Up ({days} hari lalu)
                                    </span>
                                  ) : (
                                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800 }}>
                                      ✅ Aktif Order ({days === 0 ? 'Hari ini' : `${days} hari lalu`})
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
                                      ? new Date(c.last_order_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                      : 'Belum Pernah Order'}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total: {c.total_orders || 0} SPK</div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                                    {c.favorite_denture_type || 'Zirconia / PFM'} ({c.favorite_shade || 'VITA A2'})
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                                    Member {c.loyalty_tier || 'REGULAR'} (Diskon {c.discount_percent || 0}%)
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const promoText =
                                          (c.discount_percent || 0) > 0
                                            ? `Sebagai mitra ${c.loyalty_tier}, Dokter berhak menikmati diskon otomatis ${c.discount_percent}% untuk setiap pembuatan gigi tiruan (${c.favorite_denture_type || 'Zirconia/PFM/Valplast'}).`
                                            : `Kami siap membantu penjemputan cetakan gigi pasien untuk pembuatan ${c.favorite_denture_type || 'gigi tiruan'} di klinik Dokter.`
                                        openWhatsApp(
                                          c.phone,
                                          `Halo ${c.name} (${c.clinic_name}), salam sehat dari Dental Lab! 🙏\n\nKami ingin melakukan follow-up apakah ada cetakan/kasus gigi tiruan pasien yang perlu kami jemput minggu ini? ${promoText}\n\nTerima kasih Dok!`
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
                                      + Input SPK Dokter Ini
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
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>Manajemen SDM & Tugas Tekniker</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Profile tekniker & staf (keahlian, jadwal kerja, performa, role), penugasan tekniker, KPI produksi, serta pencatatan absensi & lembur.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickCheckInToday(currentUser.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#059669', border: '1.5px solid #6ee7b7', padding: '10px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '13px' }}
                  >
                    ✅ Check-In Hadir Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => openCreateAttendanceModal(currentUser.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', color: 'var(--primary)', border: '1.5px solid var(--primary)', padding: '10px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '13px' }}
                  >
                    ⏰ + Catat Absensi / Lembur
                  </button>
                  {(isSuperAdmin || currentUser.role?.name === 'OWNER' || currentUser.role?.name === 'ADMIN') && (
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#ffffff', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)' }}
                    >
                      <UserPlus size={16} /> + Tambah Staf / Tekniker
                    </button>
                  )}
                </div>
              </div>

              {/* 4 KPI Summary Cards */}
              <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Tekniker & Staf Aktif</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                    {usersList.filter((u) => u.is_active).length} Orang
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>
                    {usersList.filter((u) => u.role?.name === 'TECHNICIAN').length} Tekniker Gigi • {usersList.filter((u) => u.role?.name !== 'TECHNICIAN').length} Manajemen/Staf
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Penugasan SPK Sedang Dikerjakan</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                    {orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length} SPK
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px', fontWeight: 600 }}>
                    Terdistribusi ke PIC tekniker tiap tahapan
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Rata-Rata KPI Mutu & Ketepatan</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                    {usersList.length > 0
                      ? `${Math.round(usersList.reduce((acc, u) => acc + (u.qc_pass_rate || 95), 0) / usersList.length)}% QC`
                      : '98% QC'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                    Ketepatan Waktu (On-Time):{' '}
                    {usersList.length > 0
                      ? `${Math.round(usersList.reduce((acc, u) => acc + (u.on_time_rate || 95), 0) / usersList.length)}%`
                      : '96%'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Jam Lembur & Presensi</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                    {attendances.reduce((acc, a) => acc + (a.overtime_hours || 0), 0).toFixed(1)} Jam
                  </div>
                  <div style={{ fontSize: '11px', color: '#d97706', marginTop: '4px', fontWeight: 600 }}>
                    {attendances.length} Rekap Kehadiran Tercatat
                  </div>
                </div>
              </div>

              {/* Sub-Navigation Tabs for HR Module */}
              <div className="sub-tabs-scroll" style={{ marginBottom: '18px' }}>
                {[
                  { id: 'profiles', label: `👨‍🔬 Profile Tekniker & Staf (${usersList.length})` },
                  { id: 'assignments', label: `📋 Penugasan Tekniker (${orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length} SPK)` },
                  { id: 'kpi', label: `📊 KPI Produksi & Performa` },
                  { id: 'attendance', label: `⏰ Absensi & Lembur (${attendances.length})` },
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
                        placeholder="Cari nama staf/tekniker, NIK, spesialisasi, atau keahlian..."
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
                      <option value="">Semua Role ({usersList.length})</option>
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
                                        Akun Saya
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
                                      {u.specialization || 'Staf Operasional Lab'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Work Schedule & Contact */}
                              <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '12px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>🕒 Jadwal Kerja:</span>
                                  <strong style={{ color: 'var(--text-main)' }}>{u.work_schedule || 'Senin - Sabtu (08:00 - 17:00)'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>📱 Kontak WA:</span>
                                  <strong style={{ color: 'var(--text-main)' }}>{u.phone || '-'}</strong>
                                </div>
                              </div>

                              {/* Keahlian / Skills Chips */}
                              <div style={{ marginBottom: '10px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px' }}>KEAHLIAN & KOMPETENSI:</div>
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
                                    <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Prostodonsia & Operasional Lab</span>
                                  )}
                                </div>
                              </div>

                              {/* Performance Mini Summary */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', background: 'var(--bg-card)', padding: '8px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                                <div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Order Selesai</div>
                                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                                    {(u.completed_orders_count || 0) + (u.completed_stages_count || 0)}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>On-Time</div>
                                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>{u.on_time_rate ?? 100}%</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Kualitas QC</div>
                                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7' }}>{u.qc_pass_rate ?? 100}%</div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-light)', gap: '6px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Aktif: <strong>{u.active_orders_count || 0} SPK</strong> • Lembur: <strong>{u.total_overtime_hours || 0}j</strong>
                              </span>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {isMe && (
                                  <button
                                    type="button"
                                    onClick={() => setActiveTab('profile')}
                                    style={{ background: 'var(--primary)', color: '#ffffff', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}
                                  >
                                    Profil Saya
                                  </button>
                                )}
                                {(isSuperAdmin || currentUser.role?.name === 'OWNER' || currentUser.role?.name === 'ADMIN') && (
                                  <button
                                    type="button"
                                    onClick={() => openEditStaffModal(u)}
                                    style={{ background: 'var(--bg-card)', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}
                                  >
                                    Edit Profil & Keahlian
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
                                Beban Kerja: {assignedActive} SPK Aktif
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>

                  {/* Table to Assign / Reassign Technicians on Active SPKs & Stages */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Papan Penugasan Tekniker (Assign Tugas SPK & Tahapan Produksi)</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Pilih atau ubah PIC Tekniker untuk setiap tahap pengerjaan SPK (Model Gips → Design → Wax-up → Casting → Finishing → QC).
                      </p>
                    </div>

                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '12px 8px' }}>No. SPK & Prioritas</th>
                            <th style={{ padding: '12px 8px' }}>Pasien & Dokter</th>
                            <th style={{ padding: '12px 8px' }}>Jenis Gigi Tiruan</th>
                            <th style={{ padding: '12px 8px' }}>Tahap Aktif Saat Ini</th>
                            <th style={{ padding: '12px 8px' }}>Assign PIC Tekniker (Tahap Aktif)</th>
                            <th style={{ padding: '12px 8px' }}>Target Selesai</th>
                            <th style={{ padding: '12px 8px' }}>Aksi</th>
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
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gigi: {o.teeth_numbers} ({o.shade_guide})</div>
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
                                            alert(err.message || 'Gagal assign tekniker')
                                          } finally {
                                            setLoading(false)
                                          }
                                        }}
                                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid var(--primary-light)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '12px', fontWeight: 700 }}
                                      >
                                        <option value="">-- Pilih PIC Tekniker --</option>
                                        {usersList.map((u) => (
                                          <option key={u.id} value={u.id}>
                                            👨‍🔬 {u.full_name} ({u.role?.name})
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {o.current_technician?.full_name || 'Belum ditugaskan'}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--text-main)' }}>
                                    {new Date(o.promised_due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
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
                                      Detail & Tahapan →
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
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Laporan KPI Produksi & Evaluasi Kualitas Kerja Tekniker</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Metrik terukur berdasarkan jumlah order selesai, tahapan produksi yang diselesaikan, persentase ketepatan waktu (On-Time Delivery), tingkat kelulusan QC (Quality Pass Rate), dan rating kepuasan dokter.
                    </p>
                  </div>

                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 8px' }}>Tekniker / Staf</th>
                          <th style={{ padding: '12px 8px' }}>Role & Spesialisasi</th>
                          <th style={{ padding: '12px 8px' }}>Order & Tahap Selesai</th>
                          <th style={{ padding: '12px 8px' }}>Ketepatan Waktu (On-Time)</th>
                          <th style={{ padding: '12px 8px' }}>Kualitas Hasil (Lolos QC)</th>
                          <th style={{ padding: '12px 8px' }}>Rating Dokter</th>
                          <th style={{ padding: '12px 8px' }}>Grade Performa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((u) => {
                          const onTime = u.on_time_rate ?? 100
                          const qcRate = u.qc_pass_rate ?? 100
                          const avgScore = (onTime + qcRate) / 2
                          const grade = avgScore >= 95 ? 'A+ (Sangat Baik)' : avgScore >= 85 ? 'A (Baik)' : 'B (Cukup)'
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
                                  {u.completed_orders_count || 0} SPK Selesai
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                                  ✓ {u.completed_stages_count || 0} Tahap Kerja • {u.active_orders_count || 0} Aktif
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px', minWidth: '150px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, color: '#059669', marginBottom: '4px' }}>
                                  <span>{onTime}% Tepat Waktu</span>
                                </div>
                                <div style={{ width: '100%', height: '7px', background: 'var(--bg-surface)', borderRadius: '99px', overflow: 'hidden' }}>
                                  <div style={{ width: `${Math.min(100, onTime)}%`, height: '100%', background: '#10b981', borderRadius: '99px' }} />
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px', minWidth: '150px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, color: '#0284c7', marginBottom: '4px' }}>
                                  <span>{qcRate}% Lolos QC</span>
                                </div>
                                <div style={{ width: '100%', height: '7px', background: 'var(--bg-surface)', borderRadius: '99px', overflow: 'hidden' }}>
                                  <div style={{ width: `${Math.min(100, qcRate)}%`, height: '100%', background: '#0284c7', borderRadius: '99px' }} />
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '13px' }}>
                                  ★ {(u.avg_feedback_rating || 5.0).toFixed(1)} / 5.0
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Kepuasan Dokter</div>
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
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Rekap Absensi Harian & Jam Lembur Tekniker/Staf</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Pencatatan kehadiran harian (Hadir, Terlambat, Izin, Sakit, Cuti), jam masuk/pulang, serta durasi & keterangan lembur pengerjaan SPK.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <select
                        value={hrAttUserFilter}
                        onChange={(e) => setHrAttUserFilter(e.target.value)}
                        style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600 }}
                      >
                        <option value="">Semua Staf & Tekniker ({attendances.length})</option>
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
                        + Input Absensi / Lembur
                      </button>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 8px' }}>Tanggal</th>
                          <th style={{ padding: '12px 8px' }}>Nama Staf / Tekniker</th>
                          <th style={{ padding: '12px 8px' }}>Shift & Jadwal</th>
                          <th style={{ padding: '12px 8px' }}>Jam Masuk - Pulang</th>
                          <th style={{ padding: '12px 8px' }}>Status Kehadiran</th>
                          <th style={{ padding: '12px 8px' }}>Jam Lembur</th>
                          <th style={{ padding: '12px 8px' }}>Catatan Lembur / Pekerjaan</th>
                          <th style={{ padding: '12px 8px' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendances
                          .filter((a) => !hrAttUserFilter || a.user_id === hrAttUserFilter)
                          .map((a) => (
                            <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--text-main)' }}>
                                {new Date(a.attendance_date).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{a.user?.full_name || 'Staf Lab'}</div>
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
                                    +{a.overtime_hours} Jam Lembur
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-subtle)', fontSize: '12px' }}>0 Jam</span>
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
                                    Hapus
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
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>Profil Saya & Identitas Akun Login</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Detail data lengkap pengguna yang sedang login, foto profil (avatar), informasi keahlian & jadwal kerja, hak akses role, serta performa pribadi.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickCheckInToday(currentUser.id)}
                    style={{ background: '#ecfdf5', color: '#059669', border: '1.5px solid #6ee7b7', padding: '10px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '13px' }}
                  >
                    ✅ Check-In Kehadiran Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => openCreateAttendanceModal(currentUser.id)}
                    style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '10px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '13px' }}
                  >
                    ⏰ + Catat Lembur Saya
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
                    <span>{uploadingAvatar ? 'Mengunggah...' : 'Ganti Foto Profil'}</span>
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
                    {currentUser.specialization || 'Staf Profesional DentalLab Pro'}
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
                    {currentUser.bio || 'Anggota tim laboratorium gigi presisi DentalLab Pro.'}
                  </p>

                  <div className="grid-3col" style={{ gap: '10px', background: 'var(--bg-surface)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>👤 Username & Email</span>
                      <strong style={{ color: 'var(--text-main)' }}>@{currentUser.username} • {currentUser.email || '-'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>🕒 Jadwal Kerja</span>
                      <strong style={{ color: 'var(--text-main)' }}>{currentUser.work_schedule || 'Senin - Sabtu (08:00 - 17:00)'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>📱 No. WhatsApp & Tgl Gabung</span>
                      <strong style={{ color: 'var(--text-main)' }}>{currentUser.phone || '-'} (Sejak {currentUser.join_date || '2023'})</strong>
                    </div>
                  </div>

                  {/* Role Menu Permissions Badges */}
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Akses Menu Role ({currentUser.role?.name}):</span>
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
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Tugas SPK & Tahap Selesai</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                    {(currentUser.completed_orders_count || 0) + (currentUser.completed_stages_count || 0)} Selesai
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                    Sedang dikerjakan: {currentUser.active_orders_count || 0} SPK Aktif
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Ketepatan Waktu Pribadi</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                    {currentUser.on_time_rate ?? 100}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                    On-Time Delivery Rate
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Kualitas Hasil Kerja (QC)</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                    {currentUser.qc_pass_rate ?? 100}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, marginTop: '4px' }}>
                    ★ Rating Dokter: {(currentUser.avg_feedback_rating || 5.0).toFixed(1)} / 5.0
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Presensi & Jam Lembur Saya</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                    {currentUser.attendance_present_days || 0} Hari Hadir
                  </div>
                  <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 700, marginTop: '4px' }}>
                    Total Lembur: {currentUser.total_overtime_hours || 0} Jam
                  </div>
                </div>
              </div>

              {/* 2-Column Layout: Form Edit Profil Saya & Daftar Tugas/Absensi Saya */}
              <div className="grid-2col" style={{ gap: '20px', alignItems: 'start' }}>
                {/* Left Column: Edit My Profile Form */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>✏️ Edit Data Lengkap Profil Saya</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Perbarui informasi pribadi, keahlian teknis, jadwal kerja, alamat, dan kata sandi akun Anda.
                  </p>
                  <form onSubmit={handleSaveMyProfile}>
                    <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Nama Lengkap *</label>
                        <input
                          type="text"
                          value={myFullName}
                          onChange={(e) => setMyFullName(e.target.value)}
                          required
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Jabatan / Spesialisasi</label>
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
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>No. WhatsApp / Telepon</label>
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
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Jadwal Kerja / Shift</label>
                        <input
                          type="text"
                          value={mySchedule}
                          onChange={(e) => setMySchedule(e.target.value)}
                          placeholder="Senin - Sabtu (08:00 - 17:00)"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Tanggal Bergabung</label>
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
                        Keahlian Teknis / Kompetensi (Pisahkan dengan koma)
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
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Alamat Domisili</label>
                      <input
                        type="text"
                        value={myAddress}
                        onChange={(e) => setMyAddress(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Bio Singkat / Catatan Profil</label>
                      <textarea
                        rows={2}
                        value={myBio}
                        onChange={(e) => setMyBio(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        Ganti Password Baru (Kosongkan jika tidak ingin mengubah)
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
                      Simpan Perubahan Profil Saya
                    </button>
                  </form>
                </div>

                {/* Right Column: My Assigned Tasks & My Recent Attendance */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* My Assigned SPK Orders */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
                      📋 Penugasan SPK Saya ({orders.filter((o) => o.current_technician_id === currentUser.id || (o.stage_runs || []).some((sr) => sr.technician_id === currentUser.id)).length})
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
                                {o.denture_type?.name} • Tahap: <strong>{o.current_stage_name || o.status}</strong>
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
                              Buka SPK
                            </button>
                          </div>
                        ))}
                      {orders.filter((o) => o.current_technician_id === currentUser.id || (o.stage_runs || []).some((sr) => sr.technician_id === currentUser.id)).length === 0 && (
                        <div style={{ fontSize: '12px', color: 'var(--text-subtle)', padding: '12px 0' }}>
                          Belum ada SPK spesifik yang ditugaskan langsung ke akun ini.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* My Attendance & Overtime History */}
                  <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
                      ⏰ Riwayat Absensi & Lembur Saya
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
                                {new Date(a.attendance_date).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} ({a.check_in} - {a.check_out})
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.overtime_notes || a.shift_schedule}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 800 }}>
                                {a.status}
                              </span>
                              {a.overtime_hours > 0 && (
                                <div style={{ fontSize: '11px', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
                                  +{a.overtime_hours} Jam Lembur
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
              {editingCustomer ? `Edit Master Dokter: ${editingCustomer.name}` : 'Tambah Master Dokter / Klinik Baru'}
            </h3>
            <form onSubmit={handleSaveCustomer}>
              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Nama Dokter *</label>
                  <input
                    type="text"
                    placeholder="drg. Nama Dokter, Sp.Pros"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Nama Klinik / RS *</label>
                  <input
                    type="text"
                    placeholder="Klinik Gigi / RS..."
                    value={newCustClinic}
                    onChange={(e) => setNewCustClinic(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>No. WhatsApp *</label>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Alamat Klinik / Pengiriman</label>
                <input
                  type="text"
                  placeholder="Jl. ..."
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              {/* Preferensi Dokter (Warna Gigi & Tipe Gigi Favorit) */}
              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Preferensi Warna Gigi Favorit</label>
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Tipe Gigi Tiruan Favorit</label>
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Loyalty Tier Pelanggan</label>
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
                    <option value="REGULAR">REGULAR (Diskon 0%)</option>
                    <option value="SILVER">SILVER (Diskon Tetap 5%)</option>
                    <option value="GOLD">GOLD (Diskon Tetap 10%)</option>
                    <option value="VIP">VIP Partner (Diskon Tetap 15%)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Diskon Otomatis SPK (%)</label>
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
                  Catatan Khusus Dokter (Preferensi Oklusi / Kontak / Anatomi)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Suka oklusi ringan, kontak proksimal rapat, margin servikal halus..."
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
              {editingPatient ? `Edit Master Pasien: ${editingPatient.name}` : 'Tambah Master Data Pasien'}
            </h3>
            <form onSubmit={handleSavePatient}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Dokter / Klinik Pengirim *
                </label>
                <select
                  value={patCustomerId}
                  onChange={(e) => setPatCustomerId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  <option value="">-- Pilih Dokter / Klinik --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.clinic_name})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Nama Lengkap Pasien *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bpk. Hendra Gunawan"
                  value={patName}
                  onChange={(e) => setPatName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="grid-3col" style={{ gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Jenis Kelamin</label>
                  <select
                    value={patGender}
                    onChange={(e) => setPatGender(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Usia (Tahun)</label>
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Shade Gigi Pasien</label>
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>No. Telepon Pasien (Opsional)</label>
                  <input
                    type="text"
                    placeholder="0812..."
                    value={patPhone}
                    onChange={(e) => setPatPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Riwayat Elemen Gigi</label>
                  <input
                    type="text"
                    placeholder='Contoh: ["11","21"]'
                    value={patLastTeeth}
                    onChange={(e) => setPatLastTeeth(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Catatan Klinis / Riwayat Alergi Bahan (Logam, Akrilik, dll)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Alergi logam nikel (gunakan Valplast/Zirconia), riwayat bruxism..."
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
              SPK <strong>{feedbackOrder.order_number}</strong> — Dokter: <strong>{feedbackOrder.customer?.name}</strong> (Pasien: {feedbackOrder.patient_name})
            </p>
            <form onSubmit={handleSaveFeedback}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Rating Kepuasan Dokter (1 - 5 Bintang)
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
                  Catatan Feedback / Testimoni Dokter
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Marginal fit sangat presisi, warna sesuai shade guide, insersi cepat tanpa grinding..."
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
                  Simpan Feedback
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
              {editingItem ? `Edit Master Bahan: ${editingItem.name}` : 'Tambah Master Data Bahan / Produk'}
            </h3>
            <form onSubmit={handleSaveItem}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Nama Bahan / Produk *
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Kategori *</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="RAW_MATERIAL">RAW_MATERIAL (Bahan Baku)</option>
                    <option value="PRODUCT">PRODUCT (Produk / Gigi Tiruan)</option>
                    <option value="CONSUMABLE">CONSUMABLE (Habis Pakai)</option>
                    <option value="TOOL">TOOL (Alat & Bur)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Satuan *</label>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Supplier Utama</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={itemSupplierId}
                    onChange={(e) => setItemSupplierId(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="">-- Pilih Supplier --</option>
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Harga Beli (IDR) *</label>
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Stok Awal</label>
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Min. Stok Aman *</label>
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
              Menambah saldo stok bahan secara otomatis beserta pencatatan nomor Batch/Lot dan tanggal Expired.
            </p>
            <form onSubmit={handleStockIn}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Pilih Bahan / Produk *</label>
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
                  <option value="">-- Pilih Bahan --</option>
                  {inventoryItems.map((itm) => (
                    <option key={itm.id} value={itm.id}>
                      {itm.name} (Stok: {itm.current_stock} {itm.unit?.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Jumlah Masuk (Qty) *</label>
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Harga Beli Satuan (IDR)</label>
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Nomor Batch / Lot</label>
                  <input
                    type="text"
                    placeholder="Contoh: LOT-2026-11"
                    value={inLotNumber}
                    onChange={(e) => setInLotNumber(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Tanggal Exp (Opsional)</label>
                  <input
                    type="date"
                    value={inExpiryDate}
                    onChange={(e) => setInExpiryDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Catatan Penerimaan</label>
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
                  Simpan Stok Masuk
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
              Mengurangi stok secara otomatis dengan metode FEFO (batch yang mendekati expired dikurangi lebih dulu) dan mencatat riwayat penggunaan.
            </p>
            <form onSubmit={handleStockOut}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Pilih Bahan yang Digunakan *</label>
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Jumlah Pemakaian (Qty) *</label>
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Batch / Lot (Otomatis FEFO)</label>
                  <select
                    value={outBatchId}
                    onChange={(e) => setOutBatchId(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="">Otomatis (Exp Terdekat / FEFO)</option>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Kaitkan dengan No. SPK Produksi (Opsional)</label>
                <select
                  value={outOrderId}
                  onChange={(e) => setOutOrderId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                >
                  <option value="">-- Pemakaian Umum / Tanpa SPK Spesifik --</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.order_number} — Pasien: {o.patient_name} ({o.denture_type?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Catatan Pemakaian Teknisi</label>
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
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>Tambah Supplier Bahan Dental</h3>
            <form onSubmit={handleSaveSupplier}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Nama Perusahaan Supplier *</label>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Catatan Pengajuan</label>
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
                  Kirim ke Owner
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
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>Catat Pembayaran Tagihan</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {selectedInvoice.invoice_number} — Sisa: <strong style={{ color: '#dc2626' }}>{formatRupiah(selectedInvoice.balance_due)}</strong>
            </p>

            <form onSubmit={handleRecordPayment}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Nominal Pembayaran (IDR)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '14px', fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="grid-2col" style={{ gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Metode Bayar</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="BANK_TRANSFER">Transfer Bank</option>
                    <option value="CASH">Tunai (Cash)</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Jenis Bayar</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  >
                    <option value="PARTIAL">Cicilan / Bertahap</option>
                    <option value="DEPOSIT">Uang Muka (DP)</option>
                    <option value="FINAL">Pelunasan</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button type="button" onClick={() => setSelectedInvoice(null)} style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ padding: '8px 20px', background: 'var(--primary)', color: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  Konfirmasi Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
