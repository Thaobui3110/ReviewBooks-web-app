// Trang chủ: banner giới thiệu và danh sách sách nổi bật
import React, { useState, useEffect } from 'react';
import { Text, View, Image, FlatList, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, BookStackParamList } from '../navigation/types';
import { Book } from '../types';
import * as booksApi from '../api/booksApi';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import PrimaryButton from '../components/PrimaryButton';
import { API_BASE_URL } from '../api/config';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

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
      <View style={styles.hero}>
        <View style={styles.heroImageWrap}>
          <Image
            source={{ uri: `${API_BASE_URL}/images/books/Toithayhoavangtrencoxanh.jpg` }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.eyebrow}>Không gian đánh giá sách của cộng đồng</Text>
          <Text style={styles.heroTitle}>ĐÁNH GIÁ SÁCH</Text>
          <Text style={styles.heroIntro}>
            Chào mừng bạn đến với ReviewBooks — nơi bạn khám phá các đầu sách, đọc nhận xét và chia sẻ cảm nhận về
            sách.
          </Text>
          <PrimaryButton title="Khám phá thư viện" onPress={openBookList} style={styles.cta} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.quoteSection}>
          <Text style={styles.quoteLabel}>Giới thiệu về web</Text>
          <Text style={styles.quoteCaption}>Châm ngôn</Text>
          <Text style={styles.quoteText}>“Một cuốn sách tốt là một người bạn trầm lặng nhưng bền bỉ.”</Text>
        </View>

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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxxl },

  hero: {
    minHeight: 300,
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.sageDark,
  },
  heroImageWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heroImage: { height: '100%', aspectRatio: 410 / 640 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(29, 33, 27, 0.72)' },
  heroContent: { padding: spacing.xl, paddingVertical: spacing.xxxl },
  eyebrow: {
    color: colors.accentSoft,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  heroTitle: { fontSize: 30, fontWeight: '800', color: '#fbf8f0', marginBottom: spacing.sm },
  heroIntro: { fontSize: 14, color: 'rgba(251, 248, 240, 0.85)', lineHeight: 20, marginBottom: spacing.lg },
  cta: { alignSelf: 'flex-start', paddingHorizontal: spacing.xl },

  body: { padding: spacing.lg },
  quoteSection: { alignItems: 'center', paddingVertical: spacing.xxl, marginBottom: spacing.sm },
  quoteLabel: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  quoteCaption: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.accentHover,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
});
