import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Package } from "lucide-react";

interface PackageGaugeProps {
  currentWeightGrams: number;
}

export function PackageGauge({ currentWeightGrams }: PackageGaugeProps) {
  const MAX_WEIGHT_GRAMS = 20000; // 20kg
  const percentage = Math.min((currentWeightGrams / MAX_WEIGHT_GRAMS) * 100, 100);
  const currentKg = (currentWeightGrams / 1000).toFixed(1);
  
  const isFull = currentWeightGrams >= MAX_WEIGHT_GRAMS;

  return (
    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 space-y-3 shadow-sm">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <Package className={`h-5 w-5 ${isFull ? 'text-red-500' : 'text-[#b8933d]'}`} />
          <span className="font-bold text-sm">Remplissage du carton</span>
        </div>
        <span className={`text-xs font-bold ${isFull ? 'text-red-600' : 'text-gray-500'}`}>
          {currentKg}kg / 20kg
        </span>
      </div>

      {/* Jauge Style Batterie */}
      <div className="relative h-6 w-full bg-gray-100 rounded-md overflow-hidden border">
        <div 
          className={`h-full transition-all duration-500 ${
            percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-orange-400' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference">
          {percentage.toFixed(0)}%
        </div>
      </div>

      {isFull ? (
        <div className="flex items-start gap-2 text-red-600 bg-red-50 p-2 rounded text-xs font-semibold">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>Votre carton est plein ! Il faut l&apos;envoyer maintenant pour en ouvrir un autre.</p>
        </div>
      ) : (
        <p className="text-[10px] text-gray-400 text-center italic">
          Estimation basée sur le poids virtuel de vos pépites.
        </p>
      )}
    </div>
  );
}