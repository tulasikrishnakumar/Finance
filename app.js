// =============================================================
// K3 Personal Finance - K3 DEVSEC LABS
// Features: LocalStorage state, Dynamic Month allocations,
// Dynamic Tab switcher generation, Checklist CRUD, Cash Planner,
// Bidirectional Budget-to-Checklist Sync, dynamic UI themes,
// Supabase Auth & Cloud Sync for multi-device access.
// =============================================================

// =============================================================
// SUPABASE AUTH & CLOUD SYNC ENGINE
// =============================================================
let supabaseClient = null;
let currentUser = null;

// Initialize Supabase client from stored credentials
function initSupabase() {
    const url = localStorage.getItem('sb_url');
    const key = localStorage.getItem('sb_key');
    if (url && key && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(url, key);
        } catch (e) {
            console.warn('Supabase init failed:', e);
            supabaseClient = null;
        }
    }
}

// Upload state to Supabase cloud (upsert)
async function syncToCloud() {
    if (!supabaseClient || !currentUser) return;
    try {
        await supabaseClient.from('user_finances').upsert({
            user_id: currentUser.id,
            data: state,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch (e) {
        console.warn('Cloud sync failed:', e);
    }
}

// Fetch state from Supabase cloud
async function syncFromCloud() {
    if (!supabaseClient || !currentUser) return false;
    try {
        const { data, error } = await supabaseClient
            .from('user_finances')
            .select('data')
            .eq('user_id', currentUser.id)
            .single();
        if (data && data.data) {
            state = data.data;
            saveLocalOnly();
            return true;
        }
    } catch (e) {
        console.warn('Cloud fetch failed:', e);
    }
    return false;
}

// Save locally only (no cloud push)
function saveLocalOnly() {
    localStorage.setItem('finflow_state', JSON.stringify(state));
}

// ---- Auth UI Controls ----
function showLoginOverlay() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoginOverlay() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'none';
}

function switchAuthTab(tab) {
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
    document.getElementById('btn-auth-submit').dataset.tab = tab;
    document.getElementById('btn-auth-submit').textContent = tab === 'login' ? 'Log In' : 'Create Account';
    showAuthMessage('', '');
}

function showAuthMessage(msg, type) {
    const el = document.getElementById('auth-message');
    if (!el) return;
    if (!msg) { el.style.display = 'none'; return; }
    el.className = 'auth-message ' + type;
    el.textContent = msg;
    el.style.display = 'block';
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const tab = document.getElementById('btn-auth-submit').dataset.tab || 'login';
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const btn = document.getElementById('btn-auth-submit');

    if (!supabaseClient) {
        showAuthMessage('No database connected. Please configure Supabase settings first.', 'error');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Please wait...';

    try {
        let result;
        if (tab === 'signup') {
            result = await supabaseClient.auth.signUp({ email, password });
        } else {
            result = await supabaseClient.auth.signInWithPassword({ email, password });
        }

        if (result.error) {
            showAuthMessage(result.error.message, 'error');
            btn.disabled = false;
            btn.textContent = tab === 'login' ? 'Log In' : 'Create Account';
            return;
        }

        currentUser = result.data.user;
        if (tab === 'signup') {
            showAuthMessage('Account created! Check your email to confirm, then log in.', 'success');
            btn.disabled = false;
            btn.textContent = 'Create Account';
        } else {
            await onLoginSuccess(currentUser);
        }
    } catch (err) {
        showAuthMessage('An unexpected error occurred. Try again.', 'error');
        btn.disabled = false;
        btn.textContent = tab === 'login' ? 'Log In' : 'Create Account';
    }
}

async function onLoginSuccess(user) {
    currentUser = user;
    // Try to fetch cloud state
    const fetched = await syncFromCloud();
    if (fetched) {
        applyLoadedState();
    }
    hideLoginOverlay();
    updateAuthBadge(true, user.email);
    document.getElementById('btn-logout').style.display = '';
    updateDashboard();
}

function enableOfflineMode() {
    currentUser = null;
    hideLoginOverlay();
    updateAuthBadge(false, 'Offline');
    document.getElementById('btn-logout').style.display = 'none';
    updateDashboard();
}

async function handleLogout() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    currentUser = null;
    updateAuthBadge(false, 'Offline');
    document.getElementById('btn-logout').style.display = 'none';
    showLoginOverlay();
}

function updateAuthBadge(isOnline, label) {
    const badge = document.getElementById('auth-status-badge');
    const text = document.getElementById('auth-status-text');
    if (!badge || !text) return;
    badge.className = 'auth-badge ' + (isOnline ? 'online' : 'offline');
    text.textContent = isOnline ? ('Synced: ' + label.split('@')[0]) : 'Offline';
}

// ---- Database Config Modal Controls ----
function openDbConfigModal(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('db-config-modal');
    if (!modal) return;
    // Pre-fill with stored values
    const urlEl = document.getElementById('db-url');
    const keyEl = document.getElementById('db-anon-key');
    if (urlEl) urlEl.value = localStorage.getItem('sb_url') || '';
    if (keyEl) keyEl.value = localStorage.getItem('sb_key') || '';
    modal.style.display = 'flex';
}

function closeDbConfigModal() {
    const modal = document.getElementById('db-config-modal');
    if (modal) modal.style.display = 'none';
}

function saveDbConfig() {
    const url = document.getElementById('db-url').value.trim();
    const key = document.getElementById('db-anon-key').value.trim();
    if (!url || !key) {
        alert('Please enter both Supabase URL and Anon Key.');
        return;
    }
    localStorage.setItem('sb_url', url);
    localStorage.setItem('sb_key', key);
    closeDbConfigModal();
    initSupabase();
    alert('Supabase configured! You can now log in to sync your data.');
}

// Apply fetched cloud state (same as loadState migrations)
function applyLoadedState() {
    if (!state.months) state.months = JSON.parse(JSON.stringify(INITIAL_STATE.months));
    if (!state.activeMonth) state.activeMonth = '2026-08';
    if (!state.debts) state.debts = JSON.parse(JSON.stringify(INITIAL_STATE.debts));
    if (!state.spends) state.spends = [];
    if (!state.tasks) state.tasks = JSON.parse(JSON.stringify(INITIAL_STATE.tasks));
    const [year, month] = state.activeMonth.split('-');
    calendarSelectedDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    syncInputsToActiveMonth();
}

// Original State Constants
const INITIAL_STATE = {
    activeMonth: "2026-08",
    months: {
        "2026-08": {
            income: {
                primary: 15000,
                side: 10000,
                bonus: 10000
            },
            expenses: {
                rent: 9000,
                maintenance: 1000,
                utilities: 1000, // Current + Water
                wifi: 450,
                homeWifi: 700,
                phone: 1000,
                meesho: 2000,
                sliceEmi: 295,
                kalpana: 10000
            },
            cashInHand: 0
        },
        "2026-09": {
            income: {
                primary: 15000,
                side: 10000,
                bonus: 0
            },
            expenses: {
                rent: 9000,
                maintenance: 1000,
                utilities: 1000,
                wifi: 450,
                homeWifi: 700,
                phone: 1000,
                meesho: 0,
                sliceEmi: 295,
                kalpana: 10000
            },
            cashInHand: 0
        }
    },
    debts: {
        roshan: 15000,
        slice: 10295,
        stucred: 1000,
        other: 0
    },
    spends: [], // Daily Spends Logs: { id, category, title, amount, date }
    tasks: [
        // August 2026 Checklist
        { id: 't1_8', title: 'Pay House Rent (9000 Rent + 1000 Maint)', date: '2026-08-01', amount: 10000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'rent_maint' },
        { id: 't2_8', title: 'Personal Wi-Fi Recharge', date: '2026-08-05', amount: 450, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'wifi' },
        { id: 't3_8', title: 'Home Wi-Fi Recharge', date: '2026-08-05', amount: 700, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'homeWifi' },
        { id: 't4_8', title: 'Phone Recharge & Data Pack', date: '2026-08-10', amount: 1000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'phone' },
        { id: 't5_8', title: 'Slice Monthly Minimum EMI', date: '2026-08-03', amount: 295, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'sliceEmi' },
        { id: 't6_8', title: 'Meesho Shopping Budget Limit', date: '2026-08-15', amount: 2000, category: 'bill', completed: false, isCore: true, isMandatory: false, expenseKey: 'meesho' },
        { id: 't7_8', title: 'Pay Wife Kalpana (Monthly Allowance)', date: '2026-08-01', amount: 10000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'kalpana' },

        // September 2026 Checklist
        { id: 't1_9', title: 'Pay House Rent (9000 Rent + 1000 Maint)', date: '2026-09-01', amount: 10000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'rent_maint' },
        { id: 't2_9', title: 'Personal Wi-Fi Recharge', date: '2026-09-05', amount: 450, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'wifi' },
        { id: 't3_9', title: 'Home Wi-Fi Recharge', date: '2026-09-05', amount: 700, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'homeWifi' },
        { id: 't4_9', title: 'Phone Recharge & Data Pack', date: '2026-09-10', amount: 1000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'phone' },
        { id: 't5_9', title: 'Slice Monthly Minimum EMI', date: '2026-09-03', amount: 295, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'sliceEmi' },
        { id: 't7_9', title: 'Pay Wife Kalpana (Monthly Allowance)', date: '2026-09-01', amount: 10000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'kalpana' }
    ]
};

// Global App State
let state = {};
let calendarSelectedDate = new Date(2026, 7, 9); // default August 9, 2026

// Initialize Application
async function initApp() {
    initSupabase();

    // Check for existing Supabase session
    if (supabaseClient) {
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session && session.user) {
                loadState();
                setupEventListeners();
                await onLoginSuccess(session.user);
                return;
            }
        } catch (e) {
            console.warn('Session check failed:', e);
        }
        // No session - show login overlay
        loadState();
        setupEventListeners();
        updateDashboard();
        showLoginOverlay();
    } else {
        // No Supabase configured - run in offline mode
        loadState();
        setupEventListeners();
        updateDashboard();
    }
}

