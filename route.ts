//src/app/api/payments/momo/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { makeRequest } from 'mtn-momo-api'
import { createClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const { planId, orderId, amount, phoneNumber, paymentMethod } = await req.json()
    if (!amount || !phoneNumber) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const externalId = `PAY_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    const callbackHost = process.env.MOMO_CALLBACK_HOST
    const userApiKey = process.env.MOMO_USER_API_KEY
    const userId = process.env.MOMO_USER_ID
    const primaryKey = process.env.MOMO_PRIMARY_KEY

    if (!callbackHost || !userApiKey || !userId || !primaryKey) {
      return NextResponse.json({ error: 'Configuration MoMo manquante' }, { status: 500 })
    }

    const { response, status } = await makeRequest({
      callbackHost,
      userApiKey,
      userId,
      primaryKey,
      amount: amount.toString(),
      currency: 'XAF',          // ou 'XOF' selon votre pays
      externalId,
      partyIdType: 'MSISDN',
      partyId: phoneNumber,
      payerMessage: orderId ? `Commande ${orderId}` : `Plan ${planId || ''}`,
      payeeNote: 'Paiement via CongoEats'
    })

    const supabase = createClient()
    await supabase.from('transactions').insert({
      reference: externalId,
      plan_id: planId || null,
      order_id: orderId || null,
      amount,
      payment_method: paymentMethod,
      phone_number: phoneNumber,
      status: 'pending',
      transaction_id: response.referenceId,
    })

    return NextResponse.json({ success: true, referenceId: response.referenceId })
  } catch (error: any) {
    console.error('Momo error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


//src/app/api/payments/momo-webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { referenceId, status } = body   // Selon la réponse de l’API MoMo

    const supabase = createClient()
    const { data: tx, error } = await supabase
      .from('transactions')
      .select('plan_id, order_id, restaurant_id')
      .eq('transaction_id', referenceId)
      .single()

    if (error || !tx) {
      return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 })
    }

    if (status === 'SUCCESSFUL') {
      await supabase
        .from('transactions')
        .update({ status: 'completed', paid_at: new Date().toISOString() })
        .eq('transaction_id', referenceId)

      // Mise à jour d’une commande (menu public)
      if (tx.order_id) {
        await supabase
          .from('orders')
          .update({ payment_status: 'paid' })
          .eq('id', tx.order_id)
      }

      // Mise à jour d’un abonnement (admin)
      if (tx.plan_id && tx.restaurant_id) {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)
        await supabase
          .from('restaurants')
          .update({ plan_id: tx.plan_id, plan_expires_at: expiresAt.toISOString() })
          .eq('id', tx.restaurant_id)
      }
    } else if (status === 'FAILED') {
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('transaction_id', referenceId)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

//dans le fichier principal
Extrait de l’appel :

ts
const res = await fetch('/api/payments/momo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    planId: selectedPlan.id,
    amount: selectedPlan.price,
    phoneNumber,
    paymentMethod
  })
})

// Paiement mobile dans le menu public Client
if (paymentMethod === 'airtel' || paymentMethod === 'mtn') {
  const momoRes = await fetch('/api/payments/momo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: order.id,
      amount: total,
      phoneNumber: clientPhone,
      paymentMethod
    })
  })
  if (!momoRes.ok) throw new Error('Échec initiation paiement')
  toast.success('Demande de paiement envoyée. Validez sur votre téléphone.')
  router.push(`/r/${slug}/order/${order.id}`)
  return
}

