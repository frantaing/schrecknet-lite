/**
* =================================================================
* Dot Logic
* =================================================================
* Handles all dot interactivity across the sheet:
* - Category dots with priority pools (Attributes, Abilities)
* - Simple fixed-pool dots (Disciplines, Backgrounds, Virtues)
* - Read-only tracker dots (Humanity/Path, Willpower)
*/

/**
* Initializes any section that uses dots and priority dropdowns.
* (e.g. Attributes, Abilities)
*
* @param {string} sectionId - The ID of the main section element.
* @param {string} prioritySelectName - The 'name' attribute of the priority dropdowns.
* @param {object} priorityPointsConfig - Maps priority values to point allocations.
* @param {number} baseDotsPerItem - Default filled dots per item on load (1 for Attributes, 0 for Abilities).
* @param {number} maxDotsPerItem - Hard cap per item during character creation (5 for Attributes, 3 for Abilities).
*/
export function initializeDotCategoryLogic(sectionId, prioritySelectName, priorityPointsConfig, baseDotsPerItem, maxDotsPerItem) {
    const mainSection = document.getElementById(sectionId);
    if (!mainSection) return;

    const categorySections = mainSection.querySelectorAll('.grid > div');
    const priorityDropdowns = mainSection.querySelectorAll(`select[name="${prioritySelectName}"]`);

    const resetDotsForSection = (categoryElement) => {
        categoryElement.querySelectorAll('.dot-group').forEach(group => {
            group.querySelectorAll('.dot').forEach((dot, index) => {
                dot.classList.toggle('filled', index < baseDotsPerItem);
            });
        });
    };

    const updateCounters = () => {
        categorySections.forEach(category => {
            const dropdown = category.querySelector(`select[name="${prioritySelectName}"]`);
            const counterSpan = category.querySelector('h4 span');
            const priority = dropdown.value;
            const allocatedPoints = priorityPointsConfig[priority] || 0;

            const totalBasePoints = category.querySelectorAll('.dot-group').length * baseDotsPerItem;
            const filledDots = category.querySelectorAll('.dot.filled').length;
            const spentPoints = filledDots - totalBasePoints;
            const remainingPoints = allocatedPoints - spentPoints;

            counterSpan.textContent = `(${remainingPoints}/${allocatedPoints})`;
            counterSpan.classList.toggle('text-accent', remainingPoints < 0);
        });
    };

    const handlePriorityChange = (event) => {
        if (document.body.classList.contains('freebie-mode-active')) return;

        const changedSelect = event.target;
        const newValue = changedSelect.value;
        const currentCategorySection = changedSelect.closest('.grid > div');

        resetDotsForSection(currentCategorySection);

        if (newValue) {
            priorityDropdowns.forEach(select => {
                if (select !== changedSelect && select.value === newValue) {
                    select.value = "";
                    resetDotsForSection(select.closest('.grid > div'));
                }
            });
        }

        updateCounters();
    };

    // --- HELPER SUB-FUNCTIONS ---
    const isTryingToSpend = (dot) => !dot.classList.contains('filled');
    const calculateClickCost = (group, dot) => (Array.from(group.children).indexOf(dot) + 1) - group.querySelectorAll('.filled').length;
    const calculateRemainingPoints = (category, priority) => {
        const allocated = priorityPointsConfig[priority] || 0;
        const totalBase = category.querySelectorAll('.dot-group').length * baseDotsPerItem;
        const filled = category.querySelectorAll('.dot.filled').length;
        return allocated - (filled - totalBase);
    };
    const updateDotsInGroup = (group, dot) => {
        const dots = Array.from(group.children);
        const clickIndex = dots.indexOf(dot);
        const isLastFilled = dot.classList.contains('filled') && !dots[clickIndex + 1]?.classList.contains('filled');
        const newScore = isLastFilled ? clickIndex : clickIndex + 1;
        dots.forEach((d, i) => d.classList.toggle('filled', i < newScore || i < baseDotsPerItem));
    };

    const handleDotClick = (event) => {
        if (document.body.classList.contains('freebie-mode-active')) return;

        const clickedDot = event.target;
        if (!clickedDot.matches('.dot')) return;

        const category = clickedDot.closest('.grid > div');
        const dropdown = category.querySelector(`select[name="${prioritySelectName}"]`);
        const priority = dropdown.value;
        const dotGroup = clickedDot.closest('.dot-group');

        if (!priority) {
            console.warn("Cannot assign dots: Please select a priority first.");
            return;
        }

        if (isTryingToSpend(clickedDot)) {
            const dotsInGroup = Array.from(dotGroup.children);
            const clickedDotIndex = dotsInGroup.indexOf(clickedDot);
            const newScore = clickedDotIndex + 1;

            if (maxDotsPerItem && newScore > maxDotsPerItem) {
                console.warn(`Action denied: Cannot be raised above ${maxDotsPerItem} during character creation.`);
                return;
            }

            const cost = calculateClickCost(dotGroup, clickedDot);
            const remainingPoints = calculateRemainingPoints(category, priority);
            if (cost > remainingPoints) {
                console.warn(`Action denied: Costs ${cost}, but only ${remainingPoints} left.`);
                return;
            }
        }

        updateDotsInGroup(dotGroup, clickedDot);
        updateCounters();
    };

    // --- INITIALIZATION ---
    categorySections.forEach(category => {
        resetDotsForSection(category);
        category.addEventListener('click', handleDotClick);
    });
    priorityDropdowns.forEach(select => select.addEventListener('change', handlePriorityChange));
    updateCounters();
}

