/* IMPORTS */
import { initializeThemeSwitcher } from "./theme";
import { updateSelectColor, populateFlatDropdown, populateGroupedDropdown, initializeSelectElementStyling } from './dropdowns.js';
import { manageDuplicateSelections } from './duplicates.js';
import { initializeDynamicRows, getDynamicRowConfigs } from './dynamic-rows.js';

/**
 * =================================================================
 * SchreckNet Lite - V20 Character Sheet Logic (Enhanced with Freebie Dots)
 * =================================================================
 */

// LOGIC: FREEBIE MODE CONTROLLER
function initializeFreebieMode() {
  const state = { isFreebieModeActive: false, freebiePoints: 15 };

  const freebieToggleButton = document.getElementById('freebiePointsButton');
  const freebieCounterDisplay = document.getElementById('freebiePointCounter');
  const freebiePointsSpan = freebieCounterDisplay.querySelector('.span');
  const freebieResetButton = document.getElementById('freebiePointReset');
  const saveSheetButton = document.getElementById('save-sheet-btn');
  const saveModalOverlay = document.getElementById('save-modal-overlay');
  const closeModalButton = document.getElementById('close-modal-btn');
  const saveAsPdfButton = document.getElementById('save-as-pdf-btn');
  const saveAsTxtButton = document.getElementById('save-as-txt-btn');
  const body = document.body;

  const updateAllCalculations = () => {
    if (!state.isFreebieModeActive) return;

    // 1. Calculate points from Merits & Flaws
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

    // 2. Calculate points from Dots
    let dotCost = 0;
    const costs = { 'attributes-section': 5, 'abilities-section': 2, 'disciplines-section': 7, 'backgrounds-section': 1, 'virtues-section': 2, 'humanity-section': 1, 'willpower-section': 1 };
    Object.keys(costs).forEach(id => {
      const section = document.getElementById(id);
      if (section) dotCost += section.querySelectorAll('.dot.filled-freebie').length * costs[id];
    });

    // 3. Update state, UI, and Merit dropdowns
    state.freebiePoints = 15 - meritCost - dotCost + effectiveFlawGain;
    if (freebiePointsSpan) freebiePointsSpan.textContent = state.freebiePoints;
    updateMeritOptions(state.freebiePoints);
  };

  const updateMeritOptions = (remainingPoints) => {
    document.querySelectorAll('select[name="merit"]').forEach(select => {
      Array.from(select.options).forEach(option => {
        if (!option.value || option.value === select.value) {
          option.disabled = false; return;
        }
        option.disabled = parseInt(option.dataset.cost) > remainingPoints;
      });
    });
  };

  const resetFreebieState = () => {
    console.log("Resetting all freebie point allocations...");

    // 1. Remove all dots that were filled with freebie points.
    // This is safe because base dots from character creation do not have this class.
    document.querySelectorAll('.dot.filled-freebie').forEach(dot => {
      dot.classList.remove('filled', 'filled-freebie');
    });

    // 2. Reset all Merit and Flaw dropdowns to their placeholder.
    document.querySelectorAll('select[name="merit"], select[name="flaw"]').forEach(select => {
      select.value = "";
      // Manually trigger a color update for the now-empty selects.
      if (typeof updateSelectColor === 'function') { // Check if the helper exists
          updateSelectColor(select);
      }
    });

    // 3. Remove any dynamically added rows from Backgrounds.
    // Since Disciplines are locked, we only need to worry about these.
    const backgroundsContainer = document.getElementById('backgrounds-container');
    if (backgroundsContainer) {
      backgroundsContainer.querySelectorAll('.dots-wrapper').forEach(row => {
        // A dynamically added row is one that has a remove button.
        if (row.querySelector('.btn-minus')) {
          row.remove();
        }
      });
    }
    
    // The master update function will be called after this,
    // which will handle recalculating points back to 15.
  };

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
      const confirmation = confirm("Are you sure you want to reset all spent freebie points? This cannot be undone.");
      if (confirmation) {
        resetFreebieState();
        updateAllCalculations();
      }
    }
  });

  // TEXT DOWNLOAD/GENERATE STUFF
  const showModal = () => saveModalOverlay.classList.remove('hidden');
  const hideModal = () => saveModalOverlay.classList.add('hidden');

  saveSheetButton.addEventListener('click', showModal);
  closeModalButton.addEventListener('click', hideModal);
  saveModalOverlay.addEventListener('click', (event) => {
    // Only close if the click is on the overlay itself, not the modal content
    if (event.target === saveModalOverlay) {
      hideModal();
    }
  });

  saveAsPdfButton.addEventListener('click', () => {
    hideModal();
    // Use a small timeout to let the modal disappear before the print dialog appears
    setTimeout(() => {
      window.print();
    }, 100);
  });

  saveAsTxtButton.addEventListener('click', () => {
    generateAndDownloadTxt();
    hideModal();
  });
}

