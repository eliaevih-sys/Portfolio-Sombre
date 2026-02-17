/* script.js - v15 INVINCIBLE (Anti-Crash + Local Storage Guard) */

// 0. SYSTÈME DE LOGS IMMÉDIAT (Évite les plantages si appelé trop tôt)
window.debugLog = function (msg, type = "info") {
    console.log(`[PORTFOLIO] ${msg}`);
    try {
        let box = document.getElementById('debug-stats-box');
        if (!box && document.body) {
            box = document.createElement('div');
            box.id = 'debug-stats-box';
            Object.assign(box.style, {
                position: 'fixed', bottom: '20px', right: '20px', width: '280px', height: '160px',
                background: 'rgba(5, 8, 22, 0.95)', border: '2px solid #6366f1', borderRadius: '12px',
                zIndex: '999999', overflowY: 'auto', padding: '12px', fontFamily: 'monospace',
                fontSize: '11px', color: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)', pointerEvents: 'auto'
            });
            box.innerHTML = '<div style="border-bottom:1px solid #6366f1;padding-bottom:8px;margin-bottom:8px;font-weight:bold;display:flex;justify-content:space-between;color:#6366f1"><span>💻 DIAGNOSTIC v15</span><span style="cursor:pointer;padding:0 5px;" onclick="this.parentElement.parentElement.style.display=\'none\'">×</span></div>';
            document.body.appendChild(box);
        }
        if (box) {
            const line = document.createElement('div');
            line.style.color = type === 'error' ? '#ff4d4d' : (type === 'success' ? '#4dff4d' : '#fff');
            line.style.marginBottom = '4px';
            line.style.borderLeft = `2px solid ${type === 'error' ? '#ff4d4d' : (type === 'success' ? '#4dff4d' : '#6366f1')}`;
            line.style.paddingLeft = '8px';
            line.innerHTML = `<span style="opacity:0.4;font-size:9px">${new Date().toLocaleTimeString()}</span> ${msg}`;
            box.appendChild(line);
            box.scrollTop = box.scrollHeight;
        }
    } catch (err) { console.error("Critical log error:", err); }
};

// Capturer les erreurs IMMÉDIATEMENT
window.onerror = function (m, u, l) {
    console.error("FATAL:", m, "at", l);
    window.debugLog(`FATAL: ${m} (ligne ${l})`, "error");
};

window.debugLog("Chargement du script v15...");

// 1. CONFIGURATION
const SUPABASE_URL = "https://cajpruwybnjntvsoenyr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhanByd3libmpudHZic29lbnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDgxMjQsImV4cCI6MjA4NjkyNDEyNH0.M-GtLUVINglfF6NakNJyXVca7z5aLpzYnO4s1TGZcAE";
const ACCESS_CODE = "ELIA-ACCES";

let supabase = null;

// GESTION STORAGE (Sécurisée pour exécution locale/file://)
function safeStorage(key, value = undefined) {
    try {
        if (value === undefined) return localStorage.getItem(key);
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        window.debugLog("Storage bloqué (Mode local ?)", "warn");
        return null;
    }
}

function getUserId() {
    let id = safeStorage('portfolio_user_id');
    if (!id) {
        id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        safeStorage('portfolio_user_id', id);
    }
    return id || 'temp_user' + Date.now();
}
const USER_ID = getUserId();

// 3. INITIALISATION SUPABASE
function initSupabase() {
    if (supabase) return true;
    try {
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            window.debugLog("Supabase Connecté ✓", "success");
            return true;
        } else {
            window.debugLog("SDK Supabase manquant dans le HTML !", "error");
        }
    } catch (e) {
        window.debugLog("Crash Supabase: " + e.message, "error");
    }
    return false;
}

// 4. DONNÉES DES PROJETS
const projectDetails = {
    agrosmart: {
        title: "AgroSmart",
        description: "Solution IoT complète pour l'optimisation des cultures en temps réel.",
        link: "project-viewer.html?project=agrosmart",
        image: "assets/agrosmart/agrosmart/tableau_de_bord_agricole_-_modern_ui/screen.png"
    },
    sungrid: {
        title: "SunGrid",
        description: "Système de monitoring énergétique intelligent pour installations solaires.",
        link: "project-viewer.html?project=sungrid",
        image: "assets/sungrid/web/stitch_sungrid_web/sungrid_agent_dashboard_redesign_1/screen.png"
    },
    nourrici: {
        title: "Nourrici",
        description: "Plateforme de distribution de produits bio et locaux.",
        link: "project-viewer.html?project=nourrici",
        image: "assets/Nourrici/user_dashboard/screen.png"
    }
};

