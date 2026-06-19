/*
* =================================================================
* Clan & Discipline Logic
* =================================================================
* Links the Clan dropdown to the three initial Discipline dropdowns,
* auto-populating them with the selected clan's in-clan disciplines.
* Also resets dots and dynamic rows on clan change.
*/

import { updateSelectColor } from './dropdowns.js';

/*
* Initializes the clan/discipline linking logic.
* Depends on clan and discipline data being already populated
* in the dropdowns before this is called.
*/
export function initializeClanDisciplineLogic() {
    const clanSelect = document.querySelector('select[name="clan"]');
    if (!clanSelect) return;

    let clanDisciplinesMap = {};

    Promise.all([
        fetch('data/V20/clan_bloodline_disciplines.json').then(res => res.json()),
        fetch('data/V20/disciplines.json').then(res => res.json())
    ])
    .then(([clanDisciplineData]) => {
        clanDisciplinesMap = clanDisciplineData[0];
        clanSelect.addEventListener('change', handleClanChange);
        console.log("Clan and Discipline data loaded and ready.");
    })
    .catch(error => console.error("Failed to load clan/discipline data:", error));

    function handleClanChange() {
        // --- RESET DOTS & DYNAMIC ROWS ---
        const disciplinesContainer = document.getElementById('disciplines-container');
        if (disciplinesContainer) {
            disciplinesContainer.querySelectorAll('.dots-wrapper').forEach(row => {
                if (row.querySelector('.btn-minus')) row.remove();
            });
            disciplinesContainer.querySelectorAll('.dot').forEach(dot => {
                dot.classList.remove('filled', 'filled-freebie');
            });
            const disciplineCounter = document.querySelector('#disciplines-section h3 span');
            if (disciplineCounter) {
                disciplineCounter.textContent = '3';
                disciplineCounter.classList.remove('text-accent');
            }
        }

        // --- AUTO-POPULATE INITIAL DISCIPLINE DROPDOWNS ---
        const selectedClan = clanSelect.value;
        const disciplinesForClan = clanDisciplinesMap[selectedClan] || [];

        document.querySelectorAll('select[name="discipline"]').forEach((select, index) => {
            const parentWrapper = select.closest('.dots-wrapper');
            if (parentWrapper && !parentWrapper.querySelector('.btn-minus')) {
                select.value = disciplinesForClan[index] || "";
                updateSelectColor(select);
            }
        });

        // --- NOTIFY DUPLICATE MANAGER ---
        const firstDisciplineSelect = document.querySelector('select[name="discipline"]');
        if (firstDisciplineSelect) {
            firstDisciplineSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}