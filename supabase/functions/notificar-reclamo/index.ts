import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

// Credenciales y Claves desde las variables de entorno de Supabase
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Inicializamos el cliente de Supabase con bypass de RLS para consultar detalles de agencia
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  try {
    // 1. Parsear el payload enviado por el Webhook de Supabase
    const payload = await req.json()
    const reclamo = payload.record // Fila insertada en la tabla 'reclamos'

    // 2. Obtener los metadatos de la agencia usando la FK (agencia_id)
    let agencia = null
    if (reclamo.agencia_id) {
      try {
        const { data, error } = await supabase
          .from('agencias')
          .select('id_agencia, empresa, nombre')
          .eq('id', reclamo.agencia_id)
          .single()
        
        if (error) throw error
        agencia = data
      } catch (err) {
        console.error("Error consultando la tabla agencias en Supabase:", err)
      }
    }

    const empresaStr = (agencia?.empresa || 'Otros').toUpperCase()
    const agenciaIdStr = agencia?.id_agencia || 'S/N'
    const agenciaNombreStr = agencia?.nombre || 'Sucursal Desconocida'

    // 3. Configurar y disparar el envío a través de Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Soporte Tecnico <onboarding@resend.dev>', // Correo Sandbox por defecto
        to: ['automate.reclamos@gmail.com'], // Dirección de pruebas verificada de tu cuenta
        subject: `🚨 NUEVO RECLAMO: ${empresaStr} - Agencia #${agenciaIdStr}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background-color: #ef4444; color: white; padding: 15px 20px;">
              <h2 style="margin: 0; font-size: 1.3rem;">Alerta de Soporte Técnico</h2>
            </div>
            <div style="padding: 20px;">
              <p style="margin-top: 0; font-size: 0.95rem; color: #555;">Se ha registrado un nuevo incidente en el sistema que requiere atención:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9rem;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; font-weight: bold; width: 120px; color: #666;">Empresa:</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #111;">${empresaStr}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; font-weight: bold; color: #666;">Agencia:</td>
                  <td style="padding: 10px 0; color: #111;">#${agenciaIdStr} - ${agenciaNombreStr}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; font-weight: bold; color: #666;">Teléfono:</td>
                  <td style="padding: 10px 0; color: #111;">${reclamo.telefono || 'No registrado'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; font-weight: bold; color: #666;">Operador:</td>
                  <td style="padding: 10px 0; color: #111;">${reclamo.informa || 'No especificado'}</td>
                </tr>
              </table>

              <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #ef4444;">
                <h4 style="margin: 0 0 10px 0; color: #111827; font-size: 0.95rem;">Falla Reportada:</h4>
                <p style="margin: 0; line-height: 1.5; color: #374151; font-size: 0.9rem;">${reclamo.falla_reportada || 'Sin detalles adicionales'}</p>
              </div>
            </div>
          </div>
        `
      })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(JSON.stringify(data))
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})