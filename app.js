// =============================================================
// K3 Personal Finance - K3 DEVSEC LABS
// Full-Featured Production Financial Engine
// Features:
// - LocalStorage Offline-first state with cloud Firebase sync
// - Advanced Animated GUI Dialog Modal System (Replaces browser alerts/confirms/prompts)
// - Dynamic Custom Budget Categories (Add, Edit, Delete custom expenses & incomes in Budget Planner)
// - Dynamic Month budgets with bidirectional checklist synchronization
// - Full Daily Spends tracking with Interactive Calendar & Month Ledger
// - Expanded Dynamic Outstanding Debt & Loan Manager (Edit, Pay, Delete Any Loan)
// - Real-time Cash Flow Planner and Visual Allocation Ring
// - Multi-month Trend Analysis Bar Chart
// - Excel (.xls) & JSON Backup / Restore exports
// =============================================================

// =============================================================
// 1. STATE & CONSTANTS
// =============================================================
const INITIAL_STATE = {
    activeMonth: "2026-08",
    months: {
        "2026-08": {
            income: {
                primary: 15000,
                side: 10000,
                bonus: 10000
            },
            customIncomes: [],
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
            customExpenses: [],
            cashInHand: 0
        },
        "2026-09": {
            income: {
                primary: 15000,
                side: 10000,
                bonus: 0
            },
            customIncomes: [],
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
            customExpenses: [],
            cashInHand: 0
        },
        "2026-10": {
            income: {
                primary: 15000,
                side: 10000,
                bonus: 0
            },
            customIncomes: [],
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
            customExpenses: [],
            cashInHand: 0
        }
    },
    debts: [
        { id: 'debt_roshan', title: 'Roshan (ASAP)', amount: 15000, category: 'Personal' },
        { id: 'debt_slice', title: 'Slice (Total)', amount: 10295, category: 'Credit Card / EMI' },
        { id: 'debt_stucred', title: 'Stucred (Close)', amount: 1000, category: 'App Loan' },
        { id: 'debt_other', title: 'Other Loan', amount: 0, category: 'Other' }
    ],
    spends: [], // Daily Spends Logs: { id, category, title, amount, date }
    scheduledIncomes: [
        // August 2026 Scheduled Incomes
        { id: 'inc_1_8', incomeKey: 'primary', title: 'Primary Salary', date: '2026-08-01', amount: 15000, category: 'Salary', received: true },
        { id: 'inc_2_8', incomeKey: 'side', title: 'Side Income Payout', date: '2026-08-10', amount: 10000, category: 'Side Gig', received: false },
        { id: 'inc_3_8', incomeKey: 'bonus', title: 'Performance Bonus', date: '2026-08-20', amount: 10000, category: 'Bonus', received: false },

        // September 2026 Scheduled Incomes
        { id: 'inc_1_9', incomeKey: 'primary', title: 'Primary Salary', date: '2026-09-01', amount: 15000, category: 'Salary', received: false },
        { id: 'inc_2_9', incomeKey: 'side', title: 'Side Income Payout', date: '2026-09-10', amount: 10000, category: 'Side Gig', received: false },

        // October 2026 Scheduled Incomes
        { id: 'inc_1_10', incomeKey: 'primary', title: 'Primary Salary', date: '2026-10-01', amount: 15000, category: 'Salary', received: false },
        { id: 'inc_2_10', incomeKey: 'side', title: 'Side Income Payout', date: '2026-10-10', amount: 10000, category: 'Side Gig', received: false }
    ],
    tasks: [
        // August 2026 Checklist
        { id: 't1_8', title: 'Pay House Rent (9000 Rent + 1000 Maint)', date: '2026-08-01', amount: 10000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'rent_maint' },
        { id: 'tu_8', title: 'Utilities (Current + Water)', date: '2026-08-05', amount: 1000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'utilities' },
        { id: 't2_8', title: 'Personal Wi-Fi Recharge', date: '2026-08-05', amount: 450, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'wifi' },
        { id: 't3_8', title: 'Home Wi-Fi Recharge', date: '2026-08-05', amount: 700, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'homeWifi' },
        { id: 't4_8', title: 'Phone Recharge & Data Pack', date: '2026-08-10', amount: 1000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'phone' },
        { id: 't5_8', title: 'Slice Monthly Minimum EMI', date: '2026-08-03', amount: 295, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'sliceEmi' },
        { id: 't6_8', title: 'Meesho Shopping Budget Limit', date: '2026-08-15', amount: 2000, category: 'bill', completed: false, isCore: true, isMandatory: false, expenseKey: 'meesho' },
        { id: 't7_8', title: 'Pay Wife Kalpana (Monthly Allowance)', date: '2026-08-01', amount: 10000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'kalpana' },

        // September 2026 Checklist
        { id: 't1_9', title: 'Pay House Rent (9000 Rent + 1000 Maint)', date: '2026-09-01', amount: 10000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'rent_maint' },
        { id: 'tu_9', title: 'Utilities (Current + Water)', date: '2026-09-05', amount: 1000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'utilities' },
        { id: 't2_9', title: 'Personal Wi-Fi Recharge', date: '2026-09-05', amount: 450, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'wifi' },
        { id: 't3_9', title: 'Home Wi-Fi Recharge', date: '2026-09-05', amount: 700, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'homeWifi' },
        { id: 't4_9', title: 'Phone Recharge & Data Pack', date: '2026-09-10', amount: 1000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'phone' },
        { id: 't5_9', title: 'Slice Monthly Minimum EMI', date: '2026-09-03', amount: 295, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'sliceEmi' },
        { id: 't7_9', title: 'Pay Wife Kalpana (Monthly Allowance)', date: '2026-09-01', amount: 10000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'kalpana' },

        // October 2026 Checklist
        { id: 't1_10', title: 'Pay House Rent (9000 Rent + 1000 Maint)', date: '2026-10-01', amount: 10000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'rent_maint' },
        { id: 'tu_10', title: 'Utilities (Current + Water)', date: '2026-10-05', amount: 1000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'utilities' },
        { id: 't2_10', title: 'Personal Wi-Fi Recharge', date: '2026-10-05', amount: 450, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'wifi' },
        { id: 't3_10', title: 'Home Wi-Fi Recharge', date: '2026-10-05', amount: 700, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'homeWifi' },
        { id: 't4_10', title: 'Phone Recharge & Data Pack', date: '2026-10-10', amount: 1000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'phone' },
        { id: 't5_10', title: 'Slice Monthly Minimum EMI', date: '2026-10-03', amount: 295, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'sliceEmi' },
        { id: 't7_10', title: 'Pay Wife Kalpana (Monthly Allowance)', date: '2026-10-01', amount: 10000, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'kalpana' }
    ]
};

// Default Firebase Project Configuration
const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyArlF4WDLRj2Qg35fhOXP4yBvbUIHlJcZs",
    authDomain: "finance-350aa.firebaseapp.com",
    projectId: "finance-350aa",
    storageBucket: "finance-350aa.firebasestorage.app",
    messagingSenderId: "666617554876",
    appId: "1:666617554876:web:467e04904adeba69b0adb9",
    measurementId: "G-5QJ3PTQMG6"
};

// Global State
let state = {};
let calendarSelectedDate = new Date(2026, 7, 9); // default August 9, 2026
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let currentUser = null;

// =============================================================
// 2. ADVANCED ANIMATED GUI DIALOG ENGINE
// =============================================================
let activeDialogResolve = null;

function showConfirmDialog({
    title = "Confirmation Required",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger" // 'danger', 'primary', 'emerald', 'amber'
}) {
    return new Promise((resolve) => {
        const modal = document.getElementById('app-dialog-modal');
        const card = document.getElementById('dialog-card');
        const titleEl = document.getElementById('dialog-title');
        const messageEl = document.getElementById('dialog-message');
        const confirmBtn = document.getElementById('dialog-btn-confirm');
        const cancelBtn = document.getElementById('dialog-btn-cancel');
        const confirmLabel = document.getElementById('dialog-confirm-label');
        const inputContainer = document.getElementById('dialog-input-container');
        const iconContent = document.getElementById('dialog-icon-content');

        if (!modal) return resolve(false);

        activeDialogResolve = resolve;

        card.className = `dialog-card glass-panel dialog-theme-${type}`;
        if (titleEl) titleEl.innerText = title;
        if (messageEl) messageEl.innerText = message;
        if (confirmLabel) confirmLabel.innerText = confirmText;
        if (cancelBtn) {
            cancelBtn.innerText = cancelText;
            cancelBtn.style.display = 'block';
        }
        if (inputContainer) inputContainer.classList.add('hidden');

        // Set Icon SVG based on type
        if (iconContent) {
            if (type === 'danger') {
                iconContent.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            } else if (type === 'emerald') {
                iconContent.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            } else if (type === 'amber') {
                iconContent.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
            } else {
                iconContent.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
            }
        }

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);

        const onConfirm = () => {
            cleanup();
            resolve(true);
        };
        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        function cleanup() {
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; }, 200);
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
            activeDialogResolve = null;
        }

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
    });
}

function showPromptDialog({
    title = "Input Required",
    message = "Please enter a value:",
    defaultValue = "",
    placeholder = "Enter value...",
    inputType = "text",
    isCurrency = false,
    confirmText = "Submit",
    cancelText = "Cancel",
    type = "primary"
}) {
    return new Promise((resolve) => {
        const modal = document.getElementById('app-dialog-modal');
        const card = document.getElementById('dialog-card');
        const titleEl = document.getElementById('dialog-title');
        const messageEl = document.getElementById('dialog-message');
        const confirmBtn = document.getElementById('dialog-btn-confirm');
        const cancelBtn = document.getElementById('dialog-btn-cancel');
        const confirmLabel = document.getElementById('dialog-confirm-label');
        const inputContainer = document.getElementById('dialog-input-container');
        const inputField = document.getElementById('dialog-input-field');
        const currencyTag = document.getElementById('dialog-currency-tag');
        const iconContent = document.getElementById('dialog-icon-content');

        if (!modal || !inputField) return resolve(null);

        activeDialogResolve = resolve;

        card.className = `dialog-card glass-panel dialog-theme-${type}`;
        if (titleEl) titleEl.innerText = title;
        if (messageEl) messageEl.innerText = message;
        if (confirmLabel) confirmLabel.innerText = confirmText;
        if (cancelBtn) {
            cancelBtn.innerText = cancelText;
            cancelBtn.style.display = 'block';
        }

        if (inputContainer) inputContainer.classList.remove('hidden');
        inputField.type = inputType;
        inputField.placeholder = placeholder;
        inputField.value = defaultValue;

        if (currencyTag) {
            currencyTag.style.display = isCurrency ? 'flex' : 'none';
        }

        if (iconContent) {
            iconContent.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
        }

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
            inputField.focus();
            if (inputType === 'text' || inputType === 'number') inputField.select();
        }, 10);

        const onConfirm = () => {
            const val = inputField.value;
            cleanup();
            resolve(val);
        };
        const onCancel = () => {
            cleanup();
            resolve(null);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onConfirm();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
            }
        };

        function cleanup() {
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; }, 200);
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
            inputField.removeEventListener('keydown', onKeyDown);
            activeDialogResolve = null;
        }

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
        inputField.addEventListener('keydown', onKeyDown);
    });
}

function showAlertDialog({
    title = "Notice",
    message = "",
    confirmText = "OK",
    type = "primary"
}) {
    return new Promise((resolve) => {
        const modal = document.getElementById('app-dialog-modal');
        const card = document.getElementById('dialog-card');
        const titleEl = document.getElementById('dialog-title');
        const messageEl = document.getElementById('dialog-message');
        const confirmBtn = document.getElementById('dialog-btn-confirm');
        const cancelBtn = document.getElementById('dialog-btn-cancel');
        const confirmLabel = document.getElementById('dialog-confirm-label');
        const inputContainer = document.getElementById('dialog-input-container');
        const iconContent = document.getElementById('dialog-icon-content');

        if (!modal) return resolve();

        card.className = `dialog-card glass-panel dialog-theme-${type}`;
        if (titleEl) titleEl.innerText = title;
        if (messageEl) messageEl.innerText = message;
        if (confirmLabel) confirmLabel.innerText = confirmText;
        if (cancelBtn) cancelBtn.style.display = 'none';
        if (inputContainer) inputContainer.classList.add('hidden');

        if (iconContent) {
            iconContent.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);

        const onConfirm = () => {
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; }, 200);
            confirmBtn.removeEventListener('click', onConfirm);
            resolve();
        };

        confirmBtn.addEventListener('click', onConfirm);
    });
}

function closeDialogModal() {
    const modal = document.getElementById('app-dialog-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 200);
    }
    if (activeDialogResolve) {
        activeDialogResolve(null);
        activeDialogResolve = null;
    }
}

// =============================================================
// 3. FIREBASE & CLOUD SYNC ENGINE
// =============================================================
function initFirebase() {
    try {
        let configStr = localStorage.getItem('finflow_firebase_config');
        let config = DEFAULT_FIREBASE_CONFIG;
        if (configStr) {
            try {
                config = JSON.parse(configStr);
            } catch (e) {
                console.warn('Using default Firebase configuration', e);
            }
        }

        if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
            firebaseApp = firebase.initializeApp(config);
            firebaseAuth = firebase.auth();
            firebaseDb = firebase.firestore();
        } else if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            firebaseApp = firebase.app();
            firebaseAuth = firebase.auth();
            firebaseDb = firebase.firestore();
        }
    } catch (e) {
        console.warn('Firebase init failed:', e);
        firebaseApp = null;
        firebaseAuth = null;
        firebaseDb = null;
    }
}

async function syncToCloud() {
    if (!firebaseDb || !currentUser) return;
    try {
        state.updated_at = new Date().toISOString();
        await firebaseDb.collection('user_finances').doc(currentUser.uid).set({
            data: state,
            updated_at: state.updated_at
        });
        showToast('Synced to Cloud', 'success');
    } catch (e) {
        console.warn('Cloud sync failed:', e);
        if (e.message && e.message.includes('permissions')) {
            showToast('Cloud sync permission notice. Check Firestore Rules in Firebase Console.', 'error');
        } else {
            showToast('Cloud sync status: ' + (e.message || 'Saved locally'), 'info');
        }
    }
}

async function syncFromCloud() {
    if (!firebaseDb || !currentUser) return false;
    try {
        const doc = await firebaseDb.collection('user_finances').doc(currentUser.uid).get();
        if (doc.exists && doc.data() && doc.data().data) {
            const cloudData = doc.data().data;
            const cloudUpdatedAt = new Date(doc.data().updated_at || 0).getTime();
            const localUpdatedAt = new Date(state.updated_at || 0).getTime();

            // If local state has newer edits, do NOT overwrite with older cloud state; upload local state instead
            if (localUpdatedAt > cloudUpdatedAt && localUpdatedAt > 0) {
                await syncToCloud();
                return false;
            }

            state = cloudData;
            saveLocalOnly();
            return true;
        }
    } catch (e) {
        console.warn('Cloud fetch failed:', e);
    }
    return false;
}

function saveLocalOnly() {
    if (!state.updated_at) {
        state.updated_at = new Date().toISOString();
    }
    localStorage.setItem('finflow_state', JSON.stringify(state));
}

function saveState() {
    state.updated_at = new Date().toISOString();
    saveLocalOnly();
    if (firebaseDb && currentUser) {
        syncToCloud();
    }
}

// Authentication Modal UI Handlers
function showLoginOverlay() {
    const el = document.getElementById('login-overlay');
    if (el) el.style.display = 'flex';
}

function hideLoginOverlay() {
    const el = document.getElementById('login-overlay');
    if (el) el.style.display = 'none';
}

let activeAuthTab = 'login';
function switchAuthTab(tab) {
    activeAuthTab = tab;
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const submitBtn = document.getElementById('btn-auth-submit');
    const togglePrompt = document.getElementById('auth-toggle-prompt');
    const toggleLink = document.getElementById('auth-toggle-link');
    const headerTitle = document.getElementById('auth-header-title');

    if (tab === 'login') {
        if (tabLogin) tabLogin.classList.add('active');
        if (tabSignup) tabSignup.classList.remove('active');
        if (submitBtn) submitBtn.innerText = 'Sign In';
        if (togglePrompt) togglePrompt.innerText = "Don't have an account?";
        if (toggleLink) toggleLink.innerText = 'Sign Up';
        if (headerTitle) headerTitle.innerText = 'Welcome to K3 Finance';
    } else {
        if (tabSignup) tabSignup.classList.add('active');
        if (tabLogin) tabLogin.classList.remove('active');
        if (submitBtn) submitBtn.innerText = 'Create Account';
        if (togglePrompt) togglePrompt.innerText = 'Already have an account?';
        if (toggleLink) toggleLink.innerText = 'Sign In';
        if (headerTitle) headerTitle.innerText = 'Create Your Financial Vault';
    }
}