/**
* Initializes a section with a fixed point pool and optional base dots.
* Also handles inter-section communication for Virtues → Humanity/Willpower.
* (e.g. Disciplines, Backgrounds, Virtues)
*
* @param {string} sectionId - The ID of the section to manage.
* @param {string} selectName - The 'name' attribute of dropdowns in this section.
* @param {number} pointPool - Total points available.
* @param {number} baseDotsPerItem - Default filled dots per item on load.
*/
export function initializeSimpleDotLogic(sectionId, selectName, pointPool, baseDotsPerItem) {
    const mainSection = document.getElementById(sectionId);
    if (!mainSection) return;

    const counterSpan = mainSection.querySelector('h3 span');
    const rowContainer = mainSection.querySelector('.flex.flex-col.gap-3');

    const updateCounter = () => {
        const allDotGroups = mainSection.querySelectorAll('.dot-group');
        let filledDots = 0;
        allDotGroups.forEach(group => {
            filledDots += group.querySelectorAll('.dot.filled').length;
        });

        const totalBasePoints = allDotGroups.length * baseDotsPerItem;
        const spentPoints = filledDots - totalBasePoints;
        const remainingPoints = pointPool - spentPoints;

        if (counterSpan) {
            counterSpan.textContent = remainingPoints;
            counterSpan.classList.toggle('text-accent', remainingPoints < 0);
        }

        // --- INTER-SECTION COMMUNICATION ---
        if (sectionId === 'virtues-section') {
            const conscienceScore = allDotGroups[0]?.querySelectorAll('.dot.filled').length || 0;
            const selfControlScore = allDotGroups[1]?.querySelectorAll('.dot.filled').length || 0;
            const courageScore = allDotGroups[2]?.querySelectorAll('.dot.filled').length || 0;

            const humanityTracker = document.getElementById('humanity-section');
            const willpowerTracker = document.getElementById('willpower-section');

            if (humanityTracker?.setScore) humanityTracker.setScore(conscienceScore + selfControlScore);
            if (willpowerTracker?.setScore) willpowerTracker.setScore(courageScore);
        }

        return remainingPoints;
    };

    const updateDotsInGroup = (group, clickedDot) => {
        const dots = Array.from(group.children);
        const clickIndex = dots.indexOf(clickedDot);

        const isLastFilledDot = clickedDot.classList.contains('filled') && !dots[clickIndex + 1]?.classList.contains('filled');
        if (isLastFilledDot && clickIndex < baseDotsPerItem) {
            console.log("Cannot unfill a base dot.");
            return;
        }

        const newScore = isLastFilledDot ? clickIndex : clickIndex + 1;
        dots.forEach((d, i) => d.classList.toggle('filled', i < newScore || i < baseDotsPerItem));
    };

    const handleDotClick = (event) => {
        if (document.body.classList.contains('freebie-mode-active')) return;

        const clickedDot = event.target;
        if (!clickedDot.matches('.dot')) return;

        const dotGroup = clickedDot.closest('.dot-group');
        const wrapper = clickedDot.closest('.dots-wrapper');

        if (wrapper) {
            const select = wrapper.querySelector(`select[name="${selectName}"]`);
            if (select && !select.value) {
                console.warn("Action denied: Please select an item before assigning dots.");
                return;
            }
        }

        if (!clickedDot.classList.contains('filled')) {
            const currentScore = dotGroup.querySelectorAll('.dot.filled').length;
            const newScore = Array.from(dotGroup.children).indexOf(clickedDot) + 1;
            const cost = newScore - currentScore;
            const remainingPoints = updateCounter();
            if (cost > remainingPoints) {
                console.warn(`Action denied: Costs ${cost}, but only ${remainingPoints} left.`);
                return;
            }
        }

        updateDotsInGroup(dotGroup, clickedDot);
        updateCounter();
    };

    const handleDropdownChange = (event) => {
        if (document.body.classList.contains('freebie-mode-active')) return;

        const changedSelect = event.target;
        if (changedSelect.matches(`select[name="${selectName}"]`)) {
            const wrapper = changedSelect.closest('.dots-wrapper');
            if (wrapper) {
                const dotGroup = wrapper.querySelector('.dot-group');
                if (dotGroup) {
                    Array.from(dotGroup.children).forEach((dot, index) => {
                        dot.classList.toggle('filled', index < baseDotsPerItem);
                    });
                    updateCounter();
                }
            }
        }
    };

    // --- INITIALIZATION ---
    mainSection.addEventListener('click', handleDotClick);
    mainSection.addEventListener('change', handleDropdownChange);

    if (rowContainer) {
        const observer = new MutationObserver((mutationsList) => {
            if (document.body.classList.contains('freebie-mode-active')) return;
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    updateCounter();
                    break;
                }
            }
        });
        observer.observe(rowContainer, { childList: true });
    }

    mainSection.querySelectorAll('.dot-group').forEach(group => {
        Array.from(group.children).forEach((dot, index) => {
            dot.classList.toggle('filled', index < baseDotsPerItem);
        });
    });

    updateCounter();
}

/**
* Initializes a read-only tracker section whose score is set
* programmatically by other sections.
* (e.g. Humanity/Path, Willpower)
*
* @param {string} sectionId - The ID of the section to manage.
*/
export function initializeTrackerDots(sectionId) {
    const mainSection = document.getElementById(sectionId);
    if (!mainSection) return;

    const dotGroup = mainSection.querySelector('.dot-group');
    if (!dotGroup) return;

    const setScore = (newScore) => {
        Array.from(dotGroup.children).forEach((dot, index) => {
            dot.classList.toggle('filled', index < newScore);
        });
    };

    mainSection.setScore = setScore;
}