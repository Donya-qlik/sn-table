import PropTypes from 'prop-types';
import React, { memo, useReducer, useEffect, useState, useMemo, useRef, forwardRef } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import { VariableSizeList as List, areEqual } from 'react-window';

import AnnounceElements from './AnnounceElements';
import TableHeadWrapper from './TableHeadWrapper';
import FooterWrapper from './FooterWrapper';
import PaginationContent from './PaginationContent';
import useDidUpdateEffect from './useDidUpdateEffect';
import { handleTableWrapperKeyDown, bodyHandleKeyPress } from '../utils/handle-key-press';
import {
  updateFocus,
  handleResetFocus,
  handleFocusoutEvent,
  handleClickToFocusBody,
} from '../utils/handle-accessibility';
import { handleHorizontalScroll, handleNavigateTop } from '../utils/handle-scroll';
import announcementFactory from '../utils/announcement-factory';
import { addSelectionListeners, reducer } from '../utils/selections-utils';
import getCellRenderer from './renderer';
import { getBodyCellStyle } from '../utils/styling-utils';

export default function TableWrapper(props) {
  const {
    rootElement,
    tableData,
    pageInfo,
    setPageInfo,
    constraints,
    translator,
    layout,
    selectionsAPI,
    theme,
    keyboard,
    direction,
    footerContainer,
    rect,
  } = props;
  const { totalColumnCount, totalRowCount, paginationNeeded, rows, columns } = tableData;
  const { page, rowsPerPage } = pageInfo;
  const [focusedCellCoord, setFocusedCellCoord] = useState([0, 0]);
  const shouldRefocus = useRef(false);
  const tableContainerRef = useRef();
  const tableWrapperRef = useRef();

  const announce = useMemo(() => announcementFactory(rootElement, translator), [translator.language]);
  const totalPages = Math.ceil(totalRowCount / rowsPerPage);
  const tableAriaLabel = `${translator.get('SNTable.Accessibility.RowsAndColumns', [
    rows.length + 1,
    columns.length,
  ])} ${translator.get('SNTable.Accessibility.NavigationInstructions')}`;

  const setShouldRefocus = () => {
    shouldRefocus.current = rootElement.getElementsByTagName('table')[0].contains(document.activeElement);
  };

  const handleChangePage = (pageIdx) => {
    setPageInfo({ ...pageInfo, page: pageIdx });
    announce({ keys: [['SNTable.Pagination.PageStatusReport', [pageIdx + 1, totalPages]]], politeness: 'assertive' });
  };

  useEffect(() => {
    const memoedWrapper = tableWrapperRef.current;
    if (!memoedWrapper) return () => {};

    const focusOutCallback = (evt) => handleFocusoutEvent(evt, shouldRefocus, keyboard);
    memoedWrapper.addEventListener('focusout', focusOutCallback);

    return () => {
      memoedWrapper.removeEventListener('focusout', focusOutCallback);
    };
  }, []);

  useEffect(() => {
    const memoedContainer = tableContainerRef.current;
    if (!memoedContainer) return () => {};

    const horizontalScrollCallback = (evt) => handleHorizontalScroll(evt, direction === 'rtl', memoedContainer);
    memoedContainer.addEventListener('wheel', horizontalScrollCallback);

    return () => {
      memoedContainer.removeEventListener('wheel', horizontalScrollCallback);
    };
  }, [direction]);

  useEffect(
    () => handleNavigateTop({ tableContainerRef, focusedCellCoord, rootElement }),
    [tableContainerRef, focusedCellCoord]
  );

  useDidUpdateEffect(() => {
    if (!keyboard.enabled) return;

    updateFocus({
      focusType: keyboard.active ? 'focus' : 'blur',
      rowElements: rootElement.getElementsByClassName('sn-table-row'),
      cellCoord: focusedCellCoord,
    });
  }, [keyboard.active]);

  // Except for first render, whenever the size of the data (number of rows per page, rows, columns) or page changes,
  // reset tabindex to first cell. If some cell had focus, focus the first cell as well.
  useDidUpdateEffect(() => {
    handleResetFocus({
      focusedCellCoord,
      rootElement,
      shouldRefocus,
      setFocusedCellCoord,
      hasSelections: selectionsAPI.isModal(),
      shouldAddTabstop: !keyboard.enabled || keyboard.active,
      announce,
    });
  }, [rows.length, totalRowCount, totalColumnCount, page]);

  const paperStyle = {
    borderWidth: paginationNeeded ? '0px 1px 0px' : '0px',
    borderStyle: 'solid',
    borderColor: theme.table.borderColor,
    height: '100%',
    backgroundColor: theme.table.backgroundColor,
    boxShadow: 'none',
    borderRadius: 'unset',
    overflow: constraints.active ? 'hidden' : 'auto',
  };

  const tableContainerStyle = {
    overflow: 'hidden',
  };

  const bodyCellStyle = useMemo(() => getBodyCellStyle(layout, theme), [layout, theme.name()]);
  const bodyRowAndCellStyle = {
    'tr :last-child': {
      borderRight: paginationNeeded && 0,
    },
    'tr :first-child': {
      borderLeft: !paginationNeeded && '1px solid rgb(217, 217, 217)',
    },
    '& td, th': {
      fontSize: bodyCellStyle.fontSize,
      padding: bodyCellStyle.padding,
    },
  };

  // eslint-disable-next-line react/display-name
  const outerElement = forwardRef(({ children, ...rest }, ref) => {
    return (
      <Paper
        dir={direction}
        sx={paperStyle}
        {...rest}
        ref={(tableWrapperRef, ref)}
        onKeyDown={(evt) =>
          handleTableWrapperKeyDown({
            evt,
            totalRowCount,
            page,
            rowsPerPage,
            handleChangePage,
            setShouldRefocus,
            keyboard,
            isSelectionActive: selectionsAPI.isModal(),
          })
        }
      >
        <AnnounceElements />
        {children}
      </Paper>
    );
  });

  outerElement.propTypes = {
    children: PropTypes.object.isRequired,
  };

  // eslint-disable-next-line react/display-name
  const innerElement = forwardRef(({ children, ...rest }, ref) => {
    return (
      <TableContainer
        ref={(tableContainerRef, ref)}
        sx={tableContainerStyle}
        {...rest}
        tabIndex={-1}
        role="application"
        data-testid="table-container"
      >
        <Table stickyHeader aria-label={tableAriaLabel}>
          <TableHeadWrapper {...props} setFocusedCellCoord={setFocusedCellCoord} focusedCellCoord={focusedCellCoord} />
          <TableBody sx={bodyRowAndCellStyle}>{children}</TableBody>
        </Table>
      </TableContainer>
    );
  });

  innerElement.propTypes = {
    children: PropTypes.array.isRequired,
  };

  const getCellWidth = () => {
    return 128;
  };

  const hoverEffect = layout.components?.[0]?.content?.hoverEffect;

  // active: turn off interactions that affect the state of the visual representation including selection, zoom, scroll, etc.
  // select: turn off selections.
  const selectionsEnabled = !!selectionsAPI && !constraints.active && !constraints.select;

  const getColumnRenderers = columns.map((column) => getCellRenderer(!!column.stylingInfo.length, selectionsEnabled));
  const [columnRenderers, setColumnRenderers] = useState(() => getColumnRenderers);
  const [selectionState, selectionDispatch] = useReducer(reducer, {
    api: selectionsAPI,
    rows: [],
    colIdx: -1,
    isEnabled: selectionsEnabled,
  });

  useEffect(() => {
    selectionDispatch({ type: 'set-enabled', payload: { isEnabled: selectionsEnabled } });
    setColumnRenderers(getColumnRenderers);
  }, [selectionsEnabled, columns.length]);

  useEffect(() => {
    addSelectionListeners({ api: selectionsAPI, selectionDispatch, setShouldRefocus, keyboard, tableWrapperRef });
  }, []);

  const rowCellStyle = hoverEffect
    ? {
        '&&:hover': {
          '& td:not(.selected), th:not(.selected)': {
            backgroundColor: bodyCellStyle.hoverBackgroundColor,
            color: bodyCellStyle.hoverFontColor,
          },
        },
      }
    : {};

  const Column = (columnProps) => {
    const { index: columnIndex, style } = columnProps;
    const column = columns[columnIndex];
    // const width = columnProps.style.width;

    return (
      <TableRow
        // key={columnIndex}
        hover={hoverEffect}
        tabIndex={-1}
        sx={rowCellStyle}
        style={{ ...style, top: '200px' }}
        className="sn-table-row"
      >
        {rows.map((row, rowIndex) => {
          const cell = row[column.id];
          const value = cell.qText;
          const CellRenderer = columnRenderers[columnIndex];
          return (
            CellRenderer && (
              <CellRenderer
                scope={columnIndex === 0 ? 'row' : null}
                component={columnIndex === 0 ? 'th' : null}
                cell={cell}
                column={column}
                key={`${cell.rawColIdx}-${cell.rawRowIdx}`}
                align={column.align}
                styling={{ color: bodyCellStyle.color, display: 'block' }}
                themeBackgroundColor={theme.table.backgroundColor}
                selectionState={selectionState}
                selectionDispatch={selectionDispatch}
                tabIndex={-1}
                announce={announce}
                onKeyDown={(evt) =>
                  bodyHandleKeyPress({
                    evt,
                    rootElement,
                    cellCoord: [rowIndex + 1, columnIndex],
                    selectionState,
                    cell,
                    selectionDispatch,
                    isAnalysisMode: selectionsEnabled,
                    setFocusedCellCoord,
                    announce,
                    keyboard,
                  })
                }
                onMouseDown={() => handleClickToFocusBody(cell, rootElement, setFocusedCellCoord, keyboard)}
              >
                {value}
              </CellRenderer>
            )
          );
        })}
      </TableRow>
    );
  };

  const MemoizedColumn = memo(Column, areEqual);

  return (
    <section>
      <List
        outerElementType={outerElement}
        innerElementType={innerElement}
        className="List"
        height={footerContainer || constraints.active || !paginationNeeded ? rect.height : rect.height - 49}
        itemCount={columns.length}
        itemSize={getCellWidth}
        itemKey={columns.id}
        layout="horizontal"
        width={rect.width}
      >
        {MemoizedColumn}
      </List>
      {!constraints.active && (
        <FooterWrapper theme={theme} footerContainer={footerContainer}>
          <PaginationContent
            {...props}
            handleChangePage={handleChangePage}
            lastPageIdx={totalPages - 1}
            announce={announce}
          />
        </FooterWrapper>
      )}
    </section>
  );
}

TableWrapper.defaultProps = {
  direction: null,
  footerContainer: null,
};

TableWrapper.propTypes = {
  rootElement: PropTypes.object.isRequired,
  tableData: PropTypes.object.isRequired,
  pageInfo: PropTypes.object.isRequired,
  setPageInfo: PropTypes.func.isRequired,
  translator: PropTypes.object.isRequired,
  constraints: PropTypes.object.isRequired,
  selectionsAPI: PropTypes.object.isRequired,
  layout: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  keyboard: PropTypes.object.isRequired,
  footerContainer: PropTypes.object,
  direction: PropTypes.string,
  rect: PropTypes.object.isRequired,
};
