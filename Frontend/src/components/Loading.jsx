import { Stethoscope } from 'lucide-react';

const Loading = ({ 
  message = "Chargement en cours...", 
  fullScreen = true 
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-paper/90 backdrop-blur-xs transition-all ${
        fullScreen ? 'fixed inset-0 z-50 min-h-screen' : 'w-full min-h-75 rounded-2xl'
      }`}
    >
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-20 h-20 rounded-full bg-teal/20 animate-ping opacity-75" />
        
        <div className="absolute w-24 h-24 rounded-full bg-teal/10 animate-pulse" />

        <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl border border-teal/15 text-teal transition-transform animate-bounce">
          <Stethoscope className="w-8 h-8 text-teal animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <span className="font-display font-medium text-ink text-sm tracking-wide animate-pulse">
          {message}
        </span>

        <div className="w-28 h-1 bg-gray/15 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-teal rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default Loading;