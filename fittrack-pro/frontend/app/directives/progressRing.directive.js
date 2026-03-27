/**
 * Custom Directives – FitTrack Pro
 * Syllabus: What is directive, Built-in Directives (ng-repeat, ng-options, ng-disabled,
 *           ng-show, ng-hide, ng-click, ng-change, ng-mouseover, ng-keyup etc.),
 *           Event Directives, Creating Custom Directive
 */

// ── progressRing Directive ────────────────────────────────────────────────────
// Usage: <progress-ring percent="75" color="#22C55E" size="80"></progress-ring>
app.directive('progressRing', function () {
  return {
    restrict: 'E',
    scope: {
      percent: '=',
      color:   '@',
      size:    '@',
      label:   '@'
    },
    template:
      '<div class="progress-ring-wrap" ng-style="{width: sz+\'px\', height: sz+\'px\'}">' +
        '<svg ng-attr-viewBox="0 0 {{sz}} {{sz}}" xmlns="http://www.w3.org/2000/svg">' +
          '<circle ng-attr-cx="{{half}}" ng-attr-cy="{{half}}" ng-attr-r="{{r}}" ' +
            'fill="none" stroke="#334155" ng-attr-stroke-width="{{sw}}"/>' +
          '<circle ng-attr-cx="{{half}}" ng-attr-cy="{{half}}" ng-attr-r="{{r}}" ' +
            'fill="none" ng-attr-stroke="{{ringColor}}" ng-attr-stroke-width="{{sw}}" ' +
            'stroke-linecap="round" ' +
            'ng-attr-stroke-dasharray="{{dash}}" ' +
            'ng-attr-stroke-dashoffset="{{offset}}" ' +
            'ng-attr-transform="rotate(-90 {{half}} {{half}})"/>' +
        '</svg>' +
        '<div class="ring-inner">' +
          '<span class="ring-pct">{{percent | number:0}}%</span>' +
          '<span class="ring-lbl" ng-if="label">{{label}}</span>' +
        '</div>' +
      '</div>',
    link: function (scope) {
      scope.$watch('percent', function () {
        var sz   = parseInt(scope.size) || 80;
        var sw   = sz * 0.08;
        var r    = (sz - sw) / 2;
        var circ = 2 * Math.PI * r;
        var pct  = Math.min(Math.max(parseFloat(scope.percent) || 0, 0), 100);

        scope.sz     = sz;
        scope.half   = sz / 2;
        scope.r      = r;
        scope.sw     = sw;
        scope.dash   = circ;
        scope.offset = circ - (pct / 100) * circ;
        scope.ringColor = scope.color || '#22C55E';
      });
    }
  };
});

// ── statCard Directive ────────────────────────────────────────────────────────
// Usage: <stat-card icon="🔥" value="2000" label="Calories" unit="kcal" progress="65"></stat-card>
app.directive('statCard', function () {
  return {
    restrict: 'E',
    scope: {
      icon:     '@',
      value:    '=',
      label:    '@',
      unit:     '@',
      progress: '=',
      color:    '@'
    },
    template:
      '<div class="stat-card">' +
        '<div class="stat-top">' +
          '<span class="stat-icon"><i class="fa-solid {{icon}}"></i></span>' +
        '</div>' +
        '<div class="stat-value">{{value | number:0}}<span class="stat-unit" ng-if="unit"> {{unit}}</span></div>' +
        '<div class="stat-label">{{label}}</div>' +
        '<div class="stat-bar">' +
          '<div class="stat-fill" ng-class="\'fill-\'+(color||\'green\')" ' +
               'ng-style="{width: clampPct(progress) + \'%\'}"></div>' +
        '</div>' +
      '</div>',
    link: function (scope) {
      scope.clampPct = function (v) {
        return Math.min(Math.max(parseFloat(v) || 0, 0), 100);
      };
    }
  };
});

