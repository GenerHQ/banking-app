// ============================================
// CONFIGURATION
// ============================================
const API_BASE = 'http://localhost:8080/api';
let modalInstance = null;

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    modalInstance = new bootstrap.Modal(document.getElementById('actionModal'));
    setupSearch();
    setupTableButtons();  // ← NEW
    console.log('✅ Banking App Frontend Loaded!');
});

// ============================================
// SEARCH
// ============================================
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function () {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#accountsBody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// ============================================
// TABLE BUTTONS (NEW - fixes the onclick issue)
// ============================================
function setupTableButtons() {
    // View Account buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const accountNumber = this.getAttribute('data-account');
            viewAccount(accountNumber);
        });
    });

    // Transaction History buttons
    document.querySelectorAll('.history-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const accountNumber = this.getAttribute('data-account');
            viewTransactions(accountNumber);
        });
    });
}

// ============================================
// OPEN MODAL
// ============================================
function openModal(action) {
    console.log('🔘 Button clicked:', action);

    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(document.getElementById('actionModal'));
    }

    switch (action) {
        case 'createAccount':
            modalTitle.textContent = '🏦 Create New Account';
            modalBody.innerHTML = `
                <form id="createAccountForm" onsubmit="createAccount(event)">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Account Name</label>
                        <input type="text" class="form-control" id="accName" placeholder="Enter full name" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Initial Deposit (₱)</label>
                        <input type="number" class="form-control" id="accDeposit" placeholder="0.00" step="0.01" min="0" required>
                    </div>
                    <button type="submit" class="btn btn-gradient">Create Account</button>
                </form>
            `;
            break;

        case 'deposit':
            modalTitle.textContent = '📥 Deposit Money';
            modalBody.innerHTML = `
                <form id="depositForm" onsubmit="deposit(event)">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Account Number</label>
                        <input type="text" class="form-control" id="depositAccount" placeholder="Enter account number" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Amount (₱)</label>
                        <input type="number" class="form-control" id="depositAmount" placeholder="0.00" step="0.01" min="0.01" required>
                    </div>
                    <button type="submit" class="btn btn-gradient">Deposit</button>
                </form>
            `;
            break;

        case 'withdraw':
            modalTitle.textContent = '📤 Withdraw Money';
            modalBody.innerHTML = `
                <form id="withdrawForm" onsubmit="withdraw(event)">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Account Number</label>
                        <input type="text" class="form-control" id="withdrawAccount" placeholder="Enter account number" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Amount (₱)</label>
                        <input type="number" class="form-control" id="withdrawAmount" placeholder="0.00" step="0.01" min="0.01" required>
                    </div>
                    <button type="submit" class="btn btn-gradient">Withdraw</button>
                </form>
            `;
            break;

        case 'transfer':
            modalTitle.textContent = '↔️ Transfer Funds';
            modalBody.innerHTML = `
                <form id="transferForm" onsubmit="transfer(event)">
                    <div class="mb-3">
                        <label class="form-label fw-bold">From Account</label>
                        <input type="text" class="form-control" id="transferFrom" placeholder="Source account" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">To Account</label>
                        <input type="text" class="form-control" id="transferTo" placeholder="Destination account" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Amount (₱)</label>
                        <input type="number" class="form-control" id="transferAmount" placeholder="0.00" step="0.01" min="0.01" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Remark</label>
                        <input type="text" class="form-control" id="transferRemark" placeholder="Optional remark">
                    </div>
                    <button type="submit" class="btn btn-gradient">Transfer</button>
                </form>
            `;
            break;

        case 'balance':
            modalTitle.textContent = '👁️ Balance Inquiry';
            modalBody.innerHTML = `
                <form id="balanceForm" onsubmit="checkBalance(event)">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Account Number</label>
                        <input type="text" class="form-control" id="balanceAccount" placeholder="Enter account number" required>
                    </div>
                    <button type="submit" class="btn btn-gradient">Check Balance</button>
                </form>
            `;
            break;

        case 'miniStatement':
            modalTitle.textContent = '📄 Mini Statement';
            modalBody.innerHTML = `
                <form id="miniStatementForm" onsubmit="showMiniStatement(event)">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Account Number</label>
                        <input type="text" class="form-control" id="miniStatementAccount" placeholder="Enter account number" required>
                    </div>
                    <button type="submit" class="btn btn-gradient">View Statement</button>
                </form>
            `;
            break;

        default:
            modalBody.innerHTML = `<p>Unknown action</p>`;
    }

    modalInstance.show();
}