function toggleAuthMode(e) {
    if (e) e.preventDefault();
    switchAuthTab(activeAuthTab === 'login' ? 'signup' : 'login');
}

function showAuthMessage(msg, type = 'error') {
    const el = document.getElementById('auth-message');
    if (!el) return;
    el.innerText = msg;
    el.className = `auth-message ${type}`;
    el.style.display = 'block';
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    if (!firebaseAuth) {
        showAuthMessage('Firebase is not initialized. Please verify configuration.', 'error');
        return;
    }

    const email = document.getElementById('auth-email').value.trim();
    const pass = document.getElementById('auth-password').value;
    const submitBtn = document.getElementById('btn-auth-submit');
    const origText = submitBtn ? submitBtn.innerText : 'Submit';

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Please wait...';
    }

    try {
        if (activeAuthTab === 'login') {
            const cred = await firebaseAuth.signInWithEmailAndPassword(email, pass);
            currentUser = cred.user;
            await onLoginSuccess(currentUser);
        } else {
            const cred = await firebaseAuth.createUserWithEmailAndPassword(email, pass);
            currentUser = cred.user;
            await syncToCloud();
            await onLoginSuccess(currentUser);
        }
        hideLoginOverlay();
        showToast(`Signed in as ${email}`, 'success');
    } catch (err) {
        console.error('Auth error:', err);
        let msg = err.message;
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
            msg = 'Invalid email or password. Please verify your credentials.';
        } else if (err.code === 'auth/email-already-in-use') {
            msg = 'An account with this email already exists. Switch to Sign In.';
        } else if (err.code === 'auth/weak-password') {
            msg = 'Password should be at least 6 characters.';
        }
        showAuthMessage(msg, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = origText;
        }
    }
}

async function onLoginSuccess(user) {
    updateAuthBadge(true, user.email || 'Cloud Connected');
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.style.display = 'inline-flex';

    const cloudLoaded = await syncFromCloud();
    if (cloudLoaded) {
        applyLoadedState();
        updateDashboard();
        showToast('Restored financial data from Cloud', 'success');
    } else {
        await syncToCloud();
    }
}

function enableOfflineMode() {
    sessionStorage.setItem('finflow_skip_auth', 'true');
    hideLoginOverlay();
    updateAuthBadge(false, 'Offline Mode');
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.style.display = 'none';
    showToast('Running in local offline-only mode', 'info');
}

async function handleLogout() {
    const confirmed = await showConfirmDialog({
        title: "Sign Out?",
        message: "You can sign back in anytime to sync your financial data across devices.",
        confirmText: "Sign Out",
        type: "primary"
    });
    if (!confirmed) return;

    if (firebaseAuth) {
        await firebaseAuth.signOut();
    }
    currentUser = null;
    sessionStorage.removeItem('finflow_skip_auth');
    updateAuthBadge(false, 'Offline');
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.style.display = 'none';
    showLoginOverlay();
    showToast('Signed out of cloud session', 'info');
}

function updateAuthBadge(isOnline, label) {
    const badge = document.getElementById('auth-status-badge');
    const text = document.getElementById('auth-status-text');
    if (badge && text) {
        badge.className = `auth-badge ${isOnline ? 'online' : 'offline'}`;
        text.innerText = label;
    }
}

function openDbConfigModal(e) {
    if (e) e.stopPropagation();
    const modal = document.getElementById('db-config-modal');
    const textarea = document.getElementById('db-firebase-config');
    if (modal && textarea) {
        const saved = localStorage.getItem('finflow_firebase_config') || JSON.stringify(DEFAULT_FIREBASE_CONFIG, null, 2);
        textarea.value = saved;
        modal.style.display = 'flex';
    }
}

function closeDbConfigModal() {
    const modal = document.getElementById('db-config-modal');
    if (modal) modal.style.display = 'none';
}

function saveDbConfig() {
    const textarea = document.getElementById('db-firebase-config');
    if (!textarea) return;
    try {
        const parsed = JSON.parse(textarea.value);
        localStorage.setItem('finflow_firebase_config', JSON.stringify(parsed, null, 2));
        closeDbConfigModal();
        showToast('Firebase configuration saved. Reloading...', 'success');
        setTimeout(() => window.location.reload(), 800);
    } catch (e) {
        showAlertDialog({
            title: "Invalid JSON Format",
            message: "Please enter valid Firebase JSON configuration with apiKey, projectId, etc.",
            type: "danger"
        });
    }
}

// =============================================================
// 4. INITIALIZATION & STATE MANAGEMENT
// =============================================================
async function initApp() {
    initFirebase();
    loadState();
    setupEventListeners();
    updateDashboard();

    if (firebaseAuth) {
        firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                await onLoginSuccess(user);
            } else {
                currentUser = null;
                updateAuthBadge(false, 'Offline');
                const isOfflineChoice = sessionStorage.getItem('finflow_skip_auth');
                if (!isOfflineChoice) {
                    showLoginOverlay();
                    switchAuthTab('login');
                }
            }
        });
    } else {
        showLoginOverlay();
        switchAuthTab('login');
    }
}

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

    applyLoadedState();
}

function applyLoadedState() {
    if (!state.months || typeof state.months !== 'object') {
        state.months = JSON.parse(JSON.stringify(INITIAL_STATE.months));
    }

    // Ensure 2026-08, 2026-09, and 2026-10 always exist in months if missing
    ['2026-08', '2026-09', '2026-10'].forEach(k => {
        if (!state.months[k] && INITIAL_STATE.months[k]) {
            state.months[k] = JSON.parse(JSON.stringify(INITIAL_STATE.months[k]));
        }
    });

    if (!state.activeMonth || !state.months[state.activeMonth]) {
        state.activeMonth = Object.keys(state.months)[0] || "2026-08";
    }

    // Sanitize every month object
    Object.keys(state.months).forEach(k => {
        const m = state.months[k];
        if (!m.income) m.income = { primary: 15000, side: 10000, bonus: 0 };
        if (m.income.primary === undefined) m.income.primary = 15000;
        if (m.income.side === undefined) m.income.side = 10000;
        if (m.income.bonus === undefined) m.income.bonus = 0;
        if (!m.customIncomes || !Array.isArray(m.customIncomes)) m.customIncomes = [];
        
        if (!m.expenses || typeof m.expenses !== 'object') m.expenses = {};
        if (m.expenses.rent === undefined) m.expenses.rent = 9000;
        if (m.expenses.maintenance === undefined) m.expenses.maintenance = 1000;
        if (m.expenses.utilities === undefined) m.expenses.utilities = 1000;
        if (m.expenses.wifi === undefined) m.expenses.wifi = 450;
        if (m.expenses.homeWifi === undefined) m.expenses.homeWifi = 700;
        if (m.expenses.phone === undefined) m.expenses.phone = 1000;
        if (m.expenses.meesho === undefined) m.expenses.meesho = 0;
        if (m.expenses.sliceEmi === undefined) m.expenses.sliceEmi = 295;
        if (m.expenses.kalpana === undefined) m.expenses.kalpana = 10000;
        if (!m.customExpenses || !Array.isArray(m.customExpenses)) m.customExpenses = [];
        if (m.cashInHand === undefined) m.cashInHand = 0;
    });

    if (!state.debts) {
        state.debts = JSON.parse(JSON.stringify(INITIAL_STATE.debts));
    } else if (!Array.isArray(state.debts)) {
        state.debts = [
            { id: 'debt_roshan', title: 'Roshan (ASAP)', amount: Number(state.debts.roshan) || 15000, category: 'Personal' },
            { id: 'debt_slice', title: 'Slice (Total)', amount: Number(state.debts.slice) || 10295, category: 'Credit Card / EMI' },
            { id: 'debt_stucred', title: 'Stucred (Close)', amount: Number(state.debts.stucred) || 1000, category: 'App Loan' },
            { id: 'debt_other', title: 'Other Loan', amount: Number(state.debts.other) || 0, category: 'Other' }
        ];
    } else {
        state.debts.forEach(d => {
            delete d.isFixed;
            if (!d.category) d.category = 'General Loan';
        });
    }

    if (!state.spends || !Array.isArray(state.spends)) state.spends = [];
    if (!state.scheduledIncomes || !Array.isArray(state.scheduledIncomes)) {
        state.scheduledIncomes = JSON.parse(JSON.stringify(INITIAL_STATE.scheduledIncomes || []));
    }
    if (!state.tasks || !Array.isArray(state.tasks)) {
        state.tasks = JSON.parse(JSON.stringify(INITIAL_STATE.tasks || []));
    }

    // Normalize task expenseKeys
    state.tasks.forEach(t => {
        if (!t.expenseKey) {
            if (t.title.includes("House Rent")) t.expenseKey = "rent_maint";
            else if (t.title.includes("Utilities")) t.expenseKey = "utilities";
            else if (t.title.includes("Personal Wi-Fi")) t.expenseKey = "wifi";
            else if (t.title.includes("Home Wi-Fi")) t.expenseKey = "homeWifi";
            else if (t.title.includes("Phone Recharge")) t.expenseKey = "phone";
            else if (t.title.includes("Slice Monthly")) t.expenseKey = "sliceEmi";
            else if (t.title.includes("Meesho")) t.expenseKey = "meesho";
            else if (t.title.includes("Kalpana")) t.expenseKey = "kalpana";
        }
    });

    // Ensure calendarSelectedDate aligns with activeMonth
    const [year, month] = state.activeMonth.split('-');
    calendarSelectedDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    if (state.activeMonth === "2026-08") {
        calendarSelectedDate = new Date(2026, 7, 9);
    }

    syncInputsToActiveMonth();
}

function syncInputsToActiveMonth() {
    const cur = state.months[state.activeMonth];
    if (!cur) return;

    reconcileIncomes();

    setVal('input-income-primary', cur.income.primary);
    setVal('input-income-side', cur.income.side);
    setVal('input-income-bonus', cur.income.bonus || 0);

    setVal('input-rent', cur.expenses.rent);
    setVal('input-maintenance', cur.expenses.maintenance);
    setVal('input-utilities', cur.expenses.utilities);
    setVal('input-wifi', cur.expenses.wifi);
    setVal('input-home-wifi', cur.expenses.homeWifi);
    setVal('input-phone', cur.expenses.phone);
    setVal('input-meesho', cur.expenses.meesho);
    setVal('input-slice-emi', cur.expenses.sliceEmi);
    setVal('input-kalpana', cur.expenses.kalpana);

    setVal('input-cash-in-hand', cur.cashInHand || 0);

    renderCustomBudgetItems();
    renderBudgetSpends();
    renderDebtsList();
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined ? val : 0;
}

