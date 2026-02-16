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
import { Gem, Heart, Loader2, Crown, Upload, CheckCircle2, BookHeart, Sparkles, Shirt, Box, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import PageHeader from '@/components/PageHeader'

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

      toast.success('Merci pour votre mot doux ! Il sera publié après validation (48-72h)', {
        description: 'Bonus fidélité ajouté à votre cagnotte !'
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
          title="Livre d'Or"
          description="Bienvenue dans la galerie de la famille Kavern !"
        />

        {/* SECTION INTRODUCTION PERSONNALISÉE */}
        <div className="bg-white rounded-3xl p-8 mb-12 shadow-sm border border-gray-100">
          <div className="prose prose-lg max-w-4xl mx-auto text-gray-700 space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Ici, ce n'est pas nous qui parlons, c'est VOUS.</h2>
              <p className="text-lg">
                Vous avez déniché une veste vintage incroyable ? Votre bougie &quot;Dimanche Matin&quot; trône fièrement sur votre table basse ? 
                Ou vous avez rempli vos placards grâce au rayon Garde-Manger ?
              </p>
              <p className="font-semibold text-[#C6A15B] text-xl">Montrez-nous tout !</p>
              <p>
                On adore voir nos pépites vivre leur deuxième vie chez vous. Vos photos sont nos plus belles récompenses et elles inspirent les autres visiteurs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
                <Sparkles className="h-6 w-6 text-amber-600 shrink-0" />
                <span className="text-sm font-medium"><strong>L&apos;Atelier en Action :</strong> Vos bougies allumées en situation cocooning.</span>
              </div>
              <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <Shirt className="h-6 w-6 text-blue-600 shrink-0" />
                <span className="text-sm font-medium"><strong>Le Look du Jour :</strong> Comment vous portez vos trouvailles Friperie.</span>
              </div>
              <div className="flex items-center gap-3 bg-purple-50 p-4 rounded-xl border border-purple-100">
                <Box className="h-6 w-6 text-purple-600 shrink-0" />
                <span className="text-sm font-medium"><strong>L&apos;Unboxing :</strong> La joie de l&apos;ouverture du colis (et la montagne de goodies !).</span>
              </div>
              <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl border border-green-100">
                <Wand2 className="h-6 w-6 text-green-600 shrink-0" />
                <span className="text-sm font-medium"><strong>Avant / Après :</strong> Pour les produits ménagers (ex: &quot;Merci la Pierre d&apos;Argent !&quot;).</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Button
              onClick={() => setShowForm(!showForm)}
              size="lg"
              className="bg-[#C6A15B] hover:bg-[#B59149] text-white px-10"
            >
              <Gem className="mr-2 h-5 w-5" />
              Signer le Livre d&apos;Or
            </Button>
          </div>
        </div>

        {/* SECTION AMBASSADRICE (Keep if active) */}
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
          <Card className="mb-12 animate-in fade-in slide-in-from-top-4">
            <CardContent className="p-8">
              {!user ? (
                 <div className="text-center py-4">
                   <p className="text-gray-600 mb-4">Connectez-vous pour signer le Livre d&apos;Or et participer à la galerie !</p>
                   <Button asChild variant="outline">
                     <Link href="/auth/login">Se connecter</Link>
                   </Button>
                 </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6">Laissez votre mot doux</h2>
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
                        <Label htmlFor="order_number">Numéro de commande</Label>
                        <Input
                          id="order_number"
                          value={formData.order_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, order_number: e.target.value }))}
                          placeholder="#12345"
                          required
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
                        placeholder="Partagez votre expérience..."
                        rows={5}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">{formData.message.length}/500 caractères</p>
                    </div>

                    <div>
                      <Label htmlFor="photo">Votre photo</Label>
                      <div className="mt-2">
                        {formData.customer_photo_url ? (
                          <div className="relative w-40 h-40 rounded-lg overflow-hidden border">
                            <Image src={formData.customer_photo_url} alt="Preview" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, customer_photo_url: '' }))}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <Label htmlFor="photo-upload" className="cursor-pointer text-[#C6A15B] hover:underline font-semibold">
                              {uploading ? 'Upload en cours...' : 'Cliquez pour ajouter une photo de vos pépites'}
                            </Label>
                            <Input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePhotoUpload}
                              disabled={uploading}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="gdpr"
                        checked={formData.gdpr_consent}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdpr_consent: checked as boolean }))}
                      />
                      <Label htmlFor="gdpr" className="text-sm cursor-pointer leading-snug text-gray-600">
                        J&apos;accepte que mon message et ma photo soient publiés sur le Livre d&apos;Or de la boutique.
                      </Label>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full bg-[#C6A15B] hover:bg-[#B59149]" size="lg">
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Gem className="mr-2 h-5 w-5" />
                          Publier mon mot doux
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
          <h2 className="text-3xl font-bold text-gray-900">Nos Mots Doux</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#C6A15B]" />
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Soyez la première à signer le Livre d&apos;Or !
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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-100 flex flex-col h-full">
      {entry.customer_photo_url && (
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={entry.customer_photo_url}
            alt={entry.customer_name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>
      )}
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{entry.customer_name}</h3>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] h-5">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Achat Vérifié
            </Badge>
            {entry.is_ambassador && (
              <Crown className="h-5 w-5 text-[#C6A15B] fill-[#C6A15B]" />
            )}
          </div>
        </div>

        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((pepite) => (
            <Gem
              key={pepite}
              className={`h-4 w-4 ${
                pepite <= entry.rating ? 'fill-[#C6A15B] text-[#C6A15B]' : 'text-gray-300'
              }`}
            />
          ))}
        </div>

        <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-4 flex-1 italic">&quot;{entry.message}&quot;</p>

        {entry.admin_response && (
          <div className="bg-[#C6A15B]/5 rounded-lg p-3 mb-4 border-l-4 border-[#C6A15B]">
            <p className="text-xs font-semibold text-[#C6A15B] mb-1">Réponse d&apos;André</p>
            <p className="text-sm text-gray-700">{entry.admin_response}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t mt-auto">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
            {new Date(entry.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
          {user && (
            <button
              onClick={toggleHeart}
              disabled={loading}
              className="flex items-center gap-2 hover:scale-110 transition-transform p-1"
            >
              <Heart
                className={`h-5 w-5 ${
                  hasHearted ? 'fill-pink-500 text-pink-500' : 'text-gray-300'
                }`}
              />
              <span className="text-sm font-bold text-gray-600">{heartsCount}</span>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}