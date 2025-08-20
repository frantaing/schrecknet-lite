// DROPDOWN: Nature/Demeanor
document.addEventListener('DOMContentLoaded', function() {

  const selectElements = document.querySelectorAll('select[name="nature"], select[name="demeanor"]');

  if (selectElements.length === 0) {
    console.warn('No nature or demeanor select elements found on the page.');
    return;
  }
  
  const jsonPath = 'data/nature_demeanor.json';

  /**
   * A reusable function to populate any given <select> element with data.
   * @param {HTMLSelectElement} selectElement The dropdown element to populate.
   * @param {Array<Object>} data The array of data from the JSON file.
   */
  function populateDropdown(selectElement, data) {
    data.forEach(item => {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label.charAt(0).toUpperCase() + item.label.slice(1);
      selectElement.appendChild(option);
    });
  }

  fetch(jsonPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      selectElements.forEach(dropdown => {
        populateDropdown(dropdown, data);
      });
    })
    .catch(error => {
      console.error('Error fetching or parsing data:', error);
      selectElements.forEach(dropdown => {
        dropdown.innerHTML = '<option value="">Error loading data</option>';
      });
    });

});