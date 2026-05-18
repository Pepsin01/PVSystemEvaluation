// Sankey diagram — energy flow
// Data: data/energy_flow.json  →  {nodes: [{id, name}], links: [{source, target, value (MWh)}]}

(function () {
  const margin = { top: 20, right: 180, bottom: 20, left: 20 };
  const width  = 900 - margin.left - margin.right;
  const height = 400 - margin.top  - margin.bottom;
  const totalW = width  + margin.left + margin.right;
  const totalH = height + margin.top  + margin.bottom;

  const container = document.getElementById('sankey-diagram');

  d3.json('data/energy_flow.json').then(data => {
    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${totalW} ${totalH}`)
      .attr('width', '100%')
      .style('display', 'block')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const sankeyLayout = d3.sankey()
      .nodeId(d => d.id)
      .nodeWidth(22)
      .nodePadding(20)
      .extent([[0, 0], [width, height]]);

    const { nodes, links } = sankeyLayout({
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d })),
    });

    const palette = {
      'Solar Panels':              '#F7A600',
      'Self-consumed (PV)':        '#43A047',
      'Virtual battery (export)':  '#8BC34A',
      'Grid import':               '#E53935',
      'Household':                 '#2196F3',
    };
    const nodeColor = d => palette[d.name] ?? '#999';

    // ── Links ────────────────────────────────────────────────────────────────
    svg.append('g')
      .selectAll('.sankey-link')
      .data(links)
      .join('path')
      .attr('class', 'sankey-link')
      .attr('d', d3.sankeyLinkHorizontal())
      .attr('stroke',       d => nodeColor(d.source))
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('fill',         'none')
      .attr('stroke-opacity', 0.35)
      .style('cursor', 'default')
      .append('title')
      .text(d => `${d.source.name}  →  ${d.target.name}\n${d.value.toFixed(2)} MWh`);

    // ── Nodes ────────────────────────────────────────────────────────────────
    const node = svg.append('g')
      .selectAll('.sankey-node')
      .data(nodes)
      .join('g')
      .attr('class', 'sankey-node');

    node.append('rect')
      .attr('x',      d => d.x0)
      .attr('y',      d => d.y0)
      .attr('width',  d => d.x1 - d.x0)
      .attr('height', d => Math.max(1, d.y1 - d.y0))
      .attr('fill',   nodeColor)
      .attr('rx', 3)
      .append('title')
      .text(d => `${d.name}\n${d.value.toFixed(2)} MWh`);

    node.append('text')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 8 : d.x0 - 8)
      .attr('y', d => (d.y0 + d.y1) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .attr('font-size', 18)
      .attr('fill', '#333')
      .text(d => `${d.name}  (${d.value.toFixed(1)} MWh)`);
  });
})();
