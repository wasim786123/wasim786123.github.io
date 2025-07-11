// --- DATA ---
const USER_DATA = {
    "admin@example.com": { password: "password", role: "admin", name: "Admin User" },
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

// --- UPDATED 'accounts' DATA STRUCTURE ---
let accounts = [
    { 
        id: 1, name: "Global Tech Inc", status: "Active", csm: "csm@example.com", assignedTrainer: "Sara", requiredProducts: ['web', 'desktop'],
        assignmentDate: "2025-01-15T10:00:00Z",
        comments: [
            { user: "Sara", text: "Initial kickoff call completed. Users are enthusiastic.", timestamp: new Date().toISOString() }
        ],
        attendingUsers: ["user1@globaltech.com", "user2@globaltech.com"],
        sessions: {
            "1": { completed: true, completionDate: "2025-01-20T14:00:00Z", mom: "Covered basics of the web portal.", attendees: { "user1@globaltech.com": 8, "user2@globaltech.com": 9 } },
            "2": { completed: false, completionDate: null, mom: "", attendees: {} }, "3": { completed: false, completionDate: null, mom: "", attendees: {} },
            "4": { completed: false, completionDate: null, mom: "", attendees: {} }, "5": { completed: false, completionDate: null, mom: "", attendees: {} }, "6": { completed: false, completionDate: null, mom: "", attendees: {} }
        }
    },
    { 
        id: 2, name: "Innovate Solutions", status: "Active", csm: "csm@example.com", assignedTrainer: "Wasim", requiredProducts: ['web', 'mirror'],
        assignmentDate: "2025-04-10T11:30:00Z",
        comments: [], attendingUsers: [],
        sessions: { "1": { completed: false, completionDate: null, mom: "", attendees: {} }, "2": { completed: false, completionDate: null, mom: "", attendees: {} }, "3": { completed: false, completionDate: null, mom: "", attendees: {} }, "4": { completed: false, completionDate: null, mom: "", attendees: {} }, "5": { completed: false, completionDate: null, mom: "", attendees: {} }, "6": { completed: false, completionDate: null, mom: "", attendees: {} } }
    },
    { 
        id: 3, name: "Quantum Leap Co", status: "Completed", csm: "csm@example.com", assignedTrainer: "Sara", requiredProducts: ['web'],
        assignmentDate: "2024-12-05T09:00:00Z",
        comments: [], attendingUsers: ["user@quantum.com"],
        sessions: {
            "1": { completed: true, completionDate: "2024-12-10T14:00:00Z", mom: "Session 1 complete.", attendees: { "user@quantum.com": 10 } }, "2": { completed: true, completionDate: "2024-12-12T14:00:00Z", mom: "Session 2 complete.", attendees: { "user@quantum.com": 9 } }, "3": { completed: true, completionDate: "2024-12-15T14:00:00Z", mom: "Session 3 complete.", attendees: { "user@quantum.com": 10 } },
            "4": { completed: true, completionDate: "2024-12-18T14:00:00Z", mom: "Session 4 complete.", attendees: { "user@quantum.com": 9 } }, "5": { completed: true, completionDate: "2024-12-20T14:00:00Z", mom: "Session 5 complete.", attendees: { "user@quantum.com": 10 } }, "6": { completed: true, completionDate: "2024-12-22T14:00:00Z", mom: "Session 6 complete.", attendees: { "user@quantum.com": 10 } }
        }
    },
];

let activityLog = [];
let currentUser = null;

// --- DOM Elements ---
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');
const changePasswordBtn = document.getElementById('change-password-btn');
const userNameEl = document.getElementById('user-name');
const userRoleEl = document.getElementById('user-role');
const csmDashboard = document.getElementById('csm-dashboard');
const trainerDashboard = document.getElementById('trainer-dashboard');
const leadDashboard = document.getElementById('lead-dashboard');
const adminDashboard = document.getElementById('admin-dashboard');
const notificationContainer = document.getElementById('notification-container');

// --- ICONS (as SVG strings) ---
const icons = {
    briefcase: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z" /></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>`,
    plusCircle: `<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`,
    checkCircle: `<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>`,
    arrowPath: `<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991 0l-3.182-3.182a8.25 8.25 0 0 0-11.667 0l-3.181 3.182m11.666 0v-4.991" /></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
    export: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>`,
};

// --- HELPER FUNCTIONS ---
function getAverageScore(account) {
    let totalScore = 0;
    let scoreCount = 0;
    Object.values(account.sessions).forEach(session => {
        if (session.completed) {
            Object.values(session.attendees).forEach(score => {
                totalScore += score;
                scoreCount++;
            });
        }
    });
    return scoreCount > 0 ? (totalScore / scoreCount).toFixed(2) : "N/A";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

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
        adminDashboard.style.display = 'none';

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
        } else if (currentUser.role === 'admin') {
            adminDashboard.style.display = 'block';
            renderAdminDashboard();
        }
    }
}
// ... (Your existing renderCSMDashboard and renderReassignModal can remain largely the same)

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
    document.getElementById('cancel-request-btn').addEventListener('click', () => closeModal('request-resource-modal'));
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
    document.getElementById('cancel-reassign-btn').addEventListener('click', () => closeModal('reassign-modal'));
    document.getElementById('reassign-form').addEventListener('submit', handleReassignment);
}

