/**
 * Faboolux Modular Notification System
 * Drop-in script: No HTML/CSS edits required in the main file.
 */
(function() {
    // ==========================================
    // 1. INJECT SCOPED CSS (Inherits existing vars)
    // ==========================================
    const style = document.createElement('style');
    style.innerHTML = `
        /* Floating Action Button */
        #fab-ext-floating-btn {
            position: fixed; bottom: 30px; right: 30px;
            width: 60px; height: 60px; border-radius: 50%;
            background: var(--card-bg, #141519);
            border: 2px solid var(--brand-orange, #e85d22);
            color: var(--brand-orange, #e85d22);
            display: flex; justify-content: center; align-items: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            cursor: pointer; z-index: 9998; transition: transform 0.2s;
        }
        #fab-ext-floating-btn:hover { transform: scale(1.05); }
        
        /* Pulse Animation for New Messages */
        @keyframes fabExtPulse {
            0% { box-shadow: 0 0 0 0 rgba(232, 93, 34, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(232, 93, 34, 0); }
            100% { box-shadow: 0 0 0 0 rgba(232, 93, 34, 0); }
        }
        .fab-ext-has-new { animation: fabExtPulse 1.5s infinite !important; }
        
        #fab-ext-badge {
            position: absolute; top: -5px; right: -5px;
            background: var(--danger, #ef4444); color: white;
            width: 22px; height: 22px; border-radius: 50%;
            font-size: 12px; font-weight: bold; font-family: sans-serif;
            display: none; align-items: center; justify-content: center;
        }

        /* Scoped Modals */
        .fab-ext-modal {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px);
            display: none; justify-content: center; align-items: center;
            z-index: 9999; font-family: inherit; color: var(--text-main, #fff);
        }
        .fab-ext-content {
            background: var(--card-bg, #141519); border: 1px solid var(--card-border, #26272c);
            padding: 30px; border-radius: 20px; width: 90%; max-width: 450px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.7); position: relative;
        }
        .fab-ext-close {
            position: absolute; top: 20px; right: 25px;
            background: none; border: none; color: var(--text-muted, #94a3b8);
            font-size: 24px; cursor: pointer; transition: 0.2s;
        }
        .fab-ext-close:hover { color: #fff; }
        .fab-ext-title { margin: 0 0 20px 0; color: var(--brand-orange, #e85d22); font-size: 22px; }
        
        .fab-ext-input {
            width: 100%; padding: 12px 15px; border-radius: 10px; margin-bottom: 15px;
            background: #0d0e11; border: 1px solid #333; color: #fff;
            box-sizing: border-box; font-family: inherit; font-size: 14px;
        }
        .fab-ext-input:focus { outline: none; border-color: var(--brand-orange, #e85d22); }
        .fab-ext-btn {
            width: 100%; padding: 14px; border-radius: 12px; border: none;
            background: var(--brand-orange, #e85d22); color: #fff;
            font-weight: 600; cursor: pointer; font-size: 15px;
        }
        .fab-ext-msg-item {
            background: #16171b; border: 1px solid #2a2b30; padding: 15px;
            border-radius: 8px; margin-bottom: 10px; text-align: left;
        }
        .fab-ext-msg-date { font-size: 11px; color: var(--brand-orange, #e85d22); margin-bottom: 5px; font-weight: bold; }
        .fab-ext-delete-btn {
            background: transparent; border: none; color: var(--danger, #ef4444);
            font-size: 12px; cursor: pointer; float: right; font-weight: bold;
        }
    `;
    document.head.appendChild(style);

    // ==========================================
    // 2. INJECT HTML ELEMENTS
    // ==========================================
    const container = document.createElement('div');
    container.innerHTML = `
        <!-- Floating Public Icon -->
        <div id="fab-ext-floating-btn" onclick="fabExt.openMessages()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <div id="fab-ext-badge">0</div>
        </div>

        <!-- Public Messages View -->
        <div id="fab-ext-modal-user" class="fab-ext-modal">
            <div class="fab-ext-content">
                <button class="fab-ext-close" onclick="fabExt.closeAll()">×</button>
                <h3 class="fab-ext-title">Recent Broadcasts</h3>
                <div id="fab-ext-messages-list" style="max-height: 300px; overflow-y: auto;"></div>
            </div>
        </div>

        <!-- Hidden Admin Login -->
        <div id="fab-ext-modal-login" class="fab-ext-modal">
            <div class="fab-ext-content">
                <button class="fab-ext-close" onclick="fabExt.closeAll()">×</button>
                <h3 class="fab-ext-title">Admin Access</h3>
                <input type="text" id="fab-ext-user" class="fab-ext-input" placeholder="Email">
                <input type="password" id="fab-ext-pass" class="fab-ext-input" placeholder="Password">
                <button class="fab-ext-btn" onclick="fabExt.login()">Login</button>
            </div>
        </div>

        <!-- Admin Dashboard -->
        <div id="fab-ext-modal-admin" class="fab-ext-modal">
            <div class="fab-ext-content" style="max-width: 550px;">
                <button class="fab-ext-close" onclick="fabExt.closeAll()">×</button>
                <h3 class="fab-ext-title">Admin Broadcast Control</h3>
                <textarea id="fab-ext-new-msg" class="fab-ext-input" placeholder="Type a new broadcast message..." style="resize:vertical; min-height:80px;"></textarea>
                <button class="fab-ext-btn" onclick="fabExt.sendMsg()" style="margin-bottom: 20px;">Broadcast Message</button>
                
                <h4 style="margin:0 0 10px 0; color: #fff; font-size: 15px; border-bottom: 1px solid #333; padding-bottom: 5px;">Active Messages</h4>
                <div id="fab-ext-admin-list" style="max-height: 200px; overflow-y: auto;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // ==========================================
    // 3. CORE LOGIC & REAL-TIME SYNC
    // ==========================================
    // Note: We are using a combination of LocalStorage + BroadcastChannel for instant
    // cross-tab real-time sync without needing a backend server immediately. 
    // (Firebase logic is outlined below if you wish to swap it out for cross-device sync).
    
    window.fabExt = {
        creds: { u: 'designer8fab@gmail.com', p: 'Faboolux@999' },
        clickCount: 0,
        clickTimer: null,
        messages: JSON.parse(localStorage.getItem('fab_ext_msgs')) || [],
        lastRead: parseInt(localStorage.getItem('fab_ext_last_read')) || 0,
        
        // Setup cross-tab sync listener
        initSync: function() {
            window.addEventListener('storage', (e) => {
                if (e.key === 'fab_ext_msgs') {
                    this.messages = JSON.parse(e.newValue) || [];
                    this.updateUI();
                }
            });
        },

        // Attach secret trigger to existing logo
        attachTrigger: function() {
            const logo = document.querySelector('#main-logo') || document.querySelector('.brand-logo');
            if(logo) {
                logo.addEventListener('click', () => {
                    this.clickCount++;
                    clearTimeout(this.clickTimer);
                    if (this.clickCount >= 4) {
                        this.clickCount = 0;
                        this.openModal('fab-ext-modal-login');
                    } else {
                        this.clickTimer = setTimeout(() => { this.clickCount = 0; }, 1000);
                    }
                });
            }
        },

        // Sync to storage
        saveMsgs: function() {
            localStorage.setItem('fab_ext_msgs', JSON.stringify(this.messages));
            this.updateUI();
            
            // NOTE FOR FIREBASE / SUPABASE:
            // If using Firebase Realtime DB, replace localStorage with:
            // firebase.database().ref('broadcasts').set(this.messages);
        },

        // Update counts and re-render lists
        updateUI: function() {
            const unread = this.messages.length - this.lastRead;
            const badge = document.getElementById('fab-ext-badge');
            const fab = document.getElementById('fab-ext-floating-btn');

            if (unread > 0) {
                badge.style.display = 'flex'; badge.innerText = unread;
                fab.classList.add('fab-ext-has-new');
            } else {
                badge.style.display = 'none';
                fab.classList.remove('fab-ext-has-new');
            }

            this.renderLists();
        },

        renderLists: function() {
            const userList = document.getElementById('fab-ext-messages-list');
            const adminList = document.getElementById('fab-ext-admin-list');
            let userHtml = '', adminHtml = '';

            if (this.messages.length === 0) {
                userHtml = '<div style="color: #666; text-align:center;">No broadcasts available.</div>';
                adminHtml = '<div style="color: #666; text-align:center;">No active messages.</div>';
            } else {
                [...this.messages].reverse().forEach((m, i) => {
                    const actualIdx = this.messages.length - 1 - i;
                    const baseItem = `<div class="fab-ext-msg-date">${m.date}</div><div style="line-height:1.5;">${m.text}</div>`;
                    
                    userHtml += `<div class="fab-ext-msg-item">${baseItem}</div>`;
                    adminHtml += `<div class="fab-ext-msg-item">
                        <button class="fab-ext-delete-btn" onclick="fabExt.deleteMsg(${actualIdx})">DELETE</button>
                        ${baseItem}
                    </div>`;
                });
            }
            if(userList) userList.innerHTML = userHtml;
            if(adminList) adminList.innerHTML = adminHtml;
        },

        // Actions
        openMessages: function() {
            this.lastRead = this.messages.length;
            localStorage.setItem('fab_ext_last_read', this.lastRead);
            this.updateUI();
            this.openModal('fab-ext-modal-user');
        },
        
        login: function() {
            const u = document.getElementById('fab-ext-user').value;
            const p = document.getElementById('fab-ext-pass').value;
            if (u === this.creds.u && p === this.creds.p) {
                document.getElementById('fab-ext-user').value = '';
                document.getElementById('fab-ext-pass').value = '';
                this.closeAll();
                this.openModal('fab-ext-modal-admin');
            } else { alert('Invalid Admin Credentials'); }
        },

        sendMsg: function() {
            const input = document.getElementById('fab-ext-new-msg');
            const text = input.value.trim();
            if(!text) return;
            
            const date = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
            this.messages.push({ text, date });
            this.saveMsgs();
            input.value = '';
        },

        deleteMsg: function(idx) {
            this.messages.splice(idx, 1);
            // Fix unread count logic on delete
            if (this.lastRead > this.messages.length) {
                this.lastRead = this.messages.length;
                localStorage.setItem('fab_ext_last_read', this.lastRead);
            }
            this.saveMsgs();
        },

        openModal: function(id) {
            this.closeAll();
            document.getElementById(id).style.display = 'flex';
        },
        
        closeAll: function() {
            document.querySelectorAll('.fab-ext-modal').forEach(m => m.style.display = 'none');
        }
    };

    // Initialize
    fabExt.attachTrigger();
    fabExt.initSync();
    fabExt.updateUI();

})();
