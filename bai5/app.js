/* =====================================================================
   app.js – Giỏ hàng động với Vue.js 3 (CDN)

   GHI CHÚ SO SÁNH (Vue vs Vanilla JS):
   Nếu dùng Vanilla JS, mỗi lần thêm/xoá giỏ hàng phải tự querySelector
   + cập nhật DOM thủ công (đổi số ở header, vẽ lại danh sách, tính lại
   tổng tiền...). Vue tự động làm điều này nhờ reactivity: ta chỉ sửa dữ
   liệu (cart), giao diện tự thay đổi theo.
   ===================================================================== */

Vue.createApp({

  // ---------------------------------------------------------------
  // DATA: toàn bộ trạng thái của ứng dụng. Giao diện chỉ là "hình
  // chiếu" của những dữ liệu này (UI = function(data)).
  // ---------------------------------------------------------------
  data() {
    return {
      // Danh sách sản phẩm (9 món, yêu cầu tối thiểu là 8)
      products: [
        { id: 1, ten: 'Ốp lưng Electric Blue',   gia: 250000, anh: 'images/op-electric-blue.svg',      nhan: 'Mới',        moTa: 'Nhựa dẻo TPU, viền nổi bảo vệ camera, màu xanh điện nổi bật.' },
        { id: 2, ten: 'Ốp lưng trong suốt',      gia: 180000, anh: 'images/op-trong-suot.svg',         nhan: '',           moTa: 'Trong như pha lê, không ố vàng, khoe trọn màu máy.' },
        { id: 3, ten: 'Sạc không dây 15W',       gia: 350000, anh: 'images/sac-khong-day.svg',         nhan: 'Bán chạy',   moTa: 'Đặt máy là sạc, đèn báo dịu mắt, chống trượt.' },
        { id: 4, ten: 'Tai nghe TWS Active',     gia: 590000, anh: 'images/tai-nghe-tws.svg',          nhan: 'Bán chạy',   moTa: 'Bluetooth 5.3, pin 24 giờ cùng hộp sạc, đàm thoại rõ.' },
        { id: 5, ten: 'Ốp lưng đen nhám',        gia: 220000, anh: 'images/op-den-nham.svg',           nhan: '',           moTa: 'Bề mặt nhám chống vân tay, cầm chắc tay, gọn mỏng.' },
        { id: 6, ten: 'Cáp sạc Type-C bện dù',   gia: 120000, anh: 'images/cap-type-c.svg',            nhan: '',           moTa: 'Dài 1,5 m, sợi bện chống đứt, hỗ trợ sạc nhanh 60W.' },
        { id: 7, ten: 'Pin dự phòng 10.000 mAh', gia: 420000, anh: 'images/pin-du-phong.svg',          nhan: '-15%',       moTa: 'Nhỏ như chiếc ví, 2 cổng ra, sạc đầy điện thoại 2 lần.' },
        { id: 8, ten: 'Củ sạc nhanh 20W',        gia: 190000, anh: 'images/cu-sac-nhanh-20w.svg',      nhan: '',           moTa: 'Cổng USB-C, tự ngắt khi đầy pin, an toàn nhiệt.' },
        { id: 9, ten: 'Giá đỡ điện thoại xoay',  gia: 150000, anh: 'images/gia-do-xoay.svg',           nhan: 'Mới',        moTa: 'Xoay 360°, gập gọn bỏ túi, hợp xem phim và gọi video.' },
      ],

      cart: [],            // Giỏ hàng: mảng các sản phẩm đã thêm
      tuKhoa: '',          // Từ khoá tìm kiếm, liên kết 2 chiều với ô input (v-model)
      menuMo: false,       // Trạng thái menu trên di động
      thongBao: '',        // Nội dung thông báo nhỏ (rỗng = ẩn)
      timerThongBao: null, // Bộ đếm giờ để tự ẩn thông báo
      demDong: 0,          // Bộ đếm tạo mã riêng cho từng dòng trong giỏ
    };
  },

  // ---------------------------------------------------------------
  // COMPUTED: giá trị TÍNH TOÁN từ data. Vue tự tính lại khi dữ liệu
  // nguồn thay đổi và lưu cache nếu chưa có gì đổi.
  // ---------------------------------------------------------------
  computed: {
    // Số lượng sản phẩm trong giỏ, hiển thị ở header: {{ cartCount }}
    cartCount() {
      return this.cart.length;
    },

    // Tổng tiền = cộng giá của mọi sản phẩm trong giỏ.
    // Thêm/xoá sản phẩm -> cart đổi -> tongTien tự cập nhật.
    tongTien() {
      return this.cart.reduce((tong, sp) => tong + sp.gia, 0);
    },

    // Danh sách sản phẩm sau khi lọc theo tuKhoa.
    // Không "ẩn/hiện" từng phần tử bằng tay: ta tạo danh sách mới từ data,
    // v-for render lại theo danh sách này (UI = function(data)).
    // Không phân biệt hoa thường và có thể gõ không dấu (vd: "op lung").
    danhSachLoc() {
      const tuKhoa = this.boDau(this.tuKhoa.trim().toLowerCase());
      if (tuKhoa === '') return this.products;
      return this.products.filter(sp =>
        this.boDau(sp.ten.toLowerCase()).includes(tuKhoa)
      );
    },

    // Năm hiện tại cho dòng bản quyền ở footer
    namHienTai() {
      return new Date().getFullYear();
    },
  },

  // ---------------------------------------------------------------
  // METHODS: các hành động do người dùng kích hoạt (@click...).
  // ---------------------------------------------------------------
  methods: {
    // Thêm sản phẩm vào giỏ: chỉ cần push vào mảng cart.
    // Không cần chạm vào DOM: số lượng ở header, danh sách và tổng tiền
    // ở aside tự cập nhật nhờ reactivity.
    // Dùng {...sanPham} để tạo bản sao, cộng thêm maDong để mỗi dòng
    // trong giỏ có khoá riêng (một món có thể được thêm nhiều lần).
    themVaoGio(sanPham) {
      this.demDong++;
      this.cart.push({ ...sanPham, maDong: this.demDong });
      this.hienThongBao('Đã thêm “' + sanPham.ten + '” vào giỏ');
    },

    // Xoá sản phẩm tại vị trí index khỏi giỏ bằng splice.
    // Giao diện tự vẽ lại danh sách, cập nhật số lượng và tổng tiền.
    xoaKhoiGio(index) {
      const daXoa = this.cart[index];
      this.cart.splice(index, 1);
      this.hienThongBao('Đã xoá “' + daXoa.ten + '” khỏi giỏ');
    },

    // Làm rỗng giỏ hàng: gán lại mảng rỗng
    xoaTatCa() {
      this.cart = [];
      this.hienThongBao('Đã xoá toàn bộ giỏ hàng');
    },

    // Thanh toán (mô phỏng): thông báo tổng tiền rồi làm rỗng giỏ
    thanhToan() {
      const tong = this.dinhDangTien(this.tongTien);
      this.cart = [];
      this.hienThongBao('Đặt hàng thành công! Tổng thanh toán ' + tong);
    },

    // Định dạng số thành tiền Việt: 250000 -> "250.000đ"
    dinhDangTien(so) {
      return so.toLocaleString('vi-VN') + 'đ';
    },

    // Bỏ dấu tiếng Việt để tìm kiếm linh hoạt: "Ốp lưng" -> "op lung"
    boDau(chuoi) {
      return chuoi.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    },

    // Hiện thông báo nhỏ rồi tự ẩn sau 2,2 giây
    hienThongBao(noiDung) {
      this.thongBao = noiDung;
      clearTimeout(this.timerThongBao);
      this.timerThongBao = setTimeout(() => { this.thongBao = ''; }, 2200);
    },
  },

}).mount('#app');