// Load State from LocalStorage with migrations
function loadState() {
    const saved = localStorage.getItem('finflow_state');
    if (saved) {
        try {
            state = JSON.parse(saved);
        } catch (e) {
            console.error("Error parsing saved state. Restoring defaults.", e);
            state = JSON.parse(JSON.stringify(INITIAL_STATE));
        }
    } else {
        state = JSON.parse(JSON.stringify(INITIAL_STATE));
    }
    
    // Migration: Migrate older static months to dynamic state.months dictionary
    if (state.thisMonth && !state.months) {
        state.months = {
            "2026-08": {
                income: { ...state.thisMonth.income },
                expenses: { ...state.thisMonth.expenses },
                cashInHand: state.cashInHand || 0
            },
            "2026-09": {
                income: { ...state.nextMonth.income },
                expenses: { ...state.nextMonth.expenses },
                cashInHand: state.cashInHandNM || 0
            }
        };
        state.activeMonth = "2026-08";
        delete state.thisMonth;
        delete state.nextMonth;
        delete state.cashInHand;
        delete state.cashInHandNM;
    }

    if (!state.months) {
        state.months = JSON.parse(JSON.stringify(INITIAL_STATE.months));
    }
    if (!state.activeMonth) {
        state.activeMonth = "2026-08";
    }
    
    // Ensure activeMonth exists in state.months
    if (!state.months[state.activeMonth]) {
        state.activeMonth = Object.keys(state.months)[0] || "2026-08";
    }

    if (!state.debts) state.debts = {};
    state.debts = { ...INITIAL_STATE.debts, ...state.debts };

    if (!state.spends) state.spends = [];
    if (!state.tasks) state.tasks = JSON.parse(JSON.stringify(INITIAL_STATE.tasks));

    // Migration: Add expenseKey to existing checklist tasks if missing
    state.tasks.forEach(t => {
        if (!t.expenseKey) {
            if (t.title.includes("House Rent")) t.expenseKey = "rent_maint";
            else if (t.title.includes("Personal Wi-Fi")) t.expenseKey = "wifi";
            else if (t.title.includes("Home Wi-Fi")) t.expenseKey = "homeWifi";
            else if (t.title.includes("Phone Recharge")) t.expenseKey = "phone";
            else if (t.title.includes("Slice Monthly")) t.expenseKey = "sliceEmi";
            else if (t.title.includes("Meesho")) t.expenseKey = "meesho";
            else if (t.title.includes("Kalpana")) t.expenseKey = "kalpana";
        }
    });

    // Sync selected calendar focus to active month year
    const [year, month] = state.activeMonth.split('-');
    calendarSelectedDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    if (state.activeMonth === "2026-08") {
        calendarSelectedDate = new Date(2026, 7, 9); // default back to 9th for Aug
    }

    syncInputsToActiveMonth();
}

