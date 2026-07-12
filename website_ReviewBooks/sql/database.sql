-- Reference schema for ReviewBooks. This script starts with DROP DATABASE, so
-- only run it to (re)provision the project's database from scratch.

DROP DATABASE IF EXISTS review_books;
CREATE DATABASE review_books CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE review_books;

-- Tắt Safe Updates cho phiên chạy script này — các câu UPDATE ảnh bìa/avatar bên dưới
-- lọc theo title/name (không phải cột khoá), MySQL Workbench mặc định chặn kiểu này
-- (Error 1175) trừ khi tắt cờ này. Bật lại ở cuối file để không ảnh hưởng các câu lệnh
-- thủ công khác của bạn sau khi script chạy xong.
SET SQL_SAFE_UPDATES = 0;

-- Ép phiên làm việc đọc các chuỗi literal trong file này đúng theo UTF-8 — nếu không,
-- một số client (vd. mysql CLI trên Windows chạy qua terminal dùng code page khác,
-- như CP437/latin1) sẽ đọc sai byte của chữ có dấu tiếng Việt và LƯU SAI THẬT vào DB
-- (không chỉ hiển thị sai), dù file .sql này vẫn luôn đúng UTF-8 trên đĩa.
SET NAMES utf8mb4;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  last_seen_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE authors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  avatar VARCHAR(255) DEFAULT '/images/authors/default-author.jpg',
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author_id INT NOT NULL,
  cover_image VARCHAR(255) DEFAULT '/images/books/placeholder.jpg',
  description TEXT,
  review_content TEXT,
  language VARCHAR(80) DEFAULT NULL,
  publish_year SMALLINT DEFAULT NULL,
  page_count SMALLINT DEFAULT NULL,
  publisher VARCHAR(150) DEFAULT NULL,
  translator VARCHAR(150) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_books_authors FOREIGN KEY (author_id) REFERENCES authors(id)
);