// =============================================================
// 5. EVENT LISTENERS
// =============================================================
function setupEventListeners() {
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

    // Reset button with Animated GUI Confirm Dialog
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
        btnReset.addEventListener('click', async () => {
            const confirmed = await showConfirmDialog({
                title: "Reset All Data?",
                message: "This will erase your custom changes and restore all budgets, tasks, and loans back to factory defaults.",
                confirmText: "Yes, Reset Everything",
                type: "danger"
            });
            if (confirmed) {
                localStorage.removeItem('finflow_state');
                state = JSON.parse(JSON.stringify(INITIAL_STATE));
                saveState();
                applyLoadedState();
                updateDashboard();
                showToast('Reset data to defaults', 'info');
            }
        });
    }

    // Export button
    const btnExport = document.getElementById('btn-export');
    if (btnExport) btnExport.addEventListener('click', exportToCSV);

    // Add Month button
    const btnAddMonth = document.getElementById('btn-add-month');
    if (btnAddMonth) btnAddMonth.addEventListener('click', addNextMonth);

    // Add Spend button
    const btnLogSpend = document.getElementById('btn-log-spend');
    if (btnLogSpend) {
        btnLogSpend.addEventListener('click', () => {
            const categorySelect = document.getElementById('input-spend-category');
            const titleInput = document.getElementById('input-spend-title');
            const amountInput = document.getElementById('input-spend-amount');
            const dateInput = document.getElementById('input-spend-date');

            const category = categorySelect ? categorySelect.value : 'Other';
            const optionalTitle = titleInput ? titleInput.value.trim() : '';
            const title = optionalTitle ? `${category}: ${optionalTitle}` : category;
            const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
            let dateVal = dateInput ? dateInput.value : '';

            if (amount <= 0) {
                showToast("Please enter a spend amount greater than 0.", "error");
                if (amountInput) amountInput.focus();
                return;
            }

            if (!dateVal) {
                dateVal = getYYYYMMDD(calendarSelectedDate);
            }

            const newSpend = {
                id: 'spend_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                category: category,
                title: title,
                amount: amount,
                date: dateVal
            };

            state.spends.push(newSpend);
            saveState();
            updateDashboard();

            if (titleInput) titleInput.value = '';
            if (amountInput) amountInput.value = '';
            showToast(`Logged spend: ₹${amount.toLocaleString('en-IN')}`, 'success');
        });
    }

    // Calendar Unified Action Tabs & Switcher
    const tabCalDue = document.getElementById('tab-cal-due');
    const tabCalIncome = document.getElementById('tab-cal-income');
    const tabCalSpend = document.getElementById('tab-cal-spend');

    const formCalDue = document.getElementById('form-cal-due');
    const formCalIncome = document.getElementById('form-cal-income');
    const formCalSpend = document.getElementById('form-cal-spend');

    function switchCalendarActionTab(activeTab) {
        if (!tabCalDue || !tabCalIncome || !tabCalSpend) return;

        tabCalDue.classList.remove('active', 'tab-income-active', 'tab-spend-active');
        tabCalIncome.classList.remove('active', 'tab-income-active', 'tab-spend-active');
        tabCalSpend.classList.remove('active', 'tab-income-active', 'tab-spend-active');

        if (formCalDue) formCalDue.classList.add('hidden');
        if (formCalIncome) formCalIncome.classList.add('hidden');
        if (formCalSpend) formCalSpend.classList.add('hidden');

        syncCalendarFormDates();

        if (activeTab === 'due') {
            tabCalDue.classList.add('active');
            if (formCalDue) formCalDue.classList.remove('hidden');
            const el = document.getElementById('input-cal-due-title');
            if (el) el.focus();
        } else if (activeTab === 'income') {
            tabCalIncome.classList.add('active', 'tab-income-active');
            if (formCalIncome) formCalIncome.classList.remove('hidden');
            const el = document.getElementById('input-cal-income-title');
            if (el) el.focus();
        } else if (activeTab === 'spend') {
            tabCalSpend.classList.add('active', 'tab-spend-active');
            if (formCalSpend) formCalSpend.classList.remove('hidden');
            const el = document.getElementById('input-spend-title');
            if (el) el.focus();
        }
    }

    if (tabCalDue) tabCalDue.addEventListener('click', () => switchCalendarActionTab('due'));
    if (tabCalIncome) tabCalIncome.addEventListener('click', () => switchCalendarActionTab('income'));
    if (tabCalSpend) tabCalSpend.addEventListener('click', () => switchCalendarActionTab('spend'));

    // Calendar Add Payment Due
    const btnCalAddDue = document.getElementById('btn-cal-add-due');
    if (btnCalAddDue) {
        btnCalAddDue.addEventListener('click', () => {
            const titleInput = document.getElementById('input-cal-due-title');
            const amountInput = document.getElementById('input-cal-due-amount');
            const dateInput = document.getElementById('input-cal-due-date');
            const mandatoryCheck = document.getElementById('input-cal-due-mandatory');

            const title = titleInput ? titleInput.value.trim() : '';
            const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
            let dateVal = dateInput ? dateInput.value : '';

            if (!title) {
                showToast("Please enter what you need to pay.", "error");
                if (titleInput) titleInput.focus();
                return;
            }
            if (amount <= 0) {
                showToast("Please enter a due amount greater than 0.", "error");
                if (amountInput) amountInput.focus();
                return;
            }
            if (!dateVal) {
                dateVal = getYYYYMMDD(calendarSelectedDate);
            }

            const newTask = {
                id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                title: title,
                amount: amount,
                date: dateVal,
                category: 'bill',
                completed: false,
                isCore: false,
                isMandatory: mandatoryCheck ? mandatoryCheck.checked : false
            };

            state.tasks.push(newTask);
            saveState();
            updateDashboard();

            if (titleInput) titleInput.value = '';
            if (amountInput) amountInput.value = '';
            if (mandatoryCheck) mandatoryCheck.checked = false;
            showToast(`Scheduled payment due: "${title}" (₹${amount.toLocaleString('en-IN')})`, 'success');
        });
    }

    // Calendar Add Expected Income
    const btnCalAddIncome = document.getElementById('btn-cal-add-income');
    if (btnCalAddIncome) {
        btnCalAddIncome.addEventListener('click', () => {
            const catSelect = document.getElementById('input-cal-income-cat');
            const titleInput = document.getElementById('input-cal-income-title');
            const amountInput = document.getElementById('input-cal-income-amount');
            const dateInput = document.getElementById('input-cal-income-date');

            const category = catSelect ? catSelect.value : 'Salary';
            const title = titleInput ? titleInput.value.trim() : '';
            const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
            let dateVal = dateInput ? dateInput.value : '';

            if (!title) {
                showToast("Please enter an income source / name.", "error");
                if (titleInput) titleInput.focus();
                return;
            }
            if (amount <= 0) {
                showToast("Please enter an expected income amount greater than 0.", "error");
                if (amountInput) amountInput.focus();
                return;
            }
            if (!dateVal) {
                dateVal = getYYYYMMDD(calendarSelectedDate);
            }

            if (!state.scheduledIncomes) state.scheduledIncomes = [];

            const newIncome = {
                id: 'inc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                title: title,
                amount: amount,
                date: dateVal,
                category: category,
                received: false
            };

            state.scheduledIncomes.push(newIncome);
            syncScheduledIncomeToBudget(newIncome);
            saveState();
            updateDashboard();

            if (titleInput) titleInput.value = '';
            if (amountInput) amountInput.value = '';
            showToast(`Scheduled income: "${title}" (₹${amount.toLocaleString('en-IN')})`, 'success');
        });
    }

    // Toggle Checklist Add Form
    const btnToggleTask = document.getElementById('btn-toggle-task-crud');
    if (btnToggleTask) {
        btnToggleTask.addEventListener('click', () => {
            const form = document.getElementById('task-crud-form');
            if (form) {
                form.classList.toggle('hidden');
                const dateEl = document.getElementById('input-task-date');
                if (dateEl) dateEl.value = getYYYYMMDD(calendarSelectedDate);
            }
        });
    }

    // Add Checklist Task Due
    const btnAddChecklistTask = document.getElementById('btn-add-checklist-task');
    if (btnAddChecklistTask) {
        btnAddChecklistTask.addEventListener('click', () => {
            const titleInput = document.getElementById('input-task-title');
            const amountInput = document.getElementById('input-task-amount');
            const dateInput = document.getElementById('input-task-date');
            const mandatoryCheck = document.getElementById('input-task-mandatory');

            const title = titleInput ? titleInput.value.trim() : '';
            const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
            let dateVal = dateInput ? dateInput.value : '';

            if (!title) {
                showToast("Please enter a dues title.", "error");
                if (titleInput) titleInput.focus();
                return;
            }

            if (!dateVal) {
                dateVal = getYYYYMMDD(calendarSelectedDate);
            }

            const newTask = {
                id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                title: title,
                amount: amount,
                date: dateVal,
                category: 'bill',
                completed: false,
                isCore: false,
                isMandatory: mandatoryCheck ? mandatoryCheck.checked : false
            };

            state.tasks.push(newTask);
            saveState();
            updateDashboard();

            if (titleInput) titleInput.value = '';
            if (amountInput) amountInput.value = '';
            if (mandatoryCheck) mandatoryCheck.checked = false;
            const form = document.getElementById('task-crud-form');
            if (form) form.classList.add('hidden');
            showToast('Added checklist due', 'success');
        });
    }

    // Custom Income Quick-Add Form Toggle
    const btnToggleAddIncome = document.getElementById('btn-toggle-add-income');
    const quickAddIncomeForm = document.getElementById('quick-add-income-form');
    const btnCancelAddIncome = document.getElementById('btn-cancel-add-income');
    const btnSaveNewIncome = document.getElementById('btn-save-new-income');

    if (btnToggleAddIncome && quickAddIncomeForm) {
        btnToggleAddIncome.addEventListener('click', () => {
            quickAddIncomeForm.classList.toggle('hidden');
            const titleEl = document.getElementById('input-new-income-title');
            if (titleEl && !quickAddIncomeForm.classList.contains('hidden')) titleEl.focus();
        });
    }
    if (btnCancelAddIncome && quickAddIncomeForm) {
        btnCancelAddIncome.addEventListener('click', () => {
            quickAddIncomeForm.classList.add('hidden');
        });
    }
    if (btnSaveNewIncome) {
        btnSaveNewIncome.addEventListener('click', () => {
            const titleEl = document.getElementById('input-new-income-title');
            const amtEl = document.getElementById('input-new-income-amount');
            const title = titleEl ? titleEl.value.trim() : '';
            const amount = parseFloat(amtEl ? amtEl.value : 0) || 0;

            if (!title) {
                showToast("Please enter an income source name.", "error");
                if (titleEl) titleEl.focus();
                return;
            }

            const cur = state.months[state.activeMonth];
            if (!cur) return;
            if (!cur.customIncomes) cur.customIncomes = [];

            const newCustomInc = {
                id: 'inc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                title: title,
                amount: amount
            };

            cur.customIncomes.push(newCustomInc);
            syncCustomIncomeToScheduled(newCustomInc);

            saveState();
            updateDashboard();

            if (titleEl) titleEl.value = '';
            if (amtEl) amtEl.value = '';
            if (quickAddIncomeForm) quickAddIncomeForm.classList.add('hidden');
            showToast(`Added income source "${title}"`, 'success');
        });
    }

    // Custom Expense Quick-Add Form Toggle
    const btnToggleAddExpense = document.getElementById('btn-toggle-add-expense');
    const quickAddExpForm = document.getElementById('quick-add-expense-form');
    const btnCancelAddExpense = document.getElementById('btn-cancel-add-expense');
    const btnSaveNewExpense = document.getElementById('btn-save-new-expense');

    if (btnToggleAddExpense && quickAddExpForm) {
        btnToggleAddExpense.addEventListener('click', () => {
            quickAddExpForm.classList.toggle('hidden');
            const titleEl = document.getElementById('input-new-exp-title');
            if (titleEl && !quickAddExpForm.classList.contains('hidden')) titleEl.focus();
        });
    }
    if (btnCancelAddExpense && quickAddExpForm) {
        btnCancelAddExpense.addEventListener('click', () => {
            quickAddExpForm.classList.add('hidden');
        });
    }
    if (btnSaveNewExpense) {
        btnSaveNewExpense.addEventListener('click', () => {
            const titleEl = document.getElementById('input-new-exp-title');
            const amtEl = document.getElementById('input-new-exp-amount');
            const typeEl = document.getElementById('input-new-exp-type');
            const taskCheck = document.getElementById('input-new-exp-task');

            const title = titleEl ? titleEl.value.trim() : '';
            const amount = parseFloat(amtEl ? amtEl.value : 0) || 0;
            const category = typeEl ? typeEl.value : 'essentials';

            if (!title) {
                showToast("Please enter an expense name.", "error");
                if (titleEl) titleEl.focus();
                return;
            }

            const cur = state.months[state.activeMonth];
            if (!cur) return;
            if (!cur.customExpenses) cur.customExpenses = [];

            const expId = 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
            cur.customExpenses.push({
                id: expId,
                title: title,
                amount: amount,
                category: category
            });

            if (taskCheck && taskCheck.checked && amount > 0) {
                state.tasks.push({
                    id: 'task_' + expId,
                    title: `Pay ${title}`,
                    date: `${state.activeMonth}-05`,
                    amount: amount,
                    category: 'bill',
                    completed: false,
                    isCore: false,
                    isMandatory: category === 'essentials',
                    expenseKey: expId
                });
            }

            saveState();
            updateDashboard();

            if (titleEl) titleEl.value = '';
            if (amtEl) amtEl.value = '';
            if (quickAddExpForm) quickAddExpForm.classList.add('hidden');
            showToast(`Added "${title}" (₹${amount.toLocaleString('en-IN')}) to budget!`, 'success');
        });
    }

    // Add Debt Form (Sidebar)
    const btnAddDebt = document.getElementById('btn-add-debt');
    if (btnAddDebt) {
        btnAddDebt.addEventListener('click', () => {
            const titleInput = document.getElementById('input-debt-title-new');
            const amountInput = document.getElementById('input-debt-amount-new');
            const catInput = document.getElementById('input-debt-cat-new');
            const title = titleInput ? titleInput.value.trim() : '';
            const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
            const category = catInput ? catInput.value : 'General Loan';

            if (!title) {
                showToast('Please enter a lender name or loan description.', 'error');
                if (titleInput) titleInput.focus();
                return;
            }

            state.debts.push({
                id: 'debt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                title: title,
                amount: amount,
                category: category
            });

            saveState();
            updateDashboard();

            if (titleInput) titleInput.value = '';
            if (amountInput) amountInput.value = '';
            const debtForm = document.getElementById('debt-add-form');
            if (debtForm) debtForm.classList.add('hidden');
            showToast('Added loan / debt entry', 'success');
        });
    }

    const btnToggleDebtForm = document.getElementById('btn-toggle-debt-form');
    if (btnToggleDebtForm) {
        btnToggleDebtForm.addEventListener('click', () => {
            const debtForm = document.getElementById('debt-add-form');
            if (debtForm) debtForm.classList.toggle('hidden');
        });
    }

    // Add Debt Form (Inside Expanded Modal)
    const btnAddDebtModal = document.getElementById('btn-add-debt-modal');
    if (btnAddDebtModal) {
        btnAddDebtModal.addEventListener('click', () => {
            const titleInput = document.getElementById('modal-input-debt-title');
            const amountInput = document.getElementById('modal-input-debt-amount');
            const catInput = document.getElementById('modal-input-debt-cat');
            const title = titleInput ? titleInput.value.trim() : '';
            const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
            const category = catInput ? catInput.value : 'General Loan';

            if (!title) {
                showToast('Please enter a lender name or description.', 'error');
                if (titleInput) titleInput.focus();
                return;
            }

            state.debts.push({
                id: 'debt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                title: title,
                amount: amount,
                category: category
            });

            saveState();
            updateDashboard();
            renderDebtsManagerModal();

            if (titleInput) titleInput.value = '';
            if (amountInput) amountInput.value = '';
            showToast('Added loan / debt entry', 'success');
        });
    }
}

// =============================================================
// 6. DYNAMIC CUSTOM BUDGET ITEMS & LIVE SPENDS
// =============================================================
function renderCustomBudgetItems() {
    const cur = state.months[state.activeMonth];
    if (!cur) return;

    // Render Custom Incomes
    const incContainer = document.getElementById('custom-incomes-container');
    if (incContainer) {
        incContainer.innerHTML = '';
        if (cur.customIncomes && cur.customIncomes.length > 0) {
            cur.customIncomes.forEach(item => {
                const row = document.createElement('div');
                row.className = 'custom-budget-row';
                row.innerHTML = `
                    <div class="custom-budget-header">
                        <span class="custom-budget-title" onclick="promptRenameCustomIncome('${item.id}')" title="Click to rename">
                            ${item.title} <span style="font-size:0.65rem; color:var(--text-muted);">✎</span>
                        </span>
                        <button onclick="deleteCustomIncome('${item.id}')" title="Delete Income Source" style="background:none; border:none; color:var(--rose); cursor:pointer; font-size:1.1rem; line-height:1;">
                            &times;
                        </button>
                    </div>
                    <div class="input-wrapper">
                        <span class="input-currency">₹</span>
                        <input type="number" value="${item.amount}" oninput="updateCustomIncomeAmount('${item.id}', this.value)">
                    </div>
                `;
                incContainer.appendChild(row);
            });
        }
    }

    // Render Custom Expenses
    const expContainer = document.getElementById('custom-expenses-container');
    if (expContainer) {
        expContainer.innerHTML = '';
        if (cur.customExpenses && cur.customExpenses.length > 0) {
            cur.customExpenses.forEach(item => {
                const row = document.createElement('div');
                row.className = 'custom-budget-row';
                let badgeClass = 'custom-badge-essentials';
                let badgeLabel = 'Essentials';
                if (item.category === 'wants') {
                    badgeClass = 'custom-badge-wants';
                    badgeLabel = 'Wants';
                } else if (item.category === 'savings') {
                    badgeClass = 'custom-badge-savings';
                    badgeLabel = 'Investment';
                }

                row.innerHTML = `
                    <div class="custom-budget-header">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span class="custom-budget-title" onclick="promptRenameCustomExpense('${item.id}')" title="Click to rename">
                                ${item.title} <span style="font-size:0.65rem; color:var(--text-muted);">✎</span>
                            </span>
                            <span class="${badgeClass}">${badgeLabel}</span>
                        </div>
                        <button onclick="deleteCustomExpense('${item.id}')" title="Delete Custom Expense" style="background:none; border:none; color:var(--rose); cursor:pointer; font-size:1.1rem; line-height:1;">
                            &times;
                        </button>
                    </div>
                    <div class="input-wrapper">
                        <span class="input-currency">₹</span>
                        <input type="number" value="${item.amount}" oninput="updateCustomExpenseAmount('${item.id}', this.value)">
                    </div>
                `;
                expContainer.appendChild(row);
            });
        } else {
            expContainer.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); font-size: 0.72rem; padding: 6px 0;">
                    No custom items added. Click "+ Expense" above to add any item (Gym, Petrol, Groceries, SIP, etc.)!
                </div>
            `;
        }
    }

    renderBudgetSpends();
}

function renderBudgetSpends() {
    const container = document.getElementById('budget-spends-container');
    if (!container) return;

    const currentMonthSpends = (state.spends || []).filter(s => s.date && s.date.startsWith(state.activeMonth));
    container.innerHTML = '';

    if (currentMonthSpends.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); font-size: 0.72rem; padding: 6px 0;">
                No daily spends logged for this month yet. Use the calendar's "+ Spend" tab to log your daily expenses!
            </div>
        `;
        return;
    }

    currentMonthSpends.sort((a, b) => (b.date || '').localeCompare(a.date || '')).forEach(s => {
        const row = document.createElement('div');
        row.className = 'custom-budget-row';
        row.style.borderColor = 'rgba(244, 63, 94, 0.2)';
        row.style.background = 'rgba(244, 63, 94, 0.03)';

        let dateLabel = s.date || '';
        const parts = (s.date || '').split('-');
        if (parts.length === 3) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            dateLabel = `${monthNames[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`;
        }

        row.innerHTML = `
            <div class="custom-budget-header">
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; flex:1; min-width:0;">
                    <span class="task-date-badge" onclick="promptChangeSpendDate('${s.id}')" title="Click to change spend date" style="background:rgba(244,63,94,0.12); color:#fecdd3; border-color:rgba(244,63,94,0.3); font-size:0.62rem; padding:1px 5px; cursor:pointer;">📅 ${dateLabel}</span>
                    <span class="badge badge-rose" style="font-size:0.62rem; padding:1px 5px;">${s.category || 'Spend'}</span>
                    <span style="font-size:0.75rem; color:#fff; font-weight:600; cursor:pointer;" onclick="promptRenameSpend('${s.id}')" title="Click to edit spend description">${s.title} <span style="font-size:0.65rem; color:var(--text-muted);">✎</span></span>
                </div>
                <button onclick="deleteSpend('${s.id}')" title="Delete Spend" style="background:none; border:none; color:var(--rose); cursor:pointer; font-size:1.1rem; line-height:1; padding:0 4px;">
                    &times;
                </button>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 2px 0;">
                <span style="font-size:0.68rem; color:var(--text-muted);">Logged Outflow:</span>
                <strong style="color:var(--rose); font-size:0.85rem; cursor:pointer;" onclick="promptEditSpendAmount('${s.id}')" title="Click to edit spend amount">-₹${(s.amount || 0).toLocaleString('en-IN')} ✎</strong>
            </div>
        `;
        container.appendChild(row);
    });
}

