import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/system';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { getHeaderStyle } from '../utils/styling-utils';
import { headHandleKeyPress } from '../utils/handle-key-press';
import { handleClickToFocusHead } from '../utils/handle-accessibility';

const VisuallyHidden = styled('span')({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  top: 20,
  width: 1,
});

function TableHeadWrapper({
  rootElement,
  tableData,
  theme,
  layout,
  changeSortOrder,
  constraints,
  translator,
  selectionsAPI,
  focusedCellCoord,
  setFocusedCellCoord,
  keyboard,
}) {
  const { columns, paginationNeeded } = tableData;
  const headRowStyle = {
    '& :last-child': {
      borderRight: paginationNeeded && 0,
    },
    'th:first-of-type': {
      borderLeft: !paginationNeeded && '1px solid rgb(217, 217, 217)',
    },
  };
  const headerStyle = useMemo(() => getHeaderStyle(layout, theme), [layout, theme.name()]);
  const tableSortLabelStyle = {
    '&.Mui-active .MuiTableSortLabel-icon': {
      color: headerStyle.sortLabelColor,
    },
  };

  return (
    <TableHead>
      <TableRow sx={headRowStyle} className="sn-table-row">
        {columns.map((column, columnIndex) => {
          const tabIndex = columnIndex === 0 && !keyboard.enabled ? 0 : -1;
          const isCurrentColumnActive = layout.qHyperCube.qEffectiveInterColumnSortOrder[0] === column.dataColIdx;
          const isFocusInHead = focusedCellCoord[0] === 0;

          return (
            <TableCell
              sx={headerStyle}
              key={column.id}
              align={column.align}
              className="sn-table-head-cell sn-table-cell"
              tabIndex={tabIndex}
              aria-sort={isCurrentColumnActive ? `${column.sortDirection}ending` : null}
              aria-pressed={isCurrentColumnActive}
              onKeyDown={(e) =>
                headHandleKeyPress(
                  e,
                  rootElement,
                  [0, columnIndex],
                  column,
                  changeSortOrder,
                  layout,
                  !constraints.active,
                  setFocusedCellCoord
                )
              }
              onMouseDown={() => handleClickToFocusHead(columnIndex, rootElement, setFocusedCellCoord, keyboard)}
              onClick={() => !selectionsAPI.isModal() && !constraints.active && changeSortOrder(layout, column)}
            >
              <TableSortLabel
                sx={tableSortLabelStyle}
                active={isCurrentColumnActive}
                title={!constraints.passive && column.sortDirection} // passive: turn off tooltips.
                direction={column.sortDirection}
                tabIndex={-1}
              >
                {column.label}
                {isFocusInHead && (
                  <VisuallyHidden data-testid={`VHL-for-col-${columnIndex}`}>
                    {translator.get('SNTable.SortLabel.PressSpaceToSort')}
                  </VisuallyHidden>
                )}
              </TableSortLabel>
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}

TableHeadWrapper.propTypes = {
  rootElement: PropTypes.object.isRequired,
  tableData: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  layout: PropTypes.object.isRequired,
  changeSortOrder: PropTypes.func.isRequired,
  constraints: PropTypes.object.isRequired,
  selectionsAPI: PropTypes.object.isRequired,
  keyboard: PropTypes.object.isRequired,
  focusedCellCoord: PropTypes.arrayOf(PropTypes.number).isRequired,
  setFocusedCellCoord: PropTypes.func.isRequired,
  translator: PropTypes.object.isRequired,
};

export default TableHeadWrapper;