// Sync Form Inputs to activeMonth state values
function syncInputsToActiveMonth() {
    const cur = state.months[state.activeMonth];
    if (!cur) return;

    document.getElementById('input-income-primary').value = cur.income.primary;
    document.getElementById('input-income-side').value = cur.income.side;
    
    // Extra/Bonus is only for August
    const bonusWrapper = document.getElementById('bonus-input-wrapper');
    if (state.activeMonth === "2026-08") {
        if (bonusWrapper) bonusWrapper.classList.remove('hidden');
        document.getElementById('input-income-bonus').value = cur.income.bonus || 0;
    } else {
        if (bonusWrapper) bonusWrapper.classList.add('hidden');
    }

    document.getElementById('input-rent').value = cur.expenses.rent;
    document.getElementById('input-maintenance').value = cur.expenses.maintenance;
    document.getElementById('input-utilities').value = cur.expenses.utilities;
    document.getElementById('input-wifi').value = cur.expenses.wifi;
    document.getElementById('input-home-wifi').value = cur.expenses.homeWifi;
    document.getElementById('input-phone').value = cur.expenses.phone;
    document.getElementById('input-meesho').value = cur.expenses.meesho;
    document.getElementById('input-slice-emi').value = cur.expenses.sliceEmi;
    document.getElementById('input-kalpana').value = cur.expenses.kalpana || 10000;

    document.getElementById('input-cash-in-hand').value = cur.cashInHand || 0;

    // Debts
    document.getElementById('input-debt-roshan').value = state.debts.roshan;
    document.getElementById('input-debt-slice').value = state.debts.slice;
    document.getElementById('input-debt-stucred').value = state.debts.stucred;
    document.getElementById('input-debt-other').value = state.debts.other || 0;
}

// Save State to LocalStorage and optionally sync to cloud
function saveState() {
    localStorage.setItem('finflow_state', JSON.stringify(state));
    // Auto-push to cloud if user is logged in
    if (supabaseClient && currentUser) {
        syncToCloud();
    }
}

// Setup Event Listeners for UI Elements
function setupEventListeners() {
    // Dynamic month switcher inputs
    const inputIds = [
        'input-income-primary', 'input-income-side', 'input-income-bonus',
        'input-rent', 'input-maintenance', 'input-utilities',
        'input-wifi', 'input-home-wifi', 'input-phone', 'input-meesho', 'input-slice-emi', 'input-kalpana',
        'input-cash-in-hand'
    ];
    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) || 0;
                updateActiveMonthInputs(id, val);
                updateDashboard();
            });
        }
    });

    // Static outstanding loans inputs
    const debtIds = ['input-debt-roshan', 'input-debt-slice', 'input-debt-stucred', 'input-debt-other'];
    debtIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) || 0;
                const key = id.replace('input-debt-', '');
                state.debts[key] = val;
                saveState();
                updateDashboard();
            });
        }
    });

    // Reset button
    document.getElementById('btn-reset').addEventListener('click', () => {
        if (confirm("Are you sure you want to reset all data back to the original dashboard values?")) {
            localStorage.removeItem('finflow_state');
            loadState();
            updateDashboard();
        }
    });

    // Export button
    document.getElementById('btn-export').addEventListener('click', exportToCSV);

    // Add Month button
    document.getElementById('btn-add-month').addEventListener('click', addNextMonth);

    // Spend Logger Form Submit
    document.getElementById('btn-log-spend').addEventListener('click', () => {
        const categorySelect = document.getElementById('input-spend-category');
        const titleInput = document.getElementById('input-spend-title');
        const amountInput = document.getElementById('input-spend-amount');

        const category = categorySelect.value;
        const optionalTitle = titleInput.value.trim();
        const title = optionalTitle ? `${category}: ${optionalTitle}` : category;
        const amount = parseFloat(amountInput.value) || 0;

        if (amount <= 0) {
            alert("Please enter a spend amount greater than 0!");
            return;
        }

        const selectedDateStr = getYYYYMMDD(calendarSelectedDate);
        const newSpend = {
            id: 'spend_' + Date.now(),
            category: category,
            title: title,
            amount: amount,
            date: selectedDateStr
        };

        state.spends.push(newSpend);
        saveState();
        updateDashboard();

        titleInput.value = '';
        amountInput.value = '';
    });

    // Toggle Checklist CRUD Form
    document.getElementById('btn-toggle-task-crud').addEventListener('click', () => {
        const form = document.getElementById('task-crud-form');
        form.classList.toggle('hidden');
        document.getElementById('input-task-date').value = getYYYYMMDD(calendarSelectedDate);
    });

    // Add Checklist Task Dues manually
    document.getElementById('btn-add-checklist-task').addEventListener('click', () => {
        const titleInput = document.getElementById('input-task-title');
        const amountInput = document.getElementById('input-task-amount');
        const dateInput = document.getElementById('input-task-date');
        const mandatoryCheck = document.getElementById('input-task-mandatory');

        const title = titleInput.value.trim();
        const amount = parseFloat(amountInput.value) || 0;
        let dateVal = dateInput.value;

        if (!title) {
            alert("Please enter a checklist title!");
            return;
        }

        if (!dateVal) {
            dateVal = getYYYYMMDD(calendarSelectedDate);
        }

        const newTask = {
            id: 'custom_' + Date.now(),
            title: title,
            amount: amount,
            date: dateVal,
            category: 'bill',
            completed: false,
            isCore: false,
            isMandatory: mandatoryCheck.checked
        };

        state.tasks.push(newTask);
        saveState();
        updateDashboard();

        titleInput.value = '';
        amountInput.value = '';
        mandatoryCheck.checked = false;
        document.getElementById('task-crud-form').classList.add('hidden');
    });
}

// Update Active Month inputs inside state with bidirectional checklist sync
function updateActiveMonthInputs(id, val) {
    const cur = state.months[state.activeMonth];
    if (!cur) return;

    if (id === 'input-cash-in-hand') {
        cur.cashInHand = val;
    } else {
        const key = id.replace('input-', '');
        if (key.startsWith('income-')) {
            const incKey = key.replace('income-', '');
            cur.income[incKey] = val;
        } else {
            const expKey = key === 'home-wifi' ? 'homeWifi' : 
                           key === 'slice-emi' ? 'sliceEmi' : key;
            cur.expenses[expKey] = val;
            
            // Bidirectional Sync: Update corresponding checklist task amount
            syncExpenseToTaskAmount(expKey, val);
        }
    }
    saveState();
}