window.updateCustomIncomeAmount = function(id, valStr) {
    const cur = state.months[state.activeMonth];
    if (!cur || !cur.customIncomes) return;
    const item = cur.customIncomes.find(i => i.id === id);
    if (item) {
        item.amount = parseFloat(valStr) || 0;
        syncCustomIncomeToScheduled(item);
        saveState();
        updateDashboard();
    }
};

window.updateCustomExpenseAmount = function(id, valStr) {
    const cur = state.months[state.activeMonth];
    if (!cur || !cur.customExpenses) return;
    const item = cur.customExpenses.find(i => i.id === id);
    if (item) {
        item.amount = parseFloat(valStr) || 0;
        
        // Sync corresponding checklist task if present for the active month
        const task = state.tasks.find(t => t.expenseKey === id && t.date && t.date.startsWith(state.activeMonth));
        if (task) {
            task.amount = item.amount;
        }

        saveState();
        updateDashboard();
    }
};

window.promptRenameCustomIncome = async function(id) {
    const cur = state.months[state.activeMonth];
    if (!cur || !cur.customIncomes) return;
    const item = cur.customIncomes.find(i => i.id === id);
    if (!item) return;

    const newName = await showPromptDialog({
        title: "Rename Income Source",
        message: "Enter the new name for this income source:",
        defaultValue: item.title,
        confirmText: "Update Name",
        type: "primary"
    });
    if (newName && newName.trim()) {
        item.title = newName.trim();
        syncCustomIncomeToScheduled(item);
        saveState();
        updateDashboard();
        showToast('Income source renamed', 'success');
    }
};

window.deleteCustomIncome = async function(id) {
    const cur = state.months[state.activeMonth];
    if (!cur || !cur.customIncomes) return;
    const item = cur.customIncomes.find(i => i.id === id);
    const title = item ? item.title : 'income source';

    const confirmed = await showConfirmDialog({
        title: `Delete "${title}"?`,
        message: `Are you sure you want to remove this income source from ${getFullMonthYearLabel(state.activeMonth)}?`,
        confirmText: "Delete Income",
        type: "danger"
    });
    if (confirmed) {
        cur.customIncomes = cur.customIncomes.filter(i => i.id !== id);
        removeScheduledIncomeByKey(id);
        saveState();
        updateDashboard();
        showToast(`Deleted income "${title}"`, 'info');
    }
};

window.promptRenameCustomExpense = async function(id) {
    const cur = state.months[state.activeMonth];
    if (!cur || !cur.customExpenses) return;
    const item = cur.customExpenses.find(i => i.id === id);
    if (!item) return;

    const newName = await showPromptDialog({
        title: "Rename Expense Item",
        message: "Enter the new name for this expense:",
        defaultValue: item.title,
        confirmText: "Update Name",
        type: "primary"
    });
    if (newName && newName.trim()) {
        item.title = newName.trim();
        const task = state.tasks.find(t => t.expenseKey === id && t.date && t.date.startsWith(state.activeMonth));
        if (task) task.title = `Pay ${item.title}`;
        saveState();
        updateDashboard();
        showToast('Expense renamed', 'success');
    }
};

window.deleteCustomExpense = async function(id) {
    const cur = state.months[state.activeMonth];
    if (!cur || !cur.customExpenses) return;
    const item = cur.customExpenses.find(i => i.id === id);
    const title = item ? item.title : 'expense item';

    const confirmed = await showConfirmDialog({
        title: `Delete "${title}"?`,
        message: `Are you sure you want to remove this expense item from ${getFullMonthYearLabel(state.activeMonth)}?`,
        confirmText: "Delete Expense",
        type: "danger"
    });
    if (confirmed) {
        cur.customExpenses = cur.customExpenses.filter(i => i.id !== id);
        state.tasks = state.tasks.filter(t => !(t.expenseKey === id && t.date && t.date.startsWith(state.activeMonth)));
        saveState();
        updateDashboard();
        showToast(`Deleted "${title}"`, 'info');
    }
};

// =============================================================
// 7. BIDIRECTIONAL SYNC & BUDGET LOGIC
// =============================================================
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
            syncIncomeToScheduled(incKey, val);
        } else {
            const expKey = key === 'home-wifi' ? 'homeWifi' : 
                           key === 'slice-emi' ? 'sliceEmi' : key;
            cur.expenses[expKey] = val;
            syncExpenseToTaskAmount(expKey, val);
        }
    }
    saveState();
}

function syncExpenseToTaskAmount(expKey, val) {
    const cur = state.months[state.activeMonth];
    if (!cur) return;

    let targetKey = expKey;
    if (expKey === 'rent' || expKey === 'maintenance') {
        targetKey = 'rent_maint';
    }

    const task = state.tasks.find(t => t.date && t.date.startsWith(state.activeMonth) && t.expenseKey === targetKey);
    if (task) {
        if (targetKey === 'rent_maint') {
            task.amount = (cur.expenses.rent || 0) + (cur.expenses.maintenance || 0);
            task.title = `Pay House Rent (${cur.expenses.rent || 0} Rent + ${cur.expenses.maintenance || 0} Maint)`;
        } else {
            task.amount = val;
        }
    } else {
        let title = '';
        let amount = val;
        let isMandatory = true;
        
        if (targetKey === 'rent_maint') {
            title = `Pay House Rent (${cur.expenses.rent || 0} Rent + ${cur.expenses.maintenance || 0} Maint)`;
            amount = (cur.expenses.rent || 0) + (cur.expenses.maintenance || 0);
        } else if (targetKey === 'utilities') {
            title = 'Utilities (Current + Water)';
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

// -------------------------------------------------------------
// BIDIRECTIONAL INCOME SYNC: TOP-DOWN & DOWN-TO-TOP
// -------------------------------------------------------------
function syncIncomeToScheduled(incomeKey, val) {
    if (!state.scheduledIncomes) state.scheduledIncomes = [];

    let inc = state.scheduledIncomes.find(i => 
        i.date && i.date.startsWith(state.activeMonth) && 
        (i.incomeKey === incomeKey || 
         (incomeKey === 'primary' && (i.title.toLowerCase().includes('salary') || i.category === 'Salary')) ||
         (incomeKey === 'side' && (i.title.toLowerCase().includes('side') || i.category === 'Side Gig')) ||
         (incomeKey === 'bonus' && (i.title.toLowerCase().includes('bonus') || i.category === 'Bonus')))
    );

    if (inc) {
        inc.incomeKey = incomeKey;
        inc.amount = val;
    } else if (val > 0) {
        let title = 'Primary Salary';
        let defaultDay = '01';
        let cat = 'Salary';
        if (incomeKey === 'side') { title = 'Side Income Payout'; defaultDay = '10'; cat = 'Side Gig'; }
        if (incomeKey === 'bonus') { title = 'Performance Bonus'; defaultDay = '20'; cat = 'Bonus'; }

        state.scheduledIncomes.push({
            id: 'inc_' + incomeKey + '_' + state.activeMonth + '_' + Math.random().toString(36).substring(2, 6),
            incomeKey: incomeKey,
            title: title,
            date: `${state.activeMonth}-${defaultDay}`,
            amount: val,
            category: cat,
            received: false
        });
    }
}

function syncCustomIncomeToScheduled(item) {
    if (!state.scheduledIncomes) state.scheduledIncomes = [];
    let inc = state.scheduledIncomes.find(i => 
        i.date && i.date.startsWith(state.activeMonth) && (i.id === item.id || i.incomeKey === item.id)
    );

    if (inc) {
        inc.title = item.title;
        inc.amount = item.amount;
    } else if (item.amount > 0) {
        state.scheduledIncomes.push({
            id: item.id,
            incomeKey: item.id,
            title: item.title,
            date: `${state.activeMonth}-01`,
            amount: item.amount,
            category: 'Other',
            received: false
        });
    }
}

function removeScheduledIncomeByKey(keyOrId) {
    if (!state.scheduledIncomes) return;
    state.scheduledIncomes = state.scheduledIncomes.filter(i => 
        !(i.date && i.date.startsWith(state.activeMonth) && (i.id === keyOrId || i.incomeKey === keyOrId))
    );
}

function syncScheduledIncomeToBudget(inc) {
    const cur = state.months ? state.months[state.activeMonth] : null;
    if (!cur) return;
    if (!cur.income) cur.income = { primary: 0, side: 0, bonus: 0 };
    if (!cur.customIncomes) cur.customIncomes = [];

    const lowTitle = (inc.title || '').toLowerCase();
    if (inc.incomeKey === 'primary' || lowTitle === 'primary salary' || (lowTitle.includes('salary') && inc.category === 'Salary')) {
        inc.incomeKey = 'primary';
        cur.income.primary = inc.amount;
        const el = document.getElementById('input-income-primary');
        if (el) el.value = inc.amount;
    } else if (inc.incomeKey === 'side' || lowTitle === 'side income' || lowTitle === 'side income payout') {
        inc.incomeKey = 'side';
        cur.income.side = inc.amount;
        const el = document.getElementById('input-income-side');
        if (el) el.value = inc.amount;
    } else if (inc.incomeKey === 'bonus' || lowTitle === 'performance bonus' || lowTitle === 'bonus') {
        inc.incomeKey = 'bonus';
        cur.income.bonus = inc.amount;
        const el = document.getElementById('input-income-bonus');
        if (el) el.value = inc.amount;
    } else {
        inc.incomeKey = inc.id;
        const existing = cur.customIncomes.find(ci => ci.id === inc.id);
        if (existing) {
            existing.title = inc.title;
            existing.amount = inc.amount;
        } else {
            cur.customIncomes.push({
                id: inc.id,
                title: inc.title,
                amount: inc.amount
            });
        }
    }
}

function reconcileIncomes() {
    const cur = state.months ? state.months[state.activeMonth] : null;
    if (!cur) return;
    if (!cur.income) cur.income = { primary: 0, side: 0, bonus: 0 };
    if (!cur.customIncomes) cur.customIncomes = [];
    if (!state.scheduledIncomes) state.scheduledIncomes = [];

    const monthIncomes = state.scheduledIncomes.filter(i => i.date && i.date.startsWith(state.activeMonth));

    monthIncomes.forEach(inc => {
        const lowTitle = (inc.title || '').toLowerCase();
        if (inc.incomeKey === 'primary' || lowTitle === 'primary salary') {
            inc.incomeKey = 'primary';
            cur.income.primary = inc.amount;
        } else if (inc.incomeKey === 'side' || lowTitle === 'side income' || lowTitle === 'side income payout') {
            inc.incomeKey = 'side';
            cur.income.side = inc.amount;
        } else if (inc.incomeKey === 'bonus' || lowTitle === 'performance bonus' || lowTitle === 'bonus') {
            inc.incomeKey = 'bonus';
            cur.income.bonus = inc.amount;
        } else {
            inc.incomeKey = inc.id;
            const existingCustom = cur.customIncomes.find(ci => ci.id === inc.id);
            if (existingCustom) {
                existingCustom.title = inc.title;
                existingCustom.amount = inc.amount;
            } else {
                cur.customIncomes.push({
                    id: inc.id,
                    title: inc.title,
                    amount: inc.amount
                });
            }
        }
    });

    // Reverse sync: any customIncomes in cur.customIncomes that aren't on the calendar yet for this active month
    cur.customIncomes.forEach(ci => {
        const hasCal = monthIncomes.some(i => i.id === ci.id || i.incomeKey === ci.id);
        if (!hasCal && ci.amount > 0) {
            state.scheduledIncomes.push({
                id: ci.id,
                incomeKey: ci.id,
                title: ci.title,
                amount: ci.amount,
                date: `${state.activeMonth}-01`,
                category: 'Other',
                received: false
            });
        }
    });
}

// =============================================================
// 8. DASHBOARD RENDERING & ANALYTICS
// =============================================================
function updateDashboard() {
    const cur = state.months[state.activeMonth];
    if (!cur) return;

    // Ensure calendarSelectedDate aligns with state.activeMonth
    const [actYear, actMonth] = state.activeMonth.split('-');
    if (!calendarSelectedDate || 
        calendarSelectedDate.getFullYear() !== parseInt(actYear, 10) || 
        calendarSelectedDate.getMonth() !== parseInt(actMonth, 10) - 1) {
        calendarSelectedDate = new Date(parseInt(actYear, 10), parseInt(actMonth, 10) - 1, 1);
        if (state.activeMonth === "2026-08") calendarSelectedDate = new Date(2026, 7, 9);
    }

    renderMonthTabs();

    // Ensure bidirectional sync between Calendar Incomes and Budget Planner
    reconcileIncomes();
    renderCustomBudgetItems();

    // Theme coloration
    const dashboardContainer = document.getElementById('active-month-dashboard');
    if (dashboardContainer) {
        dashboardContainer.className = '';
        const monthNum = parseInt(state.activeMonth.split('-')[1], 10);
        const themes = ['theme-cyan', 'theme-indigo', 'theme-purple', 'theme-emerald', 'theme-amber', 'theme-rose'];
        const activeTheme = themes[(monthNum - 1) % themes.length];
        dashboardContainer.classList.add(activeTheme);
    }

    // Spends totals
    let spendsTotal = 0;
    (state.spends || []).forEach(s => {
        if (s.date && s.date.startsWith(state.activeMonth)) {
            spendsTotal += (s.amount || 0);
        }
    });
    const subtotalDaily = document.getElementById('subtotal-daily-spends');
    if (subtotalDaily) subtotalDaily.innerText = formatCurrency(spendsTotal);

    // Custom Incomes & Expenses Math
    let customIncomesTotal = 0;
    (cur.customIncomes || []).forEach(ci => {
        customIncomesTotal += (ci.amount || 0);
    });

    let customEssentialsTotal = 0;
    let customWantsTotal = 0;
    let customSavingsTotal = 0;
    (cur.customExpenses || []).forEach(ce => {
        const amt = ce.amount || 0;
        if (ce.category === 'wants') customWantsTotal += amt;
        else if (ce.category === 'savings') customSavingsTotal += amt;
        else customEssentialsTotal += amt;
    });
    const customExpensesTotal = customEssentialsTotal + customWantsTotal + customSavingsTotal;
    setTxt('subtotal-custom-expenses', formatCurrency(customExpensesTotal));

    // Totals
    const incomeTotal = (cur.income.primary || 0) + (cur.income.side || 0) + (cur.income.bonus || 0) + customIncomesTotal;
    const essentialsTotal = (cur.expenses.rent || 0) + (cur.expenses.maintenance || 0) + (cur.expenses.utilities || 0) + 
                           (cur.expenses.wifi || 0) + (cur.expenses.homeWifi || 0) + (cur.expenses.phone || 0) + (cur.expenses.kalpana || 0) + customEssentialsTotal;
    const wantsTotal = (cur.expenses.meesho || 0) + customWantsTotal;
    const duesTotal = (cur.expenses.sliceEmi || 0);
    const expensesTotal = essentialsTotal + wantsTotal + duesTotal;
    const remainingTotal = incomeTotal - expensesTotal - spendsTotal;

    let debtsTotal = 0;
    (state.debts || []).forEach(d => { debtsTotal += (d.amount || 0); });

    // Subtotal Badges
    const rentBillsTotal = (cur.expenses.rent || 0) + (cur.expenses.maintenance || 0) + (cur.expenses.utilities || 0);
    const wifiRechargesTotal = (cur.expenses.wifi || 0) + (cur.expenses.homeWifi || 0) + (cur.expenses.phone || 0);

    setTxt('subtotal-income', formatCurrency(incomeTotal));
    setTxt('subtotal-core', formatCurrency(essentialsTotal - customEssentialsTotal));
    setTxt('subtotal-discretionary', formatCurrency(wantsTotal + duesTotal - customWantsTotal));
    setTxt('subtotal-rent-bills', formatCurrency(rentBillsTotal));
    setTxt('subtotal-wifi-recharges', formatCurrency(wifiRechargesTotal));

    // Top Header Metrics
    const labelMonthName = getFullMonthYearLabel(state.activeMonth);
    setTxt('current-date', labelMonthName);
    setTxt('lbl-top-income', `${labelMonthName} Income`);
    setTxt('lbl-top-expenses', `${labelMonthName} Outflow`);
    setTxt('lbl-top-savings', `Net ${labelMonthName} Savings`);

    setTxt('val-total-income', formatCurrency(incomeTotal));
    setTxt('val-total-expenses', formatCurrency(expensesTotal + spendsTotal));

    const topSavingsVal = document.getElementById('val-remaining-savings');
    if (topSavingsVal) {
        topSavingsVal.innerText = formatCurrency(remainingTotal);
        topSavingsVal.style.color = remainingTotal < 0 ? 'var(--rose)' : 'var(--emerald)';
    }

    setTxt('val-total-debt', formatCurrency(debtsTotal));
    setTxt('summary-total-debt', formatCurrency(debtsTotal));

    // Budget Planner Card
    setTxt('budget-card-title', `${labelMonthName} Budget Planner`);
    setTxt('allocation-chart-title', `${labelMonthName} Share Allocation`);
    setTxt('budget-total-income', formatCurrency(incomeTotal));
    setTxt('budget-total-expenses', formatCurrency(expensesTotal + spendsTotal));

    const budgetRemaining = document.getElementById('budget-remaining-savings');
    if (budgetRemaining) {
        budgetRemaining.innerText = formatCurrency(remainingTotal);
        budgetRemaining.style.color = remainingTotal < 0 ? 'var(--rose)' : 'var(--emerald)';
    }

    // Allocation Pie Chart
    updateBudgetChart(essentialsTotal, wantsTotal + duesTotal + spendsTotal, remainingTotal, incomeTotal);

    // Calendar & Day Events
    setTxt('calendar-card-title', `${labelMonthName} Calendar`);
    setTxt('calendar-month-year', labelMonthName);
    renderCalendarGrid();
    renderDayEventsList();

    // Checklist
    setTxt('checklist-card-title', `${labelMonthName} Checklist`);
    renderChecklistDues();

    // Cash Planner
    const cash = cur.cashInHand || 0;
    const activeExpenses = expensesTotal + spendsTotal;
    const needed = Math.max(0, activeExpenses - cash);
    const surplus = Math.max(0, cash - activeExpenses);

    setTxt('val-planner-expenses', formatCurrency(activeExpenses));
    const valNeeded = document.getElementById('val-planner-needed');
    if (valNeeded) {
        valNeeded.innerText = formatCurrency(needed);
        valNeeded.style.color = needed > 0 ? 'var(--rose)' : 'var(--emerald)';
    }
    setTxt('val-planner-surplus', formatCurrency(surplus));

    // Multi-Month Trends Chart
    renderTrendChart();

    // Debts
    renderDebtsList();
}

function setTxt(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

// =============================================================
// 9. MONTH TABS & MONTH MANAGEMENT
// =============================================================
function renderMonthTabs() {
    const switcher = document.getElementById('global-month-switcher');
    if (!switcher) return;
    switcher.innerHTML = '';

    const keys = Object.keys(state.months).sort();
    keys.forEach(k => {
        const btnWrapper = document.createElement('div');
        btnWrapper.className = 'tab-wrapper';
        btnWrapper.style.display = 'inline-flex';
        btnWrapper.style.alignItems = 'center';

        const btn = document.createElement('button');
        btn.className = `tab-btn ${state.activeMonth === k ? 'active' : ''}`;
        btn.innerText = getShortMonthYearLabel(k);
        btn.addEventListener('click', () => {
            state.activeMonth = k;
            const [yyyy, mm] = k.split('-');
            calendarSelectedDate = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, 1);
            if (k === "2026-08") calendarSelectedDate = new Date(2026, 7, 9);
            saveState();
            syncInputsToActiveMonth();
            updateDashboard();
        });

        btnWrapper.appendChild(btn);

        if (keys.length > 1 && k !== '2026-08') {
            const delBtn = document.createElement('button');
            delBtn.className = 'tab-del-btn';
            delBtn.title = `Delete ${getFullMonthYearLabel(k)}`;
            delBtn.innerHTML = '&times;';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteMonth(k);
            });
            btnWrapper.appendChild(delBtn);
        }

        switcher.appendChild(btnWrapper);
    });
}

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
    const latestMonth = state.months[latestKey];

    // Clone custom items with fresh unique IDs
    const newCustomIncomes = (latestMonth.customIncomes || []).map(ci => ({
        id: 'inc_c_' + newKey.replace('-', '_') + '_' + Math.random().toString(36).substring(2, 7),
        title: ci.title,
        amount: ci.amount
    }));

    const newCustomExpenses = (latestMonth.customExpenses || []).map(ce => ({
        id: 'exp_c_' + newKey.replace('-', '_') + '_' + Math.random().toString(36).substring(2, 7),
        title: ce.title,
        amount: ce.amount,
        category: ce.category
    }));

    state.months[newKey] = {
        income: {
            primary: latestMonth.income.primary || 15000,
            side: latestMonth.income.side || 10000,
            bonus: 0
        },
        customIncomes: newCustomIncomes,
        expenses: {
            rent: latestMonth.expenses.rent || 9000,
            maintenance: latestMonth.expenses.maintenance || 1000,
            utilities: latestMonth.expenses.utilities || 1000,
            wifi: latestMonth.expenses.wifi || 450,
            homeWifi: latestMonth.expenses.homeWifi || 700,
            phone: latestMonth.expenses.phone || 1000,
            meesho: latestMonth.expenses.meesho || 0,
            sliceEmi: latestMonth.expenses.sliceEmi || 295,
            kalpana: latestMonth.expenses.kalpana || 10000
        },
        customExpenses: newCustomExpenses,
        cashInHand: 0
    };

    const defaultTasks = [
        { id: `t1_${newKey}`, title: `Pay House Rent (${state.months[newKey].expenses.rent} Rent + ${state.months[newKey].expenses.maintenance} Maint)`, date: `${newKey}-01`, amount: (state.months[newKey].expenses.rent + state.months[newKey].expenses.maintenance), category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'rent_maint' },
        { id: `tu_${newKey}`, title: 'Utilities (Current + Water)', date: `${newKey}-05`, amount: state.months[newKey].expenses.utilities, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'utilities' },
        { id: `t2_${newKey}`, title: 'Personal Wi-Fi Recharge', date: `${newKey}-05`, amount: state.months[newKey].expenses.wifi, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'wifi' },
        { id: `t3_${newKey}`, title: 'Home Wi-Fi Recharge', date: `${newKey}-05`, amount: state.months[newKey].expenses.homeWifi, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'homeWifi' },
        { id: `t4_${newKey}`, title: 'Phone Recharge & Data Pack', date: `${newKey}-10`, amount: state.months[newKey].expenses.phone, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'phone' },
        { id: `t5_${newKey}`, title: 'Slice Monthly Minimum EMI', date: `${newKey}-03`, amount: state.months[newKey].expenses.sliceEmi, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'sliceEmi' },
        { id: `t7_${newKey}`, title: 'Pay Wife Kalpana (Monthly Allowance)', date: `${newKey}-01`, amount: state.months[newKey].expenses.kalpana, category: 'bill', completed: false, isCore: true, isMandatory: true, expenseKey: 'kalpana' }
    ];
    
    if (state.months[newKey].expenses.meesho > 0) {
        defaultTasks.push({ id: `t6_${newKey}`, title: 'Meesho Shopping Budget Limit', date: `${newKey}-15`, amount: state.months[newKey].expenses.meesho, category: 'bill', completed: false, isCore: true, isMandatory: false, expenseKey: 'meesho' });
    }

    // Add cloned custom expenses as tasks if amount > 0
    newCustomExpenses.forEach(ce => {
        if (ce.amount > 0) {
            defaultTasks.push({
                id: 'task_' + ce.id,
                title: `Pay ${ce.title}`,
                date: `${newKey}-05`,
                amount: ce.amount,
                category: 'bill',
                completed: false,
                isCore: false,
                isMandatory: ce.category === 'essentials',
                expenseKey: ce.id
            });
        }
    });

    state.tasks.push(...defaultTasks);

    if (!state.scheduledIncomes) state.scheduledIncomes = [];
    state.scheduledIncomes.push(
        { id: `inc_1_${newKey}`, incomeKey: 'primary', title: 'Primary Salary', date: `${newKey}-01`, amount: state.months[newKey].income.primary || 15000, category: 'Salary', received: false },
        { id: `inc_2_${newKey}`, incomeKey: 'side', title: 'Side Income Payout', date: `${newKey}-10`, amount: state.months[newKey].income.side || 10000, category: 'Side Gig', received: false }
    );

    newCustomIncomes.forEach(ci => {
        if (ci.amount > 0) {
            state.scheduledIncomes.push({
                id: ci.id,
                incomeKey: ci.id,
                title: ci.title,
                amount: ci.amount,
                date: `${newKey}-01`,
                category: 'Other',
                received: false
            });
        }
    });

    state.activeMonth = newKey;
    calendarSelectedDate = new Date(year, month - 1, 1);

    saveState();
    syncInputsToActiveMonth();
    updateDashboard();
    showToast(`Added month: ${getFullMonthYearLabel(newKey)}`, 'success');
}

