import { Consultation } from '@/types';
import { X, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  consultations: Consultation[];
  lang: 'sw' | 'en';
  t: any;
  onSelect: (c: Consultation) => void;
}

export function HistorySidebar({ isOpen, onClose, consultations, lang, t, onSelect }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t.history}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {consultations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t.noHistory}</p>
          ) : (
            consultations.map(c => (
              <button 
                key={c.id}
                onClick={() => { onSelect(c); onClose(); }}
                className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                    c.result.severity === 'low' ? 'bg-green-100 text-green-700' :
                    c.result.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {t[`severity${c.result.severity.charAt(0).toUpperCase() + c.result.severity.slice(1)}`]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                  {lang === 'sw' ? c.result.condition_sw : c.result.condition_en}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2">&quot;{c.transcript}&quot;</p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
