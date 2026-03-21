import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MoreHorizontal, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import type { Paper } from '../../api/client';

interface ProfilePaperCardProps {
  paper: Paper;
  onViewDetails: (paperId: string) => void;
  onDelete?: (paperId: string) => Promise<void>;
  isDeleting?: boolean;
}

const resultConfig: Record<string, { bgColor: string; textColor: string; label: string }> = {
  ACCEPT: {
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-700',
    label: 'Accepted',
  },
  REJECT: {
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-700',
    label: 'Rejected',
  },
  MAJOR_REVISION: {
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-700',
    label: 'Major Revision',
  },
  PENDING: {
    bgColor: 'bg-surface-container-high',
    textColor: 'text-on-surface-variant',
    label: 'Pending',
  },
};

export const ProfilePaperCard: React.FC<ProfilePaperCardProps> = ({ paper, onViewDetails, onDelete, isDeleting }) => {
  const resultKey = paper.finalResult?.toUpperCase().replace(/ /g, '_') || 'PENDING';
  const config = resultConfig[resultKey] || resultConfig.PENDING;
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    try {
      await onDelete(paper.id);
    } catch (err) {
      // Error handled by parent
      setShowConfirm(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <motion.div
      layoutId={`paper-card-${paper.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 hover:border-primary/30 hover:shadow-[0px_12px_32px_rgba(26,28,28,0.06)] transition-all flex flex-col justify-between h-[340px] group"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-2 flex-wrap">
            <span className={`${config.bgColor} ${config.textColor} px-2.5 py-1 rounded text-[10px] font-label font-bold uppercase tracking-widest`}>
              {config.label}
            </span>
            <span className="bg-surface-container text-on-surface-variant px-2.5 py-1 rounded text-[10px] font-label font-bold uppercase tracking-widest">
              {paper.field}
            </span>
          </div>
          {onDelete && (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className={`transition-colors ${showConfirm ? 'text-red-600' : 'text-outline-variant hover:text-red-600'}`}
              title={showConfirm ? 'Click again to confirm delete' : 'Delete paper'}
            >
              {isDeleting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm"
          >
            <p className="text-red-700 font-medium mb-2">Delete this paper?</p>
            <div className="flex gap-2">
              <button 
                onClick={handleDelete}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
              >
                Yes, delete
              </button>
              <button 
                onClick={handleCancelDelete}
                className="px-3 py-1 bg-surface-container text-on-surface rounded text-xs font-medium hover:bg-surface-container-high"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        <h3 className="text-xl font-bold font-headline group-hover:text-primary transition-colors leading-tight line-clamp-2">
          {paper.title}
        </h3>

        <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3">
          {paper.abstract}
        </p>
      </div>

      <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="font-label text-[10px] uppercase text-outline-variant">
            Submitted
          </span>
          <span className="text-xs font-medium font-mono">{paper.date}</span>
        </div>
        <button
          onClick={() => onViewDetails(paper.id)}
          className="flex items-center gap-1 text-primary font-bold text-xs hover:underline underline-offset-4"
        >
          View Paper
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};
