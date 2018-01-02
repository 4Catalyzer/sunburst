import PropTypes from 'prop-types';
import React from 'react';

import Arc from './Arc';

export default class SunburstSlice extends React.Component {
  static propTypes = {
    angleScale: PropTypes.func.isRequired,
    fillScale: PropTypes.func.isRequired,
    jagged: PropTypes.number.isRequired,
    maxDepth: PropTypes.number.isRequired,
    node: PropTypes.object.isRequired,
    onSliceClick: PropTypes.func,
    onSliceOver: PropTypes.func,
    radiusScale: PropTypes.func.isRequired,
  };

  onMouseEnter = () => {
    const { onSliceOver, node } = this.props;
    if (onSliceOver) onSliceOver(node);
  };

  onMouseLeave = () => {
    const { onSliceOver } = this.props;
    if (onSliceOver) onSliceOver(null);
  };

  onClick = () => {
    const { onSliceClick, node } = this.props;
    if (onSliceClick) onSliceClick(node);
  };


  render() {
    const {
      angleScale, fillScale, jagged, maxDepth, node, radiusScale,
    } = this.props;
    const { x0, x1, depth, data, children } = node;
    const { key, fade } = data;

    // We could also transition an outer radius floor for the entire diagram,
    // to keep the boundary of the smooth edge as a circle, rather than having
    // each slice animate semi-independently.
    let outerRadius;
    if (jagged === 0) {
      outerRadius = radiusScale.range()[1];
    } else if (jagged === 1) {
      outerRadius = radiusScale(depth + 1);
    } else {
      const maxRadius = radiusScale.range()[1];
      outerRadius = maxRadius + jagged * (radiusScale(depth + 1) - maxRadius);
    }

    node.fill = fillScale(key); // eslint-disable-line no-param-reassign

    const innerRadius = radiusScale(depth);
    const startAngle = angleScale(x0);
    const endAngle = angleScale(x1);

    const arc = (
      <Arc
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={node.fill}
        stroke="white"
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={this.onClick}
        opacity={fade ? 0.4 : 1}
        cursor="default"
        label={data.label}
      />
    );


    if (
      !children ||
      node.depth >= maxDepth ||
      innerRadius > 5 && innerRadius * (endAngle - startAngle) <= 1
    ) {
      return arc;
    }

    return (
      <g>
        {arc}

        {children.map(child => (
          <SunburstSlice
            {...this.props}
            key={child.data.key}
            node={child}
          />
        ))}
      </g>
    );
  }
}
