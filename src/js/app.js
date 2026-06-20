/* IMPORTS */
import { initializeThemeSwitcher } from "./theme";
import { updateSelectColor, populateFlatDropdown, populateGroupedDropdown, initializeSelectElementStyling } from './dropdowns.js';
import { manageDuplicateSelections } from './duplicates.js';
import { initializeDynamicRows, getDynamicRowConfigs } from './dynamic-rows.js';
import { initializeDotCategoryLogic, initializeSimpleDotLogic, initializeTrackerDots } from './dots.js';
import { initializeClanDisciplineLogic } from './clan-discipline.js';
import { initializeSaveModal } from './export.js';
import { initializeFreebieMode } from './freebie.js';

// --- Main Application Setup ---
// This single event listener is the entry point for all initialization code.
document.addEventListener('DOMContentLoaded', () => {

  // --- THEME SWITCHER ---
  initializeThemeSwitcher();

  // --- FREEBIE MODE SETUP ---
  initializeFreebieMode();
  initializeFreebieMode();
  initializeSaveModal();

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