// ── barChart Directive ─────────────────────────────────────────────────────────
// Usage: <bar-chart data="chartData" color="#22C55E" height="160"></bar-chart>
app.directive('barChart', function () {
  return {
    restrict: 'E',
    scope: {
      data:   '=',
      color:  '@',
      height: '@'
    },
    template: '<div class="bar-chart-wrap"><svg ng-attr-viewBox="0 0 600 {{h}}" xmlns="http://www.w3.org/2000/svg" width="100%" ng-attr-height="{{h}}">' +
      '<defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" ng-attr-stop-color="{{barColor}}"/>' +
        '<stop offset="100%" ng-attr-stop-color="{{barColor}}" stop-opacity="0.4"/>' +
      '</linearGradient></defs>' +
      '<g ng-repeat="bar in bars">' +
        '<rect ng-attr-x="{{bar.x}}" ng-attr-y="{{bar.y}}" ng-attr-width="{{bar.w}}" ng-attr-height="{{bar.barH}}" rx="4" fill="url(#barGrad)" opacity="0.9">' +
          '<title>{{bar.label}}: {{bar.raw}}</title>' +
        '</rect>' +
        '<text ng-if="$index % 5 === 0" ng-attr-x="{{bar.x + bar.w/2}}" ng-attr-y="{{h-2}}" text-anchor="middle" font-size="9" fill="#64748b">{{bar.label}}</text>' +
      '</g>' +
      '<text ng-if="!bars.length" x="300" ng-attr-y="{{h/2}}" text-anchor="middle" font-size="13" fill="#64748b">No data available</text>' +
    '</svg></div>',
    link: function (scope) {
      scope.h = parseInt(scope.height) || 160;
      scope.barColor = scope.color || '#22C55E';

      scope.$watch('data', function (data) {
        if (!data || !data.length) { scope.bars = []; return; }
        var maxVal = Math.max.apply(null, data.map(function (d) { return d.value || 0; })) || 1;
        var total  = data.length;
        var w      = 600 / total;
        var pad    = 2;
        var chartH = scope.h - 14;

        scope.bars = data.map(function (d, i) {
          var barH = d.value ? Math.max((d.value / maxVal) * chartH, 3) : 0;
          return {
            x:    i * w + pad,
            y:    chartH - barH,
            w:    w - pad * 2,
            barH: barH,
            label: d.label,
            raw:   d.value
          };
        });
      }, true);
    }
  };
});

// ── lineChart Directive ────────────────────────────────────────────────────────
app.directive('lineChart', function () {
  return {
    restrict: 'E',
    scope: {
      data:  '=',
      color: '@'
    },
    template:
      '<div class="line-chart-wrap">' +
        '<svg viewBox="0 0 600 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="160">' +
          '<!-- goal line -->' +
          '<line x1="0" y1="80" x2="600" y2="80" ng-attr-stroke="{{lineColor}}" stroke-width="1" stroke-dasharray="4 4" opacity="0.3"/>' +
          '<polyline ng-if="points.length" ng-attr-points="{{polyPoints}}" fill="none" ng-attr-stroke="{{lineColor}}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<circle ng-repeat="p in points" ng-attr-cx="{{p.x}}" ng-attr-cy="{{p.y}}" r="3.5" ng-attr-fill="{{lineColor}}">' +
            '<title>{{p.label}}: {{p.raw}}</title>' +
          '</circle>' +
          '<text ng-if="!points.length" x="300" y="80" text-anchor="middle" font-size="13" fill="#64748b">No data available</text>' +
        '</svg>' +
      '</div>',
    link: function (scope) {
      scope.lineColor = scope.color || '#38BDF8';

      scope.$watch('data', function (data) {
        if (!data || !data.length) { scope.points = []; scope.polyPoints = ''; return; }
        var maxVal = Math.max.apply(null, data.map(function (d) { return d.value || 0; })) || 1;
        var total  = data.length;
        var step   = 600 / Math.max(total - 1, 1);
        var chartH = 145;

        scope.points = data.map(function (d, i) {
          return {
            x:     i * step,
            y:     chartH - (d.value / maxVal) * chartH,
            label: d.label,
            raw:   d.value
          };
        });
        scope.polyPoints = scope.points.map(function (p) { return p.x + ',' + p.y; }).join(' ');
      }, true);
    }
  };
});