// Bidirectional Sync helper: Updates checklist tasks when budget inputs are modified
function syncExpenseToTaskAmount(expKey, val) {
    const cur = state.months[state.activeMonth];
    if (!cur) return;

    let targetKey = expKey;
    if (expKey === 'rent' || expKey === 'maintenance') {
        targetKey = 'rent_maint';
    }

    const task = state.tasks.find(t => t.date.startsWith(state.activeMonth) && t.expenseKey === targetKey);
    if (task) {
        if (targetKey === 'rent_maint') {
            task.amount = cur.expenses.rent + cur.expenses.maintenance;
            task.title = `Pay House Rent (${cur.expenses.rent} Rent + ${cur.expenses.maintenance} Maint)`;
        } else {
            task.amount = val;
        }
    } else {
        // If task was deleted, recreate it dynamically
        let title = '';
        let amount = val;
        let isMandatory = true;
        
        if (targetKey === 'rent_maint') {
            title = `Pay House Rent (${cur.expenses.rent} Rent + ${cur.expenses.maintenance} Maint)`;
            amount = cur.expenses.rent + cur.expenses.maintenance;
        } else if (targetKey === 'wifi') {
            title = 'Personal Wi-Fi Recharge';
        } else if (targetKey === 'homeWifi') {
            title = 'Home Wi-Fi Recharge';
        } else if (targetKey === 'phone') {
            title = 'Phone Recharge & Data Pack';
        } else if (targetKey === 'sliceEmi') {
            title = 'Slice Monthly Minimum EMI';
        } else if (targetKey === 'meesho') {
            title = 'Meesho Shopping Budget Limit';
            isMandatory = false;
        } else if (targetKey === 'kalpana') {
            title = 'Pay Wife Kalpana (Monthly Allowance)';
        }

        if (title && amount > 0) {
            state.tasks.push({
                id: 't_' + targetKey + '_' + state.activeMonth,
                title: title,
                date: `${state.activeMonth}-01`,
                amount: amount,
                category: 'bill',
                completed: false,
                isCore: true,
                isMandatory: isMandatory,
                expenseKey: targetKey
            });
        }
    }
}

// Render Multi-Month Financial Trend SVG Bar Chart
function renderTrendChart() {
    const container = document.getElementById('trend-chart-container');
    if (!container) return;

    const keys = Object.keys(state.months).sort();
    const datasets = keys.map(k => {
        const cur = state.months[k];
        const bonus = k === "2026-08" ? (cur.income.bonus || 0) : 0;
        const incomeTotal = cur.income.primary + cur.income.side + bonus;
        
        let spendsTotal = 0;
        state.spends.forEach(s => {
            if (s.date.startsWith(k)) {
                spendsTotal += s.amount;
            }
        });

        const essentials = cur.expenses.rent + cur.expenses.maintenance + cur.expenses.utilities + 
                           cur.expenses.wifi + cur.expenses.homeWifi + cur.expenses.phone + (cur.expenses.kalpana || 10000);
        const wants = cur.expenses.meesho;
        const dues = cur.expenses.sliceEmi;
        const outflowTotal = essentials + wants + dues + spendsTotal;
        const savingsTotal = incomeTotal - outflowTotal;

        return {
            key: k,
            label: getShortMonthYearLabel(k),
            income: incomeTotal,
            outflow: outflowTotal,
            savings: Math.max(0, savingsTotal)
        };
    });

    let maxVal = 1000;
    datasets.forEach(d => {
        if (d.income > maxVal) maxVal = d.income;
        if (d.outflow > maxVal) maxVal = d.outflow;
        if (d.savings > maxVal) maxVal = d.savings;
    });

    // Generate SVG Bar Chart
    const width = 600;
    const height = 180;
    const chartLeft = 55;
    const chartRight = 590;
    const chartTop = 15;
    const chartBottom = 155;
    const chartHeight = chartBottom - chartTop;

    let svgHtml = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Horizontal Grid Lines & Y Axis Labels (25%, 50%, 75%, 100%)
    const gridPcts = [0.25, 0.50, 0.75, 1.00];
    gridPcts.forEach(pct => {
        const yPos = chartBottom - (pct * chartHeight);
        const gridVal = Math.round(maxVal * pct);
        
        svgHtml += `
            <line class="chart-grid-line" x1="${chartLeft}" y1="${yPos}" x2="${chartRight}" y2="${yPos}"></line>
            <text x="5" y="${yPos + 3}" fill="rgba(255,255,255,0.25)" font-size="8.5" font-family="'Outfit', sans-serif">₹${gridVal.toLocaleString('en-IN')}</text>
        `;
    });

    // Baselines
    svgHtml += `
        <line class="chart-axis-line" x1="${chartLeft}" y1="${chartTop}" x2="${chartLeft}" y2="${chartBottom}"></line>
        <line class="chart-axis-line" x1="${chartLeft}" y1="${chartBottom}" x2="${chartRight}" y2="${chartBottom}"></line>
    `;

    // Draw Columns
    const numColumns = datasets.length;
    const spacing = (chartRight - chartLeft) / numColumns;

    datasets.forEach((d, i) => {
        const center = chartLeft + i * spacing + spacing / 2;
        const scale = chartHeight / maxVal;
        
        const hIncome = d.income * scale;
        const hOutflow = d.outflow * scale;
        const hSavings = d.savings * scale;

        // Retrieve month theme color mapping
        const monthNum = parseInt(d.key.split('-')[1], 10);
        const themes = ['#06b6d4', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];
        const monthColor = themes[monthNum % themes.length];

        const barWidth = 11;

        svgHtml += `
            <!-- Income Bar (Green) -->
            <rect class="trend-bar" x="${center - 18}" y="${chartBottom - hIncome}" width="${barWidth}" height="${hIncome}" rx="2" fill="#10b981">
                <title>Total Income (${d.label}): ₹${Math.round(d.income).toLocaleString('en-IN')}</title>
            </rect>
            
            <!-- Outflow Bar (Rose) -->
            <rect class="trend-bar" x="${center - 5}" y="${chartBottom - hOutflow}" width="${barWidth}" height="${hOutflow}" rx="2" fill="#f43f5e">
                <title>Total Outflow (${d.label}): ₹${Math.round(d.outflow).toLocaleString('en-IN')}</title>
            </rect>
            
            <!-- Savings Bar (Month Color Accent) -->
            <rect class="trend-bar" x="${center + 8}" y="${chartBottom - hSavings}" width="${barWidth}" height="${hSavings}" rx="2" fill="${monthColor}">
                <title>Net Savings (${d.label}): ₹${Math.round(d.savings).toLocaleString('en-IN')}</title>
            </rect>
            
            <!-- Month Label -->
            <text x="${center}" y="${chartBottom + 18}" fill="rgba(255,255,255,0.4)" font-size="9" text-anchor="middle" font-family="'Outfit', sans-serif" font-weight="500">${d.label}</text>
        `;
    });

    svgHtml += `</svg>`;
    container.innerHTML = svgHtml;
}

// Convert YYYY-MM into short label (e.g. "Aug '26")
function getShortMonthYearLabel(monthKey) {
    const [yyyy, mm] = monthKey.split('-');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(mm, 10) - 1]} '${yyyy.substring(2)}`;
}

