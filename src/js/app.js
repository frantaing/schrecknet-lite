/**
* =================================================================
* SchreckNet Lite — App Entry Point
* =================================================================
* * This file is the sole entry point for v20.html. It imports all
* feature modules and orchestrates their initialization.
*
* Initialization order matters:
* 1. Theme and freebie mode are set up immediately on DOMContentLoaded
* 2. Dropdowns are populated via parallel fetch calls
* 3. All dot logic, dynamic rows, and duplicate managers are initialized
*    only after dropdowns resolve — they depend on populated options
* =================================================================
*/

import { initializeThemeSwitcher } from './theme.js';
import { populateFlatDropdown, populateGroupedDropdown, initializeSelectElementStyling } from './dropdowns.js';
import { manageDuplicateSelections } from './duplicates.js';
import { initializeDynamicRows, getDynamicRowConfigs } from './dynamic-rows.js';
import { initializeDotCategoryLogic, initializeSimpleDotLogic, initializeTrackerDots } from './dots.js';
import { initializeClanDisciplineLogic } from './clan-discipline.js';
import { initializeSaveModal } from './export.js';
import { initializeFreebieMode } from './freebie.js';

document.addEventListener('DOMContentLoaded', () => {

  // --- THEME ---
  initializeThemeSwitcher();

  // --- FREEBIE & SAVE MODAL ---
  initializeFreebieMode();
  initializeSaveModal();

  // --- MERIT/FLAW FORMATTER ---
  const meritFlawFormatter = (optionElement, itemData) => {
    optionElement.textContent = `${itemData.label} (${itemData.cost})`;
    optionElement.dataset.cost = itemData.cost;
  };

  // 1. Populate all dropdowns in parallel
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

  // 2. Initialize everything else only after dropdowns are ready
  Promise.all(populationPromises.filter(Boolean)).then(() => {

    // Tracker dots (read-only; set by virtues)
    initializeTrackerDots('humanity-section');
    initializeTrackerDots('willpower-section');

    // Select styling, clan logic, dynamic rows
    initializeSelectElementStyling();
    initializeClanDisciplineLogic();
    getDynamicRowConfigs(meritFlawFormatter).forEach(config => initializeDynamicRows(config));

    // Priority-based dot logic (Attributes, Abilities)
    initializeDotCategoryLogic('attributes-section', 'attribute-priority', { primary: 7, secondary: 5, tertiary: 3 }, 1, 5);
    initializeDotCategoryLogic('abilities-section', 'ability-priority', { primary: 13, secondary: 9, tertiary: 5 }, 0, 3);

    // Fixed pool dot logic (Disciplines, Backgrounds, Virtues)
    initializeSimpleDotLogic('disciplines-section', 'discipline', 3, 0);
    initializeSimpleDotLogic('backgrounds-section', 'background', 5, 0);
    initializeSimpleDotLogic('virtues-section', '', 7, 1);

    // Duplicate prevention (must run after population)
    manageDuplicateSelections('discipline');
    manageDuplicateSelections('background');
    manageDuplicateSelections('merit');
    manageDuplicateSelections('flaw');
  });
});