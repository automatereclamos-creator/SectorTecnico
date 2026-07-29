export const getCalculatedTotal = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) return null;
  const [hh1, mm1] = horaInicio.split(":").map(Number);
  const [hh2, mm2] = horaFin.split(":").map(Number);
  const mins = (hh2 * 60 + mm2) - (hh1 * 60 + mm1);
  
  if (mins <= 0) return { error: true, text: "Revisar horarios" };
  
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const text = h > 0 ? `${h}h ${m > 0 ? m + "min" : ""}`.trim() : `${m}min`;
  return { error: false, text };
};