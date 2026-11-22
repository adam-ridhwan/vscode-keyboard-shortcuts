import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/format-currency';

import type { Vehicle } from '@/types';

export interface BidWithVehicle {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  myBid: number;
  currentBid: number;
  status: 'high_bidder' | 'outbid';
  auctionEnd: Date;
}

interface MyBidsTableProps {
  bids: BidWithVehicle[];
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Ended';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }

  return `${minutes}m ${seconds % 60}s`;
}

function TimeRemaining({ endTime }: { endTime: Date }) {
  const [timeRemaining, setTimeRemaining] = useState(
    () => endTime.getTime() - Date.now()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(endTime.getTime() - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return <span>{formatTimeRemaining(timeRemaining)}</span>;
}

export function MyBidsTable({ bids }: MyBidsTableProps) {
  if (bids.length === 0) {
    return null;
  }

  return (
    <div className='overflow-x-auto rounded-lg border'>
      {/* min-w keeps columns legible; the wrapper scrolls on narrow screens. */}
      <table className='w-full min-w-[56rem]'>
        <thead>
          <tr className='bg-muted/30 border-b'>
            <th
              className='text-muted-foreground px-4 py-4 text-left text-xs
                font-medium tracking-wide uppercase sm:px-6'
            >
              Lot
            </th>
            <th
              className='text-muted-foreground px-4 py-4 text-left text-xs
                font-medium tracking-wide uppercase sm:px-6'
            >
              Vehicle
            </th>
            <th
              className='text-muted-foreground px-4 py-4 text-left text-xs
                font-medium tracking-wide uppercase sm:px-6'
            >
              My Bid
            </th>
            <th
              className='text-muted-foreground px-4 py-4 text-left text-xs
                font-medium tracking-wide uppercase sm:px-6'
            >
              Current
            </th>
            <th
              className='text-muted-foreground px-4 py-4 text-left text-xs
                font-medium tracking-wide uppercase sm:px-6'
            >
              Status
            </th>
            <th
              className='text-muted-foreground px-4 py-4 text-left text-xs
                font-medium tracking-wide uppercase sm:px-6'
            >
              Closes
            </th>
            <th className='px-4 py-4 sm:px-6'></th>
          </tr>
        </thead>
        <tbody className='divide-y'>
          {bids.map((bid) => (
            <tr key={bid.id} className='hover:bg-muted/20'>
              <td className='text-muted-foreground px-4 py-4 text-sm sm:px-6'>
                {bid.vehicle.lot}
              </td>
              <td className='px-4 py-4 sm:px-6'>
                <Link
                  to={`/vehicle/${bid.vehicleId}`}
                  className='hover:underline'
                >
                  <div className='font-medium'>
                    {bid.vehicle.year} {bid.vehicle.make} {bid.vehicle.model}
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    {bid.vehicle.trim} &middot; {bid.vehicle.engine}
                  </div>
                </Link>
              </td>
              <td className='px-4 py-4 font-medium sm:px-6'>
                {formatCurrency(bid.myBid)}
              </td>
              <td className='px-4 py-4 font-medium sm:px-6'>
                {formatCurrency(bid.currentBid)}
              </td>
              <td className='px-4 py-4 sm:px-6'>
                {bid.status === 'high_bidder' ? (
                  <Badge variant='default'>High Bidder</Badge>
                ) : (
                  <Badge variant='outline'>Outbid</Badge>
                )}
              </td>
              <td className='px-4 py-4 text-sm sm:px-6'>
                <TimeRemaining endTime={bid.auctionEnd} />
              </td>
              <td className='px-4 py-4 sm:px-6'>
                {bid.status === 'outbid' && (
                  <Button>
                    <Link to={`/vehicle/${bid.vehicleId}`}>Re-bid on lot</Link>
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