// UTILITY: FREEBIE LISTENERS
function initializeFreebieListeners(state, onUpdateCallback) {
  const costs = { 
    'attributes-section': 5, 'abilities-section': 2, 'disciplines-section': 7, 
    'backgrounds-section': 1, 'virtues-section': 2, 'humanity-section': 1, 'willpower-section': 1 
  };

  // --- DOT CLICK LISTENER (FINAL, ROBUST VERSION) ---
  document.body.addEventListener('click', (event) => {
    if (!state.isFreebieModeActive || !event.target.matches('.dot')) return;

    const dot = event.target;
    
    // THE FIX: Use the explicit data attribute to find the section ID. No more guessing!
    const sectionElement = dot.closest('[data-section-id]');
    if (!sectionElement) return; // Click was not inside a valid freebie zone

    const sectionId = sectionElement.dataset.sectionId;
    if (!costs[sectionId]) return; // Not a section that costs freebie points

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
    } else { // Refunding points
      const isLastFilled = !allDots[clickIndex + 1]?.classList.contains('filled');
      const refundIndex = isLastFilled ? clickIndex : clickIndex + 1;
      
      for (let i = currentScore - 1; i >= refundIndex; i--) {
        if (allDots[i].classList.contains('filled-freebie')) {
          allDots[i].classList.remove('filled', 'filled-freebie');
        }
      }
    }
    
    onUpdateCallback(); // Tell the brain to recalculate everything
  });

  // --- MERIT/FLAW CHANGE LISTENER (This part is already correct) ---
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

