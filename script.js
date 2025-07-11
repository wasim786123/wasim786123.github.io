// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { 
    getFirestore, collection, doc, getDoc, onSnapshot, 
    addDoc, setDoc, updateDoc, query, orderBy, limit, arrayUnion 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAu7euG0EnLcb1fFzZebmeRNjy2Tht_Qoc",
  authDomain: "resource-manager-15798.firebaseapp.com",
  projectId: "resource-manager-15798",
  storageBucket: "resource-manager-15798.appspot.com",
  messagingSenderId: "17412161463",
  appId: "1:17412161463:web:b13f9285fee03bbe0d3232",
  measurementId: "G-GD5VYC4XK6"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- APP STATE ---
let currentUser = null;
let allUsers = [];
let allAccounts = [];
let activityLog = [];
let unsubscribeListeners = []; // To detach listeners on logout

// --- STATIC CONFIG ---
const resources = {
    trainers: {
        "Wasim": { products: { "web": 1, "mirror": 1, "desktop": 0, "daponos": 0 }, timezone: { "UK": 1, "US": 0 }, email: "wasim@example.com" },
        "Sara": { products: { "web": 1, "mirror": 1, "desktop": 1, "daponos": 0 }, timezone: { "UK": 0, "US": 1 }, email: "sara@example.com" },
        "Zoya": { products: { "web": 1, "mirror": 0, "desktop": 1, "daponos": 1 }, timezone: { "UK": 1, "US": 1 }, email: "zoya@example.com" },
        "Alex": { products: { "web": 1, "mirror": 1, "desktop": 1, "daponos": 1 }, timezone: { "UK": 0, "US": 1 }, email: "alex@example.com" }
    }
};