// --- NEW/UPDATED RENDER FUNCTIONS ---

function renderTrainerDashboard(activeTab = 'active') {
    const trainerAccounts = accounts.filter(acc => acc.assignedTrainer === currentUser.name);
    const activeAccounts = trainerAccounts.filter(a => a.status === 'Active');
    const completedAccounts = trainerAccounts.filter(a => a.status === 'Completed');
    const accountsToDisplay = activeTab === 'active' ? activeAccounts : completedAccounts;

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
                ${accountsToDisplay.length > 0 ? accountsToDisplay.map(acc => `
                    <div class="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer view-account-details-btn" data-account-id="${acc.id}">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="font-bold text-lg text-slate-800">${acc.name}</p>
                                <p class="text-sm text-slate-500">Assigned: <span class="font-medium">${new Date(acc.assignmentDate).toLocaleDateString()}</span></p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-slate-500">Avg. User Score</p>
                                <p class="font-semibold text-lg ${getAverageScore(acc) > 7 ? 'text-green-600' : 'text-orange-500'}">${getAverageScore(acc)}</p>
                            </div>
                        </div>
                        <div class="flex justify-end items-center mt-4 pt-4 border-t border-slate-200 space-x-2">
                             <button data-account-id="${acc.id}" class="add-users-btn flex items-center space-x-2 text-sm bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-300">
                                ${icons.users} <span>Add Attending Users</span>
                            </button>
                            <button data-account-id="${acc.id}" class="export-scores-btn flex items-center space-x-2 text-sm bg-green-100 text-green-800 font-semibold py-2 px-3 rounded-lg hover:bg-green-200">
                                ${icons.export} <span>Export Scores</span>
                            </button>
                        </div>
                    </div>
                `).join('') : `<p class="text-center text-slate-500 py-8">No ${activeTab} accounts.</p>`}
            </div>
        </div>`;
    
    // Add Event Listeners
    document.querySelectorAll('.trainer-tab').forEach(btn => btn.addEventListener('click', (e) => renderTrainerDashboard(e.target.dataset.tab)));
    document.querySelectorAll('.view-account-details-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const accountId = e.currentTarget.dataset.accountId;
        renderAccountDetailsModal(accounts.find(a => a.id == accountId));
    }));
    document.querySelectorAll('.add-users-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent modal from opening
        const accountId = e.currentTarget.dataset.accountId;
        renderAddUsersModal(accounts.find(a => a.id == accountId));
    }));
    document.querySelectorAll('.export-scores-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const accountId = e.currentTarget.dataset.accountId;
        handleExportScores(accounts.find(a => a.id == accountId));
    }));
}
function renderAccountDetailsModal(account, activeTab = 'sessions') {
    const modal = document.getElementById('account-details-modal');
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl m-4 h-[90vh] flex flex-col">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">${account.name}</h2>
                <button type="button" class="close-modal-btn text-2xl">&times;</button>
            </div>
            
            <div class="border-b border-slate-200 mb-4">
                <nav class="-mb-px flex space-x-6">
                    <button data-tab="sessions" class="account-tab whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'sessions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}">Sessions</button>
                    <button data-tab="comments" class="account-tab whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'comments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}">Comments</button>
                </nav>
            </div>

            <div class="flex-grow overflow-y-auto">
                <div id="sessions-content" class="${activeTab !== 'sessions' ? 'hidden' : ''}">
                    <h3 class="text-lg font-semibold mb-4">Training Sessions</h3>
                    <div class="space-y-3">
                        ${Object.entries(account.sessions).map(([num, session]) => `
                            <div class="flex items-center space-x-4 p-3 rounded-lg ${session.completed ? 'bg-green-50' : 'bg-slate-50'}">
                                <input type="checkbox" id="session-${num}-${account.id}" data-session-num="${num}" data-account-id="${account.id}" class="session-checkbox h-5 w-5 rounded text-blue-600 focus:ring-blue-500" ${session.completed ? 'checked' : ''}>
                                <label for="session-${num}-${account.id}" class="flex-grow">
                                    <p class="font-semibold">Session ${num}</p>
                                    ${session.completed ? `<p class="text-xs text-slate-500">Completed: ${new Date(session.completionDate).toLocaleString()} | MOM: ${session.mom}</p>` : ''}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div id="comments-content" class="space-y-4 ${activeTab !== 'comments' ? 'hidden' : ''}">
                    <form id="add-comment-form" data-account-id="${account.id}" class="flex space-x-2">
                        <input type="text" id="comment-text" required placeholder="Add a new comment..." class="w-full px-3 py-2 border border-slate-300 rounded-md">
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold">Add</button>
                    </form>
                    <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
                         ${account.comments.length > 0 ? [...account.comments].reverse().map(c => `
                            <div class="bg-slate-50 p-3 rounded-md">
                                <p class="text-slate-800">${c.text}</p>
                                <p class="text-xs text-slate-400 font-semibold mt-1">${c.user} - ${new Date(c.timestamp).toLocaleString()}</p>
                            </div>
                         `).join('') : '<p class="text-center text-slate-400 py-4">No comments yet.</p>'}
                    </div>
                </div>
            </div>
        </div>`;
    openModal('account-details-modal');

    // Add event listeners
    modal.querySelector('.close-modal-btn').addEventListener('click', () => closeModal('account-details-modal'));
    modal.querySelectorAll('.account-tab').forEach(btn => btn.addEventListener('click', (e) => {
        renderAccountDetailsModal(account, e.target.dataset.tab);
    }));
    modal.querySelectorAll('.session-checkbox').forEach(box => box.addEventListener('change', (e) => {
        if (e.target.checked) {
            renderSessionMOMModal(account, e.target.dataset.sessionNum);
        }
    }));
    const commentForm = modal.querySelector('#add-comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', handleAddComment);
    }
}

function renderAddUsersModal(account) {
    const modal = document.getElementById('add-users-modal');
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4">
            <h2 class="text-2xl font-bold mb-2">Add Attending Users</h2>
            <p class="text-slate-600 mb-6">For account: <span class="font-semibold">${account.name}</span></p>
            <form id="add-users-form" data-account-id="${account.id}">
                <label for="user-emails" class="block text-sm font-medium text-slate-700 mb-1">User Emails</label>
                <textarea id="user-emails" rows="5" class="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="Enter emails, one per line...">${account.attendingUsers.join('\n')}</textarea>
                <div class="flex justify-end space-x-4 pt-6">
                    <button type="button" class="cancel-btn px-4 py-2 bg-slate-200 rounded-md font-semibold">Cancel</button>
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold">Save Users</button>
                </div>
            </form>
        </div>
    `;
    openModal('add-users-modal');
    modal.querySelector('.cancel-btn').addEventListener('click', () => closeModal('add-users-modal'));
    modal.querySelector('#add-users-form').addEventListener('submit', handleAddUsers);
}

