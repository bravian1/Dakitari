import { TriageResult } from '@/types';
import { AlertTriangle, Activity, CheckCircle2, Volume2, VolumeX, Plus, Loader2 } from 'lucide-react';

interface Props {
  result: TriageResult;
  lang: 'sw' | 'en';
  t: any;
  isSpeaking: boolean;
  isLoadingAudio?: boolean;
  onToggleAudio: () => void;
  onNewPatient?: () => void;
}

export function TriageCard({ result, lang, t, isSpeaking, isLoadingAudio, onToggleAudio, onNewPatient }: Props) {
  const severityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
  };

  const severityIcons = {
    low: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    medium: <Activity className="w-5 h-5 text-yellow-600" />,
    critical: <AlertTriangle className="w-5 h-5 text-red-600" />,
  };

  const condition = lang === 'sw' ? result.condition_sw : result.condition_en;
  const symptoms = lang === 'sw' ? result.symptoms_sw : result.symptoms_en;
  const actions = lang === 'sw' ? result.actions_sw : result.actions_en;
  const summary = lang === 'sw' ? result.summary_sw : result.summary_en;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col w-full max-w-2xl mx-auto">
      <div className={`p-4 border-b flex items-center justify-between ${severityColors[result.severity]}`}>
        <div className="flex items-center gap-2">
          {severityIcons[result.severity]}
          <span className="font-bold uppercase tracking-wider text-sm">
            {t[`severity${result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}`]}
          </span>
        </div>
        <h2 className="font-bold text-lg text-right">{condition}</h2>
      </div>
      
      <div className="p-6 space-y-6 flex-grow overflow-y-auto">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.symptoms}</h3>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((sym, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {sym}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.actions}</h3>
          <ol className="space-y-3">
            {actions.map((action, i) => (
              <li key={i} className="flex gap-3 text-gray-800">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl text-blue-900 text-sm leading-relaxed italic">
          &quot;{summary}&quot;
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-t flex gap-3 justify-end flex-wrap">
        <button 
          onClick={onToggleAudio}
          disabled={isLoadingAudio}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-70"
        >
          {isLoadingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          {isLoadingAudio ? t.loadingAudio : isSpeaking ? t.stopAudio : t.listenAgain}
        </button>
        {onNewPatient && (
          <button 
            onClick={onNewPatient}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            {t.newPatient}
          </button>
        )}
      </div>
    </div>
  );
}
