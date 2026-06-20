/**
* =================================================================
* Freebie Mode
* =================================================================
* Handles the freebie point phase of character creation — activating
* freebie mode, spending/refunding points via dots and merit/flaw
* selections, and resetting all freebie allocations.
*
* Save modal logic lives in export.js.
*/

import { updateSelectColor } from './dropdowns.js';

export function initializeFreebieMode() {
    const state = { isFreebieModeActive: false, freebiePoints: 15 };

    const freebieToggleButton = document.getElementById('freebiePointsButton');
    const freebieCounterDisplay = document.getElementById('freebiePointCounter');
    const freebiePointsSpan = freebieCounterDisplay.querySelector('.span');
    const freebieResetButton = document.getElementById('freebiePointReset');
    const saveSheetButton = document.getElementById('save-sheet-btn');
    const body = document.body;

    // --- POINT CALCULATION ---
    const updateAllCalculations = () => {
        if (!state.isFreebieModeActive) return;

        let meritCost = 0, flawGain = 0;
        document.querySelectorAll('select[name="merit"]').forEach(s => {
            const opt = s.options[s.selectedIndex];
            if (s.value && opt.dataset.cost) meritCost += parseInt(opt.dataset.cost);
        });
        document.querySelectorAll('select[name="flaw"]').forEach(s => {
            const opt = s.options[s.selectedIndex];
            if (s.value && opt.dataset.cost) flawGain += parseInt(opt.dataset.cost);
        });
        const effectiveFlawGain = Math.min(flawGain, 7);

        let dotCost = 0;
        const costs = {
            'attributes-section': 5,
            'abilities-section': 2,
            'disciplines-section': 7,
            'backgrounds-section': 1,
            'virtues-section': 2,
            'humanity-section': 1,
            'willpower-section': 1
        };
        Object.keys(costs).forEach(id => {
            const section = document.getElementById(id);
            if (section) dotCost += section.querySelectorAll('.dot.filled-freebie').length * costs[id];
        });

        state.freebiePoints = 15 - meritCost - dotCost + effectiveFlawGain;
        if (freebiePointsSpan) freebiePointsSpan.textContent = state.freebiePoints;
        updateMeritOptions(state.freebiePoints);
    };

    const updateMeritOptions = (remainingPoints) => {
        document.querySelectorAll('select[name="merit"]').forEach(select => {
            Array.from(select.options).forEach(option => {
                if (!option.value || option.value === select.value) {
                    option.disabled = false;
                return;
                }
                option.disabled = parseInt(option.dataset.cost) > remainingPoints;
            });
        });
    };

    // --- RESET ---
    const resetFreebieState = () => {
        console.log("Resetting all freebie point allocations...");

        document.querySelectorAll('.dot.filled-freebie').forEach(dot => {
            dot.classList.remove('filled', 'filled-freebie');
        });

        document.querySelectorAll('select[name="merit"], select[name="flaw"]').forEach(select => {
            select.value = "";
            updateSelectColor(select);
        });

        const backgroundsContainer = document.getElementById('backgrounds-container');
        if (backgroundsContainer) {
            backgroundsContainer.querySelectorAll('.dots-wrapper').forEach(row => {
                if (row.querySelector('.btn-minus')) row.remove();
            });
        }
    };

    // --- ACTIVATION ---
    const enterFreebieMode = () => {
        state.isFreebieModeActive = true;
        console.log("Freebie Mode Activated.");
        freebieToggleButton.classList.add('hidden');
        freebieCounterDisplay.classList.remove('hidden');
        saveSheetButton.classList.remove('hidden');
        body.classList.add('freebie-mode-active');

        initializeFreebieListeners(state, updateAllCalculations);
        updateAllCalculations();
    };

    freebieToggleButton.addEventListener('click', () => {
        if (!state.isFreebieModeActive && confirm("Are you sure? This will lock your sheet.")) {
            enterFreebieMode();
        }
    });

    freebieResetButton.addEventListener('click', () => {
        if (state.isFreebieModeActive) {
            if (confirm("Are you sure you want to reset all spent freebie points? This cannot be undone.")) {
                resetFreebieState();
                updateAllCalculations();
            }
        }
    });
}

// --- FREEBIE LISTENERS ---
function initializeFreebieListeners(state, onUpdateCallback) {
    const costs = {
        'attributes-section': 5,
        'abilities-section': 2,
        'disciplines-section': 7,
        'backgrounds-section': 1,
        'virtues-section': 2,
        'humanity-section': 1,
        'willpower-section': 1
    };

    document.body.addEventListener('click', (event) => {
        if (!state.isFreebieModeActive || !event.target.matches('.dot')) return;

        const dot = event.target;
        const sectionElement = dot.closest('[data-section-id]');
        if (!sectionElement) return;

        const sectionId = sectionElement.dataset.sectionId;
        if (!costs[sectionId]) return;

        const cost = costs[sectionId];
        const dotGroup = dot.closest('.dot-group');
        const allDots = Array.from(dotGroup.children);
        const clickIndex = allDots.indexOf(dot);
        const currentScore = dotGroup.querySelectorAll('.dot.filled').length;
        const isTryingToSpend = clickIndex >= currentScore;

        if (isTryingToSpend) {
            const dotsToAdd = (clickIndex + 1) - currentScore;
            const totalCost = dotsToAdd * cost;
            if (totalCost > state.freebiePoints) {
                console.warn(`Action denied: Costs ${totalCost}, but you only have ${state.freebiePoints} left.`);
                return;
            }
            for (let i = currentScore; i <= clickIndex; i++) {
                allDots[i].classList.add('filled', 'filled-freebie');
            }
        } else {
            const isLastFilled = !allDots[clickIndex + 1]?.classList.contains('filled');
            const refundIndex = isLastFilled ? clickIndex : clickIndex + 1;
            for (let i = currentScore - 1; i >= refundIndex; i--) {
                if (allDots[i].classList.contains('filled-freebie')) {
                allDots[i].classList.remove('filled', 'filled-freebie');
                }
            }
        }

        onUpdateCallback();
    });

    const meritsFlawsSection = document.getElementById('merits-flaws-section');
    if (meritsFlawsSection) {
        meritsFlawsSection.addEventListener('change', (event) => {
            if (event.target.matches('select[name="merit"], select[name="flaw"]')) {
                onUpdateCallback();
            }
        });
        meritsFlawsSection.addEventListener('click', (event) => {
            if (event.target.matches('.btn-minus, [id^="add-"]')) {
                setTimeout(onUpdateCallback, 50);
            }
        });
    }
}