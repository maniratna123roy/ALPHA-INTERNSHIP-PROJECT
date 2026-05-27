import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export interface UrlFilters {
  search: string;
  categories: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
}

export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<UrlFilters>(() => {
    const search = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category') || '';
    const categories = categoryParam ? categoryParam.split(',') : [];
    const sortBy = searchParams.get('sort') || '';
    const sortOrder = (searchParams.get('order') || 'asc') as 'asc' | 'desc';
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

    return {
      search,
      categories,
      sortBy,
      sortOrder,
      page,
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (newFilters: Partial<UrlFilters>) => {
      const nextParams = new URLSearchParams(searchParams);

      if (newFilters.search !== undefined) {
        if (newFilters.search) {
          nextParams.set('search', newFilters.search);
        } else {
          nextParams.delete('search');
        }
      }

      if (newFilters.categories !== undefined) {
        if (newFilters.categories.length > 0) {
          nextParams.set('category', newFilters.categories.join(','));
        } else {
          nextParams.delete('category');
        }
      }

      if (newFilters.sortBy !== undefined) {
        if (newFilters.sortBy) {
          nextParams.set('sort', newFilters.sortBy);
        } else {
          nextParams.delete('sort');
        }
      }

      if (newFilters.sortOrder !== undefined) {
        if (newFilters.sortOrder) {
          nextParams.set('order', newFilters.sortOrder);
        } else {
          nextParams.delete('order');
        }
      }

      if (newFilters.page !== undefined) {
        if (newFilters.page > 1) {
          nextParams.set('page', String(newFilters.page));
        } else {
          nextParams.delete('page');
        }
      }

      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return {
    filters,
    setFilters,
    resetFilters,
  };
}
