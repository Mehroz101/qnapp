import { X } from 'lucide-react';
import { categoryColors } from '../data/interviewQuestions';
import { Button } from './ui/button';

interface TagFilterProps {
  selectedTags: string[];
  availableTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
  title?: string;
}

export function TagFilter({ selectedTags, availableTags, onTagToggle, onClearAll, title = "Filter by Categories" }: TagFilterProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground">{title}</h3>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-destructive text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const colorClass = categoryColors[tag] || 'category-technical';
          
          return (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                isSelected
                  ? `bg-${colorClass}/20 text-${colorClass} border-${colorClass}/30 shadow-sm`
                  : `bg-${colorClass}/5 text-${colorClass} border-${colorClass}/20 hover:bg-${colorClass}/10`
              }`}
            >
              {tag}
              {isSelected && (
                <X className="inline-block ml-1 h-3 w-3" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}