const ICONS = {
    briefcase: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z" /></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>`,
    plusCircle: `<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`,
    checkCircle: `<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>`,
    arrowPath: `<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991 0l-3.182-3.182a8.25 8.25 0 0 0-11.667 0l-3.181 3.182m11.666 0v-4.991" /></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`,
    export: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>`,
};

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

// --- HELPER & UTILITY FUNCTIONS ---
const getAverageScore = (account) => {
    let totalScore = 0;
    let scoreCount = 0;
    if (!account.sessions) return "N/A";
    Object.values(account.sessions).forEach(session => {
        if (session.completed && session.attendees) {
            Object.values(session.attendees).forEach(score => {
                totalScore += score;
                scoreCount++;
            });
        }
    });
    return scoreCount > 0 ? (totalScore / scoreCount).toFixed(2) : "N/A";
};

const closeModal = (modalId) => document.getElementById(modalId).style.display = 'none';
const openModal = (modalId) => document.getElementById(modalId).style.display = 'flex';
const showNotification = (message, type = 'success') => {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const notification = document.createElement('div');
    notification.className = `${bgColor} text-white py-3 px-5 rounded-lg shadow-lg flex items-center space-x-4 animate-fade-in-out`;
    notification.innerHTML = `<span>${message}</span><button class="text-xl font-bold">&times;</button>`;
    notification.querySelector('button').addEventListener('click', () => notification.remove());
    notificationContainer.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
};

// --- FIRESTORE & DATA HANDLING ---
async function logActivity(message) {
    try {
        await addDoc(collection(db, "activityLog"), {
            message,
            timestamp: new Date().toISOString(),
            user: currentUser ? currentUser.name : "System"
        });
        showNotification(message);
    } catch (error) {
        console.error("Error logging activity: ", error);
        showNotification("Failed to log activity.", "error");
    }
}

function setupRealtimeListeners() {
    const usersQuery = query(collection(db, "users"));
    const usersListener = onSnapshot(usersQuery, snapshot => {
        allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (currentUser?.role === 'admin') render();
    });

    const accountsQuery = query(collection(db, "accounts"));
    const accountsListener = onSnapshot(accountsQuery, snapshot => {
        allAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (currentUser) render();
    });
    
    const activityQuery = query(collection(db, "activityLog"), orderBy("timestamp", "desc"), limit(50));
    const activityListener = onSnapshot(activityQuery, snapshot => {
        activityLog = snapshot.docs.map(doc => doc.data());
        if (currentUser?.role === 'lead' || currentUser?.role === 'admin') render();
    });

    unsubscribeListeners.push(usersListener, accountsListener, activityListener);
}

// --- RENDER FUNCTIONS (Main Logic) ---
function render() {
    if (!currentUser) {
        loginScreen.style.display = 'flex';
        mainApp.style.display = 'none';
    } else {
        loginScreen.style.display = 'none';
        mainApp.style.display = 'block';
        userNameEl.textContent = currentUser.name;
        userRoleEl.textContent = `${currentUser.role} Dashboard`;
        
        csmDashboard.style.display = 'none';
        trainerDashboard.style.display = 'none';
        leadDashboard.style.display = 'none';
        adminDashboard.style.display = 'none';

        switch (currentUser.role) {
            case 'csm':
                csmDashboard.style.display = 'block';
                renderCSMDashboard();
                break;
            case 'trainer':
                trainerDashboard.style.display = 'block';
                renderTrainerDashboard();
                break;
            case 'lead':
                leadDashboard.style.display = 'block';
                renderLeadDashboard();
                break;
            case 'admin':
                adminDashboard.style.display = 'block';
                renderAdminDashboard();
                break;
        }
    }
}

// --- DASHBOARD & MODAL RENDERERS ---
// These functions are now pure UI renderers based on the global state variables
// (allAccounts, allUsers, etc.) which are kept in sync by Firestore listeners.

function renderCSMDashboard() {
    const userAccounts = allAccounts.filter(acc => acc.csm === currentUser.email);
    csmDashboard.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-3xl font-semibold">CSM Dashboard</h2>
            <button id="open-request-modal-btn" class="flex items-center space-x-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition-transform transform hover:scale-105">
                ${ICONS.plusCircle}
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
    const trainerAccounts = allAccounts.filter(acc => acc.assignedTrainer === currentUser.name);
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
                                ${ICONS.users} <span>Add Attending Users</span>
                            </button>
                            <button data-account-id="${acc.id}" class="export-scores-btn flex items-center space-x-2 text-sm bg-green-100 text-green-800 font-semibold py-2 px-3 rounded-lg hover:bg-green-200">
                                ${ICONS.export} <span>Export Scores</span>
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
        renderAccountDetailsModal(allAccounts.find(a => a.id == accountId));
    }));
    document.querySelectorAll('.add-users-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent modal from opening
        const accountId = e.currentTarget.dataset.accountId;
        renderAddUsersModal(allAccounts.find(a => a.id == accountId));
    }));
    document.querySelectorAll('.export-scores-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const accountId = e.currentTarget.dataset.accountId;
        handleExportScores(allAccounts.find(a => a.id == accountId));
    }));
}

function renderAccountDetailsModal(account, activeTab = 'sessions') {
    const modal = document.getElementById('account-details-modal');
    // ... (This function's inner HTML remains the same as your previous version)
    // It will now correctly display data from the `account` object passed to it.
    // Ensure event listeners inside this modal call the appropriate async handlers.
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
                <!-- Sessions Tab -->
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

                <!-- Comments Tab -->
                <div id="comments-content" class="space-y-4 ${activeTab !== 'comments' ? 'hidden' : ''}">
                    <form id="add-comment-form" data-account-id="${account.id}" class="flex space-x-2">
                        <input type="text" id="comment-text" required placeholder="Add a new comment..." class="w-full px-3 py-2 border border-slate-300 rounded-md">
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold">Add</button>
                    </form>
                    <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
                         ${account.comments && account.comments.length > 0 ? [...account.comments].reverse().map(c => `
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

// ... All other render functions (renderLeadDashboard, renderAdminDashboard, render...Modal)
// are conceptually the same as the previous version. They just use the global state variables.

// --- EVENT HANDLERS (Now async and using Firestore) ---

async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        const userDocRef = doc(db, "users", email);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            showNotification("Invalid credentials.", "error");
            return;
        }

        const user = userDoc.data();
        if (user.password === password) {
            currentUser = { id: userDoc.id, ...user };
            setupRealtimeListeners(); // Start listening to data
            render();
        } else {
            showNotification("Invalid credentials.", "error");
        }
    } catch (error) {
        console.error("Login error:", error);
        showNotification("An error occurred during login.", "error");
    }
}

