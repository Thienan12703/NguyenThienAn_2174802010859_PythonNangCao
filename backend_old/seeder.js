const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Post = require('./models/Post');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Post.deleteMany({});

    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({ name: 'Admin', email: 'admin@badminton.com', password: adminPassword, role: 'admin' });

    const categoryVot = await Category.create({ name: 'Vợt Cầu Lông', slug: 'vot-cau-long', description: 'Vợt cầu lông chất lượng cao' });
    const categoryGiay = await Category.create({ name: 'Giày Cầu Lông', slug: 'giay-cau-long', description: 'Giày cầu lông chính hãng' });
    const categoryAo = await Category.create({ name: 'Áo Cầu Lông', slug: 'ao-cau-long', description: 'Áo thể thao thoáng mát' });
    const categoryPhuKien = await Category.create({ name: 'Phụ Kiện', slug: 'phu-kien', description: 'Quấn cán, balo, túi xách' });
    const categoryBag = await Category.create({ name: 'Túi Vợt / Balo', slug: 'tui-vot-balo', description: 'Balo và túi vợt' });

    // Products
    await Product.create([
      {
        name: 'Vợt Yonex Astrox 99 Pro',
        price: 3500000,
        image: 'https://images.unsplash.com/photo-1622279457486-640c4cb71653?w=800&q=80',
        brand: 'Yonex',
        category: categoryVot._id,
        description: 'Vợt tấn công uy lực dành cho người chơi chuyên nghiệp, phiên bản Pro mang lại sức mạnh vượt trội.',
        stock: 15,
        isFeatured: true,
      },
      {
        name: 'Vợt Lining Aeronaut 9000C',
        price: 3200000,
        image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
        brand: 'Lining',
        category: categoryVot._id,
        description: 'Sự kết hợp hoàn hảo giữa tấn công và phòng thủ, công nghệ Aeronaut giảm sức cản không khí.',
        stock: 10,
        isFeatured: true,
      },
      {
        name: 'Giày Victor SH-A920',
        price: 1800000,
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
        brand: 'Victor',
        category: categoryGiay._id,
        description: 'Giày êm, bám sân tốt cho mọi vận động, công nghệ đế ngoài siêu bền.',
        stock: 20,
        isFeatured: true,
      },
      {
        name: 'Giày Yonex Eclipsion Z3',
        price: 2400000,
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
        brand: 'Yonex',
        category: categoryGiay._id,
        description: 'Độ ổn định tối đa, công nghệ Power Cushion+ mang lại sự êm ái chưa từng có.',
        stock: 12,
        isFeatured: false,
      },
      {
        name: 'Áo Yonex Lee Chong Wei',
        price: 550000,
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
        brand: 'Yonex',
        category: categoryAo._id,
        description: 'Áo thi đấu chuyên nghiệp, thấm hút mồ hôi cực tốt, thiết kế độc quyền.',
        stock: 50,
        isFeatured: true,
      },
      {
        name: 'Áo Lining Đội Tuyển TQ',
        price: 600000,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
        brand: 'Lining',
        category: categoryAo._id,
        description: 'Chất liệu vải cao cấp, co giãn 4 chiều, thiết kế nổi bật trên sân.',
        stock: 45,
        isFeatured: false,
      },
      {
        name: 'Balo Yonex BA92012',
        price: 1200000,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
        brand: 'Yonex',
        category: categoryPhuKien._id,
        description: 'Balo chuyên dụng, ngăn chứa vợt và giày riêng biệt, chống nước tốt.',
        stock: 8,
        isFeatured: true,
      },
      {
        name: 'Quấn cán Yonex AC102',
        price: 45000,
        image: 'https://plus.unsplash.com/premium_photo-1663100659639-651c5187e59c?w=800&q=80',
        brand: 'Yonex',
        category: categoryPhuKien._id,
        description: 'Quấn cán phổ biến nhất thế giới, bám tay, thấm mồ hôi hiệu quả.',
        stock: 100,
        isFeatured: false,
      },
      {
        name: 'Balo Lining Sport',
        price: 1300000,
        image: 'https://images.unsplash.com/photo-1517263904808-5dc0ba5f1a5c?w=800&q=80',
        brand: 'Lining',
        category: categoryBag._id,
        description: 'Balo chịu lực cao, ngăn riêng vợt và giày, thiết kế thời trang.',
        stock: 12,
        isFeatured: true,
      },
    ]);

    // Blog posts
    await Post.create([
      {
        title: 'Cách chọn vợt cầu lông phù hợp cho người mới bắt đầu',
        slug: 'cach-chon-vot-cau-long',
        content: '<p>Hướng dẫn chi tiết về việc lựa chọn vợt dựa trên cân nặng, tốc độ swing và ngân sách.</p>',
        thumbnail: 'https://images.unsplash.com/photo-1509475826633-fed577a2c71b?w=800&q=80',
        author: admin._id,
      },
      {
        title: 'Top 5 mẫu giày cầu lông hot nhất mùa 2024',
        slug: 'top-5-mau-giay-cau-long-2024',
        content: '<p>Danh sách các mẫu giày được các vận động viên chuyên nghiệp ưa chuộng.</p>',
        thumbnail: 'https://images.unsplash.com/photo-1581291519185-ef11498d1cf9?w=800&q=80',
        author: admin._id,
      },
    ]);

    console.log('Seeding completed. Admin user created with email admin@badminton.com and password admin123');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Post = require('./models/Post');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Post.deleteMany({});

    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({ name: 'Admin', email: 'admin@badminton.com', password: adminPassword, role: 'admin' });

    const categoryVot = await Category.create({ name: 'Vợt Cầu Lông', slug: 'vot-cau-long', description: 'Vợt cầu lông chất lượng cao' });
    const categoryGiay = await Category.create({ name: 'Giày Cầu Lông', slug: 'giay-cau-long', description: 'Giày cầu lông chính hãng' });
    const categoryAo = await Category.create({ name: 'Áo Cầu Lông', slug: 'ao-cau-long', description: 'Áo thể thao thoáng mát' });
    const categoryPhuKien = await Category.create({ name: 'Phụ Kiện', slug: 'phu-kien', description: 'Quấn cán, balo, túi xách' });
    const categoryBag = await Category.create({ name: 'Túi Vợt / Balo', slug: 'tui-vot-balo', description: 'Balo và túi vợt' });

    // Products
    await Product.create([
      {
        name: 'Vợt Yonex Astrox 99 Pro',
        price: 3500000,
        image: 'https://images.unsplash.com/photo-1622279457486-640c4cb71653?w=800&q=80',
        brand: 'Yonex',
        category: categoryVot._id,
        description: 'Vợt tấn công uy lực dành cho người chơi chuyên nghiệp, phiên bản Pro mang lại sức mạnh vượt trội.',
        stock: 15,
        isFeatured: true,
      },
      {
        name: 'Vợt Lining Aeronaut 9000C',
        price: 3200000,
        image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
        brand: 'Lining',
        category: categoryVot._id,
        description: 'Sự kết hợp hoàn hảo giữa tấn công và phòng thủ, công nghệ Aeronaut giảm sức cản không khí.',
        stock: 10,
        isFeatured: true,
      },
      {
        name: 'Giày Victor SH-A920',
        price: 1800000,
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
        brand: 'Victor',
        category: categoryGiay._id,
        description: 'Giày êm, bám sân tốt cho mọi vận động, công nghệ đế ngoài siêu bền.',
        stock: 20,
        isFeatured: true,
      },
      {
        name: 'Giày Yonex Eclipsion Z3',
        price: 2400000,
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
        brand: 'Yonex',
        category: categoryGiay._id,
        description: 'Độ ổn định tối đa, công nghệ Power Cushion+ mang lại sự êm ái chưa từng có.',
        stock: 12,
        isFeatured: false,
      },
      {
        name: 'Áo Yonex Lee Chong Wei',
        price: 550000,
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
        brand: 'Yonex',
        category: categoryAo._id,
        description: 'Áo thi đấu chuyên nghiệp, thấm hút mồ hôi cực tốt, thiết kế độc quyền.',
        stock: 50,
        isFeatured: true,
      },
      {
        name: 'Áo Lining Đội Tuyển TQ',
        price: 600000,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
        brand: 'Lining',
        category: categoryAo._id,
        description: 'Chất liệu vải cao cấp, co giãn 4 chiều, thiết kế nổi bật trên sân.',
        stock: 45,
        isFeatured: false,
      },
      {
        name: 'Balo Yonex BA92012',
        price: 1200000,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
        brand: 'Yonex',
        category: categoryPhuKien._id,
        description: 'Balo chuyên dụng, ngăn chứa vợt và giày riêng biệt, chống nước tốt.',
        stock: 8,
        isFeatured: true,
      },
      {
        name: 'Quấn cán Yonex AC102',
        price: 45000,
        image: 'https://plus.unsplash.com/premium_photo-1663100659639-651c5187e59c?w=800&q=80',
        brand: 'Yonex',
        category: categoryPhuKien._id,
        description: 'Quấn cán phổ biến nhất thế giới, bám tay, thấm mồ hôi hiệu quả.',
        stock: 100,
        isFeatured: false,
      },
      {
        name: 'Balo Lining Sport',
        price: 1300000,
        image: 'https://images.unsplash.com/photo-1517263904808-5dc0ba5f1a5c?w=800&q=80',
        brand: 'Lining',
        category: categoryBag._id,
        description: 'Balo chịu lực cao, ngăn riêng vợt và giày, thiết kế thời trang.',
        stock: 12,
        isFeatured: true,
      },
    ]);

    // Blog posts
    await Post.create([
      {
        title: 'Cách chọn vợt cầu lông phù hợp cho người mới bắt đầu',
        slug: 'cach-chon-vot-cau-long',
        content: '<p>Hướng dẫn chi tiết về việc lựa chọn vợt dựa trên cân nặng, tốc độ swing và ngân sách.</p>',
        thumbnail: 'https://images.unsplash.com/photo-1509475826633-fed577a2c71b?w=800&q=80',
        author: admin._id,
      },
      {
        title: 'Top 5 mẫu giày cầu lông hot nhất mùa 2024',
        slug: 'top-5-mau-giay-cau-long-2024',
        content: '<p>Danh sách các mẫu giày được các vận động viên chuyên nghiệp ưa chuộng.</p>',
        thumbnail: 'https://images.unsplash.com/photo-1581291519185-ef11498d1cf9?w=800&q=80',
        author: admin._id,
      },
    ]);

    console.log('Seeding completed. Admin user created with email admin@badminton.com and password admin123');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();

