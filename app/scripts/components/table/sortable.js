'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'object-path';
import { isUndefined } from '../../utils/validate';
import { nullValue } from '../../utils/format';

const defaultSortOrder = 'desc';
const otherOrder = {
  desc: 'asc',
  asc: 'desc'
};

const Table = React.createClass({
  displayName: 'SortableTable',

  propTypes: {
    primaryIdx: PropTypes.number,
    data: PropTypes.array,
    header: PropTypes.array,
    props: PropTypes.array,
    row: PropTypes.array,
    sortIdx: PropTypes.number,
    order: PropTypes.string,
    changeSortProps: PropTypes.func,
    onSelect: PropTypes.func,
    canSelect: PropTypes.bool,
    selectedRows: PropTypes.array,
    rowId: PropTypes.any
  },

  getInitialState: function () {
    return {
      dumbOrder: null,
      dumbSortIdx: null
    };
  },

  isTableDumb: function () {
    // identify whether the table is "dumb," as in it doesn't
    // do its own data-updating, and cannot be sorted via its API call
    return isUndefined(this.props.sortIdx) || !this.props.order || !Array.isArray(this.props.props);
  },

  changeSort: function (e) {
    let { sortIdx, order, props, header } = this.props;
    const isTableDumb = this.isTableDumb();

    if (isTableDumb) {
      sortIdx = this.state.dumbSortIdx;
      order = this.state.dumbOrder;
    }

    const headerName = e.currentTarget.getAttribute('data-value');
    const newSortIdx = header.indexOf(headerName);
    if (!props[newSortIdx]) { return; }
    const newOrder = sortIdx === newSortIdx ? otherOrder[order] : defaultSortOrder;

    if (typeof this.props.changeSortProps === 'function') {
      this.props.changeSortProps({ sortIdx: newSortIdx, order: newOrder });
    }
    if (isTableDumb) {
      this.setState({ dumbSortIdx: newSortIdx, dumbOrder: newOrder });
    }
  },

  select: function (e) {
    if (typeof this.props.onSelect === 'function') {
      const targetId = (e.currentTarget.getAttribute('data-value'));
      this.props.onSelect(targetId);
    }
  },

  render: function () {
    let { primaryIdx, sortIdx, order, props, header, row, rowId, data, selectedRows, canSelect } = this.props;
    const isTableDumb = this.isTableDumb();
    primaryIdx = primaryIdx || 0;

    if (isTableDumb) {
      props = [];
      sortIdx = this.state.dumbSortIdx;
      order = this.state.dumbOrder;
      const sortName = props[sortIdx];
      const primaryName = props[primaryIdx];
      data = data.sort((a, b) =>
        // If the sort field is the same, tie-break using the primary ID field
        a[sortName] === b[sortName] ? a[primaryName] > b[primaryName]
        : (order === 'asc') ? a[sortName] < b[sortName] : a[sortName] > b[sortName]
      );
    }

    return (
      <div className='table--wrapper'>
        <table>
          <thead>
            <tr>
              {canSelect && <td></td> }
              {header.map((h, i) => {
                let className = (isTableDumb || props[i]) ? 'table__sort' : '';
                if (i === sortIdx) { className += (' table__sort--' + order); }
                return (
                  <td
                  className={className}
                  key={h}
                  data-value={h}
                  onClick={this.changeSort}>{h}</td>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              const dataId = typeof rowId === 'function' ? rowId(d) : d[rowId];
              const checked = canSelect && selectedRows.indexOf(dataId) !== -1;
              return (
                <tr key={i} data-value={dataId} onClick={this.select}>
                  {canSelect &&
                    <td>
                      <input type='checkbox' checked={checked} />
                    </td>
                  }
                  {row.map((accessor, k) => {
                    let className = k === primaryIdx ? 'table__main-asset' : '';
                    let text;

                    if (typeof accessor === 'function') {
                      text = accessor(d, k, data);
                    } else {
                      text = get(d, accessor, nullValue);
                    }
                    return <td key={String(i) + String(k) + text} className={className}>{text}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
});

export default Table;