// ============================================
// API CALLS
// ============================================

// CREATE ACCOUNT
function createAccount(event) {
    event.preventDefault();

    // Get form values and trim whitespace
    const name = document.getElementById('accName').value.trim();
    const deposit = parseFloat(document.getElementById('accDeposit').value);

    // ============================================
    // FRONTEND VALIDATIONS
    // ============================================

    // VALIDATION 1: Account name must not be blank
    if (!name) {
        showToast('❌ Account name is required', 'error');
        return;
    }

    // VALIDATION 2: Account name must be at least 2 characters
    if (name.length < 2) {
        showToast('❌ Account name must be at least 2 characters', 'error');
        return;
    }

    // VALIDATION 3: Initial deposit must be valid
    if (isNaN(deposit) || deposit < 0) {
        showToast('❌ Initial deposit must be zero or greater', 'error');
        return;
    }

    // ============================================
    // PROCEED WITH ACCOUNT CREATION
    // ============================================

    // Disable submit button to prevent double-click
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Creating...';
    }

    fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, initialDeposit: deposit })
    })
        .then(response => response.json())
        .then(data => {
            // Re-enable button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }

            if (data.error) {
                showToast('❌ ' + data.error, 'error');
            } else {
                showToast(`✅ Account created! Number: ${data.accountNumber}`, 'success');
                modalInstance.hide();
                setTimeout(() => location.reload(), 500);
            }
        })
        .catch(error => {
            // Re-enable button on error
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
            showToast('❌ Failed to create account: ' + error.message, 'error');
        });
}

// DEPOSIT
// DEPOSIT - with validations
function deposit(event) {
    event.preventDefault();

    // Get form values and trim whitespace
    const accountNumber = document.getElementById('depositAccount').value.trim();
    const amount = parseFloat(document.getElementById('depositAmount').value);

    // ============================================
    // FRONTEND VALIDATIONS
    // ============================================

    // VALIDATION 1: Account number must not be blank
    if (!accountNumber) {
        showToast('❌ Please enter an account number', 'error');
        return;
    }

    // VALIDATION 2: Account number format validation (optional)
    if (!accountNumber.startsWith('ACC-')) {
        showToast('❌ Invalid account number format. Should start with "ACC-"', 'error');
        return;
    }

    // VALIDATION 3: Amount must be valid and greater than zero
    if (isNaN(amount) || amount <= 0) {
        showToast('❌ Amount must be greater than zero', 'error');
        return;
    }

    // ============================================
    // PROCEED WITH DEPOSIT
    // ============================================

    // Disable submit button to prevent double-click
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Processing...';
    }

    fetch(`${API_BASE}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, amount })
    })
        .then(response => response.json())
        .then(data => {
            // Re-enable button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Deposit';
            }

            if (data.error) {
                showToast('❌ ' + data.error, 'error');
            } else {
                showToast(`✅ Deposited ₱${amount.toFixed(2)} successfully!`, 'success');
                modalInstance.hide();
                setTimeout(() => location.reload(), 500);
            }
        })
        .catch(error => {
            // Re-enable button on error
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Deposit';
            }
            showToast('❌ Failed to deposit', 'error');
        });
}

// WITHDRAW
// WITHDRAW - with validations
// WITHDRAW - with validations
function withdraw(event) {
    event.preventDefault();

    // Get form values and trim whitespace
    const accountNumber = document.getElementById('withdrawAccount').value.trim();
    const amount = parseFloat(document.getElementById('withdrawAmount').value);

    // ============================================
    // FRONTEND VALIDATIONS
    // ============================================

    // VALIDATION 1: Account number must not be blank
    if (!accountNumber) {
        showToast('❌ Please enter an account number', 'error');
        return;
    }

    // VALIDATION 2: Account number format validation (optional)
    if (!accountNumber.startsWith('ACC-')) {
        showToast('❌ Invalid account number format. Should start with "ACC-"', 'error');
        return;
    }

    // VALIDATION 3: Amount must be valid and greater than zero
    if (isNaN(amount) || amount <= 0) {
        showToast('❌ Amount must be greater than zero', 'error');
        return;
    }

    // ============================================
    // CHECK BALANCE FIRST (BONUS FEATURE)
    // ============================================

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Checking balance...';
    }

    fetch(`${API_BASE}/account?accountNumber=${accountNumber}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Account not found');
                });
            }
            return response.json();
        })
        .then(account => {
            // Check if sufficient balance
            if (amount > account.balance) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Withdraw';
                }
                showToast(`❌ Insufficient balance. Available: ₱${account.balance.toFixed(2)}`, 'error');
                return;
            }

            // Proceed with withdrawal
            performWithdrawal(accountNumber, amount, submitBtn);
        })
        .catch(error => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Withdraw';
            }
            showToast('❌ ' + error.message, 'error');
        });
}