// Dynamically generate the switcher buttons and render active view
function updateDashboard() {
    renderMonthTabs();

    const cur = state.months[state.activeMonth];
    if (!cur) return;

    // Apply color themes to active container dynamically
    const dashboardContainer = document.getElementById('active-month-dashboard');
    if (dashboardContainer) {
        dashboardContainer.classList.forEach(cls => {
            if (cls.startsWith('theme-')) dashboardContainer.classList.remove(cls);
        });
        
        const monthNum = parseInt(state.activeMonth.split('-')[1], 10);
        const themes = ['theme-cyan', 'theme-indigo', 'theme-purple', 'theme-emerald', 'theme-amber', 'theme-rose'];
        const activeTheme = themes[monthNum % themes.length];
        dashboardContainer.classList.add(activeTheme);
    }

    // Math totals for Spends matching selected month
    let spendsTotal = 0;
    state.spends.forEach(s => {
        if (s.date.startsWith(state.activeMonth)) {
            spendsTotal += s.amount;
        }
    });
    document.getElementById('subtotal-daily-spends').innerText = formatCurrency(spendsTotal);

    // Math totals for Active Month
    const bonus = state.activeMonth === "2026-08" ? (cur.income.bonus || 0) : 0;
    const incomeTotal = cur.income.primary + cur.income.side + bonus;
    
    const essentialsTotal = cur.expenses.rent + cur.expenses.maintenance + cur.expenses.utilities + 
                           cur.expenses.wifi + cur.expenses.homeWifi + cur.expenses.phone + (cur.expenses.kalpana || 10000);
    const wantsTotal = cur.expenses.meesho;
    const duesTotal = cur.expenses.sliceEmi;
    const expensesTotal = essentialsTotal + wantsTotal + duesTotal;
    const remainingTotal = incomeTotal - expensesTotal - spendsTotal;

    const debtsTotal = state.debts.roshan + state.debts.slice + state.debts.stucred + (state.debts.other || 0);

    // Update UI Subtotal badges
    const rentBillsTotal = cur.expenses.rent + cur.expenses.maintenance + cur.expenses.utilities;
    const wifiRechargesTotal = cur.expenses.wifi + cur.expenses.homeWifi + cur.expenses.phone;
    
    document.getElementById('subtotal-income').innerText = formatCurrency(incomeTotal);
    document.getElementById('subtotal-core').innerText = formatCurrency(essentialsTotal);
    document.getElementById('subtotal-discretionary').innerText = formatCurrency(wantsTotal + duesTotal);
    document.getElementById('subtotal-rent-bills').innerText = formatCurrency(rentBillsTotal);
    document.getElementById('subtotal-wifi-recharges').innerText = formatCurrency(wifiRechargesTotal);

    // Update Top Header Cards
    const labelMonthName = getFullMonthYearLabel(state.activeMonth);
    document.getElementById('current-date').innerText = labelMonthName;
    document.getElementById('lbl-top-income').innerText = `${labelMonthName} Income`;
    document.getElementById('lbl-top-expenses').innerText = `${labelMonthName} Outflow`;
    document.getElementById('lbl-top-savings').innerText = `Net ${labelMonthName} Savings`;

    document.getElementById('val-total-income').innerText = formatCurrency(incomeTotal);
    document.getElementById('val-total-expenses').innerText = formatCurrency(expensesTotal + spendsTotal);
    
    const topSavingsVal = document.getElementById('val-remaining-savings');
    topSavingsVal.innerText = formatCurrency(remainingTotal);
    topSavingsVal.style.color = remainingTotal < 0 ? 'var(--rose)' : 'var(--emerald)';

    document.getElementById('val-total-debt').innerText = formatCurrency(debtsTotal);
    document.getElementById('summary-total-debt').innerText = formatCurrency(debtsTotal);

    // Update Card 1 Budget Summary details
    document.getElementById('budget-card-title').innerText = `${labelMonthName} Budget`;
    document.getElementById('allocation-chart-title').innerText = `${labelMonthName} Share Allocation`;
    
    document.getElementById('budget-total-income').innerText = formatCurrency(incomeTotal);
    document.getElementById('budget-total-expenses').innerText = formatCurrency(expensesTotal + spendsTotal);
    
    const budgetRemaining = document.getElementById('budget-remaining-savings');
    budgetRemaining.innerText = formatCurrency(remainingTotal);
    budgetRemaining.style.color = remainingTotal < 0 ? 'var(--rose)' : 'var(--emerald)';

    // Update Allocation Ring charts
    updateBudgetChart(essentialsTotal, wantsTotal + spendsTotal, remainingTotal, incomeTotal);

    // Update Card 2 Calendar header & displays
    document.getElementById('calendar-card-title').innerText = `${labelMonthName} Calendar`;
    document.getElementById('calendar-month-year').innerText = labelMonthName;
    
    renderCalendarGrid();
    renderDayEventsList();

    // Update Card 3 Checklist
    document.getElementById('checklist-card-title').innerText = `${labelMonthName} Checklist`;
    renderChecklistDues();

    // Update Cash Planner results
    const cash = cur.cashInHand || 0;
    const activeExpenses = expensesTotal + spendsTotal;
    const needed = Math.max(0, activeExpenses - cash);
    const surplus = Math.max(0, cash - activeExpenses);

    document.getElementById('val-planner-expenses').innerText = formatCurrency(activeExpenses);
    const valNeeded = document.getElementById('val-planner-needed');
    valNeeded.innerText = formatCurrency(needed);
    valNeeded.style.color = needed > 0 ? 'var(--rose)' : 'var(--emerald)';
    document.getElementById('val-planner-surplus').innerText = formatCurrency(surplus);

    // Render Multi-Month Financial Trend Chart
    renderTrendChart();
}

