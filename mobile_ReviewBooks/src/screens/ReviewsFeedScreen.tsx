// Trang tất cả đánh giá: tìm kiếm theo tên/sách/nội dung, sắp xếp mới-cũ hoặc điểm cao-thấp
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { Review } from '../types';
import * as reviewsApi from '../api/reviewsApi';
import { ReviewsSortOption } from '../api/reviewsApi';
import StarRatingDisplay from '../components/StarRatingDisplay';
import Dropdown from '../components/Dropdown';
import SearchInput from '../components/SearchInput';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import InfiniteScrollFooter from '../components/InfiniteScrollFooter';
import { formatDate } from '../utils/formatDate';
import { API_BASE_URL } from '../api/config';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const SORT_OPTIONS: { key: ReviewsSortOption; label: string }[] = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'oldest', label: 'Cũ nhất' },
  { key: 'rating_high', label: 'Đánh giá cao' },
  { key: 'rating_low', label: 'Đánh giá thấp' },
];

export default function ReviewsFeedScreen() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ReviewsSortOption>('newest');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    async (targetPage: number, replace: boolean) => {
      if (replace) setInitialLoading(true);
      else setLoadingMore(true);
      try {
        const data = await reviewsApi.listReviewsFeed({ search, sort, page: targetPage });
        setReviews((prev) => (replace ? data.reviews : [...prev, ...data.reviews]));
        setHasNext(data.pagination.hasNext);
        setPage(data.pagination.currentPage);
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [search, sort]
  );

  useEffect(() => {
    load(1, true);
  }, [load]);

  function handleEndReached() {
    if (!hasNext || loadingMore || initialLoading) return;
    load(page + 1, false);
  }

  return (
    <View style={styles.container}>
      <Text style={[typography.h1, styles.header]}>Tất cả đánh giá</Text>

      <SearchInput
        style={styles.search}
        placeholder="Tìm kiếm"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => load(1, true)}
      />
      <Dropdown
        style={styles.sortDropdown}
        value={sort}
        options={SORT_OPTIONS.map((o) => ({ label: o.label, value: o.key }))}
        onSelect={(v) => setSort(v as ReviewsSortOption)}
      />

      {initialLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.content}
          data={reviews}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<EmptyState text="Không tìm thấy đánh giá phù hợp." />}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Image
                source={{ uri: `${API_BASE_URL}${item.book_cover_image}` }}
                style={styles.cover}
                resizeMode="cover"
              />
              <View style={styles.itemBody}>
                <View style={styles.itemHead}>
                  <Text style={styles.bookTitle} numberOfLines={1}>
                    {item.book_title}
                  </Text>
                  <StarRatingDisplay value={item.rating} showValue={false} />
                </View>
                <Text style={styles.meta}>
                  {item.username ?? item.name} · {formatDate(item.created_at)}
                </Text>
                <Text style={typography.body} numberOfLines={3}>
                  {item.content}
                </Text>
              </View>
            </View>
          )}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={<InfiniteScrollFooter loading={loadingMore} hasMore={hasNext} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  header: { marginBottom: spacing.md },
  search: { marginBottom: spacing.sm },
  sortDropdown: { marginBottom: spacing.md },
  list: { flex: 1 },
  content: { paddingBottom: spacing.xxxl },
  item: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  cover: { width: 56, height: 80, borderRadius: 6, backgroundColor: colors.surfaceWarm },
  itemBody: { flex: 1 },
  itemHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookTitle: { fontWeight: '700', color: colors.text, fontSize: 14, flex: 1, marginRight: spacing.sm },
  meta: { fontSize: 11, color: colors.textMuted, marginVertical: 2 },
});
