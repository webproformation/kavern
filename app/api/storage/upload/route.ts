import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Utilisation des variables d'environnement du projet actuel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 🛡️ SÉCURITÉ ANTI-REVERT : On bloque si les variables pointent vers l'ancien projet
if (supabaseUrl?.includes('qcqbtmvbvipsxwjlgjvk')) {
  throw new Error('ERREUR CRITIQUE: Tentative d\'upload sur l\'ancien projet détectée.');
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[UPLOAD] Variables d\'environnement manquantes');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    let bucket = (formData.get('bucket') as string) || 'media';
    const folder = (formData.get('folder') as string) || '';

    // Normalisation vers 'media'
    if (bucket === 'medias') bucket = 'media';

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = folder 
      ? `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}` 
      : `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 1. UPLOAD VERS LE STORAGE
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[UPLOAD] Erreur Storage:', uploadError.message);
      // Si l'erreur est 'Bucket not found', c'est qu'il faut le créer dans Supabase
      return NextResponse.json({ 
        success: false, 
        error: `Erreur Storage: ${uploadError.message}. Vérifiez que le bucket "${bucket}" est bien créé en PUBLIC.` 
      }, { status: 500 });
    }

    // 2. RÉCUPÉRATION URL PUBLIQUE
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);

    // 3. ENREGISTREMENT DANS LA TABLE MEDIA (La table qu'on vient de réparer)
    const { error: dbError } = await supabase
      .from('media')
      .insert({
        id: fileName, // On utilise le path comme ID unique
        filename: file.name,
        url: publicUrl,
        bucket_name: bucket,
        file_size: file.size,
        type: file.type,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.warn('[UPLOAD] Metadata non enregistrées (mais fichier envoyé):', dbError.message);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: fileName,
      message: 'Fichier uploadé avec succès',
    });
  } catch (error: any) {
    console.error('[UPLOAD] Erreur critique:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}