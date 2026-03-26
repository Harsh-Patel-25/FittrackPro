/**
 * Custom Filters – FitTrack Pro
 * Syllabus: Filters - What is filter, Built-in Filters (Uppercase, Lowercase, Currency,
 *           Limit, OrderBy, Filter, Date, Number), Creating Custom Filters
 */

// ── caloriesFmt Filter ────────────────────────────────────────────────────────
app.filter('caloriesFmt', function () {
  return function (value) {
    if (!value && value !== 0) return '0 kcal';
    value = parseFloat(value);
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k kcal';
    }
    return Math.round(value) + ' kcal';
  };
});

// ── durationFmt Filter ────────────────────────────────────────────────────────
app.filter('durationFmt', function () {
  return function (minutes) {
    if (!minutes) return '0m';
    minutes = parseInt(minutes);
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    if (h > 0) return h + 'h' + (m > 0 ? ' ' + m + 'm' : '');
    return m + 'm';
  };
});

// ── relativeDate Filter ───────────────────────────────────────────────────────
app.filter('relativeDate', function () {
  return function (dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    var now = new Date();
    var diffMs = now - d;
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return diffDays + ' days ago';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
});

// ── macroPercent Filter ───────────────────────────────────────────────────────
app.filter('macroPercent', function () {
  return function (grams, macroType, totalCalories) {
    if (!grams || !totalCalories) return 0;
    var calsPerGram = macroType === 'fat' ? 9 : 4;
    return Math.round((grams * calsPerGram / totalCalories) * 100);
  };
});