// UTILITY: TEXT FILE EXPORT
function generateAndDownloadTxt() {
  let content = [];
  const separator = '\n' + '='.repeat(21);

  const getInputValue = (name) => document.querySelector(`[name="${name}"]`)?.value || 'N/A';
  const getSelectedText = (name) => {
    const select = document.querySelector(`[name="${name}"]`);
    return select?.options[select.selectedIndex]?.text || 'N-A';
  };

  const getStructuredDots = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return [];
    let results = [];
    section.querySelectorAll('.grid > div').forEach(column => {
      const titleElement = column.querySelector('h4');
      const title = titleElement ? titleElement.textContent.trim().split(' ')[0] : 'Unknown';
      let pointsText = titleElement?.querySelector('span')?.textContent.trim() || '';
      if (pointsText) {
        const totalPoints = pointsText.split('/')[1]?.replace(')', '');
        if (totalPoints) pointsText = `(${totalPoints})`;
        else pointsText = '';
      }
      const formattedTitle = `[${title.charAt(0).toUpperCase() + title.slice(1)}] ${pointsText}`.trim();
      results.push(`\n${formattedTitle}`);
      column.querySelectorAll('.dots').forEach(dotRow => {
        let name = '';
        let score = dotRow.querySelectorAll('.dot.filled').length;
        const inputElem = dotRow.querySelector('input');
        if (inputElem) {
          name = inputElem.value.trim();
          if (name || score > 0) {
            const displayName = name || `(${inputElem.placeholder})`;
            results.push(`${displayName}: ${score}`);
          }
          return;
        }
        const spanElem = dotRow.querySelector('span');
        if (spanElem) {
          name = spanElem.textContent.trim();
          if (name) {
            results.push(`${name}: ${score}`);
          }
        }
      });
    });
    return results;
  };

  const getSelectAndDots = (sectionId, selectName) => {
    // ... (this helper remains unchanged)
    const section = document.getElementById(sectionId);
    if (!section) return [];
    let results = [];
    section.querySelectorAll('.dots-wrapper').forEach(row => {
      const select = row.querySelector(`select[name="${selectName}"]`);
      if (select && select.value) {
        const name = select.options[select.selectedIndex].text;
        const score = row.querySelectorAll('.dot.filled').length;
        results.push(`${name}: ${score}`);
      }
    });
    return results;
  };

  const getNamedItems = (selectName) => {
    let results = [];
    document.querySelectorAll(`select[name="${selectName}"]`).forEach(select => {
      if (select.value) {
        results.push(select.options[select.selectedIndex].text);
      }
    });
    return results;
  };

  // --- BUILD THE CONTENT ---
  content.push('SCHRECKNET LITE - V20 CHARACTER SHEET');
  content.push('='.repeat(40));

  content.push('\n[BASICS]');
  content.push(`Name: ${getInputValue('characterName')}`);
  content.push(`Player: ${getInputValue('playerName')}`);
  content.push(`Chronicle: ${getInputValue('chronicle')}`);
  content.push(`Nature: ${getSelectedText('nature')}`);
  content.push(`Demeanor: ${getSelectedText('demeanor')}`);
  content.push(`Concept: ${getInputValue('concept')}`);
  content.push(`Clan: ${getSelectedText('clan')}`);
  content.push(`Generation: ${getSelectedText('generation')}`);
  content.push(`Sire: ${getInputValue('sire')}`);
  content.push(separator);

  content.push('\n[ATTRIBUTES]');
  content.push(...getStructuredDots('attributes-section'));
  content.push(separator);

  content.push('\n[ABILITIES]');
  content.push(...getStructuredDots('abilities-section'));
  content.push(separator);

  content.push('\n[DISCIPLINES]');
  content.push(...getSelectAndDots('disciplines-section', 'discipline'));
  content.push(separator);

  content.push('\n[BACKGROUNDS]');
  content.push(...getSelectAndDots('backgrounds-section', 'background'));
  content.push(separator);
  
  content.push('\n[VIRTUES]');
  document.querySelectorAll('#virtues-section .dots').forEach(dotRow => {
    const name = dotRow.querySelector('span').textContent;
    const score = dotRow.querySelectorAll('.dot.filled').length;
    content.push(`${name}: ${score}`);
  });
  content.push(separator);

  content.push('\n[OTHER TRAITS]');
  content.push(`Humanity/Path: ${document.querySelectorAll('#humanity-section .dot.filled').length}`);
  content.push(`Willpower: ${document.querySelectorAll('#willpower-section .dot.filled').length}`);
  content.push(separator);
  
  content.push('\n[MERITS]');
  content.push(...getNamedItems('merit'));
  content.push(separator);

  content.push('\n[FLAWS]');
  content.push(...getNamedItems('flaw'));
  content.push(separator);

  // --- TRIGGER THE DOWNLOAD ---
  const textContent = content.join('\n');
  const characterName = getInputValue('characterName').trim().replace(/ /g, '_') || 'character';
  const clanName = getSelectedText('clan').trim().replace(/ /g, '_') || 'clanless';
  const filename = `${characterName}_${clanName}_v20.txt`;
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// LOGIC: Clan/Discipline Linking
/**
 * =================================================================
 * CLAN AND DISCIPLINE LOGIC
 * =================================================================
 * Links the Clan dropdown to the three Discipline dropdowns, automatically
 * populating them with the selected clan's in-clan disciplines.
 */
