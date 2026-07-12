import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookStackParamList } from '../navigation/types';
import { Book } from '../types';
import * as booksApi from '../api/booksApi';
import * as categoriesApi from '../api/categoriesApi';
import BookCard from '../components/BookCard';
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
      <TextInput
        style={styles.search}
        placeholder="Tìm sách hoặc tác giả..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => loadBooks(1, true)}
        returnKeyType="search"
      />

      <FlatList
        horizontal
        data={['', ...categories]}
        keyExtractor={(item) => item || 'all'}
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        renderItem={({ item }) => (
          <Pressable style={[styles.chip, category === item && styles.chipActive]} onPress={() => setCategory(item)}>
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item || 'Tất cả'}</Text>
          </Pressable>
        )}
      />

      <FlatList
        horizontal
        data={SORT_OPTIONS}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        renderItem={({ item }) => (
          <Pressable style={[styles.chip, sort === item.key && styles.chipActive]} onPress={() => setSort(item.key)}>
            <Text style={[styles.chipText, sort === item.key && styles.chipTextActive]}>{item.label}</Text>
          </Pressable>
        )}
      />

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
  search: {
    margin: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  chipRow: { marginHorizontal: spacing.md, marginBottom: spacing.sm, maxHeight: 40 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 12, color: colors.textSoft },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  listContent: { paddingHorizontal: spacing.xs, paddingBottom: spacing.xxl },
});