async function deleteMonth(monthKey) {
    if (Object.keys(state.months).length <= 1) {
        await showAlertDialog({
            title: "Action Not Allowed",
            message: "You cannot delete the only remaining active month.",
            type: "amber"
        });
        return;
    }

    const label = getFullMonthYearLabel(monthKey);
    const confirmed = await showConfirmDialog({
        title: `Delete ${label}?`,
        message: `Are you sure you want to remove the entire monthly budget plan, tasks, and records for ${label}?`,
        confirmText: "Delete Month",
        type: "danger"
    });
    if (!confirmed) return;

    delete state.months[monthKey];
    state.tasks = (state.tasks || []).filter(t => !t.date || !t.date.startsWith(monthKey));
    state.spends = (state.spends || []).filter(s => !s.date || !s.date.startsWith(monthKey));
    if (state.scheduledIncomes) {
        state.scheduledIncomes = state.scheduledIncomes.filter(i => !i.date || !i.date.startsWith(monthKey));
    }

    if (state.activeMonth === monthKey) {
        state.activeMonth = Object.keys(state.months)[0];
        const [year, month] = state.activeMonth.split('-');
        calendarSelectedDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    }

    saveState();
    syncInputsToActiveMonth();
    updateDashboard();
    showToast(`Deleted month: ${label}`, 'info');
}