// Render dynamic months toggles in switcher
function renderMonthTabs() {
    const switcher = document.getElementById('global-month-switcher');
    if (!switcher) return;
    switcher.innerHTML = '';

    const keys = Object.keys(state.months).sort();
    keys.forEach(k => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${state.activeMonth === k ? 'active' : ''}`;
        btn.innerText = getFullMonthYearLabel(k);
        btn.addEventListener('click', () => {
            state.activeMonth = k;
            
            // Sync calendar selected focus to first day of new month
            const [yyyy, mm] = k.split('-');
            calendarSelectedDate = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, 1);
            if (k === "2026-08") calendarSelectedDate = new Date(2026, 7, 9); // default Aug 9

            saveState();
            syncInputsToActiveMonth();
            updateDashboard();
        });
        switcher.appendChild(btn);
    });
}

// Append new dynamic month
function addNextMonth() {
    const keys = Object.keys(state.months).sort();
    const latestKey = keys[keys.length - 1] || "2026-09";
    const [yyyy, mm] = latestKey.split('-');
    
    let year = parseInt(yyyy, 10);
    let month = parseInt(mm, 10) + 1;
    if (month > 12) {
        month = 1;
        year++;
    }

    const newKey = `${year}-${String(month).padStart(2, '0')}`;
    
    // Copy inputs from latest month to save user time
    const latestMonth = state.months[latestKey];
    state.months[newKey] = {
        income: {
            primary: latestMonth.income.primary,
            side: latestMonth.income.side,
            bonus: 0 // Reset bonus for new months
        },
        expenses: {
            rent: latestMonth.expenses.rent,
            maintenance: latestMonth.expenses.maintenance,
            utilities: latestMonth.expenses.utilities,
            wifi: latestMonth.expenses.wifi,
            homeWifi: latestMonth.expenses.homeWifi,
            phone: latestMonth.expenses.phone,
            meesho: latestMonth.expenses.meesho,
            sliceEmi: latestMonth.expenses.sliceEmi,
            kalpana: latestMonth.expenses.kalpana
        },
        cashInHand: 0
    };

    // Add default tasks checklist for the new month based on copied bills
    const defaultTasks = [
        { id: `t1_${newKey}`, title: `Pay House Rent (${state.months[newKey].expenses.rent} Rent + ${state.months[newKey].expenses.maintenance} Maint)`, date: `${newKey}-01`, amount: (state.months[newKey].expenses.rent + state.months[newKey].expenses.maintenance), category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'rent_maint' },
        { id: `t2_${newKey}`, title: 'Personal Wi-Fi Recharge', date: `${newKey}-05`, amount: state.months[newKey].expenses.wifi, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'wifi' },
        { id: `t3_${newKey}`, title: 'Home Wi-Fi Recharge', date: `${newKey}-05`, amount: state.months[newKey].expenses.homeWifi, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'homeWifi' },
        { id: `t4_${newKey}`, title: 'Phone Recharge & Data Pack', date: `${newKey}-10`, amount: state.months[newKey].expenses.phone, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'phone' },
        { id: `t5_${newKey}`, title: 'Slice Monthly Minimum EMI', date: `${newKey}-03`, amount: state.months[newKey].expenses.sliceEmi, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'sliceEmi' },
        { id: `t7_${newKey}`, title: 'Pay Wife Kalpana (Monthly Allowance)', date: `${newKey}-01`, amount: state.months[newKey].expenses.kalpana, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'kalpana' }
    ];
    
    // Add Meesho if exists
    if (state.months[newKey].expenses.meesho > 0) {
        defaultTasks.push({ id: `t6_${newKey}`, title: 'Meesho Shopping Budget Limit', date: `${newKey}-15`, amount: state.months[newKey].expenses.meesho, category: 'bill', completed: false, isCore: true, isMandatory: false, expenseKey: 'meesho' });
    }

    state.tasks.push(...defaultTasks);
    state.activeMonth = newKey;
    calendarSelectedDate = new Date(year, month - 1, 1);

    saveState();
    syncInputsToActiveMonth();
    updateDashboard();
}

// Render circular chart rings
function updateBudgetChart(essentials, wants, savings, total) {
    if (total <= 0) return;
    
    const essPct = Math.max(0, Math.round((essentials / total) * 100));
    const wantsPct = Math.max(0, Math.round((wants / total) * 100));
    const savPct = Math.max(0, 100 - essPct - wantsPct);

    document.getElementById('lbl-pct-essentials').innerText = `${essPct}%`;
    document.getElementById('lbl-pct-wants').innerText = `${wantsPct}%`;
    document.getElementById('lbl-pct-savings').innerText = `${savPct}%`;
    document.getElementById('chart-percentage').textContent = `${savPct}%`;
    
    const segEssentials = document.getElementById('chart-segment-essentials');
    const segWants = document.getElementById('chart-segment-wants');
    const segSavings = document.getElementById('chart-segment-savings');
    
    segEssentials.setAttribute('stroke-dasharray', `${essPct} 100`);
    segWants.setAttribute('stroke-dasharray', `${wantsPct} 100`);
    segWants.setAttribute('stroke-dashoffset', `${-essPct}`);
    segSavings.setAttribute('stroke-dasharray', `${savPct} 100`);
    segSavings.setAttribute('stroke-dashoffset', `${-(essPct + wantsPct)}`);
}

// Render dynamic calendar cells matching selectedMonth
function renderCalendarGrid() {
    const daysGrid = document.getElementById('calendar-days-grid');
    if (!daysGrid) return;
    daysGrid.innerHTML = '';

    const [yyyy, mm] = state.activeMonth.split('-');
    const currentYear = parseInt(yyyy, 10);
    const currentMonth = parseInt(mm, 10) - 1; // 0-indexed

    // Padding slots
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell empty-day';
        daysGrid.appendChild(cell);
    }

    // Days slots
    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell current-month';
        cell.innerText = day;

        const cellDate = new Date(currentYear, currentMonth, day);
        if (cellDate.toDateString() === calendarSelectedDate.toDateString()) {
            cell.classList.add('selected-day');
        }

        // Highlight dynamic systems current date
        const today = new Date();
        if (cellDate.toDateString() === today.toDateString()) {
            cell.classList.add('today');
        }

        // Filter events and spends for calendar dots
        const formattedDate = getYYYYMMDD(cellDate);
        const tasks = state.tasks.filter(t => t.date === formattedDate);
        const spends = state.spends.filter(s => s.date === formattedDate);

        if (tasks.length > 0 || spends.length > 0) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'day-event-dots';
            
            tasks.slice(0, 2).forEach(() => {
                const dot = document.createElement('span');
                dot.className = 'event-dot';
                dot.style.background = 'var(--theme-accent)';
                dotsContainer.appendChild(dot);
            });
            
            if (spends.length > 0) {
                const dot = document.createElement('span');
                dot.className = 'event-dot';
                dot.style.background = 'var(--rose)';
                dotsContainer.appendChild(dot);
            }
            cell.appendChild(dotsContainer);
        }

        cell.addEventListener('click', () => {
            calendarSelectedDate = cellDate;
            renderCalendarGrid();
            renderDayEventsList();
        });

        daysGrid.appendChild(cell);
    }
}

// Render dynamic day events list
function renderDayEventsList() {
    const label = document.getElementById('selected-date-str');
    const list = document.getElementById('day-events-list');
    if (!list || !label) return;

    const formattedDate = getYYYYMMDD(calendarSelectedDate);
    label.innerText = formatDateString(formattedDate);

    const tasks = state.tasks.filter(t => t.date === formattedDate);
    const spends = state.spends.filter(s => s.date === formattedDate);

    list.innerHTML = '';

    if (tasks.length === 0 && spends.length === 0) {
        list.innerHTML = '<p class="no-events">No events or spends logged for this day.</p>';
        return;
    }

    // Tasks list
    tasks.forEach(t => {
        const item = document.createElement('div');
        item.className = `event-item ${t.completed ? 'completed' : ''}`;
        item.style.borderLeft = '3px solid var(--theme-accent)';
        if (t.completed) item.style.opacity = '0.6';

        item.innerHTML = `
            <div style="display:flex; align-items:center; gap: 8px;">
                <span style="font-size:0.75rem; color:var(--text-muted); cursor:pointer;" onclick="toggleTask('${t.id}')">
                    [${t.completed ? 'x' : ' '}]
                </span>
                <span class="event-title" style="${t.completed ? 'text-decoration: line-through;' : ''}">${t.title}</span>
            </div>
            <span class="event-amount">₹${t.amount.toLocaleString('en-IN')}</span>
        `;
        list.appendChild(item);
    });

    // Spends list
    spends.forEach(s => {
        const item = document.createElement('div');
        let color = 'var(--rose)';
        if (s.category === 'Rapido') color = 'var(--indigo)';
        else if (s.category === 'Shopping') color = 'var(--purple)';
        else if (s.category === 'Food') color = 'var(--amber)';

        item.className = 'event-item';
        item.style.borderLeft = `3px solid ${color}`;
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        item.innerHTML = `
            <div style="display:flex; align-items:center; gap: 8px;">
                <span style="color:${color}; font-weight:700; font-size:0.7rem;">[Spend]</span>
                <span class="event-title">${s.title}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="event-amount" style="color: ${color};">-${formatCurrency(s.amount)}</span>
                <button onclick="deleteSpend('${s.id}')" title="Delete Spend" style="background:none; border:none; color:var(--rose); cursor:pointer; display:flex; align-items:center;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

// Render dynamic Month checklist dues with delete option
function renderChecklistDues() {
    const list = document.getElementById('list-tasks');
    const summary = document.getElementById('checklist-summary');
    if (!list || !summary) return;

    list.innerHTML = '';

    const currentMonthTasks = state.tasks.filter(t => t.date && t.date.startsWith(state.activeMonth));

    let total = 0, paid = 0;

    currentMonthTasks.forEach(task => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.padding = '0.35rem 0.5rem';
        li.style.background = task.completed ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)';
        li.style.border = '1px solid rgba(255,255,255,0.05)';
        li.style.borderRadius = '8px';
        li.style.fontSize = '0.75rem';
        li.style.opacity = task.completed ? '0.6' : '1';

        li.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1;" onclick="toggleTask('${task.id}')">
                <input type="checkbox" ${task.completed ? 'checked' : ''} style="cursor: pointer; pointer-events: none;">
                <span style="${task.completed ? 'text-decoration: line-through; color: var(--text-muted);' : 'color: #fff;'}">${task.title}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <strong style="color: ${task.completed ? 'var(--emerald)' : '#fff'};">₹${task.amount.toLocaleString('en-IN')}</strong>
                <button onclick="deleteTask('${task.id}')" title="Delete Dues" style="background:none; border:none; color:var(--rose); cursor:pointer; display:flex; align-items:center; padding: 2px;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;

        list.appendChild(li);

        total += task.amount;
        if (task.completed) paid += task.amount;
    });

    if (currentMonthTasks.length === 0) {
        list.innerHTML = '<p class="no-events">No checklist dues scheduled for this month.</p>';
    }

    const remaining = total - paid;
    summary.innerHTML = `
        <div style="display:flex; justify-content:space-between;"><span>Total Monthly Dues:</span><strong>₹${total.toLocaleString('en-IN')}</strong></div>
        <div style="display:flex; justify-content:space-between; color:var(--emerald);"><span>Cleared:</span><strong>₹${paid.toLocaleString('en-IN')}</strong></div>
        <div style="display:flex; justify-content:space-between; color:var(--rose); border-top:1px dashed rgba(255,255,255,0.08); padding-top:2px;"><span>Remaining Checklist Dues:</span><strong>₹${remaining.toLocaleString('en-IN')}</strong></div>
    `;
}

