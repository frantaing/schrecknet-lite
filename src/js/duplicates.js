/**
    * =================================================================
    * Duplicate Selection Manager
    * =================================================================
    * Prevents the same option from being selected across multiple
    * dropdowns of the same name. Works with dynamically added rows
    * via MutationObserver.
*/

export function manageDuplicateSelections(selectName) {
    const updateDisabledOptions = () => {
        const allSelectsInGroup = document.querySelectorAll(`select[name="${selectName}"]`);
        if (!allSelectsInGroup.length) return;

        const selectedValues = Array.from(allSelectsInGroup)
        .map(s => s.value)
        .filter(v => v !== "");

        allSelectsInGroup.forEach(select => {
            Array.from(select.options).forEach(option => {
            if (option.value === "" || option.value === select.value) {
                option.disabled = false;
                option.style.color = '';
                return;
            }
                option.disabled = selectedValues.includes(option.value);
                option.style.color = option.disabled ? '#666' : '';
            });
        });
    };

    document.body.addEventListener('change', (event) => {
        if (event.target.matches(`select[name="${selectName}"]`)) {
            updateDisabledOptions();
        }
    });

    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                const checkNodes = (nodes) => {
                    for (let node of nodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.querySelector && node.querySelector(`select[name="${selectName}"]`)) {
                            return true;
                            }
                        }
                    }
                    return false;
                };

                if (checkNodes(mutation.addedNodes) || checkNodes(mutation.removedNodes)) {
                    shouldUpdate = true;
                }
            }
        });

        if (shouldUpdate) {
            setTimeout(updateDisabledOptions, 10);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    updateDisabledOptions();

    return updateDisabledOptions;
}