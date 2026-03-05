'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Wallet, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutPaymentProps {
  paymentMethods: any[];
  selectedPaymentMethodId: string;
  setSelectedPaymentMethodId: (id: string) => void;
  selectedPaymentMethod: any;
  bankDialogOpen: boolean;
  setBankDialogOpen: (open: boolean) => void;
}

export function CheckoutPayment({
  paymentMethods,
  selectedPaymentMethodId,
  setSelectedPaymentMethodId,
  selectedPaymentMethod,
  bankDialogOpen,
  setBankDialogOpen
}: CheckoutPaymentProps) {
  return (
    <Card className="border-l-4 border-[#C6A15B]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-[#C6A15B]" />
          <CardTitle className="text-xl">Mode de paiement</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedPaymentMethodId} onValueChange={setSelectedPaymentMethodId}>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className={cn("flex items-start space-x-3 border p-4 rounded-lg hover:border-[#D4AF37] transition-colors", selectedPaymentMethodId === method.id ? "border-[#C6A15B] bg-amber-50" : "border-gray-200")}>
                <RadioGroupItem value={method.id} id={`payment-${method.id}`} className="mt-1" />
                <label htmlFor={`payment-${method.id}`} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{method.icon}</span>
                    <span className="font-semibold text-gray-900">{method.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {method.description}
                  </div>
                  {(method.processing_fee_percentage > 0 || method.processing_fee_fixed > 0) && (
                    <div className="text-xs text-gray-500 mt-1">
                      Frais: {method.processing_fee_percentage > 0 && `${method.processing_fee_percentage}%`}
                      {method.processing_fee_percentage > 0 && method.processing_fee_fixed > 0 && ' + '}
                      {method.processing_fee_fixed > 0 && `${method.processing_fee_fixed.toFixed(2)} €`}
                    </div>
                  )}
                </label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {selectedPaymentMethod?.code === 'bank_transfer' && (
          <div className="mt-4">
            <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full">
                  <Wallet className="h-4 w-4 mr-2" />
                  Voir les coordonnées bancaires
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Coordonnées bancaires pour virement</DialogTitle>
                  <DialogDescription>
                    Utilisez ces informations pour effectuer votre virement bancaire
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                    <div>
                      <p className="text-xs font-medium text-blue-800 uppercase">Compte Courant</p>
                      <p className="text-blue-900 font-semibold">31822952121 - SAS A U MORGANE DEWANIN</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-blue-800 uppercase">IBAN</p>
                      <p className="text-blue-900 font-mono text-sm break-all">FR76 1350 7000 4331 8229 5212 127</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-800 uppercase">BIC</p>
                      <p className="text-blue-900 font-mono text-sm">CCBPFRPPLIL</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs font-medium text-blue-800 uppercase">Code banque</p>
                        <p className="text-blue-900 font-mono text-sm">13507</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-800 uppercase">Code guichet</p>
                        <p className="text-blue-900 font-mono text-sm">00043</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs font-medium text-blue-800 uppercase">N° du compte</p>
                        <p className="text-blue-900 font-mono text-sm">31822952121</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-800 uppercase">Clé RIB</p>
                        <p className="text-blue-900 font-mono text-sm">27</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-blue-800 uppercase">Banque</p>
                      <p className="text-blue-900 font-semibold">BANQUE POPULAIRE DU NORD</p>
                      <p className="text-blue-700 text-xs mt-1">Agence: AG CENTRALE</p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Pensez à indiquer votre <strong>numéro de commande</strong> comme référence du virement pour un traitement rapide</span>
                    </p>
                  </div>

                  <Button
                    type="button"
                    className="w-full bg-[#b8933d] hover:bg-[#a07c2f] text-white"
                    onClick={() => setBankDialogOpen(false)}
                  >
                    J&apos;ai noté les informations
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <Info className="h-4 w-4 inline mr-1" />
                Votre commande sera validée après réception du virement
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}