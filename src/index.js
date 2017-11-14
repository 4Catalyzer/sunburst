import React from 'react';
import { spring, TransitionMotion } from 'react-motion';

import Sunburst from './Sunburst';

const PLOT_KEY = '@@plot';

export default class SunburstContainer extends React.Component {
  static propTypes = {
    data: React.PropTypes.shape({
      children: React.PropTypes.array.isRequired,
      data: React.PropTypes.object.isRequired,
      id: React.PropTypes.any.isRewquired,
    }).isRequired,
    highlightedKey: React.PropTypes.any,
    rootNode: React.PropTypes.any,
    depthLevel: React.PropTypes.number.isRequired,
    jagged: React.PropTypes.bool.isRequired,
    onSliceOver: React.PropTypes.func,
    onSliceClick: React.PropTypes.func,
  };

  static defaultProps = {
    depthLevel: 4,
    jagged: true,
  };

  getData() {
    const { data: root, highlightedKey } = this.props;

    let highlightedNode;
    if (highlightedKey) {
      root.each(node => {
        if (node.id === highlightedKey) {
          highlightedNode = node;
          return; // Pointless micro-optimization.
        }

        // TODO change `fade` to something more semantic like `highlighted`
        // and provide a prop to customize the style
        node.fade = true; // eslint-disable-line no-param-reassign
      });

      highlightedNode.each(node => {
        node.fade = false; // eslint-disable-line no-param-reassign
      });
    } else {
      root.each(node => {
        node.fade = false; // eslint-disable-line no-param-reassign
      });
    }

    const nodes = root.descendants()
      .map(({ id, data, parent, value, fade }) => ({
        id,
        parentId: parent && parent.id,
        value,
        fade,
        ...data,
      }));

    return { nodes, rootHeight: root.height, root };
  }

  getStyles = () => {
    const { jagged, rootNode, depthLevel } = this.props;
    const { nodes, rootHeight } = this.getData();

    const styles = nodes.map(node => ({
      key: node.id.toString(),
      data: node,
      style: {
        value: spring(node.value),
      },
    }));

    let minX;
    let maxX;
    let minDepth;
    let height;

    if (rootNode) {
      minX = rootNode.x0;
      maxX = rootNode.x1;
      minDepth = rootNode.depth;
      height = rootNode.height;
    } else {
      minX = 0;
      maxX = 1;
      minDepth = 0;
      height = rootHeight;
    }

    const xPrecision = 0.01 * (maxX - minX);

    styles.push({
      key: PLOT_KEY,
      style: {
        minX: spring(minX, { precision: xPrecision }),
        maxX: spring(maxX, { precision: xPrecision }),
        minDepth: spring(minDepth),
        maxDepth: spring(minDepth + Math.min(depthLevel, height)),
        jagged: spring(jagged ? 1 : 0),
      },
    });

    return styles;
  };

  renderStyles = (styles) => {
    const plotStyle = styles.pop().style;
    const { onSliceClick, onSliceOver } = this.props;

    return (
      <Sunburst
        {...plotStyle}
        nodes={styles.map(({ data, style }) => ({
          ...data,
          ...style,
        }))}
        width={960}
        height={700}
        onSliceClick={onSliceClick}
        onSliceOver={onSliceOver}
      />
    );
  };

  render() {
    const svgProps = { ...this.props };
    // DIY omit
    Object.keys(SunburstContainer.propTypes).forEach(k => delete svgProps[k]);

    return (
      <svg viewBox="0 0 960 700" {...svgProps}>
        <TransitionMotion
          styles={this.getStyles()}
          willLeave={() => ({
            value: spring(0),
            fade: spring(1),
          })}
          willEnter={() => ({
            value: 0,
            fade: 1,
          })}
        >
          {this.renderStyles}
        </TransitionMotion>
      </svg>
    );
  }
}