-- Many-to-many: 1 book can carry nhiều tag thể loại, 1 thể loại gắn cho nhiều sách.
CREATE TABLE book_categories (
  book_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (book_id, category_id),
  CONSTRAINT fk_bc_books FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT fk_bc_categories FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  content TEXT NOT NULL,
  rating DECIMAL(2,1) NOT NULL, -- Điểm đánh giá bước 0.5, từ 0.5 đến 5.0
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_books FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE site_stats (
  id INT PRIMARY KEY,
  total_views INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO site_stats (id, total_views) VALUES (1, 0);

-- id 1..10, theo đúng thứ tự chèn (dùng để tham chiếu trực tiếp trong book_categories bên dưới)
INSERT INTO categories (name) VALUES
('Văn học Việt Nam'),      -- 1
('Tiểu thuyết'),           -- 2
('Kỹ năng sống'),          -- 3
('Phát triển bản thân'),   -- 4
('Truyền cảm hứng'),       -- 5
('Lịch sử'),               -- 6
('Khoa học'),              -- 7
('Kinh doanh'),            -- 8
('Công nghệ'),             -- 9
('Thiếu nhi');             -- 10

-- id 1..27, theo đúng thứ tự chèn (dùng để tham chiếu trực tiếp qua author_id trong bảng books bên dưới)
INSERT INTO authors (name, bio) VALUES
('Nguyễn Nhật Ánh', 'Nhà văn Việt Nam nổi tiếng với các tác phẩm viết cho thiếu nhi và tuổi mới lớn, được nhiều độc giả gọi là "nhà văn của tuổi thơ". Nhiều tác phẩm của ông đã được chuyển thể thành phim điện ảnh thành công.'), -- 1
('Paulo Coelho', 'Paulo Coelho sinh tại Rio de Janeiro (Brasil). Ông học đại học trường luật, nhưng đã bỏ học năm 1970 để du lịch qua México, Peru, Bolivia và Chile, cũng như châu Âu và Bắc Phi. Hai năm sau, ông trở về Brasil và bắt đầu soạn lời nhạc pop. Ông cộng tác với những nhạc sĩ pop như Raul Seixas. Năm 1974, ông bị bắt giam một thời gian ngắn vì những hoạt động chống lại chế độ độc tài thời đó ở Brazil. Sách của ông đã bán ra hơn 86 triệu bản trên 150 nước và được dịch ra 56 thứ tiếng. Ông đã nhận được nhiều giải thưởng của nhiều nước, trong đó tác phẩm Veronika quyết chết (Veronika decide morrer) được đề cử cho Giải Văn chương Dublin IMPAC Quốc tế.'), -- 2
('Dale Carnegie', 'Dale Breckenridge Carnegie (1888 - 1955) là một nhà văn và nhà diễn thuyết người Mỹ, nổi tiếng với các khóa học về tự giáo dục, nghệ thuật bán hàng, huấn luyện đoàn thể, nói trước công chúng và các kỹ năng giao tiếp giữa cá nhân. Ông được công nhận là một trong những người đi tiên phong trong lĩnh vực phát triển con người và truyền cảm hứng, nhờ những cuốn sách bán chạy nhất của ông, chẳng hạn như "Cách Dùng Bạn bè và Ảnh Hưởng Lên Người Khác" và "Không Cần Lo Nghĩ, Hãy Thực Hành".'), -- 3
('James Clear', 'James Clear là một tác giả, diễn giả và chuyên gia nổi tiếng toàn cầu về thói quen cũng như sự phát triển bản thân. Ông sinh ngày 22 tháng 1 năm 1986 tại Hamilton, Ohio, Hoa Kỳ.'), -- 4
('Rosie Nguyễn', 'Tác giả người Việt, cây bút quen thuộc với độc giả trẻ về chủ đề học tập, trải nghiệm và phát triển bản thân.'), -- 5
('Yuval Noah Harari', 'Sử gia và tác giả người Israel, giáo sư Đại học Hebrew Jerusalem, nổi tiếng với các tác phẩm về lịch sử loài người và tương lai công nghệ.'), -- 6
('Tô Hoài', 'Nhà văn Việt Nam, một trong những cây bút lớn của văn học hiện đại Việt Nam với nhiều tác phẩm viết cho thiếu nhi.'), -- 7
('Stephen Hawking', 'Nhà vật lý lý thuyết người Anh, nổi tiếng với các nghiên cứu về hố đen và vũ trụ học, cũng như khả năng phổ biến khoa học cho công chúng.'), -- 8
('Hector Malot', 'Nhà văn người Pháp thế kỷ 19, được biết đến nhiều nhất qua tiểu thuyết Không Gia Đình.'), -- 9
('Eric Ries', 'Doanh nhân và tác giả người Mỹ, người khởi xướng phương pháp "khởi nghiệp tinh gọn" được áp dụng rộng rãi trong giới startup.'), -- 10
('Robert C. Martin', 'Kỹ sư phần mềm kỳ cựu người Mỹ, được biết đến với biệt danh "Uncle Bob", tác giả nhiều đầu sách kinh điển về lập trình.'), -- 11
('Trần Trọng Kim', 'Học giả, nhà sử học Việt Nam đầu thế kỷ 20, tác giả nhiều công trình nghiên cứu về lịch sử và văn hóa Việt Nam.'), -- 12
('Nam Cao', 'Nhà văn hiện thực phê phán tiêu biểu của văn học Việt Nam giai đoạn 1930-1945.'), -- 13
('Vũ Trọng Phụng', 'Nhà văn, nhà báo Việt Nam nổi tiếng với phong cách trào phúng sắc sảo về xã hội đương thời.'), -- 14
('Antoine de Saint-Exupéry', 'Nhà văn, phi công người Pháp, tác giả tác phẩm kinh điển Hoàng Tử Bé.'), -- 15
('George Orwell', 'Nhà văn người Anh, nổi tiếng với các tác phẩm phản địa đàng phê phán chủ nghĩa toàn trị.'), -- 16
('Mario Puzo', 'Nhà văn người Mỹ gốc Ý, được biết đến nhiều nhất qua tiểu thuyết Bố Già.'), -- 17
('Stephen R. Covey', 'Tác giả, diễn giả người Mỹ chuyên về lãnh đạo và phát triển bản thân.'), -- 18
('Kishimi Ichiro & Koga Fumitake', 'Hai tác giả người Nhật Bản, kết hợp giữa nghiên cứu triết học và viết văn để giới thiệu tâm lý học Adler tới độc giả đại chúng.'), -- 19
('Nguyên Phong', 'Bút danh của một tác giả gốc Việt sống tại Mỹ, được biết đến qua nhiều tác phẩm kết hợp giữa văn hóa phương Đông và khoa học hiện đại.'), -- 20
('Napoleon Hill', 'Tác giả người Mỹ, một trong những người đặt nền móng cho thể loại sách self-help hiện đại.'), -- 21
('Robert Kiyosaki', 'Doanh nhân, tác giả người Mỹ, nổi tiếng với loạt sách về giáo dục tài chính cá nhân.'), -- 22
('Peter Thiel', 'Doanh nhân, nhà đầu tư công nghệ người Mỹ, đồng sáng lập PayPal và là nhà đầu tư ban đầu của nhiều công ty công nghệ lớn.'), -- 23
('Robin Sharma', 'Tác giả, diễn giả người Canada chuyên về chủ đề lãnh đạo và phát triển bản thân.'), -- 24
('Jared Diamond', 'Nhà khoa học, tác giả người Mỹ, giáo sư địa lý học với các công trình liên ngành về lịch sử loài người.'), -- 25
('Robert Louis Stevenson', 'Nhà văn người Scotland thế kỷ 19, tác giả nhiều tác phẩm phiêu lưu kinh điển.'), -- 26
('Roald Dahl', 'Nhà văn người Anh gốc Wales, nổi tiếng với các tác phẩm văn học thiếu nhi giàu trí tưởng tượng.'); -- 27

-- Ảnh đại diện thật cho các tác giả đã có sẵn file trong public/images/authors/
-- (các tác giả còn lại dùng DEFAULT '/images/authors/default-author.jpg' của cột avatar).
UPDATE authors SET avatar = '/images/authors/Nguyen_Nhat_Anh.jpg' WHERE name = 'Nguyễn Nhật Ánh';
UPDATE authors SET avatar = '/images/authors/paulo_coelho.jpg' WHERE name = 'Paulo Coelho';
UPDATE authors SET avatar = '/images/authors/dale_carnegie.jpg' WHERE name = 'Dale Carnegie';
UPDATE authors SET avatar = '/images/authors/james_clear.jpg' WHERE name = 'James Clear';
UPDATE authors SET avatar = '/images/authors/Rosie_Nguyen.jpg' WHERE name = 'Rosie Nguyễn';
UPDATE authors SET avatar = '/images/authors/Yuval_Noah_Harari.jpg' WHERE name = 'Yuval Noah Harari';
UPDATE authors SET avatar = '/images/authors/Hector_Malot.jpg' WHERE name = 'Hector Malot';
UPDATE authors SET avatar = '/images/authors/To_Hoai.jpg' WHERE name = 'Tô Hoài';
UPDATE authors SET avatar = '/images/authors/Vu_Trong_Phung.jpg' WHERE name = 'Vũ Trọng Phụng';

-- Mật khẩu đã hash bằng utils/password.js::hashPassword (PBKDF2, format "salt:hash").
-- Mật khẩu gốc: admin -> admin123, tất cả các tài khoản user -> user123.
-- id 1..17, theo đúng thứ tự chèn (dùng để tham chiếu trực tiếp trong comments bên dưới)
INSERT INTO users (username, email, password, role, last_seen_at) VALUES
('admin', 'admin@bookreview.local', '7c43f155c420fc1bf6db6be8c81baec5:dbbf324b199ec973fde1e3e9e5bda423190cd0e8e6f0fab398b55704f0664c8abc034ad7de278a1515478ff8c5ddd44898901c290d9093aef0423cef3962eb97', 'admin', NULL), -- 1
('reader', 'reader@bookreview.local', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 2
('linh_reader', 'linh@bookreview.local', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 3
('minh_reader', 'minh@bookreview.local', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 4
('hoa_reader', 'hoa@bookreview.local', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 5
('an_nguyen', 'nguyenvanan88@gmail.com', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 6
('bich_tran', 'tranthibich90@gmail.com', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 7
('nam_le', 'lehoangnam1995@gmail.com', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 8
('ha_pham', 'phamthuha.reads@gmail.com', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 9
('khoa_vu', 'vudinhkhoa2000@gmail.com', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 10
('linh_dang', 'dangngoclinh99@gmail.com', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 11
('tung_bui', 'buithanhtung.dev@gmail.com', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 12
('anh_hoang', 'hoangmaianh93@gmail.com', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 13
('huy_do', 'doquanghuy2001@gmail.com', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 14
('oanh_ngo', 'ngokimoanh86@gmail.com', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 15
('phuc_trinh', 'trinhvanphuc97@gmail.com', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL), -- 16
('vy_ly', 'lythaovy.books@gmail.com', 'f77396b91a4c781ec209192c3ceaaf0c:fadd77dc23ab881fa2450f3431446b3eeb3bdc0c990a3f9db3200d4dbd1e5442faa7930f5ed9278c293f811d59e9720bbad67318ca8a47e9097bb8019e30d9c5', 'user', NULL); -- 17

-- id 1..30, theo đúng thứ tự chèn (dùng để tham chiếu trực tiếp trong book_categories bên dưới)
-- language = ngôn ngữ gốc của tác phẩm; publish_year = năm xuất bản lần đầu (không phải năm bản dịch tiếng Việt)
-- author_id tham chiếu tới bảng authors ở trên (1=Nguyễn Nhật Ánh, 6=Yuval Noah Harari, 8=Stephen Hawking dùng chung cho 2 sách)
INSERT INTO books (title, author_id, cover_image, description, review_content, language, publish_year, page_count, publisher, translator) VALUES
('Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 1, '/images/books/placeholder.jpg', 'Cuốn sách là hành trình trở về tuổi thơ trong trẻo qua câu chuyện của Thiều, Tường, Mận và những người dân làng nghèo nhưng ấm tình. Qua lăng kính ngây thơ của trẻ nhỏ, tác phẩm khắc họa vẻ đẹp hồn nhiên, tình cảm gia đình, sự kết nối giữa con người với thiên nhiên và động vật. Những trò chơi giản dị, nỗi buồn mất mát, hiểu lầm anh em hay âm thanh da diết từ cây đàn acmônica đều gợi nhớ khoảng thời gian vô tư hiếm quý. Cuốn sách thức tỉnh ta về giá trị của hiện tại, lời hứa, tổn thương trái tim và bài học tha thứ – tất cả như một bản nhạc dịu dàng về tuổi thơ từng đi qua mỗi người.', 'Tác phẩm có giọng kể nhẹ, giàu hình ảnh và giàu cảm xúc. Điểm mạnh là cách tác giả tái hiện thế giới trẻ thơ vừa hồn nhiên vừa nhiều tổn thương.', 'Tiếng Việt', 2010, 378, 'NXB Trẻ', NULL),
('Nhà Giả Kim', 2, '/images/books/placeholder.jpg', 'Nhà Giả Kim kể về hành trình tìm kho báu của cậu bé chăn cừu Santiago, nhưng ẩn sau đó là thông điệp sâu sắc về việc theo đuổi ước mơ và khám phá bản thân. Qua những thử thách, Santiago học được rằng kho báu thực sự không phải là vàng bạc mà là sự trưởng thành, hiểu biết và ý nghĩa cuộc sống. Tác phẩm truyền cảm hứng để mỗi người dám bước ra khỏi vùng an toàn, tin vào trái tim mình và tin rằng khi thực sự khao khát điều gì, cả vũ trụ sẽ hợp lực giúp đạt được điều đó.', 'Cuốn sách dễ đọc, giàu tính biểu tượng. Phù hợp với người đọc thích những thông điệp ngắn gọn về ước mơ và lựa chọn cá nhân.', 'Tiếng Bồ Đào Nha', 1988, 227, 'NXB Hội Nhà Văn', 'Lê Chu Cầu'),
('Đắc Nhân Tâm', 3, '/images/books/placeholder.jpg', '"Đắc Nhân Tâm" của Dale Carnegie là tác phẩm kinh điển về phát triển bản thân và kỹ năng giao tiếp, có sức ảnh hưởng toàn cầu với hơn 15 triệu bản bán ra. Cuốn sách không chỉ cung cấp các nguyên tắc ứng xử thông minh mà còn dẫn dắt người đọc vào hành trình thấu hiểu bản thân và đồng loại. Từ việc không chỉ trích, biết khen ngợi chân thành đến lắng nghe tích cực và khơi gợi sự hợp tác, những bài học trong sách phù hợp với mọi lứa tuổi và lĩnh vực. Qua từng chương, độc giả học cách xây dựng mối quan hệ tích cực, truyền cảm hứng và dẫn dắt người khác một cách tinh tế, nhân văn. Đây không chỉ là sách kỹ năng, mà là kim chỉ nam cho cuộc sống ý nghĩa và thành công bền vững.', 'Nội dung thực tế, nhiều nguyên tắc dễ áp dụng. Khi đọc cần chọn lọc để tránh biến giao tiếp thành kỹ thuật máy móc.', 'Tiếng Anh', 1936, 320, 'NXB Tổng hợp TP.HCM', 'Nguyễn Hiến Lê'),
('Atomic Habits', 4, '/images/books/placeholder.jpg', 'Trong một xã hội luôn ám ảnh với kết quả tức thì và những thay đổi ngoạn mục, Atomic Habits của James Clear nổi bật như một ngọn hải đăng dẫn lối bằng sự khôn ngoan thực tiễn. Xuất bản năm 2018, cuốn sách này nhanh chóng trở thành một tác phẩm kinh điển hiện đại trong thể loại phát triển bản thân, khẳng định rằng thay đổi bền vững không đến từ những bước đột phá lớn lao, mà từ những thói quen nhỏ bé, được lặp đi lặp lại mỗi ngày.', 'Sách có cấu trúc rõ, ví dụ dễ hiểu. Giá trị chính nằm ở cách biến mục tiêu lớn thành hệ thống hành động nhỏ và đều đặn.', 'Tiếng Anh', 2018, 320, 'NXB Thế Giới', 'Nguyễn Minh Trang'),
('Tuổi Trẻ Đáng Giá Bao Nhiêu', 5, '/images/books/placeholder.jpg', 'Những suy ngẫm về học tập, trải nghiệm, đọc sách và trưởng thành.', 'Phù hợp với học sinh, sinh viên đang tìm định hướng. Văn phong gần gũi, dễ tiếp cận, thiên về động lực cá nhân.', 'Tiếng Việt', 2016, 260, 'NXB Hội Nhà Văn', NULL),
('Sapiens', 6, '/images/books/placeholder.jpg', 'Lược sử loài người qua các giai đoạn nhận thức, nông nghiệp, xã hội và khoa học.', 'Một cuốn sách giàu góc nhìn tổng hợp. Nên đọc với tinh thần phản biện vì sách đưa ra nhiều diễn giải rộng về lịch sử và xã hội.', 'Tiếng Hebrew', 2011, 443, 'NXB Tri Thức', 'Nguyễn Thủy Chung'),
('Dế Mèn Phiêu Lưu Ký', 7, '/images/books/placeholder.jpg', 'Tác phẩm thiếu nhi kinh điển về hành trình trưởng thành của Dế Mèn.', 'Truyện có tính phiêu lưu, giàu bài học về trách nhiệm, lòng dũng cảm và sự khiêm tốn.', 'Tiếng Việt', 1941, 155, 'NXB Kim Đồng', NULL),
('Lược Sử Thời Gian', 8, '/images/books/placeholder.jpg', 'Giới thiệu các ý tưởng lớn về vũ trụ học cho độc giả phổ thông.', 'Một cuốn sách kích thích tò mò khoa học, tuy có một số phần cần đọc chậm để nắm ý tưởng.', 'Tiếng Anh', 1988, 256, 'NXB Trẻ', 'Cao Chi, Phạm Văn Thiều'),
('Không Gia Đình', 9, '/images/books/placeholder.jpg', 'Câu chuyện cảm động về cậu bé Rémi trên hành trình mưu sinh.', 'Tác phẩm giàu cảm xúc, đề cao lòng nhân ái và nghị lực sống.', 'Tiếng Pháp', 1878, 559, 'NXB Văn Học', 'Huỳnh Lý'),
('Khởi Nghiệp Tinh Gọn', 10, '/images/books/placeholder.jpg', 'Phương pháp xây dựng sản phẩm dựa trên thử nghiệm, đo lường và học hỏi.', 'Nội dung phù hợp với người quan tâm startup và phát triển sản phẩm.', 'Tiếng Anh', 2011, 320, 'NXB Lao Động Xã Hội', 'Đặng Trần Phương'),
('Clean Code', 11, '/images/books/placeholder.jpg', 'Các nguyên tắc viết mã rõ ràng, dễ bảo trì.', 'Sách hữu ích cho lập trình viên muốn cải thiện chất lượng code.', 'Tiếng Anh', 2008, 464, 'NXB Khoa Học Kỹ Thuật', 'Nguyễn Thành Nam'),
('Việt Nam Sử Lược', 12, '/images/books/placeholder.jpg', 'Tổng thuật lịch sử Việt Nam theo lối viết cổ điển.', 'Nên đọc như một tài liệu tham khảo lịch sử, kết hợp với nguồn hiện đại để đối chiếu.', 'Tiếng Việt', 1920, 588, 'NXB Văn Học', NULL),
('Chí Phèo', 13, '/images/books/placeholder.jpg', 'Bi kịch của một người nông dân bị tha hóa bởi xã hội thực dân phong kiến.', 'Ngòi bút hiện thực sắc sảo, khắc họa nỗi đau con người bị cự tuyệt quyền làm người.', 'Tiếng Việt', 1941, 220, 'NXB Văn Học', NULL),
('Số Đỏ', 14, '/images/books/placeholder.jpg', 'Bức tranh trào phúng về xã hội thượng lưu rởm đời thời Pháp thuộc.', 'Giọng văn châm biếm sắc bén, nhân vật Xuân Tóc Đỏ trở thành biểu tượng văn học.', 'Tiếng Việt', 1936, 262, 'NXB Văn Học', NULL),
('Mắt Biếc', 1, '/images/books/placeholder.jpg', 'Mối tình đơn phương dai dẳng của Ngạn dành cho Hà Lan từ thuở nhỏ đến khi trưởng thành.', 'Câu chuyện nhẹ nhàng nhưng day dứt, khắc họa tình yêu thuần khiết và sự tiếc nuối.', 'Tiếng Việt', 1990, 300, 'NXB Trẻ', NULL),
('Hoàng Tử Bé', 15, '/images/books/placeholder.jpg', 'Cuộc gặp gỡ giữa phi công lạc giữa sa mạc và vị hoàng tử đến từ hành tinh khác.', 'Tác phẩm tưởng viết cho trẻ em nhưng chứa nhiều triết lý sâu sắc về cuộc sống.', 'Tiếng Pháp', 1943, 96, 'NXB Kim Đồng', 'Vĩnh Lạc'),
('1984', 16, '/images/books/placeholder.jpg', 'Xã hội toàn trị nơi mọi hành vi, tư tưởng đều bị giám sát bởi Big Brother.', 'Tác phẩm kinh điển về chủ đề tự do cá nhân, vẫn còn tính thời sự cao.', 'Tiếng Anh', 1949, 328, 'NXB Hội Nhà Văn', 'Đặng Phi'),
('Bố Già', 17, '/images/books/placeholder.jpg', 'Thế giới ngầm và luật lệ danh dự của một gia tộc mafia Ý tại Mỹ.', 'Xây dựng nhân vật chặt chẽ, đặc biệt là hình tượng Don Corleone đầy uy quyền.', 'Tiếng Anh', 1969, 586, 'NXB Văn Học', 'Ngọc Thứ Lang'),
('7 Thói Quen Hiệu Quả', 18, '/images/books/placeholder.jpg', 'Khung tư duy 7 thói quen giúp thay đổi bản thân từ gốc rễ.', 'Hệ thống hóa tốt, phù hợp đọc chậm và thực hành từng phần một.', 'Tiếng Anh', 1989, 432, 'NXB Tổng hợp TP.HCM', 'Vũ Tiến Phúc'),
('Dám Bị Ghét', 19, '/images/books/placeholder.jpg', 'Đối thoại giữa triết gia và chàng thanh niên về tâm lý học Adler.', 'Cách trình bày dạng đối thoại dễ theo dõi, đặt lại nhiều quan niệm quen thuộc.', 'Tiếng Nhật', 2013, 336, 'NXB Lao Động', 'Nguyễn Đình Chính'),
('Muôn Kiếp Nhân Sinh', 20, '/images/books/placeholder.jpg', 'Hành trình khám phá luật nhân quả qua các tiền kiếp được kể lại.', 'Nội dung pha trộn giữa tâm linh và lịch sử, gây nhiều tranh luận nhưng hấp dẫn.', 'Tiếng Anh', 2020, 500, 'NXB Tổng hợp TP.HCM', NULL),
('Homo Deus', 6, '/images/books/placeholder.jpg', 'Những dự đoán về tương lai loài người trong thời đại công nghệ và dữ liệu.', 'Tiếp nối Sapiens với góc nhìn hướng tới tương lai, nhiều luận điểm gây tranh cãi.', 'Tiếng Hebrew', 2015, 450, 'NXB Thế Giới', 'Dương Ngọc Trà'),
('Vũ Trụ Trong Vỏ Hạt Dẻ', 8, '/images/books/placeholder.jpg', 'Giải thích các khái niệm vật lý hiện đại như hố đen, không-thời gian.', 'Hình ảnh minh họa trực quan giúp người đọc phổ thông dễ tiếp cận hơn.', 'Tiếng Anh', 2001, 216, 'NXB Trẻ', 'Phạm Văn Thiều'),
('Nghĩ Giàu Làm Giàu', 21, '/images/books/placeholder.jpg', 'Đúc kết 13 nguyên tắc thành công từ nghiên cứu hàng trăm triệu phú.', 'Một trong những cuốn sách truyền cảm hứng làm giàu kinh điển nhất mọi thời đại.', 'Tiếng Anh', 1937, 320, 'NXB Lao Động Xã Hội', 'Trịnh Vũ Thuận'),
('Cha Giàu Cha Nghèo', 22, '/images/books/placeholder.jpg', 'So sánh tư duy tài chính giữa hai người cha để rút ra bài học về tiền bạc.', 'Thay đổi cách nhìn về tài sản và tiêu sản, dễ đọc cho người mới bắt đầu.', 'Tiếng Anh', 1997, 336, 'NXB Trẻ', 'Nguyễn Tiến Dũng'),
('Zero to One', 23, '/images/books/placeholder.jpg', 'Tư duy tạo ra giá trị độc nhất thay vì cạnh tranh trong thị trường có sẵn.', 'Góc nhìn sắc bén từ nhà đầu tư công nghệ, nhiều ý tưởng phản trực giác.', 'Tiếng Anh', 2014, 224, 'NXB Trẻ', 'Vương Bảo Long'),
('Nhà Lãnh Đạo Không Chức Danh', 24, '/images/books/placeholder.jpg', 'Ai cũng có thể lãnh đạo bằng hành động, không cần chức vụ.', 'Văn phong truyền cảm hứng, phù hợp người mới đi làm muốn phát triển bản thân.', 'Tiếng Anh', 2010, 288, 'NXB Trẻ', 'Thu Hằng'),
('Súng, Vi Trùng và Thép', 25, '/images/books/placeholder.jpg', 'Lý giải vì sao các nền văn minh phát triển khác nhau qua yếu tố địa lý, dịch bệnh.', 'Lập luận công phu, kết hợp lịch sử, sinh học và địa lý theo hướng liên ngành.', 'Tiếng Anh', 1997, 528, 'NXB Lao Động', 'Trần Tiễn Cao Đăng'),
('Đảo Giấu Vàng', 26, '/images/books/placeholder.jpg', 'Cuộc phiêu lưu tìm kho báu hải tặc của cậu bé Jim Hawkins.', 'Tác phẩm phiêu lưu kinh điển, nhịp truyện nhanh, cuốn hút từ đầu đến cuối.', 'Tiếng Anh', 1883, 292, 'NXB Kim Đồng', 'Đông A'),
('Charlie Và Nhà Máy Sô-cô-la', 27, '/images/books/placeholder.jpg', 'Cậu bé nghèo Charlie may mắn trúng vé tham quan nhà máy sô-cô-la kỳ diệu.', 'Trí tưởng tượng phong phú, phù hợp đọc cùng trẻ nhỏ vào mỗi tối.', 'Tiếng Anh', 1964, 208, 'NXB Kim Đồng', 'Nguyễn Hoàng Linh');

-- Ảnh bìa thật cho các sách đã có sẵn file trong public/images/books/
-- (các sách còn lại dùng '/images/books/placeholder.jpg' như đã chèn ở trên).
UPDATE books SET cover_image = '/images/books/Toithayhoavangtrencoxanh.jpg' WHERE title = 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh';
UPDATE books SET cover_image = '/images/books/nhagiakim.jpg' WHERE title = 'Nhà Giả Kim';
UPDATE books SET cover_image = '/images/books/dacnhantam.jpg' WHERE title = 'Đắc Nhân Tâm';
UPDATE books SET cover_image = '/images/books/AtomicHabits.jpg' WHERE title = 'Atomic Habits';
UPDATE books SET cover_image = '/images/books/tuoi-tre-dang-gia-bao-nhieu.jpg' WHERE title = 'Tuổi Trẻ Đáng Giá Bao Nhiêu';
UPDATE books SET cover_image = '/images/books/Sapiens.jpg' WHERE title = 'Sapiens';
UPDATE books SET cover_image = '/images/books/DeMenPhieuLuuKy.jpg' WHERE title = 'Dế Mèn Phiêu Lưu Ký';
UPDATE books SET cover_image = '/images/books/KhongGiaDinh.jpg' WHERE title = 'Không Gia Đình';
UPDATE books SET cover_image = '/images/books/LuocSuThoiGian.jpg' WHERE title = 'Lược Sử Thời Gian';
UPDATE books SET cover_image = '/images/books/MatBiec.jpg' WHERE title = 'Mắt Biếc';
UPDATE books SET cover_image = '/images/books/SoDo.jpg' WHERE title = 'Số Đỏ';

-- Gắn tag thể loại cho từng sách (book_id, category_id) — nhiều sách có từ 2 tag trở lên.
INSERT INTO book_categories (book_id, category_id) VALUES
(1, 1), (1, 2),
(2, 2), (2, 5),
(3, 3),
(4, 4), (4, 3),
(5, 5),
(6, 6), (6, 7),
(7, 10), (7, 1),
(8, 7),
(9, 2),
(10, 8),
(11, 9),
(12, 6),
(13, 1),
(14, 1), (14, 2),
(15, 1), (15, 2),
(16, 2), (16, 10),
(17, 2),
(18, 2),
(19, 3), (19, 4),
(20, 4), (20, 5),
(21, 5), (21, 6),
(22, 7), (22, 6),
(23, 7),
(24, 8), (24, 4),
(25, 8), (25, 4),
(26, 8), (26, 9),
(27, 8), (27, 4),
(28, 6), (28, 7),
(29, 10), (29, 2),
(30, 10);

INSERT INTO comments (book_id, user_id, name, email, content, rating, created_at) VALUES
(1, 2, 'reader', 'reader@bookreview.local', 'Sách rất nhẹ nhàng, đọc xong thấy nhớ tuổi thơ.', 5, '2026-01-02 09:00:00'),
(2, 2, 'reader', 'reader@bookreview.local', 'Thông điệp đơn giản nhưng truyền cảm hứng.', 4, '2026-01-03 10:15:00'),
(4, 2, 'reader', 'reader@bookreview.local', 'Rất thực tế cho việc xây dựng thói quen học tập.', 5, '2026-01-04 11:30:00'),
(1, 3, 'linh_reader', 'linh@bookreview.local', 'Phần miêu tả tuổi thơ rất đẹp, văn phong dễ đọc.', 5, '2026-01-05 08:20:00'),
(3, 3, 'linh_reader', 'linh@bookreview.local', 'Có nhiều nguyên tắc giao tiếp hữu ích nhưng cần áp dụng linh hoạt.', 4, '2026-01-06 13:00:00'),
(6, 3, 'linh_reader', 'linh@bookreview.local', 'Góc nhìn rộng, nhiều phần khiến mình muốn tìm hiểu thêm.', 4, '2026-01-07 14:45:00'),
(7, 4, 'minh_reader', 'minh@bookreview.local', 'Đọc vui và có nhiều bài học cho thiếu nhi.', 5, '2026-01-08 16:10:00'),
(8, 4, 'minh_reader', 'minh@bookreview.local', 'Một số đoạn hơi khó nhưng rất kích thích trí tò mò.', 4, '2026-01-09 19:30:00'),
(10, 4, 'minh_reader', 'minh@bookreview.local', 'Phù hợp nếu đang tìm cách kiểm chứng ý tưởng sản phẩm.', 4, '2026-01-10 20:00:00'),
(11, 5, 'hoa_reader', 'hoa@bookreview.local', 'Nhiều lời khuyên code thực tế, đặc biệt là đặt tên và tách hàm.', 5, '2026-01-11 07:50:00'),
(5, 5, 'hoa_reader', 'hoa@bookreview.local', 'Sách nhẹ nhàng, phù hợp với sinh viên.', 4, '2026-01-12 09:40:00'),
(9, 5, 'hoa_reader', 'hoa@bookreview.local', 'Câu chuyện cảm động và có sức sống lâu dài.', 5, '2026-01-13 12:25:00'),
(12, 2, 'reader', 'reader@bookreview.local', 'Có giá trị tham khảo, nhưng cần đọc thêm nguồn đối chiếu.', 3, '2026-01-14 15:10:00'),
(4, 3, 'linh_reader', 'linh@bookreview.local', 'Các ví dụ về thói quen nhỏ rất dễ áp dụng.', 5, '2026-01-15 17:40:00'),
(2, 4, 'minh_reader', 'minh@bookreview.local', 'Truyện ngắn gọn, dễ nhớ, thông điệp rõ.', 4, '2026-01-16 18:05:00'),
(11, 2, 'reader', 'reader@bookreview.local', 'Hữu ích nhưng có vài quan điểm cần chọn lọc theo dự án.', 4, '2026-01-17 21:15:00'),
(14, 3, 'linh_reader', 'linh@bookreview.local', 'Giọng văn châm biếm rất sắc, đọc vẫn thấy đúng với xã hội bây giờ.', 5, '2026-01-18 09:10:00'),
(15, 4, 'minh_reader', 'minh@bookreview.local', 'Buồn nhưng rất đẹp, đọc xong nhớ mãi nhân vật Ngạn.', 5, '2026-01-19 20:30:00'),
(20, 5, 'hoa_reader', 'hoa@bookreview.local', 'Đổi cách nhìn về việc sống theo kỳ vọng người khác.', 4, '2026-01-20 08:45:00'),
(24, 2, 'reader', 'reader@bookreview.local', 'Một vài phần hơi cũ nhưng nguyên tắc cốt lõi vẫn giá trị.', 4, '2026-01-21 14:00:00'),
(13, 6, 'an_nguyen', 'nguyenvanan88@gmail.com', 'Ngôn ngữ hiện thực rất mạnh, đọc mà thấy nghẹn ở đoạn cuối.', 5, '2026-01-22 08:00:00'),
(13, 7, 'bich_tran', 'tranthibich90@gmail.com', 'Tác phẩm kinh điển nhưng vẫn còn tính thời sự khi nói về định kiến xã hội.', 4, '2026-01-22 09:15:00'),
(16, 8, 'nam_le', 'lehoangnam1995@gmail.com', 'Ẩn dụ nhẹ nhàng nhưng thấm, đọc lại nhiều lần vẫn thấy hay.', 5, '2026-01-22 10:30:00'),
(16, 9, 'ha_pham', 'phamthuha.reads@gmail.com', 'Sách mỏng nhưng chứa nhiều triết lý sống đáng suy ngẫm.', 5, '2026-01-22 11:45:00'),
(17, 10, 'khoa_vu', 'vudinhkhoa2000@gmail.com', 'Ám ảnh vì độ chân thực của một xã hội giám sát toàn diện.', 5, '2026-01-22 13:00:00'),
(17, 11, 'linh_dang', 'dangngoclinh99@gmail.com', 'Đọc chậm vì nhiều đoạn khá nặng nề nhưng rất đáng suy nghĩ.', 4, '2026-01-22 14:15:00'),
(18, 12, 'tung_bui', 'buithanhtung.dev@gmail.com', 'Xây dựng nhân vật rất chắc, đặc biệt là Don Corleone.', 5, '2026-01-22 15:30:00'),
(18, 13, 'anh_hoang', 'hoangmaianh93@gmail.com', 'Nhịp truyện hơi chậm ở giữa nhưng phần đầu và cuối rất cuốn.', 4, '2026-01-22 16:45:00'),
(19, 14, 'huy_do', 'doquanghuy2001@gmail.com', 'Nội dung hệ thống, đọc và áp dụng dần từng thói quen một.', 4, '2026-01-23 08:00:00'),
(19, 15, 'oanh_ngo', 'ngokimoanh86@gmail.com', 'Kinh điển nhưng vẫn còn giá trị, phù hợp đọc đi đọc lại.', 5, '2026-01-23 09:15:00'),
(21, 16, 'phuc_trinh', 'trinhvanphuc97@gmail.com', 'Cách kể chuyện cuốn hút, dù phần tâm linh cần đọc với góc nhìn cởi mở.', 4, '2026-01-23 10:30:00'),
(21, 17, 'vy_ly', 'lythaovy.books@gmail.com', 'Kết hợp lịch sử và triết lý nhân quả khá thú vị.', 4, '2026-01-23 11:45:00'),
(22, 6, 'an_nguyen', 'nguyenvanan88@gmail.com', 'Nhiều dự đoán táo bạo, đọc xong có nhiều câu hỏi hơn là câu trả lời.', 4, '2026-01-23 13:00:00'),
(22, 7, 'bich_tran', 'tranthibich90@gmail.com', 'Tiếp nối Sapiens tốt, tuy hơi dài ở một số chương giữa.', 4, '2026-01-23 14:15:00'),
(23, 8, 'nam_le', 'lehoangnam1995@gmail.com', 'Giải thích vật lý phức tạp khá dễ hiểu với hình minh họa tốt.', 5, '2026-01-23 15:30:00'),
(23, 9, 'ha_pham', 'phamthuha.reads@gmail.com', 'Cần đọc chậm nhưng rất đáng, mở mang nhiều khái niệm mới.', 4, '2026-01-23 16:45:00'),
(25, 10, 'khoa_vu', 'vudinhkhoa2000@gmail.com', 'Thay đổi cách nghĩ về tài sản và tiêu sản, dễ đọc cho người mới.', 5, '2026-01-24 08:00:00'),
(25, 11, 'linh_dang', 'dangngoclinh99@gmail.com', 'Một số ví dụ hơi cũ nhưng tư duy cốt lõi vẫn hữu ích.', 4, '2026-01-24 09:15:00'),
(26, 12, 'tung_bui', 'buithanhtung.dev@gmail.com', 'Góc nhìn khác biệt về khởi nghiệp, nhiều ý tưởng phản trực giác hay.', 5, '2026-01-24 10:30:00'),
(26, 13, 'anh_hoang', 'hoangmaianh93@gmail.com', 'Phù hợp với người làm sản phẩm/công nghệ muốn tư duy đột phá.', 4, '2026-01-24 11:45:00'),
(27, 14, 'huy_do', 'doquanghuy2001@gmail.com', 'Truyền cảm hứng, đọc nhanh vì viết theo lối kể chuyện.', 4, '2026-01-24 13:00:00'),
(27, 15, 'oanh_ngo', 'ngokimoanh86@gmail.com', 'Nội dung dễ tiếp cận với người mới đi làm.', 4, '2026-01-24 14:15:00'),
(28, 16, 'phuc_trinh', 'trinhvanphuc97@gmail.com', 'Lập luận công phu, thích cách tác giả kết hợp nhiều lĩnh vực.', 5, '2026-01-24 15:30:00'),
(28, 17, 'vy_ly', 'lythaovy.books@gmail.com', 'Khá nặng thông tin nhưng logic chặt chẽ, đáng đọc.', 4, '2026-01-24 16:45:00'),
(29, 6, 'an_nguyen', 'nguyenvanan88@gmail.com', 'Phiêu lưu kinh điển, nhịp nhanh, đọc một mạch không dừng được.', 5, '2026-01-25 08:00:00'),
(29, 7, 'bich_tran', 'tranthibich90@gmail.com', 'Rất hợp đọc cho cả người lớn lẫn trẻ em.', 5, '2026-01-25 09:15:00'),
(30, 8, 'nam_le', 'lehoangnam1995@gmail.com', 'Trí tưởng tượng bay bổng, đọc cho con mà mình cũng thấy thích.', 5, '2026-01-25 10:30:00'),
(30, 9, 'ha_pham', 'phamthuha.reads@gmail.com', 'Vui nhộn, phù hợp đọc cùng trẻ nhỏ mỗi tối.', 5, '2026-01-25 11:45:00');

-- Khôi phục lại Safe Updates như mặc định sau khi script chạy xong.
SET SQL_SAFE_UPDATES = 1;
