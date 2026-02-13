document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    const projectDetails = {
        agrosmart: {
            title: "AgroSmart",
            subtitle: "L'agriculture de demain, aujourd'hui",
            description: "AgroSmart est une solution de gestion agricole intelligente conçue pour optimiser le rendement des cultures. Elle intègre des capteurs IoT pour le suivi en temps réel de l'humidité des sols et des conditions climatiques.",
            tags: ["UI/UX Design", "Développement Front-End", "React Native"],
            link: "#",
            icon: "fa-seedling",
            image: "assets/agrosmart/agrosmart/tableau_de_bord_agricole_-_modern_ui/screen.png"
        },
        sungrid: {
            title: "SunGrid",
            subtitle: "Optimisation de l'énergie solaire",
            description: "SunGrid permet aux propriétaires de panneaux solaires de surveiller leur production et consommation d'énergie en temps réel. L'application propose des analyses prédictives pour maximiser l'autoconsommation.",
            tags: ["Mobile App", "UI Design", "Dashboard"],
            link: "#",
            icon: "fa-solar-panel",
            image: "assets/sungrid/web/stitch_sungrid_web/sungrid_agent_dashboard_redesign_1/screen.png"
        },
        nourrici: {
            title: "Nourrici",
            subtitle: "E-commerce alimentaire local",
            description: "Plateforme e-commerce dédiée aux produits alimentaires locaux et biologiques. Interface utilisateur optimisée pour faciliter la découverte de produits, avec un système de panier et de catalogue intelligent.",
            tags: ["UI/UX Design", "E-commerce", "Mobile First"],
            link: "#",
            icon: "fa-shopping-cart",
            image: "assets/Nourrici/user_dashboard/screen.png"
        }
    };

    let isUnlocked = localStorage.getItem('portfolio_unlocked') === 'true';
    let pendingProject = null;

    const projectModal = document.getElementById('project-modal');
    const gateModal = document.getElementById('access-gate');
    const gateForm = document.getElementById('gate-form');
    const sendCodeBtn = document.getElementById('send-code-btn');
    const emailStep = document.getElementById('email-step');
    const codeStep = document.getElementById('code-step');

    function openModal(key) {
        const data = projectDetails[key];
        if (!data) return;

        // Update link
        const modalLink = document.getElementById('modal-link');
        modalLink.href = `project-viewer.html?id=${key}`;

        // Content
        document.getElementById('modal-title').innerText = data.title;
        document.getElementById('modal-subtitle').innerText = data.subtitle;
        document.getElementById('modal-description').innerText = data.description;

        const thumb = projectModal.querySelector('.modal-thumb');
        if (data.image) {
            thumb.innerHTML = `<img src="${data.image}" alt="${data.title}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;
        } else {
            thumb.innerHTML = `<i class="fas ${data.icon}"></i>`;
        }

        const tagsContainer = document.getElementById('modal-tags');
        tagsContainer.innerHTML = '';
        data.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag tag-design';
            span.innerText = tag;
            tagsContainer.appendChild(span);
        });

        projectModal.style.display = 'flex';
        gsap.set(projectModal.querySelector('.modal-content'), { opacity: 0, scale: 0.9 });
        gsap.to(projectModal.querySelector('.modal-backdrop'), { opacity: 1, duration: 0.3 });
        gsap.to(projectModal.querySelector('.modal-content'), { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" });
        document.body.style.overflow = 'hidden';
    }

    function closeModals() {
        const activeModal = projectModal.style.display === 'flex' ? projectModal : (gateModal.style.display === 'flex' ? gateModal : null);
        if (activeModal) {
            gsap.to(activeModal.querySelector('.modal-content'), { opacity: 0, scale: 0.9, duration: 0.3 });
            gsap.to(activeModal.querySelector('.modal-backdrop'), {
                opacity: 0, duration: 0.3, onComplete: () => {
                    activeModal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        }
    }

    if (sendCodeBtn) {
        sendCodeBtn.addEventListener('click', () => {
            const email = document.getElementById('gate-email').value;
            if (email.includes('@')) {
                sendCodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                setTimeout(() => {
                    gsap.to(emailStep, {
                        opacity: 0, y: -10, duration: 0.3, onComplete: () => {
                            emailStep.style.display = 'none';
                            codeStep.style.display = 'block';
                            gsap.fromTo(codeStep, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
                        }
                    });
                }, 800);
            }
        });
    }

    if (gateForm) {
        gateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = document.getElementById('gate-code').value;
            if (code === '1234' || code.length >= 4) {
                isUnlocked = true;
                localStorage.setItem('portfolio_unlocked', 'true');
                closeModals();
                if (pendingProject) {
                    setTimeout(() => openModal(pendingProject), 400);
                    pendingProject = null;
                }
            } else {
                gsap.to(gateForm, { x: -10, duration: 0.1, repeat: 3, yoyo: true });
            }
        });
    }

    document.querySelectorAll('.project-cta').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const key = btn.getAttribute('data-project');
            if (isUnlocked) {
                openModal(key);
            } else {
                pendingProject = key;
                gateModal.style.display = 'flex';
                gsap.set(gateModal.querySelector('.modal-content'), { opacity: 0, scale: 0.9 });
                gsap.to(gateModal.querySelector('.modal-backdrop'), { opacity: 1, duration: 0.3 });
                gsap.to(gateModal.querySelector('.modal-content'), { opacity: 1, scale: 1, duration: 0.4 });
                document.body.style.overflow = 'hidden';
            }
        };
    });

    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
        el.addEventListener('click', closeModals);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModals();
    });

    window.resetAccess = () => {
        localStorage.removeItem('portfolio_unlocked');
        location.reload();
    };

    // --- CUSTOM CURSOR LOGIC ---
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.cursor-follower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    if (cursor && follower) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            gsap.to(cursor, { x: mouseX - 5, y: mouseY - 5, duration: 0.1 });
        });

        const animateFollower = () => {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            gsap.set(follower, { x: followerX - 20, y: followerY - 20 });
            requestAnimationFrame(animateFollower);
        };
        animateFollower();

        document.querySelectorAll('a, button, .project-card, .skill-group').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
        });
    }

    // --- GLOBAL REVEAL ANIMATIONS ---
    gsap.utils.toArray('section > *').forEach(el => {
        gsap.from(el, {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none none"
            }
        });
    });

    const grain = document.querySelector('.grain-overlay');
    if (grain) {
        gsap.to(grain, {
            x: '+=5', y: '+=5', duration: 0.1, repeat: -1, yoyo: true, ease: "none"
        });
    }

    // --- HERO ICONS REPULSION ---
    const floatingIcons = document.querySelectorAll('.floating-icon');
    if (floatingIcons.length > 0) {
        window.addEventListener('mousemove', (e) => {
            const mX = e.clientX;
            const mY = e.clientY;

            floatingIcons.forEach(icon => {
                const rect = icon.getBoundingClientRect();
                const iconX = rect.left + rect.width / 2;
                const iconY = rect.top + rect.height / 2;

                const distX = mX - iconX;
                const distY = mY - iconY;
                const distance = Math.sqrt(distX * distX + distY * distY);

                if (distance < 150) {
                    // Calculate repulsion vector
                    const angle = Math.atan2(distY, distX);
                    const force = (150 - distance) / 2;
                    const repX = -Math.cos(angle) * force;
                    const repY = -Math.sin(angle) * force;

                    gsap.to(icon, {
                        x: repX,
                        y: repY,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                } else {
                    // Return to equilibrium
                    gsap.to(icon, {
                        x: 0,
                        y: 0,
                        duration: 1,
                        ease: "elastic.out(1, 0.3)"
                    });
                }
            });
        });
    }

    // --- TYPING EFFECT ---
    const typedWord = document.getElementById('typed-word');
    if (typedWord) {
        const words = ['captivent', 'inspirent', 'impressionnent', 'marquent', 'transforment'];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeEffect() {
            const currentWord = words[wordIndex];

            if (isDeleting) {
                typedWord.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typedWord.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            let speed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentWord.length) {
                speed = 2000; // Pause at full word
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                speed = 300;
            }

            setTimeout(typeEffect, speed);
        }
        setTimeout(typeEffect, 2000); // Start after entrance animation
    }

    // --- SCROLL SPY ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    if (navLinks.length > 0 && sections.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 150;
                if (window.scrollY >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        });
    }

    // --- HERO PARALLAX ---
    const heroSection = document.querySelector('.hero');
    const photoWrapper = document.querySelector('.photo-wrapper');
    const textContent = document.querySelector('.text-content');

    if (heroSection && photoWrapper && textContent) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            gsap.to(photoWrapper, {
                x: x * 30,
                y: y * 20,
                duration: 0.8,
                ease: "power2.out"
            });

            gsap.to(textContent, {
                x: x * -15,
                y: y * -10,
                duration: 0.8,
                ease: "power2.out"
            });
        });

        heroSection.addEventListener('mouseleave', () => {
            gsap.to([photoWrapper, textContent], {
                x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.5)"
            });
        });
    }

    // --- ANIMATED COUNTERS ---
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.dataset.count);
        const suffix = stat.dataset.suffix || '';

        ScrollTrigger.create({
            trigger: stat,
            start: "top 85%",
            onEnter: () => {
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 2,
                    ease: "power1.out",
                    onUpdate: function () {
                        stat.textContent = Math.ceil(this.targets()[0].val) + suffix;
                    }
                });
            },
            once: true
        });
    });

    // --- CONTACT FORM SUBMISSION ---
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formSuccess = document.getElementById('form-success');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Loading state
            submitBtn.classList.add('loading');
            submitBtn.querySelector('i').style.display = 'none';

            const formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Hide form, show success
                        gsap.to(contactForm, {
                            opacity: 0, y: -20, duration: 0.4,
                            onComplete: () => {
                                contactForm.style.display = 'none';
                                formSuccess.style.display = 'block';
                            }
                        });
                    } else {
                        throw new Error('Submission failed');
                    }
                })
                .catch(error => {
                    submitBtn.classList.remove('loading');
                    submitBtn.querySelector('i').style.display = '';
                    alert('Oups ! Une erreur est survenue. Veuillez réessayer ou m\'envoyer un email directement.');
                    console.error('Form error:', error);
                });
        });
    }
});