const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Post = require('./models/Post');

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Post.deleteMany({});

        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({ name: 'Admin', email: 'admin@badminton.com', password: adminPassword, role: 'admin' });

        const categoryVot = await Category.create({ name: 'Vợt Cầu Lông', slug: 'vot-cau-long', description: 'Vợt cầu lông chất lượng cao' });
        const categoryGiay = await Category.create({ name: 'Giày Cầu Lông', slug: 'giay-cau-long', description: 'Giày cầu lông chính hãng' });
        const categoryAo = await Category.create({ name: 'Áo Cầu Lông', slug: 'ao-cau-long', description: 'Áo thể thao thoáng mát' });
        const categoryPhuKien = await Category.create({ name: 'Phụ Kiện', slug: 'phu-kien', description: 'Quấn cán, balo, túi xách' });
        const categoryBag = await Category.create({ name: 'Túi Vợt / Balo', slug: 'tui-vot-balo', description: 'Balo và túi vợt' });

        // Vợt
        await Product.create([
            {
                name: 'Vợt Yonex Astrox 99 Pro',
                price: 3500000,
                image: 'https://images.unsplash.com/photo-1622279457486-640c4cb71653?w=800&q=80',
                brand: 'Yonex',
                category: categoryVot._id,
                description: 'Vợt tấn công uy lực dành cho người chơi chuyên nghiệp, phiên bản Pro mang lại sức mạnh vượt trội.',
                stock: 15,
                isFeatured: true,
            },
            {
                name: 'Vợt Lining Aeronaut 9000C',
                price: 3200000,
                image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
                brand: 'Lining',
                category: categoryVot._id,
                description: 'Sự kết hợp hoàn hảo giữa tấn công và phòng thủ, công nghệ Aeronaut giảm sức cản không khí.',
                stock: 10,
                isFeatured: true,
            },
            // Giày
            {
                name: 'Giày Victor SH-A920',
                price: 1800000,
                image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
                brand: 'Victor',
                category: categoryGiay._id,
                description: 'Giày êm, bám sân tốt cho mọi vận động, công nghệ đế ngoài siêu bền.',
                stock: 20,
                isFeatured: true,
            },
            {
                name: 'Giày Yonex Eclipsion Z3',
                price: 2400000,
                image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
                brand: 'Yonex',
                category: categoryGiay._id,
                description: 'Độ ổn định tối đa, công nghệ Power Cushion+ mang lại sự êm ái chưa từng có.',
                stock: 12,
                isFeatured: false,
            },
            // Áo
            {
                name: 'Áo Yonex Lee Chong Wei',
                price: 550000,
                image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
                brand: 'Yonex',
                category: categoryAo._id,
                description: 'Áo thi đấu chuyên nghiệp, thấm hút mồ hôi cực tốt, thiết kế độc quyền.',
                stock: 50,
                isFeatured: true,
            },
            {
                name: 'Áo Lining Đội Tuyển TQ',
                price: 600000,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
                brand: 'Lining',
                category: categoryAo._id,
                description: 'Chất liệu vải cao cấp, co giãn 4 chiều, thiết kế nổi bật trên sân.',
                stock: 45,
                isFeatured: false,
            },
            // Phụ kiện
            {
                name: 'Balo Yonex BA92012',
                price: 1200000,
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
                brand: 'Yonex',
                category: categoryPhuKien._id,
                description: 'Balo chuyên dụng, ngăn chứa vợt và giày riêng biệt, chống nước tốt.',
                stock: 8,
                isFeatured: true,
            },
            {
                name: 'Quấn cán Yonex AC102',
                price: 45000,
                image: 'https://plus.unsplash.com/premium_photo-1663100659639-651c5187e59c?w=800&q=80',
                brand: 'Yonex',
                category: categoryPhuKien._id,
                description: 'Quấn cán phổ biến nhất thế giới, bám tay, thấm mồ hôi hiệu quả.',
                stock: 100,
                isFeatured: false,
            },
            // Túi Vợt / Balo
            {
                name: 'Balo Lining Sport',
                price: 1300000,
                image: 'https://images.unsplash.com/photo-1517263904808-5dc0ba5f1a5c?w=800&q=80',
                brand: 'Lining',
                category: categoryBag._id,
                description: 'Balo chịu lực cao, ngăn riêng vợt và giày, thiết kế thời trang.',
                stock: 12,
                isFeatured: true,
            },
        ]);

        // Sample blog posts
        await Post.create([
            {
                title: 'Cách chọn vợt cầu lông phù hợp cho người mới bắt đầu',
                slug: 'cach-chon-vot-cau-long',
                content: '<p>Hướng dẫn chi tiết về việc lựa chọn vợt dựa trên cân nặng, tốc độ swing và ngân sách.</p>',
                thumbnail: 'https://images.unsplash.com/photo-1509475826633-fed577a2c71b?w=800&q=80',
                author: admin._id,
            },
            {
                title: 'Top 5 mẫu giày cầu lông hot nhất mùa 2024',
                slug: 'top-5-mau-giay-cau-long-2024',
                content: '<p>Danh sách các mẫu giày được các vận động viên chuyên nghiệp ưa chuộng.</p>',
                thumbnail: 'https://images.unsplash.com/photo-1581291519185-ef11498d1cf9?w=800&q=80',
                author: admin._id,
            },
        ]);

        console.log('Seeding completed. Admin user created with email admin@badminton.com and password admin123');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();

