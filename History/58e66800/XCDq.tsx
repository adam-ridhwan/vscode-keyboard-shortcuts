import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format-currency';

interface MyBidsStatsProps {
  activeBids: number;
  highBidder: number;
  outbid: number;
  exposure: number;
}

export function MyBidsStats({
  activeBids,
  highBidder,
  outbid,
  exposure,
}: MyBidsStatsProps) {
  const stats = [
    { value: activeBids, label: 'Active Bids', format: 'number' },
    { value: highBidder, label: 'High Bidder', format: 'number' },
    { value: outbid, label: 'Outbid', format: 'number' },
    { value: exposure, label: 'Exposure on Leading Bids', format: 'currency' },
  ] as const;

  return (
    <div className='grid grid-cols-2 rounded-lg border sm:grid-cols-4'>
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            'border-border p-4 sm:p-6',
            index % 2 === 0 && 'border-r',
            index < 2 && 'border-b',
            'sm:border-b-0',
            index !== stats.length - 1 && 'sm:border-r'
          )}
        >
          <div
            className={cn(
              'text-3xl font-semibold tracking-tight sm:text-4xl',
              index === 0 && 'text-primary'
            )}
          >
            {stat.format === 'currency'
              ? formatCurrency(stat.value)
              : stat.value}
          </div>
          <div
            className='text-muted-foreground mt-1 text-xs tracking-wide
              uppercase'
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
