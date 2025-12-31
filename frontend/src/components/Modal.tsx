import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode; // Tùy chọn: Để chứa các nút bấm (Lưu, Hủy)
  maxWidth?: string; // Tùy chọn: Độ rộng modal (mặc định max-w-md)
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  maxWidth = "max-w-md"
}) => {
  // Logic: Khóa cuộn trang khi Modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Overlay (Nền tối)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all"
      onClick={onClose} // Click ra ngoài thì đóng
    >
      {/* Modal Content */}
      <div 
        className={`bg-white rounded-3xl w-full ${maxWidth} shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click lan ra overlay
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (Có thể cuộn nếu nội dung dài) */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

        {/* Footer (Nếu có) */}
        {footer && (
          <div className="p-6 pt-0 mt-auto">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;