
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'confirm' | 'alert';
  onConfirm: () => void;
  onCancel: () => void;
  darkMode: boolean;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  type,
  onConfirm,
  onCancel,
  darkMode,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={type === 'confirm' ? onCancel : onConfirm}
      />
      
      {/* Modal Card */}
      <div className={`relative w-full max-w-sm rounded-[32px] shadow-2xl border p-8 overflow-hidden transform animate-scale-up transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-100 text-slate-900'
      }`}>
        <div className="text-center">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl ${
            isDestructive 
              ? (darkMode ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-50 text-rose-600')
              : (darkMode ? 'bg-blue-500/10 text-blue-500' : 'bg-blue-50 text-blue-600')
          }`}>
            <i className={`fas ${isDestructive ? 'fa-exclamation-triangle' : 'fa-info-circle'}`}></i>
          </div>
          
          <h3 className="text-xl font-black mb-2 tracking-tight">{title}</h3>
          <p className={`text-sm font-medium mb-8 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {message}
          </p>
          
          <div className={`flex gap-3 ${type === 'alert' ? 'justify-center' : 'justify-stretch'}`}>
            {type === 'confirm' && (
              <button 
                onClick={onCancel}
                className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                  darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {cancelText}
              </button>
            )}
            <button 
              onClick={onConfirm}
              className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 text-white shadow-lg ${
                isDestructive 
                  ? 'bg-rose-600 shadow-rose-900/20 hover:bg-rose-500' 
                  : 'bg-blue-600 shadow-blue-900/20 hover:bg-blue-500'
              }`}
            >
              {type === 'alert' ? 'UNDERSTOOD' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
