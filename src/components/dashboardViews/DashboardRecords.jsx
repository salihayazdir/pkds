import RecordsTable from '../table/RecordsTable';
import Loader from '../skeletons/Loader';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import NoRecords from '../skeletons/NoRecords';

export default function DashboardRecords({
  records,
  userStatuses,
  selectedDate,
  apiStatus,
  selectedDateRange,
  setSelectedDateRange,
  setSelectedView,
  isDashboard,
}) {
  const { isLoading, isError, message } = apiStatus;
  const isNoRecords = Boolean(isLoading === false && records.length === 0);

  return (
    <>
      {isNoRecords ? (
        <NoRecords
          isDashboard={isDashboard}
          setSelectedView={setSelectedView}
        />
      ) : selectedDateRange === 'week' ? (
        isLoading ? (
          <Loader />
        ) : (
          <div className='flex flex-col rounded-xl border border-gray-200 bg-white py-4'>
            <RecordsTable
              records={records}
              userStatuses={userStatuses}
              selectedDate={selectedDate}
              selectedDateRange={selectedDateRange}
            />
          </div>
        )
      ) : (
        <div className='inline-flex items-center justify-center gap-4 py-6 text-center text-lg font-medium text-gray-400'>
          <ExclamationCircleIcon className='h-8 w-8' />
          <div>
            <span>Bu ekranı görüntülemek için</span>
            <span
              onClick={() => setSelectedDateRange('week')}
              className='cursor-pointer rounded-md py-1 text-blue-600 hover:mx-2 hover:bg-blue-100 hover:px-2 '
            >
              {` haftalık `}
            </span>
            <span>görünüm seçmelisiniz.</span>
          </div>
        </div>
      )}
    </>
  );
}