function renderSessionMOMModal(account, sessionNum) {
    const modal = document.getElementById('session-mom-modal');
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4">
            <h2 class="text-2xl font-bold mb-2">Complete Session ${sessionNum}</h2>
            <p class="text-slate-600 mb-6">For account: <span class="font-semibold">${account.name}</span></p>
            <form id="session-mom-form" data-account-id="${account.id}" data-session-num="${sessionNum}">
                <div class="space-y-4">
                    <div>
                        <label for="session-mom" class="block text-sm font-medium text-slate-700 mb-1">Session MOM / Recording Link</label>
                        <input type="text" id="session-mom" required class="w-full px-3 py-2 border border-slate-300 rounded-md">
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-slate-700 mb-2">Attendees & Scores (1-10)</h4>
                        <div class="space-y-2 max-h-48 overflow-y-auto pr-2">
                            ${account.attendingUsers.length > 0 ? account.attendingUsers.map(user => `
                                <div class="grid grid-cols-3 gap-4 items-center">
                                    <div class="col-span-2">
                                        <input type="checkbox" id="user-${user}" name="attendees" value="${user}" class="mr-2 rounded">
                                        <label for="user-${user}">${user}</label>
                                    </div>
                                    <input type="number" min="1" max="10" name="score-${user}" class="w-full px-2 py-1 border border-slate-300 rounded-md" placeholder="Score">
                                </div>
                            `).join('') : '<p class="text-slate-400">No attending users added for this account.</p>'}
                        </div>
                    </div>
                </div>
                <div class="flex justify-end space-x-4 pt-8">
                    <button type="button" class="cancel-btn px-4 py-2 bg-slate-200 rounded-md font-semibold">Cancel</button>
                    <button type="submit" class="px-6 py-2 bg-green-600 text-white rounded-md font-semibold">Mark Complete</button>
                </div>
            </form>
        </div>
    `;
    openModal('session-mom-modal');
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        // Uncheck the box if cancelled
        document.getElementById(`session-${sessionNum}-${account.id}`).checked = false;
        closeModal('session-mom-modal');
    });
    modal.querySelector('#session-mom-form').addEventListener('submit', handleSessionComplete);
}

function renderLeadDashboard(activeTab = 'accounts', filters = {}) {
     
     let filteredAccounts = accounts.filter(a => a.status === 'Active');

     // Apply Date Filters
    if (filters.startDate) {
        filteredAccounts = filteredAccounts.filter(a => new Date(a.assignmentDate) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
        filteredAccounts = filteredAccounts.filter(a => new Date(a.assignmentDate) <= new Date(filters.endDate));
    }

     leadDashboard.innerHTML = `
        <div class="flex justify-between items-center mb-6">
             <h2 class="text-3xl font-semibold">Lead Dashboard</h2>
             <button id="export-all-btn" class="flex items-center space-x-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-green-700">
                ${icons.export} <span>Export All Scores</span>
            </button>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <div class="border-b border-slate-200 mb-4">
                <nav class="-mb-px flex space-x-6">
                    <button data-tab="accounts" class="lead-tab whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'accounts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}">Active Accounts</button>
                    <button data-tab="history" class="lead-tab whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}">Activity Log</button>
                </nav>
            </div>
            
            ${activeTab === 'accounts' ? `
                <div class="bg-slate-50 p-4 rounded-lg mb-6">
                    <form id="date-filter-form" class="flex items-center space-x-4">
                        <div>
                            <label for="start-date" class="text-sm font-medium text-slate-600">From:</label>
                            <input type="date" id="start-date" value="${filters.startDate || ''}" class="ml-2 p-1 border rounded-md">
                        </div>
                        <div>
                            <label for="end-date" class="text-sm font-medium text-slate-600">To:</label>
                            <input type="date" id="end-date" value="${filters.endDate || ''}" class="ml-2 p-1 border rounded-md">
                        </div>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold">Filter</button>
                    </form>
                </div>` : ''}

            ${activeTab === 'accounts' ? `<div class="space-y-4">
                ${filteredAccounts.length > 0 ? filteredAccounts.map(acc => `
                    <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="font-bold text-lg">${acc.name}</p>
                                <p class="text-sm text-slate-500">Assigned to: <span class="font-semibold text-purple-700">${acc.assignedTrainer}</span> | Assigned on: ${new Date(acc.assignmentDate).toLocaleDateString()}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-slate-500">Avg. Score</p>
                                <p class="font-semibold text-lg">${getAverageScore(acc)}</p>
                            </div>
                        </div>
                         <div class="flex justify-end pt-2">
                             <button data-account-id="${acc.id}" class="reassign-btn flex items-center space-x-2 bg-purple-600 text-white font-bold py-1 px-3 rounded-lg shadow hover:bg-purple-700 text-sm">
                                ${icons.arrowPath}
                                <span>Reassign</span>
                            </button>
                         </div>
                    </div>
                `).join('') : `<p class="text-center text-slate-500 py-8">No active accounts match the filter.</p>`}
            </div>` : ''}
            ${activeTab === 'history' ? `<div class="space-y-3 max-h-96 overflow-y-auto pr-2">
                ${activityLog.length > 0 ? [...activityLog].map(log => `
                    <div class="bg-slate-50 p-3 rounded-md text-sm">
                        <p class="text-slate-700">${log.message}</p>
                        <p class="text-xs text-slate-400">${new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                `).join('') : `<p class="text-center text-slate-500 py-8">No activity logged.</p>`}
            </div>` : ''}
        </div>`;
    
    document.querySelectorAll('.lead-tab').forEach(btn => btn.addEventListener('click', (e) => renderLeadDashboard(e.target.dataset.tab, filters)));
    document.querySelectorAll('.reassign-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const account = accounts.find(a => a.id == e.currentTarget.dataset.accountId);
        renderReassignModal(account);
    }));
    document.getElementById('export-all-btn').addEventListener('click', () => handleExportScores());

    const dateFilterForm = document.getElementById('date-filter-form');
    if (dateFilterForm) {
        dateFilterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newFilters = {
                startDate: e.target['start-date'].value,
                endDate: e.target['end-date'].value,
            };
            renderLeadDashboard('accounts', newFilters);
        });
    }
}

function renderAdminDashboard() {
    adminDashboard.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-3xl font-semibold">Admin Dashboard</h2>
            <button id="open-add-user-modal-btn" class="flex items-center space-x-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700">
                ${icons.plusCircle}
                <span>Add New User</span>
            </button>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <h3 class="text-xl font-semibold mb-4 border-b pb-2">User Management</h3>
            <div class="space-y-2">
                ${Object.entries(USER_DATA).map(([email, user]) => `
                    <div class="p-3 rounded-lg bg-slate-50 flex justify-between items-center">
                        <div>
                            <p class="font-bold">${user.name}</p>
                            <p class="text-sm text-slate-500">${email} | Role: <span class="font-semibold capitalize">${user.role}</span></p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    
    document.getElementById('open-add-user-modal-btn').addEventListener('click', renderAddUserModal);
}

function renderAddUserModal() {
    const modal = document.getElementById('add-user-modal');
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4">
            <h2 class="text-2xl font-bold mb-6">Add New User</h2>
            <form id="add-user-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700">Full Name</label>
                    <input type="text" name="name" required class="w-full mt-1 px-3 py-2 border rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700">Email</label>
                    <input type="email" name="email" required class="w-full mt-1 px-3 py-2 border rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700">Password</label>
                    <input type="password" name="password" required class="w-full mt-1 px-3 py-2 border rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700">Role</label>
                    <select name="role" class="w-full mt-1 px-3 py-2 border rounded-md">
                        <option value="csm">CSM</option>
                        <option value="trainer">Trainer</option>
                        <option value="lead">Lead</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="flex justify-end space-x-4 pt-6">
                    <button type="button" class="cancel-btn px-4 py-2 bg-slate-200 rounded-md font-semibold">Cancel</button>
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold">Create User</button>
                </div>
            </form>
        </div>
    `;
    openModal('add-user-modal');
    modal.querySelector('.cancel-btn').addEventListener('click', () => closeModal('add-user-modal'));
    modal.querySelector('#add-user-form').addEventListener('submit', handleAddUser);
}


function renderChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    modal.innerHTML = `
         <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4">
            <h2 class="text-2xl font-bold mb-6">Change Password</h2>
            <form id="change-password-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700">New Password</label>
                    <input type="password" name="newPassword" required class="w-full mt-1 px-3 py-2 border rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700">Confirm New Password</label>
                    <input type="password" name="confirmPassword" required class="w-full mt-1 px-3 py-2 border rounded-md">
                </div>
                <div class="flex justify-end space-x-4 pt-6">
                    <button type="button" class="cancel-btn px-4 py-2 bg-slate-200 rounded-md font-semibold">Cancel</button>
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold">Update Password</button>
                </div>
            </form>
        </div>
    `;
    openModal('change-password-modal');
    modal.querySelector('.cancel-btn').addEventListener('click', () => closeModal('change-password-modal'));
    modal.querySelector('#change-password-form').addEventListener('submit', handleChangePassword);
}

// --- LOGIC & EVENT HANDLERS ---
function logActivity(message) {
    activityLog.unshift({ message, timestamp: new Date().toISOString() });
    showNotification(message);
    if(currentUser) render();
}

function showNotification(message, type = 'success') {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const notification = document.createElement('div');
    notification.className = `${bgColor} text-white py-3 px-5 rounded-lg shadow-lg flex items-center space-x-4 animate-fade-in-out`;
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
        currentUser = { email, ...user };
        render();
    } else {
        showNotification("Invalid credentials.", 'error');
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
        const newAccount = {
            id: accounts.length + 1,
            name: accountName,
            status: "Active",
            csm: currentUser.email,
            assignedTrainer: bestFit,
            requiredProducts,
            assignmentDate: new Date().toISOString(),
            comments: [],
            attendingUsers: [],
            sessions: { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} }
        };
        // Initialize sessions
        for(let i = 1; i <= 6; i++) {
            newAccount.sessions[i] = { completed: false, completionDate: null, mom: "", attendees: {} };
        }
        accounts.push(newAccount);
        logActivity(`Assignment: "${accountName}" assigned to ${bestFit}.`);
    } else {
        logActivity(`Failed Assignment: No trainer for "${accountName}".`);
    }
    closeModal('request-resource-modal');
    render();
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
    closeModal('reassign-modal');
    render();
}

function handleAddComment(e) {
    e.preventDefault();
    const accountId = e.currentTarget.dataset.accountId;
    const account = accounts.find(a => a.id == accountId);
    const commentText = document.getElementById('comment-text').value;

    if (account && commentText) {
        account.comments.push({
            user: currentUser.name,
            text: commentText,
            timestamp: new Date().toISOString()
        });
        logActivity(`Comment added to "${account.name}".`);
        renderAccountDetailsModal(account, 'comments'); // Re-render modal
    }
}

function handleAddUsers(e) {
    e.preventDefault();
    const accountId = e.currentTarget.dataset.accountId;
    const account = accounts.find(a => a.id == accountId);
    const emails = document.getElementById('user-emails').value;

    if (account) {
        account.attendingUsers = emails.split('\n').map(e => e.trim()).filter(e => e);
        logActivity(`Updated attending users for "${account.name}".`);
        closeModal('add-users-modal');
        render();
    }
}

function handleSessionComplete(e) {
    e.preventDefault();
    const { accountId, sessionNum } = e.currentTarget.dataset;
    const account = accounts.find(a => a.id == accountId);
    const mom = e.target['session-mom'].value;

    if (account) {
        const session = account.sessions[sessionNum];
        session.completed = true;
        session.completionDate = new Date().toISOString();
        session.mom = mom;
        
        // Collect scores
        const attendees = e.target.elements.attendees;
        if(attendees) {
            (attendees.length ? Array.from(attendees) : [attendees]).forEach(checkbox => {
                if (checkbox.checked) {
                    const user = checkbox.value;
                    const score = e.target.elements[`score-${user}`].value;
                    if(score) {
                        session.attendees[user] = parseInt(score, 10);
                    }
                }
            });
        }
        
        logActivity(`Session ${sessionNum} for "${account.name}" marked complete.`);
        closeModal('session-mom-modal');
        closeModal('account-details-modal'); // Close main modal too
        render(); // Re-render main dashboard
    }
}

function handleExportScores(account = null) {
    const headers = "user_email:session_number:score";
    let csvContent = [headers];
    
    const accountsToExport = account ? [account] : accounts;

    accountsToExport.forEach(acc => {
        Object.entries(acc.sessions).forEach(([sessionNum, session]) => {
            if (session.completed) {
                Object.entries(session.attendees).forEach(([user, score]) => {
                    csvContent.push(`${user}:${sessionNum}:${score}`);
                });
            }
        });
    });

    // Create a blob and trigger download
    const blob = new Blob([csvContent.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const filename = account ? `${account.name}-scores.csv` : `all-scores-report.csv`;
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Score report downloaded.");
}

function handleChangePassword(e) {
    e.preventDefault();
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
        showNotification("Passwords do not match.", 'error');
        return;
    }
    
    USER_DATA[currentUser.email].password = newPassword;
    logActivity(`Password updated for ${currentUser.email}.`);
    closeModal('change-password-modal');
}

function handleAddUser(e) {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const role = e.target.role.value;

    if (USER_DATA[email]) {
        showNotification("User with this email already exists.", 'error');
        return;
    }

    USER_DATA[email] = { name, password, role };
    logActivity(`New user created: ${name} (${email}).`);
    closeModal('add-user-modal');
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
    changePasswordBtn.addEventListener('click', renderChangePasswordModal);

    // Initial Render
    render();
}

init();
