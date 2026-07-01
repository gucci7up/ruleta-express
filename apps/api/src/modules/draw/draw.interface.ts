export interface DrawProvider {
  /**
   * Realiza el sorteo y retorna el número ganador (0-18).
   * Esta interfaz permite reemplazar el motor de sorteo sin tocar
   * ningún otro módulo: crypto, ruleta física, proveedor externo, etc.
   */
  draw(roundId: number): Promise<number>;
}

export const DRAW_PROVIDER = 'DRAW_PROVIDER';
