import { TagFilter } from './TagFilter';

type IndexSidebarFiltersProps = {
  readonly selectedCategories: readonly string[];
  readonly availableCategories: readonly string[];
  readonly onCategoryToggle: (cat: string) => void;
  readonly onClearFilters: () => void;
  readonly showFilters: boolean;
};

export function IndexSidebarFilters({
  selectedCategories,
  availableCategories,
  onCategoryToggle,
  onClearFilters,
  showFilters,
}: IndexSidebarFiltersProps) {
  return (
    <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
      <TagFilter
        selectedTags={selectedCategories.slice()}
        availableTags={availableCategories.slice()}
        onTagToggle={onCategoryToggle}
        onClearAll={onClearFilters}
        title="Categories"
      />
    </div>
  );
}
