/**
* =================================================================
* Export Logic
* =================================================================
* Handles the save modal UI and exporting the character sheet
* as either a print-ready PDF or a .txt file.
*/

// --- TXT GENERATION ---
function generateAndDownloadTxt() {
    let content = [];
    const separator = '\n' + '='.repeat(21);

    const getInputValue = (name) => document.querySelector(`[name="${name}"]`)?.value || 'N/A';
    const getSelectedText = (name) => {
        const select = document.querySelector(`[name="${name}"]`);
        return select?.options[select.selectedIndex]?.text || 'N/A';
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
                    if (name) results.push(`${name}: ${score}`);
                }
            });
        });
        return results;
    };

    const getSelectAndDots = (sectionId, selectName) => {
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
            if (select.value) results.push(select.options[select.selectedIndex].text);
        });
        return results;
    };

    // --- BUILD CONTENT ---
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

    // --- TRIGGER DOWNLOAD ---
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

// --- SAVE MODAL ---
/*
* Initializes the save modal and its export action buttons.
* Extracted from initializeFreebieMode since saving is not
* conceptually part of freebie mode.
*/
export function initializeSaveModal() {
    const saveSheetButton = document.getElementById('save-sheet-btn');
    const saveModalOverlay = document.getElementById('save-modal-overlay');
    const closeModalButton = document.getElementById('close-modal-btn');
    const saveAsPdfButton = document.getElementById('save-as-pdf-btn');
    const saveAsTxtButton = document.getElementById('save-as-txt-btn');

    if (!saveModalOverlay) return;

    const showModal = () => saveModalOverlay.classList.remove('hidden');
    const hideModal = () => saveModalOverlay.classList.add('hidden');

    saveSheetButton.addEventListener('click', showModal);
    closeModalButton.addEventListener('click', hideModal);
    saveModalOverlay.addEventListener('click', (event) => {
        if (event.target === saveModalOverlay) hideModal();
    });

    saveAsPdfButton.addEventListener('click', () => {
        hideModal();
        setTimeout(() => window.print(), 100);
    });

    saveAsTxtButton.addEventListener('click', () => {
        generateAndDownloadTxt();
        hideModal();
    });
}