// Toggle checklist task completion
window.toggleTask = function(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveState();
        updateDashboard();
    }
};

// Delete checklist task manually (with bidirectional sync)
window.deleteTask = function(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task && task.expenseKey) {
        const cur = state.months[state.activeMonth];
        if (cur) {
            // Bidirectional Sync: Reset corresponding expenses to 0
            if (task.expenseKey === 'rent_maint') {
                cur.expenses.rent = 0;
                cur.expenses.maintenance = 0;
            } else {
                cur.expenses[task.expenseKey] = 0;
            }
            // Update input elements on screen
            syncInputsToActiveMonth();
        }
    }

    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveState();
    updateDashboard();
};

// Delete spend log
window.deleteSpend = function(spendId) {
    state.spends = state.spends.filter(s => s.id !== spendId);
    saveState();
    updateDashboard();
};

// Utility: format month key into Full Month Name Year
function getFullMonthYearLabel(monthKey) {
    const [yyyy, mm] = monthKey.split('-');
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[parseInt(mm, 10) - 1]} ${yyyy}`;
}

// Format YYYY-MM-DD local date
function getYYYYMMDD(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Convert YYYY-MM-DD to friendly MMM DD, YYYY
function formatDateString(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Format currency
function formatCurrency(num) {
    return '₹' + Math.round(num).toLocaleString('en-IN');
}

// Export to beautifully styled Excel spreadsheet (.xls) with active formulas
function exportToCSV() {
    let rowsHtml = "";
    let rowIdx = 1;

    function addTitleRow(title, cssClass = "") {
        const classAttr = cssClass ? ` class="${cssClass}"` : "";
        rowsHtml += `<tr${classAttr}><td colspan="4">${title}</td></tr>\n`;
        rowIdx++;
    }

    function addRow(colA, colB, colC, colD, cssClass = "") {
        const classAttr = cssClass ? ` class="${cssClass}"` : "";
        
        const makeCell = (val) => {
            if (val === undefined || val === null || val === "") {
                return "<td></td>";
            }
            const str = String(val);
            if (str.startsWith('=')) {
                // It is a formula!
                return `<td x:f="${str}">0</td>`;
            }
            // Check if string is a numeric value
            if (!isNaN(str) && !isNaN(parseFloat(str))) {
                return `<td x:num="${str}">${parseFloat(str)}</td>`;
            }
            // Normal text
            return `<td>${str}</td>`;
        };

        rowsHtml += `<tr${classAttr}>
            ${makeCell(colA)}
            ${makeCell(colB)}
            ${makeCell(colC)}
            ${makeCell(colD)}
        </tr>\n`;
        rowIdx++;
    }

    // Metadata Header
    addTitleRow("K3 PERSONAL FINANCE APPLICATION", "title-row");
    addTitleRow("K3 DEVSEC LABS Ledger", "subtitle-row");
    addTitleRow(`Generated on: ${getFullMonthYearLabel(state.activeMonth)} (Local Browser View)`, "subtitle-row");
    addRow("", "", "", "", "border-none"); // Row 4 empty

    // Section 1 - Outstanding Debts Tracker
    addTitleRow("OUTSTANDING DEBTS & LOANS", "section-header"); // Row 5
    addRow("Lender", "", "Balance (₹)", "", "table-header"); // Row 6
    addRow("Roshan (ASAP)", "", state.debts.roshan, "", "zebra"); // Row 7
    addRow("Slice (Total)", "", state.debts.slice, ""); // Row 8
    addRow("Stucred (Close)", "", state.debts.stucred, "", "zebra"); // Row 9
    addRow("Other Loan", "", state.debts.other || 0, ""); // Row 10
    addRow("TOTAL LOANS OUTSTANDING", "", "=SUM(C7:C10)", "", "total-row"); // Row 11
    addRow("", "", "", "", "border-none"); // Row 12 empty

    // Section 2 - Daily Spends Ledger History
    addTitleRow("DAILY SPENDS LEDGER HISTORY", "section-header"); // Row 13
    addRow("Transaction Date", "Description / Category", "Amount (₹)", "", "table-header"); // Row 14

    const spendsStartRow = rowIdx; // Should be 15
    const spends = state.spends || [];
    
    if (spends.length === 0) {
        addRow("2026-08-01", "No Spends Logged", 0, "", "zebra");
    } else {
        spends.forEach((s, idx) => {
            addRow(s.date, s.title, s.amount, "", idx % 2 === 0 ? "zebra" : "");
        });
    }
    const spendsEndRow = rowIdx - 1;
    addRow("", "", "", "", "border-none"); // Spacer empty row

    // Section 3 - Monthly Budgets
    const keys = Object.keys(state.months).sort();
    keys.forEach(k => {
        const cur = state.months[k];
        const label = getFullMonthYearLabel(k);
        
        addTitleRow(`MONTHLY BUDGET PLAN FOR ${label.toUpperCase()}`, "month-header");
        
        addRow("Parameter", "", "Amount (₹)", "", "table-header");
        
        const incomeStart = rowIdx;
        addRow("Primary Income", "", cur.income.primary, "", "zebra");
        addRow("Side Income", "", cur.income.side, "");
        
        const bonus = k === "2026-08" ? (cur.income.bonus || 0) : 0;
        addRow("Extra / One-time Bonus", "", bonus, "", "zebra");
        const incomeEnd = rowIdx - 1;
        
        const incomeTotalRow = rowIdx;
        addRow("TOTAL MONTH INCOME", "", `=SUM(C${incomeStart}:C${incomeEnd})`, "", "income-row");
        
        const expenseStart = rowIdx;
        addRow("House Rent", "", cur.expenses.rent, "", "zebra");
        addRow("Maintenance Fee", "", cur.expenses.maintenance, "");
        addRow("Utilities (Water + Power)", "", cur.expenses.utilities, "", "zebra");
        addRow("Personal Wi-Fi Recharge", "", cur.expenses.wifi, "");
        addRow("Home Wi-Fi Router", "", cur.expenses.homeWifi, "", "zebra");
        addRow("Phone Recharge", "", cur.expenses.phone, "");
        addRow("Wife Kalpana Allowance", "", cur.expenses.kalpana || 10000, "", "zebra");
        addRow("Meesho Shopping Limit", "", cur.expenses.meesho, "");
        addRow("Slice EMI minimum due", "", cur.expenses.sliceEmi, "", "zebra");
        const expenseEnd = rowIdx - 1;
        
        const expenseTotalRow = rowIdx;
        addRow("TOTAL PLAN EXPENDITURES", "", `=SUM(C${expenseStart}:C${expenseEnd})`, "", "outflow-row");
        
        const spendsSumRow = rowIdx;
        addRow("Logged Daily Spends (SUMIF)", "", `=SUMIF(A${spendsStartRow}:A${spendsEndRow},"*${k}*",C${spendsStartRow}:C${spendsEndRow})`, "", "zebra");
        
        addRow("NET SAVED AT END OF MONTH", "", `=C${incomeTotalRow}-C${expenseTotalRow}-C${spendsSumRow}`, "", "savings-row");
        
        addRow("", "", "", "", "border-none"); // Month Spacer row
    });

    // Section 4 - Task Checklist Status
    addTitleRow("TASK CHECKLIST DUES RECORD", "section-header");
    addRow("Due Description", "Due Date", "Amount (₹)", "Status", "table-header");
    
    const tasks = state.tasks || [];
    if (tasks.length === 0) {
        addRow("No tasks added", "", 0, "N/A", "zebra");
    } else {
        tasks.forEach((t, idx) => {
            addRow(t.title, t.date || 'Pending', t.amount, t.completed ? "Cleared (Paid)" : "Pending", idx % 2 === 0 ? "zebra" : "");
        });
    }

    // Embed CSS styles in HTML spreadsheet template
    const htmlTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
    <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
    <style>
      table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; }
      td { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10pt; color: #1e293b; }
      .border-none td { border: none !important; }
      .title-row td { font-size: 16pt; font-weight: bold; color: #0f172a; border: none; padding-bottom: 2px; }
      .subtitle-row td { font-size: 10pt; color: #64748b; border: none; padding-bottom: 2px; }
      .section-header td { font-size: 12pt; font-weight: bold; background-color: #0f172a; color: #ffffff; padding: 10px 12px; }
      .table-header td { font-weight: bold; background-color: #334155; color: #ffffff; }
      .total-row td { font-weight: bold; background-color: #f1f5f9; border-top: 2px double #475569; }
      .income-row td { font-weight: bold; background-color: #d1fae5; color: #065f46; border-top: 1.5px solid #059669; }
      .outflow-row td { font-weight: bold; background-color: #fee2e2; color: #991b1b; border-top: 1.5px solid #e11d48; }
      .savings-row td { font-weight: bold; background-color: #e0f2fe; color: #0369a1; border-top: 1.5px dashed #0284c7; }
      .month-header td { font-weight: bold; background-color: #e0e7ff; color: #3730a3; font-size: 11pt; padding: 8px 12px; }
      .zebra td { background-color: #f8fafc; }
    </style>
    </head>
    <body>
    <table>
      ${rowsHtml}
    </table>
    </body>
    </html>
    `;

    // Trigger HTML Excel spreadsheet download (.xls)
    const blob = new Blob([htmlTemplate], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const encodedUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUrl);
    link.setAttribute("download", `finflow_excel_planner_${Date.now()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Launch application
window.addEventListener('DOMContentLoaded', initApp);
