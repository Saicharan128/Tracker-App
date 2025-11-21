document.addEventListener('DOMContentLoaded', () => {
    // Initial Data Load
    fetchStreak();
    fetchEntries();

    // Set Date
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    // Event Listeners
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetStreak);

    const journalForm = document.getElementById('journal-form');
    if (journalForm) journalForm.addEventListener('submit', saveJournalEntry);

    // Tab Switching Logic
    // Set initial tab
    switchTab('dashboard');

    // Mood Selection Logic
    const moodBtns = document.querySelectorAll('.mood-btn');
    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Reset all buttons
            moodBtns.forEach(b => {
                b.classList.remove('neu-pressed', 'scale-110');
                b.classList.add('neu-btn');
            });

            // Activate clicked button
            btn.classList.remove('neu-btn');
            btn.classList.add('neu-pressed', 'scale-110');

            // Update input
            const moodInput = document.getElementById('mood-input');
            if (moodInput) moodInput.value = btn.dataset.mood;
        });
    });

    // Set default mood active
    if (moodBtns.length > 0) {
        moodBtns[0].click();
    }

    // History Button
    const historyBtn = document.getElementById('history-btn');
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            switchTab('journal');
        });
    }
});

// Timeline Data
const timelineData = {
    0: {
        title: "The Decision",
        desc: "You've made the choice to change. The first step is the most important.",
        symptoms: ["Motivation spike", "Anxiety"],
        benefits: ["Hope", "Self-respect"]
    },
    1: {
        title: "The Urge",
        desc: "The brain starts craving the dopamine hit it's used to. Stay busy.",
        symptoms: ["Strong urges", "Irritability"],
        benefits: ["More time", "Energy"]
    },
    3: {
        title: "The Peak",
        desc: "Testosterone levels may start to rise. Energy increases but so do urges.",
        symptoms: ["Restlessness", "Insomnia"],
        benefits: ["Confidence", "Focus"]
    },
    7: {
        title: "Testosterone Spike",
        desc: "Studies show a peak in testosterone around day 7. You feel powerful.",
        symptoms: ["Aggression", "High energy"],
        benefits: ["Deep voice", "Attraction"]
    },
    14: {
        title: "The Flatline",
        desc: "Your brain is rewiring. You might feel low energy or zero libido. It passes.",
        symptoms: ["Low mood", "Zero libido"],
        benefits: ["Healing", "Rewiring"]
    },
    30: {
        title: "The Reset",
        desc: "A month of discipline. Your dopamine receptors are healing.",
        symptoms: ["Mood swings", "Vivid dreams"],
        benefits: ["Mental clarity", "Self-control"]
    },
    90: {
        title: "The Reboot",
        desc: "The standard reboot period. You are a new person.",
        symptoms: ["None"],
        benefits: ["Freedom", "New Life"]
    }
};

// Tab Switching Function
function switchTab(tabId) {
    // Update Tab Buttons
    ['dashboard', 'analysis', 'insights', 'journal', 'garden'].forEach(id => {
        const btn = document.getElementById(`tab-btn-${id}`);
        if (!btn) return;

        if (id === tabId) {
            btn.classList.remove('neu-tab', 'text-gray-500');
            btn.classList.add('neu-tab-active', 'text-red-500');
        } else {
            btn.classList.remove('neu-tab-active', 'text-red-500');
            btn.classList.add('neu-tab', 'text-gray-500');
        }
    });

    // Update Tab Content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('block');
    });

    const activeContent = document.getElementById(`tab-${tabId}`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
        activeContent.classList.add('block');
    }
}

async function fetchStreak() {
    try {
        const res = await fetch('/api/streak');
        const data = await res.json();
        startTimer(data.start_date);
    } catch (err) {
        console.error('Error fetching streak:', err);
    }
}

let timerInterval;

