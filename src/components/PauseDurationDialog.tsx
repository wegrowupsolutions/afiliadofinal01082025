
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PauseDurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (duration: number | null) => void;
  phoneNumber: string;
}

const PauseDurationDialog = ({ isOpen, onClose, onConfirm, phoneNumber }: PauseDurationDialogProps) => {
  const [duration, setDuration] = useState<string>('30');
  const [noPause, setNoPause] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noPause) {
      onConfirm(null);
      return;
    }
    
    const durationValue = parseInt(duration);
    if (isNaN(durationValue) || durationValue <= 0) return;
    onConfirm(durationValue);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Por quanto tempo pausar o bot?</DialogTitle>
          <DialogDescription>
            Defina a duração em segundos para pausar o bot para {phoneNumber}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="no-pause"
                checked={noPause}
                onChange={(e) => setNoPause(e.target.checked)}
                className="rounded border-gray-300 focus:ring-blue-500"
              />
              <Label htmlFor="no-pause">Não pausar o bot (continuar funcionando)</Label>
            </div>
          </div>
          
          {!noPause && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (segundos)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full"
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Confirmar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PauseDurationDialog;
