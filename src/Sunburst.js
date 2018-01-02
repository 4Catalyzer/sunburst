import { partition, stratify } from 'd3-hierarchy';
import {
  scaleLinear,
  scaleOrdinal,
  scaleSqrt,
  schemeCategory20b,
} from 'd3-scale';
import PropTypes from 'prop-types';
import React from 'react';

import SunburstSlice from './SunburstSlice';

const stratifier = stratify();
const partitioner = partition();

export default class Sunburst extends React.Component {
  static propTypes = {
    // eslint-disable-next-line
    nodes: PropTypes.array.isRequired,
    minX: PropTypes.number.isRequired,
    maxX: PropTypes.number.isRequired,
    minDepth: PropTypes.number.isRequired,
    maxDepth: PropTypes.number.isRequired,
    jagged: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    onSliceOver: PropTypes.func,
    onSliceClick: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);

    this.radiusScale = scaleSqrt().clamp(true);
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
      nodes,
      minX,
      maxX,
      minDepth,
      maxDepth,
      jagged,
      height,
      width,
      onSliceClick,
      onSliceOver,
    } = this.props;

    const radius = Math.min(width, height) / 2;
    const { radiusScale, angleScale, fillScale } = this;

    radiusScale.domain([minDepth, maxDepth + 1]).range([0, radius]);
    angleScale.domain([minX, maxX]);

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