function startTimer(startDateStr) {
    const startDate = new Date(startDateStr).getTime();

    if (timerInterval) clearInterval(timerInterval);

    function update() {
        const now = new Date().getTime();
        const diff = now - startDate;

        if (diff < 0) {
            updateDisplay(0, 0, 0, 0);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        updateDisplay(days, hours, minutes, seconds);
        updateInsights(days);
        renderAnalysis(days);
        updateGarden(days);
    }

    update(); // Initial call
    timerInterval = setInterval(update, 1000);
}

function updateDisplay(d, h, m, s) {
    const els = {
        days: document.getElementById('streak-days'),
        hours: document.getElementById('streak-hours'),
        minutes: document.getElementById('streak-minutes'),
        seconds: document.getElementById('streak-seconds')
    };

    if (!els.days) return;

    const pad = (n) => n < 10 ? `0${n}` : n;

    els.days.innerText = d;
    els.hours.innerText = pad(h);
    els.minutes.innerText = pad(m);
    els.seconds.innerText = pad(s);
}

function updateGarden(days) {
    // Stages
    // 0: Seed
    // 1-3: Sprout
    // 4-7: Sapling
    // 8-29: Bush
    // 30+: Berries

    const stages = ['seed', 'sprout', 'sapling', 'bush', 'berries'];
    let currentStage = 'seed';
    let nextStageDay = 1;
    let progress = 0;
    let message = "Every giant tree starts as a small seed. Nurture your streak.";

    if (days >= 30) {
        currentStage = 'berries';
        nextStageDay = 90; // Next goal
        progress = 100;
        message = "Your garden is flourishing! Enjoy the fruits of your discipline.";
    } else if (days >= 8) {
        currentStage = 'bush';
        nextStageDay = 30;
        progress = ((days - 8) / (30 - 8)) * 100;
        message = "It's growing stronger every day. Roots are deep.";
    } else if (days >= 4) {
        currentStage = 'sapling';
        nextStageDay = 8;
        progress = ((days - 4) / (8 - 4)) * 100;
        message = "Look at that! It's standing tall.";
    } else if (days >= 1) {
        currentStage = 'sprout';
        nextStageDay = 4;
        progress = ((days - 1) / (4 - 1)) * 100;
        message = "Life finds a way. The first signs of growth.";
    } else {
        currentStage = 'seed';
        nextStageDay = 1;
        progress = 0;
        message = "Potential lies dormant. Waiting for you to begin.";
    }

    // Update UI Text
    const stageText = document.getElementById('plant-stage-text');
    const progressBar = document.getElementById('plant-progress-bar');
    const nextStageText = document.getElementById('plant-next-stage');
    const messageText = document.getElementById('plant-message');

    if (stageText) stageText.innerText = currentStage.charAt(0).toUpperCase() + currentStage.slice(1);
    if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;
    if (nextStageText) nextStageText.innerText = days >= 30 ? "Max Stage Reached!" : `Next stage in ${nextStageDay - days} days`;
    if (messageText) messageText.innerText = `"${message}"`;

    // Toggle SVG Groups
    stages.forEach(stage => {
        const el = document.getElementById(`stage-${stage}`);
        if (el) {
            if (stage === currentStage) {
                el.classList.remove('hidden');
                // Animate entrance if not already visible (simple check)
                if (!el.dataset.visible) {
                    gsap.fromTo(el, { scale: 0, transformOrigin: "bottom center" }, { scale: 1, duration: 1, ease: "elastic.out(1, 0.5)" });
                    el.dataset.visible = "true";
                }
            } else {
                el.classList.add('hidden');
                el.dataset.visible = ""; // Reset
            }
        }
    });

    // Continuous Animations (Sway)
    // We only want to start these once
    if (!window.plantAnimationsStarted) {
        gsap.to(".leaf-sway", { rotation: 5, transformOrigin: "bottom center", duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });
        gsap.to(".bush-sway", { rotation: 2, transformOrigin: "bottom center", duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });
        gsap.fromTo(".berries-pop", { scale: 0.8 }, { scale: 1.1, duration: 0.5, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 0.1 });
        window.plantAnimationsStarted = true;
    }
}

function updateInsights(days) {
    // Find closest milestone
    const milestones = Object.keys(timelineData).map(Number).sort((a, b) => a - b);
    let currentMilestone = milestones[0];

    for (let m of milestones) {
        if (days >= m) currentMilestone = m;
        else break;
    }

    const data = timelineData[currentMilestone];

    // Update UI
    const badge = document.getElementById('insight-day-badge');
    if (badge) badge.innerText = `Day ${days}`;

    const title = document.getElementById('insight-title');
    if (title) title.innerText = data.title;

    const desc = document.getElementById('insight-desc');
    if (desc) desc.innerText = data.desc;

    const symList = document.getElementById('insight-symptoms');
    const benList = document.getElementById('insight-benefits');

    if (symList) symList.innerHTML = data.symptoms.map(s => `<li><i class="fas fa-exclamation-circle text-red-400 mr-2"></i> ${s}</li>`).join('');
    if (benList) benList.innerHTML = data.benefits.map(b => `<li><i class="fas fa-check-circle text-green-500 mr-2"></i> ${b}</li>`).join('');

    // Render Timeline
    const timelineList = document.getElementById('timeline-list');
    if (!timelineList) return;

    let html = '';
    const totalDays = Math.max(days + 7, 90); // Show at least 90 days, or current + buffer

    for (let i = 0; i <= totalDays; i += 7) {
        const weekNum = Math.floor(i / 7) + 1;
        const startDay = i;
        const endDay = Math.min(i + 6, totalDays);
        const isCurrentWeek = days >= startDay && days <= endDay;

        // Accordion Header
        html += `
            <div class="mb-4">
                <div class="accordion-header neu-flat p-4 flex justify-between items-center ${isCurrentWeek ? 'active' : ''}" onclick="toggleAccordion(this)">
                    <h4 class="font-bold text-gray-700">Week ${weekNum} <span class="text-xs text-gray-400 font-normal ml-2">(Days ${startDay}-${endDay})</span></h4>
                    <i class="fas fa-chevron-down text-gray-400 accordion-icon"></i>
                </div>
                <div class="accordion-content ${isCurrentWeek ? 'active' : ''}">
                    <div class="pl-4 pt-4 space-y-6 border-l-2 border-gray-300 ml-4 mt-2">
        `;

        // Days within the week
        for (let d = startDay; d <= endDay; d++) {
            const isPast = days >= d;
            const isToday = days === d;
            const dayData = timelineData[d];
            const dayTitle = dayData ? dayData.title : "Keep Going";
            const dayDesc = dayData ? "" : "Stay strong and focused."; // Minimal text for generic days

            html += `
                <div class="relative pl-6 pb-2">
                    <div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${isToday ? 'bg-red-500 ring-4 ring-red-200' : (isPast ? 'bg-red-400' : 'bg-gray-300')} shadow-md z-10"></div>
                    <div class="${isPast ? 'text-gray-700' : 'text-gray-400'} ${isToday ? 'transform scale-105 origin-left transition-transform' : ''}">
                        <span class="text-xs font-bold uppercase tracking-wider ${isToday ? 'text-red-500' : ''}">Day ${d}</span>
                        <h5 class="font-bold text-sm ${isToday ? 'text-lg' : ''}">${dayTitle}</h5>
                        ${dayData ? `<p class="text-xs text-gray-500 mt-1">${dayData.desc.substring(0, 50)}...</p>` : ''}
                    </div>
                </div>
            `;
        }

        html += `
                    </div>
                </div>
            </div>
        `;
    }

    timelineList.innerHTML = html;
}

// Helper for Accordion
function toggleAccordion(header) {
    header.classList.toggle('active');
    const content = header.nextElementSibling;
    content.classList.toggle('active');
}

function renderAnalysis(days) {
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    const weeksEl = document.getElementById('analysis-weeks');
    const monthsEl = document.getElementById('analysis-months');
    const weeksBar = document.getElementById('analysis-weeks-bar');
    const monthsBar = document.getElementById('analysis-months-bar');

    if (weeksEl) weeksEl.innerText = weeks;
    if (monthsEl) monthsEl.innerText = months;

    // Simple progress visualization (capped at 100% for visual effect if desired, or relative to a goal)
    if (weeksBar) weeksBar.style.width = `${Math.min((weeks / 52) * 100, 100)}%`;
    if (monthsBar) monthsBar.style.width = `${Math.min((months / 12) * 100, 100)}%`;
}

async function resetStreak() {
    showConfirmModal(
        'Reset Streak?',
        'Are you sure you want to reset your hard-earned streak? This cannot be undone.',
        async () => {
            try {
                const res = await fetch('/api/start', { method: 'POST' });
                const data = await res.json();

                // Shake animation for reset
                const container = document.querySelector('.grid-cols-4');
                if (container) {
                    gsap.to(container, {
                        x: [-10, 10, -10, 10, 0],
                        duration: 0.5,
                        ease: 'power1.inOut',
                        onComplete: () => startTimer(data.start_date)
                    });
                } else {
                    startTimer(data.start_date);
                }
            } catch (err) {
                console.error('Error resetting streak:', err);
            }
        }
    );
}

async function saveJournalEntry(e) {
    e.preventDefault();
    const moodInput = document.getElementById('mood-input');
    const noteInput = document.getElementById('note-input');

    if (!moodInput || !noteInput) return;

    const mood = moodInput.value;
    const note = noteInput.value;

    if (!note.trim()) {
        showConfirmModal('Please write a note', 'Your journal entry cannot be empty.', () => { }, true);
        return;
    }

    try {
        const res = await fetch('/api/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mood, note })
        });

        if (res.ok) {
            noteInput.value = '';
            fetchEntries(); // Refresh list

            // Smooth success feedback
            const btn = document.querySelector('#journal-form button');
            if (btn) {
                const icon = btn.querySelector('i');
                gsap.to(btn, { scale: 0.98, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.inOut' });
                if (icon) gsap.to(icon, { rotation: 360, duration: 0.8, ease: 'power3.inOut' });
            }
        }
    } catch (err) {
        console.error('Error saving entry:', err);
    }
}

async function fetchEntries() {
    try {
        const res = await fetch('/api/journal');
        const entries = await res.json();
        renderEntries(entries);
    } catch (err) {
        console.error('Error fetching entries:', err);
    }
}

function renderEntries(entries) {
    const containers = [
        document.getElementById('entries-list'),
        document.getElementById('full-entries-list')
    ];

    containers.forEach(container => {
        if (!container) return;

        container.innerHTML = '';

        if (entries.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-400 py-8 text-sm font-medium">No entries yet. Start journaling!</div>';
            return;
        }

        entries.forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'neu-pressed p-4 rounded-xl mb-4 flex items-start gap-4 group hover:bg-gray-200/50 transition-colors relative';
            div.innerHTML = `
                <div class="text-2xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                    ${entry.mood}
                </div>
                <div class="flex-grow">
                    <div class="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">${new Date(entry.date).toLocaleDateString()}</div>
                    <p class="text-sm text-gray-600 font-semibold leading-relaxed">${entry.note}</p>
                </div>
                <button onclick="deleteEntry(${entry.id}, this)" class="text-gray-400 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100 absolute top-2 right-2">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            container.appendChild(div);

            // Smooth Staggered slide-in
            gsap.from(div, {
                y: 30,
                opacity: 0,
                duration: 0.8,
                delay: index * 0.08,
                ease: 'power3.out'
            });
        });
    });
}

function deleteEntry(id, btn) {
    showConfirmModal(
        'Delete Entry?',
        'Are you sure you want to delete this journal entry?',
        async () => {
            try {
                const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    const card = btn.closest('.neu-pressed');
                    gsap.to(card, {
                        opacity: 0,
                        y: -20,
                        scale: 0.9,
                        duration: 0.3,
                        ease: 'power2.in',
                        onComplete: () => {
                            card.remove();
                            // Check if empty
                            const container = document.getElementById('entries-list');
                            if (container.children.length === 0) {
                                container.innerHTML = '<div class="text-center text-gray-400 py-8 text-sm font-medium">No entries yet. Start journaling!</div>';
                            }
                        }
                    });
                }
            } catch (err) {
                console.error('Error deleting entry:', err);
            }
        }
    );
}

// Custom Modal Logic
function showConfirmModal(title, message, onConfirm, isAlert = false) {
    const modal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm');
    const cancelBtn = document.getElementById('modal-cancel');
    const backdrop = document.getElementById('modal-backdrop');

    if (!modal || !modalTitle || !modalMessage || !confirmBtn || !cancelBtn) return;

    // Set Content
    modalTitle.innerText = title;
    modalMessage.innerText = message;

    if (isAlert) {
        cancelBtn.style.display = 'none';
        confirmBtn.innerText = 'OK';
    } else {
        cancelBtn.style.display = 'block';
        confirmBtn.innerText = 'Confirm';
    }

    // Show Modal
    modal.classList.add('modal-open');

    // Handlers
    const close = () => {
        modal.classList.remove('modal-open');
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        backdrop.onclick = null;
    };

    confirmBtn.onclick = () => {
        onConfirm();
        close();
    };

    cancelBtn.onclick = close;
    backdrop.onclick = close;
}