// 5. FONCTIONS STATS
async function fetchStats() {
    if (!initSupabase()) return;
    try {
        const { data, error } = await supabase.from('project_stats').select('*');
        if (error) throw error;
        data.forEach(item => {
            ['like', 'view'].forEach(type => {
                const el = document.getElementById(`${type}-count-${item.id}`);
                if (el) el.textContent = item[type + 's'] || 0;
            });
        });
        window.debugLog(`Stats à jour`);
    } catch (e) { window.debugLog("Erreur Sync: " + e.message, "error"); }
}

async function handleAction(projectId, actionType) {
    if (!initSupabase()) return;
    const rpcName = actionType === 'like' ? 'like_project' : 'view_project';
    try {
        const { error } = await supabase.rpc(rpcName, { p_project_id: projectId, p_user_id: USER_ID });
        if (error) throw error;
        window.debugLog(`${actionType} OK`, "success");
        fetchStats();
    } catch (e) {
        window.debugLog(`${rpcName} échec: ${e.message}`, "error");
        if (e.message.includes('42501')) window.debugLog("SQL/RLS non configuré ?", "error");
    }
}

// 6. INITIALISATION DOM
function bootstrap() {
    window.debugLog("Initialisation...");
    initSupabase();
    fetchStats();

    const modals = {
        project: document.getElementById('project-modal'),
        gate: document.getElementById('mockup-gate-modal')
    };
    let currentPendingProject = null;

    const closeAll = () => {
        Object.values(modals).forEach(m => { if (m) m.style.display = 'none'; });
        document.body.style.overflow = '';
    };

    // Délégation d'événements (Le plus robuste)
    document.addEventListener('click', async (e) => {
        const t = e.target;

        // Fermer modals
        if (t.closest('.modal-close') || t.classList.contains('modal-backdrop')) closeAll();

        // Ouvrir projet (CTA "Voir le cas d'étude")
        const cta = t.closest('.project-cta') || t.closest('[data-project]');
        if (cta && !t.closest('.like-button')) {
            e.preventDefault();
            const key = cta.getAttribute('data-project');
            window.debugLog("Ouverture: " + key);
            const data = projectDetails[key];
            if (data && modals.project) {
                handleAction(key, 'view');
                document.getElementById('modal-project-image').src = data.image;
                document.getElementById('modal-title').innerText = data.title;
                document.getElementById('modal-description').innerText = data.description;
                document.getElementById('modal-link').setAttribute('data-target', key);
                modals.project.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        }

        // bouton "Découvrir la solution" dans la modal
        const vBtn = t.closest('#modal-link');
        if (vBtn) {
            e.preventDefault();
            const key = vBtn.getAttribute('data-target');
            if (safeStorage('portfolio_unlocked') !== 'true') {
                currentPendingProject = key;
                if (modals.gate) modals.gate.style.display = 'flex';
            } else {
                window.location.href = projectDetails[key].link;
            }
        }

        // Like buttons
        const lBtn = t.closest('.like-button');
        if (lBtn) {
            const key = lBtn.getAttribute('data-project');
            const icon = lBtn.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-heart';
                if (window.gsap) gsap.to(icon, { scale: 1.5, duration: 0.2, yoyo: true, repeat: 1 });
            }
            handleAction(key, 'like');
        }
    });

    // Formulaire Gate
    const gateForm = document.getElementById('mockup-capture-form');
    if (gateForm) {
        gateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const res = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(Object.fromEntries(new FormData(gateForm)))
                });
                if (res.ok) {
                    document.getElementById('gate-step-1').style.display = 'none';
                    document.getElementById('gate-step-2').style.display = 'block';
                }
            } catch (err) { window.debugLog("Erreur Mail", "error"); }
        });
    }

    const verifyBtn = document.getElementById('btn-verify-code');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', () => {
            if (document.getElementById('access-code-input').value.trim().toUpperCase() === ACCESS_CODE) {
                safeStorage('portfolio_unlocked', 'true');
                if (currentPendingProject) window.location.href = projectDetails[currentPendingProject].link;
                else closeAll();
            } else alert("Code incorrect !");
        });
    }

    window.debugLog("Init Terminée ✓", "success");
}

// Lancement sécurisé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
