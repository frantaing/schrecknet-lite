/*
* =================================================================
* Dynamic Row Manager
* =================================================================
* Handles adding and removing templated rows for disciplines,
* backgrounds, merits, and flaws. Includes row templates and
* section configurations.
*/

import { populateFlatDropdown, populateGroupedDropdown, initializeSelectElementStyling } from './dropdowns.js';

// --- ROW TEMPLATES ---
export const disciplineTemplate = `
    <div class="dots-custom">
        <div class="relative flex items-center justify-center group ml-10 gap-2">
            <select name="discipline" class="dropdown-custom"><option value="" disabled selected hidden>discipline</option></select>
            <button class="btn-minus">-</button>
        </div>
        <div class="dot-group"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
    </div>
`;

export const backgroundTemplate = `
    <div class="dots-custom">
        <div class="relative flex items-center justify-center group ml-10 gap-2">
            <select name="background" class="dropdown-custom"><option value="" disabled selected hidden>background</option></select>
            <button class="btn-minus">-</button>
        </div>
        <div class="dot-group"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
    </div>
`;

export const meritTemplate = `
    <div class="merit-flaw-wrapper relative flex items-center justify-center group ml-10 gap-2">
        <select name="merit" class="dropdown-custom">
            <option value="" disabled selected hidden>merit</option>
        </select>
        <button class="btn-minus">-</button>
    </div>
`;

export const flawTemplate = `
    <div class="merit-flaw-wrapper relative flex items-center justify-center group ml-10 gap-2">
        <select name="flaw" class="dropdown-custom">
            <option value="" disabled selected hidden>flaw</option>
        </select>
        <button class="btn-minus">-</button>
    </div>
`;

// --- POST-ADD CALLBACK ---
function setupNewDropdown(newRow, selectName, jsonPath, isGrouped, formatter) {
    const newSelect = newRow.querySelector(`select[name="${selectName}"]`);
    if (!newSelect) return;

    const populationPromise = isGrouped
        ? populateGroupedDropdown(selectName, jsonPath, formatter, newSelect)
        : populateFlatDropdown(selectName, jsonPath, newSelect);

    if (populationPromise) {
        populationPromise.then(() => initializeSelectElementStyling(newSelect));
    } else {
        initializeSelectElementStyling(newSelect);
    }
}

// --- SECTION CONFIGS ---
export const getDynamicRowConfigs = (meritFlawFormatter) => [
    {
        sectionId: 'disciplines-backgrounds-section',
        addButtonSelector: '#add-discipline-btn',
        rowContainerSelector: '#disciplines-container',
        rowWrapperClass: 'dots-wrapper',
        rowWrapperSelector: '.dots-wrapper',
        templateHTML: disciplineTemplate,
        postAddCallback: (newRow) => setupNewDropdown(newRow, 'discipline', 'data/V20/disciplines.json', false, null)
    },
    {
        sectionId: 'disciplines-backgrounds-section',
        addButtonSelector: '#add-background-btn',
        rowContainerSelector: '#backgrounds-container',
        rowWrapperClass: 'dots-wrapper',
        rowWrapperSelector: '.dots-wrapper',
        templateHTML: backgroundTemplate,
        postAddCallback: (newRow) => setupNewDropdown(newRow, 'background', 'data/V20/backgrounds.json', false, null)
    },
    {
        sectionId: 'merits-flaws-section',
        addButtonSelector: '#add-merit-btn',
        rowContainerSelector: '#merits-container',
        rowWrapperClass: 'merit-flaw-wrapper',
        rowWrapperSelector: '.merit-flaw-wrapper',
        templateHTML: meritTemplate,
        postAddCallback: (newRow) => setupNewDropdown(newRow, 'merit', 'data/V20/merits.json', true, meritFlawFormatter)
    },
    {
        sectionId: 'merits-flaws-section',
        addButtonSelector: '#add-flaw-btn',
        rowContainerSelector: '#flaws-container',
        rowWrapperClass: 'merit-flaw-wrapper',
        rowWrapperSelector: '.merit-flaw-wrapper',
        templateHTML: flawTemplate,
        postAddCallback: (newRow) => setupNewDropdown(newRow, 'flaw', 'data/V20/flaws.json', true, meritFlawFormatter)
    }
];

// --- CORE FUNCTION ---
/**
* Initializes a section to allow adding and removing templated rows.
*
* @param {object} config - The configuration object for the section.
* @param {string} config.sectionId - The ID of the parent section.
* @param {string} config.addButtonSelector - The selector for the "add new" button.
* @param {string} config.rowContainerSelector - The selector for the container to add rows to.
* @param {string} config.rowWrapperClass - The class name for the wrapper element of each new row.
* @param {string} config.rowWrapperSelector - The selector used to find the row wrapper to remove.
* @param {string} config.templateHTML - The inner HTML of a single row to be added.
* @param {function} [config.postAddCallback] - An optional function to run after a row is added.
*/
export function initializeDynamicRows(config) {
    const section = document.getElementById(config.sectionId);
    if (!section) return;

    const addButton = section.querySelector(config.addButtonSelector);
    const rowContainer = section.querySelector(config.rowContainerSelector);
    if (!addButton || !rowContainer) return;

    rowContainer.addEventListener('click', (event) => {
        if (event.target.matches('.btn-minus')) {
            event.target.closest(config.rowWrapperSelector).remove();
        }
    });

    addButton.addEventListener('click', (event) => {
        event.preventDefault();

        const newRow = document.createElement('div');
        newRow.className = config.rowWrapperClass;
        newRow.innerHTML = config.templateHTML;

        rowContainer.insertBefore(newRow, addButton.parentElement);

        if (config.postAddCallback) {
            config.postAddCallback(newRow);
        }
    });
}