import PropTypes from 'prop-types';
import React from 'react';

// path definition has to have a unique global id
let gid = 0;

const propTypes = {
  children: PropTypes.node,
  path: PropTypes.string.isRequired,
  startOffset: PropTypes.string,
};

export default function TextPath({ path, children, startOffset, ...props }) {
  const id = `__TextPath__${++gid}`;
  return (
    <text
      textAnchor="middle"
      dominantBaseline="middle"
      {...props}
    >
      <defs>
        <path id={id} d={path} />
      </defs>
      <textPath xlinkHref={`#${id}`} startOffset={startOffset}>
        {children}
      </textPath>
    </text>
  );
}

TextPath.propTypes = propTypes;
