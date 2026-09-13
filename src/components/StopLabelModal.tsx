import React, { useState, useEffect, useRef } from 'react';
import { Tag, X } from 'lucide-react';

interface StopLabelModalProps {
  isOpen: boolean;
  stopCode: string;
  isEditing: boolean;
  initialLabel?: string;
  onSave: (label: string) => void;
  onClose: () => void;
}

export const StopLabelModal: React.FC<StopLabelModalProps> = ({
  isOpen,
  stopCode,
  isEditing,
  initialLabel = '',
  onSave,
  onClose,
}) => {
  const [label, setLabel] = useState(initialLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLabel(initialLabel);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialLabel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(label.trim());
  };

  return (
    <div
      id="stop-label-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="stop-label-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stop-label-modal-title"
        className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xl max-w-sm w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="stop-label-modal-title"
                className="text-base font-bold text-slate-900 leading-tight"
              >
                {isEditing ? 'Edit Stop Label' : 'Name this Stop'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Bus Stop <span className="font-semibold text-slate-700">{stopCode}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-label-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          {isEditing
            ? 'Update the label for this stop, or leave it blank to show just the code.'
            : 'Enter a short label like "Home" or "Office" so it\'s easy to recognize, or leave it blank.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="stop-label-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Label (Optional)
            </label>
            <input
              ref={inputRef}
              id="stop-label-input"
              type="text"
              maxLength={24}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Home, Office"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row-reverse gap-2 pt-1">
            <button
              type="submit"
              id="save-label-btn"
              className="w-full sm:flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-xs text-center"
            >
              {isEditing ? 'Save' : label.trim() ? 'Save label' : 'Save'}
            </button>

            {!isEditing && (
              <button
                type="button"
                id="skip-label-btn"
                onClick={() => onSave('')}
                className="w-full sm:flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-medium text-sm rounded-xl transition-colors cursor-pointer text-center"
              >
                Leave blank
              </button>
            )}

            {isEditing && initialLabel && (
              <button
                type="button"
                id="clear-label-btn"
                onClick={() => onSave('')}
                className="w-full sm:flex-1 py-2.5 px-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 active:bg-rose-100 text-slate-700 font-medium text-sm rounded-xl transition-colors cursor-pointer text-center"
              >
                Clear label
              </button>
            )}

            <button
              type="button"
              id="cancel-label-btn"
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-3 text-slate-500 hover:text-slate-800 font-medium text-sm rounded-xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
