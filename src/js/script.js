// DROPDOWN: Nature/Demeanor json
// # Links 'nature_demeanor.json' to the Nature/Demeanor dropdowns
// # Also makes sure placeholder options are not overridden
document.addEventListener('DOMContentLoaded', function() {

  const selectElements = document.querySelectorAll('select[name="nature"], select[name="demeanor"]');

  if (selectElements.length === 0) {
    return;
  }
  
  const jsonPath = 'data/nature_demeanor.json';

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
        
        dropdown.value = ""; 
      });
    })
    .catch(error => {
      console.error('Error fetching or parsing data:', error);
      selectElements.forEach(dropdown => {
        dropdown.innerHTML = '<option value="">Error loading data</option>';
      });
    });

});

// DROPDOWN: Text color
// # Dynamically styles the <select> 'placeholder'
function initializeSelectElementStyling() {
  const allSelects = document.querySelectorAll('select');

  const updateSelectColor = (selectElement) => {
    if (selectElement.value === '') {
      selectElement.classList.add('text-textSecondary');
      selectElement.classList.remove('text-textPrimary');
    } else {
      selectElement.classList.add('text-textPrimary');
      selectElement.classList.remove('text-textSecondary');
    }
  };

  allSelects.forEach(select => {
    updateSelectColor(select);

    select.addEventListener('change', (event) => {
      updateSelectColor(event.currentTarget);
    });
  });
}

document.addEventListener('DOMContentLoaded', initializeSelectElementStyling);