// Helper function for withdrawal (separated for clarity)
function performWithdrawal(accountNumber, amount, submitBtn) {
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Processing...';
    }

    fetch(`${API_BASE}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, amount })
    })
        .then(response => response.json())
        .then(data => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Withdraw';
            }

            if (data.error) {
                showToast('❌ ' + data.error, 'error');
            } else {
                showToast(`✅ Withdrew ₱${amount.toFixed(2)} successfully!`, 'success');
                modalInstance.hide();
                setTimeout(() => location.reload(), 500);
            }
        })
        .catch(error => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Withdraw';
            }
            showToast('❌ Failed to withdraw', 'error');
        });
}

// TRANSFER
function transfer(event) {
    event.preventDefault();

    // Get form values
    const fromAccount = document.getElementById('transferFrom').value.trim();
    const toAccount = document.getElementById('transferTo').value.trim();
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const remark = document.getElementById('transferRemark').value || 'Transfer';

    // ============================================
    // FRONTEND VALIDATIONS
    // ============================================

    // VALIDATION 1: Both accounts must be filled
    if (!fromAccount || !toAccount) {
        showToast('❌ Please enter both source and destination account numbers', 'error');
        return;
    }

    // VALIDATION 2: Source and destination must be different
    if (fromAccount === toAccount) {
        showToast('❌ Source and destination accounts cannot be the same', 'error');
        return;
    }

    // VALIDATION 3: Amount must be valid and greater than zero
    if (isNaN(amount) || amount <= 0) {
        showToast('❌ Amount must be greater than zero', 'error');
        return;
    }

    // ============================================
    // PROCEED WITH TRANSFER
    // ============================================

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Processing...';

    fetch(`${API_BASE}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromAccount, toAccount, amount, remark })
    })
        .then(response => response.text())
        .then(text => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Transfer';

            // Try to parse as JSON, but it's probably plain text
            try {
                const data = JSON.parse(text);
                if (data.error) {
                    showToast('❌ ' + data.error, 'error');
                } else {
                    showToast('✅ Transfer completed successfully!', 'success');
                    modalInstance.hide();
                    setTimeout(() => location.reload(), 500);
                }
            } catch {
                // It's plain text - check response
                if (text.includes('successful') || text.includes('completed')) {
                    showToast('✅ Transfer completed successfully!', 'success');
                    modalInstance.hide();
                    setTimeout(() => location.reload(), 500);
                } else {
                    showToast('❌ ' + text, 'error');
                }
            }
        })
        .catch(error => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Transfer';
            showToast('❌ ' + error.message, 'error');
        });
}

