/**
 * Distância em linha reta entre duas coordenadas, em quilómetros
 * (fórmula de Haversine — suficiente para ordenar por proximidade,
 * não precisa de rotas reais de estrada).
 */
export function calcularDistanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatarDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

interface ResultadoLocalizacao {
  latitude: number;
  longitude: number;
}

/**
 * Pede a localização atual do browser (pede permissão ao utilizador
 * na primeira vez). Rejeita com uma mensagem em português pronta a
 * mostrar, para não teres de traduzir os códigos de erro do browser.
 */
export function obterLocalizacaoAtual(): Promise<ResultadoLocalizacao> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Este dispositivo/browser não suporta localização."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error("Permissão de localização negada. Ativa-a nas definições do browser."));
        } else {
          reject(new Error("Não foi possível obter a tua localização. Tenta outra vez."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}