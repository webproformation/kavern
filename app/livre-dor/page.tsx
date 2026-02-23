'use client'

import { useState } from 'react'
import { useGuestbook, useAmbassador, useHearts, canUserReview, submitGuestbookEntry } from '@/hooks/use-guestbook'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Gem, Heart, Loader2, Crown, Upload, CheckCircle2, BookHeart, Sparkles, Coins, Camera, MessageSquare, Info } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import PageHeader from '@/components/PageHeader'
import Link from 'next/link'

export default function LivreDorPage() {
  const { entries, loading, refetch } = useGuestbook(50, 'approved')
  const { currentAmbassador, loading: ambassadorLoading } = useAmbassador()
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    order_number: '',
    rating: 5,
    message: '',
    customer_name: '',
    customer_photo_url: '',
    gdpr_consent: false
  })

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const { url } = await response.json()
      setFormData(prev => ({ ...prev, customer_photo_url: url }))
      toast.success('Photo uploadée avec succès')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Erreur lors de l\'upload de la photo')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Vous devez être connecté(e) pour signer le Livre d\'Or')
      return
    }

    if (!formData.gdpr_consent) {
      toast.error('Veuillez accepter les conditions de publication')
      return
    }

    setSubmitting(true)
    try {
      const canReview = await canUserReview(user.id, formData.order_number)
      if (!canReview) {
        toast.error('Vous avez déjà signé le Livre d\'Or pour cette commande')
        return
      }

      await submitGuestbookEntry({
        order_number: formData.order_number,
        rating: formData.rating,
        message: formData.message,
        customer_name: formData.customer_name,
        customer_photo_url: formData.customer_photo_url
      })

      toast.success('Merci pour votre mot doux !', {
        description: "Il sera publié après validation par André. Votre cagnotte de 0,20 € s'activera à ce moment-là !"
      })

      setFormData({
        order_number: '',
        rating: 5,
        message: '',
        customer_name: '',
        customer_photo_url: '',
        gdpr_consent: false
      })
      setShowForm(false)
      refetch()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Erreur lors de l\'envoi')
    } finally {
      setSubmitting(false)
    }
  }

  const renderPepites = (rating: number, interactive = false, onClick?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((pepite) => (
          <button
            key={pepite}
            type={interactive ? "button" : undefined}
            onClick={() => interactive && onClick && onClick(pepite)}
            disabled={!interactive}
            className={interactive ? "focus:outline-none cursor-pointer" : undefined}
          >
            <Gem
              className={`h-5 w-5 ${
                pepite <= rating ? 'fill-[#C6A15B] text-[#C6A15B]' : 'text-gray-300'
              } ${interactive ? 'hover:text-[#C6A15B]/50' : ''}`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={BookHeart}
          title="Le Livre d'Or de la KAVERN"
          description="Vos trouvailles, vos mots !"
        />

        {/* SECTION INTRODUCTION PERSONNALISÉE (Mise à jour) */}
        <div className="bg-white rounded-3xl p-8 md:p-12 mb-12 shadow-sm border border-gray-100">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Intro texte */}
            <div className="text-center space-y-5">
              <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
                La KAVERN, c'est bien plus qu'une simple boutique en ligne, c'est <strong className="text-[#C6A15B]">notre communauté</strong>.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Vous venez de recevoir votre fameux "Colis Ouvert" ? Vous avez allumé votre première bougie artisanale, accroché vos nouveaux rideaux cocooning ou dévoré une de nos terrines ? <strong className="text-gray-900 font-bold">C'est ici que l'on se raconte tout !</strong>
              </p>
              <p className="text-gray-600 leading-relaxed">
                Votre satisfaction est ma plus belle récompense, et vos retours aident les nouvelles venues à sauter le pas pour nous rejoindre en Live.
              </p>
            </div>

            {/* BOX RÉCOMPENSE 0.20€ */}
            <div className="bg-gradient-to-br from-amber-50 to-white p-6 md:p-8 rounded-3xl border-2 border-amber-100 shadow-sm relative overflow-hidden">
              <Sparkles className="absolute -top-4 -right-4 h-24 w-24 text-amber-500/10 rotate-12" />
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
                <div className="bg-white p-4 rounded-full shadow-md shrink-0 border border-amber-50">
                  <Coins className="h-8 w-8 text-amber-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl md:text-2xl font-black text-amber-900">Votre avis vaut de l'or : 0,20 € offerts !</h3>
                  <p className="text-amber-800 leading-relaxed">
                    Parce que votre temps est précieux et que vos petits mots m'aident à faire grandir le Concept Store, j'ai décidé de vous récompenser. 
                    Pour <strong className="font-bold text-amber-950">chaque avis laissé sur ce Livre d'Or</strong>, vous recevez <strong className="font-black text-amber-600 bg-amber-100/80 px-2 py-1 rounded-md">0,20 € cagnottés</strong> directement sur votre compte client !
                  </p>
                  <p className="text-sm text-amber-700 italic font-medium">
                    (Une petite somme qui se cumule vite et que vous pourrez déduire lors de l'expédition de votre prochaine malle aux trésors).
                  </p>
                </div>
              </div>
            </div>

            {/* OPTIONS DE PUBLICATION */}
            <div className="space-y-6 pt-4">
              <h3 className="text-2xl font-bold text-center text-gray-900">Avec ou sans photo ? C'est vous qui décidez !</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center md:items-start text-center md:text-left gap-4">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-blue-900 mb-2">Le petit mot rapide</h4>
                    <p className="text-blue-800/80 leading-relaxed">Laissez simplement un petit texte pour nous dire ce que vous avez pensé de votre commande, de l'emballage ou de l'ambiance de nos Lives.</p>
                  </div>
                </div>

                <div className="bg-pink-50/50 p-6 rounded-2xl border border-pink-200 flex flex-col items-center md:items-start text-center md:text-left gap-4 relative overflow-hidden shadow-sm">
                  <div className="absolute top-4 right-4 bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-sm">
                    Ce qu'on préfère !
                  </div>
                  <div className="bg-pink-100 p-3 rounded-full text-pink-600">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-pink-900 mb-2">La version Paparazzi</h4>
                    <p className="text-pink-800/80 leading-relaxed">Prenez une belle photo de votre colis à l'ouverture, ou de votre produit mis en situation chez vous (votre plaid sur le canapé, votre bougie sur la table basse...). C'est tellement inspirant pour les autres !</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="text-center space-y-8 pt-8 border-t border-gray-100">
              <div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">À vos claviers !</h3>
                <p className="text-gray-600 mt-2 text-lg">C'est à vous de jouer. Racontez-nous votre expérience KAVERN juste en dessous !</p>
              </div>

              <Button
                onClick={() => setShowForm(!showForm)}
                size="lg"
                className="bg-[#C6A15B] hover:bg-[#B59149] text-white px-8 md:px-12 h-16 rounded-full shadow-xl shadow-amber-500/20 text-lg font-bold hover:scale-105 transition-all duration-300"
              >
                <Coins className="mr-3 h-6 w-6" />
                Laisser un avis et cagnotter 0,20 €
              </Button>

              <div className="flex items-start gap-3 bg-gray-50 p-5 rounded-2xl text-left max-w-2xl mx-auto border border-gray-200">
                <Info className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  <strong className="text-gray-900">Note :</strong> Pour préserver la bienveillance de notre communauté, tous les petits mots sont lus et validés par André avant d'être publiés. Votre cagnotte de 0,20 € s'activera dès la publication de votre avis !
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION AMBASSADRICE */}
        {!ambassadorLoading && currentAmbassador && currentAmbassador.entry && (
          <Card className="mb-12 border-4 border-[#C6A15B] shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <Crown className="h-12 w-12 text-[#C6A15B] fill-[#C6A15B]" />
                <div>
                  <h2 className="text-2xl font-bold">Ambassadrice de la Semaine</h2>
                  <p className="text-gray-600">Cette semaine, on met à l&apos;honneur...</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {currentAmbassador.entry.customer_photo_url && (
                  <div className="relative h-96 rounded-xl overflow-hidden shadow-inner">
                    <Image
                      src={currentAmbassador.entry.customer_photo_url}
                      alt={currentAmbassador.entry.customer_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-2xl font-bold">{currentAmbassador.entry.customer_name}</h3>
                    <Crown className="h-6 w-6 text-[#C6A15B] fill-[#C6A15B]" />
                  </div>
                  {renderPepites(currentAmbassador.entry.rating)}
                  <p className="text-gray-700 mt-4 text-lg italic leading-relaxed">&quot;{currentAmbassador.entry.message}&quot;</p>
                  <div className="flex items-center gap-4 mt-6">
                    <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
                    <span className="font-bold text-xl">{currentAmbassador.hearts_count} cœurs</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FORMULAIRE DE SIGNATURE */}
        {showForm && (
          <Card className="mb-12 animate-in fade-in slide-in-from-top-4 border-2 border-[#C6A15B]/20">
            <CardContent className="p-8">
              {!user ? (
                 <div className="text-center py-8">
                   <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Coins className="h-8 w-8 text-[#C6A15B]" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">Connectez-vous pour récupérer vos 0,20 €</h3>
                   <p className="text-gray-600 mb-6">Nous avons besoin de savoir à qui envoyer la récompense !</p>
                   <Button asChild variant="outline" className="border-[#C6A15B] text-[#C6A15B] hover:bg-amber-50">
                     <Link href="/auth/login">Se connecter ou créer un compte</Link>
                   </Button>
                 </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-[#C6A15B]" />
                    Laissez votre mot doux
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="customer_name">Votre prénom</Label>
                        <Input
                          id="customer_name"
                          value={formData.customer_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="order_number">Numéro de commande (optionnel)</Label>
                        <Input
                          id="order_number"
                          value={formData.order_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, order_number: e.target.value }))}
                          placeholder="#12345"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Note en Pépites</Label>
                      <div className="mt-2">
                        {renderPepites(formData.rating, true, (rating) => setFormData(prev => ({ ...prev, rating })))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Votre message (max 500 caractères)</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value.slice(0, 500) }))}
                        placeholder="Racontez-nous votre ouverture de colis, ce que vous pensez de la qualité..."
                        rows={5}
                        required
                        className="resize-none"
                      />
                      <p className="text-sm text-gray-500 mt-1 text-right">{formData.message.length}/500 caractères</p>
                    </div>

                    <div>
                      <Label htmlFor="photo">Ajouter une photo (Recommandé !)</Label>
                      <div className="mt-2">
                        {formData.customer_photo_url ? (
                          <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-[#C6A15B] shadow-sm">
                            <Image src={formData.customer_photo_url} alt="Preview" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, customer_photo_url: '' }))}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 hover:border-[#C6A15B] transition-colors rounded-xl p-8 text-center bg-gray-50 group cursor-pointer relative">
                            <Input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={handlePhotoUpload}
                              disabled={uploading}
                            />
                            <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400 group-hover:text-[#C6A15B] transition-colors" />
                            <p className="text-[#C6A15B] font-semibold">
                              {uploading ? 'Upload en cours...' : 'Cliquez ici pour ajouter votre plus belle photo'}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">Format image uniquement (JPG, PNG)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                      <Checkbox
                        id="gdpr"
                        checked={formData.gdpr_consent}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdpr_consent: checked as boolean }))}
                        className="mt-1"
                      />
                      <Label htmlFor="gdpr" className="text-sm cursor-pointer leading-relaxed text-gray-700">
                        J&apos;accepte que mon message et ma photo soient publiés sur le Livre d&apos;Or de la boutique. J'ai compris que ma cagnotte de 0,20 € sera créditée après validation par André.
                      </Label>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full bg-[#C6A15B] hover:bg-[#B59149] h-14 text-lg font-bold shadow-lg" size="lg">
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          Envoyer et gagner 0,20 €
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* LISTE DES MESSAGES */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-black text-gray-900">Les Mots Doux de la KAVERN</h2>
            <Badge className="bg-[#C6A15B] text-white hover:bg-[#C6A15B]">{entries.length}</Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#C6A15B]" />
            </div>
          ) : entries.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-xl font-bold text-gray-900 mb-2">Le Livre d'Or est encore vierge !</p>
                <p className="text-gray-500">Soyez la première personne à partager votre expérience et cagnottez 0,20 €.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry) => (
                <GuestbookCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function GuestbookCard({ entry }: { entry: any }) {
  const { hasHearted, heartsCount, toggleHeart, loading } = useHearts(entry.id)
  const { user } = useAuth()

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-100 flex flex-col h-full rounded-2xl group">
      {entry.customer_photo_url && (
        <div className="relative h-64 w-full overflow-hidden bg-gray-50">
          <Image
            src={entry.customer_photo_url}
            alt={entry.customer_name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}
      <CardContent className="p-6 flex flex-col flex-1 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-900">{entry.customer_name}</h3>
            {entry.order_number && (
               <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] h-5 px-1.5">
                 <CheckCircle2 className="h-3 w-3 mr-1" />
                 Achat Vérifié
               </Badge>
            )}
            {entry.is_ambassador && (
              <Crown className="h-5 w-5 text-[#C6A15B] fill-[#C6A15B]" title="Ambassadrice" />
            )}
          </div>
        </div>

        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((pepite) => (
            <Gem
              key={pepite}
              className={`h-4 w-4 ${
                pepite <= entry.rating ? 'fill-[#C6A15B] text-[#C6A15B]' : 'text-gray-200'
              }`}
            />
          ))}
        </div>

        <p className="text-gray-700 text-sm mb-6 leading-relaxed flex-1 italic relative">
          <span className="text-4xl absolute -top-4 -left-2 text-gray-100 font-serif">"</span>
          <span className="relative z-10">{entry.message}</span>
          <span className="text-4xl absolute -bottom-4 -right-2 text-gray-100 font-serif">"</span>
        </p>

        {entry.admin_response && (
          <div className="bg-[#C6A15B]/5 rounded-xl p-4 mb-5 border-l-4 border-[#C6A15B]">
            <p className="text-[11px] font-black text-[#C6A15B] mb-1.5 uppercase tracking-widest">Réponse d'André</p>
            <p className="text-sm text-gray-700 leading-relaxed">{entry.admin_response}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            {new Date(entry.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
          {user && (
            <button
              onClick={toggleHeart}
              disabled={loading}
              className="flex items-center gap-1.5 hover:bg-pink-50 p-2 rounded-full transition-colors"
            >
              <Heart
                className={`h-5 w-5 transition-transform ${
                  hasHearted ? 'fill-pink-500 text-pink-500 scale-110' : 'text-gray-400 hover:text-pink-400'
                }`}
              />
              <span className={hasHearted ? "text-sm font-bold text-pink-600" : "text-sm font-medium text-gray-500"}>
                {heartsCount}
              </span>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}