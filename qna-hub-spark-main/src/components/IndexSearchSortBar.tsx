import { Search, Filter } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';

type SortByType = 'newest' | 'votes' | 'company';

interface IndexSearchSortBarProps {
  readonly searchQuery: string;
  readonly setSearchQuery: (q: string) => void;
  readonly sortBy: SortByType;
  readonly setSortBy: (v: SortByType) => void;
  readonly showFilters: boolean;
  readonly setShowFilters: (v: boolean) => void;
}

export function IndexSearchSortBar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
}: IndexSearchSortBarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search questions, companies, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <Select value={sortBy} onValueChange={(value: 'newest' | 'votes' | 'company') => setSortBy(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="votes">Most Voted</SelectItem>
            <SelectItem value="company">Company A-Z</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>
    </div>
  );
}
