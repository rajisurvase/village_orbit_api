import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApproveItem, useRejectItem } from '@/services/marketPlace/items.query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Props {
  itemId: string;
}

const AdminItemActions: React.FC<Props> = ({ itemId }) => {
  const [reason, setReason] = useState('');
  const { mutate: approve } = useApproveItem();
  const { mutate: reject } = useRejectItem();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Button variant="default" size="sm" onClick={() => approve(itemId)}>
        Approve
      </Button>
      <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
        Reject
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejection reason</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Enter reason for rejection"
            />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                reject({ id: itemId, reason });
                setConfirmOpen(false);
              }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminItemActions;