// =============================================================
// 10. EXPANDED DEBTS & LOANS MANAGEMENT
// =============================================================
function renderDebtsList() {
    const container = document.getElementById('debts-list-container');
    if (!container) return;
    container.innerHTML = '';

    if (!state.debts || state.debts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); font-size: 0.75rem; padding: 12px 0;">
                No loans recorded. Click "+ Add Loan" above to add one!
            </div>
        `;
        return;
    }

    state.debts.forEach((debt) => {
        const item = document.createElement('div');
        item.className = 'debt-card-row';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span class="debt-title-label" title="Click to rename" onclick="promptRenameDebt('${debt.id}')" style="cursor: pointer; font-size: 0.76rem; font-weight: 600; color: #fff;">
                        ${debt.title} <span style="font-size: 0.65rem; color: var(--text-muted);">✎</span>
                    </span>
                    ${debt.category ? `<span class="badge badge-rose" style="font-size: 0.62rem; padding: 1px 5px;">${debt.category}</span>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <button onclick="promptRepayDebt('${debt.id}')" class="btn-pay-sm" title="Log a partial payment towards this loan">Pay</button>
                    <button onclick="deleteDebt('${debt.id}')" title="Delete this loan" class="btn-icon-delete">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
            <div class="input-wrapper">
                <span class="input-currency">₹</span>
                <input type="number" value="${debt.amount}" data-debt-id="${debt.id}" class="input-debt-amount">
            </div>
        `;
        container.appendChild(item);
    });

    container.querySelectorAll('.input-debt-amount').forEach(input => {
        input.addEventListener('input', (e) => {
            const debtId = e.target.dataset.debtId;
            const val = parseFloat(e.target.value) || 0;
            const targetDebt = state.debts.find(d => d.id === debtId);
            if (targetDebt) {
                targetDebt.amount = val;
                saveState();
                updateDashboard();
            }
        });
    });
}

// Full Loans & Debts Manager Modal
function openDebtsManagerModal() {
    const modal = document.getElementById('debts-manager-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    renderDebtsManagerModal();
}

function closeDebtsManagerModal() {
    const modal = document.getElementById('debts-manager-modal');
    if (modal) modal.style.display = 'none';
}

function renderDebtsManagerModal() {
    const tbody = document.getElementById('debts-manager-tbody');
    const totalEl = document.getElementById('debts-manager-total-val');
    if (!tbody) return;

    tbody.innerHTML = '';
    let total = 0;

    if (!state.debts || state.debts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:18px;">No outstanding loans recorded. Use the form below to add a loan.</td></tr>';
    } else {
        state.debts.forEach(debt => {
            total += (debt.amount || 0);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:600; color:#fff;">
                    ${debt.title}
                </td>
                <td style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05);">
                    <span class="badge badge-rose" style="font-size:0.68rem;">${debt.category || 'Loan'}</span>
                </td>
                <td style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); text-align:right; font-weight:700; color:var(--rose); font-size:0.95rem;">
                    ₹${(debt.amount || 0).toLocaleString('en-IN')}
                </td>
                <td style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); text-align:center;">
                    <button onclick="promptRepayDebt('${debt.id}')" class="btn btn-secondary" style="font-size:0.7rem; padding:0.25rem 0.6rem; border-radius:6px;">- Pay Amount</button>
                    <button onclick="promptRenameDebt('${debt.id}')" class="btn btn-secondary" style="font-size:0.7rem; padding:0.25rem 0.6rem; border-radius:6px; margin-left:4px;">Rename</button>
                </td>
                <td style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); text-align:center;">
                    <button onclick="deleteDebt('${debt.id}')" title="Delete this loan" style="background:none; border:none; color:var(--rose); cursor:pointer; font-size:1.1rem;">
                        &times;
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    if (totalEl) totalEl.innerText = `₹${total.toLocaleString('en-IN')}`;
}

window.promptRenameDebt = async function(debtId) {
    const debt = state.debts.find(d => d.id === debtId);
    if (!debt) return;
    const newName = await showPromptDialog({
        title: "Rename Loan",
        message: "Enter a new description or lender name for this loan:",
        defaultValue: debt.title,
        confirmText: "Update Name",
        type: "primary"
    });
    if (newName && newName.trim()) {
        debt.title = newName.trim();
        saveState();
        updateDashboard();
        renderDebtsManagerModal();
        showToast('Loan renamed successfully', 'success');
    }
};

window.promptRepayDebt = async function(debtId) {
    const debt = state.debts.find(d => d.id === debtId);
    if (!debt) return;
    const payStr = await showPromptDialog({
        title: `Repay "${debt.title}"`,
        message: `Current outstanding balance: ${formatCurrency(debt.amount)}. Enter repayment amount:`,
        placeholder: "0",
        inputType: "number",
        isCurrency: true,
        confirmText: "Record Payment",
        type: "emerald"
    });
    if (!payStr) return;
    const payAmt = parseFloat(payStr) || 0;
    if (payAmt <= 0) {
        showToast("Please enter a payment amount greater than 0", "error");
        return;
    }

    debt.amount = Math.max(0, debt.amount - payAmt);
    saveState();
    updateDashboard();
    renderDebtsManagerModal();
    showToast(`Recorded repayment of ₹${payAmt.toLocaleString('en-IN')}. New balance: ${formatCurrency(debt.amount)}`, 'success');
};

window.deleteDebt = async function(debtId) {
    const debt = state.debts.find(d => d.id === debtId);
    const title = debt ? debt.title : 'this loan';
    const confirmed = await showConfirmDialog({
        title: `Delete "${title}"?`,
        message: `Are you sure you want to permanently delete this loan record from your finances?`,
        confirmText: "Delete Loan",
        type: "danger"
    });
    if (confirmed) {
        state.debts = state.debts.filter(d => d.id !== debtId);
        saveState();
        updateDashboard();
        renderDebtsManagerModal();
        showToast(`Deleted "${title}"`, 'info');
    }
};

// =============================================================
// 11. CHARTS & VISUALIZATIONS
// =============================================================
function updateBudgetChart(essentials, wants, savings, total) {
    const segEssentials = document.getElementById('chart-segment-essentials');
    const segWants = document.getElementById('chart-segment-wants');
    const segSavings = document.getElementById('chart-segment-savings');
    if (!segEssentials || !segWants || !segSavings) return;

    if (total <= 0) {
        setTxt('lbl-pct-essentials', '0%');
        setTxt('lbl-pct-wants', '0%');
        setTxt('lbl-pct-savings', '0%');
        setTxt('chart-percentage', '0%');
        segEssentials.setAttribute('stroke-dasharray', '0 100');
        segWants.setAttribute('stroke-dasharray', '0 100');
        segSavings.setAttribute('stroke-dasharray', '0 100');
        return;
    }

    const essPct = Math.min(100, Math.max(0, Math.round((essentials / total) * 100)));
    const wantsPct = Math.min(100 - essPct, Math.max(0, Math.round((wants / total) * 100)));
    const savPct = Math.max(0, 100 - essPct - wantsPct);

    setTxt('lbl-pct-essentials', `${essPct}%`);
    setTxt('lbl-pct-wants', `${wantsPct}%`);
    setTxt('lbl-pct-savings', `${savPct}%`);
    setTxt('chart-percentage', `${savPct}%`);

    segEssentials.setAttribute('stroke-dasharray', `${essPct} 100`);
    segWants.setAttribute('stroke-dasharray', `${wantsPct} 100`);
    segWants.setAttribute('stroke-dashoffset', `${-essPct}`);
    segSavings.setAttribute('stroke-dasharray', `${savPct} 100`);
    segSavings.setAttribute('stroke-dashoffset', `${-(essPct + wantsPct)}`);
}

function renderTrendChart() {
    const container = document.getElementById('trend-chart-container');
    if (!container) return;

    const keys = Object.keys(state.months).sort();
    const datasets = keys.map(k => {
        const cur = state.months[k];
        
        let customIncomesTotal = 0;
        (cur.customIncomes || []).forEach(ci => { customIncomesTotal += (ci.amount || 0); });

        let customExpTotal = 0;
        (cur.customExpenses || []).forEach(ce => { customExpTotal += (ce.amount || 0); });

        const incomeTotal = (cur.income.primary || 0) + (cur.income.side || 0) + (cur.income.bonus || 0) + customIncomesTotal;
        
        let spendsTotal = 0;
        (state.spends || []).forEach(s => {
            if (s.date && s.date.startsWith(k)) spendsTotal += (s.amount || 0);
        });

        const essentials = (cur.expenses.rent || 0) + (cur.expenses.maintenance || 0) + (cur.expenses.utilities || 0) + 
                           (cur.expenses.wifi || 0) + (cur.expenses.homeWifi || 0) + (cur.expenses.phone || 0) + (cur.expenses.kalpana || 0);
        const wants = (cur.expenses.meesho || 0);
        const dues = (cur.expenses.sliceEmi || 0);
        const outflowTotal = essentials + wants + dues + customExpTotal + spendsTotal;
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

    const width = 600;
    const height = 180;
    const chartLeft = 60;
    const chartRight = 580;
    const chartTop = 15;
    const chartBottom = 150;
    const chartHeight = chartBottom - chartTop;

    let svgHtml = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    const gridPcts = [0.25, 0.50, 0.75, 1.00];
    gridPcts.forEach(pct => {
        const yPos = chartBottom - (pct * chartHeight);
        const gridVal = Math.round(maxVal * pct);
        svgHtml += `
            <line class="chart-grid-line" x1="${chartLeft}" y1="${yPos}" x2="${chartRight}" y2="${yPos}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3"></line>
            <text x="5" y="${yPos + 3}" fill="rgba(255,255,255,0.35)" font-size="8.5" font-family="'Outfit', sans-serif">₹${gridVal.toLocaleString('en-IN')}</text>
        `;
    });

    svgHtml += `
        <line class="chart-axis-line" x1="${chartLeft}" y1="${chartTop}" x2="${chartLeft}" y2="${chartBottom}" stroke="rgba(255,255,255,0.15)"></line>
        <line class="chart-axis-line" x1="${chartLeft}" y1="${chartBottom}" x2="${chartRight}" y2="${chartBottom}" stroke="rgba(255,255,255,0.15)"></line>
    `;

    const numColumns = datasets.length;
    const spacing = (chartRight - chartLeft) / numColumns;

    datasets.forEach((d, i) => {
        const center = chartLeft + i * spacing + spacing / 2;
        const scale = chartHeight / maxVal;
        
        const hIncome = Math.max(2, d.income * scale);
        const hOutflow = Math.max(2, d.outflow * scale);
        const hSavings = Math.max(2, d.savings * scale);

        const monthNum = parseInt(d.key.split('-')[1], 10);
        const themes = ['#06b6d4', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];
        const monthColor = themes[(monthNum - 1) % themes.length];
        const barWidth = Math.min(14, spacing / 4);

        svgHtml += `
            <!-- Income Bar -->
            <rect class="trend-bar" x="${center - barWidth * 1.5 - 2}" y="${chartBottom - hIncome}" width="${barWidth}" height="${hIncome}" rx="3" fill="#10b981">
                <title>Total Income (${d.label}): ₹${Math.round(d.income).toLocaleString('en-IN')}</title>
            </rect>
            
            <!-- Outflow Bar -->
            <rect class="trend-bar" x="${center - barWidth / 2}" y="${chartBottom - hOutflow}" width="${barWidth}" height="${hOutflow}" rx="3" fill="#f43f5e">
                <title>Total Outflow (${d.label}): ₹${Math.round(d.outflow).toLocaleString('en-IN')}</title>
            </rect>
            
            <!-- Savings Bar -->
            <rect class="trend-bar" x="${center + barWidth / 2 + 2}" y="${chartBottom - hSavings}" width="${barWidth}" height="${hSavings}" rx="3" fill="${monthColor}">
                <title>Net Savings (${d.label}): ₹${Math.round(d.savings).toLocaleString('en-IN')}</title>
            </rect>
            
            <!-- Label -->
            <text x="${center}" y="${chartBottom + 18}" fill="${state.activeMonth === d.key ? '#fff' : 'rgba(255,255,255,0.5)'}" font-size="9.5" text-anchor="middle" font-family="'Outfit', sans-serif" font-weight="${state.activeMonth === d.key ? '700' : '500'}">${d.label}</text>
        `;
    });

    svgHtml += `</svg>`;
    container.innerHTML = svgHtml;
}

// =============================================================
// 12. CALENDAR & SPENDS
// =============================================================
function syncCalendarFormDates() {
    if (!calendarSelectedDate) return;
    const formatted = getYYYYMMDD(calendarSelectedDate);
    const dueEl = document.getElementById('input-cal-due-date');
    const incEl = document.getElementById('input-cal-income-date');
    const spendDateEl = document.getElementById('input-spend-date');
    const activeDayLabel = document.getElementById('lbl-cal-active-day');

    if (dueEl) dueEl.value = formatted;
    if (incEl) incEl.value = formatted;
    if (spendDateEl) spendDateEl.value = formatted;

    if (activeDayLabel) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        activeDayLabel.innerText = `${monthNames[calendarSelectedDate.getMonth()]} ${calendarSelectedDate.getDate()}`;
    }
}

// DAILY CASH FLOW TRAJECTORY & RUNNING BALANCE
function formatShortCurrency(num) {
    if (num === undefined || num === null || isNaN(num)) return '₹0';
    const isNeg = num < 0;
    const abs = Math.abs(num);
    let str = '';
    if (abs >= 10000000) {
        str = (abs / 10000000).toFixed(1).replace(/\.0$/, '') + 'Cr';
    } else if (abs >= 100000) {
        str = (abs / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
    } else if (abs >= 1000) {
        str = (abs / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    } else {
        str = abs.toString();
    }
    return (isNeg ? '-₹' : '₹') + str;
}

function calculateDailyCashTrajectory(monthKey) {
    const mKey = monthKey || state.activeMonth;
    const curMonth = state.months ? state.months[mKey] : null;
    const startCash = (curMonth && typeof curMonth.cashInHand === 'number') ? curMonth.cashInHand : 0;

    const [yyyy, mm] = mKey.split('-');
    const currentYear = parseInt(yyyy, 10);
    const currentMonth = parseInt(mm, 10) - 1;
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    const monthIncomes = (state.scheduledIncomes || []).filter(i => i.date && i.date.startsWith(mKey));
    const monthTasks = (state.tasks || []).filter(t => t.date && t.date.startsWith(mKey));
    const monthSpends = (state.spends || []).filter(s => s.date && s.date.startsWith(mKey));

    const trajectory = {};
    let runningBalance = startCash;

    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${mKey}-${String(day).padStart(2, '0')}`;

        let dayIncome = 0;
        monthIncomes.filter(i => i.date === dateStr).forEach(i => { dayIncome += (i.amount || 0); });

        let dayDues = 0;
        monthTasks.filter(t => t.date === dateStr).forEach(t => { dayDues += (t.amount || 0); });

        let daySpends = 0;
        monthSpends.filter(s => s.date === dateStr).forEach(s => { daySpends += (s.amount || 0); });

        const dayOutflow = dayDues + daySpends;
        const dayNet = dayIncome - dayOutflow;

        runningBalance += dayNet;

        trajectory[dateStr] = {
            day,
            date: dateStr,
            dayIncome,
            dayDues,
            daySpends,
            dayNet,
            runningBalance,
            hasActivity: (dayIncome > 0 || dayDues > 0 || daySpends > 0)
        };
    }

    return trajectory;
}

function renderCalendarGrid() {
    const daysGrid = document.getElementById('calendar-days-grid');
    if (!daysGrid) return;
    daysGrid.innerHTML = '';

    const [yyyy, mm] = state.activeMonth.split('-');
    const currentYear = parseInt(yyyy, 10);
    const currentMonth = parseInt(mm, 10) - 1;

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    const trajectory = calculateDailyCashTrajectory(state.activeMonth);

    for (let i = 0; i < firstDayIndex; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell empty-day';
        daysGrid.appendChild(cell);
    }

    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell current-month';

        const cellDate = new Date(currentYear, currentMonth, day);
        if (cellDate.toDateString() === calendarSelectedDate.toDateString()) {
            cell.classList.add('selected-day');
        }

        const today = new Date();
        if (cellDate.toDateString() === today.toDateString()) {
            cell.classList.add('today');
        }

        const formattedDate = getYYYYMMDD(cellDate);
        const dayData = trajectory[formattedDate] || { runningBalance: 0, dayNet: 0 };

        // 1. Top row: Day Number + optional Today indicator
        const dayTop = document.createElement('div');
        dayTop.className = 'calendar-day-top';
        const isToday = cellDate.toDateString() === today.toDateString();
        dayTop.innerHTML = `<span>${day}</span>${isToday ? '<span style="font-size:0.55rem; color:var(--emerald); text-transform:uppercase; font-weight:700;">Today</span>' : ''}`;
        cell.appendChild(dayTop);

        // 2. Middle: Daily Running Balance Badge
        const bal = dayData.runningBalance;
        const balBadge = document.createElement('div');
        let balClass = 'bal-zero';
        if (bal > 0) balClass = 'bal-positive';
        else if (bal < 0) balClass = 'bal-negative';
        balBadge.className = `day-running-balance ${balClass}`;
        balBadge.innerText = formatShortCurrency(bal);
        balBadge.title = `Projected balance on ${formatDateString(formattedDate)}: ₹${bal.toLocaleString('en-IN')}`;
        cell.appendChild(balBadge);

        // 3. Bottom: Event Dots
        const dayIncomes = (state.scheduledIncomes || []).filter(inc => inc.date === formattedDate);
        const dayTasks = (state.tasks || []).filter(t => t.date === formattedDate);
        const daySpends = (state.spends || []).filter(s => s.date === formattedDate);

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'day-event-dots';

        if (dayIncomes.length > 0) {
            const dot = document.createElement('span');
            dot.className = 'event-dot dot-income';
            const incSum = dayIncomes.reduce((acc, cur) => acc + (cur.amount || 0), 0);
            dot.title = `Expected Income: ₹${incSum.toLocaleString('en-IN')}`;
            dotsContainer.appendChild(dot);
        }

        if (dayTasks.length > 0) {
            const dot = document.createElement('span');
            dot.className = 'event-dot dot-due';
            const dueSum = dayTasks.reduce((acc, cur) => acc + (cur.amount || 0), 0);
            dot.title = `Due to Pay: ₹${dueSum.toLocaleString('en-IN')}`;
            dotsContainer.appendChild(dot);
        }

        if (daySpends.length > 0) {
            const dot = document.createElement('span');
            dot.className = 'event-dot dot-spend';
            const spendSum = daySpends.reduce((acc, cur) => acc + (cur.amount || 0), 0);
            dot.title = `Spent: ₹${spendSum.toLocaleString('en-IN')}`;
            dotsContainer.appendChild(dot);
        }

        cell.appendChild(dotsContainer);

        cell.addEventListener('click', () => {
            calendarSelectedDate = cellDate;
            syncCalendarFormDates();
            renderCalendarGrid();
            renderDayEventsList();
        });

        // Drag & Drop Rescheduling Handler
        cell.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            cell.classList.add('drag-target-hover');
        });

        cell.addEventListener('dragleave', () => {
            cell.classList.remove('drag-target-hover');
        });

        cell.addEventListener('drop', (e) => {
            e.preventDefault();
            cell.classList.remove('drag-target-hover');
            const calWrapper = document.querySelector('.calendar-wrapper');
            if (calWrapper) calWrapper.classList.remove('drop-zone-active');

            try {
                const raw = e.dataTransfer.getData('text/plain');
                if (!raw) return;
                const data = JSON.parse(raw);

                if (data.type === 'task') {
                    const t = state.tasks.find(x => x.id === data.id);
                    if (t) {
                        t.date = formattedDate;
                        calendarSelectedDate = cellDate;
                        saveState();
                        updateDashboard();
                        showToast(`Rescheduled "${t.title}" to ${formatDateString(formattedDate)}!`, 'success');
                    }
                } else if (data.type === 'income') {
                    const inc = (state.scheduledIncomes || []).find(x => x.id === data.id);
                    if (inc) {
                        inc.date = formattedDate;
                        calendarSelectedDate = cellDate;
                        saveState();
                        updateDashboard();
                        showToast(`Rescheduled income "${inc.title}" to ${formatDateString(formattedDate)}!`, 'success');
                    }
                }
            } catch (err) {
                console.error("Drop error:", err);
            }
        });

        daysGrid.appendChild(cell);
    }
}

