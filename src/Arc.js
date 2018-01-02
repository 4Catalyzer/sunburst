import { arc } from 'd3-shape';
import PropTypes from 'prop-types';
import React from 'react';

import TextPath from './TextPath';

const CHARACTERS_PER_PIXEL = 9;
const MIN_LABEL_LENGTH = 6;
// const QUADRANT_1 = 0;
const QUADRANT_2 = Math.PI * 0.5;
// const QUADRANT_3 = Math.PI;
const QUADRANT_4 = Math.PI * 1.5;

const propTypes = {
  children: PropTypes.node,
  innerRadius: PropTypes.number.isRequired,
  outerRadius: PropTypes.number.isRequired,
  startAngle: PropTypes.number.isRequired,
  endAngle: PropTypes.number.isRequired,
  label: PropTypes.string,
};

function trimString(text, length) {
  if (!text || length < MIN_LABEL_LENGTH) return null;
  if (text.length <= length) return text;
  return `${text.slice(0, length - 2)}…`;
}

function generateLabel(
  arcFunc,
  innerRadius,
  outerRadius,
  endAngle,
  startAngle,
  label,
) {
  if (
    !label ||
    endAngle - startAngle <= 0.05 ||
    outerRadius - innerRadius <= 0.05
  ) {
    return null;
  }
  const arcLength = (endAngle - startAngle) * outerRadius;
  // this heuristic is not bulletproof, but it's "good enough". Clearly
  // CHARACTERS_PER_PIXEL should depend on the font
  const availableCharacters = arcLength / CHARACTERS_PER_PIXEL;
  const trimmedContent = trimString(label, availableCharacters);
  if (!trimmedContent) {
    return null;
  }
  const radius = (innerRadius + outerRadius) / 2;
  const angle = (startAngle + endAngle) / 2;
  const textPath = arcFunc.innerRadius(radius).outerRadius(radius)();
  // since the arc path goes back and forth, 25% is at the half of the
  // first half, and 75% is at the half of the second half. This determines
  // the orientation of the label
  const startOffset = angle > QUADRANT_2 && angle < QUADRANT_4 ? '75%' : '25%';
  return (
    <TextPath
      style={{ fontFamily: 'sans-serif', fontSize: 12 }}
      fill="white"
      stroke="transparent"
      startOffset={startOffset}
      path={textPath}
    >
      {trimmedContent}
    </TextPath>
  );
}

function Arc({
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  label,
  ...props
}) {
  const arcFunc = arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(startAngle)
    .endAngle(endAngle);
  const path = arcFunc();
  const generatedLabel = generateLabel(
    arcFunc,
    innerRadius,
    outerRadius,
    endAngle,
    startAngle,
    label,
  );
  return (
    <g {...props}>
      <path d={path} />
      {generatedLabel}
    </g>
  );
}

Arc.propTypes = propTypes;

export default Arc;
