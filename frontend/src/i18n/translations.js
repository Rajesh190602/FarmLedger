const translations = {
  en: {
    // Dashboard
    dashboard: "Dashboard",
    welcome: "Welcome to FarmLedger",
    dashboardHelp:
      "Manage your farms, crops, labour, expenses and income in one place.",
    totalFarms: "Total Farms",
    totalCrops: "Total Crops",
    totalArea: "Total Area",
    quickActions: "Quick Actions",
    addFarm: "Add Farm",
    addCrop: "Add Crop",
    recentActivity: "Recent Activity",
    noRecentActivity: "No recent activity.",
    financialOverview: "Financial Overview",
    financialOverviewHelp:
      "Track sales, costs and profitability from your recorded farm data.",
    profitMargin: "Profit Margin",
    revenuePerAcre: "Revenue / Acre",
    profitPerAcre: "Profit / Acre",
    cropProfitability: "Crop Profitability",
    cropProfitabilityHelp:
      "Compare revenue, cost and profit for each crop season.",
    costBreakdown: "Cost Breakdown",
    costBreakdownHelp:
      "See where your recorded expenses are going.",
    noFinancialData: "No financial data available yet.",
    highestProfitCrop: "Highest Profit Crop",
    highestCostCategory: "Highest Cost Category",
    cropSeasonsAcrossFarms: "Crop seasons across your farms",
    manageFarmDetails: "Create and manage your farm details",
    recordCropSeason: "Record a new crop season",

    // Phase 5B — Farm Performance
    farmPerformance: "Farm Performance",
    farmPerformanceHelp:
      "Compare sales, costs and profit across your farms.",
    bestFarm: "Best Performing Farm",
    highestCostCrop: "Highest Cost Crop",
    farm: "Farm",
    revenue: "Revenue",

    // Additional Dashboard / Common keys
    overview: "Overview",
    farmsCount: "Farms",
    activeCrops: "Active Crops",
    cultivatedArea: "Cultivated Area",
    recentCrops: "Recent Crops",
    hectares: "Hectares",
    sowingDate: "Sowing Date",
    expectedHarvest: "Expected Harvest",
    active: "Active",
    planned: "Planned",
    completed: "Completed",
    updatedFromRecords: "Updated from your records",

    // Farms
    farms: "Farms",
    farmManagement: "Farm Management",
    farmHelp: "Add and manage your agricultural farms.",
    farmName: "Farm Name",
    village: "Village",
    district: "District",
    state: "State",
    area: "Area",
    acres: "Acres",
    createFarm: "Create Farm",
    saveFarm: "Save Farm",
    noFarms: "No farms found.",
    farmCreated: "Farm created successfully.",
    selectFarm: "Select Farm",

    // Crops
    crops: "Crops",
    cropManagement: "Crop Management",
    cropHelp: "Register and manage crops for your farms.",
    crop: "Crop",
    cropName: "Crop Name",
    cropSeason: "Crop Season",
    season: "Season",
    kharif: "Kharif",
    rabi: "Rabi",
    zaid: "Zaid",
    areaUnderCrop: "Area Under Crop",
    registerCrop: "Register Crop",
    saveCrop: "Save Crop",
    noCrops: "No crops found.",
    cropRegistered: "Crop registered successfully.",
    selectCrop: "Select Crop",

    // Authentication
    login: "Login",
    logout: "Logout",
    signOut: "Sign out",
    register: "Register",
    mobile: "Mobile Number",
    password: "Password",
    confirmPassword: "Confirm Password",
    name: "Name",
    fullName: "Full Name",
    email: "Email",
    loginSuccess: "Login successful.",
    registrationSuccess: "Registration successful.",
    invalidCredentials: "Invalid mobile number or password.",

    // Labour
    labour: "Labour",
    labourRecords: "Labour Records",
    labourHelp:
      "Manage workers, wage rates and labour work records for your crops.",
    workers: "Workers",
    worker: "Worker",
    addWorker: "Add Worker",
    workerName: "Worker Name",
    gender: "Gender",
    male: "Male",
    female: "Female",
    mobileOptional: "Mobile (Optional)",
    saveWorker: "Save Worker",
    noWorkers: "No workers found.",
    workerAdded: "Worker added successfully.",
    workerSaved: "Worker saved successfully.",
    workerDays: "Worker Days",
    workerGender: "Worker Gender",

    // Labour entries
    addLabour: "Add Labour",
    activity: "Activity",
    entryMode: "Entry Mode",
    groupEntry: "Group Entry",
    individualEntry: "Individual Entry",
    individual: "Individual",
    workDate: "Work Date",
    selectWorker: "Select Worker",
    days: "Days",
    dailyWageOptional: "Daily Wage (Optional)",
    useSavedRate: "Use saved wage rate",
    notes: "Notes",
    saveLabour: "Save Labour",
    recentLabour: "Recent Labour",
    noLabourRecords: "No labour records found.",
    noLabour: "No labour records found.",
    labourSaved: "Labour entry saved successfully.",
    entries: "Entries",
    workEntries: "Work Entries",
    totalDays: "Total Days",

    // Labour activities
    landPreparation: "Land preparation",
    sowingPlanting: "Sowing / Planting",
    weeding: "Weeding",
    fertilizerApplication: "Fertilizer application",
    pesticideSpraying: "Pesticide spraying",
    irrigation: "Irrigation",
    harvesting: "Harvesting",
    picking: "Picking",
    loadingUnloading: "Loading / Unloading",
    otherWork: "Other",
    other: "Other",

    // Group labour
    registeredWorkers: "Registered Workers",
    selectWorkers: "Select Workers",
    unnamedWorkers: "Unnamed Workers",
    unnamedWorkerCount: "Unnamed Worker Count",
    unnamedWorkerGender: "Unnamed Worker Gender",
    workerSelectionHelp:
      "Select registered workers who worked on this activity.",
    unnamedWorkerHelp:
      "Use this when additional workers worked but are not registered.",
    duplicateWorker: "A worker cannot be selected more than once.",

    // Labour summary
    labourSummary: "Labour Summary",
    totalLabourCost: "Total Labour Cost",
    totalWorkerDays: "Total Worker Days",
    totalEntries: "Total Entries",
    totalWorkers: "Total Workers",

    // Wage rates
    wageRates: "Wage Rates",
    wageRateHelp:
      "Set daily wage rates based on activity and worker gender.",
    dailyWage: "Daily Wage",
    day: "Day",
    saveRate: "Save Rate",
    rateSaved: "Wage rate saved successfully.",
    noWageRate: "No saved wage rate found.",

    // Worker History
    workerHistory: "Worker History",
    workerDetails: "Worker Details",
    totalEarned: "Total Earned",
    totalDaysWorked: "Total Days Worked",
    pastWorkHistory: "Past Work History",
    noWorkerHistory: "No work history found for this worker.",
    selectWorkerToViewHistory:
      "Select a worker to view their work history.",
    selectWorkerToView:
      "Select a worker to view their history.",
    earned: "Earned",
    work: "Work",

    // Expenses
    expenses: "Expenses",
    expenseRecords: "Expense Records",
    expenseHelp:
      "Track farm expenses by crop, season and category.",
    addExpense: "Add Expense",
    expenseSaved: "Expense saved successfully.",
    noExpenses: "No expense records found.",
    expenseDate: "Expense Date",
    category: "Category",
    description: "Description",
    descriptionPlaceholder: "Enter expense description",
    quantity: "Quantity",
    unit: "Unit",
    rate: "Rate",
    totalAmount: "Total Amount",
    saveExpense: "Save Expense",
    totalExpenses: "Total Expenses",
    expenseEntries: "Expense Entries",
    seasonsWithExpenses: "Seasons With Expenses",
    seasonWiseExpenses: "Season-wise Expenses",
    seasonWiseExpenseHelp:
      "View total expenses grouped by crop season.",
    noSeasonExpenses: "No season-wise expenses found.",
    downloadCsv: "Download CSV",
    selectCropSeason: "Select Crop Season",
    addCropFirst: "Please add a crop first.",
    seeds: "Seeds",
    fertilizers: "Fertilizers",
    pesticides: "Pesticides",
    herbicides: "Herbicides",
    electricity: "Electricity",
    machinery: "Machinery",
    fuel: "Fuel",
    transport: "Transport",
    labourExpense: "Labour",
    landPreparationExpense: "Land Preparation Expense",
    otherExpense: "Other",

    // Sales / Income
    sales: "Sales & Income",
    salesRecords: "Sales Records",
    salesHelp:
      "Record crop sales and track income by crop season.",
    addSale: "Add Sale",
    saleSaved: "Sale saved successfully.",
    noSales: "No sales recorded yet.",
    saleDate: "Sale Date",
    totalSales: "Total Sales",
    saleEntries: "Sale Entries",
    totalSalesAmount: "Total Sale Amount",
    buyer: "Buyer",
    buyerPlaceholder: "Buyer name",
    market: "Market",
    marketPlaceholder: "Market / location",
    saveSale: "Save Sale",
    seasonWiseSales: "Season-wise Sales",
    seasonWiseSalesHelp:
      "View total crop sales grouped by crop season.",
    noSeasonSales: "No season-wise sales found.",

    // Profitability
    profitability: "Profitability",
    profitabilityHelp:
      "Sales minus crop expenses and labour cost.",
    otherExpenses: "Other Expenses",
    labourCost: "Labour Cost",
    totalCost: "Total Cost",
    netProfit: "Net Profit",
    margin: "Margin",
    noProfitability: "No profitability data available.",
    labourDoubleCountHelp:
      "Labour cost comes from Labour records. Labour-category expense entries are excluded from this calculation to avoid double-counting.",

    // Units
    quintal: "Quintal",
    kg: "Kg",
    ton: "Ton",
    bag: "Bag",

    // Phase 5C — Advanced Analytics
    monthlyTrend: "Monthly Sales & Expense Trend",
    monthlyTrendHelp:
      "Compare recorded sales, expenses and the resulting monthly balance.",
    recordedResult: "Recorded Result",
    noTrendData: "No dated sales or expense data available yet.",
    expenseChart: "Expense Category Chart",
    expenseChartHelp:
      "Compare the size of your recorded expense categories.",
    cropProfitChart: "Crop Profit Comparison",
    cropProfitChartHelp:
      "Compare net profit across your recorded crop seasons.",
    profitInsights: "Profitability Insights",
    profitInsightsHelp:
      "Key signals from your recorded financial data.",

    // Phase 6A–6E — Farm, Field Operations, Crop History & Yield
    update: "Update",
    addFarmFirst: "Please add a farm first.",
    fieldOperations: "Field Operations",
    fieldOperationsHelp:
      "Record irrigation, fertilizer, pesticide and other field activities.",
    addOperation: "Add Operation",
    operationType: "Operation Type",
    operationDate: "Operation Date",
    productName: "Product / Input",
    cost: "Cost",
    irrigation: "Irrigation",
    fertilizer: "Fertilizer",
    pesticide: "Pesticide",
    herbicide: "Herbicide",
    landPreparation: "Land Preparation",
    noOperations: "No field operations recorded yet.",
    cropHistory: "Crop History",
    viewHistory: "View History",
    backToCrops: "Back to Crops",
    activityHistory: "Activity History",
    activityHistoryHelp:
      "A timeline of operations, expenses, labour and sales for this crop season.",
    noActivityHistory:
      "No activity history found for this crop season.",
    fieldOperationLabel: "Field Operation",
    totalInvestment: "Total Investment",
    roi: "ROI",
    yieldTracking: "Yield Tracking",
    yieldTrackingHelp:
      "Record expected and actual yield to compare performance and returns.",
    expectedYield: "Expected Yield",
    actualYield: "Actual Yield",
    yieldAchievement: "Yield Achievement",
    yieldRoiAnalytics: "Yield & ROI Analytics",
    yieldRoiAnalyticsHelp:
      "Compare expected vs actual yield and return on investment by crop season.",
    noYieldData: "No yield records available yet.",
    manageCrops: "Manage Crops",
    deleteConfirm: "Delete this field operation?",

    // Common
    date: "Date",
    quantity: "Quantity",
    rate: "Rate",
    total: "Total",
    status: "Status",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    required: "Required",
    optional: "Optional",
    noData: "No data available."
  },

  te: {
    // Dashboard
    dashboard: "డ్యాష్‌బోర్డ్",
    welcome: "FarmLedger కు స్వాగతం",
    dashboardHelp:
      "మీ పొలాలు, పంటలు, కూలీలు, ఖర్చులు మరియు ఆదాయాన్ని ఒకే చోట నిర్వహించండి.",
    totalFarms: "మొత్తం పొలాలు",
    totalCrops: "మొత్తం పంటలు",
    totalArea: "మొత్తం విస్తీర్ణం",
    quickActions: "త్వరిత చర్యలు",
    addFarm: "పొలం జోడించండి",
    addCrop: "పంట జోడించండి",
    recentActivity: "ఇటీవలి కార్యకలాపాలు",
    noRecentActivity: "ఇటీవలి కార్యకలాపాలు లేవు.",
    financialOverview: "ఆర్థిక సారాంశం",
    financialOverviewHelp:
      "మీరు నమోదు చేసిన వ్యవసాయ డేటా ఆధారంగా అమ్మకాలు, ఖర్చులు మరియు లాభదాయకతను చూడండి.",
    profitMargin: "లాభ మార్జిన్",
    revenuePerAcre: "ఎకరాకు ఆదాయం",
    profitPerAcre: "ఎకరాకు లాభం",
    cropProfitability: "పంట లాభదాయకత",
    cropProfitabilityHelp:
      "ప్రతి పంట కాలానికి ఆదాయం, ఖర్చు మరియు లాభాన్ని పోల్చండి.",
    costBreakdown: "ఖర్చుల విభజన",
    costBreakdownHelp:
      "మీ నమోదు చేసిన ఖర్చులు ఏ విభాగాల్లో ఉన్నాయో చూడండి.",
    noFinancialData:
      "ఇంకా ఆర్థిక సమాచారం అందుబాటులో లేదు.",
    highestProfitCrop:
      "అత్యధిక లాభం ఇచ్చిన పంట",
    highestCostCategory:
      "అత్యధిక ఖర్చు విభాగం",
    cropSeasonsAcrossFarms:
      "మీ పొలాల్లోని పంట కాలాలు",
    manageFarmDetails:
      "పొలం వివరాలను జోడించి నిర్వహించండి",
    recordCropSeason:
      "కొత్త పంట కాలాన్ని నమోదు చేయండి",

    // Phase 5B — Farm Performance
    farmPerformance: "పొలం పనితీరు",
    farmPerformanceHelp:
      "మీ పొలాల మధ్య అమ్మకాలు, ఖర్చులు మరియు లాభాన్ని పోల్చండి.",
    bestFarm: "అత్యుత్తమ పనితీరు ఉన్న పొలం",
    highestCostCrop: "అత్యధిక ఖర్చు అయిన పంట",
    farm: "పొలం",
    revenue: "ఆదాయం",

    // Additional Dashboard / Common keys
    overview: "సారాంశం",
    farmsCount: "పొలాలు",
    activeCrops: "ప్రస్తుతం ఉన్న పంటలు",
    cultivatedArea: "సాగు విస్తీర్ణం",
    recentCrops: "ఇటీవలి పంటలు",
    hectares: "హెక్టార్లు",
    sowingDate: "విత్తిన తేదీ",
    expectedHarvest: "అంచనా కోత తేదీ",
    active: "ప్రస్తుతం ఉంది",
    planned: "ప్రణాళికలో ఉంది",
    completed: "పూర్తయింది",
    updatedFromRecords:
      "మీ రికార్డుల నుండి నవీకరించబడింది",

    // Farms
    farms: "పొలాలు",
    farmManagement: "పొలాల నిర్వహణ",
    farmHelp:
      "మీ వ్యవసాయ పొలాలను జోడించి నిర్వహించండి.",
    farmName: "పొలం పేరు",
    village: "గ్రామం",
    district: "జిల్లా",
    state: "రాష్ట్రం",
    area: "విస్తీర్ణం",
    acres: "ఎకరాలు",
    createFarm: "పొలం సృష్టించండి",
    saveFarm: "పొలాన్ని సేవ్ చేయండి",
    noFarms: "పొలాలు ఏవీ కనుగొనబడలేదు.",
    farmCreated:
      "పొలం విజయవంతంగా సృష్టించబడింది.",
    selectFarm: "పొలాన్ని ఎంచుకోండి",

    // Crops
    crops: "పంటలు",
    cropManagement: "పంటల నిర్వహణ",
    cropHelp:
      "మీ పొలాలకు పంటలను నమోదు చేసి నిర్వహించండి.",
    crop: "పంట",
    cropName: "పంట పేరు",
    cropSeason: "పంట కాలం",
    season: "కాలం",
    kharif: "ఖరీఫ్",
    rabi: "రబీ",
    zaid: "జైద్",
    areaUnderCrop: "పంట విస్తీర్ణం",
    registerCrop: "పంట నమోదు చేయండి",
    saveCrop: "పంటను సేవ్ చేయండి",
    noCrops: "పంటలు ఏవీ కనుగొనబడలేదు.",
    cropRegistered:
      "పంట విజయవంతంగా నమోదు చేయబడింది.",
    selectCrop: "పంటను ఎంచుకోండి",

    // Authentication
    login: "లాగిన్",
    logout: "లాగ్ అవుట్",
    signOut: "లాగ్ అవుట్",
    register: "నమోదు",
    mobile: "మొబైల్ నంబర్",
    password: "పాస్‌వర్డ్",
    confirmPassword:
      "పాస్‌వర్డ్ నిర్ధారించండి",
    name: "పేరు",
    fullName: "పూర్తి పేరు",
    email: "ఇమెయిల్",
    loginSuccess:
      "లాగిన్ విజయవంతమైంది.",
    registrationSuccess:
      "నమోదు విజయవంతమైంది.",
    invalidCredentials:
      "మొబైల్ నంబర్ లేదా పాస్‌వర్డ్ తప్పుగా ఉంది.",

    // Labour
    labour: "కూలీలు",
    labourRecords: "కూలీల రికార్డులు",
    labourHelp:
      "మీ పంటలకు సంబంధించిన కూలీలు, కూలీ రేట్లు మరియు పని రికార్డులను నిర్వహించండి.",
    workers: "కూలీలు",
    worker: "కూలీ",
    addWorker: "కూలీని జోడించండి",
    workerName: "కూలీ పేరు",
    gender: "లింగం",
    male: "పురుషుడు",
    female: "మహిళ",
    mobileOptional:
      "మొబైల్ (ఐచ్ఛికం)",
    saveWorker: "కూలీని సేవ్ చేయండి",
    noWorkers:
      "కూలీలు ఎవరూ కనుగొనబడలేదు.",
    workerAdded:
      "కూలీ విజయవంతంగా జోడించబడింది.",
    workerSaved:
      "కూలీ విజయవంతంగా సేవ్ చేయబడింది.",
    workerDays: "కూలీ రోజులు",
    workerGender: "కూలీ లింగం",

    // Labour entries
    addLabour: "కూలీ పనిని జోడించండి",
    activity: "పని",
    entryMode: "ఎంట్రీ విధానం",
    groupEntry: "గ్రూప్ ఎంట్రీ",
    individualEntry: "వ్యక్తిగత ఎంట్రీ",
    individual: "వ్యక్తిగత",
    workDate: "పని తేదీ",
    selectWorker: "కూలీని ఎంచుకోండి",
    days: "రోజులు",
    dailyWageOptional:
      "రోజువారీ కూలీ (ఐచ్ఛికం)",
    useSavedRate:
      "సేవ్ చేసిన కూలీ రేటును ఉపయోగించండి",
    notes: "గమనికలు",
    saveLabour:
      "కూలీ పనిని సేవ్ చేయండి",
    recentLabour:
      "ఇటీవలి కూలీ పనులు",
    noLabourRecords:
      "కూలీ పని రికార్డులు ఏవీ కనుగొనబడలేదు.",
    noLabour:
      "కూలీ పని రికార్డులు ఏవీ కనుగొనబడలేదు.",
    labourSaved:
      "కూలీ పని ఎంట్రీ విజయవంతంగా సేవ్ చేయబడింది.",
    entries: "ఎంట్రీలు",
    workEntries: "పని ఎంట్రీలు",
    totalDays: "మొత్తం రోజులు",

    // Labour activities
    landPreparation: "భూమి సిద్ధం",
    sowingPlanting: "విత్తడం / నాటడం",
    weeding: "కలుపు తీయడం",
    fertilizerApplication:
      "ఎరువులు వేయడం",
    pesticideSpraying:
      "మందులు పిచికారీ",
    irrigation: "నీరు పెట్టడం",
    harvesting: "కోత కోయడం",
    picking: "ఏరడం",
    loadingUnloading:
      "లోడింగ్ / అన్‌లోడింగ్",
    otherWork: "ఇతర పని",
    other: "ఇతర",

    // Group labour
    registeredWorkers:
      "నమోదైన కూలీలు",
    selectWorkers:
      "కూలీలను ఎంచుకోండి",
    unnamedWorkers:
      "పేరు నమోదు చేయని కూలీలు",
    unnamedWorkerCount:
      "పేరు నమోదు చేయని కూలీల సంఖ్య",
    unnamedWorkerGender:
      "పేరు నమోదు చేయని కూలీల లింగం",
    workerSelectionHelp:
      "ఈ పనిలో పనిచేసిన నమోదైన కూలీలను ఎంచుకోండి.",
    unnamedWorkerHelp:
      "నమోదు చేయని అదనపు కూలీలు పనిచేసినప్పుడు దీనిని ఉపయోగించండి.",
    duplicateWorker:
      "ఒక కూలీని ఒకటి కంటే ఎక్కువసార్లు ఎంచుకోలేరు.",

    // Labour summary
    labourSummary:
      "కూలీ పని సారాంశం",
    totalLabourCost:
      "మొత్తం కూలీ ఖర్చు",
    totalWorkerDays:
      "మొత్తం కూలీ రోజులు",
    totalEntries: "మొత్తం ఎంట్రీలు",
    totalWorkers: "మొత్తం కూలీలు",

    // Wage rates
    wageRates: "కూలీ రేట్లు",
    wageRateHelp:
      "పని మరియు కూలీ లింగం ఆధారంగా రోజువారీ కూలీ రేట్లను సెట్ చేయండి.",
    dailyWage: "రోజువారీ కూలీ",
    day: "రోజు",
    saveRate: "రేటును సేవ్ చేయండి",
    rateSaved:
      "కూలీ రేటు విజయవంతంగా సేవ్ చేయబడింది.",
    noWageRate:
      "సేవ్ చేసిన కూలీ రేటు కనుగొనబడలేదు.",

    // Worker History
    workerHistory: "కూలీ పని చరిత్ర",
    workerDetails: "కూలీ వివరాలు",
    totalEarned: "మొత్తం సంపాదన",
    totalDaysWorked:
      "పని చేసిన మొత్తం రోజులు",
    pastWorkHistory:
      "గత పని వివరాలు",
    noWorkerHistory:
      "ఈ కూలీకి పని చరిత్ర ఏదీ కనుగొనబడలేదు.",
    selectWorkerToViewHistory:
      "పని చరిత్రను చూడటానికి కూలీని ఎంచుకోండి.",
    selectWorkerToView:
      "కూలీ పని చరిత్రను చూడటానికి కూలీని ఎంచుకోండి.",
    earned: "సంపాదన",
    work: "పని",

    // Expenses
    expenses: "ఖర్చులు",
    expenseRecords: "ఖర్చుల రికార్డులు",
    expenseHelp:
      "పంట, కాలం మరియు ఖర్చు వర్గం ఆధారంగా వ్యవసాయ ఖర్చులను నమోదు చేయండి.",
    addExpense: "ఖర్చు జోడించండి",
    expenseSaved:
      "ఖర్చు విజయవంతంగా సేవ్ చేయబడింది.",
    noExpenses:
      "ఖర్చుల రికార్డులు ఏవీ కనుగొనబడలేదు.",
    expenseDate: "ఖర్చు తేదీ",
    category: "వర్గం",
    description: "వివరణ",
    descriptionPlaceholder:
      "ఖర్చు వివరాలను నమోదు చేయండి",
    quantity: "పరిమాణం",
    unit: "యూనిట్",
    rate: "రేటు",
    totalAmount: "మొత్తం ఖర్చు",
    saveExpense:
      "ఖర్చును సేవ్ చేయండి",
    totalExpenses: "మొత్తం ఖర్చులు",
    expenseEntries: "ఖర్చు ఎంట్రీలు",
    seasonsWithExpenses:
      "ఖర్చులు ఉన్న పంట కాలాలు",
    seasonWiseExpenses:
      "కాలం వారీగా ఖర్చులు",
    seasonWiseExpenseHelp:
      "పంట కాలం ఆధారంగా మొత్తం ఖర్చులను చూడండి.",
    noSeasonExpenses:
      "కాలం వారీగా ఖర్చులు ఏవీ కనుగొనబడలేదు.",
    downloadCsv:
      "CSV డౌన్‌లోడ్ చేయండి",
    selectCropSeason:
      "పంట కాలాన్ని ఎంచుకోండి",
    addCropFirst:
      "ముందుగా ఒక పంటను జోడించండి.",
    seeds: "విత్తనాలు",
    fertilizers: "ఎరువులు",
    pesticides: "పురుగుమందులు",
    herbicides: "కలుపుమందులు",
    electricity: "విద్యుత్",
    machinery: "యంత్రాలు",
    fuel: "ఇంధనం",
    transport: "రవాణా",
    labourExpense: "కూలీ ఖర్చు",
    landPreparationExpense:
      "భూమి సిద్ధం ఖర్చు",
    otherExpense: "ఇతర ఖర్చు",

    // Sales / Income
    sales: "అమ్మకాలు & ఆదాయం",
    salesRecords: "అమ్మకాల రికార్డులు",
    salesHelp:
      "పంట అమ్మకాలను నమోదు చేసి, పంట కాలం వారీగా ఆదాయాన్ని చూడండి.",
    addSale: "అమ్మకం జోడించండి",
    saleSaved:
      "అమ్మకం విజయవంతంగా సేవ్ చేయబడింది.",
    noSales:
      "ఇంకా అమ్మకాలు నమోదు కాలేదు.",
    saleDate: "అమ్మకం తేదీ",
    totalSales: "మొత్తం అమ్మకాలు",
    saleEntries: "అమ్మకాల ఎంట్రీలు",
    totalSalesAmount:
      "మొత్తం అమ్మకం మొత్తం",
    buyer: "కొనుగోలుదారు",
    buyerPlaceholder:
      "కొనుగోలుదారు పేరు",
    market: "మార్కెట్",
    marketPlaceholder:
      "మార్కెట్ / ప్రదేశం",
    saveSale:
      "అమ్మకాన్ని సేవ్ చేయండి",
    seasonWiseSales:
      "కాలం వారీగా అమ్మకాలు",
    seasonWiseSalesHelp:
      "పంట కాలం ఆధారంగా మొత్తం అమ్మకాలను చూడండి.",
    noSeasonSales:
      "కాలం వారీగా అమ్మకాలు ఏవీ కనుగొనబడలేదు.",

    // Profitability
    profitability: "లాభదాయకత",
    profitabilityHelp:
      "అమ్మకాల ఆదాయం నుండి పంట ఖర్చులు మరియు కూలీ ఖర్చును తీసివేసిన తర్వాత లాభం.",
    otherExpenses: "ఇతర ఖర్చులు",
    labourCost: "కూలీ ఖర్చు",
    totalCost: "మొత్తం ఖర్చు",
    netProfit: "నికర లాభం",
    margin: "మార్జిన్",
    noProfitability:
      "లాభదాయకత సమాచారం అందుబాటులో లేదు.",
    labourDoubleCountHelp:
      "కూలీ ఖర్చు Labour రికార్డుల నుండి తీసుకోబడుతుంది. రెండుసార్లు లెక్కించకుండా ఉండేందుకు Labour వర్గంలోని ఖర్చులు ఈ లెక్కలో చేర్చబడవు.",

    // Units
    quintal: "క్వింటాల్",
    kg: "కిలో",
    ton: "టన్ను",
    bag: "బ్యాగ్",

    // Phase 5C — Advanced Analytics
    monthlyTrend: "నెలవారీ అమ్మకాలు & ఖర్చుల ధోరణి",
    monthlyTrendHelp:
      "నమోదు చేసిన అమ్మకాలు, ఖర్చులు మరియు నెలవారీ మిగులు/లోటును పోల్చండి.",
    recordedResult: "నమోదైన ఫలితం",
    noTrendData:
      "ఇంకా తేదీతో కూడిన అమ్మకాలు లేదా ఖర్చుల సమాచారం లేదు.",
    expenseChart: "ఖర్చుల వర్గాల చార్ట్",
    expenseChartHelp:
      "నమోదు చేసిన ఖర్చుల వర్గాల పరిమాణాన్ని పోల్చండి.",
    cropProfitChart: "పంటల లాభ పోలిక",
    cropProfitChartHelp:
      "నమోదు చేసిన పంట కాలాల మధ్య నికర లాభాన్ని పోల్చండి.",
    profitInsights: "లాభదాయకత సూచనలు",
    profitInsightsHelp:
      "మీ నమోదైన ఆర్థిక డేటా నుండి ముఖ్యమైన సూచనలు.",

    // Phase 6A–6E — పొలం, పొలం పనులు, పంట చరిత్ర & దిగుబడి
    update: "నవీకరించండి",
    addFarmFirst: "ముందుగా ఒక పొలాన్ని జోడించండి.",
    fieldOperations: "పొలం పనులు",
    fieldOperationsHelp:
      "నీరు, ఎరువులు, పురుగుమందులు మరియు ఇతర పొలం పనులను నమోదు చేయండి.",
    addOperation: "పని జోడించండి",
    operationType: "పని రకం",
    operationDate: "పని తేదీ",
    productName: "ఉత్పత్తి / ఇన్‌పుట్",
    cost: "ఖర్చు",
    irrigation: "నీరు పెట్టడం",
    fertilizer: "ఎరువులు",
    pesticide: "పురుగుమందు",
    herbicide: "కలుపుమందు",
    landPreparation: "భూమి సిద్ధం",
    noOperations: "ఇంకా పొలం పనులు నమోదు కాలేదు.",
    cropHistory: "పంట చరిత్ర",
    viewHistory: "చరిత్ర చూడండి",
    backToCrops: "పంటలకు తిరిగి వెళ్లండి",
    activityHistory: "పని చరిత్ర",
    activityHistoryHelp:
      "ఈ పంట కాలానికి సంబంధించిన పొలం పనులు, ఖర్చులు, కూలీ పనులు మరియు అమ్మకాల చరిత్ర.",
    noActivityHistory:
      "ఈ పంట కాలానికి పని చరిత్ర ఏదీ కనుగొనబడలేదు.",
    fieldOperationLabel: "పొలం పని",
    totalInvestment: "మొత్తం పెట్టుబడి",
    roi: "పెట్టుబడిపై రాబడి (ROI)",
    yieldTracking: "దిగుబడి నమోదు",
    yieldTrackingHelp:
      "పంట పనితీరు మరియు రాబడిని పోల్చడానికి అంచనా మరియు వాస్తవ దిగుబడిని నమోదు చేయండి.",
    expectedYield: "అంచనా దిగుబడి",
    actualYield: "వాస్తవ దిగుబడి",
    yieldAchievement: "దిగుబడి సాధన",
    yieldRoiAnalytics: "దిగుబడి & ROI విశ్లేషణ",
    yieldRoiAnalyticsHelp:
      "ప్రతి పంట కాలానికి అంచనా మరియు వాస్తవ దిగుబడి, పెట్టుబడిపై రాబడిని పోల్చండి.",
    noYieldData:
      "ఇంకా దిగుబడి రికార్డులు అందుబాటులో లేవు.",
    manageCrops: "పంటలను నిర్వహించండి",
    deleteConfirm: "ఈ పొలం పనిని తొలగించాలా?",

    // Common
    date: "తేదీ",
    quantity: "పరిమాణం",
    rate: "రేటు",
    total: "మొత్తం",
    status: "స్థితి",
    actions: "చర్యలు",
    edit: "సవరించు",
    delete: "తొలగించు",
    save: "సేవ్ చేయండి",
    cancel: "రద్దు చేయండి",
    close: "మూసివేయండి",
    loading: "లోడ్ అవుతోంది...",
    error: "లోపం",
    success: "విజయం",
    required: "అవసరం",
    optional: "ఐచ్ఛికం",
    noData: "డేటా అందుబాటులో లేదు."
  }
};

export { translations };
export default translations;