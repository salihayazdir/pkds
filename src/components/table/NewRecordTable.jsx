import { useMemo, useRef, forwardRef, useEffect } from 'react';
import { useTable, useRowSelect, useFilters } from 'react-table';
import TableStatusSelect from '../selecbox/TableStatusSelect';
import NewRecordBulkActions from './NewRecordBulkActions';
import { addDays, format } from 'date-fns';
import {
  CheckIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import _ from 'lodash';
import Loader from '../skeletons/Loader';

const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef();
  const resolvedRef = ref || defaultRef;
  IndeterminateCheckbox.displayName = 'IndeterminateCheckbox';
  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return (
    <>
      <input type='checkbox' ref={resolvedRef} {...rest} />
    </>
  );
});

export default function NewRecordTable({
  newRecords,
  setNewRecords,
  userStatuses,
  selectedDate,
  prevRecordsExist,
  fillWithPreviousRecords,
  tableIsFilledWithPreviousRecords,
  apiStatus,
  directReports,
  isLeaderAndUnAuthorized,
  setSelectedUsernames,
  forceTableDataRerender,
  usersWithPreviousRecords,
}) {
  const filterTypes = useMemo(
    () => ({
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  const defaultColumn = useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const tableData = useMemo(
    () =>
      _.sortBy(
        newRecords[0].data.map((user) => {
          const dataOfUser = directReports.filter(
            (directReport) => directReport.username === user.username
          )[0];
          return {
            username: dataOfUser.username,
            display_name: dataOfUser.display_name,
            physicalDeliveryOfficeName: dataOfUser.physicalDeliveryOfficeName,
            user_status_id: user.user_status_id,
            is_authorized: dataOfUser.is_authorized,
            is_leader: dataOfUser.is_leader,
            team_display_name: dataOfUser.team_display_name,
            hasRecord:
              usersWithPreviousRecords.indexOf(dataOfUser.username) !== -1,
          };
        }),
        'display_name'
      ),
    [forceTableDataRerender]
  );

  const columns = useMemo(
    () => [
      {
        Header: '',
        id: 'index',
        maxWidth: 40,
        width: 20,
        Filter: false,
        accessor: (_row, i) => i + 1,
        Cell: ({ value }) => (
          <span className='font-medium text-gray-400'>
            {value === undefined ? null : String(value + '.')}
          </span>
        ),
      },
      {
        Header: 'Personel',
        accessor: 'display_name',
        Cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {row.original.hasRecord === true ? (
              <div className='mr-2 h-2 w-2  rounded-full bg-green-500'></div>
            ) : (
              <div className='mr-2 h-2 w-2  rounded-full bg-red-500 '></div>
            )}
            <span className=' whitespace-nowrap font-medium text-gray-800'>
              {row.values.display_name === undefined
                ? null
                : String(row.values.display_name)}
            </span>
            {row.original.is_authorized && (
              <div className='inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-center text-green-700 outline outline-1 outline-green-400'>
                <span>Yetkili</span>
                <CheckIcon className='h-4 w-4  ' />
              </div>
            )}
          </div>
        ),
      },
      // {
      //   Header: 'Yetki',
      //   accessor: 'is_authorized',
      //   Filter: false,
      //   maxWidth: 40,
      //   width: 20,
      //   Cell: ({ value }) => {
      //     if (value === true)
      //       return (
      //         <div className='inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-center text-green-700 outline outline-1 outline-green-400'>
      //           <span>Yetkili</span>
      //           <CheckIcon className='h-4 w-4  ' />
      //         </div>
      //       );
      //   },
      // },
      {
        Header: 'Servis',
        accessor: 'physicalDeliveryOfficeName',
        Filter: SelectColumnFilter,
        Cell: ({ value }) => (
          <span className='font-light text-gray-400'>
            {value === undefined || value === null ? null : String(value)}
          </span>
        ),
      },
      {
        Header: '',
        accessor: 'username',
      },
      {
        Header: 'Ekip',
        accessor: 'team_display_name',
        Filter: SelectColumnFilter,
        Cell: ({ row }) => (
          <div className='flex items-center gap-5'>
            <span className='font-light text-gray-400'>
              {row.values.team_display_name === undefined ||
              row.values.team_display_name === null
                ? null
                : String(row.values.team_display_name)}
            </span>
            {row.original.is_leader && (
              <div className='inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-center text-sky-700 outline outline-1 outline-sky-400'>
                <span>Lider</span>
                <UserGroupIcon className='h-4 w-4  ' />
              </div>
            )}
          </div>
        ),
      },
    ],
    [newRecords, selectedDate]
  );

  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  const selectBoxColumns = useMemo(
    () =>
      days.map((dayName, dayIdx) => ({
        id: dayIdx,
        Header: () => {
          const day = addDays(selectedDate, dayIdx);
          const formattedDay = format(day, 'd MMMM');
          return (
            <div className='w-20 '>
              <div>{dayName}</div>
              <div className='mt-2 rounded-lg text-gray-400'>
                {formattedDay}
              </div>
            </div>
          );
        },
        Cell: ({ row }) => {
          return (
            <TableStatusSelect
              selectedId={
                newRecords
                  .filter((newRecords) => newRecords.dayIdx === dayIdx)[0]
                  .data.filter(
                    (record) => record.username === row.values.username
                  )[0].user_status_id
              }
              setNewRecords={setNewRecords}
              userStatuses={userStatuses}
              username={row.values.username}
              day={dayIdx}
            />
          );
        },
      })),
    [newRecords, selectedDate]
  );

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      {
        id: 'selection',
        maxWidth: 40,
        width: 20,
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <div className='flex items-center'>
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          </div>
        ),
        Cell: ({ row }) => (
          <div className='flex items-center'>
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          </div>
        ),
      },
      ...columns,
      ...selectBoxColumns,
    ]);
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    toggleAllRowsSelected,
    state: { selectedRowIds },
  } = useTable(
    {
      columns,
      data: tableData,
      defaultColumn,
      filterTypes,
      initialState: {
        hiddenColumns: [
          'username',
          isLeaderAndUnAuthorized && 'team_display_name',
        ],
      },
    },
    useFilters,
    useRowSelect,
    tableHooks
  );

  useEffect(
    () =>
      setSelectedUsernames(
        selectedFlatRows.map((flatRow) => {
          const usernameColumn = flatRow.allCells.filter(
            (column) => column.column.id === 'username'
          )[0];
          return usernameColumn.value;
        })
      ),
    [selectedRowIds]
  );

  return (
    <div className='flex flex-col rounded-xl border  border-gray-200 bg-white pb-4'>
      <div className='flex items-center justify-between p-4'>
        <h2 className='inline-flex gap-2 whitespace-nowrap rounded-md bg-green-50 px-4 py-2 text-sm font-bold text-green-600 '>
          {`
        ${format(selectedDate, 'd MMMM')}  -  ${format(
            addDays(selectedDate, 4),
            'd MMMM yyyy'
          )}`}
        </h2>
        <div className='flex items-center justify-end gap-6'>
          {apiStatus.isLoading ? (
            <div className='flex items-center gap-4'>
              <span className='whitespace-nowrap text-xs font-light text-gray-400'>
                Geçmiş kayıtlar yükleniyor...
              </span>
              <Loader size='6' />
            </div>
          ) : null}
          {prevRecordsExist && !apiStatus.isLoading ? (
            <div className='inline-flex items-center gap-4 whitespace-nowrap rounded-md bg-orange-50 pl-4 text-xs text-orange-700 '>
              <div>
                <span>
                  <ExclamationCircleIcon className='h-4 w-4' />
                </span>
              </div>
              <span>Seçilen tarih aralığı için mevcut kayıt bulunuyor.</span>
              <button
                onClick={() => fillWithPreviousRecords()}
                disabled={tableIsFilledWithPreviousRecords}
                className={`rounded-md bg-orange-700 px-3 py-2 font-bold text-orange-50 hover:bg-orange-600 disabled:bg-gray-300 disabled:text-white `}
              >
                Geçmiş Kayıtları Tabloya Getir
              </button>
            </div>
          ) : null}
          <NewRecordBulkActions
            newRecords={newRecords}
            setNewRecords={setNewRecords}
            userStatuses={userStatuses}
            selectedFlatRows={selectedFlatRows}
            numberOfSelectedRows={Object.keys(selectedRowIds).length}
            // toggleAllRowsSelected={toggleAllRowsSelected}
          />
        </div>
      </div>
      <div className={`overflow-x-auto text-xs`}>
        <table
          {...getTableProps()}
          className='w-full border-collapse rounded-lg '
        >
          <thead className='border-y border-gray-200 bg-gray-50'>
            {headerGroups.map((headerGroup, idx) => (
              <tr key={idx} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, idx) => (
                  <th
                    key={idx}
                    {...column.getHeaderProps({
                      style: { minWidth: column.minWidth, width: column.width },
                    })}
                    className='px-3 py-2 text-left align-baseline font-semibold first-of-type:pl-6 first-of-type:align-middle'
                  >
                    {column.render('Header')}
                    <div>
                      {column.canFilter ? column.render('Filter') : null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className='text-gray-800 '>
            {rows.map((row, idx) => {
              prepareRow(row);
              return (
                <tr
                  key={idx}
                  {...row.getRowProps()}
                  className='border-b border-gray-200'
                >
                  {row.cells.map((cell, idx) => {
                    return (
                      <td
                        key={idx}
                        {...cell.getCellProps({
                          style: {
                            minWidth: cell.column.minWidth,
                            width: cell.column.width,
                          },
                        })}
                        className='w-44 py-4 pl-3 pr-5 first-of-type:w-20 first-of-type:pl-6 '
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  // const count = preFilteredRows.length;
  return (
    <input
      className='mt-1 w-40 rounded-md py-1 px-2 text-gray-500 shadow focus:outline-blue-300'
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      placeholder={`Ara...`}
    />
  );
}

function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  const options = useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  return (
    <select
      className='mt-1 w-40 rounded-md py-1 px-2 text-gray-500 shadow focus:outline-blue-300'
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value=''>Tümü</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