function renderDayEventsList() {
    const label = document.getElementById('selected-date-str');
    const list = document.getElementById('day-events-list');
    const pill = document.getElementById('day-net-summary-pill');
    const runningBalEl = document.getElementById('day-running-balance-val');
    if (!list || !label) return;

    const formattedDate = getYYYYMMDD(calendarSelectedDate);
    label.innerText = formatDateString(formattedDate);

    syncCalendarFormDates();

    const incomes = (state.scheduledIncomes || []).filter(inc => inc.date === formattedDate);
    const tasks = (state.tasks || []).filter(t => t.date === formattedDate);
    const spends = (state.spends || []).filter(s => s.date === formattedDate);

    let dayIncomeTotal = 0;
    incomes.forEach(i => { dayIncomeTotal += (i.amount || 0); });

    let dayDuesTotal = 0;
    tasks.forEach(t => { dayDuesTotal += (t.amount || 0); });

    let daySpendsTotal = 0;
    spends.forEach(s => { daySpendsTotal += (s.amount || 0); });

    const dayNet = dayIncomeTotal - (dayDuesTotal + daySpendsTotal);

    // Calculate Trajectory for Selected Day
    const trajectory = calculateDailyCashTrajectory(state.activeMonth);
    const dayData = trajectory[formattedDate] || { runningBalance: 0, dayNet: 0 };

    if (runningBalEl) {
        const bal = dayData.runningBalance;
        runningBalEl.innerText = (bal < 0 ? '-₹' : '₹') + Math.abs(bal).toLocaleString('en-IN');
        if (bal > 0) {
            runningBalEl.style.color = 'var(--emerald)';
        } else if (bal < 0) {
            runningBalEl.style.color = 'var(--rose)';
        } else {
            runningBalEl.style.color = '#fff';
        }
    }

    if (pill) {
        if (incomes.length === 0 && tasks.length === 0 && spends.length === 0) {
            pill.innerText = "Net: ₹0";
            pill.style.color = "var(--text-muted)";
            pill.style.borderColor = "rgba(255,255,255,0.06)";
            pill.style.background = "rgba(255,255,255,0.03)";
        } else if (dayNet > 0) {
            pill.innerText = `Net: +₹${dayNet.toLocaleString('en-IN')}`;
            pill.style.color = "var(--emerald)";
            pill.style.borderColor = "rgba(16, 185, 129, 0.4)";
            pill.style.background = "rgba(16, 185, 129, 0.12)";
        } else if (dayNet < 0) {
            pill.innerText = `Net: -₹${Math.abs(dayNet).toLocaleString('en-IN')}`;
            pill.style.color = "var(--rose)";
            pill.style.borderColor = "rgba(244, 63, 94, 0.4)";
            pill.style.background = "rgba(244, 63, 94, 0.12)";
        } else {
            pill.innerText = "Net: ₹0";
            pill.style.color = "#fff";
            pill.style.borderColor = "rgba(255, 255, 255, 0.15)";
            pill.style.background = "rgba(255, 255, 255, 0.05)";
        }
    }

    list.innerHTML = '';

    if (incomes.length === 0 && tasks.length === 0 && spends.length === 0) {
        list.innerHTML = '<p class="no-events" style="color:var(--text-muted); font-size:0.75rem; padding:4px 0; margin:0;">No dues, income, or spends logged for this day.</p>';
        return;
    }

    // Section 1: Expected Incomes
    if (incomes.length > 0) {
        const secHeader = document.createElement('div');
        secHeader.style.cssText = 'font-size:0.68rem; font-weight:700; color:var(--emerald); text-transform:uppercase; letter-spacing:0.5px; margin-top:2px; display:flex; justify-content:space-between; align-items:center;';
        secHeader.innerHTML = `<span>Expected Income (${incomes.length})</span><span style="font-size:0.75rem;">+₹${dayIncomeTotal.toLocaleString('en-IN')}</span>`;
        list.appendChild(secHeader);

        incomes.forEach(inc => {
            const item = document.createElement('div');
            item.className = `event-item draggable-task-item ${inc.received ? 'completed' : ''}`;
            item.draggable = true;
            item.style.borderLeft = '3px solid var(--emerald)';
            if (inc.received) item.style.opacity = '0.65';
            item.title = "Drag onto any day cell to reschedule!";

            item.innerHTML = `
                <div style="display:flex; align-items:center; gap: 6px; cursor:pointer;" onclick="toggleScheduledIncome('${inc.id}')" title="Click to toggle Received / Pending">
                    <span class="drag-grip" title="Drag onto any calendar day">⋮⋮</span>
                    <span style="color:${inc.received ? 'var(--emerald)' : 'var(--amber)'}; font-weight:700; font-size:0.68rem;">[${inc.received ? '✓ Recv' : '⏳ Wait'}]</span>
                    <span style="${inc.received ? 'text-decoration: line-through; color:var(--text-muted);' : 'color:#fff;'}">${inc.title} <small style="color:var(--text-muted); font-size:0.65rem;">(${inc.category || 'Income'})</small></span>
                </div>
                <div style="display:flex; align-items:center; gap: 6px;">
                    <strong style="color:var(--emerald); cursor:pointer;" onclick="event.stopPropagation(); promptEditScheduledIncome('${inc.id}')" title="Click to edit income amount">+₹${inc.amount.toLocaleString('en-IN')} ✎</strong>
                    <button onclick="deleteScheduledIncome('${inc.id}')" title="Delete Income" style="background:none; border:none; color:var(--rose); cursor:pointer; display:flex; align-items:center;">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;

            item.addEventListener('dragstart', (e) => {
                item.classList.add('is-dragging');
                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'income', id: inc.id }));
                e.dataTransfer.effectAllowed = 'move';
                const calWrapper = document.querySelector('.calendar-wrapper');
                if (calWrapper) calWrapper.classList.add('drop-zone-active');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('is-dragging');
                const calWrapper = document.querySelector('.calendar-wrapper');
                if (calWrapper) calWrapper.classList.remove('drop-zone-active');
                document.querySelectorAll('.calendar-day-cell').forEach(c => c.classList.remove('drag-target-hover'));
            });

            list.appendChild(item);
        });
    }

    // Section 2: Payments Due (Tasks)
    if (tasks.length > 0) {
        const secHeader = document.createElement('div');
        secHeader.style.cssText = 'font-size:0.68rem; font-weight:700; color:var(--theme-accent, #6366f1); text-transform:uppercase; letter-spacing:0.5px; margin-top:4px; display:flex; justify-content:space-between; align-items:center;';
        secHeader.innerHTML = `<span>Due to Pay (${tasks.length})</span><span style="font-size:0.75rem;">₹${dayDuesTotal.toLocaleString('en-IN')}</span>`;
        list.appendChild(secHeader);

        tasks.forEach(t => {
            const item = document.createElement('div');
            item.className = `event-item draggable-task-item ${t.completed ? 'completed' : ''}`;
            item.draggable = true;
            item.style.borderLeft = '3px solid var(--theme-accent, #6366f1)';
            if (t.completed) item.style.opacity = '0.65';
            item.title = "Drag onto any day cell to reschedule!";

            item.innerHTML = `
                <div style="display:flex; align-items:center; gap: 6px; cursor:pointer;" onclick="toggleTask('${t.id}')" title="Click to toggle Paid / Due">
                    <span class="drag-grip" title="Drag onto any calendar day">⋮⋮</span>
                    <span style="color:${t.completed ? 'var(--emerald)' : 'var(--text-muted)'}; font-weight:700; font-size:0.68rem;">[${t.completed ? '✓ Paid' : '○ Due'}]</span>
                    <span style="${t.completed ? 'text-decoration: line-through; color:var(--text-muted);' : 'color:#fff;'}">${t.title} ${t.isMandatory ? '<span style="font-size:0.62rem; color:var(--rose);">*Req</span>' : ''}</span>
                </div>
                <div style="display:flex; align-items:center; gap: 6px;">
                    <strong style="color:${t.completed ? 'var(--emerald)' : '#fff'}; cursor:pointer;" onclick="event.stopPropagation(); promptEditTaskAmount('${t.id}')" title="Click to edit due amount">-₹${t.amount.toLocaleString('en-IN')} ✎</strong>
                    <button onclick="deleteTask('${t.id}')" title="Delete Dues" style="background:none; border:none; color:var(--rose); cursor:pointer; display:flex; align-items:center;">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;

            item.addEventListener('dragstart', (e) => {
                item.classList.add('is-dragging');
                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'task', id: t.id }));
                e.dataTransfer.effectAllowed = 'move';
                const calWrapper = document.querySelector('.calendar-wrapper');
                if (calWrapper) calWrapper.classList.add('drop-zone-active');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('is-dragging');
                const calWrapper = document.querySelector('.calendar-wrapper');
                if (calWrapper) calWrapper.classList.remove('drop-zone-active');
                document.querySelectorAll('.calendar-day-cell').forEach(c => c.classList.remove('drag-target-hover'));
            });

            list.appendChild(item);
        });
    }

    // Section 3: Daily Spends Logged
    if (spends.length > 0) {
        const secHeader = document.createElement('div');
        secHeader.style.cssText = 'font-size:0.68rem; font-weight:700; color:var(--rose); text-transform:uppercase; letter-spacing:0.5px; margin-top:4px; display:flex; justify-content:space-between; align-items:center;';
        secHeader.innerHTML = `<span>Logged Spends (${spends.length})</span><span style="font-size:0.75rem;">-₹${daySpendsTotal.toLocaleString('en-IN')}</span>`;
        list.appendChild(secHeader);

        spends.forEach(s => {
            const item = document.createElement('div');
            let color = 'var(--rose)';
            if (s.category === 'Rapido' || s.category === 'Travel') color = 'var(--indigo)';
            else if (s.category === 'Shopping') color = 'var(--purple)';
            else if (s.category === 'Food') color = 'var(--amber)';
            else if (s.category === 'Groceries') color = 'var(--emerald)';

            item.className = 'event-item';
            item.style.borderLeft = `3px solid ${color}`;

            item.innerHTML = `
                <div style="display:flex; align-items:center; gap: 6px; cursor:pointer;" onclick="promptRenameSpend('${s.id}')" title="Click to edit spend description">
                    <span style="color:${color}; font-weight:700; font-size:0.68rem;">[${s.category}]</span>
                    <span style="color:#fff;">${s.title} <small style="font-size:0.65rem; color:var(--text-muted);">✎</small></span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <strong style="color: ${color}; cursor:pointer;" onclick="promptEditSpendAmount('${s.id}')" title="Click to edit spend amount">-₹${s.amount.toLocaleString('en-IN')} ✎</strong>
                    <button onclick="deleteSpend('${s.id}')" title="Delete Spend" style="background:none; border:none; color:var(--rose); cursor:pointer; display:flex; align-items:center;">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
            list.appendChild(item);
        });
    }
}

window.toggleScheduledIncome = function(incomeId) {
    if (!state.scheduledIncomes) return;
    const inc = state.scheduledIncomes.find(i => i.id === incomeId);
    if (inc) {
        inc.received = !inc.received;
        saveState();
        updateDashboard();
        showToast(inc.received ? `Marked "${inc.title}" as Received!` : `Marked "${inc.title}" as Pending`, 'success');
    }
};

window.deleteScheduledIncome = async function(incomeId) {
    if (!state.scheduledIncomes) return;
    const inc = state.scheduledIncomes.find(i => i.id === incomeId);
    const title = inc ? inc.title : 'this scheduled income';
    const confirmed = await showConfirmDialog({
        title: "Delete Scheduled Income?",
        message: `Are you sure you want to remove "${title}" from your calendar?`,
        confirmText: "Delete",
        type: "danger"
    });
    if (!confirmed) return;

    // Synchronize deletion back to active month budget planner
    const cur = state.months ? state.months[state.activeMonth] : null;
    if (cur && inc) {
        if (inc.incomeKey === 'primary') {
            cur.income.primary = 0;
            const el = document.getElementById('input-income-primary');
            if (el) el.value = 0;
        } else if (inc.incomeKey === 'side') {
            cur.income.side = 0;
            const el = document.getElementById('input-income-side');
            if (el) el.value = 0;
        } else if (inc.incomeKey === 'bonus') {
            cur.income.bonus = 0;
            const el = document.getElementById('input-income-bonus');
            if (el) el.value = 0;
        } else if (cur.customIncomes) {
            cur.customIncomes = cur.customIncomes.filter(ci => ci.id !== inc.id && ci.id !== inc.incomeKey);
        }
    }

    state.scheduledIncomes = state.scheduledIncomes.filter(i => i.id !== incomeId);
    saveState();
    updateDashboard();
    showToast('Removed scheduled income', 'info');
};

window.deleteSpend = async function(spendId) {
    const spend = state.spends.find(s => s.id === spendId);
    const title = spend ? spend.title : 'this spend';
    const confirmed = await showConfirmDialog({
        title: "Delete Spend Record?",
        message: `Are you sure you want to remove "${title}" from your expenses?`,
        confirmText: "Delete",
        type: "danger"
    });
    if (confirmed) {
        state.spends = state.spends.filter(s => s.id !== spendId);
        saveState();
        updateDashboard();
        renderSpendsLedgerModal();
        showToast('Deleted spend record', 'info');
    }
};

window.promptRenameSpend = async function(spendId) {
    const spend = state.spends.find(s => s.id === spendId);
    if (!spend) return;

    const newTitle = await showPromptDialog({
        title: "Rename Spend",
        message: "Enter a new description for this spend:",
        defaultValue: spend.title,
        confirmText: "Update Description",
        type: "primary"
    });

    if (newTitle && newTitle.trim()) {
        spend.title = newTitle.trim();
        saveState();
        updateDashboard();
        renderSpendsLedgerModal();
        showToast('Spend description updated', 'success');
    }
};

window.promptEditSpendAmount = async function(spendId) {
    const spend = state.spends.find(s => s.id === spendId);
    if (!spend) return;

    const newAmt = await showPromptDialog({
        title: "Edit Spend Amount",
        message: `Enter new amount for "${spend.title}":`,
        defaultValue: spend.amount,
        inputType: "number",
        isCurrency: true,
        confirmText: "Update Amount",
        type: "primary"
    });

    if (newAmt !== null && !isNaN(parseFloat(newAmt))) {
        const amt = parseFloat(newAmt) || 0;
        if (amt <= 0) {
            showToast("Please enter an amount greater than 0", "error");
            return;
        }
        spend.amount = amt;
        saveState();
        updateDashboard();
        renderSpendsLedgerModal();
        showToast(`Updated spend to ₹${spend.amount.toLocaleString('en-IN')}`, 'success');
    }
};

window.promptChangeSpendDate = async function(spendId) {
    const spend = state.spends.find(s => s.id === spendId);
    if (!spend) return;

    const newDate = await showPromptDialog({
        title: "Change Spend Date",
        message: `Select a date for "${spend.title}":`,
        defaultValue: spend.date || getYYYYMMDD(calendarSelectedDate),
        inputType: "date",
        confirmText: "Move Date",
        type: "primary"
    });

    if (newDate && newDate.trim()) {
        spend.date = newDate.trim();
        const parts = spend.date.split('-');
        if (parts.length === 3) {
            const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            if (!isNaN(dateObj.getTime()) && spend.date.startsWith(state.activeMonth)) {
                calendarSelectedDate = dateObj;
            }
        }
        saveState();
        updateDashboard();
        renderSpendsLedgerModal();
        showToast(`Moved spend to ${formatDateString(spend.date)}`, 'success');
    }
};

// =============================================================
// 13. CHECKLIST DUES
// =============================================================
function renderChecklistDues() {
    const list = document.getElementById('list-tasks');
    const summary = document.getElementById('checklist-summary');
    if (!list || !summary) return;

    list.innerHTML = '';
    const currentMonthTasks = (state.tasks || []).filter(t => t.date && t.date.startsWith(state.activeMonth));

    let total = 0, paid = 0;

    currentMonthTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'draggable-task-item';
        li.draggable = true;
        li.setAttribute('data-task-id', task.id);
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.padding = '0.35rem 0.5rem';
        li.style.background = task.completed ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)';
        li.style.border = '1px solid rgba(255,255,255,0.05)';
        li.style.borderRadius = '8px';
        li.style.fontSize = '0.75rem';
        li.style.opacity = task.completed ? '0.6' : '1';
        li.title = "Drag onto any day cell on the calendar to reschedule!";

        // Format short date
        let dateLabel = 'No date';
        if (task.date) {
            const parts = task.date.split('-');
            if (parts.length === 3) {
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                dateLabel = `${monthNames[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`;
            }
        }

        li.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px; cursor: pointer; flex: 1; min-width: 0;" onclick="toggleTask('${task.id}')">
                <span class="drag-grip" title="Drag to any day on the calendar">⋮⋮</span>
                <input type="checkbox" ${task.completed ? 'checked' : ''} style="cursor: pointer; pointer-events: none;">
                <span style="${task.completed ? 'text-decoration: line-through; color: var(--text-muted);' : 'color: #fff;'} overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${task.title}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                <span class="task-date-badge" onclick="event.stopPropagation(); promptChangeTaskDate('${task.id}')" title="Click to pick new date, or drag item onto calendar">📅 ${dateLabel}</span>
                <strong style="color: ${task.completed ? 'var(--emerald)' : '#fff'}; cursor:pointer;" onclick="event.stopPropagation(); promptEditTaskAmount('${task.id}')" title="Click to edit due amount">₹${task.amount.toLocaleString('en-IN')} ✎</strong>
                <button onclick="deleteTask('${task.id}')" title="Delete Dues" style="background:none; border:none; color:var(--rose); cursor:pointer; display:flex; align-items:center; padding: 2px;">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;

        // Drag events for task
        li.addEventListener('dragstart', (e) => {
            li.classList.add('is-dragging');
            e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'task', id: task.id }));
            e.dataTransfer.effectAllowed = 'move';
            const calWrapper = document.querySelector('.calendar-wrapper');
            if (calWrapper) calWrapper.classList.add('drop-zone-active');
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('is-dragging');
            const calWrapper = document.querySelector('.calendar-wrapper');
            if (calWrapper) calWrapper.classList.remove('drop-zone-active');
            document.querySelectorAll('.calendar-day-cell').forEach(cell => cell.classList.remove('drag-target-hover'));
        });

        list.appendChild(li);

        total += (task.amount || 0);
        if (task.completed) paid += (task.amount || 0);
    });

    if (currentMonthTasks.length === 0) {
        list.innerHTML = '<p class="no-events" style="color:var(--text-muted); font-size:0.75rem; padding:8px 0;">No checklist dues scheduled for this month.</p>';
    }

    const remaining = total - paid;
    summary.innerHTML = `
        <div style="display:flex; justify-content:space-between;"><span>Total Monthly Dues:</span><strong>₹${total.toLocaleString('en-IN')}</strong></div>
        <div style="display:flex; justify-content:space-between; color:var(--emerald);"><span>Cleared (Paid):</span><strong>₹${paid.toLocaleString('en-IN')}</strong></div>
        <div style="display:flex; justify-content:space-between; color:var(--rose); border-top:1px dashed rgba(255,255,255,0.08); padding-top:2px;"><span>Remaining Dues:</span><strong>₹${remaining.toLocaleString('en-IN')}</strong></div>
    `;
}

window.promptChangeTaskDate = async function(taskId) {
    const task = (state.tasks || []).find(t => t.id === taskId);
    if (!task) return;

    const newDate = await showPromptDialog({
        title: "Reschedule Due Date",
        message: `Select a new due date for "${task.title}":`,
        defaultValue: task.date || getYYYYMMDD(calendarSelectedDate),
        inputType: "date",
        confirmText: "Reschedule",
        type: "primary"
    });

    if (newDate && newDate.trim()) {
        task.date = newDate.trim();
        const parts = task.date.split('-');
        if (parts.length === 3) {
            const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            if (!isNaN(dateObj.getTime()) && task.date.startsWith(state.activeMonth)) {
                calendarSelectedDate = dateObj;
            }
        }
        saveState();
        updateDashboard();
        showToast(`Rescheduled "${task.title}" to ${formatDateString(task.date)}`, 'success');
    }
};

window.promptEditScheduledIncome = async function(incomeId) {
    const inc = (state.scheduledIncomes || []).find(i => i.id === incomeId);
    if (!inc) return;

    const newAmt = await showPromptDialog({
        title: "Edit Scheduled Income Amount",
        message: `Enter new amount for "${inc.title}":`,
        defaultValue: inc.amount,
        inputType: "number",
        isCurrency: true,
        confirmText: "Update Amount",
        type: "emerald"
    });

    if (newAmt !== null && !isNaN(parseFloat(newAmt))) {
        inc.amount = parseFloat(newAmt) || 0;
        syncScheduledIncomeToBudget(inc);
        saveState();
        updateDashboard();
        showToast(`Updated "${inc.title}" to ₹${inc.amount.toLocaleString('en-IN')}`, 'success');
    }
};

window.promptEditTaskAmount = async function(taskId) {
    const task = (state.tasks || []).find(t => t.id === taskId);
    if (!task) return;

    const newAmt = await showPromptDialog({
        title: "Edit Payment Due Amount",
        message: `Enter new amount for "${task.title}":`,
        defaultValue: task.amount,
        inputType: "number",
        isCurrency: true,
        confirmText: "Update Amount",
        type: "primary"
    });

    if (newAmt !== null && !isNaN(parseFloat(newAmt))) {
        task.amount = parseFloat(newAmt) || 0;
        if (task.expenseKey) {
            const cur = state.months[state.activeMonth];
            if (cur) {
                if (task.expenseKey === 'rent_maint') {
                    cur.expenses.rent = Math.max(0, task.amount - (cur.expenses.maintenance || 0));
                    task.title = `Pay House Rent (${cur.expenses.rent} Rent + ${cur.expenses.maintenance || 0} Maint)`;
                } else if (cur.expenses[task.expenseKey] !== undefined) {
                    cur.expenses[task.expenseKey] = task.amount;
                } else if (cur.customExpenses) {
                    const ce = cur.customExpenses.find(e => e.id === task.expenseKey);
                    if (ce) ce.amount = task.amount;
                }
                syncInputsToActiveMonth();
            }
        }
        saveState();
        updateDashboard();
        showToast(`Updated "${task.title}" to ₹${task.amount.toLocaleString('en-IN')}`, 'success');
    }
};

window.toggleTask = function(taskId) {
    const task = (state.tasks || []).find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveState();
        updateDashboard();
    }
};

window.deleteTask = async function(taskId) {
    const task = (state.tasks || []).find(t => t.id === taskId);
    const title = task ? task.title : 'this due';
    const confirmed = await showConfirmDialog({
        title: "Delete Checklist Due?",
        message: `Are you sure you want to remove "${title}"?`,
        confirmText: "Delete",
        type: "danger"
    });
    if (!confirmed) return;

    if (task && task.expenseKey) {
        const cur = state.months[state.activeMonth];
        if (cur) {
            if (task.expenseKey === 'rent_maint') {
                cur.expenses.rent = 0;
                cur.expenses.maintenance = 0;
            } else if (cur.expenses[task.expenseKey] !== undefined) {
                cur.expenses[task.expenseKey] = 0;
            } else if (cur.customExpenses) {
                const ce = cur.customExpenses.find(e => e.id === task.expenseKey);
                if (ce) ce.amount = 0;
            }
            syncInputsToActiveMonth();
        }
    }

    state.tasks = (state.tasks || []).filter(t => t.id !== taskId);
    saveState();
    updateDashboard();
    showToast('Deleted checklist due', 'info');
};

// =============================================================
// 14. MONTH TRANSACTION LEDGER MODAL
// =============================================================
function openSpendsLedgerModal() {
    const modal = document.getElementById('spends-ledger-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    renderSpendsLedgerModal();
}

function closeSpendsLedgerModal() {
    const modal = document.getElementById('spends-ledger-modal');
    if (modal) modal.style.display = 'none';
}

function renderSpendsLedgerModal() {
    const tbody = document.getElementById('spends-ledger-tbody');
    const title = document.getElementById('spends-ledger-title');
    const totalEl = document.getElementById('spends-ledger-total');
    if (!tbody) return;

    const currentMonthSpends = (state.spends || []).filter(s => s.date && s.date.startsWith(state.activeMonth));
    if (title) title.innerText = `${getFullMonthYearLabel(state.activeMonth)} Transactions Ledger`;

    let total = 0;
    tbody.innerHTML = '';

    if (currentMonthSpends.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px;">No transactions logged for this month.</td></tr>';
    } else {
        currentMonthSpends.sort((a, b) => (b.date || '').localeCompare(a.date || '')).forEach(s => {
            total += (s.amount || 0);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;" onclick="promptChangeSpendDate('${s.id}')" title="Click to change date">📅 ${formatDateString(s.date)} <small style="color:var(--text-muted);">✎</small></td>
                <td style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.04);"><span class="badge badge-indigo" style="font-size:0.68rem;">${s.category}</span></td>
                <td style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;" onclick="promptRenameSpend('${s.id}')" title="Click to rename">${s.title} <small style="color:var(--text-muted);">✎</small></td>
                <td style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.04); text-align:right; font-weight:600; color:var(--rose); cursor:pointer;" onclick="promptEditSpendAmount('${s.id}')" title="Click to edit amount">-₹${(s.amount || 0).toLocaleString('en-IN')} ✎</td>
                <td style="padding:8px; border-bottom:1px solid rgba(255,255,255,0.04); text-align:center;">
                    <button onclick="deleteSpend('${s.id}')" title="Delete" style="background:none; border:none; color:var(--rose); cursor:pointer; font-size:1.1rem;">&times;</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    if (totalEl) totalEl.innerText = `₹${total.toLocaleString('en-IN')}`;
}

// =============================================================
// 15. BACKUP & EXPORT (EXCEL & JSON)
// =============================================================
function exportToJsonBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `k3_finance_backup_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('Exported JSON Backup', 'success');
}

function importJsonBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported && imported.months) {
                state = imported;
                saveState();
                applyLoadedState();
                updateDashboard();
                showToast('Backup restored successfully!', 'success');
            } else {
                showToast('Invalid backup file structure', 'error');
            }
        } catch (err) {
            showToast('Failed to parse JSON file: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
}

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
            if (val === undefined || val === null || val === "") return "<td></td>";
            const str = String(val);
            if (str.startsWith('=')) {
                return `<td x:f="${str}">${str}</td>`;
            }
            if (!isNaN(str) && !isNaN(parseFloat(str))) {
                return `<td x:num="${str}">${parseFloat(str)}</td>`;
            }
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

    addTitleRow("K3 PERSONAL FINANCE APPLICATION", "title-row");
    addTitleRow("K3 DEVSEC LABS Ledger", "subtitle-row");
    addTitleRow(`Exported: ${getFullMonthYearLabel(state.activeMonth)}`, "subtitle-row");
    addRow("", "", "", "", "border-none");

    addTitleRow("OUTSTANDING LOANS & DEBTS", "section-header");
    addRow("Lender / Loan", "Category", "Balance (₹)", "", "table-header");
    const debtStart = rowIdx;
    (state.debts || []).forEach((d, idx) => {
        addRow(d.title, d.category || 'Loan', d.amount || 0, "", idx % 2 === 0 ? "zebra" : "");
    });
    const debtEnd = rowIdx - 1;
    addRow("TOTAL OUTSTANDING DEBT", "", `=SUM(C${debtStart}:C${debtEnd})`, "", "total-row");
    addRow("", "", "", "", "border-none");

    addTitleRow("DAILY SPENDS LEDGER HISTORY", "section-header");
    addRow("Transaction Date", "Category / Description", "Amount (₹)", "", "table-header");
    const spendsStartRow = rowIdx;
    if (!state.spends || state.spends.length === 0) {
        addRow("2026-08-01", "No Spends Logged", 0, "", "zebra");
    } else {
        state.spends.forEach((s, idx) => {
            addRow(s.date, s.title, s.amount || 0, "", idx % 2 === 0 ? "zebra" : "");
        });
    }
    const spendsEndRow = rowIdx - 1;
    addRow("", "", "", "", "border-none");

    const keys = Object.keys(state.months).sort();
    keys.forEach(k => {
        const cur = state.months[k];
        const label = getFullMonthYearLabel(k);
        
        addTitleRow(`MONTHLY BUDGET PLAN - ${label.toUpperCase()}`, "month-header");
        addRow("Parameter", "", "Amount (₹)", "", "table-header");
        
        const incomeStart = rowIdx;
        addRow("Primary Income", "", cur.income.primary || 0, "", "zebra");
        addRow("Side Income", "", cur.income.side || 0, "");
        addRow("Extra / One-time Bonus", "", cur.income.bonus || 0, "", "zebra");
        (cur.customIncomes || []).forEach(ci => {
            addRow(ci.title, "Custom Income", ci.amount || 0, "", "");
        });
        const incomeEnd = rowIdx - 1;
        const incomeTotalRow = rowIdx;
        addRow("TOTAL MONTH INCOME", "", `=SUM(C${incomeStart}:C${incomeEnd})`, "", "income-row");
        
        const expenseStart = rowIdx;
        addRow("House Rent", "", cur.expenses.rent || 0, "", "zebra");
        addRow("Maintenance Fee", "", cur.expenses.maintenance || 0, "");
        addRow("Utilities (Current + Water)", "", cur.expenses.utilities || 1000, "", "zebra");
        addRow("Personal Wi-Fi", "", cur.expenses.wifi || 0, "");
        addRow("Home Wi-Fi Router", "", cur.expenses.homeWifi || 0, "", "zebra");
        addRow("Phone Recharge", "", cur.expenses.phone || 0, "");
        addRow("Wife Kalpana Allowance", "", cur.expenses.kalpana || 10000, "", "zebra");
        addRow("Meesho Shopping Limit", "", cur.expenses.meesho || 0, "");
        addRow("Slice EMI minimum due", "", cur.expenses.sliceEmi || 0, "", "zebra");
        (cur.customExpenses || []).forEach(ce => {
            addRow(ce.title, ce.category || "Custom Expense", ce.amount || 0, "", "zebra");
        });
        const expenseEnd = rowIdx - 1;
        const expenseTotalRow = rowIdx;
        addRow("TOTAL PLAN EXPENDITURES", "", `=SUM(C${expenseStart}:C${expenseEnd})`, "", "outflow-row");
        
        const spendsSumRow = rowIdx;
        addRow("Logged Daily Spends (SUMIF)", "", `=SUMIF(A${spendsStartRow}:A${spendsEndRow},"*${k}*",C${spendsStartRow}:C${spendsEndRow})`, "", "zebra");
        addRow("NET SAVINGS AT END OF MONTH", "", `=C${incomeTotalRow}-C${expenseTotalRow}-C${spendsSumRow}`, "", "savings-row");
        addRow("", "", "", "", "border-none");
    });

    addTitleRow("SCHEDULED INCOME CALENDAR RECORD", "section-header");
    addRow("Income Source", "Expected Date", "Amount (₹)", "Status", "table-header");
    if (!state.scheduledIncomes || state.scheduledIncomes.length === 0) {
        addRow("No scheduled income added", "", 0, "N/A", "zebra");
    } else {
        state.scheduledIncomes.forEach((inc, idx) => {
            addRow(inc.title + (inc.category ? ` (${inc.category})` : ''), inc.date || 'Pending', inc.amount || 0, inc.received ? "Received" : "Pending", idx % 2 === 0 ? "zebra" : "");
        });
    }
    addRow("", "", "", "", "border-none");

    addTitleRow("TASK CHECKLIST DUES RECORD", "section-header");
    addRow("Due Description", "Due Date", "Amount (₹)", "Status", "table-header");
    if (!state.tasks || state.tasks.length === 0) {
        addRow("No tasks added", "", 0, "N/A", "zebra");
    } else {
        state.tasks.forEach((t, idx) => {
            addRow(t.title, t.date || 'Pending', t.amount || 0, t.completed ? "Cleared (Paid)" : "Pending", idx % 2 === 0 ? "zebra" : "");
        });
    }

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

    const blob = new Blob([htmlTemplate], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const encodedUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUrl);
    link.setAttribute("download", `k3_personal_finance_${Date.now()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Excel Spreadsheet (.xls)', 'success');
}

// =============================================================
// 16. HELPERS & NOTIFICATIONS
// =============================================================
function getFullMonthYearLabel(monthKey) {
    if (!monthKey) return '';
    const parts = monthKey.split('-');
    if (parts.length !== 2) return monthKey;
    const yyyy = parts[0];
    const mm = parseInt(parts[1], 10);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (mm >= 1 && mm <= 12) {
        return `${months[mm - 1]} ${yyyy}`;
    }
    return monthKey;
}

function getShortMonthYearLabel(monthKey) {
    if (!monthKey) return '';
    const parts = monthKey.split('-');
    if (parts.length !== 2) return monthKey;
    const yyyy = parts[0];
    const mm = parseInt(parts[1], 10);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (mm >= 1 && mm <= 12) {
        return `${months[mm - 1]} '${yyyy.substring(2)}`;
    }
    return monthKey;
}

function getYYYYMMDD(date) {
    if (!date || isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function formatDateString(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const yyyy = parseInt(parts[0], 10);
        const mm = parseInt(parts[1], 10) - 1;
        const dd = parseInt(parts[2], 10);
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if (mm >= 0 && mm < 12 && !isNaN(yyyy) && !isNaN(dd)) {
            return `${months[mm]} ${dd}, ${yyyy}`;
        }
    }
    return dateStr;
}

function formatCurrency(num) {
    return '₹' + Math.round(num || 0).toLocaleString('en-IN');
}

function showToast(message, type = 'info') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.className = `app-toast toast-${type} show`;
    toast.innerText = message;
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Global Window functions
window.openDbConfigModal = openDbConfigModal;
window.closeDbConfigModal = closeDbConfigModal;
window.saveDbConfig = saveDbConfig;
window.switchAuthTab = switchAuthTab;
window.toggleAuthMode = toggleAuthMode;
window.showLoginOverlay = showLoginOverlay;
window.hideLoginOverlay = hideLoginOverlay;
window.handleAuthSubmit = handleAuthSubmit;
window.enableOfflineMode = enableOfflineMode;
window.handleLogout = handleLogout;
window.openSpendsLedgerModal = openSpendsLedgerModal;
window.closeSpendsLedgerModal = closeSpendsLedgerModal;
window.openDebtsManagerModal = openDebtsManagerModal;
window.closeDebtsManagerModal = closeDebtsManagerModal;
window.exportToJsonBackup = exportToJsonBackup;
window.importJsonBackup = importJsonBackup;
window.promptRenameSpend = promptRenameSpend;
window.promptEditSpendAmount = promptEditSpendAmount;
window.promptChangeSpendDate = promptChangeSpendDate;
window.showConfirmDialog = showConfirmDialog;
window.showPromptDialog = showPromptDialog;
window.showAlertDialog = showAlertDialog;
window.closeDialogModal = closeDialogModal;

// Launch application on DOM load
window.addEventListener('DOMContentLoaded', initApp);
