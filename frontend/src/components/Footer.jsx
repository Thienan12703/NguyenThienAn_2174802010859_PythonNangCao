import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-surface-dark text-gray-300 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-white italic tracking-wider">
                            SMASH<span className="text-primary">PRO</span>
                        </h3>
                        <p className="text-sm text-gray-400">
                            Cửa hàng cầu lông chuyên nghiệp. Nơi cung cấp dụng cụ thể thao đỉnh cao cho đam mê của bạn.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="font-bold hover:text-primary transition-colors">FB</a>
                            <a href="#" className="font-bold hover:text-primary transition-colors">IG</a>
                            <a href="#" className="font-bold hover:text-primary transition-colors">TW</a>
                        </div>

                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-wide">Sản phẩm</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/products?category=vot-cau-long" className="hover:text-primary transition-colors">Vợt Cầu Lông</a></li>
                            <li><a href="/products?category=giay-cau-long" className="hover:text-primary transition-colors">Giày Cầu Lông</a></li>
                            <li><a href="/products?category=ao-cau-long" className="hover:text-primary transition-colors">Áo Thể Thao</a></li>
                            <li><a href="/products?category=phu-kien" className="hover:text-primary transition-colors">Phụ Kiện</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-wide">Hỗ trợ</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-primary transition-colors">Chính sách bảo hành</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Chính sách đổi trả</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Giao hàng & Thanh toán</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Câu hỏi thường gặp</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-wide">Liên hệ</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start space-x-3">
                                <MapPin size={18} className="text-primary shrink-0" />
                                <span>123 Đường Cầu Lông, Quận Thể Thao, TP. HCM</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone size={18} className="text-primary shrink-0" />
                                <span>0123 456 789</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail size={18} className="text-primary shrink-0" />
                                <span>support@smashpro.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} SmashPro. All rights reserved.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
