// Trang khám phá sách: tìm kiếm, lọc thể loại, sắp xếp, phân trang cuộn vô hạn
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookStackParamList } from '../navigation/types';
import { Book } from '../types';
import * as booksApi from '../api/booksApi';
import * as categoriesApi from '../api/categoriesApi';
import BookCard from '../components/BookCard';
import Dropdown from '../components/Dropdown';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import InfiniteScrollFooter from '../components/InfiniteScrollFooter';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<BookStackParamList, 'BookList'>;

type SortOption = 'newest' | 'rating' | 'title';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'rating', label: 'Đánh giá cao' },
  { key: 'title', label: 'Tên A-Z' },
];

export default function BookListScreen({ navigation }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    categoriesApi
      .listCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  const loadBooks = useCallback(
    async (targetPage: number, replace: boolean) => {
      if (replace) setInitialLoading(true);
      else setLoadingMore(true);
      try {
        const data = await booksApi.listBooks({ search, category, sort, page: targetPage });
        setBooks((prev) => (replace ? data.books : [...prev, ...data.books]));
        setHasNext(data.pagination.hasNext);
        setPage(data.pagination.currentPage);
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [search, category, sort]
  );

  useEffect(() => {
    loadBooks(1, true);
  }, [loadBooks]);

  function handleEndReached() {
    if (!hasNext || loadingMore || initialLoading) return;
    loadBooks(page + 1, false);
  }

  return (
    <View style={styles.container}>
      <SearchInput
        style={styles.search}
        placeholder="Tìm sách hoặc tác giả..."
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => loadBooks(1, true)}
      />

      <View style={styles.filterRow}>
        <Dropdown
          style={styles.filterHalf}
          value={category}
          options={[{ label: 'Tất cả thể loại', value: '' }, ...categories.map((c) => ({ label: c, value: c }))]}
          onSelect={setCategory}
        />
        <Dropdown
          style={styles.filterHalf}
          value={sort}
          options={SORT_OPTIONS.map((o) => ({ label: o.label, value: o.key }))}
          onSelect={(v) => setSort(v as SortOption)}
        />
      </View>

      {initialLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <BookCard book={item} onPress={() => navigation.navigate('BookDetail', { bookId: item.id })} />
          )}
          ListEmptyComponent={<EmptyState text="Không tìm thấy sách phù hợp." />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={<InfiniteScrollFooter loading={loadingMore} hasMore={hasNext} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  search: { margin: spacing.md },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.md, marginBottom: spacing.md },
  filterHalf: { flex: 1 },
  listContent: { paddingHorizontal: spacing.xs, paddingBottom: spacing.xxl },
});
