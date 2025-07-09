// --- DATA ---
const USER_DATA = {
    "csm@example.com": { password: "password", role: "csm", name: "CSM User" },
    "lead@example.com": { password: "password", role: "lead", name: "Lead User" },
    "wasim@example.com": { password: "password", role: "trainer", name: "Wasim" },
    "sara@example.com": { password: "password", role: "trainer", name: "Sara" },
    "zoya@example.com": { password: "password", role: "trainer", name: "Zoya" },
    "alex@example.com": { password: "password", role: "trainer", name: "Alex" },
};

let resources = {
    trainers: {
        "Wasim": { products: { "web": 1, "mirror": 1, "desktop": 0, "daponos": 0 }, timezone: { "UK": 1, "US": 0 }, email: "wasim@example.com" },
        "Sara": { products: { "web": 1, "mirror": 1, "desktop": 1, "daponos": 0 }, timezone: { "UK": 0, "US": 1 }, email: "sara@example.com" },
        "Zoya": { products: { "web": 1, "mirror": 0, "desktop": 1, "daponos": 1 }, timezone: { "UK": 1, "US": 1 }, email: "zoya@example.com" },
        "Alex": { products: { "web": 1, "mirror": 1, "desktop": 1, "daponos": 1 }, timezone: { "UK": 0, "US": 1 }, email: "alex@example.com" }
    }
};

let accounts = [
    { id: 1, name: "Global Tech Inc", status: "Active", csm: "csm@example.com", assignedTrainer: "Sara", requiredProducts: ['web', 'desktop'] },
    { id: 2, name: "Innovate Solutions", status: "Active", csm: "csm@example.com", assignedTrainer: "Wasim", requiredProducts: ['web', 'mirror'] },
    { id: 3, name: "Quantum Leap Co", status: "Completed", csm: "csm@example.com", assignedTrainer: "Sara", requiredProducts: ['web'] },
];

let activityLog = [];
let currentUser = null;

// --- DOM Elements ---
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');
const userNameEl = document.getElementById('user-name');
const userRoleEl = document.getElementById('user-role');
const csmDashboard = document.getElementById('csm-dashboard');
const trainerDashboard = document.getElementById('trainer-dashboard');
const leadDashboard = document.getElementById('lead-dashboard');
const notificationContainer = document.getElementById('notification-container');

// --- ICONS (as SVG strings) ---
const icons = {
    briefcase: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z" /></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>`,
    plusCircle: `<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`,
    checkCircle: `<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>`,
    arrowPath: `<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991 0l-3.182-3.182a8.25 8.25 0 0 0-11.667 0l-3.181 3.182m11.666 0v-4.991" /></svg>`
};

// --- RENDER FUNCTIONS ---
function render() {
    if (!currentUser) {
        loginScreen.style.display = 'flex';
        mainApp.style.display = 'none';
    } else {
        loginScreen.style.display = 'none';
        mainApp.style.display = 'block';
        userNameEl.textContent = currentUser.name;
        userRoleEl.textContent = `${currentUser.role} Dashboard`;
        
        // Hide all dashboards first
        csmDashboard.style.display = 'none';
        trainerDashboard.style.display = 'none';
        leadDashboard.style.display = 'none';

        // Show the correct dashboard
        if (currentUser.role === 'csm') {
            csmDashboard.style.display = 'block';
            renderCSMDashboard();
        } else if (currentUser.role === 'trainer') {
            trainerDashboard.style.display = 'block';
            renderTrainerDashboard();
        } else if (currentUser.role === 'lead') {
            leadDashboard.style.display = 'block';
            renderLeadDashboard();
        }
    }
}