function handleLogout() {
    currentUser = null;
    unsubscribeListeners.forEach(unsub => unsub()); // Detach all listeners
    unsubscribeListeners = [];
    allAccounts = [];
    allUsers = [];
    activityLog = [];
    render();
}

async function handleRequestSubmit(e) {
    e.preventDefault();
    const accountName = e.target.accountName.value;
    const products = e.target.products.value;
    const timezone = e.target.timezone.value;
    const requiredProducts = products.split(',').map(p => p.trim().toLowerCase());
    
    // Logic to find best fit trainer (same as before)
    let bestFit = null;
    let minAccounts = Infinity;
    const potentialMatches = Object.entries(resources.trainers).filter(([name, details]) => {
        const tzMatch = details.timezone[timezone.toUpperCase()] === 1;
        if (!tzMatch) return false;
        return requiredProducts.every(p => details.products[p] === 1);
    });
    if (potentialMatches.length > 0) {
        potentialMatches.forEach(([name, details]) => {
            const activeCount = allAccounts.filter(acc => acc.assignedTrainer === name && acc.status === 'Active').length;
            if (activeCount < minAccounts) {
                minAccounts = activeCount;
                bestFit = name;
            }
        });
    }
    
    if (!bestFit) {
        logActivity(`Failed Assignment: No qualified trainer for "${accountName}".`);
        return;
    }

    const newAccount = {
        name: accountName,
        status: "Active",
        csm: currentUser.id,
        assignedTrainer: bestFit,
        requiredProducts,
        assignmentDate: new Date().toISOString(),
        comments: [],
        attendingUsers: [],
        sessions: { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} }
    };
    for (let i = 1; i <= 6; i++) {
        newAccount.sessions[i] = { completed: false, completionDate: null, mom: "", attendees: {} };
    }

    try {
        await addDoc(collection(db, "accounts"), newAccount);
        logActivity(`Assignment: "${accountName}" assigned to ${bestFit}.`);
        closeModal('request-resource-modal');
    } catch (error) {
        console.error("Error creating account: ", error);
        showNotification("Failed to create account.", "error");
    }
}

async function handleAddComment(e) {
    e.preventDefault();
    const accountId = e.currentTarget.dataset.accountId;
    const commentText = document.getElementById('comment-text').value;

    if (!commentText) return;

    const newComment = {
        user: currentUser.name,
        text: commentText,
        timestamp: new Date().toISOString()
    };

    try {
        const accountRef = doc(db, "accounts", accountId);
        await updateDoc(accountRef, {
            comments: arrayUnion(newComment)
        });
        // The onSnapshot listener will automatically re-render the view
        document.getElementById('comment-text').value = ''; // Clear input
    } catch (error) {
        console.error("Error adding comment: ", error);
        showNotification("Failed to add comment.", "error");
    }
}

async function handleChangePassword(e) {
    e.preventDefault();
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
        showNotification("Passwords do not match.", 'error');
        return;
    }
    
    try {
        const userRef = doc(db, "users", currentUser.id);
        await updateDoc(userRef, { password: newPassword });
        logActivity(`Password updated for ${currentUser.name}.`);
        closeModal('change-password-modal');
    } catch (error) {
        console.error("Error changing password:", error);
        showNotification("Failed to update password.", "error");
    }
}

async function handleAddUser(e) {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const role = e.target.role.value;

    try {
        // Use email as the document ID for easy lookup
        const userRef = doc(db, "users", email);
        await setDoc(userRef, { name, password, role });
        logActivity(`New user created: ${name} (${email}).`);
        closeModal('add-user-modal');
    } catch (error) {
        console.error("Error adding user:", error);
        showNotification("Failed to add user.", "error");
    }
}

// ... Implement other async handlers like handleReassignment, handleAddUsers, etc.
// following the same pattern of using doc(), updateDoc(), setDoc() from the Firebase SDK.

// --- INITIALIZATION ---
function init() {
    document.getElementById('briefcase-icon-login').innerHTML = ICONS.briefcase;
    document.getElementById('briefcase-icon-header').innerHTML = ICONS.briefcase;
    document.getElementById('logout-icon').innerHTML = ICONS.logout;

    loginForm.addEventListener('submit', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    changePasswordBtn.addEventListener('click', () => renderChangePasswordModal());
    
    render(); // Initial render of the login screen
}

// Run the app
init();
