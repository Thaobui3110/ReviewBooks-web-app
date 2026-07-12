import React, { useState, useEffect } from 'react';
import { Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, BookStackParamList } from '../navigation/types';
import { Book } from '../types';
import * as booksApi from '../api/booksApi';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<BookStackParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    booksApi
      .listBooks({ sort: 'rating' })
      .then((data) => setBooks(data.books.slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);

  function openBook(bookId: number) {
    navigation.navigate('Books', { screen: 'BookDetail', params: { bookId }, initial: false });
  }

  function openBookList() {
    navigation.navigate('Books', { screen: 'BookList' });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Không gian đánh giá sách của cộng đồng</Text>
      <Text style={typography.h1}>ĐÁNH GIÁ SÁCH</Text>
      <Text style={[typography.bodyMuted, styles.intro]}>
        Chào mừng bạn đến với ReviewBooks — nơi bạn khám phá các đầu sách, đọc nhận xét và chia sẻ cảm nhận về
        sách.
      </Text>
      <PrimaryButton title="Khám phá thư viện" onPress={openBookList} style={styles.cta} />

      <Text style={styles.sectionTitle}>Sách được ưa thích</Text>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          scrollEnabled={false}
          renderItem={({ item }) => <BookCard book={item} onPress={() => openBook(item.id)} />}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  eyebrow: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  intro: { marginTop: spacing.sm, marginBottom: spacing.lg },
  cta: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
});