const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});

        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({ name: 'Admin', email: 'admin@badminton.com', password: adminPassword, role: 'admin' });

        const categoryVot = await Category.create({ name: 'Vợt Cầu Lông', slug: 'vot-cau-long', description: 'Vợt cầu lông chất lượng cao' });
        const categoryGiay = await Category.create({ name: 'Giày Cầu Lông', slug: 'giay-cau-long', description: 'Giày cầu lông chính hãng' });
        const categoryAo = await Category.create({ name: 'Áo Cầu Lông', slug: 'ao-cau-long', description: 'Áo thể thao thoáng mát' });
        const categoryPhuKien = await Category.create({ name: 'Phụ Kiện', slug: 'phu-kien', description: 'Quấn cán, balo, túi xách' });

        // Vợt
        await Product.create([
            {
                name: 'Vợt Yonex Astrox 99 Pro',
                price: 3500000,
                image: 'https://images.unsplash.com/photo-1622279457486-640c4cb71653?w=800&q=80',
                brand: 'Yonex',
                category: categoryVot._id,
                description: 'Vợt tấn công uy lực dành cho người chơi chuyên nghiệp, phiên bản Pro mang lại sức mạnh vượt trội.',
                stock: 15,
                isFeatured: true,
            },
            {
                name: 'Vợt Lining Aeronaut 9000C',
                price: 3200000,
                image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
                brand: 'Lining',
                category: categoryVot._id,
                description: 'Sự kết hợp hoàn hảo giữa tấn công và phòng thủ, công nghệ Aeronaut giảm sức cản không khí.',
                stock: 10,
                isFeatured: true,
            },
            // Giày
            {
                name: 'Giày Victor SH-A920',
                price: 1800000,
                image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
                brand: 'Victor',
                category: categoryGiay._id,
                description: 'Giày êm, bám sân tốt cho mọi vận động, công nghệ đế ngoài siêu bền.',
                stock: 20,
                isFeatured: true,
            },
            {
                name: 'Giày Yonex Eclipsion Z3',
                price: 2400000,
                image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
                brand: 'Yonex',
                category: categoryGiay._id,
                description: 'Độ ổn định tối đa, công nghệ Power Cushion+ mang lại sự êm ái chưa từng có.',
                stock: 12,
                isFeatured: false,
            },
            // Áo
            {
                name: 'Áo Yonex Lee Chong Wei',
                price: 550000,
                image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
                brand: 'Yonex',
                category: categoryAo._id,
                description: 'Áo thi đấu chuyên nghiệp, thấm hút mồ hôi cực tốt, thiết kế độc quyền.',
                stock: 50,
                isFeatured: true,
            },
            {
                name: 'Áo Lining Đội Tuyển TQ',
                price: 600000,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
                brand: 'Lining',
                category: categoryAo._id,
                description: 'Chất liệu vải cao cấp, co giãn 4 chiều, thiết kế nổi bật trên sân.',
                stock: 45,
                isFeatured: false,
            },
            // Phụ kiện
            {
                name: 'Balo Yonex BA92012',
                price: 1200000,
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
                brand: 'Yonex',
                category: categoryPhuKien._id,
                description: 'Balo chuyên dụng, ngăn chứa vợt và giày riêng biệt, chống nước tốt.',
                stock: 8,
                isFeatured: true,
            },
            {
                name: 'Quấn cán Yonex AC102',
                price: 45000,
                image: 'https://plus.unsplash.com/premium_photo-1663100659639-651c5187e59c?w=800&q=80',
                brand: 'Yonex',
                category: categoryPhuKien._id,
                description: 'Quấn cán phổ biến nhất thế giới, bám tay, thấm mồ hôi hiệu quả.',
                stock: 100,
                isFeatured: false,
            }
        ]);

        console.log('Seeding completed. Admin user created with email admin@badminton.com and password admin123');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
