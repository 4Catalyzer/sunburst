import { partition, stratify } from 'd3-hierarchy';
import { scaleLinear, scaleOrdinal, scaleSqrt, schemeCategory20b }
  from 'd3-scale';
import React from 'react';

import SunburstSlice from './SunburstSlice';

const stratifier = stratify();
const partitioner = partition();

export default class Sunburst extends React.Component {
  static propTypes = {
    nodes: React.PropTypes.array.isRequired,
    minX: React.PropTypes.number.isRequired,
    maxX: React.PropTypes.number.isRequired,
    minDepth: React.PropTypes.number.isRequired,
    maxDepth: React.PropTypes.number.isRequired,
    jagged: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    onSliceOver: React.PropTypes.func,
    onSliceClick: React.PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);

    this.radiusScale = scaleSqrt()
      .clamp(true);
    this.angleScale = scaleLinear()
      .range([0, 2 * Math.PI])
      .clamp(true);

    this.fillScale = scaleOrdinal(schemeCategory20b);
  }

  getRoot(nodes) {
    const root = stratifier(nodes);
    root.each(node => {
      node.value = node.data.value; // eslint-disable-line no-param-reassign
    });

    return partitioner(root);
  }

  render() {
    const {
      nodes, minX, maxX, minDepth, maxDepth, jagged, height, width,
      onSliceClick, onSliceOver,
    } = this.props;

    const radius = Math.min(width, height) / 2;
    const { radiusScale, angleScale, fillScale } = this;

    radiusScale
      .domain([minDepth, maxDepth + 1])
      .range([0, radius]);
    angleScale
      .domain([minX, maxX]);

    const root = this.getRoot(nodes);
    root.each(({ id }) => {
      // Evaluate the fill color in breadth-first fashion to ensure that
      // adjacent slices have different fill colors.
      fillScale(id);
    });

    return (
      <g transform={`translate(${0.5 * width},${0.5 * height})`}>
        <SunburstSlice
          radiusScale={radiusScale}
          radiusScaleRange={radiusScale()[1]}
          angleScale={angleScale}
          fillScale={fillScale}
          node={root}
          jagged={jagged}
          onSliceClick={onSliceClick}
          onSliceOver={onSliceOver}
          maxDepth={maxDepth}
        />
      </g>
    );
  }
}
