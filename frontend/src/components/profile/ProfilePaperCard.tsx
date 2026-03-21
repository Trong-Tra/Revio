import React from 'react';
import { motion } from 'motion/react';
import { Edit3, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Paper } from '../../hooks/useUserPapers';

interface ProfilePaperCardProps {
  paper: Paper;
  onViewDetails: (paperId: string) => void;
}

const statusConfig = {
  published: {
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
    label: 'Published',
  },
  under_review: {
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-700',
    label: 'Under Review',
  },
  draft: {
    bgColor: 'bg-surface-container-high',
    textColor: 'text-on-surface-variant',
    label: 'Draft',
  },
};

export const ProfilePaperCard: React.FC<ProfilePaperCardProps> = ({ paper, onViewDetails }) => {
  const config = statusConfig[paper.status];

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
              {paper.category}
            </span>
          </div>
          <button className="text-outline-variant hover:text-primary transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

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
            {paper.status === 'draft' ? 'Modified' : paper.status === 'under_review' ? 'Updated' : 'Date'}
          </span>
          <span className="text-xs font-medium font-mono">{paper.datePublished}</span>
        </div>
        <button
          onClick={() => onViewDetails(paper.id)}
          className="flex items-center gap-1 text-primary font-bold text-xs hover:underline underline-offset-4"
        >
          {paper.status === 'draft' ? 'Edit Draft' : paper.status === 'under_review' ? 'Details' : 'Full Manuscript'}
          {paper.status === 'draft' ? (
            <Edit3 className="w-3 h-3" />
          ) : (
            <ArrowRight className="w-3 h-3" />
          )}
        </button>
      </div>
    </motion.div>
  );
};
