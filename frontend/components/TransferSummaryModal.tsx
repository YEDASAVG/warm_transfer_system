import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { FileText, Edit, User, ArrowRight } from 'lucide-react';

interface TransferSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (summary: string) => void;
  summary: string;
  callerName: string;
  agentBName: string;
}

export function TransferSummaryModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  summary, 
  callerName, 
  agentBName 
}: TransferSummaryModalProps) {
  const [editedSummary, setEditedSummary] = useState(summary);
  const [isEditing, setIsEditing] = useState(false);

  const handleConfirm = () => {
    onConfirm(editedSummary);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Transfer Summary
          </DialogTitle>
          <DialogDescription>
            Review and edit the AI-generated summary before transferring to {agentBName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transfer Details */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="mb-3 text-foreground">Transfer Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Customer:</span>
                <span className="text-foreground">{callerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Transferring to:</span>
                <span className="text-foreground">{agentBName}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Summary Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-foreground">Call Summary</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400">
                  AI Generated
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  {isEditing ? 'Preview' : 'Edit'}
                </Button>
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="w-full h-32 p-3 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Edit the summary..."
              />
            ) : (
              <div className="bg-background border border-border rounded-lg p-3">
                <p className="text-foreground text-sm leading-relaxed">
                  {editedSummary}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Confirm Transfer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}