// CHECK BALANCE
function checkBalance(event) {
    event.preventDefault();
    const accountNumber = document.getElementById('balanceAccount').value;

    fetch(`${API_BASE}/account?accountNumber=${accountNumber}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Account not found');
                });
            }
            return response.json();
        })
        .then(data => {
            showToast(`💰 Balance for ${accountNumber}: ₱${data.balance.toFixed(2)}`, 'info');
            modalInstance.hide();
        })
        .catch(error => {
            showToast(`❌ ${error.message}`, 'error');
        });
}

// MINI STATEMENT
function showMiniStatement(event) {
    event.preventDefault();
    const accountNumber = document.getElementById('miniStatementAccount').value;

    fetch(`${API_BASE}/mini-statement?accountNumber=${accountNumber}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            if (!data || data.length === 0) {
                showToast('No transactions found', 'info');
                return;
            }

            let html = `<h6 class="mb-3">Recent Transactions for ${accountNumber}</h6><div class="list-group">`;
            data.forEach(txn => {
                const typeClass = txn.transactionType === 'DEPOSIT' ? 'text-success' :
                    txn.transactionType === 'WITHDRAW' ? 'text-danger' :
                        'text-primary';
                html += `
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <span class="fw-bold ${typeClass}">${txn.transactionType}</span>
                            <small class="d-block text-muted">${new Date(txn.createdAt).toLocaleString()}</small>
                        </div>
                        <div class="text-end">
                            <span class="fw-bold">₱${txn.amount.toFixed(2)}</span>
                            <small class="d-block text-muted">${txn.remarks || ''}</small>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;

            document.getElementById('modalTitle').textContent = '📄 Mini Statement';
            document.getElementById('modalBody').innerHTML = html;
        })
        .catch(() => showToast('❌ Failed to load transactions', 'error'));
}

// VIEW ACCOUNT
function viewAccount(accountNumber) {
    fetch(`${API_BASE}/account?accountNumber=${accountNumber}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
            } else {
                document.getElementById('modalTitle').textContent = '👤 Account Details';
                document.getElementById('modalBody').innerHTML = `
                    <div class="mb-2"><strong>Account Number:</strong> ${data.accountNumber}</div>
                    <div class="mb-2"><strong>Account Name:</strong> ${data.accountName}</div>
                    <div class="mb-2"><strong>Balance:</strong> ₱${data.balance.toFixed(2)}</div>
                    <div class="mb-0"><strong>Created:</strong> ${new Date(data.createdAt).toLocaleDateString()}</div>
                    <button class="btn btn-gradient mt-3" onclick="modalInstance.hide()">Close</button>
                `;
                modalInstance.show();
            }
        })
        .catch(() => showToast('❌ Account not found', 'error'));
}

// VIEW TRANSACTIONS
function viewTransactions(accountNumber) {
    fetch(`${API_BASE}/transactions?accountNumber=${accountNumber}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            if (!data || data.length === 0) {
                document.getElementById('modalTitle').textContent = '📊 Transaction History';
                document.getElementById('modalBody').innerHTML = `<p class="text-muted">No transactions found for ${accountNumber}</p>`;
                modalInstance.show();
                return;
            }

            let html = `<h6 class="mb-3">All Transactions for ${accountNumber}</h6><div class="list-group" style="max-height:400px;overflow-y:auto;">`;
            data.forEach(txn => {
                const typeClass = txn.transactionType === 'DEPOSIT' ? 'text-success' :
                    txn.transactionType === 'WITHDRAW' ? 'text-danger' :
                        'text-primary';
                html += `
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <span class="fw-bold ${typeClass}">${txn.transactionType}</span>
                            <small class="d-block text-muted">${new Date(txn.createdAt).toLocaleString()}</small>
                        </div>
                        <div class="text-end">
                            <span class="fw-bold">₱${txn.amount.toFixed(2)}</span>
                            <small class="d-block text-muted">${txn.remarks || ''}</small>
                        </div>
                    </div>
                `;
            });
            html += `</div><button class="btn btn-gradient mt-3" onclick="modalInstance.hide()">Close</button>`;

            document.getElementById('modalTitle').textContent = '📊 Transaction History';
            document.getElementById('modalBody').innerHTML = html;
            modalInstance.show();
        })
        .catch(() => showToast('❌ Failed to load transactions', 'error'));
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast-custom ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}