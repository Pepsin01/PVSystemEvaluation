// Calendar Heatmap — daily PV production
// Data: data/daily_production.json  →  [{date: "YYYY-MM-DD", value: kWh}, ...]

(function () {
  const CELL  = 13;
  const GAP   = 2;
  const STEP  = CELL + GAP;
  const MONTH_LABEL_H = 20;
  const YEAR_LABEL_W  = 34;
  const ROW_PAD       = 28;

  const container = document.getElementById('calendar-heatmap');

  d3.json('data/daily_production.json').then(rawData => {
    const parseDate = d3.timeParse('%Y-%m-%d');
    rawData.forEach(d => {
      d.date  = parseDate(d.date);
      d.value = +d.value;
    });

    const byDate = new Map(rawData.map(d => [fmt(d.date), d.value]));
    const maxVal = d3.max(rawData, d => d.value);
    const years  = [...new Set(rawData.map(d => d.date.getFullYear()))].sort();

    const color = d3.scaleSequential()
      .domain([0, maxVal])
      .interpolator(d3.interpolateYlOrRd);

    const rowH   = MONTH_LABEL_H + 7 * STEP + ROW_PAD;
    const totalW = YEAR_LABEL_W + 53 * STEP + 20;
    const totalH = years.length * rowH + 50;

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${totalW} ${totalH}`)
      .attr('width', '100%')
      .style('display', 'block');

    years.forEach((year, yi) => {
      const g = svg.append('g')
        .attr('transform', `translate(${YEAR_LABEL_W}, ${yi * rowH + MONTH_LABEL_H})`);

      // Year label
      g.append('text')
        .attr('x', -6).attr('y', 3.5 * STEP)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 20).attr('fill', '#444')
        .text(year);

      const start = new Date(year, 0, 1);
      const end   = new Date(year + 1, 0, 1);
      const days  = d3.timeDays(start, end);

      // Month labels
      d3.timeMonths(start, end).forEach(m => {
        g.append('text')
          .attr('x', weekCol(m) * STEP).attr('y', -6)
          .attr('font-size', 14).attr('fill', '#888')
          .text(d3.timeFormat('%b')(m));
      });

      // Day cells
      g.selectAll('.day')
        .data(days)
        .join('rect')
        .attr('class', 'day')
        .attr('width', CELL).attr('height', CELL)
        .attr('rx', 2).attr('ry', 2)
        .attr('x', d => weekCol(d) * STEP)
        .attr('y', d => dayRow(d) * STEP)
        .attr('fill', d => {
          const v = byDate.get(fmt(d));
          return v != null ? color(v) : '#e8e8e8';
        })
        .append('title')
        .text(d => {
          const v = byDate.get(fmt(d));
          return `${fmt(d)}: ${v != null ? v.toFixed(2) + ' kWh' : 'no data'}`;
        });
    });

    // ── Legend ───────────────────────────────────────────────────────────────
    const legendY = years.length * rowH + 10;
    const lw = 200, lh = 12;

    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', 'cal-grad');
    d3.range(0, 1.01, 0.1).forEach(t => {
      grad.append('stop')
        .attr('offset', `${t * 100}%`)
        .attr('stop-color', color(t * maxVal));
    });

    const lg = svg.append('g')
      .attr('transform', `translate(${YEAR_LABEL_W}, ${legendY})`);

    lg.append('rect')
      .attr('width', lw).attr('height', lh)
      .style('fill', 'url(#cal-grad)');

    lg.append('text')
      .attr('x', 0).attr('y', lh + 14)
      .attr('font-size', 14).attr('fill', '#666')
      .text('0 kWh');

    lg.append('text')
      .attr('x', lw).attr('y', lh + 14)
      .attr('font-size', 14).attr('fill', '#666').attr('text-anchor', 'end')
      .text(`${maxVal.toFixed(0)} kWh`);
  });

  function fmt(d) {
    return d3.timeFormat('%Y-%m-%d')(d);
  }
  function weekCol(d) {
    return d3.timeMonday.count(d3.timeYear(d), d);
  }
  function dayRow(d) {
    const day = d.getDay();
    return day === 0 ? 6 : day - 1;
  }
})();
