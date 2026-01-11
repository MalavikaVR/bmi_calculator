document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bmi-form');
  const weightInput = document.getElementById('weight');
  const heightInput = document.getElementById('height');
  const weightUnit = document.getElementById('weight-unit');
  const heightUnit = document.getElementById('height-unit');
  const resultSection = document.getElementById('result');
  const bmiValueEl = document.querySelector('#bmi-value span');
  const bmiCategoryEl = document.querySelector('#bmi-category span');
  const bmiInfoEl = document.getElementById('bmi-info');

  // Convert weight → kg
  function toKg(weight, unit) {
    if (unit === 'kg') return Number(weight);
    if (unit === 'lb') return Number(weight) * 0.45359237;
    return Number(weight);
  }

  // Convert height → meters
  function toMeters(rawHeight, unit) {
    let meters;

    if (unit === 'm') {
      meters = Number(rawHeight);
      if (!isNaN(meters) && meters > 3) {
        // likely cm mistake
        meters = meters / 100;
        return { meters, autoConvertedFrom: 'cm' };
      }
      return { meters, autoConvertedFrom: null };
    }

    if (unit === 'cm') {
      meters = Number(rawHeight) / 100;
      return { meters, autoConvertedFrom: null };
    }

    if (unit === 'in') {
      meters = Number(rawHeight) * 0.0254;
      return { meters, autoConvertedFrom: null };
    }

    meters = Number(rawHeight);
    return { meters, autoConvertedFrom: null };
  }

  function getCategory(bmi) {
    if (bmi < 18.5)
      return {
        name: 'Underweight',
        color: 'var(--danger)',
        info: 'Your BMI is below the healthy range.'
      };

    if (bmi < 25)
      return {
        name: 'Normal (Healthy weight)',
        color: 'var(--success)',
        info: 'You are within a healthy BMI range. Keep maintaining healthy habits!'
      };

    if (bmi < 30)
      return {
        name: 'Overweight',
        color: '#f59e0b',
        info: 'Your BMI is above the healthy range.'
      };

    return {
      name: 'Obese',
      color: 'var(--danger)',
      info: 'Your BMI is in the obese range.'
    };
  }

  function formatKg(value) {
    return Math.round(value * 10) / 10;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    bmiInfoEl.textContent = '';

    const weightRaw = weightInput.value.trim();
    const heightRaw = heightInput.value.trim();

    if (!weightRaw || isNaN(weightRaw) || Number(weightRaw) <= 0) {
      alert('Please enter a valid weight.');
      weightInput.focus();
      return;
    }

    if (!heightRaw || isNaN(heightRaw) || Number(heightRaw) <= 0) {
      alert('Please enter a valid height.');
      heightInput.focus();
      return;
    }

    const kg = toKg(weightRaw, weightUnit.value);
    const { meters, autoConvertedFrom } = toMeters(heightRaw, heightUnit.value);

    if (isNaN(meters) || meters <= 0) {
      alert('Computed height is invalid. Please check the value and unit.');
      heightInput.focus();
      return;
    }

    const bmi = kg / (meters * meters);
    const rounded = Math.round(bmi * 10) / 10;

    const category = getCategory(rounded);

    // Calculate healthy weight range
    const minHealthy = 18.5 * meters * meters;
    const maxHealthy = 24.9 * meters * meters;

    let recommendationMessage = '';

    if (rounded < 18.5) {
      const needGain = minHealthy - kg;
      recommendationMessage =
        `For your height, a healthy weight range is `
        + `${formatKg(minHealthy)} kg – ${formatKg(maxHealthy)} kg. `
        + `You may need about ${formatKg(needGain)} kg more to reach the healthy range.`;
    } else if (rounded > 24.9) {
      const needLose = kg - maxHealthy;
      recommendationMessage =
        `For your height, a healthy weight range is `
        + `${formatKg(minHealthy)} kg – ${formatKg(maxHealthy)} kg. `
        + `You may need to lose about ${formatKg(needLose)} kg to reach the healthy range.`;
    } else {
      recommendationMessage =
        `For your height, a healthy weight range is `
        + `${formatKg(minHealthy)} kg – ${formatKg(maxHealthy)} kg. `
        + `You are already within the healthy range — great job!`;
    }

    bmiValueEl.textContent = rounded;
    bmiCategoryEl.textContent = category.name;
    bmiCategoryEl.style.color = category.color;

    bmiInfoEl.textContent = `${category.info} ${recommendationMessage}`;

    if (autoConvertedFrom === 'cm') {
      const note = document.createElement('div');
      note.style.marginTop = '6px';
      note.style.fontSize = '0.9rem';
      note.style.color = '#374151';
      note.textContent =
        'Note: You entered height like centimeters but unit was meters — I converted it automatically.';
      bmiInfoEl.appendChild(note);
    }

    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: 'smooth' });
  });

  // RESET HANDLER
  form.addEventListener('reset', () => {
    setTimeout(() => {
      bmiValueEl.textContent = '—';
      bmiCategoryEl.textContent = '—';
      bmiCategoryEl.style.color = '';
      bmiInfoEl.textContent = '';
      resultSection.hidden = true;

      weightUnit.value = 'kg';
      heightUnit.value = 'm';

      weightInput.focus();
    }, 0);
  });
});
