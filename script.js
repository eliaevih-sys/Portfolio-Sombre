/* script.js - v12 PRODUCTION READY */
document.addEventListener('DOMContentLoaded', () => {
    // Check elements
    const gateModal = document.getElementById('mockup-gate-modal');
    const projectModal = document.getElementById('project-modal');

    // GSAP initialization
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    const projectDetails = {
        agrosmart: {
            title: "AgroSmart",
            subtitle: "L'agriculture de demain, aujourd'hui",
            description: "AgroSmart est une solution de gestion agricole intelligente conçue pour optimiser le rendement des cultures. Elle intègre des capteurs IoT pour le suivi en temps réel de l'humidité des sols et des conditions climatiques.",
            tags: ["UI/UX Design", "Développement Front-End", "React Native"],
            link: "project-viewer.html?project=agrosmart",
            icon: "fa-seedling",
            image: "assets/agrosmart/agrosmart/tableau_de_bord_agricole_-_modern_ui/screen.png"
        },
        sungrid: {
            title: "SunGrid",
            subtitle: "Optimisation de l'énergie solaire",
            description: "SunGrid permet aux propriétaires de panneaux solaires de surveiller leur production et consommation d'énergie en temps réel. L'application propose des analyses prédictives pour maximiser l'autoconsommation.",
            tags: ["Mobile App", "UI Design", "Dashboard"],
            link: "project-viewer.html?project=sungrid",
            icon: "fa-solar-panel",
            image: "assets/sungrid/web/stitch_sungrid_web/sungrid_agent_dashboard_redesign_1/screen.png"
        },
        nourrici: {
            title: "Nourrici",
            subtitle: "E-commerce alimentaire local",
            description: "Plateforme e-commerce dédiée aux produits alimentaires locaux et biologiques. Interface utilisateur optimisée pour faciliter la découverte de produits, avec un système de panier et de catalogue intelligent.",
            tags: ["UI/UX Design", "E-commerce", "Mobile First"],
            link: "project-viewer.html?project=nourrici",
            icon: "fa-shopping-cart",
            image: "assets/Nourrici/user_dashboard/screen.png"
        }
    };

    let isUnlocked = localStorage.getItem('portfolio_unlocked') === 'true';
    let pendingProject = null;
    const ACCESS_CODE = "ELIA-ACCES";

    // --- MODAL FUNCTIONS ---

    function openProjectModal(key) {
        const data = projectDetails[key];
        if (!data || !projectModal) return;

        // Met à jour l'image du projet
        const modalImg = document.getElementById('modal-project-image');
        if (modalImg) modalImg.src = data.image;

        document.getElementById('modal-title').innerText = data.title;
        document.getElementById('modal-subtitle').innerText = data.subtitle;
        document.getElementById('modal-description').innerText = data.description;

        // Stocke la clé et le lien sur le bouton final
        const modalLink = document.getElementById('modal-link');
        if (modalLink) {
            modalLink.setAttribute('data-target-project', key);
            modalLink.href = data.link || '#';
        }

        const tags = document.getElementById('modal-tags');
        tags.innerHTML = '';
        data.tags.forEach(t => {
            const s = document.createElement('span');
            s.className = 'tag tag-design';
            s.innerText = t;
            tags.appendChild(s);
        });

        projectModal.style.display = 'flex';
        gsap.to(projectModal.querySelector('.modal-backdrop'), { opacity: 1, duration: 0.3 });
        gsap.to(projectModal.querySelector('.modal-content'), { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" });
        document.body.style.overflow = 'hidden';
    }

    function openGateModal(sourceKey = null) {
        if (!gateModal) return;
        pendingProject = sourceKey;

        gateModal.style.display = 'flex';
        const backdrop = gateModal.querySelector('.modal-backdrop');
        const content = gateModal.querySelector('.modal-content');

        gsap.to(backdrop, { opacity: 1, duration: 0.3 });
        gsap.to(content, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" });

        document.getElementById('gate-step-1').style.display = 'block';
        document.getElementById('gate-step-2').style.display = 'none';
        document.body.style.overflow = 'hidden';
    }

    function closeAllModals() {
        [projectModal, gateModal].forEach(m => {
            if (m && m.style.display === 'flex') {
                const b = m.querySelector('.modal-backdrop');
                const c = m.querySelector('.modal-content');
                gsap.to(b, { opacity: 0, duration: 0.3 });
                gsap.to(c, {
                    opacity: 0, scale: 0.9, duration: 0.3, onComplete: () => {
                        m.style.display = 'none';
                    }
                });
            }
        });
        document.body.style.overflow = '';
    }

    // --- EVENT LISTENERS ---

    document.querySelectorAll('.modal-close, .modal-backdrop, #gate-close').forEach(el => {
        el.addEventListener('click', closeAllModals);
    });

    // 1. CARTE PROJET -> Ouvre les détails IMMÉDIATEMENT
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.project-cta');
        if (!btn) return;

        e.preventDefault();
        const key = btn.getAttribute('data-project');
        openProjectModal(key);
    });

    // 2. BOUTON "VOIR LE PROJET" (Dans la modal) -> Verrouillé
    const modalLink = document.getElementById('modal-link');
    if (modalLink) {
        modalLink.addEventListener('click', (e) => {
            if (!isUnlocked) {
                e.preventDefault();
                const key = modalLink.getAttribute('data-target-project');
                openGateModal(key);
            }
        });
    }

    // Form submission
    const captureForm = document.getElementById('mockup-capture-form');
    if (captureForm) {
        captureForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-send-code');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
            btn.disabled = true;

            try {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify(Object.fromEntries(new FormData(captureForm)))
                });

                if (response.ok) {
                    document.getElementById('gate-step-1').style.display = 'none';
                    document.getElementById('gate-step-2').style.display = 'block';
                    document.getElementById('gate-step-text').innerHTML = `Super ! Le code d'accès est : <strong style="color:#8b5cf6; font-size:1.2em;">${ACCESS_CODE}</strong><br><small>(Notez-le bien)</small>`;
                }
            } catch (error) {
                console.error("Erreur:", error);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // Code verification
    const verifyBtn = document.getElementById('btn-verify-code');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', () => {
            const input = document.getElementById('access-code-input').value.trim().toUpperCase();
            if (input === ACCESS_CODE) {
                isUnlocked = true;
                localStorage.setItem('portfolio_unlocked', 'true');
                closeAllModals();

                // Si on a un projet en attente, on redirige
                if (pendingProject) {
                    const data = projectDetails[pendingProject];
                    if (data && data.link && data.link !== '#') {
                        // Redirige dans le même onglet pour une expérience fluide
                        window.location.href = data.link;
                    }
                }
            } else {
                alert("Code incorrect. Veuillez réessayer.");
            }
        });
    }

    // --- FAQ TOGGLE ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            // Close other items
            faqItems.forEach(i => {
                i.classList.remove('active');
                const icon = i.querySelector('i');
                if (icon) icon.className = 'fas fa-plus';
            });

            if (!isOpen) {
                item.classList.add('active');
                const icon = item.querySelector('i');
                if (icon) icon.className = 'fas fa-minus';
            }
        });
    });

    // Global Force (for manual testing if needed, but cleaner)
    window.forceShowGate = () => openGateModal();
    window.resetAccess = () => {
        localStorage.removeItem('portfolio_unlocked');
        location.reload();
    };
});