function initializeClanDisciplineLogic() {
  const clanSelect = document.querySelector('select[name="clan"]');
  
  if (!clanSelect) return;

  let clanDisciplinesMap = {};
  let allDisciplinesList = [];

  Promise.all([
    fetch('data/V20/clan_bloodline_disciplines.json').then(res => res.json()),
    fetch('data/V20/disciplines.json').then(res => res.json())
  ])
  .then(([clanDisciplineData, allDisciplinesData]) => {
    clanDisciplinesMap = clanDisciplineData[0];
    allDisciplinesList = allDisciplinesData;
    clanSelect.addEventListener('change', handleClanChange);
    console.log("Clan and Discipline data loaded and ready.");
  })
  .catch(error => console.error("Failed to load clan/discipline data:", error));

  function handleClanChange() {
    // --- DOT & ROW CLEANUP STEP (This part is good, we keep it) ---
    const disciplinesContainer = document.getElementById('disciplines-container');
    if (disciplinesContainer) {
      disciplinesContainer.querySelectorAll('.dots-wrapper').forEach(row => {
        if (row.querySelector('.btn-minus')) row.remove();
      });
      disciplinesContainer.querySelectorAll('.dot').forEach(dot => dot.classList.remove('filled', 'filled-freebie'));
      const disciplineCounter = document.querySelector('#disciplines-section h3 span');
      if (disciplineCounter) {
        disciplineCounter.textContent = '3';
        disciplineCounter.classList.remove('text-accent');
      }
    }

    // --- NEW, NON-DESTRUCTIVE LOGIC ---
    const disciplineSelects = document.querySelectorAll('select[name="discipline"]');
    const selectedClan = clanSelect.value;
    const disciplinesForClan = clanDisciplinesMap[selectedClan] || [];

    // 1. Simply set the values of the initial dropdowns. Do NOT rebuild them.
    disciplineSelects.forEach((select, index) => {
      // We only want to auto-set the initial, permanent dropdowns.
      // A simple way to check is if they DON'T have a remove button next to them.
      const parentWrapper = select.closest('.dots-wrapper');
      if (parentWrapper && !parentWrapper.querySelector('.btn-minus')) {
        select.value = disciplinesForClan[index] || "";
        
        // Manually trigger a color update since we changed the value programmatically.
        updateSelectColor(select);
      }
    });

    // 2. CRITICAL: After changing values, manually trigger our duplicate manager to re-evaluate the page.
    // We dispatch a 'change' event on one of the discipline selects to trigger the duplicate manager
    const firstDisciplineSelect = document.querySelector('select[name="discipline"]');
    if (firstDisciplineSelect) {
      firstDisciplineSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  // updateSelectColor helper
  function updateSelectColor(selectElement) {
    if (selectElement.value === '') {
      selectElement.classList.add('text-textSecondary');
      selectElement.classList.remove('text-textPrimary');
    } else {
      selectElement.classList.add('text-textPrimary');
      selectElement.classList.remove('text-textSecondary');
    }
  }
}

// LOGIC: Fixed point dot-handling
/**
 * =================================================================
 * UPGRADED: SIMPLE DOT & POINT POOL LOGIC (Disciplines, Backgrounds, etc.)
 * =================================================================
 * Handles dot-filling and manages a simple point pool for a given section.
 *
 * @param {string} sectionId - The ID of the specific section div to manage.
 * @param {string} selectName - The 'name' attribute of the dropdowns in this section.
 * @param {number} pointPool - The total number of points available for this section.
 * @param {number} baseDotsPerItem - The number of "free" dots each item starts with.
 */
function initializeSimpleDotLogic(sectionId, selectName, pointPool, baseDotsPerItem) {
  const mainSection = document.getElementById(sectionId);
  if (!mainSection) return;

  const counterSpan = mainSection.querySelector('h3 span');
  const rowContainer = mainSection.querySelector('.flex.flex-col.gap-3');

  // --- COUNTER UPDATE LOGIC (NOW WITH EXTERNAL UPDATES) ---
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
    // If this is the Virtues section, update Humanity and Willpower.
    if (sectionId === 'virtues-section') {
      const conscienceScore = allDotGroups[0]?.querySelectorAll('.dot.filled').length || 0;
      const selfControlScore = allDotGroups[1]?.querySelectorAll('.dot.filled').length || 0;
      const courageScore = allDotGroups[2]?.querySelectorAll('.dot.filled').length || 0;

      const humanityTracker = document.getElementById('humanity-section');
      const willpowerTracker = document.getElementById('willpower-section');

      // **THE FIX**: We now call `setScore` unconditionally. This ensures that when a
      // Virtue dot is UNFILLED, the tracker's score will also DECREASE correctly.
      if (humanityTracker?.setScore) {
        humanityTracker.setScore(conscienceScore + selfControlScore);
      }
      if (willpowerTracker?.setScore) {
        willpowerTracker.setScore(courageScore);
      }
    }

    return remainingPoints;
  };

  // --- DOT CLICK HANDLER (No changes needed here) ---
  const handleDotClick = (event) => {
    // Skip if in freebie mode - freebie logic will handle it
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
  
  // --- HELPER TO UPDATE DOTS (with "unfillable" logic) ---
  // Replace the old updateDotsInGroup helper with this one.
  const updateDotsInGroup = (group, clickedDot) => {
    const dots = Array.from(group.children);
    const clickIndex = dots.indexOf(clickedDot);
    
    // Check if the user is trying to unfill a base dot.
    // This happens if they click on the last filled dot AND that dot is within the base allocation.
    const isLastFilledDot = clickedDot.classList.contains('filled') && !dots[clickIndex + 1]?.classList.contains('filled');
    if (isLastFilledDot && clickIndex < baseDotsPerItem) {
      console.log("Cannot unfill a base dot.");
      return; // STOP, do not allow the unfill action.
    }

    const newScore = isLastFilledDot ? clickIndex : clickIndex + 1;
    
    // The toggle logic now correctly respects the base dots.
    dots.forEach((d, i) => d.classList.toggle('filled', i < newScore || i < baseDotsPerItem));
  };

  // --- DROPDOWN CHANGE HANDLER (No changes needed here) ---
  const handleDropdownChange = (event) => {
    // Skip if in freebie mode
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

  // --- FIX: ADD INITIAL DOT SETUP LOOP ---
  // This loop runs once on page load to set the default state.
  mainSection.querySelectorAll('.dot-group').forEach(group => {
    Array.from(group.children).forEach((dot, index) => {
      dot.classList.toggle('filled', index < baseDotsPerItem);
    });
  });
  // --- END OF FIX ---

  updateCounter(); // Initial counter setup on page load
}

// LOGIC: Dot-tracking (Humanity, WIllpower)
/**
 * =================================================================
 * PURELY VISUAL TRACKER DOT LOGIC (Humanity, Willpower)
 * =================================================================
 * A "display-only" function that renders a score. It has NO user interaction.
 *
 * @param {string} sectionId - The ID of the section to manage.
 */
function initializeTrackerDots(sectionId) {
  const mainSection = document.getElementById(sectionId);
  if (!mainSection) return;

  const dotGroup = mainSection.querySelector('.dot-group');
  if (!dotGroup) return;

  // This is now the ONLY way to change the dots in this section.
  const setScore = (newScore) => {
    Array.from(dotGroup.children).forEach((dot, index) => {
      dot.classList.toggle('filled', index < newScore);
    });
  };

  // User interaction is removed. No more handleDotClick or addEventListener.

  // Expose the setScore function so other functions can call it.
  mainSection.setScore = setScore;
}

// LOGIC: Dynamic point dot-handling
/**
 * =================================================================
 * REUSABLE DOT INTERACTIVITY LOGIC
 * =================================================================
 * This function can initialize any section that uses dots and priorities
 * (e.g., Attributes, Abilities).
 *
 * @param {string} sectionId - The ID of the main <section> element.
 * @param {string} prioritySelectName - The 'name' attribute of the priority dropdowns.
 * @param {object} priorityPointsConfig - An object mapping priorities to point values.
 * @param {number} baseDotsPerItem - The number of "free" dots each item starts with (e.g., 1 for Attributes, 0 for Abilities).
 */
function initializeDotCategoryLogic(sectionId, prioritySelectName, priorityPointsConfig, baseDotsPerItem, maxDotsPerItem) {
  const mainSection = document.getElementById(sectionId);
  if (!mainSection) return; // Exit if the section doesn't exist on the page

  const categorySections = mainSection.querySelectorAll('.grid > div');
  const priorityDropdowns = mainSection.querySelectorAll(`select[name="${prioritySelectName}"]`);

  const resetDotsForSection = (categoryElement) => {
    const dotGroups = categoryElement.querySelectorAll('.dot-group');
    dotGroups.forEach(group => {
      group.querySelectorAll('.dot').forEach((dot, index) => {
        // Use the baseDotsPerItem parameter to determine the default state
        if (index < baseDotsPerItem) {
          dot.classList.add('filled');
        } else {
          dot.classList.remove('filled');
        }
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
    // Skip if in freebie mode
    if (document.body.classList.contains('freebie-mode-active')) return;
    
    const changedSelect = event.target;
    const newValue = changedSelect.value;
    const currentCategorySection = changedSelect.closest('.grid > div');

    // 1. ALWAYS reset the dots for the category whose priority was just changed.
    // This cleans the slate before any other logic runs.
    resetDotsForSection(currentCategorySection);

    // 2. If a new priority was selected (i.e., not the empty placeholder),
    // check if need to "steal" it from another category.
    if (newValue) {
      priorityDropdowns.forEach(select => {
        // Find another dropdown that was using the same priority
        if (select !== changedSelect && select.value === newValue) {
          // Reset its value to the placeholder
          select.value = ""; 
          // And reset its dots as well
          const sectionToReset = select.closest('.grid > div');
          resetDotsForSection(sectionToReset);
        }
      });
    }

    // 3. Finally, update all counters to reflect the new state.
    updateCounters();
  };

  const handleDotClick = (event) => {
    // Skip if in freebie mode - freebie logic will handle it
    if (document.body.classList.contains('freebie-mode-active')) return;
    
    const clickedDot = event.target;
    if (!clickedDot.matches('.dot')) return; // Exit if not a dot

    const category = clickedDot.closest('.grid > div');
    const dropdown = category.querySelector(`select[name="${prioritySelectName}"]`);
    const priority = dropdown.value;
    const dotGroup = clickedDot.closest('.dot-group');

    // Guard Clause #1: Priority Check
    if (!priority) {
      console.warn("Cannot assign dots: Please select a priority first.");
      return;
    }

    if (isTryingToSpend(clickedDot)) {
      // --- NEW GUARD CLAUSE #2: MAX DOTS PER ITEM RULE ---
      const dotsInGroup = Array.from(dotGroup.children);
      const clickedDotIndex = dotsInGroup.indexOf(clickedDot);
      const newScore = clickedDotIndex + 1; // The score the user is trying to set

      // The maxDotsPerItem parameter is a number. If it's provided and the new
      // score exceeds it, deny the action and exit the function.
      if (maxDotsPerItem && newScore > maxDotsPerItem) {
        console.warn(`Action denied: Abilities cannot be raised above ${maxDotsPerItem} during character creation.`);
        return; // STOP
      }
      // --- END NEW GUARD CLAUSE ---

      // Guard Clause #3: Does user have enough points for the cost?
      const cost = calculateClickCost(dotGroup, clickedDot);
      const remainingPoints = calculateRemainingPoints(category, priority);
      if (cost > remainingPoints) {
        console.warn(`Action denied: Costs ${cost}, but only ${remainingPoints} left.`);
        return;
      }
    }
    
    // If all guards are passed, proceed with the update
    updateDotsInGroup(dotGroup, clickedDot);
    updateCounters();
  };

  // Helper sub-functions for handleDotClick
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
  
  // --- INITIALIZATION ---
  categorySections.forEach(category => {
    resetDotsForSection(category); // Set initial state
    category.addEventListener('click', handleDotClick);
  });
  priorityDropdowns.forEach(select => select.addEventListener('change', handlePriorityChange));
  updateCounters();
}

// --- Main Application Setup ---
// This single event listener is the entry point for all initialization code.
document.addEventListener('DOMContentLoaded', () => {

  // --- THEME SWITCHER ---
  initializeThemeSwitcher();

  // --- FREEBIE MODE SETUP ---
  initializeFreebieMode();

  // --- MERIT/FLAW FORMATTER ---
  const meritFlawFormatter = (optionElement, itemData) => {
    optionElement.textContent = `${itemData.label} (${itemData.cost})`;
    optionElement.dataset.cost = itemData.cost;
  };

  // --- INITIALIZE ALL PAGE FEATURES (The Correct Order) ---

  // 1. Populate all the dropdowns that exist when the page first loads.
  const populationPromises = [
    populateFlatDropdown('discipline', 'data/V20/disciplines.json'),
    populateFlatDropdown('background', 'data/V20/backgrounds.json'),
    populateGroupedDropdown('merit', 'data/V20/merits.json', meritFlawFormatter),
    populateGroupedDropdown('flaw', 'data/V20/flaws.json', meritFlawFormatter),
    populateGroupedDropdown('clan', 'data/V20/clan_bloodline.json', null),
    populateGroupedDropdown('paths', 'data/V20/paths.json', null),
    populateFlatDropdown('nature', 'data/V20/nature_demeanor.json'),
    populateFlatDropdown('demeanor', 'data/V20/nature_demeanor.json')
  ];
  
  // 2. Wait for all dropdowns to be populated, then initialize everything else
  Promise.all(populationPromises.filter(p => p !== undefined)).then(() => {

    // Initialize dot trackers
    initializeTrackerDots('humanity-section');
    initializeTrackerDots('willpower-section');

    // Initialize all the dynamic and interactive logic.
    initializeSelectElementStyling();
    initializeClanDisciplineLogic();
    getDynamicRowConfigs(meritFlawFormatter).forEach(config => initializeDynamicRows(config));
    
    // Initialize dynamic dot logic
    initializeDotCategoryLogic('attributes-section', 'attribute-priority', { primary: 7, secondary: 5, tertiary: 3 }, 1, 5);
    initializeDotCategoryLogic('abilities-section', 'ability-priority', { primary: 13, secondary: 9, tertiary: 5 }, 0, 3);

    // Initialize fixed dot logic
    initializeSimpleDotLogic('disciplines-section', 'discipline', 3, 0);
    initializeSimpleDotLogic('backgrounds-section', 'background', 5, 0);
    initializeSimpleDotLogic('virtues-section', '', 7, 1); // No selectName needed, 7 points, 1 base dot

    // Initialize duplicate Management (after everything is populated)
    manageDuplicateSelections('discipline');
    manageDuplicateSelections('background');
    manageDuplicateSelections('merit');
    manageDuplicateSelections('flaw');
  });
});