// Khai báo param list cho từng navigator, phục vụ typed navigation
import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type BookStackParamList = {
  BookList: undefined;
  BookDetail: { bookId: number };
};

export type MainTabParamList = {
  Home: undefined;
  Books: NavigatorScreenParams<BookStackParamList>;
  Reviews: undefined;
  Contact: undefined;
  Account: undefined;
};
