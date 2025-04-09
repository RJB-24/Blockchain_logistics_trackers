
import { useState } from 'react';
import { Check, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock blockchain transaction data
const mockTransactions = [
  { 
    id: 'tx123456789abcdef', 
    timestamp: new Date(Date.now() - 1000 * 60 * 5), 
    event: 'Shipment Created',
    status: 'confirmed',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  { 
    id: 'tx234567890abcdef1', 
    timestamp: new Date(Date.now() - 1000 * 60 * 30), 
    event: 'IoT Temperature Updated',
    status: 'confirmed',
    hash: '0x2345678901abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  { 
    id: 'tx345678901abcdef12', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60), 
    event: 'Customs Clearance',
    status: 'confirmed',
    hash: '0x3456789012abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  { 
    id: 'tx456789012abcdef123', 
    timestamp: new Date(Date.now() - 1000 * 60 * 120), 
    event: 'Route Optimization',
    status: 'confirmed',
    hash: '0x4567890123abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  { 
    id: 'tx567890123abcdef1234', 
    timestamp: new Date(), 
    event: 'Payment Released',
    status: 'pending',
    hash: '0x5678901234abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
];

const BlockchainTransactionList = () => {
  const [transactions] = useState(mockTransactions);

  return (
    <div className="eco-card">
      <div className="p-4 border-b border-eco-light/30">
        <h3 className="font-medium">Blockchain Transactions</h3>
        <p className="text-sm text-muted-foreground">Recent ledger events</p>
      </div>

      <div className="divide-y divide-eco-light/30 max-h-[300px] overflow-y-auto">
        {transactions.map(tx => (
          <div key={tx.id} className="p-4 hover:bg-eco-light/10 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{tx.event}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tx.timestamp.toLocaleTimeString()} • {tx.timestamp.toLocaleDateString()}
                </p>
              </div>
              <div className={cn(
                "flex items-center px-2 py-1 rounded-full text-xs font-medium",
                tx.status === 'confirmed' ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
              )}>
                {tx.status === 'confirmed' ? <Check size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
                {tx.status === 'confirmed' ? 'Confirmed' : 'Pending'}
              </div>
            </div>
            
            <div className="mt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="truncate w-52 sm:w-full">
                  {tx.hash}
                </span>
                <a 
                  href={`https://etherscan.io/tx/${tx.hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-eco-purple hover:text-eco-purple/80"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainTransactionList;