function renderCSMDashboard() {
    const userAccounts = accounts.filter(acc => acc.csm === currentUser.email);
    csmDashboard.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-3xl font-semibold">CSM Dashboard</h2>
            <button id="open-request-modal-btn" class="flex items-center space-x-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition-transform transform hover:scale-105">
                ${icons.plusCircle}
                <span>Request Resource</span>
            </button>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <h3 class="text-xl font-semibold mb-4 border-b pb-2">My Requested Accounts</h3>
            <div class="space-y-4">
                ${userAccounts.length > 0 ? userAccounts.map(acc => `
                    <div class="p-4 rounded-lg flex justify-between items-center transition-all ${acc.status === 'Active' ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-slate-50 border-l-4 border-slate-400 opacity-70'}">
                        <div>
                            <p class="font-bold text-lg">${acc.name}</p>
                            <p class="text-sm text-slate-500">Status: <span class="font-semibold ${acc.status === 'Active' ? 'text-blue-600' : 'text-slate-600'}">${acc.status}</span></p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-slate-500">Assigned Trainer</p>
                            <p class="font-semibold text-lg">${acc.assignedTrainer || 'Pending'}</p>
                        </div>
                    </div>
                `).join('') : `<p class="text-center text-slate-500 py-8">You have not requested any resources yet.</p>`}
            </div>
        </div>`;
    document.getElementById('open-request-modal-btn').addEventListener('click', () => renderRequestModal());
}

function renderTrainerDashboard(activeTab = 'active') {
    const trainerAccounts = accounts.filter(acc => acc.assignedTrainer === currentUser.name);
    const activeAccounts = trainerAccounts.filter(a => a.status === 'Active');
    const completedAccounts = trainerAccounts.filter(a => a.status === 'Completed');

    trainerDashboard.innerHTML = `
        <h2 class="text-3xl font-semibold mb-6">Welcome, ${currentUser.name}</h2>
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <div class="border-b border-slate-200 mb-4">
                <nav class="-mb-px flex space-x-6">
                    <button data-tab="active" class="trainer-tab whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'active' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}">Active Accounts</button>
                    <button data-tab="completed" class="trainer-tab whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'completed' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}">Completed Accounts</button>
                </nav>
            </div>
            <div class="space-y-4">
                ${activeTab === 'active' ? (activeAccounts.length > 0 ? activeAccounts.map(acc => `
                    <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p class="font-bold text-lg">${acc.name}</p>
                        </div>
                        <button data-account-id="${acc.id}" class="mark-complete-btn flex items-center space-x-2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-green-600">
                            ${icons.checkCircle}
                            <span>Mark as Complete</span>
                        </button>
                    </div>
                `).join('') : `<p class="text-center text-slate-500 py-8">No active accounts.</p>`) : ''}
                ${activeTab === 'completed' ? (completedAccounts.length > 0 ? completedAccounts.map(acc => `
                     <div class="bg-slate-50 border-l-4 border-slate-400 p-4 rounded-lg opacity-80">
                        <p class="font-bold text-lg">${acc.name}</p>
                    </div>
                `).join('') : `<p class="text-center text-slate-500 py-8">No completed accounts.</p>`) : ''}
            </div>
        </div>`;
    
    document.querySelectorAll('.trainer-tab').forEach(btn => btn.addEventListener('click', (e) => renderTrainerDashboard(e.target.dataset.tab)));
    document.querySelectorAll('.mark-complete-btn').forEach(btn => btn.addEventListener('click', handleMarkComplete));
}

function renderLeadDashboard(activeTab = 'accounts') {
     const activeAccounts = accounts.filter(a => a.status === 'Active');
     leadDashboard.innerHTML = `
        <h2 class="text-3xl font-semibold mb-6">Lead Dashboard</h2>
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <div class="border-b border-slate-200 mb-4">
                <nav class="-mb-px flex space-x-6">
                    <button data-tab="accounts" class="lead-tab whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'accounts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}">Active Accounts</button>
                    <button data-tab="history" class="lead-tab whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}">Activity Log</button>
                </nav>
            </div>
            ${activeTab === 'accounts' ? `<div class="space-y-4">
                ${activeAccounts.length > 0 ? activeAccounts.map(acc => `
                    <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p class="font-bold text-lg">${acc.name}</p>
                            <p class="text-sm text-slate-500">Assigned to: <span class="font-semibold text-purple-700">${acc.assignedTrainer}</span></p>
                        </div>
                        <button data-account-id="${acc.id}" class="reassign-btn flex items-center space-x-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-purple-700">
                            ${icons.arrowPath}
                            <span>Reassign</span>
                        </button>
                    </div>
                `).join('') : `<p class="text-center text-slate-500 py-8">No active accounts.</p>`}
            </div>` : ''}
            ${activeTab === 'history' ? `<div class="space-y-3 max-h-96 overflow-y-auto pr-2">
                ${activityLog.length > 0 ? activityLog.map(log => `
                    <div class="bg-slate-50 p-3 rounded-md text-sm">
                        <p class="text-slate-700">${log.message}</p>
                        <p class="text-xs text-slate-400">${new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                `).join('') : `<p class="text-center text-slate-500 py-8">No activity logged.</p>`}
            </div>` : ''}
        </div>`;
    
    document.querySelectorAll('.lead-tab').forEach(btn => btn.addEventListener('click', (e) => renderLeadDashboard(e.target.dataset.tab)));
    document.querySelectorAll('.reassign-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const account = accounts.find(a => a.id == e.currentTarget.dataset.accountId);
        renderReassignModal(account);
    }));
}

function renderRequestModal() {
    const modal = document.getElementById('request-resource-modal');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4">
            <h2 class="text-2xl font-bold mb-6">New Resource Request</h2>
            <form id="request-form" class="space-y-6">
                <div>
                    <label for="accountName" class="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                    <input type="text" id="accountName" required class="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label for="products" class="block text-sm font-medium text-slate-700 mb-1">Required Products</label>
                    <input type="text" id="products" required class="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., web, mirror" />
                </div>
                <div>
                    <label for="timezone" class="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                    <select id="timezone" class="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm">
                        <option>US</option>
                        <option>UK</option>
                    </select>
                </div>
                <div class="flex justify-end space-x-4 pt-4">
                    <button type="button" id="cancel-request-btn" class="px-4 py-2 bg-slate-200 text-slate-800 rounded-md font-semibold">Cancel</button>
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold">Submit Request</button>
                </div>
            </form>
        </div>`;
    document.getElementById('cancel-request-btn').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('request-form').addEventListener('submit', handleRequestSubmit);
}

function renderReassignModal(account) {
    const modal = document.getElementById('reassign-modal');
    const qualifiedTrainers = Object.keys(resources.trainers).filter(name => {
        if (name === account.assignedTrainer) return false;
        const details = resources.trainers[name];
        return account.requiredProducts.every(p => details.products[p.toLowerCase()] === 1);
    });

    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4">
            <h2 class="text-2xl font-bold mb-2">Reassign Trainer</h2>
            <p class="text-slate-600 mb-6">For account: <span class="font-semibold">${account.name}</span></p>
            <form id="reassign-form" data-account-id="${account.id}">
                 <p>Currently assigned to: <span class="font-bold">${account.assignedTrainer}</span></p>
                 <div>
                    <label for="newTrainer" class="block text-sm font-medium text-slate-700 mb-1 mt-4">Select New Trainer</label>
                    <select id="newTrainer" required class="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm">
                        <option value="" disabled selected>Select a qualified trainer...</option>
                        ${qualifiedTrainers.map(name => `<option value="${name}">${name}</option>`).join('')}
                    </select>
                 </div>
                 <div class="flex justify-end space-x-4 pt-8">
                    <button type="button" id="cancel-reassign-btn" class="px-4 py-2 bg-slate-200 rounded-md font-semibold">Cancel</button>
                    <button type="submit" class="px-6 py-2 bg-purple-600 text-white rounded-md font-semibold">Confirm</button>
                </div>
            </form>
        </div>`;
    document.getElementById('cancel-reassign-btn').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('reassign-form').addEventListener('submit', handleReassignment);
}

// --- LOGIC & EVENT HANDLERS ---
function logActivity(message) {
    activityLog.unshift({ message, timestamp: new Date().toISOString() });
    showNotification(message);
    render(); // Re-render to show updated log
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'bg-green-500 text-white py-3 px-5 rounded-lg shadow-lg flex items-center space-x-4 animate-fade-in-out';
    notification.innerHTML = `<span>${message}</span><button class="text-xl font-bold">&times;</button>`;
    notification.querySelector('button').addEventListener('click', () => notification.remove());
    notificationContainer.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const user = USER_DATA[email];
    if (user && user.password === password) {
        currentUser = user;
        render();
    } else {
        alert("Invalid credentials.");
    }
}

function handleLogout() {
    currentUser = null;
    render();
}

function handleRequestSubmit(e) {
    e.preventDefault();
    const accountName = e.target.accountName.value;
    const products = e.target.products.value;
    const timezone = e.target.timezone.value;
    const requiredProducts = products.split(',').map(p => p.trim().toLowerCase());
    let bestFit = null;
    let minAccounts = Infinity;

    const potentialMatches = Object.entries(resources.trainers).filter(([name, details]) => {
        const tzMatch = details.timezone[timezone.toUpperCase()] === 1;
        if (!tzMatch) return false;
        return requiredProducts.every(p => details.products[p] === 1);
    });

    if (potentialMatches.length > 0) {
        potentialMatches.forEach(([name, details]) => {
            const activeCount = accounts.filter(acc => acc.assignedTrainer === name && acc.status === 'Active').length;
            if (activeCount < minAccounts) {
                minAccounts = activeCount;
                bestFit = name;
            }
        });
    }
    
    if (bestFit) {
        accounts.push({
            id: accounts.length + 1, name: accountName, status: "Active", csm: currentUser.email, assignedTrainer: bestFit, requiredProducts
        });
        logActivity(`Assignment: "${accountName}" assigned to ${bestFit}.`);
    } else {
        logActivity(`Failed Assignment: No trainer for "${accountName}".`);
    }
    document.getElementById('request-resource-modal').style.display = 'none';
    render();
}

function handleMarkComplete(e) {
    const accountId = e.currentTarget.dataset.accountId;
    const account = accounts.find(acc => acc.id == accountId);
    if (account) {
        account.status = 'Completed';
        logActivity(`Completion: "${account.name}" marked as complete.`);
        render();
    }
}

function handleReassignment(e) {
    e.preventDefault();
    const accountId = e.currentTarget.dataset.accountId;
    const newTrainer = e.target.newTrainer.value;
    const account = accounts.find(acc => acc.id == accountId);
    if (account && newTrainer) {
        const oldTrainer = account.assignedTrainer;
        account.assignedTrainer = newTrainer;
        logActivity(`Reassignment: "${account.name}" from ${oldTrainer} to ${newTrainer}.`);
    }
    document.getElementById('reassign-modal').style.display = 'none';
    render();
}

// --- INITIALIZATION ---
function init() {
    // Inject Icons
    document.getElementById('briefcase-icon-login').innerHTML = icons.briefcase;
    document.getElementById('briefcase-icon-header').innerHTML = icons.briefcase;
    document.getElementById('logout-icon').innerHTML = icons.logout;

    // Add Event Listeners
    loginForm.addEventListener('submit', handleLogin);
    logoutButton.addEventListener('click', handleLogout);

    // Initial Render
    render();
}

init();
